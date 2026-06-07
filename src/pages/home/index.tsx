import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockCars, mockBrands } from '@/data/cars';
import { mockPredictions } from '@/data/orders';
import CarCard from '@/components/CarCard';

const HomePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [cars, setCars] = useState(mockCars);

  useEffect(() => {
    console.log('[HomePage] Component mounted, car count:', cars.length);
  }, [cars.length]);

  usePullDownRefresh(() => {
    console.log('[HomePage] Pull down refresh triggered');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handleQuickEntry = (type: string) => {
    console.log('[HomePage] Quick entry clicked:', type);
    const routes: Record<string, string> = {
      loan: '/pages/loan/index',
      insurance: '/pages/insurance/index',
      vip: '/pages/vip/index',
      admin: '/pages/admin/index'
    };
    if (routes[type]) {
      Taro.navigateTo({ url: routes[type] });
    }
  };

  const handleBrandClick = (brand: string) => {
    console.log('[HomePage] Brand clicked:', brand);
    if (brand !== '更多') {
      const filtered = mockCars.filter(c => c.brand === brand);
      setCars(filtered.length > 0 ? filtered : mockCars);
    }
  };

  const handlePublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  const quickEntries = [
    { type: 'loan', icon: '💰', text: '车贷服务', color: styles.entryBlue },
    { type: 'insurance', icon: '🛡️', text: '车险选购', color: styles.entryGreen },
    { type: 'vip', icon: '👑', text: '会员中心', color: styles.entryOrange },
    { type: 'admin', icon: '📊', text: '数据看板', color: styles.entryPurple }
  ];

  const trendMax = Math.max(...mockPredictions.priceTrend.map(p => p.price));

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.searchWrap}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索品牌、车型...'
            value={searchValue}
            onInput={(e) => setSearchValue(e.detail.value)}
            confirmType='search'
          />
        </View>
      </View>

      <View className={styles.bannerWrap}>
        <View className={styles.banner}>
          <Text className={styles.bannerTitle}>智能估价 · 精准匹配</Text>
          <Text className={styles.bannerSubtitle}>AI估值系统，一键获取车辆市场参考价</Text>
          <Button className={styles.bannerBtn} onClick={handlePublish}>立即卖车</Button>
        </View>
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.entryRow}>
          {quickEntries.map(entry => (
            <View
              key={entry.type}
              className={styles.entryItem}
              onClick={() => handleQuickEntry(entry.type)}
            >
              <View className={`${styles.entryIcon} ${entry.color}`}>
                <Text>{entry.icon}</Text>
              </View>
              <Text className={styles.entryText}>{entry.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.brandSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门品牌</Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>
        <View className={styles.brandGrid}>
          {mockBrands.slice(0, 8).map(brand => (
            <View
              key={brand.id}
              className={styles.brandItem}
              onClick={() => handleBrandClick(brand.name)}
            >
              <View className={styles.brandLogo}>
                <Text>{brand.name.slice(0, 2)}</Text>
              </View>
              <Text className={styles.brandName}>{brand.name}</Text>
              <Text className={styles.brandCount}>{brand.count}辆</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.priceTrendSection}>
        <View className={styles.trendCard}>
          <View className={styles.trendHeader}>
            <Text className={styles.trendTitle}>二手车价格走势</Text>
            <Text className={styles.trendTip}>↑ 近6月上涨7.0%</Text>
          </View>
          <View className={styles.trendChart}>
            {mockPredictions.priceTrend.map((item, index) => (
              <View key={index} className={styles.trendBarWrap}>
                <View
                  className={styles.trendBar}
                  style={{ height: `${(item.price / trendMax) * 160 + 20}rpx` }}
                />
                <Text className={styles.trendMonth}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.predictSection}>
        <View className={styles.predictCard}>
          <Text className={styles.predictTitle}>
            <Text>🔥</Text> AI热门车型预测
          </Text>
          {mockPredictions.hotModels.map((item, index) => (
            <View key={index} className={styles.predictItem}>
              <Text className={styles.predictModel}>{index + 1}. {item.model}</Text>
              <View className={styles.predictRight}>
                <Text className={styles.predictScore}>热度 {item.score}</Text>
                <Text className={styles.predictTrend}>↑ {item.trend}%</Text>
              </View>
            </View>
          ))}
          <View className={styles.predictTip}>
            💡 建议：近期特斯拉Model 3、比亚迪汉EV热度持续走高，可重点推广新能源车型
          </View>
        </View>
      </View>

      <View className={styles.hotSection}>
        <View className={styles.hotHeader}>
          <Text className={styles.sectionTitle}>为你推荐</Text>
          <Text className={styles.hotTag}>智能匹配</Text>
        </View>
        <View className={styles.carList}>
          {cars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
