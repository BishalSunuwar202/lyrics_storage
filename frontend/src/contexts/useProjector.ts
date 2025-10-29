import { useContext } from 'react';
import { ProjectorContext } from './projector-context';

export const useProjector = () => {
  const context = useContext(ProjectorContext);
  if (context === undefined) {
    throw new Error('useProjector must be used within a ProjectorProvider');
  }
  return context;
};


