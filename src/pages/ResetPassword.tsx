import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';
import { validatePasswordStrength, getPasswordStrengthLevel } from '../utils/passwordValidator';
import Input from '../components/Input';
import Button from '../components/Button';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

    // Handle password change and show validation errors
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        const validation = validatePasswordStrength(value);
        setPasswordErrors(validation.errors);
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem.');
            return;
        }

        if (!token) {
            setStatus('error');
            setMessage('Token inválido ou ausente.');
            return;
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            setStatus('error');
            setMessage(passwordValidation.errors[0]);
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.msg);
            } else {
                setStatus('error');
                setMessage(data.msg || 'Erro ao redefinir a senha.');
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
                        <ShieldCheck size={80} color="var(--primary)" strokeWidth={1.5} />
                        <div className="check-badge">
                            <CheckCircle2 size={28} color="var(--success)" fill="var(--bg-main)" />
                        </div>
                    </div>

                    <div className="auth-header" style={{ textAlign: 'center' }}>
                        <h2>Senha Alterada!</h2>
                        <p className="description" style={{ color: '#94a3b8' }}>
                            {message || 'Sua senha foi redefinida com sucesso!'}
                        </p>
                    </div>

                    <div className="success-footer" style={{ width: '100%', marginTop: '1rem' }}>
                        <Button onClick={() => navigate('/login')} fullWidth className="glow-button">
                            Fazer Login <ArrowRight size={18} />
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
                            padding: 2rem 1.5rem;
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
            <div className="auth-card glass-panel reset-card">
                <button className="back-button" onClick={() => navigate('/login')}>
                    <ArrowLeft size={18} /> Voltar
                </button>

                <div className="auth-header">
                    <h2>Nova Senha</h2>
                    <p>Redefina sua senha com segurança</p>
                </div>

                {status === 'error' && (
                    <div className="error-alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset} className="auth-form">
                    <div>
                        <Input
                            label="Nova Senha"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            required
                        />
                        {password && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '12px',
                                    color: getPasswordStrengthLevel(password).color
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(getPasswordStrengthLevel(password).level === 'weak' ? 33 : getPasswordStrengthLevel(password).level === 'medium' ? 66 : 100)}%`,
                                            height: '100%',
                                            backgroundColor: getPasswordStrengthLevel(password).color,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <span>{getPasswordStrengthLevel(password).level}</span>
                                </div>
                                {passwordErrors.length > 0 && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>
                                        {passwordErrors.map((err, i) => (
                                            <div key={i}>• {err}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth disabled={status === 'loading' || !password || validatePasswordStrength(password).errors.length > 0} className="glow-button">
                        {status === 'loading' ? 'Redefinindo...' : (
                            <>
                                Redefinir Senha <ArrowRight size={18} />
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

                    .reset-card {
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
                        gap: 1rem;
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
                        margin-top: 1rem;
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
                        .reset-card {
                            padding: 2rem 1.5rem;
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

export default ResetPassword;
