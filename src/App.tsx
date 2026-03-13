import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './index.css';

function App() {
  return (
    <Router>
      <UploadProvider>
        <CooldownProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/sprint/:id" element={<SprintDashboard />} />
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </CooldownProvider>
    </UploadProvider>
  </Router>
);
}

export default App;
