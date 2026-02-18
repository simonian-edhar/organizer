/**
 * Logger Service
 * Centralized logging for the frontend application
 * Tracks errors, user actions, and performance metrics
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "logger", {
    enumerable: true,
    get: function() {
        return logger;
    }
});
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
};
let LoggerService = class LoggerService {
    /**
     * Configure the logger
     */ configure(config) {
        this.config = {
            ...this.config,
            ...config
        };
    }
    /**
     * Set user context
     */ setUser(userId, tenantId) {
        this.userId = userId;
        this.tenantId = tenantId || null;
    }
    /**
     * Log debug message
     */ debug(message, context, metadata) {
        this.log('debug', message, context, metadata);
    }
    /**
     * Log info message
     */ info(message, context, metadata) {
        this.log('info', message, context, metadata);
    }
    /**
     * Log warning message
     */ warn(message, context, metadata) {
        this.log('warn', message, context, metadata);
    }
    /**
     * Log error message
     */ error(message, error, context, metadata) {
        this.log('error', message, context, metadata, error);
    }
    /**
     * Log fatal error
     */ fatal(message, error, context, metadata) {
        this.log('fatal', message, context, metadata, error);
    }
    /**
     * Log user action
     */ userAction(action, details) {
        this.log('info', `User action: ${action}`, 'UserAction', {
            action,
            ...details
        });
    }
    /**
     * Log page view
     */ pageView(pageName, path) {
        this.log('info', `Page view: ${pageName}`, 'PageView', {
            pageName,
            path: path || window.location.pathname,
            referrer: document.referrer
        });
    }
    /**
     * Log API call
     */ apiCall(method, url, duration, status, error) {
        const level = status >= 400 ? 'error' : 'info';
        this.log(level, `API ${method} ${url}`, 'APICall', {
            method,
            url,
            duration,
            status,
            error
        });
    }
    /**
     * Log performance metric
     */ performance(metric, value, unit = 'ms') {
        this.log('info', `Performance: ${metric}`, 'Performance', {
            metric,
            value,
            unit
        });
    }
    /**
     * Core logging method
     */ log(level, message, context, metadata, error) {
        if (!this.config.enabled) return;
        if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            userId: this.userId || undefined,
            tenantId: this.tenantId || undefined,
            url: window.location.href,
            userAgent: navigator.userAgent,
            metadata
        };
        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }
        // Console output
        if (this.config.logToConsole) {
            this.logToConsole(entry);
        }
        // Buffer for server logging
        if (this.config.logToServer) {
            this.logBuffer.push(entry);
            if (this.logBuffer.length >= this.config.batchSize) {
                this.flush();
            }
        }
    }
    /**
     * Output to console with formatting
     */ logToConsole(entry) {
        const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
        const contextStr = entry.context ? ` [${entry.context}]` : '';
        const fullMessage = `${prefix}${contextStr} ${entry.message}`;
        switch(entry.level){
            case 'debug':
                console.debug(fullMessage, entry.metadata || '');
                break;
            case 'info':
                console.info(fullMessage, entry.metadata || '');
                break;
            case 'warn':
                console.warn(fullMessage, entry.metadata || '');
                break;
            case 'error':
            case 'fatal':
                console.error(fullMessage, entry.error || entry.metadata || '');
                break;
        }
    }
    /**
     * Flush logs to server
     */ async flush() {
        if (this.logBuffer.length === 0) return;
        if (!this.config.logToServer) return;
        const logsToSend = [
            ...this.logBuffer
        ];
        this.logBuffer = [];
        try {
            const response = await fetch(this.config.serverEndpoint || '/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    logs: logsToSend
                })
            });
            if (!response.ok) {
                // Re-add logs to buffer on failure
                this.logBuffer = [
                    ...logsToSend,
                    ...this.logBuffer
                ].slice(0, 100); // Limit buffer size
            }
        } catch (error) {
            // Silently fail and keep logs in buffer
            this.logBuffer = [
                ...logsToSend,
                ...this.logBuffer
            ].slice(0, 100);
        }
    }
    /**
     * Start periodic flush timer
     */ startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(()=>{
            this.flush();
        }, this.config.flushInterval);
        // Flush on page unload
        window.addEventListener('beforeunload', ()=>{
            this.flush();
        });
    }
    /**
     * Setup global error handlers
     */ setupErrorHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event)=>{
            this.error('Uncaught error', event.error || new Error(event.message), 'GlobalErrorHandler', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event)=>{
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
            this.error('Unhandled promise rejection', error, 'PromiseRejectionHandler');
        });
    }
    /**
     * Get all buffered logs
     */ getBufferedLogs() {
        return [
            ...this.logBuffer
        ];
    }
    /**
     * Clear log buffer
     */ clearBuffer() {
        this.logBuffer = [];
    }
    constructor(){
        this.config = {
            enabled: true,
            minLevel: 'info',
            logToConsole: true,
            logToServer: true,
            serverEndpoint: '/api/logs',
            batchSize: 10,
            flushInterval: 30000
        };
        this.logBuffer = [];
        this.flushTimer = null;
        this.userId = null;
        this.tenantId = null;
        this.startFlushTimer();
        this.setupErrorHandlers();
    }
};
const logger = new LoggerService();

//# sourceMappingURL=logger.service.js.map