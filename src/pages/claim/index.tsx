import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { financeApi } from '@/utils/api';
import { Claim } from '@/types';
import { formatMoney } from '@/utils/format';
import classnames from 'classnames';

const ClaimPage: React.FC = () => {
  const { isLoggedIn } = useUserStore();
  const [form, setForm] = useState({
    insuranceId: '',
    amount: '',
    description: ''
  });
  const [evidences, setEvidences] = useState<string[]>([
    'https://picsum.photos/id/1071/400/400'
  ]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

  const steps = ['提交申请', '系统初审', '人工复核', '赔付到账'];

  useEffect(() => {
    loadClaims();
  }, [isLoggedIn]);

  const loadClaims = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await financeApi.claims();
      if (res.code === 0 && res.data) {
        setClaims(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    Taro.chooseImage({
      count: 6 - evidences.length,
      success: (res) => {
        setEvidences(prev => [...prev, ...res.tempFilePaths]);
      }
    });
  };

  const handleRemove = (index: number) => {
    setEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    if (!form.amount) {
      Taro.showToast({ title: '请填写理赔金额', icon: 'none' });
      return;
    }
    if (!form.description) {
      Taro.showToast({ title: '请描述事故情况', icon: 'none' });
      return;
    }
    if (evidences.length === 0) {
      Taro.showToast({ title: '请上传至少一张证据', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认提交',
      content: '您确定提交该理赔申请吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const submitRes = await financeApi.fileClaim({
              insuranceId: form.insuranceId || 'default',
              amount: parseFloat(form.amount),
              description: form.description,
              evidence: evidences
            });
            if (submitRes.code === 0) {
              Taro.showToast({ title: '申请已提交，等待初审', icon: 'success' });
              loadClaims();
            } else {
              Taro.showToast({ title: submitRes.message || '提交失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '提交失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待初审',
      reviewing: '系统审核中',
      manual: '人工复核中',
      approved: '审核通过',
      rejected: '已拒赔',
      paid: '已赔付'
    };
    return map[status] || status;
  };

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <Text className={styles.heroTitle}>📑 快速理赔</Text>
        <Text className={styles.heroSubtitle}>AI智能初审 · 最快2小时到账</Text>
        <View className={styles.stepsRow}>
          {steps.map((step, i) => (
            <View key={step} className={styles.stepItem}>
              <View className={styles.stepIcon}>{i + 1}</View>
              <Text className={styles.stepLabel}>{step}</Text>
              {i < steps.length - 1 && <View className={styles.stepConnector} />}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>📝 填写理赔信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>理赔金额（元）
          </Text>
          <Input
            className={styles.formInput}
            type='digit'
            placeholder='请输入预估理赔金额'
            value={form.amount}
            onInput={(e) => setForm(prev => ({ ...prev, amount: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>事故描述
          </Text>
          <Textarea
            className={styles.formTextarea}
            placeholder='请详细描述事故发生时间、地点、经过和损失情况...'
            value={form.description}
            onInput={(e) => setForm(prev => ({ ...prev, description: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>上传证据照片（最多6张）
          </Text>
          <View className={styles.uploadArea}>
            {evidences.map((img, i) => (
              <View key={i} className={styles.uploadItem}>
                <Image
                  className={styles.uploadImage}
                  src={img}
                  mode='aspectFill'
                  onClick={() => handleRemove(i)}
                />
              </View>
            ))}
            {evidences.length < 6 && (
              <View className={styles.uploadBtn} onClick={handleUpload}>
                <Text className={styles.uploadIcon}>+</Text>
                <Text className={styles.uploadText}>上传照片</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.claimList}>
        <Text className={styles.sectionTitle}>📋 我的理赔记录</Text>
        {claims.map(claim => (
          <View key={claim.id} className={styles.claimItem}>
            <View className={styles.claimHeader}>
              <Text className={styles.claimTitle}>理赔申请 · {claim.id.toUpperCase()}</Text>
              <View className={classnames(styles.statusTag, styles[claim.status])}>
                {getStatusLabel(claim.status)}
              </View>
            </View>
            <Text className={styles.claimDesc}>{claim.description}</Text>
            <View className={styles.claimMeta}>
              <Text>申请金额：¥{formatMoney(claim.amount)}</Text>
              <Text>{claim.createTime.slice(0, 10)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          提交理赔申请
        </Button>
      </View>
    </View>
  );
};

export default ClaimPage;
