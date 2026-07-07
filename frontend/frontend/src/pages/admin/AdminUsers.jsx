import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  actualizarPerfil,
  actualizarRolUsuario,
  crearUsuarioCompania,
  obtenerMensajeApi,
  obtenerUsuariosCompania,
} from '../../services/api'
import './AdminUsers.css'

const estadoInicial = {
  nombre: '',
  email: '',
  password: '',
  rol: 'bombero',
  estado: 'activo',
}

const roles = [
  { value: 'admin_compania', label: 'Administrador' },
  { value: 'bombero', label: 'Bombero' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'donante', label: 'Donante' },
  { value: 'admin_asociacion', label: 'Asociación' },
]

const estados = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

const etiquetasRol = {
  admin_compania: 'Administrador',
  administrador: 'Administrador',
  bombero: 'Bombero Interno',
  super_admin: 'Super Admin',
  admin_asociacion: 'Asociación',
  asociacion: 'Asociación',
}

const normalizarEstado = (estado) => {
  const valor = String(estado || 'activo').toLowerCase()
  return valor === 'inactivo' || valor === 'inactive' ? 'inactivo' : 'activo'
}

const normalizarRol = (rol) => {
  const valor = String(rol || 'bombero').toLowerCase()
  if (valor.includes('donante')) return 'donante'
  if (valor.includes('super')) return 'super_admin'
  if (valor.includes('asoci')) return 'admin_asociacion'
  if (valor.includes('admin')) return 'admin_compania'
  return 'bombero'
}

const normalizarTipoUsuario = (tipo) => {
  const valor = String(tipo || '').toLowerCase()
  if (valor.includes('asoci')) return 'asociacion'
  if (valor.includes('comp')) return 'compania'
  return 'general'
}

const normalizarRolParaTipo = (rol, tipo) => {
  const valor = normalizarRol(rol)
  if (tipo === 'general') {
    if (['super_admin', 'admin_compania', 'admin_asociacion', 'donante'].includes(valor)) return valor
    return 'donante'
  }
  if (tipo === 'compania') return valor === 'admin_compania' ? 'admin_compania' : 'bombero'
  if (tipo === 'asociacion') return 'admin_asociacion'
  return valor
}

const crearPayloadRol = (usuario, rol, estado) => {
  const tipo = usuario.tipoUsuarioBackend
  const payload = {
    tipo,
    rol: normalizarRolParaTipo(rol, tipo),
  }

  if (!(tipo === 'compania' && !usuario.estadoOriginal)) {
    payload.estado = normalizarEstado(estado)
  }

  return payload
}

const obtenerCompaniaId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.compania_id || usuario.company_id || usuario.compania?.id || localStorage.getItem('compania_id')
  } catch {
    return localStorage.getItem('compania_id')
  }
}

const obtenerUsuarioActualId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return usuario.id || usuario.user_id || usuario.usuario_id
  } catch {
    return null
  }
}

const obtenerColecciones = (data) => {
  const base = data?.data || data || {}
  const usuariosGenerales = Array.isArray(base.usuarios_generales) ? base.usuarios_generales : []
  const usuariosCompania = Array.isArray(base.usuarios_compania) ? base.usuarios_compania : []
  const usuariosAsociacion = Array.isArray(base.usuarios_asociacion) ? base.usuarios_asociacion : []

  if (usuariosGenerales.length || usuariosCompania.length || usuariosAsociacion.length) {
    return [
      ...usuariosGenerales.map((usuario) => ({ ...usuario, origen: 'general' })),
      ...usuariosCompania.map((usuario) => ({ ...usuario, origen: 'compania' })),
      ...usuariosAsociacion.map((usuario) => ({ ...usuario, origen: 'asociacion' })),
    ]
  }

  return [
    data,
    data?.data,
    data?.users,
    data?.usuarios,
    data?.data?.users,
    data?.data?.usuarios,
    data?.items,
  ].find(Array.isArray) || []
}

