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

function requireFromTestDir(testName) {
  const requirePath = path.resolve(testDir, testName);
  debug(`requiring ${testName} from ${requirePath}`);
  try {
    return require(requirePath);
  } catch(e) {
    output.fatalError(`Unable to load test ${requirePath}`, e);
  }
}

function requirePartials(partials, partialDefinitions) {
  for(const partial of partials) {
    const requiredPartial = requireFromTestDir(partial);
    if(requiredPartial.partials) {
      requirePartials(requiredPartial.partials, partialDefinitions);
    }
    if(requiredPartial.definition) {
      partialDefinitions.push(requireFromTestDir(partial));
    }
  }
}

function requireTest(testName) {
  debug(`requireTest("${testName}")`);
  const required = requireFromTestDir(testName);
  required.name = testName;
  if(required.partials) {
    debug('requiring partials');
    required.partialDefinitions = [];
    requirePartials(required.partials, required.partialDefinitions);    
  }
  debug(`pushing ${testName} onto the test stack`);
  requiredTests.push(required);
}

module.exports = { load, loadAll };
