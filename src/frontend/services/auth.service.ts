import api from './api';
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    RefreshTokenResponse,
    ForgotPasswordData,
    ResetPasswordData,
    VerifyEmailData,
    User,
} from '../types/auth.types';

/**
 * Auth Service
 */
export const authService = {
    /**
     * Login
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/login', credentials);
    },

    /**
     * Refresh token
     */
    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        return api.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    },

    /**
     * Logout
     */
    async logout(refreshToken?: string): Promise<void> {
        await api.post<void>('/auth/logout', { refreshToken });
    },

    /**
     * Logout from all devices
     */
    async logoutAll(): Promise<void> {
        await api.post<void>('/auth/logout-all');
    },

    /**
     * Forgot password
     */
    async forgotPassword(data: ForgotPasswordData): Promise<void> {
        await api.post<void>('/auth/forgot-password', data);
    },

    /**
     * Reset password
     */
    async resetPassword(data: ResetPasswordData): Promise<void> {
        await api.post<void>('/auth/reset-password', data);
    },

    /**
     * Verify email
     */
    async verifyEmail(data: VerifyEmailData): Promise<void> {
        await api.post<void>('/auth/verify-email', data);
    },

    /**
     * Get current user
     */
    async getMe(): Promise<User> {
        return api.get<User>('/auth/me');
    },

    /**
     * Register - Simple email + password registration
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', credentials);

        // Store tokens after registration for auto-login
        if (response.accessToken && response.refreshToken) {
            this.setTokens(response);
        }

        return response;
    },

    /**
     * Store tokens
     */
    setTokens(tokens: AuthResponse): void {
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
    },

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    },

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    },

    /**
     * Clear tokens
     */
    clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },
};
