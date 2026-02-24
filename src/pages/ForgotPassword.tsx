import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
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
            const response = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
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
            <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
                <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                    <div className="auth-header">
                        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                        <h2>Email Enviado!</h2>
                        <p style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>{message}</p>
                        <Button onClick={() => navigate('/login')} fullWidth>
                            Voltar para o Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
            <div className="auth-card glass-panel">
                <Button variant="ghost" onClick={() => navigate('/login')} style={{ width: 'max-content', marginBottom: '1rem', padding: '0.25rem' }}>
                    <ArrowLeft size={18} /> Voltar
                </Button>

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

                    <Button type="submit" fullWidth disabled={status === 'loading'} style={{ marginTop: '0.5rem' }}>
                        {status === 'loading' ? 'Enviando...' : (
                            <>
                                Enviar Link <ArrowRight size={18} />
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

export default ForgotPassword;
