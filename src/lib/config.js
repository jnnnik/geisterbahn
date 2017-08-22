const debug = require("debug")("geisterbahn:env");
const path = require("path");

const args = require("./args");
const output = require("./output");

const baseConfig = {
  testsDirectory: "./tests"
};

const configPath = path.resolve(process.cwd(), args.geisterbahnfile);

const INVALID_ENV = "invalid environment";

debug(`config path: ${configPath}`);

const tryFile = path.resolve(configPath, "geisterbahnfile");

try {
  const cfg = require(tryFile);

  cfg.geisterbahn = cfg.geisterbahn ? Object.assign(baseConfig, cfg.geisterbahn) : baseConfig;

  if(args.testSource) {
    cfg.geisterbahn.testsDirectory = args.testSource;
  }

  cfg.geisterbahn.testsDirectory = path.resolve(configPath, cfg.geisterbahn.testsDirectory);

  let stage = cfg.geisterbahn.defaultEnvironment;
  if(args.environment) stage = args.environment;
  if(!stage) {
    output.fatalError("No environment specified in geisterbahnfile.js or as CLI parameter");
  }

  const envConfig = cfg[stage];
  if(!envConfig) {
    throw new Error(INVALID_ENV);
  }
  module.exports = {
    geisterbahn: cfg.geisterbahn,
    env: envConfig
  };
} catch(e) {
  let msg;
  if(e.message === INVALID_ENV) {
    msg = `Environment configuration for "-e ${args.environment}" not found in ${tryFile}`
  } else {
    msg = `Unable to load ${tryFile}`;
  }
  output.fatalError(msg, e);
}
