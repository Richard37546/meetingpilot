import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import GuidePage from './components/GuidePage.jsx';
import HistoryPage from './components/HistoryPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import MeetingSidebar from './components/MeetingSidebar.jsx';
import MeetingWorkspace from './components/MeetingWorkspace.jsx';
import AiAssistantPanel from './components/AiAssistantPanel.jsx';
import ActionBoard from './components/ActionBoard.jsx';
import EditMeetingModal from './components/EditMeetingModal.jsx';
import { initialActions, initialRecords, sampleMeeting } from './data/sampleMeeting.js';
import { createHistorySnapshot, loadHistoryMeetings, saveHistoryMeetings, sortHistory } from './utils/history.js';
import { generatePrepCard, generateReport } from './utils/mockAi.js';

const LEGACY_STORAGE_KEY = 'meetingpilot-demo-state';
const MEETINGS_STORAGE_KEY = 'meetingPilotMeetings';
const ACTIVE_MEETING_STORAGE_KEY = 'meetingPilotActiveMeetingId';
const DEFAULT_MEETING_LIST_ID = sampleMeeting.meetings[0]?.id ?? sampleMeeting.id;

const workflowStages = {
  1: 'Step 1 会前准备',
  2: 'Step 2 会中记录',
  3: 'Step 3 会议纪要',
  4: 'Step 4 待办跟进'
};

function toIsoNow() {
  return new Date().toISOString();
}

function normalizeTextList(items = []) {
  return Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : [];
}

function normalizeMeeting(meeting, fallback = {}) {
  const now = toIsoNow();
  const attendees = normalizeTextList(meeting.attendees ?? meeting.participants ?? fallback.attendees);
  const questions = normalizeTextList(meeting.questions ?? meeting.discussionQuestions ?? fallback.questions);

  return {
    id: meeting.id ?? fallback.id ?? `meeting-${Date.now()}`,
    title: meeting.title ?? fallback.title ?? '未命名会议',
    goal: meeting.goal ?? fallback.goal ?? '',
    attendees,
    participants: attendees,
    background: meeting.background ?? fallback.background ?? '',
    questions,
    discussionQuestions: questions,
    time: meeting.time ?? fallback.time ?? '',
    status: meeting.status ?? fallback.status ?? '待准备',
    phase: meeting.phase ?? fallback.phase ?? 1,
    stage: meeting.stage ?? fallback.stage ?? '会前准备 · 会中记录 · 会议纪要 · 待办跟进',
    health: meeting.health ?? fallback.health ?? 60,
    prepChecklist: meeting.prepChecklist ?? meeting.prepCard ?? fallback.prepChecklist ?? null,
    records: Array.isArray(meeting.records) ? meeting.records : fallback.records ?? [],
    report: meeting.report ?? fallback.report ?? null,
    todos: Array.isArray(meeting.todos) ? meeting.todos : fallback.todos ?? [],
    createdAt: meeting.createdAt ?? fallback.createdAt ?? now,
    updatedAt: meeting.updatedAt ?? fallback.updatedAt ?? now
  };
}

function createDefaultMeetings() {
  const now = toIsoNow();
  return [
    normalizeMeeting(
      {
        ...sampleMeeting,
        id: DEFAULT_MEETING_LIST_ID,
        status: sampleMeeting.meetings[0]?.status ?? sampleMeeting.status,
        health: sampleMeeting.meetings[0]?.health ?? 78,
        records: initialRecords,
        todos: initialActions,
        prepChecklist: null,
        report: null,
        createdAt: now,
        updatedAt: now
      }
    ),
    normalizeMeeting({
      id: 'm2',
      title: '增长实验复盘会',
      goal: '复盘本轮增长实验效果，确认下一轮实验方向',
      attendees: ['增长负责人', '产品经理', '数据分析', '运营'],
      background: '本轮落地页实验已经运行一周，需要判断是否继续扩大流量。',
      questions: ['核心转化率是否达标？', '哪些渠道贡献最高？', '下一轮实验变量是什么？'],
      time: '周四 10:00',
      status: '待准备',
      health: 64,
      records: [],
      todos: [],
      prepChecklist: null,
      report: null,
      createdAt: now,
      updatedAt: now
    }),
    normalizeMeeting({
      id: 'm3',
      title: '设计走查同步会',
      goal: '确认关键页面走查问题和修复优先级',
      attendees: ['设计师', '前端', '产品经理'],
      background: '核心工作台页面进入联调前，需要统一视觉和交互验收口径。',
      questions: ['信息层级是否清晰？', '移动端是否存在遮挡？', '哪些问题必须本周修复？'],
      time: '周五 16:00',
      status: '待跟进',
      health: 72,
      records: [],
      todos: [],
      prepChecklist: null,
      report: null,
      createdAt: now,
      updatedAt: now
    })
  ];
}

