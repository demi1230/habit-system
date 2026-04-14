import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateHabitPage } from './pages/CreateHabitPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RemindersPage } from './pages/RemindersPage';
import { LearnPage } from './pages/LearnPage';
import { ProfilePage } from './pages/ProfilePage';
import { BottomNav } from './components/bottom-nav';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { token } = useAuth();
  const location = useLocation();
  const showNav = token && !['/login'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateHabitPage /></RequireAuth>} />
        <Route path="/habit/:id" element={<RequireAuth><HabitDetailPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
        <Route path="/reminders" element={<RequireAuth><RemindersPage /></RequireAuth>} />
        <Route path="/learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
