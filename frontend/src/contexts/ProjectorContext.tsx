import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ProjectorContext, type ProjectorSettings } from './projector-context';

const defaultSettings: ProjectorSettings = {
  fontSize: 32,
  backgroundColor: '#000000',
  textColor: '#ffffff',
  textAlign: 'center',
  theme: 'dark'
};

export const ProjectorProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ProjectorSettings>(() => {
    const saved = localStorage.getItem('projectorSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('projectorSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<ProjectorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const increaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 4, 72) }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 4, 16) }));
  };

  const applyTheme = (theme: 'dark' | 'light' | 'custom') => {
    if (theme === 'dark') {
      setSettings(prev => ({
        ...prev,
        theme,
        backgroundColor: '#000000',
        textColor: '#ffffff'
      }));
    } else if (theme === 'light') {
      setSettings(prev => ({
        ...prev,
        theme,
        backgroundColor: '#ffffff',
        textColor: '#000000'
      }));
    } else {
      setSettings(prev => ({ ...prev, theme }));
    }
  };

  return (
    <ProjectorContext.Provider
      value={{ settings, updateSettings, increaseFontSize, decreaseFontSize, applyTheme }}
    >
      {children}
    </ProjectorContext.Provider>
  );
};

// export const useProjector = () => {
//   const context = useContext(ProjectorContext);
//   if (context === undefined) {
//     throw new Error('useProjector must be used within a ProjectorProvider');
//   }
//   return context;
// };
