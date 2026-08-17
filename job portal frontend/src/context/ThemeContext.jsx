import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themeTokens = {
  // 1. Original Navy JobPortal Theme
  navy: {
    name: 'navy',
    label: 'Navy (Original)',
    bg: '#09153B',
    card: '#111d52',
    card2: '#162060',
    topbarBg: 'rgba(10,18,60,0.85)',
    sidebarBg: 'rgba(10,18,60,0.95)',
    border: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.04)',
    text: '#FFFFFF',
    textMuted: '#8A97B5',
    accent: '#FAF92A',
    accentDark: '#06124A',
    inputBg: 'rgba(255,255,255,0.05)',
    hoverBg: 'rgba(255,255,255,0.06)',
    chartGrid: 'rgba(255,255,255,0.05)',
    brandTagBg: 'rgba(250,249,42,0.15)',
    brandTagText: '#FAF92A',
  },
  // 2. Light SaaS Theme (matching Reference Images 2, 3, 4)
  light: {
    name: 'light',
    label: 'White (Light)',
    bg: '#F3F2EE',
    card: '#FFFFFF',
    card2: '#F8F7F4',
    topbarBg: 'rgba(243, 242, 238, 0.95)',
    sidebarBg: '#EFECE6',
    border: '#E3E0D8',
    borderSubtle: '#EAE7E0',
    text: '#111827',
    textMuted: '#6B7280',
    accent: '#0D1B4D',
    accentDark: '#FFFFFF',
    inputBg: '#FFFFFF',
    hoverBg: '#E5E2D9',
    chartGrid: '#E5E7EB',
    brandTagBg: '#EEF2FF',
    brandTagText: '#4F46E5',
  },
  // 3. Dark Charcoal SaaS Theme (matching Reference Image 1)
  dark: {
    name: 'dark',
    label: 'Dark (Charcoal)',
    bg: '#121214',
    card: '#1C1C1E',
    card2: '#242427',
    topbarBg: 'rgba(18, 18, 20, 0.9)',
    sidebarBg: '#18181A',
    border: '#2E2E32',
    borderSubtle: '#242427',
    text: '#FFFFFF',
    textMuted: '#9E9EA4',
    accent: '#F97316',
    accentDark: '#121214',
    inputBg: '#242427',
    hoverBg: '#2E2E32',
    chartGrid: '#2E2E32',
    brandTagBg: 'rgba(249,115,22,0.15)',
    brandTagText: '#F97316',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jp_theme') || 'navy';
  });

  useEffect(() => {
    localStorage.setItem('jp_theme', theme);
    document.documentElement.classList.remove('navy', 'light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (['navy', 'light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'navy') return 'light';
      if (prev === 'light') return 'dark';
      return 'navy';
    });
  };

  const tokens = themeTokens[theme] || themeTokens.navy;

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, cycleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'navy',
      changeTheme: () => {},
      cycleTheme: () => {},
      tokens: themeTokens.navy
    };
  }
  return context;
};
