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
      this.MeliBdDao.saveApartamentsLinks(apartamentLink);
    }
  }

  async startPendingParser() {
    const apartamentList = await getPagesToParser();
    const selectedApartament = apartamentList[0];
    const result = await parserHouseUrl(selectedApartament.link);
  }
}

module.exports = ParserHandler;
