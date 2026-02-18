"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "usePermissions", {
    enumerable: true,
    get: function() {
        return usePermissions;
    }
});
const _react = require("react");
const _reactredux = require("react-redux");
const _subscriptiontypes = require("../types/subscription.types");
const usePermissions = ()=>{
    const user = (0, _reactredux.useSelector)((state)=>state.auth.user);
    const organization = (0, _reactredux.useSelector)((state)=>state.auth.organization);
    /**
     * Check if user has role
     */ const hasRole = (0, _react.useCallback)((roles)=>{
        if (!user) return false;
        return roles.includes(user.role);
    }, [
        user
    ]);
    /**
     * Check if user is organization owner
     */ const isOwner = (0, _react.useCallback)(()=>{
        return hasRole([
            'organization_owner'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if user is admin
     */ const isAdmin = (0, _react.useCallback)(()=>{
        return hasRole([
            'organization_owner',
            'organization_admin'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if user is lawyer
     */ const isLawyer = (0, _react.useCallback)(()=>{
        return hasRole([
            'lawyer'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if user is assistant
     */ const isAssistant = (0, _react.useCallback)(()=>{
        return hasRole([
            'assistant'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if user is accountant
     */ const isAccountant = (0, _react.useCallback)(()=>{
        return hasRole([
            'accountant'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Get subscription plan
     */ const getPlan = (0, _react.useCallback)(()=>{
        return organization?.subscriptionPlan || null;
    }, [
        organization
    ]);
    /**
     * Check if plan has feature
     */ const hasFeature = (0, _react.useCallback)((feature)=>{
        const plan = getPlan();
        if (!plan) return false;
        return !!_subscriptiontypes.PLAN_LIMITS[plan]?.[feature];
    }, [
        getPlan
    ]);
    /**
     * Check if can manage users
     */ const canManageUsers = (0, _react.useCallback)(()=>{
        return isAdmin();
    }, [
        isAdmin
    ]);
    /**
     * Check if can manage billing
     */ const canManageBilling = (0, _react.useCallback)(()=>{
        return isOwner();
    }, [
        isOwner
    ]);
    /**
     * Check if can access advanced audit
     */ const canAccessAdvancedAudit = (0, _react.useCallback)(()=>{
        return hasFeature('advancedAudit') && isOwner();
    }, [
        hasFeature,
        isOwner
    ]);
    /**
     * Check if can manage settings
     */ const canManageSettings = (0, _react.useCallback)(()=>{
        return isAdmin();
    }, [
        isAdmin
    ]);
    /**
     * Check if can create cases
     */ const canCreateCases = (0, _react.useCallback)(()=>{
        return hasRole([
            'organization_owner',
            'organization_admin',
            'lawyer'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if can view cases
     */ const canViewCases = (0, _react.useCallback)(()=>{
        return hasRole([
            'organization_owner',
            'organization_admin',
            'lawyer',
            'assistant'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if can manage documents
     */ const canManageDocuments = (0, _react.useCallback)(()=>{
        return hasRole([
            'organization_owner',
            'organization_admin',
            'lawyer',
            'assistant'
        ]);
    }, [
        hasRole
    ]);
    /**
     * Check if can view billing
     */ const canViewBilling = (0, _react.useCallback)(()=>{
        return isAdmin() || isAccountant();
    }, [
        isAdmin,
        isAccountant
    ]);
    /**
     * Check if can invite users
     */ const canInviteUsers = (0, _react.useCallback)(()=>{
        const plan = getPlan();
        if (!plan) return false;
        const maxUsers = _subscriptiontypes.PLAN_LIMITS[plan]?.maxUsers || 0;
        if (maxUsers === -1) return isAdmin(); // Unlimited
        // TODO: Get current user count from API
        return isAdmin(); // Simplified for now
    }, [
        isAdmin,
        getPlan
    ]);
    return {
        user,
        organization,
        hasRole,
        isOwner,
        isAdmin,
        isLawyer,
        isAssistant,
        isAccountant,
        getPlan,
        hasFeature,
        canManageUsers,
        canManageBilling,
        canAccessAdvancedAudit,
        canManageSettings,
        canCreateCases,
        canViewCases,
        canManageDocuments,
        canViewBilling,
        canInviteUsers
    };
};

//# sourceMappingURL=usePermissions.js.map