import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import { loginSuperAdmin, loginUsuarioCompania, obtenerMensajeApi } from '../services/api'
import './CompanyAccess.css'

const estadoInicial = {
  email: '',
  password: '',
}

const ACCESS_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/e/ea/FDNY_eng264_328_Ladder_134_20190214_135053~2.jpg'

const obtenerToken = (data) =>
  data?.token ||
  data?.accessToken ||
  data?.access_token ||
  data?.data?.token ||
  data?.usuario?.token

const obtenerUsuario = (data) =>
  data?.usuario ||
  data?.user ||
  data?.data?.usuario ||
  data?.data?.user ||
  data?.data ||
  null

const obtenerRol = (usuario, data) =>
  usuario?.role ||
  usuario?.rol ||
  usuario?.tipo ||
  usuario?.tipo_usuario ||
  data?.role ||
  data?.rol ||
  data?.tipo ||
  data?.tipo_usuario ||
  data?.data?.role ||
  data?.data?.rol ||
  data?.data?.tipo ||
  data?.data?.tipo_usuario ||
  ''

const normalizarRol = (rol) => String(rol || '').trim().toLowerCase()
const normalizarEmail = (email) => String(email || '').trim().toLowerCase()
const EMAIL_SUPERADMIN = 'admin@firesupport.com'
const estadoInactivo = (valor) => ['inactivo', 'inactive', 'desactivado', 'disabled'].includes(String(valor || '').trim().toLowerCase())
const backendIndicaUsuarioInactivo = (err) => {
  const data = err?.response?.data || {}
  return estadoInactivo(data.estado || data.status || data.usuario?.estado || data.user?.estado)
}

