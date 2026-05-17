export const HISTORY_STORAGE_KEY = 'meetingPilotHistory';

export function loadHistoryMeetings() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? sortHistory(parsed) : [];
  } catch {
    return [];
  }
}

export function saveHistoryMeetings(historyMeetings) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sortHistory(historyMeetings)));
}

export function createHistorySnapshot({ meeting, records, report, todos }) {
  const archivedAt = new Date().toISOString();
  const unfinishedTodoCount = todos.filter((item) => item.status !== '已完成').length;
  const riskTodoCount = todos.filter((item) => item.status === '有风险' || hasMeaningfulRisk(item.risk)).length;
  const pendingQuestionCount = records.filter((item) => item.type === '待确认问题').length;

  return {
    id: `history-${Date.now()}`,
    archivedAt,
    meetingTitle: meeting.title || '未命名会议',
    meetingGoal: meeting.goal || '',
    meetingTime: meeting.time || '',
    participants: meeting.attendees ?? [],
    meetingBackground: meeting.background || '',
    discussionQuestions: meeting.questions ?? [],
    records,
    report,
    todos,
    unfinishedTodoCount,
    riskTodoCount,
    pendingQuestionCount
  };
}

export function sortHistory(historyMeetings) {
  return [...historyMeetings].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
}

function hasMeaningfulRisk(risk) {
  if (!risk) return false;
  return !['暂无', '无', 'none', 'n/a'].includes(String(risk).trim().toLowerCase());
}
