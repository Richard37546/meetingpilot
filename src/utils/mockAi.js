const agenda = [
  '5 分钟：对齐会议目标与 V1 版本边界',
  '15 分钟：逐项确认进入 V1 的核心需求',
  '10 分钟：确认前后端排期与依赖关系',
  '10 分钟：明确测试验收标准和风险责任人',
  '5 分钟：同步行动项、负责人和截止时间'
];

export function generatePrepCard(meeting) {
  return {
    goal: meeting.goal,
    agenda,
    checklist: meeting.attendees.map((person) => `${person}：准备与自身角色相关的范围、依赖和风险说明`),
    questions: meeting.questions,
    risks: [
      '需求范围过大，导致 V1 无法按期交付',
      '实时语音转写是否进入 V1 尚未形成一致判断',
      '测试验收标准不清晰，可能拖慢上线',
      '行动项缺少负责人或截止时间，会议结论难以落地'
    ]
  };
}

export function generateReport(meeting, records, actions) {
  const decisions = records.filter((item) => item.type === '已确认决策').map((item) => item.content);
  const risks = records.filter((item) => item.type === '风险 / 阻塞').map((item) => item.content);
  const openQuestions = records.filter((item) => item.type === '待确认问题').map((item) => item.content);
  const riskyActions = actions.filter((item) => item.status === '有风险');

  return {
    summary: `${meeting.title} 已围绕 V1 范围、AI 能力边界、排期和验收标准完成核心讨论。当前方向是先做轻量级 AI 会议助手闭环，不做真实视频通话和实时转写。`,
    conclusions: [
      'V1 聚焦会前准备、会中结构化记录、会议纪要和待办跟进',
      'AI 能力以模拟生成逻辑呈现工作流，先验证产品价值',
      '待办跟进看板作为会后执行闭环的核心承载'
    ],
    decisions: decisions.length ? decisions : ['实时语音转写暂不进入 V1'],
    risks: risks.length ? risks : ['尚未发现明确阻塞，但需要持续跟踪行动项完成度'],
    actionItems: actions.map((item) => `${item.task}｜${item.owner}｜${item.due}｜${item.status}`),
    nextSteps: [
      '下次会议优先检查高优先级行动项完成情况',
      '集中处理仍未确认的问题和有风险任务',
      riskyActions.length ? `重点跟进 ${riskyActions.map((item) => item.owner).join('、')} 的风险任务` : '保持当前节奏，避免新增范围',
      openQuestions.length ? `补充确认：${openQuestions.join('；')}` : '没有新的待确认问题'
    ]
  };
}

export function generateNextMeetingFocus(records, actions) {
  const unfinished = actions.filter((item) => item.status !== '已完成');
  const risky = actions.filter((item) => item.status === '有风险');
  const openQuestions = records.filter((item) => item.type === '待确认问题');

  return [
    `复盘 ${unfinished.length} 个未完成待办事项的进展和阻塞`,
    risky.length ? `优先处理 ${risky.length} 个有风险任务，明确新的负责人或截止时间` : '确认当前任务是否仍按计划推进',
    openQuestions.length ? `关闭 ${openQuestions.length} 个待确认问题，避免影响交付判断` : '检查是否有新的待确认事项',
    '判断是否需要调整 V1 范围，防止会议结论失焦'
  ];
}
