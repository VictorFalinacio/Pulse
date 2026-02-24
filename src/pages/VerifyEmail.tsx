import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, MailCheck, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/Button';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const called = useRef(false);

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Token de verificação não encontrado.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.msg);
                } else {
                    setStatus('error');
                    setMessage(data.msg || 'Erro na verificação do token.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Erro de conexão com o servidor.');
            }
        };

        if (!called.current) {
            called.current = true;
            verifyToken();
        }
    }, [searchParams]);

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
                        <Button onClick={() => navigate('/register')} variant="secondary" fullWidth className="retry-button">
                            Tentar Novamente
                        </Button>
                    </div>
                )}
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #0f111a;
                    padding: 2rem;
                }

                .status-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 3.5rem 2.5rem;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(23, 25, 35, 0.6);
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .status-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }

                .status-content h2 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: white;
                }

                .description {
                    color: #94a3b8;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-top: 0.5rem;
                }

                .success-text {
                    color: #10b981 !important;
                }

                .error-text {
                    color: #fca5a5 !important;
                }

                .success-icon-wrapper, .error-icon-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }

                .check-badge {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    background: #0f111a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .loading-wrapper {
                    margin-bottom: 1rem;
                }

                .glow-button {
                    height: 3.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    background: var(--primary);
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    border-radius: 0.75rem;
                }

                .glow-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
                }

                .retry-button {
                    height: 3.5rem;
                    border-radius: 0.75rem;
                }

                .animate-spin {
                    animation: spin 2s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
