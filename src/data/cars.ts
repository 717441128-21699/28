import { Car, Brand } from '@/types';

export const mockCars: Car[] = [
  {
    id: 'c001',
    title: '2022款 宝马3系 325Li M运动套装',
    brand: '宝马',
    model: '3系',
    year: 2022,
    price: 268000,
    originalPrice: 358900,
    mileage: 32000,
    images: [
      'https://picsum.photos/id/1071/600/400',
      'https://picsum.photos/id/1072/600/400',
      'https://picsum.photos/id/1073/600/400'
    ],
    color: '矿石白',
    gearbox: '自动',
    displacement: '2.0T',
    fuelType: '汽油',
    location: '北京',
    publishTime: '2026-06-01 10:30:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 95,
      items: [
        { name: '外观', status: 'normal', description: '无明显划痕' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '张工',
      inspectTime: '2026-05-30'
    },
    seller: {
      id: 's001',
      name: '李先生',
      avatar: 'https://picsum.photos/id/91/100/100',
      phone: '13900139000',
      rating: 4.9,
      dealCount: 15
    },
    status: 'available',
    tags: ['准新车', '首付低', '可分期']
  },
  {
    id: 'c002',
    title: '2021款 奔驰C级 C200L 运动版',
    brand: '奔驰',
    model: 'C级',
    year: 2021,
    price: 245000,
    originalPrice: 339800,
    mileage: 45000,
    images: [
      'https://picsum.photos/id/111/600/400',
      'https://picsum.photos/id/112/600/400'
    ],
    color: '北极白',
    gearbox: '自动',
    displacement: '1.5T',
    fuelType: '汽油',
    location: '上海',
    publishTime: '2026-06-03 14:20:00',
    condition: 'good',
    inspectionReport: {
      overallScore: 88,
      items: [
        { name: '外观', status: 'warning', description: '前保险杠有小划痕' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '王工',
      inspectTime: '2026-06-02'
    },
    seller: {
      id: 's002',
      name: '王女士',
      avatar: 'https://picsum.photos/id/177/100/100',
      phone: '13800138000',
      rating: 4.8,
      dealCount: 8
    },
    status: 'available',
    tags: ['低里程', '可议价', '急售']
  },
  {
    id: 'c003',
    title: '2023款 奥迪A4L 40 TFSI 豪华动感型',
    brand: '奥迪',
    model: 'A4L',
    year: 2023,
    price: 289000,
    originalPrice: 368800,
    mileage: 15000,
    images: [
      'https://picsum.photos/id/133/600/400',
      'https://picsum.photos/id/135/600/400'
    ],
    color: '天云灰',
    gearbox: '自动',
    displacement: '2.0T',
    fuelType: '汽油',
    location: '广州',
    publishTime: '2026-06-05 09:15:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 97,
      items: [
        { name: '外观', status: 'normal', description: '原厂漆' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '李工',
      inspectTime: '2026-06-04'
    },
    seller: {
      id: 's003',
      name: '张先生',
      avatar: 'https://picsum.photos/id/338/100/100',
      phone: '13700137000',
      rating: 5.0,
      dealCount: 22
    },
    status: 'available',
    tags: ['准新车', '精品车况', '可分期']
  },
  {
    id: 'c004',
    title: '2020款 丰田凯美瑞 2.5G 豪华版',
    brand: '丰田',
    model: '凯美瑞',
    year: 2020,
    price: 158000,
    originalPrice: 219800,
    mileage: 68000,
    images: [
      'https://picsum.photos/id/164/600/400',
      'https://picsum.photos/id/169/600/400'
    ],
    color: '珍珠白',
    gearbox: '自动',
    displacement: '2.5L',
    fuelType: '汽油',
    location: '深圳',
    publishTime: '2026-06-02 16:45:00',
    condition: 'good',
    inspectionReport: {
      overallScore: 85,
      items: [
        { name: '外观', status: 'normal', description: '轻微使用痕迹' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'warning', description: '刹车片磨损' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '赵工',
      inspectTime: '2026-06-01'
    },
    seller: {
      id: 's004',
      name: '刘先生',
      avatar: 'https://picsum.photos/id/1027/100/100',
      phone: '13600136000',
      rating: 4.7,
      dealCount: 12
    },
    status: 'available',
    tags: ['保值', '省油', '家用首选']
  },
  {
    id: 'c005',
    title: '2022款 本田雅阁 锐·混动 2.0L 锐领版',
    brand: '本田',
    model: '雅阁',
    year: 2022,
    price: 178000,
    originalPrice: 239800,
    mileage: 28000,
    images: [
      'https://picsum.photos/id/180/600/400',
      'https://picsum.photos/id/183/600/400'
    ],
    color: '星空蓝',
    gearbox: '自动',
    displacement: '2.0L混动',
    fuelType: '混动',
    location: '杭州',
    publishTime: '2026-06-04 11:00:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 92,
      items: [
        { name: '外观', status: 'normal', description: '无明显划痕' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '陈工',
      inspectTime: '2026-06-03'
    },
    seller: {
      id: 's005',
      name: '陈女士',
      avatar: 'https://picsum.photos/id/1011/100/100',
      phone: '13500135000',
      rating: 4.9,
      dealCount: 18
    },
    status: 'reserved',
    tags: ['混动省油', '准新车']
  },
  {
    id: 'c006',
    title: '2019款 大众迈腾 330TSI DSG 豪华型',
    brand: '大众',
    model: '迈腾',
    year: 2019,
    price: 128000,
    originalPrice: 234900,
    mileage: 85000,
    images: [
      'https://picsum.photos/id/196/600/400',
      'https://picsum.photos/id/197/600/400'
    ],
    color: '幻影黑',
    gearbox: '自动',
    displacement: '2.0T',
    fuelType: '汽油',
    location: '成都',
    publishTime: '2026-05-28 15:30:00',
    condition: 'good',
    inspectionReport: {
      overallScore: 82,
      items: [
        { name: '外观', status: 'warning', description: '左后门有补漆' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '孙工',
      inspectTime: '2026-05-27'
    },
    seller: {
      id: 's006',
      name: '孙先生',
      avatar: 'https://picsum.photos/id/1012/100/100',
      phone: '13400134000',
      rating: 4.6,
      dealCount: 6
    },
    status: 'available',
    tags: ['商务首选', '可议价']
  },
  {
    id: 'c007',
    title: '2023款 特斯拉Model 3 后轮驱动版',
    brand: '特斯拉',
    model: 'Model 3',
    year: 2023,
    price: 198000,
    originalPrice: 261400,
    mileage: 12000,
    images: [
      'https://picsum.photos/id/201/600/400',
      'https://picsum.photos/id/219/600/400'
    ],
    color: '珍珠白',
    gearbox: '单速变速箱',
    displacement: '纯电动',
    fuelType: '纯电',
    location: '南京',
    publishTime: '2026-06-06 08:00:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 96,
      items: [
        { name: '外观', status: 'normal', description: '原厂漆' },
        { name: '电池', status: 'normal', description: '电池健康95%' },
        { name: '电机', status: 'normal', description: '运行正常' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '智能系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '周工',
      inspectTime: '2026-06-05'
    },
    seller: {
      id: 's007',
      name: '周先生',
      avatar: 'https://picsum.photos/id/1025/100/100',
      phone: '13300133000',
      rating: 4.9,
      dealCount: 9
    },
    status: 'available',
    tags: ['新能源', '准新车', '智能驾驶']
  },
  {
    id: 'c008',
    title: '2021款 比亚迪汉EV 超长续航版尊贵型',
    brand: '比亚迪',
    model: '汉EV',
    year: 2021,
    price: 168000,
    originalPrice: 255800,
    mileage: 38000,
    images: [
      'https://picsum.photos/id/225/600/400',
      'https://picsum.photos/id/237/600/400'
    ],
    color: '赤帝红',
    gearbox: '单速变速箱',
    displacement: '纯电动',
    fuelType: '纯电',
    location: '武汉',
    publishTime: '2026-06-03 10:30:00',
    condition: 'good',
    inspectionReport: {
      overallScore: 90,
      items: [
        { name: '外观', status: 'normal', description: '无明显划痕' },
        { name: '电池', status: 'normal', description: '电池健康92%' },
        { name: '电机', status: 'normal', description: '运行正常' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '智能系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '吴工',
      inspectTime: '2026-06-02'
    },
    seller: {
      id: 's008',
      name: '吴女士',
      avatar: 'https://picsum.photos/id/1062/100/100',
      phone: '13200132000',
      rating: 4.8,
      dealCount: 14
    },
    status: 'available',
    tags: ['新能源', '长续航', '国货之光']
  },
  {
    id: 'c009',
    title: '2022款 别克GL8 ES陆尊 653T 舒适型',
    brand: '别克',
    model: 'GL8',
    year: 2022,
    price: 328000,
    originalPrice: 413900,
    mileage: 22000,
    images: [
      'https://picsum.photos/id/250/600/400',
      'https://picsum.photos/id/292/600/400'
    ],
    color: '香槟金',
    gearbox: '自动',
    displacement: '2.0T',
    fuelType: '汽油',
    location: '天津',
    publishTime: '2026-06-05 14:10:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 94,
      items: [
        { name: '外观', status: 'normal', description: '无明显划痕' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '郑工',
      inspectTime: '2026-06-04'
    },
    seller: {
      id: 's009',
      name: '郑先生',
      avatar: 'https://picsum.photos/id/1074/100/100',
      phone: '13100131000',
      rating: 4.9,
      dealCount: 20
    },
    status: 'available',
    tags: ['商务车', '准新车', '七座']
  },
  {
    id: 'c010',
    title: '2020款 雷克萨斯ES 200 卓越版',
    brand: '雷克萨斯',
    model: 'ES',
    year: 2020,
    price: 238000,
    originalPrice: 298000,
    mileage: 52000,
    images: [
      'https://picsum.photos/id/312/600/400',
      'https://picsum.photos/id/326/600/400'
    ],
    color: '超音速钛银',
    gearbox: '自动',
    displacement: '2.0L',
    fuelType: '汽油',
    location: '厦门',
    publishTime: '2026-06-01 17:45:00',
    condition: 'excellent',
    inspectionReport: {
      overallScore: 93,
      items: [
        { name: '外观', status: 'normal', description: '原厂漆' },
        { name: '发动机', status: 'normal', description: '运行正常' },
        { name: '变速箱', status: 'normal', description: '换挡顺畅' },
        { name: '底盘', status: 'normal', description: '无损伤' },
        { name: '电器系统', status: 'normal', description: '功能正常' }
      ],
      reportUrl: '',
      inspector: '冯工',
      inspectTime: '2026-05-31'
    },
    seller: {
      id: 's010',
      name: '冯先生',
      avatar: 'https://picsum.photos/id/1080/100/100',
      phone: '13000130000',
      rating: 5.0,
      dealCount: 11
    },
    status: 'available',
    tags: ['豪华品牌', '精品车况']
  }
];

export const mockBrands: Brand[] = [
  { id: 'b001', name: '宝马', logo: '', count: 328 },
  { id: 'b002', name: '奔驰', logo: '', count: 295 },
  { id: 'b003', name: '奥迪', logo: '', count: 267 },
  { id: 'b004', name: '丰田', logo: '', count: 456 },
  { id: 'b005', name: '本田', logo: '', count: 389 },
  { id: 'b006', name: '大众', logo: '', count: 512 },
  { id: 'b007', name: '特斯拉', logo: '', count: 178 },
  { id: 'b008', name: '比亚迪', logo: '', count: 234 },
  { id: 'b009', name: '别克', logo: '', count: 156 },
  { id: 'b010', name: '雷克萨斯', logo: '', count: 123 },
  { id: 'b011', name: '日产', logo: '', count: 289 },
  { id: 'b012', name: '更多', logo: '', count: 0 }
];
