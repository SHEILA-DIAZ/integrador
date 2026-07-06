import { useEffect, useMemo, useState } from 'react'
import AssociationLayout from '../../components/AssociationLayout'
import { actualizarCampanaAsociacion, obtenerCampanasAsociacion, obtenerMensajeApi } from '../../services/api'
import './AssociationCampaigns.css'

const estados = ['Activa', 'Borrador', 'Cerrada']

const normalizarLista = (data) => {
  const lista = data?.data?.campanas || data?.campanas || data?.data?.campaigns || data?.campaigns || data?.data || data
  return Array.isArray(lista) ? lista : []
}

const normalizarCampana = (campana) => ({
  id: campana.id || campana.campana_id || campana.campaign_id,
  titulo: campana.titulo || campana.nombre || campana.title || 'Campaña sin título',
  descripcion: campana.descripcion || campana.description || '',
  compania: campana.compania || campana.nombre_compania || campana.company_name || campana.company?.nombre || 'Compañía',
  categoria: campana.categoria || campana.category || 'General',
  estado: campana.estado || campana.status || 'Borrador',
  meta: Number(campana.meta_monto || campana.monto_meta || campana.goal || 0),
  recaudado: Number(campana.monto_recaudado || campana.raised || 0),
})

const formatearSoles = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`

export default function AssociationCampaigns() {
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [toast, setToast] = useState('')
  const [filtroCompania, setFiltroCompania] = useState('Todas')
  const [filtroEstado, setFiltroEstado] = useState('Todas')
  const [campanaEditando, setCampanaEditando] = useState(null)
  const [estadoEditando, setEstadoEditando] = useState('Activa')
  const [guardando, setGuardando] = useState(false)

  const cargarCampanas = async () => {
    setLoading(true)
    setMensaje('')
    try {
      const response = await obtenerCampanasAsociacion()
      setCampanas(normalizarLista(response.data).map(normalizarCampana))
    } catch (err) {
      setCampanas([])
      setMensaje(obtenerMensajeApi(err, 'No se pudieron cargar las campañas vinculadas.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelado = false
    obtenerCampanasAsociacion()
      .then((response) => {
        if (!cancelado) setCampanas(normalizarLista(response.data).map(normalizarCampana))
      })
      .catch((err) => {
        if (!cancelado) setMensaje(obtenerMensajeApi(err, 'No se pudieron cargar las campañas vinculadas.'))
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })
    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timeout)
  }, [toast])

  const companias = useMemo(
    () => ['Todas', ...new Set(campanas.map((campana) => campana.compania))],
    [campanas]
  )

  const campanasFiltradas = useMemo(() => campanas.filter((campana) => (
    (filtroCompania === 'Todas' || campana.compania === filtroCompania) &&
    (filtroEstado === 'Todas' || campana.estado === filtroEstado)
  )), [campanas, filtroCompania, filtroEstado])

  const abrirModal = (campana) => {
    setCampanaEditando(campana)
    setEstadoEditando(campana.estado)
    setMensaje('')
  }

  const guardarCambios = async (event) => {
    event.preventDefault()
    if (!campanaEditando) return

    setGuardando(true)
    setMensaje('')
    try {
      await actualizarCampanaAsociacion(campanaEditando.id, {
        titulo: campanaEditando.titulo,
        descripcion: campanaEditando.descripcion,
        meta_monto: campanaEditando.meta,
        estado: estadoEditando,
      })
      setCampanaEditando(null)
      setToast('Campaña actualizada exitosamente')
      await cargarCampanas()
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo actualizar la campaña.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AssociationLayout active="campaigns">
      {toast && <div className="asc-toast" role="status"><span>✓</span>{toast}</div>}

      <header className="asc-heading">
        <h1>Campañas de Compañías Vinculadas</h1>
        <p>Gestiona campañas de las compañías asociadas</p>
      </header>

      <section className="asc-filters">
        <h2><span>▽</span> Filtros</h2>
        <div className="asc-filter-grid">
          <label>
            <span>Compañía</span>
            <select value={filtroCompania} onChange={(event) => setFiltroCompania(event.target.value)}>
              {companias.map((compania) => <option key={compania} value={compania}>{compania}</option>)}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}>
              <option value="Todas">Todas</option>
              {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </label>
        </div>
      </section>

      {mensaje && <div className="asc-message">{mensaje}</div>}
      {loading ? <div className="asc-state">Cargando campañas vinculadas...</div> : campanasFiltradas.length === 0 ? (
        <div className="asc-state">No hay campañas vinculadas con esos filtros.</div>
      ) : (
        <section className="asc-grid" aria-label="Campañas vinculadas">
          {campanasFiltradas.map((campana) => {
            const progreso = campana.meta > 0 ? Math.min(Math.round((campana.recaudado / campana.meta) * 100), 100) : 0
            return (
              <article className="asc-card" key={campana.id}>
                <div className="asc-card-title">
                  <h2>{campana.titulo}</h2>
                  <span className={`asc-status ${campana.estado.toLowerCase()}`}>{campana.estado}</span>
                </div>
                <p>{campana.compania}</p>
                <small>{campana.categoria}</small>
                <div className="asc-money"><strong>{formatearSoles(campana.recaudado)}</strong><span>{progreso}%</span></div>
                <div className="asc-progress"><span style={{ width: `${progreso}%` }} /></div>
                <div className="asc-meta">Meta: {formatearSoles(campana.meta)}</div>
                <button type="button" onClick={() => abrirModal(campana)}>✐ Editar Campaña</button>
              </article>
            )
          })}
        </section>
      )}

      {campanaEditando && (
        <div className="asc-overlay" role="presentation">
          <div className="asc-modal" role="dialog" aria-modal="true" aria-labelledby="edit-campaign-title">
            <div className="asc-modal-head">
              <h2 id="edit-campaign-title">Editar Campaña</h2>
              <button type="button" onClick={() => setCampanaEditando(null)} aria-label="Cerrar modal">×</button>
            </div>
            <p>Editando: <strong>{campanaEditando.titulo}</strong></p>
            <form onSubmit={guardarCambios}>
              <label>
                <span>Estado</span>
                <select value={estadoEditando} onChange={(event) => setEstadoEditando(event.target.value)}>
                  {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>
              <button className="asc-save" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AssociationLayout>
  )
}
