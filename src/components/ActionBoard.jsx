import { useState } from 'react';
import { Circle, Clock3, ShieldAlert, CheckCircle2, Copy, Download } from 'lucide-react';
import {
  buildActionsMarkdown,
  buildMarkdownFileName,
  copyTextToClipboard,
  downloadMarkdown
} from '../utils/markdown.js';

const columns = [
  { status: '待开始', icon: Circle, tone: 'border-slate-200 bg-slate-50 text-slate-700' },
  { status: '进行中', icon: Clock3, tone: 'border-blue-100 bg-blue-50 text-brand' },
  { status: '已完成', icon: CheckCircle2, tone: 'border-emerald-100 bg-emerald-50 text-accent' },
  { status: '有风险', icon: ShieldAlert, tone: 'border-red-100 bg-red-50 text-risk' }
];

export default function ActionBoard({ meeting, actions, onStatusChange }) {
  const [feedback, setFeedback] = useState('');

  const buildMarkdown = () => buildActionsMarkdown({ meeting, actions });

  const handleCopyActions = async () => {
    if (!actions.length) {
      setFeedback('暂无待办可导出');
      return;
    }

    const result = await copyTextToClipboard(buildMarkdown());
    setFeedback(result.ok ? '已复制待办清单' : result.message);
  };

  const handleExportActions = () => {
    if (!actions.length) {
      setFeedback('暂无待办可导出');
      return;
    }

    downloadMarkdown(buildMarkdownFileName('meetingpilot-todos', meeting.title), buildMarkdown());
    setFeedback('已导出待办清单');
  };

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">待办跟进看板</h2>
          <p className="mt-1 text-sm text-muted">把会议结论转化为负责人、截止时间、优先级和状态可追踪的待办事项。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyActions}
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50"
          >
            <Copy size={16} />
            复制待办
          </button>
          <button
            type="button"
            onClick={handleExportActions}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download size={16} />
            导出待办 Markdown
          </button>
          <span className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-muted">{actions.length} 个待办事项</span>
          {feedback && <span className="text-xs font-semibold text-brand">{feedback}</span>}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {columns.map(({ status, icon: Icon, tone }) => {
          const columnItems = actions.filter((item) => item.status === status);
          return (
            <section key={status} className="min-h-[180px] rounded-lg border border-line bg-panel p-2.5">
              <div className={`mb-2 flex items-center justify-between rounded-md border px-3 py-2 ${tone}`}>
                <div className="flex items-center gap-2">
                  <Icon size={17} />
                  <h3 className="text-sm font-semibold">{status}</h3>
                </div>
                <span className="text-xs font-semibold">{columnItems.length}</span>
              </div>
              <div className="space-y-2">
                {columnItems.map((item) => (
                  <article key={item.id} className="rounded-md border border-line bg-white p-2.5 shadow-sm">
                    <p className="text-sm font-semibold leading-5 text-ink">{item.task}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      <p>负责人：{item.owner}</p>
                      <p>截止：{item.due}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      <p>优先级：{item.priority}</p>
                      <p>状态：{item.status}</p>
                    </div>
                    <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-xs leading-5 text-muted">风险提示：{item.risk}</p>
                    <select
                      value={item.status}
                      onChange={(event) => onStatusChange(item.id, event.target.value)}
                      className="mt-2 w-full rounded-md border border-line bg-white px-2 py-1.5 text-xs outline-none focus:border-brand"
                    >
                      {columns.map((column) => (
                        <option key={column.status}>{column.status}</option>
                      ))}
                    </select>
                  </article>
                ))}
                {!columnItems.length && (
                  <p className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-center text-sm text-muted">暂无任务</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
