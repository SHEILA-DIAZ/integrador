import { useMemo, useState } from 'react'
import CompanyAdminLayout from '../../components/CompanyAdminLayout'
import { generarCampaniaIA, obtenerMensajeApi } from '../../services/api'
import '../admin/AdminAICampaignGenerator.css'

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

const badges = ['Título optimizado', 'Descripción SEO', 'Hashtags', 'Estrategia', 'Alcance esperado']

export default function CompanyAICampaignGenerator() {
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  const listo = useMemo(
    () => form.meta.trim() && form.objetivo.trim() && form.departamento.trim() && form.tipo.trim(),
    [form],
  )

  const mostrarToast = (texto, tipo = 'error') => {
    setToast({ texto, tipo })
    window.setTimeout(() => setToast(null), 3600)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: name === 'meta' ? value.replace(/[^\d.]/g, '') : value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: false }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const faltan = {
      meta: !form.meta.trim(),
      objetivo: !form.objetivo.trim(),
      departamento: !form.departamento.trim(),
      tipo: !form.tipo.trim(),
    }

    if (Object.values(faltan).some(Boolean)) {
      setErrores(faltan)
      setResultado(null)
      mostrarToast('Completa los campos requeridos: Meta, Objetivo Económico, Departamento y Tipo')
      return
    }

    setLoading(true)
    setToast(null)
    try {
      const response = await generarCampaniaIA({
        objetivo: form.objetivo,
        meta: Number(form.meta),
        ubicacion: [form.distrito, form.provincia, form.departamento].filter(Boolean).join(', '),
        publico: form.publico || 'Ciudadanos y empresas locales',
        tipo: form.tipo,
        prioridad: form.prioridad,
        duracion: form.duracion,
      })
      setResultado(response.data?.data || response.data || null)
      mostrarToast('Campaña generada correctamente.', 'success')
    } catch (err) {
      setResultado(null)
      mostrarToast(obtenerMensajeApi(err, 'No se pudo generar la campaña. Intenta nuevamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CompanyAdminLayout active="ai-generator">
      <section className="aig-page" aria-labelledby="aig-title">
        {toast && (
          <div className={`aig-toast ${toast.tipo === 'success' ? 'success' : ''}`} role="alert">
            <span>{toast.tipo === 'success' ? '✓' : '!'}</span>
            <p>{toast.texto}</p>
          </div>
        )}

        <nav className="aig-breadcrumb" aria-label="Breadcrumb">
          <a href="/company/dashboard">Dashboard</a>
          <span>›</span>
          <a href="/admin/campaigns">Campañas</a>
          <span>›</span>
          <strong>Generador IA</strong>
        </nav>

        <header className="aig-heading">
          <span className="aig-heading-icon">✧</span>
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
                <option>Recaudación para equipamiento</option>
                <option>Infraestructura de compañía</option>
                <option>Capacitación operativa</option>
                <option>Apoyo comunitario</option>
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
                  <option>Lima</option>
                  <option>Arequipa</option>
                  <option>Cusco</option>
                  <option>La Libertad</option>
                </select>
              </label>
              <label className="aig-field">
                <span>Provincia</span>
                <select name="provincia" value={form.provincia} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  <option>Lima</option>
                  <option>Callao</option>
                  <option>Arequipa</option>
                  <option>Cusco</option>
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
                <option value="equipamiento">Equipamiento</option>
                <option value="ambulancia">Ambulancia</option>
                <option value="infraestructura">Infraestructura</option>
                <option value="capacitacion">Capacitación</option>
                <option value="otros">Otros</option>
              </select>
            </label>

            <div className="aig-two-cols">
              <label className="aig-field">
                <span>Prioridad</span>
                <select name="prioridad" value={form.prioridad} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </label>
              <label className="aig-field">
                <span>Duración</span>
                <select name="duracion" value={form.duracion} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  <option>30 días</option>
                  <option>60 días</option>
                  <option>90 días</option>
                </select>
              </label>
            </div>

            <label className="aig-field">
              <span>Público Objetivo</span>
              <input name="publico" value={form.publico} onChange={handleChange} placeholder="Ej: Empresas locales, ciudadanos 25-50 años" />
            </label>

            <button className="aig-submit" type="submit" disabled={loading}>
              <span>✧</span> {loading ? 'Generando...' : 'Generar con IA'}
            </button>
          </form>

          <aside className="aig-card aig-preview-card">
            {!resultado ? (
              <div className="aig-empty">
                <span className="aig-empty-icon">✧</span>
                <h2>Listo para generar</h2>
                <p>Completa el formulario con los datos de<br />tu campaña y haz clic en "Generar con IA"</p>
                <div className="aig-chips">
                  {badges.map((badge) => <span key={badge}>{badge}</span>)}
                </div>
              </div>
            ) : (
              <div className="aig-result aig-result-full">
                <span className="aig-gemini-badge">Generado con IA</span>
                <h2>{resultado.titulo || 'Campaña optimizada'}</h2>
                <p>{resultado.descripcion || 'Descripción generada para la campaña.'}</p>
                <section>
                  <strong>Estrategia</strong>
                  <p>{resultado.estrategia || resultado.texto_flyer || 'Difusión digital, alianzas locales y seguimiento semanal.'}</p>
                </section>
                <section>
                  <strong>Hashtags</strong>
                  <div className="aig-keywords">
                    {(resultado.hashtags || resultado.palabras_clave || ['FireSupport', 'Bomberos', 'Solidaridad']).map((tag) => <span key={tag}>{String(tag).startsWith('#') ? tag : `#${tag}`}</span>)}
                  </div>
                </section>
              </div>
            )}
            <span className={`aig-status ${listo ? 'ready' : ''}`} aria-hidden="true" />
          </aside>
        </div>
      </section>
    </CompanyAdminLayout>
  )
}
