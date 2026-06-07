import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { transactionApi } from '@/utils/api';
import { useUserStore } from '@/store/user';
import { Order } from '@/types';
import classnames from 'classnames';

const TransferPage: React.FC = () => {
  const { isLoggedIn, user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [isLoggedIn]);

  const loadOrders = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await transactionApi.orders('buyer');
      if (res.code === 0 && res.data && res.data.length > 0) {
        setOrders(res.data);
        setOrder(res.data[0]);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    if (!order) return;
    console.log('[TransferPage] Confirm transfer');
    Taro.showModal({
      title: '确认到场',
      content: '请确认买卖双方均已到场，并已完成车辆过户手续。确认后系统将自动结算尾款。',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const confirmRes = await transactionApi.confirmTransfer({
              orderId: order.id,
              buyerConfirmed: true,
              sellerConfirmed: false
            });
            if (confirmRes.code === 0) {
              Taro.showToast({ title: '结算成功', icon: 'success' });
              loadOrders();
            } else {
              Taro.showToast({ title: confirmRes.message || '操作失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleSignContract = async () => {
    if (!order) return;
    try {
      setLoading(true);
      const res = await transactionApi.signContract(order.id);
      if (res.code === 0) {
        Taro.showToast({ title: '合同签署成功', icon: 'success' });
        loadOrders();
      } else {
        Taro.showToast({ title: res.message || '签署失败', icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '签署失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Taro.showToast({ title: '已取消', icon: 'none' });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <Text style={{ textAlign: 'center', padding: 100, color: '#86909C' }}>暂无进行中的订单</Text>
      </View>
    );
  }

  const finalAmount = order.totalPrice - order.deposit - order.commission;

  const steps = [
    { title: '双方到场', desc: '请买卖双方携带身份证等证件到场', done: false },
    { title: '扫码确认', desc: '双方扫描二维码确认身份', done: false },
    { title: '过户验车', desc: '车管所办理过户手续', done: false },
    { title: '结算尾款', desc: '系统自动结算尾款至卖家账户', done: false },
    { title: '交易完成', desc: '交易结束，评价服务', done: false }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.qrSection}>
        <Text className={styles.qrTitle}>过户确认二维码</Text>
        <Text className={styles.qrSubtitle}>请买卖双方扫码确认身份</Text>
        <View className={styles.qrCode}>📱</View>
        <Text className={styles.qrTips}>
          订单号：{order.id}{'\n'}
          请在工作人员引导下完成扫码确认
        </Text>
      </View>

      <View className={styles.settleCard}>
        <Text className={styles.sectionTitle}>💰 结算明细</Text>
        <View className={styles.settleRow}>
          <Text className={styles.settleLabel}>车辆总价</Text>
          <Text className={styles.settleValue}>¥{order.totalPrice.toLocaleString()}</Text>
        </View>
        <View className={styles.settleRow}>
          <Text className={styles.settleLabel}>已付定金</Text>
          <Text className={styles.settleValue}>- ¥{order.deposit.toLocaleString()}</Text>
        </View>
        <View className={styles.settleRow}>
          <Text className={styles.settleLabel}>平台佣金（2%）</Text>
          <Text className={styles.settleValue}>- ¥{order.commission.toLocaleString()}</Text>
        </View>
        <View className={styles.settleRow}>
          <Text className={styles.settleLabel}>卖家实收</Text>
          <Text className={styles.settleTotal}>¥{finalAmount.toLocaleString()}</Text>
        </View>
        {order.status === 'deposit_paid' && (
          <Button
            className={styles.confirmBtn}
            style={{ marginTop: '24rpx', width: '100%' }}
            onClick={handleSignContract}
          >
            签署电子合同
          </Button>
        )}
        <View className={styles.btnRow}>
          <Button className={styles.cancelBtn} onClick={handleCancel}>取消交易</Button>
          <Button className={styles.confirmBtn} onClick={handleConfirm}>确认到场结算</Button>
        </View>
      </View>

      <View className={styles.steps}>
        <Text className={styles.sectionTitle}>📋 过户流程</Text>
        {steps.map((step, index) => (
          <View key={index} className={styles.stepItem}>
            <View className={classnames(styles.stepDot, !step.done && styles.stepDotPending)}>
              <Text>{step.done ? '✓' : index + 1}</Text>
            </View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>{step.title}</Text>
              <Text className={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TransferPage;
