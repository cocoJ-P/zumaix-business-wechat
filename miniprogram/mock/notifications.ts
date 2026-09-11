import type { SmartNotification } from '../types/index'

export const mockNotifications: SmartNotification[] = [
  {
    id: 'note-01',
    kind: '政策',
    content: '你正在关注的科技型企业研发创新支持专项延期至 10 月 20 日',
    timeLabel: '2小时前',
    unread: true,
  },
  {
    id: 'note-02',
    kind: '场景',
    content: '发现一个与你当前“寻找真实场景”目标高度相关的新机会',
    timeLabel: '今天 09:12',
    unread: true,
  },
  {
    id: 'note-03',
    kind: '创赛',
    content: '产业创新应用大赛已公布初审结果',
    timeLabel: '昨天',
    unread: false,
  },
]
