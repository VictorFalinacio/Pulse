import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
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

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
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
            <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
                <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                    <div className="auth-header">
                        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                        <h2>Senha Redefinida!</h2>
                        <p style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>{message}</p>
                        <Button onClick={() => navigate('/login')} fullWidth>
                            Fazer Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <h2>Nova Senha</h2>
                    <p>Crie uma nova senha para sua conta</p>
                </div>

                {status === 'error' && (
                    <div className="error-alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset} className="auth-form">
                    <Input
                        label="Nova Senha"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth disabled={status === 'loading'} style={{ marginTop: '1rem' }}>
                        {status === 'loading' ? 'Redefinindo...' : (
                            <>
                                Redefinir Senha <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </form>

                <style>{`
          .error-alert {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            border-left: 4px solid var(--danger);
            padding: 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
        `}</style>
            </div>
        </div>
    );
};

export default ResetPassword;
