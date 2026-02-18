"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useDashboard", {
    enumerable: true,
    get: function() {
        return useDashboard;
    }
});
const _react = require("react");
const _dashboardservice = require("../services/dashboard.service");
const useDashboard = ()=>{
    const [stats, setStats] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    /**
     * Fetch dashboard stats
     */ const fetchStats = (0, _react.useCallback)(async (query)=>{
        setIsLoading(true);
        setError(null);
        try {
            const data = await _dashboardservice.dashboardService.getStats(query);
            setStats(data);
        } catch (err) {
            setError(err.message || 'Не вдалося отримати статистику');
            console.error('Dashboard stats error:', err);
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Refresh dashboard data
     */ const refresh = (0, _react.useCallback)(()=>{
        fetchStats();
    }, [
        fetchStats
    ]);
    return {
        stats,
        isLoading,
        error,
        fetchStats,
        refresh
    };
};

//# sourceMappingURL=useDashboard.js.map