const { Given, Then } = require("@cucumber/cucumber");
const { expect } = require("playwright/test");
const repo = require("../support/object-repository");

async function openHome(world, query = "") {
  await world.page.goto(world.url(repo.pages.home.path + query));
}

Given("I open the homepage", async function () {
  await openHome(this);
});

Given("I open {string}", async function (pathname) {
  await this.page.goto(this.url(pathname));
});

Given("I open the homepage with query {string}", async function (query) {
  await openHome(this, query);
});

Given("the {string} endpoint is unreachable", async function (name) {
  await this.page.route(`**${this.endpoint(name)}*`, (route) => route.abort());
});

Given("the {string} endpoint responds with status {int} and body {string}", async function (name, status, body) {
  await this.page.route(`**${this.endpoint(name)}*`, (route) =>
    route.fulfill({ status, contentType: "application/json", body })
  );
});

Then("the page title should be {string}", async function (title) {
  await expect(this.page).toHaveTitle(title);
});

Then("the {string} should have text {string}", async function (element, text) {
  await expect(this.element(element)).toHaveText(text, { timeout: 5000 });
});

Given("the {string} endpoint is delayed by {int} ms", async function (name, ms) {
  await this.page.route(`**${this.endpoint(name)}*`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await route.continue();
  });
});

Then("the page should not contain the element {string}", async function (selector) {
  await expect(this.page.locator(selector)).toHaveCount(0);
});

Then("there should be no console errors", async function () {
  await this.page.waitForLoadState("networkidle");
  expect(this.consoleErrors).toEqual([]);
});

Then("the {string} endpoint should have been requested {int} time(s)", async function (name, count) {
  await this.page.waitForLoadState("networkidle");
  const pathname = this.endpoint(name);
  expect(this.requests.filter((url) => new URL(url).pathname === pathname)).toHaveLength(count);
});
