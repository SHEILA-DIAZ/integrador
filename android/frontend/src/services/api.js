import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const solicitarRegistroCompania = (datos) => api.post('/companies/request', datos)
export const obtenerSolicitudes = (params) => api.get('/companies/requests', { params })
export const aprobarSolicitud = (solicitud_id) => api.post('/companies/approve', { solicitud_id })
export const rechazarSolicitud = (solicitud_id, motivo) => api.post('/companies/reject', { solicitud_id, motivo })

export const registrarDonante = (datos) => api.post('/auth/register', datos)
export const loginDonante = (datos) => api.post('/auth/login', datos)

export const obtenerCampanas = (params) => api.get('/campaigns', { params })
export const crearCampana = (datos) => api.post('/campaigns', datos)
export const actualizarCampana = (id, datos) => api.put(`/campaigns/${id}`, datos)
export const generarCampaniaIA = (datos) => api.post('/ai/generate-campaign', datos)
export const obtenerProgresoCampana = (id) => api.get(`/campaigns/${id}/progress`)

export const crearDonacion = (datos) => api.post('/donations', datos)
export const obtenerHistorialDonaciones = (params) => api.get('/donations/history', { params })
export const obtenerComprobanteDonacion = (id) => api.get(`/donations/receipt/${id}`)

export const obtenerDonacionesVirtuales = (params) => api.get('/campaigns/virtual-income', { params })
export const registrarIngresoEfectivo = (datos) => api.post('/campaigns/cash-income', datos)

export const obtenerUsuariosCompania = () => api.get('/admin/users')
export const crearUsuarioCompania = (datos) => api.post('/companies/users', datos)
export const loginUsuarioCompania = (datos) => api.post('/companies/users/login', datos)
export const obtenerUsuariosRoles = () => api.get('/admin/users')
export const actualizarRolUsuario = (id, datos) => api.put(`/admin/users/${id}/role`, datos)
export const desactivarUsuario = (id, tipo) => api.put(`/admin/users/${id}/role`, { tipo, estado: 'inactivo' })
export const actualizarPerfil = (datos) => api.put('/users/profile', datos)
export const obtenerReportesGlobales = () => api.get('/admin/reports/global')
export const descargarReportePDF = () => api.get('/admin/reports/pdf', { responseType: 'blob' })
export const descargarReporteExcel = () => api.get('/admin/reports/excel', { responseType: 'blob' })

// Confirmar en backend el endpoint de listado antes de cerrar HU-14.
export const obtenerAsociaciones = () => api.get('/associations')
export const vincularAsociacion = (datos) => api.post('/associations/link', datos)
export const desvincularAsociacion = (datos) => api.delete('/associations/unlink', { data: datos })

export const loginAsociacion = (datos) => api.post('/associations/login', datos)
export const obtenerCampanasAsociacion = () => api.get('/associations/campaigns')
export const actualizarCampanaAsociacion = (id, datos) => api.put(`/associations/campaigns/${id}`, datos)

export const obtenerMensajeApi = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message
  if (err.response?.data?.error) return err.response.data.error
  if (err.response?.status) return `Error ${err.response.status}: ${err.response.statusText || 'La solicitud no pudo completarse.'}`
  if (err.request) return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.'
  return fallback
}

export default api
