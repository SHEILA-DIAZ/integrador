import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import { obtenerComprobanteDonacion, obtenerMensajeApi } from '../services/api'
import './DonationSuccess.css'

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(monto || 0))

const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(fecha))

const obtenerUrlComprobante = (data) =>
  data?.comprobante_url || data?.receipt_url || data?.pdf_url || data?.receiptUrl || ''

const leerDonacionLocal = (id) => {
  try {
    const porId = JSON.parse(localStorage.getItem(`donation:${id}`) || 'null')
    if (porId) return porId

    const ultima = JSON.parse(localStorage.getItem('lastDonation') || 'null')
    const ultimaId = ultima?.id || ultima?.donacion_id || ultima?.transactionId
    return String(ultimaId) === String(id) ? ultima : null
  } catch {
    return null
  }
}

const normalizarDonacion = (data) => ({
  ...data,
  donorName: data?.donorName || data?.donor_name || data?.donante_nombre || data?.donante || 'Donante FireSupport',
  amount: data?.amount || data?.monto || 0,
  campaignName: data?.campaignName || data?.campaign_name || data?.campana_nombre || data?.campana || data?.titulo || '-',
  companyName: data?.companyName || data?.company_name || data?.compania_nombre || data?.compania || '-',
  date: data?.date || data?.fecha || data?.created_at || new Date().toISOString(),
  paymentMethod: data?.paymentMethod || data?.payment_method || data?.metodo_pago || '-',
  transactionId: data?.transactionId || data?.transaction_id || data?.donacion_id || data?.id || '-',
})

export default function DonationSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const donacionLocalInicial = leerDonacionLocal(id)
  const [donacion, setDonacion] = useState(() => (
    donacionLocalInicial ? normalizarDonacion(donacionLocalInicial) : null
  ))
  const [comprobanteUrl, setComprobanteUrl] = useState(() => obtenerUrlComprobante(donacionLocalInicial))
  const [errorGeneral, setErrorGeneral] = useState('')
  const [mensajeCompartir, setMensajeCompartir] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelado = false
    const donacionLocal = leerDonacionLocal(id)

    const cargarComprobante = async () => {
      try {
        const response = await obtenerComprobanteDonacion(id)
        const data = response.data?.data || response.data?.donacion || response.data
        if (!cancelado) {
          setComprobanteUrl(obtenerUrlComprobante(response.data) || obtenerUrlComprobante(data) || obtenerUrlComprobante(donacionLocal))
          if (data) setDonacion((actual) => normalizarDonacion({ ...donacionLocal, ...actual, ...data }))
        }
      } catch (err) {
        if (!cancelado) setErrorGeneral(obtenerMensajeApi(err, 'No pudimos cargar el comprobante.'))
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarComprobante()

    return () => {
      cancelado = true
    }
  }, [id])

  const handleCompartir = async () => {
    const shareData = {
      title: 'Comprobante de donación FireSupport IA',
      text: 'Mi donación a FireSupport IA fue registrada correctamente.',
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setMensajeCompartir('Link copiado al portapapeles')
      }
    } catch {
      setMensajeCompartir('No se pudo compartir en este momento')
    }
  }

  if (loading && !donacion) {
    return <main className="ds-page"><section className="ds-empty">Cargando comprobante...</section></main>
  }

  if (!donacion) {
    return (
      <main className="ds-page">
        <header className="ds-nav">
          <Link className="ds-brand" to="/home">
            <span className="ds-brand-icon">♨</span>
            <strong>FireSupport IA</strong>
          </Link>
          <nav className="ds-links" aria-label="Navegación principal">
            <AuthNavLinks loginClassName="ds-login" />
          </nav>
        </header>
        <section className="ds-empty">
          <h1>No encontramos el comprobante</h1>
          <p>La donación solicitada no está disponible en este navegador.</p>
          {errorGeneral && <p>{errorGeneral}</p>}
          <button type="button" onClick={() => navigate('/campanas')}>Volver a Campañas</button>
        </section>
      </main>
    )
  }

  return (
    <main className="ds-page">
      <header className="ds-nav">
        <Link className="ds-brand" to="/home">
          <span className="ds-brand-icon">♨</span>
          <strong>FireSupport IA</strong>
        </Link>
        <nav className="ds-links" aria-label="Navegación principal">
          <AuthNavLinks loginClassName="ds-login" />
        </nav>
      </header>

      <section className="ds-content">
        <div className="ds-check">✓</div>
        <h1>¡Donación Exitosa!</h1>
        <p>Gracias por apoyar a los bomberos de Perú</p>

        <article className="ds-receipt">
          <header>
            <h2>Recibo de Donación</h2>
            <span>FireSupport IA</span>
          </header>
          <div className="ds-receipt-body">
            <div className="ds-field full">
              <span>Donante</span>
              <strong>{donacion.donorName}</strong>
            </div>
            <div className="ds-field full">
              <span>Monto Donado</span>
              <strong className="amount">{formatearSoles(donacion.amount)}</strong>
            </div>
            <div className="ds-grid">
              <div className="ds-field">
                <span>Campaña</span>
                <strong>{donacion.campaignName}</strong>
              </div>
              <div className="ds-field">
                <span>Compañía</span>
                <strong>{donacion.companyName}</strong>
              </div>
              <div className="ds-field">
                <span>Fecha y Hora</span>
                <strong>{formatearFecha(donacion.date)}</strong>
              </div>
              <div className="ds-field">
                <span>Método de Pago</span>
                <strong>{donacion.paymentMethod}</strong>
              </div>
            </div>
            <div className="ds-transaction">
              <span>ID de Transacción</span>
              <strong>{donacion.transactionId}</strong>
            </div>
          </div>
        </article>

        <div className="ds-actions">
          <button type="button" disabled={!comprobanteUrl} onClick={() => window.open(comprobanteUrl, '_blank', 'noopener,noreferrer')}>⇩ Descargar PDF</button>
          <button type="button" onClick={() => window.print()}>▣ Imprimir</button>
          <button type="button" onClick={handleCompartir}>⌘ Compartir</button>
        </div>

        {comprobanteUrl ? (
          <a className="ds-pdf" href={comprobanteUrl} target="_blank" rel="noreferrer">
            Ver comprobante PDF
          </a>
        ) : (
          <button className="ds-pdf disabled" type="button" disabled>
            Comprobante PDF no disponible todavía
          </button>
        )}

        {mensajeCompartir && <div className="ds-share-message">{mensajeCompartir}</div>}

        <Link className="ds-back" to="/campanas">← Volver a Campañas</Link>
        <small className="ds-tax">Tu donación es deducible de impuestos según las leyes vigentes en Perú</small>
      </section>
    </main>
  )
}
