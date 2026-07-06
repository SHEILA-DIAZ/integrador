import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import { obtenerCampanas, obtenerMensajeApi, obtenerProgresoCampanaPublico } from '../services/api'
import './Campanas.css'

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/e/ea/FDNY_eng264_328_Ladder_134_20190214_135053~2.jpg'

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
  campana.descripcion || campana.description || 'Campaña activa de apoyo a compañías de bomberos.'
const obtenerCategoria = (campana) => campana.categoria || campana.category || 'General'
const obtenerEstado = (campana) => String(campana.estado || campana.status || '').toLowerCase()
const obtenerRecaudado = (campana) => Number(campana.monto_recaudado || campana.recaudado || campana.raised || 0)
const obtenerMeta = (campana) => Number(campana.meta_monto || campana.monto_meta || campana.goal || 0)
const obtenerCompania = (campana) =>
  campana.compania?.nombre ||
  campana.compania ||
  campana.nombre_compania ||
  campana.company_name ||
  campana.company ||
  (campana.compania_id ? `Compañía ${campana.compania_id}` : '—')
const obtenerImagen = (campana) => campana.imagen_url || campana.image_url || campana.imagen || FALLBACK_IMAGE
const obtenerRegionReal = (campana) => campana.region || campana.departamento || ''
const obtenerRegion = (campana) =>
  obtenerRegionReal(campana) || 'Sin región registrada'
const obtenerProvincia = (campana) => campana.provincia || ''
const obtenerDistrito = (campana) => campana.distrito || ''
const obtenerDonantes = (campana) => {
  const valor = campana.total_donantes ?? campana.donantes_count ?? campana.donantes ?? campana.donors
  return Number.isFinite(Number(valor)) ? Number(valor) : null
}

const calcularProgreso = (campana) => {
  const meta = obtenerMeta(campana)
  if (!meta || meta <= 0) return 0
  return Math.min(Math.round((obtenerRecaudado(campana) / meta) * 100), 100)
}

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Number(monto || 0))

const recortar = (texto, limite = 115) => {
  const limpio = String(texto || '').trim()
  return limpio.length > limite ? `${limpio.slice(0, limite).trim()}...` : limpio
}

const haySesion = () =>
  Boolean(localStorage.getItem('token') || localStorage.getItem('user') || localStorage.getItem('userRole'))

const elegirCampanaProgreso = (campanas) =>
  [...campanas].sort((a, b) => obtenerRecaudado(b) - obtenerRecaudado(a))[0] || campanas[0]

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

const iconos = {
  heart: (
    <path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 1 1 7.1 7.1Z" />
  ),
  trend: (
    <>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M2 21v-2a4 4 0 0 1 3-3.9" />
    </>
  ),
  search: <circle cx="11" cy="11" r="7" />,
  filter: <path d="M3 5h18l-7 8v5l-4 2v-7z" />,
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 6H4a2 2 0 0 0 2 4h1" />
      <path d="M17 6h3a2 2 0 0 1-2 4h-1" />
    </>
  ),
  map: (
    <>
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5" />
      <path d="M8 2h8l-2 6h-4z" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
}

function Icono({ tipo }) {
  return (
    <svg className="ca-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {iconos[tipo]}
    </svg>
  )
}

function BomberoVisual({ porcentaje }) {
  const nivel = porcentaje >= 75 ? 'full' : porcentaje >= 50 ? 'uniforme' : porcentaje >= 25 ? 'casco' : 'base'

  return (
    <div className={`ca-firefighter ca-firefighter-${nivel}`} aria-label={`Progreso visual ${porcentaje}%`}>
      <div className="ca-helmet" />
      <div className="ca-head" />
      <div className="ca-body"><span /></div>
      <div className="ca-arms"><span /><span /></div>
      <div className="ca-legs"><span /><span /></div>
    </div>
  )
}

