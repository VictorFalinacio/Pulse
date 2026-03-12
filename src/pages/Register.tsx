import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { API_URL } from '../config';
import { validatePasswordStrength, getPasswordStrengthLevel } from '../utils/passwordValidator';
import Input from '../components/Input';
import Button from '../components/Button';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const navigate = useNavigate();

  // Handle password change and show validation errors
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordErrors(validation.errors);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      setError('Email inválido.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
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

  const passwordStrength = getPasswordStrengthLevel(password);

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
            <div style={{ flex: 1 }}>
              <Input
                label="Senha"
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
                    color: passwordStrength.color
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
                        backgroundColor: passwordStrength.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span>{passwordStrength.level}</span>
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
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading || !password || validatePasswordStrength(password).errors.length > 0}>
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
          gap: 6rem;
          padding: 2rem;
          min-height: 100vh;
          background: #000;
        }

        .auth-brand {
          max-width: 440px;
          padding: 2rem;
          text-align: left;
        }

        .auth-brand .brand-icon {
          margin-bottom: 2rem;
          color: var(--primary);
        }

        .auth-brand h1 {
          font-size: 3.5rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 1rem;
          letter-spacing: -0.05em;
        }

        .auth-brand p {
          color: var(--text-secondary);
          font-size: 1.25rem;
          margin-bottom: 3rem;
          line-height: 1.4;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .feature-icon {
          color: var(--primary);
        }

        .auth-card {
          width: 100%;
          max-width: 520px;
          padding: 3.5rem;
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

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: flex;
          gap: 1.25rem;
        }

        .auth-footer {
          text-align: center;
          font-size: 0.95rem;
          color: var(--text-secondary);
          padding-top: 2rem;
          border-top: 1px solid var(--card-border);
        }

        @media (max-width: 1024px) {
          .auth-container {
            flex-direction: column;
            gap: 3rem;
            padding: 4rem 1.5rem;
            justify-content: flex-start;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .auth-brand {
            padding: 0;
            text-align: center;
            max-width: 100%;
          }
          .auth-brand h1 { font-size: 2.8rem; }
          .auth-brand p { margin-bottom: 2rem; }
          .auth-card {
            padding: 2.5rem 1.5rem;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
