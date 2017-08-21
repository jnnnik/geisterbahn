const env = require("./env");

module.exports = {
  augment: async (page) => {
    if(env.auth) {
      const headerMap = new Map(
        [["Authorization", "Basic " + new Buffer(`${env.auth.user}:${env.auth.pass}`).toString("base64")]]
      );

      await page.setExtraHTTPHeaders(headerMap);
    }

    const _goto = page.goto;

    page.goto = async function goto(url, options) {
      url = `${env.baseUrl}${url}`;
      await _goto.bind(page)(url, options);
    };

    page.getHtml = function getHtml(selector) {
      return page.evaluate((s) => {
        return Promise.resolve(document.querySelector(s).innerHTML);
      }, selector);
    };

    page.getText = function getText(selector) {
      return page.evaluate((s) => {
        return Promise.resolve(document.querySelector(s).innerText);
      }, selector);
    };

    page.getAttribute = function getAttribute(selector, attribute) {
      return page.evaluate((s, a) => {
        return Promise.resolve(document.querySelector(s).getAttribute(a));
      }, selector, attribute);
    };

    page.getElementCount = function getElementCount(selector) {
      return page.evaluate((s) => {
        return Promise.resolve(document.querySelectorAll(s).length);
      }, selector);
    };
  }
}
