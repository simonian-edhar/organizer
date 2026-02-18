import api from './api';
import {
    Case,
    CreateCaseDto,
    UpdateCaseDto,
    CaseFilters,
    CaseListResponse,
    CaseStatistics,
    TimelineEvent,
} from '../types/case.types';

/**
 * Case Service
 */
class CaseService {
    private baseUrl = '/cases';

    /**
     * Get all cases
     */
    async getCases(filters?: CaseFilters): Promise<CaseListResponse> {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const query = params.toString();
        return api.get<CaseListResponse>(`${this.baseUrl}${query ? `?${query}` : ''}`);
    }

    /**
     * Get case by ID
     */
    async getCase(id: string): Promise<Case> {
        return api.get<Case>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get case timeline
     */
    async getCaseTimeline(id: string): Promise<TimelineEvent[]> {
        return api.get<TimelineEvent[]>(`${this.baseUrl}/${id}/timeline`);
    }

    /**
     * Create case
     */
    async createCase(data: CreateCaseDto): Promise<Case> {
        return api.post<Case>(this.baseUrl, data);
    }

    /**
     * Update case
     */
    async updateCase(id: string, data: UpdateCaseDto): Promise<Case> {
        return api.put<Case>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * Change case status
     */
    async changeStatus(id: string, status: string): Promise<Case> {
        return api.put<Case>(`${this.baseUrl}/${id}/status`, { status });
    }

    /**
     * Delete case
     */
    async deleteCase(id: string): Promise<void> {
        return api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Restore deleted case
     */
    async restoreCase(id: string): Promise<Case> {
        return api.post<Case>(`${this.baseUrl}/${id}/restore`);
    }

    /**
     * Get case statistics
     */
    async getStatistics(): Promise<CaseStatistics> {
        return api.get<CaseStatistics>(`${this.baseUrl}/statistics`);
    }

    /**
     * Get upcoming deadlines
     */
    async getUpcomingDeadlines(days: number = 30): Promise<Case[]> {
        return api.get<Case[]>(`${this.baseUrl}/upcoming-deadlines?days=${days}`);
    }
}

export const caseService = new CaseService();
export default caseService;
