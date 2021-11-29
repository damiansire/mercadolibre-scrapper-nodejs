const ParserHandler = require("./scripts/meliEntryPoint");

async function initApp() {
  console.log("Iniciando");
  const parserHandler = new ParserHandler();
  await parserHandler.setup();
  console.info("Obteniendo los links para enviar a parsear");
  const barrios = [
    "centro",
    "ciudad-vieja",
    "cordon",
    "parque-rodo",
    "pocitos-nuevo",
    "tres-cruces",
  ];
  for (let index = 0; index < barrios.length; index++) {
    await parserHandler.sendToParserFromBarrio(barrios[index]);
  }
  //await parserHandler.sendToParserForToday();
  console.info("Comenzando a parsear la informacion de las casas");
  await parserHandler.startPendingParser();
  process.exit(0);
}

initApp();

/*
__PRELOADED_STATE__.initialState.components.gallery.picture_config
*/
