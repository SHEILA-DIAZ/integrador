import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obtenerCampanas } from '../services/api'
import AuthNavLinks from '../components/AuthNavLinks'
import './Campanas.css'

const imagenesPorCategoria = {
  Unidades:
    'https://www.kpnsafety.com/wp-content/uploads/2021/10/vehiculos-para-bomberos-equipos-para-bomberos.jpg',
  Equipamiento:
    'https://www.kpnsafety.com/wp-content/uploads/2021/10/vehiculos-para-bomberos-equipos-para-bomberos.jpg',
  Infraestructura:
    'https://imgmedia.larepublica.pe/1000x590/larepublica/original/2024/09/25/66f4677907c2a3062b5107f4.webp',
  Capacitación:
    'https://maudestudio.com/wp-content/uploads/2025/06/primerosauxilios_bomberos-scaled.jpg',
  Emergencia:
    'https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JZPBMNAFRFCHTFRNQU5PWF47SQ.jpg',
}

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

const obtenerTitulo = (campana) =>
  campana.titulo || campana.nombre || campana.title || 'Campaña sin título'

const obtenerDescripcion = (campana) =>
  campana.descripcion || campana.description || 'Campaña activa de apoyo a bomberos voluntarios.'

const obtenerCategoria = (campana) =>
  campana.categoria || campana.category || 'Equipamiento'

const normalizarCategoriaVisual = (categoria) => {
  const valor = String(categoria || '')
  return valor.includes('Capacitaci') ? 'Capacitaci\u00f3n' : valor
}

const obtenerRecaudado = (campana) =>
  Number(campana.monto_recaudado || campana.recaudado || campana.raised || 0)

const obtenerMeta = (campana) =>
  Number(campana.meta_monto || campana.monto_meta || campana.goal || 1)

const obtenerDonantes = (campana) =>
  Number(campana.donantes || campana.total_donantes || campana.donors || 0)

const obtenerCompania = (campana) =>
  campana.compania ||
  campana.nombre_compania ||
  campana.company_name ||
  campana.company ||
  'Compañía de Bomberos'

const obtenerImagen = (campana) => {
  const categoria = obtenerCategoria(campana)
  return campana.imagen_url || campana.image_url || campana.imagen || imagenesPorCategoria[categoria] || imagenesPorCategoria.Emergencia
}

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(monto)

export default function Campanas() {
  const navigate = useNavigate()
  const [campanas, setCampanas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')

  useEffect(() => {
    let cancelado = false

    const cargarCampanas = async () => {
      try {
        const response = await obtenerCampanas({ estado: 'ACTIVA' })
        const lista = normalizarCampanas(response.data)
        if (!cancelado) setCampanas(lista)
      } catch (err) {
        if (!cancelado) {
          setCampanas([])
          setErrorGeneral(err.response?.data?.message || 'No pudimos cargar las campañas. Intenta nuevamente.')
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

  const categorias = useMemo(
    () => ['Todos', 'Equipamiento', 'Capacitaci\u00f3n', 'Unidades'],
    []
  )

  const campanasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return campanas.filter((campana) => {
      const titulo = obtenerTitulo(campana)
      const categoriaCampana = normalizarCategoriaVisual(obtenerCategoria(campana))
      const coincideCategoria =
        categoria === 'Todos' ||
        categoriaCampana === categoria ||
        (categoria === 'Unidades' && titulo === 'Nuevo Cami\u00f3n de Bomberos para Lima')
      const coincideBusqueda =
        !texto ||
        [titulo, obtenerDescripcion(campana), obtenerCompania(campana)]
          .some((valor) => valor.toLowerCase().includes(texto))

      return coincideCategoria && coincideBusqueda
    })
  }, [busqueda, campanas, categoria])

  const resumen = useMemo(() => {
    return campanas.reduce(
      (acc, campana) => {
        acc.total += 1
        acc.recaudado += obtenerRecaudado(campana)
        acc.donantes += obtenerDonantes(campana)
        return acc
      },
      { total: 0, recaudado: 0, donantes: 0 }
    )
  }, [campanas])

  const handleDonar = (campana) => {
    const campanaId = obtenerId(campana) || '1'
    const destino = `/campaign/${campanaId}`
    const logueado = localStorage.getItem('token') || localStorage.getItem('userRole')

    if (!logueado) {
      localStorage.setItem('pendingDonationPath', destino)
      navigate('/login')
      return
    }

    navigate(destino)
  }

  return (
    <main className="ca-page">
      <header className="ca-nav">
        <Link className="ca-brand" to="/home">
          <span className="ca-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="ca-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="ca-login" />
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
            <span>⌕</span>
            <input
              type="search"
              placeholder="Buscar campañas..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <label className="ca-select">
            <span>▽</span>
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="ca-stats" aria-label="Resumen de campañas">
          <div className="ca-stat">
            <span className="ca-stat-icon red">♡</span>
            <div>
              <strong>{resumen.total}</strong>
              <span>Campañas Activas</span>
            </div>
          </div>
          <div className="ca-stat">
            <span className="ca-stat-icon green">↗</span>
            <div>
              <strong>{formatearSoles(resumen.recaudado)}</strong>
              <span>Total Recaudado</span>
            </div>
          </div>
          <div className="ca-stat">
            <span className="ca-stat-icon blue">♡</span>
            <div>
              <strong>{resumen.donantes.toLocaleString('es-PE')}</strong>
              <span>Donantes</span>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="ca-state">Cargando campañas...</div>
        ) : errorGeneral ? (
          <div className="ca-state">{errorGeneral}</div>
        ) : campanasFiltradas.length === 0 ? (
          <div className="ca-state">No encontramos campañas con esos filtros.</div>
        ) : (
          <section className="ca-grid" aria-label="Lista de campañas activas">
            {campanasFiltradas.map((campana) => {
              const recaudado = obtenerRecaudado(campana)
              const meta = obtenerMeta(campana)
              const progreso = Math.min(Math.round((recaudado / meta) * 100), 100)
              const categoriaCampana = normalizarCategoriaVisual(obtenerCategoria(campana))

              return (
                <article className="ca-card" key={obtenerId(campana) || obtenerTitulo(campana)}>
                  <div className="ca-card-image">
                    <img src={obtenerImagen(campana)} alt={obtenerTitulo(campana)} />
                    <span>{categoriaCampana}</span>
                  </div>

                  <div className="ca-card-body">
                    <h2>{obtenerTitulo(campana)}</h2>
                    <p>{obtenerDescripcion(campana)}</p>

                    <div className="ca-money">
                      <strong>{formatearSoles(recaudado)}</strong>
                      <span>{progreso}%</span>
                    </div>
                    <div className="ca-progress" aria-label={`Progreso ${progreso}%`}>
                      <span style={{ width: `${progreso}%` }} />
                    </div>
                    <small>Meta: {formatearSoles(meta)}</small>

                    <div className="ca-card-footer">
                      <span>{obtenerCompania(campana)}</span>
                      <button type="button" onClick={() => handleDonar(campana)}>♡ Donar</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </section>

    </main>
  )
}
