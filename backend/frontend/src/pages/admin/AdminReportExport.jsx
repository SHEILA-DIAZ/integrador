import { useMemo, useRef, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { descargarReporteExcel, descargarReportePDF } from '../../services/api'
import './AdminReportExport.css'

const historialBase = [
  {
    reporte: 'Donaciones por campaña',
    campana: 'Nuevo Camión de Bomberos',
    periodo: 'Ene 2026 - Jun 2026',
    formato: 'PDF',
    exportadoPor: 'Admin Super',
    fecha: '05/06/2026',
    tamano: '245 KB',
  },
  {
    reporte: 'Actividad de usuarios',
    campana: 'Todas las campañas',
    periodo: 'May 2026',
    formato: 'EXCEL',
    exportadoPor: 'Admin Roma',
    fecha: '01/06/2026',
    tamano: '128 KB',
  },
  {
    reporte: 'Recaudación mensual',
    campana: 'Equipos de Rescate',
    periodo: 'Abr 2026 - May 2026',
    formato: 'CSV',
    exportadoPor: 'Admin Super',
    fecha: '28/05/2026',
    tamano: '64 KB',
  },
]

const estadoInicial = {
  tipo: '',
  compania: 'Todas',
  asociacion: 'Todas',
  departamento: 'Todos',
  provincia: 'Todas',
  fechaInicio: '',
  fechaFin: '',
  formato: 'PDF',
}

const opciones = {
  tipo: ['Donaciones por campaña', 'Actividad de usuarios', 'Recaudación mensual', 'Reporte global'],
  compania: ['Todas', 'Compañía Roma N°1', 'Compañía Italia N°4', 'Compañía Salvadora'],
  asociacion: ['Todas', 'Asociación Nacional de Bomberos', 'Asociación de Bomberos Voluntarios Lima'],
  departamento: ['Todos', 'Lima', 'Callao', 'Arequipa', 'Cusco', 'Piura'],
  provincia: ['Todas', 'Lima', 'Callao', 'Arequipa', 'Cusco'],
}

const obtenerRol = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || user.rol || localStorage.getItem('userRole') || ''
  } catch {
    return localStorage.getItem('userRole') || ''
  }
}

const descargarBlob = (blob, nombre) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const cargarHistorial = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem('reportExportHistory') || '[]')
    return Array.isArray(guardado) ? [...guardado, ...historialBase] : historialBase
  } catch {
    return historialBase
  }
}