function loadLegacyState() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.version ? parsed : null;
  } catch {
    return null;
  }
}

function loadMeetingsState() {
  try {
    const rawMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
    const parsedMeetings = rawMeetings ? JSON.parse(rawMeetings) : null;
    if (Array.isArray(parsedMeetings) && parsedMeetings.length) {
      const meetings = parsedMeetings.map((item) => normalizeMeeting(item));
      const savedActiveId = localStorage.getItem(ACTIVE_MEETING_STORAGE_KEY);
      const activeMeetingId = meetings.some((item) => item.id === savedActiveId) ? savedActiveId : meetings[0].id;
      return { meetings, activeMeetingId };
    }
  } catch {
    // 新版会议列表读取失败时尝试旧版数据或默认示例。
  }

  const legacyState = loadLegacyState();
  if (legacyState?.meeting) {
    const migratedMeeting = normalizeMeeting({
      ...legacyState.meeting,
      id: legacyState.meeting.meetings?.[0]?.id ?? legacyState.meeting.id ?? DEFAULT_MEETING_LIST_ID,
      status: legacyState.meeting.meetings?.[0]?.status ?? legacyState.meeting.status,
      health: legacyState.meeting.meetings?.[0]?.health ?? 78,
      records: legacyState.records ?? initialRecords,
      todos: legacyState.actions ?? initialActions,
      prepChecklist: legacyState.prepCard ?? null,
      report: legacyState.report ?? null
    });
    const extraMeetings = (legacyState.meeting.meetings ?? [])
      .slice(1)
      .map((item) => normalizeMeeting(item));
    const meetings = [migratedMeeting, ...extraMeetings];
    return { meetings, activeMeetingId: migratedMeeting.id };
  }

  const meetings = createDefaultMeetings();
  return { meetings, activeMeetingId: meetings[0].id };
}

function buildMeetingSummaries(meetings) {
  return meetings.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    health: item.health
  }));
}

function createMeetingFromDraft(draft) {
  const now = toIsoNow();
  const id = `meeting-${Date.now()}`;
  return normalizeMeeting({
    id,
    ...draft,
    status: '待准备',
    phase: 1,
    health: 60,
    prepChecklist: null,
    records: [],
    report: null,
    todos: [],
    createdAt: now,
    updatedAt: now
  });
}

