export const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']

export const companiasAsociacion = [
  { id: 1, nombre: 'Compania Roma N°1', campanas: 12, recaudado: 125000, avance: 50, estado: 'Activa', vinculadaDesde: '2024-01-15' },
  { id: 2, nombre: 'Compania Italia N°4', campanas: 9, recaudado: 98000, avance: 54, estado: 'Activa', vinculadaDesde: '2024-02-20' },
  { id: 3, nombre: 'Compania Salvadora', campanas: 8, recaudado: 87000, avance: 87, estado: 'Activa', vinculadaDesde: '2024-03-10' },
  { id: 4, nombre: 'Compania Union N°15', campanas: 7, recaudado: 75000, avance: 38, estado: 'Activa', vinculadaDesde: '2024-04-05' },
  { id: 5, nombre: 'Compania Limena N°3', campanas: 6, recaudado: 62000, avance: 41, estado: 'Pendiente', vinculadaDesde: '2024-05-18' },
  { id: 6, nombre: 'Compania Callao N°7', campanas: 4, recaudado: 38000, avance: 42, estado: 'Activa', vinculadaDesde: '2024-06-01' },
  { id: 7, nombre: 'Compania Surco N°2', campanas: 5, recaudado: 51000, avance: 43, estado: 'Activa', vinculadaDesde: '2024-06-15' },
  { id: 8, nombre: 'Compania Miraflores N°9', campanas: 3, recaudado: 27000, avance: 34, estado: 'Pendiente', vinculadaDesde: '2024-07-22' },
]

export const campanasAsociacion = [
  { id: 1, titulo: 'Nuevo Camion de Bomberos para Lima', compania: 'Compania Roma N°1', categoria: 'Equipamiento', estado: 'Activa', recaudado: 125000, meta: 250000, donantes: 523 },
  { id: 2, titulo: 'Equipos de Rescate', compania: 'Compania Italia N°4', categoria: 'Equipamiento', estado: 'Activa', recaudado: 98000, meta: 120000, donantes: 412 },
  { id: 3, titulo: 'Capacitacion Especializada', compania: 'Compania Salvadora', categoria: 'Capacitacion', estado: 'Activa', recaudado: 87000, meta: 100000, donantes: 356 },
  { id: 4, titulo: 'Infraestructura Estacion', compania: 'Compania Union N°15', categoria: 'Infraestructura', estado: 'Cerrada', recaudado: 75000, meta: 200000, donantes: 289 },
  { id: 5, titulo: 'EPP y Uniformes 2026', compania: 'Compania Limena N°3', categoria: 'Uniforme Bombero', estado: 'Activa', recaudado: 62000, meta: 80000, donantes: 267 },
]

export const donacionesAsociacion = [
  { id: 'TRX-001234', donante: 'Maria Gonzalez', monto: 100, metodoPago: 'Tarjeta de Credito', fecha: '2026-05-25', campana: 'Nuevo Camion de Bomberos' },
  { id: 'TRX-001235', donante: 'Carlos Rodriguez', monto: 250, metodoPago: 'Yape', fecha: '2026-05-24', campana: 'Equipos de Rescate' },
  { id: 'TRX-001236', donante: 'Ana Martinez', monto: 50, metodoPago: 'Plin', fecha: '2026-05-24', campana: 'Nuevo Camion de Bomberos' },
  { id: 'TRX-001237', donante: 'Jose Lopez', monto: 500, metodoPago: 'Tarjeta de Debito', fecha: '2026-05-23', campana: 'Capacitacion de Bomberos' },
  { id: 'TRX-001238', donante: 'Laura Sanchez', monto: 75, metodoPago: 'Yape', fecha: '2026-05-23', campana: 'Nuevo Camion de Bomberos' },
]

export const efectivoAsociacion = [
  { monto: 5000, origen: 'Donacion empresa privada', fecha: '2026-06-05', campana: 'Nuevo Camion de Bomberos' },
  { monto: 1500, origen: 'Donacion en efectivo - evento', fecha: '2026-06-05', campana: 'Nuevo Camion de Bomberos' },
  { monto: 850, origen: 'Colecta publica', fecha: '2026-06-01', campana: 'Equipos de Rescate' },
  { monto: 2200, origen: 'Evento Benefico Municipal', fecha: '2026-05-28', campana: 'Capacitacion Bomberos' },
  { monto: 750, origen: 'Donante anonimo', fecha: '2026-05-22', campana: 'Equipos de Rescate' },
  { monto: 3000, origen: 'Fundacion solidaria', fecha: '2026-05-15', campana: 'Nuevo Camion de Bomberos' },
]

export const recaudacionMensual = [85000, 130000, 166000, 215000, 268000, 331000]
export const campanasPorMes = [38, 42, 45, 49, 53, 57]
export const donantesPorMes = [320, 480, 610, 830, 1100, 1847]

export const formatearSoles = (monto, decimales = 0) =>
  `S/ ${Number(monto || 0).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`

export const porcentajeCampana = (campana) =>
  campana.meta > 0 ? Math.min(Math.round((campana.recaudado / campana.meta) * 100), 100) : 0

export const normalizarCampanaApi = (campana, index) => ({
  id: campana.id || campana.campana_id || index + 1,
  titulo: campana.titulo || campana.nombre || campana.title || campanasAsociacion[index % campanasAsociacion.length].titulo,
  compania: campana.compania || campana.nombre_compania || campana.company_name || campana.company?.nombre || companiasAsociacion[index % companiasAsociacion.length].nombre,
  categoria: campana.categoria || campana.category || 'Equipamiento',
  estado: String(campana.estado || campana.status || 'activa').toLowerCase() === 'cerrada' ? 'Cerrada' : 'Activa',
  recaudado: Number(campana.monto_recaudado || campana.recaudado || campana.raised || 0),
  meta: Number(campana.meta_monto || campana.meta || campana.goal || 1),
  donantes: Number(campana.donantes || campana.total_donantes || 0),
})

export const normalizarLista = (data) => [
  data,
  data?.data,
  data?.campanas,
  data?.campaigns,
  data?.data?.campanas,
  data?.data?.campaigns,
  data?.items,
].find(Array.isArray) || []

export const normalizarDonacionApi = (donacion) => ({
  id: donacion.idTransaccion || donacion.transactionId || donacion.transaction_id || donacion.id || 'TRX',
  donante: donacion.donante || donacion.donante_nombre || donacion.donorName || donacion.donor_name || 'Donante FireSupport',
  monto: Number(donacion.monto || donacion.amount || 0),
  metodoPago: donacion.metodoPago || donacion.paymentMethod || donacion.payment_method || 'Yape',
  fecha: String(donacion.fecha || donacion.date || donacion.created_at || '').slice(0, 10),
  campana: donacion.campana || donacion.campaignName || donacion.campaign_name || donacion.campaign?.titulo || 'Campana registrada',
})
