import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { apiFetch } from '../utils/api';
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
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        requireAuth: false,
        body: { email, password },
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
          align-items: flex-start;
          justify-content: center;
          flex: 1;
          gap: 6rem;
          padding: 2rem;
          padding-top: 10vh;
          min-height: 100vh;
          background: #000;
        }
        .auth-brand {
          max-width: 440px;
          padding: 2rem;
          text-align: left;
        }
        .auth-brand h1 {
          font-size: 4rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 0.5rem;
          letter-spacing: -0.05em;
        }
        .auth-brand p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .auth-brand .brand-icon { 
          margin-bottom: 2rem; 
          color: var(--primary);
        }
        .auth-card { 
          width: 100%; 
          max-width: 440px; 
          padding: 3rem; 
          display: flex; 
          flex-direction: column; 
          gap: 2.5rem; 
          background: #0a0a0a;
          border: 1px solid var(--card-border);
          border-radius: 16px;
        }
        .auth-header h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .auth-form { 
          display: flex; 
          flex-direction: column; 
          gap: 1.5rem;
        }
        .auth-forgot { display: flex; justify-content: flex-end; }
        .auth-footer { 
          text-align: center; 
          border-top: 1px solid var(--card-border); 
          padding-top: 2rem; 
          font-size: 0.95rem; 
        }

        @media (max-width: 1024px) {
          .auth-container {
            flex-direction: column;
            gap: 2rem;
            padding: 3rem 1.5rem;
            justify-content: center;
          }
          .auth-brand {
            padding: 0;
            text-align: center;
            max-width: 100%;
          }
          .auth-brand h1 {
            font-size: 3rem;
          }
          .auth-card {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
