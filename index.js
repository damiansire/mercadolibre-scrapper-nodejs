require("dotenv").config();
const puppeteer = require("puppeteer");
const { Pool, Client } = require("pg");

const config = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function getAllHouseInPage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  //Voy a la url con los apartamento
  await page.goto(apiUrl);
  //Aca le saco una captura de pantalla
  await page.screenshot({ path: "example.png" });
  //Aca selecciono un apartamento
  const housesElement = await page.$$(".ui-search-layout__item");

  //Todo: Cambiar esto por promise.all
  let housesData = [];
  for (let houseElement of housesElement) {
    const houseData = await getHouseData(houseElement);
    housesData.push(houseData);
  }

  await browser.close();

  return housesData;
}

async function getHouseData(houseElement) {
  const textAttributeToScrap = {
    price: ".price-tag-amount",
    title: ".ui-search-item__title",
    location: ".ui-search-item__location",
    attributes: ".ui-search-card-attributes",
  };

  const linkAttributoToScrap = {
    link: ".ui-search-link",
  };

  let houseData = {};

  //Cambiar por promise.all
  for (attribute in textAttributeToScrap) {
    houseData[attribute] = await houseElement.$eval(
      textAttributeToScrap[attribute],
      (data) => data.innerText
    );
  }

  //Cambiar por promise.all
  for (attribute in linkAttributoToScrap) {
    houseData[attribute] = await houseElement.$eval(
      linkAttributoToScrap[attribute],
      (data) => data.href
    );
  }

  return houseData;
}

async function saveApartamentInDataBase(apartaments) {
  const client = new Client(config);
  client.connect();

  for (let apartament of apartaments) {
    const text = `INSERT INTO public.viviendas(titulo, price, "location", "attributes", link) VALUES($1, $2, $3, $4, $5) RETURNING *`;
    const values = [apartament.link];

    // async/await
    try {
      const res = await client.query(text, values);
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    } catch (err) {
      console.error(err.stack);
    }
  }
  await client.end();
}
/*
getAllHouseInPage().then((apartaments) =>
  saveApartamentInDataBase(apartaments)
);
*/

// Parte de guardar los links

async function getApartamentsLinks(pageNumber) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  const pageUrl = generatePageUrl(pageNumber);
  //Voy a la url con los apartamento
  await page.goto(pageUrl);
  //Aca le saco una captura de pantalla
  await page.screenshot({ path: "example.png" });
  //Aca selecciono un apartamento
  const housesElement = await page.$$(".ui-search-layout__item");

  //Todo: Cambiar esto por promise.all
  let housesData = [];
  for (let houseElement of housesElement) {
    const houseData = await getLinkDataFromHouseElement(houseElement);
    housesData.push(houseData);
  }

  await browser.close();

  return housesData;
}

async function getLinkDataFromHouseElement(houseElement) {
  const linkSelector = ".ui-search-link";

  let houseData = {};

  houseData["link"] = await houseElement.$eval(
    linkSelector,
    (data) => data.href
  );

  return houseData;
}

async function saveApartamentsLinks(apartaments) {
  const client = new Client(config);
  client.connect();

  for (let apartament of apartaments) {
    const text = `INSERT INTO public.pendingsaves(link) VALUES($1) RETURNING *`;
    const values = [apartament.link];

    // async/await
    try {
      const res = await client.query(text, values);
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    } catch (err) {
      console.error(err.stack);
    }
  }
  await client.end();
}

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
  const pageUrl = `https://listado.mercadolibre.com.uy/inmuebles/apartamentos/alquiler/${departamento}/${barrio}${fromText}`;

  return pageUrl;
}

async function getPageAmountForBarrio(barrioName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  const pageUrl = generatePageUrl(1);
  //Voy a la url con los apartamento
  await page.goto(pageUrl);
  //Aca le saco una captura de pantalla
  await page.screenshot({ path: "example.png" });
  //Aca selecciono un apartamento

  const pageNumberText = await page.$eval(
    ".ui-search-search-result__quantity-results",
    (data) => data.innerText
  );

  const numberOfApartament = pageNumberText.split(" ")[0].replace(".", "");

  await browser.close();

  return Number(numberOfApartament);
}

async function initApp() {
  pageAmount = await getPageAmountForBarrio("pocitos");

  /*
  getApartamentsLinks(2).then((apartaments) =>
    saveApartamentsLinks(apartaments)
  );
  */
}

initApp();
