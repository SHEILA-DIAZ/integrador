import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import {
  obtenerHistorialDonaciones,
  obtenerMensajeApi,
  obtenerUrlComprobanteDonacion,
} from '../services/api'
import './DonationHistory.css'

const normalizarLista = (data, claves = []) => {
  const candidatos = [
    data,
    data?.data,
    data?.items,
    ...claves.flatMap((clave) => [data?.[clave], data?.data?.[clave]]),
  ]

  return candidatos.find(Array.isArray) || []
}

const obtenerNombreCampana = (campana) => {
  if (typeof campana === 'string') return campana
  return campana?.titulo || campana?.nombre || campana?.title || '-'
}

const normalizarDonacion = (donacion) => ({
  id: donacion.id || donacion.donation_id || donacion.donacion_id,
  campana: obtenerNombreCampana(
    donacion.campana || donacion.campaign || donacion.campaignName || donacion.campaign_name
  ),
  monto: Number(donacion.monto || donacion.amount || 0),
  fecha: String(donacion.fecha || donacion.date || donacion.created_at || '').slice(0, 10),
  metodoPago:
    donacion.metodoPago || donacion.paymentMethod || donacion.payment_method || donacion.metodo_pago || '-',
  idTransaccion:
    donacion.idTransaccion || donacion.transactionId || donacion.transaction_id || donacion.id || '-',
})

const formatearSoles = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export default function DonationHistory() {
  const [donaciones, setDonaciones] = useState([])
  const [filtroCampana, setFiltroCampana] = useState('Todas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [descargandoId, setDescargandoId] = useState(null)

  useEffect(() => {
    let cancelado = false

    const cargarHistorial = async () => {
      setLoading(true)
      try {
        const historial = await obtenerHistorialDonaciones()

        if (cancelado) return

        setDonaciones(
          normalizarLista(historial.data, ['donations', 'donaciones', 'history', 'historial'])
            .map(normalizarDonacion)
        )
      } catch (err) {
        if (!cancelado) {
          setDonaciones([])
          setMensaje(obtenerMensajeApi(err, 'No pudimos cargar tu historial de donaciones. Intenta nuevamente.'))
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarHistorial()
    return () => { cancelado = true }
  }, [])

  const opcionesCampana = useMemo(
    () => ['Todas', ...new Set(donaciones.map((donacion) => donacion.campana).filter((campana) => campana !== '-'))],
    [donaciones]
  )

  const donacionesFiltradas = useMemo(() => donaciones.filter((donacion) => {
    const coincideCampana = filtroCampana === 'Todas' || donacion.campana === filtroCampana
    const coincideDesde = !desde || donacion.fecha >= desde
    const coincideHasta = !hasta || donacion.fecha <= hasta
    return coincideCampana && coincideDesde && coincideHasta
  }), [desde, donaciones, filtroCampana, hasta])

  const totalDonado = useMemo(
    () => donacionesFiltradas.reduce((total, donacion) => total + donacion.monto, 0),
    [donacionesFiltradas]
  )

  const descargarComprobante = (donacion) => {
    if (!donacion.id) {
      setMensaje('No se encontro el identificador del comprobante.')
      return
    }

    setDescargandoId(donacion.id)
    setMensaje('')

    try {
      window.open(obtenerUrlComprobanteDonacion(donacion.id), '_blank', 'noopener,noreferrer')
    } catch (err) {
      setMensaje(obtenerMensajeApi(err, 'No pudimos descargar el comprobante.'))
    } finally {
      setDescargandoId(null)
    }
  }

  return (
    <main className="dh-page">
      <header className="dh-nav">
        <Link className="dh-brand" to="/home">
          <span className="dh-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>
        <nav className="dh-links" aria-label="Navegacion principal">
          <AuthNavLinks loginClassName="dh-login" />
        </nav>
      </header>

      <section className="dh-hero">
        <div>
          <h1>Historial de Donaciones</h1>
          <p>Revisa todas tus donaciones realizadas</p>
        </div>
      </section>

      <section className="dh-content">
        <article className="dh-summary">
          <div>
            <span>Total Donado</span>
            <strong>{formatearSoles(totalDonado)}</strong>
            <small>{donacionesFiltradas.length} donaciones realizadas</small>
          </div>
          <span className="dh-summary-icon">$</span>
        </article>

        <section className="dh-filters">
          <h2>▽ Filtros</h2>
          <div className="dh-filter-grid">
            <label>
              <span>Campana</span>
              <select value={filtroCampana} onChange={(event) => setFiltroCampana(event.target.value)}>
                {opcionesCampana.map((campana) => (
                  <option key={campana} value={campana}>{campana}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Desde</span>
              <input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
            </label>
            <label>
              <span>Hasta</span>
              <input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
            </label>
          </div>
        </section>

        {mensaje && <div className="dh-alert">{mensaje}</div>}

        <section className="dh-panel">
          {loading ? (
            <div className="dh-state">Cargando historial de donaciones...</div>
          ) : donacionesFiltradas.length === 0 ? (
            <div className="dh-state">No hay donaciones para mostrar con esos filtros.</div>
          ) : (
            <div className="dh-table-wrap">
              <table className="dh-table">
                <thead>
                  <tr>
                    <th>Campana</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Metodo de pago</th>
                    <th>ID Transaccion</th>
                    <th>Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {donacionesFiltradas.map((donacion) => (
                    <tr key={`${donacion.idTransaccion}-${donacion.id}`}>
                      <td>{donacion.campana}</td>
                      <td className="dh-money">{formatearSoles(donacion.monto)}</td>
                      <td>{donacion.fecha}</td>
                      <td>{donacion.metodoPago}</td>
                      <td>{donacion.idTransaccion}</td>
                      <td>
                        <button
                          className="dh-download"
                          type="button"
                          disabled={descargandoId === donacion.id}
                          onClick={() => descargarComprobante(donacion)}
                        >
                          ↓ {descargandoId === donacion.id ? 'Descargando...' : 'Descargar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
