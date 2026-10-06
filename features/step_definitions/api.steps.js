const { When, Then } = require("@cucumber/cucumber");
const assert = require("node:assert/strict");

async function send(world, method, pathname) {
  world.response = await fetch(world.url(pathname), { method });
  world.responseBody = await world.response.text();
}

When("I send a {word} request to the {string} endpoint", async function (method, name) {
  await send(this, method, this.endpoint(name));
});

When("I send a {word} request to {string}", async function (method, pathname) {
  await send(this, method, pathname);
});

Then("the response status should be {int}", function (status) {
  assert.equal(this.response.status, status, `body: ${this.responseBody}`);
});

Then("the response header {string} should contain {string}", function (header, expected) {
  const value = this.response.headers.get(header);
  assert.ok(value && value.includes(expected), `expected header ${header} to contain "${expected}", got ${JSON.stringify(value)}`);
});

Then("the response JSON field {string} should be {string}", function (field, expected) {
  assert.equal(JSON.parse(this.responseBody)[field], expected);
});

Then("the response body should be empty", function () {
  assert.equal(this.responseBody, "");
});
