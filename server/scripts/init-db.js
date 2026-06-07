require('dotenv').config();
const { initDB, getDB } = require('../database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

(async function main() {
  console.log('🚀 开始初始化数据库...');
  await initDB();
  const db = getDB();
  console.log('✅ 数据库连接成功');

  const brands = [
    { id: 'b1', name: '大众', count: 512 },
    { id: 'b2', name: '丰田', count: 456 },
    { id: 'b3', name: '本田', count: 389 },
    { id: 'b4', name: '比亚迪', count: 345 },
    { id: 'b5', name: '宝马', count: 328 },
    { id: 'b6', name: '奥迪', count: 312 },
    { id: 'b7', name: '哈弗', count: 301 },
    { id: 'b8', name: '奔驰', count: 295 },
    { id: 'b9', name: '特斯拉', count: 267 },
    { id: 'b10', name: '别克', count: 234 },
    { id: 'b11', name: '日产', count: 198 },
    { id: 'b12', name: '雷克萨斯', count: 156 },
  ];

  for (const b of brands) {
    const exists = await db.prepare('SELECT id FROM brands WHERE id = ?').get(b.id);
    if (!exists) {
      await db.prepare('INSERT INTO brands (id, name, count) VALUES (?, ?, ?)').run(b.id, b.name, b.count);
    }
  }
  console.log('✅ 品牌数据初始化完成（12条）');

  const hashedPwd = bcrypt.hashSync('123456', 10);
  const adminPwd = bcrypt.hashSync('admin123', 10);

  const users = [
    { id: 'u_admin', phone: '13800138000', password: adminPwd, nickname: '平台管理员', avatar: 'https://picsum.photos/seed/admin/100/100', credit_score: 800, vip_level: 'diamond', vip_exp: 9800, total_deals: 0, total_spent: 0, is_admin: 1 },
    { id: 'u_seller', phone: '13800138002', password: hashedPwd, nickname: '诚信车行小王', avatar: 'https://picsum.photos/seed/seller/100/100', credit_score: 720, vip_level: 'gold', vip_exp: 3200, total_deals: 18, total_spent: 0, is_admin: 0 },
    { id: 'u_buyer', phone: '13800138001', password: hashedPwd, nickname: '想买车的小李', avatar: 'https://picsum.photos/seed/buyer/100/100', credit_score: 680, vip_level: 'silver', vip_exp: 850, total_deals: 3, total_spent: 456000, is_admin: 0 },
  ];

  for (const u of users) {
    const exists = await db.prepare('SELECT id FROM users WHERE id = ?').get(u.id);
    if (!exists) {
      await db.prepare(
        'INSERT INTO users (id, phone, password, nickname, avatar, credit_score, vip_level, vip_exp, total_deals, total_spent, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(u.id, u.phone, u.password, u.nickname, u.avatar, u.credit_score, u.vip_level, u.vip_exp, u.total_deals, u.total_spent, u.is_admin);
    }
  }
  console.log('✅ 用户数据初始化完成（3个测试账号）');

  const carList = [
    { title: '2022款 宝马3系 325Li M运动套装', brand: '宝马', model: '3系', year: 2022, price: 26.8, original_price: 34.5, mileage: 2.5, color: '白色', gearbox: '自动', displacement: '2.0T', fuel_type: '汽油', location: '北京', tags: ['准新车', '全程4S保养', '可议价'], condition: 'excellent' },
    { title: '2021款 奔驰C级 C260L 运动版', brand: '奔驰', model: 'C级', year: 2021, price: 28.5, original_price: 37.2, mileage: 3.8, color: '黑色', gearbox: '自动', displacement: '1.5T', fuel_type: '汽油', location: '上海', tags: ['低里程', '一手车'], condition: 'good' },
    { title: '2023款 奥迪A4L 40 TFSI 豪华动感型', brand: '奥迪', model: 'A4L', year: 2023, price: 28.9, original_price: 34.8, mileage: 1.2, color: '银色', gearbox: '自动', displacement: '2.0T', fuel_type: '汽油', location: '广州', tags: ['准新车', '原版原漆'], condition: 'excellent' },
    { title: '2020款 丰田凯美瑞 2.5G 豪华版', brand: '丰田', model: '凯美瑞', year: 2020, price: 15.8, original_price: 21.9, mileage: 5.6, color: '黑色', gearbox: '自动', displacement: '2.5L', fuel_type: '汽油', location: '深圳', tags: ['保值神车', '省油'], condition: 'good' },
    { title: '2021款 本田雅阁 260TURBO 豪华版', brand: '本田', model: '雅阁', year: 2021, price: 16.5, original_price: 19.9, mileage: 4.2, color: '白色', gearbox: '自动', displacement: '1.5T', fuel_type: '汽油', location: '杭州', tags: ['热门车型'], condition: 'good' },
    { title: '2020款 大众迈腾 330TSI 豪华版', brand: '大众', model: '迈腾', year: 2020, price: 15.2, original_price: 21.5, mileage: 6.1, color: '黑色', gearbox: '自动', displacement: '2.0T', fuel_type: '汽油', location: '成都', tags: ['商务首选'], condition: 'good' },
    { title: '2022款 特斯拉Model 3 后轮驱动版', brand: '特斯拉', model: 'Model 3', year: 2022, price: 21.8, original_price: 27.6, mileage: 1.8, color: '白色', gearbox: '单速变速箱', displacement: '纯电动', fuel_type: '纯电', location: '北京', tags: ['新能源', '快充'], condition: 'excellent' },
    { title: '2023款 比亚迪汉EV 创世版', brand: '比亚迪', model: '汉EV', year: 2023, price: 22.5, original_price: 28.8, mileage: 0.8, color: '红色', gearbox: '单速变速箱', displacement: '纯电动', fuel_type: '纯电', location: '上海', tags: ['准新车', '新能源', '长续航'], condition: 'excellent' },
    { title: '2019款 别克君越 28T 豪华型', brand: '别克', model: '君越', year: 2019, price: 12.8, original_price: 23.9, mileage: 7.2, color: '黑色', gearbox: '自动', displacement: '2.0T', fuel_type: '汽油', location: '武汉', tags: ['性价比高'], condition: 'good' },
    { title: '2021款 雷克萨斯ES 300h 卓越版', brand: '雷克萨斯', model: 'ES', year: 2021, price: 32.5, original_price: 37.9, mileage: 3.1, color: '白色', gearbox: '自动', displacement: '2.5L混动', fuel_type: '混动', location: '广州', tags: ['品质之选', '省油'], condition: 'excellent' },
  ];

  for (let i = 0; i < carList.length; i++) {
    const c = carList[i];
    const carId = uuidv4();
    const images = JSON.stringify([
      `https://picsum.photos/seed/${carId}1/600/400`,
      `https://picsum.photos/seed/${carId}2/600/400`,
      `https://picsum.photos/seed/${carId}3/600/400`,
      `https://picsum.photos/seed/${carId}4/600/400`,
    ]);
    const tags = JSON.stringify(c.tags);
    const sameModelCount = Math.floor(Math.random() * 80) + 20;
    const dealRate = Math.round(((65 + Math.random() * 25) * 10)) / 10;
    const overallScore = c.condition === 'excellent' ? Math.floor(90 + Math.random() * 7) : Math.floor(78 + Math.random() * 12);
    const estMin = +(c.price * 0.9).toFixed(2);
    const estMax = +(c.price * 1.1).toFixed(2);

    const exists = await db.prepare('SELECT id FROM cars WHERE title = ?').get(c.title);
    if (!exists) {
      await db.prepare(
        `INSERT INTO cars (id, title, brand, model, year, price, original_price, mileage, color, gearbox, displacement, fuel_type, location, images, seller_id, status, estimated_price_min, estimated_price_max, market_average, same_model_count, deal_rate, overall_score, \`condition\`, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        carId, c.title, c.brand, c.model, c.year, c.price, c.original_price, c.mileage,
        c.color, c.gearbox, c.displacement, c.fuel_type, c.location, images, 'u_seller',
        'available', estMin, estMax, c.price, sameModelCount, dealRate, overallScore, c.condition, tags
      );
    }
  }
  console.log('✅ 车辆数据初始化完成（10辆）');

  const messages = [
    { id: 'msg1', user_id: 'u_buyer', type: 'system', title: '欢迎加入车易拍', content: '恭喜您注册成功！现在可以浏览海量优质车源，享受AI智能估价服务。', related_id: null },
    { id: 'msg2', user_id: 'u_buyer', type: 'appointment', title: '预约看车提醒', content: '您预约的【宝马3系 325Li】看车时间为明天下午14:00，请准时到达北京市朝阳区xxx汽车城。', related_id: null },
    { id: 'msg3', user_id: 'u_seller', type: 'system', title: '车辆审核通过', content: '您发布的【2022款 宝马3系 325Li】已通过审核，正式上架展示。', related_id: null },
    { id: 'msg4', user_id: 'u_seller', type: 'order', title: '新的定金订单', content: '买家已支付定金5000元，请及时联系确认看车事宜。', related_id: null },
    { id: 'msg5', user_id: 'u_buyer', type: 'vip', title: '会员升级提醒', content: '距离升级为金卡会员还需完成2笔交易，加油哦！', related_id: null },
    { id: 'msg6', user_id: 'u_buyer', type: 'finance', title: '贷款审批通过', content: '您申请的15万元车贷已通过审批，可用于购车。', related_id: null },
    { id: 'msg7', user_id: 'u_seller', type: 'insurance', title: '车险即将到期', content: '您的车辆保险将于30天后到期，请及时续保。', related_id: null },
    { id: 'msg8', user_id: 'u_buyer', type: 'promotion', title: '限时优惠活动', content: '本月购车享佣金9折，前100名送免费检测服务！', related_id: null },
  ];

  for (const m of messages) {
    const exists = await db.prepare('SELECT id FROM messages WHERE id = ?').get(m.id);
    if (!exists) {
      await db.prepare(
        'INSERT INTO messages (id, user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(m.id, m.user_id, m.type, m.title, m.content, m.related_id);
    }
  }
  console.log('✅ 消息数据初始化完成（8条）');

  console.log('\n🎉 数据库初始化全部完成！');
  console.log('测试账号：');
  console.log('  管理员 - 手机: 13800138000  密码: admin123');
  console.log('  卖家   - 手机: 13800138002  密码: 123456');
  console.log('  买家   - 手机: 13800138001  密码: 123456');

  process.exit(0);
})().catch((err) => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
