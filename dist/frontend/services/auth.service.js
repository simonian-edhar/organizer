"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "authService", {
    enumerable: true,
    get: function() {
        return authService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const authService = {
    /**
     * Login
     */ async login (credentials) {
        return _api.default.post('/auth/login', credentials);
    },
    /**
     * Refresh token
     */ async refreshToken (refreshToken) {
        return _api.default.post('/auth/refresh', {
            refreshToken
        });
    },
    /**
     * Logout
     */ async logout (refreshToken) {
        await _api.default.post('/auth/logout', {
            refreshToken
        });
    },
    /**
     * Logout from all devices
     */ async logoutAll () {
        await _api.default.post('/auth/logout-all');
    },
    /**
     * Forgot password
     */ async forgotPassword (data) {
        await _api.default.post('/auth/forgot-password', data);
    },
    /**
     * Reset password
     */ async resetPassword (data) {
        await _api.default.post('/auth/reset-password', data);
    },
    /**
     * Verify email
     */ async verifyEmail (data) {
        await _api.default.post('/auth/verify-email', data);
    },
    /**
     * Get current user
     */ async getMe () {
        return _api.default.get('/auth/me');
    },
    /**
     * Register - Simple email + password registration
     */ async register (credentials) {
        const response = await _api.default.post('/auth/register', credentials);
        // Store tokens after registration for auto-login
        if (response.accessToken && response.refreshToken) {
            this.setTokens(response);
        }
        return response;
    },
    /**
     * Store tokens
     */ setTokens (tokens) {
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
    },
    /**
     * Get access token
     */ getAccessToken () {
        return localStorage.getItem('access_token');
    },
    /**
     * Get refresh token
     */ getRefreshToken () {
        return localStorage.getItem('refresh_token');
    },
    /**
     * Clear tokens
     */ clearTokens () {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    /**
     * Check if user is authenticated
     */ isAuthenticated () {
        return !!localStorage.getItem('access_token');
    }
};

//# sourceMappingURL=auth.service.js.map