const { When, Then } = require("@cucumber/cucumber");
const assert = require("node:assert/strict");
const net = require("node:net");

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

Then("the response body should not contain {string}", function (text) {
  assert.ok(!this.responseBody.includes(text), `body unexpectedly contains "${text}"`);
});

Then("the response JSON should have exactly the keys {string}", function (keys) {
  assert.deepEqual(Object.keys(JSON.parse(this.responseBody)).sort(), keys.split(",").map((k) => k.trim()).sort());
});

When("I send {int} concurrent GET requests to the {string} endpoint", async function (count, name) {
  const url = this.url(this.endpoint(name));
  this.responses = await Promise.all(Array.from({ length: count }, () => fetch(url)));
});

Then("all responses should have status {int}", function (status) {
  assert.deepEqual(this.responses.map((r) => r.status), this.responses.map(() => status));
});

When("I send the raw request line {string}", async function (requestLine) {
  const { hostname, port } = new URL(process.env.BASE_URL);
  this.rawResponse = await new Promise((resolve) => {
    let data = "";
    const socket = net.connect(port, hostname, () => socket.write(`${requestLine}\r\nHost: ${hostname}\r\nConnection: close\r\n\r\n`));
    socket.setTimeout(3000, () => socket.destroy());
    socket.on("data", (chunk) => (data += chunk));
    socket.on("close", () => resolve(data));
    socket.on("error", () => resolve(data));
  });
});

Then("the raw response status should be {int}", function (status) {
  const match = this.rawResponse.match(/^HTTP\/1\.1 (\d{3})/);
  assert.equal(match ? Number(match[1]) : null, status, `raw response: ${JSON.stringify(this.rawResponse.slice(0, 200))}`);
});

Then("the server should still respond to the {string} endpoint", async function (name) {
  const res = await fetch(this.url(this.endpoint(name)), { signal: AbortSignal.timeout(3000) });
  assert.equal(res.status, 200);
});
