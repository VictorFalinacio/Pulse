import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Plus, ChevronRight, Trash2, Calendar } from 'lucide-react';
import Button from '../components/Button';
import CreateSprintModal from '../components/CreateSprintModal';
import ConfirmModal from '../components/ConfirmModal';
import { apiFetch } from '../utils/api';

const Sprints: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Usuário');
    const [sprints, setSprints] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchSprints = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/sprint');
            if (response.ok) {
                const data = await response.json();
                setSprints(data);
            }
        } catch (err) {
            console.error('Erro ao buscar sprints:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('agile_pulse_current_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        setUserName(user.name || 'Usuário');
        fetchSprints();
    }, [navigate, fetchSprints]);

    const handleLogout = () => {
        localStorage.removeItem('agile_pulse_token');
        localStorage.removeItem('agile_pulse_current_user');
        navigate('/login');
    };

    const handleDeleteSprint = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteTarget(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteSprint = async () => {
        if (!deleteTarget) return;
        try {
            const response = await apiFetch(`/api/sprint/${deleteTarget}`, { method: 'DELETE' });
            if (response.ok) fetchSprints();
        } catch (err) {
            console.error('Erro ao excluir sprint:', err);
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const calculateCompletion = (sprint: any) => {
        if (!sprint.durationDays) return 0;
        const uploadCount = sprint.uploads?.length || 0;
        return Math.min(Math.round((uploadCount / sprint.durationDays) * 100), 100);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="app-header">
                <div className="header-left">
                    <div className="logo" onClick={() => navigate('/dashboard')}>
                        <Activity size={32} color="var(--primary)" />
                        <h2>Agile Pulse</h2>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/sprints')} className="nav-btn">
                        Sprints
                    </Button>
                </div>
                <div className="header-right">
                    <span className="user-name">{userName}</span>
                    <Button variant="ghost" onClick={handleLogout} className="logout-btn">
                        Sair <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <main className="sprints-content animate-fade-in">
                <div className="sprints-hero">
                    <div>
                        <h1>Sprints</h1>
                        <p>Acompanhe o progresso das suas sprints e os resultados esperados.</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Criar Sprint <Plus size={18} />
                    </Button>
                </div>

                <div className="sprints-grid">
                    {loading ? (
                        <div className="sprints-loading">
                            <p>Carregando sprints...</p>
                        </div>
                    ) : sprints.length > 0 ? (
                        sprints.map((sprint) => (
                            <div
                                key={sprint._id}
                                className="sprint-card"
                                onClick={() => navigate(`/sprint/${sprint._id}`)}
                            >
                                <div className="sprint-card-body">
                                    <div className="sprint-card-header">
                                        <div className="sprint-icon">
                                            <Calendar size={22} strokeWidth={2.5} />
                                        </div>
                                        <div className="sprint-info">
                                            <h3>{sprint.name}</h3>
                                            <span>{sprint.durationDays} dias</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={(e) => handleDeleteSprint(e, sprint._id)}
                                            className="sprint-delete-btn"
                                            title="Excluir Sprint"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>

                                    <div className="sprint-progress">
                                        <div className="sprint-progress-label">
                                            <span>Progresso</span>
                                            <span className="sprint-progress-value">{calculateCompletion(sprint)}%</span>
                                        </div>
                                        <div className="sprint-progress-bar">
                                            <div
                                                className="sprint-progress-fill"
                                                style={{ width: `${calculateCompletion(sprint)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="sprint-card-footer">
                                    <span>Acessar Painel</span>
                                    <ChevronRight size={16} strokeWidth={3} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="sprints-empty">
                            <div className="sprints-empty-icon">
                                <Calendar size={48} />
                            </div>
                            <div>
                                <h3>Nenhuma sprint no momento</h3>
                                <p>Clique em "Criar Sprint" acima para inicializar seu primeiro projeto de análise.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <CreateSprintModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={(newSprint) => {
                    setSprints([newSprint, ...sprints]);
                    navigate(`/sprint/${newSprint._id}`);
                }}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Excluir Sprint"
                message="Deseja realmente excluir esta sprint? Todo o histórico de uploads desta sprint será perdido."
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmDeleteSprint}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default Sprints;
