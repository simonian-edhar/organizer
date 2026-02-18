"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuditLogSubscriber", {
    enumerable: true,
    get: function() {
        return AuditLogSubscriber;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _AuditLogentity = require("../../database/entities/AuditLog.entity");
const _userevents = require("../events/user.events");
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
let AuditLogSubscriber = class AuditLogSubscriber {
    async handleAuditLogEvent(event) {
        try {
            const auditLog = this.auditLogRepository.create({
                tenantId: event.tenantId,
                userId: event.userId,
                action: event.action,
                entityType: event.entityType,
                entityId: event.entityId,
                newValues: event.newValues,
                oldValues: event.oldValues,
                changedFields: event.changedFields,
                createdAt: event.timestamp
            });
            await this.auditLogRepository.save(auditLog);
            // Stream to SIEM (Enterprise feature)
            if (this.isEnterpriseEnabled()) {
                await this.streamToSIEM(auditLog);
            }
            // Send to WebSocket for real-time updates
            if (this.isRealTimeEnabled()) {
                await this.sendToWebSocket(event.tenantId, auditLog);
            }
        } catch (error) {
            console.error('Failed to process audit log event:', error);
        // TODO: Add to dead letter queue
        }
    }
    isEnterpriseEnabled() {
        return process.env.ENTERPRISE_MODE === 'true';
    }
    isRealTimeEnabled() {
        return process.env.ENABLE_REAL_TIME_AUDIT === 'true';
    }
    async streamToSIEM(auditLog) {
    // TODO: Implement SIEM streaming (Elasticsearch, Splunk, etc.)
    }
    async sendToWebSocket(tenantId, auditLog) {
    // TODO: Implement WebSocket notification
    }
    constructor(eventBus, auditLogRepository){
        this.eventBus = eventBus;
        this.auditLogRepository = auditLogRepository;
        this.eventBus.subscribe(_userevents.AuditLogEvent, this.handleAuditLogEvent.bind(this));
    }
};
AuditLogSubscriber = _ts_decorate([
    (0, _cqrs.EventSubscriber)(_userevents.AuditLogEvent),
    _ts_param(1, (0, _typeorm.InjectRepository)(_AuditLogentity.AuditLog)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cqrs.EventBus === "undefined" ? Object : _cqrs.EventBus,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], AuditLogSubscriber);

//# sourceMappingURL=audit-log.subscriber.js.map