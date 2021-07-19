
/*
 *
 * To the extent possible under law, the person who associated CC0 with
 * this source code has waived all copyright and related or neighboring rights
 * to this source code.
 *
 * You should have received a copy of the CC0 legalcode along with this
 * work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 */

var __skip = false;

var cp = require("child_process");
var fs = require("fs");
var sibyl = require("./sibyl");
var sibyl_x = require("./sibyl");

var tarot_card_str  = fs.readFileSync( "./_svg-tarot.json" ).toString('utf-8');
var tarot_card_json = JSON.parse(tarot_card_str);

var minor_arcana_template = {};

for (var ii=0; ii<tarot_card_json.length; ii++) {
  var name = tarot_card_json[ii].name;
  var tok = name.split("_");

  if (!(tok[2] in minor_arcana_template)) {
    minor_arcana_template[tok[2]] = [];
  }

  minor_arcana_template[tok[2]].push( tarot_card_json[ii] );
}

var LINE_WIDTH = 8;

var txt_ele_numeral = '<text x="0" y="0" id="_text_numeral">' + 
'<tspan' + 
'  id="_tspan_numeral"' + 
'  x="216"' + 
'  y="64"' + 
'  style="fill:rgb(50,50,50);font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:33px;font-family:\'Caviar Dreams\';-inkscape-font-specification:\'Caviar Dreams, Bold\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:center;writing-mode:lr-tb;text-anchor:middle;stroke-width:0.26458332px"><!--::TEXT::--></tspan>' + 
'</text> ';

var txt_ele_name =
' <rect rx="23" x="41" y="608" width="351" height="46" fill="#efefef" > ' + 
'</rect>' + 
'<text x="0" y="0" id="_text_name">' + 
'<tspan' + 
'  id="_tspan_name"' + 
'  x="216"' + 
'  y="644"' + 
'  style="fill:rgb(50,50,50);font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:33px;font-family:\'Caviar Dreams\';-inkscape-font-specification:\'Caviar Dreams, Bold\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:center;writing-mode:lr-tb;text-anchor:middle;stroke-width:0.26458332px"><!--::TEXT::--></tspan>' + 
'</text> ';

var NUMERAL_TXT = {
  "0": "0",
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IV",
  "5": "V",
  "6": "VI",
  "7": "VII",
  "8": "VIII",
  "9": "IX",
  "10": "X",
  "11": "XI",
  "12": "XII",
  "13": "XIII",
  "14": "XIV",
  "15": "XV",
  "16": "XVI",
  "17": "XVII",
  "18": "XVIII",
  "19": "XIX",
  "20": "XX",
  "21": "XXI",
  "22": "XXII",
  "23": "XXIII",
  "24": "XXIV"
};

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


//DEBUG
seed = 'Vh4jFlS5WQJzQwlvYmwwEAhwYWAnI3oY';

console.log("## seed: " + seed);

sibyl.reseed(seed);

//var rng = new alea(seed);

var rng = sibyl.rng;

var minor_arcana = [
  "ace", "2", "3", "4",
  "5", "6", "7", "8", "9", "10",
  "page", "knight", "queen", "king"
];
var minor_arcana_suit = ["pentacle", "key", "sword", "cup"];
var major_arcana = [
  { "name": "THE FOOL",       "symbol":"fool" ,       "exclude":true,   "scale": 0.95},
  { "name": "THE MAGICIAN",   "symbol":"magician",    "exclude":true,   "scale": 0.95},
  { "name": "THE PRIESTESS",  "symbol":"priestess",   "exclude":true,   "scale": 0.85},
  { "name":"THE EMPRESS",     "symbol":"empress",     "exclude":true,   "scale": 0.95},
  { "name":"THE EMPEROR",     "symbol":"emperor" ,    "exclude":true,   "scale": 0.75},
  { "name":"THE HIEROPHANT",  "symbol":"hierophant",  "exclude":true,   "scale": 0.85},
  { "name":"THE LOVERS",      "symbol":"" ,           "exclude":false,  "scale": 0.75},
  { "name":"THE CHARIOT",     "symbol":"chariot",     "exclude":true,   "scale": 0.75},
  { "name":"STRENGTH",        "symbol":"strength",    "exclude":true,   "scale": 0.9},
  { "name":"THE HERMIT",      "symbol":"hermit",      "exclude":true,   "scale": 0.9},
  { "name":"WHEEL of FORTUNE","symbol":"wheel_of_fortune",  "exclude":true, "scale": 0.75},
  { "name":"JUSTICE",         "symbol":"scales" ,     "exclude":false,  "scale":0.85},
  { "name":"THE HANGED MAN",  "symbol":"sycophant",   "exclude":true,   "scale": 0.9},
  { "name":"DEATH",           "symbol":"death",       "exclude":true,   "scale": 0.9},
  { "name":"TEMPERANCE",      "symbol":"waterworks",  "exclude":true,   "scale": 0.75},
  //{ "name":"THE DEVIL",       "symbol":"devil",       "exclude":true,   "scale": 0.75},
  { "name":"THE DEVIL",       "symbol":"goat_head",       "exclude":true,   "scale": 0.75},
  { "name":"THE TOWER",       "symbol":"castle_tower","exclude":true,   "scale": 0.9},
  { "name":"THE STAR",        "symbol":"starburst",   "exclude":true,   "scale": 0.75},
  { "name":"THE MOON",        "symbol":"moon",        "exclude":true,   "scale": 0.75},
  { "name":"THE SUN",         "symbol":"sun",         "exclude":true,   "scale": 0.75},
  { "name":"JUDGEMENT",       "symbol":"trumpet",     "exclude":true,   "scale": 0.75, "d" : [-50, 50] },
  { "name":"THE WORLD",       "symbol":"globe",       "exlcude":false,  "scale": 0.75}
];