export default function App() {
  const savedState = useMemo(() => loadMeetingsState(), []);
  const savedHistory = useMemo(() => loadHistoryMeetings(), []);
  const [activePage, setActivePage] = useState('home');
  const [meetings, setMeetings] = useState(savedState.meetings);
  const [activeMeetingId, setActiveMeetingId] = useState(savedState.activeMeetingId);
  const [historyMeetings, setHistoryMeetings] = useState(savedHistory);
  const [selectedStep, setSelectedStep] = useState(null);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);

  const activeMeeting = useMemo(() => {
    return meetings.find((item) => item.id === activeMeetingId) ?? meetings[0] ?? createDefaultMeetings()[0];
  }, [activeMeetingId, meetings]);

  const meeting = useMemo(() => {
    return { ...activeMeeting, meetings: buildMeetingSummaries(meetings) };
  }, [activeMeeting, meetings]);

  const records = activeMeeting.records ?? [];
  const actions = activeMeeting.todos ?? [];
  const prepCard = activeMeeting.prepChecklist ?? null;
  const report = activeMeeting.report ?? null;

  useEffect(() => {
    try {
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
      localStorage.setItem(ACTIVE_MEETING_STORAGE_KEY, activeMeeting.id);
    } catch {
      // localStorage 不可用时仍允许页面正常使用，只是不持久化会议列表。
    }
  }, [activeMeeting.id, meetings]);

  useEffect(() => {
    try {
      saveHistoryMeetings(historyMeetings);
    } catch {
      // 历史记录保存失败时不影响当前会议继续编辑。
    }
  }, [historyMeetings]);

  const stats = useMemo(() => {
    const unfinished = actions.filter((item) => item.status !== '已完成').length;
    const risky = actions.filter((item) => item.status === '有风险').length;
    const openQuestions = records.filter((item) => item.type === '待确认问题').length;
    const riskLevel = risky > 1 || openQuestions > 2 ? '高' : risky || openQuestions ? '中' : '低';

    return { unfinished, risky, openQuestions, riskLevel };
  }, [actions, records]);

  const currentStep = useMemo(() => {
    if (!prepCard) return 1;
    if (!records.length) return 2;
    if (!report) return 3;
    return 4;
  }, [prepCard, records.length, report]);

  const currentStageLabel = workflowStages[currentStep];

  const primaryAction = useMemo(() => {
    if (!prepCard) {
      return { label: '生成会前准备清单', target: 'prep-section', action: 'prep' };
    }
    if (!records.length) {
      return { label: '继续记录会议', target: 'records-section', action: 'scroll' };
    }
    if (!report) {
      return { label: '生成会议纪要', target: 'report-section', action: 'report' };
    }
    return { label: '查看待办跟进', target: 'action-board', action: 'scroll' };
  }, [prepCard, records.length, report]);

  const visibleStep = selectedStep ?? currentStep;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateActiveMeeting = (updater) => {
    setMeetings((current) =>
      current.map((item) => {
        if (item.id !== activeMeeting.id) return item;
        const nextMeeting = typeof updater === 'function' ? updater(item) : { ...item, ...updater };
        return normalizeMeeting({ ...nextMeeting, updatedAt: toIsoNow() }, item);
      })
    );
  };

  const handleSelectMeeting = (id) => {
    setActiveMeetingId(id);
    setSelectedStep(null);
  };

  const handleStepSelect = (step, target) => {
    setSelectedStep(step);
    window.setTimeout(() => scrollToSection(target), 0);
  };

  const handleGeneratePrep = () => {
    updateActiveMeeting({ prepChecklist: generatePrepCard(meeting), status: '会中推进中', phase: 2 });
    setSelectedStep(1);
    window.setTimeout(() => scrollToSection('prep-section'), 0);
  };

  const handleGenerateReport = () => {
    updateActiveMeeting({ report: generateReport(meeting, records, actions), status: '待跟进', phase: 4 });
    setSelectedStep(3);
    window.setTimeout(() => scrollToSection('report-section'), 0);
  };

  const handlePrimaryAction = () => {
    if (primaryAction.action === 'prep') {
      handleGeneratePrep();
      return;
    }
    if (primaryAction.action === 'report') {
      handleGenerateReport();
      return;
    }
    if (primaryAction.action === 'scroll' && primaryAction.target === 'records-section') {
      setSelectedStep(2);
    }
    if (primaryAction.action === 'scroll' && primaryAction.target === 'action-board') {
      setSelectedStep(4);
    }
    scrollToSection(primaryAction.target);
  };

  const handleSaveMeeting = (draft) => {
    updateActiveMeeting((current) => ({
      ...current,
      ...draft,
      participants: draft.attendees,
      discussionQuestions: draft.questions,
      status: current.status || '进行中'
    }));
  };

  const handleCreateMeeting = (draft) => {
    const nextMeeting = createMeetingFromDraft(draft);
    setMeetings((current) => [nextMeeting, ...current]);
    setActiveMeetingId(nextMeeting.id);
    setSelectedStep(1);
    setActivePage('home');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const handleAddRecord = (record) => {
    updateActiveMeeting((current) => ({
      ...current,
      records: [{ id: Date.now(), ...record }, ...(current.records ?? [])],
      status: '会中推进中',
      phase: Math.max(current.phase ?? 1, 2)
    }));
  };

  const handleImportRecords = (importedRecords) => {
    updateActiveMeeting((current) => {
      const now = Date.now();
      const nextRecords = importedRecords.map((record, index) => ({ id: now + index, ...record }));
      return {
        ...current,
        records: [...nextRecords, ...(current.records ?? [])],
        status: '会中推进中',
        phase: Math.max(current.phase ?? 1, 2)
      };
    });
  };

  const handleAddAction = (action) => {
    updateActiveMeeting((current) => ({
      ...current,
      todos: [{ id: Date.now(), ...action }, ...(current.todos ?? [])],
      status: '待跟进',
      phase: Math.max(current.phase ?? 1, 4)
    }));
  };

  const handleStatusChange = (id, status) => {
    updateActiveMeeting((current) => ({
      ...current,
      todos: (current.todos ?? []).map((item) => (item.id === id ? { ...item, status } : item))
    }));
  };

  const handleArchiveMeeting = () => {
    const snapshot = createHistorySnapshot({ meeting, records, report, todos: actions });
    setHistoryMeetings((current) => sortHistory([snapshot, ...current]));
  };

  const handleResetDemo = () => {
    const defaultMeetings = createDefaultMeetings();
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(MEETINGS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_MEETING_STORAGE_KEY);
    setMeetings(defaultMeetings);
    setActiveMeetingId(defaultMeetings[0].id);
    setSelectedStep(null);
    setActivePage('home');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        activePage={activePage}
        currentStageLabel={currentStageLabel}
        primaryActionLabel={primaryAction.label}
        onPageChange={setActivePage}
        onPrimaryAction={handlePrimaryAction}
        onResetDemo={handleResetDemo}
      />

      {activePage === 'guide' ? (
        <GuidePage />
      ) : activePage === 'history' ? (
        <HistoryPage historyMeetings={historyMeetings} />
      ) : activePage === 'settings' ? (
        <SettingsPage />
      ) : (
        <>
          <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
            <MeetingSidebar
              meeting={meeting}
              activeMeetingId={activeMeetingId}
              currentStageLabel={currentStageLabel}
              onSelectMeeting={handleSelectMeeting}
              onCreateMeeting={() => setIsCreateMeetingOpen(true)}
              onEditMeeting={() => setIsEditMeetingOpen(true)}
            />
            <MeetingWorkspace
              key={activeMeeting.id}
              meeting={meeting}
              prepCard={prepCard}
              records={records}
              report={report}
              actions={actions}
              stats={stats}
              currentStep={currentStep}
              currentStageLabel={currentStageLabel}
              activeStep={visibleStep}
              onStepClick={handleStepSelect}
              onEditMeeting={() => setIsEditMeetingOpen(true)}
              onGeneratePrep={handleGeneratePrep}
              onGenerateReport={handleGenerateReport}
              onAddRecord={handleAddRecord}
              onImportRecords={handleImportRecords}
              onAddAction={handleAddAction}
              onArchiveMeeting={handleArchiveMeeting}
            />
            <AiAssistantPanel
              meeting={meeting}
              records={records}
              actions={actions}
              stats={stats}
              onGeneratePrep={handleGeneratePrep}
              onGenerateReport={handleGenerateReport}
            />
          </section>

          <section id="action-board" className="scroll-mt-4 mx-auto max-w-[1600px] px-4 pb-6">
            <ActionBoard key={`actions-${activeMeeting.id}`} meeting={meeting} actions={actions} onStatusChange={handleStatusChange} />
          </section>
        </>
      )}

      <EditMeetingModal
        meeting={meeting}
        isOpen={isEditMeetingOpen}
        onClose={() => setIsEditMeetingOpen(false)}
        onSave={handleSaveMeeting}
      />
      <EditMeetingModal
        mode="create"
        isOpen={isCreateMeetingOpen}
        onClose={() => setIsCreateMeetingOpen(false)}
        onSave={handleCreateMeeting}
      />
    </main>
  );
}
