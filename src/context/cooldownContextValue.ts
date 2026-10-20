import { createContext } from 'react';

export interface CooldownContextType {
  cooldown: number;
  startCooldown: (seconds?: number) => void;
  checkCooldown: () => Promise<void>;
}

export const CooldownContext = createContext<CooldownContextType | undefined>(undefined);
