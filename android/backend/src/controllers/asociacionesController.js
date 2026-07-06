const {
  Compania,
  Asociacion,
  CompaniaAsociacion
} = require('../models');

const vincularAsociacion = async (req, res) => {
  try {
    const { compania_id, asociacion_id } = req.body;

    if (!compania_id || !asociacion_id) {
      return res.status(400).json({
        error: 'Compañía y asociación son obligatorias'
      });
    }

    const compania = await Compania.findByPk(compania_id);

    if (!compania) {
      return res.status(404).json({
        error: 'Compañía no encontrada'
      });
    }

    const asociacion = await Asociacion.findByPk(asociacion_id);

    if (!asociacion) {
      return res.status(404).json({
        error: 'Asociación no encontrada'
      });
    }

    const vinculoExistente = await CompaniaAsociacion.findOne({
      where: {
        compania_id,
        asociacion_id
      }
    });

    if (vinculoExistente && vinculoExistente.estado === 'vinculada') {
      return res.status(400).json({
        error: 'La asociación ya está vinculada a esta compañía'
      });
    }

    if (vinculoExistente && vinculoExistente.estado === 'desvinculada') {
      await vinculoExistente.update({
        estado: 'vinculada'
      });

      return res.status(200).json({
        message: 'Asociación vinculada nuevamente',
        vinculo: vinculoExistente
      });
    }

    const nuevoVinculo = await CompaniaAsociacion.create({
      compania_id,
      asociacion_id,
      estado: 'vinculada'
    });

    return res.status(201).json({
      message: 'Asociación vinculada correctamente',
      vinculo: nuevoVinculo
    });

  } catch (error) {
    console.error('❌ Error vinculando asociación:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const desvincularAsociacion = async (req, res) => {
  try {
    const { compania_id, asociacion_id } = req.body;

    if (!compania_id || !asociacion_id) {
      return res.status(400).json({
        error: 'Compañía y asociación son obligatorias'
      });
    }

    const vinculo = await CompaniaAsociacion.findOne({
      where: {
        compania_id,
        asociacion_id,
        estado: 'vinculada'
      }
    });

    if (!vinculo) {
      return res.status(404).json({
        error: 'Vínculo activo no encontrado'
      });
    }

    await vinculo.update({
      estado: 'desvinculada'
    });

    return res.status(200).json({
      message: 'Asociación desvinculada correctamente',
      vinculo
    });

  } catch (error) {
    console.error('❌ Error desvinculando asociación:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  vincularAsociacion,
  desvincularAsociacion
};