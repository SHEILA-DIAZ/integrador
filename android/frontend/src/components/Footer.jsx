import { Link } from 'react-router-dom'
import './Footer.css'

const haySesionActiva = () =>
  Boolean(localStorage.getItem('token') || localStorage.getItem('userRole'))

const obtenerRol = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.role || usuario.rol || localStorage.getItem('userRole') || ''
  } catch {
    return localStorage.getItem('userRole') || ''
  }
}

export default function Footer() {
  const logueado = haySesionActiva()
  const esDonante = logueado && obtenerRol() === 'donante'

  return (
    <footer className="fs-footer">
      <div className="fs-footer-inner">
        <div>
          <Link className="fs-footer-brand" to="/home">
            <span className="fs-brand-icon">♨</span>
            <strong>FireSupport IA</strong>
          </Link>
          <p>Plataforma de donaciones para apoyar a las compañías de bomberos en Perú.</p>
        </div>

        <div>
          <h3>Enlaces</h3>
          <Link to="/campanas">Campañas</Link>
          {!logueado && <Link to="/solicitud-registro">Registrar Compañía</Link>}
          {!logueado && <Link to="/registro">Registrarme</Link>}
          {!logueado && <Link to="/login">Iniciar Sesión</Link>}
          {esDonante && <Link to="/historial">Historial</Link>}
        </div>

        <div>
          <h3>Contacto</h3>
          <p>Email: info@firesupport.pe</p>
          <p>Teléfono: +51 1 234 5678</p>
          <p>Lima, Perú</p>
        </div>
      </div>
      <div className="fs-copy">© 2026 FireSupport IA. Todos los derechos reservados.</div>
    </footer>
  )
}
