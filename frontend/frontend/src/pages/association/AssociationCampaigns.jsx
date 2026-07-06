import { useEffect, useMemo, useState } from 'react'
import AssociationLayout from '../../components/AssociationLayout'
import { obtenerCampanas, obtenerCampanasPublicas } from '../../services/api'
import { campanasAsociacion, formatearSoles, normalizarCampanaApi, normalizarLista, porcentajeCampana } from './associationData'
import './AssociationPanel.css'

export default function AssociationCampaigns() {
  const [campanas, setCampanas] = useState(campanasAsociacion)
  const [compania, setCompania] = useState('Todas')
  const [estado, setEstado] = useState('Todas')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      try {
        const response = await obtenerCampanas()
        const lista = normalizarLista(response.data).map(normalizarCampanaApi)
        if (!cancelado && lista.length) setCampanas(lista)
      } catch {
        try {
          const response = await obtenerCampanasPublicas({ status: 'active' })
          const lista = normalizarLista(response.data).map(normalizarCampanaApi)
          if (!cancelado && lista.length) setCampanas(lista)
        } catch {
          if (!cancelado) setCampanas(campanasAsociacion)
        }
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timeout)
  }, [toast])

  const companias = useMemo(() => ['Todas', ...new Set(campanas.map((item) => item.compania))], [campanas])
  const filtradas = useMemo(() => campanas.filter((item) => (
    (compania === 'Todas' || item.compania === compania) &&
    (estado === 'Todas' || item.estado === estado)
  )), [campanas, compania, estado])

  return (
    <AssociationLayout active="campaigns">
      {toast && <div className="ap-toast">✓ {toast}</div>}
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Campanas de Companias Vinculadas</h1><p>Gestiona campanas de las companias asociadas</p></div></header>
        <section className="ap-card ap-filter-panel"><h2>▽ Filtros</h2><div className="ap-filter-grid" style={{ gridTemplateColumns: '1fr 1fr' }}><label className="ap-field"><span>Compania</span><select value={compania} onChange={(e) => setCompania(e.target.value)}>{companias.map((item) => <option key={item}>{item}</option>)}</select></label><label className="ap-field"><span>Estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)}><option>Todas</option><option>Activa</option><option>Cerrada</option></select></label></div></section>
        <section className="ap-campaign-grid">
          {filtradas.map((campana) => {
            const progreso = porcentajeCampana(campana)
            return (
              <article className="ap-card ap-campaign-card" key={campana.id}>
                <div className="ap-campaign-head"><h2>{campana.titulo}</h2><span className="ap-status">{campana.estado}</span></div>
                <p>{campana.compania}</p>
                <span className="ap-tag">{campana.categoria}</span>
                <div className="ap-campaign-money"><strong>{formatearSoles(campana.recaudado)}</strong><span>{progreso}%</span></div>
                <div className="ap-progress" style={{ width: '100%', marginTop: 8 }}><b style={{ width: `${progreso}%`, background: '#2563eb' }} /></div>
                <p>Meta: {formatearSoles(campana.meta)}</p>
                <button className="ap-edit-button" type="button" onClick={() => setToast(`Edicion visual preparada para ${campana.titulo}.`)}>✎ Editar Campana</button>
              </article>
            )
          })}
        </section>
      </section>
    </AssociationLayout>
  )
}
