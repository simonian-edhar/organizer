import api from './api';
import { ProfileFormData, UserProfile } from '../types/profile.types';

/**
 * Profile Service
 * Handles profile-related API calls
 */
class ProfileService {
    private baseUrl = '/users';

    /**
     * Get current user's profile
     */
    async getProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>(`${this.baseUrl}/profile`);
        return response.data;
    }

    /**
     * Update current user's profile
     */
    async updateProfile(data: ProfileFormData): Promise<UserProfile> {
        const response = await api.put<UserProfile>(`${this.baseUrl}/profile`, data);
        return response.data;
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.put(`${this.baseUrl}/profile/password`, {
            currentPassword,
            newPassword,
        });
    }

    /**
     * Upload avatar
     */
    async uploadAvatar(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ url: string }>(
            `${this.baseUrl}/profile/avatar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    /**
     * Delete avatar
     */
    async deleteAvatar(): Promise<void> {
        await api.delete(`${this.baseUrl}/profile/avatar`);
    }
}

export const profileService = new ProfileService();
