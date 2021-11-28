const { getViviendaIdFromUrl } = require("./meliLibs");
require("dotenv").config();
const { Pool } = require("pg");
const MeliData = require("./meliGetData");

class ParserHandler {
  async setup() {
    this.meliData = new MeliData();
    await this.meliData.initBrowser();
  }

  async sendToParserFromBarrio(barrio = "pocitos") {
    const pageAmount = await this.meliData.getPageAmountForBarrio(barrio);
    for (let actualPage = 1; actualPage <= pageAmount; actualPage++) {
      const apartamentLink = await this.meliData.getApartamentsLinks(
        actualPage
      );
      try {
        await saveApartamentsLinks(apartamentLink);
      } catch (err) {
        await deletePendingParser(apartamentLink);
        if (!(err.constraint == "pendingsaves_pk")) {
          throw new Error(
            `Problemas con el apartamento: ${apartamentLink} : ${err.name} : ${err.message}`
          );
        } else {
          console.log("Ya estaba el apartamento, se ignora");
        }
      }
    }
  }

  async sendToParserForToday() {
    const pageAmount = await this.meliData.getPageAmountForToday();
    console.info(`Se van a parsear ${pageAmount} paginas`);
    for (let actualPage = pageAmount; actualPage <= pageAmount; actualPage++) {
      console.log("Parseando la pagina 1 de ", barrio);
      try {
        console.info(`Obteniendo apartamentos para la pagina ${actualPage}`);
        const apartamentLink = await this.meliData.getApartamentsLinksForToday(
          actualPage
        );
        await saveApartamentsLinks(apartamentLink);
      } catch (err) {
        if (!(err.constraint == "pendingsaves_pk")) {
          throw new Error(
            `Problemas con el apartamento: ${apartamentData.link} : ${err.name} : ${err.message}`
          );
        }
        throw new Error(err);
      }
    }
  }

  //Empieza a parsear las casas pendientes
  async startPendingParser() {
    let apartamentList = await getPagesToParser(1);
    while (apartamentList.length) {
      for (const apartament of apartamentList) {
        try {
          await this.parserApartamentData(apartament);
          await this.parserImage(apartament);
          await deletePendingParser(apartament.link);
          console.info(
            `\n \n El apartamento ${apartament.link} fue parseado correctamente \n \n`
          );
        } catch (err) {
          console.log(err.message);
        }
      }
      apartamentList = await getPagesToParser(1);
    }
  }

  async parserApartamentData(apartament) {
    try {
      console.info(`Parseando apartamento ${apartament.id}`);
      if (apartament.id == 9321) {
        debugger;
      }
      const result = await this.meliData.getHouseDataFromUrl(apartament.link);
      console.info(`Guardando apartamento ${apartament.id}`);
      await saveApartamentData(result);
    } catch (error) {
      console.log("Error.");
      if (
        error?.constraint == "viviendas_pkey" ||
        error == "Problema con los gastos comunes"
      ) {
        await deletePendingParser(apartamentData.link);
      } else {
        console.error(`${error.name} : ${error.message}`);
        await logError(apartament.link, error.message);
        await deletePendingParser(apartament.link);
        throw new Error(`Problemas con el apartamento: ${apartament.link}`);
      }
    }
  }

  async parserImage(apartament) {
    console.info(`Parseando imagenes de ${apartament.link}`);
    const imagesLinks = await this.meliData.getImageDataFromUrl(
      apartament.link
    );
    console.info(`Guardando imagenes de ${apartament.link}`);
    const viviendaId = getViviendaIdFromUrl(apartament.link);
    await saveImagesLink(imagesLinks, viviendaId);
  }
}

//Base de datos

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

const pool = new Pool(config);

async function saveApartamentsLinks(links) {
  const client = await pool.connect();
  try {
    for (let link of links) {
      const text = `INSERT INTO public.pendingparser(link) VALUES($1) RETURNING *`;
      const values = [link];
      const res = await client.query(text, values);
    }
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

async function saveApartamentData(apartamentData) {
  let amount = Object.keys(apartamentData).length;
  let valuesKeys = "";
  for (let index = 1; index <= amount; index++) {
    if (index == 1) {
      valuesKeys = "$1";
    } else {
      valuesKeys += `,$${index}`;
    }
  }
  const fields = Object.keys(apartamentData).join(",");
  const text = `INSERT INTO public.viviendas(${fields}) VALUES(${valuesKeys}) RETURNING *`;
  const values = Object.values(apartamentData);
  console.log("Conectando al pool");
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.log(err);
  }
  console.log("Coneccion al pool ok");
  try {
    //Si da un error el insert, va al catch
    console.log("Haciendo query de guardado.");
    const res = await client.query(text, values);
  } catch (err) {
    console.log("Error. Capa Query a bd.");
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function saveImagesLink(imagesLink, viviendaId) {
  for (let imgLink of imagesLink) {
    await saveImg(imgLink, viviendaId);
  }
}

async function saveImg(imgLink, viviendaId) {
  //Cuidado la inyeccion sql
  const text = `INSERT INTO public.imagenes(viviendaid,imageurl) VALUES($1,$2) RETURNING *`;
  const values = [viviendaId, imgLink];
  const client = await pool.connect();
  try {
    const res = await client.query(text, values);
  } catch (err) {
    console.error(err.message);
    throw new Error(
      `Problemas la imagen ${imgLink} del apartamento ${viviendaId}`
    );
  } finally {
    client.release();
  }
}

async function getPagesToParser(numberOfLinks) {
  const client = await pool.connect();
  let res;
  try {
    const getElementQuery = `SELECT * FROM public.pendingparser limit ${numberOfLinks}`;
    res = await client.query(getElementQuery);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
  return res.rows;
}

async function deletePendingParser(apartamentLink) {
  //Cuidado la inyeccion sql
  const text = `DELETE FROM public.pendingparser WHERE link = $1 RETURNING *`;
  const values = [apartamentLink];
  const client = await pool.connect();
  try {
    const res = await client.query(text, values);
  } catch (err) {
    console.error(err.message);
    throw new Error(
      `Problemas al eliminar de la tabla pendingParser el apartamento ${apartamentLink}`
    );
  } finally {
    client.release();
  }
}

async function logError(link, error) {
  const text = `INSERT INTO public.error (link, error) VALUES($1, $2) RETURNING *`;
  const values = [link, error];
  const client = await pool.connect();
  try {
    const res = await client.query(text, values);
  } catch (err) {
    console.error(err.stack);
    throw new Error("No se ha podido insertar el error");
  } finally {
    client.release();
  }
}

module.exports = ParserHandler;
