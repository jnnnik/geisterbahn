const debug = require("debug")("geisterbahn:env");
const path = require("path");

const args = require("./args");
const output = require("./output");

const configPath = path.resolve(process.cwd(), args.environmentSource);

const INVALID_ENV = "invalid environment";

debug(`env config path: ${configPath}`);

const tryFile = path.resolve(configPath, "geisterbahnfile");

try {
  const cfg = require(tryFile);
  const envConfig = cfg[args.environment];
  if(!envConfig) {
    throw new Error(INVALID_ENV);
  }
  module.exports = envConfig;
} catch(e) {
  let msg;
  if(e.message === INVALID_ENV) {
    msg = `Environment configuration for "-e ${args.environment}" not found in ${tryFile}`
  } else {
    msg = `Unable to load ${tryFile}`;
  }
  output.fatalError(msg);
}
