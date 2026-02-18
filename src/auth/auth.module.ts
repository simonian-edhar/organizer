import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { User } from '../database/entities/User.entity';
import { Organization } from '../database/entities/Organization.entity';
import { RefreshToken } from '../database/entities/RefreshToken.entity';
import { Subscription } from '../database/entities/Subscription.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { OnboardingProgress } from '../database/entities/OnboardingProgress.entity';

// Services
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { OrganizationService } from './services/organization.service';
import { AuditService } from './services/audit.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { OrganizationController } from './controllers/organization.controller';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

// Guards
import { JwtAuthGuard } from './guards';
import { TenantGuard, RbacGuard, SubscriptionGuard } from './guards';

/**
 * Auth Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Organization,
            RefreshToken,
            Subscription,
            AuditLog,
            OnboardingProgress,
        ]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                const nodeEnv = configService.get<string>('NODE_ENV', 'development');

                // CRITICAL: Fail in production if JWT_SECRET is not set
                if (!secret) {
                    if (nodeEnv === 'production') {
                        throw new Error('FATAL: JWT_SECRET environment variable is required in production');
                    }
                    console.warn('WARNING: Using default JWT secret in development mode. Set JWT_SECRET for production!');
                }

                return {
                    secret: secret || 'dev-only-secret-key-not-for-production',
                    signOptions: {
                        expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '15m'),
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController, OrganizationController],
    providers: [
        AuthService,
        JwtService,
        OrganizationService,
        AuditService,
        JwtStrategy,
        RefreshStrategy,
        JwtAuthGuard,
        TenantGuard,
        RbacGuard,
        SubscriptionGuard,
    ],
    exports: [
        AuthService,
        JwtService,
        OrganizationService,
        AuditService,
        JwtAuthGuard,
        TenantGuard,
        RbacGuard,
        SubscriptionGuard,
    ],
})
export class AuthModule {}
