const { getDB, initDB } = require('./database');
const { v4: uuidv4 } = require('uuid');

(async function main() {
  await initDB();
  const db = getDB();

  const brands = [
    { name: '宝马', count: 328 },
    { name: '奔驰', count: 295 },
    { name: '奥迪', count: 312 },
    { name: '丰田', count: 456 },
    { name: '本田', count: 389 },
    { name: '大众', count: 512 },
    { name: '特斯拉', count: 268 },
    { name: '比亚迪', count: 345 },
    { name: '别克', count: 234 },
    { name: '雷克萨斯', count: 189 },
    { name: '日产', count: 278 },
    { name: '哈弗', count: 301 }
  ];

  const users = [
    { id: 'u_admin', phone: '13800000000', nickname: '平台管理员', credit: 800, vip: 'diamond', exp: 25000, isAdmin: 1 },
    { id: 'u_seller', phone: '13800000001', nickname: '车友小王', credit: 720, vip: 'gold', exp: 6800, isAdmin: 0 },
    { id: 'u_buyer', phone: '13800000002', nickname: '张先生', credit: 680, vip: 'silver', exp: 1500, isAdmin: 0 }
  ];

  const sampleCars = [
    {
      title: '2022款 宝马3系 325Li M运动套装', brand: '宝马', model: '3系', year: 2022,
      price: 26.8, originalPrice: 34.5, mileage: 2.5, color: '白色', gearbox: '自动',
      displacement: '2.0T', fuelType: '汽油', location: '北京', condition: 'excellent',
      tags: ['准新车', '全程4S保养', '可议价'], overallScore: 92
    },
    {
      title: '2021款 奔驰C级 C260L 运动版', brand: '奔驰', model: 'C级', year: 2021,
      price: 28.5, originalPrice: 37.2, mileage: 3.8, color: '黑色', gearbox: '自动',
      displacement: '1.5T', fuelType: '汽油', location: '上海', condition: 'good',
      tags: ['低里程', '一手车'], overallScore: 88
    },
    {
      title: '2023款 奥迪A4L 40 TFSI 豪华动感型', brand: '奥迪', model: 'A4L', year: 2023,
      price: 28.9, originalPrice: 34.8, mileage: 1.2, color: '银色', gearbox: '自动',
      displacement: '2.0T', fuelType: '汽油', location: '广州', condition: 'excellent',
      tags: ['准新车', '原版原漆'], overallScore: 95
    },
    {
      title: '2020款 丰田凯美瑞 2.5G 豪华版', brand: '丰田', model: '凯美瑞', year: 2020,
      price: 15.8, originalPrice: 21.9, mileage: 5.6, color: '黑色', gearbox: '自动',
      displacement: '2.5L', fuelType: '汽油', location: '深圳', condition: 'good',
      tags: ['保值神车', '省油'], overallScore: 86
    },
    {
      title: '2021款 本田雅阁 260TURBO 豪华版', brand: '本田', model: '雅阁', year: 2021,
      price: 16.5, originalPrice: 19.9, mileage: 4.2, color: '白色', gearbox: '自动',
      displacement: '1.5T', fuelType: '汽油', location: '杭州', condition: 'good',
      tags: ['热门车型'], overallScore: 84
    },
    {
      title: '2020款 大众帕萨特 330TSI 豪华版', brand: '大众', model: '帕萨特', year: 2020,
      price: 15.2, originalPrice: 21.5, mileage: 6.1, color: '黑色', gearbox: '自动',
      displacement: '2.0T', fuelType: '汽油', location: '成都', condition: 'good',
      tags: ['商务首选'], overallScore: 82
    },
    {
      title: '2022款 特斯拉Model 3 后轮驱动版', brand: '特斯拉', model: 'Model 3', year: 2022,
      price: 21.8, originalPrice: 27.6, mileage: 1.8, color: '白色', gearbox: '单速变速箱',
      displacement: '纯电动', fuelType: '纯电', location: '北京', condition: 'excellent',
      tags: ['新能源', '快充'], overallScore: 90
    },
    {
      title: '2023款 比亚迪汉EV 创世版', brand: '比亚迪', model: '汉EV', year: 2023,
      price: 22.5, originalPrice: 28.8, mileage: 0.8, color: '红色', gearbox: '单速变速箱',
      displacement: '纯电动', fuelType: '纯电', location: '上海', condition: 'excellent',
      tags: ['准新车', '新能源', '长续航'], overallScore: 94
    },
    {
      title: '2019款 别克君越 28T 豪华型', brand: '别克', model: '君越', year: 2019,
      price: 12.8, originalPrice: 23.9, mileage: 7.2, color: '黑色', gearbox: '自动',
      displacement: '2.0T', fuelType: '汽油', location: '武汉', condition: 'good',
      tags: ['性价比高'], overallScore: 78
    },
    {
      title: '2021款 雷克萨斯ES 300h 卓越版', brand: '雷克萨斯', model: 'ES', year: 2021,
      price: 32.5, originalPrice: 37.9, mileage: 3.1, color: '白色', gearbox: '自动',
      displacement: '2.5L混动', fuelType: '混动', location: '广州', condition: 'excellent',
      tags: ['品质之选', '省油'], overallScore: 91
    }
  ];

  console.log('🌱 开始初始化种子数据...');

  for (const brand of brands) {
    const exists = db.prepare('SELECT id FROM brands WHERE name = ?').get(brand.name);
    if (!exists) {
      db.prepare('INSERT INTO brands (id, name, count) VALUES (?, ?, ?)').run(uuidv4(), brand.name, brand.count);
    }
  }
  console.log('  ✅ 品牌数据已初始化 (' + brands.length + '个品牌)');

  for (const user of users) {
    const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(user.phone);
    if (!exists) {
      const avatar = 'https://picsum.photos/seed/' + user.id + '/100/100';
      db.prepare('INSERT INTO users (id, phone, nickname, avatar, credit_score, vip_level, vip_exp, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(user.id, user.phone, user.nickname, avatar, user.credit, user.vip, user.exp, user.isAdmin);
    }
  }
  console.log('  ✅ 用户数据已初始化 (' + users.length + '个用户)');

  const seller = db.prepare('SELECT id FROM users WHERE phone = ?').get('13800000001');
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM cars').get().count;
  if (existingCount === 0) {
    for (const car of sampleCars) {
      const id = uuidv4();
      const images = JSON.stringify([
        'https://picsum.photos/seed/' + id + '1/600/400',
        'https://picsum.photos/seed/' + id + '2/600/400',
        'https://picsum.photos/seed/' + id + '3/600/400',
        'https://picsum.photos/seed/' + id + '4/600/400'
      ]);
      const ageFactor = Math.max(0.3, 1 - (2026 - car.year) * 0.08);
      const mileageFactor = Math.max(0.4, 1 - (car.mileage / 10) * 0.15);
      const base = car.price / ageFactor / mileageFactor;
      db.prepare('INSERT INTO cars (id, title, brand, model, year, price, original_price, mileage, color, gearbox, displacement, fuel_type, location, images, seller_id, status, condition, tags, estimated_price_min, estimated_price_max, market_average, same_model_count, deal_rate, overall_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'available\', ?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, car.title, car.brand, car.model, car.year, car.price, car.originalPrice, car.mileage,
        car.color, car.gearbox, car.displacement, car.fuelType, car.location, images, seller.id,
        car.condition, JSON.stringify(car.tags),
        Math.round(car.price * 0.9 * 100) / 100,
        Math.round(car.price * 1.1 * 100) / 100,
        Math.round(base * ageFactor * mileageFactor * 100) / 100,
        Math.floor(Math.random() * 80) + 20,
        Math.round(((65) + Math.random() * 25) * 10) / 10,
        car.overallScore
      );
    }
    console.log('  ✅ 车辆数据已初始化 (' + sampleCars.length + '辆车)');
  }

  const messages = [
    { user: '13800000001', type: 'system', title: '欢迎加入车易拍', content: '恭喜您注册成功，新手礼包已发送到您的账户' },
    { user: '13800000001', type: 'appointment', title: '看车预约提醒', content: '您有一个明天14:00的看车预约，请准时到达' },
    { user: '13800000001', type: 'transaction', title: '交易提醒', content: '您发布的"宝马3系"已被买家支付定金，请准备过户' },
    { user: '13800000002', type: 'system', title: '会员升级通知', content: '恭喜您升级为银卡会员，解锁免费检测权益' },
    { user: '13800000002', type: 'appointment', title: '预约确认', content: '卖家已确认您的看车预约' },
    { user: '13800000002', type: 'transaction', title: '车贷审批通过', content: '您的20万元车贷已审批通过' },
    { user: '13800000000', type: 'system', title: '管理员登录提醒', content: '管理员账户已登录，请注意安全' },
    { user: '13800000000', type: 'dispute', title: '待处理纠纷', content: '有1个新纠纷工单待处理，请及时跟进' }
  ];

  const msgCount = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
  if (msgCount === 0) {
    for (const msg of messages) {
      const u = db.prepare('SELECT id FROM users WHERE phone = ?').get(msg.user);
      if (u) {
        db.prepare('INSERT INTO messages (id, user_id, type, title, content) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), u.id, msg.type, msg.title, msg.content);
      }
    }
    console.log('  ✅ 消息数据已初始化 (' + messages.length + '条消息)');
  }

  console.log('\n🎉 种子数据初始化完成！');
  console.log('   测试账号:');
  console.log('   管理员: 13800000000 / 验证码任意');
  console.log('   卖家:   13800000001 / 验证码任意');
  console.log('   买家:   13800000002 / 验证码任意\n');
})();
