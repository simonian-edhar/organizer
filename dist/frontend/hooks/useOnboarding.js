"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useOnboarding", {
    enumerable: true,
    get: function() {
        return useOnboarding;
    }
});
const _react = require("react");
const _organizationservice = require("../services/organization.service");
const useOnboarding = ()=>{
    const [progress, setProgress] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    /**
     * Load progress
     */ const loadProgress = (0, _react.useCallback)(async ()=>{
        setIsLoading(true);
        setError(null);
        try {
            const data = await _organizationservice.organizationService.getOnboardingProgress();
            setProgress(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося завантажити прогрес');
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Complete step
     */ const completeStep = (0, _react.useCallback)(async (step, data)=>{
        setIsLoading(true);
        setError(null);
        try {
            await _organizationservice.organizationService.updateOnboardingStep(step, true, data);
            await loadProgress();
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося оновити крок');
            throw error;
        } finally{
            setIsLoading(false);
        }
    }, [
        loadProgress
    ]);
    /**
     * Check if step is completed
     */ const isStepCompleted = (0, _react.useCallback)((step)=>{
        return progress?.steps.some((s)=>s.step === step && s.completed) || false;
    }, [
        progress
    ]);
    /**
     * Load on first render
     */ (0, _react.useEffect)(()=>{
        loadProgress();
    }, [
        loadProgress
    ]);
    return {
        progress,
        isLoading,
        error,
        loadProgress,
        completeStep,
        isStepCompleted,
        isCompleted: progress?.completed || false,
        percentage: progress?.percentage || 0
    };
};

//# sourceMappingURL=useOnboarding.js.map