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

router.post('/loans', auth, async (req, res) => {
  try {
    const db = getDB();
    const { carId, amount, downPayment, periods } = req.body;
    if (!amount || !downPayment || !periods) {
      return res.json(fail('请填写完整信息'));
    }
    const loanAmount = parseFloat(amount);
    const credit = req.user.credit_score || 650;
    const maxAmount = credit * 1000;
    if (loanAmount > maxAmount) {
      return res.json(fail(`信用额度不足，您的最高可贷额度为¥${maxAmount.toLocaleString()}`));
    }
    const interestRate = credit >= 750 ? 3.8 : credit >= 700 ? 4.2 : credit >= 650 ? 4.5 : 5.0;
    const monthlyPayment = Math.round(loanAmount * (1 + interestRate / 100 * periods / 12) / periods);
    const id = uuidv4();
    const approved = credit >= 600;
    await db.prepare(`INSERT INTO loans (id, user_id, car_id, amount, down_payment, periods, monthly_payment, interest_rate, status, next_repay_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, carId || null, loanAmount, parseFloat(downPayment),
      parseInt(periods), monthlyPayment, interestRate,
      approved ? 'approved' : 'pending',
      approved ? dayjs().add(1, 'month').format('YYYY-MM-DD') : null
    );
    if (approved) {
      await addExp(req.user.id, 300, '车贷审批通过');
      await sendMessage(req.user.id, 'system', '贷款审批通过',
        `您的¥${loanAmount.toLocaleString()}车贷已审批通过，月供¥${monthlyPayment.toLocaleString()}`, id);
    }
    res.json(success({
      id,
      amount: loanAmount,
      monthlyPayment,
      interestRate,
      status: approved ? 'approved' : 'pending'
    }, approved ? '贷款已审批通过' : '贷款已提交，等待人工审批'));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.get('/loans', auth, async (req, res) => {
  try {
    const db = getDB();
    const loans = await db.prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(success(loans));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.post('/insurances', auth, async (req, res) => {
  try {
    const db = getDB();
    const { plans, carId } = req.body;
    if (!plans || !plans.length) {
      return res.json(fail('请选择保险方案'));
    }
    const planData = {
      compulsory: { name: '交强险', premium: 950, coverage: 122000 },
      third_party: { name: '商业第三者责任险', premium: 2180, coverage: 1000000 },
      comprehensive: { name: '全车综合险', premium: 4580, coverage: 1500000 }
    };
    const ids = [];
    let totalPremium = 0;
    for (const planType of plans) {
      const plan = planData[planType];
      if (!plan) continue;
      const id = uuidv4();
      totalPremium += plan.premium;
      await db.prepare(`INSERT INTO insurances (id, user_id, car_id, type, type_name, premium, coverage, effective_date, expire_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, req.user.id, carId || null, planType, plan.name, plan.premium, plan.coverage,
        dayjs().format('YYYY-MM-DD'),
        dayjs().add(1, 'year').format('YYYY-MM-DD')
      );
      ids.push(id);
    }
    await addExp(req.user.id, 150, `购买车险：¥${totalPremium}`);
    await sendMessage(req.user.id, 'system', '车险投保成功',
      `您已成功购买${ids.length}份车险，合计¥${totalPremium}，保单即时生效`, ids.join(','));
    res.json(success({ ids, totalPremium }, '投保成功'));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.get('/insurances', auth, async (req, res) => {
  try {
    const db = getDB();
    const insurances = await db.prepare('SELECT * FROM insurances WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(success(insurances));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.post('/claims', auth, async (req, res) => {
  try {
    const db = getDB();
    const { insuranceId, amount, description, evidence } = req.body;
    if (!insuranceId || !amount || !description) {
      return res.json(fail('请填写完整信息'));
    }
    const insurance = await db.prepare('SELECT * FROM insurances WHERE id = ? AND user_id = ?').get(insuranceId, req.user.id);
    if (!insurance) {
      return res.json(fail('保单不存在'));
    }
    const id = uuidv4();
    const autoApproved = parseFloat(amount) <= 2000;
    await db.prepare(`INSERT INTO claims (id, insurance_id, user_id, amount, description, evidence, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      id, insuranceId, req.user.id, parseFloat(amount), description,
      evidence ? JSON.stringify(evidence) : null,
      autoApproved ? 'approved' : 'manual'
    );
    if (autoApproved) {
      await db.prepare('UPDATE claims SET status = \'paid\', reviewed_at = ?, review_note = ? WHERE id = ?')
        .run(dayjs().format('YYYY-MM-DD HH:mm:ss'), '系统自动审核通过，已完成赔付', id);
      await sendMessage(req.user.id, 'system', '理赔成功',
        `您的¥${parseFloat(amount).toLocaleString()}理赔已自动审核通过，赔款将在24小时内到账`, id);
    } else {
      await sendMessage(req.user.id, 'system', '理赔已提交',
        '您的理赔申请已提交，由于金额较大需人工复核，预计1-3个工作日内处理', id);
    }
    res.json(success({
      id,
      status: autoApproved ? 'paid' : 'manual'
    }, autoApproved ? '系统自动审核通过，已赔付' : '已提交人工复核'));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

router.get('/claims', auth, async (req, res) => {
  try {
    const db = getDB();
    const claims = (await db.prepare('SELECT * FROM claims WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)).map(c => ({
      ...c,
      evidence: c.evidence ? JSON.parse(c.evidence) : []
    }));
    res.json(success(claims));
  } catch (error) {
    console.error(error);
    res.json(fail('服务器错误'));
  }
});

module.exports = router;
