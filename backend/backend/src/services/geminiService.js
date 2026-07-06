const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const modelo = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

const extraerJSON = (texto) => {
  try {
    const limpio = texto
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(limpio);
  } catch (error) {
    console.error('❌ Error parseando JSON Gemini:', error.message);
    return null;
  }
};

const generarContenidoCampanaIA = async ({
  objetivo,
  meta,
  ubicacion,
  publico
}) => {
  const prompt = `
Eres un asistente experto en campañas de donación para compañías de bomberos en Perú.

Genera contenido para una campaña solidaria.

Datos:
Objetivo: ${objetivo}
Meta económica: S/ ${meta}
Ubicación: ${ubicacion}
Público objetivo: ${publico}

Responde SOLO en JSON válido con esta estructura:

{
  "titulo": "",
  "descripcion": "",
  "palabras_clave": [],
  "texto_flyer": "",
  "recomendaciones": [],
  "colores_sugeridos": {
    "principal": "",
    "secundario": "",
    "fondo": ""
  }
}
`;

  const response = await ai.models.generateContent({
    model: modelo,
    contents: prompt
  });

  const data = extraerJSON(response.text);

  if (!data) {
    throw new Error('Gemini no devolvió un JSON válido');
  }

  return data;
};

const generarAnalisisCampanaIA = async ({
  titulo,
  categoria,
  meta,
  recaudado,
  porcentaje,
  estado
}) => {
  const prompt = `
Eres un analista experto en campañas de recaudación para bomberos.

Analiza la siguiente campaña:

Título: ${titulo}
Categoría: ${categoria}
Meta: S/ ${meta}
Monto recaudado: S/ ${recaudado}
Porcentaje de avance: ${porcentaje}%
Estado de campaña: ${estado}

Genera un análisis breve y útil para mejorar la campaña.

Responde SOLO en JSON válido con esta estructura:

{
  "estado": "",
  "probabilidad_exito": "",
  "mensaje": "",
  "recomendacion": "",
  "estrategia_difusion": "",
  "horario_recomendado": ""
}
`;

  const response = await ai.models.generateContent({
    model: modelo,
    contents: prompt
  });

  const data = extraerJSON(response.text);

  if (!data) {
    throw new Error('Gemini no devolvió un JSON válido');
  }

  return data;
};

module.exports = {
  generarContenidoCampanaIA,
  generarAnalisisCampanaIA
};