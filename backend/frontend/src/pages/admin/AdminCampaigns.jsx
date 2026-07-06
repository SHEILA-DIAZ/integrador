import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { actualizarCampana, crearCampana, obtenerCampanas, obtenerMensajeApi } from '../../services/api'
import './AdminCampaigns.css'

const estadoInicial = {
  titulo: '',
  descripcion: '',
  meta: '',
  categoria: '',
  fechaInicio: '',
  fechaFin: '',
  imagen: '',
  estado: 'Borrador',
}

const categorias = ['Unidades', 'Equipamiento', 'Infraestructura', 'Capacitación', 'Emergencia']
const estados = ['Activa', 'Borrador', 'Finalizada']
const categoriasBackend = {
  Unidades: 'otros',
  Equipamiento: 'equipamiento',
  Infraestructura: 'infraestructura',
  Capacitación: 'capacitacion',
  Emergencia: 'otros',
}

const obtenerCompaniaId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.compania_id || usuario.company_id || usuario.compania?.id || localStorage.getItem('compania_id')
  } catch {
    return localStorage.getItem('compania_id')
  }
}

const normalizarLista = (data) => {
  const candidatos = [
    data,
    data?.data,
    data?.campaigns,
    data?.campanas,
    data?.data?.campaigns,
    data?.data?.campanas,
    data?.items,
  ]

  return candidatos.find(Array.isArray) || []
}

const normalizarCampana = (campana) => ({
  id: campana.id || campana.campaign_id || campana.campana_id || `campana-${Date.now()}`,
  compania_id: campana.compania_id || campana.company_id,
  titulo: campana.titulo || campana.nombre || campana.title || '',
  descripcion: campana.descripcion || campana.description || '',
  categoria: campana.categoria || campana.category || '',
  meta: Number(campana.meta_monto || campana.monto_meta || campana.goal || 0),
  fechaInicio: String(campana.fechaInicio || campana.fecha_inicio || campana.start_date || '').slice(0, 10),
  fechaFin: String(campana.fechaFin || campana.fecha_fin || campana.end_date || '').slice(0, 10),
  imagen: campana.imagen || campana.imagen_url || campana.image_url || '',
  estado: campana.estado || campana.status || 'Borrador',
})

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Number(monto || 0))

const validarFormulario = (form) => {
  const errores = {}

  if (!form.titulo.trim()) errores.titulo = 'Ingresa el título de la campaña'
  if (!form.descripcion.trim()) errores.descripcion = 'Ingresa una descripción'
  if (!form.meta || Number(form.meta) <= 0) errores.meta = 'La meta debe ser mayor a 0'
  if (!form.categoria) errores.categoria = 'Selecciona una categoría'
  if (!form.fechaInicio) errores.fechaInicio = 'Selecciona la fecha de inicio'
  if (!form.fechaFin) errores.fechaFin = 'Selecciona la fecha de fin'
  if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
    errores.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio'
  }

  return errores
}

