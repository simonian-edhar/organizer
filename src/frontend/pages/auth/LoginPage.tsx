import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { Logo } from '../../common/Logo';
import './LoginPage.css';

/**
 * Login Page Component
 */
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showMfa, setShowMfa] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login({
                email,
                password,
                mfaCode: showMfa ? mfaCode : undefined,
            });

            // Redirect to dashboard or onboarding
            navigate('/dashboard');
        } catch (err: any) {
            if (err.response?.status === 401 && err.response?.data?.message === 'Введіть код двофакторної аутентифікації') {
                setShowMfa(true);
            } else {
                setError(err.response?.data?.message || 'Не вдалося увійти');
            }
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <Logo className="login-logo" />

                    <h1 className="login-title">Вхід до системи</h1>

                    {error && (
                        <Alert type="error" className="login-alert">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            type="email"
                            label="Електронна пошта"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            autoFocus
                        />

                        <Input
                            type="password"
                            label="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введіть пароль"
                            required
                            disabled={isLoading}
                        />

                        {showMfa && (
                            <Input
                                type="text"
                                label="Код двофакторної аутентифікації"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                pattern="\d*"
                                required
                                disabled={isLoading}
                                autoFocus
                            />
                        )}

                        <div className="login-actions">
                            <label className="login-remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>Запам'ятати мене</span>
                            </label>

                            <button
                                type="button"
                                className="login-forgot-password"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                Забули пароль?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="small" />
                                    Вхід...
                                </>
                            ) : (
                                'Увійти'
                            )}
                        </Button>
                    </form>

                    <div className="login-footer">
                        <p className="login-register">
                            Немає акаунту?{' '}
                            <button
                                type="button"
                                onClick={handleRegister}
                                disabled={isLoading}
                            >
                                Зареєструватися
                            </button>
                        </p>
                    </div>
                </div>

                <div className="login-background" />
            </div>
        </div>
    );
};
