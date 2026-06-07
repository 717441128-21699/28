import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockOrders } from '@/data/orders';
import classnames from 'classnames';

const TransferPage: React.FC = () => {
  const order = mockOrders[0];

  const handleConfirm = () => {
    console.log('[TransferPage] Confirm transfer');
    Taro.showModal({
      title: '确认到场',
      content: '请确认买卖双方均已到场，并已完成车辆过户手续。确认后系统将自动结算尾款。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '结算成功', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.showToast({ title: '已取消', icon: 'none' });
  };

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
