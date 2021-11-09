function generatePageUrl(
  pageNumber,
  barrio = "pocitos",
  departamento = "montevideo"
) {
  let fromText = "";
  if (pageNumber > 1) {
    let fromNumber = 1 + 48 * (pageNumber - 1);
    fromText = `_Desde_${fromNumber}`;
  }
  const pageUrl = `https://listado.mercadolibre.com.uy/inmuebles/apartamentos/alquiler/${departamento}/${barrio}${fromText}/`;

  return pageUrl;
}

function attributeTextToDataBaseName(text) {
  const nameInDataBase = {
    "Superficie total": "superficietotal",
    "Área privada": "superficie",
    Ambientes: "ambientes",
    Dormitorios: "dormitorios",
    Baños: "baños",
    Cocheras: "cocheras",
    "Número de piso de la unidad": "numerodepisodellaunidad",
    Antigüedad: "antiguedad",
    "Tipo de departamento": "tipo",
    "Gastos comunes": "gastoscomunes",
    Disposición: "disposicion",
    Orientación: "orientacion",
    "Admite mascotas": "admitemascotas",
    "Apartamentos por piso": "apartamentosporpiso",
    "Cantidad de pisos": "cantidaddepisos",
  };
  if (nameInDataBase[text]) {
    return nameInDataBase[text];
  } else {
    columnasquefaltanenladb.add(text);
  }
}

module.exports = {
  generatePageUrl,
  attributeTextToDataBaseName,
};
