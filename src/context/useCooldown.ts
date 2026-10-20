import { useContext } from 'react';
import { CooldownContext } from './cooldownContextValue';

export const useCooldown = () => {
  const context = useContext(CooldownContext);
  if (!context) throw new Error('useCooldown must be used within a CooldownProvider');
  return context;
};
