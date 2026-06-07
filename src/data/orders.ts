import { Order, Appointment, Loan, Insurance, Claim, Dispute, DashboardData, PredictionData } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'o001',
    carId: 'c003',
    carTitle: '2023款 奥迪A4L 40 TFSI 豪华动感型',
    carImage: 'https://picsum.photos/id/133/600/400',
    buyerId: 'u001',
    sellerId: 's003',
    deposit: 10000,
    totalPrice: 289000,
    commission: 5780,
    status: 'deposit_paid',
    appointmentTime: '2026-06-10 14:00:00',
    appointmentLocation: '广州市天河区车易拍线下服务中心',
    contractUrl: '',
    createTime: '2026-06-06 15:00:00',
    updateTime: '2026-06-06 15:20:00'
  },
  {
    id: 'o002',
    carId: 'c004',
    carTitle: '2020款 丰田凯美瑞 2.5G 豪华版',
    carImage: 'https://picsum.photos/id/164/600/400',
    buyerId: 'u002',
    sellerId: 'u001',
    deposit: 5000,
    totalPrice: 158000,
    commission: 3160,
    status: 'completed',
    appointmentTime: '2026-06-03 10:00:00',
    appointmentLocation: '深圳市南山区车易拍线下服务中心',
    contractUrl: '',
    createTime: '2026-06-01 09:00:00',
    updateTime: '2026-06-04 14:15:00'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a001',
    carId: 'c001',
    carTitle: '2022款 宝马3系 325Li M运动套装',
    carImage: 'https://picsum.photos/id/1071/600/400',
    buyerName: '车友小王',
    buyerPhone: '138****8888',
    sellerName: '李先生',
    time: '2026-06-08 14:00:00',
    location: '北京市朝阳区车易拍线下服务中心',
    status: 'confirmed',
    buyerIntent: true
  },
  {
    id: 'a002',
    carId: 'c003',
    carTitle: '2023款 奥迪A4L 40 TFSI 豪华动感型',
    carImage: 'https://picsum.photos/id/133/600/400',
    buyerName: '张先生',
    buyerPhone: '139****9999',
    sellerName: '车友小王',
    time: '2026-06-09 10:30:00',
    location: '广州市天河区车易拍线下服务中心',
    status: 'pending'
  }
];

export const mockLoans: Loan[] = [
  {
    id: 'l001',
    carId: 'c001',
    amount: 200000,
    downPayment: 68000,
    periods: 36,
    monthlyPayment: 5850,
    interestRate: 4.5,
    status: 'approved',
    applicationTime: '2026-05-15 10:00:00'
  }
];

export const mockInsurances: Insurance[] = [
  {
    id: 'i001',
    carId: 'c004',
    type: 'comprehensive',
    typeName: '综合险',
    premium: 4580,
    coverage: 1000000,
    duration: 12,
    status: 'active',
    effectiveDate: '2025-06-20',
    expireDate: '2026-06-20'
  }
];

export const mockClaims: Claim[] = [
  {
    id: 'cl001',
    insuranceId: 'i001',
    amount: 3500,
    description: '车辆追尾事故，车辆前部受损',
    evidence: [
      'https://picsum.photos/id/1071/600/400',
      'https://picsum.photos/id/1072/600/400'
    ],
    status: 'reviewing',
    createTime: '2026-06-02 10:00:00',
    reviewTime: '2026-06-02 14:30:00'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'd001',
    orderId: 'o002',
    initiatorId: 'u001',
    respondentId: 'u002',
    reason: '车辆实际里程与描述不符',
    evidence: [
      'https://picsum.photos/id/1071/600/400'
    ],
    status: 'reviewing',
    handler: '客服专员003',
    createTime: '2026-06-03 11:00:00'
  }
];

export const mockDashboard: DashboardData = {
  totalCars: 12856,
  dailyDeals: 156,
  dailyDealsTrend: [120, 135, 142, 128, 150, 145, 156],
  totalLoans: 2340,
  totalLoanAmount: 46800000,
  insurancePayoutRate: 3.2,
  csAverageTime: 45,
  brandStats: [
    { brand: '大众', count: 512, revenue: 6850000 },
    { brand: '丰田', count: 456, revenue: 7230000 },
    { brand: '宝马', count: 328, revenue: 9870000 },
    { brand: '本田', count: 389, revenue: 5670000 },
    { brand: '奔驰', count: 295, revenue: 8920000 }
  ],
  cityStats: [
    { city: '北京', count: 2340 },
    { city: '上海', count: 2180 },
    { city: '广州', count: 1890 },
    { city: '深圳', count: 1760 },
    { city: '杭州', count: 1230 }
  ]
};

export const mockPredictions: PredictionData = {
  hotModels: [
    { model: '特斯拉Model 3', trend: 15.6, score: 95 },
    { model: '比亚迪汉EV', trend: 12.3, score: 92 },
    { model: '宝马3系', trend: 8.7, score: 88 },
    { model: '丰田凯美瑞', trend: 6.2, score: 85 },
    { model: '奥迪A4L', trend: 5.8, score: 83 }
  ],
  priceTrend: [
    { month: '1月', price: 18.5 },
    { month: '2月', price: 18.2 },
    { month: '3月', price: 18.8 },
    { month: '4月', price: 19.2 },
    { month: '5月', price: 19.5 },
    { month: '6月', price: 19.8 }
  ]
};
