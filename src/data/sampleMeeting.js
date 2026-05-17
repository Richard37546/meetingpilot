export const sampleMeeting = {
  id: 'meeting-v1-review',
  title: '产品 V1 需求评审会',
  status: '会中推进中',
  stage: '会前准备 · 会中记录 · 会议纪要 · 待办跟进',
  goal: '确认 V1 版本核心功能、负责人和上线排期',
  time: '周三 15:00',
  attendees: ['产品经理', '设计师', '前端', '后端', '测试'],
  background: '当前需求池较多，需要确定第一批上线范围',
  questions: [
    '哪些需求进入 V1？',
    '是否接入实时语音转写？',
    '前后端排期是否可行？',
    '测试验收标准如何确定？'
  ],
  meetings: [
    { id: 'm1', title: '产品 V1 需求评审会', status: '进行中', health: 78 },
    { id: 'm2', title: '增长实验复盘会', status: '待准备', health: 64 },
    { id: 'm3', title: '设计走查同步会', status: '待跟进', health: 72 }
  ]
};

export const initialRecords = [
  { id: 1, type: '关键讨论', content: 'V1 优先覆盖会前准备清单、会议纪要与待办跟进看板，视频通话能力不进入当前版本。' },
  { id: 2, type: '已确认决策', content: '实时语音转写暂不接入，先使用结构化手动记录与模拟 AI 生成。' },
  { id: 3, type: '风险 / 阻塞', content: '行动项负责人和截止时间如果没有强约束，会后执行闭环容易断掉。' },
  { id: 4, type: '待确认问题', content: '测试验收标准需要在会后补充完整场景。' }
];

export const initialActions = [
  {
    id: 1,
    task: '梳理 V1 核心功能范围并冻结需求',
    owner: '产品经理',
    due: '周三 18:00',
    priority: '高',
    status: '进行中',
    risk: '范围继续膨胀会影响上线排期'
  },
  {
    id: 2,
    task: '完成会前准备清单与会议纪要页面视觉稿',
    owner: '设计师',
    due: '周四 12:00',
    priority: '中',
    status: '待开始',
    risk: '需要尽早确认信息层级'
  },
  {
    id: 3,
    task: '实现行动项看板状态流转',
    owner: '前端',
    due: '周五 20:00',
    priority: '高',
    status: '进行中',
    risk: '状态切换需要保持交互清晰'
  },
  {
    id: 4,
    task: '补充验收标准和冒烟测试清单',
    owner: '测试',
    due: '下周一 10:00',
    priority: '高',
    status: '有风险',
    risk: '验收口径尚未完全统一'
  }
];
