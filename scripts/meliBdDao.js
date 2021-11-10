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
      const text = `INSERT INTO public.pendingsaves(link) VALUES($1) RETURNING *`;
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
    debugger;
    const text = `INSERT INTO public.viviendas(${fields}) VALUES(${valuesKeys}) RETURNING *`;
    const values = Object.values(apartamentData);
    try {
      const res = await this.client.query(text, values);
      console.log(`Se ha guardado el apartamento ${apartamentData.title}`);
    } catch (err) {
      console.error(err.stack);
    }
  }

  async getPagesToParser() {
    const client = new Client(config);
    client.connect();
    let res;
    try {
      const getElementQuery = "SELECT * FROM public.pendingsaves limit 100";
      res = await this.client.query(getElementQuery);
    } catch (err) {
      console.log(err.stack);
    }
    return res.rows;
  }
}

module.exports = MeliBdDao;
