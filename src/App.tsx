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
import ResidentPostsPage from './pages/private/resident/ResidentDashboardPage'
import ResidentPostDetailPage from './pages/private/resident/ResidentPostDetailPage'

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
        <Route path="/deleted-condominium" element={<DeletedCondominium />} />

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
      </Route>

      <Route element={<ProtectedRoute><ResidentDashboardLayout /></ProtectedRoute>}>
        <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
        <Route path="/resident/documents" element={<ResidentDocumentsPage />} />
        <Route path="/resident/document/:documentId" element={<ResidentDocumentDetailPage />} />

        <Route path="/resident/tickets" element={<ResidentTicketsPage />} />
        <Route path="/resident/tickets/create" element={<ResidentCreateTicketPage />} />
        <Route path="/resident/ticket/:ticketId" element={<ResidentTicketDetailPage />} />

        <Route path="/resident/posts" element={<ResidentPostsPage />} />
        <Route path="/resident/post/:postId" element={<ResidentPostDetailPage />} />
      </Route>
    </Routes >
  )
}

export default App
