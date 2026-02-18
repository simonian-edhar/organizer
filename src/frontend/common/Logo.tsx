import React from 'react';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'dark' }) => {
    const sizes = {
        small: { width: 120, height: 40, fontSize: 16 },
        medium: { width: 180, height: 60, fontSize: 24 },
        large: { width: 240, height: 80, fontSize: 32 },
    };

    const { width, height, fontSize } = sizes[size];
    const color = variant === 'light' ? '#ffffff' : '#1f2937';

    return (
        <div
            className="logo"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width,
                height,
            }}
        >
            <div
                style={{
                    width: height * 0.7,
                    height: height * 0.7,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: fontSize * 0.8,
                }}
            >
                LO
            </div>
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: fontSize,
                        fontWeight: 'bold',
                        color,
                        lineHeight: 1.2,
                    }}
                >
                    LAW
                </div>
                <div
                    style={{
                        fontSize: fontSize * 0.6,
                        color: variant === 'light' ? 'rgba(255,255,255,0.8)' : '#6b7280',
                        lineHeight: 1.2,
                    }}
                >
                    ORGANIZER
                </div>
            </div>
        </div>
    );
};
