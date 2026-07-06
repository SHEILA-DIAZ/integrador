import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { obtenerCampanas, obtenerMensajeApi, registrarIngresoEfectivo } from '../../services/api'
import './AdminIncome.css'

const estadoInicial = {
  monto: '',
  origen: '',
  descripcion: '',
  fecha: '',
  campana: '',
  notas: '',
  registrado_por: 'Admin User',
}

const formatearSoles = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const validar = (form) => {
  const errores = {}

  if (!form.monto || Number(form.monto) <= 0) errores.monto = 'El monto debe ser mayor a 0'
  if (!form.origen.trim()) errores.origen = 'Ingresa el origen o descripción'
  if (!form.fecha) errores.fecha = 'Selecciona la fecha'
  if (!form.campana) errores.campana = 'Selecciona una campaña'

  return errores
}

export default function AdminCashIncome() {
  const [ingresos] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoModal, setModoModal] = useState('crear')
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [, setIngresoEditando] = useState(null)
  const [ingresoEliminar, setIngresoEliminar] = useState(null)
  const [campanas, setCampanas] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false
    obtenerCampanas()
      .then((response) => {
        const data = response.data?.data || response.data?.campanas || response.data?.campaigns || response.data
        if (!cancelado) setCampanas(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelado) setMensaje(obtenerMensajeApi(err, 'No se pudieron cargar las campañas.'))
      })
    return () => { cancelado = true }
  }, [])

  const abrirCrear = () => {
    setModoModal('crear')
    setIngresoEditando(null)
    setForm(estadoInicial)
    setErrores({})
    setModalAbierto(true)
  }

  const abrirEditar = (ingreso) => {
    setModoModal('editar')
    setIngresoEditando(ingreso)
    setForm({
      monto: String(ingreso.monto),
      origen: ingreso.origen,
      descripcion: ingreso.descripcion,
      fecha: ingreso.fecha,
      campana: ingreso.campana,
      notas: ingreso.notas || '',
      registrado_por: ingreso.registrado_por || 'Admin User',
    })
    setErrores({})
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setIngresoEditando(null)
    setForm(estadoInicial)
    setErrores({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nuevosErrores = validar(form)
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    const payload = {
      campana_id: form.campana,
      descripcion: form.descripcion.trim() || form.origen.trim(),
      monto: Number(form.monto),
      fecha: form.fecha,
      origen: form.origen.trim(),
      registrado_por: form.registrado_por || 'Admin User',
    }

    if (modoModal === 'crear') {
      setGuardando(true)
      try {
        await registrarIngresoEfectivo(payload)
      } catch (err) {
        setMensaje(obtenerMensajeApi(err, 'No se pudo registrar el ingreso. Intenta nuevamente.'))
        return
      } finally {
        setGuardando(false)
      }

      setMensaje('Ingreso en efectivo registrado correctamente')
    } else {
      setMensaje('El backend no expone todavía un endpoint para editar ingresos en efectivo.')
      return
    }

    cerrarModal()
  }

  const confirmarEliminar = () => {
    if (!ingresoEliminar) return
    setMensaje('El backend no expone todavía un endpoint para eliminar ingresos en efectivo.')
    setIngresoEliminar(null)
  }

  const total = useMemo(
    () => ingresos.reduce((acc, ingreso) => acc + Number(ingreso.monto || 0), 0),
    [ingresos]
  )

  return (
    <AdminLayout active="cash-income">
      <div className="ai-heading">
        <div>
          <h1>Ingresos en Efectivo</h1>
          <p>Registra donaciones y pagos recibidos en efectivo</p>
        </div>
        <button className="ai-new-button" type="button" onClick={abrirCrear}>
          <span>+</span> Registrar Ingreso
        </button>
      </div>

      {mensaje && <div className="ai-success">{mensaje}</div>}

      <section className="ai-cash-total" aria-label="Total de ingresos en efectivo">
        <div>
          <span>Total Ingresos en Efectivo</span>
          <strong>{formatearSoles(total)}</strong>
          <small>{ingresos.length} registros</small>
        </div>
        <div className="symbol">$</div>
      </section>

      <section className="ai-panel">
        {ingresos.length === 0 ? (
          <div className="ai-state">Aún no hay ingresos en efectivo registrados.</div>
        ) : (
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Monto</th>
                  <th>Origen</th>
                  <th>Fecha</th>
                  <th>Campaña</th>
                  <th>Registrado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id}>
                    <td className="ai-money">{formatearSoles(ingreso.monto)}</td>
                    <td>
                      <div className="ai-origin">
                        <strong>{ingreso.origen}</strong>
                        <small>{ingreso.descripcion}</small>
                      </div>
                    </td>
                    <td>{ingreso.fecha}</td>
                    <td>{ingreso.campana}</td>
                    <td>{ingreso.registrado_por}</td>
                    <td>
                      <div className="ai-actions">
                        <button
                          className="ai-icon edit"
                          type="button"
                          onClick={() => abrirEditar(ingreso)}
                          aria-label="Editar ingreso"
                        >
                          ✐
                        </button>
                        <button
                          className="ai-icon delete"
                          type="button"
                          onClick={() => setIngresoEliminar(ingreso)}
                          aria-label="Eliminar ingreso"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="ai-modal-overlay" role="presentation">
          <div className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="cash-modal-title">
            <div className="ai-modal-header">
              <h2 id="cash-modal-title">
                {modoModal === 'editar' ? 'Editar Ingreso en Efectivo' : 'Registrar Ingreso en Efectivo'}
              </h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>

            <form className="ai-form" onSubmit={handleSubmit} noValidate>
              <label className="ai-field">
                <span>Monto (S/.) *</span>
                <input
                  name="monto"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="100.00"
                />
                {errores.monto && <small>{errores.monto}</small>}
              </label>

              <label className="ai-field">
                <span>Origen o descripción *</span>
                <input
                  name="origen"
                  value={form.origen}
                  onChange={handleChange}
                  placeholder="Ej: Donante anónimo, Evento, etc."
                />
                {errores.origen && <small>{errores.origen}</small>}
              </label>

              <label className="ai-field">
                <span>Fecha *</span>
                <input name="fecha" type="date" value={form.fecha} onChange={handleChange} />
                {errores.fecha && <small>{errores.fecha}</small>}
              </label>

              <label className="ai-field">
                <span>Campaña *</span>
                <select name="campana" value={form.campana} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {campanas.map((campana) => (
                    <option key={campana.id || campana.campana_id} value={campana.id || campana.campana_id}>
                      {campana.titulo || campana.nombre}
                    </option>
                  ))}
                </select>
                {errores.campana && <small>{errores.campana}</small>}
              </label>

              <label className="ai-field">
                <span>Notas opcional</span>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleChange}
                  placeholder="Información adicional..."
                />
              </label>

              <label className="ai-field">
                <span>Registrado por</span>
                <input name="registrado_por" value={form.registrado_por} onChange={handleChange} />
              </label>

              <div className="ai-form-actions">
                <button className="ai-submit" type="submit" disabled={guardando}>
                  {modoModal === 'editar' ? 'Guardar Cambios' : 'Registrar'}
                </button>
                <button className="ai-cancel" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ingresoEliminar && (
        <div className="ai-modal-overlay" role="presentation">
          <div className="ai-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-income-title">
            <h2 id="delete-income-title">Eliminar ingreso</h2>
            <p>¿Estás seguro de eliminar este ingreso en efectivo? Esta acción no se puede deshacer.</p>
            <div className="ai-confirm-actions">
              <button className="ai-delete-confirm" type="button" onClick={confirmarEliminar}>
                Eliminar
              </button>
              <button className="ai-cancel" type="button" onClick={() => setIngresoEliminar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
