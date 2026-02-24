import React, { type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className={`input-container ${className}`}>
      <label className="input-label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <div className={`input-wrapper ${error ? 'error' : ''}`}>
        {Icon && <Icon className="input-icon" size={20} />}
        <input className={`custom-input ${Icon ? 'with-icon' : ''}`} {...props} />
      </div>
      {error && <span className="input-error-msg">{error}</span>}

      <style>{`
        .input-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .input-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
          transition: color 0.3s ease;
        }
        .custom-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 12px;
          padding: 0.875rem 1rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }
        .custom-input.with-icon {
          padding-left: 3rem;
        }
        .custom-input:focus {
          border-color: var(--input-focus);
          box-shadow: 0 0 0 4px var(--primary-glow);
          background: rgba(15, 23, 42, 0.8);
        }
        .custom-input:focus + .input-icon, 
        .input-wrapper:focus-within .input-icon {
          color: var(--input-focus);
        }
        .input-wrapper.error .custom-input {
          border-color: var(--danger);
        }
        .input-wrapper.error .input-icon {
          color: var(--danger);
        }
        .input-error-msg {
          font-size: 0.75rem;
          color: var(--danger);
          margin-top: 0.25rem;
        }
        /* Autofill styles to preserve dark mode */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            transition: background-color 5000s ease-in-out 0s;
            -webkit-text-fill-color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Input;
