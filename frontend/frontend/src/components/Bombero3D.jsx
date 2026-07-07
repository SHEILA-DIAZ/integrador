import './Bombero3D.css'

const coloresPorEstado = {
  bombero_basico: '#9ca3af',
  bombero_equipamiento_parcial: '#f97316',
  bombero_casi_equipado: '#dc2626',
  bombero_completo: '#d97706',
}

const coloresPorParte = {
  casco: '#facc15',
  uniforme: '#dc2626',
  equipo: '#111827',
}

function BomberoFallback({ porcentaje, estadoVisual, partesColoreadas }) {
  const partes = Array.isArray(partesColoreadas) ? partesColoreadas : []
  const progreso = Number(porcentaje || 0)
  const cascoActivo = progreso >= 25 || partes.includes('casco')
  const uniformeActivo = progreso >= 50 || partes.includes('uniforme')
  const equipoActivo = progreso >= 75 || partes.includes('equipo')

  return (
    <div className={`b3d-fallback-visual b3d-state-${estadoVisual}`}>
      <div className="b3d-firefighter" aria-label="Bombero visual">
        <span className={`b3d-helmet ${cascoActivo ? 'active' : ''}`} style={{ backgroundColor: cascoActivo ? coloresPorParte.casco : undefined }} />
        <span className="b3d-head" />
        <span className={`b3d-body ${uniformeActivo ? 'active' : ''}`} style={{ backgroundColor: uniformeActivo ? coloresPorParte.uniforme : coloresPorEstado[estadoVisual] }}>
          <i />
        </span>
        <span className={`b3d-arm left ${uniformeActivo ? 'active' : ''}`} />
        <span className={`b3d-arm right ${uniformeActivo ? 'active' : ''}`} />
        <span className={`b3d-hand left ${equipoActivo ? 'active' : ''}`} />
        <span className={`b3d-hand right ${equipoActivo ? 'active' : ''}`} />
        <span className={`b3d-leg left ${uniformeActivo ? 'active' : ''}`} />
        <span className={`b3d-leg right ${uniformeActivo ? 'active' : ''}`} />
        <span className={`b3d-boot left ${equipoActivo ? 'active' : ''}`} />
        <span className={`b3d-boot right ${equipoActivo ? 'active' : ''}`} />
      </div>
    </div>
  )
}

export default function Bombero3D({ porcentaje = 0, estado_visual = 'bombero_basico', partes_coloreadas = [] }) {
  return (
    <div className="b3d-shell">
      <BomberoFallback porcentaje={porcentaje} estadoVisual={estado_visual} partesColoreadas={partes_coloreadas} />
      <span className="b3d-percent">{Number(porcentaje || 0)}%</span>
    </div>
  )
}
