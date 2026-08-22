import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import AIMatchesPage from './pages/AIMatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import PersonalityTestPage from './pages/PersonalityTestPage';
import SocialMediaIntegrationPage from './pages/SocialMediaIntegrationPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import CompatibilityCheckerPage from './pages/CompatibilityCheckerPage';
import PublicProfilePage from './pages/PublicProfilePage';
import JoinCompatibilityPage from './pages/JoinCompatibilityPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage
  },
  {
    path: '/compatibility-checker',
    Component: CompatibilityCheckerPage
  },
  {
    path: '/compatibility/join/:sessionId',
    Component: JoinCompatibilityPage
  },
  {
    path: '/login',
    Component: LoginPage
  },
  {
    path: '/signup',
    Component: SignupPage
  },
  {
    path: '/forgot-password',
    Component: ForgotPasswordPage
  },
  {
    path: '/reset-password/:token',
    Component: ResetPasswordPage
  },
  {
    path: '/app',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard
      },
      {
        path: 'explore',
        Component: ExplorePage
      },
      {
        path: 'matches',
        Component: AIMatchesPage
      },
      {
        path: 'messages',
        Component: MessagesPage
      },
      {
        path: 'profile',
        Component: ProfilePage
      },
      {
        path: 'profile/:userId',
        Component: PublicProfilePage
      },
      {
        path: 'profile/edit',
        Component: EditProfilePage
      },
      {
        path: 'personality-test',
        Component: PersonalityTestPage
      },
      {
        path: 'social-media',
        Component: SocialMediaIntegrationPage
      },
      {
        path: 'settings',
        Component: SettingsPage
      },
      {
        path: 'admin',
        Component: AdminDashboard
      }
    ]
  },
  {
    path: '*',
    Component: NotFoundPage
  }
]);
