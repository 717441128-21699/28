const jwt = require('jsonwebtoken');
const { getDB } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'cheyipai-jwt-secret-key-2024';

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = await db.prepare('SELECT id, phone, nickname, avatar, credit_score, vip_level, vip_exp, total_deals, total_spent, is_admin FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}

function adminAuth(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ code: 403, message: '无管理员权限' });
  }
  next();
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { auth, adminAuth, generateToken, JWT_SECRET };
