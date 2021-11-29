const puppeteer = require("puppeteer");
const { generatePageUrl, generateForTodayPageUrl } = require("./meliLibs");
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

  async getPageAmountForToday() {
    const pageUrl = generateForTodayPageUrl(1);
    //Voy a la url con los apartamento
    await this.page.goto(pageUrl);
    //Aca selecciono un apartamento

    const pageAmount = await SearchPageParser.getPageAmount(this.page);

    return Number(pageAmount);
  }

  async getApartamentsLinks(pageNumber, barrio) {
    const pageUrl = generatePageUrl(pageNumber, barrio);
    //Voy a la url con los apartamento
    await this.page.goto(pageUrl);
    //Aca selecciono un apartamento
    const housesElement = await this.page.$$(".ui-search-layout__item");

    //Todo: Cambiar esto por promise.all
    let housesData = [];
    for (let houseElement of housesElement) {
      const houseData = await HousePreviewParser.getLink(houseElement);
      const link = houseData.link.split("#")[0];
      housesData.push(link);
    }

    return housesData;
  }

  async getApartamentsLinksForToday(pageNumber) {
    const pageUrl = generateForTodayPageUrl(pageNumber);
    //Voy a la url con los apartamento
    await this.page.goto(pageUrl);
    //Aca selecciono un apartamento
    const housesElement = await this.page.$$(".ui-search-layout__item");

    //Todo: Cambiar esto por promise.all
    let housesData = [];
    for (let houseElement of housesElement) {
      const houseData = await HousePreviewParser.getLink(houseElement);
      const link = houseData.link.split("#")[0];
      housesData.push(link);
    }

    return housesData;
  }

  async getHouseDataFromUrl(url) {
    //Voy a la url con los apartamento
    await this.page.goto(url);
    const result = await HousePageParser.parserHousePage(this.page);
    return result;
  }

  async getImageDataFromUrl(url) {
    await this.page.goto(url);
    const imagesLinks = await HousePageParser.parserAllImg(this.page);
    return imagesLinks;
  }
}

module.exports = MeliData;
