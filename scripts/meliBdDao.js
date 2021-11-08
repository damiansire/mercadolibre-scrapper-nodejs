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
  async saveApartamentsLinks(apartaments) {
    for (let apartament of apartaments) {
      const text = `INSERT INTO public.pendingsaves(link) VALUES($1) RETURNING *`;
      const values = [apartament.link];
      try {
        const res = await this.client.query(text, values);
        console.log(res.rows[0]);
      } catch (err) {
        console.error(err.stack);
      }
    }
  }

  async getPageToParser() {
    const client = new Client(config);
    client.connect();
    let res;
    try {
      const getElementQuery = "SELECT * FROM public.pendingsaves";
      res = await this.client.query(getElementQuery);
    } catch (err) {
      console.log(err.stack);
    }
    return res.rows;
  }
}

module.exports = MeliBdDao;