var exclude_all = [];

for (var ii=0; ii<minor_arcana_suit.length; ii++) {
  exclude_all.push(minor_arcana_suit[ii]);
}

for (var ii=0; ii<major_arcana.length; ii++) {
  if (major_arcana[ii].exclude) {
    exclude_all.push(major_arcana[ii].symbol);
  }
}
exclude_all.push("knight");
exclude_all.push("bob");
exclude_all.push("rainbow_half");
exclude_all.push("angel");

var c0 = sibyl.rand_color_n(2);
var c1 = sibyl.rand_color_n(2);
var c2 = sibyl.rand_color_n(2);
var c3 = sibyl.rand_color_n(2);

var cf = sibyl.rand_color_n(8);
var _cx = [];
for (var ii=0; ii<4; ii++) {
  var r = sibyl.rand_color();
  //_cx.push( [ { "hex": r.primary.hex }, {"hex":r.secondary.hex} ] );
  _cx.push( [ { "hex": r.background.hex, "hsv": r.background.hsv }, {"hex":r.background2.hex, "hsv":r.background2.hsv} ] );
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
  "bird", "bitey_half", "cat", "cow_head",
  "dog", "eagle_shield", "egg",
  "fish", "goat", "goat_head", "horse",
  "lamb_head", "oroboros", "pear",
  "skeleton", "virus"
];

var pfx_idx = 22;

