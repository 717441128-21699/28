import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { User, VipInfo } from '@/types';
import { userApi } from '@/utils/api';
import { setToken, clearToken } from '@/utils/request';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;

  login: (phone: string, code: string) => Promise<boolean>;
  register: (phone: string, code: string, nickname: string) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: !!Taro.getStorageSync('token'),
  loading: false,

  login: async (phone, code) => {
    set({ loading: true });
    try {
      const res = await userApi.login({ phone, code });
      if (res.code === 0 && res.data) {
        setToken(res.data.token);
        set({ user: res.data.user, isLoggedIn: true, loading: false });
        return true;
      }
      Taro.showToast({ title: res.message || '登录失败', icon: 'none' });
      set({ loading: false });
      return false;
    } catch (e) {
      set({ loading: false });
      return false;
    }
  },

  register: async (phone, code, nickname) => {
    set({ loading: true });
    try {
      const res = await userApi.register({ phone, code, nickname });
      if (res.code === 0 && res.data) {
        setToken(res.data.token);
        set({ user: res.data.user, isLoggedIn: true, loading: false });
        return true;
      }
      Taro.showToast({ title: res.message || '注册失败', icon: 'none' });
      set({ loading: false });
      return false;
    } catch (e) {
      set({ loading: false });
      return false;
    }
  },

  fetchProfile: async () => {
    if (!get().isLoggedIn) return;
    try {
      const res = await userApi.profile();
      if (res.code === 0 && res.data) {
        set({ user: res.data });
      }
    } catch (e) {}
  },

  logout: () => {
    clearToken();
    set({ user: null, isLoggedIn: false });
    Taro.showToast({ title: '已退出登录', icon: 'success' });
  },

  setUser: (user) => set({ user }),
}));
