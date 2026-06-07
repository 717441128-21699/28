import Taro from '@tarojs/taro';

const BASE_URL = process.env.TARO_ENV === 'h5' ? '/api' : 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

function getToken(): string {
  return Taro.getStorageSync('token') || '';
}

export function setToken(token: string) {
  Taro.setStorageSync('token', token);
}

export function clearToken() {
  Taro.removeStorageSync('token');
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeysToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeysToCamel);
  if (typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[toCamelCase(key)] = convertKeysToCamel(obj[key]);
  }
  return result;
}

async function request<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  options: { needAuth?: boolean; showLoading?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { needAuth = true, showLoading = false } = options;
  const token = getToken();

  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true });
  }

  try {
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (needAuth && token) {
      header.Authorization = `Bearer ${token}`;
    }

    const res = await Taro.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      timeout: 15000,
    });

    if (showLoading) Taro.hideLoading();

    const result = res.data as ApiResponse<T>;
    if (result.code === 0 && result.data) {
      result.data = convertKeysToCamel(result.data) as T;
    }
    if (result.code === 401) {
      clearToken();
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1000);
    }
    return result;
  } catch (err: any) {
    if (showLoading) Taro.hideLoading();
    Taro.showToast({ title: err.errMsg || '网络错误', icon: 'none' });
    return { code: -1, message: err.errMsg || '网络错误', data: null as any };
  }
}

export const http = {
  get: <T = any>(url: string, data?: any, options?: any) =>
    request<T>(url, 'GET', data, options),
  post: <T = any>(url: string, data?: any, options?: any) =>
    request<T>(url, 'POST', data, options),
  put: <T = any>(url: string, data?: any, options?: any) =>
    request<T>(url, 'PUT', data, options),
  del: <T = any>(url: string, data?: any, options?: any) =>
    request<T>(url, 'DELETE', data, options),
};
