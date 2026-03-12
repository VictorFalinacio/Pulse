import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import Button from './Button';
import { API_URL } from '../config';

interface CreateSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (sprint: any) => void;
}

const CreateSprintModal: React.FC<CreateSprintModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [days, setDays] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/sprint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, durationDays: days })
            });

            const data = await response.json();
            if (response.ok) {
                onCreated(data);
                onClose();
            } else {
                setError(data.msg || 'Erro ao criar sprint');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <Calendar size={32} color="var(--primary)" />
                    <h3 className="modal-title">Criar Nova Sprint</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Nome da Sprint</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Sprint 24 - Mobile"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantidade de Dias (Máx 14)</label>
                        <input
                            type="number"
                            min="1"
                            max="14"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value))}
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <div className="modal-actions">
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Sprint'}
                        </Button>
                    </div>
                </form>

                <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .modal-container {
            max-width: 440px;
            width: 90%;
            padding: 2.5rem;
            background: #0a0a0a;
            border-radius: 20px;
            position: relative;
          }

          .modal-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .modal-title {
            font-size: 1.5rem;
            margin: 0;
            color: #fff;
            font-weight: 800;
          }

          .modal-close {
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
          }

          .modal-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-size: 0.9rem;
            color: var(--text-secondary);
            font-weight: 500;
          }

          .form-group input {
            background: #111;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 0.8rem 1rem;
            color: #fff;
            font-size: 1rem;
          }

          .form-group input:focus {
            outline: none;
            border-color: var(--primary);
          }

          .error-text {
            color: var(--danger);
            font-size: 0.9rem;
            margin: 0;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          .modal-actions > * {
            flex: 1;
          }
        `}</style>
            </div>
        </div>
    );
};

export default CreateSprintModal;
