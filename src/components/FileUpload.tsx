import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import { API_URL } from '../config';

interface FileUploadProps {
    onAnalysisComplete: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validation
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Formato inválido. Use PDF, DOCX ou TXT.');
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Arquivo muito grande. Limite de 5MB.');
                return;
            }

            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('agile_pulse_token');
            const response = await fetch(`${API_URL}/api/analysis/analisar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Erro ao processar arquivo');
            }

            setSuccess(true);
            onAnalysisComplete(data);
            setFile(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload-container glass-panel">
            <div className={`drop-zone ${file ? 'has-file' : ''}`}>
                <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    disabled={loading}
                />
                <label htmlFor="fileInput">
                    {file ? (
                        <div className="file-info">
                            <FileText size={40} className="file-icon" />
                            <span>{file.name}</span>
                            <small>{(file.size / 1024).toFixed(1)} KB</small>
                        </div>
                    ) : (
                        <div className="upload-prompt">
                            <Upload size={40} className="upload-icon" />
                            <span>Clique ou arraste um arquivo para analisar</span>
                            <small>PDF, DOCX ou TXT (Máx 5MB)</small>
                        </div>
                    )}
                </label>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    <CheckCircle size={18} />
                    Análise concluída com sucesso!
                </div>
            )}

            <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="upload-button"
                variant="primary"
                fullWidth
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Analisando com IA...
                    </>
                ) : (
                    'Gerar Relatório Ágil'
                )}
            </Button>

            <style>{`
        .file-upload-container {
          padding: 2rem;
          max-width: 500px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .drop-zone {
          border: 2px dashed var(--card-border);
          border-radius: 1rem;
          position: relative;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .drop-zone:hover {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
        }

        .drop-zone.has-file {
          border-style: solid;
          border-color: var(--primary);
        }

        input[type="file"] {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
        }

        label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          cursor: pointer;
          width: 100%;
        }

        .upload-prompt, .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .upload-icon, .file-icon {
          color: var(--primary);
        }

        .file-info span {
          color: var(--text-primary);
          font-weight: 500;
        }

        .error-message {
          color: var(--danger);
          background: rgba(var(--danger-rgb), 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .success-message {
          color: var(--success);
          background: rgba(var(--success-rgb), 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .upload-button {
          gap: 0.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default FileUpload;
