import { User } from '@/types';

const defaultUser: User = {
  id: 'u001',
  phone: '138****8888',
  nickname: '车友小王',
  avatar: 'https://picsum.photos/id/64/200/200',
  creditScore: 720,
  vip: {
    level: 'gold',
    levelName: '金卡会员',
    currentExp: 2800,
    nextLevelExp: 5000,
    benefits: ['免费车况检测2次/月', '优先推荐车源', '佣金8折', '专属客服']
  },
  totalDeals: 23,
  totalSpent: 456800
};

export const useUserStore = () => {
  const getUser = (): User => {
    return defaultUser;
  };

  const isVip = (): boolean => {
    return defaultUser.vip.level !== 'normal';
  };

  const getLevelColor = (): string => {
    const colorMap: Record<string, string> = {
      normal: '#86909C',
      silver: '#A8B5C7',
      gold: '#D4A017',
      diamond: '#8B5CF6'
    };
    return colorMap[defaultUser.vip.level] || '#86909C';
  };

  return {
    getUser,
    isVip,
    getLevelColor
  };
};
