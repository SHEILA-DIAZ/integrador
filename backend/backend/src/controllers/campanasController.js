const {
  Campana,
  Donacion,
  IngresoEfectivo
} = require('../models');

const {
  generarAnalisisCampanaIA
} = require('../services/geminiService');

const getCampanas = async (req, res) => {
  try {
    const { status, categoria } = req.query;

    const where = {};

    if (status === 'active') {
      where.estado = 'activa';
    }

    if (status === 'closed') {
      where.estado = 'cerrada';
    }

    if (categoria) {
      where.categoria = categoria;
    }

    const campanas = await Campana.findAll({
      where
    });

    return res.status(200).json(campanas);

  } catch (error) {
    console.error('❌ Error obteniendo campañas:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const crearCampana = async (req, res) => {
  try {
    const {
      compania_id,
      titulo,
      descripcion,
      categoria,
      meta_monto,
      imagen_url
    } = req.body;

    if (!compania_id || !titulo || !meta_monto) {
      return res.status(400).json({
        error: 'Compañía, título y meta son obligatorios'
      });
    }

    const nuevaCampana = await Campana.create({
      compania_id,
      titulo,
      descripcion,
      categoria: categoria || 'otros',
      meta_monto,
      imagen_url,
      estado: 'activa'
    });

    return res.status(201).json({
      message: 'Campaña creada correctamente',
      campana: nuevaCampana
    });

  } catch (error) {
    console.error('❌ Error creando campaña:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const actualizarCampana = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      descripcion,
      categoria,
      meta_monto,
      imagen_url,
      estado
    } = req.body;

    const campana = await Campana.findByPk(id);

    if (!campana) {
      return res.status(404).json({
        error: 'Campaña no encontrada'
      });
    }

    await campana.update({
      titulo: titulo ?? campana.titulo,
      descripcion: descripcion ?? campana.descripcion,
      categoria: categoria ?? campana.categoria,
      meta_monto: meta_monto ?? campana.meta_monto,
      imagen_url: imagen_url ?? campana.imagen_url,
      estado: estado ?? campana.estado
    });

    return res.status(200).json({
      message: 'Campaña actualizada correctamente',
      campana
    });

  } catch (error) {
    console.error('❌ Error actualizando campaña:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const eliminarCampana = async (req, res) => {
  try {
    const { id } = req.params;

    const campana = await Campana.findByPk(id);

    if (!campana) {
      return res.status(404).json({
        error: 'CampaÃ±a no encontrada'
      });
    }

    await campana.destroy();

    return res.status(200).json({
      message: 'CampaÃ±a eliminada correctamente'
    });

  } catch (error) {
    console.error('âŒ Error eliminando campaÃ±a:', error);

    return res.status(500).json({
      error: 'No se pudo eliminar la campaÃ±a. Verifica que no tenga donaciones asociadas.'
    });
  }
};

const getDonacionesVirtuales = async (req, res) => {
  try {
    const donaciones = await Donacion.findAll({
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      total: donaciones.length,
      donaciones
    });

  } catch (error) {
    console.error('❌ Error obteniendo donaciones virtuales:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const registrarIngresoEfectivo = async (req, res) => {
  try {
    const {
      campana_id,
      descripcion,
      monto,
      registrado_por
    } = req.body;

    if (!campana_id || !descripcion || !monto || !registrado_por) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    const campana = await Campana.findByPk(campana_id);

    if (!campana) {
      return res.status(404).json({
        error: 'Campaña no encontrada'
      });
    }

    const ingreso = await IngresoEfectivo.create({
      campana_id,
      descripcion,
      monto,
      registrado_por
    });

    const montoActual =
      parseFloat(campana.monto_recaudado || 0) +
      parseFloat(monto);

    await campana.update({
      monto_recaudado: montoActual
    });

    return res.status(201).json({
      message: 'Ingreso registrado correctamente',
      ingreso
    });

  } catch (error) {
    console.error('❌ Error registrando ingreso:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const obtenerProgresoCampana = async (req, res) => {
  try {
    const { id } = req.params;

    const campana = await Campana.findByPk(id);

    if (!campana) {
      return res.status(404).json({
        error: 'Campaña no encontrada'
      });
    }

    const meta = parseFloat(campana.meta_monto || 0);
    const recaudado = parseFloat(campana.monto_recaudado || 0);

    const porcentaje =
      meta > 0
        ? Math.min(Math.round((recaudado / meta) * 100), 100)
        : 0;

    const aplicaVisualizacion3D =
      campana.categoria === 'uniforme_bombero' ||
      campana.categoria === 'equipamiento';

    let mensaje_visualizacion =
      'Esta campaña utiliza la visualización 3D del bombero.';

    let rango = '0%-25%';
    let estado_visual = 'bombero_basico';

    let descripcion_visual =
      'Bombero con equipamiento inicial. La campaña necesita mayor apoyo.';

    let partes_coloreadas = [];

    let analisis_ia = {
      estado: 'avance_bajo',
      probabilidad_exito: 'baja',
      mensaje: 'La campaña presenta un bajo nivel de avance.',
      recomendacion:
        'Incrementar la difusión en redes sociales y compartir la campaña con aliados.',
      estrategia_difusion:
        'Publicar la campaña en redes sociales locales y grupos vecinales.',
      horario_recomendado: '7:00 p.m. - 9:00 p.m.'
    };

    if (porcentaje >= 26 && porcentaje <= 50) {
      rango = '26%-50%';
      estado_visual = 'bombero_equipamiento_parcial';
      descripcion_visual =
        'Bombero con equipamiento parcial. La campaña muestra avance moderado.';
      partes_coloreadas = ['casco'];
    }

    if (porcentaje >= 51 && porcentaje <= 75) {
      rango = '51%-75%';
      estado_visual = 'bombero_casi_equipado';
      descripcion_visual =
        'Bombero casi equipado. La campaña está cerca de cumplir su meta.';
      partes_coloreadas = ['casco', 'uniforme'];
    }

    if (porcentaje >= 76) {
      rango = '76%-100%';
      estado_visual = 'bombero_completo';
      descripcion_visual =
        'Bombero completamente equipado. La campaña tiene un excelente avance.';
      partes_coloreadas = ['casco', 'uniforme', 'equipo'];
    }

    if (!aplicaVisualizacion3D) {
      estado_visual = 'no_aplica';
      partes_coloreadas = [];
      descripcion_visual =
        'Esta campaña no pertenece a una categoría compatible con la visualización 3D del bombero.';
      mensaje_visualizacion =
        'La visualización 3D solo aplica para campañas de uniforme o equipamiento de bombero.';
    }

    try {
      analisis_ia = await generarAnalisisCampanaIA({
        titulo: campana.titulo,
        categoria: campana.categoria,
        meta,
        recaudado,
        porcentaje,
        estado: campana.estado
      });
    } catch (iaError) {
      console.error(
        '⚠️ Gemini no pudo generar análisis. Se usará análisis por defecto:',
        iaError.message
      );
    }

    const modelo_3d = {
      activo: aplicaVisualizacion3D,
      url_modelo: '/models/bombero.glb',
      estado: estado_visual,
      porcentaje,
      rango,
      partes_coloreadas,
      mensaje: mensaje_visualizacion
    };

    return res.status(200).json({
      campana_id: campana.id,
      titulo: campana.titulo,
      categoria: campana.categoria,
      aplica_visualizacion_3d: aplicaVisualizacion3D,
      mensaje_visualizacion,
      modelo_3d,
      meta_monto: meta,
      monto_recaudado: recaudado,
      porcentaje,
      rango,
      estado_visual,
      partes_coloreadas,
      descripcion_visual,
      analisis_ia,
      estado_campana: campana.estado
    });

  } catch (error) {
    console.error('❌ Error obteniendo progreso campaña:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getCampanas,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
  getDonacionesVirtuales,
  registrarIngresoEfectivo,
  obtenerProgresoCampana
};
