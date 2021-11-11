const { attributeTextToDataBaseName } = require("./meliLibs");

class SearchPageParser {
  static async getPageAmount(page) {
    const pageNumberText = await page.$eval(
      ".andes-pagination__page-count",
      (data) => data.innerText
    );

    const pageAmount = pageNumberText.split(" ")[1];

    return pageAmount;
  }
}

class HousePreviewParser {
  static async getLink(houseElement) {
    const linkSelector = ".ui-search-link";

    let houseData = {};

    houseData["link"] = await houseElement.$eval(
      linkSelector,
      (data) => data.href
    );

    return houseData;
  }
}

class HousePageParser {
  static async parserHousePage(page) {
    const textAttributeToScrap = {
      title: ".ui-pdp-title",
      priceCurrency: ".price-tag-symbol",
      price: ".price-tag-fraction",
      location: ".ui-vip-location .ui-pdp-media__title",
    };

    let houseData = {};

    //Cambiar por promise.all
    for (let attribute in textAttributeToScrap) {
      try {
        houseData[attribute] = await page.$eval(
          textAttributeToScrap[attribute],
          (data) => data.innerText
        );
      } catch (error) {
        console.log("El apartamento ", page.url());
        console.log("No tiene ", attribute);
      }
    }

    //TODO: A futuro, seleccionar los tr y agarrar de ahi las duplas

    //Agregar todoss los atributos

    //Obtengo los label
    const labelText = await page.$$eval(
      ".andes-table__body tr .ui-pdp-specs__table__column-title",
      (data) => data.map((anchor) => anchor.innerText)
    );

    //Obtengo los values
    const valueText = await page.$$eval(
      ".andes-table__body tr span.andes-table__column--value",
      (data) => data.map((anchor) => anchor.innerText)
    );

    for (let index = 0; index < labelText.length; index++) {
      const dataBaseLabelName = attributeTextToDataBaseName(labelText[index]);
      houseData[dataBaseLabelName] = valueText[index];
    }

    houseData.link = page.url();

    return houseData;
  }

  static async parserAllImg(page) {
    const { picture_config, pictures } = await page.evaluate(() => {
      return __PRELOADED_STATE__.initialState.components.gallery;
    });

    return pictures.map((img) =>
      picture_config.template.replace("{id}", img.id)
    );
  }
}

//La preview es lo que se ve en la pagina de busqueda

module.exports = {
  SearchPageParser,
  HousePreviewParser,
  HousePageParser,
};