export default function AdminCampaigns() {
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoModal, setModoModal] = useState('crear')
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [campanaEditando, setCampanaEditando] = useState(null)
  const [campanaEliminar, setCampanaEliminar] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let cancelado = false

    const cargarCampanas = async () => {
      setLoading(true)
      try {
        const response = await obtenerCampanas()
        const lista = normalizarLista(response.data).map(normalizarCampana)
        if (!cancelado) setCampanas(lista)
      } catch (err) {
        if (!cancelado) {
          setCampanas([])
          setMensaje(obtenerMensajeApi(err, 'No se pudieron cargar las campañas. Intenta nuevamente.'))
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarCampanas()

    return () => {
      cancelado = true
    }
  }, [recarga])

  const abrirCrear = () => {
    setModoModal('crear')
    setCampanaEditando(null)
    setForm(estadoInicial)
    setErrores({})
    setModalAbierto(true)
  }

  const abrirEditar = (campana) => {
    setModoModal('editar')
    setCampanaEditando(campana)
    setForm({
      titulo: campana.titulo,
      descripcion: campana.descripcion,
      meta: String(campana.meta),
      categoria: campana.categoria,
      fechaInicio: campana.fechaInicio,
      fechaFin: campana.fechaFin,
      imagen: campana.imagen || '',
      estado: campana.estado || 'Borrador',
    })
    setErrores({})
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setForm(estadoInicial)
    setErrores({})
    setCampanaEditando(null)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const handleImagen = (event) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((actual) => ({ ...actual, imagen: String(reader.result || '') }))
    }
    reader.readAsDataURL(archivo)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nuevosErrores = validarFormulario(form)
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    const companiaId = obtenerCompaniaId() || campanas.find((campana) => campana.compania_id)?.compania_id
    if (!companiaId) {
      setMensaje('La sesión actual no incluye compania_id para crear campañas.')
      return
    }

    const payload = {
      compania_id: Number(companiaId),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      meta_monto: Number(form.meta),
      categoria: categoriasBackend[form.categoria] || 'otros',
      imagen_url: form.imagen.startsWith('data:') ? '' : form.imagen,
    }

    setGuardando(true)
    try {
      if (modoModal === 'editar') {
        const id = campanaEditando.id
        await actualizarCampana(id, payload)
      } else {
        await crearCampana(payload)
      }

      cerrarModal()
      setMensaje('Campaña guardada correctamente.')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo guardar la campaña. Intenta nuevamente.'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = () => {
    if (!campanaEliminar) return
    setMensaje('El backend no expone todavía un endpoint para eliminar campañas.')
    setCampanaEliminar(null)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const hayCampanas = useMemo(() => campanas.length > 0, [campanas])

  return (
    <AdminLayout active="campaigns">
      <main className="ac-admin">
      <aside className="ac-sidebar">
        <div className="ac-brand">
          <span className="ac-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </div>

        <nav className="ac-nav" aria-label="Navegación de administración">
          <a className="ac-nav-item muted" href="/admin/solicitudes">
            <span>▦</span> Dashboard
          </a>
          <a className="ac-nav-item muted" href="/admin/solicitudes">
            <span>▤</span> Solicitudes
          </a>
          <a className="ac-nav-item active" href="/admin/campaigns">
            <span>♡</span> Campañas
          </a>
          <a className="ac-nav-item muted" href="/admin/donations">
            <span>$</span> Donaciones Virtuales
          </a>
          <a className="ac-nav-item muted" href="/admin/cash-income">
            <span>$</span> Ingresos en Efectivo
          </a>
          <a className="ac-nav-item muted" href="/admin/users">
            <span>♙</span> Gestión de Usuarios
          </a>
        </nav>

        <div className="ac-user">
          <span className="ac-avatar">A</span>
          <div>
            <strong>Admin User</strong>
            <small>admin@firesupport.com</small>
          </div>
          <button
            className="ac-logout"
            type="button"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            ←
          </button>
        </div>
      </aside>

      <section className="ac-content">
        <header className="ac-topbar">
          <div />
          <div className="ac-top-actions">
            <span className="ac-bell">♧</span>
            <span className="ac-admin-avatar">A</span>
            <span className="ac-chevron">⌄</span>
          </div>
        </header>

        <div className="ac-main">
          <div className="ac-heading">
            <div>
              <h1>Gestión de Campañas</h1>
              <p>Crea y administra campañas de donación</p>
            </div>
            <button className="ac-new-button" type="button" onClick={abrirCrear}>
              <span>+</span> Nueva Campaña
            </button>
          </div>
          {mensaje && <div className="ac-state">{mensaje}</div>}

          <section className="ac-panel">
            {loading ? (
              <div className="ac-state">Cargando campañas...</div>
            ) : !hayCampanas ? (
              <div className="ac-state">Aún no hay campañas registradas.</div>
            ) : (
              <div className="ac-table-wrap">
                <table className="ac-table">
                  <thead>
                    <tr>
                      <th>Campaña</th>
                      <th>Categoría</th>
                      <th>Meta</th>
                      <th>Fechas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campanas.map((campana) => (
                      <tr key={campana.id}>
                        <td>
                          <div className="ac-campaign-cell">
                            {campana.imagen ? (
                              <img src={campana.imagen} alt={campana.titulo} />
                            ) : (
                              <span className="ac-image-placeholder">♨</span>
                            )}
                            <div>
                              <strong>{campana.titulo}</strong>
                              <small>{campana.descripcion}</small>
                            </div>
                          </div>
                        </td>
                        <td>{campana.categoria}</td>
                        <td>{formatearSoles(campana.meta)}</td>
                        <td>
                          <span className="ac-dates">{campana.fechaInicio}</span>
                          <small>hasta {campana.fechaFin}</small>
                        </td>
                        <td>
                          <span className={`ac-badge ac-badge-${campana.estado.toLowerCase()}`}>
                            {campana.estado}
                          </span>
                        </td>
                        <td>
                          <div className="ac-actions">
                            <button
                              className="ac-icon ac-icon-edit"
                              type="button"
                              onClick={() => abrirEditar(campana)}
                              aria-label={`Editar ${campana.titulo}`}
                            >
                              ✐
                            </button>
                            <button
                              className="ac-icon ac-icon-delete"
                              type="button"
                              onClick={() => setCampanaEliminar(campana)}
                              aria-label={`Eliminar ${campana.titulo}`}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>

      {modalAbierto && (
        <div className="ac-modal-overlay" role="presentation">
          <div className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-modal-title">
            <div className="ac-modal-header">
              <h2 id="campaign-modal-title">
                {modoModal === 'editar' ? 'Editar Campaña' : 'Nueva Campaña'}
              </h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>

            <form className="ac-form" onSubmit={handleSubmit} noValidate>
              <label className="ac-field">
                <span>Título de la Campaña *</span>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Nuevo camión de bomberos"
                />
                {errores.titulo && <small>{errores.titulo}</small>}
              </label>

              <label className="ac-field">
                <span>Descripción *</span>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe el propósito de la campaña..."
                />
                {errores.descripcion && <small>{errores.descripcion}</small>}
              </label>

              <div className="ac-form-grid">
                <label className="ac-field">
                  <span>Meta (S/.) *</span>
                  <input
                    name="meta"
                    type="number"
                    min="1"
                    value={form.meta}
                    onChange={handleChange}
                    placeholder="50000"
                  />
                  {errores.meta && <small>{errores.meta}</small>}
                </label>

                <label className="ac-field">
                  <span>Categoría *</span>
                  <select name="categoria" value={form.categoria} onChange={handleChange}>
                    <option value="">Seleccionar</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                  {errores.categoria && <small>{errores.categoria}</small>}
                </label>

                <label className="ac-field">
                  <span>Fecha de Inicio *</span>
                  <input
                    name="fechaInicio"
                    type="date"
                    value={form.fechaInicio}
                    onChange={handleChange}
                  />
                  {errores.fechaInicio && <small>{errores.fechaInicio}</small>}
                </label>

                <label className="ac-field">
                  <span>Fecha de Fin *</span>
                  <input
                    name="fechaFin"
                    type="date"
                    value={form.fechaFin}
                    onChange={handleChange}
                  />
                  {errores.fechaFin && <small>{errores.fechaFin}</small>}
                </label>
              </div>

              <div className="ac-field">
                <span>Imagen de la Campaña</span>
                <label className="ac-upload">
                  <input type="file" accept="image/*" onChange={handleImagen} />
                  <span>↥ {form.imagen ? 'Cambiar imagen' : 'Subir imagen'}</span>
                </label>
                {form.imagen ? (
                  <img className="ac-preview" src={form.imagen} alt="Vista previa de la campaña" />
                ) : (
                  <div className="ac-preview-placeholder">Sin imagen seleccionada</div>
                )}
              </div>

              <label className="ac-field">
                <span>Estado</span>
                <select name="estado" value={form.estado} onChange={handleChange}>
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </label>

              <div className="ac-form-actions">
                <button className="ac-submit" type="submit" disabled={guardando}>
                  {modoModal === 'editar' ? 'Guardar Cambios' : 'Crear Campaña'}
                </button>
                <button className="ac-cancel" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campanaEliminar && (
        <div className="ac-modal-overlay" role="presentation">
          <div className="ac-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <h2 id="delete-modal-title">Eliminar Campaña</h2>
            <p>
              ¿Estás seguro de eliminar la campaña {campanaEliminar.titulo}? Esta acción no se puede deshacer.
            </p>
            <div className="ac-confirm-actions">
              <button className="ac-delete-confirm" type="button" onClick={confirmarEliminar}>
                Eliminar
              </button>
              <button className="ac-cancel" type="button" onClick={() => setCampanaEliminar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </AdminLayout>
  )
}

export function RedirectAdminCampanas() {
  return <Navigate to="/admin/campaigns" replace />
}
