import { useEffect, useState } from 'react';

export const LANGUAGE_STORAGE_KEY = 'root14_scenario_language';
export const DEFAULT_LANGUAGE = 'en';

export function getStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'ko' ? 'ko' : DEFAULT_LANGUAGE;
}

export function useScenarioLanguage() {
  const [language, setLanguageState] = useState(getStoredLanguage);

  useEffect(() => {
    const handleChange = () => setLanguageState(getStoredLanguage());
    window.addEventListener('storage', handleChange);
    window.addEventListener('root14-language-change', handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('root14-language-change', handleChange);
    };
  }, []);

  const setLanguage = (nextLanguage) => {
    const normalized = nextLanguage === 'ko' ? 'ko' : DEFAULT_LANGUAGE;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    setLanguageState(normalized);
    window.dispatchEvent(new Event('root14-language-change'));
  };

  return { language, setLanguage, isEnglish: language === 'en' };
}

export function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="scenario-language-toggle" role="group" aria-label="Language">
      <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
        EN
      </button>
      <button type="button" className={language === 'ko' ? 'active' : ''} onClick={() => setLanguage('ko')}>
        KR
      </button>
    </div>
  );
}

export const languageToggleStyles = `
  .scenario-language-toggle {
    align-items: center;
    border: 1px solid rgba(148, 163, 184, 0.22);
    display: inline-flex;
    height: 34px;
  }
  .scenario-language-toggle button {
    background: transparent;
    border: 0;
    color: #94a3b8;
    cursor: pointer;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 900;
    height: 32px;
    letter-spacing: 2px;
    min-width: 44px;
  }
  .scenario-language-toggle button.active {
    background: #58a6ff;
    color: #03111f;
  }
`;
