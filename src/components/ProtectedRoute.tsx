import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('agile_pulse_token');
  const storedUser = localStorage.getItem('agile_pulse_current_user');
  let validUser = false;

  try {
    const user: unknown = storedUser ? JSON.parse(storedUser) : null;
    validUser = typeof user === 'object' && user !== null
      && 'id' in user && typeof user.id === 'string'
      && 'name' in user && typeof user.name === 'string';
  } catch {
    validUser = false;
  }

  if (!token || !validUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
