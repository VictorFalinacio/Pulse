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
                    background: #0f111a;
                    padding: 2rem;
                }

                .success-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 3.5rem 2.5rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(23, 25, 35, 0.6);
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .success-icon-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }

                .check-badge {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    background: #0f111a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-header h2 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 1.5rem;
                }

                .description {
                    color: #94a3b8;
                    font-size: 1.05rem;
                    line-height: 1.6;
                    max-width: 90%;
                    margin: 0 auto;
                }

                .success-footer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .sub-description {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .glow-button {
                    height: 3.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    background: var(--primary);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                    border-radius: 0.75rem;
                }

                .glow-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
                    filter: brightness(1.1);
                }

                @media (max-width: 480px) {
                    .success-card {
                        padding: 2.5rem 1.5rem;
                    }
                    .auth-header h2 {
                        font-size: 1.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegisterSuccess;
