import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { financeApi } from '@/utils/api';
import { Loan } from '@/types';
import classnames from 'classnames';

const LoanPage: React.FC = () => {
  const { isLoggedIn, user } = useUserStore();
  const [form, setForm] = useState({
    carPrice: '268000',
    downPayment: '68000',
    periods: '36'
  });
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);

  const periodOptions = ['12', '24', '36', '48'];

  const price = parseInt(form.carPrice) || 0;
  const down = parseInt(form.downPayment) || 0;
  const loanAmount = Math.max(0, price - down);
  const periods = parseInt(form.periods) || 36;
  const interestRate = 4.5;
  const monthlyPayment = periods > 0
    ? Math.round(loanAmount * (1 + interestRate / 100 * periods / 12) / periods)
    : 0;

  useEffect(() => {
    loadLoans();
  }, [isLoggedIn]);

  const loadLoans = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await financeApi.loans();
      if (res.code === 0 && res.data) {
        setLoans(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    console.log('[LoanPage] Apply loan:', form);
    if (loanAmount <= 0) {
      Taro.showToast({ title: '请填写正确金额', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认申请',
      content: `您确定申请车贷¥${loanAmount.toLocaleString()}，分${periods}期还款吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const applyRes = await financeApi.applyLoan({
              amount: loanAmount,
              downPayment: down,
              periods
            });
            if (applyRes.code === 0) {
              Taro.showToast({ title: '申请已提交，等待审批', icon: 'success' });
              loadLoans();
            } else {
              Taro.showToast({ title: applyRes.message || '申请失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '申请失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '审批中',
      approved: '已批准',
      rejected: '已拒绝',
      repaid: '已还清'
    };
    return map[status] || status;
  };

  const creditScore = user?.creditScore || 700;

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>🚗 车易拍车贷</Text>
        <Text className={styles.heroSubtitle}>快速审批 · 低利率 · 灵活分期</Text>
        <View className={styles.creditRow}>
          <View className={styles.creditItem}>
            <Text className={styles.creditValue}>{creditScore}</Text>
            <Text className={styles.creditLabel}>信用分</Text>
          </View>
          <View className={styles.creditItem}>
            <Text className={styles.creditValue}>{(creditScore * 1000).toLocaleString()}</Text>
            <Text className={styles.creditLabel}>预授信额度</Text>
          </View>
          <View className={styles.creditItem}>
            <Text className={styles.creditValue}>{interestRate}%</Text>
            <Text className={styles.creditLabel}>年利率</Text>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>📝 贷款计算</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>车辆价格（元）</Text>
          <Input
            className={styles.formInput}
            type='number'
            value={form.carPrice}
            onInput={(e) => setForm(prev => ({ ...prev, carPrice: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>首付金额（元）</Text>
          <Input
            className={styles.formInput}
            type='number'
            value={form.downPayment}
            onInput={(e) => setForm(prev => ({ ...prev, downPayment: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>还款期限</Text>
          <View className={styles.periodOptions}>
            {periodOptions.map(p => (
              <View
                key={p}
                className={classnames(styles.periodOption, form.periods === p && styles.active)}
                onClick={() => setForm(prev => ({ ...prev, periods: p }))}
              >
                {p}期
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.resultCard}>
        <Text className={styles.sectionTitle}>💡 计算结果</Text>
        <View className={styles.resultRow}>
          <Text className={styles.resultLabel}>贷款金额</Text>
          <Text className={styles.resultValue}>¥{loanAmount.toLocaleString()}</Text>
        </View>
        <View className={styles.resultRow}>
          <Text className={styles.resultLabel}>年利率</Text>
          <Text className={styles.resultValue}>{interestRate}%</Text>
        </View>
        <View className={styles.resultRow}>
          <Text className={styles.resultLabel}>每月还款</Text>
          <Text className={styles.resultHighlight}>¥{monthlyPayment.toLocaleString()}</Text>
        </View>
      </View>

      <View className={styles.myLoans}>
        <Text className={styles.sectionTitle}>📋 我的贷款</Text>
        {loans.map(loan => (
          <View key={loan.id} className={styles.loanItem}>
            <View className={styles.loanInfo}>
              <Text className={styles.loanAmount}>¥{loan.amount.toLocaleString()}</Text>
              <Text className={styles.loanDetail}>
                {loan.periods}期 · 月供¥{loan.monthlyPayment.toLocaleString()} · {loan.applicationTime.slice(0, 10)}
              </Text>
            </View>
            <View className={styles.statusTag}>{getStatusLabel(loan.status)}</View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.applyBtn} onClick={handleApply}>
          提交贷款申请
        </Button>
      </View>
    </View>
  );
};

export default LoanPage;
