import { ClipboardList, FileText, ListChecks, MessageSquareText, ShieldCheck } from 'lucide-react';

const requirementGroups = [
  { title: '必填', items: ['会议主题', '会议目标', '参会人 / 角色'] },
  { title: '推荐', items: ['会议背景', '待讨论问题', '会议时间'] },
  { title: '可选', items: ['会议链接', '完整逐字稿', '文件资料'] }
];

const usageSteps = [
  '填写会议主题、目标和参会人',
  '生成会前准备清单',
  '会中记录讨论、结论、风险和待办',
  '生成会议纪要，并进入待办跟进看板'
];

const outputs = [
  {
    icon: ListChecks,
    title: '会前准备清单',
    text: '输出议程、准备事项、关键问题、潜在风险'
  },
  {
    icon: MessageSquareText,
    title: '会中结构化记录',
    text: '输出讨论、结论、风险、待确认问题'
  },
  {
    icon: FileText,
    title: '会议纪要与结论',
    text: '输出摘要、确认结论、风险、待办'
  },
  {
    icon: ShieldCheck,
    title: '待办跟进看板',
    text: '输出负责人、截止时间、优先级、状态和风险提示'
  }
];

export default function GuidePage() {
  return (
    <section className="mx-auto max-w-[1100px] px-4 py-6">
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-brand" />
          <h2 className="text-xl font-semibold text-ink">使用说明</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          MeetingPilot 是一个 AI 视频会议助手，帮助用户把会议从“讨论完成”推进到“有结论、有负责人、有跟进”。
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-ink">用户至少需要提供哪些信息</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {requirementGroups.map((group) => (
              <div key={group.title} className="rounded-md border border-line bg-panel p-4">
                <p className="text-sm font-semibold text-brand">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-ink">如何使用</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {usageSteps.map((step, index) => (
              <div key={step} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-brand">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-ink">每一步会得到什么输出</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {outputs.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 rounded-md border border-line bg-slate-50 p-4">
                <span className="mt-0.5 text-brand">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <h3 className="text-base font-semibold text-amber-800">当前版本边界</h3>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            当前版本是轻量级网页原型，不接入真实视频会议，不做实时语音转文字，不需要登录，不上传录音或文件，
            重点是结构化会议准备、纪要生成和待办跟进。
          </p>
        </section>
      </div>
    </section>
  );
}
