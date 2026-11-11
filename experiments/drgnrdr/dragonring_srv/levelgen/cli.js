// Generate a level as JSON.
//
//   node levelgen/cli.js [seed] [out.json]
//
// Default output: levels/level-<seed>.json.  Prints the generator's
// checks (path length, closest approach of the path to a solid).
//
var fs = require("fs"), path = require("path"),
    LG = require("./levelgen.js");

var seed = parseInt(process.argv[2] || "1", 10),
    out  = process.argv[3] || path.join(__dirname, "..", "levels", "level-" + seed + ".json"),
    L    = LG.generate({ seed: seed });

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(L));
console.log("wrote", out, JSON.stringify(L.meta));
