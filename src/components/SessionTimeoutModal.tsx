import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import Button from './Button';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    onStayLoggedIn: () => void;
    onLogout: () => void;
    countdownSeconds?: number;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
    isOpen,
    onStayLoggedIn,
    onLogout,
    countdownSeconds = 60,
}) => {
    const [remaining, setRemaining] = useState(countdownSeconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setRemaining(countdownSeconds);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setRemaining(countdownSeconds);

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isOpen, countdownSeconds, onLogout]);

    if (!isOpen) return null;

    const progress = (remaining / countdownSeconds) * 100;
    const isUrgent = remaining <= 15;

    return (
        <div className="session-modal-overlay">
            <div className="session-modal-container glass-panel">
                <div className={`session-modal-icon ${isUrgent ? 'urgent' : ''}`}>
                    <Clock size={32} />
                </div>

                <div className="session-modal-text">
                    <h3>Sessão expirando</h3>
                    <p>
                        Você ficou inativo por um tempo. Por segurança, sua sessão será encerrada em:
                    </p>
                </div>

                <div className="session-countdown">
                    <span className={`session-countdown-number ${isUrgent ? 'urgent' : ''}`}>
                        {remaining}s
                    </span>
                    <div className="session-progress-bar">
                        <div
                            className={`session-progress-fill ${isUrgent ? 'urgent' : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="session-modal-actions">
                    <Button variant="ghost" onClick={onLogout} className="session-logout-btn">
                        Sair agora
                    </Button>
                    <Button variant="primary" onClick={onStayLoggedIn} className="session-stay-btn">
                        Continuar sessão
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutModal;