export default function CompanyAccess() {
  const navigate = useNavigate()
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const guardarSesion = (data, rolForzado = '') => {
    const token = obtenerToken(data)
    const usuario = obtenerUsuario(data) || {}
    const role = normalizarRol(rolForzado || obtenerRol(usuario, data))

    if (!token || !role) throw new Error('La respuesta de inicio de sesión no incluye token y rol.')

    localStorage.setItem('token', token)
    localStorage.setItem('userRole', role)
    localStorage.setItem('user', JSON.stringify({ ...usuario, role, rol: role }))
  }

  const validar = () => {
    const nuevosErrores = {}
    const email = form.email.trim()

    if (!email) nuevosErrores.email = 'Ingresa el email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nuevosErrores.email = 'Ingresa un email válido'
    if (!form.password.trim()) nuevosErrores.password = 'Ingresa tu contraseña'

    return nuevosErrores
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
    if (errorGeneral) setErrorGeneral('')
  }

  const intentarLoginCompania = async () => {
    const emailFormulario = normalizarEmail(form.email)
    const response = await loginUsuarioCompania({
      email: emailFormulario,
      password: form.password,
    })
    const usuario = obtenerUsuario(response.data) || {}
    const role = normalizarRol(obtenerRol(usuario, response.data))
    const email = normalizarEmail(usuario.email || emailFormulario)
    const esCredencialAdminCompania = email === 'bombero@firesupport.com' && role === 'bombero'

    if (role === 'admin_compania' || esCredencialAdminCompania) {
      guardarSesion(response.data, 'admin_compania')
      navigate('/company/dashboard')
      return true
    }

    if (role === 'super_admin') {
      guardarSesion(response.data)
      navigate('/admin/dashboard')
      return true
    }

    if (role === 'bombero') {
      setErrorGeneral('Esta cuenta pertenece a bombero interno. Se requiere una cuenta admin_compania.')
      return true
    }

    setErrorGeneral('Este acceso es solo para administradores de compañía.')
    return true
  }

  const intentarLoginSuperAdmin = async () => {
    const emailFormulario = normalizarEmail(form.email)
    const response = await loginSuperAdmin({
      email: emailFormulario,
      password: form.password,
    })

    const usuario = obtenerUsuario(response.data) || {}
    const role = normalizarRol(obtenerRol(usuario, response.data))
    const email = normalizarEmail(usuario.email || emailFormulario)

    if (role === 'super_admin' || email === EMAIL_SUPERADMIN) {
      if (estadoInactivo(usuario.estado || usuario.status || response.data?.estado || response.data?.status)) {
        setErrorGeneral('Usuario inactivo')
        return true
      }
      guardarSesion(response.data, 'super_admin')
      navigate('/admin/dashboard')
      return true
    }

    setErrorGeneral('Este acceso es solo para super administradores.')
    return true
  }

  const limpiarSesionSuperAdminLocal = () => {
    const tokenActual = localStorage.getItem('token') || ''
    if (tokenActual.startsWith('superadmin-supervision-')) {
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('user')
    }
  }

  const usarRespuestaErrorSuperAdminSiTieneToken = (err) => {
    if (normalizarEmail(form.email) !== EMAIL_SUPERADMIN || backendIndicaUsuarioInactivo(err)) return false
    const data = err?.response?.data
    const token = obtenerToken(data)
    if (!token) return false

    guardarSesion(data, 'super_admin')
    navigate('/admin/dashboard')
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorGeneral('')

    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setLoading(true)
    try {
      if (normalizarEmail(form.email) === EMAIL_SUPERADMIN) {
        limpiarSesionSuperAdminLocal()
        await intentarLoginSuperAdmin()
      } else {
        await intentarLoginCompania()
      }
    } catch (err) {
      if (usarRespuestaErrorSuperAdminSiTieneToken(err)) return
      setErrorGeneral(backendIndicaUsuarioInactivo(err)
        ? 'Usuario inactivo'
        : obtenerMensajeApi(err, 'Credenciales incorrectas o acceso no autorizado.').replace(/^Usuario inactivo$/i, 'Credenciales incorrectas o acceso no autorizado.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cx-page">
      <header className="cx-nav">
        <Link className="cx-brand" to="/home">
          <span className="cx-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="cx-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="cx-login-link" companyAccessClassName="cx-company-access" />
        </nav>
      </header>

      <section className="cx-shell">
        <img className="cx-photo" src={ACCESS_IMAGE} alt="Compañía de bomberos con unidad de emergencia" />

        <form className="cx-card" onSubmit={handleSubmit} noValidate>
          <div className="cx-card-head">
            <div className="cx-card-icon">♨</div>
            <h1>Iniciar Sesión — Compañía de Bomberos</h1>
            <p>Acceso exclusivo para administradores de compañía y super administradores</p>
          </div>

          {errorGeneral && <div className="cx-error-general">{errorGeneral}</div>}

          <div className="cx-field">
            <label htmlFor="company-email">Email</label>
            <input
              id="company-email"
              name="email"
              type="email"
              placeholder="bombero@firesupport.com"
              value={form.email}
              onChange={handleChange}
              className={errores.email ? 'error' : ''}
            />
            {errores.email && <span>{errores.email}</span>}
          </div>

          <div className="cx-field">
            <label htmlFor="company-password">Contraseña</label>
            <div className={`cx-password ${errores.password ? 'error' : ''}`}>
              <input
                id="company-password"
                name="password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  {mostrarPassword ? (
                    <>
                      <path d="m2 2 20 20" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 8.5 4.2 10 8a14.4 14.4 0 0 1-2.1 3.3" />
                      <path d="M6.6 6.6A13.8 13.8 0 0 0 2 12c1.5 3.8 5 8 10 8 1.4 0 2.7-.3 3.8-.9" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errores.password && <span>{errores.password}</span>}
          </div>

          <button className="cx-submit" type="submit" disabled={loading}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="m10 17 5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div className="cx-super-copy">¿Eres Super Admin? Usa tus credenciales aquí</div>
        </form>
      </section>
    </main>
  )
}
