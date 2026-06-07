function success(data = null, message = 'success') {
  return { code: 0, message, data };
}

function fail(message = 'error', code = 1, data = null) {
  return { code, message, data };
}

function getVipInfo(exp, level) {
  const levels = [
    { level: 'normal', name: '普通', minExp: 0, nextExp: 1000 },
    { level: 'silver', name: '银卡', minExp: 1000, nextExp: 5000 },
    { level: 'gold', name: '金卡', minExp: 5000, nextExp: 20000 },
    { level: 'diamond', name: '钻石', minExp: 20000, nextExp: 99999999 }
  ];
  const current = levels.find(l => l.level === level) || levels[0];
  return {
    level: current.level,
    levelName: current.name,
    currentExp: exp,
    nextLevelExp: current.nextExp
  };
}

function calculateVipLevel(exp) {
  if (exp >= 20000) return 'diamond';
  if (exp >= 5000) return 'gold';
  if (exp >= 1000) return 'silver';
  return 'normal';
}

function smartValuation(brand, model, year, mileage) {
  const basePrices = {
    '宝马': { '3系': 35, '5系': 55, 'X3': 48, 'X5': 85 },
    '奔驰': { 'C级': 38, 'E级': 58, 'GLC': 52, 'GLE': 90 },
    '奥迪': { 'A4L': 32, 'A6L': 50, 'Q5L': 45, 'Q7': 78 },
    '丰田': { '凯美瑞': 22, '汉兰达': 35, '卡罗拉': 14, 'RAV4': 20 },
    '本田': { '雅阁': 20, 'CR-V': 22, '思域': 16, '飞度': 10 },
    '大众': { '帕萨特': 22, '途观L': 25, '朗逸': 13, '迈腾': 24 },
    '特斯拉': { 'Model 3': 28, 'Model Y': 32, 'Model S': 80 },
    '比亚迪': { '汉EV': 26, '宋PLUS': 18, '唐DM': 28, '海豚': 12 },
    '别克': { '君越': 22, '昂科威': 20, 'GL8': 35 },
    '雷克萨斯': { 'ES': 42, 'RX': 58, 'NX': 38 }
  };

  const brandPrices = basePrices[brand] || {};
  let basePrice = brandPrices[model] || 20;
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(year);
  const ageFactor = Math.max(0.3, 1 - age * 0.08);
  const mileageFactor = Math.max(0.4, 1 - (mileage / 100000) * 0.15);
  const market = basePrice * ageFactor * mileageFactor;
  const sameModelCount = Math.floor(Math.random() * 80) + 20;
  const dealRate = Math.round((65 + Math.random() * 25) * 10) / 10;

  return {
    estimatedMin: Math.round((market * 0.9) * 100) / 100,
    estimatedMax: Math.round((market * 1.1) * 100) / 100,
    marketAverage: Math.round(market * 100) / 100,
    sameModelCount,
    dealRate
  };
}

module.exports = { success, fail, getVipInfo, calculateVipLevel, smartValuation };