function Barra({ porcentaje, className = '' }) {
  return (
    <div className={`ca-progress ${className}`.trim()}>
      <span style={{ width: `${Math.max(0, Math.min(porcentaje, 100))}%` }} />
    </div>
  )
}

function DonarButton({ children, campana, onDonar, featured = false }) {
  return (
    <button className={featured ? 'ca-donate ca-donate-featured' : 'ca-donate'} type="button" onClick={() => onDonar(campana)}>
      <Icono tipo="heart" />
      {children}
    </button>
  )
}

function CampaignCard({ campana, onDonar, badge = null }) {
  const recaudado = obtenerRecaudado(campana)
  const meta = obtenerMeta(campana)
  const progreso = calcularProgreso(campana)

  return (
    <article className="ca-card">
      <div className="ca-card-image">
        <img src={obtenerImagen(campana)} alt={obtenerTitulo(campana)} loading="lazy" />
        <span>{badge || obtenerCategoria(campana)}</span>
      </div>
      <div className="ca-card-body">
        <h3>{obtenerTitulo(campana)}</h3>
        <p>{recortar(obtenerDescripcion(campana))}</p>
        <div className="ca-money-row">
          <strong>{formatearSoles(recaudado)}</strong>
          <span>{progreso}%</span>
        </div>
        <Barra porcentaje={progreso} />
        <small>Meta: {meta > 0 ? formatearSoles(meta) : '—'}</small>
        <div className="ca-card-footer">
          <span>{obtenerCompania(campana)}</span>
          <DonarButton campana={campana} onDonar={onDonar}>Donar</DonarButton>
        </div>
      </div>
    </article>
  )
}

function FeaturedCard({ campana, onDonar }) {
  const recaudado = obtenerRecaudado(campana)
  const meta = obtenerMeta(campana)
  const progreso = calcularProgreso(campana)

  return (
    <article className="ca-featured-card">
      <div className="ca-featured-image">
        <img src={obtenerImagen(campana)} alt={obtenerTitulo(campana)} loading="lazy" />
        <span><Icono tipo="trophy" /> Destacada</span>
      </div>
      <div className="ca-featured-body">
        <h3>{obtenerTitulo(campana)}</h3>
        <p>{recortar(obtenerDescripcion(campana), 104)}</p>
        <div className="ca-money-row">
          <strong>{formatearSoles(recaudado)}</strong>
          <span>{progreso}%</span>
        </div>
        <Barra porcentaje={progreso} />
        <small>Meta: {meta > 0 ? formatearSoles(meta) : '—'}</small>
        <div className="ca-featured-footer">
          <span>{obtenerCompania(campana)}</span>
          <DonarButton campana={campana} onDonar={onDonar} featured>Donar Ahora</DonarButton>
        </div>
      </div>
    </article>
  )
}

function regionStats(campanas) {
  const mapa = new Map()

  campanas.forEach((campana) => {
    const region = obtenerRegion(campana)
    const actual = mapa.get(region) || { region, recaudado: 0, meta: 0, cantidad: 0 }
    actual.recaudado += obtenerRecaudado(campana)
    actual.meta += obtenerMeta(campana)
    actual.cantidad += 1
    mapa.set(region, actual)
  })

  return Array.from(mapa.values()).map((item) => ({
    ...item,
    porcentaje: item.meta > 0 ? Math.min(Math.round((item.recaudado / item.meta) * 100), 100) : 0,
  }))
}

const filtrarPorUbicacion = (campanas, region, provincia, distrito) =>
  campanas.filter((campana) => {
    const coincideRegion = region === 'Todas las regiones' || obtenerRegion(campana) === region
    const coincideProvincia = provincia === 'Todas las provincias' || obtenerProvincia(campana) === provincia
    const coincideDistrito = distrito === 'Todos los distritos' || obtenerDistrito(campana) === distrito

    return coincideRegion && coincideProvincia && coincideDistrito
  })

