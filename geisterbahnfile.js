/**
 * THIS IS JUST AN EXAMPLE
 */
function getBasicAuthHeaderPair() {
  return ["Authorization", "Basic " + new Buffer(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`).toString("base64")];
}

module.exports = {
  geisterbahn: {
    testsDirectory: "./tests",
    defaultEnvironment: "local"
  },
  local: {
    baseUrl: "http://local-dev-setup.local"
  },
  staging: {
    baseUrl: "https://fancy-staging-setup.staging",
    additionalHeaders: new Map([
      getBasicAuthHeaderPair()
    ])
  },
  production: {
    baseUrl: "https://the-actual-site.prod"
  }
}
