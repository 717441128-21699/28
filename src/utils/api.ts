import { http } from '@/utils/request';
import { Car, User, Message, Appointment, Order, Loan, Insurance, Claim, Dispute, Brand } from '@/types';

export interface LoginData {
  phone: string;
  code: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export const userApi = {
  register: (data: LoginData & { nickname: string }) =>
    http.post<LoginResult>('/users/register', data, { needAuth: false }),
  login: (data: LoginData) =>
    http.post<LoginResult>('/users/login', data, { needAuth: false }),
  profile: () => http.get<User>('/users/profile'),
  updateProfile: (data: Partial<User>) => http.put<User>('/users/profile', data),
  messages: (type?: string) =>
    http.get<{ list: Message[]; unread: number }>('/users/messages', type ? { type } : {}),
  readMessage: (id: string) => http.post(`/users/messages/${id}/read`),
  readAllMessages: () => http.post('/users/messages/read-all'),
};

export const carApi = {
  valuation: (data: { brand: string; model: string; year: number; mileage: number }) =>
    http.post<{ minPrice: number; maxPrice: number; avgPrice: number; sameModelCount: number; dealRate: number; suggestion: string }>('/cars/valuation', data, { needAuth: false }),
  publish: (data: any) => http.post<Car>('/cars', data),
  list: (params?: { brand?: string; minPrice?: number; maxPrice?: number; keyword?: string; page?: number; pageSize?: number }) =>
    http.get<{ list: Car[]; total: number; page: number; pageSize: number }>('/cars', params, { needAuth: false }),
  recommend: () => http.get<Car[]>('/cars/recommend', {}, { needAuth: false }),
  brands: () => http.get<Brand[]>('/cars/brands', {}, { needAuth: false }),
  detail: (id: string) => http.get<Car & { seller: any; report: any }>(`/cars/${id}`, {}, { needAuth: false }),
  mine: () => http.get<Car[]>('/cars/user/mine'),
};

export const transactionApi = {
  createAppointment: (data: { carId: string; time: string; location: string }) =>
    http.post<Appointment>('/transactions', data),
  appointments: (role: 'buyer' | 'seller') =>
    http.get<Appointment[]>('/transactions', { role }),
  confirmAppointment: (id: string, confirm: boolean) =>
    http.post(`/transactions/${id}/confirm`, { confirm }),
  buyerIntent: (id: string) => http.post(`/transactions/${id}/intent`),
  createOrder: (data: { carId: string; appointmentId?: string; deposit: number }) =>
    http.post<Order>('/transactions/order', data),
  orders: (role: 'buyer' | 'seller') =>
    http.get<Order[]>('/transactions/orders', { role }),
  orderDetail: (id: string) => http.get<Order>(`/transactions/orders/${id}`),
  signContract: (id: string) => http.post(`/transactions/orders/${id}/sign`),
  confirmTransfer: (data: { orderId: string; buyerConfirmed: boolean; sellerConfirmed: boolean }) =>
    http.post('/transactions/transfer/confirm', data),
};

export const financeApi = {
  applyLoan: (data: { carId?: string; amount: number; downPayment: number; periods: number }) =>
    http.post<Loan>('/finance/loans', data),
  loans: () => http.get<Loan[]>('/finance/loans'),
  buyInsurance: (data: { carId?: string; plans: Array<{ type: string; typeName: string; premium: number; coverage: number }> }) =>
    http.post<Insurance[]>('/finance/insurances', data),
  insurances: () => http.get<Insurance[]>('/finance/insurances'),
  fileClaim: (data: { insuranceId: string; amount: number; description: string; evidence?: string[] }) =>
    http.post<Claim>('/finance/claims', data),
  claims: () => http.get<Claim[]>('/finance/claims'),
};

export const disputeApi = {
  create: (data: { orderId: string; reason: string; evidence?: string[] }) =>
    http.post<Dispute>('/disputes', data),
  list: (status?: string) =>
    http.get<Dispute[]>('/disputes', status ? { status } : {}),
  addEvidence: (id: string, evidence: string[]) =>
    http.post(`/disputes/${id}/evidence`, { evidence }),
};

export const adminApi = {
  dashboard: () => http.get<any>('/admin/dashboard'),
  report: (month?: string) => http.get<any>('/admin/report', month ? { month } : {}),
  pendingDisputes: () => http.get<Dispute[]>('/admin/pending-disputes'),
  resolveDispute: (id: string, result: string, handlerNote: string) =>
    http.post(`/admin/disputes/${id}/resolve`, { result, handlerNote }),
  escalateDispute: (id: string) => http.post(`/admin/disputes/${id}/escalate`),
};
