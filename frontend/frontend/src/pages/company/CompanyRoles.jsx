import { useEffect, useMemo, useState } from 'react'
import CompanyAdminLayout from '../../components/CompanyAdminLayout'
import { actualizarRolUsuario, obtenerMensajeApi, obtenerUsuariosRoles } from '../../services/api'
import '../admin/AdminRoles.css'

const estadoForm = {
  nombre: '',
  email: '',
  rol: '',
  estado: 'activo',
}

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin_compania', label: 'Admin Compañía' },
  { value: 'admin_asociacion', label: 'Admin Asociación' },
  { value: 'donante', label: 'Donante' },
  { value: 'bombero', label: 'Bombero Interno' },
]

const etiquetasRol = Object.fromEntries(roles.map((rol) => [rol.value, rol.label]))

const obtenerColecciones = (data) => {
  const base = data?.data || data || {}
  const unificados = [
    ...(base.usuarios_generales || []).map((usuario) => ({ ...usuario, tipoUsuarioBackend: 'general' })),
    ...(base.usuarios_compania || []).map((usuario) => ({ ...usuario, tipoUsuarioBackend: 'compania' })),
    ...(base.usuarios_asociacion || []).map((usuario) => ({ ...usuario, tipoUsuarioBackend: 'asociacion' })),
  ]
  if (unificados.length > 0) return unificados
  return [data, data?.data, data?.users, data?.usuarios, data?.items].find(Array.isArray) || []
}

const normalizarEstado = (estado) => String(estado || 'activo').toLowerCase() === 'inactivo' ? 'inactivo' : 'activo'

const normalizarUsuario = (usuario, indice) => {
  const rol = usuario.rol || usuario.role || usuario.rol_key || 'bombero'
  return {
    id: usuario.id || usuario.usuario_id || usuario.user_id || `usuario-${indice}`,
    nombre: usuario.nombre || usuario.name || usuario.nombre_completo || usuario.full_name || 'Usuario',
    email: usuario.email || usuario.correo || '',
    rol,
    estado: normalizarEstado(usuario.estado || usuario.status),
    tipoUsuarioBackend: usuario.tipoUsuarioBackend || usuario.tipo || 'general',
  }
}

const esUsuarioLocal = (usuario) => String(usuario.id || '').startsWith('local-') || usuario.id === 'session-admin'

const obtenerUsuarioSesion = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const obtenerUsuariosFallback = () => {
  const usuario = obtenerUsuarioSesion()
  const email = usuario.email || 'bombero@firesupport.com'
  const nombre = usuario.nombre || usuario.name || 'Admin Compañía'
  const actuales = [{
    id: usuario.id || 'session-admin',
    nombre,
    email,
    rol: 'admin_compania',
    estado: normalizarEstado(usuario.estado || 'activo'),
    tipoUsuarioBackend: 'compania',
  }]

  try {
    const locales = JSON.parse(localStorage.getItem('companyUsersLocal') || '[]')
    if (Array.isArray(locales) && locales.length > 0) return [...actuales, ...locales.map(normalizarUsuario)]
  } catch {
    // Mantiene los usuarios base si localStorage no contiene JSON valido.
  }

  return [
    ...actuales,
    {
      id: 'local-bombero-1',
      nombre: 'Carlos Mendoza',
      email: 'carlos.mendoza@bomberosroma.pe',
      rol: 'bombero',
      estado: 'activo',
      tipoUsuarioBackend: 'compania',
    },
    {
      id: 'local-bombero-2',
      nombre: 'Ana Torres',
      email: 'ana.torres@bomberosroma.pe',
      rol: 'bombero',
      estado: 'activo',
      tipoUsuarioBackend: 'compania',
    },
  ]
}

const guardarUsuariosLocales = (lista) => {
  const locales = lista.filter((usuario) => esUsuarioLocal(usuario))
  localStorage.setItem('companyUsersLocal', JSON.stringify(locales))
}

