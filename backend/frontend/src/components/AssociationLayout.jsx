import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AssociationLayout.css'

const obtenerCuenta = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      nombre: usuario.nombre || usuario.name || 'Admin Asociación',
      email: usuario.email || 'admin@asociacion.pe',
      asociacion: usuario.asociacion || usuario.nombre_asociacion || usuario.association_name || 'Asociación',
    }
  } catch {
    return { nombre: 'Admin Asociación', email: 'admin@asociacion.pe', asociacion: 'Asociación' }
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

        <nav className="asl-nav" aria-label="Navegación de asociación">
          <span className="asl-nav-item muted"><span>▦</span> Dashboard</span>
          <a className={`asl-nav-item ${active === 'campaigns' ? 'active' : 'muted'}`} href="/association/campaigns">
            <span>♡</span> Gestionar Campañas
          </a>
        </nav>

        <div className="asl-user">
          <span className="asl-avatar">A</span>
          <div>
            <strong>{cuenta.nombre}</strong>
            <small>{cuenta.asociacion}</small>
          </div>
          <button className="asl-exit" type="button" onClick={salir} aria-label="Salir al inicio" title="Salir al inicio">↳</button>
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
                  <span>Panel Asociación</span>
                </div>
                <div className="asl-menu-divider" />
                <button type="button" role="menuitem">Mi perfil</button>
                <button type="button" role="menuitem">Configuración</button>
                <button className="asl-menu-exit" type="button" role="menuitem" onClick={salir}>Salir al inicio</button>
              </div>
            )}
          </div>
        </header>

        <div className="asl-main">{children}</div>
      </section>
    </main>
  )
}
