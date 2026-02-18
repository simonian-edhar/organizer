"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CasesController", {
    enumerable: true,
    get: function() {
        return CasesController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _caseservice = require("../services/case.service");
const _casedto = require("../dto/case.dto");
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
let CasesController = class CasesController {
    async findAll(filters, req) {
        const tenantId = req.user?.tenant_id;
        return this.caseService.findAll(tenantId, filters);
    }
    async getStatistics(req) {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getStatistics(tenantId);
    }
    async getUpcomingDeadlines(days, req) {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getUpcomingDeadlines(tenantId, days ? parseInt(days) : 30);
    }
    async findById(id, req) {
        const tenantId = req.user?.tenant_id;
        return this.caseService.findById(tenantId, id);
    }
    async getTimeline(id, req) {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getTimeline(tenantId, id);
    }
    async create(dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.create(tenantId, userId, dto);
    }
    async update(id, dto, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.update(tenantId, id, userId, dto);
    }
    async changeStatus(id, status, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.changeStatus(tenantId, id, userId, status);
    }
    async restore(id, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.restore(tenantId, id, userId);
    }
    async delete(id, req) {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.delete(tenantId, id, userId);
    }
    constructor(caseService){
        this.caseService = caseService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all cases'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Cases retrieved'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _casedto.CaseFiltersDto === "undefined" ? Object : _casedto.CaseFiltersDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('statistics'),
    (0, _swagger.ApiOperation)({
        summary: 'Get case statistics'
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
], CasesController.prototype, "getStatistics", null);
_ts_decorate([
    (0, _common.Get)('upcoming-deadlines'),
    (0, _swagger.ApiOperation)({
        summary: 'Get upcoming deadlines'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Upcoming deadlines retrieved'
    }),
    _ts_param(0, (0, _common.Query)('days')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "getUpcomingDeadlines", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get case by ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Case retrieved'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Get)(':id/timeline'),
    (0, _swagger.ApiOperation)({
        summary: 'Get case timeline'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Timeline retrieved'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "getTimeline", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Create new case'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Case created'
    }),
    (0, _auditservice.Audit)('create'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _casedto.CreateCaseDto === "undefined" ? Object : _casedto.CreateCaseDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Update case'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Case updated'
    }),
    (0, _auditservice.Audit)('update'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _casedto.UpdateCaseDto === "undefined" ? Object : _casedto.UpdateCaseDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Change case status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Status changed'
    }),
    (0, _auditservice.Audit)('update'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('status')),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "changeStatus", null);
_ts_decorate([
    (0, _common.Post)(':id/restore'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Restore deleted case'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Case restored'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CasesController.prototype, "restore", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _common.UseGuards)(_guards.RbacGuard),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    (0, _swagger.ApiOperation)({
        summary: 'Delete case'
    }),
    (0, _swagger.ApiResponse)({
        status: 204,
        description: 'Case deleted'
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
], CasesController.prototype, "delete", null);
CasesController = _ts_decorate([
    (0, _swagger.ApiTags)('Cases'),
    (0, _common.Controller)('cases'),
    (0, _common.UseGuards)(_guards.JwtAuthGuard, _guards.TenantGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _caseservice.CaseService === "undefined" ? Object : _caseservice.CaseService
    ])
], CasesController);

//# sourceMappingURL=cases.controller.js.map