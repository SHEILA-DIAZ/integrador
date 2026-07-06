import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { crearUsuarioCompania, obtenerMensajeApi, obtenerUsuariosCompania } from '../../services/api'
import './AdminUsers.css'

const estadoInicial = {
  nombre: '',
  email: '',
  password: '',
  rol: 'Bombero Interno',
}

const normalizarLista = (data) => {
  if (Array.isArray(data?.usuarios_compania)) return data.usuarios_compania
  if (Array.isArray(data?.data?.usuarios_compania)) return data.data.usuarios_compania

  const candidatos = [
    data,
    data?.data,
    data?.users,
    data?.usuarios,
    data?.data?.users,
    data?.data?.usuarios,
    data?.items,
  ]

  return candidatos.find(Array.isArray) || []
}

const obtenerCompaniaId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.compania_id || usuario.company_id || usuario.compania?.id || localStorage.getItem('compania_id')
  } catch {
    return localStorage.getItem('compania_id')
  }
}

const normalizarUsuario = (usuario) => ({
  id: usuario.id || usuario.user_id || `user-${Date.now()}`,
  compania_id: usuario.compania_id || usuario.company_id,
  nombre: usuario.nombre || usuario.name || usuario.nombre_completo || usuario.full_name || '',
  email: usuario.email || usuario.correo || '',
  password: usuario.password || usuario.password_temporal || usuario.temporary_password || '',
  rol: usuario.rol || usuario.role_label || 'Bombero Interno',
  role: usuario.role || usuario.rol_key || 'bombero',
  estado: usuario.estado || usuario.status || 'Activo',
})

const validar = (form, modo) => {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'Nombre requerido'
  if (!form.email.trim()) {
    errores.email = 'Email requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errores.email = 'Ingresa un email válido'
  }
  if (modo === 'crear' && !form.password.trim()) {
    errores.password = 'Contraseña temporal requerida'
  }

  return errores
}

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoModal, setModoModal] = useState('crear')
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [, setUsuarioEditando] = useState(null)
  const [usuarioDesactivar, setUsuarioDesactivar] = useState(null)
  const [recarga, setRecarga] = useState(0)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargarUsuarios = async () => {
      setLoading(true)
      try {
        const response = await obtenerUsuariosCompania()
        const lista = normalizarLista(response.data).map(normalizarUsuario)
        if (!cancelado) setUsuarios(lista)
      } catch (err) {
        if (!cancelado) {
          setUsuarios([])
          setMensaje(obtenerMensajeApi(err, 'No se pudieron cargar los usuarios internos. Intenta nuevamente.'))
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargarUsuarios()

    return () => {
      cancelado = true
    }
  }, [recarga])

  const abrirCrear = () => {
    setModoModal('crear')
    setUsuarioEditando(null)
    setForm(estadoInicial)
    setErrores({})
    setModalAbierto(true)
  }

  const abrirEditar = (usuario) => {
    setModoModal('editar')
    setUsuarioEditando(usuario)
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: usuario.password || '',
      rol: usuario.rol || 'Bombero Interno',
    })
    setErrores({})
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioEditando(null)
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
    const nuevosErrores = validar(form, modoModal)
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    if (modoModal === 'crear') {
      const companiaId = obtenerCompaniaId() || usuarios.find((usuario) => usuario.compania_id)?.compania_id
      if (!companiaId) {
        setMensaje('La sesión actual no incluye compania_id para crear usuarios internos.')
        return
      }

      const payload = {
        compania_id: Number(companiaId),
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        rol: 'bombero',
      }
      setGuardando(true)
      try {
        await crearUsuarioCompania(payload)
      } catch (err) {
        setMensaje(obtenerMensajeApi(err, 'No se pudo crear el usuario interno. Intenta nuevamente.'))
        return
      } finally {
        setGuardando(false)
      }

      setMensaje('Usuario interno creado correctamente')
      setRecarga((actual) => actual + 1)
    } else {
      setMensaje('El backend no expone todavía un endpoint para editar usuarios internos.')
      return
    }

    cerrarModal()
  }

  const toggleEstado = (usuario) => {
    setMensaje(`El backend no expone todavía un endpoint para cambiar el estado de ${usuario.nombre}.`)
  }

  const confirmarDesactivar = () => {
    if (!usuarioDesactivar) return
    toggleEstado(usuarioDesactivar)
    setUsuarioDesactivar(null)
  }

  const handleToggle = (usuario) => {
    if (usuario.estado === 'Activo') {
      setUsuarioDesactivar(usuario)
      return
    }
    toggleEstado(usuario)
  }

  return (
    <AdminLayout active="users">
      <div className="au-heading">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra cuentas de bomberos internos</p>
        </div>
        <button className="au-new-button" type="button" onClick={abrirCrear}>
          <span>+</span> Nuevo Usuario
        </button>
      </div>

      {mensaje && <div className="au-success">{mensaje}</div>}

      <section className="au-panel">
        {loading ? (
          <div className="au-state">Cargando usuarios internos...</div>
        ) : usuarios.length === 0 ? (
          <div className="au-state">Aún no hay usuarios internos registrados.</div>
        ) : (
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.rol}</td>
                    <td>
                      <span className={`au-badge ${usuario.estado.toLowerCase()}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td>
                      <div className="au-actions">
                        <button
                          className="au-icon edit"
                          type="button"
                          onClick={() => abrirEditar(usuario)}
                          aria-label={`Editar ${usuario.nombre}`}
                        >
                          ✐
                        </button>
                        <button
                          className="au-icon toggle"
                          type="button"
                          onClick={() => handleToggle(usuario)}
                          aria-label={`${usuario.estado === 'Activo' ? 'Desactivar' : 'Reactivar'} ${usuario.nombre}`}
                        >
                          ♙×
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
        <div className="au-modal-overlay" role="presentation">
          <div className="au-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="au-modal-header">
              <h2 id="user-modal-title">
                {modoModal === 'editar' ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>

            <form className="au-form" onSubmit={handleSubmit} noValidate>
              <label className="au-field">
                <span>Nombre Completo *</span>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez García"
                />
                {errores.nombre && <small>{errores.nombre}</small>}
              </label>

              <label className="au-field">
                <span>Email *</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="usuario@bomberosroma.pe"
                />
                {errores.email && <small>{errores.email}</small>}
              </label>

              <label className="au-field">
                <span>Contraseña Temporal {modoModal === 'crear' ? '*' : ''}</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña temporal"
                />
                {errores.password && <small>{errores.password}</small>}
              </label>
              <p className="au-help">El usuario deberá cambiar esta contraseña en su primer inicio de sesión</p>

              <label className="au-field">
                <span>Rol Asignado</span>
                <input name="rol" value={form.rol} readOnly />
              </label>

              <div className="au-form-actions">
                <button className="au-submit" type="submit" disabled={guardando}>
                  {modoModal === 'editar' ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
                <button className="au-cancel" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioDesactivar && (
        <div className="au-modal-overlay" role="presentation">
          <div className="au-confirm" role="dialog" aria-modal="true" aria-labelledby="deactivate-user-title">
            <h2 id="deactivate-user-title">Desactivar Usuario</h2>
            <p>
              ¿Estás seguro de desactivar a <strong>{usuarioDesactivar.nombre}</strong>? El usuario no podrá acceder al sistema hasta que sea reactivado.
            </p>
            <div className="au-confirm-actions">
              <button className="au-danger" type="button" onClick={confirmarDesactivar}>
                Desactivar
              </button>
              <button className="au-cancel" type="button" onClick={() => setUsuarioDesactivar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
