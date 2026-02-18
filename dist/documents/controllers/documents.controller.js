"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentsController", {
    enumerable: true,
    get: function() {
        return DocumentsController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _swagger = require("@nestjs/swagger");
const _documentservice = require("../services/document.service");
const _documentdto = require("../dto/document.dto");
const _guards = require("../../auth/guards");
const _auditservice = require("../../auth/services/audit.service");
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
let DocumentsController = class DocumentsController {
    async findAll(filters, req) {
        const tenantId = req.user?.tenant_id;
        return this.documentService.findAll(tenantId, filters);
    }
    async getStatistics(req) {
        const tenantId = req.user?.tenant_id;
        return this.documentService.getStatistics(tenantId);
    }
    async findById(id, req) {
        const tenantId = req.user?.tenant_id;
        return this.documentService.findById(tenantId, id);
    }
    async upload(file, dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.upload(tenantId, userId, file, dto);
    }
    async bulkUpload(files, dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.bulkUpload(tenantId, userId, files, dto.documents);
    }
    async update(id, dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.update(tenantId, id, userId, dto);
    }
    async sign(id, dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.sign(tenantId, id, userId, dto);
    }
    async generateSignedUrl(id, dto, req) {
        const tenantId = req.user?.tenant_id;
        return this.documentService.generateSignedUrl(tenantId, id, dto);
    }
    async delete(id, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.delete(tenantId, id, userId);
    }
    constructor(documentService){
        this.documentService = documentService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all documents'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Documents retrieved'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _documentdto.DocumentFiltersDto === "undefined" ? Object : _documentdto.DocumentFiltersDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('statistics'),
    (0, _swagger.ApiOperation)({
        summary: 'Get document statistics'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "getStatistics", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get document by ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Document retrieved'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Post)('upload'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file')),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiOperation)({
        summary: 'Upload document'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Document uploaded'
    }),
    (0, _auditservice.Audit)('create'),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File,
        typeof _documentdto.UploadDocumentDto === "undefined" ? Object : _documentdto.UploadDocumentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
_ts_decorate([
    (0, _common.Post)('bulk-upload'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('files')),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiOperation)({
        summary: 'Bulk upload documents'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Documents uploaded'
    }),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Array,
        typeof _documentdto.BulkUploadDocumentsDto === "undefined" ? Object : _documentdto.BulkUploadDocumentsDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "bulkUpload", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Update document metadata'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Document updated'
    }),
    (0, _auditservice.Audit)('update'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _documentdto.UpdateDocumentDto === "undefined" ? Object : _documentdto.UpdateDocumentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)(':id/sign'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Sign document'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Document signed'
    }),
    (0, _auditservice.Audit)('update'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _documentdto.SignDocumentDto === "undefined" ? Object : _documentdto.SignDocumentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "sign", null);
_ts_decorate([
    (0, _common.Post)(':id/signed-url'),
    (0, _swagger.ApiOperation)({
        summary: 'Generate time-limited signed URL'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Signed URL generated'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _documentdto.GenerateSignedUrlDto === "undefined" ? Object : _documentdto.GenerateSignedUrlDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateSignedUrl", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    (0, _swagger.ApiOperation)({
        summary: 'Delete document'
    }),
    (0, _swagger.ApiResponse)({
        status: 204,
        description: 'Document deleted'
    }),
    (0, _auditservice.Audit)('delete'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], DocumentsController.prototype, "delete", null);
DocumentsController = _ts_decorate([
    (0, _swagger.ApiTags)('Documents'),
    (0, _common.Controller)('documents'),
    (0, _common.UseGuards)(_guards.JwtAuthGuard, _guards.TenantGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _documentservice.DocumentService === "undefined" ? Object : _documentservice.DocumentService
    ])
], DocumentsController);

//# sourceMappingURL=documents.controller.js.map