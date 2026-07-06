import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { obtenerMensajeApi } from '../../services/api'
import {
  crearAsociacionTemporal,
  desvincularAsociacionExistente,
  listarAsociacionesVinculadas,
  vincularAsociacionExistente,
} from '../../services/adminAssociationsService'
import './AdminAssociations.css'

const estadoInicial = { nombre: '', email: '', telefono: '' }

const validar = (form) => {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'Nombre de la asociación requerido'
  if (!form.email.trim()) errores.email = 'Email requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'Ingresa un email válido'
  if (!form.telefono.trim()) errores.telefono = 'Teléfono requerido'
  else if (!/^\d{9}$/.test(form.telefono)) errores.telefono = 'El teléfono debe tener 9 dígitos'
  return errores
}

const obtenerCompaniaId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.compania_id || usuario.company_id || usuario.compania?.id || localStorage.getItem('compania_id')
  } catch {
    return localStorage.getItem('compania_id')
  }
}

const esSuperAdmin = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return (usuario.role || usuario.rol || localStorage.getItem('userRole')) === 'super_admin'
  } catch {
    return localStorage.getItem('userRole') === 'super_admin'
  }
}

export default function AdminAssociations() {
  const modoSupervision = esSuperAdmin()
  const [asociaciones, setAsociaciones] = useState([])
  const [modalVincular, setModalVincular] = useState(false)
  const [asociacionDesvincular, setAsociacionDesvincular] = useState(null)
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [usaDatosTemporales, setUsaDatosTemporales] = useState(false)

  const mostrarToast = (tipo, texto) => {
    setToast({ tipo, texto })
    window.setTimeout(() => setToast(null), 3200)
  }

  const cargarAsociaciones = async () => {
    setLoading(true)
    setMensaje('')
    const resultado = await listarAsociacionesVinculadas()
    setAsociaciones(resultado.data)
    setUsaDatosTemporales(resultado.temporal)
    setLoading(false)
  }

  useEffect(() => {
    cargarAsociaciones()
  }, [])

  useEffect(() => {
    const cerrarConEsc = (event) => {
      if (event.key === 'Escape') {
        cerrarModal()
        setAsociacionDesvincular(null)
      }
    }
    document.addEventListener('keydown', cerrarConEsc)
    return () => document.removeEventListener('keydown', cerrarConEsc)
  }, [])

  const cerrarModal = () => {
    setModalVincular(false)
    setForm(estadoInicial)
    setErrores({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const vincular = async (event) => {
    event.preventDefault()
    const nuevosErrores = validar(form)
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    const companiaId = obtenerCompaniaId()
    if (!companiaId) {
      setMensaje('La sesión actual no incluye compania_id.')
      return
    }

    const asociacionExistente =
      asociaciones.find(({ nombre, email }) =>
        nombre.toLowerCase() === form.nombre.trim().toLowerCase() ||
        email.toLowerCase() === form.email.trim().toLowerCase()
      ) || crearAsociacionTemporal(form)

    setGuardando(true)
    try {
      const vinculada = await vincularAsociacionExistente({ compania_id: Number(companiaId), asociacion: asociacionExistente })
      setAsociaciones((actuales) => {
        if (actuales.some((asociacion) => asociacion.id === vinculada.id)) return actuales
        return [vinculada, ...actuales]
      })
      cerrarModal()
      mostrarToast('success', 'Asociación vinculada exitosamente')
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo vincular la asociación.'))
      mostrarToast('error', obtenerMensajeApi(err, 'No se pudo vincular la asociación.'))
    } finally {
      setGuardando(false)
    }
  }

  const desvincular = async () => {
    if (!asociacionDesvincular) return
    const companiaId = obtenerCompaniaId()
    if (!companiaId) {
      setMensaje('La sesión actual no incluye compania_id.')
      return
    }

    setGuardando(true)
    try {
      await desvincularAsociacionExistente({ compania_id: Number(companiaId), asociacion_id: asociacionDesvincular.id })
      setAsociaciones((actuales) => actuales.filter((asociacion) => asociacion.id !== asociacionDesvincular.id))
      setAsociacionDesvincular(null)
      mostrarToast('success', 'Asociación desvinculada exitosamente')
    } catch (err) {
      mostrarToast('error', obtenerMensajeApi(err, 'No se pudo desvincular la asociación.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout active="associations">
      {toast && <div className={`aa-toast ${toast.tipo}`} role="status"><span>{toast.tipo === 'success' ? '✓' : '!'}</span>{toast.texto}</div>}

      <div className="aa-heading">
        <div>
          <h1>Asociaciones Vinculadas</h1>
          <p>Gestiona las asociaciones vinculadas a tu compañía</p>
        </div>
        <div className="aa-heading-actions">
          {modoSupervision && <span className="aa-readonly-badge">Modo Supervisión</span>}
          <button className="aa-new-button" type="button" onClick={() => !modoSupervision && setModalVincular(true)} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : 'Vincular asociación'}><span>+</span> Vincular Asociación</button>
        </div>
      </div>

      {mensaje && <div className="aa-state">{mensaje}</div>}

      <section className="aa-summary">
        <div>
          <p>Total Asociaciones Vinculadas</p>
          <strong>{asociaciones.length}</strong>
          <span>{asociaciones.length} activas</span>
        </div>
        <span className="aa-building" aria-hidden="true">▤</span>
      </section>

      <section className="aa-panel">
        {loading ? (
          <div className="aa-state">Cargando asociaciones...</div>
        ) : (
          <div className="aa-table-wrap">
            <table className="aa-table">
              <thead><tr><th>Asociación</th><th>Email</th><th>Teléfono</th><th>Fecha Vinculación</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {asociaciones.map((asociacion) => (
                  <tr key={asociacion.id}>
                    <td>{asociacion.nombre}</td>
                    <td><span className="aa-cell-icon">✉</span>{asociacion.email}</td>
                    <td><span className="aa-cell-icon">♧</span>{asociacion.telefono}</td>
                    <td>{asociacion.fechaVinculacion}</td>
                    <td><span className="aa-badge">{asociacion.estado}</span></td>
                    <td><button className="aa-unlink" type="button" onClick={() => !modoSupervision && setAsociacionDesvincular(asociacion)} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : 'Desvincular asociación'}>↯ Desvincular</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {usaDatosTemporales && <p className="aa-note">Datos temporales de visualización hasta que exista un endpoint de listado de asociaciones vinculadas.</p>}

      {modalVincular && (
        <div className="aa-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cerrarModal()
        }}>
          <div className="aa-modal" role="dialog" aria-modal="true" aria-labelledby="link-association-title">
            <div className="aa-modal-header">
              <h2 id="link-association-title">Vincular Nueva Asociación</h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>
            <form className="aa-form" onSubmit={vincular} noValidate>
              <label><span>Nombre de la Asociación *</span><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Asociación Nacional de Bomberos" />{errores.nombre && <small>{errores.nombre}</small>}</label>
              <label><span>Email de Contacto *</span><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@asociacion.pe" />{errores.email && <small>{errores.email}</small>}</label>
              <label><span>Teléfono *</span><input name="telefono" inputMode="numeric" value={form.telefono} onChange={handleChange} placeholder="987654321" />{errores.telefono && <small>{errores.telefono}</small>}</label>
              <div className="aa-actions"><button className="aa-primary" type="submit" disabled={guardando}>{guardando ? 'Vinculando...' : 'Vincular Asociación'}</button><button className="aa-cancel" type="button" onClick={cerrarModal} disabled={guardando}>Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {asociacionDesvincular && (
        <div className="aa-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAsociacionDesvincular(null)
        }}>
          <div className="aa-confirm" role="dialog" aria-modal="true" aria-labelledby="unlink-association-title">
            <h2 id="unlink-association-title">Desvincular Asociación</h2>
            <p>¿Estás seguro de desvincular a <strong>{asociacionDesvincular.nombre}</strong>? Esta acción eliminará el acceso de la asociación a las campañas de tu compañía.</p>
            <div className="aa-actions"><button className="aa-primary" type="button" disabled={guardando} onClick={desvincular}>{guardando ? 'Desvinculando...' : 'Desvincular'}</button><button className="aa-cancel" type="button" onClick={() => setAsociacionDesvincular(null)} disabled={guardando}>Cancelar</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