function obtenerTopDonantes(campanas) {
  const donantes = campanas.flatMap((campana) => {
    const lista = campana.top_donantes || campana.donantes_detalle || campana.donations || []
    return Array.isArray(lista) ? lista : []
  })

  return donantes
    .map((donante) => ({
      nombre: donante.nombre || donante.name || donante.donante || '—',
      monto: Number(donante.monto || donante.amount || donante.total || 0),
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 3)
}

export default function Campanas() {
  const navigate = useNavigate()
  const [campanas, setCampanas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [region, setRegion] = useState('Todas las regiones')
  const [provincia, setProvincia] = useState('Todas las provincias')
  const [distrito, setDistrito] = useState('Todos los distritos')
  const [loading, setLoading] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [progresoBombero, setProgresoBombero] = useState(null)
  const [loadingProgreso, setLoadingProgreso] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargarCampanas = async () => {
      try {
        const response = await obtenerCampanas({ status: 'active' }, { skipAuth: true })
        const lista = normalizarCampanas(response.data)
        if (!cancelado) setCampanas(lista)
      } catch (err) {
        console.error('Error al cargar campañas activas:', err)
        if (!cancelado) {
          setCampanas([])
          setErrorGeneral(obtenerMensajeApi(err, 'No pudimos cargar las campañas. Intenta nuevamente.'))
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarCampanas()

    return () => {
      cancelado = true
    }
  }, [])

  const campanasActivas = useMemo(
    () => campanas.filter((campana) => !obtenerEstado(campana) || ['active', 'activa'].includes(obtenerEstado(campana))),
    [campanas]
  )

  const categorias = useMemo(() => {
    const valores = Array.from(new Set(campanasActivas.map(obtenerCategoria).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
    return ['Todos', ...valores]
  }, [campanasActivas])

  const campanasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return campanasActivas.filter((campana) => {
      const coincideBusqueda =
        !texto ||
        [obtenerTitulo(campana), obtenerDescripcion(campana), obtenerCompania(campana), obtenerCategoria(campana)]
          .some((valor) => String(valor || '').toLowerCase().includes(texto))
      const coincideCategoria = categoria === 'Todos' || obtenerCategoria(campana) === categoria

      return coincideBusqueda && coincideCategoria
    })
  }, [busqueda, campanasActivas, categoria])

  const resumen = useMemo(() => {
    const donantes = campanasActivas.reduce((acc, campana) => {
      const total = obtenerDonantes(campana)
      return total === null ? acc : acc + total
    }, 0)
    const hayDonantes = campanasActivas.some((campana) => obtenerDonantes(campana) !== null)

    return {
      total: campanasActivas.length,
      recaudado: campanasActivas.reduce((acc, campana) => acc + obtenerRecaudado(campana), 0),
      donantes: hayDonantes ? donantes.toLocaleString('es-PE') : '—',
    }
  }, [campanasActivas])

  const campanaProgreso = useMemo(() => elegirCampanaProgreso(campanasActivas), [campanasActivas])
  const progresoCampanaId = campanaProgreso ? obtenerId(campanaProgreso) : null
  const porcentajeProgreso = obtenerPorcentajeOficial(progresoBombero)
  const estadoVisual = obtenerEstadoVisual(progresoBombero)
  const descripcionVisual = obtenerDescripcionVisual(progresoBombero)
  const modeloEstado = progresoBombero?.modelo_3d?.estado || '—'
  const modeloPorcentaje = progresoBombero?.modelo_3d?.porcentaje ?? '—'
  const partesColoreadas = obtenerPartesColoreadas(progresoBombero)

  useEffect(() => {
    let cancelado = false

    if (!progresoCampanaId) {
      setProgresoBombero(null)
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

  const destacadas = useMemo(
    () => [...campanasFiltradas].sort((a, b) => calcularProgreso(b) - calcularProgreso(a)).slice(0, 2),
    [campanasFiltradas]
  )

  const populares = useMemo(
    () => [...campanasFiltradas].sort((a, b) => obtenerRecaudado(b) - obtenerRecaudado(a)).slice(0, 3),
    [campanasFiltradas]
  )

  const regionesBase = useMemo(() => regionStats(campanasFiltradas), [campanasFiltradas])
  const regionesOpciones = useMemo(() => ['Todas las regiones', ...regionesBase.map((item) => item.region)], [regionesBase])
  const campanasPorRegion = useMemo(
    () => filtrarPorUbicacion(campanasFiltradas, region, 'Todas las provincias', 'Todos los distritos'),
    [campanasFiltradas, region]
  )
  const provinciasOpciones = useMemo(
    () => [
      'Todas las provincias',
      ...Array.from(new Set(campanasPorRegion.map(obtenerProvincia).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'es')
      ),
    ],
    [campanasPorRegion]
  )
  const campanasPorProvincia = useMemo(
    () => filtrarPorUbicacion(campanasFiltradas, region, provincia, 'Todos los distritos'),
    [campanasFiltradas, provincia, region]
  )
  const distritosOpciones = useMemo(
    () => [
      'Todos los distritos',
      ...Array.from(new Set(campanasPorProvincia.map(obtenerDistrito).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'es')
      ),
    ],
    [campanasPorProvincia]
  )
  const campanasRegionFiltradas = useMemo(
    () => filtrarPorUbicacion(campanasFiltradas, region, provincia, distrito),
    [campanasFiltradas, distrito, provincia, region]
  )
  const regiones = useMemo(() => regionStats(campanasRegionFiltradas), [campanasRegionFiltradas])
  const regionSeleccionada =
    (region === 'Todas las regiones' ? regiones[0] : regiones.find((item) => item.region === region)) || regiones[0]
  const topDonantes = useMemo(() => obtenerTopDonantes(campanasRegionFiltradas), [campanasRegionFiltradas])
  const topCampanas = useMemo(
    () => [...campanasRegionFiltradas].sort((a, b) => obtenerRecaudado(b) - obtenerRecaudado(a)).slice(0, 3),
    [campanasRegionFiltradas]
  )
  const resumenRegion = useMemo(() => {
    const donantes = campanasRegionFiltradas.reduce((acc, campana) => {
      const total = obtenerDonantes(campana)
      return total === null ? acc : acc + total
    }, 0)
    const hayDonantes = campanasRegionFiltradas.some((campana) => obtenerDonantes(campana) !== null)

    return {
      campanas: campanasRegionFiltradas.length,
      donantes: hayDonantes ? donantes.toLocaleString('es-PE') : '—',
    }
  }, [campanasRegionFiltradas])
  const metaRestante = Math.max((regionSeleccionada?.meta || 0) - (regionSeleccionada?.recaudado || 0), 0)
  const progresoRecaudado = obtenerRecaudado(campanaProgreso || {})
  const progresoMeta = obtenerMeta(campanaProgreso || {})

  useEffect(() => {
    if (!regionesOpciones.includes(region)) setRegion('Todas las regiones')
  }, [region, regionesOpciones])

  useEffect(() => {
    if (!provinciasOpciones.includes(provincia)) setProvincia('Todas las provincias')
  }, [provincia, provinciasOpciones])

  useEffect(() => {
    if (!distritosOpciones.includes(distrito)) setDistrito('Todos los distritos')
  }, [distrito, distritosOpciones])

  const handleDonar = (campana) => {
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

  const renderContenido = () => {
    if (loading) return <div className="ca-state">Cargando campañas activas...</div>
    if (errorGeneral) return <div className="ca-state ca-state-error">{errorGeneral}</div>
    if (campanasActivas.length === 0) {
      return <div className="ca-state">No hay campañas activas disponibles por el momento.</div>
    }
    if (campanasFiltradas.length === 0) {
      return <div className="ca-state">No se encontraron campañas con ese criterio.</div>
    }

    return (
      <>
        <section className="ca-featured-section" aria-labelledby="destacadas-title">
          <div className="ca-section-head ca-section-head-icon">
            <div>
              <h2 id="destacadas-title">Campañas Destacadas</h2>
              <p>Las campañas más urgentes que necesitan tu apoyo</p>
            </div>
            <Icono tipo="trophy" />
          </div>
          <div className="ca-featured-grid">
            {destacadas.map((campana) => (
              <FeaturedCard key={obtenerId(campana) || obtenerTitulo(campana)} campana={campana} onDonar={handleDonar} />
            ))}
          </div>
        </section>

        <section className="ca-section" aria-labelledby="populares-title">
          <div className="ca-section-head ca-section-head-icon ca-popular-head">
            <div>
              <h2 id="populares-title">Campañas Populares</h2>
              <p>Las más apoyadas por la comunidad</p>
            </div>
            <Icono tipo="users" />
          </div>
          <div className="ca-card-grid ca-card-grid-popular">
            {populares.map((campana) => (
              <CampaignCard key={obtenerId(campana) || obtenerTitulo(campana)} campana={campana} onDonar={handleDonar} badge="Popular" />
            ))}
          </div>
        </section>

        <section className="ca-section" aria-labelledby="todas-title">
          <div className="ca-section-head">
            <h2 id="todas-title">Todas las Campañas</h2>
            <p>Explora todas las campañas activas y encuentra la que más te inspire</p>
          </div>
          <div className="ca-card-grid">
            {campanasFiltradas.map((campana) => (
              <CampaignCard key={obtenerId(campana) || obtenerTitulo(campana)} campana={campana} onDonar={handleDonar} />
            ))}
          </div>
        </section>

        <section className="ca-region-section" aria-labelledby="regiones-title">
          <div className="ca-region-title">
            <h2 id="regiones-title">Progreso de Campañas por Región</h2>
            <p>Visualización gamificada del avance de donaciones en todo el país</p>
          </div>

          <div className="ca-region-filters">
            <Icono tipo="map" />
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {regionesOpciones.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={provincia} onChange={(event) => setProvincia(event.target.value)}>
              {provinciasOpciones.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={distrito} onChange={(event) => setDistrito(event.target.value)}>
              {distritosOpciones.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="ca-region-layout">
            <aside className="ca-region-list">
              <h3>Regiones</h3>
              {regiones.length === 0 ? (
                <div className="ca-region-item">—</div>
              ) : regiones.slice(0, 5).map((item, index) => (
                <button
                  className={item.region === regionSeleccionada?.region ? 'active' : ''}
                  key={item.region}
                  type="button"
                  onClick={() => setRegion(item.region)}
                >
                  <span><b>{item.region}</b><strong>{item.porcentaje}%</strong></span>
                  <Barra porcentaje={item.porcentaje} className={`ca-progress-region-${index % 4}`} />
                </button>
              ))}
            </aside>

            <div className="ca-region-panel">
              {loadingProgreso ? (
                <div className="ca-panel-state">Cargando progreso visual...</div>
              ) : !campanaProgreso || !progresoBombero ? (
                <div className="ca-panel-state">Progreso visual no disponible por el momento.</div>
              ) : (
                <>
                  <div className="ca-panel-percent">{porcentajeProgreso}%</div>
                  <p>{estadoVisual}</p>
                  <span className="ca-panel-badge">{modeloEstado}</span>
                  <BomberoVisual porcentaje={porcentajeProgreso} />
                </>
              )}
              <div className="ca-region-money">
                <div><span>Recaudado</span><strong>{formatearSoles(progresoRecaudado)}</strong></div>
                <div><span>Meta</span><strong>{progresoMeta ? formatearSoles(progresoMeta) : '—'}</strong></div>
              </div>
              {progresoBombero && (
                <div className="ca-progress-details">
                  <span>Modelo %: {modeloPorcentaje}</span>
                  <span>Partes: {partesColoreadas}</span>
                  <span>{descripcionVisual}</span>
                </div>
              )}
            </div>

            <aside className="ca-region-stats">
              <div><span className="red"><Icono tipo="target" /></span><p>Campañas filtradas</p><strong>{resumenRegion.campanas}</strong></div>
              <div><span className="blue"><Icono tipo="users" /></span><p>Total Donantes</p><strong>{resumenRegion.donantes}</strong></div>
              <div><span className="yellow"><Icono tipo="trend" /></span><p>Meta Restante</p><strong>{regionSeleccionada?.meta ? formatearSoles(metaRestante) : '—'}</strong></div>
              <div><span className="green"><Icono tipo="clock" /></span><p>Días Restantes</p><strong>—</strong></div>
              <div className="ca-evolution">
                <h3>Sistema de evolución</h3>
                <p><i /> 0% Bombero inactivo</p>
                <p><i /> 25% Casco activado</p>
                <p><i /> 50% Uniforme listo</p>
                <p><i /> 75% Equipo completo</p>
                <p><i /> 100% Misión cumplida</p>
              </div>
            </aside>
          </div>

          <div className="ca-regional-compare">
            <h3>Comparativa Regional</h3>
            {regiones.slice(0, 5).map((item, index) => (
              <div className="ca-compare-row" key={item.region}>
                <span>{item.region}</span>
                <Barra porcentaje={item.porcentaje} className={`ca-progress-region-${index % 4}`} />
                <strong>{formatearSoles(item.recaudado)}</strong>
              </div>
            ))}
          </div>

          <div className="ca-top-grid">
            <div className="ca-top-card">
              <h3><Icono tipo="trophy" /> Top Campañas</h3>
              {topCampanas.map((campana) => (
                <div className="ca-top-row" key={obtenerId(campana) || obtenerTitulo(campana)}>
                  <span><Icono tipo="medal" /></span>
                  <p>{obtenerTitulo(campana)}</p>
                  <Barra porcentaje={calcularProgreso(campana)} />
                  <strong>{formatearSoles(obtenerRecaudado(campana))}</strong>
                </div>
              ))}
            </div>

            <div className="ca-top-card">
              <h3><Icono tipo="medal" /> Top Donantes</h3>
              {topDonantes.length === 0 ? (
                <div className="ca-top-empty">No hay datos de donantes disponibles.</div>
              ) : topDonantes.map((donante) => (
                <div className="ca-donor-row" key={`${donante.nombre}-${donante.monto}`}>
                  <span><Icono tipo="medal" /></span>
                  <p>{donante.nombre}</p>
                  <strong>{formatearSoles(donante.monto)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <main className="ca-page">
      <header className="ca-nav">
        <Link className="ca-brand" to="/home">
          <span className="ca-brand-icon" aria-hidden="true">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="ca-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="ca-login" companyAccessClassName="ca-company-access" />
        </nav>
      </header>

      <section className="ca-hero">
        <div>
          <h1>Campañas Activas</h1>
          <p>Apoya a las compañías de bomberos en sus proyectos y necesidades urgentes</p>
        </div>
      </section>

      <section className="ca-content">
        <div className="ca-filters">
          <label className="ca-search">
            <Icono tipo="search" />
            <input
              type="search"
              placeholder="Buscar campañas..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <label className="ca-select">
            <Icono tipo="filter" />
            <select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <section className="ca-stats" aria-label="Resumen de campañas">
          <div className="ca-stat">
            <span className="ca-stat-icon red"><Icono tipo="heart" /></span>
            <div><strong>{resumen.total}</strong><span>Campañas Activas</span></div>
          </div>
          <div className="ca-stat">
            <span className="ca-stat-icon green"><Icono tipo="trend" /></span>
            <div><strong>{formatearSoles(resumen.recaudado)}</strong><span>Total Recaudado</span></div>
          </div>
          <div className="ca-stat">
            <span className="ca-stat-icon blue"><Icono tipo="users" /></span>
            <div><strong>{resumen.donantes}</strong><span>Donantes</span></div>
          </div>
        </section>

        {renderContenido()}
      </section>
    </main>
  )
}
