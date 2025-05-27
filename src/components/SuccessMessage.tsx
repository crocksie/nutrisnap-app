import React from 'react';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  return (
    <div className="alert alert-success success-message">
      <div className="success-content">
        <i className="fas fa-check-circle success-icon"></i>
        <span className="success-text">{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="btn btn-sm btn-ghost success-close"
          aria-label="Close success message"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
