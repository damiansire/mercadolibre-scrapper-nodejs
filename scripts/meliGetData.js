const puppeteer = require("puppeteer");
const { generatePageUrl } = require("./meliLibs");
const {
  SearchPageParser,
  HousePreviewParser,
  HousePageParser,
} = require("./meliParsers");

class MeliData {
  async initBrowser() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
  }

  async getPageAmountForBarrio(barrioName) {
    const pageUrl = generatePageUrl(1);
    //Voy a la url con los apartamento
    await this.page.goto(pageUrl);
    //Aca selecciono un apartamento

    const pageAmount = await SearchPageParser.getPageAmount(this.page);

    return Number(pageAmount);
  }

  async getApartamentsLinks(pageNumber) {
    const pageUrl = generatePageUrl(pageNumber);
    //Voy a la url con los apartamento
    await this.page.goto(pageUrl);
    //Aca selecciono un apartamento
    const housesElement = await this.page.$$(".ui-search-layout__item");

    //Todo: Cambiar esto por promise.all
    let housesData = [];
    for (let houseElement of housesElement) {
      const houseData = await HousePreviewParser.getLink(houseElement);
      housesData.push(houseData);
    }

    return housesData;
  }

  async getHouseUrl(url) {
    //Voy a la url con los apartamento
    await this.page.goto(url);

    const result = await parserHousePage(page);

    return result;
  }
}

module.exports = MeliData;
