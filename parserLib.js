const { logError } = require("./logger");

function parserApartamentData() {
  const initialState = __PRELOADED_STATE__.initialState;
  const components = initialState.components;

  const obtenerLocalizacion = () => {
    let localizacion = {
      coordenadas: components.location.map_info.location,
      calle: components.location.map_info.item_address,
    };

    const result =
      __PRELOADED_STATE__.initialState.components.location.map_info.item_location.split(
        ", "
      );

    if (result.length === 2) {
      localizacion.barrio = result[0];
      localizacion.ciudad = result[1];
    } else {
      localizacion.barrio = "Pasan cosas raras con esto. Avisar a soporte.";
      localizacion.ciudad = "Pasan cosas raras con esto. Avisar a soporte.";
      logError(`No esta completa la info, solamente tengo:  ${result}`);
    }

    return localizacion;
  };

  const obtenerGastosComunes = () => {
    const gastosComunesText =
      __PRELOADED_STATE__.initialState.components.technical_specifications.specs[0].attributes.find(
        (x) => x.id === "Gastos comunes"
      )?.text;

    const gastosComunesData = { valor: null, moneda: null };

    if (gastosComunesText) {
      const gastosComunesComponentes = gastosComunesText.split(" ");

      if (gastosComunesComponentes.length == 2) {
        gastosComunesData.valor = parseInt(gastosComunesComponentes[0]);
        gastosComunesData.moneda = gastosComunesComponentes[1];
      } else if (gastosComunesComponentes.length == 1) {
        if (parseInt(gastosComunesComponentes[0])) {
          gastosComunesData.valor = parseInt(gastosComunesComponentes[0]);
        } else {
          //Pueden poner una moneda sin gastos comunes?
          logError(
            `Hay un gasto comun que tiene moneda pero no valor :O ${initialState.id}`
          );
          gastosComunesData.moneda = gastosComunesComponentes[0];
        }
      }
    }

    return gastosComunesData;
  };

  const obtenerCaracteristicas = () => {
    return components.technical_specifications.specs[0].attributes.filter(
      (x) => x.id != "Gastos comunes"
    );
  };

  const obtenerAdicionales = () => {
    const adicionalesArrArr = components.technical_specifications.specs;
    let adicionalesArr = [];

    if (adicionalesArrArr.length > 0) {
      adicionalesArrArr.forEach((categoria) => {
        if (categoria.title != "Características") {
          console.log(categoria);
          const attributes = categoria.attributes.map(
            (x) => x.values.value_text.text
          );

          adicionalesArr = adicionalesArr.concat(attributes);
        }
      });
    }

    return adicionalesArr;
  };

  const obtenerImagenes = () => {
    const imagenesId = components.gallery.pictures.map((img) => img.id);

    const obtenerImagenLink = (imagenId) => {
      return `https://http2.mlstatic.com/D_NQ_NP_${imagenId}-O.webp`;
    };

    const imagenesLink = imagenesId.map((id) => obtenerImagenLink(id));

    return imagenesLink;
  };

  let apartamentData = {
    id: initialState.id,
    principal: {
      titulo: components.header.title,
      link: location.href,
    },
    costo: {
      precio: components.price.price.value,
      precioMoneda: components.price.price.currency_symbol,
      gastosComunes: null,
      gastosComunesMoneda: null,
    },
    localizacion: obtenerLocalizacion(),
    caracteristicas: obtenerCaracteristicas(),
    adicionales: obtenerAdicionales(),
    imagenesLink: obtenerImagenes(),
  };

  const gastosComunesData = obtenerGastosComunes(); //{ valor: null,  moneda : null}

  apartamentData.costo.gastosComunes = gastosComunesData.valor;
  apartamentData.costo.gastosComunesMoneda = gastosComunesData.moneda;

  return apartamentData;
}

exports.parserApartamentData = parserApartamentData;
