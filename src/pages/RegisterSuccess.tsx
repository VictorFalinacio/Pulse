import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

const RegisterSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card success-card glass-panel">
                <div className="success-icon-wrapper">
                    <Mail size={80} color="var(--primary)" strokeWidth={1.5} />
                    <div className="check-badge">
                        <CheckCircle2 size={28} color="var(--success)" fill="var(--bg-main)" />
                    </div>
                </div>

                <div className="auth-header">
                    <h2>Quase lá!</h2>
                    <p className="description">
                        Enviamos um e-mail de confirmação para o endereço cadastrado.
                        Por favor, verifique sua caixa de entrada para ativar sua conta.
                    </p>
                </div>

                <div className="success-footer">
                    <p className="sub-description">
                        Após validar seu e-mail, você poderá acessar todas as funcionalidades do Agile Pulse.
                    </p>
                    <Button onClick={() => navigate('/login')} fullWidth className="glow-button">
                        Ir para o Login <ArrowRight size={18} />
                    </Button>
                </div>
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #000;
                    padding: 2rem;
                }

                .success-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 4rem 3rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2.5rem;
                    border: 1px solid var(--card-border);
                    background: #0a0a0a;
                    border-radius: 20px;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
                }

                .success-icon-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }

                .check-badge {
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    background: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                }

                .auth-header h2 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: white;
                    margin-bottom: 1rem;
                    letter-spacing: -0.04em;
                }

                .description {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin: 0 auto;
                }

                .success-footer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .sub-description {
                    color: #555;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .glow-button {
                    height: 3.5rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .glow-button:hover {
                    transform: translateY(-2px);
                    background: var(--primary-hover);
                    box-shadow: 0 10px 30px rgba(255, 62, 62, 0.3);
                }

                @media (max-width: 480px) {
                    .success-card {
                        padding: 3rem 1.5rem;
                        border-radius: 16px;
                    }
                    .auth-header h2 {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegisterSuccess;
