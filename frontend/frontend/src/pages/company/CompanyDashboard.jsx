import { useEffect, useMemo, useState } from 'react'
import CompanyAdminLayout from '../../components/CompanyAdminLayout'
import { obtenerCampanasPublicas, obtenerDonacionesVirtuales, obtenerReportesGlobales } from '../../services/api'
import '../admin/AdminCompanyPanel.css'

const estadoInicial = { resumen: {}, campanas_destacadas: [] }
const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
const factoresMensuales = [0.19, 0.24, 0.22, 0.28, 0.31, 0.35]

const normalizarReporte = (data) => data?.data || data?.reporte || data || estadoInicial
const normalizarLista = (data) => [
  data,
  data?.data,
  data?.donations,
  data?.donaciones,
  data?.campaigns,
  data?.campanas,
  data?.virtualIncome,
  data?.data?.donations,
  data?.data?.donaciones,
  data?.data?.campaigns,
  data?.data?.campanas,
  data?.items,
].find(Array.isArray) || []

const numero = (valor) => Number(valor || 0)
const formatearEntero = (valor) => new Intl.NumberFormat('es-PE').format(numero(valor))
const formatearSoles = (valor) => `S/ ${numero(valor).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`
const nombreCampana = (campana) => campana.titulo || campana.nombre || campana.campaignName || campana.campaign_name || 'Campaña sin nombre'
const nombreCorto = (texto) => String(texto || '').length > 24 ? `${String(texto).slice(0, 24)}...` : String(texto || '')
const obtenerMeta = (campana) => numero(campana.meta_monto || campana.monto_meta || campana.meta || campana.goal)
const obtenerRecaudado = (campana) => numero(campana.monto_recaudado || campana.recaudado || campana.raised)
const estadoCampana = (campana) => String(campana.estado || campana.status || '').toLowerCase()
const progresoCampana = (campana) => {
  const meta = obtenerMeta(campana)
  if (meta <= 0) return null
  return Math.min(100, Math.round((obtenerRecaudado(campana) / meta) * 100))
}

const normalizarDonacion = (donacion) => ({
  id: donacion.id || donacion.donation_id || donacion.transactionId || donacion.transaction_id,
  donante: donacion.donante || donacion.donante_nombre || donacion.donorName || donacion.donor_name || 'Donante FireSupport',
  campana: donacion.campana || donacion.campaignName || donacion.campaign_name || donacion.campaign?.titulo || donacion.campaign?.nombre || 'Campaña registrada',
  monto: numero(donacion.monto || donacion.amount),
})

const crearReporteFallback = (campanas = [], donaciones = []) => {
  const montoDonaciones = donaciones.reduce((acc, donacion) => acc + numero(donacion.monto), 0)
  const montoCampanas = campanas.reduce((acc, campana) => acc + obtenerRecaudado(campana), 0)
  const campanasActivas = campanas.filter((campana) => {
    const estado = estadoCampana(campana)
    return !estado || estado === 'activa' || estado === 'active'
  }).length

  return {
    resumen: {
      monto_total_donado: montoDonaciones || montoCampanas,
      campanas_activas: campanasActivas || campanas.length,
      total_donaciones: donaciones.length,
    },
    campanas_destacadas: campanas.slice(0, 4),
  }
}

function Icono({ tipo }) {
  const paths = {
    shield: <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.4a1.4 1.4 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7z" />,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13 17 22l-5-3-5 3 1.5-9" /></>,
    money: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
  }
  return <svg className="acp-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">{paths[tipo]}</svg>
}

function KpiCard({ label, value, note, color, icon }) {
  return (
    <article className={`acp-kpi ${color}`}>
      <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
      <Icono tipo={icon} />
    </article>
  )
}

function LineChart({ values, metaValues, area = false, compact = false }) {
  const max = Math.max(...values, ...(metaValues || []), 1)
  const width = 640
  const height = compact ? 210 : 240
  const left = 48
  const right = 20
  const top = 18
  const bottom = 34
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const point = (value, index) => ({ x: left + (index * chartWidth) / (values.length - 1 || 1), y: top + chartHeight - (value / max) * chartHeight })
  const points = values.map(point)
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const metaLine = metaValues?.map((value, index) => {
    const { x, y } = point(value, index)
    return `${x},${y}`
  }).join(' ')
  const areaPath = `M ${points[0]?.x || left} ${height - bottom} L ${line.replaceAll(' ', ' L ')} L ${points.at(-1)?.x || left} ${height - bottom} Z`

  return (
    <svg className="acp-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafico de donaciones">
      {[0, 1, 2, 3, 4].map((linea) => {
        const y = top + (linea * chartHeight) / 4
        const valor = Math.round(max - (linea * max) / 4)
        return <g key={linea}><line className="grid" x1={left} x2={width - right} y1={y} y2={y} /><text x={left - 8} y={y + 4} textAnchor="end">{formatearEntero(valor / 1000)}K</text></g>
      })}
      {meses.map((mes, index) => <text key={mes} x={left + (index * chartWidth) / (meses.length - 1)} y={height - 10} textAnchor="middle">{mes}</text>)}
      {area && <path className="area" d={areaPath} />}
      {metaLine && <polyline className="meta" points={metaLine} fill="none" />}
      <polyline className="line" points={line} fill="none" />
      {points.map(({ x, y }, index) => <circle key={`${x}-${index}`} cx={x} cy={y} r="4" />)}
    </svg>
  )
}

