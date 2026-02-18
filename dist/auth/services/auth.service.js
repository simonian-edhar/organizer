"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Userentity = require("../../database/entities/User.entity");
const _Organizationentity = require("../../database/entities/Organization.entity");
const _RefreshTokenentity = require("../../database/entities/RefreshToken.entity");
const _Subscriptionentity = require("../../database/entities/Subscription.entity");
const _subscriptionenum = require("../../database/entities/enums/subscription.enum");
const _jwtservice = require("./jwt.service");
const _cryptoutil = require("../../common/utils/crypto.util");
const _validationutil = require("../../common/utils/validation.util");
const _auditservice = require("./audit.service");
const _logging = require("../../common/logging");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AuthService = class AuthService {
    /**
     * Register organization with admin user
     */ async registerOrganization(dto) {
        // Validate password strength
        const passwordValidation = (0, _validationutil.validatePasswordStrength)(dto.password);
        if (!passwordValidation.valid) {
            this.loggingService.logAuthEvent('login_failed', {
                email: dto.email,
                reason: 'Password too weak'
            });
            throw new _common.ConflictException('Password too weak: ' + passwordValidation.errors.join(', '));
        }
        this.loggingService.debug('Starting organization registration', {
            email: dto.email,
            organizationName: dto.name
        });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create organization
            const organization = queryRunner.manager.create(_Organizationentity.Organization, {
                name: dto.name,
                legalForm: dto.legalForm,
                edrpou: dto.edrpou,
                taxNumber: dto.taxNumber,
                address: dto.address,
                city: dto.city,
                region: dto.region,
                phone: dto.phone,
                email: dto.email,
                website: dto.website,
                subscriptionPlan: dto.subscriptionPlan || _subscriptionenum.SubscriptionPlan.BASIC,
                subscriptionStatus: _subscriptionenum.SubscriptionStatus.TRIALING,
                trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                maxUsers: dto.subscriptionPlan === _subscriptionenum.SubscriptionPlan.BASIC ? 1 : 5,
                status: 'active'
            });
            const savedOrganization = await queryRunner.manager.save(organization);
            // Create subscription record
            const subscription = queryRunner.manager.create(_Subscriptionentity.Subscription, {
                tenantId: savedOrganization.id,
                provider: _subscriptionenum.SubscriptionProvider.WAYFORPAY,
                plan: dto.subscriptionPlan || _subscriptionenum.SubscriptionPlan.BASIC,
                status: _subscriptionenum.SubscriptionStatus.TRIALING,
                trialStartAt: new Date(),
                trialEndAt: savedOrganization.trialEndAt,
                currency: 'UAH'
            });
            await queryRunner.manager.save(subscription);
            // Create admin user
            const salt = await (0, _cryptoutil.generateSalt)();
            const passwordHash = await (0, _cryptoutil.hashPassword)(dto.password, salt);
            const user = queryRunner.manager.create(_Userentity.User, {
                tenantId: savedOrganization.id,
                firstName: dto.firstName,
                lastName: dto.lastName,
                patronymic: dto.patronymic,
                email: dto.email,
                phone: dto.phone,
                passwordHash,
                salt,
                role: _subscriptionenum.UserRole.ORGANIZATION_OWNER,
                status: _subscriptionenum.UserStatus.PENDING,
                position: dto.position,
                barNumber: dto.barNumber,
                emailVerified: false,
                emailVerificationToken: (0, _cryptoutil.generateToken)(),
                lastPasswordChangeAt: new Date()
            });
            const savedUser = await queryRunner.manager.save(user);
            // Create onboarding progress
            await queryRunner.manager.getRepository('OnboardingProgress').save({
                tenantId: savedOrganization.id,
                userId: savedUser.id,
                step: 'organization_details',
                completed: true,
                completedAt: new Date(),
                percentage: 20
            });
            await queryRunner.manager.getRepository('OnboardingProgress').save({
                tenantId: savedOrganization.id,
                userId: savedUser.id,
                step: 'user_profile',
                completed: true,
                completedAt: new Date(),
                percentage: 40
            });
            await queryRunner.commitTransaction();
            this.loggingService.logBusinessEvent('create', 'Organization', savedOrganization.id, {
                tenantId: savedOrganization.id,
                userId: savedUser.id,
                subscriptionPlan: dto.subscriptionPlan
            });
            // Send verification email
            // await this.emailService.sendVerificationEmail(savedUser.email, savedUser.emailVerificationToken);
            // Log audit
            await this.auditService.log({
                tenantId: savedOrganization.id,
                userId: savedUser.id,
                action: 'create',
                entityType: 'Organization',
                entityId: savedOrganization.id,
                newValues: savedOrganization
            });
            return {
                organizationId: savedOrganization.id,
                userId: savedUser.id
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.loggingService.logError(error, {
                action: 'registerOrganization',
                email: dto.email,
                organizationName: dto.name
            });
            throw error;
        } finally{
            await queryRunner.release();
        }
    }
    /**
     * Simple register - email and password only
     * Creates a default organization for the user
     */ async register(dto) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: {
                email: dto.email.toLowerCase()
            }
        });
        if (existingUser) {
            throw new _common.ConflictException('Користувач з таким email вже існує');
        }
        // Validate password
        if (dto.password.length < 8) {
            throw new _common.ConflictException('Пароль має містити мінімум 8 символів');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create a default organization for the user
            const organization = queryRunner.manager.create(_Organizationentity.Organization, {
                name: `Особистий кабінет`,
                subscriptionPlan: _subscriptionenum.SubscriptionPlan.BASIC,
                subscriptionStatus: _subscriptionenum.SubscriptionStatus.TRIALING,
                trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                maxUsers: 1,
                status: 'active'
            });
            const savedOrganization = await queryRunner.manager.save(organization);
            // Create user
            const salt = await (0, _cryptoutil.generateSalt)();
            const passwordHash = await (0, _cryptoutil.hashPassword)(dto.password, salt);
            const user = queryRunner.manager.create(_Userentity.User, {
                tenantId: savedOrganization.id,
                email: dto.email.toLowerCase(),
                firstName: '',
                lastName: '',
                passwordHash,
                salt,
                role: _subscriptionenum.UserRole.ORGANIZATION_OWNER,
                status: _subscriptionenum.UserStatus.ACTIVE,
                emailVerified: false,
                emailVerificationToken: (0, _cryptoutil.generateToken)(),
                lastPasswordChangeAt: new Date()
            });
            const savedUser = await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            // Generate tokens for auto-login
            const accessToken = await this.jwtService.generateAccessToken({
                user_id: savedUser.id,
                tenant_id: savedOrganization.id,
                role: savedUser.role,
                subscription_plan: savedOrganization.subscriptionPlan,
                email: savedUser.email
            });
            const refreshToken = await this.jwtService.generateRefreshToken({
                user_id: savedUser.id,
                tenant_id: savedOrganization.id,
                token_id: (0, _cryptoutil.generateUuid)(),
                device_id: (0, _cryptoutil.generateDeviceFingerprint)('registration', '0.0.0.0')
            });
            // Save refresh token
            await this.refreshTokenRepository.save({
                userId: savedUser.id,
                tenantId: savedOrganization.id,
                token: refreshToken,
                deviceInfo: {
                    userAgent: 'registration',
                    ipAddress: '0.0.0.0'
                },
                ipAddress: '0.0.0.0',
                userAgent: 'registration',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            this.loggingService.logAuthEvent('register', {
                userId: savedUser.id,
                tenantId: savedOrganization.id,
                email: dto.email
            });
            return {
                userId: savedUser.id,
                accessToken,
                refreshToken
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.loggingService.logError(error, {
                action: 'register',
                email: dto.email
            });
            throw error;
        } finally{
            await queryRunner.release();
        }
    }
    /**
     * Login
     */ async login(dto, ipAddress, userAgent) {
        this.loggingService.debug('Login attempt', {
            email: dto.email,
            ipAddress
        });
        // Find user
        const user = await this.userRepository.findOne({
            where: {
                email: dto.email.toLowerCase(),
                deletedAt: null
            },
            relations: [
                'organization'
            ]
        });
        if (!user) {
            this.loggingService.logAuthEvent('login_failed', {
                email: dto.email,
                ipAddress,
                userAgent,
                reason: 'User not found'
            });
            throw new _common.UnauthorizedException('Невірний email або пароль');
        }
        // Check account status
        if (user.status === _subscriptionenum.UserStatus.SUSPENDED) {
            this.loggingService.logSecurityEvent('login_attempt_suspended', 'high', {
                userId: user.id,
                tenantId: user.tenantId,
                ipAddress,
                userAgent
            });
            throw new _common.UnauthorizedException('Акаунт призупинено. Зв\'яжіться з підтримкою.');
        }
        if (user.status === _subscriptionenum.UserStatus.DELETED) {
            throw new _common.UnauthorizedException('Акаунт видалено.');
        }
        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
            this.loggingService.logSecurityEvent('login_attempt_locked', 'medium', {
                userId: user.id,
                tenantId: user.tenantId,
                ipAddress,
                remainingMinutes,
                failedAttempts: user.failedLoginAttempts
            });
            throw new _common.UnauthorizedException(`Акаунт заблоковано на ${remainingMinutes} хвилин.`);
        }
        // Verify password
        const passwordValid = await (0, _cryptoutil.verifyPassword)(dto.password, user.salt, user.passwordHash);
        if (!passwordValid) {
            // Increment failed attempts
            await this.userRepository.increment({
                id: user.id
            }, 'failedLoginAttempts', 1);
            // Lock account if max attempts reached
            const updatedUser = await this.userRepository.findOne({
                where: {
                    id: user.id
                }
            });
            if (updatedUser.failedLoginAttempts >= 5) {
                const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                await this.userRepository.update(user.id, {
                    lockedUntil
                });
                this.loggingService.logSecurityEvent('account_locked', 'high', {
                    userId: user.id,
                    tenantId: user.tenantId,
                    ipAddress,
                    userAgent,
                    failedAttempts: updatedUser.failedLoginAttempts
                });
                throw new _common.UnauthorizedException('Забагато невдалих спроб. Акаунт заблоковано на 30 хвилин.');
            }
            // Log failed attempt
            await this.auditService.log({
                tenantId: user.tenantId,
                userId: user.id,
                action: 'login',
                entityType: 'User',
                ipAddress,
                userAgent,
                metadata: {
                    reason: 'Invalid password'
                }
            });
            this.loggingService.logAuthEvent('login_failed', {
                userId: user.id,
                tenantId: user.tenantId,
                ipAddress,
                userAgent,
                reason: 'Invalid password',
                failedAttempts: updatedUser.failedLoginAttempts + 1
            });
            throw new _common.UnauthorizedException('Невірний email або пароль');
        }
        // Verify MFA if enabled
        if (user.mfaEnabled && !dto.mfaCode) {
            this.loggingService.logAuthEvent('mfa_required', {
                userId: user.id,
                tenantId: user.tenantId,
                ipAddress,
                userAgent
            });
            throw new _common.UnauthorizedException('Введіть код двофакторної аутентифікації');
        }
        if (user.mfaEnabled && dto.mfaCode) {
            const mfaValid = await this.verifyMfaCode(user.id, dto.mfaCode);
            if (!mfaValid) {
                this.loggingService.logSecurityEvent('mfa_failed', 'medium', {
                    userId: user.id,
                    tenantId: user.tenantId,
                    ipAddress,
                    userAgent
                });
                throw new _common.UnauthorizedException('Невірний MFA код');
            }
            this.loggingService.logAuthEvent('mfa_verified', {
                userId: user.id,
                tenantId: user.tenantId,
                ipAddress,
                userAgent
            });
        }
        // Reset failed attempts
        await this.userRepository.update(user.id, {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress
        });
        // Generate tokens
        const accessToken = await this.jwtService.generateAccessToken({
            user_id: user.id,
            tenant_id: user.tenantId,
            role: user.role,
            subscription_plan: user.organization.subscriptionPlan,
            email: user.email
        });
        const refreshToken = await this.jwtService.generateRefreshToken({
            user_id: user.id,
            tenant_id: user.tenantId,
            token_id: (0, _cryptoutil.generateUuid)(),
            device_id: (0, _cryptoutil.generateDeviceFingerprint)(userAgent, ipAddress)
        });
        // Save refresh token
        const deviceId = (0, _cryptoutil.generateDeviceFingerprint)(userAgent, ipAddress);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await this.refreshTokenRepository.save({
            userId: user.id,
            tenantId: user.tenantId,
            token: refreshToken,
            deviceInfo: {
                userAgent,
                ipAddress
            },
            ipAddress,
            userAgent,
            expiresAt
        });
        // Limit number of active refresh tokens
        await this.limitRefreshTokens(user.id);
        // Log successful login
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'login',
            entityType: 'User',
            entityId: user.id,
            ipAddress,
            userAgent
        });
        this.loggingService.logAuthEvent('login', {
            userId: user.id,
            tenantId: user.tenantId,
            ipAddress,
            userAgent,
            deviceId,
            mfaEnabled: user.mfaEnabled
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
                emailVerified: user.emailVerified,
                mfaEnabled: user.mfaEnabled
            },
            organization: {
                id: user.organization.id,
                name: user.organization.name,
                subscriptionPlan: user.organization.subscriptionPlan,
                subscriptionStatus: user.organization.subscriptionStatus,
                trialEndAt: user.organization.trialEndAt?.toISOString()
            }
        };
    }
    /**
     * Refresh access token
     */ async refreshToken(dto) {
        this.loggingService.debug('Token refresh attempt', {
            tokenLength: dto.refreshToken?.length
        });
        const payload = await this.jwtService.verifyRefreshToken(dto.refreshToken);
        // Find refresh token in database
        const refreshTokenEntity = await this.refreshTokenRepository.findOne({
            where: {
                token: dto.refreshToken
            }
        });
        if (!refreshTokenEntity) {
            this.loggingService.logSecurityEvent('invalid_refresh_token', 'medium', {
                userId: payload.user_id,
                tenantId: payload.tenant_id
            });
            throw new _common.UnauthorizedException('Invalid refresh token');
        }
        // Check if token is revoked
        if (refreshTokenEntity.revokedAt) {
            this.loggingService.logSecurityEvent('revoked_refresh_token_used', 'high', {
                userId: refreshTokenEntity.userId,
                tenantId: refreshTokenEntity.tenantId,
                deviceId: payload.device_id
            });
            throw new _common.UnauthorizedException('Refresh token revoked');
        }
        // Check if token is expired
        if (refreshTokenEntity.expiresAt < new Date()) {
            throw new _common.UnauthorizedException('Refresh token expired');
        }
        // Find user
        const user = await this.userRepository.findOne({
            where: {
                id: payload.user_id,
                deletedAt: null
            },
            relations: [
                'organization'
            ]
        });
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        // Generate new tokens
        const newAccessToken = await this.jwtService.generateAccessToken({
            user_id: user.id,
            tenant_id: user.tenantId,
            role: user.role,
            subscription_plan: user.organization.subscriptionPlan,
            email: user.email
        });
        const newRefreshToken = await this.jwtService.generateRefreshToken({
            user_id: user.id,
            tenant_id: user.tenantId,
            token_id: (0, _cryptoutil.generateUuid)(),
            device_id: payload.device_id
        });
        // Revoke old refresh token
        await this.refreshTokenRepository.update({
            id: refreshTokenEntity.id
        }, {
            revokedAt: new Date()
        });
        // Save new refresh token
        await this.refreshTokenRepository.save({
            userId: user.id,
            tenantId: user.tenantId,
            token: newRefreshToken,
            deviceInfo: refreshTokenEntity.deviceInfo,
            ipAddress: refreshTokenEntity.ipAddress,
            userAgent: refreshTokenEntity.userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            replacedBy: refreshTokenEntity.id
        });
        this.loggingService.logAuthEvent('token_refresh', {
            userId: user.id,
            tenantId: user.tenantId,
            deviceId: payload.device_id
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 900
        };
    }
    /**
     * Logout
     */ async logout(userId, dto) {
        this.loggingService.logAuthEvent('logout', {
            userId
        });
        if (dto?.refreshToken) {
            await this.refreshTokenRepository.update({
                token: dto.refreshToken
            }, {
                revokedAt: new Date()
            });
        }
    }
    /**
     * Logout all devices
     */ async logoutAllDevices(userId) {
        this.loggingService.logAuthEvent('logout_all_devices', {
            userId
        });
        await this.refreshTokenRepository.update({
            userId
        }, {
            revokedAt: new Date()
        });
    }
    /**
     * Forgot password
     */ async forgotPassword(dto) {
        this.loggingService.logAuthEvent('password_reset_requested', {
            email: dto.email
        });
        const user = await this.userRepository.findOne({
            where: {
                email: dto.email.toLowerCase(),
                deletedAt: null
            }
        });
        if (!user) {
            // Don't reveal if user exists
            this.loggingService.debug('Password reset requested for non-existent user', {
                email: dto.email
            });
            return;
        }
        // Generate password reset token
        const token = (0, _cryptoutil.generateToken)();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.userRepository.update(user.id, {
            passwordResetToken: token,
            passwordResetExpiresAt: expiresAt
        });
        this.loggingService.logBusinessEvent('create', 'PasswordResetToken', token, {
            userId: user.id,
            tenantId: user.tenantId,
            expiresAt
        });
    // Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, token);
    }
    /**
     * Reset password
     */ async resetPassword(dto) {
        const user = await this.userRepository.findOne({
            where: {
                passwordResetToken: dto.token,
                deletedAt: null
            }
        });
        if (!user) {
            this.loggingService.logSecurityEvent('invalid_password_reset_token', 'medium', {
                token: dto.token.substring(0, 10) + '...'
            });
            throw new _common.UnauthorizedException('Invalid or expired token');
        }
        if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
            this.loggingService.logSecurityEvent('expired_password_reset_token', 'low', {
                userId: user.id,
                tenantId: user.tenantId
            });
            throw new _common.UnauthorizedException('Token expired');
        }
        // Validate password strength
        const passwordValidation = (0, _validationutil.validatePasswordStrength)(dto.newPassword);
        if (!passwordValidation.valid) {
            throw new _common.ConflictException('Password too weak: ' + passwordValidation.errors.join(', '));
        }
        // Hash new password
        const salt = await (0, _cryptoutil.generateSalt)();
        const passwordHash = await (0, _cryptoutil.hashPassword)(dto.newPassword, salt);
        // Update user
        await this.userRepository.update(user.id, {
            passwordHash,
            salt,
            passwordResetToken: null,
            passwordResetExpiresAt: null,
            lastPasswordChangeAt: new Date()
        });
        this.loggingService.logBusinessEvent('update', 'User', user.id, {
            tenantId: user.tenantId,
            userId: user.id,
            changedFields: [
                'password'
            ]
        });
        // Log audit
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'update',
            entityType: 'User',
            entityId: user.id,
            changedFields: [
                'password'
            ]
        });
    }
    /**
     * Verify email
     */ async verifyEmail(dto) {
        const user = await this.userRepository.findOne({
            where: {
                emailVerificationToken: dto.token,
                deletedAt: null
            },
            relations: [
                'organization'
            ]
        });
        if (!user) {
            this.loggingService.logSecurityEvent('invalid_email_verification_token', 'low', {
                token: dto.token.substring(0, 10) + '...'
            });
            throw new _common.UnauthorizedException('Invalid token');
        }
        await this.userRepository.update(user.id, {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
            status: _subscriptionenum.UserStatus.ACTIVE
        });
        this.loggingService.logBusinessEvent('update', 'User', user.id, {
            tenantId: user.tenantId,
            userId: user.id,
            changedFields: [
                'emailVerified',
                'status'
            ]
        });
        // Log audit
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'update',
            entityType: 'User',
            entityId: user.id,
            changedFields: [
                'emailVerified'
            ]
        });
    }
    /**
     * Enable MFA
     */ async enableMfa(userId) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        const secret = (0, _cryptoutil.generateTotpSecret)();
        const backupCodes = (0, _cryptoutil.generateMfaBackupCodes)();
        await this.userRepository.update(userId, {
            mfaSecret: secret,
            mfaBackupCodes: backupCodes
        });
        this.loggingService.logSecurityEvent('mfa_enabled', 'low', {
            userId,
            tenantId: user.tenantId
        });
        return {
            secret,
            backupCodes
        };
    }
    /**
     * Verify MFA code
     */ async verifyMfaCode(userId, code) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });
        if (!user || !user.mfaSecret) {
            return false;
        }
        // Verify TOTP code
        const totp = require('otpauth').totp;
        const totpInstance = new totp({
            secret: user.mfaSecret,
            digits: 6,
            period: 30,
            window: 2
        });
        const delta = totpInstance.validate({
            token: code
        });
        // Check backup codes
        if (delta === null && user.mfaBackupCodes?.includes(code)) {
            // Remove used backup code
            const updatedBackupCodes = user.mfaBackupCodes.filter((c)=>c !== code);
            await this.userRepository.update(userId, {
                mfaBackupCodes: updatedBackupCodes
            });
            this.loggingService.logSecurityEvent('mfa_backup_code_used', 'low', {
                userId,
                tenantId: user.tenantId,
                remainingCodes: updatedBackupCodes.length
            });
            return true;
        }
        return delta !== null;
    }
    /**
     * Limit number of active refresh tokens per user
     */ async limitRefreshTokens(userId, maxTokens = 5) {
        const tokens = await this.refreshTokenRepository.find({
            where: {
                userId,
                revokedAt: null
            },
            order: {
                createdAt: 'DESC'
            }
        });
        if (tokens.length > maxTokens) {
            const tokensToRevoke = tokens.slice(maxTokens);
            for (const token of tokensToRevoke){
                await this.refreshTokenRepository.update({
                    id: token.id
                }, {
                    revokedAt: new Date()
                });
            }
        }
    }
    constructor(userRepository, organizationRepository, refreshTokenRepository, subscriptionRepository, jwtService, auditService, loggingService, dataSource){
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.jwtService = jwtService;
        this.auditService = auditService;
        this.loggingService = loggingService;
        this.dataSource = dataSource;
        this.logger = new _common.Logger(AuthService.name);
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Userentity.User)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_Organizationentity.Organization)),
    _ts_param(2, (0, _typeorm.InjectRepository)(_RefreshTokenentity.RefreshToken)),
    _ts_param(3, (0, _typeorm.InjectRepository)(_Subscriptionentity.Subscription)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _jwtservice.JwtService === "undefined" ? Object : _jwtservice.JwtService,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService,
        typeof _logging.LoggingService === "undefined" ? Object : _logging.LoggingService,
        typeof _typeorm1.DataSource === "undefined" ? Object : _typeorm1.DataSource
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map