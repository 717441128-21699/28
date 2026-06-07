const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getDB } = require('../database');
const { auth, generateToken } = require('../middleware/auth');
const { success, fail, getVipInfo, calculateVipLevel } = require('../utils/helper');

const router = express.Router();

async function addExp(userId, exp, reason) {
  const db = getDB();
  const user = await db.prepare('SELECT vip_exp, vip_level FROM users WHERE id = ?').get(userId);
  const newExp = user.vip_exp + exp;
  const newLevel = calculateVipLevel(newExp);
  await db.prepare('UPDATE users SET vip_exp = ?, vip_level = ?, updated_at = ? WHERE id = ?').run(newExp, newLevel, dayjs().format('YYYY-MM-DD HH:mm:ss'), userId);
  await db.prepare('INSERT INTO exp_records (id, user_id, exp, reason) VALUES (?, ?, ?, ?)').run(uuidv4(), userId, exp, reason);
  if (newLevel !== user.vip_level) {
    await db.prepare('INSERT INTO messages (id, user_id, type, title, content) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), userId, 'system', '会员升级通知',
      `恭喜您升级为${newLevel === 'diamond' ? '钻石' : newLevel === 'gold' ? '金卡' : newLevel === 'silver' ? '银卡' : '普通'}会员，解锁更多权益！`
    );
  }
}

router.post('/register', async (req, res) => {
  try {
    const db = getDB();
    const { phone, code, nickname, password } = req.body;
    if (!phone || !code || !nickname) {
      return res.json(fail('请填写完整信息'));
    }
    if (!/^1\d{10}$/.test(phone)) {
      return res.json(fail('手机号格式错误'));
    }
    const exists = await db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (exists) {
      return res.json(fail('手机号已注册'));
    }
    const hashedPwd = password ? bcrypt.hashSync(password, 10) : null;
    const id = uuidv4();
    const avatar = `https://picsum.photos/seed/${id}/100/100`;
    await db.prepare('INSERT INTO users (id, phone, password, nickname, avatar, credit_score) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, phone, hashedPwd, nickname, avatar, 650 + Math.floor(Math.random() * 100));
    const token = generateToken(id);
    await addExp(id, 100, '新用户注册奖励');
    res.json(success({ token, userId: id }, '注册成功'));
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.post('/login', async (req, res) => {
  try {
    const db = getDB();
    const { phone, code, password } = req.body;
    if (!phone || !code) {
      return res.json(fail('请输入手机号和验证码'));
    }
    let user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      const id = uuidv4();
      const avatar = `https://picsum.photos/seed/${id}/100/100`;
      await db.prepare('INSERT INTO users (id, phone, nickname, avatar, credit_score) VALUES (?, ?, ?, ?, ?)')
        .run(id, phone, `车友${phone.slice(-4)}`, avatar, 650 + Math.floor(Math.random() * 100));
      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      await addExp(id, 100, '新用户注册奖励');
    }
    const token = generateToken(user.id);
    res.json(success({ token, userId: user.id }, '登录成功'));
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const vip = getVipInfo(user.vip_exp, user.vip_level);
    const expRecords = await db.prepare('SELECT * FROM exp_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(user.id);
    res.json(success({
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      creditScore: user.credit_score,
      vip,
      totalDeals: user.total_deals,
      totalSpent: user.total_spent,
      expRecords
    }));
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const db = getDB();
    const { nickname, avatar } = req.body;
    await db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), updated_at = ? WHERE id = ?')
      .run(nickname || null, avatar || null, dayjs().format('YYYY-MM-DD HH:mm:ss'), req.user.id);
    res.json(success(null, '更新成功'));
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.get('/messages', auth, async (req, res) => {
  try {
    const db = getDB();
    const { type = 'all' } = req.query;
    let sql = 'SELECT * FROM messages WHERE user_id = ?';
    const params = [req.user.id];
    if (type !== 'all') {
      sql += ' AND type = ?';
      params.push(type);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const messages = await db.prepare(sql).all(...params);
    const unreadCount = (await db.prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND is_read = 0').get(req.user.id)).count;
    res.json(success({ messages, unreadCount }));
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.post('/messages/:id/read', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json(success());
  } catch (err) {
    res.json(fail(err.message));
  }
});

router.post('/messages/read-all', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.prepare('UPDATE messages SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json(success());
  } catch (err) {
    res.json(fail(err.message));
  }
});

module.exports = router;
module.exports.addExp = addExp;
