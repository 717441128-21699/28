import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { transactionApi, carApi } from '@/utils/api';
import { useUserStore } from '@/store/user';
import { Appointment, Car } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/format';
import classnames from 'classnames';

const AppointmentPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useUserStore();
  const carId = router.params.carId as string;
  const [form, setForm] = useState({
    date: '2026-06-10',
    time: '14:00',
    location: '北京市朝阳区车易拍线下服务中心',
    name: '',
    phone: ''
  });
  const [showList, setShowList] = useState(!carId);
  const [car, setCar] = useState<Car | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, name: user.nickname, phone: user.phone }));
    }
    if (carId) {
      loadCarDetail();
    }
    loadAppointments();
  }, [carId, isLoggedIn, user]);

  const loadCarDetail = async () => {
    try {
      const res = await carApi.detail(carId);
      if (res.code === 0 && res.data) {
        setCar(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  };

  const loadAppointments = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await transactionApi.appointments('buyer');
      if (res.code === 0 && res.data) {
        setAppointments(res.data);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setForm(prev => ({ ...prev, time }));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
      return;
    }
    if (!carId) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    console.log('[AppointmentPage] Submit appointment:', form);
    Taro.showModal({
      title: '确认预约',
      content: `您确定要在${form.date} ${form.time}预约看车吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true);
            const createRes = await transactionApi.createAppointment({
              carId,
              time: `${form.date} ${form.time}`,
              location: form.location
            });
            if (createRes.code === 0) {
              Taro.showToast({ title: '预约成功，等待卖家确认', icon: 'success' });
              setShowList(true);
              loadAppointments();
            } else {
              Taro.showToast({ title: createRes.message || '预约失败', icon: 'none' });
            }
          } catch (e: any) {
            Taro.showToast({ title: e.message || '预约失败', icon: 'none' });
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleConfirm = async (id: string) => {
    console.log('[AppointmentPage] Confirm appointment:', id);
    try {
      const res = await transactionApi.confirmAppointment(id, true);
      if (res.code === 0) {
        Taro.showToast({ title: '已确认预约', icon: 'success' });
        loadAppointments();
      } else {
        Taro.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  const handleIntent = async (id: string, intent: boolean) => {
    console.log('[AppointmentPage] Buyer intent:', id, intent);
    try {
      if (intent) {
        const res = await transactionApi.buyerIntent(id);
        if (res.code === 0) {
          Taro.showToast({ title: '已提交购买意向', icon: 'success' });
          loadAppointments();
        } else {
          Taro.showToast({ title: res.message || '操作失败', icon: 'none' });
        }
      } else {
        Taro.showToast({ title: '已反馈', icon: 'success' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      confirmed: styles.statusConfirmed,
      completed: styles.statusCompleted
    };
    return map[status] || styles.statusPending;
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status] || status;
  };

  return (
    <View className={styles.page}>
      {!showList ? (
        <>
          {car && (
            <View className={styles.carInfo}>
              <Image className={styles.carImage} src={car.images[0]} mode='aspectFill' />
              <View className={styles.carDetail}>
                <Text className={styles.carTitle}>{car.title}</Text>
                <Text className={styles.carPrice}>{formatPrice(car.price)}</Text>
              </View>
            </View>
          )}

          <View className={styles.formCard}>
            <Text className={styles.sectionTitle}>📅 选择时间</Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>预约日期</Text>
              <Input
                className={styles.formInput}
                type='text'
                value={form.date}
                onInput={(e) => setForm(prev => ({ ...prev, date: e.detail.value }))}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>预约时段</Text>
              <View className={styles.timeOptions}>
                {timeSlots.map(time => (
                  <View
                    key={time}
                    className={classnames(styles.timeOption, form.time === time && styles.active)}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.formCard}>
            <Text className={styles.sectionTitle}>📍 看车地点</Text>
            <View className={styles.formItem}>
              <Input
                className={styles.formInput}
                value={form.location}
                onInput={(e) => setForm(prev => ({ ...prev, location: e.detail.value }))}
              />
            </View>
          </View>

          <View className={styles.formCard}>
            <Text className={styles.sectionTitle}>👤 联系方式</Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名</Text>
              <Input
                className={styles.formInput}
                value={form.name}
                onInput={(e) => setForm(prev => ({ ...prev, name: e.detail.value }))}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>手机号</Text>
              <Input
                className={styles.formInput}
                type='number'
                value={form.phone}
                onInput={(e) => setForm(prev => ({ ...prev, phone: e.detail.value }))}
              />
            </View>
          </View>
        </>
      ) : (
        <View className={styles.appointmentList}>
          {appointments.map(apt => (
            <View key={apt.id} className={styles.appointmentCard}>
              <View className={styles.appointmentHeader}>
                <Text className={styles.sectionTitle}>
                  <View style={{ fontSize: '28rpx' }}>🚗</View> 预约信息
                </Text>
                <View className={classnames(styles.statusTag, getStatusClass(apt.status))}>
                  {getStatusText(apt.status)}
                </View>
              </View>
              <Image
                style={{ width: '100%', height: '240rpx', borderRadius: '16rpx', marginBottom: '24rpx' }}
                src={apt.carImage}
                mode='aspectFill'
              />
              <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129', marginBottom: '16rpx' }}>
                {apt.carTitle}
              </Text>
              <View className={styles.appointmentInfo}>
                <Text>买家：{apt.buyerName}（{apt.buyerPhone}）</Text>
                <Text>时间：{formatDateTime(apt.time)}</Text>
                <Text>地点：{apt.location}</Text>
              </View>
              {apt.status === 'pending' && (
                <View style={{ display: 'flex', gap: '16rpx', marginTop: '24rpx' }}>
                  <Button
                    style={{
                      flex: 1, height: '80rpx', borderRadius: '48rpx',
                      background: '#F5F6F7', color: '#4E5969', fontSize: '28rpx'
                    }}
                    onClick={() => handleIntent(apt.id, false)}
                  >
                    拒绝
                  </Button>
                  <Button
                    style={{
                      flex: 1, height: '80rpx', borderRadius: '48rpx',
                      background: 'linear-gradient(135deg, #1E6FFF 0%, #4D8FFF 100%)',
                      color: '#fff', fontSize: '28rpx', fontWeight: 600
                    }}
                    onClick={() => handleConfirm(apt.id)}
                  >
                    确认预约
                  </Button>
                </View>
              )}
              {apt.status === 'confirmed' && (
                <View style={{ display: 'flex', gap: '16rpx', marginTop: '24rpx' }}>
                  <Button
                    style={{
                      flex: 1, height: '80rpx', borderRadius: '48rpx',
                      background: '#F5F6F7', color: '#4E5969', fontSize: '28rpx'
                    }}
                    onClick={() => handleIntent(apt.id, false)}
                  >
                    无意向
                  </Button>
                  <Button
                    style={{
                      flex: 1, height: '80rpx', borderRadius: '48rpx',
                      background: 'linear-gradient(135deg, #00B42A 0%, #23C343 100%)',
                      color: '#fff', fontSize: '28rpx', fontWeight: 600
                    }}
                    onClick={() => handleIntent(apt.id, true)}
                  >
                    有购买意向
                  </Button>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {!showList && (
        <View className={styles.bottomBar}>
          <Button className={styles.submitBtn} onClick={handleSubmit}>提交预约</Button>
        </View>
      )}
    </View>
  );
};

export default AppointmentPage;
