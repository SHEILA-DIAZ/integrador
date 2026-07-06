import { useMemo, useRef, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { actualizarPerfil, obtenerMensajeApi } from '../../services/api'
import './AdminProfile.css'

const perfilMock = {
  nombres: 'Carlos',
  apellidos: 'Rodríguez',
  correo: 'carlos.rodriguez@roma1.pe',
  telefono: '987654321',
  departamento: 'Lima',
  provincia: 'Lima',
  distrito: 'Miraflores',
  direccion: 'Av. Larco 1234, Miraflores',
}

const dispositivosBase = [
  { id: 1, nombre: 'Chrome — MacOS', ubicacion: 'Lima, Perú · Ahora mismo', actual: true },
  { id: 2, nombre: 'FireSupport App — Android', ubicacion: 'Lima, Perú · Hace 2 horas' },
  { id: 3, nombre: 'Firefox — Windows', ubicacion: 'Callao, Perú · Hace 3 días' },
]

const notificacionesBase = {
  campanas: true,
  donaciones: true,
  cercanas: true,
  semanal: true,
  sistema: false,
}

const cargarJson = (clave, fallback) => {
  try {
    const data = JSON.parse(localStorage.getItem(clave) || 'null')
    return data && typeof data === 'object' ? data : fallback
  } catch {
    return fallback
  }
}

const obtenerUsuarioLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || localStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
}

const obtenerRol = () => {
  const usuario = obtenerUsuarioLocal()
  return usuario.role || usuario.rol || localStorage.getItem('userRole') || 'admin_compania'
}

const separarNombre = (nombre = '') => {
  const partes = String(nombre).trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { nombres: partes[0] || perfilMock.nombres, apellidos: perfilMock.apellidos }
  return { nombres: partes.slice(0, -1).join(' '), apellidos: partes.at(-1) }
}

const cargarPerfilInicial = () => {
  const usuario = obtenerUsuarioLocal()
  const guardado = cargarJson('adminProfileLocal', {})
  const nombreUsuario = usuario.nombre || usuario.name || usuario.nombres || ''
  const nombreSeparado = separarNombre(nombreUsuario)

  return {
    ...perfilMock,
    ...nombreSeparado,
    correo: usuario.email || usuario.correo || perfilMock.correo,
    ...guardado,
  }
}

const iniciales = (nombres, apellidos) => `${nombres?.[0] || 'C'}${apellidos?.[0] || 'R'}`.toUpperCase()
const rolLegible = (rol) => {
  if (rol === 'super_admin') return 'Admin Super'
  if (rol === 'admin_compania') return 'Admin Compañía'
  if (rol === 'admin_asociacion') return 'Admin Asociación'
  return 'Administrador'
}

