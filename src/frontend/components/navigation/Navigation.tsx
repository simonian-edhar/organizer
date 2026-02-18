import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import './Navigation.css';

/**
 * Menu item configuration
 */
interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    /**
     * Required roles to see this menu item (any of these)
     */
    roles?: string[];
    /**
     * Required features to see this menu item (all of these)
     */
    features?: string[];
    /**
     * Custom permission check function
     */
    permissionCheck?: (permissions: ReturnType<typeof usePermissions>) => boolean;
    /**
     * Badge content (e.g., notification count)
     */
    badge?: string | number;
    /**
     * Is this item visible?
     */
    visible?: boolean;
}

/**
 * All menu items configuration
 */
const MENU_ITEMS: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Дашборд',
        icon: '📊',
        path: '/dashboard',
        visible: true,
    },
    {
        id: 'cases',
        label: 'Справи',
        icon: '📁',
        path: '/cases',
        roles: ['organization_owner', 'organization_admin', 'lawyer', 'assistant'],
        permissionCheck: (p) => p.canViewCases(),
    },
    {
        id: 'clients',
        label: 'Клієнти',
        icon: '👥',
        path: '/clients',
        roles: ['organization_owner', 'organization_admin', 'lawyer', 'assistant'],
    },
    {
        id: 'documents',
        label: 'Документи',
        icon: '📄',
        path: '/documents',
        roles: ['organization_owner', 'organization_admin', 'lawyer', 'assistant'],
        permissionCheck: (p) => p.canManageDocuments(),
    },
    {
        id: 'calendar',
        label: 'Календар',
        icon: '📅',
        path: '/calendar',
        roles: ['organization_owner', 'organization_admin', 'lawyer', 'assistant'],
    },
    {
        id: 'calculations',
        label: 'Калькулятори',
        icon: '🧮',
        path: '/calculations',
        roles: ['organization_owner', 'organization_admin', 'lawyer', 'assistant'],
    },
    {
        id: 'invoices',
        label: 'Рахунки',
        icon: '💵',
        path: '/invoices',
        roles: ['organization_owner', 'organization_admin', 'accountant'],
        permissionCheck: (p) => p.canViewBilling(),
    },
    {
        id: 'team',
        label: 'Команда',
        icon: '👤',
        path: '/team',
        roles: ['organization_owner', 'organization_admin'],
        permissionCheck: (p) => p.canManageUsers(),
    },
    {
        id: 'audit',
        label: 'Аудит',
        icon: '📋',
        path: '/audit',
        roles: ['organization_owner'],
        features: ['advancedAudit'],
        permissionCheck: (p) => p.canAccessAdvancedAudit && p.canAccessAdvancedAudit(),
    },
    {
        id: 'billing',
        label: 'Підписка',
        icon: '💎',
        path: '/billing',
        roles: ['organization_owner'],
        permissionCheck: (p) => p.canManageBilling(),
    },
    {
        id: 'settings',
        label: 'Налаштування',
        icon: '⚙️',
        path: '/settings',
        roles: ['organization_owner', 'organization_admin'],
        permissionCheck: (p) => p.canManageSettings(),
    },
];

/**
 * Feature flags component
 */
