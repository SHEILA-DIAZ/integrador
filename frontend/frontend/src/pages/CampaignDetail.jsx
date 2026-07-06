import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthNavLinks from '../components/AuthNavLinks'
import Bombero3D from '../components/Bombero3D'
import { crearDonacion, obtenerCampanas, obtenerMensajeApi, obtenerProgresoCampana } from '../services/api'
import './CampaignDetail.css'

const montos = [10, 25, 50, 100, 200, 500]
const metodos = [
  { id: 'tarjeta_credito', label: 'Tarjeta de Credito', icon: 'card' },
  { id: 'tarjeta_debito', label: 'Tarjeta de Debito', icon: 'card' },
  { id: 'yape', label: 'Yape', icon: 'phone' },
  { id: 'plin', label: 'Plin', icon: 'phone' },
]

const imagenHeroDonacion =
  'https://www.cummins.com/es-na/mp-resource/sites/default/files/styles/hero_feature/public/2025-04/CMI_fireev_header.jpg?h=ff6d843d&itok=UGRhRdcS'
const companiaDescripcion =
  'La Compañía de Bomberos Roma N°1 es una de las instituciones más antiguas y prestigiosas del Perú, dedicada a la protección y servicio de la comunidad desde hace más de 100 años.'
const companiaImagen =
  'https://upload.wikimedia.org/wikipedia/commons/0/00/Fire_Engine_33_%286225707251%29.jpg'

