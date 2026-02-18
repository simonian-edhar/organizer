"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useSubscription", {
    enumerable: true,
    get: function() {
        return useSubscription;
    }
});
const _react = require("react");
const _subscriptionservice = require("../services/subscription.service");
const useSubscription = ()=>{
    const [subscription, setSubscription] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    /**
     * Load subscription
     */ const loadSubscription = (0, _react.useCallback)(async ()=>{
        setIsLoading(true);
        setError(null);
        try {
            const data = await _subscriptionservice.subscriptionService.getSubscription();
            setSubscription(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося завантажити підписку');
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Upgrade plan
     */ const upgradePlan = (0, _react.useCallback)(async (plan)=>{
        setIsLoading(true);
        setError(null);
        try {
            const result = await _subscriptionservice.subscriptionService.upgradePlan(plan);
            return result;
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося оновити план');
            throw error;
        } finally{
            setIsLoading(false);
        }
    }, []);
    /**
     * Cancel subscription
     */ const cancelSubscription = (0, _react.useCallback)(async ()=>{
        setIsLoading(true);
        setError(null);
        try {
            await _subscriptionservice.subscriptionService.cancelSubscription();
            await loadSubscription();
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося скасувати підписку');
            throw error;
        } finally{
            setIsLoading(false);
        }
    }, [
        loadSubscription
    ]);
    /**
     * Resume subscription
     */ const resumeSubscription = (0, _react.useCallback)(async ()=>{
        setIsLoading(true);
        setError(null);
        try {
            await _subscriptionservice.subscriptionService.resumeSubscription();
            await loadSubscription();
        } catch (error) {
            setError(error.response?.data?.message || 'Не вдалося відновити підписку');
            throw error;
        } finally{
            setIsLoading(false);
        }
    }, [
        loadSubscription
    ]);
    /**
     * Check if plan has feature
     */ const hasFeature = (0, _react.useCallback)((feature)=>{
        if (!subscription) return false;
        return _subscriptionservice.subscriptionService.hasFeature(subscription.plan, feature);
    }, [
        subscription
    ]);
    /**
     * Get plan limit
     */ const getPlanLimit = (0, _react.useCallback)((limit)=>{
        if (!subscription) return null;
        return _subscriptionservice.subscriptionService.getPlanLimit(subscription.plan, limit);
    }, [
        subscription
    ]);
    /**
     * Get current plan
     */ const getPlan = (0, _react.useCallback)(()=>{
        return subscription?.plan || null;
    }, [
        subscription
    ]);
    /**
     * Get subscription status
     */ const getStatus = (0, _react.useCallback)(()=>{
        return subscription?.status || null;
    }, [
        subscription
    ]);
    /**
     * Load on first render
     */ (0, _react.useEffect)(()=>{
        loadSubscription();
    }, [
        loadSubscription
    ]);
    return {
        subscription,
        isLoading,
        error,
        loadSubscription,
        upgradePlan,
        cancelSubscription,
        resumeSubscription,
        hasFeature,
        getPlanLimit,
        getPlan,
        getStatus
    };
};

//# sourceMappingURL=useSubscription.js.map