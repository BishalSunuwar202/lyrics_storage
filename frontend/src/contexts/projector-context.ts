import { createContext } from 'react';

export interface ProjectorSettings {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  theme: 'dark' | 'light' | 'custom';
}

export interface ProjectorContextType {
  settings: ProjectorSettings;
  updateSettings: (newSettings: Partial<ProjectorSettings>) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  applyTheme: (theme: 'dark' | 'light' | 'custom') => void;
}

export const ProjectorContext = createContext<ProjectorContextType | undefined>(undefined);


