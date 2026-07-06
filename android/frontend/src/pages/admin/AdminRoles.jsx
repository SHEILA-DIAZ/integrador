import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  actualizarRolUsuario,
  desactivarUsuario,
  obtenerMensajeApi,
  obtenerUsuariosRoles,
} from '../../services/api'
import './AdminRoles.css'

const opcionesRol = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin_compania', label: 'Admin Compañía' },
  { value: 'admin_asociacion', label: 'Admin Asociación' },
  { value: 'donante', label: 'Donante' },
  { value: 'bombero', label: 'Bombero Interno' },
]

const etiquetasRol = Object.fromEntries(opcionesRol.map((rol) => [rol.value, rol.label]))

const normalizarLista = (data) => {
  const respuesta = data?.data || data
  const coleccionesAdmin = [
    ...(respuesta?.usuarios_generales || []).map((usuario) => ({ ...usuario, tipo: 'general' })),
    ...(respuesta?.usuarios_compania || []).map((usuario) => ({ ...usuario, tipo: 'compania' })),
    ...(respuesta?.usuarios_asociacion || []).map((usuario) => ({ ...usuario, tipo: 'asociacion' })),
  ]
  if (coleccionesAdmin.length > 0) return coleccionesAdmin

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

const normalizarEstado = (estado) =>
  String(estado || 'activo').toLowerCase() === 'activo' ? 'Activo' : 'Inactivo'

const normalizarUsuario = (usuario, indice) => {
  const rol = usuario.rol || usuario.role || usuario.rol_key || 'donante'

  return {
    id: usuario.id || usuario.usuario_id || usuario.user_id || `usuario-${indice}`,
    nombre: usuario.nombre || usuario.name || usuario.nombre_completo || usuario.full_name || 'Usuario',
    email: usuario.email || usuario.correo || '',
    rol,
    tipo: usuario.tipo || 'general',
    estado: normalizarEstado(usuario.estado || usuario.status),
  }
}

export default function AdminRoles() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [usuarioDesactivar, setUsuarioDesactivar] = useState(null)
  const [rolSeleccionado, setRolSeleccionado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let cancelado = false

    const cargarUsuarios = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await obtenerUsuariosRoles()
        if (!cancelado) setUsuarios(normalizarLista(response.data).map(normalizarUsuario))
      } catch (err) {
        if (!cancelado) {
          setUsuarios([])
          setError(obtenerMensajeApi(err, 'No se pudieron cargar los roles y permisos. Intenta nuevamente.'))
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

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const abrirEditar = (usuario) => {
    setError('')
    setUsuarioEditar(usuario)
    setRolSeleccionado(usuario.rol)
  }

  const guardarRol = async (event) => {
    event.preventDefault()
    if (!usuarioEditar || !rolSeleccionado) return

    setGuardando(true)
    setError('')
    try {
      await actualizarRolUsuario(usuarioEditar.id, {
        tipo: usuarioEditar.tipo,
        rol: rolSeleccionado,
      })
      setUsuarioEditar(null)
      setToast('Rol actualizado exitosamente')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setError(obtenerMensajeApi(err, 'No se pudo actualizar el rol. Intenta nuevamente.'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarDesactivacion = async () => {
    if (!usuarioDesactivar) return

    setGuardando(true)
    setError('')
    try {
      const response = await desactivarUsuario(usuarioDesactivar.id, usuarioDesactivar.tipo)
      if (normalizarEstado(response.data?.usuario?.estado) !== 'Inactivo') {
        throw new Error('El backend no permite desactivar este tipo de usuario.')
      }
      setUsuarioDesactivar(null)
      setToast('Usuario Desactivado')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setError(obtenerMensajeApi(err, err.message || 'No se pudo desactivar el usuario. Intenta nuevamente.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout active="roles">
      <header className="rp-heading">
        <h1>Gestión de Roles y Permisos</h1>
        <p>Administra roles y permisos de usuarios</p>
      </header>

      {error && <div className="rp-error">{error}</div>}

      <section className="rp-panel">
        {loading ? (
          <div className="rp-state">Cargando roles y permisos...</div>
        ) : usuarios.length === 0 ? (
          <div className="rp-state">Aún no hay usuarios registrados.</div>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Nombre</th>
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
                    <td>
                      <span className={`rp-role ${usuario.rol}`}>
                        {etiquetasRol[usuario.rol] || usuario.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`rp-status ${usuario.estado.toLowerCase()}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td>
                      <div className="rp-actions">
                        <button type="button" onClick={() => abrirEditar(usuario)} aria-label={`Editar rol de ${usuario.nombre}`}>
                          &#9998;
                        </button>
                        {usuario.estado === 'Activo' && (
                          <button className="rp-deactivate" type="button" onClick={() => setUsuarioDesactivar(usuario)} aria-label={`Desactivar ${usuario.nombre}`}>
                            &#9817;&times;
                          </button>
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
          <section className="rp-modal rp-edit" role="dialog" aria-modal="true" aria-labelledby="edit-role-title">
            <button className="rp-close" type="button" onClick={() => setUsuarioEditar(null)} aria-label="Cerrar modal">&times;</button>
            <h2 id="edit-role-title">Editar Rol</h2>
            <p>Usuario: <strong>{usuarioEditar.nombre}</strong></p>
            <form onSubmit={guardarRol}>
              <label>
                <span>Rol</span>
                <select value={rolSeleccionado} onChange={(event) => setRolSeleccionado(event.target.value)} required>
                  {opcionesRol.map((rol) => (
                    <option key={rol.value} value={rol.value}>{rol.label}</option>
                  ))}
                </select>
              </label>
              <div className="rp-modal-actions">
                <button className="rp-primary" type="submit" disabled={guardando}>Guardar</button>
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
              <button className="rp-primary" type="button" onClick={confirmarDesactivacion} disabled={guardando}>Desactivar</button>
              <button className="rp-secondary" type="button" onClick={() => setUsuarioDesactivar(null)} disabled={guardando}>Cancelar</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="rp-toast"><span>&#10003;</span>{toast}</div>}
    </AdminLayout>
  )
}
