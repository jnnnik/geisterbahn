const colors = require("colors");

function o(str, newLine = true) {
  newLine === true ? console.log(str) : process.stdout.write(str);
}

function title(appName, versionNumber) {
  o("\n " +   `${appName} v${versionNumber}`.random.underline);
}

function testCount(packageCount, testCount) {
  o(`\n running ${testCount} test${testCount > 1 ? "s" : ""} in ${packageCount} test package${packageCount > 1 ? "s" : ""}`.grey);
}

function runningDefinition(definitionName) {
  o(`\n ${definitionName}`.magenta);
}

function runningTest(testName, testNumber) {
  o(`    ${(testNumber+'').grey}\t ${testName.yellow}`, false);
}

function testResult(success, testNumber) {
  testNumber = (testNumber+'');
  o( "\r    " + (success === true ? testNumber.green : testNumber.red), false);
  o("\n",false);
}

function fatalError(msg, except) {
  o(`\n Fatal: ${msg}`.red);
  if(except) o(` ${except.stack.grey}`);
  o('');
  process.exit(1);
}

function summary(results) {
  let testCount = 0;
  let passCount = 0;
  let failCount = 0;

  let failures = [];

  for(const resultSet of results){
    for(const testResult of resultSet) {
      testCount += 1;
      if(testResult.passed !== true) {
        failCount += 1;
        testResult.definitionName = resultSet.title;
        failures.push(testResult);
      } else {
        passCount += 1;
      }
    }
  }

  o(`\n Summary: ${ (testCount + "").yellow }${":".grey}${ (passCount + "").green }${"/".grey}${ (failCount + "").red }\n`);

  for(const failure of failures) {
    o(` #${failure.testNumber} "${failure.packageTitle} - ${failure.title}" FAILED `.black.bgRed);
    const except = failure.exception;
    if(except.message) {
      o(` ${except.message}`);
    }
    o(" " + failure.exception.stack.grey + "\n");
  }

}

function resetCharacter() {
  o("\r", false);
}

module.exports = {
  title,
  testCount,
  runningDefinition,
  runningTest,
  testResult,
  fatalError,
  summary,
  resetCharacter
};
