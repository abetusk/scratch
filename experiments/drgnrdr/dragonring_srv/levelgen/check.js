// Check level files against the format (docs/level-format.md).
//
//   node levelgen/check.js level.json [more.json ...]
//
// Prints errors (the game will not load the level) and warnings
// (loads, but likely plays badly).  Exit status 1 if any file has
// errors.
//
var fs = require("fs"),
    LG = require("./levelgen.js");

var bad = 0;
process.argv.slice(2).forEach(function(f) {
  var L, r;
  try { L = JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) {
    console.log(f + ": not readable JSON: " + e.message);
    bad++;
    return;
  }
  r = LG.validate(L);
  console.log(f + ": " + r.errors.length + " errors, " + r.warnings.length + " warnings");
  r.errors.forEach(function(m) { console.log("  error   " + m); });
  r.warnings.forEach(function(m) { console.log("  warning " + m); });
  if (r.errors.length) { bad++; }
});
process.exit(( bad ? 1 : 0 ));
