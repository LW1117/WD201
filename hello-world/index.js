const fs = require("fs");

fs.writeFile(
  "sample.txt",
  "Hellow World. Welcome to Node.js file System module.",
  (err) => {
    if (err) throw err;
    console.log("File created!");
  }
);

fs.readFile("sample.txt", (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
