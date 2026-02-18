import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt.interface';
import { User } from '../../database/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

/**
 * JWT Strategy for Access Tokens
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload & { jti: string; iat: number; exp: number }): Promise<JwtPayload> {
        // Verify user still exists and is active
        const user = await this.userRepository.findOne({
            where: {
                id: payload.user_id,
                tenantId: payload.tenant_id,
                deletedAt: IsNull(),
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('User account is not active');
        }

        return {
            user_id: payload.user_id,
            tenant_id: payload.tenant_id,
            role: payload.role,
            subscription_plan: payload.subscription_plan,
            email: payload.email,
        };
    }
}