const normalizarUsuario = (usuario, index) => {
  const rol = normalizarRol(usuario.role || usuario.rol || usuario.tipo || usuario.origen)
  const tipoUsuarioBackend = normalizarTipoUsuario(usuario.origen || usuario.tipoUsuarioBackend || usuario.tipo_usuario)
  const estadoOriginal = usuario.estado || usuario.status
  return {
    id: usuario.id || usuario.user_id || usuario.usuario_id || `${rol}-${index}`,
    compania_id: usuario.compania_id || usuario.company_id,
    nombre: usuario.nombre || usuario.name || usuario.nombre_completo || usuario.full_name || 'Usuario sin nombre',
    email: usuario.email || usuario.correo || usuario.mail || '',
    rol,
    rolLabel: etiquetasRol[rol] || 'Bombero Interno',
    tipoUsuarioBackend,
    estadoOriginal,
    estado: normalizarEstado(estadoOriginal),
  }
}

const validar = (form, modo) => {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'Nombre obligatorio'
  if (!form.email.trim()) {
    errores.email = 'Email obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errores.email = 'Ingresa un email válido'
  }
  if (modo === 'crear' && form.password.trim().length < 6) {
    errores.password = 'La contraseña debe tener mínimo 6 caracteres'
  }
  if (!roles.some((rol) => rol.value === form.rol)) errores.rol = 'Rol obligatorio'
  if (!estados.some((estado) => estado.value === form.estado)) errores.estado = 'Estado obligatorio'
  return errores
}

const esSuperAdmin = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}')
    return (usuario.role || usuario.rol || localStorage.getItem('userRole')) === 'super_admin'
  } catch {
    return localStorage.getItem('userRole') === 'super_admin'
  }
}

