/**
 * Client Types
 */
export interface Client {
    id: string;
    tenantId: string;
    type: ClientType;
    // Individual fields
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    // Legal entity fields
    companyName?: string;
    edrpou?: string;
    inn?: string;
    // Contact
    email?: string;
    phone?: string;
    secondaryPhone?: string;
    // Address
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    // Additional
    source?: string;
    status: ClientStatus;
    assignedUserId?: string;
    assignedUser?: any;
    passportNumber?: string;
    passportDate?: string;
    notes?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export type ClientType = 'individual' | 'legal_entity';
export type ClientStatus = 'active' | 'inactive' | 'blocked';

export interface CreateClientDto {
    type: ClientType;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    companyName?: string;
    edrpou?: string;
    inn?: string;
    email?: string;
    phone?: string;
    secondaryPhone?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    source?: string;
    assignedUserId?: string;
    passportNumber?: string;
    passportDate?: string;
    notes?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
    status?: ClientStatus;
    metadata?: Record<string, any>;
}

export interface ClientFilters {
    search?: string;
    type?: ClientType;
    status?: ClientStatus;
    assignedUserId?: string;
    city?: string;
    region?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface ClientListResponse {
    data: Client[];
    total: number;
    page: number;
    limit: number;
}

export interface ClientStatistics {
    total: number;
    active: number;
    inactive: number;
    individuals: number;
    legalEntities: number;
}
