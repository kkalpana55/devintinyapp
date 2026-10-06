const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

let server;
let baseUrl;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

before(async () => {
  const port = await getFreePort();
  server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
    env: { ...process.env, PORT: String(port) },
  });

  await new Promise((resolve, reject) => {
    let stderr = "";
    server.stderr.on("data", (chunk) => (stderr += chunk));
    server.stdout.on("data", (chunk) => {
      const match = String(chunk).match(/http:\/\/localhost:(\d+)/);
      if (match) {
        baseUrl = `http://localhost:${match[1]}`;
        resolve();
      }
    });
    server.once("exit", (code) =>
      reject(new Error(`server exited with code ${code}\n${stderr}`))
    );
  });
});

after(() => {
  if (server) server.kill();
});

test("GET /api/message returns the JSON message", async () => {
  const res = await fetch(`${baseUrl}/api/message`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await res.json(), { message: "Hello from the backend!" });
});

test("GET /api/message ignores query strings", async () => {
  const res = await fetch(`${baseUrl}/api/message?t=123`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { message: "Hello from the backend!" });
});

test("GET / serves the HTML page that calls the API", async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.match(await res.text(), /\/api\/message/);
});

test("unknown routes return 404", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
});
