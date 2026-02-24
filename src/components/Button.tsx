import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <>
      <button
        className={`custom-btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>

      <style>{`
        .custom-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .custom-btn:focus-visible {
          box-shadow: 0 0 0 4px var(--primary-glow);
        }

        .btn-full {
          width: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.23);
          background: linear-gradient(135deg, var(--primary-hover) 0%, #4f46e5 100%);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background: #475569;
          box-shadow: none;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--card-border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .btn-ghost {
          background: transparent;
          color: var(--primary);
          padding: 0;
        }
        
        .btn-ghost:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default Button;
