import { AlertTriangle, Bot, CheckCircle2, Lightbulb, WandSparkles } from 'lucide-react';
import { generateNextMeetingFocus } from '../utils/mockAi.js';

export default function AiAssistantPanel({ meeting, records, actions, stats, onGeneratePrep, onGenerateReport }) {
  const riskyActions = actions.filter((item) => item.status === '有风险');
  const openQuestions = records.filter((item) => item.type === '待确认问题');
  const nextFocus = generateNextMeetingFocus(records, actions);

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={18} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">AI 智能建议</h2>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-brand">当前会议判断</p>
          <p className="mt-2 text-sm leading-6 text-ink">
            {meeting.title} 已具备完整会议闭环，应继续压缩 V1 范围，把结论沉淀为可追踪行动项。
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric label="执行风险" value={stats.riskLevel} tone={stats.riskLevel !== '低' ? 'risk' : 'good'} />
          <Metric label="未完成待办" value={`${stats.unfinished} 个`} />
          <Metric label="风险任务" value={`${stats.risky} 个`} tone={stats.risky ? 'risk' : 'good'} />
          <Metric label="待确认问题" value={`${stats.openQuestions} 个`} tone={stats.openQuestions ? 'risk' : 'good'} />
        </div>
        <div className="mt-3 space-y-2">
          <button
            onClick={onGeneratePrep}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50"
          >
            <WandSparkles size={17} />
            重新生成准备清单
          </button>
          <button
            onClick={onGenerateReport}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <CheckCircle2 size={17} />
            更新会议纪要
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-risk" />
          <h2 className="text-sm font-semibold text-ink">风险提醒</h2>
        </div>
        <div className="space-y-2">
          {riskyActions.length ? (
            riskyActions.map((item) => (
              <div key={item.id} className="rounded-md border border-red-100 bg-red-50 p-3">
                <p className="text-sm font-medium text-risk">{item.task}</p>
                <p className="mt-1 text-xs leading-5 text-red-700">{item.risk}</p>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-accent">当前没有高风险行动项。</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">下次会议重点</h2>
        </div>
        <div className="space-y-2">
          {nextFocus.map((item) => (
            <p key={item} className="rounded-md border border-line bg-slate-50 p-3 text-sm leading-6 text-ink">
              {item}
            </p>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-700">待确认问题</p>
          <p className="mt-1 text-sm text-amber-800">{openQuestions.length ? `${openQuestions.length} 个问题仍需关闭` : '暂无待确认问题'}</p>
        </div>
      </section>
    </aside>
  );
}

function Metric({ label, value, tone = 'default' }) {
  const textColor = tone === 'risk' ? 'text-risk' : tone === 'good' ? 'text-accent' : 'text-ink';
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${textColor}`}>{value}</p>
    </div>
  );
}
