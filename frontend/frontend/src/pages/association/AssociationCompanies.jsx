import { useState } from 'react'
import AssociationLayout from '../../components/AssociationLayout'
import { companiasAsociacion, formatearSoles } from './associationData'
import './AssociationPanel.css'

export default function AssociationCompanies() {
  const [detalle, setDetalle] = useState('')
  const totalRecaudado = companiasAsociacion.reduce((acc, item) => acc + item.recaudado, 0)
  const totalCampanas = companiasAsociacion.reduce((acc, item) => acc + item.campanas, 0)

  return (
    <AssociationLayout active="companies">
      {detalle && <div className="ap-toast" role="status">✓ Detalle preparado para {detalle}</div>}
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Companias Vinculadas</h1><p>Gestion y seguimiento de companias asociadas</p></div></header>
        <section className="ap-kpis">
          <article className="ap-card ap-kpi"><div><span>Companias Vinculadas</span><strong>{companiasAsociacion.length}</strong><small>6 activas</small></div><b className="ap-kpi-icon">▤</b></article>
          <article className="ap-card ap-kpi green"><div><span>Total Recaudado</span><strong>{formatearSoles(totalRecaudado)}</strong><small>↗ +18% este mes</small></div><b className="ap-kpi-icon">$</b></article>
          <article className="ap-card ap-kpi blue"><div><span>Campanas Totales</span><strong>{totalCampanas}</strong><small>entre todas las companias</small></div><b className="ap-kpi-icon">♡</b></article>
        </section>
        <article className="ap-card ap-section">
          <h2>Listado de Companias</h2>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr><th>Compania</th><th>Campanas</th><th>Recaudado</th><th>Avance</th><th>Estado</th><th>Vinculada desde</th><th>Accion</th></tr></thead>
              <tbody>{companiasAsociacion.map((item) => <tr key={item.id}><td>{item.nombre}</td><td><span className="ap-badge">{item.campanas}</span></td><td className="ap-money">{formatearSoles(item.recaudado)}</td><td><div className="ap-progress-cell"><div className="ap-progress"><b style={{ width: `${item.avance}%` }} /></div>{item.avance}%</div></td><td><span className={`ap-status ${item.estado === 'Pendiente' ? 'pending' : ''}`}>{item.estado}</span></td><td>{item.vinculadaDesde}</td><td><button className="ap-edit-button" style={{ width: 34, margin: 0, background: 'transparent', color: '#dc2626' }} onClick={() => setDetalle(item.nombre)} type="button">⊙</button></td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </section>
    </AssociationLayout>
  )
}
