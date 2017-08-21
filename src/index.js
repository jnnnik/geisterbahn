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
  headless: !args.show
};

module.exports = {
  run: async () => {
    debug("hi");
    output.title(packageJson.name, packageJson.version);

    if(args.interactive) {
      output.interactiveMessage();
    }

    const tests = await (args.tests ? loader.load(args.tests) : loader.loadAll());

    debug("launching puppeteer");

    puppeteer.launch(puppeteerOptions).then(async browser => {
      const page = await browser.newPage();
      if(args.device) {
        await page.emulate(devices[args.device]);
      }
      await pageAugmentations.augment(page);

      const returnCode = await runner.run(tests, page);

      if(args.show) {
        readlineSync.question("All done here, press <Enter> to exit");
      }

      browser.close();

      process.exit(returnCode);
    });
  }
};
