const http = require("http");
const fs = require("fs");
const path = require("path");

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

http
  .createServer((req, res) => {
    let filePath = req.url === "/" ? "index.html" : req.url.substring(1);
    let extname = path.extname(filePath);

    let contentType = "text/html";
    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".png":
        contentType = "image/png";
        break;
    }

    let file = path.join(__dirname, filePath);
    fs.exists(file, (exists) => {
      if (exists) {
        serveFile(res, file, contentType);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Not Found");
      }
    });
  })
  .listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
