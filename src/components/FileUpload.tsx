import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
    onAnalysisComplete: (data: any) => void;
}

import { useCooldown } from '../context/CooldownContext';
import { useUpload } from '../context/UploadContext';

const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
    const { cooldown, startCooldown } = useCooldown();
    const { uploadFile } = useUpload();
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

        try {
            await uploadFile(file, {
                onComplete: (data) => {
                    setSuccess(true);
                    startCooldown(60);
                    onAnalysisComplete(data);
                    setFile(null);
                }
            });
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
                    disabled={loading || cooldown > 0}
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
                            {cooldown > 0 ? (
                                <div className="cooldown-badge-large">
                                    <span className="cooldown-time-large">{cooldown}s</span>
                                    <span className="cooldown-text-large">Aguarde o Cooldown</span>
                                </div>
                            ) : (
                                <>
                                    <Upload size={40} className="upload-icon" />
                                    <span>Clique ou arraste um arquivo para analisar</span>
                                    <small>PDF, DOCX ou TXT (Máx 5MB)</small>
                                </>
                            )}
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
                disabled={!file || loading || cooldown > 0}
                className="upload-button"
                variant="primary"
                fullWidth
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Analisando com IA...
                    </>
                ) : cooldown > 0 ? (
                    `Aguarde ${cooldown}s `
                ) : (
                    'Gerar Relatório Ágil'
                )}
            </Button>

            <style>{`
        .file-upload-container {
          padding: 2.5rem;
          max-width: 500px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: #0a0a0a;
        }

        .drop-zone {
          border: 2px dashed var(--card-border);
          border-radius: 12px;
          position: relative;
          transition: all 0.2s ease;
          background: #050505;
        }

        .drop-zone:hover {
          border-color: var(--primary);
          background: #080808;
        }

        .drop-zone.has-file {
          border-style: solid;
          border-color: var(--primary);
          background: rgba(255, 62, 62, 0.05);
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
          padding: 4rem 1.5rem;
          cursor: pointer;
          width: 100%;
        }

        .upload-prompt, .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .upload-icon, .file-icon {
          color: var(--primary);
          opacity: 0.8;
        }

        .file-info span {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          border: 1px solid rgba(255, 107, 107, 0.2);
        }

        .success-message {
          color: #51cf66;
          background: rgba(81, 207, 102, 0.1);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          border: 1px solid rgba(81, 207, 102, 0.2);
        }

        .upload-button {
          height: 3.5rem;
          font-size: 1.1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .cooldown-badge-large {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: pulse-op 2s infinite ease-in-out;
        }

        @keyframes pulse-op {
          0% { opacity: 0.7; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(0.98); }
        }

        .cooldown-time-large {
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--primary);
          text-shadow: 0 0 20px rgba(255, 62, 62, 0.4);
          font-variant-numeric: tabular-nums;
        }

        .cooldown-text-large {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .drop-zone.disabled {
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default FileUpload;
