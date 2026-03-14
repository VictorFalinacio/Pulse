import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, Activity, Plus, Upload, CheckCircle, FileText, Download, Printer, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import CreateSprintModal from '../components/CreateSprintModal';
import AnalysisDisplay from '../components/AnalysisDisplay';
import { API_URL } from '../config';

import { useCooldown } from '../context/CooldownContext';
import { useUpload } from '../context/UploadContext';

const SprintDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { cooldown, startCooldown, checkCooldown } = useCooldown();
    const { uploadFile } = useUpload();
    const [userName, setUserName] = useState('Usuário');
    const [sprint, setSprint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingDay, setUploadingDay] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const analysisRef = useRef<any>(null);

    useEffect(() => {
        checkCooldown();
    }, [checkCooldown]);

    const fetchSprint = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/sprint/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSprint(data);

                // Set current analysis to the latest upload if exists
                if (data.uploads && data.uploads.length > 0) {
                    const latest = [...data.uploads].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
                    setCurrentAnalysis(latest.analysisId);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar sprint:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const storedUser = localStorage.getItem('agile_pulse_current_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        setUserName(user.name || 'Usuário');
        fetchSprint();
    }, [navigate, fetchSprint]);

    const handleLogout = () => {
        localStorage.removeItem('agile_pulse_token');
        localStorage.removeItem('agile_pulse_current_user');
        navigate('/login');
    };

    const handleUploadClick = (day: number) => {
        if (cooldown > 0) return;
        if (uploadingDay !== null) return;
        setUploadingDay(day);

        const handleFocus = () => {
            setTimeout(() => {
                if (fileInputRef.current && fileInputRef.current.files?.length === 0) {
                    setUploadingDay(null);
                }
                window.removeEventListener('focus', handleFocus);
            }, 300);
        };

        window.addEventListener('focus', handleFocus);
        
        // Timeout prevents immediately triggering the focus event
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }, 100);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && uploadingDay !== null) {
            const file = e.target.files[0];
            const day = uploadingDay;

            try {
                await uploadFile(file, {
                    day,
                    sprintId: id,
                    onComplete: (data) => {
                        setSprint(data.sprint);
                        setCurrentAnalysis(data.analysis);
                        startCooldown(60);
                    }
                });
            } catch (err: any) {
                console.error('Erro no upload:', err);
                alert(err.message || 'Erro de conexão ao fazer upload.');
            } finally {
                setUploadingDay(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } else {
            setUploadingDay(null);
        }
    };

    const calculateCompletion = () => {
        if (!sprint || !sprint.durationDays) return 0;
        const uploadCount = sprint.uploads?.length || 0;
        return Math.min(Math.round((uploadCount / sprint.durationDays) * 100), 100);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <Loader2 className="animate-spin" size={48} />
                <p>Carregando Dashboard...</p>
            </div>
        );
    }

    if (!sprint) {
        return <div className="error-screen">Sprint não encontrada.</div>;
    }

    const days = Array.from({ length: sprint.durationDays }, (_, i) => i + 1);

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
                <div className="sprint-dashboard-layout">
                    <div className="sprint-main-content">
                        <div className="sprint-info-header">
                            <h1>{sprint.name}</h1>
                            <div className="sprint-progress-overview">
                                <div className="progress-stat">
                                    <div className="stat-labels">
                                        <span>Completo</span>
                                        <span>{calculateCompletion()}%</span>
                                    </div>
                                    <div className="stat-bar-bg">
                                        <div className="stat-bar-fill complete" style={{ width: `${calculateCompletion()}%` }} />
                                    </div>
                                    <small>Dia {sprint.uploads?.length || 0} de {sprint.durationDays}</small>
                                </div>
                            </div>
                        </div>

                        <div className="upload-grid-container">
                            <div className="upload-grid">
                                {days.map((day) => {
                                    const uploadData = sprint.uploads?.find((u: any) => u.day === day);
                                    return (
                                        <div key={day} className="upload-day-box">
                                            <span className="day-label">Dia {day} - Upload</span>
                                            <div
                                                className={`upload-square ${uploadData ? 'uploaded' : ''} ${uploadingDay === day ? 'uploading' : ''} ${cooldown > 0 && !uploadData ? 'disabled' : ''}`}
                                                onClick={() => handleUploadClick(day)}
                                            >
                                                {uploadingDay === day ? (
                                                    <Loader2 className="animate-spin" size={32} />
                                                ) : uploadData ? (
                                                    <div className="upload-success-content">
                                                        <div className="check-badge">
                                                            <CheckCircle size={14} />
                                                        </div>
                                                        <Upload size={24} />
                                                        <span className="file-name">{uploadData.fileName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="upload-placeholder">
                                                        {cooldown > 0 ? (
                                                            <div className="cooldown-badge">
                                                                <span className="cooldown-time">{cooldown}s</span>
                                                                <span className="cooldown-text">Aguarde</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload size={24} />
                                                                <Plus size={12} className="plus-icon" />
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="sprint-summary-sidebar">
                        <div className="sidebar-header">
                            <h3>Resumo da Sprint</h3>
                            <div className="sidebar-actions">
                                <Button
                                    variant="ghost"
                                    className="icon-btn"
                                    title="Baixar PDF"
                                    onClick={() => analysisRef.current?.download()}
                                >
                                    <Download size={18} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="icon-btn"
                                    title="Imprimir"
                                    onClick={() => analysisRef.current?.print()}
                                >
                                    <Printer size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="summary-content">
                            {sprint.aggregatedSummary ? (
                                <div className="analysis-wrapper">
                                    <AnalysisDisplay
                                        analysis={{
                                            summary: sprint.aggregatedSummary,
                                            fileName: sprint.name,
                                            createdAt: sprint.updatedAt || sprint.createdAt
                                        }}
                                        hideActions={true}
                                        ref={analysisRef}
                                    />
                                </div>
                            ) : currentAnalysis ? (
                                <div className="analysis-wrapper">
                                    <AnalysisDisplay
                                        analysis={currentAnalysis}
                                        hideActions={true}
                                        ref={analysisRef}
                                    />
                                </div>
                            ) : (
                                <div className="empty-summary">
                                    <FileText size={48} />
                                    <p>Faça um upload para gerar o resumo automático da sprint.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
            />

            <CreateSprintModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={(newSprint) => {
                    navigate(`/sprint/${newSprint._id}`);
                }}
            />

            <style>{`
                .loading-screen, .error-screen {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    color: var(--text-secondary);
                }

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

                .sprints-nav-btn {
                    font-weight: 600;
                    color: var(--text-secondary);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .sprints-nav-btn:hover {
                    color: var(--primary);
                    background: rgba(255, 62, 62, 0.1);
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

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .sprint-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 550px;
                    gap: 3rem;
                    align-items: start;
                }

                .sprint-info-header {
                    margin-bottom: 2.5rem;
                }

                .sprint-info-header h1 {
                    font-size: 2.5rem;
                    color: #fff;
                    margin-bottom: 2rem;
                    font-weight: 800;
                }

                .sprint-progress-overview {
                    display: flex;
                    gap: 3rem;
                    max-width: 800px;
                }

                .progress-stat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .stat-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .stat-bar-bg {
                    height: 8px;
                    background: #1a1a1a;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .stat-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                }

                .stat-bar-fill.complete { background: var(--primary); }
                .stat-bar-fill.expected { background: #3b82f6; }

                .progress-stat small {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    text-align: right;
                }

                .upload-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .upload-day-box {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .day-label {
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .upload-square {
                    aspect-ratio: 1.2;
                    background: #0a0a0a;
                    border: 1px solid var(--card-border);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .upload-square:hover {
                    background: #111;
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }

                .upload-square.uploaded {
                    background: rgba(30, 126, 78, 0.1);
                    border-color: #1e7e4e;
                    color: #fff;
                }
                
                .upload-square.uploaded:hover {
                    background: rgba(30, 126, 78, 0.2);
                }

                .upload-square.disabled {
                    cursor: not-allowed;
                    background: rgba(255, 255, 255, 0.02);
                    border-color: #333;
                }

                .upload-square.disabled:hover {
                    transform: none;
                    border-color: #444;
                }

                .cooldown-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.2rem;
                    animation: pulse-border 2s infinite ease-in-out;
                }

                @keyframes pulse-border {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }

                .cooldown-time {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--primary);
                    font-variant-numeric: tabular-nums;
                }

                .cooldown-text {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 700;
                    color: var(--text-secondary);
                }

                .upload-square.uploading {
                    background: #050505;
                    cursor: wait;
                }

                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: var(--text-secondary);
                    position: relative;
                    opacity: 0.5;
                }

                .plus-icon {
                    margin-top: -8px;
                }

                .upload-success-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    width: 100%;
                    padding: 0.75rem;
                    color: #1e7e4e;
                }

                .check-badge {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    background: #1e7e4e;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 18px;
                    width: 18px;
                }

                .file-name {
                    font-weight: 600;
                    font-size: 0.75rem;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: var(--text-primary);
                }

                .sprint-summary-sidebar {
                    background: #0a0a0a;
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 100px;
                    max-height: calc(100vh - 120px);
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--card-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sidebar-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .sidebar-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .icon-btn { padding: 8px !important; }

                .summary-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .empty-summary {
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .analysis-wrapper { margin-top: -2rem; }

                @media (max-width: 1200px) {
                    .sprint-dashboard-layout {
                        grid-template-columns: 1fr;
                    }
                    .sprint-summary-sidebar {
                        position: static;
                        max-height: none;
                    }
                }
                
                @media (max-width: 768px) {
                    .upload-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default SprintDashboard;
