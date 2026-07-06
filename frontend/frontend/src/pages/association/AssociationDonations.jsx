import { useEffect, useMemo, useState } from 'react'
import AssociationLayout from '../../components/AssociationLayout'
import { normalizarDonacionApi, normalizarLista, donacionesAsociacion, formatearSoles } from './associationData'
import { obtenerDonacionesVirtuales, obtenerDonacionesVirtualesPublicas } from '../../services/api'
import './AssociationPanel.css'

const metodoPopular = (items) => {
  if (!items.length) return 'Sin datos'
  const conteo = items.reduce((acc, item) => ({ ...acc, [item.metodoPago]: (acc[item.metodoPago] || 0) + 1 }), {})
  return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0]
}

export default function AssociationDonations() {
  const [donaciones, setDonaciones] = useState(donacionesAsociacion)
  const [campana, setCampana] = useState('Todas las campanas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      try {
        const response = await obtenerDonacionesVirtuales()
        const lista = normalizarLista(response.data).map(normalizarDonacionApi)
        if (!cancelado && lista.length) setDonaciones(lista)
      } catch {
        try {
          const response = await obtenerDonacionesVirtualesPublicas()
          const lista = normalizarLista(response.data).map(normalizarDonacionApi)
          if (!cancelado && lista.length) setDonaciones(lista)
        } catch {
          if (!cancelado) setDonaciones(donacionesAsociacion)
        }
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  const campanas = useMemo(() => ['Todas las campanas', ...new Set(donaciones.map((item) => item.campana))], [donaciones])
  const filtradas = useMemo(() => donaciones.filter((item) => (
    (campana === 'Todas las campanas' || item.campana === campana) &&
    (!desde || item.fecha >= desde) &&
    (!hasta || item.fecha <= hasta)
  )), [campana, desde, donaciones, hasta])
  const total = filtradas.reduce((acc, item) => acc + item.monto, 0)
  const donantes = new Set(filtradas.map((item) => item.donante)).size
  const promedio = filtradas.length ? total / filtradas.length : 0

  return (
    <AssociationLayout active="donations">
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Donaciones Virtuales <span className="ap-badge blue">⊙ Solo Lectura</span></h1><p>Vista de donaciones recibidas por plataforma</p></div><button className="ap-edit-button" type="button" disabled style={{ width: 120, margin: 0, opacity: .55 }}>⇩ Exportar 🔒</button></header>
        <section className="ap-kpis">
          <article className="ap-card ap-kpi green"><div><span>Total Recibido</span><strong>{formatearSoles(total, 2)}</strong><small>{filtradas.length} donaciones</small></div><b className="ap-kpi-icon">$</b></article>
          <article className="ap-card ap-kpi blue"><div><span>Donantes Unicos</span><strong>{donantes}</strong><small>personas diferentes</small></div><b className="ap-kpi-icon">♙</b></article>
          <article className="ap-card ap-kpi purple"><div><span>Promedio</span><strong>{formatearSoles(promedio, 2)}</strong><small>por donacion</small></div><b className="ap-kpi-icon">↗</b></article>
          <article className="ap-card ap-kpi orange"><div><span>Metodo Popular</span><strong>{metodoPopular(filtradas)}</strong><small>mas usado</small></div><b className="ap-kpi-icon">▭</b></article>
        </section>
        <section className="ap-card ap-filter-panel"><h2>▽ Filtros</h2><div className="ap-filter-grid"><label className="ap-field"><span>Campana</span><select value={campana} onChange={(e) => setCampana(e.target.value)}>{campanas.map((item) => <option key={item}>{item}</option>)}</select></label><label className="ap-field"><span>Desde</span><input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label><label className="ap-field"><span>Hasta</span><input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label></div></section>
        <article className="ap-card ap-section"><div className="ap-table-wrap"><table className="ap-table"><thead><tr><th>Donante</th><th>Monto</th><th>Metodo de Pago</th><th>Fecha</th><th>Campana</th><th>ID Transaccion</th></tr></thead><tbody>{filtradas.map((item) => <tr key={item.id}><td>{item.donante}</td><td className="ap-money">{formatearSoles(item.monto, 2)}</td><td>{item.metodoPago}</td><td>{item.fecha}</td><td>{item.campana}</td><td>{item.id}</td></tr>)}</tbody></table></div></article>
        <div className="ap-live"><span />Actualizacion en tiempo real activa</div>
      </section>
    </AssociationLayout>
  )
}
