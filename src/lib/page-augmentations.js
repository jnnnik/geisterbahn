const env = require("./config").env;

const REQUEST_INTERCEPTOR_COLLECTION = Symbol('request interceptor collection');

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

    function onRequest(req) {
      let captured = false;
      for(const interceptorConfig of page[REQUEST_INTERCEPTOR_COLLECTION]) {
        if(
          req.method().match(interceptorConfig.method) !== null &&
          req.url().match(interceptorConfig.url) !== null
        ) {
          captured = true;
          req.respond(interceptorConfig.response);
        }
      }

      if(!captured) req.continue();
    }

    page.mockResponse = async function mockResponse(method, url, response) {
      await page.setRequestInterception(true);
      if(!page[REQUEST_INTERCEPTOR_COLLECTION]) {
        page[REQUEST_INTERCEPTOR_COLLECTION] = [];
        page.on('request', onRequest);
      }
      page[REQUEST_INTERCEPTOR_COLLECTION].push({
        method, url, response
      });
    };
  
    page.clearResponseMocks = async function clearResponseMocks() {
      await page.setRequestInterception(false);
      if(page[REQUEST_INTERCEPTOR_COLLECTION]) {
        delete page[REQUEST_INTERCEPTOR_COLLECTION];
        page.removeListener('request', onRequest);
      }
    }
  }
}
