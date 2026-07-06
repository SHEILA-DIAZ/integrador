import AssociationLayout from '../../components/AssociationLayout'
import { BarChart, LineChart } from './AssociationCharts'
import { campanasPorMes, donantesPorMes, formatearSoles, meses, recaudacionMensual } from './associationData'
import './AssociationPanel.css'

export default function AssociationStatistics() {
  return (
    <AssociationLayout active="statistics">
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Estadisticas de la Asociacion</h1><p>Analisis de rendimiento global — 2026</p></div></header>
        <section className="ap-kpis">
          <article className="ap-card ap-kpi purple"><div><span>Campanas Gestionadas</span><strong>57</strong><small>↗ +18% este mes</small></div><b className="ap-kpi-icon">♡</b></article>
          <article className="ap-card ap-kpi green"><div><span>Total Recaudado</span><strong>{formatearSoles(331000)}</strong><small>↗ +24% este mes</small></div><b className="ap-kpi-icon">$</b></article>
          <article className="ap-card ap-kpi blue"><div><span>Donantes Unicos</span><strong>1,847</strong><small>↗ +31% este mes</small></div><b className="ap-kpi-icon">♙</b></article>
          <article className="ap-card ap-kpi"><div><span>Meta Global</span><strong>66%</strong><small>↗ de {formatearSoles(500000)}</small></div><b className="ap-kpi-icon">◎</b></article>
        </section>
        <section className="ap-grid-even"><article className="ap-card ap-section"><h2>Campanas por Mes</h2><p>Numero de campanas activas</p><BarChart labels={meses} values={campanasPorMes} /></article><article className="ap-card ap-section"><h2>Evolucion de Donantes</h2><p>Donantes unicos acumulados</p><LineChart values={donantesPorMes} color="blue" /></article></section>
        <article className="ap-card ap-section"><h2>Recaudacion Mensual</h2><p>Fondos recaudados por mes</p><LineChart values={recaudacionMensual} /></article>
      </section>
    </AssociationLayout>
  )
}
