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
    get createContextLogger () {
        return createContextLogger;
    },
    get createLoggerConfig () {
        return createLoggerConfig;
    },
    get getLogLevel () {
        return getLogLevel;
    },
    get isValidLogLevel () {
        return isValidLogLevel;
    }
});
const _winston = /*#__PURE__*/ _interop_require_wildcard(require("winston"));
const _winstondailyrotatefile = /*#__PURE__*/ _interop_require_default(require("winston-daily-rotate-file"));
const _node = /*#__PURE__*/ _interop_require_wildcard(require("@sentry/node"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
/**
 * Sensitive data patterns that should be redacted from logs
 */ const SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /authorization/i,
    /credit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i
];
/**
 * Redact sensitive data from log objects
 */ function redactSensitiveData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map((item)=>redactSensitiveData(item));
    }
    const redacted = {};
    for (const [key, value] of Object.entries(data)){
        const isSensitive = SENSITIVE_PATTERNS.some((pattern)=>pattern.test(key));
        redacted[key] = isSensitive ? '[REDACTED]' : redactSensitiveData(value);
    }
    return redacted;
}
/**
 * Create console transport with appropriate format
 */ function createConsoleTransport(isProduction) {
    return new _winston.transports.Console({
        format: _winston.format.combine(_winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }), _winston.format.errors({
            stack: true
        }), _winston.format.printf(({ timestamp, level, message, context, trace, ...meta })=>{
            const metaObj = redactSensitiveData(meta);
            const metaStr = Object.keys(metaObj).length ? JSON.stringify(metaObj, null, 2) : '';
            if (isProduction) {
                // JSON format for production
                return JSON.stringify({
                    timestamp,
                    level,
                    context,
                    message,
                    ...metaObj,
                    ...trace && {
                        trace
                    }
                });
            }
            // Pretty format for development
            const traceStr = trace ? `\n${trace}` : '';
            const metaPretty = metaStr ? `\n${metaStr}` : '';
            return `${timestamp} [${context}] ${level}: ${message}${metaPretty}${traceStr}`;
        }))
    });
}
/**
 * Create file transport with daily rotation
 */ function createFileTransport(logLevel, filename, datePattern, maxSize, maxFiles) {
    return new _winstondailyrotatefile.default({
        filename,
        datePattern,
        zippedArchive: true,
        maxSize,
        maxFiles,
        level: logLevel,
        format: _winston.format.combine(_winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }), _winston.format.errors({
            stack: true
        }), _winston.format.json())
    });
}
/**
 * Create Sentry transport for error tracking
 */ function createSentryTransport(sentryDsn, environment) {
    if (!sentryDsn) {
        return null;
    }
    _node.init({
        dsn: sentryDsn,
        environment,
        tracesSampleRate: 0.1,
        beforeSend (event) {
            // Redact sensitive data from Sentry events
            if (event.request) {
                event.request.headers = redactSensitiveData(event.request.headers);
                if (event.request.cookies) {
                    event.request.cookies = redactSensitiveData(event.request.cookies);
                }
            }
            if (event.user) {
                event.user = redactSensitiveData(event.user);
            }
            return event;
        }
    });
    return new _winston.transports.Console({
        level: 'error',
        format: _winston.format.combine(_winston.format.printf(({ level, message, trace, ...meta })=>{
            if (level === 'error' || level === 'fatal') {
                _node.captureException(new Error(message), {
                    extra: {
                        ...meta,
                        ...trace && {
                            trace
                        }
                    }
                });
            }
            return '';
        }))
    });
}
function createLoggerConfig(configService) {
    const isProduction = configService.get('NODE_ENV') === 'production';
    const logLevel = configService.get('LOG_LEVEL', 'info');
    const logFormat = configService.get('LOG_FORMAT', 'json');
    const sentryDsn = configService.get('SENTRY_DSN', '');
    const environment = configService.get('NODE_ENV', 'development');
    const consoleOnly = configService.get('LOG_CONSOLE_ONLY', '') === 'true' || configService.get('LOG_CONSOLE_ONLY', '') === '1';
    const transports = [
        createConsoleTransport(isProduction && logFormat === 'json')
    ];
    if (!consoleOnly) {
        // Add file transports for all logs
        transports.push(createFileTransport(logLevel, 'logs/application-%DATE%.log', 'YYYY-MM-DD', '20m', '14d'));
        transports.push(createFileTransport('error', 'logs/error-%DATE%.log', 'YYYY-MM-DD', '20m', '30d'));
    }
    // Add Sentry transport if DSN is configured (and not a placeholder)
    const sentryTransport = sentryDsn && !sentryDsn.includes('xxxxxx') ? createSentryTransport(sentryDsn, environment) : null;
    if (sentryTransport) {
        transports.push(sentryTransport);
    }
    return {
        level: logLevel,
        format: _winston.format.combine(_winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }), _winston.format.errors({
            stack: true
        }), _winston.format.splat()),
        transports,
        // Exit on error in production to prevent silent failures
        exitOnError: isProduction
    };
}
function createContextLogger(logger, context, meta) {
    return logger.child({
        context,
        ...redactSensitiveData(meta)
    });
}
function getLogLevel(configService) {
    const nodeEnv = configService.get('NODE_ENV', 'development');
    const envLogLevel = configService.get('LOG_LEVEL');
    // Use environment-specific default if not explicitly set
    if (!envLogLevel) {
        return nodeEnv === 'production' ? 'info' : 'debug';
    }
    return envLogLevel;
}
function isValidLogLevel(level) {
    const validLevels = [
        'error',
        'warn',
        'info',
        'http',
        'verbose',
        'debug',
        'silly'
    ];
    return validLevels.includes(level);
}

//# sourceMappingURL=logger.config.js.map