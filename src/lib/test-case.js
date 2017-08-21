const debug = require("debug")("geisterbahn:test-case");
const readlineSync = require("readline-sync");

const args = require("./args");
const output = require("./output");

class TestCase
{
  constructor(configuration) {
    this.configuration = configuration;
    this.tests = [];
  }

  async run(page) {
    debug("running...");
    output.runningDefinition(this.configuration.title);
    await this.configuration.definition.bind(this)(page, this.test.bind(this));
  }

  async test(description, definition) {
    debug(`running test "${description}"`);
    if(args.interactive) {
      debug("in interactive mode");
      readlineSync.question("    ...");
    }

    output.runningTest(description);
    let testResult = { description };
    try {
      await definition();
      testResult.passed = true;
    } catch( e ) {
      testResult.passed = false;
      testResult.exception = e;
    }
    this.tests.push(testResult);

    output.testResult(testResult.passed);
    debug("done");
  }

  getTests() {
    return this.tests;
  }
}

module.exports = TestCase;
