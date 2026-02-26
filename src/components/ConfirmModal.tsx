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
            padding: 2.5rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            position: relative;
            animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .modal-close:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.1);
          }

          .modal-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .modal-icon.danger {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
          }

          .modal-icon.info {
            background: rgba(var(--primary-rgb), 0.15);
            color: var(--primary);
          }

          .modal-title {
            font-size: 1.3rem;
            margin: 0;
            color: var(--text-primary);
            font-weight: 600;
          }

          .modal-message {
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
            max-width: 360px;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            width: 100%;
            justify-content: center;
          }

          .modal-confirm-btn {
            padding: 0.75rem 1.75rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .modal-confirm-btn.danger {
            background: #ef4444;
            color: #fff;
          }

          .modal-confirm-btn.danger:hover {
            background: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }

          .modal-confirm-btn.info {
            background: var(--primary);
            color: #fff;
          }

          .modal-confirm-btn.info:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }
        `}</style>
            </div>
        </div>
    );
};

export default ConfirmModal;
