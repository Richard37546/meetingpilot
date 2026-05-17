import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

function joinLines(items = []) {
  return items.join('\n');
}

function splitAttendees(value) {
  return value
    .split(/[\n,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EditMeetingModal({ meeting, isOpen, mode = 'edit', onClose, onSave }) {
  const [draft, setDraft] = useState({
    title: '',
    goal: '',
    attendeesText: '',
    background: '',
    questionsText: '',
    time: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'create') {
      setDraft({
        title: '',
        goal: '',
        attendeesText: '',
        background: '',
        questionsText: '',
        time: ''
      });
      setError('');
      return;
    }

    setDraft({
      title: meeting?.title ?? '',
      goal: meeting?.goal ?? '',
      attendeesText: joinLines(meeting?.attendees),
      background: meeting?.background ?? '',
      questionsText: joinLines(meeting?.questions),
      time: meeting?.time ?? ''
    });
    setError('');
  }, [isOpen, meeting, mode]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const attendees = splitAttendees(draft.attendeesText);

    if (!draft.title.trim() || !draft.goal.trim() || !attendees.length) {
      setError('请至少填写会议主题、会议目标和参会人 / 角色。');
      return;
    }

    onSave({
      title: draft.title.trim(),
      goal: draft.goal.trim(),
      attendees,
      background: draft.background.trim(),
      questions: splitLines(draft.questionsText),
      time: draft.time.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <section className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-soft scrollbar-thin">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">{mode === 'create' ? '新建会议' : '编辑当前会议'}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {mode === 'create'
                ? '填写基础信息后，会自动切换到新会议并从会前准备开始。'
                : '更新会议基本信息不会清空已有会中记录、会议纪要和待办事项。'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-white p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="关闭弹窗"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <Field label="会议主题" required>
            <input
              value={draft.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          <Field label="会议目标" required>
            <textarea
              value={draft.goal}
              onChange={(event) => updateField('goal', event.target.value)}
              rows={2}
              className="w-full resize-y rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          <Field label="参会人 / 角色" required hint="可用逗号分隔，也可以每行输入一个角色。">
            <textarea
              value={draft.attendeesText}
              onChange={(event) => updateField('attendeesText', event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          <Field label="会议背景" hint="推荐填写，便于生成更贴近场景的准备清单。">
            <textarea
              value={draft.background}
              onChange={(event) => updateField('background', event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          <Field label="待讨论问题" hint="每行一个问题。">
            <textarea
              value={draft.questionsText}
              onChange={(event) => updateField('questionsText', event.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          <Field label="会议时间">
            <input
              value={draft.time}
              onChange={(event) => updateField('time', event.target.value)}
              placeholder="例如：周三 15:00"
              className="w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand"
            />
          </Field>

          {error && <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-risk">{error}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line bg-white px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <Save size={17} />
              {mode === 'create' ? '创建会议' : '保存并更新会议'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, required = false, hint, children }) {
  return (
    <label className="block">
      <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
        {label}
        {required && <span className="text-xs font-semibold text-risk">必填</span>}
      </span>
      {hint && <span className="mt-1 block text-xs leading-5 text-muted">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
