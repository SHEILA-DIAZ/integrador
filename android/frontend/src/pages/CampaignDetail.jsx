import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import Bombero3D from '../components/Bombero3D'
import { crearDonacion, obtenerCampanas, obtenerMensajeApi, obtenerProgresoCampana } from '../services/api'
import './CampaignDetail.css'

const montos = [10, 25, 50, 100, 200, 500]
const metodos = [
  { id: 'tarjeta_credito', label: 'Tarjeta de Crédito', icon: '▭' },
  { id: 'tarjeta_debito', label: 'Tarjeta de Débito', icon: '▭' },
  { id: 'yape', label: 'Yape', icon: '▯' },
  { id: 'plin', label: 'Plin', icon: '▯' },
]

const imagenHeroDonacion =
  'https://www.cummins.com/es-na/mp-resource/sites/default/files/styles/hero_feature/public/2025-04/CMI_fireev_header.jpg?h=ff6d843d&itok=UGRhRdcS'

const formatearSoles = (monto) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Number(monto || 0))

const requiereTarjeta = (metodo) => metodo === 'tarjeta_credito' || metodo === 'tarjeta_debito'
const requiereCodigoOperacion = (metodo) => metodo === 'yape' || metodo === 'plin'
const obtenerMetodoLabel = (metodo) => metodos.find((item) => item.id === metodo)?.label || metodo

const formatearNumeroTarjeta = (valor) =>
  valor.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

const formatearVencimiento = (valor) => {
  const limpio = valor.replace(/\D/g, '').slice(0, 4)
  if (limpio.length <= 2) return limpio
  return `${limpio.slice(0, 2)}/${limpio.slice(2)}`
}

