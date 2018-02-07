const debug = require("debug")("geisterbahn:main");
const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const readlineSync = require("readline-sync");

const packageJson = require("../package.json");
const args = require("./lib/args");
const loader = require("./lib/loader");
const runner = require("./lib/runner");
const output = require("./lib/output");
const pageAugmentations = require("./lib/page-augmentations");

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
      debug("launching puppeteer");
      const browser = await puppeteer.launch(puppeteerOptions);
      const page = await browser.newPage();
      if(args.device) {
        await page.emulate(devices[args.device]);
      }
      await pageAugmentations.augment(page);
      result = await runner.run(tests, page);
      if(result.loop) {
        const userInput = readlineSync.question('Loop point hit; press <Enter> to restart, enter "q" to quit: ');
        if(userInput === 'q') break;
      }
    } while (result.loop);

    process.exit(result.returnCode);
  }
};
