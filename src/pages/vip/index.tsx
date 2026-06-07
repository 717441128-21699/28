import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import classnames from 'classnames';

const levels = [
  {
    id: 'normal',
    name: '普通',
    icon: '👤',
    exp: 0,
    desc: '注册即享'
  },
  {
    id: 'silver',
    name: '银卡',
    icon: '🥈',
    exp: 1000,
    desc: '经验值≥1000'
  },
  {
    id: 'gold',
    name: '金卡',
    icon: '🥇',
    exp: 5000,
    desc: '经验值≥5000'
  },
  {
    id: 'diamond',
    name: '钻石',
    icon: '💎',
    exp: 20000,
    desc: '经验值≥20000'
  }
];

const benefits = [
  {
    id: 'b1',
    icon: '🔍',
    name: '免费车辆检测',
    desc: '享受免费全车268项专业检测服务',
    level: 'silver'
  },
  {
    id: 'b2',
    icon: '⭐',
    name: '优先推荐车源',
    desc: '您发布的车源获得优先展示权',
    level: 'silver'
  },
  {
    id: 'b3',
    icon: '💰',
    name: '佣金折扣 10%',
    desc: '交易佣金享9折优惠',
    level: 'gold'
  },
  {
    id: 'b4',
    icon: '🎁',
    name: '专属客服通道',
    desc: '7x24小时专属客服一对一服务',
    level: 'gold'
  },
  {
    id: 'b5',
    icon: '🏆',
    name: '佣金折扣 20%',
    desc: '交易佣金享8折超值优惠',
    level: 'diamond'
  },
  {
    id: 'b6',
    icon: '🚀',
    name: '极速放款通道',
    desc: '金融贷款优先审批，极速放款',
    level: 'diamond'
  }
];

const expHistory = [
  { id: 1, title: '成功交易 - 2023款宝马3系', time: '2026-06-05 14:30', exp: 500 },
  { id: 2, title: '每日签到连续7天', time: '2026-06-04 09:00', exp: 70 },
  { id: 3, title: '发布车辆审核通过', time: '2026-06-02 16:20', exp: 100 },
  { id: 4, title: '完成买家身份认证', time: '2026-05-28 11:15', exp: 200 }
];

const VipPage: React.FC = () => {
  const { getUser } = useUserStore();
  const user = getUser();
  const { vip } = user;

  const levelOrder = ['normal', 'silver', 'gold', 'diamond'];
  const currentLevelIndex = levelOrder.indexOf(vip.level);
  const progress = vip.nextLevelExp > 0
    ? Math.min(100, Math.round(vip.currentExp / vip.nextLevelExp * 100))
    : 100;

  const isBenefitUnlocked = (level: string) => {
    return currentLevelIndex >= levelOrder.indexOf(level);
  };

  return (
    <View className={styles.page}>
      <View className={styles.vipHeader}>
        <View className={styles.levelBadge}>
          <Text className={styles.levelIcon}>
            {vip.level === 'diamond' ? '💎' : vip.level === 'gold' ? '🥇' : vip.level === 'silver' ? '🥈' : '👤'}
          </Text>
          <Text className={styles.levelName}>{vip.levelName}会员</Text>
        </View>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={user.avatar} mode='aspectFill' />
          <View className={styles.userText}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <Text className={styles.userDesc}>
              累计交易 {user.totalDeals} 次 · 信用分 {user.creditScore}
            </Text>
          </View>
        </View>
        <View className={styles.progressCard}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>升级进度</Text>
            <Text className={styles.progressText}>
              {vip.currentExp} / {vip.nextLevelExp} 经验值
            </Text>
          </View>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.progressHint}>
            {vip.level === 'diamond'
              ? '恭喜您已达最高等级，尊享所有特权！'
              : `再获得 ${vip.nextLevelExp - vip.currentExp} 经验值即可升级`}
          </Text>
        </View>
      </View>

      <View className={styles.levelsSection}>
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>📊 会员等级</Text>
          <View className={styles.levelsRow}>
            {levels.map((lvl, idx) => (
              <View
                key={lvl.id}
                className={classnames(
                  styles.levelCard,
                  vip.level === lvl.id && styles.current,
                  idx > currentLevelIndex && styles.locked
                )}
              >
                {vip.level === lvl.id && <View className={styles.currentTag}>当前</View>}
                <View className={styles.levelCardIcon}>{lvl.icon}</View>
                <Text className={styles.levelCardName}>{lvl.name}</Text>
                <Text className={styles.levelCardExp}>{lvl.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.benefitsSection}>
        <Text className={styles.sectionTitle}>🎁 会员权益</Text>
        <View className={styles.benefitsGrid}>
          {benefits.map(b => {
            const unlocked = isBenefitUnlocked(b.level);
            return (
              <View
                key={b.id}
                className={classnames(
                  styles.benefitCard,
                  unlocked && styles.active,
                  !unlocked && styles.locked
                )}
              >
                <View className={styles.benefitIcon}>{b.icon}</View>
                <Text className={styles.benefitName}>{b.name}</Text>
                <Text className={styles.benefitDesc}>{b.desc}</Text>
                <View className={classnames(styles.benefitLevel, unlocked && styles.unlocked)}>
                  {unlocked ? '已解锁' : `${levels.find(l => l.id === b.level)?.name}解锁`}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.sectionTitle}>📈 经验值记录</Text>
        <View className={styles.historyList}>
          {expHistory.map(item => (
            <View key={item.id} className={styles.historyItem}>
              <View className={styles.historyInfo}>
                <Text className={styles.historyTitle}>{item.title}</Text>
                <Text className={styles.historyTime}>{item.time}</Text>
              </View>
              <Text className={classnames(styles.historyExp, item.exp < 0 && styles.negative)}>
                {item.exp > 0 ? '+' : ''}{item.exp}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default VipPage;
