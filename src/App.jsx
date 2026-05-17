import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MeetingSidebar from './components/MeetingSidebar.jsx';
import MeetingWorkspace from './components/MeetingWorkspace.jsx';
import AiAssistantPanel from './components/AiAssistantPanel.jsx';
import ActionBoard from './components/ActionBoard.jsx';
import { initialActions, initialRecords, sampleMeeting } from './data/sampleMeeting.js';
import { generatePrepCard, generateReport } from './utils/mockAi.js';

const STORAGE_KEY = 'meetingpilot-demo-state';
const STORAGE_VERSION = 1;

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
  const [records, setRecords] = useState(savedState?.records ?? initialRecords);
  const [actions, setActions] = useState(savedState?.actions ?? initialActions);
  const [prepCard, setPrepCard] = useState(savedState?.prepCard ?? null);
  const [report, setReport] = useState(savedState?.report ?? null);
  const [activeMeetingId, setActiveMeetingId] = useState(sampleMeeting.id);
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, records, actions, prepCard, report }));
    } catch {
      // localStorage 不可用时仍允许页面正常使用，只是不持久化演示状态。
    }
  }, [records, actions, prepCard, report]);

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

  const visibleStep = activeStep ?? currentStep;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStepSelect = (step, target) => {
    setActiveStep(step);
    window.setTimeout(() => scrollToSection(target), 0);
  };

  const handleGeneratePrep = () => {
    setPrepCard(generatePrepCard(sampleMeeting));
    setActiveStep(1);
    window.setTimeout(() => scrollToSection('prep-section'), 0);
  };

  const handleGenerateReport = () => {
    setReport(generateReport(sampleMeeting, records, actions));
    setActiveStep(3);
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
    scrollToSection(primaryAction.target);
  };

  const handleAddRecord = (record) => {
    setRecords((current) => [{ id: Date.now(), ...record }, ...current]);
  };

  const handleAddAction = (action) => {
    setActions((current) => [{ id: Date.now(), ...action }, ...current]);
  };

  const handleStatusChange = (id, status) => {
    setActions((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecords(initialRecords);
    setActions(initialActions);
    setPrepCard(null);
    setReport(null);
    setActiveMeetingId(sampleMeeting.id);
    setActiveStep(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        meeting={sampleMeeting}
        primaryActionLabel={primaryAction.label}
        onPrimaryAction={handlePrimaryAction}
        onResetDemo={handleResetDemo}
      />

      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <MeetingSidebar
          meeting={sampleMeeting}
          activeMeetingId={activeMeetingId}
          onSelectMeeting={setActiveMeetingId}
        />
        <MeetingWorkspace
          meeting={sampleMeeting}
          prepCard={prepCard}
          records={records}
          report={report}
          actions={actions}
          stats={stats}
          currentStep={currentStep}
          activeStep={visibleStep}
          onStepClick={handleStepSelect}
          onGeneratePrep={handleGeneratePrep}
          onGenerateReport={handleGenerateReport}
          onAddRecord={handleAddRecord}
          onAddAction={handleAddAction}
        />
        <AiAssistantPanel
          meeting={sampleMeeting}
          records={records}
          actions={actions}
          stats={stats}
          onGeneratePrep={handleGeneratePrep}
          onGenerateReport={handleGenerateReport}
        />
      </section>

      <section id="action-board" className="scroll-mt-4 mx-auto max-w-[1600px] px-4 pb-6">
        <ActionBoard actions={actions} onStatusChange={handleStatusChange} />
      </section>
    </main>
  );
}
