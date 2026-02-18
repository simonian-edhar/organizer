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
    get BulkUploadDocumentsDto () {
        return BulkUploadDocumentsDto;
    },
    get DocumentFiltersDto () {
        return DocumentFiltersDto;
    },
    get GenerateSignedUrlDto () {
        return GenerateSignedUrlDto;
    },
    get SignDocumentDto () {
        return SignDocumentDto;
    },
    get UpdateDocumentDto () {
        return UpdateDocumentDto;
    },
    get UploadDocumentDto () {
        return UploadDocumentDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _Documententity = require("../../database/entities/Document.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UploadDocumentDto = class UploadDocumentDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UploadDocumentDto.prototype, "caseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'contract',
        'agreement',
        'court_order',
        'evidence',
        'invoice',
        'other'
    ]),
    _ts_metadata("design:type", typeof _Documententity.DocumentType === "undefined" ? Object : _Documententity.DocumentType)
], UploadDocumentDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UploadDocumentDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'public',
        'internal',
        'confidential'
    ]),
    _ts_metadata("design:type", String)
], UploadDocumentDto.prototype, "accessLevel", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], UploadDocumentDto.prototype, "parentDocumentId", void 0);
let UpdateDocumentDto = class UpdateDocumentDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateDocumentDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'draft',
        'signed',
        'rejected',
        'archived'
    ]),
    _ts_metadata("design:type", typeof _Documententity.DocumentStatus === "undefined" ? Object : _Documententity.DocumentStatus)
], UpdateDocumentDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'public',
        'internal',
        'confidential'
    ]),
    _ts_metadata("design:type", String)
], UpdateDocumentDto.prototype, "accessLevel", void 0);
let DocumentFiltersDto = class DocumentFiltersDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "caseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "clientId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'contract',
        'agreement',
        'court_order',
        'evidence',
        'invoice',
        'other'
    ]),
    _ts_metadata("design:type", typeof _Documententity.DocumentType === "undefined" ? Object : _Documententity.DocumentType)
], DocumentFiltersDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'draft',
        'uploading',
        'signed',
        'rejected',
        'archived'
    ]),
    _ts_metadata("design:type", typeof _Documententity.DocumentStatus === "undefined" ? Object : _Documententity.DocumentStatus)
], DocumentFiltersDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'public',
        'internal',
        'confidential'
    ]),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "accessLevel", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "search", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], DocumentFiltersDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], DocumentFiltersDto.prototype, "limit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "sortBy", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], DocumentFiltersDto.prototype, "sortOrder", void 0);
let BulkUploadDocumentsDto = class BulkUploadDocumentsDto {
};
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ArrayMinSize)(1),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>UploadDocumentDto),
    _ts_metadata("design:type", Array)
], BulkUploadDocumentsDto.prototype, "documents", void 0);
let SignDocumentDto = class SignDocumentDto {
};
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], SignDocumentDto.prototype, "documentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SignDocumentDto.prototype, "signatureHash", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SignDocumentDto.prototype, "signatureAlgorithm", void 0);
let GenerateSignedUrlDto = class GenerateSignedUrlDto {
};
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], GenerateSignedUrlDto.prototype, "documentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Max)(7 * 24 * 60 * 60),
    _ts_metadata("design:type", Number)
], GenerateSignedUrlDto.prototype, "expiresIn", void 0);

//# sourceMappingURL=document.dto.js.map