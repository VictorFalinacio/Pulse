import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

const RegisterSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container animate-fade-in" style={{ justifyContent: 'center' }}>
            <div className="auth-card glass-panel" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <div className="auth-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={64} color="var(--primary)" />
                            <CheckCircle
                                size={24}
                                color="var(--success)"
                                style={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    background: 'var(--bg-main)',
                                    borderRadius: '50%'
                                }}
                            />
                        </div>
                    </div>
                    <h2>Quase lá!</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '1rem' }}>
                        Enviamos um e-mail de confirmação para o endereço cadastrado.
                        Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
                    </p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Após validar seu e-mail, você poderá acessar todas as funcionalidades do Agile Pulse.
                    </p>
                    <Button onClick={() => navigate('/login')} fullWidth>
                        Ir para o Login <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </Button>
                </div>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 2rem;
          min-height: 100vh;
        }
        .auth-card {
          width: 100%;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .auth-header p {
          color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
};

export default RegisterSuccess;
