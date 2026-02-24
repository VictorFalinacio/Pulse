import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        navigate('/register-success');
      } else {
        setError(data.msg || data.message || 'Erro ao realizar cadastro.');
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
        <p>Potencialize a entrega da sua equipe com métricas claras.</p>

        <div className="features-list">
          <div className="feature-item">
            <ShieldCheck size={20} className="feature-icon" />
            <span>Segurança garantida para os dados do seu time</span>
          </div>
          <div className="feature-item">
            <ShieldCheck size={20} className="feature-icon" />
            <span>Acompanhamento em tempo real</span>
          </div>
          <div className="feature-item">
            <ShieldCheck size={20} className="feature-icon" />
            <span>Insights de saúde das tarefas</span>
          </div>
        </div>
      </div>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Criar Conta</h2>
          <p>Informe seus dados para começar a usar</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="John Doe"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="nome@empresa.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="form-row">
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Criando conta...' : (
              <>
                Finalizar Cadastro <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <p>
            Já possui uma conta? <Link to="/login" className="btn-ghost">Fazer login</Link>
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
          overflow-y: auto;
        }

        .auth-brand {
          max-width: 440px;
          padding: 3rem;
          text-align: left;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .auth-brand .brand-icon {
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6));
        }

        .auth-brand p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-top: 0.5rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-primary);
        }

        .feature-icon {
          color: var(--success);
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin: 2rem 0;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border-left: 4px solid var(--danger);
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-row > div {
          flex: 1;
        }

        .auth-footer {
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        @media (max-width: 1000px) {
          .auth-container {
            flex-direction: column;
            gap: 2rem;
            padding: 1rem;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .auth-brand {
            padding: 1rem;
            margin-top: 2rem;
          }
          .auth-card {
            margin: 0 0 2rem 0;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
