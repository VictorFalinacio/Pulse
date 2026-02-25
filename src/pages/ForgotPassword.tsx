import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setStatus('loading');

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.msg);
            } else {
                setStatus('error');
                setMessage(data.msg || 'Erro ao enviar email de recuperação.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Erro de conexão com o servidor.');
        }
    };

    if (status === 'success') {
        return (
            <div className="auth-container animate-fade-in">
                <div className="auth-card success-card glass-panel">
                    <div className="success-icon-wrapper">
                        <Mail size={80} color="var(--primary)" strokeWidth={1.5} />
                        <div className="check-badge">
                            <CheckCircle2 size={28} color="var(--success)" fill="var(--bg-main)" />
                        </div>
                    </div>

                    <div className="auth-header" style={{ textAlign: 'center' }}>
                        <h2>Email Enviado!</h2>
                        <p className="description" style={{ color: '#94a3b8' }}>
                            {message || 'Enviamos as instruções de recuperação para o seu e-mail.'}
                        </p>
                    </div>

                    <div className="success-footer" style={{ width: '100%', marginTop: '1rem' }}>
                        <Button onClick={() => navigate('/login')} fullWidth className="glow-button">
                            Voltar para o Login <ArrowRight size={18} />
                        </Button>
                    </div>
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
                    .success-card {
                        width: 100%;
                        max-width: 480px;
                        padding: 3.5rem 2.5rem;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2rem;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        background: rgba(23, 25, 35, 0.6);
                        backdrop-filter: blur(12px);
                        border-radius: 1.5rem;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .success-icon-wrapper {
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
                    .auth-header h2 {
                        font-size: 2.25rem;
                        font-weight: 700;
                        color: white;
                        margin-bottom: 1rem;
                    }
                    .glow-button {
                        height: 3.5rem;
                        font-size: 1.1rem;
                        font-weight: 600;
                        background: var(--primary);
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.75rem;
                        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                        border-radius: 0.75rem;
                    }
                    .glow-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
                    }
                    @media (max-width: 600px) {
                        .auth-container {
                            padding: 1rem;
                        }
                        .success-card {
                            padding: 2.5rem 1.5rem;
                            gap: 1.5rem;
                        }
                        .auth-header h2 {
                            font-size: 1.75rem;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card glass-panel forgot-card">
                <button className="back-button" onClick={() => navigate('/login')}>
                    <ArrowLeft size={18} /> Voltar ao Login
                </button>

                <div className="auth-header">
                    <h2>Recuperar Senha</h2>
                    <p>Enviaremos um link para o seu email cadastrado</p>
                </div>

                {status === 'error' && (
                    <div className="error-alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleForgot} className="auth-form">
                    <Input
                        label="Email Institucional"
                        type="email"
                        placeholder="nome@empresa.com"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth disabled={status === 'loading'} className="glow-button">
                        {status === 'loading' ? 'Enviando...' : (
                            <>
                                Enviar Link <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </form>

                <style>{`
                    .auth-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background: #0f111a;
                        padding: 2rem;
                    }

                    .forgot-card {
                        width: 100%;
                        max-width: 480px;
                        padding: 3rem;
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        background: rgba(23, 25, 35, 0.6);
                        backdrop-filter: blur(12px);
                        border-radius: 1.5rem;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }

                    .back-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: transparent;
                        border: none;
                        color: var(--primary);
                        font-weight: 600;
                        font-size: 0.95rem;
                        cursor: pointer;
                        padding: 0;
                        transition: all 0.2s;
                        width: fit-content;
                    }

                    .back-button:hover {
                        color: #a78bfa;
                        transform: translateX(-4px);
                    }

                    .auth-header h2 {
                        font-size: 2rem;
                        font-weight: 700;
                        color: white;
                        margin-bottom: 0.5rem;
                    }

                    .auth-header p {
                        color: #94a3b8;
                        font-size: 1.05rem;
                    }

                    .auth-form {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .glow-button {
                        height: 3.5rem;
                        font-size: 1.1rem;
                        font-weight: 600;
                        background: var(--primary);
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.75rem;
                        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                        border-radius: 0.75rem;
                        margin-top: 0.5rem;
                    }

                    .glow-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
                    }

                    .error-alert {
                        background: rgba(239, 68, 68, 0.1);
                        color: #fca5a5;
                        border-left: 4px solid var(--danger);
                        padding: 1rem;
                        border-radius: 0.5rem;
                        font-size: 0.875rem;
                    }
                    @media (max-width: 600px) {
                        .auth-container {
                            padding: 1rem;
                        }
                        .forgot-card {
                            padding: 2.5rem 1.5rem;
                            gap: 1.5rem;
                        }
                        .auth-header h2 {
                            font-size: 1.75rem;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ForgotPassword;
