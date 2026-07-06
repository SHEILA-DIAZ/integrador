import { useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { generarCampaniaIA, obtenerMensajeApi } from '../../services/api'
import './AdminAICampaignGenerator.css'

const estadoInicial = {
  objetivo: '',
  meta: '',
  ubicacion: '',
  publico: '',
}

const camposRequeridos = [
  ['objetivo', 'Objetivo'],
  ['meta', 'Meta económica'],
  ['ubicacion', 'Ubicación'],
  ['publico', 'Público objetivo'],
]

const colorSeguro = (color, fallback) => {
  if (!color || typeof color !== 'string') return fallback
  return color.startsWith('#') || color.startsWith('rgb') || /^[a-zA-Z]+$/.test(color) ? color : fallback
}

export default function AdminAICampaignGenerator() {
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState('')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  const camposCompletos = useMemo(
    () => camposRequeridos.every(([campo]) => String(form[campo] || '').trim()),
    [form],
  )

  const colores = resultado?.colores_sugeridos || {}
  const flyerStyles = {
    '--flyer-primary': colorSeguro(colores.principal, '#dc2626'),
    '--flyer-secondary': colorSeguro(colores.secundario, '#111827'),
    '--flyer-bg': colorSeguro(colores.fondo, '#fff7f7'),
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: name === 'meta' ? value.replace(/[^\d.]/g, '') : value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
    if (toast) setToast('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const faltantes = camposRequeridos.filter(([campo]) => !String(form[campo] || '').trim())

    if (faltantes.length > 0) {
      const nuevosErrores = faltantes.reduce((acc, [campo]) => ({ ...acc, [campo]: true }), {})
      setErrores(nuevosErrores)
      setToast(`Completa los campos requeridos: ${faltantes.map(([, label]) => label).join(', ').replace(/, ([^,]*)$/, ' y $1')}`)
      setResultado(null)
      return
    }

    setLoading(true)
    setToast('')
    try {
      const response = await generarCampaniaIA({
        objetivo: form.objetivo.trim(),
        meta: Number(form.meta),
        ubicacion: form.ubicacion.trim(),
        publico: form.publico.trim(),
      })
      setResultado(response.data?.data || null)
    } catch (err) {
      setResultado(null)
      setToast(obtenerMensajeApi(err, 'No se pudo generar la campaña con Gemini IA.'))
    } finally {
      setLoading(false)
    }
  }

  const payloadCreacion = resultado ? {
    titulo: resultado.titulo || '',
    descripcion: resultado.descripcion || '',
    meta_monto: Number(form.meta || 0),
    categoria: 'otros',
    imagen_url: '',
  } : null

  const prepararCreacion = () => {
    if (!payloadCreacion) return
    localStorage.setItem('aiCampaignDraft', JSON.stringify(payloadCreacion))
    setToast('Contenido generado listo para crear campaña.')
  }

  return (
    <AdminLayout active="ai-generator">
      <section className="aig-page" aria-labelledby="aig-title">
        {toast && (
          <div className={`aig-toast ${resultado ? 'success' : ''}`} role="alert">
            <span>{resultado ? '✓' : '!'}</span>
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
            <p>Genera campañas de recaudación optimizadas usando Gemini IA</p>
          </div>
        </header>

        <div className="aig-grid">
          <form className="aig-card aig-form-card" onSubmit={handleSubmit} noValidate>
            <h2><span>◎</span> Configuración de Campaña</h2>

            <label className="aig-field">
              <span>Objetivo <b>*</b></span>
              <input className={errores.objetivo ? 'error' : ''} name="objetivo" value={form.objetivo} onChange={handleChange} placeholder="Ej: comprar uniformes de protección" />
            </label>

            <label className="aig-field">
              <span>Meta económica (S/.) <b>*</b></span>
              <div className={`aig-money ${errores.meta ? 'error' : ''}`}>
                <span>S/.</span>
                <input name="meta" inputMode="numeric" value={form.meta} onChange={handleChange} placeholder="15000" />
              </div>
            </label>

            <label className="aig-field">
              <span>Ubicación <b>*</b></span>
              <input className={errores.ubicacion ? 'error' : ''} name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Lima" />
            </label>

            <label className="aig-field">
              <span>Público objetivo <b>*</b></span>
              <input className={errores.publico ? 'error' : ''} name="publico" value={form.publico} onChange={handleChange} placeholder="Ej: vecinos y empresas locales" />
            </label>

            <button className="aig-submit" type="submit" disabled={loading}>
              <span>✦</span> {loading ? 'Generando con Gemini...' : 'Generar con IA'}
            </button>
          </form>

          <aside className="aig-card aig-preview-card">
            {!resultado ? (
              <div className="aig-empty">
                <span className="aig-empty-icon">✦</span>
                <h2>Listo para generar</h2>
                <p>Completa el formulario con los datos de<br />tu campaña y haz clic en "Generar con IA"</p>
                <div className="aig-chips">
                  {['Gemini IA', 'Título sugerido', 'Flyer', 'Recomendaciones'].map((chip) => <span key={chip}>{chip}</span>)}
                </div>
              </div>
            ) : (
              <div className="aig-result aig-result-full">
                <span className="aig-gemini-badge">Generado por Gemini IA</span>
                <h2>{resultado.titulo}</h2>
                <p>{resultado.descripcion}</p>

                <section>
                  <strong>Palabras clave</strong>
                  <div className="aig-keywords">
                    {(resultado.palabras_clave || []).map((palabra) => <span key={palabra}>{palabra}</span>)}
                  </div>
                </section>

                <section>
                  <strong>Texto para flyer</strong>
                  <p>{resultado.texto_flyer}</p>
                </section>

                <section>
                  <strong>Recomendaciones</strong>
                  <ul>
                    {(resultado.recomendaciones || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>

                <section>
                  <strong>Colores sugeridos</strong>
                  <div className="aig-swatches">
                    {['principal', 'secundario', 'fondo'].map((clave) => (
                      <span key={clave}><i style={{ background: colorSeguro(colores[clave], '#e5e7eb') }} />{clave}: {colores[clave] || '-'}</span>
                    ))}
                  </div>
                </section>

                <article className="aig-flyer" style={flyerStyles}>
                  <span>FireSupport IA</span>
                  <h3>{resultado.titulo}</h3>
                  <p>{resultado.texto_flyer || resultado.descripcion}</p>
                </article>

                <button className="aig-create" type="button" onClick={prepararCreacion}>
                  Crear campaña
                </button>
              </div>
            )}
            <span className={`aig-status ${camposCompletos ? 'ready' : ''}`} aria-hidden="true" />
          </aside>
        </div>
      </section>
    </AdminLayout>
  )
}
