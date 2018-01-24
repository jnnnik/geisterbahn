const env = require("./config").env;

module.exports = {
  augment: async (page) => {
    if(env.additionalHeaders) {
      await page.setExtraHTTPHeaders(env.additionalHeaders);
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

    page.clickAndWait = async function clickAndWait(selector) {
      return Promise.all([page.waitForNavigation(), page.click(selector)]);
    };
  }
}
