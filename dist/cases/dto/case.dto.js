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
    get AddTimelineEventDto () {
        return AddTimelineEventDto;
    },
    get CaseFiltersDto () {
        return CaseFiltersDto;
    },
    get CreateCaseDto () {
        return CreateCaseDto;
    },
    get UpdateCaseDto () {
        return UpdateCaseDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCaseDto = class CreateCaseDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "caseNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'civil',
        'criminal',
        'administrative',
        'economic',
        'family',
        'labor',
        'tax',
        'other'
    ]),
    _ts_metadata("design:type", typeof CaseType === "undefined" ? Object : CaseType)
], CreateCaseDto.prototype, "caseType", void 0);
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "clientId", void 0);
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "assignedLawyerId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'low',
        'medium',
        'high',
        'urgent'
    ]),
    _ts_metadata("design:type", typeof CasePriority === "undefined" ? Object : CasePriority)
], CreateCaseDto.prototype, "priority", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "endDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "deadlineDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreateCaseDto.prototype, "estimatedAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "courtName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "courtAddress", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "judgeName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "internalNotes", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCaseDto.prototype, "clientNotes", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], CreateCaseDto.prototype, "metadata", void 0);
let UpdateCaseDto = class UpdateCaseDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "caseNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'civil',
        'criminal',
        'administrative',
        'economic',
        'family',
        'labor',
        'tax',
        'other'
    ]),
    _ts_metadata("design:type", typeof CaseType === "undefined" ? Object : CaseType)
], UpdateCaseDto.prototype, "caseType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "assignedLawyerId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'low',
        'medium',
        'high',
        'urgent'
    ]),
    _ts_metadata("design:type", typeof CasePriority === "undefined" ? Object : CasePriority)
], UpdateCaseDto.prototype, "priority", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'draft',
        'active',
        'on_hold',
        'closed',
        'archived'
    ]),
    _ts_metadata("design:type", typeof CaseStatus === "undefined" ? Object : CaseStatus)
], UpdateCaseDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "endDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "nextHearingDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "deadlineDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateCaseDto.prototype, "estimatedAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateCaseDto.prototype, "paidAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "courtName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "courtAddress", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "judgeName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "internalNotes", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateCaseDto.prototype, "clientNotes", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], UpdateCaseDto.prototype, "metadata", void 0);
let CaseFiltersDto = class CaseFiltersDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "clientId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "assignedLawyerId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'civil',
        'criminal',
        'administrative',
        'economic',
        'family',
        'labor',
        'tax',
        'other'
    ]),
    _ts_metadata("design:type", typeof CaseType === "undefined" ? Object : CaseType)
], CaseFiltersDto.prototype, "caseType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'low',
        'medium',
        'high',
        'urgent'
    ]),
    _ts_metadata("design:type", typeof CasePriority === "undefined" ? Object : CasePriority)
], CaseFiltersDto.prototype, "priority", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'draft',
        'active',
        'on_hold',
        'closed',
        'archived'
    ]),
    _ts_metadata("design:type", typeof CaseStatus === "undefined" ? Object : CaseStatus)
], CaseFiltersDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "search", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "startDateFrom", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "startDateTo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "deadlineFrom", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "deadlineTo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], CaseFiltersDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], CaseFiltersDto.prototype, "limit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "sortBy", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CaseFiltersDto.prototype, "sortOrder", void 0);
let AddTimelineEventDto = class AddTimelineEventDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], AddTimelineEventDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], AddTimelineEventDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'created',
        'updated',
        'status_change',
        'document_added',
        'event_added',
        'note',
        'payment',
        'other'
    ]),
    _ts_metadata("design:type", String)
], AddTimelineEventDto.prototype, "eventType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], AddTimelineEventDto.prototype, "metadata", void 0);

//# sourceMappingURL=case.dto.js.map