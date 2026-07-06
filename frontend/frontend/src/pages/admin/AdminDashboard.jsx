import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  aprobarSolicitud,
  obtenerMensajeApi,
  obtenerReportesGlobales,
  obtenerSolicitudes,
  rechazarSolicitud,
} from '../../services/api'
import './AdminDashboard.css'

const estadoInicial = {
  resumen: {},
  solicitudes: {},
  campanas_destacadas: [],
}

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']

const normalizarReporte = (data) => data?.data || data?.reporte || data || estadoInicial

const normalizarSolicitudes = (data) => [
  data, data?.data, data?.requests, data?.solicitudes,
  data?.data?.requests, data?.data?.solicitudes, data?.items,
].find(Array.isArray) || []

const formatearNumero = (valor) => new Intl.NumberFormat('es-PE').format(Number(valor || 0))

const getNombreSolicitud = (solicitud) =>
  solicitud.nombreCompania || solicitud.nombre_compania || solicitud.nombre || solicitud.company_name || 'Compañía sin nombre'

const getIdSolicitud = (solicitud) => solicitud.id || solicitud.solicitud_id || solicitud.request_id || solicitud.ruc

const getUbicacionSolicitud = (solicitud) => {
  const partes = [solicitud.departamento, solicitud.provincia, solicitud.distrito].filter(Boolean)
  return partes.length > 0 ? partes.join(', ') : solicitud.ubicacion || solicitud.direccion || 'Ubicación no registrada'
}

const getFechaSolicitud = (solicitud) => {
  const fecha = solicitud.fecha || solicitud.fecha_solicitud || solicitud.created_at || solicitud.createdAt
  return fecha ? String(fecha).slice(0, 10) : 'Fecha no registrada'
}

