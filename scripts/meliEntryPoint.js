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
    let apartamentList = await this.meliBdDao.getPagesToParser(5);
    while (apartamentList.length) {
      for (const apartament of apartamentList) {
        try {
          await this.parserApartamentData(apartament);
          await this.parserImage(apartament);
          await this.meliBdDao.deletePendingParser(apartament.link);
          console.info(
            `\n \n El apartamento ${apartament.link} fue parseado correctamente \n \n`
          );
        } catch (err) {
          console.log(err.message);
        }
      }
      apartamentList = await this.meliBdDao.getPagesToParser(5);
    }
  }

  async parserApartamentData(apartament) {
    console.info(`Parseando apartamento ${apartament.id}`);
    const result = await this.meliData.getHouseDataFromUrl(apartament.link);
    console.info(`Guardando apartamento ${apartament.id}`);
    await this.meliBdDao.saveApartamentData(result);
  }

  async parserImage(apartament) {
    console.info(`Parseando imagenes de ${apartament.link}`);
    const imagesLinks = await this.meliData.getImageDataFromUrl(
      apartament.link
    );
    console.info(`Guardando imagenes de ${apartament.link}`);
    await this.meliBdDao.saveImagesLink(imagesLinks, apartament.link);
  }
}

module.exports = ParserHandler;
