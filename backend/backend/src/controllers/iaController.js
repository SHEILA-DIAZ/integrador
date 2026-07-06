const {
  generarContenidoCampanaIA
} = require('../services/geminiService');

const generarCampaniaIA = async (req, res) => {
  try {
    const {
      objetivo,
      meta,
      ubicacion,
      publico
    } = req.body;

    if (!objetivo || !meta || !ubicacion || !publico) {
      return res.status(400).json({
        error: 'Objetivo, meta, ubicación y público son obligatorios'
      });
    }

    const respuestaIA = await generarContenidoCampanaIA({
      objetivo,
      meta,
      ubicacion,
      publico
    });

    return res.status(200).json({
      message: 'Contenido generado con IA real Gemini',
      data: respuestaIA
    });

  } catch (error) {
    console.error(
      '❌ Error generando contenido IA Gemini:',
      error.message
    );

    return res.status(500).json({
      error: 'Error generando contenido con IA'
    });
  }
};

module.exports = {
  generarCampaniaIA
};