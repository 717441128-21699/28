import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Car } from '@/types';
import { formatPrice, formatMileage, relativeTime } from '@/utils/format';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const handleClick = () => {
    console.log('[CarCard] Navigate to car detail:', car.id);
    Taro.navigateTo({
      url: `/pages/detail/index?id=${car.id}`
    });
  };

  const getStatusClass = () => {
    if (car.status === 'reserved') return styles.reserved;
    if (car.status === 'sold') return styles.sold;
    return '';
  };

  const getStatusText = () => {
    if (car.status === 'reserved') return '已预约';
    if (car.status === 'sold') return '已售出';
    return '';
  };

  const images = Array.isArray(car.images) ? car.images : (typeof car.images === 'string' ? JSON.parse(car.images) : []);
  const tags = Array.isArray(car.tags) ? car.tags : (typeof car.tags === 'string' ? JSON.parse(car.tags) : []);
  const publishTime = car.publishTime || car.createdAt || '';

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.carImage}
          src={images[0] || ''}
          mode='aspectFill'
          onError={(e) => console.error('[CarCard] Image load error:', e)}
        />
        {car.status !== 'available' && (
          <View className={`${styles.statusBadge} ${getStatusClass()}`}>
            {getStatusText()}
          </View>
        )}
        <View className={styles.tagsWrap}>
          {tags.slice(0, 3).map((tag, index) => (
            <View key={index} className={styles.tag}>{tag}</View>
          ))}
        </View>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{car.title}</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoItem}>{car.year}年</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.infoItem}>{formatMileage(car.mileage)}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.infoItem}>{car.gearbox}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.infoItem}>{car.displacement}</Text>
        </View>
        <View className={styles.bottomRow}>
          <View className={styles.priceWrap}>
            <Text className={styles.price}>{formatPrice(car.price)}</Text>
            <Text className={styles.originalPrice}>
              新车 {formatPrice(car.originalPrice)}
            </Text>
          </View>
          <Text className={styles.location}>{car.location} · {relativeTime(publishTime)}</Text>
        </View>
      </View>
    </View>
  );
};

export default CarCard;
