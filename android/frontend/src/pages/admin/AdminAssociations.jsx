import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { desvincularAsociacion, obtenerMensajeApi, vincularAsociacion } from '../../services/api'
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
    return usuario.compania_id || usuario.company_id || usuario.compania?.id
  } catch {
    return null
  }
}

export default function AdminAssociations() {
  const [asociaciones, setAsociaciones] = useState([])
  const [modalVincular, setModalVincular] = useState(false)
  const [asociacionDesvincular, setAsociacionDesvincular] = useState(null)
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState('')
  const [mensaje, setMensaje] = useState('El backend no expone GET /api/associations para listar asociaciones.')
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const cargarAsociaciones = async () => {
    setLoading(true)
    setAsociaciones([])
    setMensaje('El backend no expone GET /api/associations para listar asociaciones.')
    setLoading(false)
  }

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timeout)
  }, [toast])

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
    if (Object.keys(nuevosErrores).length > 0) return setErrores(nuevosErrores)

    const companiaId = obtenerCompaniaId()
    const asociacion = asociaciones.find(({ nombre }) => nombre.toLowerCase() === form.nombre.trim().toLowerCase())
    if (!companiaId) return setMensaje('La sesión actual no incluye compania_id.')
    if (!asociacion?.id) return setErrores({ nombre: 'Ingresa el nombre de una asociación registrada' })

    setGuardando(true)
    try {
      await vincularAsociacion({ compania_id: companiaId, asociacion_id: asociacion.id })
      cerrarModal()
      setToast('Asociación vinculada exitosamente')
      await cargarAsociaciones()
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo vincular la asociación.'))
    } finally {
      setGuardando(false)
    }
  }

  const desvincular = async () => {
    if (!asociacionDesvincular) return
    const companiaId = obtenerCompaniaId()
    if (!companiaId) return setMensaje('La sesión actual no incluye compania_id.')

    setGuardando(true)
    try {
      await desvincularAsociacion({ compania_id: companiaId, asociacion_id: asociacionDesvincular.id })
      setAsociacionDesvincular(null)
      setToast('Asociación desvinculada exitosamente')
      await cargarAsociaciones()
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo desvincular la asociación.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout active="associations">
      {toast && <div className="aa-toast" role="status"><span>✓</span>{toast}</div>}

      <div className="aa-heading">
        <div>
          <h1>Asociaciones Vinculadas</h1>
          <p>Gestiona las asociaciones vinculadas a tu compañía</p>
        </div>
        <button className="aa-new-button" type="button" onClick={() => setModalVincular(true)}><span>+</span> Vincular Asociación</button>
      </div>

      <section className="aa-summary">
        <div>
          <p>Total Asociaciones Vinculadas</p>
          <strong>{asociaciones.length}</strong>
          <span>{asociaciones.length} activas</span>
        </div>
        <span className="aa-building" aria-hidden="true">▤</span>
      </section>

      <section className="aa-panel">
        {mensaje && <div className="aa-state">{mensaje}</div>}
        {loading && <div className="aa-state">Cargando asociaciones...</div>}
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
                  <td><button className="aa-unlink" type="button" onClick={() => setAsociacionDesvincular(asociacion)}>♧ Desvincular</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalVincular && (
        <div className="aa-overlay" role="presentation">
          <div className="aa-modal" role="dialog" aria-modal="true" aria-labelledby="link-association-title">
            <div className="aa-modal-header">
              <h2 id="link-association-title">Vincular Nueva Asociación</h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>
            <form className="aa-form" onSubmit={vincular} noValidate>
              <label><span>Nombre de la Asociación *</span><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Asociación Nacional de Bomberos" />{errores.nombre && <small>{errores.nombre}</small>}</label>
              <label><span>Email de Contacto *</span><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contacto@asociacion.pe" />{errores.email && <small>{errores.email}</small>}</label>
              <label><span>Teléfono *</span><input name="telefono" inputMode="numeric" value={form.telefono} onChange={handleChange} placeholder="987654321" />{errores.telefono && <small>{errores.telefono}</small>}</label>
              <div className="aa-actions"><button className="aa-primary" type="submit" disabled={guardando}>Vincular Asociación</button><button className="aa-cancel" type="button" onClick={cerrarModal}>Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {asociacionDesvincular && (
        <div className="aa-overlay" role="presentation">
          <div className="aa-confirm" role="dialog" aria-modal="true" aria-labelledby="unlink-association-title">
            <h2 id="unlink-association-title">Desvincular Asociación</h2>
            <p>¿Estás seguro de desvincular a <strong>{asociacionDesvincular.nombre}</strong>? Esta acción eliminará el acceso de la asociación a las campañas de tu compañía.</p>
            <div className="aa-actions"><button className="aa-primary" type="button" disabled={guardando} onClick={desvincular}>Desvincular</button><button className="aa-cancel" type="button" onClick={() => setAsociacionDesvincular(null)}>Cancelar</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
