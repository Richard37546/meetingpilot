import { useState } from 'react';
import { Copy, Download, FileText } from 'lucide-react';
import {
  buildMarkdownFileName,
  buildMeetingReportMarkdown,
  copyTextToClipboard,
  downloadMarkdown
} from '../utils/markdown.js';

export default function MeetingReport({ meeting, report, records, actions, onGenerateReport }) {
  const [feedback, setFeedback] = useState('');

  const buildMarkdown = () => buildMeetingReportMarkdown({ meeting, report, records, actions });

  const handleCopyReport = async () => {
    if (!report) {
      setFeedback('请先生成会议纪要');
      return;
    }

    const result = await copyTextToClipboard(buildMarkdown());
    setFeedback(result.ok ? '已复制会议纪要' : result.message);
  };

  const handleExportReport = () => {
    if (!report) {
      setFeedback('请先生成会议纪要');
      return;
    }

    downloadMarkdown(buildMarkdownFileName('meetingpilot', meeting.title), buildMarkdown());
    setFeedback('已导出会议纪要');
  };

  return (
    <section id="report-section" className="scroll-mt-4 rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-brand" />
          <h3 className="text-base font-semibold text-ink">会议纪要与结论</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            disabled={!report}
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <Copy size={16} />
            复制会议纪要
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            disabled={!report}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Download size={16} />
            导出 Markdown
          </button>
          {feedback && <span className="text-xs font-semibold text-brand">{feedback}</span>}
        </div>
      </div>
      {report ? (
        <div className="space-y-4 text-sm">
          <section className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-brand">会议摘要</p>
            <p className="mt-2 leading-6 text-ink">{report.summary}</p>
          </section>
          <ReportBlock title="核心结论" items={report.conclusions} />
          <ReportBlock title="决策列表" items={report.decisions} />
          <ReportBlock title="风险列表" items={report.risks} tone="risk" />
          <ReportBlock title="待办事项列表" items={report.actionItems} />
          <ReportBlock title="下一步建议" items={report.nextSteps} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6">
          <p className="font-semibold text-ink">还没有生成会议纪要</p>
          <p className="mt-2 text-muted">
            添加几条会中记录后，点击“生成会议纪要”，系统会整理会议摘要、已确认结论、风险和待办事项。
          </p>
          <button
            onClick={onGenerateReport}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50"
          >
            <FileText size={16} />
            生成会议纪要
          </button>
        </div>
      )}
    </section>
  );
}

function ReportBlock({ title, items, tone = 'default' }) {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold text-muted">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <p
            key={item}
            className={`rounded-md border px-3 py-2 leading-6 ${
              tone === 'risk' ? 'border-red-100 bg-red-50 text-risk' : 'border-line bg-slate-50 text-ink'
            }`}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
