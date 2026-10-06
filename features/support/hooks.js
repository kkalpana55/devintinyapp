const { BeforeAll, AfterAll, Before, After, Status } = require("@cucumber/cucumber");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const { chromium } = require("playwright");

let server;
let browser;

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

function startServer(port) {
  return new Promise((resolve, reject) => {
    const entry = path.resolve(process.env.APP_DIR || path.join(__dirname, "..", ".."), "server.js");
    server = spawn(process.execPath, [entry], { env: { ...process.env, PORT: String(port) } });
    let stderr = "";
    server.stderr.on("data", (chunk) => (stderr += chunk));
    server.stdout.on("data", (chunk) => {
      const match = String(chunk).match(/http:\/\/localhost:(\d+)/);
      if (match) resolve(`http://localhost:${match[1]}`);
    });
    server.once("exit", (code) => reject(new Error(`server exited with code ${code}\n${stderr}`)));
  });
}

BeforeAll(async () => {
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = await startServer(await getFreePort());
  }
});

AfterAll(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});

Before({ tags: "@ui" }, async function () {
  browser = browser || (await chromium.launch());
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
  this.consoleErrors = [];
  this.requests = [];
  this.page.on("console", (msg) => msg.type() === "error" && this.consoleErrors.push(msg.text()));
  this.page.on("pageerror", (err) => this.consoleErrors.push(err.message));
  this.page.on("request", (req) => this.requests.push(req.url()));
});

After({ tags: "@ui" }, async function ({ result }) {
  if (result.status === Status.FAILED && this.page) {
    this.attach(await this.page.screenshot(), "image/png");
  }
  if (this.context) await this.context.close();
});
