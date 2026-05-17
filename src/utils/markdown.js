export async function copyTextToClipboard(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return { ok: false, message: '当前浏览器不支持剪贴板复制，请使用导出 Markdown' };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, message: '复制失败，请检查浏览器剪贴板权限' };
  }
}

export function downloadMarkdown(fileName, markdown) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildMeetingReportMarkdown({ meeting, report, records, actions }) {
  const conclusions = report?.conclusions?.length
    ? report.conclusions
    : getRecordsByTypes(records, ['已确认结论', '已确认决策']);
  const risks = report?.risks?.length ? report.risks : getRecordsByTypes(records, ['风险 / 阻塞']);
  const openQuestions = getRecordsByTypes(records, ['待确认问题']);
  const recordActionItems = getRecordsByTypes(records, ['待办事项', '临时行动项']);
  const actionItems = report?.actionItems?.length
    ? report.actionItems
    : [...recordActionItems, ...actions.map((item) => `${item.task}｜${item.owner}｜${item.due}｜${item.status}`)];

  return [
    `# ${meeting.title || '会议纪要'}`,
    '',
    `- 会议目标：${meeting.goal || '暂未填写'}`,
    `- 会议时间：${meeting.time || '暂未填写'}`,
    `- 参会人：${meeting.attendees?.join('、') || '暂未填写'}`,
    '',
    '## 会议摘要',
    '',
    report?.summary || '暂未生成会议摘要',
    '',
    '## 已确认结论',
    '',
    toMarkdownList(conclusions, '暂无已确认结论'),
    '',
    '## 风险与阻塞',
    '',
    toMarkdownList(risks, '暂无风险与阻塞'),
    '',
    '## 待确认问题',
    '',
    toMarkdownList(openQuestions, '暂无待确认问题'),
    '',
    '## 待办事项',
    '',
    toMarkdownList(actionItems, '暂无待办事项'),
    ''
  ].join('\n');
}

export function buildActionsMarkdown({ meeting, actions }) {
  const unfinished = actions.filter((item) => item.status !== '已完成').length;
  const risky = actions.filter((item) => item.status === '有风险').length;
  const tableRows = actions.map((item) =>
    `| ${[
      escapeTableCell(item.task),
      escapeTableCell(item.owner),
      escapeTableCell(item.due),
      escapeTableCell(item.priority),
      escapeTableCell(item.status),
      escapeTableCell(item.risk)
    ].join(' | ')} |`
  );

  return [
    `# ${meeting.title || '会议'} - 待办清单`,
    '',
    `- 会议标题：${meeting.title || '暂未填写'}`,
    `- 待办总数：${actions.length}`,
    `- 未完成数量：${unfinished}`,
    `- 风险任务数量：${risky}`,
    '',
    '## 待办表格',
    '',
    '| 任务 | 负责人 | 截止时间 | 优先级 | 状态 | 风险提示 |',
    '| --- | --- | --- | --- | --- | --- |',
    ...tableRows,
    ''
  ].join('\n');
}

export function buildMarkdownFileName(prefix, title, date = new Date()) {
  const dateText = date.toISOString().slice(0, 10);
  const safeTitle = sanitizeFileName(title || '未命名会议');
  return `${prefix}-${safeTitle}-${dateText}.md`;
}

function getRecordsByTypes(records, types) {
  return records.filter((item) => types.includes(item.type)).map((item) => item.content);
}

function toMarkdownList(items, emptyText) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${emptyText}`;
}

function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

function escapeTableCell(value) {
  return String(value || '暂无').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
