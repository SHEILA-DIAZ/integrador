import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obtenerMensajeApi, solicitarRegistroCompania } from '../services/api'
import AuthNavLinks from '../components/AuthNavLinks'
import './SolicitudRegistro.css'

const departamentos = [
  'Amazonas',
  'Áncash',
  'Apurímac',
  'Arequipa',
  'Ayacucho',
  'Cajamarca',
  'Callao',
  'Cusco',
  'Huancavelica',
  'Huánuco',
  'Ica',
  'Junín',
  'La Libertad',
  'Lambayeque',
  'Lima',
  'Loreto',
  'Madre de Dios',
  'Moquegua',
  'Pasco',
  'Piura',
  'Puno',
  'San Martín',
  'Tacna',
  'Tumbes',
  'Ucayali',
]

const esErrorRucDuplicado = (err) => {
  const mensaje = String(err.response?.data?.message || err.response?.data?.error || '')
  return err.response?.status === 409 || mensaje.toLowerCase().includes('ruc')
}

export default function SolicitudRegistro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre_compania: '',
    numero_compania: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    ruc: '',
    email_institucional: '',
    telefono: '',
    representante_nombre: '',
    representante_dni: '',
  })

  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const validar = () => {
    const e = {}
    if (!form.nombre_compania.trim())
      e.nombre_compania = 'El nombre de la compañía es obligatorio'
    if (!form.numero_compania.trim())
      e.numero_compania = 'El número de compañía es obligatorio'
    if (!form.departamento)
      e.departamento = 'Selecciona un departamento'
    if (!form.provincia.trim())
      e.provincia = 'La provincia es obligatoria'
    if (!form.distrito.trim())
      e.distrito = 'El distrito es obligatorio'
    if (!form.direccion.trim())
      e.direccion = 'La dirección es obligatoria'
    if (!/^\d{11}$/.test(form.ruc))
      e.ruc = 'El RUC debe tener exactamente 11 dígitos'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_institucional))
      e.email_institucional = 'Ingresa un email institucional válido'
    if (!/^\d{9}$/.test(form.telefono))
      e.telefono = 'El teléfono debe tener 9 dígitos'
    if (!form.representante_nombre.trim())
      e.representante_nombre = 'El nombre del representante es obligatorio'
    if (!/^\d{8}$/.test(form.representante_dni))
      e.representante_dni = 'El DNI debe tener 8 dígitos'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errores[name]) setErrores({ ...errores, [name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    setErrores({})
    const e_validacion = validar()

    if (Object.keys(e_validacion).length > 0) {
      setErrores(e_validacion)
      return
    }

    const payload = {
      nombre_compania: form.nombre_compania.trim(),
      ruc: form.ruc.trim(),
      email_contacto: form.email_institucional.trim().toLowerCase(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
    }

    setLoading(true)
    try {
      await solicitarRegistroCompania(payload)
      setExito(true)
    } catch (err) {
      if (esErrorRucDuplicado(err)) {
        setErrores({ ruc: 'Este RUC ya está registrado' })
        return
      }

      setErrorGeneral(obtenerMensajeApi(err, 'Error al enviar la solicitud. Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div className="sr-wrapper">
        <header className="sr-nav">
          <Link className="sr-nav-brand" to="/home">
            <span className="sr-nav-icon">♨</span>
            <strong>FireSupport IA</strong>
          </Link>

          <nav className="sr-nav-links" aria-label="Navegación principal">
            <AuthNavLinks loginClassName="sr-nav-login" />
          </nav>
        </header>

        <div className="sr-exito-container">
          <div className="sr-exito-icono">✓</div>
          <h2>¡Solicitud Enviada!</h2>
          <p>
            Tu solicitud de registro ha sido enviada correctamente. Nuestro equipo la revisará y te contactará dentro de las próximas 48 horas.
          </p>
          <button
            className="btn-primario"
            onClick={() => navigate('/home')}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sr-wrapper">
      <header className="sr-nav">
        <Link className="sr-nav-brand" to="/home">
          <span className="sr-nav-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="sr-nav-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="sr-nav-login" />
        </nav>
      </header>

      <div className="card sr-card sr-card-wide">
        <div className="sr-card-header">
          <h2>Solicitud de Registro de Compañía</h2>
          <p>Completa los datos para iniciar el proceso de verificación</p>
          <div className="sr-steps">
            <div className="sr-step active">
              <div className="sr-step-num">1</div>
              <span>Datos</span>
            </div>
            <div className="sr-step-linea" />
            <div className="sr-step">
              <div className="sr-step-num">2</div>
              <span>Revisión</span>
            </div>
            <div className="sr-step-linea" />
            <div className="sr-step">
              <div className="sr-step-num">3</div>
              <span>Aprobación</span>
            </div>
          </div>
        </div>

        <form className="sr-form" onSubmit={handleSubmit} noValidate>
          {errorGeneral && (
            <div className="sr-error-general">⚠️ {errorGeneral}</div>
          )}

          <section className="sr-section">
            <h3>Información de la Compañía</h3>
            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="nombre_compania">
                  Nombre de la Compañía <span className="sr-requerido">*</span>
                </label>
                <input
                  id="nombre_compania"
                  name="nombre_compania"
                  type="text"
                  placeholder="Ej: Compañía de Bomberos Roma N°1"
                  value={form.nombre_compania}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.nombre_compania ? 'error' : form.nombre_compania ? 'valido' : ''
                  }`}
                />
                {errores.nombre_compania && (
                  <p className="error-texto">• {errores.nombre_compania}</p>
                )}
              </div>

              <div className="sr-campo">
                <label htmlFor="numero_compania">
                  Número de Compañía <span className="sr-requerido">*</span>
                </label>
                <input
                  id="numero_compania"
                  name="numero_compania"
                  type="text"
                  placeholder="Ej: 001"
                  value={form.numero_compania}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.numero_compania ? 'error' : form.numero_compania ? 'valido' : ''
                  }`}
                />
                {errores.numero_compania && (
                  <p className="error-texto">• {errores.numero_compania}</p>
                )}
              </div>
            </div>

            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="departamento">
                  Departamento <span className="sr-requerido">*</span>
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  value={form.departamento}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.departamento ? 'error' : form.departamento ? 'valido' : ''
                  }`}
                >
                  <option value="">Seleccionar</option>
                  {departamentos.map((departamento) => (
                    <option key={departamento} value={departamento}>
                      {departamento}
                    </option>
                  ))}
                </select>
                {errores.departamento && (
                  <p className="error-texto">• {errores.departamento}</p>
                )}
              </div>

              <div className="sr-campo">
                <label htmlFor="provincia">
                  Provincia <span className="sr-requerido">*</span>
                </label>
                <input
                  id="provincia"
                  name="provincia"
                  type="text"
                  placeholder="Ej: Lima"
                  value={form.provincia}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.provincia ? 'error' : form.provincia ? 'valido' : ''
                  }`}
                />
                {errores.provincia && (
                  <p className="error-texto">• {errores.provincia}</p>
                )}
              </div>
            </div>

            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="distrito">
                  Distrito <span className="sr-requerido">*</span>
                </label>
                <input
                  id="distrito"
                  name="distrito"
                  type="text"
                  placeholder="Ej: Miraflores"
                  value={form.distrito}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.distrito ? 'error' : form.distrito ? 'valido' : ''
                  }`}
                />
                {errores.distrito && (
                  <p className="error-texto">• {errores.distrito}</p>
                )}
              </div>

              <div className="sr-campo">
                <label htmlFor="direccion">
                  Dirección <span className="sr-requerido">*</span>
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  placeholder="Ej: Av. Larco 123"
                  value={form.direccion}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.direccion ? 'error' : form.direccion ? 'valido' : ''
                  }`}
                />
                {errores.direccion && (
                  <p className="error-texto">• {errores.direccion}</p>
                )}
              </div>
            </div>
          </section>

          <section className="sr-section">
            <h3>Información de Contacto</h3>
            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="ruc">
                  RUC <span className="sr-requerido">*</span>
                </label>
                <input
                  id="ruc"
                  name="ruc"
                  type="text"
                  placeholder="11 dígitos"
                  maxLength={11}
                  value={form.ruc}
                  onChange={handleChange}
                  className={`input-field sr-mono ${
                    errores.ruc ? 'error' : /^\d{11}$/.test(form.ruc) ? 'valido' : ''
                  }`}
                />
                {errores.ruc && (
                  <p className="error-texto">• {errores.ruc}</p>
                )}
              </div>

              <div className="sr-campo">
                <label htmlFor="email_institucional">
                  Email Institucional <span className="sr-requerido">*</span>
                </label>
                <input
                  id="email_institucional"
                  name="email_institucional"
                  type="email"
                  placeholder="contacto@compania.pe"
                  value={form.email_institucional}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.email_institucional
                      ? 'error'
                      : form.email_institucional
                        ? 'valido'
                        : ''
                  }`}
                />
                {errores.email_institucional && (
                  <p className="error-texto">• {errores.email_institucional}</p>
                )}
              </div>
            </div>

            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="telefono">
                  Teléfono <span className="sr-requerido">*</span>
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="text"
                  placeholder="999888777"
                  maxLength={9}
                  value={form.telefono}
                  onChange={handleChange}
                  className={`input-field sr-mono ${
                    errores.telefono ? 'error' : /^\d{9}$/.test(form.telefono) ? 'valido' : ''
                  }`}
                />
                {errores.telefono && (
                  <p className="error-texto">• {errores.telefono}</p>
                )}
              </div>
            </div>
          </section>

          <section className="sr-section">
            <h3>Información del Representante</h3>
            <div className="sr-row2">
              <div className="sr-campo">
                <label htmlFor="representante_nombre">
                  Nombre Completo <span className="sr-requerido">*</span>
                </label>
                <input
                  id="representante_nombre"
                  name="representante_nombre"
                  type="text"
                  placeholder="Nombres y apellidos"
                  value={form.representante_nombre}
                  onChange={handleChange}
                  className={`input-field ${
                    errores.representante_nombre
                      ? 'error'
                      : form.representante_nombre
                        ? 'valido'
                        : ''
                  }`}
                />
                {errores.representante_nombre && (
                  <p className="error-texto">• {errores.representante_nombre}</p>
                )}
              </div>

              <div className="sr-campo">
                <label htmlFor="representante_dni">
                  DNI <span className="sr-requerido">*</span>
                </label>
                <input
                  id="representante_dni"
                  name="representante_dni"
                  type="text"
                  placeholder="8 dígitos"
                  maxLength={8}
                  value={form.representante_dni}
                  onChange={handleChange}
                  className={`input-field sr-mono ${
                    errores.representante_dni
                      ? 'error'
                      : /^\d{8}$/.test(form.representante_dni)
                        ? 'valido'
                        : ''
                  }`}
                />
                {errores.representante_dni && (
                  <p className="error-texto">• {errores.representante_dni}</p>
                )}
              </div>
            </div>
          </section>

          <div className="sr-info-box">
            <span>ℹ️</span>
            <p>
              Una vez enviada tu solicitud, el equipo revisará los datos y
              recibirás un <strong>código único</strong> en tu correo para activar tu cuenta.
            </p>
          </div>

          <button
            type="submit"
            className="btn-primario"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="sr-spinner" /> Enviando...
              </>
            ) : (
              <>Enviar Solicitud</>
            )}
          </button>

          <p className="sr-privacy">
            Al enviar aceptas nuestros{' '}
            <a href="#">Términos de uso</a> y{' '}
            <a href="#">Política de privacidad</a>.
            <br />
            ¿Dudas? Escríbenos a <a href="#">soporte@firesupport.pe</a>
          </p>
        </form>
      </div>
    </div>
  )
}
