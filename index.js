const ParserHandler = require("./scripts/meliEntryPoint");

async function initApp() {
  console.log("Iniciando");
  const parserHandler = new ParserHandler();
  await parserHandler.setup();
  console.info("Obteniendo los links para enviar a parsear");
  //await parserHandler.sendToParserFromBarrio("pocitos");
  //await parserHandler.sendToParserForToday();
  console.info("Comenzando a parsear la informacion de las casas");
  await parserHandler.startPendingParser();
  process.exit(0);
}

initApp();

/*
__PRELOADED_STATE__.initialState.components.gallery.picture_config
*/