if (!__skip) {
for (var suit_idx=0; suit_idx < minor_arcana_suit.length; suit_idx++) {
  for (var card_idx=0; card_idx < minor_arcana.length; card_idx++) {

    var has_footer_text = false;
    var text_descr = "";

    var has_numeral_text = false;
    var text_numeral_desc;

    var _seed = rstr(rng,32);
    console.log("## ", minor_arcana_suit[suit_idx], minor_arcana[card_idx], _seed);

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

    var bgnd = bg0 + colors[suit][2][0].hex + colors[suit][2][1].hex ;
    if (bg1.length > 0) {
      bgnd += "@" + bg1 + colors[suit][2][1].hex + colors[suit][2][0].hex;
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

      has_numeral_text = true;
      text_numeral_desc = NUMERAL_TXT[card_idx+1];

      var card_template = sibyl.crnd(minor_arcana_template[card_idx+1]);
      json_card = {
        "base": card_template.name,
        "attach" : { "nesting" : [ ] }
      };

      for (var ii=0; ii<=card_idx; ii++) {
        json_card.attach.nesting.push( { "base" : suit_ent } );
      }
      json_card.attach.nesting.push( sibyl.fg_ctx.realized_child );


    }

    // ace
    //
    else if (card_idx==0) {

      has_footer_text = true;
      text_descr = "ACE of " + suit.toUpperCase() + "S";

      var ace_base = sibyl.crnd(ace_choice);
      json_card = {
        "base": ace_base ,
        "attach" : { "nesting" : [ { "base": suit_ent + color_suit }  ] }
      };

      gscale = 1.0;

    }

    // page
    else if (card_idx==10) {

      has_footer_text = true;
      text_descr = "PAGE of " + suit.toUpperCase() + "S";

      var xc = colors[suit][1][1].hex + colors[suit][1][0].hex;

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + xc,
        "attach" : { "nesting" : [ { "base": suit_ent + color_suit }  ] }
      };
      gscale = 1.0;

    }

    // knight
    else if (card_idx==11) {

      has_footer_text = true;
      text_descr = "KNIGHT of " + suit.toUpperCase() + "S";

      var xc = colors[suit][1][1].hex + colors[suit][1][0].hex;

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + xc,
        "attach" : { "nesting" : [ { "base": suit_ent + color_suit }  ] }
      };
      gscale = 1.0;

    }

    // queen
    else if (card_idx==12) {

      has_footer_text = true;
      text_descr = "QUEEN of " + suit.toUpperCase() + "S";

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + xc,
        "attach" : { "nesting" : [ { "base": suit_ent + color_suit }  ] }
      };
      gscale = 1.0;

    }

    // king
    else if (card_idx==13) {

      has_footer_text = true;
      text_descr = "KING of " + suit.toUpperCase() + "S";

      var xc = colors[suit][1][1].hex + colors[suit][1][0].hex;

      var royalty_base = sibyl.crnd(royalty_choice);
      json_card = {
        "base": royalty_base + xc,
        "attach" : { "nesting" : [ { "base": suit_ent + color_suit }  ] }
      };
      gscale = 1.0;

    }

    var creat_fn = "/tmp/sibyl/" + _seed;
    fs.writeFileSync(creat_fn, JSON.stringify(json_card, undefined, 2), {"flag":"w+"});

    var card_name = suit + "_" + minor_arcana[card_idx];
    var card_ofn = "deck/" + pfx_idx.toString() + "-" + card_name + ".svg";

    var cmd = "./sibyl -a data/major-arcana.list -e data/exclude-" + suit + " -l " + LINE_WIDTH.toString() +
      //" -Z " + _seed + " -t -C 5 -a 2 -n 2 -G 2.0 " + 
      " -Z " + _seed + " -t -C 5 -a 2 -n 2 -G " +  gscale.toString() +
      " -p '" + colors[suit][1][1].hex + "' -s '" + colors[suit][1][0].hex + "' " +
      " -t -T 0.2,0.175 -D 240,0 -b '" + colors[suit][2][0].hex + "' -c '" + colors[suit][2][1].hex + "' -B  '" + bgnd + "' " + 
      " -J ./_svg-tarot.json " + 
      "  -R " + creat_fn + " > " + card_ofn + " ; " + 
      " sed -i 's;</rect>;</rect> <g transform=\" translate(-144 0)\">;' " + card_ofn + " ; " +
      " sed -i 's;width=\"720px\";width=\"432px\";' " + card_ofn  + " ; " +
      " sed -i 's;</svg>;</g> </svg>;' " + card_ofn ;

    cp.execSync(cmd);

    if (has_numeral_text) {
      var cmd = "sed -i 's;</svg>;;' " + card_ofn;
      cp.execSync(cmd);

      //var _tc = sibyl.HSVtoRGB( colors[suit][2][0].hsv[0], 0.0, 1.0 - colors[suit][2][0].hsv[2] );
      var _tc = sibyl.HSVtoRGB( colors[suit][2][1].hsv[0], 0.0, 1.0 - colors[suit][2][1].hsv[2] );
      var numeral_color_txt = "rgb(" + _tc.r.toString() + "," + _tc.g.toString() + "," + _tc.b.toString() + ")";

      var numeral_fn = "/tmp/sibyl/" + _seed + ".svgnumeral";
      var txt_numeral = txt_ele_numeral.replace(/<!--::TEXT::-->/, text_numeral_desc);
      txt_numeral = txt_numeral.replace(/rgb\(\d+,\d+,\d+\)/, numeral_color_txt);
      txt_numeral += "\n</svg>";
      fs.writeFileSync(numeral_fn, txt_numeral, {"flag":"w+"});

      cmd = "cat " + numeral_fn + " >> " + card_ofn;
      cp.execSync(cmd);

      cp.execSync("rm " + numeral_fn);
    }

    if (has_footer_text) {
      var cmd = "sed -i 's;</svg>;;' " + card_ofn;
      cp.execSync(cmd);

      var footer_fn = "/tmp/sibyl/" + _seed + ".svgfooter";
      var txt_footer = txt_ele_name.replace(/<!--::TEXT::-->/, text_descr) + " </svg>";
      fs.writeFileSync(footer_fn, txt_footer, {"flag":"w+"});

      cmd = "cat " + footer_fn + " >> " + card_ofn;
      cp.execSync(cmd);

      cp.execSync("rm " + footer_fn);
    }

    //console.log("# SAVING", creat_fn);
    cp.execSync("rm " + creat_fn);


    pfx_idx++;

  }

}
}

