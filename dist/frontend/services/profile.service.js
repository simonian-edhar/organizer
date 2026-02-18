"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "profileService", {
    enumerable: true,
    get: function() {
        return profileService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Profile Service
 * Handles profile-related API calls
 */ let ProfileService = class ProfileService {
    /**
     * Get current user's profile
     */ async getProfile() {
        const response = await _api.default.get(`${this.baseUrl}/profile`);
        return response.data;
    }
    /**
     * Update current user's profile
     */ async updateProfile(data) {
        const response = await _api.default.put(`${this.baseUrl}/profile`, data);
        return response.data;
    }
    /**
     * Change password
     */ async changePassword(currentPassword, newPassword) {
        await _api.default.put(`${this.baseUrl}/profile/password`, {
            currentPassword,
            newPassword
        });
    }
    /**
     * Upload avatar
     */ async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await _api.default.post(`${this.baseUrl}/profile/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    /**
     * Delete avatar
     */ async deleteAvatar() {
        await _api.default.delete(`${this.baseUrl}/profile/avatar`);
    }
    constructor(){
        this.baseUrl = '/users';
    }
};
const profileService = new ProfileService();

//# sourceMappingURL=profile.service.js.map