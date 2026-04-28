import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitLogsProvider } from './context/HabitLogsContext';
import { AuthPage } from './pages/AuthPage';
import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateHabitPage } from './pages/CreateHabitPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RemindersPage } from './pages/RemindersPage';
import { LearnPage } from './pages/LearnPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditHabitPage } from './pages/EditHabitPage';
import { BottomNav } from './components/bottom-nav';
import { ensurePushSubscription } from './lib/push';
import { pushApi } from './api/push';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/welcome" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { token, userId } = useAuth();
  const location = useLocation();
  const mainTabs = ['/analytics', '/learn', '/profile'];
  const showNav = token && mainTabs.includes(location.pathname);

  // Auto-register push subscription when the user is logged in and
  // notification permission is already granted (silent re-registration on every
  // app load ensures we always have a valid subscription in the DB).
  useEffect(() => {
    if (!token || !userId) return;
    if (Notification.permission !== 'granted') return;

    ensurePushSubscription()
      .then((sub) => pushApi.register(userId, sub, navigator.userAgent))
      .catch(() => {
        // Silent — user may have denied permission or SW is unavailable
      });
  }, [token, userId]);

  return (
    <>
      <Routes>
        <Route path="/welcome" element={token ? <Navigate to="/dashboard" replace /> : <WelcomePage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateHabitPage /></RequireAuth>} />
        <Route path="/habit/:id" element={<RequireAuth><HabitDetailPage /></RequireAuth>} />
        <Route path="/habit/:id/edit" element={<RequireAuth><EditHabitPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
        <Route path="/reminders" element={<RequireAuth><RemindersPage /></RequireAuth>} />
        <Route path="/learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
        <Route path="/learn/articles/:articleId" element={<RequireAuth><ArticleDetailPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HabitLogsProvider>
        <AppRoutes />
      </HabitLogsProvider>
    </AuthProvider>
  );
}
