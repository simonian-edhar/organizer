"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Organization", {
    enumerable: true,
    get: function() {
        return Organization;
    }
});
const _typeorm = require("typeorm");
const _subscriptionenum = require("./enums/subscription.enum");
const _Userentity = require("./User.entity");
const _Subscriptionentity = require("./Subscription.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Organization = class Organization {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)('uuid'),
    _ts_metadata("design:type", String)
], Organization.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 255
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        default: 'sole_proprietor'
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "legalForm", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 10,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "edrpou", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 12,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "taxNumber", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "address", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "city", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "region", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 2,
        default: 'UA'
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "country", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "phone", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 255
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "email", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "website", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        default: _subscriptionenum.SubscriptionPlan.BASIC
    }),
    _ts_metadata("design:type", typeof _subscriptionenum.SubscriptionPlan === "undefined" ? Object : _subscriptionenum.SubscriptionPlan)
], Organization.prototype, "subscriptionPlan", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        default: _subscriptionenum.SubscriptionStatus.TRIALING
    }),
    _ts_metadata("design:type", typeof _subscriptionenum.SubscriptionStatus === "undefined" ? Object : _subscriptionenum.SubscriptionStatus)
], Organization.prototype, "subscriptionStatus", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'datetime',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Organization.prototype, "trialEndAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'datetime',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Organization.prototype, "currentPeriodEndAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'int',
        default: 1
    }),
    _ts_metadata("design:type", Number)
], Organization.prototype, "maxUsers", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "customDomain", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'boolean',
        default: false
    }),
    _ts_metadata("design:type", Boolean)
], Organization.prototype, "mfaRequired", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'boolean',
        default: false
    }),
    _ts_metadata("design:type", Boolean)
], Organization.prototype, "ssoEnabled", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'int',
        default: 90
    }),
    _ts_metadata("design:type", Number)
], Organization.prototype, "auditRetentionDays", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        default: 'provisioning'
    }),
    _ts_metadata("design:type", String)
], Organization.prototype, "status", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json'
    }),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], Organization.prototype, "settings", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json'
    }),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], Organization.prototype, "metadata", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)({
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Organization.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)({
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Organization.prototype, "updatedAt", void 0);
_ts_decorate([
    (0, _typeorm.DeleteDateColumn)({
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Organization.prototype, "deletedAt", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_Userentity.User, (user)=>user.organization),
    _ts_metadata("design:type", Array)
], Organization.prototype, "users", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_Subscriptionentity.Subscription, (subscription)=>subscription.organization),
    _ts_metadata("design:type", Array)
], Organization.prototype, "subscriptions", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>require('./AuditLog.entity').AuditLog, (auditLog)=>auditLog.organization),
    _ts_metadata("design:type", Array)
], Organization.prototype, "auditLogs", void 0);
Organization = _ts_decorate([
    (0, _typeorm.Entity)('organizations'),
    (0, _typeorm.Index)('idx_organizations_name', [
        'name'
    ])
], Organization);

//# sourceMappingURL=Organization.entity.js.map