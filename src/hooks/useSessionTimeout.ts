import { useEffect, useRef, useCallback } from 'react';

const ACTIVITY_EVENTS = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'click',
    'pointerdown',
];

/**
 * Detecta inatividade do usuário e chama `onIdle` após `timeoutMs`.
 * Reseta o timer a cada evento de atividade. Só ativo quando `enabled=true`.
 */
export function useSessionTimeout(onIdle: () => void, timeoutMs: number, enabled: boolean) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onIdleRef = useRef(onIdle);

    // Mantém referência sempre atualizada sem re-registrar listeners
    useEffect(() => {
        onIdleRef.current = onIdle;
    }, [onIdle]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs);
    }, [timeoutMs]);

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        resetTimer();

        ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [enabled, resetTimer]);
}
