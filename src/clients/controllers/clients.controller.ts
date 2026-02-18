import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
Req, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientService } from '../services/client.service';
import { CreateClientDto, UpdateClientDto, ClientFiltersDto, BulkImportClientsDto } from '../dto/client.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { TenantGuard, RbacGuard } from '../../auth/guards';

/**
 * Clients Controller
 */
@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class ClientsController {
    constructor(private readonly clientService: ClientService) {}

    @Get()
    @ApiOperation({ summary: 'Get all clients' })
    @ApiResponse({ status: 200, description: 'Clients retrieved' })
    async findAll(
        @Query() filters: ClientFiltersDto,
        @Req() req: any
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const tenantId = req.user?.tenant_id;
        return this.clientService.findAll(tenantId, filters);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get client statistics' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved' })
    async getStatistics(@Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.clientService.getStatistics(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get client by ID' })
    @ApiResponse({ status: 200, description: 'Client retrieved' })
    async findById(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.clientService.findById(tenantId, id);
    }

    @Post()
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Create new client' })
    @ApiResponse({ status: 201, description: 'Client created' })
    async create(@Body() dto: CreateClientDto, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.create(tenantId, userId, dto);
    }

    @Post('import')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Bulk import clients' })
    @ApiResponse({ status: 201, description: 'Clients imported' })
    async bulkImport(
        @Body() dto: BulkImportClientsDto,
        @Req() req: any
    ): Promise<{ success: number; failed: number; errors: any[] }> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.bulkImport(tenantId, userId, dto.clients);
    }

    @Put(':id')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Update client' })
    @ApiResponse({ status: 200, description: 'Client updated' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateClientDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.update(tenantId, id, userId, dto);
    }

    @Patch(':id')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Patch client (partial update)' })
    @ApiResponse({ status: 200, description: 'Client patched' })
    async patch(
        @Param('id') id: string,
        @Body() dto: Partial<UpdateClientDto>,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.update(tenantId, id, userId, dto as UpdateClientDto);
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete client' })
    @ApiResponse({ status: 204, description: 'Client deleted' })
    async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.delete(tenantId, id, userId);
    }

    @Post(':id/restore')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Restore deleted client' })
    @ApiResponse({ status: 200, description: 'Client restored' })
    async restore(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.clientService.restore(tenantId, id, userId);
    }
}
