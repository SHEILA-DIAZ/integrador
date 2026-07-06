import { desvincularAsociacion, obtenerAsociaciones, vincularAsociacion } from './api'

const asociacionesTemporales = [
  {
    id: 1,
    nombre: 'Asociación Nacional de Bomberos',
    email: 'contacto@anb.pe',
    telefono: '987654321',
    fechaVinculacion: '2026-01-15',
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'Asociación de Bomberos Voluntarios Lima',
    email: 'info@abvlima.pe',
    telefono: '912345678',
    fechaVinculacion: '2026-02-20',
    estado: 'Activo',
  },
]

const normalizarLista = (data) => {
  const base = data?.data || data || {}
  const lista = [
    base,
    base.asociaciones,
    base.associations,
    base.items,
    base.data?.asociaciones,
    base.data?.associations,
  ].find(Array.isArray)

  if (!lista) return []

  return lista.map((asociacion, index) => ({
    id: asociacion.id || asociacion.asociacion_id || index + 1,
    nombre: asociacion.nombre || asociacion.name || asociacion.razon_social || 'Asociación sin nombre',
    email: asociacion.email || asociacion.correo || asociacion.contacto_email || 'sin-correo@asociacion.pe',
    telefono: asociacion.telefono || asociacion.phone || asociacion.celular || '000000000',
    fechaVinculacion: String(asociacion.fechaVinculacion || asociacion.fecha_vinculacion || asociacion.created_at || '').slice(0, 10) || '2026-01-15',
    estado: asociacion.estado || asociacion.status || 'Activo',
  }))
}

export const listarAsociacionesVinculadas = async () => {
  try {
    const response = await obtenerAsociaciones()
    const lista = normalizarLista(response.data)
    return {
      data: lista.length > 0 ? lista : asociacionesTemporales,
      temporal: lista.length === 0,
    }
  } catch {
    return {
      data: asociacionesTemporales,
      temporal: true,
    }
  }
}

export const vincularAsociacionExistente = async ({ compania_id, asociacion }) => {
  const asociacionId = asociacion.id || Date.now()
  await vincularAsociacion({ compania_id, asociacion_id: asociacionId })
  return {
    ...asociacion,
    id: asociacionId,
    fechaVinculacion: new Date().toISOString().slice(0, 10),
    estado: 'Activo',
  }
}

export const desvincularAsociacionExistente = ({ compania_id, asociacion_id }) =>
  desvincularAsociacion({ compania_id, asociacion_id })

export const crearAsociacionTemporal = (form) => ({
  id: Date.now(),
  nombre: form.nombre.trim(),
  email: form.email.trim().toLowerCase(),
  telefono: form.telefono.trim(),
  fechaVinculacion: new Date().toISOString().slice(0, 10),
  estado: 'Activo',
})
