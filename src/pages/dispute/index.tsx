import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { disputeApi } from '@/utils/api';
import { Dispute } from '@/types';
import classnames from 'classnames';

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待处理' },
  { id: 'reviewing', label: '处理中' },
  { id: 'resolved', label: '已解决' }
];

const DisputePage: React.FC = () => {
  const { isLoggedIn } = useUserStore();
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({
    orderId: '',
    reason: ''
  });
  const [evidences, setEvidences] = useState<string[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, [isLoggedIn, activeTab]);

  const loadDisputes = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const res = await disputeApi.list(status);
      if (res.code === 0 && res.data) {
        setDisputes(res.data);
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

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    if (!form.orderId) {
      Taro.showToast({ title: '请输入订单号', icon: 'none' });
      return;
    }
    if (!form.reason) {
      Taro.showToast({ title: '请描述纠纷原因', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认提交',
      content: '提交后客服将在24小时内与您联系，请保持电话畅通。',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const submitRes = await disputeApi.create({
              orderId: form.orderId,
              reason: form.reason,
              evidence: evidences
            });
            if (submitRes.code === 0) {
              Taro.showToast({ title: '工单已生成', icon: 'success' });
              loadDisputes();
              setForm({ orderId: '', reason: '' });
              setEvidences([]);
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
      pending: '待受理',
      reviewing: '处理中',
      escalated: '主管介入',
      resolved: '已解决',
      closed: '已关闭'
    };
    return map[status] || status;
  };

  const filteredDisputes = activeTab === 'all'
    ? disputes
    : disputes.filter(d => d.status === activeTab || (activeTab === 'reviewing' && d.status === 'escalated'));

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.id}
            className={classnames(styles.tabItem, activeTab === tab.id && styles.active)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <View className={styles.disputeList}>
        {filteredDisputes.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#86909C', padding: 60, fontSize: 24 }}>暂无纠纷记录</Text>
        ) : (
          filteredDisputes.map(dispute => (
            <View key={dispute.id} className={styles.disputeCard}>
              <View className={styles.cardHeader}>
                <View className={styles.orderInfo}>
                  <Text className={styles.orderId}>工单 {dispute.id.toUpperCase()}</Text>
                  <Text>订单号：{dispute.orderId.toUpperCase()}</Text>
                </View>
                <View className={classnames(styles.statusTag, styles[dispute.status])}>
                  {getStatusLabel(dispute.status)}
                </View>
              </View>
              <View className={styles.reasonBox}>
                <Text className={styles.reasonLabel}>纠纷原因</Text>
                <Text className={styles.reasonText}>{dispute.reason}</Text>
              </View>
              {dispute.evidence && dispute.evidence.length > 0 && (
                <View className={styles.evidenceRow}>
                  <Text className={styles.evidenceLabel}>证据图片</Text>
                  <View className={styles.evidenceImages}>
                    {dispute.evidence.map((img, i) => (
                      <Image key={i} className={styles.evidenceImg} src={img} mode='aspectFill' />
                    ))}
                  </View>
                </View>
              )}
              <View className={styles.cardFooter}>
                <View className={styles.handlerInfo}>
                  {dispute.handler ? `处理人：${dispute.handler}` : '等待分配处理人'}
                  <Text> · {dispute.createTime.slice(0, 10)}</Text>
                </View>
                <View className={styles.footerActions}>
                  <Button className={styles.actionBtn}>查看详情</Button>
                  <Button className={classnames(styles.actionBtn, styles.primary)}>补充证据</Button>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>📋 纠纷处理说明</Text>
        <View className={styles.tipsList}>
          <Text>1. 提交工单后系统将在30分钟内分配客服专员</Text>
          <Text>2. 客服24小时内联系双方核实情况并协商解决方案</Text>
          <Text>3. 超过48小时未处理将自动升级至主管介入</Text>
          <Text>4. 处理结果将通过系统消息和短信同步通知</Text>
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.sectionTitle}>➕ 发起新纠纷</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>订单号
          </Text>
          <Input
            className={styles.formInput}
            placeholder='请输入交易订单号'
            value={form.orderId}
            onInput={(e) => setForm(prev => ({ ...prev, orderId: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>纠纷原因
          </Text>
          <Textarea
            className={styles.formTextarea}
            placeholder='请详细描述纠纷情况，包括问题发生时间、经过、诉求等...'
            value={form.reason}
            onInput={(e) => setForm(prev => ({ ...prev, reason: e.detail.value }))}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>上传证据（可选，最多6张）</Text>
          <View className={styles.uploadArea}>
            {evidences.map((img, i) => (
              <View key={i} className={styles.uploadItem}>
                <Image className={styles.uploadImage} src={img} mode='aspectFill' />
              </View>
            ))}
            {evidences.length < 6 && (
              <View className={styles.uploadBtn} onClick={handleUpload}>
                <Text className={styles.uploadIcon}>+</Text>
                <Text className={styles.uploadText}>上传证据</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          提交纠纷申请
        </Button>
      </View>
    </View>
  );
};

export default DisputePage;
