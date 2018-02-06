const debug = require("debug")("geisterbahn:runner");
const readlineSync = require("readline-sync");

const loader = require("./loader");
const output = require("./output");
const args = require("./args");

const results = [];
const breakpoints =
  (args.breakpoints + '').split(',')
  .map(unparsed => parseInt(unparsed));

const loopPoint = parseInt(args.loopPoint);

let currentTestNumber;
let loopPointTriggered = false;

function determineReturnCodeForResults(results) {
  debug("determining return code based on results");
  for(const testPackage of results) {
    for(const test of testPackage) {
      if(!test.passed) {
        return 1;
      }
    }
  }

  return 0;
}

function registerAllTestsForConfigurations(testConfigurations, page) {
  let tests = {};
  let testCount = 0;

  function registerDefinition(key, title, definition) {
    definition(page, (testTitle, testDefinition) => {
      testCount++;
      if(!tests[key]) tests[key] = {title: title, tests: {}};
      tests[key]['tests'][`${testTitle}${testCount}`] = {definition: testDefinition, title: testTitle};
    });
  }

  for(let i=0, j=testConfigurations.length; i<j; i++) {
    const testConfiguration = testConfigurations[i];
    const testPackageKey = `${i}${testConfiguration.name}`;

    if(testConfiguration.partialDefinitions) {
      for(const partial of testConfiguration.partialDefinitions) {
        registerDefinition(testPackageKey, testConfiguration.title, partial.definition);
      }
    }

    if(testConfiguration.definition) {
      registerDefinition(testPackageKey, testConfiguration.title, testConfiguration.definition);
    }
  }
  return [tests, testCount];
}

async function executeTestPackage(title, tests) {
  output.runningDefinition(title);
  let results = [];
  for(const testKey in tests) {
    output.runningTest(tests[testKey].title, currentTestNumber);
    let passed = false;
    let exc;
    try {
      await tests[testKey].definition();
      passed = true;
    } catch (e) {
      passed = false;
      exc = e;
    }
    output.testResult(passed, currentTestNumber);
    results.push({packageTitle:title, title:tests[testKey].title, testNumber:currentTestNumber, passed, exception:exc});
    if(breakpoints.indexOf(currentTestNumber) !== -1) {
      readlineSync.question('Breakpoint set, press <ENTER> to continue ');
    }
    if(currentTestNumber === loopPoint) {
      loopPointTriggered = true;
      break;
    }
    currentTestNumber++;
  }
  return results;
}

async function executeTestPackages(testPackages, testCount) {
  output.testCount(Object.keys(testPackages).length, testCount);
  currentTestNumber = 1;
  let resultSets = [];
  for(const testPackageKey in testPackages) {
    const testPackage = testPackages[testPackageKey];
    resultSets.push( await executeTestPackage(testPackage.title, testPackage.tests) );
    if(loopPointTriggered) {
      break;
    }
  }
  output.summary(resultSets);
  return resultSets;
}

async function run(testConfigurations, page) {
  debug(`running ${testConfigurations.length} test packages`);
  const configurationCount = testConfigurations.length;
  const [testPackages, testCount] = registerAllTestsForConfigurations(testConfigurations, page);
  debug(`registered ${testCount} tests`); let resultSets;

  resultSets = await executeTestPackages(testPackages, testCount);

  return {
    returnCode: determineReturnCodeForResults(resultSets),
    loop: loopPointTriggered
  };
}

module.exports = {run};
