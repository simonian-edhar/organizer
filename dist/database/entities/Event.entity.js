"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Event", {
    enumerable: true,
    get: function() {
        return Event;
    }
});
const _typeorm = require("typeorm");
const _Caseentity = require("./Case.entity");
const _Userentity = require("./User.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Event = class Event {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)('uuid'),
    _ts_metadata("design:type", String)
], Event.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'tenant_id',
        type: 'uuid'
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'case_id',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "caseId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar'
    }),
    _ts_metadata("design:type", typeof EventType === "undefined" ? Object : EventType)
], Event.prototype, "type", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 255
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "title", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "description", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'event_date',
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Event.prototype, "eventDate", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'event_time',
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "eventTime", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'duration_minutes',
        type: 'int',
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Event.prototype, "durationMinutes", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "location", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'court_room',
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "courtRoom", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'judge_name',
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "judgeName", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'participants',
        type: 'json',
        nullable: true
    }),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], Event.prototype, "participants", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'reminder_sent',
        type: 'boolean',
        default: false
    }),
    _ts_metadata("design:type", Boolean)
], Event.prototype, "reminderSent", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'reminder_days_before',
        type: 'int',
        default: 1
    }),
    _ts_metadata("design:type", Number)
], Event.prototype, "reminderDaysBefore", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        default: 'scheduled'
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "status", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "notes", void 0);
_ts_decorate([
    (0, _typeorm.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Event.prototype, "deletedAt", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)({
        name: 'created_at',
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Event.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)({
        name: 'updated_at',
        type: 'datetime'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Event.prototype, "updatedAt", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'created_by',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "createdBy", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        name: 'updated_by',
        type: 'uuid',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Event.prototype, "updatedBy", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_Caseentity.Case),
    (0, _typeorm.JoinColumn)({
        name: 'case_id'
    }),
    _ts_metadata("design:type", typeof _Caseentity.Case === "undefined" ? Object : _Caseentity.Case)
], Event.prototype, "case", void 0);
_ts_decorate([
    (0, _typeorm.ManyToOne)(()=>_Userentity.User, {
        nullable: true
    }),
    (0, _typeorm.JoinColumn)({
        name: 'created_by'
    }),
    _ts_metadata("design:type", typeof _Userentity.User === "undefined" ? Object : _Userentity.User)
], Event.prototype, "createdByUser", void 0);
Event = _ts_decorate([
    (0, _typeorm.Entity)('events'),
    (0, _typeorm.Index)('idx_events_tenant_id', [
        'tenantId'
    ]),
    (0, _typeorm.Index)('idx_events_case_id', [
        'caseId'
    ]),
    (0, _typeorm.Index)('idx_events_type', [
        'type'
    ]),
    (0, _typeorm.Index)('idx_events_date', [
        'eventDate'
    ])
], Event);

//# sourceMappingURL=Event.entity.js.map