import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { carApi } from '@/utils/api';
import { useUserStore } from '@/store/user';
import { Car } from '@/types';
import CarCard from '@/components/CarCard';

const PublishPage: React.FC = () => {
  const { isLoggedIn } = useUserStore();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    color: '',
    price: '',
    location: '',
    gearbox: '自动',
    displacement: '2.0T',
    fuelType: '汽油',
    description: ''
  });
  const [images, setImages] = useState<string[]>([
    'https://picsum.photos/id/1071/600/400'
  ]);
  const [showValuation, setShowValuation] = useState(false);
  const [valuation, setValuation] = useState({
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    marketAvg: 0,
    sameModel: 0,
    dealRate: 0
  });
  const [myPublishedCars, setMyPublishedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyCars = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await carApi.mine();
      if (res.code === 0 && res.data) {
        setMyPublishedCars(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  };

  useEffect(() => {
    loadMyCars();
  }, [isLoggedIn]);

  const handleInput = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddImage = () => {
    console.log('[PublishPage] Add image');
    if (images.length < 9) {
      const newImages = [...images, `https://picsum.photos/id/${1071 + images.length}/600/400`];
      setImages(newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('[PublishPage] Remove image:', index);
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleValuation = async () => {
    console.log('[PublishPage] Get valuation');
    if (!formData.brand || !formData.model || !formData.year || !formData.mileage) {
      Taro.showToast({ title: '请填写完整车辆信息', icon: 'none' });
      return;
    }
    try {
      setLoading(true);
      const res = await carApi.valuation({
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: parseFloat(formData.mileage)
      });
      if (res.code === 0 && res.data) {
        setValuation({
          price: res.data.avgPrice,
          minPrice: res.data.minPrice,
          maxPrice: res.data.maxPrice,
          marketAvg: res.data.avgPrice,
          sameModel: res.data.sameModelCount,
          dealRate: res.data.dealRate
        });
        setShowValuation(true);
      } else {
        Taro.showToast({ title: res.message || '估价失败', icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '估价失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    console.log('[PublishPage] Submit form:', formData);
    if (!formData.brand || !formData.model || !formData.price) {
      Taro.showToast({ title: '请填写必填信息', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认发布',
      content: '您确认要发布这条车辆信息吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const publishRes = await carApi.publish({
              ...formData,
              year: parseInt(formData.year),
              price: parseFloat(formData.price),
              mileage: parseFloat(formData.mileage),
              images
            });
            if (publishRes.code === 0) {
              Taro.showToast({ title: '发布成功', icon: 'success' });
              loadMyCars();
              console.log('[PublishPage] Publish success');
            } else {
              Taro.showToast({ title: publishRes.message || '发布失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '发布失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleReset = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      mileage: '',
      color: '',
      price: '',
      location: '',
      gearbox: '自动',
      displacement: '2.0T',
      fuelType: '汽油',
      description: ''
    });
    setImages([]);
    setShowValuation(false);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>发布您的爱车</Text>
        <Text className={styles.headerSubtitle}>填写车辆信息，AI智能估价，快速成交</Text>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>🚗 基本信息</Text>

        <View className={styles.formRow}>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>品牌 *</Text>
              <Input
                className={styles.formInput}
                placeholder='请输入品牌'
                value={formData.brand}
                onInput={(e) => handleInput('brand', e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>车型 *</Text>
              <Input
                className={styles.formInput}
                placeholder='请输入车型'
                value={formData.model}
                onInput={(e) => handleInput('model', e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.formRow}>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>上牌年份</Text>
              <Input
                className={styles.formInput}
                type='number'
                placeholder='如：2022'
                value={formData.year}
                onInput={(e) => handleInput('year', e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>里程（公里）</Text>
              <Input
                className={styles.formInput}
                type='number'
                placeholder='如：32000'
                value={formData.mileage}
                onInput={(e) => handleInput('mileage', e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.formRow}>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>颜色</Text>
              <Input
                className={styles.formInput}
                placeholder='如：白色'
                value={formData.color}
                onInput={(e) => handleInput('color', e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formRowItem}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>所在城市</Text>
              <Input
                className={styles.formInput}
                placeholder='如：北京'
                value={formData.location}
                onInput={(e) => handleInput('location', e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>📷 车辆照片</Text>
        <View className={styles.uploadWrap}>
          {images.map((img, index) => (
            <View key={index} className={styles.uploadItem}>
              <Image className={styles.uploadImg} src={img} mode='aspectFill' />
              <View className={styles.removeBtn} onClick={() => handleRemoveImage(index)}>×</View>
            </View>
          ))}
          {images.length < 9 && (
            <View className={styles.uploadAdd} onClick={handleAddImage}>
              <Text className={styles.uploadAddIcon}>+</Text>
              <Text>添加照片</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.valuationCard}>
        <View className={styles.valuationHeader}>
          <Text className={styles.valuationTitle}>
            <Text>📊</Text> AI智能估价
          </Text>
          <Button className={styles.valuationBtn} onClick={handleValuation}>
            {showValuation ? '重新估价' : '立即估价'}
          </Button>
        </View>

        {showValuation && (
          <View className={styles.valuationResult}>
            <View className={styles.valuationPriceRow}>
              <Text className={styles.valuationPrice}>¥{valuation.price.toLocaleString()}</Text>
              <Text className={styles.valuationRange}>
                建议区间 ¥{valuation.minPrice.toLocaleString()} - ¥{valuation.maxPrice.toLocaleString()}
              </Text>
            </View>
            <View className={styles.valuationItems}>
              <View className={styles.valuationItem}>
                <Text className={styles.valuationItemLabel}>市场均价</Text>
                <Text className={styles.valuationItemValue}>¥{(valuation.marketAvg / 10000).toFixed(1)}万</Text>
              </View>
              <View className={styles.valuationItem}>
                <Text className={styles.valuationItemLabel}>同款在售</Text>
                <Text className={styles.valuationItemValue}>{valuation.sameModel}辆</Text>
              </View>
              <View className={styles.valuationItem}>
                <Text className={styles.valuationItemLabel}>成交率</Text>
                <Text className={styles.valuationItemValue}>{valuation.dealRate}%</Text>
              </View>
            </View>
            <View className={styles.suggestTip}>
              💡 智能建议：当前估价略高于市场均价，建议定价在18-19万之间可加快成交速度
            </View>
          </View>
        )}
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>💰 售价信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>期望售价（元）*</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='请输入您的期望售价'
            value={formData.price}
            onInput={(e) => handleInput('price', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>车辆描述</Text>
          <Input
            className={styles.formInput}
            placeholder='补充车辆情况，如保养情况、配置等'
            value={formData.description}
            onInput={(e) => handleInput('description', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.myPublishSection}>
        <View className={styles.myPublishHeader}>
          <Text className={styles.myPublishTitle}>我发布的车辆</Text>
          <Text className={styles.myPublishCount}>共 {myPublishedCars.length} 辆</Text>
        </View>
        {myPublishedCars.length > 0 ? (
          myPublishedCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))
        ) : (
          <View className={styles.emptyPublish}>
            <Text className={styles.emptyIcon}>🚙</Text>
            <Text className={styles.emptyText}>还没有发布的车辆</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PublishPage;
