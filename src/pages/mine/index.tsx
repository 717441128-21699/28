import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { formatMoney } from '@/utils/format';

const MinePage: React.FC = () => {
  const { getUser } = useUserStore();
  const user = getUser();

  const menuGroups = [
    {
      title: '我的交易',
      items: [
        { icon: '📋', iconClass: styles.iconBlue, text: '我的订单', badge: '', path: '' },
        { icon: '📅', iconClass: styles.iconOrange, text: '预约记录', badge: '2', path: '/pages/appointment/index' },
        { icon: '💳', iconClass: styles.iconGreen, text: '我发布的', badge: '', path: '/pages/publish/index' }
      ]
    },
    {
      title: '金融服务',
      items: [
        { icon: '💰', iconClass: styles.iconBlue, text: '我的车贷', badge: '', path: '/pages/loan/index' },
        { icon: '🛡️', iconClass: styles.iconGreen, text: '我的保险', badge: '', path: '/pages/insurance/index' },
        { icon: '📝', iconClass: styles.iconOrange, text: '理赔记录', badge: '', path: '/pages/claim/index' }
      ]
    },
    {
      title: '其他服务',
      items: [
        { icon: '👑', iconClass: styles.iconOrange, text: '会员中心', badge: '', path: '/pages/vip/index' },
        { icon: '⚖️', iconClass: styles.iconRed, text: '纠纷处理', badge: '1', path: '/pages/dispute/index' },
        { icon: '📊', iconClass: styles.iconPurple, text: '管理员看板', badge: '', path: '/pages/admin/index' }
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    if (!path) return;
    console.log('[MinePage] Navigate to:', path);
    Taro.navigateTo({ url: path });
  };

  const handleVip = () => {
    Taro.navigateTo({ url: '/pages/vip/index' });
  };

  const handleAvatar = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userHeader}>
        <View className={styles.headerBg} />
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode='aspectFill'
            onClick={handleAvatar}
          />
          <View className={styles.userDetail}>
            <View className={styles.nickname}>
              {user.nickname}
              <View className={styles.vipBadge}>{user.vip.levelName}</View>
            </View>
            <Text className={styles.phone}>{user.phone}</Text>
            <View className={styles.creditRow}>
              <Text className={styles.creditLabel}>信用分</Text>
              <Text className={styles.creditScore}>{user.creditScore}</Text>
            </View>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.totalDeals}</Text>
            <Text className={styles.statLabel}>交易次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatMoney(user.totalSpent).replace('¥', '')}</Text>
            <Text className={styles.statLabel}>累计消费</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.vip.benefits.length}</Text>
            <Text className={styles.statLabel}>会员权益</Text>
          </View>
        </View>
      </View>

      <View className={styles.vipCard} onClick={handleVip}>
        <View className={styles.vipHeader}>
          <Text className={styles.vipTitle}>
            <Text>👑</Text> {user.vip.levelName} 专享权益
          </Text>
          <Text className={styles.vipArrow}>查看详情 ›</Text>
        </View>
        <View className={styles.progressWrap}>
          <View className={styles.progressInfo}>
            <Text className={styles.progressLabel}>升级进度</Text>
            <Text className={styles.progressValue}>
              {user.vip.currentExp} / {user.vip.nextLevelExp}
            </Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${(user.vip.currentExp / user.vip.nextLevelExp) * 100}%` }}
            />
          </View>
        </View>
        <Text className={styles.vipTips}>
          再消费{((user.vip.nextLevelExp - user.vip.currentExp) / 100).toFixed(0)}元即可升级至钻石会员
        </Text>
      </View>

      {menuGroups.map((group, gIndex) => (
        <View key={gIndex} className={styles.menuGroup}>
          {group.title && <Text className={styles.groupTitle}>{group.title}</Text>}
          {group.items.map((item, iIndex) => (
            <View
              key={iIndex}
              className={styles.menuItem}
              onClick={() => handleNavigate(item.path)}
            >
              <View className={`${styles.menuIcon} ${item.iconClass}`}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.badge && <View className={styles.menuBadge}>{item.badge}</View>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default MinePage;