interface FeatureFlagProps {
    feature: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ feature, fallback, children }) => {
    const permissions = usePermissions();

    if (!permissions.hasFeature(feature as any)) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

/**
 * Role-based render component
 */
interface RoleBasedProps {
    roles?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({
    roles,
    requireAll = false,
    fallback,
    children,
}) => {
    const permissions = usePermissions();

    if (!roles || roles.length === 0) {
        return <>{children}</>;
    }

    const hasAccess = requireAll
        ? roles.every((role) => permissions.hasRole([role as any]))
        : permissions.hasRole(roles as any[]);

    if (!hasAccess) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

/**
 * Permission-based render component
 */
interface PermissionBasedProps {
    check: (permissions: ReturnType<typeof usePermissions>) => boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const PermissionBased: React.FC<PermissionBasedProps> = ({
    check,
    fallback,
    children,
}) => {
    const permissions = usePermissions();

    if (!check(permissions)) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

/**
 * Sidebar Navigation Component
 */
export const SidebarNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const permissions = usePermissions();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    /**
     * Check if menu item should be visible
     */
    const isItemVisible = (item: MenuItem): boolean => {
        // Check visibility flag
        if (item.visible === false) return false;

        // Check role requirement
        if (item.roles && !permissions.hasRole(item.roles as any[])) {
            return false;
        }

        // Check feature requirement
        if (item.features) {
            const hasAllFeatures = item.features.every((feature) =>
                permissions.hasFeature(feature as any)
            );
            if (!hasAllFeatures) return false;
        }

        // Check custom permission
        if (item.permissionCheck && !item.permissionCheck(permissions)) {
            return false;
        }

        return true;
    };

    /**
     * Handle navigation
     */
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    /**
     * Handle logout
     */
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const visibleItems = MENU_ITEMS.filter(isItemVisible);
    const currentPath = location.pathname;

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚖️</span>
                    {!isCollapsed && <span className="logo-text">Law Organizer</span>}
                </div>
                <button
                    className="collapse-button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '»' : '«'}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {visibleItems.map((item) => (
                        <li
                            key={item.id}
                            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!isCollapsed && (
                                <>
                                    <span className="nav-label">{item.label}</span>
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {permissions.user?.firstName?.charAt(0) || '?'}
                    </div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <span className="user-name">
                                {permissions.user?.firstName} {permissions.user?.lastName}
                            </span>
                            <span className="user-role">{permissions.user?.role}</span>
                        </div>
                    )}
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <span className="logout-icon">🚪</span>
                    {!isCollapsed && <span>Вийти</span>}
                </button>
            </div>
        </div>
    );
};

/**
 * Top Navigation Bar Component
 */
export const TopNavigation: React.FC = () => {
    const permissions = usePermissions();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="top-navigation">
            <div className="top-nav-left">
                <div className="breadcrumb">
                    <span className="breadcrumb-item">Law Organizer</span>
                </div>
            </div>

            <div className="top-nav-right">
                {/* Subscription badge */}
                {permissions.organization && (
                    <div className="subscription-badge">
                        <span className={`plan-badge ${permissions.getPlan()}`}>
                            {permissions.getPlan()}
                        </span>
                    </div>
                )}

                {/* Notifications */}
                <button className="notification-button">
                    🔔
                    <span className="notification-dot"></span>
                </button>

                {/* User menu */}
                <div className="user-menu-container">
                    <button
                        className="user-menu-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar-small">
                            {permissions.user?.firstName?.charAt(0) || '?'}
                        </div>
                        <span className="user-name-small">
                            {permissions.user?.firstName}
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="user-menu-dropdown">
                            <div className="menu-header">
                                <strong>
                                    {permissions.user?.firstName} {permissions.user?.lastName}
                                </strong>
                                <span className="menu-email">{permissions.user?.email}</span>
                            </div>
                            <div className="menu-divider"></div>
                            <button
                                className="menu-item"
                                onClick={() => {
                                    navigate('/profile');
                                    setShowUserMenu(false);
                                }}
                            >
                                👤 Профіль
                            </button>
                            {permissions.canManageBilling() && (
                                <button
                                    className="menu-item"
                                    onClick={() => {
                                        navigate('/billing');
                                        setShowUserMenu(false);
                                    }}
                                >
                                    💎 Підписка
                                </button>
                            )}
                            <button
                                className="menu-item"
                                onClick={() => {
                                    navigate('/settings');
                                    setShowUserMenu(false);
                                }}
                            >
                                ⚙️ Налаштування
                            </button>
                            <div className="menu-divider"></div>
                            <button className="menu-item logout" onClick={handleLogout}>
                                🚪 Вийти
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Mobile Navigation Component
 */
export const MobileNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const permissions = usePermissions();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isItemVisible = (item: MenuItem): boolean => {
        if (item.visible === false) return false;
        if (item.roles && !permissions.hasRole(item.roles as any[])) return false;
        if (item.features) {
            const hasAllFeatures = item.features.every((feature) =>
                permissions.hasFeature(feature as any)
            );
            if (!hasAllFeatures) return false;
        }
        if (item.permissionCheck && !item.permissionCheck(permissions)) return false;
        return true;
    };

    const visibleItems = MENU_ITEMS.filter(isItemVisible).slice(0, 5); // Show max 5 items on mobile

    return (
        <div className="mobile-navigation">
            <div className="mobile-nav-header">
                <div className="mobile-logo">
                    <span>⚖️</span>
                    <span>Law Organizer</span>
                </div>
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </button>
            </div>

            {isMenuOpen && (
                <div className="mobile-menu">
                    {visibleItems.map((item) => (
                        <button
                            key={item.id}
                            className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                setIsMenuOpen(false);
                            }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="mobile-nav-bottom">
                {visibleItems.slice(0, 4).map((item) => (
                    <button
                        key={item.id}
                        className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="mobile-nav-icon">{item.icon}</span>
                        <span className="mobile-nav-label">{item.label}</span>
                    </button>
                ))}
                <button
                    className={`mobile-nav-item ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="mobile-nav-icon">☰</span>
                    <span className="mobile-nav-label">Меню</span>
                </button>
            </div>
        </div>
    );
};

export default SidebarNavigation;