for (var ma_idx=0; ma_idx<major_arcana.length; ma_idx++) {


  var _c0 = sibyl.rand_color_n(2);
  var _c1 = sibyl.rand_color_n(2);

  var cf = sibyl.rand_color_n(8);
  var _cx = [];
  for (var ii=0; ii<4; ii++) {
    var r = sibyl.rand_color();
    _cx.push( [ { "hex": r.background.hex, "hsv":r.background.hsv }, {"hex":r.background2.hex, "hsv":r.background2.hsv } ] );
  }

  var colors = [ cf[0], cf[4], _cx[0] ];

  var _orig = sibyl.preprocess_svgjson(sibyl.mystic_symbolic, undefined, undefined, false, {});

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
  var bgnd = bg0 + colors[2][0].hex + colors[2][1].hex ;
  if (bg1.length > 0) {
    bgnd += "@" + bg1 + colors[2][1].hex + colors[2][0].hex;
  }


  var base_creature = _orig.symbol[ major_arcana[ma_idx].symbol ];
  var _t = sibyl.preprocess_svgjson(sibyl.mystic_symbolic, undefined, undefined, false, exclude_all);
  sibyl.fg_ctx.choice = _t.choice;
  sibyl.fg_ctx.symbol = _t.symbol;
  sibyl.fg_ctx.data = _t.data;
  sibyl.mystic_symbolic_random( sibyl.fg_ctx, base_creature );

  //console.log(">>>", base_creature);

  var json_card = sibyl.fg_ctx.realized_child;

  var _seed = rstr(rng, 32);

  var creat_fn = "/tmp/sibyl/" + _seed;
  fs.writeFileSync(creat_fn, JSON.stringify(json_card, undefined, 2), {"flag":"w+"});

  console.log("#processing ", major_arcana[ma_idx].name, creat_fn);

  //WIP 
  var card_name = "ma_" + major_arcana[ma_idx].name.replace(/ /g, '_');
  var card_ofn = "deck/" + ma_idx.toString() + "-" + card_name + ".svg";

  var gscale = major_arcana[ma_idx].scale;

  var cmd = "./sibyl -l 6 -S 0.425 " +
    //" -Z " + _seed + " -t -C 5 -a 2 -n 2 -G 2.0 " + 
    " -Z " + _seed + " -t -C 5 -a 2 -n 2 -G " +  gscale.toString() +
    " -p '" + colors[1][1].hex + "' -s '" + colors[1][0].hex + "' " +
    " -t -T 0.2,0.175 -D 240,0 -b '" + colors[2][0].hex + "' -c '" + colors[2][1].hex + "' -B  '" + bgnd + "' " + 
    " -J ./_svg-tarot.json " + 
    "  -R " + creat_fn + " > " + card_ofn + " ; " + 
    " sed -i 's;</rect>;</rect> <g transform=\" translate(-144 0)\">;' " + card_ofn + " ; " +
    " sed -i 's;width=\"720px\";width=\"432px\";' " + card_ofn  + " ; " +
    " sed -i 's;</svg>;</g> </svg>;' " + card_ofn + ";" +
    " sed -i 's;</svg>;;' " + card_ofn;


  cp.execSync(cmd);

  //---

  cmd = "sed -i 's;</svg>;;' " + card_ofn;
  cp.execSync(cmd);

  var _tc = sibyl.HSVtoRGB( colors[2][1].hsv[0], 0.0, 1.0 - colors[2][1].hsv[2] );
  var numeral_color_txt = "rgb(" + _tc.r.toString() + "," + _tc.g.toString() + "," + _tc.b.toString() + ")";

  var numeral_fn = "/tmp/sibyl/" + _seed + ".svgnumeral";
  var txt_numeral = txt_ele_numeral.replace(/<!--::TEXT::-->/, NUMERAL_TXT[ma_idx]) ;
  txt_numeral = txt_numeral.replace(/rgb\(\d+,\d+,\d+\)/, numeral_color_txt);
  fs.writeFileSync(numeral_fn, txt_numeral, {"flag":"w+"});

  cmd = "cat " + numeral_fn + " >> " + card_ofn;
  cp.execSync(cmd);

  cp.execSync("rm " + numeral_fn);

  //---

  var footer_fn = "/tmp/sibyl/" + _seed + ".svgfooter";
  var txt_footer = txt_ele_name.replace(/<!--::TEXT::-->/, major_arcana[ma_idx].name)  + " </svg>";
  fs.writeFileSync(footer_fn, txt_footer, {"flag":"w+"});

  cmd = "cat " + footer_fn + " >> " + card_ofn;
  cp.execSync(cmd);

  cp.execSync("rm " + creat_fn);
  cp.execSync("rm " + footer_fn);

}


