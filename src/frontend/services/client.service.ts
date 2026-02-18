import api from './api';
import {
    Client,
    CreateClientDto,
    UpdateClientDto,
    ClientFilters,
    ClientListResponse,
    ClientStatistics,
} from '../types/client.types';

/**
 * Client Service
 */
class ClientService {
    private baseUrl = '/clients';

    /**
     * Get all clients
     */
    async getClients(filters?: ClientFilters): Promise<ClientListResponse> {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const query = params.toString();
        return api.get<ClientListResponse>(`${this.baseUrl}${query ? `?${query}` : ''}`);
    }

    /**
     * Get client by ID
     */
    async getClient(id: string): Promise<Client> {
        return api.get<Client>(`${this.baseUrl}/${id}`);
    }

    /**
     * Create client
     */
    async createClient(data: CreateClientDto): Promise<Client> {
        return api.post<Client>(this.baseUrl, data);
    }

    /**
     * Update client
     */
    async updateClient(id: string, data: UpdateClientDto): Promise<Client> {
        return api.put<Client>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * Delete client
     */
    async deleteClient(id: string): Promise<void> {
        return api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Get client statistics
     */
    async getStatistics(): Promise<ClientStatistics> {
        return api.get<ClientStatistics>(`${this.baseUrl}/statistics`);
    }

    /**
     * Bulk import clients
     */
    async bulkImport(clients: CreateClientDto[]): Promise<{ success: number; failed: number; errors: any[] }> {
        return api.post(`${this.baseUrl}/bulk-import`, { clients });
    }
}

export const clientService = new ClientService();
export default clientService;
