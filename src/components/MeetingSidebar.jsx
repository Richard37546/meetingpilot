import { CalendarDays, Pencil, Target, UsersRound } from 'lucide-react';

export default function MeetingSidebar({ meeting, activeMeetingId, currentStageLabel, onSelectMeeting, onEditMeeting }) {
  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">会议列表</h2>
          <span className="text-xs text-muted">示例数据</span>
        </div>
        <div className="space-y-2">
          {meeting.meetings.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectMeeting(item.id)}
              className={`w-full rounded-md border p-3 text-left transition ${
                activeMeetingId === item.id ? 'border-blue-200 bg-blue-50' : 'border-line bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-muted">{item.status}</span>
              </div>
              <p className="mt-2 text-xs text-muted">推进状态 {item.health >= 75 ? '较稳' : '需关注'}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">当前会议</h2>
          <button
            onClick={onEditMeeting}
            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-brand hover:bg-blue-100"
          >
            <Pencil size={13} />
            编辑
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <InfoRow icon={<Target size={17} />} label="会议主题" value={meeting.title} />
          <InfoRow icon={<CalendarDays size={17} />} label="会议目标" value={meeting.goal} />
          <InfoRow icon={<CalendarDays size={17} />} label="会议时间" value={meeting.time || '暂未填写'} />
          <InfoRow icon={<UsersRound size={17} />} label="参会人" value={meeting.attendees.join('、')} />
          <div>
            <p className="mb-1 text-xs font-medium text-muted">会议背景</p>
            <p className="leading-6 text-ink">{meeting.background}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted">待讨论问题</p>
            <p className="leading-6 text-ink">{meeting.questions?.length ? meeting.questions.join('；') : '暂未填写'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted">当前阶段</p>
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-semibold text-accent">
              {currentStageLabel}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-1 leading-6 text-ink">{value}</p>
      </div>
    </div>
  );
}
