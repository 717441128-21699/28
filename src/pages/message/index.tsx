import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockMessages } from '@/data/messages';
import { relativeTime } from '@/utils/format';
import EmptyState from '@/components/EmptyState';

const MessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: '全部', count: mockMessages.filter(m => !m.isRead).length },
    { key: 'appointment', label: '预约', count: mockMessages.filter(m => m.type === 'appointment' && !m.isRead).length },
    { key: 'transaction', label: '交易', count: mockMessages.filter(m => m.type === 'transaction' && !m.isRead).length },
    { key: 'system', label: '系统', count: mockMessages.filter(m => m.type === 'system' && !m.isRead).length },
    { key: 'dispute', label: '纠纷', count: mockMessages.filter(m => m.type === 'dispute' && !m.isRead).length }
  ];

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
    ? mockMessages
    : mockMessages.filter(m => m.type === activeTab);

  const handleClick = (msg: typeof mockMessages[0]) => {
    console.log('[MessagePage] Click message:', msg.id, msg.type);
    const routes: Record<string, string> = {
      appointment: '/pages/appointment/index',
      transaction: '/pages/deposit/index',
      dispute: '/pages/dispute/index'
    };
    if (routes[msg.type] && msg.relatedId) {
      Taro.navigateTo({ url: `${routes[msg.type]}?id=${msg.relatedId}` });
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
