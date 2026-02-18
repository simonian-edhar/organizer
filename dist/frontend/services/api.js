"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get api () {
        return api;
    },
    get default () {
        return _default;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Import logger conditionally to avoid circular dependencies
let logger = null;
const getLogger = ()=>{
    if (!logger) {
        try {
            logger = require('./logger.service').logger;
        } catch  {
            // Fallback to console if logger not available
            logger = {
                apiCall: (method, url, duration, status, error)=>{
                    console.log(`[API] ${method} ${url} - ${status} (${duration}ms)${error ? ` - ${error}` : ''}`);
                },
                error: (message, error)=>{
                    console.error(message, error);
                }
            };
        }
    }
    return logger;
};
/**
 * API Client Configuration
 */ const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
let ApiClient = class ApiClient {
    /**
     * Setup request and response interceptors
     */ setupInterceptors() {
        // Request interceptor - Add auth token and logging
        this.client.interceptors.request.use((config)=>{
            // Add timestamp for duration tracking
            config.metadata = {
                startTime: Date.now()
            };
            // Add auth token
            const token = localStorage.getItem('access_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Log request in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
            }
            return config;
        }, (error)=>{
            getLogger().error('API request setup error', error, 'APIClient');
            return Promise.reject(error);
        });
        // Response interceptor - Handle logging, errors, and token refresh
        this.client.interceptors.response.use((response)=>{
            this.logResponse(response);
            return response;
        }, async (error)=>{
            return this.handleResponseError(error);
        });
    }
    /**
     * Log successful response
     */ logResponse(response) {
        const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
        getLogger().apiCall(response.config.method?.toUpperCase() || 'GET', response.config.url || '', duration, response.status);
    }
    /**
     * Handle response errors
     */ async handleResponseError(error) {
        const originalRequest = error.config;
        const duration = Date.now() - (originalRequest?.metadata?.startTime || Date.now());
        // Log error
        getLogger().apiCall(originalRequest?.method?.toUpperCase() || 'GET', originalRequest?.url || '', duration, error.response?.status || 0, error.message);
        // Log detailed error info
        if (error.response) {
            getLogger().error(`API Error: ${error.response.status}`, new Error(error.message), 'APIClient', {
                url: originalRequest?.url,
                method: originalRequest?.method,
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            getLogger().error('API Network Error', error, 'APIClient', {
                url: originalRequest?.url,
                method: originalRequest?.method
            });
        }
        // Handle 401 - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
            return this.handleTokenRefresh(originalRequest);
        }
        // Handle common errors
        this.handleCommonErrors(error);
        return Promise.reject(error);
    }
    /**
     * Handle token refresh for 401 errors
     */ async handleTokenRefresh(originalRequest) {
        originalRequest._retry = true;
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            const response = await this.client.post('/auth/refresh', {
                refreshToken
            });
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            // Update tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            getLogger().info('Token refreshed successfully', 'APIClient');
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
        } catch (refreshError) {
            getLogger().warn('Token refresh failed, redirecting to login', 'APIClient');
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }
    /**
     * Handle common HTTP errors
     */ handleCommonErrors(error) {
        const status = error.response?.status;
        switch(status){
            case 403:
                getLogger().warn('Access forbidden', 'APIClient', {
                    url: error.config?.url
                });
                break;
            case 404:
                getLogger().warn('Resource not found', 'APIClient', {
                    url: error.config?.url
                });
                break;
            case 429:
                getLogger().warn('Rate limit exceeded', 'APIClient');
                break;
            case 500:
            case 502:
            case 503:
                getLogger().error('Server error', new Error(`HTTP ${status}`), 'APIClient', {
                    url: error.config?.url
                });
                break;
        }
    }
    /**
     * GET request
     */ async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    /**
     * POST request
     */ async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    /**
     * PUT request
     */ async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    /**
     * PATCH request
     */ async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    /**
     * DELETE request
     */ async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    /**
     * Upload file
     */ async upload(url, file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await this.client.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent)=>{
                if (onProgress && progressEvent.total) {
                    const progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
                    onProgress(progress);
                }
            }
        });
        return response.data;
    }
    /**
     * Download file
     */ async download(url, filename) {
        const response = await this.client.get(url, {
            responseType: 'blob'
        });
        const urlBlob = window.URL.createObjectURL(new Blob([
            response.data
        ]));
        const link = document.createElement('a');
        link.href = urlBlob;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
    }
    constructor(){
        this.client = _axios.default.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.setupInterceptors();
    }
};
const api = new ApiClient();
const _default = api;

//# sourceMappingURL=api.js.map