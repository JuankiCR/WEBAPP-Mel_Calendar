// src/hooks/useTheme.ts
import { useEffect, useState, useLayoutEffect } from "react";

type Theme = "light" | "dark";
type ThemeOverrides = Record<string, string>;

const THEME_KEY = "theme";
const OVERRIDES_PREFIX = "theme-overrides-";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

function loadOverrides(theme: Theme): ThemeOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_PREFIX + theme);
    if (!raw) return {};
    return JSON.parse(raw) as ThemeOverrides;
  } catch {
    return {};
  }
}

function saveOverrides(theme: Theme, overrides: ThemeOverrides) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OVERRIDES_PREFIX + theme, JSON.stringify(overrides));
}

function applyTheme(theme: Theme, overrides: ThemeOverrides) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  const style = root.style;
  Object.entries(overrides).forEach(([name, value]) => {
    style.setProperty(name, value);
  });
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [overrides, setOverrides] = useState<ThemeOverrides>(() =>
    loadOverrides(getInitialTheme())
  );

  useEffect(() => {
    const ov = loadOverrides(theme);
    setOverrides(ov);
    applyTheme(theme, ov);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setThemeVar = (name: string, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [name]: value };
      saveOverrides(theme, next);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(name, value);
      }
      return next;
    });
  };

  const resetThemeVars = () => {
    const current = loadOverrides(theme);
    if (typeof document !== "undefined") {
      const style = document.documentElement.style;
      Object.keys(current).forEach((name) => {
        style.setProperty(name, "");
      });
    }
    saveOverrides(theme, {});
    setOverrides({});
  };

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const computed = getComputedStyle(root);

    let primary = computed.getPropertyValue("--primary-color").trim();
    if (!primary) {
      primary = theme === "dark" ? "#ffd600" : "#8b7001";
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", primary);
    }
  }, [theme, overrides]);

  return {
    theme,
    toggleTheme,
    overrides,
    setThemeVar,
    resetThemeVars,
  };
}
