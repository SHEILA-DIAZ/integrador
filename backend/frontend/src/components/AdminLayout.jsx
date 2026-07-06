import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLayout.css'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', href: '/admin/dashboard' },
  { id: 'campaigns', label: 'Campañas', icon: '♡', href: '/admin/campaigns' },
  { id: 'donations', label: 'Donaciones Virtuales', icon: '$', href: '/admin/donations' },
  { id: 'cash-income', label: 'Ingresos en Efectivo', icon: '$', href: '/admin/cash-income' },
  { id: 'users', label: 'Gestión de Usuarios', icon: '♙', href: '/admin/users' },
  { id: 'associations', label: 'Asociaciones', icon: '♙', href: '/admin/associations' },
  { id: 'roles', label: 'Roles y Permisos', icon: '♙', href: '/admin/roles' },
  { id: 'ai-generator', label: 'Generador IA', icon: '✦', href: '/admin/ai-campaign-generator' },
  { id: 'global-reports', label: 'Reportes Globales', icon: '▥', href: '/admin/reports' },
  { id: 'export-reports', label: 'Exportar Reportes', icon: '⇩', href: '/admin/report-export' },
  { id: 'profile', label: 'Mi Perfil', icon: '⊙', href: '/admin/profile' },
]

export default function AdminLayout({ active, children }) {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', cerrarAlHacerClickFuera)
    return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera)
  }, [])

  const irPerfil = () => {
    setMenuAbierto(false)
    navigate('/admin/profile')
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    localStorage.removeItem('usuario')
    localStorage.removeItem('donorName')
    localStorage.removeItem('donorEmail')
    navigate('/login')
  }

  return (
    <main className="al-admin">
      <aside className="al-sidebar">
        <div className="al-brand">
          <span className="al-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </div>

        <nav className="al-nav" aria-label="Navegación de administración">
          {items.map((item) => (
            <a
              className={`al-nav-item ${active === item.id ? 'active' : 'muted'} ${item.static ? 'static' : ''}`}
              href={item.href}
              key={item.id}
              onClick={item.static ? (event) => event.preventDefault() : undefined}
              aria-disabled={item.static ? 'true' : undefined}
            >
              <span>{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>

        <div className="al-user">
          <span className="al-avatar">A</span>
          <div>
            <strong>Admin User</strong>
            <small>admin@firesupport.pe</small>
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
            <span className="al-bell">♧</span>
            <button className="al-account-trigger" type="button" onClick={() => setMenuAbierto((abierto) => !abierto)} aria-expanded={menuAbierto} aria-haspopup="menu">
              <span className="al-admin-avatar">A</span>
              <span className="al-chevron">⌄</span>
            </button>
            {menuAbierto && (
              <div className="al-account-menu" role="menu">
                <div className="al-account-info">
                  <strong>Admin User</strong>
                  <small>admin@firesupport.pe</small>
                  <span>Panel Administrador</span>
                </div>
                <div className="al-menu-divider" />
                <button type="button" role="menuitem" onClick={irPerfil}>Mi perfil</button>
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
