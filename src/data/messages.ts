import { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: 'm001',
    type: 'appointment',
    title: '预约确认通知',
    content: '您预约看车的【宝马3系 325Li】已被卖家确认，请准时到场看车。',
    time: '2026-06-07 10:30:00',
    isRead: false,
    relatedId: 'a001'
  },
  {
    id: 'm002',
    type: 'transaction',
    title: '定金支付成功',
    content: '您已成功支付车辆定金¥10,000，电子合同已生成，请查看详情。',
    time: '2026-06-06 15:20:00',
    isRead: false,
    relatedId: 'o001'
  },
  {
    id: 'm003',
    type: 'system',
    title: '会员升级提醒',
    content: '恭喜您！您已升级为金卡会员，享受更多专属权益。',
    time: '2026-06-05 09:00:00',
    isRead: true
  },
  {
    id: 'm004',
    type: 'transaction',
    title: '交易完成通知',
    content: '您的【丰田凯美瑞】交易已完成，尾款已结算至您的账户。',
    time: '2026-06-04 14:15:00',
    isRead: true,
    relatedId: 'o002'
  },
  {
    id: 'm005',
    type: 'dispute',
    title: '纠纷工单更新',
    content: '您发起的纠纷工单已进入客服审核阶段，请耐心等待处理结果。',
    time: '2026-06-03 11:45:00',
    isRead: true,
    relatedId: 'd001'
  },
  {
    id: 'm006',
    type: 'system',
    title: '车贷还款提醒',
    content: '您的车贷还款日为6月15日，请确保账户余额充足，还款金额¥3,850。',
    time: '2026-06-02 08:30:00',
    isRead: true,
    relatedId: 'l001'
  },
  {
    id: 'm007',
    type: 'system',
    title: '保险到期提醒',
    content: '您的车辆保险将于6月20日到期，请及时续保，避免影响出行。',
    time: '2026-06-01 16:00:00',
    isRead: true,
    relatedId: 'i001'
  },
  {
    id: 'm008',
    type: 'appointment',
    title: '新预约请求',
    content: '买家预约看您发布的【奥迪A4L】，请及时确认或拒绝。',
    time: '2026-05-31 13:20:00',
    isRead: true,
    relatedId: 'a002'
  }
];
