import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SolicitudRegistro from './pages/SolicitudRegistro'
import PanelSolicitudes from './pages/admin/PanelSolicitudes'
import Registro from './pages/auth/Registro'
import Login from './pages/auth/Login'
import Campanas from './pages/Campanas'
import Home from './pages/Home'
import AdminCampaigns, { RedirectAdminCampanas } from './pages/admin/AdminCampaigns'
import AdminDonations from './pages/admin/AdminDonations'
import AdminCashIncome from './pages/admin/AdminCashIncome'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAssociations from './pages/admin/AdminAssociations'
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

  return String(role || '')
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

function RutaAsociacion({ children }) {
  const token = localStorage.getItem('token')
  const role = obtenerRol()
  return token && role === 'admin_asociacion'
    ? children
    : <Navigate to="/login" />
}

function AppContent() {
  const location = useLocation()
  const mostrarFooter =
    !location.pathname.startsWith('/admin') &&
    !location.pathname.startsWith('/association')

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/solicitud-registro" element={<SolicitudRegistro />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/campanas" element={<Campanas />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/donation/success/:id" element={<DonationSuccess />} />
        <Route path="/historial" element={<DonationHistory />} />
        <Route
          path="/association/campaigns"
          element={
            <RutaAsociacion>
              <AssociationCampaigns />
            </RutaAsociacion>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route
          path="/admin/dashboard"
          element={
            <RutaAdmin>
              <PanelSolicitudes active="dashboard" />
            </RutaAdmin>
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
            <RutaAdmin>
              <PanelSolicitudes />
            </RutaAdmin>
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
