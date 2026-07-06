import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './AuthNavLinks.css'

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

const iconosNav = {
  heart: (
    <path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 1 1 7.1 7.1Z" />
  ),
  building: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
    </>
  ),
  user: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.4a1.4 1.4 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
}

function NavIcon({ tipo }) {
  return (
    <svg className="auth-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {iconosNav[tipo]}
    </svg>
  )
}

export default function AuthNavLinks({
  loginClassName = '',
  companyAccessClassName = '',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const clickTimer = useRef(null)
  const [logueado, setLogueado] = useState(haySesionActiva)
  const [rol, setRol] = useState(obtenerRol)
  const esDonante = logueado && rol === 'donante'
  const accessLabel = location.pathname === '/association-access' ? 'Acceso Asociación' : 'Acceso Compañía'

  useEffect(() => () => clearTimeout(clickTimer.current), [])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    localStorage.removeItem('usuario')
    localStorage.removeItem('donorName')
    localStorage.removeItem('donorEmail')
    setLogueado(false)
    setRol('')
    navigate('/campanas')
  }

  const handleCompanyAccessClick = (event) => {
    event.preventDefault()
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => navigate('/company-access'), 220)
  }

  const handleCompanyAccessDoubleClick = (event) => {
    event.preventDefault()
    clearTimeout(clickTimer.current)
    navigate('/association-access')
  }

  return (
    <>
      <Link className="auth-nav-link" to="/campanas"><NavIcon tipo="heart" /> Campañas</Link>
      {!logueado && <Link className="auth-nav-link" to="/solicitud-registro"><NavIcon tipo="building" /> Registrar Compañía</Link>}
      {!logueado && <Link className="auth-nav-link" to="/registro"><NavIcon tipo="user" /> Registrarme</Link>}
      {esDonante && <Link className="auth-nav-link" to="/historial"><NavIcon tipo="history" /> Historial</Link>}
      {!logueado && (
        <Link
          className={`auth-nav-link auth-company-access ${companyAccessClassName}`.trim()}
          to="/company-access"
          onClick={handleCompanyAccessClick}
          onDoubleClick={handleCompanyAccessDoubleClick}
        >
          <NavIcon tipo="shield" />
          {accessLabel}
        </Link>
      )}
      {logueado ? (
        <button
          className={`${loginClassName} auth-nav-logout`.trim()}
          type="button"
          onClick={cerrarSesion}
        >
          <NavIcon tipo="logout" />
          Cerrar Sesión
        </button>
      ) : (
        <Link
          className={`auth-nav-link ${loginClassName}`.trim()}
          to="/login"
        >
          <NavIcon tipo="login" /> Iniciar Sesión
        </Link>
      )}
    </>
  )
}
