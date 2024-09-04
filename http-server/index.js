const http = require("http");
const fs = require("fs");

fs.readFile("home.html", (err, home) => {
  // console.log(home.toString());
  if (err) throw err;
  http
    .createServer((request, response) => {
      response.writeHeader(200, { "content-Type": "text/html" });
      response.write(home);
      response.end();
    })
    .listen(3000);
});
