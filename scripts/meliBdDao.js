require("dotenv").config();

const { Client } = require("pg");

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

class MeliBdDao {
  constructor() {
    this.client = new Client(config);
    this.client.connect();
  }

  async saveApartamentsLinks(links) {
    for (let link of links) {
      const text = `INSERT INTO public.pendingparser(link) VALUES($1) RETURNING *`;
      const values = [link];
      try {
        const res = await this.client.query(text, values);
        console.log(`Se ha guardado el link ${link}`);
      } catch (err) {
        console.error(err.stack);
      }
    }
  }

  async saveApartamentData(apartamentData) {
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
    try {
      //Si da un error el insert, va al catch
      const res = await this.client.query(text, values);
      console.log(`Se ha guardado el apartamento ${apartamentData.title}`);
    } catch (err) {
      console.error(`${err.name} : ${err.message}`);
      throw new Error(`Problemas con el apartamento: ${apartamentData.link}`);
    }
  }

  //Pasar esto a ORM
  async saveImagesLink(imagesLink, viviendaId) {
    for (let imgLink of imagesLink) {
      await this.saveImg(imgLink, viviendaId);
    }
  }

  async saveImg(imgLink, viviendaId) {
    //Cuidado la inyeccion sql
    const text = `INSERT INTO public.imagenes(viviendaid,imageurl) VALUES($1,$2) RETURNING *`;
    const values = [viviendaId, imgLink];
    try {
      debugger;
      const res = await this.client.query(text, values);
      console.log(
        `Se ha guardado la imagen ${imgLink} de la vivienda ${viviendaId}`
      );
      console.log(res);
    } catch (err) {
      console.error(err.message);
      throw new Error(`Problemas con el apartamento ${err.link}`);
    }
  }

  async getPagesToParser() {
    const client = new Client(config);
    client.connect();
    let res;
    try {
      const getElementQuery = "SELECT * FROM public.pendingparser limit 5";
      res = await this.client.query(getElementQuery);
    } catch (err) {
      console.log(err.stack);
    }
    return res.rows;
  }
}

module.exports = MeliBdDao;
