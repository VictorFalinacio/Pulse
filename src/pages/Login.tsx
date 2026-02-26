import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { API_URL } from '../config';
import Input from '../components/Input';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('agile_pulse_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('agile_pulse_token', data.token);
        localStorage.setItem('agile_pulse_current_user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.msg || data.message || 'Erro ao realizar login.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

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
            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Esqueceu a senha?
            </Link>
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
          background: transparent;
        }
        .auth-brand .brand-icon { margin-bottom: 1.5rem; filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6)); }
        .auth-card { width: 100%; max-width: 440px; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
        .error-alert { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border-left: 4px solid var(--danger); padding: 1rem; border-radius: 4px; font-size: 0.875rem; }
        .auth-forgot { display: flex; justify-content: flex-end; margin-bottom: 1.5rem; }
        .auth-footer { text-align: center; border-top: 1px solid var(--card-border); padding-top: 1.5rem; font-size: 0.875rem; }

        @media (max-width: 1000px) {
          .auth-container {
            flex-direction: column;
            gap: 2rem;
            padding: 1.5rem;
            justify-content: flex-start;
          }
          .auth-brand {
            padding: 2rem 1rem 1rem 1rem;
            text-align: center;
            max-width: 100%;
          }
          .auth-brand h1 {
            font-size: 2.5rem;
          }
          .auth-card {
            padding: 2rem 1.5rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
