import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function AuthNavLinks({ loginClassName = '', onLoginClick, onLoginDoubleClick }) {
  const navigate = useNavigate()
  const [logueado, setLogueado] = useState(haySesionActiva)
  const [rol, setRol] = useState(obtenerRol)
  const esDonante = logueado && rol === 'donante'

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

  return (
    <>
      <Link to="/campanas">♡ Campañas</Link>
      {!logueado && <Link to="/solicitud-registro">▤ Registrar Compañía</Link>}
      {!logueado && <Link to="/registro">♙ Registrarme</Link>}
      {esDonante && <Link to="/historial">Historial</Link>}
      {logueado ? (
        <button
          className={`${loginClassName} auth-nav-logout`.trim()}
          type="button"
          onClick={cerrarSesion}
        >
          ↳ Cerrar Sesión
        </button>
      ) : (
        <Link
          className={loginClassName}
          to="/login"
          onClick={onLoginClick}
          onDoubleClick={onLoginDoubleClick}
        >
          ↳ Iniciar Sesión
        </Link>
      )}
    </>
  )
}