const guardarHistorial = (historial) => {
  localStorage.setItem('reportExportHistory', JSON.stringify(historial.slice(0, 8)))
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

export default function AdminReportExport() {
  const [form, setForm] = useState(estadoInicial)
  const [toast, setToast] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [historial, setHistorial] = useState(cargarHistorial)
  const toastRef = useRef(null)

  const previewDisponible = Boolean(form.tipo && form.fechaInicio && form.fechaFin)
  const periodo = useMemo(() => {
    if (!form.fechaInicio || !form.fechaFin) return '-'
    return `${formatearFecha(form.fechaInicio)} - ${formatearFecha(form.fechaFin)}`
  }, [form.fechaInicio, form.fechaFin])

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo })
    window.clearTimeout(toastRef.current)
    toastRef.current = window.setTimeout(() => setToast(null), 3500)
  }

  const actualizarCampo = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
  }

  const validar = () => {
    if (!form.tipo || !form.fechaInicio || !form.fechaFin || !form.formato) {
      mostrarToast('Completa: Tipo de reporte, fecha inicio y fecha fin', 'error')
      return false
    }

    if (form.fechaFin < form.fechaInicio) {
      mostrarToast('La fecha fin no puede ser menor que la fecha inicio', 'error')
      return false
    }

    return true
  }

  const agregarHistorial = () => {
    const nuevo = {
      reporte: form.tipo,
      campana: form.compania === 'Todas' ? 'Todas las campañas' : form.compania,
      periodo,
      formato: form.formato === 'Excel' ? 'EXCEL' : form.formato,
      exportadoPor: 'Admin Super',
      fecha: new Date().toLocaleDateString('es-PE'),
      tamano: form.formato === 'PDF' ? '245 KB' : '128 KB',
    }
    const historialUsuario = [nuevo, ...historial.filter((item) => !historialBase.includes(item))]
    guardarHistorial(historialUsuario)
    setHistorial([nuevo, ...historial])
  }

  const generarReporte = async (event) => {
    event.preventDefault()
    if (!validar()) return

    const token = localStorage.getItem('token')
    if (!token) {
      mostrarToast('Debes iniciar sesión para exportar reportes', 'error')
      return
    }

    if (obtenerRol() !== 'super_admin') {
      mostrarToast('No tienes permisos de super administrador para exportar reportes', 'error')
      return
    }

    if (form.formato === 'CSV') {
      mostrarToast('Exportación CSV aún no disponible', 'warning')
      return
    }

    setGenerando(true)
    try {
      if (form.formato === 'PDF') {
        const response = await descargarReportePDF()
        descargarBlob(response.data, 'reporte-global-firesupport.pdf')
        mostrarToast('Reporte exportado en formato PDF')
      } else {
        const response = await descargarReporteExcel()
        descargarBlob(response.data, 'reporte-global-firesupport.xlsx')
        mostrarToast('Reporte exportado en formato EXCEL')
      }
      agregarHistorial()
    } catch (err) {
      if (err.response?.status === 401) {
        mostrarToast('Debes iniciar sesión para exportar reportes', 'error')
      } else if (err.response?.status === 403) {
        mostrarToast('No tienes permisos de super administrador para exportar reportes', 'error')
      } else {
        mostrarToast('No se pudo exportar el reporte', 'error')
      }
    } finally {
      setGenerando(false)
    }
  }

  return (
    <AdminLayout active="export-reports">
      <section className="are-page">
        {toast && (
          <div className={`are-toast ${toast.tipo}`} role="alert">
            <span>{toast.tipo === 'success' ? '✓' : '!'}</span>
            <p>{toast.mensaje}</p>
          </div>
        )}

        <nav className="are-breadcrumb" aria-label="Breadcrumb">
          <a href="/admin/dashboard">Dashboard</a>
          <span>›</span>
          <strong>Exportar Reportes</strong>
        </nav>

        <header className="are-heading">
          <h1>Reportes Financieros</h1>
          <p>Genera y descarga reportes personalizados de actividad y recaudación</p>
        </header>

        <div className="are-grid">
          <form className="are-card are-config" onSubmit={generarReporte} noValidate>
            <h2>Configuración del Reporte</h2>

            <label className="are-field">
              <span>Tipo de Reporte <b>*</b></span>
              <select name="tipo" value={form.tipo} onChange={actualizarCampo}>
                <option value="">Seleccionar tipo</option>
                {opciones.tipo.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            </label>

            <div className="are-two-cols">
              <label className="are-field">
                <span>▤ Compañía</span>
                <select name="compania" value={form.compania} onChange={actualizarCampo}>
                  {opciones.compania.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </label>
              <label className="are-field">
                <span>Asociación</span>
                <select name="asociacion" value={form.asociacion} onChange={actualizarCampo}>
                  {opciones.asociacion.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </label>
            </div>

            <div className="are-two-cols">
              <label className="are-field">
                <span>⊙ Departamento</span>
                <select name="departamento" value={form.departamento} onChange={actualizarCampo}>
                  {opciones.departamento.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </label>
              <label className="are-field">
                <span>Provincia</span>
                <select name="provincia" value={form.provincia} onChange={actualizarCampo}>
                  {opciones.provincia.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </label>
            </div>

            <label className="are-field">
              <span>▣ Rango de Fechas <b>*</b></span>
              <div className="are-two-cols">
                <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={actualizarCampo} />
                <input type="date" name="fechaFin" value={form.fechaFin} onChange={actualizarCampo} />
              </div>
            </label>

            <div className="are-format-group">
              <span>Formato de Exportación</span>
              <div className="are-formats">
                {[
                  ['PDF', 'Documento portable', '▧'],
                  ['Excel', 'Hoja de cálculo', '▦'],
                  ['CSV', 'Valores separados', '▤'],
                ].map(([formato, descripcion, icono]) => (
                  <button
                    className={form.formato === formato ? 'active' : ''}
                    type="button"
                    key={formato}
                    onClick={() => setForm((actual) => ({ ...actual, formato }))}
                  >
                    <i>{icono}</i>
                    <strong>{formato}</strong>
                    <small>{descripcion}</small>
                  </button>
                ))}
              </div>
            </div>

            <button className="are-submit" type="submit" disabled={generando}>
              ⇩ {generando ? 'Generando reporte...' : 'Generar Reporte'}
            </button>
          </form>

          <aside className="are-card are-preview">
            <h2>Vista Previa del Reporte</h2>
            {!previewDisponible ? (
              <div className="are-empty-preview">
                <span>▧</span>
                <strong>Sin vista previa</strong>
                <p>Selecciona tipo de reporte y rango de fechas<br />para ver la vista previa</p>
              </div>
            ) : (
              <div className="are-preview-content">
                <span className="are-preview-icon">▧</span>
                <h3>{form.tipo}</h3>
                <dl>
                  <div><dt>Formato</dt><dd>{form.formato}</dd></div>
                  <div><dt>Periodo</dt><dd>{periodo}</dd></div>
                  <div><dt>Compañía</dt><dd>{form.compania}</dd></div>
                  <div><dt>Asociación</dt><dd>{form.asociacion}</dd></div>
                  <div><dt>Departamento</dt><dd>{form.departamento}</dd></div>
                  <div><dt>Provincia</dt><dd>{form.provincia}</dd></div>
                </dl>
                <p>El backend exportará el reporte global disponible actualmente.</p>
              </div>
            )}
          </aside>
        </div>

        <section className="are-card are-history">
          <h2>Historial de Exportaciones</h2>
          <div className="are-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reporte</th>
                  <th>Campaña</th>
                  <th>Período</th>
                  <th>Formato</th>
                  <th>Exportado por</th>
                  <th>Fecha</th>
                  <th>Tamaño</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, index) => (
                  <tr key={`${item.reporte}-${item.fecha}-${index}`}>
                    <td>{item.reporte}</td>
                    <td>{item.campana}</td>
                    <td>{item.periodo}</td>
                    <td><span className={`are-badge ${item.formato.toLowerCase()}`}>{item.formato}</span></td>
                    <td>{item.exportadoPor}</td>
                    <td>{item.fecha}</td>
                    <td>{item.tamano}</td>
                    <td>
                      <button className="are-download-row" type="button" onClick={() => mostrarToast('Descarga de historial simulada')}>
                        ⇩
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AdminLayout>
  )
}
