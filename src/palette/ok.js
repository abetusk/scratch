// License: CC0
//
var numeric = require("numeric");
var chroma = require("chroma-js");
var fs = require("fs");

var _dat = fs.readFileSync("chromotome.json");
var chromotome = JSON.parse(_dat);

let palette = chromotome.pal;

for (let palidx=0; palidx<palette.length; palidx++) {
  let name = palette[palidx].name;
  let color = palette[palidx].colors;
  console.log("#", name);

  let txt = "#" + name + "\n";

  for (let ci=0; ci<color.length; ci++) {
    let c = color[ci];
    //console.log(c);

    if (c=='#000000') {
      txt += "0 0 0\n";
      continue;
    }

    let lch = chroma(c).oklch();
    //console.log(lch[0], lch[1], lch[2]);

    if (isNaN(lch[2])) { lch[2] = 0; }

    let lightness = lch[0];
    let chrom = lch[1]; // aka saturation
    let hue = lch[2];

    let px = lightness*Math.cos(2*Math.PI*hue/360);
    let py = lightness*Math.sin(2*Math.PI*hue/360);
    txt += px.toString() + " " + py.toString() + " " + lch[1].toString() + "\n";

    //let px = chrom*Math.cos(2*Math.PI*hue/360);
    //let py = chrom*Math.sin(2*Math.PI*hue/360);
    //txt += px.toString() + " " + py.toString() + " " + lightness.toString() + "\n";

    //console.log(px, py, lch[1], lch[0], lch[2], c);


  }

  fs.writeFile("data/" + palidx.toString() + ".gp", txt, function(err) { if (err) { console.log(err); } } );

  //console.log("");
}

