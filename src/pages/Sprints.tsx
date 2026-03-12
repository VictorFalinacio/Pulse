import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Plus, ChevronRight, Trash2, Calendar } from 'lucide-react';
import Button from '../components/Button';
import CreateSprintModal from '../components/CreateSprintModal';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';

const Sprints: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Usuário');
    const [sprints, setSprints] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('agile_pulse_current_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        setUserName(user.name || 'Usuário');
        fetchSprints();
    }, [navigate]);

    const fetchSprints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/sprint`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSprints(data);
            }
        } catch (err) {
            console.error('Erro ao buscar sprints:', err);
        } finally {
            setLoading(false);
        }
    };

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
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/sprint/${deleteTarget}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchSprints();
            }
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
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-section" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <Activity size={32} color="var(--primary)" />
                        <h2>Agile Pulse</h2>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/sprints')} 
                        className="sprints-nav-btn"
                    >
                        Sprints
                    </Button>
                </div>
                <div className="user-section">
                    <span className="user-name">{userName}</span>
                    <Button variant="ghost" onClick={handleLogout} className="logout-btn">
                        Sair <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <main className="dashboard-content animate-fade-in">
                <div className="dashboard-welcome">
                    <div className="welcome-text">
                        <h1>Sprints</h1>
                        <p>Acompanhe o progresso das suas sprints e os resultados esperados.</p>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateModal(true)} 
                        className="create-sprint-action-btn"
                    >
                        Criar Sprint <Plus size={18} />
                    </Button>
                </div>

                <div className="sprints-grid">
                    {loading ? (
                        <div className="status-container">
                            <p className="status-text">Carregando sprints...</p>
                        </div>
                    ) : sprints.length > 0 ? (
                        sprints.map((sprint) => (
                            <div 
                                key={sprint._id} 
                                className="sprint-card glass-panel"
                                onClick={() => navigate(`/sprint/${sprint._id}`)}
                            >
                                <div className="sprint-card-header">
                                    <div className="sprint-icon">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="sprint-title-info">
                                        <h3>{sprint.name}</h3>
                                        <span>{sprint.durationDays} dias</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        onClick={(e) => handleDeleteSprint(e, sprint._id)}
                                        className="delete-sprint-btn"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>

                                <div className="sprint-progress-section">
                                    <div className="progress-item">
                                        <div className="progress-labels">
                                            <span>Completo</span>
                                            <span>{calculateCompletion(sprint)}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div 
                                                className="progress-bar-fill complete" 
                                                style={{ width: `${calculateCompletion(sprint)}%` }}
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="sprint-card-footer">
                                    <span>Ver detalhes</span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Calendar size={48} className="empty-icon" />
                            <h3>Nenhuma sprint criada</h3>
                            <p>Clique em "Criar Sprint" para começar a acompanhar seu progresso.</p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                Criar Minha Primeira Sprint
                            </Button>
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

            <style>{`
                .dashboard-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 2rem;
                    background: #000;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 1px solid var(--card-border);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.2s ease;
                }

                .logo-section:hover {
                    transform: scale(1.02);
                }

                .logo-section h2 {
                    font-size: 1.5rem;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    color: #fff;
                }

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .user-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .logout-btn {
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }

                .dashboard-content {
                    flex: 1;
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                }
                
                .sprints-nav-btn {
                    font-weight: 600;
                    color: var(--text-secondary);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .sprints-nav-btn:hover, .sprints-nav-btn.active {
                    color: var(--primary);
                    background: rgba(255, 62, 62, 0.1);
                }

                .dashboard-welcome {
                    margin-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2.5rem;
                }

                .welcome-text {
                    text-align: left;
                }

                .welcome-text h1 {
                    font-size: 3.2rem;
                    margin-bottom: 0.5rem;
                    color: #fff;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                }

                .welcome-text p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0;
                }

                .create-sprint-action-btn {
                    gap: 0.5rem;
                    height: fit-content;
                    padding: 1rem 1.8rem;
                    font-weight: 700;
                    font-size: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(255, 62, 62, 0.25);
                    margin-top: 1rem;
                }

                .sprints-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 3rem;
                    margin-top: 1rem;
                }

                .sprint-card {
                    padding: 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid var(--card-border);
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .sprint-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
                }

                .sprint-card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .sprint-icon {
                    background: rgba(255, 62, 62, 0.1);
                    color: var(--primary);
                    padding: 0.75rem;
                    border-radius: 12px;
                }

                .sprint-title-info {
                    flex: 1;
                }

                .sprint-title-info h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                }

                .sprint-title-info span {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .delete-sprint-btn {
                    opacity: 0;
                    padding: 8px !important;
                }

                .sprint-card:hover .delete-sprint-btn {
                    opacity: 1;
                }

                .delete-sprint-btn:hover {
                    color: var(--danger) !important;
                    background: rgba(239, 68, 68, 0.1) !important;
                }

                .sprint-progress-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .progress-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .progress-bar-bg {
                    height: 8px;
                    background: #1a1a1a;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease-out;
                }

                .progress-bar-fill.complete {
                    background: var(--primary);
                    box-shadow: 0 0 10px rgba(255, 62, 62, 0.3);
                }


                .sprint-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid var(--card-border);
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    background: #050505;
                    border: 2px dashed var(--card-border);
                    border-radius: 20px;
                }

                .empty-icon {
                    color: var(--text-secondary);
                    opacity: 0.3;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: #fff;
                    margin: 0;
                }

                .empty-state p {
                    color: var(--text-secondary);
                    max-width: 400px;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default Sprints;
