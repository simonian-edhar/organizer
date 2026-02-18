/**
 * Case Types
 */
export interface Case {
    id: string;
    tenantId: string;
    caseNumber: string;
    caseType: CaseType;
    assignedLawyerId: string;
    assignedLawyer?: any;
    clientId: string;
    client?: any;
    title?: string;
    description?: string;
    priority: CasePriority;
    status: CaseStatus;
    startDate?: string;
    endDate?: string;
    nextHearingDate?: string;
    deadlineDate?: string;
    estimatedAmount?: number;
    paidAmount?: number;
    courtName?: string;
    courtAddress?: string;
    judgeName?: string;
    internalNotes?: string;
    clientNotes?: string;
    metadata?: Record<string, any>;
    documents?: any[];
    events?: any[];
    createdAt: string;
    updatedAt: string;
}

export type CaseType =
    | 'civil'
    | 'criminal'
    | 'administrative'
    | 'economic'
    | 'family'
    | 'labor'
    | 'tax'
    | 'other';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseStatus = 'draft' | 'active' | 'on_hold' | 'closed' | 'archived';

export interface CreateCaseDto {
    caseNumber: string;
    caseType: CaseType;
    clientId: string;
    assignedLawyerId: string;
    title?: string;
    description?: string;
    priority: CasePriority;
    startDate?: string;
    endDate?: string;
    deadlineDate?: string;
    estimatedAmount?: number;
    courtName?: string;
    courtAddress?: string;
    judgeName?: string;
    internalNotes?: string;
    clientNotes?: string;
    metadata?: Record<string, any>;
}

export interface UpdateCaseDto extends Partial<CreateCaseDto> {
    status?: CaseStatus;
    nextHearingDate?: string;
    paidAmount?: number;
}

export interface CaseFilters {
    clientId?: string;
    assignedLawyerId?: string;
    caseType?: CaseType;
    priority?: CasePriority;
    status?: CaseStatus;
    search?: string;
    startDateFrom?: string;
    startDateTo?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface CaseListResponse {
    data: Case[];
    total: number;
    page: number;
    limit: number;
}

export interface CaseStatistics {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    activeCases: number;
    upcomingDeadlines: number;
}

export interface TimelineEvent {
    type: 'event' | 'document';
    date: string;
    data: any;
}