export default function AdminProfile() {
  const [perfil, setPerfil] = useState(cargarPerfilInicial)
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' })
  const [mostrarPass, setMostrarPass] = useState({ actual: false, nueva: false, confirmar: false })
  const [dispositivos, setDispositivos] = useState(() => cargarJson('adminProfileDevices', dispositivosBase))
  const [notificaciones, setNotificaciones] = useState(() => cargarJson('adminProfileNotifications', notificacionesBase))
  const [toast, setToast] = useState(null)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const toastRef = useRef(null)
  const rol = obtenerRol()

  const nombreCompleto = useMemo(() => `${perfil.nombres} ${perfil.apellidos}`.trim(), [perfil])

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo })
    window.clearTimeout(toastRef.current)
    toastRef.current = window.setTimeout(() => setToast(null), 3200)
  }

  const cambiarPerfil = (event) => {
    const { name, value } = event.target
    setPerfil((actual) => ({ ...actual, [name]: value }))
  }

  const guardarDatosLocales = (nuevoPerfil) => {
    localStorage.setItem('adminProfileLocal', JSON.stringify(nuevoPerfil))
    const usuario = obtenerUsuarioLocal()
    const actualizado = {
      ...usuario,
      nombre: `${nuevoPerfil.nombres} ${nuevoPerfil.apellidos}`.trim(),
      email: nuevoPerfil.correo,
    }
    localStorage.setItem('user', JSON.stringify(actualizado))
  }

  const puedeActualizarBackend = !['admin_compania', 'admin_asociacion'].includes(rol)

  const guardarPerfil = async (event) => {
    event.preventDefault()
    if (!perfil.nombres.trim() || !perfil.correo.trim()) {
      mostrarToast('Nombre y correo son obligatorios', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.correo)) {
      mostrarToast('Ingresa un correo electrónico válido', 'error')
      return
    }

    setGuardandoPerfil(true)
    try {
      if (puedeActualizarBackend) {
        const response = await actualizarPerfil({
          nombre: `${perfil.nombres} ${perfil.apellidos}`.trim(),
          email: perfil.correo,
        })
        const usuario = response.data?.usuario
        if (usuario) localStorage.setItem('user', JSON.stringify(usuario))
      }
      guardarDatosLocales(perfil)
      mostrarToast('Perfil actualizado correctamente')
    } catch (err) {
      mostrarToast(obtenerMensajeApi(err, 'No se pudo actualizar el perfil'), 'error')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const actualizarPassword = async (event) => {
    event.preventDefault()
    if (!passwords.actual || !passwords.nueva || !passwords.confirmar) {
      mostrarToast('Completa los campos de contraseña', 'error')
      return
    }
    if (passwords.nueva.length < 6) {
      mostrarToast('La contraseña debe tener mínimo 6 caracteres', 'error')
      return
    }
    if (passwords.nueva !== passwords.confirmar) {
      mostrarToast('Las contraseñas no coinciden', 'error')
      return
    }

    setGuardandoPassword(true)
    try {
      if (puedeActualizarBackend) {
        await actualizarPerfil({ password: passwords.nueva })
      }
      setPasswords({ actual: '', nueva: '', confirmar: '' })
      mostrarToast('Contraseña actualizada correctamente')
    } catch (err) {
      mostrarToast(obtenerMensajeApi(err, 'No se pudo actualizar la contraseña'), 'error')
    } finally {
      setGuardandoPassword(false)
    }
  }

  const alternarNotificacion = (clave) => {
    setNotificaciones((actual) => {
      const nuevo = { ...actual, [clave]: !actual[clave] }
      localStorage.setItem('adminProfileNotifications', JSON.stringify(nuevo))
      mostrarToast('Preferencias guardadas')
      return nuevo
    })
  }

  const cerrarDispositivo = (id) => {
    setDispositivos((actuales) => {
      const nuevos = actuales.filter((dispositivo) => dispositivo.id !== id)
      localStorage.setItem('adminProfileDevices', JSON.stringify(nuevos))
      return nuevos
    })
    mostrarToast('Dispositivo cerrado localmente')
  }

  return (
    <AdminLayout active="profile">
      <section className="ap-page">
        {toast && <div className={`ap-toast ${toast.tipo}`} role="alert"><span>{toast.tipo === 'error' ? '!' : '✓'}</span>{toast.mensaje}</div>}

        <nav className="ap-breadcrumb" aria-label="Breadcrumb">
          <a href="/admin/dashboard">Dashboard</a>
          <span>›</span>
          <strong>Mi Perfil</strong>
        </nav>

        <header className="ap-heading">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal, seguridad y preferencias</p>
        </header>

        <section className="ap-hero">
          <div className="ap-hero-user">
            <div className="ap-avatar">
              {iniciales(perfil.nombres, perfil.apellidos)}
              <span>⊙</span>
            </div>
            <div>
              <h2>{nombreCompleto}</h2>
              <p>{perfil.correo}</p>
              <div className="ap-badges"><span>{rolLegible(rol)}</span><span className="active">● Activo</span></div>
            </div>
          </div>
          <div className="ap-access">
            <span>Último acceso</span>
            <strong>Hoy 09:15 AM</strong>
            <small>Lima, Perú</small>
          </div>
        </section>

        <div className="ap-grid">
          <div className="ap-left">
            <form className="ap-card ap-personal" onSubmit={guardarPerfil} noValidate>
              <h2><span>⊙</span> Información Personal</h2>
              <div className="ap-two-cols">
                <label><span>Nombres</span><input name="nombres" value={perfil.nombres} onChange={cambiarPerfil} /></label>
                <label><span>Apellidos</span><input name="apellidos" value={perfil.apellidos} onChange={cambiarPerfil} /></label>
              </div>
              <label><span>Correo Electrónico</span><input name="correo" value={perfil.correo} onChange={cambiarPerfil} /></label>
              <label><span>Teléfono</span><input name="telefono" value={perfil.telefono} onChange={cambiarPerfil} /></label>
              <div className="ap-two-cols">
                <label><span>Departamento</span><select name="departamento" value={perfil.departamento} onChange={cambiarPerfil}><option>Lima</option><option>Callao</option><option>Arequipa</option></select></label>
                <label><span>Provincia</span><select name="provincia" value={perfil.provincia} onChange={cambiarPerfil}><option>Lima</option><option>Callao</option><option>Arequipa</option></select></label>
              </div>
              <label><span>Distrito</span><select name="distrito" value={perfil.distrito} onChange={cambiarPerfil}><option>Miraflores</option><option>San Isidro</option><option>Cercado de Lima</option></select></label>
              <label><span>Dirección</span><input name="direccion" value={perfil.direccion} onChange={cambiarPerfil} /></label>
              <button className="ap-save" type="submit" disabled={guardandoPerfil}>{guardandoPerfil ? 'Guardando...' : 'Guardar Cambios'}</button>
            </form>

            <section className="ap-card ap-notifications">
              <h2><span>♧</span> Notificaciones</h2>
              {[
                ['campanas', 'Nuevas campañas', 'Alertas de campañas publicadas'],
                ['donaciones', 'Confirmación de donación', 'Recibo de donaciones procesadas'],
                ['cercanas', 'Alertas cercanas', 'Campañas en tu área'],
                ['semanal', 'Reporte semanal', 'Resumen de actividad'],
                ['sistema', 'Actualizaciones del sistema', 'Mantenimiento y nuevas funciones'],
              ].map(([clave, titulo, detalle]) => (
                <div className="ap-toggle-row" key={clave}>
                  <div><strong>{titulo}</strong><small>{detalle}</small></div>
                  <button className={notificaciones[clave] ? 'on' : ''} type="button" onClick={() => alternarNotificacion(clave)} aria-label={titulo}><span /></button>
                </div>
              ))}
            </section>
          </div>

          <div className="ap-right">
            <form className="ap-card ap-security" onSubmit={actualizarPassword} noValidate>
              <h2><span>▢</span> Seguridad — Contraseña</h2>
              {[
                ['actual', 'Contraseña Actual'],
                ['nueva', 'Nueva Contraseña'],
                ['confirmar', 'Confirmar Contraseña'],
              ].map(([clave, label]) => (
                <label className="ap-password-field" key={clave}>
                  <span>{label}</span>
                  <input type={mostrarPass[clave] ? 'text' : 'password'} value={passwords[clave]} onChange={(event) => setPasswords((actual) => ({ ...actual, [clave]: event.target.value }))} placeholder="••••••••" />
                  <button type="button" onClick={() => setMostrarPass((actual) => ({ ...actual, [clave]: !actual[clave] }))}>⊙</button>
                </label>
              ))}
              <div className="ap-strength"><i /><i /><i /><i /></div>
              <button className="ap-password-submit" type="submit" disabled={guardandoPassword}>▱ {guardandoPassword ? 'Actualizando...' : 'Actualizar Contraseña'}</button>
            </form>

            <section className="ap-card ap-devices">
              <h2><span>▯</span> Dispositivos Conectados</h2>
              {dispositivos.map((dispositivo) => (
                <div className={`ap-device ${dispositivo.actual ? 'current' : ''}`} key={dispositivo.id}>
                  <span>▱</span>
                  <div><strong>{dispositivo.nombre}</strong><small>⊙ {dispositivo.ubicacion}</small></div>
                  {dispositivo.actual ? <em>Actual</em> : <button type="button" onClick={() => cerrarDispositivo(dispositivo.id)}>Cerrar</button>}
                </div>
              ))}
            </section>

            <section className="ap-card ap-activity">
              <h2><span>◴</span> Actividad de Acceso Reciente</h2>
              {[
                ['ok', 'Inicio de sesión exitoso', 'Chrome — MacOS · Lima', 'Hoy 09:15 AM'],
                ['ok', 'Inicio de sesión exitoso', 'Android App · Lima', 'Ayer 06:30 PM'],
                ['bad', 'Intento fallido', 'Firefox — Windows · Callao', '15/05/2026 11:00 AM'],
              ].map(([tipo, titulo, detalle, fecha]) => (
                <div className="ap-activity-item" key={`${titulo}-${fecha}`}>
                  <span className={tipo}>{tipo === 'ok' ? '✓' : '!'}</span>
                  <p><strong>{titulo}</strong><small>{detalle}</small><small>{fecha}</small></p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