export default function CompanyRoles() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [usuarioDesactivar, setUsuarioDesactivar] = useState(null)
  const [form, setForm] = useState(estadoForm)
  const [guardando, setGuardando] = useState(false)
  const [filtros, setFiltros] = useState({ nombre: '', email: '', estado: 'todos', rol: 'todos' })

  const mostrarToast = (tipo, texto) => {
    setToast({ tipo, texto })
    window.setTimeout(() => setToast(null), 3200)
  }

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const response = await obtenerUsuariosRoles()
      const lista = obtenerColecciones(response.data).map(normalizarUsuario)
      setUsuarios(lista.length > 0 ? lista : obtenerUsuariosFallback())
    } catch (err) {
      console.error('No se pudo cargar GET /api/admin/users', err)
      setUsuarios(obtenerUsuariosFallback())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const usuariosFiltrados = useMemo(() => usuarios.filter((usuario) => {
    const coincideNombre = usuario.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
    const coincideEmail = usuario.email.toLowerCase().includes(filtros.email.toLowerCase())
    const coincideEstado = filtros.estado === 'todos' || usuario.estado === filtros.estado
    const coincideRol = filtros.rol === 'todos' || usuario.rol === filtros.rol
    return coincideNombre && coincideEmail && coincideEstado && coincideRol
  }), [usuarios, filtros])

  const abrirEditar = (usuario) => {
    setUsuarioEditar(usuario)
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
    })
  }

  const handleFiltro = (event) => {
    const { name, value } = event.target
    setFiltros((actual) => ({ ...actual, [name]: value }))
  }

  const handleForm = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
  }

  const guardarCambios = async (event) => {
    event.preventDefault()
    if (!usuarioEditar) return
    setGuardando(true)
    try {
      setUsuarios((actuales) => {
        const actualizados = actuales.map((usuario) => (
          usuario.id === usuarioEditar.id
            ? { ...usuario, nombre: form.nombre, email: form.email, rol: form.rol, estado: form.estado }
            : usuario
        ))
        guardarUsuariosLocales(actualizados)
        return actualizados
      })
      setUsuarioEditar(null)
      mostrarToast('success', 'Usuario actualizado correctamente.')
    } catch (err) {
      mostrarToast('error', obtenerMensajeApi(err, 'No se pudo actualizar el usuario.'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarDesactivacion = async () => {
    if (!usuarioDesactivar) return
    setGuardando(true)
    try {
      if (esUsuarioLocal(usuarioDesactivar)) {
        setUsuarios((actuales) => actuales.map((usuario) => (
          usuario.id === usuarioDesactivar.id ? { ...usuario, estado: 'inactivo' } : usuario
        )))
        setUsuarioDesactivar(null)
        mostrarToast('success', 'Usuario desactivado localmente.')
        return
      }

      await actualizarRolUsuario(usuarioDesactivar.id, {
        tipo: usuarioDesactivar.tipoUsuarioBackend,
        rol: usuarioDesactivar.rol,
        estado: 'inactivo',
      })
      setUsuarioDesactivar(null)
      mostrarToast('success', 'Usuario desactivado correctamente.')
      await cargarUsuarios()
    } catch (err) {
      mostrarToast('error', obtenerMensajeApi(err, 'Este tipo de usuario no puede desactivarse desde este panel.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CompanyAdminLayout active="roles">
      <header className="rp-heading">
        <h1>Gestión de Roles y Permisos</h1>
        <p>Administra roles y permisos de usuarios</p>
      </header>

      <section className="rp-filters" aria-label="Filtros de roles y permisos">
        <label><span>⌕</span><input name="nombre" value={filtros.nombre} onChange={handleFiltro} placeholder="Buscar por nombre..." /></label>
        <label><span>⌕</span><input name="email" value={filtros.email} onChange={handleFiltro} placeholder="Buscar por email..." /></label>
        <select name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select name="rol" value={filtros.rol} onChange={handleFiltro}>
          <option value="todos">Todos los roles</option>
          {roles.map((rol) => <option key={rol.value} value={rol.value}>{rol.label}</option>)}
        </select>
      </section>

      <section className="rp-panel">
        {loading ? (
          <div className="rp-state">Cargando roles y permisos...</div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="rp-state">No hay usuarios con esos filtros.</div>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={`${usuario.tipoUsuarioBackend}-${usuario.id}`}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td><span className={`rp-role ${usuario.rol}`}>{etiquetasRol[usuario.rol] || usuario.rol}</span></td>
                    <td><span className={`rp-status ${usuario.estado}`}>{usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className="rp-actions">
                        <button type="button" onClick={() => abrirEditar(usuario)} aria-label={`Editar ${usuario.nombre}`}>✎</button>
                        {usuario.estado === 'activo' && (
                          <button className="rp-deactivate" type="button" onClick={() => setUsuarioDesactivar(usuario)} aria-label={`Desactivar ${usuario.nombre}`}>♙×</button>
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

      {usuarioEditar && (
        <div className="rp-overlay" role="presentation">
          <section className="rp-modal rp-edit company-role-modal" role="dialog" aria-modal="true" aria-labelledby="edit-role-title">
            <button className="rp-close" type="button" onClick={() => setUsuarioEditar(null)} aria-label="Cerrar modal">×</button>
            <h2 id="edit-role-title">Editar Usuario</h2>
            <form onSubmit={guardarCambios}>
              <label><span>Nombre Completo *</span><input name="nombre" value={form.nombre} onChange={handleForm} /></label>
              <label><span>Email *</span><input name="email" value={form.email} onChange={handleForm} /></label>
              <label>
                <span>Rol</span>
                <select name="rol" value={form.rol} onChange={handleForm}>
                  {roles.map((rol) => <option key={rol.value} value={rol.value}>{rol.label}</option>)}
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select name="estado" value={form.estado} onChange={handleForm}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
              <div className="rp-modal-actions">
                <button className="rp-primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                <button className="rp-secondary" type="button" onClick={() => setUsuarioEditar(null)} disabled={guardando}>Cancelar</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {usuarioDesactivar && (
        <div className="rp-overlay" role="presentation">
          <section className="rp-modal rp-confirm" role="dialog" aria-modal="true" aria-labelledby="deactivate-role-user-title">
            <h2 id="deactivate-role-user-title">Desactivar Usuario</h2>
            <p>¿Estás seguro de desactivar a <strong>{usuarioDesactivar.nombre}</strong>?</p>
            <div className="rp-modal-actions">
              <button className="rp-primary" type="button" onClick={confirmarDesactivacion} disabled={guardando}>{guardando ? 'Desactivando...' : 'Desactivar'}</button>
              <button className="rp-secondary" type="button" onClick={() => setUsuarioDesactivar(null)} disabled={guardando}>Cancelar</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`rp-toast ${toast.tipo === 'error' ? 'error' : ''}`}><span>{toast.tipo === 'error' ? '!' : '✓'}</span>{toast.texto}</div>}
    </CompanyAdminLayout>
  )
}
