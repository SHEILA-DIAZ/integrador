import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLayout.css'

const items = [
  { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: '▦', href: '/admin/dashboard' },
  { id: 'solicitudes', label: 'Panel Superadmin', icon: '▣', href: '/admin/solicitudes' },
  { id: 'campaigns', label: 'Campañas', icon: '♡', href: '/admin/campaigns' },
  { id: 'donations', label: 'Donaciones Virtuales', icon: '$', href: '/admin/donations' },
  { id: 'cash-income', label: 'Ingresos en Efectivo', icon: '$', href: '/admin/cash-income' },
  { id: 'users', label: 'Gestión de Usuarios', icon: '♙', href: '/admin/users' },
  { id: 'associations', label: 'Asociaciones', icon: '♙', href: '/admin/associations' },
]

function BellIcon() {
  return (
    <svg className="al-bell-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    </svg>
  )
}

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
            <span className="al-bell" aria-label="Notificaciones" role="img"><BellIcon /></span>
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
