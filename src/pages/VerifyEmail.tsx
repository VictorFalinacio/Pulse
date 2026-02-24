import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
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
                const response = await fetch(`http://127.0.0.1:5000/api/auth/verify/${token}`);
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
        <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
            <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <div className="auth-header">
                        <h2>Verificando seu e-mail...</h2>
                        <p>Aguarde um instante.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="auth-header">
                        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                        <h2>Conta Verificada!</h2>
                        <p style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>{message}</p>
                        <Button onClick={() => navigate('/login')} fullWidth>
                            Fazer Login
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="auth-header">
                        <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
                        <h2>Falha na Verificação</h2>
                        <p style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{message}</p>
                        <Button onClick={() => navigate('/register')} variant="secondary" fullWidth>
                            Tentar Novamente
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
