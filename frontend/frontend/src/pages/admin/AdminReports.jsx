import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import CompanyAdminLayout from '../../components/CompanyAdminLayout'
import {
  descargarReporteExcel,
  descargarReportePDF,
  obtenerCampanasPublicas,
  obtenerDonacionesVirtualesPublicas,
  obtenerReportesGlobales,
} from '../../services/api'
import './AdminReports.css'

const datosVisualesMes = [45, 52, 48, 61, 55, 70]
const mesesVisuales = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
const datosVisualesTendencia = [
  { mes: 'Ene', recaudado: 45, campanas: 18 },
  { mes: 'Feb', recaudado: 52, campanas: 22 },
  { mes: 'Mar', recaudado: 48, campanas: 20 },
  { mes: 'Abr', recaudado: 61, campanas: 28 },
  { mes: 'May', recaudado: 55, campanas: 24 },
  { mes: 'Jun', recaudado: 70, campanas: 32 },
]
const regionesVisuales = [
  ['Lima', 128, '#dc2626'],
  ['Arequipa', 62, '#b50009'],
  ['La Libertad', 54, '#f59e0b'],
  ['Cusco', 38, '#2563eb'],
  ['Piura', 29, '#16a34a'],
  ['Otros', 23, '#6b7280'],
]
const metodosPago = [
  ['Tarjeta', '48%', '#dc2626'],
  ['Yape/Plin', '32%', '#f59e0b'],
  ['Transferencia', '14%', '#2563eb'],
  ['Efectivo', '6%', '#16a34a'],
]
const actividadVisual = [
  ['green', "Nueva donación de S/ 500 en 'Nuevo Camión'", 'Hace 5 min'],
  ['orange', "Campaña 'EPP 2026' alcanzó el 75% de su meta", 'Hace 32 min'],
  ['blue', 'Nueva compañía registrada: Bomberos Tacna N°7', 'Hace 1 hora'],
  ['green', 'Donación empresarial de S/ 5,000 procesada', 'Hace 2 horas'],
  ['red', "Campaña 'Capacitación' completó su meta", 'Hace 3 horas'],
]
const companiasVisuales = ['Compañía Roma N°1', 'Compañía Italia N°4', 'Compañía Salvadora', 'Compañía Unión N°15', 'Compañía Limeña N°3']
const regionesRanking = ['Lima', 'Callao', 'Arequipa', 'Cusco', 'Lima']

const estadoInicial = {
  resumen: {},
  solicitudes: {},
  campanas_destacadas: [],
}

const formatearNumero = (valor) => new Intl.NumberFormat('es-PE').format(Number(valor || 0))
const formatearSoles = (valor) => `S/ ${formatearNumero(Math.round(Number(valor || 0)))}`
const normalizarLista = (data) => [
  data,
  data?.data,
  data?.campaigns,
  data?.campanas,
  data?.donations,
  data?.donaciones,
  data?.virtualIncome,
  data?.items,
].find(Array.isArray) || []
const crearReporteDerivado = (campanas = [], donaciones = []) => ({
  resumen: {
    total_campanas: campanas.length,
    campanas_activas: campanas.filter((campana) => String(campana.estado || campana.status || '').toLowerCase() === 'activa').length,
    total_donaciones: donaciones.length,
    monto_total_donado: donaciones.reduce((acc, donacion) => acc + Number(donacion.monto || donacion.amount || 0), 0),
    total_companias: new Set(campanas.map((campana) => campana.compania_id || campana.company_id).filter(Boolean)).size || 1,
    total_asociaciones: 0,
    total_usuarios: 0,
  },
  solicitudes: {},
  campanas_destacadas: campanas.slice(0, 5),
})
const obtenerRol = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || user.rol || localStorage.getItem('userRole') || ''
  } catch {
    return localStorage.getItem('userRole') || ''
  }
}
const descargarBlob = (blob, nombre) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const textoPdfSeguro = (texto) => String(texto ?? '').replace(/[()\\]/g, '')

