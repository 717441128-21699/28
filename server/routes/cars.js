const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../database');
const { auth } = require('../middleware/auth');
const { success, fail, smartValuation } = require('../utils/helper');
const { addExp } = require('./users');

const router = express.Router();

const DEFAULT_IMAGES = [
  'https://picsum.photos/id/1071/600/400',
  'https://picsum.photos/id/1072/600/400',
  'https://picsum.photos/id/133/600/400',
  'https://picsum.photos/id/164/600/400'
];

router.post('/valuation', (req, res) => {
  const { brand, model, year, mileage } = req.body;
  if (!brand || !model || !year || !mileage) {
    return res.json(fail('请填写完整信息'));
  }
  const val = smartValuation(brand, model, year, mileage);
  res.json(success(val));
});

router.post('/', auth, (req, res) => {
  const db = getDB();
  const {
    title, brand, model, year, price, originalPrice, mileage,
    color, gearbox, displacement, fuelType, location, images, tags
  } = req.body;
  if (!title || !brand || !model || !year || !price || !mileage) {
    return res.json(fail('请填写必填信息'));
  }
  const valuation = smartValuation(brand, model, year, mileage);
  const id = uuidv4();
  const carImages = images && images.length > 0
    ? JSON.stringify(images)
    : JSON.stringify(DEFAULT_IMAGES);
  db.prepare(`INSERT INTO cars (
    id, title, brand, model, year, price, original_price, mileage, color, gearbox,
    displacement, fuel_type, location, images, seller_id, estimated_price_min,
    estimated_price_max, market_average, same_model_count, deal_rate, tags
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, title, brand, model, parseInt(year), parseFloat(price),
    originalPrice ? parseFloat(originalPrice) : null,
    parseFloat(mileage), color || '', gearbox || '', displacement || '',
    fuelType || '', location || '', carImages, req.user.id,
    valuation.estimatedMin, valuation.estimatedMax, valuation.marketAverage,
    valuation.sameModelCount, valuation.dealRate,
    tags ? JSON.stringify(tags) : null
  );
  const brandRow = db.prepare('SELECT id FROM brands WHERE name = ?').get(brand);
  if (brandRow) {
    db.prepare('UPDATE brands SET count = count + 1 WHERE name = ?').run(brand);
  }
  addExp(req.user.id, 100, `发布车辆：${title}`);
  res.json(success({ id }, '发布成功'));
});

router.get('/', (req, res) => {
  const db = getDB();
  const { brand, minPrice, maxPrice, page = 1, pageSize = 10, keyword } = req.query;
  let sql = 'SELECT * FROM cars WHERE status = \'available\'';
  const params = [];
  if (brand && brand !== '全部') {
    sql += ' AND brand = ?';
    params.push(brand);
  }
  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (keyword) {
    sql += ' AND (title LIKE ? OR brand LIKE ? OR model LIKE ?)';
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
  const total = db.prepare(countSql).get(...params).count;
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
  const cars = db.prepare(sql).all(...params).map(car => ({
    ...car,
    images: JSON.parse(car.images || '[]'),
    tags: car.tags ? JSON.parse(car.tags) : []
  }));
  res.json(success({ list: cars, total, page: parseInt(page), pageSize: parseInt(pageSize) }));
});

router.get('/recommend', (req, res) => {
  const db = getDB();
  const cars = db.prepare('SELECT * FROM cars WHERE status = \'available\' ORDER BY RANDOM() LIMIT 8').all().map(car => ({
    ...car,
    images: JSON.parse(car.images || '[]'),
    tags: car.tags ? JSON.parse(car.tags) : []
  }));
  res.json(success(cars));
});

router.get('/brands', (req, res) => {
  const db = getDB();
  const brands = db.prepare('SELECT * FROM brands ORDER BY count DESC LIMIT 12').all();
  res.json(success(brands));
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const car = db.prepare('SELECT c.*, u.nickname as seller_name, u.avatar as seller_avatar, u.credit_score as seller_credit, u.total_deals as seller_deals FROM cars c LEFT JOIN users u ON c.seller_id = u.id WHERE c.id = ?').get(req.params.id);
  if (!car) {
    return res.json(fail('车辆不存在'));
  }
  const images = JSON.parse(car.images || '[]');
  const tags = car.tags ? JSON.parse(car.tags) : [];
  const report = {
    overallScore: car.overall_score,
    items: [
      { name: '外观', status: 'normal', description: '无明显划痕和凹陷' },
      { name: '内饰', status: 'normal', description: '整洁无异味' },
      { name: '发动机', status: 'normal', description: '运转平稳，无异响' },
      { name: '变速箱', status: 'normal', description: '换挡顺畅' },
      { name: '底盘', status: car.condition === 'excellent' ? 'normal' : 'warning', description: '无明显损伤' },
      { name: '电器系统', status: 'normal', description: '功能完好' }
    ],
    inspector: '车易拍专业检测师',
    inspectTime: car.created_at
  };
  res.json(success({
    ...car,
    images,
    tags,
    seller: {
      id: car.seller_id,
      name: car.seller_name,
      avatar: car.seller_avatar,
      rating: 4.8,
      dealCount: car.seller_deals || 0
    },
    inspectionReport: report,
    estimatedPriceMin: car.estimated_price_min,
    estimatedPriceMax: car.estimated_price_max,
    marketAverage: car.market_average,
    sameModelCount: car.same_model_count,
    dealRate: car.deal_rate
  }));
});

router.get('/user/mine', auth, (req, res) => {
  const db = getDB();
  const cars = db.prepare('SELECT * FROM cars WHERE seller_id = ? ORDER BY created_at DESC').all(req.user.id).map(car => ({
    ...car,
    images: JSON.parse(car.images || '[]'),
    tags: car.tags ? JSON.parse(car.tags) : []
  }));
  res.json(success(cars));
});

module.exports = router;
