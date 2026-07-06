import AdminLayout from '../../components/AdminLayout'
import './FirefighterPanel.css'

const campanas = []

const formatearSoles = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', {
    maximumFractionDigits: 0,
  })}`

const obtenerUsuarioBombero = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      nombre: usuario.nombre || usuario.name || 'Usuario bombero',
      compania: usuario.compania || usuario.nombre_compania || '-',
      rol: usuario.rol || usuario.roleLabel || usuario.role || 'bombero',
    }
  } catch {
    return {
      nombre: 'Usuario bombero',
      compania: '-',
      rol: 'bombero',
    }
  }
}

export default function FirefighterPanel() {
  const usuario = obtenerUsuarioBombero()

  return (
    <AdminLayout active="firefighter">
      <section className="fp-banner">
        <span className="fp-banner-icon">▱</span>
        <div>
          <h1>Bienvenido, {usuario.nombre}</h1>
          <p>{usuario.compania}</p>
          <span className="fp-access">▱ Acceso Limitado - Bombero Interno</span>
        </div>
      </section>

      <section className="fp-summary" aria-label="Resumen de acceso">
        <article className="fp-card">
          <div>
            <span>Campañas Asignadas</span>
            <strong>{campanas.length}</strong>
            <small>puedes gestionar</small>
          </div>
          <span className="fp-card-icon">↗</span>
        </article>
        <article className="fp-card">
          <div>
            <span>Rol Asignado</span>
            <strong>{usuario.rol}</strong>
            <small>permisos limitados</small>
          </div>
          <span className="fp-card-icon green">▱</span>
        </article>
        <article className="fp-card">
          <div>
            <span>Última Actualización</span>
            <strong>-</strong>
            <small>sin datos sincronizados</small>
          </div>
          <span className="fp-card-icon purple">◷</span>
        </article>
      </section>

      <div className="fp-section-head">
        <h2>Tus Campañas</h2>
        <p>Campañas que puedes administrar</p>
      </div>

      <section className="fp-campaigns" aria-label="Campañas asignadas">
        {campanas.length === 0 && <p>No hay campañas asignadas para mostrar.</p>}
        {campanas.map((campana) => (
          <article className="fp-campaign" key={campana.id}>
            <div className="fp-image">
              <img src={campana.imagen} alt={campana.titulo} />
              <span className="fp-badge">{campana.estado}</span>
            </div>
            <div className="fp-campaign-body">
              <h3>{campana.titulo}</h3>
              <div className="fp-money">
                <strong>{formatearSoles(campana.recaudado)}</strong>
                <span>{campana.progreso}%</span>
              </div>
              <div className="fp-progress" aria-label={`Progreso ${campana.progreso}%`}>
                <span style={{ width: `${campana.progreso}%` }} />
              </div>
              <small className="fp-meta">Meta: {formatearSoles(campana.meta)}</small>
              <button className="fp-edit-button" type="button">
                ✐ Editar Campaña
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="fp-permissions">
        <span className="fp-permissions-icon">▱</span>
        <div>
          <h2>Permisos y Restricciones</h2>
          <ul>
            <li>Puedes editar y gestionar las campañas asignadas</li>
            <li>No tienes acceso a reportes financieros completos</li>
            <li>No puedes crear o eliminar campañas</li>
            <li>No puedes gestionar otros usuarios</li>
          </ul>
          <p>Para solicitar permisos adicionales, contacta con el administrador de tu compañía</p>
        </div>
      </section>
    </AdminLayout>
  )
}