const crearPdfSimple = (lineas) => {
  const contenido = lineas.map((linea, index) => `BT /F1 12 Tf 50 ${780 - index * 22} Td (${textoPdfSeguro(linea)}) Tj ET`).join('\n')
  const objetos = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${contenido.length} >> stream\n${contenido}\nendstream endobj`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objetos.forEach((objeto) => {
    offsets.push(pdf.length)
    pdf += `${objeto}\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer << /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

const crearExcelHtml = ({ resumen, ranking }) => {
  const filasResumen = Object.entries(resumen || {}).map(([clave, valor]) => `<tr><td>${clave}</td><td>${valor}</td></tr>`).join('')
  const filasRanking = (ranking || []).map((campana) => (
    `<tr><td>${campana.titulo}</td><td>${campana.compania}</td><td>${campana.region}</td><td>${campana.recaudado}</td><td>${campana.progreso}%</td></tr>`
  )).join('')
  return new Blob([`
    <html><head><meta charset="UTF-8" /></head><body>
      <h1>Reporte Global FireSupport IA</h1>
      <h2>Resumen</h2>
      <table border="1"><tbody>${filasResumen}</tbody></table>
      <h2>Ranking de Campañas</h2>
      <table border="1">
        <thead><tr><th>Campaña</th><th>Compañía</th><th>Región</th><th>Recaudado</th><th>Progreso</th></tr></thead>
        <tbody>${filasRanking}</tbody>
      </table>
    </body></html>
  `], { type: 'application/vnd.ms-excel;charset=utf-8' })
}

function LineChart({ values, color = '#dc2626', labels = mesesVisuales }) {
  const paso = values.length > 1 ? 570 / (values.length - 1) : 114
  const puntos = values.map((valor, index) => `${index * paso + 12},${150 - valor * 1.55}`).join(' ')
  return (
    <svg className="ar-line-chart" viewBox="0 0 600 190" role="img" aria-label="Gráfico de línea">
      {[0, 1, 2, 3].map((linea) => <line key={linea} x1="12" x2="590" y1={25 + linea * 42} y2={25 + linea * 42} />)}
      <polyline points={puntos} fill="none" stroke={color} strokeWidth="2.5" />
      {values.map((valor, index) => <circle key={`${valor}-${index}`} cx={index * paso + 12} cy={150 - valor * 1.55} r="4" fill="#fff" stroke={color} strokeWidth="2.5" />)}
      {labels.map((mes, index) => <text key={mes} x={index * paso + 4} y="178">{mes}</text>)}
    </svg>
  )
}

export default function AdminReports({ companyMode = false }) {
  const Layout = companyMode ? CompanyAdminLayout : AdminLayout
  const [data, setData] = useState(estadoInicial)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)
  const [filtros, setFiltros] = useState({
    periodo: 'Últimos 6 meses',
    departamento: 'Todos los departamentos',
    compania: 'Todas las compañías',
    campana: 'Todas las campañas',
  })

  const mostrarToast = useCallback((texto, tipo = 'success') => {
    setToast({ texto, tipo })
    window.clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const cargarReportes = useCallback(async ({ notificar = false } = {}) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMensaje('Debes iniciar sesión para ver reportes globales')
      setLoading(false)
      return
    }
    if (!companyMode && obtenerRol() !== 'super_admin') {
      setMensaje('No tienes permisos de super administrador para ver estos reportes')
      setLoading(false)
      return
    }

    setLoading(true)
    setMensaje('')
    try {
      const response = await obtenerReportesGlobales()
      setData({ ...estadoInicial, ...(response.data || {}) })
      if (notificar) mostrarToast('Datos actualizados')
    } catch (err) {
      console.error('No se pudo cargar GET /api/admin/reports/global', err)
      if (companyMode) {
        const [campanasResponse, donacionesResponse] = await Promise.allSettled([
          obtenerCampanasPublicas(),
          obtenerDonacionesVirtualesPublicas(),
        ])
        const campanas = campanasResponse.status === 'fulfilled' ? normalizarLista(campanasResponse.value.data) : []
        const donaciones = donacionesResponse.status === 'fulfilled' ? normalizarLista(donacionesResponse.value.data) : []
        setData(crearReporteDerivado(campanas, donaciones))
        if (notificar) mostrarToast('Datos actualizados con información pública disponible')
      } else {
        setData(estadoInicial)
      }
      setMensaje('')
    } finally {
      setLoading(false)
    }
  }, [companyMode, mostrarToast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      cargarReportes()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearTimeout(toastTimeoutRef.current)
    }
  }, [cargarReportes])

  const resumenBase = useMemo(() => data.resumen || {}, [data.resumen])
  const rankingBase = useMemo(() => {
    const campanas = Array.isArray(data.campanas_destacadas) ? data.campanas_destacadas : []
    return campanas.slice(0, 5).map((campana, index) => {
      const meta = Number(campana.meta_monto || 0)
      const recaudado = Number(campana.monto_recaudado || 0)
      return {
        id: campana.id || `${campana.titulo}-${index}`,
        titulo: campana.titulo || 'Campaña sin nombre',
        compania: campana.compania || companiasVisuales[index] || 'Compañía no especificada',
        region: campana.region || regionesRanking[index] || 'No especificada',
        recaudado,
        progreso: meta > 0 ? Math.min(100, Math.round((recaudado / meta) * 100)) : 0,
      }
    })
  }, [data.campanas_destacadas])

  const filtrosActivos =
    filtros.departamento !== 'Todos los departamentos' ||
    filtros.compania !== 'Todas las compañías' ||
    filtros.campana !== 'Todas las campañas'

  const ranking = useMemo(() => rankingBase.filter((campana) => {
    const coincideDepartamento = filtros.departamento === 'Todos los departamentos' || campana.region === filtros.departamento
    const coincideCompania = filtros.compania === 'Todas las compañías' || campana.compania === filtros.compania
    const coincideCampana =
      filtros.campana === 'Todas las campañas' ||
      (filtros.campana === 'Campañas activas' && campana.progreso < 100) ||
      (filtros.campana === 'Campañas completadas' && campana.progreso >= 100)

    return coincideDepartamento && coincideCompania && coincideCampana
  }), [filtros.campana, filtros.compania, filtros.departamento, rankingBase])

  const resumen = useMemo(() => {
    if (!filtrosActivos) return resumenBase

    return {
      ...resumenBase,
      total_campanas: ranking.length,
      campanas_activas: ranking.filter((campana) => campana.progreso < 100).length,
      total_donaciones: Math.round(Number(resumenBase.total_donaciones || 0) * (ranking.length / Math.max(rankingBase.length, 1))),
      monto_total_donado: ranking.reduce((acc, campana) => acc + Number(campana.recaudado || 0), 0),
      total_companias: new Set(ranking.map((campana) => campana.compania).filter(Boolean)).size,
    }
  }, [filtrosActivos, ranking, rankingBase.length, resumenBase])

  const datosMesFiltrados = useMemo(() => {
    const base = filtros.periodo === 'Últimos 3 meses' ? datosVisualesMes.slice(-3) : datosVisualesMes
    const factor = filtrosActivos ? Math.max(0.12, ranking.length / Math.max(rankingBase.length, 1)) : 1
    return base.map((valor) => Math.max(1, Math.round(valor * factor)))
  }, [filtros.periodo, filtrosActivos, ranking.length, rankingBase.length])

  const mesesFiltrados = filtros.periodo === 'Últimos 3 meses' ? mesesVisuales.slice(-3) : mesesVisuales
  const tendenciaFiltrada = useMemo(() => {
    const base = filtros.periodo === 'Últimos 3 meses' ? datosVisualesTendencia.slice(-3) : datosVisualesTendencia
    const factor = filtrosActivos ? Math.max(0.12, ranking.length / Math.max(rankingBase.length, 1)) : 1
    return base.map((item) => ({
      ...item,
      recaudado: Math.max(1, Math.round(item.recaudado * factor)),
      campanas: Math.max(1, Math.round(item.campanas * factor)),
    }))
  }, [filtros.periodo, filtrosActivos, ranking.length, rankingBase.length])

  const regionesFiltradas = useMemo(() => {
    if (filtros.departamento === 'Todos los departamentos') return regionesVisuales
    const regiones = regionesVisuales.filter(([region]) => region === filtros.departamento)
    if (regiones.length > 0) return regiones
    const totalRegion = ranking.reduce((acc, campana) => acc + Number(campana.recaudado || 0), 0)
    return [[filtros.departamento, Math.max(12, Math.round(totalRegion / 1000)), '#dc2626']]
  }, [filtros.departamento, ranking])

  const opcionesDepartamentos = useMemo(() => [
    'Todos los departamentos',
    ...new Set([...regionesVisuales.map(([region]) => region), ...rankingBase.map((campana) => campana.region)].filter(Boolean)),
  ], [rankingBase])

  const opcionesCompanias = useMemo(() => [
    'Todas las compañías',
    ...new Set([...companiasVisuales, ...rankingBase.map((campana) => campana.compania)].filter(Boolean)),
  ], [rankingBase])

  const kpis = [
    ['◎', 'Total Campañas', resumen.total_campanas, '+23', 'red'],
    ['↯', 'Campañas Activas', resumen.campanas_activas, '+11', 'green'],
    ['✓', 'Campañas Completadas', ranking.filter((campana) => campana.progreso >= 100).length, '+12', 'blue'],
    ['♥', 'Total Donaciones', resumen.total_donaciones, '+241', 'orange'],
    ['$', 'Monto Recaudado', formatearSoles(resumen.monto_total_donado), '+18%', 'green'],
    ['▤', 'Compañías', resumen.total_companias, '+6', 'red'],
    ['♙', 'Asociaciones', resumen.total_asociaciones, '+2', 'red'],
    ['♙', 'Usuarios Activos', resumen.total_usuarios, '+87', 'blue'],
  ]

  const handleFiltro = (event) => {
    const { name, value } = event.target
    // Filtros preparados para integración cuando backend soporte query params.
    setFiltros((actual) => ({ ...actual, [name]: value }))
  }

  const exportar = async (tipo) => {
    try {
      const response = tipo === 'pdf' ? await descargarReportePDF() : await descargarReporteExcel()
      descargarBlob(response.data, tipo === 'pdf' ? 'reporte-global-firesupport.pdf' : 'reporte-global-firesupport.xlsx')
      mostrarToast(`Reporte exportado en formato ${tipo === 'pdf' ? 'PDF' : 'EXCEL'}`)
    } catch {
      if (!companyMode) {
        mostrarToast('No se pudo exportar el reporte', 'error')
        return
      }

      if (tipo === 'pdf') {
        const lineas = [
          'Reporte Global FireSupport IA',
          `Total campañas: ${formatearNumero(resumen.total_campanas)}`,
          `Campañas activas: ${formatearNumero(resumen.campanas_activas)}`,
          `Total donaciones: ${formatearNumero(resumen.total_donaciones)}`,
          `Monto recaudado: ${formatearSoles(resumen.monto_total_donado)}`,
          `Compañías: ${formatearNumero(resumen.total_companias)}`,
          `Asociaciones: ${formatearNumero(resumen.total_asociaciones)}`,
          `Usuarios activos: ${formatearNumero(resumen.total_usuarios)}`,
          '',
          'Ranking de campañas',
          ...ranking.map((campana, index) => `${index + 1}. ${campana.titulo} - ${formatearSoles(campana.recaudado)} - ${campana.progreso}%`),
        ]
        descargarBlob(crearPdfSimple(lineas), 'reporte-global-firesupport.pdf')
        mostrarToast('Reporte PDF generado desde este panel')
        return
      }

      descargarBlob(crearExcelHtml({ resumen, ranking }), 'reporte-global-firesupport.xls')
      mostrarToast('Reporte Excel generado desde este panel')
    }
  }

  return (
    <Layout active="global-reports">
      <section className="ar-page">
        {toast && <div className={`ar-toast ${toast.tipo}`} role="alert"><span>✓</span>{toast.texto}</div>}

        <header className="ar-header">
          <div>
            <h1><span>▥</span> Reportes Globales</h1>
            <p>Monitorea el rendimiento y la actividad de recaudación de la plataforma</p>
          </div>
          <div className="ar-actions">
            <button type="button" onClick={() => cargarReportes({ notificar: true })}>↻ Actualizar</button>
            <button className="pdf" type="button" onClick={() => exportar('pdf')}>⇩ Exportar PDF</button>
            <button className="excel" type="button" onClick={() => exportar('excel')}>▧ Excel</button>
          </div>
        </header>

        <section className="ar-filters" aria-label="Filtros de reportes">
          <span>▽ Filtros:</span>
          <select name="periodo" value={filtros.periodo} onChange={handleFiltro}><option>Últimos 6 meses</option><option>Últimos 3 meses</option><option>Este año</option></select>
          <select name="departamento" value={filtros.departamento} onChange={handleFiltro}>{opcionesDepartamentos.map((opcion) => <option key={opcion}>{opcion}</option>)}</select>
          <select name="compania" value={filtros.compania} onChange={handleFiltro}>{opcionesCompanias.map((opcion) => <option key={opcion}>{opcion}</option>)}</select>
          <select name="campana" value={filtros.campana} onChange={handleFiltro}><option>Todas las campañas</option><option>Campañas activas</option><option>Campañas completadas</option></select>
        </section>

        {mensaje && <div className="ar-state error">{mensaje}</div>}
        {loading ? <div className="ar-state">Cargando reportes globales...</div> : !mensaje && (
          <>
            <section className="ar-kpis" aria-label="Indicadores principales">
              {kpis.map(([icono, label, valor, trend, color]) => (
                <article className="ar-kpi" key={label}>
                  <div className={`ar-kpi-icon ${color}`}>{icono}</div>
                  <span className="ar-trend">⌁ {trend}</span>
                  <strong>{typeof valor === 'number' ? formatearNumero(valor) : valor}</strong>
                  <small>{label}</small>
                </article>
              ))}
            </section>

            <section className="ar-chart-grid">
              <article className="ar-card">
                <h2>Donaciones por Mes</h2>
                <LineChart values={datosMesFiltrados} labels={mesesFiltrados} />
              </article>
              <article className="ar-card">
                <h2>Recaudación por Región</h2>
                <div className="ar-bars">
                  {regionesFiltradas.map(([region, valor, color]) => (
                    <div className="ar-bar-row" key={region}>
                      <span>{region}</span>
                      <div><i style={{ width: `${valor / 1.35}%`, background: color }} /></div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="ar-chart-grid lower">
              <article className="ar-card">
                <h2>Tendencia de Crecimiento</h2>
                <svg className="ar-line-chart" viewBox="0 0 600 210" role="img" aria-label="Tendencia de crecimiento">
                  {[0, 1, 2, 3].map((linea) => <line key={linea} x1="12" x2="590" y1={25 + linea * 42} y2={25 + linea * 42} />)}
                  <polyline points={tendenciaFiltrada.map((d, i) => `${i * (570 / Math.max(tendenciaFiltrada.length - 1, 1)) + 12},${150 - d.recaudado * 1.55}`).join(' ')} fill="none" stroke="#dc2626" strokeWidth="2.5" />
                  <polyline points={tendenciaFiltrada.map((d, i) => `${i * (570 / Math.max(tendenciaFiltrada.length - 1, 1)) + 12},${160 - d.campanas * 3}`).join(' ')} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  {tendenciaFiltrada.map((d, i) => <text key={d.mes} x={i * (570 / Math.max(tendenciaFiltrada.length - 1, 1)) + 4} y="178">{d.mes}</text>)}
                </svg>
                <div className="ar-legend"><span className="red">Recaudado (S/.)</span><span className="blue">Campañas</span></div>
              </article>
              <article className="ar-card ar-payment">
                <h2>Métodos de Pago</h2>
                <div className="ar-donut" />
                <div className="ar-payment-list">
                  {metodosPago.map(([metodo, porcentaje, color]) => <div key={metodo}><span><i style={{ background: color }} />{metodo}</span><strong>{porcentaje}</strong></div>)}
                </div>
              </article>
            </section>

            <section className="ar-card ar-ranking">
              <div className="ar-card-head"><h2>Ranking de Campañas</h2><span>Top 5 por monto recaudado</span></div>
              {ranking.length === 0 ? <div className="ar-empty">No hay campañas destacadas para mostrar.</div> : (
                <div className="ar-table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Campaña</th><th>Compañía</th><th>Región</th><th>Recaudado</th><th>Progreso</th></tr></thead>
                    <tbody>{ranking.map((campana, index) => (
                      <tr key={campana.id}>
                        <td><span className="ar-rank">{index + 1}</span></td>
                        <td>{campana.titulo}</td>
                        <td>{campana.compania}</td>
                        <td>{campana.region}</td>
                        <td><strong>{formatearSoles(campana.recaudado)}</strong></td>
                        <td><div className="ar-progress"><i style={{ width: `${campana.progreso}%` }} /><span>{campana.progreso}%</span></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="ar-card ar-activity">
              <h2><span>◷</span> Actividad Reciente</h2>
              {actividadVisual.map(([color, texto, tiempo]) => (
                <div className="ar-activity-item" key={texto}>
                  <i className={color} />
                  <p>{texto}<small>{tiempo}</small></p>
                </div>
              ))}
            </section>
          </>
        )}
      </section>
    </Layout>
  )
}
