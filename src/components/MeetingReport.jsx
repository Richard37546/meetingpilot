import { FileText } from 'lucide-react';

export default function MeetingReport({ report, onGenerateReport }) {
  return (
    <section id="report-section" className="scroll-mt-4 rounded-lg border border-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <FileText size={18} className="text-brand" />
        <h3 className="text-base font-semibold text-ink">会议纪要与结论</h3>
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
