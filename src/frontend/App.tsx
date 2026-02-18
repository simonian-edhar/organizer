import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import {
    LoginPage,
    RegisterPage,
    DashboardPage,
    BillingPage,
    PaymentSuccessPage,
    PaymentCancelPage,
    OnboardingWizard,
    ProfilePage,
} from './pages';
import { SidebarNavigation, TopNavigation, MobileNavigation } from './components/navigation';
import './App.css';

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

/**
 * Onboarding Route Component
 * Redirects to onboarding if not completed
 */
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { progress, isLoading } = useOnboarding();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    // If onboarding not completed, show wizard
    if (progress && !progress.completed) {
        return <OnboardingWizard />;
    }

    return <>{children}</>;
};

/**
 * Owner Only Route Component
 */
const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isOwner = user?.role === 'organization_owner';

    if (!isOwner) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

/**
 * Main Layout Component
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="app-layout">
            <SidebarNavigation />
            <div className="main-content">
                <TopNavigation />
                <div className="page-content">
                    {children}
                </div>
            </div>
            <MobileNavigation />
        </div>
    );
};

/**
 * App Component with Routing
 */
export const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                {/* Billing callback routes (public) */}
                <Route
                    path="/billing/success"
                    element={
                        <ProtectedRoute>
                            <PaymentSuccessPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/billing/cancel"
                    element={
                        <ProtectedRoute>
                            <PaymentCancelPage />
                        </ProtectedRoute>
                    }
                />

                {/* Onboarding Route */}
                <Route
                    path="/onboarding"
                    element={<OnboardingRoute><OnboardingWizard /></OnboardingRoute>}
                />

                {/* Protected Routes with Layout */}
                <Route
                    path="/dashboard"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <DashboardPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                <Route
                    path="/billing"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <BillingPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Cases Routes */}
                <Route
                    path="/cases"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <CasesPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />
                <Route
                    path="/cases/new"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <CaseCreatePage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />
                <Route
                    path="/cases/:id"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <CaseDetailsPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Clients Routes */}
                <Route
                    path="/clients"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <ClientsPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Documents Routes */}
                <Route
                    path="/documents"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <DocumentsPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Calendar Route */}
                <Route
                    path="/calendar"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <CalendarPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Calculations Route */}
                <Route
                    path="/calculations"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <CalculationsPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Invoices Route */}
                <Route
                    path="/invoices"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <InvoicesPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Team Route */}
                <Route
                    path="/team"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <TeamPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Audit Route */}
                <Route
                    path="/audit"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <AuditPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Settings Route */}
                <Route
                    path="/settings"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <SettingsPage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Profile Route */}
                <Route
                    path="/profile"
                    element={
                        <OnboardingRoute>
                            <MainLayout>
                                <ProfilePage />
                            </MainLayout>
                        </OnboardingRoute>
                    }
                />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 Route */}
                <Route
                    path="*"
                    element={
                        <div className="not-found-page">
                            <div className="not-found-content">
                                <h1>404</h1>
                                <p>Сторінку не знайдено</p>
                                <a href="/dashboard" className="back-link">
                                    Перейти на дашборд
                                </a>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
};

// Placeholder components for routes not yet implemented
const CasesPage = () => <div className="placeholder-page"><h2>Справи</h2><p>Сторінка в розробці</p></div>;
const CaseCreatePage = () => <div className="placeholder-page"><h2>Нова справа</h2><p>Сторінка в розробці</p></div>;
const CaseDetailsPage = () => <div className="placeholder-page"><h2>Деталі справи</h2><p>Сторінка в розробці</p></div>;
const ClientsPage = () => <div className="placeholder-page"><h2>Клієнти</h2><p>Сторінка в розробці</p></div>;
const DocumentsPage = () => <div className="placeholder-page"><h2>Документи</h2><p>Сторінка в розробці</p></div>;
const CalendarPage = () => <div className="placeholder-page"><h2>Календар</h2><p>Сторінка в розробці</p></div>;
const CalculationsPage = () => <div className="placeholder-page"><h2>Калькулятори</h2><p>Сторінка в розробці</p></div>;
const InvoicesPage = () => <div className="placeholder-page"><h2>Рахунки</h2><p>Сторінка в розробці</p></div>;
const TeamPage = () => <div className="placeholder-page"><h2>Команда</h2><p>Сторінка в розробці</p></div>;
const AuditPage = () => <div className="placeholder-page"><h2>Аудит</h2><p>Сторінка в розробці</p></div>;
const SettingsPage = () => <div className="placeholder-page"><h2>Налаштування</h2><p>Сторінка в розробці</p></div>;

export default App;
