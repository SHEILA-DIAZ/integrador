import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import { crearDonacion, obtenerCampanas, obtenerMensajeApi } from '../services/api'
import './CampaignDetail.css'

const montos = [10, 25, 50, 100, 200, 500]
const metodos = [
  { id: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito', icon: '▭' },
  { id: 'Tarjeta de Débito', label: 'Tarjeta de Débito', icon: '▭' },
  { id: 'Yape', label: 'Yape', icon: '▯' },
  { id: 'Plin', label: 'Plin', icon: '▯' },
]

const imagenHeroDonacion =
  'https://www.cummins.com/es-na/mp-resource/sites/default/files/styles/hero_feature/public/2025-04/CMI_fireev_header.jpg?h=ff6d843d&itok=UGRhRdcS'

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Number(monto || 0))

const requiereTarjeta = (metodo) =>
  metodo === 'Tarjeta de Crédito' || metodo === 'Tarjeta de Débito'

const normalizarLista = (data) => {
  const lista = data?.campaigns || data?.campanas || data?.data?.campaigns || data?.data?.campanas || data?.data || data
  return Array.isArray(lista) ? lista : []
}

const obtenerId = (campana) => campana.id || campana.campaign_id || campana.campana_id

const leerJsonLocal = (clave) => {
  try {
    return JSON.parse(localStorage.getItem(clave) || '{}')
  } catch {
    return {}
  }
}

const obtenerDonanteLocal = () => {
  const user = leerJsonLocal('user')
  const usuario = leerJsonLocal('usuario')
  const datos = { ...usuario, ...user }
  const nombre =
    localStorage.getItem('donorName') ||
    datos.donorName ||
    datos.donante_nombre ||
    datos.nombreCompleto ||
    datos.nombre_completo ||
    datos.name ||
    [datos.nombre, datos.apellido].filter(Boolean).join(' ')
  const email =
    localStorage.getItem('donorEmail') ||
    datos.donorEmail ||
    datos.donante_email ||
    datos.email

  return {
    nombre: String(nombre || 'Donante FireSupport').trim() || 'Donante FireSupport',
    email: String(email || 'donante@firesupport.pe').trim() || 'donante@firesupport.pe',
  }
}

