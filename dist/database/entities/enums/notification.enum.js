"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Notification", {
    enumerable: true,
    get: function() {
        return Notification;
    }
});
const _typeorm = require("typeorm");
const _Userentity = require("./User.entity");
const _Organizationentity = require("./Organization.entity");
const _notificationenum = require("./notification.enum");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Notification = class Notification {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)('uuid'),
    _ts_metadata("design:type", String)
], Notification.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'tenant_id',
        type: 'uuid'
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'user_id',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "userId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'device_id',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "deviceId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'platform',
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "platform", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'user_email',
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "userEmail", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'user_phone',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "userPhone", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'enum',
        enum: _notificationenum.NotificationType
    }),
    _ts_metadata("design:type", typeof _notificationenum.NotificationType === "undefined" ? Object : _notificationenum.NotificationType)
], Notification.prototype, "type", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'enum',
        enum: _notificationenum.NotificationStatus
    }),
    _ts_metadata("design:type", typeof _notificationenum.NotificationStatus === "undefined" ? Object : _notificationenum.NotificationStatus)
], Notification.prototype, "status", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'enum',
        enum: _notificationenum.NotificationPriority,
        default: 'normal'
    }),
    _ts_metadata("design:type", typeof _notificationenum.NotificationPriority === "undefined" ? Object : _notificationenum.NotificationPriority)
], Notification.prototype, "priority", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'enum',
        enum: _notificationenum.NotificationChannel,
        default: 'email'
    }),
    _ts_metadata("design:type", typeof _notificationenum.NotificationChannel === "undefined" ? Object : _notificationenum.NotificationChannel)
], Notification.prototype, "channel", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 500
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "title", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text'
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "body", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], Notification.prototype, "data", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'template_id',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "templateId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'from_email',
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "fromEmail", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'to_phone',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "toPhone", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'device_token',
        type: 'varchar',
        length: 500,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "deviceToken", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'read_at',
        type: 'timestamptz',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "readAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'delivered_at',
        type: 'timestamptz',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "deliveredAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'opened_at',
        type: 'timestamptz',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "openedAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'clicked_at',
        type: 'timestamptz',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "clickedAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'failed_at',
        type: 'timestamptz',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "failedAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'error_message',
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "errorMessage", void 0);
_ts_decorate([
    (0, _typeorm.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamptz'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "deletedAt", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamptz'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamptz'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Notification.prototype, "updatedAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'created_by',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "createdBy", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'updated_by',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Notification.prototype, "updatedBy", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_Userentity.User),
    (0, _typeorm.JoinColumn)({
        name: 'user_id'
    }),
    _ts_metadata("design:type", typeof _Userentity.User === "undefined" ? Object : _Userentity.User)
], Notification.prototype, "user", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_Organizationentity.Organization),
    (0, _typeorm.JoinColumn)({
        name: 'tenant_id'
    }),
    _ts_metadata("design:type", typeof _Organizationentity.Organization === "undefined" ? Object : _Organizationentity.Organization)
], Notification.prototype, "organization", void 0);
Notification = _ts_decorate([
    (0, _typeorm.Entity)('notifications'),
    (0, _typeorm.Index)('idx_notifications_tenant_id', [
        'tenantId'
    ]),
    (0, _typeorm.Index)('idx_notifications_user_id', [
        'userId'
    ]),
    (0, _typeorm.Index)('idx_notifications_status', [
        'status'
    ]),
    (0, _typeorm.Index)('idx_notifications_type', [
        'type'
    ]),
    (0, _typeorm.Index)('idx_notifications_created_at', [
        'createdAt'
    ])
], Notification);

//# sourceMappingURL=notification.enum.js.map