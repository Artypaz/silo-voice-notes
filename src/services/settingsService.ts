const SETTINGS_KEY = "silo_settings";

export interface AppSettings {
  autoRecord: boolean;
  saveAudio: boolean;
  darkMode: boolean;
  autoDelete: "off" | "30" | "90" | "365";
  keepTranscription: boolean;
}

const defaults: AppSettings = {
  autoRecord: false,
  saveAudio: true,
  darkMode: false,
  autoDelete: "off",
  keepTranscription: true,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const next = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}
