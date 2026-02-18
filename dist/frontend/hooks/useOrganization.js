"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useOrganization", {
    enumerable: true,
    get: function() {
        return useOrganization;
    }
});
const _react = require("react");
const _organizationservice = require("../services/organization.service");
const useOrganization = ()=>{
    const [organization, setOrganization] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    /**
     * Load organization
     */ const loadOrganization = (0, _react.useCallback)(async ()=>{
        setIsLoading(true);
        setError(null);
        try {
            const data = await _organizationservice.organizationService.getOrganization();
            setOrganization(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося завантажити організацію');
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Update organization
     */ const updateOrganization = (0, _react.useCallback)(async (data)=>{
        setIsLoading(true);
        setError(null);
        try {
            const updated = await _organizationservice.organizationService.updateOrganization(data);
            setOrganization(updated);
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося оновити організацію');
            throw error;
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Load on first render
     */ (0, _react.useEffect)(()=>{
        loadOrganization();
    }, [
        loadOrganization
    ]);
    return {
        organization,
        isLoading,
        error,
        loadOrganization,
        updateOrganization
    };
};

//# sourceMappingURL=useOrganization.js.map