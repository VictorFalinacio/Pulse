import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass-panel">
                <div className="logo-section">
                    <Activity size={32} color="var(--primary)" />
                    <h2>Agile Pulse</h2>
                </div>
                <div className="user-section">
                    <span className="user-name">Usuário</span>
                    <Button variant="ghost" onClick={handleLogout} className="logout-btn">
                        Sair <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <main className="dashboard-content animate-fade-in">
                <div className="empty-state glass-panel">
                    <h3>Dashboard</h3>
                    <p>O dashboard de monitoramento será construído aqui.</p>
                </div>
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
          border-top: none;
          border-left: none;
          border-right: none;
          background: rgba(15, 17, 26, 0.8);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-section h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .logout-btn:hover {
          color: var(--danger);
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          padding: 4rem;
          text-align: center;
          color: var(--text-secondary);
          max-width: 600px;
          width: 100%;
          border: 1px dashed var(--card-border);
        }

        .empty-state h3 {
          color: var(--text-primary);
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
