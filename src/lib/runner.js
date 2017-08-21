const debug = require("debug")("geisterbahn:runner");

const loader = require("./loader");
const TestCase = require("./test-case");
const output = require("./output");

const results = [];

function determineReturnCodeForResults(results) {
  debug("determining return code based on results");
  for(const testPackage of results) {
    for(const test of testPackage.tests) {
      if(!test.passed) {
        return 1;
      }
    }
  }

  return 0;
}

async function run(testConfigurations, page) {
  debug(`running ${testConfigurations.length} tests`);
  output.testCount(testConfigurations.length);
  for(const testConfiguration of testConfigurations) {
    debug(`running "${testConfiguration.name}"`);
    const testCase = new TestCase(testConfiguration);
    await testCase.run(page);
    results.push({title:testConfiguration.title, tests:testCase.getTests()});
    debug(`done running "${testConfiguration.name}"`);
  }
  output.summary(results);
  return determineReturnCodeForResults(results);
}

module.exports = {run};
