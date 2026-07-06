import { meses } from './associationData'

export function LineChart({ values, color = 'red' }) {
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => {
    const x = 45 + index * 104
    const y = 214 - (value / max) * 174
    return `${x},${y}`
  }).join(' ')
  const lineClass = color === 'blue' ? 'blue-line' : 'red-line'
  const dotClass = color === 'blue' ? 'blue-dot' : 'red-dot'

  return (
    <svg className="ap-chart" viewBox="0 0 620 250" role="img" aria-label="Grafico de linea">
      {[0, 1, 2, 3, 4].map((linea) => <line className="grid" key={linea} x1="45" x2="592" y1={38 + linea * 44} y2={38 + linea * 44} />)}
      <line className="axis" x1="45" x2="592" y1="214" y2="214" />
      <line className="axis" x1="45" x2="45" y1="28" y2="214" />
      <polyline className={lineClass} points={points} />
      {values.map((value, index) => {
        const x = 45 + index * 104
        const y = 214 - (value / max) * 174
        return <circle className={dotClass} key={`${value}-${index}`} cx={x} cy={y} r="5" />
      })}
      {meses.map((mes, index) => <text key={mes} x={36 + index * 104} y="238">{mes}</text>)}
    </svg>
  )
}

export function BarChart({ labels, values, color = '#dc2626' }) {
  const max = Math.max(...values, 1)
  return (
    <div className="ap-bars" role="img" aria-label="Grafico de barras">
      {values.map((value, index) => (
        <div className="ap-bar-group" key={`${labels[index]}-${value}`}>
          <span className="ap-bar" style={{ height: `${Math.max(8, (value / max) * 96)}%`, background: color }} />
          <small>{labels[index]}</small>
        </div>
      ))}
    </div>
  )
}
