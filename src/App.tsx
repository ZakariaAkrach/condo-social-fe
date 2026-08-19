import { Navigate, Route, Routes } from 'react-router'
import PublicLayout from './app/layouts/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import AuthCallbackRegistrationPage from './pages/public/AuthCallbackRegistrationPage'
import ProtectedRoute from './routes/ProtectedRoute'
import OnboardingPage from './pages/private/Onboarding'
import AdminDashboardPage from './pages/private/AdminDashboardPage'
import ResidentDashboardPage from './pages/private/ResidentDashboardPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import { AdminDashboardLayout } from './app/layouts/AdminDashboardLayout'
import AdminCondominiListPage from './pages/private/AdminCondominiListPage'
import AdminCondominiumDetailPage from './pages/private/AdminCondominiumDetailPage'
import InviteNewMemberPage from './pages/public/InviteNewMemberPage'
import { ResidentDashboardLayout } from './app/layouts/ResidentDashboardLayout'

function App() {

  return (
    <Routes>
      <Route element={<PublicLayout />}>

        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<LoginPage />} />
        <Route path="/sign-up" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackRegistrationPage />} />
        <Route path="/invite-new-member" element={<InviteNewMemberPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>


      <Route>
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      </Route>

      <Route element={<ProtectedRoute><AdminDashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/condomini" element={<AdminCondominiListPage />} />
        <Route path="/admin/condomini/:id" element={<AdminCondominiumDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute><ResidentDashboardLayout /></ProtectedRoute>}>
        <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
      </Route>
    </Routes >
  )
}

export default App
