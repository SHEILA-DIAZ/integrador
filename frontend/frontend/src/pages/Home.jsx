import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import { obtenerCampanasPublicas, obtenerProgresoCampanaPublico } from '../services/api'
import './Home.css'

const HERO_IMAGE =
  'https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JZPBMNAFRFCHTFRNQU5PWF47SQ.jpg'
const FALLBACK_IMAGE =
  'https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JZPBMNAFRFCHTFRNQU5PWF47SQ.jpg'
const CTA_IMAGE =
  'https://www.infobae.com/resizer/v2/UCTRR6A5CJFQHFPVNUSN72JGZ4.jpg?auth=c987c5bc9c254ae931447c61a6e6a306449eecaf306ab1c8d4ec29d4927edb6a&height=720&quality=85&smart=true&width=1080'

const beneficios = [
  {
    icono: 'shield',
    titulo: 'Transparencia Total',
    descripcion: 'Seguimiento en tiempo real de todas las donaciones y el impacto generado en cada campaña.',
  },
  {
    icono: 'bolt',
    titulo: 'Respuesta Rápida',
    descripcion: 'Apoyo inmediato en emergencias y situaciones críticas para las compañías de bomberos.',
  },
  {
    icono: 'trend',
    titulo: 'Impacto Medible',
    descripcion: 'Datos y estadísticas claras sobre cómo tus donaciones están marcando la diferencia.',
  },
]

const metricas = [
  { valor: '+150', etiqueta: 'Compañías Registradas' },
  { valor: '+5,000', etiqueta: 'Donantes Activos' },
  { valor: '+S/ 2M', etiqueta: 'Fondos Recaudados' },
  { valor: '+200', etiqueta: 'Campañas Activas' },
]

const normalizarCampanas = (data) => {
  const lista =
    data?.campanas ||
    data?.campaigns ||
    data?.data?.campanas ||
    data?.data?.campaigns ||
    data?.data ||
    data?.items ||
    data

  return Array.isArray(lista) ? lista : []
}

const obtenerId = (campana) => campana.id || campana.campana_id || campana.campaign_id
const obtenerTitulo = (campana) => campana.titulo || campana.nombre || campana.title || 'Campaña activa'
const obtenerDescripcion = (campana) =>
  campana.descripcion || campana.description || 'Campaña activa de apoyo a bomberos voluntarios.'
const obtenerCategoria = (campana) => campana.categoria || campana.category || 'Equipamiento'
const obtenerCompania = (campana) =>
  campana.compania || campana.nombre_compania || campana.company_name || campana.company || 'Compañía de Bomberos'
const obtenerRecaudado = (campana) => Number(campana.monto_recaudado || campana.recaudado || campana.raised || 0)
const obtenerMeta = (campana) => Number(campana.meta_monto || campana.monto_meta || campana.goal || 1)
const obtenerImagen = (campana) => campana.imagen_url || campana.image_url || campana.imagen || FALLBACK_IMAGE

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Number(monto || 0))

const recortar = (texto, limite = 118) => {
  const limpio = String(texto || '').trim()
  return limpio.length > limite ? `${limpio.slice(0, limite).trim()}...` : limpio
}

const calcularPorcentaje = (recaudado, meta) => {
  if (!meta || meta <= 0) return 0
  return Math.min(Math.round((recaudado / meta) * 100), 100)
}

const calcularProgreso = (campana) => calcularPorcentaje(obtenerRecaudado(campana), obtenerMeta(campana))

const elegirCampanaProgreso = (campanas) =>
  [...campanas].sort((a, b) => obtenerRecaudado(b) - obtenerRecaudado(a))[0] || campanas[0]

const haySesion = () =>
  Boolean(localStorage.getItem('token') || localStorage.getItem('user') || localStorage.getItem('userRole'))

const obtenerPorcentajeOficial = (progreso) =>
  Number(progreso?.porcentaje ?? progreso?.modelo_3d?.porcentaje ?? 0)

const obtenerEstadoVisual = (progreso) =>
  progreso?.estado_visual || progreso?.modelo_3d?.estado || 'En progreso'

const obtenerDescripcionVisual = (progreso) =>
  progreso?.descripcion_visual || progreso?.description_visual || progreso?.analisis || obtenerEstadoVisual(progreso)

