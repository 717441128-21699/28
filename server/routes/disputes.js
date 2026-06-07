const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../database');
const { auth } = require('../middleware/auth');
const { success, fail } = require('../utils/helper');

const router = express.Router();

async function sendMessage(userId, type, title, content, relatedId = null) {
  const db = getDB();
  await db.prepare('INSERT INTO messages (id, user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), userId, type, title, content, relatedId);
}

router.post('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const { orderId, reason, evidence } = req.body;
    if (!orderId || !reason) {
      return res.json(fail('请填写完整信息'));
    }
    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.json(fail('订单不存在'));
    }
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.json(fail('无权限发起纠纷'));
    }
    const respondent = order.buyer_id === req.user.id ? order.seller_id : order.buyer_id;
    const id = uuidv4();
    await db.prepare(`INSERT INTO disputes (id, order_id, initiator_id, respondent_id, reason, evidence, handler, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'reviewing')`).run(
      id, orderId, req.user.id, respondent, reason,
      evidence ? JSON.stringify(evidence) : null,
      '客服专员' + (100 + Math.floor(Math.random() * 900))
    );
    await sendMessage(respondent, 'dispute', '收到纠纷通知',
      `关于订单${orderId}的纠纷已被发起，请及时配合处理`, id);
    await sendMessage(req.user.id, 'dispute', '纠纷已提交',
      '您的纠纷工单已生成，客服将在24小时内联系您', id);
    res.json(success({ id }, '纠纷工单已生成'));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const { status = 'all' } = req.query;
    let sql = `SELECT d.*, o.total_price, o.deposit
      FROM disputes d
      LEFT JOIN orders o ON d.order_id = o.id
      WHERE d.initiator_id = ? OR d.respondent_id = ?`;
    const params = [req.user.id, req.user.id];
    if (status !== 'all') {
      if (status === 'reviewing') {
        sql += ' AND d.status IN (\'pending\', \'reviewing\', \'escalated\')';
      } else {
        sql += ' AND d.status = ?';
        params.push(status);
      }
    }
    sql += ' ORDER BY d.created_at DESC';
    const disputes = (await db.prepare(sql).all(...params)).map(d => ({
      ...d,
      evidence: d.evidence ? JSON.parse(d.evidence) : []
    }));
    res.json(success(disputes));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.post('/:id/evidence', auth, async (req, res) => {
  try {
    const db = getDB();
    const { evidence } = req.body;
    const dispute = await db.prepare('SELECT * FROM disputes WHERE id = ?').get(req.params.id);
    if (!dispute) {
      return res.json(fail('纠纷不存在'));
    }
    if (dispute.initiator_id !== req.user.id && dispute.respondent_id !== req.user.id) {
      return res.json(fail('无权限操作'));
    }
    const existing = dispute.evidence ? JSON.parse(dispute.evidence) : [];
    const merged = [...existing, ...(evidence || [])];
    await db.prepare('UPDATE disputes SET evidence = ? WHERE id = ?').run(JSON.stringify(merged), req.params.id);
    res.json(success(null, '证据已补充'));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

module.exports = router;
