import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, FileText, Calendar, Printer, Trash2 } from 'lucide-react';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { API_URL } from '../config';

interface AnalysisDisplayProps {
  analysis: any;
  onDelete?: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!analysis) return null;

  const handleDownload = () => {
    const element = document.createElement("a");
    const htmlContent = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px;">
          ${analysis.summary.replace(/\n/g, '<br>')}
        </body>
      </html>
    `;
    const file = new Blob([htmlContent], { type: 'application/msword' });
    element.href = URL.createObjectURL(file);
    element.download = `Relatorio_Agile_${analysis.fileName.split('.')[0]}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem('agile_pulse_token');
      const response = await fetch(`${API_URL}/api/analysis/${analysis._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (onDelete) onDelete();
      } else {
        setErrorMsg('Erro ao excluir a análise. Tente novamente.');
        setShowError(true);
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
      setErrorMsg('Erro de conexão com o servidor.');
      setShowError(true);
    }
  };

  return (
    <div className="analysis-display glass-panel animate-fade-in printable">
      <div className="analysis-actions no-print">
        <Button onClick={handleDownload} variant="ghost">
          <Download size={18} /> Baixar .doc
        </Button>
        <Button onClick={handlePrint} variant="ghost">
          <Printer size={18} /> Imprimir / PDF
        </Button>
        <Button onClick={() => setShowDeleteConfirm(true)} variant="ghost" className="delete-btn-action">
          <Trash2 size={18} /> Excluir
        </Button>
      </div>

      <div className="analysis-header">
        <div className="analysis-title-group">
          <FileText size={28} className="icon-pulse" />
          <h3>Relatório de Análise Ágil</h3>
        </div>
        <div className="analysis-meta">
          <span className="analysis-file"><FileText size={14} /> {analysis.fileName}</span>
          <span className="analysis-date"><Calendar size={14} /> {new Date(analysis.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="markdown-content">
        <ReactMarkdown>{analysis.summary}</ReactMarkdown>
      </div>

      <style>{`
        .analysis-display {
          margin: 2rem auto;
          max-width: 900px;
          padding: 3.5rem;
          background: #0a0a0a;
          border: 1px solid var(--card-border);
          border-radius: 16px;
          color: #fff;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          position: relative;
        }

        .analysis-actions {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          display: flex;
          gap: 0.75rem;
        }

        .analysis-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--card-border);
        }

        .analysis-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .analysis-title-group h3 {
          font-size: 2rem;
          margin: 0;
          color: #fff;
          font-weight: 800;
        }

        .analysis-meta {
          display: flex;
          gap: 2rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .analysis-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .markdown-content {
          line-height: 1.8;
          font-size: 1.1rem;
          color: #d1d1d1;
        }

        /* Professional Report Styling */
        .markdown-content h1 { 
          font-size: 2.4rem; 
          margin-bottom: 1.5rem; 
          color: #fff; 
          font-weight: 800;
        }
        
        .markdown-content h2 { 
          font-size: 1.8rem; 
          margin-top: 3.5rem; 
          margin-bottom: 1.5rem;
          color: #fff;
          border-bottom: 2px solid var(--primary);
          width: fit-content;
          padding-bottom: 0.25rem;
        }
        
        .markdown-content h3 { 
          font-size: 1.3rem; 
          margin-top: 2.5rem; 
          margin-bottom: 1.25rem;
          color: var(--primary); 
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .markdown-content hr {
          border: 0;
          height: 1px;
          background: var(--card-border);
          margin: 4rem 0;
        }

        .markdown-content blockquote {
          border-left: 3px solid var(--primary);
          padding: 1.5rem 2rem;
          background: #111;
          margin: 2rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #fff;
        }

        .markdown-content strong {
          color: #fff;
          font-weight: 700;
        }

        .markdown-content ul {
          list-style: none;
          padding-left: 0;
          margin: 1.5rem 0;
        }

        .markdown-content li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 1rem;
        }

        .markdown-content li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .analysis-display { 
            box-shadow: none !important; 
            border: none !important; 
            background: white !important; 
            color: black !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .markdown-content { color: black !important; }
          .markdown-content h3 { background: #f1f5f9 !important; border-left: 4px solid #3b82f6 !important; }
          .analysis-title-group h3 { -webkit-text-fill-color: black !important; }
        }

        @media (max-width: 768px) {
          .analysis-display { padding: 1.5rem; margin-top: 4rem; }
          .analysis-actions { top: -3.5rem; right: 0; width: 100%; justify-content: center; flex-wrap: wrap; }
          .analysis-meta { flex-direction: column; gap: 0.5rem; }
        }

        .delete-btn-action:hover {
          color: var(--danger) !important;
          background: rgba(var(--danger-rgb), 0.1) !important;
        }
      `}</style>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Excluir Análise"
        message="Tem certeza que deseja excluir esta análise permanentemente? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={showError}
        title="Erro"
        message={errorMsg}
        confirmText="Entendi"
        cancelText="Fechar"
        variant="info"
        onConfirm={() => setShowError(false)}
        onCancel={() => setShowError(false)}
      />
    </div>
  );
};

export default AnalysisDisplay;
