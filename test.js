const puppeteer = require("puppeteer");

const MeliBdDao = require("./scripts/meliBdDao");

(async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  await page.goto(
    "https://apartamento.mercadolibre.com.uy/MLU-603991184-apartamento-punta-carretas-_JM"
  );

  //__PRELOADED_STATE__.initialState.components.gallery
  const viviendaId = "MLU-603991184-apartamento-punta-carretas-_JM";
  debugger;
  await page.screenshot({ path: "example.png" });

  const picturesUrl = await parserAllImg(page);

  const meliBdDao = new MeliBdDao();

  meliBdDao.saveImgLink(picturesUrl, viviendaId);

  await browser.close();
})();

async function parserAllImg(page) {
  const { picture_config, pictures } = await page.evaluate(() => {
    return __PRELOADED_STATE__.initialState.components.gallery;
  });

  return pictures.map((img) => picture_config.template.replace("{id}", img.id));
}

meliBdDao.saveImgLink(picturesUrl, viviendaId);
