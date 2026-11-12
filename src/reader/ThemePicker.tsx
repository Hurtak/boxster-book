import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { initializeTheme, themeStorageKey, type ThemePreference } from './theme';

const choices: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Device setting' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemePicker() {
  // The first React render matches the prerendered controls. The head script
  // already applies the actual palette, so reading storage here causes no flash.
  const [preference, setPreference] = useState<ThemePreference>('system');
  const active = useRef<ThemePreference>('system');
  const picker = useRef<HTMLDetailsElement>(null);

  useLayoutEffect(() => {
    const restore = () => {
      active.current = initializeTheme(themeStorageKey);
      setPreference(active.current);
    };
    restore();
    const media = matchMedia('(prefers-color-scheme: dark)');
    const followDevice = () => initializeTheme(themeStorageKey, active.current);
    const storageChanged = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null) restore();
    };
    media.addEventListener('change', followDevice);
    addEventListener('storage', storageChanged);
    return () => {
      media.removeEventListener('change', followDevice);
      removeEventListener('storage', storageChanged);
    };
  }, []);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const element = picker.current;
      if (element && event.target instanceof Node && !element.contains(event.target)) element.open = false;
    };
    addEventListener('pointerdown', closeOutside);
    return () => removeEventListener('pointerdown', closeOutside);
  }, []);

  const choose = (next: ThemePreference) => {
    active.current = next;
    initializeTheme(themeStorageKey, next);
    setPreference(next);
    try {
      if (next === 'system') localStorage.removeItem(themeStorageKey);
      else localStorage.setItem(themeStorageKey, next);
    } catch {
      /* A manual choice still works for this visit without storage. */
    }
  };

  return (
    <details
      className="theme-picker enhanced-only"
      ref={picker}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && picker.current!.open) {
          event.preventDefault();
          picker.current!.open = false;
          picker.current!.querySelector('summary')!.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
    >
      <summary role="button">
        <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" />
        </svg>
        Theme
      </summary>
      <fieldset className="theme-options">
        <legend>Colour theme</legend>
        {choices.map(({ value, label }) => (
          <label key={value}>
            <input
              type="radio"
              name="book-theme"
              value={value}
              checked={preference === value}
              onChange={() => choose(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>
    </details>
  );
}
