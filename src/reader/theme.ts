export type ThemePreference = 'system' | 'light' | 'dark';
export const themeStorageKey = 'boxster-theme';

// Also serialized into the document head. Keep this function self-contained:
// it must run before the stylesheet and React, without importing reader code.
export function initializeTheme(storageKey: string, requested?: ThemePreference): ThemePreference {
  let preference = requested ?? 'system';
  if (requested === undefined) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'light' || saved === 'dark') preference = saved;
    } catch {
      /* The device setting remains available when storage is blocked. */
    }
  }
  const theme =
    preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = preference === 'system' ? 'light dark' : preference;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111815' : '#f1f3f2');
  return preference;
}
