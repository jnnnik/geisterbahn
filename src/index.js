const debug = require("debug")("geisterbahn:main");
const readlineSync = require("readline-sync");

const packageJson = require("../package.json");
const args = require("./lib/args");
const loader = require("./lib/loader");
const runner = require("./lib/runner");
const output = require("./lib/output");

const puppeteerOptions = {
  headless: !args.show,
  devtools: !!args.devtools
};

module.exports = {
  run: async () => {
    debug("hi");
    output.title(packageJson.name, packageJson.version);

    const tests = await (args.tests ? loader.load(args.tests) : loader.loadAll());

    let result;
      
    do {
      result = await runner.run(tests, puppeteerOptions);
      if(result.loop) {
        const userInput = readlineSync.question('Loop point hit; press <Enter> to restart, enter "q" to quit: ');
        if(userInput === 'q') break;
      }
    } while (result.loop);

    process.exit(result.returnCode);
  }
};
