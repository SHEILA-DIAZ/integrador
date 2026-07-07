import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { obtenerDonacionesVirtuales, obtenerDonacionesVirtualesPublicas } from '../../services/api'
import './AdminIncome.css'

const normalizarLista = (data) => {
  const candidatos = [
    data,
    data?.data,
    data?.donations,
    data?.donaciones,
    data?.virtualIncome,
    data?.data?.donations,
    data?.data?.donaciones,
    data?.items,
  ]

  return candidatos.find(Array.isArray) || []
}

const leerDonacionLocal = (id) => {
  try {
    return JSON.parse(localStorage.getItem(`donation:${id}`) || 'null')
  } catch {
    return null
  }
}

const normalizarDonacion = (donacion) => {
  const id = donacion.id || donacion.donation_id || donacion.idTransaccion || donacion.transactionId
  const local = leerDonacionLocal(id) || {}

  return {
    id,
    donante: donacion.donante || donacion.donante_nombre || local.donorName || donacion.donorName || donacion.donor_name || 'Donante FireSupport',
    email: donacion.email || donacion.donante_email || local.donante_email || donacion.donorEmail || donacion.donor_email || 'No registrado',
    campana: nombreCortoCampana(
      donacion.campana || local.campaignName || donacion.campaignName || donacion.campaign_name || donacion.campaign || `Campaña #${donacion.campana_id || '-'}`
    ),
    monto: Number(donacion.monto || donacion.amount || 0),
    fecha: String(donacion.fecha || donacion.date || donacion.created_at || '').slice(0, 10),
    metodoPago: local.paymentMethod || donacion.metodoPago || donacion.paymentMethod || donacion.payment_method || 'No registrado',
    idTransaccion:
      donacion.idTransaccion ||
      local.transactionId ||
      donacion.transactionId ||
      donacion.transaction_id ||
      donacion.id ||
      '-',
  }
}

const formatearSoles = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const metodoPopular = (donaciones) => {
  if (donaciones.length === 0) return 'Sin datos'
  const conteo = donaciones.reduce((acc, donacion) => {
    acc[donacion.metodoPago] = (acc[donacion.metodoPago] || 0) + 1
    return acc
  }, {})

  return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0]
}

