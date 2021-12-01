const puppeteer = require("puppeteer");

const { parserApartamentData } = require("./parserLib");

async function getApartamentsLink(urlToParse) {
  //Configuracion inicial del navegador
  const options = { headless: false };

  //Crea un navegador y te devuelve referencia al navegador creado
  const browser = await puppeteer.launch(options);

  //Aca puedo empezar a usar browser
  const page = await browser.newPage();

  //Setea el viewport a la pagina
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  await page.goto(urlToParse);

  const obtenerLinks = () => {
    const getLink = (publicacion) => {
      return publicacion.getElementsByClassName("ui-search-result__content")[0]
        .href;
    };

    const todasLasPublicaciones = document.getElementsByClassName(
      "ui-search-layout__item"
    );

    return Array.from(todasLasPublicaciones).map((publicacion) =>
      getLink(publicacion)
    );
  };

  const obtenerLinkPromise = page.evaluate(obtenerLinks);

  const apartamentsLink = await obtenerLinkPromise;

  return apartamentsLink;
}

async function getApartamentData(apartamentLink) {
  //Configuracion inicial del navegador
  const options = { headless: false, defaultViewport: null, devtools: true };

  //Crea un navegador y te devuelve referencia al navegador creado
  const browser = await puppeteer.launch(options);

  //Aca puedo empezar a usar browser
  const page = await browser.newPage();

  await page.goto(apartamentLink);

  const apartamentData = await page.evaluate(parserApartamentData);

  return apartamentData;
}

function getPageNumberUrl(numeroDePagina) {
  const desdeParameter = `_Desde_${48 * (numeroDePagina - 1) + 1}`;
  return `https://listado.mercadolibre.com.uy/inmuebles/apartamentos/alquiler/montevideo${desdeParameter}_NoIndex_True`;
}

(async () => {
  const urlToParse =
    "https://listado.mercadolibre.com.uy/inmuebles/apartamentos/alquiler/montevideo";

  const apartamentsLink = await getApartamentsLink(urlToParse);
  for (let index = 0; index < apartamentsLink.length; index++) {
    console.log(`Parseando apartamento numero ${index}`);
    const apartamentData = await getApartamentData(apartamentsLink[index]);
    console.log(apartamentData);
  }
})();
