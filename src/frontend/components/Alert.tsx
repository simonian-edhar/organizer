import React from 'react';

interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    children: React.ReactNode;
    onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
    type = 'info',
    children,
    onClose,
}) => {
    const typeClasses = {
        info: 'alert-info',
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-error',
    };

    return (
        <div className={`alert ${typeClasses[type]}`}>
            <div className="alert-content">{children}</div>
            {onClose && (
                <button className="alert-close" onClick={onClose}>
                    ×
                </button>
            )}
        </div>
    );
};
