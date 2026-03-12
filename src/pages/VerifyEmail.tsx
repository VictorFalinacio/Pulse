import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, MailCheck, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/Button';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'retry'>('loading');
    const [message, setMessage] = useState('');
    const called = useRef(false);

    useEffect(() => {
        const verifyToken = async (attempt?: number) => {
            const attemptNum = attempt || 1;
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Token de verificação não encontrado.');
                return;
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(`${API_URL}/api/auth/verify/${token}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.msg || 'Email verificado com sucesso! Você já pode fazer login.');
                } else {
                    setStatus('error');
                    setMessage(data.msg || 'Erro na verificação do token.');
                }
            } catch (err: any) {
                if (err.name === 'AbortError' || (err.message && err.message.includes('timeout'))) {
                    if (attemptNum < 3) {
                        setStatus('retry');
                        setMessage(`Tentando novamente... (${attemptNum}/3)`);
                        setTimeout(() => verifyToken(attemptNum + 1), 2000);
                    } else {
                        setStatus('success');
                        setMessage('Email verificado! Por favor, faça login para confirmar.');
                    }
                } else {
                    if (attemptNum < 3) {
                        setStatus('retry');
                        setMessage(`Tentando novamente... (${attemptNum}/3)`);
                        setTimeout(() => verifyToken(attemptNum + 1), 2000);
                    } else {
                        setStatus('error');
                        setMessage('Erro ao conectar com o servidor. Por favor, tente novamente.');
                    }
                }
            }
        };

        if (!called.current) {
            called.current = true;
            verifyToken();
        }
    }, [searchParams]);

    const handleRetry = async () => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Token de verificação não encontrado.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`${API_URL}/api/auth/verify/${token}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.msg || 'Email verificado com sucesso! Você já pode fazer login.');
            } else {
                setStatus('error');
                setMessage(data.msg || 'Erro na verificação do token.');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card status-card glass-panel">
                {status === 'loading' && (
                    <div className="status-content">
                        <div className="loading-wrapper">
                            <Loader2 size={64} color="var(--primary)" className="animate-spin" />
                        </div>
                        <h2>Verificando...</h2>
                        <p>Estamos validando seu endereço de e-mail.</p>
                    </div>
                )}

                {status === 'retry' && (
                    <div className="status-content">
                        <div className="loading-wrapper">
                            <Loader2 size={64} color="var(--primary)" className="animate-spin" />
                        </div>
                        <h2>Tentando Novamente...</h2>
                        <p>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="status-content">
                        <div className="success-icon-wrapper">
                            <MailCheck size={80} color="var(--primary)" strokeWidth={1.5} />
                            <div className="check-badge">
                                <CheckCircle2 size={28} color="var(--success)" fill="var(--bg-main)" />
                            </div>
                        </div>
                        <div className="auth-header">
                            <h2>Conta Verificada!</h2>
                            <p className="description success-text">{message || 'Email verificado com sucesso! Você já pode fazer login.'}</p>
                        </div>
                        <Button onClick={() => navigate('/login')} fullWidth className="glow-button">
                            Fazer Login <ArrowRight size={18} />
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="status-content">
                        <div className="error-icon-wrapper">
                            <ShieldAlert size={80} color="var(--danger)" strokeWidth={1.5} />
                        </div>
                        <div className="auth-header">
                            <h2>Ops! Falhou</h2>
                            <p className="description error-text">{message}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <Button onClick={handleRetry} fullWidth className="glow-button">
                                Tentar Novamente
                            </Button>
                            <Button onClick={() => navigate('/login')} variant="secondary" fullWidth>
                                Fazer Login
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #000;
                    padding: 2rem;
                }

                .status-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 4rem 3rem;
                    text-align: center;
                    background: #0a0a0a;
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
                }

                .status-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }

                .status-content h2 {
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: white;
                    letter-spacing: -0.04em;
                }

                .description {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-top: 0.5rem;
                }

                .success-text {
                    color: #51cf66 !important;
                }

                .error-text {
                    color: #ff6b6b !important;
                }

                .success-icon-wrapper, .error-icon-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }

                .check-badge {
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    background: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                }

                .loading-wrapper {
                    margin-bottom: 1rem;
                }

                .glow-button {
                    height: 3.5rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .glow-button:hover {
                    transform: translateY(-2px);
                    background: var(--primary-hover);
                    box-shadow: 0 10px 30px rgba(255, 62, 62, 0.3);
                }

                .retry-button {
                    height: 3.5rem;
                    border-radius: 10px;
                }

                .animate-spin {
                    animation: spin 2s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 600px) {
                    .auth-container {
                        padding: 1.5rem;
                    }
                    .status-card {
                        padding: 3rem 1.5rem;
                        border-radius: 16px;
                    }
                    .status-content h2 {
                        font-size: 1.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
