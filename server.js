const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const page = fs.readFileSync(
  path.join(__dirname, "public", "index.html")
);

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (pathname === "/api/message") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from the backend!" }));
    return;
  }

  if (pathname === "/" || pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
