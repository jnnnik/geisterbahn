const colors = require("colors");

function o(str, newLine = true) {
  newLine === true ? console.log(str) : process.stdout.write(str);
}

function title(appName, versionNumber) {
  o("\n " +   `${appName} v${versionNumber}`.random.underline);
}

function testCount(count) {
  o(`\n running ${count} test package${count > 1 ? "s" : ""}`.grey);
}

function runningDefinition(definitionName) {
  o(`\n ${definitionName}`.magenta);
}

function runningTest(testName) {
  o(`    ${"....".grey} ${testName.yellow}`, false);
}

function testResult(success) {
  o( "\r    " + (success === true ? "PASS".green : "FAIL".red), false);
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
    for(const testResult of resultSet.tests) {
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
    o(` "${failure.definitionName} - ${failure.description}" FAILED `.black.bgRed);
    const except = failure.exception;
    if(except.message) {
      o(` ${except.message}`);
    }
    o(" " + failure.exception.stack.grey + "\n");
  }

}

function interactiveMessage() {
  o("\n " + "RUNNING IN INTERACTIVE MODE".underline + "\n Press <Enter> to advance each test when prompted by \"...\"");
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
  interactiveMessage,
  resetCharacter
};
