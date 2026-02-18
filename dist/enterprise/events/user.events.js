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
    get AuditLogEvent () {
        return AuditLogEvent;
    },
    get UserCreatedEvent () {
        return UserCreatedEvent;
    },
    get UserDeletedEvent () {
        return UserDeletedEvent;
    },
    get UserUpdatedEvent () {
        return UserUpdatedEvent;
    }
});
let UserCreatedEvent = class UserCreatedEvent {
    constructor(userId, tenantId, firstName, lastName, email, role, createdAt){
        this.userId = userId;
        this.tenantId = tenantId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }
};
let UserUpdatedEvent = class UserUpdatedEvent {
    constructor(userId, tenantId, changes, updatedAt){
        this.userId = userId;
        this.tenantId = tenantId;
        this.changes = changes;
        this.updatedAt = updatedAt;
    }
};
let UserDeletedEvent = class UserDeletedEvent {
    constructor(userId, tenantId, deletedAt){
        this.userId = userId;
        this.tenantId = tenantId;
        this.deletedAt = deletedAt;
    }
};
let AuditLogEvent = class AuditLogEvent {
    constructor(tenantId, userId, action, entityType, entityId, newValues, oldValues, changedFields, timestamp){
        this.tenantId = tenantId;
        this.userId = userId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.newValues = newValues;
        this.oldValues = oldValues;
        this.changedFields = changedFields;
        this.timestamp = timestamp;
    }
};

//# sourceMappingURL=user.events.js.map