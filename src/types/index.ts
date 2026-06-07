// 车辆信息
export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice: number;
  mileage: number;
  images: string[];
  color: string;
  gearbox: string;
  displacement: string;
  fuelType: string;
  location: string;
  publishTime: string;
  condition: 'excellent' | 'good' | 'normal';
  inspectionReport: InspectionReport;
  seller: Seller;
  status: 'available' | 'reserved' | 'sold';
  tags: string[];
}

// 检测报告
export interface InspectionReport {
  overallScore: number;
  items: {
    name: string;
    status: 'normal' | 'warning' | 'abnormal';
    description: string;
  }[];
  reportUrl: string;
  inspector: string;
  inspectTime: string;
}

// 卖家信息
export interface Seller {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  dealCount: number;
}

// 品牌
export interface Brand {
  id: string;
  name: string;
  logo: string;
  count: number;
}

// 消息
export interface Message {
  id: string;
  type: 'system' | 'appointment' | 'transaction' | 'dispute';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  relatedId?: string;
}

// 订单/交易
export interface Order {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  buyerId: string;
  sellerId: string;
  deposit: number;
  totalPrice: number;
  commission: number;
  status: 'pending' | 'deposit_paid' | 'appointment' | 'inspected' | 'transfer' | 'completed' | 'cancelled';
  appointmentTime?: string;
  appointmentLocation?: string;
  contractUrl?: string;
  createTime: string;
  updateTime: string;
}

// 会员等级
export type VipLevel = 'normal' | 'silver' | 'gold' | 'diamond';

export interface VipInfo {
  level: VipLevel;
  levelName: string;
  currentExp: number;
  nextLevelExp: number;
  benefits: string[];
}

// 用户信息
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  creditScore: number;
  vip: VipInfo;
  totalDeals: number;
  totalSpent: number;
}

// 车贷
export interface Loan {
  id: string;
  carId: string;
  amount: number;
  downPayment: number;
  periods: number;
  monthlyPayment: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  applicationTime: string;
}

// 保险
export interface Insurance {
  id: string;
  carId: string;
  type: 'compulsory' | 'third_party' | 'comprehensive';
  typeName: string;
  premium: number;
  coverage: number;
  duration: number;
  status: 'active' | 'expired' | 'claiming';
  effectiveDate: string;
  expireDate: string;
}

// 理赔
export interface Claim {
  id: string;
  insuranceId: string;
  amount: number;
  description: string;
  evidence: string[];
  status: 'pending' | 'reviewing' | 'manual' | 'approved' | 'rejected' | 'paid';
  createTime: string;
  reviewTime?: string;
}

// 纠纷
export interface Dispute {
  id: string;
  orderId: string;
  initiatorId: string;
  respondentId: string;
  reason: string;
  evidence: string[];
  status: 'pending' | 'reviewing' | 'escalated' | 'resolved' | 'closed';
  handler?: string;
  createTime: string;
}

// 预约看车
export interface Appointment {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  buyerIntent?: boolean;
}

// 管理员看板数据
export interface DashboardData {
  totalCars: number;
  dailyDeals: number;
  dailyDealsTrend: number[];
  totalLoans: number;
  totalLoanAmount: number;
  insurancePayoutRate: number;
  csAverageTime: number;
  brandStats: { brand: string; count: number; revenue: number }[];
  cityStats: { city: string; count: number }[];
}

// 预测数据
export interface PredictionData {
  hotModels: { model: string; trend: number; score: number }[];
  priceTrend: { month: string; price: number }[];
}
