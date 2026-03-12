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
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(255, 62, 62, 0.2);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 62, 62, 0.3);
          background: var(--primary-hover);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #444;
          box-shadow: none;
        }

        .btn-secondary {
          background: var(--secondary);
          color: var(--text-primary);
          border: 1px solid var(--card-border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: #2f3036;
          border-color: #444;
        }
        
        .btn-ghost {
          background: transparent;
          color: var(--text-secondary);
        }
        
        .btn-ghost:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
};

export default Button;
