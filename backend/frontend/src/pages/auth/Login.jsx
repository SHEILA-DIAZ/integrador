import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginAsociacion, loginDonante, loginUsuarioCompania, obtenerMensajeApi } from '../../services/api'
import AuthNavLinks from '../../components/AuthNavLinks'
import './Login.css'

const estadoInicial = {
  email: '',
  password: '',
  recordar: false,
}

const estadoInicialAsociacion = {
  nombreAsociacion: '',
  email: '',
  password: '',
}

const MAX_INTENTOS = 5
const obtenerToken = (data) =>
  data?.token ||
  data?.accessToken ||
  data?.access_token ||
  data?.data?.token ||
  data?.usuario?.token

const obtenerUsuarioLogin = (data) =>
  data?.usuario ||
  data?.user ||
  data?.data?.usuario ||
  data?.data?.user ||
  data?.data ||
  null

const construirNombreDonante = (usuario, email) => {
  const nombreCompleto =
    usuario?.nombreCompleto ||
    usuario?.nombre_completo ||
    usuario?.name ||
    [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ')

  return nombreCompleto?.trim() || email
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [intentosFallidos, setIntentosFallidos] = useState(0)
  const [intentosAsociacion, setIntentosAsociacion] = useState(0)
  const [modoAsociacion, setModoAsociacion] = useState(false)
  const [formAsociacion, setFormAsociacion] = useState(estadoInicialAsociacion)
  const [erroresAsociacion, setErroresAsociacion] = useState({})
  const clickTimer = useRef(null)
  const intentosActivos = modoAsociacion ? intentosAsociacion : intentosFallidos
  const cuentaBloqueada = intentosActivos >= MAX_INTENTOS

  useEffect(() => () => clearTimeout(clickTimer.current), [])

  const validar = () => {
    const nuevosErrores = {}

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nuevosErrores.email = 'Ingresa un email válido'
    if (!form.password.trim())
      nuevosErrores.password = 'Ingresa tu contraseña'

    return nuevosErrores
  }

  const registrarIntentoFallido = (mensaje, esAsociacion = false) => {
    const actualizarIntentos = esAsociacion ? setIntentosAsociacion : setIntentosFallidos
    actualizarIntentos((actual) => {
      const siguiente = Math.min(actual + 1, MAX_INTENTOS)
      setErrorGeneral(siguiente >= MAX_INTENTOS ? 'Cuenta bloqueada temporalmente' : mensaje)
      return siguiente
    })
  }

  const cambiarModo = (esAsociacion) => {
    setModoAsociacion(esAsociacion)
    setErrorGeneral('')
    setMostrarPassword(false)
    setForm(estadoInicial)
    setFormAsociacion(estadoInicialAsociacion)
    setErrores({})
    setErroresAsociacion({})
  }

  const handleLoginNavClick = (event) => {
    event.preventDefault()
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => cambiarModo(false), 220)
  }

  const handleLoginNavDoubleClick = (event) => {
    event.preventDefault()
    clearTimeout(clickTimer.current)
    cambiarModo(true)
  }

  const completarLogin = (data) => {
    const token = obtenerToken(data)
    const usuario = obtenerUsuarioLogin(data) || {}
    const role = usuario.role || usuario.rol || data?.role || data?.rol || data?.data?.role || data?.data?.rol

    if (!token || !role) throw new Error('La respuesta de inicio de sesión no incluye token y rol.')

    const email = (usuario?.email || (modoAsociacion ? formAsociacion.email : form.email)).trim().toLowerCase()
    localStorage.setItem('token', token)
    localStorage.setItem('userRole', role)
    localStorage.setItem('user', JSON.stringify({ ...usuario, role }))
    setIntentosFallidos(0)
    setIntentosAsociacion(0)

    if (role === 'donante') {
      localStorage.setItem('donorEmail', email)
      localStorage.setItem('donorName', construirNombreDonante(usuario, email))
    }

    const destinoPendiente = localStorage.getItem('pendingDonationPath')
    if (role === 'donante' && destinoPendiente) {
      localStorage.removeItem('pendingDonationPath')
      navigate(destinoPendiente)
      return
    }

    if (['super_admin', 'admin_compania'].includes(role)) return navigate('/admin/dashboard')
    if (role === 'bombero') return navigate('/admin/firefighter')
    if (role === 'admin_asociacion') return navigate('/association/campaigns')
    navigate('/home')
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setForm((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
    if (errorGeneral && !cuentaBloqueada) setErrorGeneral('')
  }

  const handleAssociationChange = (event) => {
    const { name, value } = event.target
    setFormAsociacion((actual) => ({ ...actual, [name]: value }))
    if (erroresAsociacion[name]) {
      setErroresAsociacion((actual) => ({ ...actual, [name]: '' }))
    }
    if (errorGeneral && !cuentaBloqueada) setErrorGeneral('')
  }

  const handleAssociationSubmit = async (event) => {
    event.preventDefault()
    if (cuentaBloqueada) {
      setErrorGeneral('Cuenta bloqueada temporalmente')
      return
    }

    const nuevosErrores = {}
    if (!formAsociacion.nombreAsociacion.trim()) nuevosErrores.nombreAsociacion = 'Ingresa el nombre de la asociación'
    if (!formAsociacion.email.trim()) nuevosErrores.email = 'Ingresa el email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formAsociacion.email)) nuevosErrores.email = 'Ingresa un email válido'
    if (!formAsociacion.password.trim()) nuevosErrores.password = 'Ingresa tu contraseña'

    setErrorGeneral('')
    setErroresAsociacion(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setLoading(true)
    try {
      const response = await loginAsociacion({
        email: formAsociacion.email.trim().toLowerCase(),
        password: formAsociacion.password,
      })
      completarLogin(response.data)
    } catch (err) {
      registrarIntentoFallido(obtenerMensajeApi(err, 'No pudimos iniciar sesión. Verifica tus credenciales.'), true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (cuentaBloqueada) {
      setErrorGeneral('Cuenta bloqueada temporalmente')
      return
    }

    setErrorGeneral('')
    setErrores({})

    const erroresValidacion = validar()
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    setLoading(true)
    try {
      const response = await loginDonante({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      completarLogin(response.data)
    } catch (authError) {
      let internalError
      try {
        const response = await loginUsuarioCompania({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        })
        completarLogin(response.data)
        return
      } catch (err) {
        internalError = err
      }

      registrarIntentoFallido(obtenerMensajeApi(
        internalError.response ? internalError : authError,
        'No pudimos iniciar sesión. Verifica tu email y contraseña.'
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="ld-page">
      <header className="ld-nav">
        <Link className="ld-brand" to="/home">
          <span className="ld-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="ld-links" aria-label="Navegación principal">
          <AuthNavLinks
            loginClassName="ld-login-link"
            onLoginClick={handleLoginNavClick}
            onLoginDoubleClick={handleLoginNavDoubleClick}
          />
        </nav>
      </header>

      <section className={`ld-shell ${modoAsociacion ? 'association' : ''}`}>
        <div className="ld-photo" aria-label="Bomberos atendiendo una emergencia" />

        <form
          className={`ld-card ${modoAsociacion ? 'ld-association-card' : ''}`}
          onSubmit={modoAsociacion ? handleAssociationSubmit : handleSubmit}
          noValidate
        >
          <div className="ld-card-head">
            <div className={`ld-card-icon ${modoAsociacion ? 'association' : ''}`}>
              {modoAsociacion ? '▤' : '↳'}
            </div>
            <h1>{modoAsociacion ? 'Acceso Asociación' : 'Iniciar Sesión'}</h1>
            <p>{modoAsociacion ? 'Inicia sesión como administrador de asociación' : 'Accede a tu cuenta de FireSupport IA'}</p>
          </div>

          {errorGeneral && <div className="ld-error-general">{errorGeneral}</div>}
          {intentosActivos > 0 && (
            <div className="ld-attempts">Intento {intentosActivos}/{MAX_INTENTOS}</div>
          )}

          {modoAsociacion && (
            <div className="ld-field">
              <label htmlFor="nombreAsociacion">Nombre de la Asociación</label>
              <input
                id="nombreAsociacion"
                name="nombreAsociacion"
                type="text"
                placeholder="Ej: Asociación Nacional de Bomberos"
                value={formAsociacion.nombreAsociacion}
                onChange={handleAssociationChange}
                className={erroresAsociacion.nombreAsociacion ? 'error' : ''}
              />
              {erroresAsociacion.nombreAsociacion && <span>{erroresAsociacion.nombreAsociacion}</span>}
            </div>
          )}

          <div className="ld-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={modoAsociacion ? 'admin@asociacion.pe' : 'tu@email.com'}
              value={modoAsociacion ? formAsociacion.email : form.email}
              onChange={modoAsociacion ? handleAssociationChange : handleChange}
              className={(modoAsociacion ? erroresAsociacion.email : errores.email) ? 'error' : ''}
            />
            {(modoAsociacion ? erroresAsociacion.email : errores.email) && (
              <span>{modoAsociacion ? erroresAsociacion.email : errores.email}</span>
            )}
          </div>

          <div className="ld-field">
            <label htmlFor="password">Contraseña</label>
            <div className={`ld-password ${(modoAsociacion ? erroresAsociacion.password : errores.password) ? 'error' : ''}`}>
              <input
                id="password"
                name="password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={modoAsociacion ? formAsociacion.password : form.password}
                onChange={modoAsociacion ? handleAssociationChange : handleChange}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? '●' : '◉'}
              </button>
            </div>
            {(modoAsociacion ? erroresAsociacion.password : errores.password) && (
              <span>{modoAsociacion ? erroresAsociacion.password : errores.password}</span>
            )}
          </div>

          {!modoAsociacion && <div className="ld-options">
            <label>
              <input
                name="recordar"
                type="checkbox"
                checked={form.recordar}
                onChange={handleChange}
              />
              Recordar sesión
            </label>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>}

          <button className="ld-submit" type="submit" disabled={loading || cuentaBloqueada}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          {!modoAsociacion && <p className="ld-register-copy">
            ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>}
        </form>
      </section>
    </main>
  )
}
