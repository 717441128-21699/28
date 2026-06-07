import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { transactionApi, carApi } from '@/utils/api';
import { useUserStore } from '@/store/user';
import { Order, Car } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';
import classnames from 'classnames';

const DepositPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const carId = router.params.carId as string;
  const [agreed, setAgreed] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (carId) {
      loadCarDetail();
    }
  }, [carId]);

  const loadCarDetail = async () => {
    try {
      const res = await carApi.detail(carId);
      if (res.code === 0 && res.data) {
        setCar(res.data);
        const deposit = Math.round(res.data.price * 0.1);
        setOrder({
          id: '',
          carId: res.data.id,
          carTitle: res.data.title,
          carImage: res.data.images[0],
          buyerId: '',
          sellerId: '',
          deposit,
          totalPrice: res.data.price,
          commission: Math.round(res.data.price * 0.02),
          status: 'pending',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        });
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  };

  const handlePay = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    if (!order) return;
    console.log('[DepositPage] Pay deposit');
    if (!agreed) {
      Taro.showToast({ title: '请先同意交易协议', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认支付',
      content: `您确定要支付定金¥${order.deposit.toLocaleString()}吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const createRes = await transactionApi.createOrder({
              carId: order.carId,
              deposit: order.deposit
            });
            if (createRes.code === 0 && createRes.data) {
              setOrder(createRes.data);
              Taro.showToast({ title: '支付成功', icon: 'success' });
              setTimeout(() => {
                Taro.navigateTo({ url: '/pages/transfer/index' });
              }, 1500);
            } else {
              Taro.showToast({ title: createRes.message || '支付失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '支付失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  if (!order || !car) {
    return <View className={styles.page} />;
  }

  const steps = [
    { title: '提交订单', desc: order.createTime, done: true },
    { title: '支付定金', desc: '锁定车辆，生成电子合同', done: false },
    { title: '预约看车', desc: order.appointmentTime || '待确认', done: false },
    { title: '现场看车', desc: '确认车辆状况', done: false },
    { title: '过户结算', desc: '双方到场确认，结算尾款', done: false },
    { title: '交易完成', desc: '订单完成', done: false }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.orderCard}>
        <Text className={styles.orderTitle}>📋 订单信息</Text>
        <View className={styles.orderCar}>
          <Image className={styles.orderCarImage} src={car.images[0]} mode='aspectFill' />
          <View className={styles.orderCarInfo}>
            <Text className={styles.orderCarTitle}>{order.carTitle}</Text>
            <Text className={styles.orderCarPrice}>{formatPrice(order.totalPrice)}</Text>
          </View>
        </View>
        <View className={styles.orderRows}>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>定金金额</Text>
            <Text className={styles.orderValueHighlight}>¥{order.deposit.toLocaleString()}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>尾款金额</Text>
            <Text className={styles.orderValue}>¥{(order.totalPrice - order.deposit).toLocaleString()}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>平台佣金（2%）</Text>
            <Text className={styles.orderValue}>¥{order.commission.toLocaleString()}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>预约时间</Text>
            <Text className={styles.orderValue}>{order.appointmentTime ? formatDate(order.appointmentTime) : '待确认'}</Text>
          </View>
          <View className={styles.orderRow}>
            <Text className={styles.orderLabel}>看车地点</Text>
            <Text className={styles.orderValue}>{order.appointmentLocation || '待确认'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.contractCard}>
        <View className={styles.contractCheck} onClick={() => setAgreed(!agreed)}>
          <View className={classnames(styles.checkbox, agreed && styles.checked)}>
            {agreed && <Text>✓</Text>}
          </View>
          <Text className={styles.contractText}>
            我已阅读并同意
            <Text className={styles.contractLink}>《二手车交易服务协议》</Text>
            和
            <Text className={styles.contractLink}>《电子合同签署协议》</Text>
          </Text>
        </View>
        <Text className={styles.contractText} style={{ fontSize: '22rpx', color: '#86909C' }}>
          定金支付后将生成电子合同，车辆将为您锁定3天。若看车后不满意，定金可全额退还。
        </Text>
      </View>

      <View className={styles.timeline}>
        <Text className={styles.orderTitle}>📊 交易流程</Text>
        {steps.map((step, index) => (
          <View key={index} className={styles.timelineItem}>
            <View className={classnames(styles.timelineDot, !step.done && styles.timelineDotInactive)}>
              <Text>{index + 1}</Text>
            </View>
            <View className={styles.timelineContent}>
              <Text className={styles.timelineTitle}>{step.title}</Text>
              <Text className={styles.timelineDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View>
          <Text className={styles.totalLabel}>待支付定金</Text>
          <Text className={styles.totalPrice}>¥{order.deposit.toLocaleString()}</Text>
        </View>
        <Button className={styles.payBtn} onClick={handlePay}>立即支付</Button>
      </View>
    </View>
  );
};

export default DepositPage;