function DonationIcon({ type }) {
  const paths = {
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v11" />
        <path d="m7 9 5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),
    lock: (
      <>
        <rect x="6" y="10" width="12" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    money: (
      <>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    filter: (
      <>
        <path d="M3 5h18l-7 8v5l-4 2v-7z" />
      </>
    ),
  }

  return (
    <svg className="ai-svg-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {paths[type]}
    </svg>
  )
}

export default function AdminDonations() {
  const [donaciones, setDonaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroCampana, setFiltroCampana] = useState('Todas las campañas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let cancelado = false

    const cargarDonaciones = async () => {
      setLoading(true)
      try {
        const response = await obtenerDonacionesVirtuales()
        const lista = normalizarLista(response.data).map(normalizarDonacion)
        if (!cancelado) setDonaciones(lista)
      } catch {
        if (!cancelado) {
          try {
            const response = await obtenerDonacionesVirtualesPublicas()
            const lista = normalizarLista(response.data).map(normalizarDonacion)
            if (!cancelado) setDonaciones(lista)
          } catch {
            if (!cancelado) setDonaciones([])
          }
          if (!cancelado) setMensaje('')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarDonaciones()

    return () => {
      cancelado = true
    }
  }, [])

  const campanas = useMemo(
    () => ['Todas las campañas', ...new Set(donaciones.map((donacion) => donacion.campana))],
    [donaciones]
  )

  const donacionesFiltradas = useMemo(() => {
    return donaciones.filter((donacion) => {
      const coincideCampana =
        filtroCampana === 'Todas las campañas' || donacion.campana === filtroCampana
      const coincideDesde = !desde || donacion.fecha >= desde
      const coincideHasta = !hasta || donacion.fecha <= hasta

      return coincideCampana && coincideDesde && coincideHasta
    })
  }, [desde, donaciones, filtroCampana, hasta])

  const resumen = useMemo(() => {
    const total = donacionesFiltradas.reduce((acc, donacion) => acc + donacion.monto, 0)
    const donantes = new Set(
      donacionesFiltradas.map((donacion) => donacion.email || donacion.donante)
    ).size
    const promedio = donacionesFiltradas.length > 0 ? total / donacionesFiltradas.length : 0

    return {
      total,
      donantes,
      promedio,
      metodo: metodoPopular(donacionesFiltradas),
    }
  }, [donacionesFiltradas])

  return (
    <AdminLayout active="donations">
      <div className="ai-heading">
        <div>
          <div className="ai-title-row">
            <h1>Donaciones Virtuales</h1>
            <span className="ai-readonly"><DonationIcon type="eye" /> Solo Lectura</span>
          </div>
          <p>Vista de donaciones recibidas por plataforma</p>
        </div>
        <button className="ai-export" type="button" disabled>
          <DonationIcon type="download" /> Exportar <DonationIcon type="lock" />
        </button>
      </div>

      <section className="ai-summary" aria-label="Resumen de donaciones virtuales">
        <article className="ai-card">
          <div>
            <span>Total Recibido</span>
            <strong>{formatearSoles(resumen.total)}</strong>
            <small>{donacionesFiltradas.length} donaciones</small>
          </div>
          <span className="ai-card-icon"><DonationIcon type="money" /></span>
        </article>
        <article className="ai-card">
          <div>
            <span>Donantes Únicos</span>
            <strong>{resumen.donantes}</strong>
            <small>personas diferentes</small>
          </div>
          <span className="ai-card-icon blue"><DonationIcon type="users" /></span>
        </article>
        <article className="ai-card">
          <div>
            <span>Promedio</span>
            <strong>{formatearSoles(resumen.promedio)}</strong>
            <small>por donación</small>
          </div>
          <span className="ai-card-icon purple"><DonationIcon type="trend" /></span>
        </article>
        <article className="ai-card">
          <div>
            <span>Método Popular</span>
            <strong>{resumen.metodo}</strong>
            <small>más usado</small>
          </div>
          <span className="ai-card-icon orange"><DonationIcon type="card" /></span>
        </article>
      </section>

      <section className="ai-filters">
        <h2><DonationIcon type="filter" /> Filtros</h2>
        <div className="ai-filter-grid">
          <label className="ai-field">
            <span>Campaña</span>
            <select value={filtroCampana} onChange={(event) => setFiltroCampana(event.target.value)}>
              {campanas.map((campana) => (
                <option key={campana} value={campana}>
                  {campana}
                </option>
              ))}
            </select>
          </label>
          <label className="ai-field">
            <span>Desde</span>
            <input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
          </label>
          <label className="ai-field">
            <span>Hasta</span>
            <input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="ai-panel">
        {loading ? (
          <div className="ai-state">Cargando donaciones virtuales...</div>
        ) : mensaje ? (
          <div className="ai-state">{mensaje}</div>
        ) : donacionesFiltradas.length === 0 ? (
          <div className="ai-state">No hay donaciones virtuales con esos filtros.</div>
        ) : (
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Donante</th>
                  <th>Campaña</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Método de pago</th>
                  <th>ID Transacción</th>
                </tr>
              </thead>
              <tbody>
                {donacionesFiltradas.map((donacion) => (
                  <tr key={`${donacion.idTransaccion}-${donacion.id}`}>
                    <td>{donacion.donante}</td>
                    <td>{donacion.campana}</td>
                    <td className="ai-money">{formatearSoles(donacion.monto)}</td>
                    <td>{donacion.fecha}</td>
                    <td>{donacion.metodoPago}</td>
                    <td>{donacion.idTransaccion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="ai-live"><span /> Actualización en tiempo real activa</div>
    </AdminLayout>
  )
}
const nombreCortoCampana = (campana) =>
  typeof campana === 'string' ? campana : campana?.titulo || campana?.nombre || '-'
