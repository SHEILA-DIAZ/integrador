import { Link } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import './Home.css'

const beneficios = [
  {
    icono: '♢',
    titulo: 'Transparencia Total',
    descripcion: 'Seguimiento en tiempo real de todas las donaciones y el impacto generado en cada campaña.',
  },
  {
    icono: '↯',
    titulo: 'Respuesta Rápida',
    descripcion: 'Apoyo inmediato en emergencias y situaciones críticas para las compañías de bomberos.',
  },
  {
    icono: '↗',
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

const haySesionActiva = () =>
  Boolean(localStorage.getItem('token') || localStorage.getItem('userRole'))

const obtenerRol = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.role || usuario.rol || localStorage.getItem('userRole') || ''
  } catch {
    return localStorage.getItem('userRole') || ''
  }
}

export default function Home() {
  const esDonante = haySesionActiva() && obtenerRol() === 'donante'

  return (
    <main className="hm-page">
      <header className="hm-nav">
        <Link className="hm-brand" to="/home">
          <span className="hm-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>

        <nav className="hm-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="hm-login" />
        </nav>
      </header>

      <section className="hm-hero">
        <div className="hm-hero-content">
          <h1>
            Apoya a los <span>Héroes</span> que Salvan Vidas
          </h1>
          <p>
            Plataforma moderna de donaciones para compañías de bomberos en Perú.
            Conectamos ciudadanos con bomberos a través de campañas humanitarias
            y apoyo de emergencia.
          </p>
          <div className="hm-hero-actions">
            <Link className="hm-primary" to="/campanas">Ver Campañas</Link>
            {esDonante ? (
              <span className="hm-secondary hm-static-action" aria-disabled="true">Únete Ahora</span>
            ) : (
              <Link className="hm-secondary" to="/registro">Únete Ahora</Link>
            )}
          </div>
        </div>
      </section>

      <section className="hm-benefits" aria-labelledby="beneficios-title">
        <div className="hm-section-head">
          <h2 id="beneficios-title">¿Por qué FireSupport IA?</h2>
          <p>Una plataforma moderna, transparente y segura para apoyar a nuestros bomberos</p>
        </div>

        <div className="hm-benefit-grid">
          {beneficios.map((beneficio) => (
            <article className="hm-benefit-card" key={beneficio.titulo}>
              <span className="hm-card-icon">{beneficio.icono}</span>
              <h3>{beneficio.titulo}</h3>
              <p>{beneficio.descripcion}</p>
            </article>
          ))}
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
            {esDonante ? (
              <span className="hm-company-button hm-static-action" aria-disabled="true">
                ▤ Registrar Compañía
              </span>
            ) : (
              <Link className="hm-company-button" to="/solicitud-registro">
                ▤ Registrar Compañía
              </Link>
            )}
          </div>
          <img
            src="https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JZPBMNAFRFCHTFRNQU5PWF47SQ.jpg"
            alt="Bomberos junto a una unidad de emergencia"
          />
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
