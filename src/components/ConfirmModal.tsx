import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className={`modal-icon ${variant}`}>
                    <AlertTriangle size={32} />
                </div>

                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <button className={`modal-confirm-btn ${variant}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>

                <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: overlayIn 0.2s ease-out;
          }

          @keyframes overlayIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-container {
            max-width: 440px;
            width: 90%;
            padding: 3rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            position: relative;
            background: #0a0a0a;
            border-radius: 20px;
            animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          .modal-close {
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .modal-close:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.05);
          }

          .modal-icon {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .modal-icon.danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
          }

          .modal-icon.info {
            background: rgba(255, 62, 62, 0.1);
            color: var(--primary);
          }

          .modal-title {
            font-size: 1.5rem;
            margin: 0;
            color: #fff;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .modal-message {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin: 0;
            max-width: 100%;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            width: 100%;
            justify-content: stretch;
          }

          .modal-actions > * {
            flex: 1;
          }

          .modal-confirm-btn {
            padding: 0.75rem 1.75rem;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .modal-confirm-btn.danger {
            background: var(--danger);
            color: #fff;
          }

          .modal-confirm-btn.danger:hover {
            background: #d93939;
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
          }

          .modal-confirm-btn.info {
            background: var(--primary);
            color: #fff;
          }

          .modal-confirm-btn.info:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(255, 62, 62, 0.2);
          }
        `}</style>
            </div>
        </div>
    );
};

export default ConfirmModal;
