import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../utils/api';

interface CooldownContextType {
    cooldown: number;
    startCooldown: (seconds?: number) => void;
    checkCooldown: () => Promise<void>;
}

const CooldownContext = createContext<CooldownContextType | undefined>(undefined);

export const CooldownProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cooldown, setCooldown] = useState(0);

    const checkCooldown = useCallback(async () => {
        const token = localStorage.getItem('agile_pulse_token');
        if (!token) return;

        try {
            const res = await apiFetch('/api/analysis/cooldown');
            if (res.ok) {
                const data = await res.json();
                if (data.onCooldown) {
                    setCooldown(data.remaining);
                }
            }
        } catch (e) {
            console.error('Erro ao verificar cooldown:', e);
        }
    }, []);

    const startCooldown = useCallback((seconds: number = 60) => {
        setCooldown(seconds);
    }, []);

    useEffect(() => {
        checkCooldown();
    }, [checkCooldown]);

    useEffect(() => {
        let timer: any;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => (prev <= 1 ? 0 : prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    return (
        <CooldownContext.Provider value={{ cooldown, startCooldown, checkCooldown }}>
            {children}
        </CooldownContext.Provider>
    );
};

export const useCooldown = () => {
    const context = useContext(CooldownContext);
    if (context === undefined) {
        throw new Error('useCooldown must be used within a CooldownProvider');
    }
    return context;
};
