import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockInsurances } from '@/data/orders';
import { formatMoney, relativeTime } from '@/utils/format';
import classnames from 'classnames';

const plans = [
  {
    id: 'compulsory',
    name: '交强险',
    badge: '强制',
    desc: '国家强制购买，保障第三方人身伤亡和财产损失',
    coverages: ['第三方死亡伤残11万', '第三方医疗费用1万', '第三方财产损失2000'],
    premium: 950,
    coverage: 122000
  },
  {
    id: 'third_party',
    name: '商业第三者责任险',
    badge: '推荐',
    desc: '补充交强险保额，大额赔付首选，建议100万起步',
    coverages: ['第三者100万', '司机责任险1万', '乘客责任险1万/座'],
    premium: 2180,
    coverage: 1000000
  },
  {
    id: 'comprehensive',
    name: '全车综合险',
    badge: '最热门',
    desc: '全方位保障，含车损险、盗抢险、不计免赔等全险种',
    coverages: ['第三者100万', '车损险', '全车盗抢险', '不计免赔特约险', '玻璃单独破碎险', '自燃损失险', '发动机涉水险'],
    premium: 4580,
    coverage: 1500000
  }
];

const InsurancePage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['compulsory', 'comprehensive']);

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const totalPremium = plans
    .filter(p => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.premium, 0);

  const handleBuy = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请选择保险方案', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认投保',
      content: `您确定购买所选车险，合计¥${formatMoney(totalPremium)}吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '投保成功', icon: 'success' });
        }
      }
    });
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: '保障中',
      expired: '已过期',
      claiming: '理赔中'
    };
    return map[status] || status;
  };

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>🛡️ 车易拍车险</Text>
        <Text className={styles.heroSubtitle}>官方合作 · 极速理赔 · 全程无忧</Text>
        <View className={styles.heroFeatures}>
          <View className={styles.featureItem}>
            <View className={styles.featureIcon}>⚡</View>
            <Text className={styles.featureLabel}>极速投保</Text>
          </View>
          <View className={styles.featureItem}>
            <View className={styles.featureIcon}>💰</View>
            <Text className={styles.featureLabel}>价格透明</Text>
          </View>
          <View className={styles.featureItem}>
            <View className={styles.featureIcon}>🏥</View>
            <Text className={styles.featureLabel}>24h理赔</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>📋 选择保险方案</Text>
      <View className={styles.insuranceList}>
        {plans.map(plan => (
          <View
            key={plan.id}
            className={classnames(styles.insuranceCard, selectedIds.includes(plan.id) && styles.selected)}
          >
            <View className={styles.cardHeader}>
              <Text className={styles.planName}>{plan.name}</Text>
              <View className={styles.planBadge}>{plan.badge}</View>
            </View>
            <Text className={styles.planDesc}>{plan.desc}</Text>
            <View className={styles.coverageItems}>
              {plan.coverages.map((c, i) => (
                <View key={i} className={styles.coverageTag}>{c}</View>
              ))}
            </View>
            <View className={styles.cardFooter}>
              <View className={styles.priceInfo}>
                <Text className={styles.priceSymbol}>¥</Text>
                <Text className={styles.priceValue}>{plan.premium}</Text>
                <Text className={styles.priceUnit}>/年</Text>
              </View>
              <Button
                className={classnames(styles.selectBtn, selectedIds.includes(plan.id) && styles.selected)}
                onClick={() => handleToggle(plan.id)}
              >
                {selectedIds.includes(plan.id) ? '已选择' : '选择'}
              </Button>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.myInsurances}>
        <Text className={styles.sectionTitle}>📄 我的保单</Text>
        {mockInsurances.map(ins => (
          <View key={ins.id} className={styles.insuranceItem}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemTitle}>{ins.typeName} · 保额{formatMoney(ins.coverage)}</Text>
              <View className={classnames(styles.statusTag, styles[ins.status])}>
                {getStatusLabel(ins.status)}
              </View>
            </View>
            <View className={styles.itemMeta}>
              <Text>保费：¥{formatMoney(ins.premium)} · {ins.duration}个月</Text>
              <Text>有效期至：{ins.expireDate}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.barContent}>
          <View>
            <Text className={styles.totalLabel}>已选{selectedIds.length}项，合计</Text>
            <View>
              <Text className={styles.totalPrice}>¥{formatMoney(totalPremium)}</Text>
            </View>
          </View>
          <Button
            className={classnames(styles.buyBtn, selectedIds.length === 0 && styles.disabled)}
            onClick={handleBuy}
          >
            立即投保
          </Button>
        </View>
      </View>
    </View>
  );
};

export default InsurancePage;
