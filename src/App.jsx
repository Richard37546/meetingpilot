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

const STORAGE_KEY = 'meetingpilot-demo-state';
const STORAGE_VERSION = 1;
const DEFAULT_MEETING_LIST_ID = sampleMeeting.meetings[0]?.id ?? sampleMeeting.id;

const workflowStages = {
  1: 'Step 1 会前准备',
  2: 'Step 2 会中记录',
  3: 'Step 3 会议纪要',
  4: 'Step 4 待办跟进'
};

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.version === STORAGE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export default function App() {
  const savedState = useMemo(() => loadSavedState(), []);
  const savedHistory = useMemo(() => loadHistoryMeetings(), []);
  const [activePage, setActivePage] = useState('home');
  const [meeting, setMeeting] = useState(savedState?.meeting ?? sampleMeeting);
  const [records, setRecords] = useState(savedState?.records ?? initialRecords);
  const [actions, setActions] = useState(savedState?.actions ?? initialActions);
  const [prepCard, setPrepCard] = useState(savedState?.prepCard ?? null);
  const [report, setReport] = useState(savedState?.report ?? null);
  const [historyMeetings, setHistoryMeetings] = useState(savedHistory);
  const [activeMeetingId, setActiveMeetingId] = useState(DEFAULT_MEETING_LIST_ID);
  const [selectedStep, setSelectedStep] = useState(null);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, meeting, records, actions, prepCard, report }));
    } catch {
      // localStorage 不可用时仍允许页面正常使用，只是不持久化演示状态。
    }
  }, [meeting, records, actions, prepCard, report]);

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
    if (records.length <= initialRecords.length) return 2;
    if (!report) return 3;
    return 4;
  }, [prepCard, records.length, report]);

  const currentStageLabel = workflowStages[currentStep];

  const primaryAction = useMemo(() => {
    if (!prepCard) {
      return { label: '生成会前准备清单', target: 'prep-section', action: 'prep' };
    }
    if (records.length <= initialRecords.length) {
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

  const handleStepSelect = (step, target) => {
    setSelectedStep(step);
    window.setTimeout(() => scrollToSection(target), 0);
  };

  const handleGeneratePrep = () => {
    setPrepCard(generatePrepCard(meeting));
    setSelectedStep(1);
    window.setTimeout(() => scrollToSection('prep-section'), 0);
  };

  const handleGenerateReport = () => {
    setReport(generateReport(meeting, records, actions));
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
    setActiveMeetingId(DEFAULT_MEETING_LIST_ID);
    setMeeting((current) => {
      const updatedMeetings = (current.meetings ?? []).map((item, index) => {
        const shouldUpdate = item.id === DEFAULT_MEETING_LIST_ID || index === 0;
        return shouldUpdate ? { ...item, title: draft.title, status: '进行中' } : item;
      });

      return {
        ...current,
        ...draft,
        status: current.status,
        meetings: updatedMeetings.length ? updatedMeetings : current.meetings
      };
    });
  };

  const handleAddRecord = (record) => {
    setRecords((current) => [{ id: Date.now(), ...record }, ...current]);
  };

  const handleImportRecords = (importedRecords) => {
    setRecords((current) => {
      const now = Date.now();
      const nextRecords = importedRecords.map((record, index) => ({ id: now + index, ...record }));
      return [...nextRecords, ...current];
    });
  };

  const handleAddAction = (action) => {
    setActions((current) => [{ id: Date.now(), ...action }, ...current]);
  };

  const handleStatusChange = (id, status) => {
    setActions((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleArchiveMeeting = () => {
    const snapshot = createHistorySnapshot({ meeting, records, report, todos: actions });
    setHistoryMeetings((current) => sortHistory([snapshot, ...current]));
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecords(initialRecords);
    setActions(initialActions);
    setPrepCard(null);
    setReport(null);
    setMeeting(sampleMeeting);
    setActiveMeetingId(DEFAULT_MEETING_LIST_ID);
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
              onSelectMeeting={setActiveMeetingId}
              onEditMeeting={() => setIsEditMeetingOpen(true)}
            />
            <MeetingWorkspace
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
            <ActionBoard meeting={meeting} actions={actions} onStatusChange={handleStatusChange} />
          </section>
        </>
      )}

      <EditMeetingModal
        meeting={meeting}
        isOpen={isEditMeetingOpen}
        onClose={() => setIsEditMeetingOpen(false)}
        onSave={handleSaveMeeting}
      />
    </main>
  );
}
