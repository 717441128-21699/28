import React, { useState, useEffect } from 'react';
import { View, Text, Image, Swiper, SwiperItem, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockCars } from '@/data/cars';
import { Car } from '@/types';
import { formatPrice, formatMileage, formatDate } from '@/utils/format';
import classnames from 'classnames';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    const id = router.params.id;
    console.log('[DetailPage] Car id:', id);
    const found = mockCars.find(c => c.id === id) || mockCars[0];
    setCar(found);
  }, [router.params.id]);

  const handleAppointment = () => {
    if (!car) return;
    console.log('[DetailPage] Make appointment:', car.id);
    Taro.navigateTo({ url: `/pages/appointment/index?carId=${car.id}` });
  };

  const handleBuy = () => {
    if (!car) return;
    console.log('[DetailPage] Buy now:', car.id);
    Taro.navigateTo({ url: `/pages/deposit/index?carId=${car.id}` });
  };

  const handleContact = () => {
    Taro.showToast({ title: '已拨打卖家电话', icon: 'none' });
  };

  const handleTransfer = () => {
    Taro.navigateTo({ url: '/pages/transfer/index' });
  };

  if (!car) return null;

  return (
    <View className={styles.page}>
      <Swiper className={styles.swiper} indicatorDots autoplay circular>
        {car.images.map((img, index) => (
          <SwiperItem key={index} className={styles.swiperItem}>
            <Image
              className={styles.carImage}
              src={img}
              mode='aspectFill'
              onError={(e) => console.error('[DetailPage] Image error:', e)}
            />
          </SwiperItem>
        ))}
      </Swiper>

      <View className={styles.infoCard}>
        <Text className={styles.title}>{car.title}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.price}>{formatPrice(car.price)}</Text>
          <Text className={styles.originalPrice}>新车 {formatPrice(car.originalPrice)}</Text>
        </View>
        <View className={styles.tagsWrap}>
          {car.tags.map((tag, index) => (
            <View
              key={index}
              className={classnames(styles.tag, index % 2 === 1 && styles.tagOrange)}
            >
              {tag}
            </View>
          ))}
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>上牌年份</Text>
            <Text className={styles.infoValue}>{car.year}年</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>行驶里程</Text>
            <Text className={styles.infoValue}>{formatMileage(car.mileage)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>变速箱</Text>
            <Text className={styles.infoValue}>{car.gearbox}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>排量</Text>
            <Text className={styles.infoValue}>{car.displacement}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>燃料</Text>
            <Text className={styles.infoValue}>{car.fuelType}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所在地</Text>
            <Text className={styles.infoValue}>{car.location}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📋 车况检测报告</Text>
          <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
            检测日期：{formatDate(car.inspectionReport.inspectTime)}
          </Text>
        </View>
        <View className={styles.inspectionScore}>
          <View>
            <Text className={styles.scoreNum}>{car.inspectionReport.overallScore}</Text>
            <Text className={styles.scoreLabel}>综合评分</Text>
          </View>
          <Text className={styles.scoreDesc}>
            经过专业检测师{item.name}全面检测，该车况整体良好，各项指标均符合标准，可放心购买。
          </Text>
        </View>
        <View className={styles.inspectionItems}>
          {car.inspectionReport.items.map((item, index) => (
            <View key={index} className={styles.inspectionItem}>
              <Text className={styles.itemName}>{item.name}</Text>
              <View className={styles.itemStatus}>
                <View className={classnames(
                  styles.statusDot,
                  item.status === 'normal' && styles.statusNormal,
                  item.status === 'warning' && styles.statusWarning,
                  item.status === 'abnormal' && styles.statusAbnormal
                )} />
                <Text className={styles.statusText}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sellerCard}>
        <View className={styles.sellerInfo}>
          <Image className={styles.sellerAvatar} src={car.seller.avatar} mode='aspectFill' />
          <View className={styles.sellerDetail}>
            <Text className={styles.sellerName}>{car.seller.name}</Text>
            <View className={styles.sellerStats}>
              <Text>⭐ {car.seller.rating}分</Text>
              <Text>成交{car.seller.dealCount}次</Text>
            </View>
          </View>
          <Button className={styles.contactBtn} onClick={handleContact}>联系卖家</Button>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.iconBtn} onClick={handleTransfer}>
          <Text className={styles.iconBtnIcon}>📋</Text>
          <Text>过户</Text>
        </Button>
        <Button className={styles.appointmentBtn} onClick={handleAppointment}>
          预约看车
        </Button>
        <Button className={styles.buyBtn} onClick={handleBuy}>
          立即购买
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
