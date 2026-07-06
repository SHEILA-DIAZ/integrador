import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AssociationLayout from '../../components/AssociationLayout'
import { BarChart, LineChart } from './AssociationCharts'
import {
  campanasAsociacion,
  companiasAsociacion,
  donacionesAsociacion,
  formatearSoles,
  porcentajeCampana,
  recaudacionMensual,
} from './associationData'
import './AssociationPanel.css'

export default function AssociationDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('general')
  const totalRecaudado = companiasAsociacion.reduce((acc, item) => acc + item.recaudado, 0)
  const donacionesProcesadas = 2847
  const fecha = new Date().toLocaleDateString('es-PE')
  const mejores = useMemo(() => [...campanasAsociacion].sort((a, b) => b.recaudado - a.recaudado).slice(0, 4), [])

  const acciones = [
    ['▤', 'Ver Companias', '/association/companies'],
    ['▣', 'Revisar Campana', '/association/campaigns'],
    ['▱', 'Monitor Progreso', '/association/statistics'],
    ['⇩', 'Exportar Datos', '/association/reports'],
    ['▥', 'Estadisticas', '/association/statistics'],
    ['♙', 'Gestionar Asoc.', '/association/companies', true],
  ]

  return (
    <AssociationLayout active="dashboard">
      <section className="ap-page">
        <header className="ap-card ap-hero">
          <div className="ap-hero-left">
            <span className="ap-hero-icon">▤</span>
            <div>
              <h1>Dashboard de Asociacion</h1>
              <p>Asociacion Nacional de Bomberos del Peru</p>
            </div>
          </div>
          <div className="ap-hero-meta"><span className="ap-badge">Sistema Activo</span><span>Actualizado: {fecha}</span></div>
        </header>

        <section className="ap-kpis">
          <article className="ap-card ap-kpi purple"><div><span>Campanas Gestionadas</span><strong>57</strong><small>↗ +18% este mes</small></div><b className="ap-kpi-icon">♡</b></article>
          <article className="ap-card ap-kpi green"><div><span>Total Recaudado</span><strong>{formatearSoles(totalRecaudado)}</strong><small>↗ +24% este mes</small></div><b className="ap-kpi-icon">$</b></article>
          <article className="ap-card ap-kpi"><div><span>Companias Vinculadas</span><strong>12</strong><small>↗ +16% este mes</small></div><b className="ap-kpi-icon">▤</b></article>
          <article className="ap-card ap-kpi orange"><div><span>Donaciones Procesadas</span><strong>{donacionesProcesadas}</strong><small>↗ +21% este mes</small></div><b className="ap-kpi-icon">◎</b></article>
        </section>

        <section className="ap-grid-2">
          <article className="ap-card ap-section">
            <div className="ap-heading"><div><h2>Progreso Mensual de Recaudacion</h2><p>Evolucion acumulada vs meta anual</p></div><span className="ap-badge">↗ Meta superada</span></div>
            <LineChart values={recaudacionMensual} />
          </article>
          <article className="ap-card ap-section">
            <h2>Resumen de Donaciones</h2>
            <p>Junio 2026</p>
            <div className="ap-summary-list">
              <div className="ap-summary-row blue"><span>💻 Donaciones Virtuales</span><strong>{formatearSoles(248500)}</strong></div>
              <div className="ap-summary-row green"><span>💵 Ingresos en Efectivo</span><strong>{formatearSoles(82500)}</strong></div>
              <div className="ap-summary-row red"><span>🎯 Total del Mes</span><strong>{formatearSoles(331000)}</strong></div>
            </div>
            <div className="ap-divider" />
            <div className="ap-mini-lines">
              <p><span>Donantes unicos</span><b>1,847</b></p>
              <p><span>Ticket promedio</span><b>{formatearSoles(179)}</b></p>
              <small>↗ +24% respecto al mes anterior</small>
            </div>
          </article>
        </section>

        <div className="ap-tabs">
          <button className={tab === 'general' ? 'active' : ''} onClick={() => setTab('general')} type="button">Vista General</button>
          <button className={tab === 'performance' ? 'active' : ''} onClick={() => setTab('performance')} type="button">Rendimiento de Companias</button>
        </div>

        {tab === 'general' ? (
          <>
            <section className="ap-grid-even">
              <article className="ap-card ap-section"><h2>Recaudacion Acumulada</h2><p>Evolucion acumulada de fondos recaudados</p><LineChart values={recaudacionMensual} /></article>
              <article className="ap-card ap-section"><h2>Campanas por Compania</h2><p>Distribucion de campanas activas</p><BarChart labels={companiasAsociacion.slice(0, 6).map((item) => item.nombre.replace('Compania ', ''))} values={companiasAsociacion.slice(0, 6).map((item) => item.campanas)} /></article>
            </section>
            <article className="ap-card ap-section">
              <div className="ap-heading"><div><h2>Campanas con Mejor Rendimiento</h2><p>Top campanas por recaudacion y engagement</p></div><button className="ap-edit-button" style={{ width: 92, margin: 0, background: 'transparent', color: '#dc2626' }} type="button" onClick={() => navigate('/association/campaigns')}>Ver todas ↗</button></div>
              <div className="ap-table-wrap"><table className="ap-table"><thead><tr><th>Campana</th><th>Compania</th><th>Recaudado</th><th>Meta</th><th>Progreso</th><th>Donantes</th></tr></thead><tbody>{mejores.map((campana) => <tr key={campana.id}><td>{campana.titulo}</td><td>{campana.compania}</td><td className="ap-money">{formatearSoles(campana.recaudado)}</td><td>{formatearSoles(campana.meta)}</td><td><div className="ap-progress-cell"><div className="ap-progress"><b style={{ width: `${porcentajeCampana(campana)}%` }} /></div>{porcentajeCampana(campana)}%</div></td><td>{campana.donantes}</td></tr>)}</tbody></table></div>
            </article>
            <section className="ap-grid-even">
              <article className="ap-card ap-section"><h2>Ultimas Actividades</h2><p>Acciones recientes del sistema</p><div className="ap-activity-list">{['Campana aprobada', 'Donacion procesada', 'Meta alcanzada', 'Nueva compania vinculada', 'Campana creada'].map((item, index) => <div className="ap-activity" key={item}><i /><div><strong>{item}</strong><br /><small>Hace {index + 1} hora</small></div></div>)}</div></article>
              <article className="ap-card ap-section"><h2>Alertas y Seguimiento</h2><p>Notificaciones importantes</p><div className="ap-alerts"><div className="ap-alert">3 campanas cerca de vencer sin alcanzar meta<br /><small>Prioridad: alta</small></div><div className="ap-alert blue">Nueva compania pendiente de vinculacion<br /><small>Prioridad: media</small></div><div className="ap-alert green">5 campanas alcanzaron su meta este mes<br /><small>Prioridad: baja</small></div></div></article>
            </section>
          </>
        ) : (
          <article className="ap-card ap-section">
            <div className="ap-heading"><div><h2>Rendimiento de Companias Vinculadas</h2><p>Metricas de desempeno por compania</p></div><button className="ap-edit-button" style={{ width: 92, margin: 0, background: 'transparent', color: '#dc2626' }} type="button" onClick={() => navigate('/association/companies')}>Ver detalle ↗</button></div>
            <div className="ap-table-wrap"><table className="ap-table"><thead><tr><th>Compania</th><th>Campanas</th><th>Recaudado</th><th>Avance</th><th>Estado</th><th>Accion</th></tr></thead><tbody>{companiasAsociacion.slice(0, 5).map((item) => <tr key={item.id}><td>{item.nombre}</td><td><span className="ap-badge">{item.campanas}</span></td><td className="ap-money">{formatearSoles(item.recaudado)}</td><td><div className="ap-progress-cell"><div className="ap-progress"><b style={{ width: `${item.avance}%` }} /></div>{item.avance}%</div></td><td><span className={`ap-status ${item.estado === 'Pendiente' ? 'pending' : ''}`}>{item.estado}</span></td><td>⊙</td></tr>)}</tbody></table></div>
          </article>
        )}

        <section className="ap-actions">
          {acciones.map(([icon, label, href, primary]) => <button className={`ap-action ${primary ? 'primary' : ''}`} key={label} type="button" onClick={() => navigate(href)}><span>{icon}</span>{label}</button>)}
        </section>
      </section>
    </AssociationLayout>
  )
}