function PaymentIcon({ tipo }) {
  if (tipo === 'phone') {
    return (
      <svg className="cd-payment-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    )
  }

  return (
    <svg className="cd-payment-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

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
})

const obtenerEtiquetaNivel = (porcentaje) => {
  if (porcentaje >= 100) return 'Nivel 5: Unidad Completa'
  if (porcentaje >= 75) return 'Nivel 4: Equipo Avanzado'
  if (porcentaje >= 50) return 'Nivel 3: Uniforme Completo'
  if (porcentaje >= 25) return 'Nivel 2: Casco Activado'
  return 'Nivel 1: Bombero Basico'
}

const hitosEvolucion = [
  { nombre: 'Casco', descripcion: 'Recluta inicial', valor: 0 },
  { nombre: 'Uniforme', descripcion: 'Bombero equipado', valor: 25 },
  { nombre: 'Equipo', descripcion: 'Operativo basico', valor: 50 },
  { nombre: 'Equipo Avanzado', descripcion: 'Especialista', valor: 75 },
  { nombre: 'Unidad Completa', descripcion: 'Bombero Elite', valor: 100 },
]

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
  const [mensajeCompartir, setMensajeCompartir] = useState('')

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
  const progresoVisual = Number(progresoInteligente?.porcentaje || 0)
  const siguienteHito = hitosEvolucion.find((hito) => progresoVisual < hito.valor)

  const validar = () => {
    const nuevosErrores = {}

    if (!montoFinal || montoFinal <= 0) nuevosErrores.monto = 'Selecciona o ingresa un monto valido'
    if (!metodoPago) nuevosErrores.metodoPago = 'Selecciona un metodo de pago'
    if (requiereTarjeta(metodoPago)) {
      if (tarjeta.numero.replace(/\D/g, '').length !== 16) nuevosErrores.numero = 'Ingrese una tarjeta valida de 16 digitos.'
      if (tarjetaVencida(tarjeta.vencimiento)) nuevosErrores.vencimiento = 'La tarjeta se encuentra vencida.'
      if (!/^\d{3}$/.test(tarjeta.cvv)) nuevosErrores.cvv = 'Ingrese un CVV valido.'
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{5,60}$/.test(tarjeta.titular.trim())) nuevosErrores.titular = 'Ingrese el nombre del titular.'
    }
    if (requiereCodigoOperacion(metodoPago) && !codigoOperacion.trim()) nuevosErrores.codigoOperacion = 'Debe ingresar el codigo de operacion.'

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
      if (!donacionId) throw new Error('La respuesta del backend no incluye el ID de la donacion.')
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
      setErrorGeneral(obtenerMensajeApi(err, 'No pudimos registrar la donacion. Intenta nuevamente.'))
    } finally {
      setProcesando(false)
    }
  }

  const handleCompartirCampana = async () => {
    setMensajeCompartir('')
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: campana.titulo,
          text: campana.descripcion,
          url,
        })
        setMensajeCompartir('Campaña lista para compartir')
        return
      }

      await navigator.clipboard.writeText(url)
      setMensajeCompartir('Enlace de campaña copiado correctamente')
    } catch {
      setMensajeCompartir('No se pudo compartir la campaña. Intenta nuevamente.')
    }
  }

  if (loading) return <main className="cd-page"><section className="cd-empty">Cargando campaña...</section></main>

  if (!campana) {
    return (
      <main className="cd-page">
        <header className="cd-nav">
          <Link className="cd-brand" to="/home"><span className="cd-brand-icon">♨</span><strong>FireSupport IA</strong></Link>
          <nav className="cd-links" aria-label="Navegacion principal"><AuthNavLinks loginClassName="cd-login" /></nav>
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
        <nav className="cd-links" aria-label="Navegacion principal"><AuthNavLinks loginClassName="cd-login" /></nav>
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
            <h2>Metodo de pago</h2>
            <div className="cd-payment-grid">
              {metodos.map((metodo) => (
                <button className={metodoPago === metodo.id ? 'selected' : ''} key={metodo.id} type="button" onClick={() => handleMetodoPago(metodo.id)}>
                  <PaymentIcon tipo={metodo.icon} /> {metodo.label}
                </button>
              ))}
            </div>
            {errores.metodoPago && <p className="cd-error">ⓘ {errores.metodoPago}</p>}

            {requiereTarjeta(metodoPago) && (
              <div className="cd-card-fields">
                <label><span>Numero de tarjeta</span><input name="numero" inputMode="numeric" autoComplete="cc-number" maxLength="19" value={tarjeta.numero} onChange={handleTarjeta} placeholder="1234 5678 9012 3456" />{errores.numero && <small>{errores.numero}</small>}</label>
                <label><span>Vencimiento MM/AA</span><input name="vencimiento" inputMode="numeric" autoComplete="cc-exp" maxLength="5" value={tarjeta.vencimiento} onChange={handleTarjeta} placeholder="MM/AA" />{errores.vencimiento && <small>{errores.vencimiento}</small>}</label>
                <label><span>CVV</span><input name="cvv" inputMode="numeric" autoComplete="cc-csc" maxLength="3" value={tarjeta.cvv} onChange={handleTarjeta} placeholder="123" />{errores.cvv && <small>{errores.cvv}</small>}</label>
                <label><span>Nombre del titular</span><input name="titular" autoComplete="cc-name" maxLength="60" value={tarjeta.titular} onChange={handleTarjeta} placeholder="Nombre Apellido" />{errores.titular && <small>{errores.titular}</small>}</label>
              </div>
            )}

            {requiereCodigoOperacion(metodoPago) && (
              <div className="cd-operation-card">
                <h3>Pago con {obtenerMetodoLabel(metodoPago)}</h3>
                <div className="cd-operation-info"><span>Numero de destino</span><strong>999 888 777</strong></div>
                <div className="cd-operation-info"><span>Nombre receptor</span><strong>FireSupport IA</strong></div>
                <label>
                  <span>Codigo de operacion</span>
                  <input value={codigoOperacion} onChange={(event) => {
                    setCodigoOperacion(event.target.value)
                    if (errores.codigoOperacion) setErrores((actual) => ({ ...actual, codigoOperacion: '' }))
                  }} placeholder={metodoPago === 'yape' ? 'YP847291' : 'PL938271'} />
                  {errores.codigoOperacion && <small>{errores.codigoOperacion}</small>}
                </label>
                <p>Ingresa el codigo de operacion generado por la aplicacion de pago.</p>
              </div>
            )}
          </section>

          <button className="cd-donate" type="button" onClick={handleDonar} disabled={procesando}>
            {procesando ? 'Procesando donacion...' : montoFinal > 0 ? `♡ Donar S/ ${montoFinal}` : '♡ Donar ahora'}
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

          <section className="cd-card cd-company-card">
            <h2>Sobre la compañía</h2>
            <p className="cd-company-static">{companiaDescripcion}</p>
            <img className="cd-company-static-img" src={companiaImagen} alt="Compañía de bomberos" />
          </section>

          <section className="cd-card cd-smart-progress">
            <h2>Evolución del Bombero</h2>
            <p className="cd-smart-subtitle">Progreso visual de la campaña</p>
            {loadingProgreso ? (
              <p className="cd-progress-state">Cargando progreso inteligente...</p>
            ) : errorProgreso ? (
              <p className="cd-progress-state error">{errorProgreso}</p>
            ) : progresoInteligente ? (
              <>
                <div className="cd-smart-current">
                  <span>Progreso actual</span>
                  <strong>⚡ {progresoVisual}%</strong>
                  <div className="cd-smart-bar"><span style={{ width: `${progresoVisual}%` }} /></div>
                </div>
                <div className="cd-level-badge">{obtenerEtiquetaNivel(progresoVisual)}</div>
                {progresoInteligente.aplica_visualizacion_3d ? (
                  <Bombero3D porcentaje={progresoVisual} estado_visual={progresoInteligente.estado_visual} partes_coloreadas={progresoInteligente.partes_coloreadas} />
                ) : (
                  <Bombero3D porcentaje={progresoVisual} estado_visual={progresoInteligente.estado_visual} partes_coloreadas={progresoInteligente.partes_coloreadas} />
                )}
                <p className="cd-halfway">{progresoInteligente.descripcion_visual || 'A mitad de camino'}</p>
                <div className="cd-milestones">
                  <h3>Hitos de Evolución:</h3>
                  {hitosEvolucion.map((hito) => {
                    const activo = progresoVisual >= hito.valor
                    return (
                      <div className={`cd-milestone ${activo ? 'active' : ''}`} key={hito.nombre}>
                        <span>{activo ? '✓' : hito.valor}</span>
                        <div><strong>{hito.nombre}</strong><small>{hito.descripcion}</small></div>
                        <em>{hito.valor}%</em>
                      </div>
                    )
                  })}
                </div>
                <div className="cd-next-goal">
                  <strong>Próximo objetivo:</strong>
                  <span>{siguienteHito ? `Alcanzar ${siguienteHito.valor}% para desbloquear ${siguienteHito.nombre}` : 'Misión cumplida'}</span>
                </div>
              </>
            ) : null}
          </section>

          <div className="cd-share-row">
            <button className="cd-share-button" type="button" onClick={handleCompartirCampana}>
              <svg className="cd-share-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.6 6.8-4.2" />
                <path d="m8.6 13.4 6.8 4.2" />
              </svg>
              Compartir Campaña
            </button>
            {mensajeCompartir && <p className="cd-share-message">{mensajeCompartir}</p>}
          </div>
        </aside>
      </section>
    </main>
  )
}
