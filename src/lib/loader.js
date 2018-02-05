const debug = require("debug")("geisterbahn:loader");
const path = require("path");
const fs = require("fs");

const output = require("./output");
const config = require("./config");

const testDir = path.resolve(process.cwd(), config.geisterbahn.testsDirectory);

let requiredTests = [];

debug(`test path: ${testDir}`);

async function checkTestsDir() {
  debug("checking test path");
  return new Promise((resolve) => {
    fs.exists(testDir, (exists) => {
      if(!exists) {
        output.fatalError(`Could not read test directory ${testDir}`);
      }
      debug("test path OK");
      resolve();
    });
  })
}

async function loadAll() {
  await checkTestsDir();
  debug("loading all");
  const testNames = await scanDirForTests(testDir);
  debug(`found: "${testNames}"`);
  requireAll(testNames);
  return requiredTests;
}

async function load(arg) {
  await checkTestsDir();
  const testNames = arg.split(",");
  debug(`loading "${testNames}"`);
  requireAll(testNames);
  return requiredTests;
}

async function scanDirForTests(dir) {
  return new Promise(resolve => {
    fs.readdir(testDir, null, (err, files) => {
      resolve(files.map(file => file.replace(/\.js$/, "")));
    });
  });
}

function requireAll(testNames) {
  debug(`requiring all: "${testNames}"`);
  testNames
    .filter(testName => {
      if(testName.indexOf('_') === 0) return false;
      try {
        const stat = fs.lstatSync(path.resolve(testDir, `${testName}.js`));
        if(stat.isDirectory()) return false;
      } catch(_) {
        return false;
      }
      return true;
    })
    .forEach(testName => requireTest(testName));
}

function requireTest(testName) {
  debug(`requireTest("${testName}")`);
  const requirePath = path.resolve(testDir, testName);
  try {
    const required = require( requirePath );
    required.name = testName;
    if(required.dependsOn) {
      debug(`requiring dependency "${required.dependsOn}"`);
      requireTest(required.dependsOn);
    }
    debug(`pushing ${testName} onto the test stack`);
    requiredTests.push(required);
  } catch (e) {
    output.fatalError(`Unable to load test ${requirePath}`);
  }
}

module.exports = { load, loadAll };