const tarjetaVencida = (valor) => {
  const [mesTexto, anioTexto] = valor.split('/')
  const mes = Number(mesTexto)
  const anio = Number(anioTexto)
  if (!mesTexto || !anioTexto || mesTexto.length !== 2 || anioTexto.length !== 2 || mes < 1 || mes > 12) return true

  const ahora = new Date()
  const anioCompleto = 2000 + anio
  const finMes = new Date(anioCompleto, mes, 0, 23, 59, 59)
  return finMes < ahora
}

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
  compania: campana.compania || campana.nombre_compania || campana.company_name || 'Compañía de Bomberos',
  companiaDescripcion: campana.companiaDescripcion || campana.compania_descripcion || campana.company_description || '',
  companiaImagen: campana.companiaImagen || campana.compania_imagen || campana.company_image || imagenHeroDonacion,
})

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campana, setCampana] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [progresoInteligente, setProgresoInteligente] = useState(null)
  const [loadingProgreso, setLoadingProgreso] = useState(true)
  const [errorProgreso, setErrorProgreso] = useState('')
  const [montoSeleccionado, setMontoSeleccionado] = useState('')
  const [montoPersonalizado, setMontoPersonalizado] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [codigoOperacion, setCodigoOperacion] = useState('')
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

  useEffect(() => {
    let cancelado = false

    const cargarProgreso = async () => {
      setLoadingProgreso(true)
      setErrorProgreso('')
      try {
        const response = await obtenerProgresoCampana(id)
        if (!cancelado) setProgresoInteligente(response.data || null)
      } catch {
        if (!cancelado) {
          setProgresoInteligente(null)
          setErrorProgreso('No se pudo cargar el progreso de la campaña.')
        }
      } finally {
        if (!cancelado) setLoadingProgreso(false)
      }
    }

    cargarProgreso()
    return () => {
      cancelado = true
    }
  }, [id])

  const montoFinal = useMemo(() => {
    if (montoPersonalizado) return Number(montoPersonalizado)
    return Number(montoSeleccionado || 0)
  }, [montoPersonalizado, montoSeleccionado])

  const progreso = campana ? Math.min(Math.round((campana.recaudado / campana.meta) * 100), 100) : 0

  const validar = () => {
    const nuevosErrores = {}

    if (!montoFinal || montoFinal <= 0) nuevosErrores.monto = 'Selecciona o ingresa un monto válido'
    if (!metodoPago) nuevosErrores.metodoPago = 'Selecciona un método de pago'
    if (requiereTarjeta(metodoPago)) {
      if (tarjeta.numero.replace(/\D/g, '').length !== 16) nuevosErrores.numero = 'Ingrese una tarjeta válida de 16 dígitos.'
      if (tarjetaVencida(tarjeta.vencimiento)) nuevosErrores.vencimiento = 'La tarjeta se encuentra vencida.'
      if (!/^\d{3}$/.test(tarjeta.cvv)) nuevosErrores.cvv = 'Ingrese un CVV válido.'
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{5,60}$/.test(tarjeta.titular.trim())) nuevosErrores.titular = 'Ingrese el nombre del titular.'
    }
    if (requiereCodigoOperacion(metodoPago) && !codigoOperacion.trim()) nuevosErrores.codigoOperacion = 'Debe ingresar el código de operación.'

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
    const normalizado = {
      numero: formatearNumeroTarjeta(value),
      vencimiento: formatearVencimiento(value),
      cvv: value.replace(/\D/g, '').slice(0, 3),
      titular: value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').slice(0, 60),
    }[name] ?? value
    setTarjeta((actual) => ({ ...actual, [name]: normalizado }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const handleMetodoPago = (metodo) => {
    setMetodoPago(metodo)
    if (!requiereCodigoOperacion(metodo)) setCodigoOperacion('')
    setErrores((actual) => ({ ...actual, metodoPago: '', codigoOperacion: '' }))
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
      metodo_pago: metodoPago,
    }

    if (requiereCodigoOperacion(metodoPago)) payload.codigo_operacion = codigoOperacion.trim()

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
        metodo_pago: payload.metodo_pago,
        paymentMethod: obtenerMetodoLabel(payload.metodo_pago),
        codigo_operacion: payload.codigo_operacion || donacion.codigo_operacion || '',
        operationCode: payload.codigo_operacion || donacion.codigo_operacion || '',
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

  if (loading) return <main className="cd-page"><section className="cd-empty">Cargando campaña...</section></main>

  if (!campana) {
    return (
      <main className="cd-page">
        <header className="cd-nav">
          <Link className="cd-brand" to="/home"><span className="cd-brand-icon">♨</span><strong>FireSupport IA</strong></Link>
          <nav className="cd-links" aria-label="Navegación principal"><AuthNavLinks loginClassName="cd-login" /></nav>
        </header>
        <section className="cd-empty">
          <h1>Campaña no encontrada</h1>
          <p>No pudimos encontrar la campaña solicitada.</p>
          <Link to="/campanas">Volver a Campañas</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="cd-page">
      <header className="cd-nav">
        <Link className="cd-brand" to="/home"><span className="cd-brand-icon">♨</span><strong>FireSupport IA</strong></Link>
        <nav className="cd-links" aria-label="Navegación principal"><AuthNavLinks loginClassName="cd-login" /></nav>
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
                <button className={Number(montoSeleccionado) === monto ? 'selected' : ''} key={monto} type="button" onClick={() => {
                  setMontoSeleccionado(monto)
                  setMontoPersonalizado('')
                  if (errores.monto) setErrores((actual) => ({ ...actual, monto: '' }))
                }}>S/ {monto}</button>
              ))}
            </div>
            <label className="cd-custom-amount">
              <span>O ingresa otro monto</span>
              <div><span>S/.</span><input inputMode="decimal" placeholder="0.00" value={montoPersonalizado} onChange={handleMontoPersonalizado} /></div>
            </label>
            {errores.monto && <p className="cd-error">ⓘ {errores.monto}</p>}
          </section>

          <section className="cd-card">
            <h2>Método de pago</h2>
            <div className="cd-payment-grid">
              {metodos.map((metodo) => (
                <button className={metodoPago === metodo.id ? 'selected' : ''} key={metodo.id} type="button" onClick={() => handleMetodoPago(metodo.id)}>
                  <span>{metodo.icon}</span> {metodo.label}
                </button>
              ))}
            </div>
            {errores.metodoPago && <p className="cd-error">ⓘ {errores.metodoPago}</p>}

            {requiereTarjeta(metodoPago) && (
              <div className="cd-card-fields">
                <label><span>Número de tarjeta</span><input name="numero" inputMode="numeric" autoComplete="cc-number" maxLength="19" value={tarjeta.numero} onChange={handleTarjeta} placeholder="1234 5678 9012 3456" />{errores.numero && <small>{errores.numero}</small>}</label>
                <label><span>Vencimiento MM/AA</span><input name="vencimiento" inputMode="numeric" autoComplete="cc-exp" maxLength="5" value={tarjeta.vencimiento} onChange={handleTarjeta} placeholder="MM/AA" />{errores.vencimiento && <small>{errores.vencimiento}</small>}</label>
                <label><span>CVV</span><input name="cvv" inputMode="numeric" autoComplete="cc-csc" maxLength="3" value={tarjeta.cvv} onChange={handleTarjeta} placeholder="123" />{errores.cvv && <small>{errores.cvv}</small>}</label>
                <label><span>Nombre del titular</span><input name="titular" autoComplete="cc-name" maxLength="60" value={tarjeta.titular} onChange={handleTarjeta} placeholder="Nombre Apellido" />{errores.titular && <small>{errores.titular}</small>}</label>
              </div>
            )}

            {requiereCodigoOperacion(metodoPago) && (
              <div className="cd-operation-card">
                <h3>Pago con {obtenerMetodoLabel(metodoPago)}</h3>
                <div className="cd-operation-info"><span>Número de destino</span><strong>999 888 777</strong></div>
                <div className="cd-operation-info"><span>Nombre receptor</span><strong>FireSupport IA</strong></div>
                <label>
                  <span>Código de operación</span>
                  <input value={codigoOperacion} onChange={(event) => {
                    setCodigoOperacion(event.target.value)
                    if (errores.codigoOperacion) setErrores((actual) => ({ ...actual, codigoOperacion: '' }))
                  }} placeholder={metodoPago === 'yape' ? 'YP847291' : 'PL938271'} />
                  {errores.codigoOperacion && <small>{errores.codigoOperacion}</small>}
                </label>
                <p>Ingresa el código de operación generado por la aplicación de pago.</p>
              </div>
            )}
          </section>

          <button className="cd-donate" type="button" onClick={handleDonar} disabled={procesando}>
            {procesando ? 'Procesando donación...' : montoFinal > 0 ? `♡ Donar S/ ${montoFinal}` : '♡ Donar'}
          </button>
          {errorGeneral && <p className="cd-error">{errorGeneral}</p>}
        </div>

        <aside className="cd-right">
          <section className="cd-card cd-progress-card">
            <div className="cd-progress-head"><strong>{formatearSoles(campana.recaudado)}</strong><span>{progreso}%</span></div>
            <div className="cd-progress"><span style={{ width: `${progreso}%` }} /></div>
            <p>Meta: {formatearSoles(campana.meta)}</p>
            <ul>
              <li><span>↗</span><div><strong>{campana.donantes} donantes</strong><small>han apoyado esta campaña</small></div></li>
              <li><span>▣</span><div><strong>Finaliza {campana.fechaFin}</strong><small>6 meses restantes</small></div></li>
              <li><span>◎</span><div><strong>{campana.compania}</strong><small>Organiza esta campaña</small></div></li>
            </ul>
          </section>

          <section className="cd-card cd-smart-progress">
            <h2>Progreso visual del bombero</h2>
            {loadingProgreso ? (
              <p className="cd-progress-state">Cargando progreso inteligente...</p>
            ) : errorProgreso ? (
              <p className="cd-progress-state error">{errorProgreso}</p>
            ) : progresoInteligente ? (
              <>
                {progresoInteligente.aplica_visualizacion_3d ? (
                  <Bombero3D porcentaje={progresoInteligente.porcentaje} estado_visual={progresoInteligente.estado_visual} partes_coloreadas={progresoInteligente.partes_coloreadas} />
                ) : (
                  <p className="cd-progress-state">{progresoInteligente.mensaje_visualizacion}</p>
                )}
                <div className="cd-smart-progress-head"><strong>{Number(progresoInteligente.porcentaje || 0)}% completado</strong><span>Rango: {progresoInteligente.rango || '-'}</span></div>
                <div className="cd-progress"><span style={{ width: `${Number(progresoInteligente.porcentaje || 0)}%` }} /></div>
                <p>{formatearSoles(progresoInteligente.monto_recaudado)} recaudados de {formatearSoles(progresoInteligente.meta_monto)}</p>
                <div className="cd-visual-meta"><span>Estado visual</span><strong>{progresoInteligente.estado_visual || '-'}</strong></div>
                <p>{progresoInteligente.descripcion_visual}</p>
                {Array.isArray(progresoInteligente.partes_coloreadas) && progresoInteligente.partes_coloreadas.length > 0 && (
                  <div className="cd-visual-parts">{progresoInteligente.partes_coloreadas.map((parte) => <span key={parte}>{parte}</span>)}</div>
                )}
              </>
            ) : null}
          </section>

          <section className="cd-card cd-ai-analysis">
            <h2><span>✦</span> Análisis Inteligente de Campaña</h2>
            {loadingProgreso ? (
              <p className="cd-progress-state">Cargando progreso inteligente...</p>
            ) : errorProgreso ? (
              <p className="cd-progress-state error">No se pudo cargar el análisis inteligente en este momento.</p>
            ) : progresoInteligente?.analisis_ia ? (
              <div className="cd-ai-grid">
                <div><span>Estado IA</span><strong>{progresoInteligente.analisis_ia.estado}</strong></div>
                <div><span>Probabilidad de éxito</span><strong>{progresoInteligente.analisis_ia.probabilidad_exito}</strong></div>
                <div><span>Mensaje IA</span><p>{progresoInteligente.analisis_ia.mensaje}</p></div>
                <div><span>Recomendación IA</span><p>{progresoInteligente.analisis_ia.recomendacion}</p></div>
                <div><span>Estrategia de difusión</span><p>{progresoInteligente.analisis_ia.estrategia_difusion}</p></div>
                <div><span>Horario recomendado</span><p>{progresoInteligente.analisis_ia.horario_recomendado}</p></div>
              </div>
            ) : (
              <p className="cd-progress-state">No se pudo cargar el análisis inteligente en este momento.</p>
            )}
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