const normalizarCampana = (campana) => ({
  ...campana,
  id: obtenerId(campana),
  titulo: campana.titulo || campana.nombre || campana.title,
  descripcion: campana.descripcion || campana.description,
  meta: Number(campana.meta_monto || campana.monto_meta || campana.goal || 1),
  recaudado: Number(campana.monto_recaudado || campana.raised || 0),
  donantes: Number(campana.donantes || campana.total_donantes || campana.donors || 0),
  fechaFin: campana.fechaFin || campana.fecha_fin || campana.end_date || '',
  compania: campana.compania || campana.nombre_compania || campana.company_name || 'Compania de Bomberos',
})

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campana, setCampana] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [montoSeleccionado, setMontoSeleccionado] = useState('')
  const [montoPersonalizado, setMontoPersonalizado] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [tarjeta, setTarjeta] = useState({
    numero: '',
    vencimiento: '',
    cvv: '',
    titular: '',
  })
  const [errores, setErrores] = useState({})
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargarCampana = async () => {
      try {
        const response = await obtenerCampanas()
        const encontrada = normalizarLista(response.data).find(
          (item) => String(obtenerId(item)) === String(id)
        )
        if (!cancelado && encontrada) setCampana(normalizarCampana(encontrada))
      } catch (err) {
        if (!cancelado) setErrorGeneral(obtenerMensajeApi(err, 'No pudimos cargar la campaña en este momento.'))
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarCampana()
    return () => {
      cancelado = true
    }
  }, [id])

  const montoFinal = useMemo(() => {
    if (montoPersonalizado) return Number(montoPersonalizado)
    return Number(montoSeleccionado || 0)
  }, [montoPersonalizado, montoSeleccionado])

  if (loading) {
    return <main className="cd-page"><section className="cd-empty">Cargando campana...</section></main>
  }

  if (!campana) {
    return (
      <main className="cd-page">
        <header className="cd-nav">
          <Link className="cd-brand" to="/home">
            <span className="cd-brand-icon">♨</span>
            <strong>FireSupport IA</strong>
          </Link>
          <nav className="cd-links" aria-label="Navegación principal">
            <AuthNavLinks loginClassName="cd-login" />
          </nav>
        </header>
        <section className="cd-empty">
          <h1>Campaña no encontrada</h1>
          <p>No pudimos encontrar la campaña solicitada.</p>
          <Link to="/campanas">Volver a Campañas</Link>
        </section>
      </main>
    )
  }

  const progreso = Math.min(Math.round((campana.recaudado / campana.meta) * 100), 100)

  const validar = () => {
    const nuevosErrores = {}

    if (!montoFinal || montoFinal <= 0) {
      nuevosErrores.monto = 'Selecciona o ingresa un monto válido'
    }
    if (!metodoPago) {
      nuevosErrores.metodoPago = 'Selecciona un método de pago'
    }
    if (requiereTarjeta(metodoPago)) {
      if (!tarjeta.numero.trim()) nuevosErrores.numero = 'Ingresa el número de tarjeta'
      if (!tarjeta.vencimiento.trim()) nuevosErrores.vencimiento = 'Ingresa el vencimiento'
      if (!tarjeta.cvv.trim()) nuevosErrores.cvv = 'Ingresa el CVV'
      if (!tarjeta.titular.trim()) nuevosErrores.titular = 'Ingresa el nombre del titular'
    }

    return nuevosErrores
  }

  const handleMontoPersonalizado = (event) => {
    const value = event.target.value.replace(/[^\d.]/g, '')
    setMontoPersonalizado(value)
    if (value) setMontoSeleccionado('')
    if (errores.monto) setErrores((actual) => ({ ...actual, monto: '' }))
  }

  const handleTarjeta = (event) => {
    const { name, value } = event.target
    setTarjeta((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const handleDonar = async () => {
    setErrorGeneral('')
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setProcesando(true)
    const donante = obtenerDonanteLocal()
    const payload = {
      campana_id: campana.id,
      donante_nombre: donante.nombre,
      donante_email: donante.email,
      monto: montoFinal,
    }

    try {
      const response = await crearDonacion(payload)
      const donacion = response.data?.data || response.data?.donacion || response.data
      const donacionId = donacion.id || donacion.donacion_id
      if (!donacionId) throw new Error('La respuesta del backend no incluye el ID de la donación.')
      const donacionLocal = {
        ...donacion,
        ...payload,
        donorName: payload.donante_nombre,
        amount: payload.monto,
        campaignName: campana.titulo,
        companyName: campana.compania,
        date: donacion.created_at || donacion.fecha || new Date().toISOString(),
        metodo_pago: metodoPago,
        paymentMethod: metodoPago,
        transactionId: donacionId,
        comprobante_url: response.data?.comprobante_url || donacion.comprobante_url || donacion.receipt_url || donacion.pdf_url || donacion.receiptUrl || '',
      }
      localStorage.setItem('lastDonation', JSON.stringify(donacionLocal))
      localStorage.setItem(`donation:${donacionId}`, JSON.stringify(donacionLocal))
      navigate(`/donation/success/${donacionId}`)
    } catch (err) {
      setErrorGeneral(obtenerMensajeApi(err, 'No pudimos registrar la donación. Intenta nuevamente.'))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="cd-page">
      <header className="cd-nav">
        <Link className="cd-brand" to="/home">
          <span className="cd-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>
        <nav className="cd-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="cd-login" />
        </nav>
      </header>

      <section className="cd-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, .58), rgba(15, 23, 42, .58)), url("${imagenHeroDonacion}")` }}>
        <div>
          <Link to="/campanas">← Volver a campañas</Link>
          <h1>{campana.titulo}</h1>
          <p>{campana.descripcion}</p>
        </div>
      </section>

      <section className="cd-content">
        <div className="cd-left">
          <section className="cd-card">
            <h2>Selecciona el monto</h2>
            <div className="cd-amount-grid">
              {montos.map((monto) => (
                <button
                  className={Number(montoSeleccionado) === monto ? 'selected' : ''}
                  key={monto}
                  type="button"
                  onClick={() => {
                    setMontoSeleccionado(monto)
                    setMontoPersonalizado('')
                    if (errores.monto) setErrores((actual) => ({ ...actual, monto: '' }))
                  }}
                >
                  S/ {monto}
                </button>
              ))}
            </div>
            <label className="cd-custom-amount">
              <span>O ingresa otro monto</span>
              <div>
                <span>S/.</span>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={montoPersonalizado}
                  onChange={handleMontoPersonalizado}
                />
              </div>
            </label>
            {errores.monto && <p className="cd-error">ⓘ {errores.monto}</p>}
          </section>

          <section className="cd-card">
            <h2>Método de pago</h2>
            <div className="cd-payment-grid">
              {metodos.map((metodo) => (
                <button
                  className={metodoPago === metodo.id ? 'selected' : ''}
                  key={metodo.id}
                  type="button"
                  onClick={() => {
                    setMetodoPago(metodo.id)
                    if (errores.metodoPago) setErrores((actual) => ({ ...actual, metodoPago: '' }))
                  }}
                >
                  <span>{metodo.icon}</span> {metodo.label}
                </button>
              ))}
            </div>

            {errores.metodoPago && <p className="cd-error">ⓘ {errores.metodoPago}</p>}

            {requiereTarjeta(metodoPago) && (
              <div className="cd-card-fields">
                <label>
                  <span>Número de tarjeta</span>
                  <input name="numero" value={tarjeta.numero} onChange={handleTarjeta} />
                  {errores.numero && <small>{errores.numero}</small>}
                </label>
                <label>
                  <span>Vencimiento MM/AA</span>
                  <input name="vencimiento" value={tarjeta.vencimiento} onChange={handleTarjeta} />
                  {errores.vencimiento && <small>{errores.vencimiento}</small>}
                </label>
                <label>
                  <span>CVV</span>
                  <input name="cvv" value={tarjeta.cvv} onChange={handleTarjeta} />
                  {errores.cvv && <small>{errores.cvv}</small>}
                </label>
                <label>
                  <span>Nombre del titular</span>
                  <input name="titular" value={tarjeta.titular} onChange={handleTarjeta} />
                  {errores.titular && <small>{errores.titular}</small>}
                </label>
              </div>
            )}

            {metodoPago === 'Yape' && (
              <div className="cd-payment-note">Serás redirigido a la app de Yape para completar tu donación.</div>
            )}
            {metodoPago === 'Plin' && (
              <div className="cd-payment-note">Serás redirigido a la app de Plin para completar tu donación.</div>
            )}
          </section>

          <button className="cd-donate" type="button" onClick={handleDonar} disabled={procesando}>
            {procesando
              ? 'Procesando donación...'
              : montoFinal > 0
                ? `♡ Donar S/ ${montoFinal}`
                : '♡ Donar'}
          </button>
          {errorGeneral && <p className="cd-error">{errorGeneral}</p>}
        </div>

        <aside className="cd-right">
          <section className="cd-card cd-progress-card">
            <div className="cd-progress-head">
              <strong>{formatearSoles(campana.recaudado)}</strong>
              <span>{progreso}%</span>
            </div>
            <div className="cd-progress"><span style={{ width: `${progreso}%` }} /></div>
            <p>Meta: {formatearSoles(campana.meta)}</p>
            <ul>
              <li>
                <span>↗</span>
                <div>
                  <strong>{campana.donantes} donantes</strong>
                  <small>han apoyado esta campaña</small>
                </div>
              </li>
              <li>
                <span>▣</span>
                <div>
                  <strong>Finaliza {campana.fechaFin}</strong>
                  <small>6 meses restantes</small>
                </div>
              </li>
              <li>
                <span>◎</span>
                <div>
                  <strong>{campana.compania}</strong>
                  <small>Organiza esta campaña</small>
                </div>
              </li>
            </ul>
          </section>

          <section className="cd-card cd-company-card">
            <h2>Sobre la compañía</h2>
            <p>{campana.companiaDescripcion}</p>
            <img src={campana.companiaImagen} alt={campana.compania} />
          </section>
        </aside>
      </section>
    </main>
  )
}
