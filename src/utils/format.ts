export const formatPrice = (price: any): string => {
  if (price === null || price === undefined || isNaN(Number(price))) return '暂无';
  const p = Number(price);
  if (p >= 10000) {
    return (p / 10000).toFixed(1) + '万';
  }
  return p.toLocaleString();
};

export const formatMileage = (mileage: any): string => {
  if (mileage === null || mileage === undefined || isNaN(Number(mileage))) return '暂无';
  const m = Number(mileage);
  if (m >= 10000) {
    return (m / 10000).toFixed(1) + '万公里';
  }
  return m + '万公里';
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '暂无';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '暂无';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const relativeTime = (dateStr: string): string => {
  if (!dateStr) return '暂无';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return Math.floor(diff / minute) + '分钟前';
  if (diff < day) return Math.floor(diff / hour) + '小时前';
  if (diff < 7 * day) return Math.floor(diff / day) + '天前';
  return formatDate(dateStr);
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const formatMoney = (amount: any): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '暂无';
  return '¥' + Number(amount).toLocaleString();
};

// 等级名称
export const getLevelName = (level: string): string => {
  const map: Record<string, string> = {
    normal: '普通会员',
    silver: '银卡会员',
    gold: '金卡会员',
    diamond: '钻石会员'
  };
  return map[level] || '普通会员';
};

// 车况标签
export const getConditionLabel = (condition: string): string => {
  const map: Record<string, string> = {
    excellent: '精品车况',
    good: '良好车况',
    normal: '一般车况'
  };
  return map[condition] || '一般车况';
};