function KpiCard({ label, value, color, icon }) {
  return (
    <article className={`ad-kpi ${color}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>↗ vs mes anterior</small>
      </div>
      <i>{icon}</i>
    </article>
  )
}

function BarChart({ values }) {
  const max = Math.max(...values, 1)
  return (
    <div className="ad-bar-chart" role="img" aria-label="Crecimiento de campañas">
      <div className="ad-y-axis"><span>32</span><span>24</span><span>16</span><span>8</span><span>0</span></div>
      <div className="ad-bars">
        {values.map((value, index) => (
          <div className="ad-bar-item" key={meses[index]}>
            <span style={{ height: `${Math.max(12, (value / max) * 100)}%` }} />
            <small>{meses[index]}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function LineChart({ values }) {
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => {
    const x = 16 + index * 112
    const y = 178 - (value / max) * 142
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="ad-line-chart" viewBox="0 0 600 220" role="img" aria-label="Recaudación global">
      {[0, 1, 2, 3, 4].map((linea) => (
        <line key={linea} x1="16" x2="584" y1={36 + linea * 36} y2={36 + linea * 36} />
      ))}
      <polyline points={points} fill="none" />
      {values.map((value, index) => {
        const x = 16 + index * 112
        const y = 178 - (value / max) * 142
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="5" />
      })}
      {meses.map((mes, index) => <text key={mes} x={8 + index * 112} y="206">{mes}</text>)}
    </svg>
  )
}

function DashboardIcon({ type }) {
  const paths = {
    check: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    x: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </>
    ),
    shield: (
      <>
        <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.4a1.4 1.4 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  }

  return (
    <svg className={`ad-lucide ad-lucide-${type}`} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {paths[type]}
    </svg>
  )
}

export default function AdminDashboard() {
  const [reporte, setReporte] = useState(estadoInicial)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [toast, setToast] = useState(null)
  const [procesandoId, setProcesandoId] = useState(null)
  const [solicitudAprobar, setSolicitudAprobar] = useState(null)
  const [solicitudRechazar, setSolicitudRechazar] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [errorRechazo, setErrorRechazo] = useState('')

  useEffect(() => {
    let cancelado = false

    const cargarDashboard = async () => {
      setLoading(true)
      setMensaje('')

      try {
        const [reporteResponse, solicitudesResponse] = await Promise.allSettled([
          obtenerReportesGlobales(),
          obtenerSolicitudes({ estado: 'pendiente' }),
        ])

        if (!cancelado) {
          if (reporteResponse.status === 'fulfilled') {
            setReporte({ ...estadoInicial, ...normalizarReporte(reporteResponse.value.data) })
          } else {
            console.error('No se pudo cargar GET /api/admin/reports/global', reporteResponse.reason)
            setReporte(estadoInicial)
          }

          if (solicitudesResponse.status === 'fulfilled') {
            setSolicitudesPendientes(normalizarSolicitudes(solicitudesResponse.value.data))
          } else {
            console.error('No se pudo cargar GET /api/companies/requests', solicitudesResponse.reason)
            setSolicitudesPendientes([])
          }
        }
      } catch (err) {
        if (!cancelado) {
          console.error('No se pudo cargar el Dashboard Ejecutivo', err)
          setReporte(estadoInicial)
          setSolicitudesPendientes([])
          setMensaje('')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarDashboard()

    return () => {
      cancelado = true
    }
  }, [])

  const resumen = reporte.resumen || {}
  const solicitudes = reporte.solicitudes || {}
  const campanasDestacadas = Array.isArray(reporte.campanas_destacadas) ? reporte.campanas_destacadas : []
  const cantidadPendientes = solicitudesPendientes.length || Number(solicitudes.pendientes || 0)

  const kpis = [
    { label: 'Total Compañías', value: formatearNumero(resumen.total_companias), color: 'red', icon: '▥' },
    { label: 'Total Asociaciones', value: formatearNumero(resumen.total_asociaciones), color: 'blue', icon: '♙' },
    { label: 'Total Campañas', value: formatearNumero(resumen.total_campanas), color: 'purple', icon: '♡' },
    { label: 'Total Donaciones', value: formatearNumero(resumen.total_donaciones), color: 'green', icon: '$' },
    { label: 'Total Usuarios', value: formatearNumero(resumen.total_usuarios), color: 'orange', icon: '♙' },
  ]

  const valoresCampanas = useMemo(() => {
    const total = Number(resumen.total_campanas || 0)
    if (campanasDestacadas.length > 0) {
      return meses.map((_, index) => Math.max(1, Math.round((campanasDestacadas.length + index + 2) * Math.max(total, 6) / 12)))
    }
    return [18, 22, 20, 28, 24, Math.max(31, total)]
  }, [campanasDestacadas.length, resumen.total_campanas])

  const valoresRecaudacion = useMemo(() => {
    const total = Number(resumen.monto_total_donado || 0)
    if (total > 0) return [0.52, 0.59, 0.57, 0.7, 0.66, 0.82].map((factor) => Math.round(total * factor))
    return [125000, 142000, 138000, 166000, 158000, 192000]
  }, [resumen.monto_total_donado])

  const actividad = useMemo(() => {
    const desdeCampanas = campanasDestacadas.slice(0, 3).map((campana, index) => ({
      color: ['blue', 'purple', 'green'][index],
      titulo: index === 0 ? 'Campaña destacada actualizada' : 'Campaña con actividad reciente',
      detalle: campana.titulo || campana.nombre || 'Campaña activa',
      tiempo: index === 0 ? 'Hace 5 min' : `Hace ${15 * (index + 1)} min`,
    }))

    return [
      ...desdeCampanas,
      { color: 'orange', titulo: 'Asociación actualizada', detalle: 'Seguimiento institucional', tiempo: 'Hace 2 horas' },
      { color: 'red', titulo: 'Meta alcanzada', detalle: 'Monitoreo de campañas', tiempo: 'Hace 3 horas' },
    ].slice(0, 5)
  }, [campanasDestacadas])

  const mostrarToast = (tipo, titulo, detalle) => {
    setToast({ tipo, titulo, detalle })
    window.setTimeout(() => setToast(null), 4200)
  }

  const cerrarModalAprobar = () => setSolicitudAprobar(null)
  const cerrarModalRechazar = () => {
    setSolicitudRechazar(null)
    setMotivoRechazo('')
    setErrorRechazo('')
  }

  const confirmarAprobacion = async () => {
    if (!solicitudAprobar) return
    const solicitudId = getIdSolicitud(solicitudAprobar)
    if (!solicitudId) return

    setProcesandoId(solicitudId)
    try {
      await aprobarSolicitud(solicitudId)
      setSolicitudesPendientes((actuales) => actuales.filter((solicitud) => getIdSolicitud(solicitud) !== solicitudId))
      cerrarModalAprobar()
      mostrarToast('success', 'Solicitud aprobada correctamente.', 'La compañía recibirá un correo de confirmación.')
    } catch (err) {
      mostrarToast('error', 'No se pudo aprobar la solicitud.', obtenerMensajeApi(err, 'Intenta nuevamente.'))
    } finally {
      setProcesandoId(null)
    }
  }

  const abrirRechazo = (solicitud) => {
    setSolicitudRechazar(solicitud)
    setMotivoRechazo('')
    setErrorRechazo('')
  }

  const confirmarRechazo = async (event) => {
    event.preventDefault()
    if (!solicitudRechazar) return

    const solicitudId = getIdSolicitud(solicitudRechazar)
    const motivo = motivoRechazo.trim()
    if (!solicitudId) return
    if (motivo.length < 10) {
      setErrorRechazo('El motivo debe tener al menos 10 caracteres.')
      return
    }
    if (motivo.length > 300) {
      setErrorRechazo('El motivo no puede superar los 300 caracteres.')
      return
    }

    setProcesandoId(solicitudId)
    try {
      await rechazarSolicitud(solicitudId, motivo)
      setSolicitudesPendientes((actuales) => actuales.filter((solicitud) => getIdSolicitud(solicitud) !== solicitudId))
      cerrarModalRechazar()
      mostrarToast(
        'reject-success',
        'Solicitud rechazada correctamente.',
        'Se notificó a la compañía mediante un correo electrónico con el motivo del rechazo.'
      )
    } catch {
      mostrarToast(
        'error',
        'No fue posible completar el rechazo.',
        'Verifique la conexión o intente nuevamente.'
      )
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <AdminLayout active="dashboard">
      <section className="ad-page">
        {toast && (
          <div className={`ad-toast ${toast.tipo}`} role="status">
            <span className="ad-toast-icon">
              <DashboardIcon type={toast.tipo === 'reject-success' ? 'mail' : toast.tipo === 'success' ? 'check' : 'x'} />
            </span>
            <div>
              <strong>{toast.titulo}</strong>
              <span>{toast.detalle}</span>
            </div>
          </div>
        )}

        <header className="ad-header">
          <div className="ad-header-row">
            <h1>Dashboard Ejecutivo</h1>
            <span className="ad-readonly-badge">Modo Supervisión</span>
          </div>
          <p>Panel de control del sistema FireSupport IA</p>
        </header>

        {mensaje && <div className="ad-alert">{mensaje}</div>}
        {loading ? <div className="ad-state">Cargando Dashboard Ejecutivo...</div> : (
          <>
            <section className="ad-kpis" aria-label="KPIs principales">
              {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
            </section>

            <section className="ad-chart-grid">
              <article className="ad-card">
                <h2>Crecimiento de Campañas</h2>
                <p>Nuevas campañas por mes</p>
                <BarChart values={valoresCampanas} />
              </article>

              <article className="ad-card">
                <h2>Recaudación Global</h2>
                <p>Evolución mensual de ingresos</p>
                <LineChart values={valoresRecaudacion} />
              </article>
            </section>

            <section className="ad-lower-grid">
              <article className="ad-card ad-requests">
                <div className="ad-card-title-row">
                  <div>
                    <h2>Solicitudes Pendientes</h2>
                    <p>{cantidadPendientes} compañías esperan aprobación</p>
                  </div>
                  <span>{cantidadPendientes}</span>
                </div>

                {solicitudesPendientes.length === 0 ? (
                  <div className="ad-empty">No hay solicitudes pendientes.</div>
                ) : solicitudesPendientes.slice(0, 3).map((solicitud) => (
                  <div className="ad-request-row" key={getIdSolicitud(solicitud) || getNombreSolicitud(solicitud)}>
                    <div>
                      <strong>{getNombreSolicitud(solicitud)}</strong>
                      <small>{getUbicacionSolicitud(solicitud)} • {getFechaSolicitud(solicitud)}</small>
                    </div>
                    <div className="ad-request-actions" aria-label="Estado de solicitud">
                      <span className="ad-supervision-chip">Vista de supervisión</span>
                    </div>
                  </div>
                ))}
              </article>

              <article className="ad-card ad-activity">
                <h2>Actividad Reciente</h2>
                <p>Últimas acciones del sistema</p>
                {actividad.map((item) => (
                  <div className="ad-activity-item" key={`${item.titulo}-${item.detalle}`}>
                    <i className={item.color} />
                    <div>
                      <strong>{item.titulo}</strong>
                      <span>{item.detalle}</span>
                      <small>{item.tiempo}</small>
                    </div>
                  </div>
                ))}
              </article>
            </section>

            <section className="ad-system">
              <h2>Estado General del Sistema</h2>
              <p>Métricas de rendimiento y operación</p>
              <div className="ad-system-grid">
                <div><span>Uptime del Sistema</span><strong>99.8%</strong></div>
                <div><span>Transacciones Hoy</span><strong>{formatearNumero(resumen.total_donaciones)}</strong></div>
                <div><span>Tiempo Respuesta</span><strong>142ms</strong></div>
                <div><span>Usuarios Activos</span><strong>{formatearNumero(resumen.total_usuarios)}</strong></div>
              </div>
            </section>
          </>
        )}

        {solicitudAprobar && (
          <div className="ad-modal-overlay" role="presentation">
            <section className="ad-modal ad-modal-approve" role="dialog" aria-modal="true" aria-labelledby="ad-approve-title">
              <div className="ad-modal-icon approve"><DashboardIcon type="shield" /></div>
              <h2 id="ad-approve-title">Aprobar Solicitud</h2>
              <p>¿Estás seguro de aprobar la solicitud de la compañía:</p>
              <strong className="ad-modal-company">"{getNombreSolicitud(solicitudAprobar)}"</strong>
              <ul>
                <li>se generará un código único</li>
                <li>se habilitará el acceso al sistema</li>
                <li>se enviará automáticamente el correo de confirmación</li>
              </ul>
              <div className="ad-modal-actions">
                <button className="cancel" type="button" onClick={cerrarModalAprobar} disabled={Boolean(procesandoId)}>Cancelar</button>
                <button className="approve" type="button" onClick={confirmarAprobacion} disabled={procesandoId === getIdSolicitud(solicitudAprobar)}>
                  {procesandoId === getIdSolicitud(solicitudAprobar) ? 'Aprobando...' : 'Aprobar'}
                </button>
              </div>
            </section>
          </div>
        )}

        {solicitudRechazar && (
          <div className="ad-modal-overlay" role="presentation">
            <section className="ad-modal ad-modal-reject" role="dialog" aria-modal="true" aria-labelledby="ad-reject-title">
              <div className="ad-modal-icon reject"><DashboardIcon type="x" /></div>
              <h2 id="ad-reject-title">Rechazar Solicitud</h2>
              <p>Nombre de la compañía</p>
              <strong className="ad-modal-company">{getNombreSolicitud(solicitudRechazar)}</strong>
              <form onSubmit={confirmarRechazo} noValidate>
                <label className="ad-reject-field">
                  <span>Motivo del rechazo</span>
                  <textarea
                    value={motivoRechazo}
                    onChange={(event) => {
                      setMotivoRechazo(event.target.value.slice(0, 300))
                      if (errorRechazo) setErrorRechazo('')
                    }}
                    placeholder="Describe brevemente el motivo del rechazo para que la compañía pueda corregir su solicitud..."
                    rows="5"
                    maxLength="300"
                  />
                  <em>{motivoRechazo.length}/300 caracteres</em>
                  {errorRechazo && <small>{errorRechazo}</small>}
                </label>
                <div className="ad-modal-actions">
                  <button className="cancel" type="button" onClick={cerrarModalRechazar} disabled={Boolean(procesandoId)}>Cancelar</button>
                  <button className="reject" type="submit" disabled={procesandoId === getIdSolicitud(solicitudRechazar)}>
                    {procesandoId === getIdSolicitud(solicitudRechazar) ? 'Rechazando...' : 'Rechazar solicitud'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
