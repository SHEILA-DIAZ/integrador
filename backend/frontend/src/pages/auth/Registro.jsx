import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obtenerMensajeApi, registrarDonante } from '../../services/api'
import AuthNavLinks from '../../components/AuthNavLinks'
import './Registro.css'

const estadoInicial = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  confirmarPassword: '',
}

const esErrorEmailDuplicado = (err) => {
  const mensaje = String(err.response?.data?.message || err.response?.data?.error || '')
  return err.response?.status === 409 || mensaje.toLowerCase().includes('email')
}

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [exito, setExito] = useState(false)

  const validar = () => {
    const nuevosErrores = {}

    if (!form.nombre.trim()) nuevosErrores.nombre = 'Ingresa tu nombre'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Ingresa tu apellido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nuevosErrores.email = 'Ingresa un email válido'
    if (!/^\d{9}$/.test(form.telefono))
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos'
    if (form.password.length < 6)
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.confirmarPassword !== form.password)
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'

    return nuevosErrores
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
    if (errorGeneral) setErrorGeneral('')
    if (exito) setExito(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorGeneral('')
    setExito(false)
    setErrores({})

    const erroresValidacion = validar()
    const emailNormalizado = form.email.trim().toLowerCase()

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: emailNormalizado,
      telefono: form.telefono,
      password: form.password,
      tipo_usuario: 'DONANTE',
    }

    setLoading(true)
    try {
      await registrarDonante(payload)
      setExito(true)
      setForm(estadoInicial)
      setErrores({})
    } catch (err) {
      if (esErrorEmailDuplicado(err)) {
        setErrores({ email: 'Este email ya está registrado' })
        return
      }

      setErrorGeneral(obtenerMensajeApi(err, 'No se pudo crear la cuenta. Revisa tus datos e intenta nuevamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="rd-page">
      <header className="rd-nav">
        <Link className="rd-brand" to="/home">
          <span className="rd-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="rd-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="rd-login" />
        </nav>
      </header>

      <section className="rd-hero">
        <div className="rd-hero-overlay">
          <div className="rd-heart">♡</div>
          <h1>Únete a FireSupport IA</h1>
          <p>Regístrate y comienza a hacer la diferencia en tu comunidad</p>
        </div>
      </section>

      <section className="rd-form-section">
        <form className="rd-card" onSubmit={handleSubmit} noValidate>
          {exito ? (
            <div className="rd-success-card">
              <div className="rd-success-icon">✓</div>
              <h2>¡Registro Exitoso!</h2>
              <p>
                Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y comenzar a apoyar a las compañías de bomberos en Perú.
              </p>
              <button
                className="rd-submit"
                type="button"
                onClick={() => navigate('/login')}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="rd-card-head">
                <h2>Crear cuenta de donante</h2>
                <p>Completa tus datos para apoyar campañas verificadas.</p>
              </div>

              {errorGeneral && <div className="rd-error-general">{errorGeneral}</div>}

              <div className="rd-row">
                <div className="rd-field">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={errores.nombre ? 'error' : ''}
                  />
                  {errores.nombre && <span>{errores.nombre}</span>}
                </div>

                <div className="rd-field">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className={errores.apellido ? 'error' : ''}
                  />
                  {errores.apellido && <span>{errores.apellido}</span>}
                </div>
              </div>

              <div className="rd-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errores.email ? 'error' : ''}
                />
                {errores.email && <span>{errores.email}</span>}
              </div>

              <div className="rd-field">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="text"
                  placeholder="999888777"
                  maxLength={9}
                  value={form.telefono}
                  onChange={handleChange}
                  className={errores.telefono ? 'error' : ''}
                />
                {errores.telefono && <span>{errores.telefono}</span>}
              </div>

              <div className="rd-field">
                <label htmlFor="password">Contraseña *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  className={errores.password ? 'error' : ''}
                />
                {errores.password && <span>{errores.password}</span>}
              </div>

              <div className="rd-field">
                <label htmlFor="confirmarPassword">Confirmar Contraseña *</label>
                <input
                  id="confirmarPassword"
                  name="confirmarPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmarPassword}
                  onChange={handleChange}
                  className={errores.confirmarPassword ? 'error' : ''}
                />
                {errores.confirmarPassword && <span>{errores.confirmarPassword}</span>}
              </div>

              <button className="rd-submit" type="submit" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <p className="rd-login-copy">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
              </p>
            </>
          )}
        </form>
      </section>
    </main>
  )
}
