import AssociationLayout from '../../components/AssociationLayout'
import { BarChart, LineChart } from './AssociationCharts'
import { efectivoAsociacion, formatearSoles } from './associationData'
import './AssociationPanel.css'

export default function AssociationCashIncome() {
  const total = efectivoAsociacion.reduce((acc, item) => acc + item.monto, 0)
  const mensual = [12500, 14900, 11200, 16300, 15800, 18100]
  const virtual = [38000, 44000, 36000, 51000, 49000, 58000]

  return (
    <AssociationLayout active="cash-income">
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Analisis Financiero — Ingresos en Efectivo <span className="ap-badge blue">Solo lectura</span></h1><p>Transparencia y seguimiento de donaciones en efectivo</p></div><span className="ap-note">ⓘ Vista de solo lectura. Para registrar ingresos, contacta al administrador.</span></header>
        <section className="ap-kpis">
          <article className="ap-card ap-kpi green"><div><span>Total Ingresos Efectivo</span><strong>{formatearSoles(13300)}</strong><small>↗ +16% vs mes anterior</small></div><b className="ap-kpi-icon">$</b></article>
          <article className="ap-card ap-kpi blue"><div><span>Promedio Mensual</span><strong>{formatearSoles(14667)}</strong><small>ultimos 6 meses</small></div><b className="ap-kpi-icon">▥</b></article>
          <article className="ap-card ap-kpi purple"><div><span>Participacion vs Virtual</span><strong>25%</strong><small>del total recaudado</small></div><b className="ap-kpi-icon">↗</b></article>
          <article className="ap-card ap-kpi orange"><div><span>Campana Principal</span><strong>Nuevo Camion de Bomberos</strong><small>mayor recaudacion efectivo</small></div><b className="ap-kpi-icon">◷</b></article>
        </section>
        <section className="ap-grid-even"><article className="ap-card ap-section"><h2>Evolucion Mensual</h2><p>Tendencia de ingresos en efectivo</p><LineChart values={mensual} color="blue" /></article><article className="ap-card ap-section"><h2>Efectivo vs Donaciones Virtuales</h2><p>Comparativa de metodos de recaudacion</p><BarChart labels={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']} values={virtual} color="#2563eb" /></article></section>
        <article className="ap-card ap-section"><h2>Distribucion por Campana</h2><p>Ingresos en efectivo asignados a cada campana</p><BarChart labels={['Camion Bomberos', 'Equipos Rescate', 'Capacitacion', 'Otros']} values={[45000, 32000, 23000, 15000]} color="#16a34a" /></article>
        <section className="ap-info-grid"><article className="ap-info green"><h3>$ Estadisticas de Transparencia</h3><p><span>Transacciones registradas</span><b>{efectivoAsociacion.length}</b></p><p><span>Ticket promedio</span><b>{formatearSoles(total / efectivoAsociacion.length)}</b></p><p><span>Fuentes distintas</span><b>4</b></p></article><article className="ap-info blue"><h3>▣ Periodo de Analisis</h3><p><span>Inicio periodo</span><b>Ene 2026</b></p><p><span>Mes actual</span><b>Jun 2026</b></p><p><span>Meses analizados</span><b>6</b></p></article><article className="ap-info purple"><h3>↗ Tendencia</h3><p><span>Crecimiento sem.</span><b>+16%</b></p><p><span>Proyeccion anual</span><b>{formatearSoles(176004)}</b></p><p><span>Estado</span><b>↑ En alza</b></p></article></section>
        <article className="ap-card ap-section"><div className="ap-heading"><div><h2>Registro de Transacciones</h2><p>Historial auditado de ingresos en efectivo</p></div><span className="ap-badge audit">Registro auditado</span></div><div className="ap-table-wrap"><table className="ap-table"><thead><tr><th>Monto</th><th>Origen</th><th>Fecha</th><th>Campana</th><th>Registrado por</th></tr></thead><tbody>{efectivoAsociacion.map((item) => <tr key={`${item.origen}-${item.fecha}`}><td className="ap-money">{formatearSoles(item.monto)}</td><td>{item.origen}</td><td>{item.fecha}</td><td>{item.campana}</td><td>Admin User</td></tr>)}</tbody></table></div></article>
      </section>
    </AssociationLayout>
  )
}
