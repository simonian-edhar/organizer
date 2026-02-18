"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useAuth", {
    enumerable: true,
    get: function() {
        return useAuth;
    }
});
const _react = require("react");
const _reactredux = require("react-redux");
const _authslice = require("../store/auth.slice");
const _authservice = require("../services/auth.service");
const useAuth = ()=>{
    const dispatch = (0, _reactredux.useDispatch)();
    const user = (0, _reactredux.useSelector)((state)=>state.auth.user);
    const organization = (0, _reactredux.useSelector)((state)=>state.auth.organization);
    const isAuthenticated = (0, _reactredux.useSelector)((state)=>state.auth.isAuthenticated);
    const isLoading = (0, _reactredux.useSelector)((state)=>state.auth.isLoading);
    const error = (0, _reactredux.useSelector)((state)=>state.auth.error);
    /**
     * Login
     */ const login = (0, _react.useCallback)(async (credentials)=>{
        try {
            const response = await _authservice.authService.login(credentials);
            // Store tokens
            _authservice.authService.setTokens(response);
            // Update Redux state
            dispatch((0, _authslice.setUser)({
                user: response.user,
                organization: response.organization,
                isAuthenticated: true
            }));
            return;
        } catch (error) {
            throw error;
        }
    }, [
        dispatch
    ]);
    /**
     * Register - Simple registration with auto-login
     */ const register = (0, _react.useCallback)(async (credentials)=>{
        try {
            const response = await _authservice.authService.register(credentials);
            // Store tokens (already done in authService, but ensure here too)
            _authservice.authService.setTokens(response);
            // Update Redux state if user data is returned
            if (response.user) {
                dispatch((0, _authslice.setUser)({
                    user: response.user,
                    organization: response.organization,
                    isAuthenticated: true
                }));
            }
        } catch (error) {
            throw error;
        }
    }, [
        dispatch
    ]);
    /**
     * Logout
     */ const logout = (0, _react.useCallback)(async ()=>{
        try {
            await _authservice.authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally{
            // Clear tokens
            _authservice.authService.clearTokens();
            // Clear Redux state
            dispatch((0, _authslice.clearUser)());
        }
    }, [
        dispatch
    ]);
    /**
     * Logout from all devices
     */ const logoutAll = (0, _react.useCallback)(async ()=>{
        try {
            await _authservice.authService.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally{
            // Clear tokens
            _authservice.authService.clearTokens();
            // Clear Redux state
            dispatch((0, _authslice.clearUser)());
        }
    }, [
        dispatch
    ]);
    /**
     * Refresh session
     */ const refreshSession = (0, _react.useCallback)(async ()=>{
        try {
            const refreshToken = _authservice.authService.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            const response = await _authservice.authService.refreshToken(refreshToken);
            // Update tokens
            _authservice.authService.setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn
            });
        } catch (error) {
            console.error('Session refresh error:', error);
            // Clear tokens
            _authservice.authService.clearTokens();
            dispatch((0, _authslice.clearUser)());
            throw error;
        }
    }, [
        dispatch
    ]);
    /**
     * Check if user has role
     */ const hasRole = (0, _react.useCallback)((roles)=>{
        return roles.includes(user?.role || '');
    }, [
        user?.role
    ]);
    /**
     * Check if user has permission
     */ const hasPermission = (0, _react.useCallback)((permission)=>{
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
        hasPermission
    };
};

//# sourceMappingURL=useAuth.js.map