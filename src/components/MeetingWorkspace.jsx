import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CirclePlus,
  FileText,
  ListChecks,
  MessageSquareText,
  Pencil,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import MeetingReport from './MeetingReport.jsx';
import { parseMeetingText } from '../utils/mockAi.js';

const recordTypes = ['关键讨论', '已确认结论', '已确认决策', '风险 / 阻塞', '待确认问题', '待办事项', '临时行动项'];

const flowSteps = [
  { step: 1, title: '会前准备', target: 'prep-section' },
  { step: 2, title: '会中记录', target: 'records-section' },
  { step: 3, title: '会议纪要', target: 'report-section' },
  { step: 4, title: '待办跟进', target: 'action-summary' }
];

export default function MeetingWorkspace({
  meeting,
  prepCard,
  records,
  report,
  actions,
  stats,
  currentStep,
  currentStageLabel,
  activeStep,
  onStepClick,
  onEditMeeting,
  onGeneratePrep,
  onGenerateReport,
  onAddRecord,
  onImportRecords,
  onAddAction
}) {
  const [recordType, setRecordType] = useState(recordTypes[0]);
  const [recordContent, setRecordContent] = useState('');
  const [prepExpanded, setPrepExpanded] = useState(false);
  const [actionDraft, setActionDraft] = useState({
    task: '',
    owner: '产品经理',
    due: '本周五',
    priority: '中',
    status: '待开始',
    risk: '暂无'
  });

  const submitRecord = (event) => {
    event.preventDefault();
    if (!recordContent.trim()) return;
    onAddRecord({ type: recordType, content: recordContent.trim() });
    setRecordContent('');
  };

  const submitAction = (event) => {
    event.preventDefault();
    if (!actionDraft.task.trim()) return;
    onAddAction({ ...actionDraft, task: actionDraft.task.trim() });
    setActionDraft((current) => ({ ...current, task: '' }));
  };

  return (
    <section className="space-y-4">
      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold tracking-normal text-brand">会议执行闭环</p>
              <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-accent">
                当前阶段：{currentStageLabel}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold leading-7 text-ink">
              {meeting.title}｜目标：{meeting.goal}｜参会人：{meeting.attendees.length} 人
            </h2>
            <div className="mt-2 grid gap-2 text-sm leading-6 text-muted md:grid-cols-2">
              <p>会议背景：{meeting.background || '暂未填写'}</p>
              <p>会议时间：{meeting.time || '暂未填写'}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={onEditMeeting}
                className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-100"
              >
                <Pencil size={16} />
                编辑当前会议
              </button>
              <p className="self-center text-sm leading-6 text-muted">核心价值：把会议结论变成有负责人、有截止时间、可追踪状态的待办跟进。</p>
            </div>
          </div>
          <div id="action-summary" className="scroll-mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-brand">待办跟进</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {stats.unfinished} 个未完成｜{stats.risky} 个有风险｜{stats.openQuestions} 个待确认
            </p>
            <button
              onClick={() => onStepClick(4, 'action-board')}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-blue-700"
            >
              查看完整看板
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {flowSteps.map((item, index) => {
            const isDone = item.step < currentStep;
            const isActive = item.step === currentStep;
            return (
              <div key={item.step} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => onStepClick(item.step, item.target)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition ${
                    isActive
                      ? 'border-blue-300 bg-blue-50 text-brand shadow-sm'
                      : isDone
                        ? 'border-emerald-200 bg-emerald-50 text-accent'
                        : 'border-line bg-slate-50 text-muted hover:bg-white'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={17} /> : <Circle size={16} />}
                  <span className="text-sm font-semibold">Step {item.step} {item.title}</span>
                </button>
                {index < flowSteps.length - 1 && <ArrowRight size={16} className="hidden shrink-0 text-slate-300 lg:block" />}
              </div>
            );
          })}
        </div>
      </section>

      {currentStep === 3 && (
        <section className="rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-ink">已有 {records.length} 条会议记录，可以生成会议纪要。</p>
            <button
              onClick={onGenerateReport}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FileText size={16} />
              生成会议纪要
            </button>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        {activeStep === 1 && (
          <PrepPanel
            prepCard={prepCard}
            prepExpanded={prepExpanded}
            setPrepExpanded={setPrepExpanded}
            onGeneratePrep={onGeneratePrep}
          />
        )}

        {activeStep === 2 && (
          <RecordsPanel
            records={records}
            recordType={recordType}
            recordContent={recordContent}
            actionDraft={actionDraft}
            setRecordType={setRecordType}
            setRecordContent={setRecordContent}
            setActionDraft={setActionDraft}
            submitRecord={submitRecord}
            submitAction={submitAction}
            onImportRecords={onImportRecords}
          />
        )}

        {activeStep === 3 && (
          <MeetingReport
            meeting={meeting}
            report={report}
            records={records}
            actions={actions}
            onGenerateReport={onGenerateReport}
          />
        )}

        {activeStep === 4 && (
          <FollowUpPanel stats={stats} actions={actions} onViewBoard={() => onStepClick(4, 'action-board')} />
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {activeStep !== 1 && <StepSummary title="会前准备" text={prepCard ? '准备清单已生成，可随时查看议程、关键问题和风险。' : '尚未生成准备清单。'} onClick={() => onStepClick(1, 'prep-section')} />}
        {activeStep !== 2 && <StepSummary title="会中记录" text={`已记录 ${records.length} 条讨论、决策、风险或待确认问题。`} onClick={() => onStepClick(2, 'records-section')} />}
        {activeStep !== 3 && <StepSummary title="会议纪要" text={report ? '会议摘要、结论、风险和待办事项已生成。' : '可根据会中记录生成会议纪要。'} onClick={() => onStepClick(3, 'report-section')} />}
      </section>
    </section>
  );
}

function PrepPanel({ prepCard, prepExpanded, setPrepExpanded, onGeneratePrep }) {
  return (
    <Panel id="prep-section" title="会前准备清单" icon={<ListChecks size={18} />}>
      {prepCard ? (
        <div className="space-y-4 text-sm">
          <div className="grid gap-3 xl:grid-cols-2">
            <Block title="会议目标" items={[prepCard.goal]} />
            <Block title="建议议程 Top 3" items={prepCard.agenda.slice(0, 3)} />
            <Block title="关键问题 Top 3" items={prepCard.questions.slice(0, 3)} />
            <Block title="主要风险" items={prepCard.risks.slice(0, 2)} tone="risk" />
          </div>

          {prepExpanded && (
            <div className="grid gap-3 xl:grid-cols-2">
              <Block title="完整建议议程" items={prepCard.agenda} />
              <Block title="参会人准备清单" items={prepCard.checklist} />
              <Block title="完整关键问题" items={prepCard.questions} />
              <Block title="完整潜在风险" items={prepCard.risks} tone="risk" />
            </div>
          )}

          <button
            onClick={() => setPrepExpanded((current) => !current)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {prepExpanded ? '收起完整准备清单' : '展开完整准备清单'}
          </button>
        </div>
      ) : (
        <EmptyState
          title="还没有生成会前准备清单"
          text="点击“生成会前准备清单”，系统会根据会议目标、背景和待讨论问题整理议程、准备事项、关键问题和潜在风险。"
          actionLabel="生成会前准备清单"
          onAction={onGeneratePrep}
        />
      )}
    </Panel>
  );
}

function RecordsPanel({
  records,
  recordType,
  recordContent,
  actionDraft,
  setRecordType,
  setRecordContent,
  setActionDraft,
  submitRecord,
  submitAction,
  onImportRecords
}) {
  const [rawMeetingText, setRawMeetingText] = useState('');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [importFeedback, setImportFeedback] = useState('');

  const handleParseText = () => {
    if (!rawMeetingText.trim()) {
      setParsedRecords([]);
      setImportFeedback('请先粘贴会议文本');
      return;
    }

    const nextRecords = parseMeetingText(rawMeetingText);
    setParsedRecords(nextRecords);
    setImportFeedback(nextRecords.length ? `已生成 ${nextRecords.length} 条结构化记录预览` : '未解析到可导入内容');
  };

  const handleConfirmImport = () => {
    if (!parsedRecords.length) {
      setImportFeedback('请先生成结构化记录预览');
      return;
    }

    onImportRecords(parsedRecords);
    setImportFeedback(`已导入 ${parsedRecords.length} 条结构化会议记录`);
    setParsedRecords([]);
    setRawMeetingText('');
  };

  return (
    <div id="records-section" className="scroll-mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel title="会中结构化记录" icon={<MessageSquareText size={18} />}>
        <div className="space-y-4">
          <form onSubmit={submitRecord} className="space-y-3">
            <p className="text-xs font-semibold text-muted">手动添加记录</p>
            <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
              <select
                value={recordType}
                onChange={(event) => setRecordType(event.target.value)}
                className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              >
                {recordTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <input
                value={recordContent}
                onChange={(event) => setRecordContent(event.target.value)}
                placeholder="添加讨论点、结论、风险、待确认问题..."
                className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <CirclePlus size={17} />
              添加记录
            </button>
          </form>

          <section className="rounded-md border border-blue-100 bg-blue-50 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-brand">粘贴会议文本</p>
                <p className="mt-1 text-xs text-muted">当前为模拟 AI 解析，基于关键词生成结构化记录预览。</p>
              </div>
              <span className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-brand">Mock AI</span>
            </div>
            <textarea
              value={rawMeetingText}
              onChange={(event) => setRawMeetingText(event.target.value)}
              rows={5}
              placeholder="粘贴原始会议文本，例如：今天讨论了 V1 的功能范围，实时语音转写暂时不做..."
              className="w-full resize-y rounded-md border border-blue-100 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-brand"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleParseText}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Sparkles size={16} />
                模拟 AI 解析
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!parsedRecords.length}
                className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                确认导入
              </button>
              {importFeedback && <span className="text-xs font-semibold text-brand">{importFeedback}</span>}
            </div>
            {parsedRecords.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-muted">结构化记录预览</p>
                {parsedRecords.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="rounded-md border border-blue-100 bg-white p-2">
                    <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-brand">{item.type}</span>
                    <p className="mt-2 text-sm leading-6 text-ink">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1 scrollbar-thin">
          {records.map((item) => (
            <div key={item.id} className="rounded-md border border-line bg-slate-50 p-3">
              <span className="rounded bg-white px-2 py-1 text-xs font-medium text-brand">{item.type}</span>
              <p className="mt-2 text-sm leading-6 text-ink">{item.content}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="快速添加待办" icon={<ShieldAlert size={18} />}>
        <form onSubmit={submitAction} className="space-y-3 text-sm">
          <input
            value={actionDraft.task}
            onChange={(event) => setActionDraft({ ...actionDraft, task: event.target.value })}
            placeholder="任务内容"
            className="w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={actionDraft.owner}
              onChange={(event) => setActionDraft({ ...actionDraft, owner: event.target.value })}
              className="rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
            <input
              value={actionDraft.due}
              onChange={(event) => setActionDraft({ ...actionDraft, due: event.target.value })}
              className="rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
            <select
              value={actionDraft.priority}
              onChange={(event) => setActionDraft({ ...actionDraft, priority: event.target.value })}
              className="rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            >
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
            <select
              value={actionDraft.status}
              onChange={(event) => setActionDraft({ ...actionDraft, status: event.target.value })}
              className="rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            >
              <option>待开始</option>
              <option>进行中</option>
              <option>已完成</option>
              <option>有风险</option>
            </select>
          </div>
          <input
            value={actionDraft.risk}
            onChange={(event) => setActionDraft({ ...actionDraft, risk: event.target.value })}
            placeholder="风险提示"
            className="w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
          />
          <button className="w-full rounded-md bg-ink px-3 py-2 font-semibold text-white hover:bg-slate-800">
            添加到待办跟进看板
          </button>
        </form>
      </Panel>
    </div>
  );
}

function FollowUpPanel({ stats, actions, onViewBoard }) {
  return (
    <Panel title="待办跟进摘要" icon={<ShieldAlert size={18} />}>
      <div className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-md border border-line bg-panel p-3">
          <p className="font-semibold text-ink">会议结论已经进入执行闭环</p>
          <p className="mt-2 leading-6 text-muted">
            当前共有 {actions.length} 个待办，其中 {stats.unfinished} 个未完成、{stats.risky} 个有风险、{stats.openQuestions} 个待确认问题。
          </p>
        </div>
        <button
          onClick={onViewBoard}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          查看完整看板
          <ArrowRight size={16} />
        </button>
      </div>
    </Panel>
  );
}

function StepSummary({ title, text, onClick }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-line bg-white p-3 text-left shadow-soft transition hover:border-blue-200 hover:bg-blue-50">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
    </button>
  );
}

function Panel({ id, title, icon, children }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand">{icon}</span>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Block({ title, items = [], tone = 'default' }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className={`rounded-md border px-3 py-2 leading-6 ${
              tone === 'risk' ? 'border-red-100 bg-red-50 text-risk' : 'border-line bg-slate-50 text-ink'
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-muted">{text}</p>
      <button
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50"
      >
        <FileText size={16} />
        {actionLabel}
      </button>
    </div>
  );
}
