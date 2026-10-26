// Cache busting: stamps a new ?v=... on every local CSS/JS link in index.html,
// so browsers fetch fresh files right after a deploy instead of mixing old and new.
// Run before committing a change:  node tools/bump-version.js
var fs   = require("fs");
var path = require("path");

var file    = path.join(__dirname, "..", "index.html");
var version = new Date().toISOString().replace(/\D/g, "").slice(0, 12); // e.g. 202610261402

var html  = fs.readFileSync(file, "utf8");
var count = 0;

html = html.replace(/((?:href|src)="(?:style|js)\/[^"?]+)(?:\?v=[^"]*)?"/g, function (match, url) {
  count++;
  return url + "?v=" + version + "\"";
});

fs.writeFileSync(file, html);
console.log("Stamped v=" + version + " on " + count + " files in index.html");
