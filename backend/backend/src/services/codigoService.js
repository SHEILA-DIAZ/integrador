const Compania = require('../models/Compania');

const generarCodigoUnico = async () => {
  let codigo;
  let existe = true;
  let contador = 1;

  while (existe) {
    codigo = `BOM-LIM-${String(contador).padStart(3, '0')}`;
    const companiaExistente = await Compania.findOne({ 
      where: { codigo_unico: codigo } 
    });
    if (!companiaExistente) {
      existe = false;
    }
    contador++;
  }

  return codigo;
};

module.exports = { generarCodigoUnico };