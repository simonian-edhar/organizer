import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as Sentry from '@sentry/node';

/**
 * Sensitive data patterns that should be redacted from logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /credit[_-]?card/i,
  /ssn/i,
  /social[_-]?security/i,
];

/**
 * Redact sensitive data from log objects
 */
function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    redacted[key] = isSensitive ? '[REDACTED]' : redactSensitiveData(value);
  }
  return redacted;
}

/**
 * Create console transport with appropriate format
 */
function createConsoleTransport(isProduction: boolean): winston.transports.ConsoleTransportInstance {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
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
            ...(trace && { trace }),
          });
        }

        // Pretty format for development
        const traceStr = trace ? `\n${trace}` : '';
        const metaPretty = metaStr ? `\n${metaStr}` : '';
        return `${timestamp} [${context}] ${level}: ${message}${metaPretty}${traceStr}`;
      }),
    ),
  });
}

/**
 * Create file transport with daily rotation
 */
function createFileTransport(
  logLevel: string,
  filename: string,
  datePattern: string,
  maxSize: string,
  maxFiles: string,
): DailyRotateFile {
  return new DailyRotateFile({
    filename,
    datePattern,
    zippedArchive: true,
    maxSize,
    maxFiles,
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  });
}

/**
 * Create Sentry transport for error tracking
 */
function createSentryTransport(
  sentryDsn: string,
  environment: string,
): winston.transport | null {
  if (!sentryDsn) {
    return null;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    tracesSampleRate: 0.1,
    beforeSend(event) {
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
    },
  });

  return new winston.transports.Console({
    level: 'error',
    format: winston.format.combine(
      winston.format.printf(({ level, message, trace, ...meta }) => {
        if (level === 'error' || level === 'fatal') {
          Sentry.captureException(new Error(String(message)), {
            extra: { ...meta, ...(trace && { trace }) },
          });
        }
        return '';
      }),
    ),
  });
}

/**
 * Create Winston logger configuration
 */
export function createLoggerConfig(configService: ConfigService): winston.LoggerOptions {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const logLevel = configService.get('LOG_LEVEL', 'info');
  const logFormat = configService.get('LOG_FORMAT', 'json');
  const sentryDsn = configService.get('SENTRY_DSN', '');
  const environment = configService.get('NODE_ENV', 'development');
  const consoleOnly = configService.get('LOG_CONSOLE_ONLY', '') === 'true' || configService.get('LOG_CONSOLE_ONLY', '') === '1';

  const transports: winston.transport[] = [
    createConsoleTransport(isProduction && logFormat === 'json'),
  ];

  if (!consoleOnly) {
    // Add file transports for all logs
    transports.push(
      createFileTransport(
        logLevel,
        'logs/application-%DATE%.log',
        'YYYY-MM-DD',
        '20m',
        '14d',
      ),
    );
    transports.push(
      createFileTransport(
        'error',
        'logs/error-%DATE%.log',
        'YYYY-MM-DD',
        '20m',
        '30d',
      ),
    );
  }

  // Add Sentry transport if DSN is configured (and not a placeholder)
  const sentryTransport = sentryDsn && !sentryDsn.includes('xxxxxx') ? createSentryTransport(sentryDsn, environment) : null;
  if (sentryTransport) {
    transports.push(sentryTransport);
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
    ),
    transports,
    // Exit on error in production to prevent silent failures
    exitOnError: isProduction,
  };
}

/**
 * Create request-specific logger with context
 */
export function createContextLogger(
  logger: winston.Logger,
  context: string,
  meta?: Record<string, any>,
): winston.Logger {
  return logger.child({
    context,
    ...redactSensitiveData(meta),
  });
}

/**
 * Get log level from environment or use default
 */
export function getLogLevel(configService: ConfigService): string {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const envLogLevel = configService.get('LOG_LEVEL');

  // Use environment-specific default if not explicitly set
  if (!envLogLevel) {
    return nodeEnv === 'production' ? 'info' : 'debug';
  }

  return envLogLevel;
}

/**
 * Validate log level
 */
export function isValidLogLevel(level: string): boolean {
  const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
  return validLevels.includes(level);
}
