const MeliData = require("./meliGetData");
const MeliBdDao = require("./meliBdDao");

class ParserHandler {
  async setup() {
    this.meliData = new MeliData();
    await this.meliData.initBrowser();
    this.meliBdDao = new MeliBdDao();
  }

  async sendToParserFromBarrio(barrio = "pocitos") {
    const pageAmount = await this.meliData.getPageAmountForBarrio(barrio);
    for (let actualPage = 1; actualPage <= pageAmount; actualPage++) {
      const apartamentLink = await this.meliData.getApartamentsLinks(
        actualPage
      );
      await this.meliBdDao.saveApartamentsLinks(apartamentLink);
    }
  }

  async sendToParserForToday() {
    const pageAmount = await this.meliData.getPageAmountForToday();
    console.info(`Se van a parsear ${pageAmount} paginas`);
    for (let actualPage = 1; actualPage <= pageAmount; actualPage++) {
      console.info(`Obteniendo apartamentos para la pagina ${actualPage}`);
      const apartamentLink = await this.meliData.getApartamentsLinksForToday(
        actualPage
      );
      console.info(
        `Se han obtenido ${apartamentLink.length} apartamentos para esta pagina`
      );
      await this.meliBdDao.saveApartamentsLinks(apartamentLink);
      console.info("Se ha terminado de guardar");
    }
  }

  //Empieza a parsear las casas pendientes
  async startPendingParser() {
    console.info("Obteniendo las paginas pendientes");
    const apartamentList = await this.meliBdDao.getPagesToParser();

    for (const apartament of apartamentList) {
      console.info(`Parseando apartamento ${apartament.id}`);
      const result = await this.meliData.getHouseDataFromUrl(apartament.link);
      console.info(`Guardando apartamento ${apartament.id}`);
      this.meliBdDao.saveApartamentData(result);
    }
  }
}

module.exports = ParserHandler;
