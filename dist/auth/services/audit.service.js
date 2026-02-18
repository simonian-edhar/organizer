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
    get Audit () {
        return Audit;
    },
    get AuditService () {
        return AuditService;
    }
});
const _common = require("@nestjs/common");
const _AuditLogentity = require("../../database/entities/AuditLog.entity");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
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
const Audit = (action)=>{
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function(...args) {
            const context = args[2]; // ExecutionContext is typically the 3rd argument
            if (context) {
                const request = context.switchToHttp().getRequest();
                const auditService = this.auditService;
                try {
                    const result = await originalMethod.apply(this, args);
                    // Log successful action
                    await auditService.log({
                        tenantId: request.user?.tenant_id,
                        userId: request.user?.user_id,
                        action: action,
                        entityType: target.constructor.name,
                        entityId: result?.id,
                        ipAddress: request.ip,
                        userAgent: request.get('user-agent'),
                        requestId: request.correlationId,
                        metadata: {
                            endpoint: request.route?.path,
                            method: request.method
                        }
                    });
                    return result;
                } catch (error) {
                    // Log failed action
                    const auditService = this.auditService;
                    await auditService.log({
                        tenantId: request.user?.tenant_id,
                        userId: request.user?.user_id,
                        action: 'login',
                        entityType: target.constructor.name,
                        ipAddress: request.ip,
                        userAgent: request.get('user-agent'),
                        requestId: request.correlationId,
                        metadata: {
                            endpoint: request.route?.path,
                            method: request.method,
                            error: error.message
                        }
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
let AuditService = class AuditService {
    /**
     * Log an audit event
     */ async log(data) {
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
                metadata: data.metadata
            });
            await this.auditLogRepository.save(auditLog);
            this.logger.debug(`Audit log created: ${data.action} on ${data.entityType}`);
        } catch (error) {
            // Don't throw error in audit logging to avoid breaking main flow
            this.logger.error('Failed to create audit log:', error);
        }
    }
    /**
     * Get audit logs for a tenant
     */ async getTenantAuditLogs(tenantId, filters = {}) {
        const query = this.auditLogRepository.createQueryBuilder('auditLog').where('auditLog.tenantId = :tenantId', {
            tenantId
        });
        if (filters.userId) {
            query.andWhere('auditLog.userId = :userId', {
                userId: filters.userId
            });
        }
        if (filters.action) {
            query.andWhere('auditLog.action = :action', {
                action: filters.action
            });
        }
        if (filters.entityType) {
            query.andWhere('auditLog.entityType = :entityType', {
                entityType: filters.entityType
            });
        }
        if (filters.startDate) {
            query.andWhere('auditLog.createdAt >= :startDate', {
                startDate: filters.startDate
            });
        }
        if (filters.endDate) {
            query.andWhere('auditLog.createdAt <= :endDate', {
                endDate: filters.endDate
            });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const [data, total] = await query.orderBy('auditLog.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
        return {
            data,
            total
        };
    }
    /**
     * Calculate changed fields
     */ calculateChangedFields(oldValues, newValues) {
        const changedFields = [];
        const allKeys = new Set([
            ...Object.keys(oldValues),
            ...Object.keys(newValues)
        ]);
        for (const key of allKeys){
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
     */ async purgeOldAuditLogs(retentionDays = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await this.auditLogRepository.createQueryBuilder().delete().where('createdAt < :cutoffDate', {
            cutoffDate
        }).execute();
        this.logger.log(`Purged ${result.affected} audit logs older than ${retentionDays} days`);
        return result.affected || 0;
    }
    constructor(auditLogRepository){
        this.auditLogRepository = auditLogRepository;
        this.logger = new _common.Logger(AuditService.name);
    }
};
AuditService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_AuditLogentity.AuditLog)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], AuditService);

//# sourceMappingURL=audit.service.js.map