export default function AdminUsers() {
  const modoSupervision = esSuperAdmin()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoModal, setModoModal] = useState('crear')
  const [form, setForm] = useState(estadoInicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [toast, setToast] = useState(null)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [usuarioDesactivar, setUsuarioDesactivar] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [filtros, setFiltros] = useState({ nombre: '', email: '', estado: 'todos', rol: 'todos' })

  const cargarUsuarios = async ({ silencioso = false } = {}) => {
    if (!silencioso) setLoading(true)
    setMensaje('')
    try {
      const response = await obtenerUsuariosCompania()
      const lista = obtenerColecciones(response.data).map(normalizarUsuario)
      setUsuarios(lista)
    } catch {
      setUsuarios([])
      setMensaje('')
    } finally {
      if (!silencioso) setLoading(false)
    }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioEditando(null)
    setForm(estadoInicial)
    setErrores({})
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  useEffect(() => {
    const cerrarConEsc = (event) => {
      if (event.key === 'Escape') {
        cerrarModal()
        setUsuarioDesactivar(null)
      }
    }
    document.addEventListener('keydown', cerrarConEsc)
    return () => document.removeEventListener('keydown', cerrarConEsc)
  }, [])

  const mostrarToast = (tipo, texto) => {
    setToast({ tipo, texto })
    window.setTimeout(() => setToast(null), 3200)
  }

  const abrirCrear = () => {
    if (modoSupervision) return
    setModoModal('crear')
    setUsuarioEditando(null)
    setForm(estadoInicial)
    setErrores({})
    setModalAbierto(true)
  }

  const abrirEditar = (usuario) => {
    if (modoSupervision) return
    setModoModal('editar')
    setUsuarioEditando(usuario)
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      estado: usuario.estado,
    })
    setErrores({})
    setModalAbierto(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    if (errores[name]) setErrores((actual) => ({ ...actual, [name]: '' }))
  }

  const handleFiltro = (event) => {
    const { name, value } = event.target
    setFiltros((actual) => ({ ...actual, [name]: value }))
  }

  const actualizarUsuarioLocal = (id, cambios) => {
    setUsuarios((actuales) => actuales.map((usuario) => (
      usuario.id === id
        ? {
            ...usuario,
            ...cambios,
            rolLabel: etiquetasRol[cambios.rol || usuario.rol] || usuario.rolLabel,
          }
        : usuario
    )))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nuevosErrores = validar(form, modoModal)
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setGuardando(true)
    try {
      if (modoModal === 'crear') {
        const companiaId = obtenerCompaniaId() || usuarios.find((usuario) => usuario.compania_id)?.compania_id
        if (!companiaId) {
          setErrores({ nombre: 'La sesión actual no incluye compania_id.' })
          return
        }

        const payload = {
          compania_id: Number(companiaId),
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          rol: form.rol,
        }
        const response = await crearUsuarioCompania(payload)
        const creado = normalizarUsuario(response.data?.usuario || response.data?.data || payload, usuarios.length)
        setUsuarios((actuales) => [{ ...creado, id: creado.id || `nuevo-${Date.now()}`, estado: 'activo' }, ...actuales])
        mostrarToast('success', 'Usuario creado correctamente.')
      } else if (usuarioEditando) {
        const cambios = {
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          rol: form.rol,
          estado: form.estado,
        }
        const usuarioActualId = obtenerUsuarioActualId()
        if (String(usuarioEditando.id) === String(usuarioActualId)) {
          await actualizarPerfil({ nombre: cambios.nombre, email: cambios.email })
        }
        await actualizarRolUsuario(usuarioEditando.id, crearPayloadRol(usuarioEditando, cambios.rol, cambios.estado))
        actualizarUsuarioLocal(usuarioEditando.id, cambios)
        await cargarUsuarios({ silencioso: true })
        mostrarToast('success', 'Usuario actualizado correctamente.')
      }

      cerrarModal()
    } catch (err) {
      mostrarToast('error', obtenerMensajeApi(err, 'No se pudo guardar el usuario.'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarDesactivar = async () => {
    if (!usuarioDesactivar) return
    const nuevoEstado = usuarioDesactivar.estado === 'activo' ? 'inactivo' : 'activo'
    setGuardando(true)
    try {
      await actualizarRolUsuario(usuarioDesactivar.id, crearPayloadRol(usuarioDesactivar, usuarioDesactivar.rol, nuevoEstado))
      actualizarUsuarioLocal(usuarioDesactivar.id, { estado: nuevoEstado })
      await cargarUsuarios({ silencioso: true })
      setUsuarioDesactivar(null)
      mostrarToast('success', nuevoEstado === 'activo' ? 'Usuario reactivado correctamente.' : 'Usuario desactivado correctamente.')
    } catch (err) {
      mostrarToast('error', obtenerMensajeApi(err, 'No se pudo actualizar el estado del usuario.'))
    } finally {
      setGuardando(false)
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const nombre = filtros.nombre.trim().toLowerCase()
    const email = filtros.email.trim().toLowerCase()
    return usuarios.filter((usuario) => {
      const coincideNombre = !nombre || usuario.nombre.toLowerCase().includes(nombre)
      const coincideEmail = !email || usuario.email.toLowerCase().includes(email)
      const coincideEstado = filtros.estado === 'todos' || usuario.estado === filtros.estado
      const coincideRol = filtros.rol === 'todos' || usuario.rol === filtros.rol
      return coincideNombre && coincideEmail && coincideEstado && coincideRol
    })
  }, [filtros, usuarios])

  return (
    <AdminLayout active="users">
      {toast && <div className={`au-toast ${toast.tipo}`} role="status"><span>{toast.tipo === 'success' ? '✓' : '!'}</span>{toast.texto}</div>}

      <div className="au-heading">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra cuentas de bomberos internos</p>
        </div>
        <div className="au-heading-actions">
          {modoSupervision && <span className="au-readonly-badge">Modo Supervisión</span>}
          <button className="au-new-button" type="button" onClick={abrirCrear} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : 'Nuevo usuario'}>
            <span>+</span> Nuevo Usuario
          </button>
        </div>
      </div>

      {mensaje && <div className="au-success error">{mensaje}</div>}

      <section className="au-filters" aria-label="Filtros de usuarios">
        <label><span>⌕</span><input name="nombre" value={filtros.nombre} onChange={handleFiltro} placeholder="Buscar por nombre..." /></label>
        <label><span>⌕</span><input name="email" value={filtros.email} onChange={handleFiltro} placeholder="Buscar por email..." /></label>
        <select name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="todos">Todos los estados</option>
          {estados.map((estado) => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
        </select>
        <select name="rol" value={filtros.rol} onChange={handleFiltro}>
          <option value="todos">Todos los roles</option>
          {roles.map((rol) => <option key={rol.value} value={rol.value}>{rol.label}</option>)}
        </select>
      </section>

      <section className="au-panel">
        {loading ? (
          <div className="au-state">Cargando usuarios...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="au-state">No hay usuarios con esos filtros.</div>
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
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.rolLabel}</td>
                    <td><span className={`au-badge ${usuario.estado}`}>{usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className="au-actions">
                        <button className="au-icon edit" type="button" onClick={() => abrirEditar(usuario)} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : `Editar ${usuario.nombre}`} aria-label={`Editar ${usuario.nombre}`}>✐</button>
                        {usuario.estado === 'activo' && (
                          <button className="au-icon toggle" type="button" onClick={() => !modoSupervision && setUsuarioDesactivar(usuario)} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : `Desactivar ${usuario.nombre}`} aria-label={`Desactivar ${usuario.nombre}`}>♙×</button>
                        )}
                        {usuario.estado === 'inactivo' && (
                          <button className="au-icon edit" type="button" onClick={() => !modoSupervision && setUsuarioDesactivar(usuario)} disabled={modoSupervision} title={modoSupervision ? 'Vista de supervisión' : `Reactivar ${usuario.nombre}`} aria-label={`Reactivar ${usuario.nombre}`}>↻</button>
                        )}
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
        <div className="au-modal-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cerrarModal()
        }}>
          <div className="au-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="au-modal-header">
              <h2 id="user-modal-title">{modoModal === 'editar' ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar modal">×</button>
            </div>

            <form className="au-form" onSubmit={handleSubmit} noValidate>
              <label className="au-field">
                <span>Nombre Completo *</span>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan Pérez García" />
                {errores.nombre && <small>{errores.nombre}</small>}
              </label>

              <label className="au-field">
                <span>Email *</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="usuario@bomberosroma.pe" />
                {errores.email && <small>{errores.email}</small>}
              </label>

              {modoModal === 'crear' && (
                <>
                  <label className="au-field">
                    <span>Contraseña Temporal *</span>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña temporal" />
                    {errores.password && <small>{errores.password}</small>}
                  </label>
                  <p className="au-help">El usuario deberá cambiar esta contraseña en su primer inicio de sesión</p>
                </>
              )}

              <label className="au-field">
                <span>Rol</span>
                <select name="rol" value={form.rol} onChange={handleChange}>
                  {roles.map((rol) => <option key={rol.value} value={rol.value}>{rol.label}</option>)}
                </select>
                {errores.rol && <small>{errores.rol}</small>}
              </label>

              {modoModal === 'editar' && (
                <label className="au-field">
                  <span>Estado</span>
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    {estados.map((estado) => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
                  </select>
                  {errores.estado && <small>{errores.estado}</small>}
                </label>
              )}

              <div className="au-form-actions">
                <button className="au-submit" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : modoModal === 'editar' ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                <button className="au-cancel" type="button" onClick={cerrarModal} disabled={guardando}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioDesactivar && (
        <div className="au-modal-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setUsuarioDesactivar(null)
        }}>
          <div className="au-confirm" role="dialog" aria-modal="true" aria-labelledby="deactivate-user-title">
            <h2 id="deactivate-user-title">{usuarioDesactivar.estado === 'activo' ? 'Desactivar Usuario' : 'Reactivar Usuario'}</h2>
            <p>
              ¿Estás seguro de {usuarioDesactivar.estado === 'activo' ? 'desactivar' : 'reactivar'} a <strong>{usuarioDesactivar.nombre}</strong>? {usuarioDesactivar.estado === 'activo' ? 'El usuario no podrá acceder al sistema hasta que sea reactivado.' : 'El usuario podrá volver a acceder al sistema.'}
            </p>
            <div className="au-confirm-actions">
              <button className="au-danger" type="button" onClick={confirmarDesactivar} disabled={guardando}>{guardando ? 'Guardando...' : usuarioDesactivar.estado === 'activo' ? 'Desactivar' : 'Reactivar'}</button>
              <button className="au-cancel" type="button" onClick={() => setUsuarioDesactivar(null)} disabled={guardando}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
