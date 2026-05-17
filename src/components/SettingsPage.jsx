import { useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, Settings, Sparkles } from 'lucide-react';
import { loadSettings, saveSettings } from '../utils/settings.js';

const platformEntries = [
  {
    title: '粘贴会议文本',
    status: '当前可用',
    tone: 'available',
    text: '可将会议草稿、聊天记录或转写文本粘贴到会中记录模块，由模拟 AI 解析为结构化记录。'
  },
  {
    title: '飞书会议',
    status: '规划中',
    text: '未来可接入会议标题、参会人、会议纪要或转写文本，需要企业授权。'
  },
  {
    title: '腾讯会议',
    status: '规划中',
    text: '未来可接入会议记录、参会信息或会议沉淀数据，需要开放平台授权。'
  },
  {
    title: '钉钉会议',
    status: '规划中',
    text: '未来可接入会议详情和协作数据，需要企业授权。'
  }
];

export default function SettingsPage() {
  const initialSettings = useMemo(() => loadSettings(), []);
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState('');

  const updateSettings = (patch) => {
    setSettings((current) => ({ ...current, ...patch }));
    setFeedback('');
  };

  const handleModeChange = (aiMode) => {
    const nextSettings = { ...settings, aiMode };
    setSettings(nextSettings);
    if (aiMode === 'mock') {
      saveSettings(nextSettings);
      setFeedback('已切换为模拟 AI，主流程仍使用本地规则模拟');
    } else {
      setFeedback('自定义 API 为实验性配置，当前不会发起真实请求');
    }
  };

  const handleSave = () => {
    saveSettings(settings);
    setFeedback('设置已保存');
  };

  const handleMockTest = () => {
    saveSettings(settings);
    setFeedback('配置已保存，当前原型未发起真实请求');
  };

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-brand" />
          <h2 className="text-xl font-semibold text-ink">设置</h2>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
          管理 AI 解析模式和会议平台导入方式。当前版本默认使用模拟 AI，保证无需 API Key 也能完整体验。
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand" />
                <h3 className="text-base font-semibold text-ink">AI 模式</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                默认使用前端模拟 AI。自定义 API 仅保存配置，不会影响当前会议解析、纪要生成和待办提取流程。
              </p>
            </div>
            {feedback && <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand">{feedback}</span>}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <ModeCard
              title="模拟 AI"
              checked={settings.aiMode === 'mock'}
              onSelect={() => handleModeChange('mock')}
              items={[
                '当前默认模式',
                '不需要 API Key',
                '使用前端规则模拟会议文本解析、纪要生成和待办提取',
                '适合演示和轻量使用'
              ]}
            />
            <ModeCard
              title="自定义 API（实验性）"
              checked={settings.aiMode === 'custom'}
              onSelect={() => handleModeChange('custom')}
              items={[
                '为未来接入真实大模型预留',
                '当前仅保存配置，不实际发起网络请求',
                '真实生产环境建议通过后端代理调用，避免在浏览器暴露 API Key'
              ]}
            />
          </div>

          {settings.aiMode === 'custom' && (
            <form className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4" onSubmit={(event) => event.preventDefault()}>
              <div className="flex items-center gap-2">
                <KeyRound size={17} className="text-brand" />
                <p className="text-sm font-semibold text-ink">自定义 API 配置</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  API Base URL
                  <input
                    value={settings.apiBaseUrl}
                    onChange={(event) => updateSettings({ apiBaseUrl: event.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="mt-1 w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  模型名称
                  <input
                    value={settings.modelName}
                    onChange={(event) => updateSettings({ modelName: event.target.value })}
                    placeholder="example-model"
                    className="mt-1 w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600 md:col-span-2">
                  API Key
                  <input
                    value={settings.apiKey}
                    onChange={(event) => updateSettings({ apiKey: event.target.value })}
                    placeholder="仅本地保存，当前不会发起真实请求"
                    type="password"
                    className="mt-1 w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  保存设置
                </button>
                <button
                  type="button"
                  onClick={handleMockTest}
                  className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-blue-50"
                >
                  模拟测试配置
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-ink">会议平台导入</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            当前可用能力是“粘贴会议文本”。其他会议平台入口仅展示产品扩展路线，不跳转授权、不调用真实 API。
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {platformEntries.map((entry) => (
              <div key={entry.title} className="rounded-md border border-line bg-panel p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{entry.title}</p>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                      entry.tone === 'available'
                        ? 'border-emerald-100 bg-emerald-50 text-accent'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{entry.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ModeCard({ title, checked, onSelect, items }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border p-4 text-left transition ${
        checked ? 'border-blue-200 bg-blue-50' : 'border-line bg-panel hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {checked && <CheckCircle2 size={18} className="text-brand" />}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </button>
  );
}
