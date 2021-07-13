
var sibyl = require("./sibyl");
//var alea = require("./alea.js");

function rseed() {
  var seed = "";
  var x = "abcdefghijklmnopqrstuvwxyzABDCEFGHIJKLMNOPQRSTUVWXYZ01234567890 ";
  var n = x.length;
  for (var ii=0; ii<32; ii++) {
    seed += x[ Math.floor(Math.random()*n) ];
  }
  return seed;
}

function rstr(_rng, n) {
  var _s = "";

  for (var ii=0; ii<(n/2); ii++) {
    var t = Math.floor(_rng()*256).toString(16);
    t = ((t.length == 1) ? ('0' + t) : t);
    _s += t;
  }
  return _s;
}

var seed = rseed();

sibyl.reseed(seed);

//var rng = new alea(seed);

var rng = sibyl.rng;

var minor_arcana = ["ace", "2", "3", "4",
                    "5", "6", "7", "8", "9", "10",
                    "page", "knight", "queen", "king"];
var minor_arcana_suit = ["pentacle", "key", "sword", "cup"];
var major_arcana = [
  "angel", "chariot", "death", "devil", "emperor",
  "empress", "fool", "hermit", "hierophant", "magician",
  "priestess", "#scales", "strength", "waterworks", "trumpet" ];
var exclude_all = [];

for (var ii=0; ii<minor_arcana_suit.length; ii++) {
  exclude_all.push(minor_arcana_suit[ii]);
}

for (var ii=0; ii<major_arcana.length; ii++) {
  exclude_all.push(major_arcana[ii]);
}


var c = sibyl.rand_color_n(4*4);

var colors = {
  "pentacle": [ c[0], c[4], c[8] ],
  "key": [ c[1], c[5], c[9] ],
  "sword": [ c[2], c[6], c[10] ],
  "cup": [ c[3], c[7], c[11] ]
};

for (var suit_idx=0; suit_idx < minor_arcana_suit.length; suit_idx++) {
  for (var card_idx=0; card_idx < minor_arcana.length; card_idx++) {
    console.log("## ", minor_arcana_suit[suit_idx], minor_arcana[card_idx], rstr(rng, 32));

    var suit = minor_arcana_suit[suit_idx];

    var suit_ent = minor_arcana_suit[suit_idx]  + colors[suit][0][0].hex + colors[suit][0][1].hex;
    var _s = [];

    for (var ii=0; ii<(card_idx+1); ii++) {
      _s.push(suit_ent);
    }

    // generate background creature
    //
    var _t = sibyl.preprocess_svgjson(sibyl.bg_symbol, undefined, undefined, undefined, exclude_all);
    sibyl.bg_ctx.choice = _t.choice;
    sibyl.bg_ctx.symbol = _t.symbol;
    sibyl.bg_ctx.data = _t.data;

    sibyl.bg_ctx.max_depth = 0;
    sibyl.bg_ctx.max_nest_depth = 1;
    sibyl.bg_ctx.complexity = 1;
    sibyl.mystic_symbolic_random( sibyl.bg_ctx );
    var bg0 = sibyl.bg_ctx.realized_child.base;
    var bg1 = "";
    if ("attach" in sibyl.bg_ctx.realized_child) {
      bg1 = sibyl.bg_ctx.realized_child.attach.nesting[0].base;
    }

    var creat = ":rnd" + colors[suit][1][0].hex + colors[suit][1][1].hex;
    var bgnd = bg0 + colors[suit][2][0].hex + colors[suit][2][1].hex ;
    if (bg1.length > 0) {
      bgnd += "@" + bg1 + colors[suit][2][1].hex + colors[suit][2][0].hex;
    }

    var _seed = rstr(rng, 32);

    var card_name = suit + "_" + minor_arcana[card_idx];
    var card_fn = "deck/" + card_name + ".svg";


    console.log("./sibyl -a data/major-arcana.list -e data/exclude-" + suit + " -l 10 \\");
    console.log(" -Z " + _seed + " -t -C 5 -a 2 -n 2 -G 2.0 \\");
    console.log(" -t -T 0.2,0.175 -D 240,0 -B  '" + bgnd + "' \\");
    console.log(" -J ./_svg-tarot.json \\");
    console.log("  ' minor_arcana_" + minor_arcana[card_idx] + "_0 @ [ " + _s.join(",") + " , " + creat + "] '  > " + card_fn );
    console.log("sed -i 's;</rect>;</rect> <g transform=\" translate(-144 0)\">;' " + card_fn );
    console.log("sed -i 's;width=\"720px\";width=\"432px\";' " + card_fn );
    console.log("sed -i 's;</svg>;</g> </svg>;' " + card_fn );

  }
}

//for (var midx=0; midx<major_arcana.length; midx++) {
//  console.log(major_arcana[midx], rstr(rng, 32));
//}
