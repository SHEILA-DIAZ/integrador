import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { aprobarSolicitud, obtenerMensajeApi, obtenerSolicitudes, rechazarSolicitud } from '../../services/api'
import './PanelSolicitudes.css'

const normalizarLista = (data) => [
  data, data?.data, data?.requests, data?.solicitudes,
  data?.data?.requests, data?.data?.solicitudes, data?.items,
].find(Array.isArray) || []

const getId = (solicitud) => solicitud.id || solicitud.solicitud_id || solicitud.request_id || solicitud.ruc
const getEstado = (solicitud) => {
  const estado = String(solicitud.estado || solicitud.status || 'pendiente').toLowerCase()
  if (['approved', 'aprobado', 'aprobada'].includes(estado)) return 'aprobada'
  if (['rejected', 'rechazado', 'rechazada'].includes(estado)) return 'rechazada'
  if (['pending', 'pendiente'].includes(estado)) return 'pendiente'
  return estado
}
const getNombre = (solicitud) => solicitud.nombreCompania || solicitud.nombre_compania || solicitud.nombre || solicitud.company_name || 'Sin nombre'
const getFecha = (solicitud) => {
  const fecha = solicitud.fecha || solicitud.fecha_solicitud || solicitud.created_at || solicitud.createdAt
  return fecha ? String(fecha).slice(0, 10) : '-'
}
const getUbicacion = (solicitud) => {
  if (solicitud.ubicacion) return solicitud.ubicacion
  const partes = [solicitud.departamento, solicitud.provincia, solicitud.distrito].filter(Boolean)
  return partes.length > 0 ? partes.join(', ') : solicitud.direccion || '-'
}
const estadoLegible = (estado) => {
  if (estado === 'pendiente') return 'Pendiente'
  if (estado === 'aprobada') return 'Aprobada'
  if (estado === 'rechazada') return 'Rechazada'
  return estado
}
export default function PanelSolicitudes({ active = 'solicitudes' }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)
  const [solicitudAprobar, setSolicitudAprobar] = useState(null)
  const [solicitudRechazar, setSolicitudRechazar] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')

  useEffect(() => {
    let cancelado = false
    const cargarSolicitudes = async () => {
      setLoading(true)
      setMensaje('')
      try {
        const response = await obtenerSolicitudes()
        if (!cancelado) setSolicitudes(normalizarLista(response.data))
      } catch (err) {
        if (!cancelado) {
          setSolicitudes([])
          setMensaje('')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargarSolicitudes()
    return () => { cancelado = true }
  }, [])

  const actualizarEstado = (solicitudId, estado) => {
    setSolicitudes((actuales) => actuales.map((solicitud) => (
      getId(solicitud) === solicitudId
        ? { ...solicitud, estado, status: estado }
        : solicitud
    )))
  }

  const confirmarAprobacion = async () => {
    if (!solicitudAprobar) return
    const solicitud = solicitudAprobar
    const solicitudId = getId(solicitud)
    if (!solicitudId) return setMensaje('No se encontró el identificador de la solicitud.')
    setProcesandoId(solicitudId)
    setMensaje('')
    try {
      const response = await aprobarSolicitud(solicitudId)
      actualizarEstado(solicitudId, 'aprobada')
      setMensaje(response.data?.message || 'Solicitud aprobada correctamente.')
      setSolicitudAprobar(null)
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo aprobar la solicitud. Intenta nuevamente.'))
    } finally {
      setProcesandoId(null)
    }
  }

  const abrirRechazo = (solicitud) => {
    setMensaje('')
    setSolicitudRechazar(solicitud)
    setMotivoRechazo('')
    setErrorMotivo('')
  }

  const cerrarRechazo = () => {
    setSolicitudRechazar(null)
    setMotivoRechazo('')
    setErrorMotivo('')
  }

  const confirmarRechazo = async (event) => {
    event.preventDefault()
    if (!solicitudRechazar) return
    const solicitudId = getId(solicitudRechazar)
    const motivo = motivoRechazo.trim()
    if (!solicitudId) return setMensaje('No se encontró el identificador de la solicitud.')
    if (!motivo) {
      setErrorMotivo('El motivo es requerido')
      return
    }

    setProcesandoId(solicitudId)
    setMensaje('')
    try {
      const response = await rechazarSolicitud(solicitudId, motivo)
      actualizarEstado(solicitudId, 'rechazada')
      setMensaje(response.data?.message || 'Solicitud rechazada correctamente.')
      cerrarRechazo()
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No se pudo rechazar la solicitud. Intenta nuevamente.'))
    } finally {
      setProcesandoId(null)
    }
  }

  const resumen = useMemo(() => solicitudes.reduce((acc, solicitud) => {
    const estado = getEstado(solicitud)
    acc.total += 1
    if (estado === 'pendiente') acc.pendientes += 1
    if (estado === 'aprobada') acc.aprobadas += 1
    if (estado === 'rechazada') acc.rechazadas += 1
    return acc
  }, { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 }), [solicitudes])

  return (
    <AdminLayout active={active}>
      <section className="ps-stats" aria-label="Resumen de solicitudes">
        <div className="ps-stat"><div><span>Total Solicitudes</span><strong>{resumen.total}</strong></div><span className="ps-stat-icon neutral">▤</span></div>
        <div className="ps-stat"><div><span>Pendientes</span><strong>{resumen.pendientes}</strong></div><span className="ps-stat-icon pending">▧</span></div>
        <div className="ps-stat"><div><span>Aprobadas</span><strong>{resumen.aprobadas}</strong></div><span className="ps-stat-icon approved">○</span></div>
        <div className="ps-stat"><div><span>Rechazadas</span><strong>{resumen.rechazadas}</strong></div><span className="ps-stat-icon rejected">⊗</span></div>
      </section>

      <section className="ps-panel">
        <div className="ps-panel-title">
          <h1>Solicitudes de Registro</h1>
          <span className="ps-readonly-badge">Modo Supervisión</span>
        </div>
        {mensaje && <div className="ps-alert">{mensaje}</div>}
        {loading ? <div className="ps-state">Cargando solicitudes...</div> : solicitudes.length === 0 ? <div className="ps-state">No hay solicitudes para mostrar.</div> : (
          <div className="ps-table-wrap">
            <table className="ps-table">
              <thead><tr><th>Compañía</th><th>RUC</th><th>Fecha</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>{solicitudes.map((solicitud) => {
                const solicitudId = getId(solicitud)
                const estado = getEstado(solicitud)
                const pendiente = estado === 'pendiente'
                return (
                  <tr key={solicitudId || `${getNombre(solicitud)}-${solicitud.ruc}`}>
                    <td>{getNombre(solicitud)}</td><td>{solicitud.ruc || '-'}</td><td>{getFecha(solicitud)}</td><td>{getUbicacion(solicitud)}</td>
                    <td><span className={`ps-badge ps-badge-${estado}`}>{estadoLegible(estado)}</span></td>
                    <td>{pendiente ? <span className="ps-readonly-badge">Vista de supervisión</span> : <span className="ps-no-action">-</span>}</td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        )}
      </section>

      {solicitudAprobar && (
        <div className="ps-modal-overlay" role="presentation">
          <section className="ps-modal" role="dialog" aria-modal="true" aria-labelledby="approve-request-title">
            <h2 id="approve-request-title">Aprobar Solicitud</h2>
            <p>
              ¿Estás seguro de aprobar la solicitud de <strong>{getNombre(solicitudAprobar)}</strong>? Se generará un código único y se enviará un email de confirmación.
            </p>
            <div className="ps-modal-actions">
              <button className="ps-modal-confirm approve" type="button" onClick={confirmarAprobacion} disabled={procesandoId === getId(solicitudAprobar)}>
                {procesandoId === getId(solicitudAprobar) ? 'Aprobando...' : 'Aprobar'}
              </button>
              <button className="ps-modal-cancel" type="button" onClick={() => setSolicitudAprobar(null)} disabled={procesandoId === getId(solicitudAprobar)}>Cancelar</button>
            </div>
          </section>
        </div>
      )}

      {solicitudRechazar && (
        <div className="ps-modal-overlay" role="presentation">
          <section className="ps-modal" role="dialog" aria-modal="true" aria-labelledby="reject-request-title">
            <h2 id="reject-request-title">Rechazar Solicitud</h2>
            <p>Compañía: <strong>{getNombre(solicitudRechazar)}</strong></p>
            <form onSubmit={confirmarRechazo} noValidate>
              <label className="ps-reject-field">
                <span>Motivo de Rechazo *</span>
                <textarea
                  className={errorMotivo ? 'invalid' : ''}
                  value={motivoRechazo}
                  onChange={(event) => {
                    setMotivoRechazo(event.target.value)
                    if (errorMotivo) setErrorMotivo('')
                  }}
                  placeholder="Describe el motivo del rechazo..."
                  rows="4"
                />
                {errorMotivo && <small>{errorMotivo}</small>}
              </label>
              <div className="ps-modal-actions">
                <button className={`ps-modal-confirm reject ${motivoRechazo.trim() ? '' : 'is-empty'}`} type="submit" disabled={procesandoId === getId(solicitudRechazar)}>
                  {procesandoId === getId(solicitudRechazar) ? 'Rechazando...' : 'Rechazar Solicitud'}
                </button>
                <button className="ps-modal-cancel" type="button" onClick={cerrarRechazo} disabled={procesandoId === getId(solicitudRechazar)}>Cancelar</button>
              </div>
            </form>
            <div className="ps-email-note">Se enviará un email con el motivo del rechazo a la compañía</div>
          </section>
        </div>
      )}
    </AdminLayout>
  )
}
