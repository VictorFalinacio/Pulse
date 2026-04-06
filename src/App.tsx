import { useState, useCallback } from 'react';
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
import './index.css';

// Rotas que NÃO precisam de monitoramento de sessão
const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/register-success'];

const IDLE_TIMEOUT_MS  = 10 * 60 * 1000; // 10 minutos sem atividade → abre modal
const COUNTDOWN_SECONDS = 60;              // 60s para o usuário reagir antes do logout automático

function SessionGuard({ children }: { children: React.ReactNode }) {
    const navigate    = useNavigate();
    const location    = useLocation();
    const [showModal, setShowModal] = useState(false);

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
    useSessionTimeout(handleIdle, IDLE_TIMEOUT_MS, !isPublicRoute && isLoggedIn && !showModal);

    return (
        <>
            {children}
            <SessionTimeoutModal
                isOpen={showModal}
                onStayLoggedIn={handleStayLoggedIn}
                onLogout={handleLogout}
                countdownSeconds={COUNTDOWN_SECONDS}
            />
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
                            <Route path="/dashboard"        element={<Dashboard />} />
                            <Route path="/verify-email"     element={<VerifyEmail />} />
                            <Route path="/forgot-password"  element={<ForgotPassword />} />
                            <Route path="/reset-password"   element={<ResetPassword />} />
                            <Route path="/register-success" element={<RegisterSuccess />} />
                            <Route path="/sprints"          element={<Sprints />} />
                            <Route path="/sprint/:id"       element={<SprintDashboard />} />
                            <Route path="/"                 element={<Navigate to="/login" replace />} />
                        </Routes>
                    </SessionGuard>
                </CooldownProvider>
            </UploadProvider>
        </Router>
    );
}

export default App;
