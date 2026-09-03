// src/App.tsx
import { Navigate, Route, Routes } from 'react-router'
import PublicLayout from './app/layouts/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import AuthCallbackRegistrationPage from './pages/public/AuthCallbackRegistrationPage'
import ProtectedRoute from './routes/ProtectedRoute'
import OnboardingPage from './pages/private/Onboarding'
import AdminDashboardPage from './pages/private/AdminDashboardPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import { AdminDashboardLayout } from './app/layouts/AdminDashboardLayout'
import AdminCondominiListPage from './pages/private/AdminCondominiListPage'
import AdminCondominiumDetailPage from './pages/private/AdminCondominiumDetailPage'
import InviteNewMemberPage from './pages/public/InviteNewMemberPage'
import { ResidentDashboardLayout } from './app/layouts/ResidentDashboardLayout'
import DocumentDetailPage from './pages/private/DocumentDetailPage'
import ResidentDocumentDetailPage from './pages/private/resident/ResidentDocumentDetailPage'
import ResidentDocumentsPage from './pages/private/resident/ResidentDocumentsPage'
import ResidentDashboardPage from './pages/private/resident/ResidentDashboardPage'
import DeletedCondominium from './pages/public/DeletedCondominium'
import ResidentTicketsPage from './pages/private/resident/ResidentTicketsPage'
import ResidentCreateTicketPage from './pages/private/resident/ResidentCreateTicketPage'
import ResidentTicketDetailPage from './pages/private/resident/ResidentTicketDetailPage'
import AdminTicketDetailPage from './pages/private/AdminTicketDetailPage'
import AdminPostsListPage from './pages/private/AdminPostsListPage'
import AdminPostCreatePage from './pages/private/AdminPostCreatePage'
import AdminPostDetailPage from './pages/private/AdminPostDetailPage'
import ResidentPostDetailPage from './pages/private/resident/ResidentPostDetailPage'
import AdminTicketsPage from './pages/private/AdminTicketsPage'
import AdminPostsPage from './pages/private/AdminPostsPage'
import AdminArchivePage from './pages/private/AdminArchivePage'
import AdminResidentsPage from './pages/private/AdminResidentsPage'
import AdminSettingsPage from './pages/private/AdminSettingsPage'
import TermsPage from './pages/public/legal/TermsPage'
import PrivacyPage from './pages/public/legal/PrivacyPage'
import DpaPage from './pages/public/legal/DpaPage'
import NotificationsPage from './pages/private/common/NotificationsPage'
import { CondominiumListProvider } from './components/common/CondominiumListContext'

function App() {
  return (
    <CondominiumListProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/sign-up" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackRegistrationPage />} />
          <Route path="/invite-new-member" element={<InviteNewMemberPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/deleted-condominium" element={<DeletedCondominium />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/dpa" element={<DpaPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route>
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        </Route>

        <Route element={<ProtectedRoute><AdminDashboardLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/condomini" element={<AdminCondominiListPage />} />
          <Route path="/admin/condomini/:id" element={<AdminCondominiumDetailPage />} />
          <Route path="/admin/condomini/:condominiumId/documenti/:documentId" element={<DocumentDetailPage />} />

          <Route path="/admin/condomini/:condominiumId/tickets/:ticketId" element={<AdminTicketDetailPage />} />

          <Route path="/admin/condomini/:condominiumId/posts" element={<AdminPostsListPage />} />
          <Route path="/admin/condomini/:condominiumId/posts/create" element={<AdminPostCreatePage />} />
          <Route path="/admin/condomini/:condominiumId/posts/:postId" element={<AdminPostDetailPage />} />

          <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/archive" element={<AdminArchivePage />} />
          <Route path="/admin/residents" element={<AdminResidentsPage />} />

          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          <Route path="/admin/notifiche" element={<NotificationsPage isAdmin={true} />} />
        </Route>

        <Route element={<ProtectedRoute><ResidentDashboardLayout /></ProtectedRoute>}>
          <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />

          <Route path="/resident/documents" element={<ResidentDocumentsPage />} />
          <Route path="/resident/document/:documentId" element={<ResidentDocumentDetailPage />} />

          <Route path="/resident/tickets" element={<ResidentTicketsPage />} />
          <Route path="/resident/tickets/create" element={<ResidentCreateTicketPage />} />
          <Route path="/resident/ticket/:ticketId" element={<ResidentTicketDetailPage />} />

          <Route path="/resident/post/:postId" element={<ResidentPostDetailPage />} />

          <Route path="/resident/notifiche" element={<NotificationsPage isAdmin={false} />} />
        </Route>
      </Routes>
    </CondominiumListProvider>
  )
}

export default App