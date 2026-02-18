"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get caseService () {
        return caseService;
    },
    get default () {
        return _default;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Case Service
 */ let CaseService = class CaseService {
    /**
     * Get all cases
     */ async getCases(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value])=>{
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const query = params.toString();
        return _api.default.get(`${this.baseUrl}${query ? `?${query}` : ''}`);
    }
    /**
     * Get case by ID
     */ async getCase(id) {
        return _api.default.get(`${this.baseUrl}/${id}`);
    }
    /**
     * Get case timeline
     */ async getCaseTimeline(id) {
        return _api.default.get(`${this.baseUrl}/${id}/timeline`);
    }
    /**
     * Create case
     */ async createCase(data) {
        return _api.default.post(this.baseUrl, data);
    }
    /**
     * Update case
     */ async updateCase(id, data) {
        return _api.default.put(`${this.baseUrl}/${id}`, data);
    }
    /**
     * Change case status
     */ async changeStatus(id, status) {
        return _api.default.put(`${this.baseUrl}/${id}/status`, {
            status
        });
    }
    /**
     * Delete case
     */ async deleteCase(id) {
        return _api.default.delete(`${this.baseUrl}/${id}`);
    }
    /**
     * Restore deleted case
     */ async restoreCase(id) {
        return _api.default.post(`${this.baseUrl}/${id}/restore`);
    }
    /**
     * Get case statistics
     */ async getStatistics() {
        return _api.default.get(`${this.baseUrl}/statistics`);
    }
    /**
     * Get upcoming deadlines
     */ async getUpcomingDeadlines(days = 30) {
        return _api.default.get(`${this.baseUrl}/upcoming-deadlines?days=${days}`);
    }
    constructor(){
        this.baseUrl = '/cases';
    }
};
const caseService = new CaseService();
const _default = caseService;

//# sourceMappingURL=case.service.js.map