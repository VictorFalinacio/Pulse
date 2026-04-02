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
        <div className="min-h-screen flex flex-col w-full">
            <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black sticky top-0 z-[100] border-b border-[--card-border]">
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
                    <span className="font-medium text-[--text-primary] hidden sm:block">{userName}</span>
                    <Button variant="ghost" onClick={handleLogout} className="text-[--text-secondary] flex gap-2 items-center">
                        Sair <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-8 animate-fade-in">
                <div className="mt-4 mb-10">
                    <h1 className="text-[3.2rem] mb-2 text-white font-extrabold leading-tight tracking-tight mt-0">Sprints</h1>
                    <p className="text-[--text-secondary] text-[1.1rem] max-w-[600px] m-0">Acompanhe o progresso das suas sprints e os resultados esperados.</p>
                </div>
                <div className="flex justify-end mb-8">
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateModal(true)} 
                        className="flex gap-2 items-center justify-center h-fit px-6 py-3.5 font-bold text-[15px] rounded-xl shadow-[0_8px_20px_rgba(255,62,62,0.25)] transition-transform hover:-translate-y-0.5"
                    >
                        Criar Sprint <Plus size={18} />
                    </Button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-8">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center p-12">
                            <p className="text-[--text-secondary] text-lg animate-pulse">Carregando sprints...</p>
                        </div>
                    ) : sprints.length > 0 ? (
                        sprints.map((sprint) => (
                            <div 
                                key={sprint._id} 
                                className="glass-panel cursor-pointer transition-all duration-300 border border-[--card-border] flex flex-col group hover:border-[--primary] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[--primary-glow] overflow-hidden min-h-[220px]"
                                onClick={() => navigate(`/sprint/${sprint._id}`)}
                            >
                                <div className="p-6 flex flex-col flex-1 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[rgba(255,62,62,0.1)] text-[--primary] p-3.5 rounded-xl shrink-0 flex items-center justify-center">
                                            <Calendar size={22} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="m-0 text-xl font-bold text-white truncate">{sprint.name}</h3>
                                            <span className="text-sm font-medium text-[--text-secondary] mt-1 block">{sprint.durationDays} dias</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            onClick={(e) => handleDeleteSprint(e, sprint._id)}
                                            className="opacity-0 -mr-2 -mt-2 p-2 group-hover:opacity-100 hover:text-[--danger] hover:bg-[rgba(239,68,68,0.1)] transition-all rounded-lg shrink-0"
                                            title="Excluir Sprint"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-auto">
                                        <div className="flex justify-between items-center text-sm font-bold text-[--text-secondary]">
                                            <span>Progresso</span>
                                            <span className="text-white">{calculateCompletion(sprint)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-[width] duration-700 ease-in-out bg-[--primary] shadow-[0_0_12px_rgba(255,62,62,0.5)] relative" 
                                                style={{ width: `${calculateCompletion(sprint)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-6 py-4 bg-[--bg-panel] border-t border-[--card-border] text-[--text-secondary] text-[13px] font-semibold transition-colors group-hover:text-[--primary]">
                                    <span className="tracking-wide uppercase">Acessar Painel</span>
                                    <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 px-8 text-center flex flex-col items-center gap-6 bg-[#050505] border-2 border-dashed border-[--card-border] rounded-[24px]">
                            <div className="bg-[#111] p-6 rounded-full">
                                <Calendar size={48} className="text-[--text-secondary] opacity-40" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Nenhuma sprint no momento</h3>
                                <p className="text-[--text-secondary] max-w-[400px] m-0 text-base">Clique em "Criar Sprint" acima para inicializar seu primeiro projeto de análise.</p>
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
