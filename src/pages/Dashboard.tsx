import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, History, FileText, ChevronRight, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';

import FileUpload from '../components/FileUpload';
import AnalysisDisplay from '../components/AnalysisDisplay';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuário');
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('agile_pulse_current_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    setUserName(user.name || 'Usuário');
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('agile_pulse_token');
      const response = await fetch(`${API_URL}/api/analysis/historico`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Limit to last 5 results as requested
        setHistory(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agile_pulse_token');
    localStorage.removeItem('agile_pulse_current_user');
    navigate('/login');
  };

  const handleAnalysisComplete = (data: any) => {
    setCurrentAnalysis(data);
    fetchHistory(); // Refresh the history list after a new analysis
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteHistory = async () => {
    setShowDeleteModal(false);
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem('agile_pulse_token');
      const response = await fetch(`${API_URL}/api/analysis/${deleteTarget}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchHistory();
        if (currentAnalysis && currentAnalysis._id === deleteTarget) {
          setCurrentAnalysis(null);
        }
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
    setDeleteTarget(null);
  };

  const handleGoHome = () => {
    setCurrentAnalysis(null);
    fetchHistory(); // Refresh just in case
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header glass-panel">
        <div className="logo-section" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
          <Activity size={32} color="var(--primary)" />
          <h2>Agile Pulse</h2>
        </div>
        <div className="user-section">
          <span className="user-name">{userName}</span>
          <Button variant="ghost" onClick={handleLogout} className="logout-btn">
            Sair <LogOut size={18} />
          </Button>
        </div>
      </header>

      <main className="dashboard-content animate-fade-in">
        {!currentAnalysis ? (
          <div className="dashboard-welcome">
            <div className="welcome-text">
              <h1>Bem-vindo, {userName}</h1>
              <p>Envie as atas de suas reuniões para extrair blockers e action items automaticamente.</p>
            </div>

            <div className="dashboard-main-grid">
              <div className="upload-section">
                <FileUpload onAnalysisComplete={handleAnalysisComplete} />
              </div>

              <div className="history-section-compact">
                <div className="section-header">
                  <History size={20} />
                  <h3>Consultas Recentes (Limite 5)</h3>
                </div>

                <div className="history-list">
                  {loadingHistory ? (
                    <div className="status-container">
                      <p className="status-text">Carregando histórico...</p>
                    </div>
                  ) : history.length > 0 ? (
                    history.map((item) => (
                      <div
                        key={item._id}
                        className="history-item glass-panel"
                        onClick={() => setCurrentAnalysis(item)}
                      >
                        <FileText size={18} className="item-icon" />
                        <div className="item-info">
                          <span className="item-name">{item.fileName}</span>
                          <span className="item-date">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="item-actions">
                          <Button
                            variant="ghost"
                            onClick={(e) => handleDeleteHistory(e, item._id)}
                            className="delete-mini-btn"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <ChevronRight size={18} className="item-arrow" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="status-container">
                      <p className="status-text">Nenhuma análise anterior.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-results">
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="mb-4 back-btn"
            >
              ← Voltar ao Início
            </Button>
            <AnalysisDisplay analysis={currentAnalysis} onDelete={handleGoHome} />
          </div>
        )}
      </main>

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
          border-radius: 0;
          background: rgba(15, 17, 26, 0.9);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--card-border);
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

        .dashboard-welcome {
          margin-top: 1rem;
        }

        .welcome-text {
          text-align: left;
          margin-bottom: 2.5rem;
        }

        .welcome-text h1 {
          font-size: 2.8rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, var(--primary-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-text p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
          align-items: start;
        }

        .history-section-compact {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--primary-light);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--card-border);
        }

        .section-header h3 {
          font-size: 1.1rem;
          margin: 0;
          font-weight: 600;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.02);
        }

        .history-item:hover {
          background: rgba(var(--primary-rgb), 0.1);
          border-color: var(--primary);
          transform: translateX(8px);
        }

        .item-icon {
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.1);
          padding: 8px;
          border-radius: 8px;
          width: 36px;
          height: 36px;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .item-arrow {
          color: var(--text-secondary);
          opacity: 0.4;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .delete-mini-btn {
          padding: 4px !important;
          color: var(--text-secondary);
          opacity: 0;
          transition: all 0.2s ease;
        }

        .history-item:hover .delete-mini-btn {
          opacity: 1;
        }

        .delete-mini-btn:hover {
          color: var(--danger) !important;
          background: rgba(var(--danger-rgb), 0.1) !important;
        }

        .status-container {
          padding: 2rem;
          text-align: center;
          border: 1px dashed var(--card-border);
          border-radius: 1rem;
        }

        .status-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .dashboard-results {
          display: flex;
          flex-direction: column;
          max-width: 900px;
          margin: 0 auto;
        }

        .back-btn {
          width: fit-content;
          color: var(--text-secondary);
        }

        .mb-4 { margin-bottom: 1.5rem; }

        @media (max-width: 1100px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          .history-section-compact {
            max-width: 600px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header { padding: 1rem; }
          .user-name { display: none; }
          .dashboard-content { padding: 1.5rem; }
          .welcome-text h1 { font-size: 2.2rem; }
          .dashboard-main-grid { gap: 3rem; }
        }
      `}</style>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Excluir Análise"
        message="Deseja realmente excluir esta análise do seu histórico? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteHistory}
        onCancel={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
      />
    </div>
  );
};

export default Dashboard;
