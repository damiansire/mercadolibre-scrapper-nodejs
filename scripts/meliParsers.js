const {
  attributeTextToDataBaseName,
  getViviendaIdFromUrl,
} = require("./meliLibs");

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
      location: ".ui-vip-location .ui-pdp-media__title",
    };

    const dataPreloaded = await page.evaluate(() => {
      return __PRELOADED_STATE__.initialState.components;
    });

    let houseData = {};

    houseData.price = dataPreloaded.price.price.value;
    houseData.priceCurrency = dataPreloaded.price.price.currency_symbol;
    houseData.title = dataPreloaded.header.title;

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

    houseData.link = await page.url();
    houseData.id = getViviendaIdFromUrl(houseData.link);
    houseData.calle = dataPreloaded.location.map_info?.item_address;

    try {
      const locationData =
        dataPreloaded.location.map_info?.item_location?.split(",") || [
          null,
          null,
        ];
      houseData.barrio = locationData[0];
      houseData.ciudad = locationData[1];
    } catch (err) {
      const locationData =
        dataPreloaded.location.map_info.item_location.split(",");
      console.error(
        "Hay un problema con la locacion de",
        houseData.id,
        " ",
        locationData
      );
    }

    //Parseo gastos comunes
    try {
      const gastosComunesPartes = houseData.gastoscomunes.split(" ");
      houseData.gastoscomunes = gastosComunesPartes[0];
      houseData.gastoscomunescurrency = gastosComunesPartes[1];
    } catch (error) {
      console.error(
        "Hay problemas con los gastos comunes de ",
        houseData.id,
        " ",
        houseData.gastosComunes
      );
      throw new Error("Problema con los gastos comunes");
    }

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
