"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "dashboardService", {
    enumerable: true,
    get: function() {
        return dashboardService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const dashboardService = {
    /**
     * Get dashboard statistics
     */ async getStats (query) {
        const params = new URLSearchParams();
        if (query?.days) {
            params.append('days', query.days.toString());
        }
        if (query?.startDate) {
            params.append('startDate', query.startDate.toISOString());
        }
        if (query?.endDate) {
            params.append('endDate', query.endDate.toISOString());
        }
        const queryString = params.toString();
        return _api.default.get(`/dashboard/stats${queryString ? `?${queryString}` : ''}`);
    }
};

//# sourceMappingURL=dashboard.service.js.map