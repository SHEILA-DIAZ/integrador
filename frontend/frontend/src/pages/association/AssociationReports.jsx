import { useEffect, useState } from 'react'
import AssociationLayout from '../../components/AssociationLayout'
import { campanasAsociacion, companiasAsociacion, donacionesAsociacion } from './associationData'
import './AssociationPanel.css'

const reportes = [
  { titulo: 'Reporte de Campanas', descripcion: 'Listado completo con metricas de todas las campanas gestionadas', registros: '57 registros', icon: '▤' },
  { titulo: 'Reporte de Companias', descripcion: 'Rendimiento y estado de cada compania vinculada a la asociacion', registros: '12 registros', icon: '▦' },
  { titulo: 'Reporte de Donaciones', descripcion: 'Historial de donaciones virtuales y en efectivo procesadas', registros: '2,847 registros', icon: '▥' },
  { titulo: 'Resumen Ejecutivo', descripcion: 'KPIs y metricas consolidadas para presentacion institucional', registros: 'Resumen', icon: '◎' },
]

const datosReporte = (titulo) => {
  if (titulo.includes('Companias')) return companiasAsociacion
  if (titulo.includes('Donaciones')) return donacionesAsociacion
  return campanasAsociacion
}

export default function AssociationReports() {
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timeout)
  }, [toast])

  const exportar = (titulo, formato) => {
    setToast(`Exportando "${titulo}" en formato ${formato}...`)
    const contenido = JSON.stringify(datosReporte(titulo), null, 2)
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${titulo.toLowerCase().replaceAll(' ', '-')}.${formato.toLowerCase() === 'xlsx' ? 'txt' : formato.toLowerCase()}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AssociationLayout active="reports">
      {toast && <div className="ap-toast">✓ {toast}</div>}
      <section className="ap-page">
        <header className="ap-heading"><div><h1>Exportar Reportes</h1><p>Descarga los datos de la asociacion en diferentes formatos</p></div></header>
        <section className="ap-report-list">
          {reportes.map((reporte) => (
            <article className="ap-card ap-report" key={reporte.titulo}>
              <div className="ap-report-left"><span className="ap-icon-box">{reporte.icon}</span><div><h2>{reporte.titulo}</h2><p>{reporte.descripcion}</p><span className="ap-badge audit">{reporte.registros}</span></div></div>
              <div className="ap-report-buttons">{['CSV', 'XLSX', 'PDF'].map((formato) => <button key={formato} type="button" onClick={() => exportar(reporte.titulo, formato)}>⇩ {formato}</button>)}</div>
            </article>
          ))}
        </section>
        <div className="ap-note">Los reportes incluyen datos actualizados al dia de hoy. Los archivos exportados estan cifrados y son de uso exclusivo de la asociacion.</div>
      </section>
    </AssociationLayout>
  )
}