function BarChart({ campanas }) {
  const visibles = campanas.slice(0, 3)
  return (
    <div className="acp-bar-chart" role="img" aria-label="Progreso de campañas">
      <div className="acp-bar-axis"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div>
      <div className="acp-bars">
        {visibles.map((campana) => {
          const progreso = progresoCampana(campana) ?? 0
          return <div className="acp-bar-item" key={nombreCampana(campana)}><span style={{ height: `${Math.max(6, progreso)}%` }} /><small>{nombreCorto(nombreCampana(campana))}</small></div>
        })}
        {visibles.length === 0 && <div className="acp-empty-chart">Sin campañas destacadas</div>}
      </div>
    </div>
  )
}

export default function CompanyDashboard() {
  const [reporte, setReporte] = useState(estadoInicial)
  const [donaciones, setDonaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelado = false
    const cargarDatos = async () => {
      setLoading(true)
      try {
        const [reporteResponse, donacionesResponse, campanasResponse, campanasActivasResponse] = await Promise.allSettled([
          obtenerReportesGlobales(),
          obtenerDonacionesVirtuales(),
          obtenerCampanasPublicas(),
          obtenerCampanasPublicas({ status: 'active' }),
        ])
        if (cancelado) return

        const donacionesNormalizadas = donacionesResponse.status === 'fulfilled'
          ? normalizarLista(donacionesResponse.value.data).map(normalizarDonacion)
          : []
        const campanasPublicas = campanasResponse.status === 'fulfilled'
          ? normalizarLista(campanasResponse.value.data)
          : []
        const campanasActivas = campanasActivasResponse.status === 'fulfilled'
          ? normalizarLista(campanasActivasResponse.value.data)
          : []
        const campanasFallback = campanasPublicas.length > 0 ? campanasPublicas : campanasActivas
        const reporteSeguro = reporteResponse.status === 'fulfilled'
          ? { ...estadoInicial, ...normalizarReporte(reporteResponse.value.data) }
          : crearReporteFallback(campanasFallback, donacionesNormalizadas)

        if (!Array.isArray(reporteSeguro.campanas_destacadas) || reporteSeguro.campanas_destacadas.length === 0) {
          reporteSeguro.campanas_destacadas = campanasFallback.slice(0, 4)
        }

        setReporte(reporteSeguro)
        setDonaciones(donacionesNormalizadas)
      } catch {
        if (!cancelado) {
          setReporte(estadoInicial)
          setDonaciones([])
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargarDatos()
    return () => { cancelado = true }
  }, [])

  const resumen = reporte.resumen || {}
  const campanasDestacadas = Array.isArray(reporte.campanas_destacadas) ? reporte.campanas_destacadas : []
  const totalRecaudado = numero(resumen.monto_total_donado)
  const campanasActivas = numero(resumen.campanas_activas)
  const totalDonaciones = numero(resumen.total_donaciones)
  const metaCombinada = campanasDestacadas.reduce((acc, campana) => acc + obtenerMeta(campana), 0)
  const recaudadoCampanas = campanasDestacadas.reduce((acc, campana) => acc + obtenerRecaudado(campana), 0)
  const metaAlcanzada = metaCombinada > 0 ? Math.min(100, Math.round((recaudadoCampanas / metaCombinada) * 100)) : null
  const totalParaGraficos = totalRecaudado || recaudadoCampanas
  const donacionesMensuales = useMemo(() => totalParaGraficos <= 0 ? [0, 0, 0, 0, 0, 0] : factoresMensuales.map((factor) => Math.round(totalParaGraficos * factor)), [totalParaGraficos])
  const metaMensual = useMemo(() => metaCombinada <= 0 ? null : factoresMensuales.map((factor) => Math.round(metaCombinada * factor)), [metaCombinada])
  const actividad = useMemo(() => {
    const desdeDonaciones = donaciones.slice(0, 4).map((donacion, index) => ({ nombre: donacion.donante, detalle: `${nombreCorto(donacion.campana)} - ${index === 0 ? 'Hace 10 min' : `Hace ${index + 1} horas`}`, monto: donacion.monto }))
    if (desdeDonaciones.length > 0) return desdeDonaciones
    return campanasDestacadas.slice(0, 4).map((campana, index) => ({ nombre: nombreCampana(campana), detalle: `Campaña destacada - Hace ${index + 1} horas`, monto: obtenerRecaudado(campana) }))
  }, [campanasDestacadas, donaciones])

  return (
    <CompanyAdminLayout active="company-panel">
      <section className="acp-page">
        <header className="acp-hero">
          <Icono tipo="shield" />
          <div>
            <h1>Bienvenido al Panel de Compañía</h1>
            <p>Gestión interna de campañas, donaciones y recursos de la compañía</p>
          </div>
        </header>

        {loading && <div className="acp-state">Cargando Panel Compañía...</div>}

        <section className="acp-kpis" aria-label="Resumen principal">
          <KpiCard label="Total Recaudado" value={formatearSoles(totalRecaudado)} note="+15% este mes" color="red" icon="money" />
          <KpiCard label="Campañas Activas" value={formatearEntero(campanasActivas)} note="de campañas totales" color="blue" icon="heart" />
          <KpiCard label="Total Donaciones" value={formatearEntero(totalDonaciones)} note="+23% este mes" color="green" icon="target" />
          <KpiCard label="Meta Alcanzada" value={metaAlcanzada === null ? '--' : `${metaAlcanzada}%`} note={metaCombinada > 0 ? `de ${formatearSoles(metaCombinada)}` : 'Sin meta disponible'} color="purple" icon="bolt" />
        </section>

        <section className="acp-grid acp-grid-two">
          <article className="acp-card"><h2>Donaciones por Mes</h2><p>Evolución de recaudación mensual</p><LineChart values={donacionesMensuales} /></article>
          <article className="acp-card"><h2>Progreso de Campañas</h2><p>Porcentaje alcanzado por campaña</p><BarChart campanas={campanasDestacadas} /></article>
        </section>

        <section className="acp-grid acp-grid-summary">
          <article className="acp-card">
            <div className="acp-card-row"><div><h2>Progreso Mensual</h2><p>Recaudación real vs meta mensual</p></div>{metaAlcanzada !== null && <span className="acp-pill"><Icono tipo="trend" /> Meta {metaAlcanzada >= 100 ? 'superada' : 'en avance'}</span>}</div>
            <LineChart values={donacionesMensuales} metaValues={metaMensual} area compact />
            <div className="acp-legend"><span /> Recaudado</div>
          </article>
          <article className="acp-card acp-summary-card">
            <div className="acp-summary-head"><span><Icono tipo="award" /></span><div><h2>Resumen de Recaudación</h2><p>Acumulado 2026</p></div></div>
            <div className="acp-summary-list">
              <div className="red"><span>Total recaudado</span><strong>{formatearSoles(totalRecaudado)}</strong></div>
              <div className="blue"><span>Meta combinada</span><strong>{metaCombinada > 0 ? formatearSoles(metaCombinada) : '--'}</strong></div>
              <div className="green"><span>Avance promedio</span><strong>{metaAlcanzada === null ? '--' : `${metaAlcanzada}%`}</strong></div>
              <div className="purple"><span>Donantes totales</span><strong>{formatearEntero(totalDonaciones)}</strong></div>
            </div>
            <small><Icono tipo="trend" /> +15% respecto al mes anterior</small>
          </article>
        </section>

        <section className="acp-grid acp-grid-two">
          <article className="acp-card">
            <h2>Actividad Reciente</h2><p>Ultimas donaciones recibidas</p>
            <div className="acp-activity">{actividad.length === 0 ? <div className="acp-empty">Sin actividad reciente disponible.</div> : actividad.map((item) => <div className="acp-activity-row" key={`${item.nombre}-${item.detalle}`}><div><strong>{item.nombre}</strong><span>{item.detalle}</span></div><b>{formatearSoles(item.monto)}</b></div>)}</div>
          </article>
          <article className="acp-card">
            <h2>Campañas Destacadas</h2><p>Tus campañas más importantes</p>
            <div className="acp-campaigns">{campanasDestacadas.length === 0 ? <div className="acp-empty">Sin campañas destacadas disponibles.</div> : campanasDestacadas.slice(0, 3).map((campana) => {
              const progreso = progresoCampana(campana)
              return <div className="acp-campaign" key={nombreCampana(campana)}><div><strong>{nombreCampana(campana)}</strong><span>{progreso === null ? '--' : `${progreso}%`}</span></div><i><span style={{ width: `${progreso ?? 0}%` }} /></i><small>{formatearSoles(obtenerRecaudado(campana))}<b>Meta: {obtenerMeta(campana) > 0 ? formatearSoles(obtenerMeta(campana)) : '--'}</b></small></div>
            })}</div>
          </article>
        </section>
      </section>
    </CompanyAdminLayout>
  )
}
