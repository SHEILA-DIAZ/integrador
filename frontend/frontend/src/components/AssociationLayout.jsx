import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AssociationLayout.css'

const menuPrincipal = [
  { id: 'dashboard', label: 'Dashboard Asociacion', icon: '▦', href: '/association/dashboard' },
  { id: 'campaigns', label: 'Gestionar Campanas', icon: '♡', href: '/association/campaigns' },
  { id: 'companies', label: 'Companias Vinculadas', icon: '▤', href: '/association/companies' },
  { id: 'donations', label: 'Donaciones Virtuales', icon: '$', href: '/association/donations' },
  { id: 'cash-income', label: 'Ingresos en Efectivo', icon: '$', href: '/association/cash-income' },
]

const menuReportes = [
  { id: 'statistics', label: 'Estadisticas', icon: '▥', href: '/association/statistics' },
  { id: 'reports', label: 'Exportar Reportes', icon: '⇩', href: '/association/reports' },
]

const obtenerCuenta = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      nombre: usuario.nombre || usuario.name || 'Admin Asociacion',
      email: usuario.email || 'adminasociacion@bomberos.com',
      asociacion: usuario.asociacion || usuario.nombre_asociacion || usuario.association_name || 'Asociacion Nacional',
    }
  } catch {
    return { nombre: 'Admin Asociacion', email: 'adminasociacion@bomberos.com', asociacion: 'Asociacion Nacional' }
  }
}

export default function AssociationLayout({ active, children }) {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)
  const cuenta = obtenerCuenta()

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuAbierto(false)
    }

    document.addEventListener('mousedown', cerrarAlHacerClickFuera)
    return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera)
  }, [])

  const salir = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    localStorage.removeItem('usuario')
    navigate('/home')
  }

  return (
    <main className="asl-admin">
      <aside className="asl-sidebar">
        <div className="asl-brand">
          <span className="asl-brand-icon">▤</span>
          <strong>FireSupport IA</strong>
        </div>

        <nav className="asl-nav" aria-label="Navegacion de asociacion">
          {menuPrincipal.map((item) => (
            <Link className={`asl-nav-item ${active === item.id ? 'active' : 'muted'}`} to={item.href} key={item.id}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <div className="asl-section-title">ANALISIS Y REPORTES</div>
          {menuReportes.map((item) => (
            <Link className={`asl-nav-item ${active === item.id ? 'active' : 'muted'}`} to={item.href} key={item.id}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="asl-user">
          <span className="asl-avatar">A</span>
          <div>
            <strong>{cuenta.nombre}</strong>
            <small>{cuenta.asociacion}</small>
          </div>
          <button className="asl-exit" type="button" onClick={() => setMenuAbierto((abierto) => !abierto)} aria-label="Abrir opciones" title="Opciones">⌄</button>
        </div>
      </aside>

      <section className="asl-content">
        <header className="asl-topbar">
          <div />
          <div className="asl-top-actions" ref={menuRef}>
            <span className="asl-bell">♧</span>
            <button className="asl-account-trigger" type="button" onClick={() => setMenuAbierto((abierto) => !abierto)} aria-expanded={menuAbierto} aria-haspopup="menu">
              <span className="asl-avatar">A</span>
              <span className="asl-chevron">⌄</span>
            </button>
            {menuAbierto && (
              <div className="asl-account-menu" role="menu">
                <div className="asl-account-info">
                  <strong>{cuenta.nombre}</strong>
                  <small>{cuenta.email}</small>
                  <span>Panel Asociacion</span>
                </div>
                <div className="asl-menu-divider" />
                <button type="button" role="menuitem">Mi perfil</button>
                <button type="button" role="menuitem">Configuracion</button>
                <button className="asl-menu-exit" type="button" role="menuitem" onClick={salir}>Cerrar sesion</button>
              </div>
            )}
          </div>
        </header>

        <div className="asl-main">{children}</div>
      </section>
    </main>
  )
}
