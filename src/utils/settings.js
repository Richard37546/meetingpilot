export const SETTINGS_STORAGE_KEY = 'meetingPilotSettings';

export const defaultSettings = {
  aiMode: 'mock',
  apiBaseUrl: '',
  apiKey: '',
  modelName: ''
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? { ...defaultSettings, ...parsed } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...defaultSettings, ...settings }));
}
