import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuditLog } from '../../database/entities/AuditLog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Audit Logging Decorator Factory
 */
export const Audit = (action: string) => {
    return function (
        target: any,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const context: ExecutionContext = args[2]; // ExecutionContext is typically the 3rd argument

            if (context) {
                const request = context.switchToHttp().getRequest();
                const auditService: AuditService = (this as any).auditService;

                try {
                    const result = await originalMethod.apply(this, args);

                    // Log successful action
                    await auditService.log({
                        tenantId: request.user?.tenant_id,
                        userId: request.user?.user_id,
                        action: action as any,
                        entityType: target.constructor.name,
                        entityId: result?.id,
                        ipAddress: request.ip,
                        userAgent: request.get('user-agent'),
                        requestId: request.correlationId,
                        metadata: {
                            endpoint: request.route?.path,
                            method: request.method,
                        },
                    });

                    return result;
                } catch (error: unknown) {
                    // Log failed action
                    const auditService: AuditService = (this as any).auditService;

                    await auditService.log({
                        tenantId: request.user?.tenant_id,
                        userId: request.user?.user_id,
                        action: 'login' as any, // Generic action for failures
                        entityType: target.constructor.name,
                        ipAddress: request.ip,
                        userAgent: request.get('user-agent'),
                        requestId: request.correlationId,
                        metadata: {
                            endpoint: request.route?.path,
                            method: request.method,
                            error: error instanceof Error ? error.message : String(error),
                        },
                    });

                    throw error;
                }
            } else {
                return originalMethod.apply(this, args);
            }
        };

        return descriptor;
    };
};

/**
 * Audit Service
 */
@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {}

    /**
     * Log an audit event
     */
    async log(data: {
        tenantId: string;
        userId?: string;
        action: any;
        entityType: string;
        entityId?: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        changedFields?: string[];
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            const auditLog = this.auditLogRepository.create({
                tenantId: data.tenantId,
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                oldValues: data.oldValues,
                newValues: data.newValues,
                changedFields: data.changedFields,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                requestId: data.requestId,
                metadata: data.metadata,
            });

            await this.auditLogRepository.save(auditLog);

            this.logger.debug(`Audit log created: ${data.action} on ${data.entityType}`);
        } catch (error: unknown) {
            // Don't throw error in audit logging to avoid breaking main flow
            this.logger.error('Failed to create audit log:', error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * Get audit logs for a tenant
     */
    async getTenantAuditLogs(
        tenantId: string,
        filters: {
            userId?: string;
            action?: string;
            entityType?: string;
            startDate?: Date;
            endDate?: Date;
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{ data: AuditLog[]; total: number }> {
        const query = this.auditLogRepository
            .createQueryBuilder('auditLog')
            .where('auditLog.tenantId = :tenantId', { tenantId });

        if (filters.userId) {
            query.andWhere('auditLog.userId = :userId', { userId: filters.userId });
        }

        if (filters.action) {
            query.andWhere('auditLog.action = :action', { action: filters.action });
        }

        if (filters.entityType) {
            query.andWhere('auditLog.entityType = :entityType', {
                entityType: filters.entityType,
            });
        }

        if (filters.startDate) {
            query.andWhere('auditLog.createdAt >= :startDate', { startDate: filters.startDate });
        }

        if (filters.endDate) {
            query.andWhere('auditLog.createdAt <= :endDate', { endDate: filters.endDate });
        }

        const page = filters.page || 1;
        const limit = filters.limit || 50;

        const [data, total] = await query
            .orderBy('auditLog.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Calculate changed fields
     */
    calculateChangedFields(oldValues: Record<string, any>, newValues: Record<string, any>): string[] {
        const changedFields: string[] = [];

        const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

        for (const key of allKeys) {
            const oldValue = oldValues[key];
            const newValue = newValues[key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changedFields.push(key);
            }
        }

        return changedFields;
    }

    /**
     * Purge old audit logs (retention policy)
     */
    async purgeOldAuditLogs(retentionDays: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .execute();

        this.logger.log(`Purged ${result.affected} audit logs older than ${retentionDays} days`);

        return result.affected || 0;
    }
}
