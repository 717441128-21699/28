import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { carApi } from '@/utils/api';
import { Car, User, VipInfo } from '@/types';
import { formatMoney } from '@/utils/format';

const defaultVip: VipInfo = {
  level: 'normal',
  levelName: '普通',
  currentExp: 0,
  nextLevelExp: 1000,
  benefits: []
};

const defaultUser: User = {
  id: '',
  phone: '',
  nickname: '点击登录',
  avatar: '',
  creditScore: 700,
  vip: defaultVip,
  totalDeals: 0,
  totalSpent: 0
};

const MinePage: React.FC = () => {
  const { isLoggedIn, user: storeUser, logout, fetchProfile } = useUserStore();
  const [user, setUser] = useState<User>(defaultUser);
  const [myCars, setMyCars] = useState<Car[]>([]);

  const menuGroups = [
    {
      title: '我的交易',
      items: [
        { icon: '📋', iconClass: styles.iconBlue, text: '我的订单', badge: '', path: '/pages/transfer/index' },
        { icon: '📅', iconClass: styles.iconOrange, text: '预约记录', badge: '', path: '/pages/appointment/index' },
        { icon: '💳', iconClass: styles.iconGreen, text: '我发布的', badge: myCars.length > 0 ? String(myCars.length) : '', path: '/pages/publish/index' }
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
        { icon: '⚖️', iconClass: styles.iconRed, text: '纠纷处理', badge: '', path: '/pages/dispute/index' },
        { icon: '📊', iconClass: styles.iconPurple, text: '管理员看板', badge: '', path: '/pages/admin/index' }
      ]
    }
  ];

  useEffect(() => {
    if (storeUser) {
      setUser(storeUser);
    } else if (isLoggedIn) {
      fetchProfile();
    } else {
      setUser(defaultUser);
    }
    loadMyCars();
  }, [isLoggedIn, storeUser]);

  const loadMyCars = async () => {
    if (!isLoggedIn) {
      setMyCars([]);
      return;
    }
    try {
      const res = await carApi.mine();
      if (res.code === 0 && res.data) {
        setMyCars(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  };

  const handleNavigate = (path: string) => {
    if (!path) return;
    console.log('[MinePage] Navigate to:', path);
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    Taro.navigateTo({ url: path });
  };

  const handleVip = () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    Taro.navigateTo({ url: '/pages/vip/index' });
  };

  const handleAvatar = () => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
    } else {
      Taro.showActionSheet({
        itemList: ['退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) {
            logout();
          }
        }
      });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userHeader}>
        <View className={styles.headerBg} />
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar || 'https://picsum.photos/id/1005/100/100'}
            mode='aspectFill'
            onClick={handleAvatar}
          />
          <View className={styles.userDetail}>
            <View className={styles.nickname}>
              {user.nickname}
              <View className={styles.vipBadge}>{user.vip.levelName}</View>
            </View>
            <Text className={styles.phone}>{user.phone || '未登录'}</Text>
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
              style={{ width: `${user.vip.nextLevelExp > 0 ? (user.vip.currentExp / user.vip.nextLevelExp) * 100 : 0}%` }}
            />
          </View>
        </View>
        <Text className={styles.vipTips}>
          再消费{user.vip.nextLevelExp > 0 ? ((user.vip.nextLevelExp - user.vip.currentExp) / 100).toFixed(0) : 0}元即可升级至钻石会员
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
