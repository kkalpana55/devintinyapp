const { setWorldConstructor, setDefaultTimeout } = require("@cucumber/cucumber");
const repo = require("./object-repository");

setDefaultTimeout(30 * 1000);

class AppWorld {
  constructor({ attach }) {
    this.attach = attach;
    this.response = null;
    this.responseBody = null;
    this.page = null;
  }

  url(pathname) {
    return new URL(pathname, process.env.BASE_URL).toString();
  }

  endpoint(name) {
    const pathname = repo.endpoints[name];
    if (!pathname) throw new Error(`Unknown endpoint "${name}" in object repository`);
    return pathname;
  }

  element(name, pageName = "home") {
    const selector = repo.pages[pageName].elements[name];
    if (!selector) throw new Error(`Unknown element "${name}" on page "${pageName}"`);
    return this.page.locator(selector);
  }
}

setWorldConstructor(AppWorld);
