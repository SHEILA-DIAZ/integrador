import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SolicitudRegistro from './pages/SolicitudRegistro'
import AdminCompanyPanel from './pages/admin/AdminCompanyPanel'
import Registro from './pages/auth/Registro'
import Login from './pages/auth/Login'
import Campanas from './pages/Campanas'
import Home from './pages/Home'
import CompanyAccess from './pages/CompanyAccess'
import AdminCampaigns, { RedirectAdminCampanas } from './pages/admin/AdminCampaigns'
import AdminDonations from './pages/admin/AdminDonations'
import AdminCashIncome from './pages/admin/AdminCashIncome'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAssociations from './pages/admin/AdminAssociations'
import AdminDashboard from './pages/admin/AdminDashboard'
import CompanyDashboard from './pages/company/CompanyDashboard'
import CompanyAICampaignGenerator from './pages/company/CompanyAICampaignGenerator'
import CompanyRoles from './pages/company/CompanyRoles'
import AdminRoles from './pages/admin/AdminRoles'
import FirefighterPanel from './pages/admin/FirefighterPanel'
import AdminAICampaignGenerator from './pages/admin/AdminAICampaignGenerator'
import AdminReports from './pages/admin/AdminReports'
import AdminReportExport from './pages/admin/AdminReportExport'
import AdminProfile from './pages/admin/AdminProfile'
import CampaignDetail from './pages/CampaignDetail'
import DonationSuccess from './pages/DonationSuccess'
import DonationHistory from './pages/DonationHistory'
import AssociationCampaigns from './pages/association/AssociationCampaigns'
import AssociationDashboard from './pages/association/AssociationDashboard'
import AssociationCompanies from './pages/association/AssociationCompanies'
import AssociationDonations from './pages/association/AssociationDonations'
import AssociationCashIncome from './pages/association/AssociationCashIncome'
import AssociationStatistics from './pages/association/AssociationStatistics'
import AssociationReports from './pages/association/AssociationReports'
import Footer from './components/Footer'
import './App.css'

const obtenerRol = () => {
  let role = localStorage.getItem('userRole')

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    role = user.role || user.rol || role
  } catch {
    // Conserva el rol simple si el usuario almacenado no es JSON valido.
  }

  return String(role || '').trim().toLowerCase()
}

const esCredencialAdminCompania = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return String(user.email || '').trim().toLowerCase() === 'bombero@firesupport.com'
  } catch {
    return false
  }
}

function RutaAdmin({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()
  return token && ['super_admin', 'admin_compania'].includes(role)
    ? children
    : <Navigate to="/login" />
}

function RutaBombero({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()
  if (token && role === 'bombero' && esCredencialAdminCompania()) return <Navigate to="/company/dashboard" />
  const rolesPermitidos = ['bombero']
  return token && rolesPermitidos.includes(role)
    ? children
    : <Navigate to="/login" />
}

function RutaSuperAdmin({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()
  return token && role === 'super_admin'
    ? children
    : <Navigate to="/login" />
}

function RutaCompanyAdmin({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()

  if (!token) return <Navigate to="/company-access" />
  if (role === 'admin_compania' || (role === 'bombero' && esCredencialAdminCompania())) return children
  if (role === 'super_admin') return <Navigate to="/admin/dashboard" />
  return <Navigate to="/login" />
}

function RutaAsociacion({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()
  if (!token) return <Navigate to="/association-access" />
  return role === 'admin_asociacion' ? children : <Navigate to="/login" />
}

function AppContent() {
  const location = useLocation()
  const mostrarFooter =
    !location.pathname.startsWith('/admin') &&
    !location.pathname.startsWith('/company') &&
    (location.pathname === '/association-access' || !location.pathname.startsWith('/association'))

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/solicitud-registro" element={<SolicitudRegistro />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login key="login" />} />
        <Route path="/company-access" element={<CompanyAccess />} />
        <Route path="/association-access" element={<Login key="association-access" initialAssociation />} />
        <Route path="/campanas" element={<Campanas />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/donation/success/:id" element={<DonationSuccess />} />
        <Route path="/historial" element={<DonationHistory />} />
        <Route
          path="/association"
          element={<Navigate to="/association/dashboard" />}
        />
        <Route
          path="/association/dashboard"
          element={
            <RutaAsociacion>
              <AssociationDashboard />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/campaigns"
          element={
            <RutaAsociacion>
              <AssociationCampaigns />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/companies"
          element={
            <RutaAsociacion>
              <AssociationCompanies />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/donations"
          element={
            <RutaAsociacion>
              <AssociationDonations />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/cash-income"
          element={
            <RutaAsociacion>
              <AssociationCashIncome />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/statistics"
          element={
            <RutaAsociacion>
              <AssociationStatistics />
            </RutaAsociacion>
          }
        />
        <Route
          path="/association/reports"
          element={
            <RutaAsociacion>
              <AssociationReports />
            </RutaAsociacion>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route
          path="/company/dashboard"
          element={
            <RutaCompanyAdmin>
              <CompanyDashboard />
            </RutaCompanyAdmin>
          }
        />
        <Route
          path="/company/ai-campaign-generator"
          element={
            <RutaCompanyAdmin>
              <CompanyAICampaignGenerator />
            </RutaCompanyAdmin>
          }
        />
        <Route
          path="/company/reports"
          element={
            <RutaCompanyAdmin>
              <AdminReports companyMode />
            </RutaCompanyAdmin>
          }
        />
        <Route
          path="/company/roles"
          element={
            <RutaCompanyAdmin>
              <CompanyRoles />
            </RutaCompanyAdmin>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RutaSuperAdmin>
              <AdminDashboard />
            </RutaSuperAdmin>
          }
        />
        <Route
          path="/admin/campaigns"
          element={
            <RutaAdmin>
              <AdminCampaigns />
            </RutaAdmin>
          }
        />
        <Route path="/admin/campanas" element={<RedirectAdminCampanas />} />
        <Route
          path="/admin/donations"
          element={
            <RutaAdmin>
              <AdminDonations />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/cash-income"
          element={
            <RutaAdmin>
              <AdminCashIncome />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RutaAdmin>
              <AdminUsers />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/associations"
          element={
            <RutaAdmin>
              <AdminAssociations />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RutaSuperAdmin>
              <AdminRoles />
            </RutaSuperAdmin>
          }
        />
        <Route
          path="/admin/ai-campaign-generator"
          element={
            <RutaAdmin>
              <AdminAICampaignGenerator />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RutaSuperAdmin>
              <AdminReports />
            </RutaSuperAdmin>
          }
        />
        <Route
          path="/admin/report-export"
          element={
            <RutaAdmin>
              <AdminReportExport />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <RutaAdmin>
              <AdminProfile />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/firefighter"
          element={
            <RutaBombero>
              <FirefighterPanel />
            </RutaBombero>
          }
        />
        <Route
          path="/admin/solicitudes"
          element={
            <RutaSuperAdmin>
              <AdminCompanyPanel />
            </RutaSuperAdmin>
          }
        />
      </Routes>
      {mostrarFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
