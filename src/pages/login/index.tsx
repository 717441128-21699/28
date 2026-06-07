import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUserStore } from '@/store/user';
import classnames from 'classnames';

const LoginPage: React.FC = () => {
  const { login, register, loading } = useUserStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    phone: '',
    code: '',
    nickname: '',
    password: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [focusField, setFocusField] = useState('');

  useEffect(() => {
    if (codeCountdown > 0) {
      const timer = setTimeout(() => setCodeCountdown(codeCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCountdown]);

  const handleSendCode = () => {
    if (!/^1\d{10}$/.test(form.phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    setCodeCountdown(60);
    Taro.showToast({ title: '验证码已发送', icon: 'success' });
  };

  const handleSubmit = async () => {
    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!form.code || form.code.length < 4) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }

    try {
      let success = false;
      if (mode === 'login') {
        success = await login(form.phone, form.code);
      } else {
        if (!form.nickname) {
          Taro.showToast({ title: '请输入昵称', icon: 'none' });
          return;
        }
        success = await register(form.phone, form.code, form.nickname);
      }
      if (success) {
        Taro.showToast({
          title: mode === 'login' ? '登录成功' : '注册成功',
          icon: 'success'
        });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 1000);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  const handleThirdParty = async (type: string) => {
    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: `${type}登录中...` });
    try {
      const success = await login('13800138000', '123456');
      Taro.hideLoading();
      if (success) {
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 1000);
      }
    } catch (e) {
      Taro.hideLoading();
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.logoSection}>
        <View className={styles.logo}>🚗</View>
        <Text className={styles.appName}>车易拍</Text>
        <Text className={styles.appSlogan}>专业二手车交易平台</Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.tabs}>
          <View
            className={classnames(styles.tabItem, mode === 'login' && styles.active)}
            onClick={() => setMode('login')}
          >
            登录
            {mode === 'login' && <View className={styles.tabIndicator} />}
          </View>
          <View
            className={classnames(styles.tabItem, mode === 'register' && styles.active)}
            onClick={() => setMode('register')}
          >
            注册
            {mode === 'register' && <View className={styles.tabIndicator} />}
          </View>
        </View>

        {mode === 'register' && (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>昵称</Text>
            <View className={classnames(styles.inputWrapper, focusField === 'nickname' && styles.focused)}>
              <Text className={styles.inputIcon}>👤</Text>
              <Input
                className={styles.formInput}
                placeholder='请输入昵称'
                value={form.nickname}
                onFocus={() => setFocusField('nickname')}
                onBlur={() => setFocusField('')}
                onInput={(e) => setForm(prev => ({ ...prev, nickname: e.detail.value }))}
              />
            </View>
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>手机号</Text>
          <View className={classnames(styles.inputWrapper, focusField === 'phone' && styles.focused)}>
            <Text className={styles.inputIcon}>📱</Text>
            <Input
              className={styles.formInput}
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={form.phone}
              onFocus={() => setFocusField('phone')}
              onBlur={() => setFocusField('')}
              onInput={(e) => setForm(prev => ({ ...prev, phone: e.detail.value }))}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>验证码</Text>
          <View className={classnames(styles.inputWrapper, focusField === 'code' && styles.focused)}>
            <Text className={styles.inputIcon}>🔐</Text>
            <Input
              className={styles.formInput}
              type='number'
              maxlength={6}
              placeholder='请输入验证码'
              value={form.code}
              onFocus={() => setFocusField('code')}
              onBlur={() => setFocusField('')}
              onInput={(e) => setForm(prev => ({ ...prev, code: e.detail.value }))}
            />
            <Button
              className={classnames(styles.codeBtn, codeCountdown > 0 && styles.disabled)}
              onClick={handleSendCode}
              disabled={codeCountdown > 0}
            >
              {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
            </Button>
          </View>
        </View>

        <View className={styles.agreementRow}>
          <View
            className={classnames(styles.checkbox, agreed && styles.checked)}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && '✓'}
          </View>
          <Text className={styles.agreementText}>
            我已阅读并同意
            <Text className={styles.link}> 《用户服务协议》</Text>
            和
            <Text className={styles.link}> 《隐私政策》</Text>
            ，知晓二手车交易相关风险
          </Text>
        </View>

        <Button
          className={classnames(styles.submitBtn, !agreed && styles.disabled)}
          onClick={handleSubmit}
          loading={loading}
        >
          {mode === 'login' ? '登录' : '注册并登录'}
        </Button>

        <View className={styles.divider}>
          <View className={styles.dividerLine} />
          <Text className={styles.dividerText}>其他登录方式</Text>
          <View className={styles.dividerLine} />
        </View>

        <View className={styles.thirdParty}>
          <View className={styles.thirdPartyItem} onClick={() => handleThirdParty('微信')}>
            💬
          </View>
          <View className={styles.thirdPartyItem} onClick={() => handleThirdParty('支付宝')}>
            💳
          </View>
          <View className={styles.thirdPartyItem} onClick={() => handleThirdParty('苹果')}>
            🍎
          </View>
        </View>
      </View>

      <Text className={styles.bottomText}>
        © 2026 车易拍 · 专业二手车交易平台
      </Text>
    </View>
  );
};

export default LoginPage;