const obtenerPartesColoreadas = (progreso) => {
  const partes = progreso?.partes_coloreadas || progreso?.modelo_3d?.partes_coloreadas
  if (Array.isArray(partes)) return partes.join(', ')
  return partes || '—'
}

const iconPaths = {
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.4a1.4 1.4 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  trend: (
    <>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  flame: <path d="M8.5 14.5A4.5 4.5 0 0 0 13 19a4.5 4.5 0 0 0 4.5-4.5c0-2.7-1.7-4.4-3.5-6.2-.9-.9-1.7-2-2-3.3-.2 2.4-1.5 3.8-2.7 5.1-1 1.1-1.8 2.2-1.8 4.4Z" />,
  activity: <path d="M22 12h-4l-3 8L9 4l-3 8H2" />,
  medal: (
    <>
      <path d="M7 2h10l-3 6H10z" />
      <circle cx="12" cy="15" r="5" />
      <path d="m10.5 15 1 1 2.5-3" />
    </>
  ),
  growth: (
    <>
      <path d="M3 19h18" />
      <path d="M7 15v-4" />
      <path d="M12 15V7" />
      <path d="M17 15V4" />
      <path d="m14 6 3-3 3 3" />
    </>
  ),
  building: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </>
  ),
}

function Icono({ tipo, className = '' }) {
  return (
    <span className={`hm-icon hm-icon-${tipo} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {iconPaths[tipo]}
      </svg>
    </span>
  )
}

function FlameIcon({ className = '' }) {
  return <Icono tipo="flame" className={`hm-flame-icon ${className}`.trim()} />
}

function BomberoVisual({ porcentaje = 0 }) {
  const nivel = porcentaje >= 76 ? 'full' : porcentaje >= 51 ? 'uniforme' : porcentaje >= 26 ? 'casco' : 'base'

  return (
    <div className={`hm-firefighter hm-firefighter-${nivel}`} aria-label={`Bombero visual al ${porcentaje}%`}>
      <div className="hm-helmet" />
      <div className="hm-head" />
      <div className="hm-body">
        <span />
      </div>
      <div className="hm-arms">
        <span />
        <span />
      </div>
      <div className="hm-legs">
        <span />
        <span />
      </div>
    </div>
  )
}

function CampanaCard({ campana, onVerDetalle }) {
  const recaudado = obtenerRecaudado(campana)
  const meta = obtenerMeta(campana)
  const porcentaje = calcularProgreso(campana)

  return (
    <article className="hm-campaign-card">
      <div className="hm-campaign-image">
        <img src={obtenerImagen(campana)} alt={obtenerTitulo(campana)} loading="lazy" />
        <span>{obtenerCategoria(campana)}</span>
      </div>
      <div className="hm-campaign-body">
        <small>{obtenerCompania(campana)}</small>
        <h3>{obtenerTitulo(campana)}</h3>
        <p>{recortar(obtenerDescripcion(campana))}</p>
        <div className="hm-campaign-money">
          <strong>{formatearSoles(recaudado)}</strong>
          <span>de {formatearSoles(meta)}</span>
        </div>
        <div className="hm-progress" aria-label={`${porcentaje}% alcanzado`}>
          <span style={{ width: `${porcentaje}%` }} />
        </div>
        <em>{porcentaje}% alcanzado</em>
        <button className="hm-campaign-button" type="button" onClick={() => onVerDetalle(campana)}>Ver Detalle</button>
      </div>
    </article>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [campanas, setCampanas] = useState([])
  const [loadingCampanas, setLoadingCampanas] = useState(true)
  const [errorCampanas, setErrorCampanas] = useState('')
  const [progresoBombero, setProgresoBombero] = useState(null)
  const [loadingProgreso, setLoadingProgreso] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargarCampanas = async () => {
      try {
        let response

        try {
          response = await obtenerCampanasPublicas({ status: 'active' })
        } catch {
          response = await obtenerCampanasPublicas({ estado: 'ACTIVA' })
        }

        let lista = normalizarCampanas(response.data)

        if (lista.length === 0) {
          response = await obtenerCampanasPublicas({ estado: 'ACTIVA' })
          lista = normalizarCampanas(response.data)
        }

        if (!cancelado) setCampanas(lista)
      } catch {
        if (!cancelado) {
          setCampanas([])
          setErrorCampanas('')
        }
      } finally {
        if (!cancelado) setLoadingCampanas(false)
      }
    }

    cargarCampanas()

    return () => {
      cancelado = true
    }
  }, [])

  const campanasDestacadas = useMemo(() => campanas.slice(0, 3), [campanas])

  const campanaProgreso = useMemo(() => elegirCampanaProgreso(campanas), [campanas])
  const progresoCampanaId = campanaProgreso ? obtenerId(campanaProgreso) : null
  const porcentajeProgreso = obtenerPorcentajeOficial(progresoBombero)
  const estadoVisual = obtenerEstadoVisual(progresoBombero)
  const descripcionVisual = obtenerDescripcionVisual(progresoBombero)
  const modeloEstado = progresoBombero?.modelo_3d?.estado || '—'
  const modeloPorcentaje = progresoBombero?.modelo_3d?.porcentaje ?? '—'
  const partesColoreadas = obtenerPartesColoreadas(progresoBombero)
  const progresoRecaudado = obtenerRecaudado(campanaProgreso || {})
  const progresoMeta = obtenerMeta(campanaProgreso || {})
  const tituloProgreso = campanaProgreso ? obtenerTitulo(campanaProgreso) : 'Campaña activa'

  useEffect(() => {
    let cancelado = false

    if (!progresoCampanaId) {
      const limpiarProgreso = async () => {
        if (!cancelado) setProgresoBombero(null)
      }

      limpiarProgreso()
      return () => {
        cancelado = true
      }
    }

    const cargarProgreso = async () => {
      setLoadingProgreso(true)
      try {
        const response = await obtenerProgresoCampanaPublico(progresoCampanaId)
        if (!cancelado) setProgresoBombero(response.data || null)
      } catch {
        if (!cancelado) setProgresoBombero(null)
      } finally {
        if (!cancelado) setLoadingProgreso(false)
      }
    }

    cargarProgreso()

    return () => {
      cancelado = true
    }
  }, [progresoCampanaId])

  const handleVerDetalle = (campana) => {
    const id = obtenerId(campana)
    if (!id) return

    const destino = `/campaign/${id}`
    if (!haySesion()) {
      localStorage.setItem('pendingDonationPath', destino)
      navigate('/login')
      return
    }

    navigate(destino)
  }

  return (
    <main className="hm-page">
      <header className="hm-nav">
        <Link className="hm-brand" to="/home">
          <span className="hm-brand-icon" aria-hidden="true">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="hm-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="hm-login" companyAccessClassName="hm-company-access" />
        </nav>
      </header>

      <section className="hm-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, .66), rgba(15, 23, 42, .66)), url("${HERO_IMAGE}")` }}>
        <div className="hm-hero-content">
          <h1>Apoya a los <span>Héroes</span> que Salvan Vidas</h1>
          <p>
            Plataforma moderna de donaciones para compañías de bomberos en Perú.
            Conectamos ciudadanos con bomberos a través de campañas humanitarias
            y apoyo de emergencia.
          </p>
          <div className="hm-hero-actions">
            <Link className="hm-primary" to="/campanas">Ver Campañas</Link>
            <Link className="hm-secondary" to="/registro">Únete Ahora</Link>
          </div>
        </div>
      </section>

      <section className="hm-campaigns" aria-labelledby="campanas-title">
        <div className="hm-section-row">
          <div>
            <h2 id="campanas-title">Campañas Activas</h2>
            <p>Apoya a los bomberos que protegen tu comunidad</p>
          </div>
          <Link to="/campanas">Ver todas <span aria-hidden="true">→</span></Link>
        </div>

        {loadingCampanas ? (
          <div className="hm-state">Cargando campañas activas...</div>
        ) : errorCampanas ? (
          <div className="hm-state">{errorCampanas}</div>
        ) : campanasDestacadas.length === 0 ? (
          <div className="hm-state">No hay campañas activas disponibles por el momento.</div>
        ) : (
          <div className="hm-campaign-grid">
            {campanasDestacadas.map((campana) => (
              <CampanaCard key={obtenerId(campana) || obtenerTitulo(campana)} campana={campana} onVerDetalle={handleVerDetalle} />
            ))}
          </div>
        )}
      </section>

      <section className="hm-benefits" aria-labelledby="beneficios-title">
        <div className="hm-section-head">
          <h2 id="beneficios-title">¿Por qué FireSupport IA?</h2>
          <p>Una plataforma moderna, transparente y segura para apoyar a nuestros bomberos</p>
        </div>

        <div className="hm-benefit-grid">
          {beneficios.map((beneficio) => (
            <article className="hm-benefit-card" key={beneficio.titulo}>
              <Icono tipo={beneficio.icono} />
              <h3>{beneficio.titulo}</h3>
              <p>{beneficio.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hm-visual" aria-labelledby="visual-title">
        <div className="hm-visual-copy">
          <span className="hm-eyebrow"><FlameIcon /> Nuevo en FireSupport IA</span>
          <h2 id="visual-title">Mira cómo tu donación <span>da vida</span> al bombero</h2>
          <p>
            Nuestra visualización interactiva muestra en tiempo real el progreso de cada campaña.
            A medida que crece la recaudación, el bombero cobra color y equipamiento, de gris a completamente equipado.
          </p>
          <ul>
            <li><Icono tipo="activity" /> Sigue el avance de campañas por región en tiempo real</li>
            <li><Icono tipo="medal" /> Descubre las compañías y donantes más destacados</li>
            <li><Icono tipo="growth" /> Compara el progreso entre departamentos de todo el Perú</li>
          </ul>
          <Link className="hm-primary hm-visual-button" to="/campanas"><FlameIcon /> Ver Progreso de Bomberos</Link>
        </div>

        <div className="hm-visual-panel">
          {loadingProgreso ? (
            <div className="hm-panel-state">Cargando progreso visual...</div>
          ) : !campanaProgreso || !progresoBombero ? (
            <div className="hm-panel-state">Progreso visual no disponible por el momento.</div>
          ) : (
            <>
              <span className="hm-live"><i /> En vivo</span>
              <div className="hm-panel-percent">{porcentajeProgreso}%</div>
              <p>{estadoVisual}</p>
              <BomberoVisual porcentaje={porcentajeProgreso} />
              <div className="hm-panel-card">
                <div>
                  <strong>{tituloProgreso}</strong>
                  <span>{porcentajeProgreso}%</span>
                </div>
                <div className="hm-progress">
                  <span style={{ width: `${porcentajeProgreso}%` }} />
                </div>
                <small>{formatearSoles(progresoRecaudado)} recaudados <b>Meta: {formatearSoles(progresoMeta)}</b></small>
              </div>
              <div className="hm-progress-details">
                <span>Modelo: {modeloEstado}</span>
                <span>Modelo %: {modeloPorcentaje}</span>
                <span>Partes: {partesColoreadas}</span>
                <span>{descripcionVisual}</span>
              </div>
              <div className="hm-mini-grid">
                {campanas.slice(0, 4).map((campana) => {
                  const pct = calcularProgreso(campana)
                  return (
                    <div key={obtenerId(campana) || obtenerTitulo(campana)}>
                      <strong>{pct}%</strong>
                      <span>{obtenerCategoria(campana)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="hm-company">
        <div className="hm-company-inner">
          <div>
            <h2>¿Eres de una Compañía de Bomberos?</h2>
            <p>
              Regístrate en nuestra plataforma y comienza a recibir apoyo de la
              comunidad para tus operaciones y necesidades de emergencia.
            </p>
            <Link className="hm-company-button" to="/solicitud-registro"><Icono tipo="building" /> Registrar Compañía</Link>
          </div>
          <img src={CTA_IMAGE} alt="Camión de bomberos atendiendo una emergencia" loading="lazy" />
        </div>
      </section>

      <section className="hm-metrics" aria-label="Indicadores de FireSupport IA">
        <div className="hm-metric-grid">
          {metricas.map((metrica) => (
            <div className="hm-metric-card" key={metrica.etiqueta}>
              <strong>{metrica.valor}</strong>
              <span>{metrica.etiqueta}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
