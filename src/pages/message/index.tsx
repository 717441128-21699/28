import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import { userApi } from '@/utils/api';
import { Message } from '@/types';
import { relativeTime } from '@/utils/format';
import EmptyState from '@/components/EmptyState';

const MessagePage: React.FC = () => {
  const { isLoggedIn } = useUserStore();
  const [activeTab, setActiveTab] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'all', label: '全部', count: messages.filter(m => !m.isRead).length },
    { key: 'appointment', label: '预约', count: messages.filter(m => m.type === 'appointment' && !m.isRead).length },
    { key: 'transaction', label: '交易', count: messages.filter(m => m.type === 'transaction' && !m.isRead).length },
    { key: 'system', label: '系统', count: messages.filter(m => m.type === 'system' && !m.isRead).length },
    { key: 'dispute', label: '纠纷', count: messages.filter(m => m.type === 'dispute' && !m.isRead).length }
  ];

  useEffect(() => {
    loadMessages();
  }, [isLoggedIn, activeTab]);

  const loadMessages = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const type = activeTab === 'all' ? undefined : activeTab;
      const res = await userApi.messages(type);
      if (res.code === 0 && res.data) {
        setMessages(res.data.list);
        setUnreadCount(res.data.unread);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const getIconStyle = (type: string) => {
    const map: Record<string, string> = {
      system: styles.iconSystem,
      appointment: styles.iconAppointment,
      transaction: styles.iconTransaction,
      dispute: styles.iconDispute
    };
    return map[type] || styles.iconSystem;
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      system: '📢',
      appointment: '📅',
      transaction: '💰',
      dispute: '⚖️'
    };
    return map[type] || '📢';
  };

  const filteredMessages = activeTab === 'all'
    ? messages
    : messages.filter(m => m.type === activeTab);

  const handleClick = async (msg: Message) => {
    console.log('[MessagePage] Click message:', msg.id, msg.type);
    if (!msg.isRead) {
      try {
        await userApi.readMessage(msg.id);
        loadMessages();
      } catch (e) {}
    }
    const routes: Record<string, string> = {
      appointment: '/pages/appointment/index',
      transaction: '/pages/deposit/index',
      dispute: '/pages/dispute/index'
    };
    if (routes[msg.type] && msg.relatedId) {
      Taro.navigateTo({ url: `${routes[msg.type]}?id=${msg.relatedId}` });
    }
  };

  const handleReadAll = async () => {
    try {
      await userApi.readAllMessages();
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
      loadMessages();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <View className={styles.badge}>{tab.count > 99 ? '99+' : tab.count}</View>}
          </View>
        ))}
        {unreadCount > 0 && (
          <View
            className={styles.tab}
            onClick={handleReadAll}
            style={{ marginLeft: 'auto' }}
          >
            <Text style={{ color: '#1E6FFF', fontSize: '24rpx' }}>全部已读</Text>
          </View>
        )}
      </View>

      <View className={styles.list}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map(msg => (
            <View key={msg.id} className={styles.messageItem} onClick={() => handleClick(msg)}>
              {!msg.isRead && <View className={styles.unreadDot} />}
              <View className={`${styles.iconWrap} ${getIconStyle(msg.type)}`}>
                <Text>{getIcon(msg.type)}</Text>
              </View>
              <View className={styles.content}>
                <View className={styles.header}>
                  <Text className={styles.title}>{msg.title}</Text>
                  <Text className={styles.time}>{relativeTime(msg.time)}</Text>
                </View>
                <Text className={styles.preview}>{msg.content}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon='💬' text='暂无消息' />
        )}
      </View>
    </ScrollView>
  );
};

export default MessagePage;
