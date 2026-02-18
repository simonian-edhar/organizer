import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Environment Variables Validator
 * Validates critical environment variables on application startup
 */
@Injectable()
export class EnvironmentValidator {
    private readonly logger = new Logger(EnvironmentValidator.name);

    constructor(private readonly configService: ConfigService) {}

    /**
     * Validate all required environment variables
     * Throws error if critical variables are missing in production
     */
    validate(): void {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';

        this.logger.log(`Validating environment variables for ${nodeEnv} environment`);

        const errors: string[] = [];

        // Critical security variables
        this.validateVariable('JWT_SECRET', isProduction, errors, {
            minLength: 32,
            description: 'JWT secret key for access tokens',
        });

        this.validateVariable('JWT_REFRESH_SECRET', isProduction, errors, {
            minLength: 32,
            description: 'JWT secret key for refresh tokens',
        });

        // Database configuration
        this.validateVariable('DB_TYPE', isProduction, errors);
        this.validateVariable('DB_NAME', isProduction, errors);

        if (this.configService.get<string>('DB_TYPE') === 'postgres') {
            this.validateVariable('DB_HOST', isProduction, errors);
            this.validateVariable('DB_PORT', isProduction, errors);
            this.validateVariable('DB_USER', isProduction, errors);
            this.validateVariable('DB_PASSWORD', isProduction, errors, { sensitive: true });
        }

        // Application URL
        this.validateVariable('APP_URL', isProduction, errors);

        // Email configuration (critical for password reset)
        this.validateVariable('SMTP_HOST', isProduction, errors);
        this.validateVariable('SMTP_PORT', isProduction, errors);
        this.validateVariable('SMTP_USER', isProduction, errors);
        this.validateVariable('SMTP_PASSWORD', isProduction, errors, { sensitive: true });

        // File storage configuration
        this.validateVariable('STORAGE_PROVIDER', isProduction, errors);

        if (this.configService.get<string>('STORAGE_PROVIDER') === 's3') {
            this.validateVariable('AWS_S3_BUCKET', isProduction, errors);
            this.validateVariable('AWS_ACCESS_KEY_ID', isProduction, errors);
            this.validateVariable('AWS_SECRET_ACCESS_KEY', isProduction, errors, { sensitive: true });
            this.validateVariable('AWS_REGION', isProduction, errors);
        }

        // Stripe configuration (if billing is enabled)
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (stripeKey) {
            this.logger.log('Stripe payment integration detected');
        }

        // WayForPay configuration (if billing is enabled)
        const wayforpayMerchant = this.configService.get<string>('WAYFORPAY_MERCHANT_ACCOUNT');
        if (wayforpayMerchant) {
            this.logger.log('WayForPay payment integration detected');
        }

        // Security warnings
        this.checkSecurityWarnings();

        // Report errors
        if (errors.length > 0) {
            const errorMessage = `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;
            this.logger.error(errorMessage);

            if (isProduction) {
                throw new Error(`FATAL: ${errorMessage}`);
            } else {
                this.logger.warn('Continuing in development mode despite missing environment variables');
            }
        } else {
            this.logger.log('Environment validation successful');
        }
    }

    /**
     * Validate a single environment variable
     */
    private validateVariable(
        key: string,
        isProduction: boolean,
        errors: string[],
        options?: {
            minLength?: number;
            sensitive?: boolean;
            description?: string;
        }
    ): void {
        const value = this.configService.get<string>(key);

        if (!value) {
            const message = options?.description
                ? `${key} (${options.description}) is required`
                : `${key} is required`;
            errors.push(message);
            return;
        }

        if (options?.minLength && value.length < options.minLength) {
            errors.push(
                `${key} must be at least ${options.minLength} characters long (currently ${value.length})`
            );
        }

        // Log non-sensitive values
        if (!options?.sensitive) {
            this.logger.debug(`${key} = ${value}`);
        } else {
            this.logger.debug(`${key} = [REDACTED]`);
        }
    }

    /**
     * Check for security warnings
     */
    private checkSecurityWarnings(): void {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        const dbSync = this.configService.get<string>('DB_SYNC', 'true');

        // Warn about default secrets
        if (jwtSecret && (jwtSecret.includes('your-secret') || jwtSecret.includes('dev-only'))) {
            this.logger.warn(
                'WARNING: Using default/weak JWT secret. Set a strong, unique JWT_SECRET in production!'
            );
        }

        // Warn about database synchronization in production
        if (nodeEnv === 'production' && dbSync !== 'false') {
            this.logger.warn(
                'WARNING: DB_SYNC is enabled in production. This should be disabled for safety!'
            );
        }

        // Warn about development mode
        if (nodeEnv === 'development') {
            this.logger.warn(
                'Running in DEVELOPMENT mode. Do not use this configuration in production!'
            );
        }

        // Check CORS configuration
        const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS');
        if (!allowedOrigins && nodeEnv === 'production') {
            this.logger.warn(
                'WARNING: ALLOWED_ORIGINS is not set. CORS will accept all origins in production!'
            );
        }

        // Check rate limiting
        const throttleLimit = this.configService.get<number>('THROTTLE_LIMIT', 100);
        if (throttleLimit > 200 && nodeEnv === 'production') {
            this.logger.warn(
                `WARNING: THROTTLE_LIMIT is very high (${throttleLimit}). Consider lowering for better security.`
            );
        }

        // Check encryption
        const encryptPii = this.configService.get<string>('ENCRYPT_PII');
        if (!encryptPii || encryptPii === 'false') {
            this.logger.warn(
                'WARNING: PII encryption is disabled. Enable ENCRYPT_PII=true for GDPR compliance in production.'
            );
        }
    }
}
