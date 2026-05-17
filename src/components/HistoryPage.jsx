import { useMemo, useState } from 'react';
import { Archive, ChevronDown, ChevronUp, Search } from 'lucide-react';

const filterOptions = [
  { key: 'all', label: '全部会议' },
  { key: 'unfinished', label: '有未完成待办' },
  { key: 'risk', label: '有风险任务' },
  { key: 'pending', label: '有待确认问题' }
];

export default function HistoryPage({ historyMeetings }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredMeetings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return historyMeetings.filter((meeting) => {
      const matchesQuery = !normalizedQuery || buildSearchText(meeting).includes(normalizedQuery);
      const matchesFilter = filter === 'all' || matchesHistoryFilter(meeting, filter);
      return matchesQuery && matchesFilter;
    });
  }, [filter, historyMeetings, query]);

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Archive size={20} className="text-brand" />
              <h2 className="text-xl font-semibold text-ink">历史会议</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              查看已归档的会议纪要、风险和待办，支持按关键词和状态快速筛选。
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:min-w-[520px]">
            <label className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索会议主题、目标、摘要、待办或记录..."
                className="w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                    filter === item.key
                      ? 'border-blue-200 bg-blue-50 text-brand'
                      : 'border-line bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!historyMeetings.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-muted">
            暂无历史会议。你可以在首页点击“归档当前会议”，将会议纪要和待办保存到历史记录。
          </div>
        )}

        {historyMeetings.length > 0 && !filteredMeetings.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-muted">
            没有匹配的历史会议，请调整关键词或筛选条件。
          </div>
        )}

        {filteredMeetings.map((meeting) => {
          const isExpanded = expandedId === meeting.id;
          return (
            <article key={meeting.id} className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-ink">{meeting.meetingTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">会议时间：{meeting.meetingTime || '暂未填写'}</p>
                  <p className="mt-1 text-sm leading-6 text-ink">会议目标：{meeting.meetingGoal || '暂未填写'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">归档时间：{formatDateTime(meeting.archivedAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Metric label="未完成" value={meeting.unfinishedTodoCount} />
                  <Metric label="风险任务" value={meeting.riskTodoCount} tone="risk" />
                  <Metric label="待确认" value={meeting.pendingQuestionCount} />
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                    className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    查看详情
                  </button>
                </div>
              </div>

              {isExpanded && <HistoryDetail meeting={meeting} />}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HistoryDetail({ meeting }) {
  const pendingQuestions = meeting.records.filter((item) => item.type === '待确认问题').map((item) => item.content);

  return (
    <div className="mt-4 space-y-4 border-t border-line pt-4 text-sm">
      <section className="grid gap-3 lg:grid-cols-2">
        <InfoBlock title="会议基本信息">
          <p>会议主题：{meeting.meetingTitle}</p>
          <p>会议目标：{meeting.meetingGoal || '暂未填写'}</p>
          <p>会议时间：{meeting.meetingTime || '暂未填写'}</p>
          <p>参会人：{meeting.participants.length ? meeting.participants.join('、') : '暂未填写'}</p>
        </InfoBlock>
        <InfoBlock title="会议背景与问题">
          <p>会议背景：{meeting.meetingBackground || '暂未填写'}</p>
          <List items={meeting.discussionQuestions} emptyText="暂无待讨论问题" />
        </InfoBlock>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <InfoBlock title="会议纪要">
          <p className="leading-6">{meeting.report?.summary || '暂无会议摘要'}</p>
          <SubList title="已确认结论" items={meeting.report?.conclusions ?? meeting.report?.decisions ?? []} />
          <SubList title="风险与阻塞" items={meeting.report?.risks ?? []} tone="risk" />
          <SubList title="待确认问题" items={pendingQuestions} />
        </InfoBlock>
        <InfoBlock title="待办清单">
          <div className="space-y-2">
            {meeting.todos.map((todo) => (
              <div key={todo.id} className="rounded-md border border-line bg-white p-3">
                <p className="font-semibold text-ink">{todo.task}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <p>负责人：{todo.owner}</p>
                  <p>截止时间：{todo.due}</p>
                  <p>优先级：{todo.priority}</p>
                  <p>状态：{todo.status}</p>
                </div>
                <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-xs leading-5 text-muted">风险提示：{todo.risk || '暂无'}</p>
              </div>
            ))}
            {!meeting.todos.length && <p className="text-muted">暂无待办事项</p>}
          </div>
        </InfoBlock>
      </section>

      <InfoBlock title="会中记录">
        <div className="grid gap-2 md:grid-cols-2">
          {meeting.records.map((record) => (
            <div key={record.id} className="rounded-md border border-line bg-white p-3">
              <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-brand">{record.type}</span>
              <p className="mt-2 leading-6 text-ink">{record.content}</p>
            </div>
          ))}
        </div>
      </InfoBlock>
    </div>
  );
}

function Metric({ label, value, tone = 'default' }) {
  return (
    <span className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
      tone === 'risk' ? 'border-red-100 bg-red-50 text-risk' : 'border-line bg-panel text-slate-600'
    }`}>
      {label}：{value}
    </span>
  );
}

function InfoBlock({ title, children }) {
  return (
    <section className="rounded-md border border-line bg-panel p-3">
      <p className="mb-2 text-xs font-semibold text-muted">{title}</p>
      <div className="space-y-2 leading-6 text-ink">{children}</div>
    </section>
  );
}

function SubList({ title, items, tone = 'default' }) {
  return (
    <div>
      <p className="mt-3 text-xs font-semibold text-muted">{title}</p>
      <List items={items} emptyText={`暂无${title}`} tone={tone} />
    </div>
  );
}

function List({ items = [], emptyText, tone = 'default' }) {
  if (!items.length) return <p className="text-muted">{emptyText}</p>;

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className={tone === 'risk' ? 'text-risk' : 'text-ink'}>
          - {item}
        </li>
      ))}
    </ul>
  );
}

function buildSearchText(meeting) {
  return [
    meeting.meetingTitle,
    meeting.meetingGoal,
    meeting.report?.summary,
    ...(meeting.todos ?? []).map((item) => item.task),
    ...(meeting.records ?? []).map((item) => item.content)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesHistoryFilter(meeting, filter) {
  if (filter === 'unfinished') return meeting.todos.some((item) => item.status !== '已完成');
  if (filter === 'risk') return meeting.todos.some((item) => item.status === '有风险' || hasMeaningfulRisk(item.risk));
  if (filter === 'pending') return meeting.records.some((item) => item.type === '待确认问题') || Boolean(meeting.report?.pendingQuestions?.length);
  return true;
}

function hasMeaningfulRisk(risk) {
  if (!risk) return false;
  return !['暂无', '无', 'none', 'n/a'].includes(String(risk).trim().toLowerCase());
}

function formatDateTime(value) {
  if (!value) return '未知时间';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
