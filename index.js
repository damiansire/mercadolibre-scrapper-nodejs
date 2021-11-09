const ParserHandler = require("./scripts/meliEntryPoint");

async function initApp() {
  const parserHandler = new ParserHandler();
  await parserHandler.setup();
  //await parserHandler.sendToParserFromBarrio("pocitos");
  await parserHandler.startPendingParser();
  console.log("done");
  return "done";
}

initApp();
