import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-brand glass-panel">
                <Activity size={48} color="var(--primary)" className="brand-icon" />
                <h1>Agile Pulse</h1>
                <p>Monitoramento avançado para times ágeis</p>
            </div>

            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <h2>Bem-vindo de volta</h2>
                    <p>Faça login para acessar o dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <Input
                        label="Email Institucional"
                        type="email"
                        placeholder="nome@empresa.com"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Senha"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="auth-forgot">
                        <a href="#" className="btn-ghost">Esqueceu a senha?</a>
                    </div>

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Entrando...' : (
                            <>
                                Entrar <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta? <Link to="/register" className="btn-ghost">Registre-se agora</Link>
                    </p>
                </div>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 4rem;
          padding: 2rem;
          min-height: 100vh;
        }

        .auth-brand {
          max-width: 400px;
          padding: 3rem;
          text-align: left;
          border: none;
          background: transparent;
          box-shadow: none;
          backdrop-filter: none;
        }

        .auth-brand .brand-icon {
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6));
        }

        .auth-brand p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-top: 0.5rem;
          line-height: 1.6;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .auth-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: -0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .auth-footer {
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        @media (max-width: 900px) {
          .auth-container {
            flex-direction: column;
            gap: 2rem;
          }
          .auth-brand {
            text-align: center;
            padding: 1rem;
          }
          .auth-brand .brand-icon {
            margin: 0 auto 1rem;
          }
        }
      `}</style>
        </div>
    );
};

export default Login;
