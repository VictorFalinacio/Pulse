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
        <div className="min-h-screen flex flex-col items-center w-full">
            <header className="flex items-center justify-between px-8 py-4 bg-black sticky top-0 z-50 border-b border-[--card-border] w-full">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 cursor-pointer transition-transform duration-200 hover:scale-[1.02]" onClick={() => navigate('/dashboard')}>
                        <Activity size={32} color="var(--primary)" />
                        <h2 className="text-2xl m-0 font-bold tracking-tight text-white">Agile Pulse</h2>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/sprints')} 
                        className="font-semibold text-[--text-secondary] px-4 py-2 rounded-lg transition-all duration-200 hover:text-[--primary] hover:bg-[rgba(255,62,62,0.1)]"
                    >
                        Sprints
                    </Button>
                </div>
                <div className="flex items-center gap-6">
                    <span className="font-medium text-[--text-primary]">{userName}</span>
                    <Button variant="ghost" onClick={handleLogout} className="text-[--text-secondary] flex gap-2 items-center">
                        Sair <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-8 w-full max-w-[1400px] mx-auto animate-fade-in">
                <div className="mt-4 flex justify-between items-start mb-10">
                    <div className="text-left">
                        <h1 className="text-[3.2rem] mb-2 text-white font-extrabold tracking-tight">Sprints</h1>
                        <p className="text-[--text-secondary] text-lg max-w-[600px] m-0">Acompanhe o progresso das suas sprints e os resultados esperados.</p>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateModal(true)} 
                        className="flex gap-2 items-center h-fit px-7 py-4 font-bold text-base rounded-xl shadow-[0_8px_25px_rgba(255,62,62,0.25)] mt-4"
                    >
                        Criar Sprint <Plus size={18} />
                    </Button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-12 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <p className="text-[--text-secondary]">Carregando sprints...</p>
                        </div>
                    ) : sprints.length > 0 ? (
                        sprints.map((sprint) => (
                            <div 
                                key={sprint._id} 
                                className="glass-panel p-8 cursor-pointer transition-all duration-300 border border-[--card-border] flex flex-col gap-8 group hover:border-[--primary] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                                onClick={() => navigate(`/sprint/${sprint._id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-[rgba(255,62,62,0.1)] text-[--primary] p-3 rounded-xl">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="m-0 text-xl font-bold text-white">{sprint.name}</h3>
                                        <span className="text-sm text-[--text-secondary]">{sprint.durationDays} dias</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        onClick={(e) => handleDeleteSprint(e, sprint._id)}
                                        className="opacity-0 p-2 group-hover:opacity-100 hover:!text-[--danger] hover:!bg-[rgba(239,68,68,0.1)] transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm font-semibold text-[--text-secondary]">
                                            <span>Completo</span>
                                            <span>{calculateCompletion(sprint)}%</span>
                                        </div>
                                        <div className="h-2 bg-[#1a1a1a] rounded overflow-hidden">
                                            <div 
                                                className="h-full rounded transition-[width] duration-500 ease-out bg-[--primary] shadow-[0_0_10px_rgba(255,62,62,0.3)]" 
                                                style={{ width: `${calculateCompletion(sprint)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-[--card-border] text-[--text-secondary] text-sm font-medium">
                                    <span>Ver detalhes</span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-[1/-1] py-20 px-8 text-center flex flex-col items-center gap-6 bg-[#050505] border-2 border-dashed border-[--card-border] rounded-[20px]">
                            <Calendar size={48} className="text-[--text-secondary] opacity-30" />
                            <h3 className="text-2xl text-white m-0">Nenhuma sprint criada</h3>
                            <p className="text-[--text-secondary] max-w-[400px] m-0">Clique em "Criar Sprint" para começar a acompanhar seu progresso.</p>
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
        </div>
    );
};

export default Sprints;
