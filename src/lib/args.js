const args = require("args");

args
  .option("tests", "List of test packages to run (comma separated)")
  .option("device", "Device to emulate")
  .option("show", "Show the browser", false)
  .option("interactive", "Run in interactive mode", false)
  .option("test-source", "Path from which test packages are to be loaded", "./tests")
  .option("environment", "Environment to use", "local")
  .option("environment-source", "Location of geisterbahnfile.js", ".");

module.exports = args.parse(process.argv);
