require("dotenv").config();
const puppeteer = require("puppeteer");
const { Pool, Client } = require("pg");

const apiUrl =
  "https://listado.mercadolibre.com.uy/inmuebles/apartamentos/alquiler/1-dormitorio/montevideo/pocitos/dueno/_PriceRange_0UYU-22000UYU_NoIndex_True#applied_filter_id%3Dprice%26applied_filter_name%3DPrecio%26applied_filter_order%3D1%26applied_value_id%3D*-22000%26applied_value_name%3DUYU*-UYU22000%26applied_value_order%3D3%26applied_value_results%3DUNKNOWN_RESULTS%26is_custom%3Dtrue";

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
    const values = [
      apartament.title,
      apartament.price,
      apartament.location,
      apartament.attributes,
      apartament.link,
    ];

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

getAllHouseInPage().then((apartaments) =>
  saveApartamentInDataBase(apartaments)
);
