import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLayout.css'

const items = [
  { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: '▦', href: '/company/dashboard' },
  { id: 'company-panel', label: 'Panel Compañía', icon: '▣', href: '/company/dashboard' },
  { id: 'campaigns', label: 'Campañas', icon: '♡', href: '/admin/campaigns' },
  { id: 'donations', label: 'Donaciones Virtuales', icon: '$', href: '/admin/donations' },
  { id: 'cash-income', label: 'Ingresos en Efectivo', icon: '$', href: '/admin/cash-income' },
  { id: 'users', label: 'Gestión de Usuarios', icon: '♙', href: '/admin/users' },
  { id: 'associations', label: 'Asociaciones', icon: '♙', href: '/admin/associations' },
  { id: 'advanced-title', label: 'HERRAMIENTAS AVANZADAS', section: true },
  { id: 'ai-generator', label: 'Generador IA', icon: '✧', href: '/company/ai-campaign-generator' },
  { id: 'settings-title', label: 'CONFIGURACIÓN', section: true },
  { id: 'global-reports', label: 'Reportes Globales', icon: '▥', href: '/company/reports' },
  { id: 'roles', label: 'Roles y Permisos', icon: '◴', href: '/company/roles' },
]

function BellIcon() {
  return (
    <svg className="al-bell-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    </svg>
  )
}

const obtenerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

export default function CompanyAdminLayout({ active = 'company-panel', children }) {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)
  const usuario = obtenerUsuario()
  const nombre = usuario.nombre || usuario.name || 'Admin Compañía'
  const email = usuario.email || 'bombero@firesupport.com'
  const inicial = String(nombre || email || 'C').trim().charAt(0).toUpperCase()

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlHacerClickFuera)
    return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera)
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    localStorage.removeItem('usuario')
    localStorage.removeItem('donorName')
    localStorage.removeItem('donorEmail')
    navigate('/company-access')
  }

  return (
    <main className="al-admin">
      <aside className="al-sidebar">
        <div className="al-brand">
          <span className="al-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </div>

        <nav className="al-nav" aria-label="Navegación de administración de compañía">
          {items.map((item) => (
            item.section ? (
              <span className="al-nav-section" key={item.id}>{item.label}</span>
            ) : (
              <a
                className={`al-nav-item ${active === item.id ? 'active' : 'muted'}`}
                href={item.href}
                key={item.id}
              >
                <span>{item.icon}</span> {item.label}
              </a>
            )
          ))}
        </nav>

        <div className="al-user">
          <span className="al-avatar">{inicial}</span>
          <div>
            <strong>{nombre}</strong>
            <small>{email}</small>
          </div>
          <button className="al-logout" type="button" onClick={cerrarSesion} aria-label="Cerrar sesión" title="Cerrar sesión">
            ←
          </button>
        </div>
      </aside>

      <section className="al-content">
        <header className="al-topbar">
          <div />
          <div className="al-top-actions" ref={menuRef}>
            <span className="al-bell" aria-label="Notificaciones" role="img"><BellIcon /></span>
            <button className="al-account-trigger" type="button" onClick={() => setMenuAbierto((abierto) => !abierto)} aria-expanded={menuAbierto} aria-haspopup="menu">
              <span className="al-admin-avatar">{inicial}</span>
              <span className="al-chevron">⌄</span>
            </button>
            {menuAbierto && (
              <div className="al-account-menu" role="menu">
                <div className="al-account-info">
                  <strong>{nombre}</strong>
                  <small>{email}</small>
                  <span>Panel Compañía</span>
                </div>
                <div className="al-menu-divider" />
                <button type="button" role="menuitem" onClick={() => navigate('/admin/profile')}>Mi perfil</button>
                <button type="button" role="menuitem">Configuración</button>
                <button className="al-menu-logout" type="button" role="menuitem" onClick={cerrarSesion}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </header>
        <div className="al-main">{children}</div>
      </section>
    </main>
  )
}
