import { useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import './AdminAICampaignGenerator.css'

const estadoInicial = {
  objetivo: '',
  meta: '',
  departamento: '',
  provincia: '',
  distrito: '',
  tipo: '',
  prioridad: '',
  duracion: '',
  publico: '',
}

const objetivos = ['Recaudar fondos para equipamiento', 'Modernizar infraestructura', 'Atender una emergencia', 'Capacitar brigadas']
const departamentos = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura']
const provincias = ['Lima', 'Callao', 'Arequipa', 'Cusco', 'Trujillo']
const tipos = ['Equipamiento', 'Infraestructura', 'Emergencia', 'Capacitación']
const prioridades = ['Alta', 'Media', 'Baja']
const duraciones = ['15 días', '30 días', '45 días', '60 días']
const chips = ['Título optimizado', 'Descripción SEO', 'Hashtags', 'Estrategia', 'Alcance esperado']

const camposRequeridos = [
  ['objetivo', 'Meta'],
  ['meta', 'Objetivo Económico'],
  ['departamento', 'Departamento'],
  ['tipo', 'Tipo'],
]

export default function AdminAICampaignGenerator() {
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState('')
  const [resultado, setResultado] = useState(null)

  const camposCompletos = useMemo(
    () => camposRequeridos.every(([campo]) => String(form[campo] || '').trim()),
    [form],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
    if (toast) setToast('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const faltantes = camposRequeridos.filter(([campo]) => !String(form[campo] || '').trim())

    if (faltantes.length > 0) {
      const nuevosErrores = faltantes.reduce((acc, [campo]) => ({ ...acc, [campo]: true }), {})
      setErrores(nuevosErrores)
      setToast(`Completa los campos requeridos: ${faltantes.map(([, label]) => label).join(', ').replace(/, ([^,]*)$/, ' y $1')}`)
      setResultado(null)
      return
    }

    setToast('')
    setResultado({
      titulo: `${form.tipo} para ${form.departamento}`,
      descripcion: `Campaña de ${form.objetivo.toLowerCase()} con meta de S/. ${Number(form.meta).toLocaleString('es-PE')}.`,
      estrategia: form.publico || 'Ciudadanos solidarios y empresas locales',
    })
  }

  return (
    <AdminLayout active="ai-generator">
      <section className="aig-page" aria-labelledby="aig-title">
        {toast && (
          <div className="aig-toast" role="alert">
            <span>!</span>
            <p>{toast}</p>
          </div>
        )}

        <nav className="aig-breadcrumb" aria-label="Breadcrumb">
          <a href="/admin/dashboard">Dashboard</a>
          <span>›</span>
          <a href="/admin/campaigns">Campañas</a>
          <span>›</span>
          <strong>Generador IA</strong>
        </nav>

        <header className="aig-heading">
          <span className="aig-heading-icon">✦</span>
          <div>
            <h1 id="aig-title">Generador de Campañas con IA</h1>
            <p>Genera campañas de recaudación optimizadas usando inteligencia artificial</p>
          </div>
        </header>

        <div className="aig-grid">
          <form className="aig-card aig-form-card" onSubmit={handleSubmit} noValidate>
            <h2><span>◎</span> Configuración de Campaña</h2>

            <label className="aig-field">
              <span>Objetivo de Campaña <b>*</b></span>
              <select className={errores.objetivo ? 'error' : ''} name="objetivo" value={form.objetivo} onChange={handleChange}>
                <option value="">Seleccionar objetivo</option>
                {objetivos.map((objetivo) => <option key={objetivo} value={objetivo}>{objetivo}</option>)}
              </select>
            </label>

            <label className="aig-field">
              <span>Objetivo Económico (S/.) <b>*</b></span>
              <div className={`aig-money ${errores.meta ? 'error' : ''}`}>
                <span>S/.</span>
                <input name="meta" inputMode="numeric" value={form.meta} onChange={handleChange} placeholder="50,000" />
              </div>
            </label>

            <div className="aig-two-cols">
              <label className="aig-field">
                <span>Departamento <b>*</b></span>
                <select className={errores.departamento ? 'error' : ''} name="departamento" value={form.departamento} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {departamentos.map((departamento) => <option key={departamento} value={departamento}>{departamento}</option>)}
                </select>
              </label>

              <label className="aig-field">
                <span>Provincia</span>
                <select name="provincia" value={form.provincia} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {provincias.map((provincia) => <option key={provincia} value={provincia}>{provincia}</option>)}
                </select>
              </label>
            </div>

            <label className="aig-field">
              <span>Distrito</span>
              <input name="distrito" value={form.distrito} onChange={handleChange} placeholder="Ej: Miraflores" />
            </label>

            <label className="aig-field">
              <span>Tipo de Campaña <b>*</b></span>
              <select className={errores.tipo ? 'error' : ''} name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="">Seleccionar tipo</option>
                {tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </label>

            <div className="aig-two-cols">
              <label className="aig-field">
                <span>Prioridad</span>
                <select name="prioridad" value={form.prioridad} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {prioridades.map((prioridad) => <option key={prioridad} value={prioridad}>{prioridad}</option>)}
                </select>
              </label>

              <label className="aig-field">
                <span>Duración</span>
                <select name="duracion" value={form.duracion} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {duraciones.map((duracion) => <option key={duracion} value={duracion}>{duracion}</option>)}
                </select>
              </label>
            </div>

            <label className="aig-field">
              <span>Público Objetivo</span>
              <input name="publico" value={form.publico} onChange={handleChange} placeholder="Ej: Empresas locales, ciudadanos 25-50 años" />
            </label>

            <button className="aig-submit" type="submit">
              <span>✦</span> Generar con IA
            </button>
          </form>

          <aside className="aig-card aig-preview-card">
            {!resultado ? (
              <div className="aig-empty">
                <span className="aig-empty-icon">✦</span>
                <h2>Listo para generar</h2>
                <p>Completa el formulario con los datos de<br />tu campaña y haz clic en "Generar con IA"</p>
                <div className="aig-chips">
                  {chips.map((chip) => <span key={chip}>{chip}</span>)}
                </div>
              </div>
            ) : (
              <div className="aig-result">
                <span className="aig-empty-icon">✦</span>
                <h2>{resultado.titulo}</h2>
                <p>{resultado.descripcion}</p>
                <div>
                  <strong>Estrategia recomendada</strong>
                  <span>{resultado.estrategia}</span>
                </div>
              </div>
            )}
            <span className={`aig-status ${camposCompletos ? 'ready' : ''}`} aria-hidden="true" />
          </aside>
        </div>
      </section>
    </AdminLayout>
  )
}
