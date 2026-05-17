import { ClipboardList, Info, Route, TableProperties, TriangleAlert, Users } from 'lucide-react';

const requirementGroups = [
  { title: '必填', items: ['会议主题', '会议目标', '参会人 / 角色'] },
  { title: '推荐', items: ['会议背景', '待讨论问题', '会议时间', '原始会议文本'] },
  { title: '可选', items: ['会议链接', '完整逐字稿', '文件资料', '自定义 API 配置'] }
];

const usageSteps = [
  '编辑当前会议：填写会议主题、目标、参会人和背景',
  '生成会前准备清单：获得议程、关键问题和风险提示',
  '会中记录：手动添加记录，或粘贴原始会议文本并模拟 AI 解析',
  '生成会议纪要：整理摘要、结论、风险和待办',
  '导出结果：复制 / 导出会议纪要和待办清单',
  '归档与查询：归档当前会议，并在历史会议页搜索、筛选和查看详情'
];

const moduleRows = [
  ['编辑当前会议', '会议主题、目标、参会人、背景', '当前会议基础信息', '让后续准备、纪要和归档有统一上下文'],
  ['会前准备清单', '会议基础信息和待讨论问题', '建议议程、关键问题、准备清单、风险提示', '提前对齐会议目标和讨论边界'],
  ['会中结构化记录', '手动输入讨论、结论、风险、问题或待办', '结构化记录列表', '把零散讨论沉淀成可复用信息'],
  ['粘贴会议文本解析', '会议草稿、聊天记录或转写文本', '模拟 AI 解析出的结构化记录预览', '降低手动整理会议记录的成本'],
  ['会议纪要与结论', '会中记录、待办和会议信息', '摘要、结论、风险、待办、下一步建议', '把会议讨论整理成可复制、可导出的纪要'],
  ['待办跟进看板', '任务、负责人、截止时间、优先级、状态、风险', '按状态分组的待办看板和 Markdown 清单', '让会议结论进入执行跟进'],
  ['历史会议', '归档后的会议快照', '可搜索、可筛选、可展开查看的历史记录', '形成会议知识沉淀和后续追踪依据'],
  ['设置', 'AI 模式和实验性 API 配置', '本地设置和会议平台导入入口说明', '明确当前可用能力与未来扩展方向']
];

const boundaries = [
  '不接入真实视频会议',
  '不做实时语音转文字',
  '不需要登录',
  '不上传录音或文件',
  '默认使用模拟 AI',
  '自定义 API 仅为实验性配置入口，当前不实际发起请求',
  '飞书 / 腾讯会议 / 钉钉接入为规划中能力'
];

const suitableScenes = ['产品需求评审会', '项目周会', '复盘会', '实习生 / 助理整理会议纪要', '小团队跟进任务和风险'];
const unsuitableScenes = ['替代视频会议软件', '需要实时字幕或实时语音识别的场景', '需要企业级权限和多人协作的场景'];

export default function GuidePage() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-brand" />
          <h2 className="text-xl font-semibold text-ink">使用说明</h2>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
          MeetingPilot 是一个 AI 视频会议助手，帮助用户把会议从“讨论完成”推进到“有结论、有负责人、有跟进”。
          它不是视频通话工具，而是会议前后信息整理、纪要生成、待办跟进和历史沉淀工具。
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-brand" />
            <h3 className="text-base font-semibold text-ink">用户至少需要提供哪些信息</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {requirementGroups.map((group) => (
              <div key={group.title} className="rounded-md border border-line bg-panel p-4">
                <p className="text-sm font-semibold text-brand">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
                  {group.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Route size={18} className="text-brand" />
            <h3 className="text-base font-semibold text-ink">推荐使用流程</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {usageSteps.map((step, index) => (
              <div key={step} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-brand">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <TableProperties size={18} className="text-brand" />
            <h3 className="text-base font-semibold text-ink">每个模块输入与输出</h3>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-xs font-semibold text-muted">
                  <th className="px-3 py-2">模块</th>
                  <th className="px-3 py-2">用户输入</th>
                  <th className="px-3 py-2">系统输出</th>
                  <th className="px-3 py-2">价值</th>
                </tr>
              </thead>
              <tbody>
                {moduleRows.map(([module, input, output, value]) => (
                  <tr key={module} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-ink">{module}</td>
                    <td className="px-3 py-3 leading-6 text-muted">{input}</td>
                    <td className="px-3 py-3 leading-6 text-muted">{output}</td>
                    <td className="px-3 py-3 leading-6 text-muted">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <TriangleAlert size={18} className="text-amber-800" />
            <h3 className="text-base font-semibold text-amber-800">当前版本边界</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-amber-900">当前版本是纯前端原型：</p>
          <ul className="mt-2 grid gap-2 text-sm leading-6 text-amber-900 md:grid-cols-2">
            {boundaries.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand" />
            <h3 className="text-base font-semibold text-ink">适合使用的场景</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SceneBlock title="适合" items={suitableScenes} />
            <SceneBlock title="不适合" items={unsuitableScenes} tone="muted" />
          </div>
        </section>
      </div>
    </section>
  );
}

function SceneBlock({ title, items, tone = 'default' }) {
  return (
    <div className={`rounded-md border p-4 ${tone === 'muted' ? 'border-slate-200 bg-slate-50' : 'border-emerald-100 bg-emerald-50'}`}>
      <p className={`text-sm font-semibold ${tone === 'muted' ? 'text-slate-700' : 'text-accent'}`}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
