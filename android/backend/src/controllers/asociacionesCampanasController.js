const {
  Campana,
  CompaniaAsociacion
} = require('../models');

const obtenerCampanasAsociacion = async (req, res) => {
  try {

    const { asociacion_id } =
      req.usuarioAsociacion;

    const vinculaciones =
      await CompaniaAsociacion.findAll({
        where: {
          asociacion_id,
          estado: 'vinculada'
        }
      });

    const companiasIds =
      vinculaciones.map(
        v => v.compania_id
      );

    const campanas =
      await Campana.findAll({
        where: {
          compania_id: companiasIds
        }
      });

    return res.status(200).json({
      total: campanas.length,
      campanas
    });

  } catch (error) {

    console.error(
      '❌ Error obteniendo campañas:',
      error
    );

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const actualizarCampanaAsociacion =
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        titulo,
        descripcion,
        meta
      } = req.body;

      const campana =
        await Campana.findByPk(id);

      if (!campana) {
        return res.status(404).json({
          error: 'Campaña no encontrada'
        });
      }

      await campana.update({
        titulo:
          titulo || campana.titulo,

        descripcion:
          descripcion ||
          campana.descripcion,

        meta:
          meta || campana.meta
      });

      return res.status(200).json({
        message:
          'Campaña actualizada correctamente',
        campana
      });

    } catch (error) {

      console.error(
        '❌ Error actualizando campaña:',
        error
      );

      return res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  };

module.exports = {
  obtenerCampanasAsociacion,
  actualizarCampanaAsociacion
};