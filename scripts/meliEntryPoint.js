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
    // <= pageAmount
    for (let actualPage = 0; actualPage <= 1; actualPage++) {
      const apartamentLink = await this.meliData.getApartamentsLinks(
        actualPage
      );
      console.log(apartamentLink);
      await this.meliBdDao.saveApartamentsLinks(apartamentLink);
    }
  }

  //Empieza a parsear las casas pendientes
  async startPendingParser() {
    //Obtiene las casas pendientes
    const apartamentList = await this.meliBdDao.getPagesToParser();
    //TODO: Cambiar esto por una iteracion, mientras queden casas pendientes
    const selectedApartament = apartamentList[0];
    //Obtiene la informacion de la casa de una url
    const result = await this.meliData.getHouseDataFromUrl(
      selectedApartament.link
    );
    //Guardar en la base de datos la informacion
  }
}

module.exports = ParserHandler;
