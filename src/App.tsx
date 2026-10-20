import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterSuccess from './pages/RegisterSuccess';
import Sprints from './pages/Sprints';
import SprintDashboard from './pages/SprintDashboard';
import { UploadProvider } from './context/UploadContext';
import { CooldownProvider } from './context/CooldownContext';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import ProtectedRoute from './components/ProtectedRoute';
import { SESSION_COUNTDOWN_SECONDS, SESSION_IDLE_TIMEOUT_MS } from './config';
import './index.css';

// Rotas que NÃO precisam de monitoramento de sessão
const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/register-success'];

function SessionGuard({ children }: { children: React.ReactNode }) {
    const navigate    = useNavigate();
    const location    = useLocation();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const onUnauthorized = () => {
            localStorage.removeItem('agile_pulse_token');
            localStorage.removeItem('agile_pulse_current_user');
            setShowModal(false);
            navigate('/login', { replace: true });
        };
        window.addEventListener('agile-pulse:unauthorized', onUnauthorized);
        return () => window.removeEventListener('agile-pulse:unauthorized', onUnauthorized);
    }, [navigate]);

    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
    const isLoggedIn    = !!localStorage.getItem('agile_pulse_token');

    const handleIdle = useCallback(() => {
        if (!isLoggedIn) return;
        setShowModal(true);
    }, [isLoggedIn]);

    const handleLogout = useCallback(() => {
        setShowModal(false);
        localStorage.removeItem('agile_pulse_token');
        localStorage.removeItem('agile_pulse_current_user');
        navigate('/login');
    }, [navigate]);

    const handleStayLoggedIn = useCallback(() => {
        setShowModal(false);
        // O timer reinicia automaticamente pelo hook ao fechar o modal (retomada de atividade)
    }, []);

    // Só monitora inatividade em rotas autenticadas e quando há token
    useSessionTimeout(handleIdle, SESSION_IDLE_TIMEOUT_MS, !isPublicRoute && isLoggedIn && !showModal);

    return (
        <>
            {children}
            {showModal && <SessionTimeoutModal
                isOpen={showModal}
                onStayLoggedIn={handleStayLoggedIn}
                onLogout={handleLogout}
                countdownSeconds={SESSION_COUNTDOWN_SECONDS}
            />}
        </>
    );
}

function App() {
    return (
        <Router>
            <UploadProvider>
                <CooldownProvider>
                    <SessionGuard>
                        <Routes>
                            <Route path="/login"            element={<Login />} />
                            <Route path="/register"         element={<Register />} />
                            <Route path="/verify-email"     element={<VerifyEmail />} />
                            <Route path="/forgot-password"  element={<ForgotPassword />} />
                            <Route path="/reset-password"   element={<ResetPassword />} />
                            <Route path="/register-success" element={<RegisterSuccess />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/sprints" element={<Sprints />} />
                                <Route path="/sprint/:id" element={<SprintDashboard />} />
                            </Route>
                            <Route path="/"                 element={<Navigate to="/login" replace />} />
                        </Routes>
                    </SessionGuard>
                </CooldownProvider>
            </UploadProvider>
        </Router>
    );
}

export default App;
