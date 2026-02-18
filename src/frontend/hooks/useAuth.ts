import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser, clearUser } from '../store/auth.slice';
import { authService } from '../services/auth.service';
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    User,
} from '../types/auth.types';

/**
 * Use Auth Hook
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const organization = useSelector((state: RootState) => state.auth.organization);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);
    const error = useSelector((state: RootState) => state.auth.error);

    /**
     * Login
     */
    const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
        try {
            const response: AuthResponse = await authService.login(credentials);

            // Store tokens
            authService.setTokens(response);

            // Update Redux state
            dispatch(setUser({
                user: response.user,
                organization: response.organization,
                isAuthenticated: true,
            }));

            return;
        } catch (error: any) {
            throw error;
        }
    }, [dispatch]);

    /**
     * Register - Simple registration with auto-login
     */
    const register = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
        try {
            const response: AuthResponse = await authService.register(credentials);

            // Store tokens (already done in authService, but ensure here too)
            authService.setTokens(response);

            // Update Redux state if user data is returned
            if (response.user) {
                dispatch(setUser({
                    user: response.user,
                    organization: response.organization,
                    isAuthenticated: true,
                }));
            }
        } catch (error: any) {
            throw error;
        }
    }, [dispatch]);

    /**
     * Logout
     */
    const logout = useCallback(async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear tokens
            authService.clearTokens();

            // Clear Redux state
            dispatch(clearUser());
        }
    }, [dispatch]);

    /**
     * Logout from all devices
     */
    const logoutAll = useCallback(async (): Promise<void> => {
        try {
            await authService.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            // Clear tokens
            authService.clearTokens();

            // Clear Redux state
            dispatch(clearUser());
        }
    }, [dispatch]);

    /**
     * Refresh session
     */
    const refreshSession = useCallback(async (): Promise<void> => {
        try {
            const refreshToken = authService.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await authService.refreshToken(refreshToken);

            // Update tokens
            authService.setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn,
            } as AuthResponse);
        } catch (error) {
            console.error('Session refresh error:', error);

            // Clear tokens
            authService.clearTokens();
            dispatch(clearUser());

            throw error;
        }
    }, [dispatch]);

    /**
     * Check if user has role
     */
    const hasRole = useCallback((roles: string[]): boolean => {
        return roles.includes(user?.role || '');
    }, [user?.role]);

    /**
     * Check if user has permission
     */
    const hasPermission = useCallback((permission: string): boolean => {
        // TODO: Implement permission checking
        return true;
    }, []);

    return {
        user,
        organization,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        logoutAll,
        refreshSession,
        hasRole,
        hasPermission,
    };
};
