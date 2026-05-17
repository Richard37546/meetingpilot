import { RotateCcw, Sparkles } from 'lucide-react';

const navItems = [
  { key: 'home', label: '首页' },
  { key: 'guide', label: '使用说明' },
  { key: 'history', label: '历史会议' },
  { key: 'settings', label: '设置' }
];

export default function Header({
  activePage,
  currentStageLabel,
  primaryActionLabel,
  onPageChange,
  onPrimaryAction,
  onResetDemo
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-ink">MeetingPilot</h1>
            <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-sm font-medium text-brand">
              AI 视频会议助手
            </span>
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-accent">
              当前阶段：{currentStageLabel}
            </span>
          </div>
          <p className="mt-2 max-w-4xl text-base font-semibold leading-6 text-ink">
            让每场会议都有准备、有结论、有负责人、有跟进。
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            MeetingPilot 不只是生成会议纪要，而是把会议结论变成可跟进的行动。
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">会前准备 · 会中记录 · 会议纪要 · 待办跟进</p>
          <nav className="mt-3 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                  activePage === item.key
                    ? 'border-blue-200 bg-blue-50 text-brand'
                    : 'border-line bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {activePage === 'home' && (
          <div className="flex flex-col gap-2 sm:flex-row xl:min-w-[360px]">
            <button
              onClick={onPrimaryAction}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Sparkles size={18} />
              {primaryActionLabel}
            </button>
            <button
              onClick={onResetDemo}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              重置示例数据
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
