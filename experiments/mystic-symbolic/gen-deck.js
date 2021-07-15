
var cp = require("child_process");
var fs = require("fs");
var sibyl = require("./sibyl");
//var alea = require("./alea.js");

//var txt_ele = ' <rect x="36" y="608" width="360" height="46" fill="#efefef" > ' + 
var txt_ele = ' <rect x="41" y="608" width="351" height="46" fill="#efefef" > ' + 
'</rect>' + 
'<text x="0" y="0" id="_text">' + 
'<tspan' + 
'  id="_tspan"' + 
'  x="216"' + 
'  y="644"' + 
'  style="fill:rgb(50,50,50);font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:33px;font-family:\'Caviar Dreams\';-inkscape-font-specification:\'Caviar Dreams, Bold\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:center;writing-mode:lr-tb;text-anchor:middle;stroke-width:0.26458332px">::TEXT::</tspan>' + 
'</text> ';

function rseed() {
  var seed = "";
  var x = "abcdefghijklmnopqrstuvwxyzABDCEFGHIJKLMNOPQRSTUVWXYZ01234567890";
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

console.log("## seed: " + seed);

sibyl.reseed(seed);

//var rng = new alea(seed);

var rng = sibyl.rng;

var minor_arcana = ["ace", "2", "3", "4",
                    "5", "6", "7", "8", "9", "10",
                    "page", "knight", "queen", "king"];
var minor_arcana_suit = ["pentacle", "key", "sword", "cup"];
var major_arcana = [
  "fool",
  "angel", "chariot", "death", "devil", "emperor",
  "empress", "hermit", "hierophant", "magician", "wheel_of_fortune",
  "priestess", "#scales", "strength", "waterworks", "trumpet" ];
var exclude_all = [];

for (var ii=0; ii<minor_arcana_suit.length; ii++) {
  exclude_all.push(minor_arcana_suit[ii]);
}

for (var ii=0; ii<major_arcana.length; ii++) {
  exclude_all.push(major_arcana[ii]);
}
exclude_all.push("knight");
exclude_all.push("castle_tower");
exclude_all.push("bob");
exclude_all.push("rainbow_half");


var c0 = sibyl.rand_color_n(2);
var c1 = sibyl.rand_color_n(2);
var c2 = sibyl.rand_color_n(2);
var c3 = sibyl.rand_color_n(2);

var cf = sibyl.rand_color_n(8);
var _cx = [];
for (var ii=0; ii<4; ii++) {
  var r = sibyl.rand_color();
  //_cx.push( [ { "hex": r.primary.hex }, {"hex":r.secondary.hex} ] );
  _cx.push( [ { "hex": r.background.hex }, {"hex":r.background2.hex} ] );
}

var colors = {
  "pentacle": [ cf[0], cf[4], _cx[0] ],
  "key":      [ cf[1], cf[5], _cx[1] ],
  "sword":    [ cf[2], cf[6], _cx[2] ],
  "cup":      [ cf[3], cf[7], _cx[3] ]
};

var ace_choice = [
  "window", "door", "wings_pair", "ring", "lotus",
  "hands_giving", "hands_pair", "hand_side", "hand_open_3_4",
  "hand_claddagh", "flower_8petal", "cloud", "circle",
  "scroll_double", "table", "chair", "box", "book_open", "arms_strong"
];

// page, knight, queen, king
//
var royalty_crown_choice = [
  "crown", "crown_5pt", "crown_5pt2", "crown_hierophant", "crown_ornate"
];
var royalty_sceptor_choice = [
  "ankh_emperor", "cross_hierophant" 
]
var royalty_choice = [
  "bird", "bitey_half", "capricorn_tail", "cat", "cow_head",
  "dog", "dragon", "eagle_head", "eagle_shield", "egg",
  "fish", "goat", "goat_head", "head_beast", "horse",
  "lamb_head", "lizard", "oroboros", "pear", "rabbit",
  "pomegranite", "skeleton", "virus"
];

for (var suit_idx=0; suit_idx < minor_arcana_suit.length; suit_idx++) {
  for (var card_idx=0; card_idx < minor_arcana.length; card_idx++) {
    console.log("## ", minor_arcana_suit[suit_idx], minor_arcana[card_idx], rstr(rng, 32));

    var suit = minor_arcana_suit[suit_idx];
    var color_suit = colors[suit][0][0].hex + colors[suit][0][1].hex;
    var suit_ent = minor_arcana_suit[suit_idx]  + colors[suit][0][0].hex + colors[suit][0][1].hex;
    var _s = [];

    for (var ii=0; ii<(card_idx+1); ii++) {
      _s.push(suit_ent);
    }

    // generate background creature
    //
    var _t = sibyl.preprocess_svgjson(sibyl.bg_symbol, undefined, undefined, false, exclude_all);
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

    _t = sibyl.preprocess_svgjson(sibyl.mystic_symbolic, undefined, undefined, false, exclude_all);
    sibyl.fg_ctx.choice = _t.choice;
    sibyl.fg_ctx.symbol = _t.symbol;
    sibyl.fg_ctx.data = _t.data;
    sibyl.mystic_symbolic_random( sibyl.fg_ctx );

    var json_card = {
      "base": "goat",
      "attach" : { "nesting" : [ ] }
    };

    var gscale = 2.0;

    // number cards that aren't ace or page to king
    //
    if ((card_idx > 0) && (card_idx < 10)) {

      json_card = {
        "base":"minor_arcana_" + minor_arcana[card_idx] + "_0",
        "attach" : { "nesting" : [ ] }
      };

      for (var ii=0; ii<=card_idx; ii++) {
        json_card.attach.nesting.push( { "base" : suit_ent } );
      }
      json_card.attach.nesting.push( sibyl.fg_ctx.realized_child );

      var creat = ":rnd" + colors[suit][1][0].hex + colors[suit][1][1].hex;
      var bgnd = bg0 + colors[suit][2][0].hex + colors[suit][2][1].hex ;
      if (bg1.length > 0) {
        bgnd += "@" + bg1 + colors[suit][2][1].hex + colors[suit][2][0].hex;
      }


    }

    // ace
    //
    else if (card_idx==0) {

      var ace_base = sibyl.crnd(ace_choice);
      json_card = {
        "base": ace_base + color_suit,
        "attach" : { "nesting" : [ { "base": suit_ent }  ] }
      };

      gscale = 1.0;

    }

    // page
    else if (card_idx==10) {

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + color_suit,
        "attach" : { "nesting" : [ { "base": suit_ent }  ] }
      };
      gscale = 1.0;

    }

    // knight
    else if (card_idx==11) {

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + color_suit,
        "attach" : { "nesting" : [ { "base": suit_ent }  ] }
      };
      gscale = 1.0;


    }

    // queen
    else if (card_idx==12) {

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + color_suit,
        "attach" : { "nesting" : [ { "base": suit_ent }  ] }
      };
      gscale = 1.0;


    }

    // king
    else if (card_idx==13) {

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + color_suit,
        "attach" : { "nesting" : [ { "base": suit_ent }  ] }
      };
      gscale = 1.0;


    }

    var _seed = rstr(rng, 32);

    var creat_fn = "/tmp/sibyl/" + _seed;
    fs.writeFileSync(creat_fn, JSON.stringify(json_card, undefined, 2), {"flag":"w+"});

    var card_name = suit + "_" + minor_arcana[card_idx];
    var card_fn = "deck/" + card_name + ".svg";

    var cmd = "./sibyl -a data/major-arcana.list -e data/exclude-" + suit + " -l 10 " +
      //" -Z " + _seed + " -t -C 5 -a 2 -n 2 -G 2.0 " + 
      " -Z " + _seed + " -t -C 5 -a 2 -n 2 -G " +  gscale.toString() +
      " -p '" + colors[suit][1][1].hex + "' -s '" + colors[suit][1][0].hex + "' " +
      " -t -T 0.2,0.175 -D 240,0 -b '" + colors[suit][2][0].hex + "' -c '" + colors[suit][2][1].hex + "' -B  '" + bgnd + "' " + 
      " -J ./_svg-tarot.json " + 
      "  -R " + creat_fn + " > " + card_fn + " ; " + 
      " sed -i 's;</rect>;</rect> <g transform=\" translate(-144 0)\">;' " + card_fn + " ; " +
      " sed -i 's;width=\"720px\";width=\"432px\";' " + card_fn  + " ; " +
      " sed -i 's;</svg>;</g> </svg>;' " + card_fn ;

    cp.execSync(cmd);
    cp.execSync("rm " + creat_fn);

  }

}

//for (var midx=0; midx<major_arcana.length; midx++) {
//  console.log(major_arcana[midx], rstr(rng, 32));
//}
