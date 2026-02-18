import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CaseService } from '../services/case.service';
import { CreateCaseDto, UpdateCaseDto, CaseFiltersDto, AddTimelineEventDto } from '../dto/case.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { TenantGuard, RbacGuard } from '../../auth/guards';
import { Audit } from '../../auth/services/audit.service';

/**
 * Cases Controller
 */
@ApiTags('Cases')
@Controller('cases')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CasesController {
    constructor(private readonly caseService: CaseService) {}

    @Get()
    @ApiOperation({ summary: 'Get all cases' })
    @ApiResponse({ status: 200, description: 'Cases retrieved' })
    async findAll(
        @Query() filters: CaseFiltersDto,
        @Req() req: any
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const tenantId = req.user?.tenant_id;
        return this.caseService.findAll(tenantId, filters);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get case statistics' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved' })
    async getStatistics(@Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getStatistics(tenantId);
    }

    @Get('upcoming-deadlines')
    @ApiOperation({ summary: 'Get upcoming deadlines' })
    @ApiResponse({ status: 200, description: 'Upcoming deadlines retrieved' })
    async getUpcomingDeadlines(
        @Query('days') days?: string,
        @Req() req?: any
    ): Promise<any[]> {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getUpcomingDeadlines(tenantId, days ? parseInt(days) : 30);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get case by ID' })
    @ApiResponse({ status: 200, description: 'Case retrieved' })
    async findById(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.caseService.findById(tenantId, id);
    }

    @Get(':id/timeline')
    @ApiOperation({ summary: 'Get case timeline' })
    @ApiResponse({ status: 200, description: 'Timeline retrieved' })
    async getTimeline(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.caseService.getTimeline(tenantId, id);
    }

    @Post()
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Create new case' })
    @ApiResponse({ status: 201, description: 'Case created' })
    @Audit('create')
    async create(@Body() dto: CreateCaseDto, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.create(tenantId, userId, dto);
    }

    @Put(':id')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Update case' })
    @ApiResponse({ status: 200, description: 'Case updated' })
    @Audit('update')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCaseDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.update(tenantId, id, userId, dto);
    }

    @Put(':id/status')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Change case status' })
    @ApiResponse({ status: 200, description: 'Status changed' })
    @Audit('update')
    async changeStatus(
        @Param('id') id: string,
        @Body('status') status: 'draft' | 'active' | 'on_hold' | 'closed' | 'archived',
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.changeStatus(tenantId, id, userId, status);
    }

    @Post(':id/restore')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Restore deleted case' })
    @ApiResponse({ status: 200, description: 'Case restored' })
    async restore(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.restore(tenantId, id, userId);
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete case' })
    @ApiResponse({ status: 204, description: 'Case deleted' })
    @Audit('delete')
    async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.caseService.delete(tenantId, id, userId);
    }
}
