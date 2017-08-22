const debug = require("debug")("geisterbahn:loader");
const path = require("path");
const fs = require("fs");
const DependencySorter = require("dependency-sorter");

const output = require("./output");
const config = require("./config");

const testDir = path.resolve(process.cwd(), config.geisterbahn.testsDirectory);
let loadedTestRegistry = [];

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
  const tests = await requireAll(testNames);
  return sortDependencies(tests);
}

async function load(arg) {
  await checkTestsDir();
  const testNames = arg.split(",");
  debug(`loading "${testNames}"`);
  const tests = await requireAll(testNames);
  loadTestDependencies(tests);
  return sortDependencies(tests);
}

async function scanDirForTests(dir) {
  return new Promise(resolve => {
    fs.readdir(testDir, null, (err, files) => {
      resolve(files.map(file => file.replace(/\.js$/, "")));
    });
  });
}

async function requireAll(testNames) {
  debug(`requiring all: "${testNames}"`);
  return new Promise(resolve => {
    resolve(testNames.map(testName => requireTest(testName)));
  });
}

function loadTestDependencies(tests) {
  for(const test of tests) {
    debug(`checking "${test.name}" for dependencies`);
    if(test.dependsOn) {
      debug(`"${test.name} depends on ${test.dependsOn}"`);
      if(loadedTestRegistry.indexOf(test.dependsOn) === -1) {
        tests.push(requireTest(test.dependsOn));
      }
    } else {
      debug("none");
    }
  }
}

function requireTest(testName) {
  debug(`requiring "${testName}"`);
  loadedTestRegistry.push(testName);
  const requirePath = path.resolve(testDir, testName);
  try {
    const required = require( requirePath );
    required.name = testName;
    return required;
  } catch (e) {
    output.fatalError(`Unable to load test ${requirePath}`);
  }
}

function sortDependencies(tests) {
  debug("sorting tests by dependencies");
  if(tests.length === 1) return tests;
  const sorter = new DependencySorter({dependsProperty:"dependsOn", idProperty:"name"});
  return sorter.sort(tests);
}

module.exports = { load, loadAll };
