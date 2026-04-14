import { createBrowserRouter } from 'react-router';
import { WelcomePage } from './pages/welcome';
import { OnboardingPage } from './pages/onboarding';
import { AuthPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { CreateHabitPage } from './pages/create-habit';
import { EditHabitPage } from './pages/edit-habit';
import { HabitDetailPage } from './pages/habit-detail';
import { CheckInPage } from './pages/checkin';
import { ReflectionPage } from './pages/reflection';
import { AnalyticsPage } from './pages/analytics';
import { RemindersPage } from './pages/reminders';
import { ArchivePage } from './pages/archive';
import { ProfilePage } from './pages/profile';
import { LearnPage } from './pages/learn';
import { DesignSystemPage } from './pages/design-system';
import { AppScreensPage } from './pages/app-screens';

export const router = createBrowserRouter([
  { path: '/', Component: WelcomePage },
  { path: '/onboarding', Component: OnboardingPage },
  { path: '/signup', Component: AuthPage },
  { path: '/login', Component: AuthPage },
  { path: '/forgot', Component: AuthPage },
  { path: '/dashboard', Component: DashboardPage },
  { path: '/create', Component: CreateHabitPage },
  { path: '/edit/:id', Component: EditHabitPage },
  { path: '/habit/:id', Component: HabitDetailPage },
  { path: '/checkin/:id', Component: CheckInPage },
  { path: '/reflection/:id', Component: ReflectionPage },
  { path: '/analytics', Component: AnalyticsPage },
  { path: '/reminders', Component: RemindersPage },
  { path: '/learn', Component: LearnPage },
  { path: '/archive', Component: ArchivePage },
  { path: '/profile', Component: ProfilePage },
  { path: '/design-system', Component: DesignSystemPage },
  { path: '/screens', Component: AppScreensPage },
]);