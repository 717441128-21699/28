const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getDB } = require('../database');
const { auth } = require('../middleware/auth');
const { success, fail } = require('../utils/helper');
const { addExp } = require('./users');

const router = express.Router();

async function sendMessage(userId, type, title, content, relatedId = null) {
  const db = getDB();
  await db.prepare('INSERT INTO messages (id, user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), userId, type, title, content, relatedId);
}

router.post('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const { carId, time, location } = req.body;
    if (!carId || !time || !location) {
      return res.json(fail('请填写完整信息'));
    }
    const car = await db.prepare('SELECT * FROM cars WHERE id = ?').get(carId);
    if (!car) {
      return res.json(fail('车辆不存在'));
    }
    if (car.seller_id === req.user.id) {
      return res.json(fail('不能预约自己发布的车辆'));
    }
    const id = uuidv4();
    await db.prepare('INSERT INTO appointments (id, car_id, buyer_id, seller_id, time, location) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, carId, req.user.id, car.seller_id, time, location);
    await sendMessage(car.seller_id, 'appointment', '新的看车预约',
      `您的"${car.title}"收到新的看车预约，请及时处理`, id);
    await sendMessage(req.user.id, 'appointment', '预约提交成功',
      `您已成功预约看车 "${car.title}"，等待卖家确认`, id);
    res.json(success({ id }, '预约成功'));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const { role = 'buyer' } = req.query;
    let sql = `SELECT a.*, c.title as car_title, c.images as car_images,
      u1.nickname as buyer_name, u2.nickname as seller_name
      FROM appointments a
      LEFT JOIN cars c ON a.car_id = c.id
      LEFT JOIN users u1 ON a.buyer_id = u1.id
      LEFT JOIN users u2 ON a.seller_id = u2.id
      WHERE ${role === 'seller' ? 'a.seller_id = ?' : 'a.buyer_id = ?'}
      ORDER BY a.created_at DESC`;
    const appointments = (await db.prepare(sql).all(req.user.id)).map(a => ({
      ...a,
      carImage: JSON.parse(a.car_images || '[]')[0] || ''
    }));
    res.json(success(appointments));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const db = getDB();
    const { accepted } = req.body;
    const appt = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appt) {
      return res.json(fail('预约不存在'));
    }
    if (appt.seller_id !== req.user.id) {
      return res.json(fail('无权限操作'));
    }
    const status = accepted ? 'confirmed' : 'cancelled';
    await db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    await sendMessage(appt.buyer_id, 'appointment',
      accepted ? '预约已确认' : '预约已拒绝',
      accepted ? '卖家已确认您的看车预约，请按时前往' : '卖家拒绝了您的看车预约',
      req.params.id);
    res.json(success(null, accepted ? '已确认预约' : '已拒绝预约'));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.post('/:id/intent', auth, async (req, res) => {
  try {
    const db = getDB();
    const appt = await db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    if (!appt) {
      return res.json(fail('预约不存在'));
    }
    if (appt.buyer_id !== req.user.id) {
      return res.json(fail('无权限操作'));
    }
    await db.prepare('UPDATE appointments SET buyer_intent = 1, status = \'completed\' WHERE id = ?').run(req.params.id);
    await sendMessage(appt.seller_id, 'transaction', '买家提交购买意向',
      '买家看车后已提交购买意向，请尽快协商交易细节', req.params.id);
    res.json(success(null, '购买意向已提交'));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.post('/order', auth, async (req, res) => {
  try {
    const db = getDB();
    const { carId } = req.body;
    if (!carId) {
      return res.json(fail('参数错误'));
    }
    const car = await db.prepare('SELECT * FROM cars WHERE id = ?').get(carId);
    if (!car) {
      return res.json(fail('车辆不存在'));
    }
    if (car.seller_id === req.user.id) {
      return res.json(fail('不能购买自己的车辆'));
    }
    const deposit = Math.min(10000, Math.round(car.price * 0.05 * 10000));
    const commission = Math.round(car.price * 0.02 * 10000);
    const totalPrice = Math.round(car.price * 10000);
    const id = uuidv4();
    await db.prepare(`INSERT INTO orders (id, car_id, buyer_id, seller_id, deposit, total_price, commission, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'deposit_paid')`).run(id, carId, req.user.id, car.seller_id, deposit, totalPrice, commission);
    await db.prepare('UPDATE cars SET status = \'reserved\' WHERE id = ?').run(carId);
    addExp(req.user.id, 200, `支付定金锁定车辆：${car.title}`);
    await sendMessage(req.user.id, 'transaction', '定金支付成功',
      `您已成功锁定"${car.title}"，请按预约时间前往过户`, id);
    await sendMessage(car.seller_id, 'transaction', '车辆已被锁定',
      `买家已支付"${car.title}"定金，请准备过户`, id);
    res.json(success({
      id,
      deposit,
      totalPrice,
      commission,
      finalPayment: totalPrice - deposit - commission
    }));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const db = getDB();
    const { role = 'buyer' } = req.query;
    let sql = `SELECT o.*, c.title as car_title, c.images as car_images
      FROM orders o
      LEFT JOIN cars c ON o.car_id = c.id
      WHERE ${role === 'seller' ? 'o.seller_id = ?' : 'o.buyer_id = ?'}
      ORDER BY o.created_at DESC`;
    const orders = (await db.prepare(sql).all(req.user.id)).map(o => ({
      ...o,
      carImage: JSON.parse(o.car_images || '[]')[0] || '',
      finalPayment: o.total_price - o.deposit - o.commission
    }));
    res.json(success(orders));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.get('/orders/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    const order = await db.prepare(`SELECT o.*, c.title as car_title, c.images as car_images, c.location as car_location,
      u1.nickname as buyer_name, u2.nickname as seller_name
      FROM orders o
      LEFT JOIN cars c ON o.car_id = c.id
      LEFT JOIN users u1 ON o.buyer_id = u1.id
      LEFT JOIN users u2 ON o.seller_id = u2.id
      WHERE o.id = ?`).get(req.params.id);
    if (!order) {
      return res.json(fail('订单不存在'));
    }
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.json(fail('无权限查看'));
    }
    res.json(success({
      ...order,
      carImage: JSON.parse(order.car_images || '[]')[0] || '',
      finalPayment: order.total_price - order.deposit - order.commission
    }));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.post('/orders/:id/sign', auth, async (req, res) => {
  try {
    const db = getDB();
    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.json(fail('订单不存在'));
    }
    if (order.buyer_id !== req.user.id) {
      return res.json(fail('无权限操作'));
    }
    await db.prepare('UPDATE orders SET contract_signed = 1, status = \'appointment\' WHERE id = ?').run(req.params.id);
    res.json(success(null, '电子合同已签署'));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

router.post('/transfer/confirm', auth, async (req, res) => {
  try {
    const db = getDB();
    const { orderId, code } = req.body;
    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.json(fail('订单不存在'));
    }
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.json(fail('无权限操作'));
    }
    await db.prepare('UPDATE orders SET transfer_confirmed = transfer_confirmed + 1, updated_at = ? WHERE id = ?').run(dayjs().format('YYYY-MM-DD HH:mm:ss'), orderId);
    const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (updated.transfer_confirmed >= 2) {
      await db.prepare('UPDATE orders SET status = \'completed\', updated_at = ? WHERE id = ?').run(dayjs().format('YYYY-MM-DD HH:mm:ss'), orderId);
      await db.prepare('UPDATE cars SET status = \'sold\' WHERE id = ?').run(order.car_id);
      await db.prepare('UPDATE users SET total_deals = total_deals + 1 WHERE id IN (?, ?)').run(order.buyer_id, order.seller_id);
      await db.prepare('UPDATE users SET total_spent = total_spent + ? WHERE id = ?').run(order.total_price, order.buyer_id);
      addExp(order.buyer_id, 500, `成功购车`);
      addExp(order.seller_id, 500, `成功售车`);
      await sendMessage(order.buyer_id, 'transaction', '交易完成', '恭喜您完成购车交易！', orderId);
      await sendMessage(order.seller_id, 'transaction', '交易完成', '恭喜您完成售车交易！尾款将在24小时内到账', orderId);
    }
    res.json(success({ confirmed: updated.transfer_confirmed }, updated.transfer_confirmed >= 2 ? '双方已确认，交易完成' : '确认成功，等待对方确认'));
  } catch (err) {
    console.error(err);
    res.json(fail('服务器错误'));
  }
});

module.exports = router;
