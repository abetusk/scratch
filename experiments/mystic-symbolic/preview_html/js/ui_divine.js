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


var CARD_WIDTH = 317;
var CARD_HEIGHT = 190;


// global data structure to hold tarot interpretations (loaded from
// `tarot_interpretations.json`)
//
var g_tarot = {
  "ready": false,
  "reading" : [
   { "sentence":"<b><u>King of Coins</u> <small>(light)</small></b></u><br>Becoming so conservative you resist all change on principle alone"},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."},
   { "sentence":"..."}
  ]
};

var g_ui = {
  "mobile_width":800,
  "mobile_view" : false,
  "button_state" : {
    "ui_button_reading" : { "state": "off" },
    "ui_button_deck" : { "state": "off" },
    "ui_button_download": { "state": "off" }
  },
  "card_state" : [
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false },
    { "ready": false }
  ],
  "caption_dxy" : {
    "ui_card0" : [200,-150],
    "ui_card1" : [-180,250],
    "ui_card2" : [0,-180],
    "ui_card3" : [0,330],
    "ui_card4" : [0,-180],
    "ui_card5" : [0,330],
    "ui_card6" : [-220,120],
    "ui_card7" : [-220,300],
    "ui_card8" : [-220,-120],
    "ui_card9" : [-220,-20]
  }
};

var g_data = {

  "numeral" : {
    "0": "0", "1": "I", "2": "II", "3": "III", "4": "IV",
    "5": "V", "6": "VI", "7": "VII", "8": "VIII", "9": "IX", "10": "X",
    "11": "XI", "12": "XII", "13": "XIII", "14": "XIV", "15": "XV",
    "16": "XVI", "17": "XVII", "18": "XVIII", "19": "XIX", "20": "XX",
    "21": "XXI", "22": "XXII", "23": "XXIII", "24": "XXIV"
  },

  "minor_arcana" : [ "ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "page", "knight", "queen", "king" ],
  "minor_arcana_suit" : ["pentacle", "key", "sword", "cup"],

  "major_arcana" : [
    { "name": "THE FOOL",       "symbol":"fool" ,       "exclude":true,   "scale": 0.95, "d":[0,-40]},
    { "name": "THE MAGICIAN",   "symbol":"magician",    "exclude":true,   "scale": 0.95},
    { "name": "THE PRIESTESS",  "symbol":"priestess",   "exclude":true,   "scale": 0.85},
    { "name":"THE EMPRESS",     "symbol":"empress",     "exclude":true,   "scale": 0.95},
    { "name":"THE EMPEROR",     "symbol":"emperor" ,    "exclude":true,   "scale": 0.85},
    { "name":"THE HIEROPHANT",  "symbol":"hierophant",  "exclude":true,   "scale": 0.85},
    { "name":"THE LOVERS",      "symbol":"lovers_nestbox" ,           "exclude":false,  "scale": 0.9},
    { "name":"THE CHARIOT",     "symbol":"chariot",     "exclude":true,   "scale": 0.75},
    { "name":"STRENGTH",        "symbol":"strength",    "exclude":true,   "scale": 0.9},
    { "name":"THE HERMIT",      "symbol":"hermit",      "exclude":true,   "scale": 0.9},
    { "name":"WHEEL of FORTUNE","symbol":"wheel_of_fortune",  "exclude":true, "scale": 0.75, "d":[0,-20]},
    { "name":"JUSTICE",         "symbol":"scales" ,     "exclude":false,  "scale":0.85, "d":[0,-40]},
    { "name":"THE HANGED MAN",  "symbol":"sycophant",   "exclude":true,   "scale": 0.9},
    { "name":"DEATH",           "symbol":"death",       "exclude":true,   "scale": 0.9, "d":[0,-20]},
    { "name":"TEMPERANCE",      "symbol":"waterworks",  "exclude":true,   "scale": 0.75, "d":[0,-40]},
    //{ "name":"THE DEVIL",       "symbol":"devil",       "exclude":true,   "scale": 0.75},
    { "name":"THE DEVIL",       "symbol":"goat_head",       "exclude":true,   "scale": 0.95, "d":[0,-40]},
    { "name":"THE TOWER",       "symbol":"castle_tower","exclude":true,   "scale": 0.9, "d":[0,-20]},
    { "name":"THE STAR",        "symbol":"starburst",   "exclude":true,   "scale": 0.75},
    { "name":"THE MOON",        "symbol":"moon",        "exclude":true,   "scale": 0.75},
    { "name":"THE SUN",         "symbol":"sun",         "exclude":true,   "scale": 0.75},
    { "name":"JUDGEMENT",       "symbol":"trumpet",     "exclude":true,   "scale": 0.9, "d" : [-50, -50] },
    { "name":"THE WORLD",       "symbol":"globe",       "exlcude":false,  "scale": 0.75, "d":[0,-40]}
  ],

	"ace_choice" : [
		"window", "door", "wings_pair", "ring", "lotus",
		"hands_giving", "hands_pair", "hand_side", "hand_open_3_4",
		"hand_claddagh", "flower_8petal", "cloud", "circle",
		"scroll_double", "table", "chair", "box", "book_open", "arms_strong"
	],

  "royalty_crown_choice" : [ "crown", "crown_5pt", "crown_5pt2", "crown_hierophant", "crown_ornate" ],
  "royalty_sceptor_choice" : [ "ankh_emperor", "cross_hierophant" ],

  "royalty_choice" : [
    "bird", "bitey_half", "cat", "cow_head",
    "dog", "eagle_shield", "egg",
    "fish", "goat",
    //"goat_head",
    "horse",
    "lamb_head", "oroboros", "pear",
    "skeleton", "virus"
  ],


  "back_creature_choice" : [
    "branch", "branch_curly", "bubbles", "cloud", "clouds", "eye",
    "eye_eyelashes", "eye_starburst", "eye_up", "eye_up_starburst", "eye_up_starburst_2", "eye_vertical",
    "eyeball", "flower_jacobean_smaller", "hourglass", "infinity", "lotus", "pills",
    "rain", "tree_rooted", "wave", "teardrop"
  ],

  "svg_text" : { },
  "png_text" : {},

  "png_card" : [
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined },
    { "n":-1, "fg":undefined, "bg":undefined, "text":undefined, "suit":undefined }
  ],

  "rnd" : []


};

for (var ii=0; ii<10; ii++) {
  g_data.rnd.push( Math.random()*3/4 + 0.25 );
  g_data.rnd.push( Math.random()/2 + 0.5 );
  g_data.rnd.push( Math.random()/2 + 0.5 );
}


// index in tarot_interpretations maps to a local SVG file
//
var card_mapping = [
  "00-THE_FOOL.svg",   "01-THE_MAGICIAN.svg",   "02-THE_PRIESTESS.svg",   "03-THE_EMPRESS.svg",   "04-THE_EMPEROR.svg",
  "05-THE_HIEROPHANT.svg",   "06-THE_LOVERS.svg",   "07-THE_CHARIOT.svg",   "08-STRENGTH.svg",   "09-THE_HERMIT.svg",
  "10-WHEEL_of_FORTUNE.svg",   "11-JUSTICE.svg",   "12-THE_HANGED_MAN.svg",   "13-DEATH.svg",   "14-TEMPERANCE.svg",
  "15-THE_DEVIL.svg",   "16-THE_TOWER.svg",   "17-THE_STAR.svg",   "18-THE_MOON.svg",   "19-THE_SUN.svg",
  "20-JUDGEMENT.svg",   "21-THE_WORLD.svg",

  "36-key_ace.svg",   "37-key_2.svg",   "38-key_3.svg",   "39-key_4.svg",
  "40-key_5.svg",   "41-key_6.svg",   "42-key_7.svg",   "43-key_8.svg",   "44-key_9.svg",
  "45-key_10.svg",   "46-key_page.svg",   "47-key_knight.svg",   "48-key_queen.svg",   "49-key_king.svg",

  "64-cup_ace.svg", "65-cup_2.svg",   "66-cup_3.svg",   "67-cup_4.svg",   "68-cup_5.svg",
  "69-cup_6.svg", "70-cup_7.svg",   "71-cup_8.svg",   "72-cup_9.svg",   "73-cup_10.svg",   "74-cup_page.svg",
  "75-cup_knight.svg",   "76-cup_queen.svg",   "77-cup_king.svg",

  "50-sword_ace.svg",   "51-sword_2.svg",   "52-sword_3.svg",   "53-sword_4.svg",   "54-sword_5.svg",
  "55-sword_6.svg",   "56-sword_7.svg",   "57-sword_8.svg",   "58-sword_9.svg",   "59-sword_10.svg",
  "60-sword_page.svg",   "61-sword_knight.svg",   "62-sword_queen.svg",   "63-sword_king.svg",

  "22-pentacle_ace.svg",   "23-pentacle_2.svg",   "24-pentacle_3.svg",
  "25-pentacle_4.svg",   "26-pentacle_5.svg",   "27-pentacle_6.svg",   "28-pentacle_7.svg",   "29-pentacle_8.svg",
  "30-pentacle_9.svg",   "31-pentacle_10.svg",   "32-pentacle_page.svg",   "33-pentacle_knight.svg",   "34-pentacle_queen.svg",
  "35-pentacle_king.svg",

  "78-back.svg"
];


var g_rng = Math.random;

// Integer random number in range of n
//
function _irnd(n) {
  if (typeof n === "undefined") { n=2; }
  //return Math.floor(g_rng.double()*n);
  return Math.floor(g_rng()*n);
}


// Choose random element from array
//
function _crnd(a) {
  if (typeof a === "undefined") { return undefined; }
  var idx = _irnd(a.length);
  var copy = undefined;
  if (typeof a[idx] === "object") {
    _copy = Object.assign({}, a[idx]);
  }
  else { _copy = a[idx]; }
  return _copy;
}


// callback for loading the JSON `tarot_interpretations.json`
//
function _tarot_json_cb(x) {
  if (x.type == "loadend") {
    if (x.target.readyState == 4) {
      g_tarot["data"] = JSON.parse(x.target.response);
      g_tarot.ready = true;
    }
  }
}

// generic load funciton to fetch a server file
//
function _load(url, _cb) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("loadend", _cb);
  xhr.open("GET", url);
  xhr.send();
  return xhr;
} 

// SVG simple motion animations.
// depends on gsap.
//

/*
function motion_xy_r(uid, dx, dy, dt, pt) {
  dx = ((typeof dx === "undefined") ? (2*144) : dx);
  dy = ((typeof dy === "undefined") ? (2*126) : dy);
  dt = ((typeof dt === "undefined") ? (10) : dt);
  pt = ((typeof pt === "undefined") ? (5) : pt);
  gsap.to(uid, {x:dx, ease:"power1.inOut", duration: dt, repeat:-1, yoyo:true });
  gsap.to(uid, {y:dy, ease:"power1.inOut", duration: dt, repeat:-1, yoyo:true, delay: pt});
}

function motion_xy(uid, dx, dy, dt) {
  dx = ((typeof dx === "undefined") ? (2*144) : dx);
  dy = ((typeof dy === "undefined") ? (2*126) : dy);
  dt = ((typeof dt === "undefined") ? (10) : dt);
  gsap.to(uid, {x:dx,y:dy, ease:"linear", duration: dt, repeat:-1, yoyo:false });
}

function motion_rotate(uid, dt) {
  dt = ((typeof dt === "undefined") ? (5) : dt);
  //gsap.to(uid, {rotate:360, ease:"linear", duration:dt, repeat:-1, yoyo:false });
  gsap.to(uid, {rotate:360, ease:"linear", duration:dt, repeat:-1, yoyo:false, transformOrigin:"50% 50%" });
}

function motion_float(uid, dy, dt) {
  dy = ((typeof dy === "undefined") ? (50) : dy);
  dt = ((typeof dt === "undefined") ? (2.5) : dt);
  gsap.to(uid, {y: dy, ease:"power1.inOut", duration: dt, repeat:-1, yoyo:true });
}

function motion_leftright(uid, dx, dt) {
  dx = ((typeof dx === "undefined") ? (50) : dx);
  dt = ((typeof dt === "undefined") ? (2.5) : dt);
  gsap.to(uid, {x: dx, ease:"power1.inOut", duration: dt, repeat:-1, yoyo:true });
}

function motion_pulsate(uid, ds, dt) {
  ds = ((typeof ds === "undefined") ? (1.25) : ds);
  dt = ((typeof dt === "undefined") ? (2) : dt);
  gsap.to(uid, {scale: ds, ease:"power1.inOut", duration: dt, repeat:-1, yoyo:true, transformOrigin:"50% 50%" });
}
*/


// n undefined or 0 -  capitalize every word except for 'of'
// n > 0            -  capitalize n non 'of' words
// n < 0            -  un capitalize |n| non 'of' words
//
// return string
//
function _capitalize(txt,n) {
  n = ((typeof n === "undefined") ? 0 : n);
  var uc = true;

  if (n<0) {
    uc = false;
    n = -n;
  }

  var tok = txt.split(" ");
  var n_cap = 0;

  for (var ii=0; ii<tok.length; ii++) {
    if ((n!=0) && (n_cap >= n)) { break; }

    if (tok[ii].toLowerCase() != "of") {
      if (uc) {
        tok[ii] = tok[ii][0].toUpperCase() + tok[ii].slice(1);
      }
      else {
        tok[ii] = tok[ii][0].toLowerCase() + tok[ii].slice(1);
      }
      n_cap++;
    }
    else {
      tok[ii] = tok[ii][0].toLowerCase() + tok[ii].slice(1);
    }

  }

  return tok.join(" ");

}

// Do a 'celtic cross' tarot reading.
// randomely permute the order, take the first 10 cards
// for the interpretations
//
function tarot_reading_celtic_cross(tarot_data) {
  var d = tarot_data.tarot_interpretations;
  var n = d.length;
  var a_idx = [];

  var card_spread = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ];
  var n_card = card_spread.length;

  //var light_phrases = [ "consider", "aim for", "try", "explore", "look into" ];
  var light_phrases = [ "consider", "aim for", "try", "explore", "look into", "contemplate", "deliberate on", "ruminate over", "reflect on" ];
  var shadow_phrases = [ "be wary of", "avoid", "steer clear of", "forgo", "refain from", "resist", "stop", "be suspicious of" ];

  // sentence narratives
  //
  var narrative_fatalistic = [
    "To resolve your situation",
    "To help clear the obstacle",
    "To help achieve your hope or goal",
    "To get at the root of your question",

    "To help see an influence that will soon have an impact",

    "To help see how you've gotten to this point",
    "To help interpret your feelings about the situation",
    "To help you understand the moods of those closest to you",
    "To help understand your fear",
    "To help see the outcome"
  ];

  var narrative_optimistic = [
    "Your situation",
    "An influence now coming into play",
    "Your hope or goal",
    "The issue at the root of your question",
    "An influence that will soon have an impact",
    "Your history",
    "The obstacle",
    "The possible course of action",
    "The current future if you do nothing",
    "The possible future"
  ];

  var _narrative = [
    "The heart of the issue or influence affecting the matter of inquiry",
    "The obstacle that stands in the way",
    "Either the goal or the best potential result in the current situation",
    "The foundation of the issue which has passed into reality",

    "The past or influence that is departing",

    "The future or influence that is approaching",
    "You, either as you are, could be or are presenting yourself to be",
    "Your house or environment",
    "Your hopes and fears",
    "The ultimate result or cumulation about the influences from the other cards in the divination"
  ];

  var narrative = narrative_fatalistic;


  for (var ii=0; ii<n; ii++) { a_idx.push(ii); }

  for (var ii=0; ii<n_card; ii++) {
    var p = Math.floor( Math.random() * (n - ii) );
    var t = a_idx[ii];
    a_idx[ii] = a_idx[p];
    a_idx[p] = t;
  }

  var res = [];

  for (var ii=0; ii<n_card; ii++) {
    var p = a_idx[ii];

    var light_shadow = ["light", "shadow"][Math.floor(Math.random()*2)];

    var _n = d[p].fortune_telling.length;
    _n = 2;
    var idx = Math.floor(Math.random() * _n);
    var fortune = d[p].fortune_telling[idx];

    var __n = d[p].meanings[light_shadow].length;
    __n = 2;
    idx = Math.floor(Math.random() * __n);
    var meaning = d[p].meanings[light_shadow][idx];

    var phrase = ((light_shadow == "light") ? _crnd(light_phrases) : _crnd(shadow_phrases) );
    var sentence = d[p].name + "(" + light_shadow + "): " + narrative[ii] + ", " + phrase + " ... " + meaning;

    var html_sentence = "<b><u>" + _capitalize(d[p].name) + "</u></b> <small>(" + light_shadow + ")</small><br>";
    html_sentence += _capitalize(narrative[ii],1) + ", " + _capitalize(phrase,-1) + " " + _capitalize(meaning,-1);


    var val = {
      "index": p,
      "modifier":light_shadow,
      "name": d[p].name,
      "rank": d[p].rank,
      "suit": d[p].suit,
      "fortune_telling" : fortune,
      "keywords": d[p].keywords,
      "meaning" : meaning,
      "_sentence": sentence,
      "sentence": html_sentence
    };


    res.push(val);
  }

  return res;
}

// called after init is done loading the JSON tarot interpretations
//
function finit() {
  if (!g_tarot.ready) {
    console.log("sleepy");
    setTimeout(finit, 1000);
    return;
  }

  // hacky way to let the tarot cards load before turning on the reading
  //
  setTimeout( function() { document.getElementById("ui_button_reading").click() }, 1000 );

  var reading = tarot_reading_celtic_cross(g_tarot.data);
  g_tarot["reading"] = reading;

  // load each of the SVG tarot cards
  //
  for (var ii=0; ii<reading.length; ii++) {
    //var _modifier = reading[ii].modifier;
    var ui_id = "ui_card" + ii.toString();
    _load("example_deck_svg/" + card_mapping[reading[ii].index],
        (function(_x,_tarot_data,_idx) {
          return function(d) {
            if (d.type == "loadend") {
              if (d.target.readyState == 4) {

                var par_ele = document.getElementById(_x);
                par_ele.innerHTML = "";

                var ele = document.createElement("div");

                var svg_txt = d.target.response;
                ele.innerHTML = svg_txt;
                var svg_ele = ele.querySelector('svg');
                var _w = svg_ele.getAttribute('width');
                var _h = svg_ele.getAttribute('height');
                svg_ele.setAttribute("viewBox", "0 0 432 720");
                svg_ele.setAttribute("preserveAspectRatio", "none");
                svg_ele.setAttribute("height", "300px");
                svg_ele.setAttribute("width", "180px");

                var _m = _tarot_data.modifier;

                if (_m == "shadow") {
                  // ui_card1 is rotated by 90 so the extra 180 flip
                  // will still keep it horizontal
                  //
                  ele.style.transform = "rotate(180deg)";

                  //if (_x == "ui_card1") { ele.style.transform = "rotate(90deg)"; }
                  //else { ele.style.transform = "rotate(180deg)"; }
                }

                //console.log(">>> caption_update", _x, _tarot_data.sentence, "caption_" + _idx, g_ui.caption_dxy[_x]);
                caption_update(_x, _tarot_data.sentence, "caption_" + _idx, g_ui.caption_dxy[_x]);

                var _txt = document.createElement("p");
                _txt.innerHTML = _tarot_data.sentence;


                par_ele.appendChild(ele);
                //par_ele.appendChild(_txt);

                var bg_id = svg_txt.match(/ id=['"]background_creature_[^'"]*['"]/)[0].split(/['"]/)[1];
                var fg_id = svg_txt.match(/ id=['"]creature_[^'"]*['"]/)[0].split(/['"]/)[1];

                g_ui.card_state[_idx].ready = true;
                g_ui.card_state[_idx]["bg_id"] = bg_id;
                g_ui.card_state[_idx]["fg_id"] = fg_id;

                // oof, very very slow
                // also problems with floating minor arcana suit
                //
                if (_idx==0) {
                  //motion_xy_r("#" + bg_id);
                  //motion_float("#" + fg_id);
                }

              }
            }
          }
        })(ui_id,reading[ii], ii));

  }
}


// pixi_canvas_id - the text id of the canvas to use
// _img_bg        - required background image (will move)
// _img_fg        - required foreground image (will float)
// _img_suit      - optional suite data (static)
// _img_text      - optional text data (static)
//
function start_card_canvas(pixi_canvas_id, _img_bg, _img_fg, _img_suit, _img_text) {
  var bg_s = 1440;

  var w = 190, h = 317;
  const app = new PIXI.Application({ antialias: true, width: w, height: h, view: document.getElementById(pixi_canvas_id)  });

  var _scale = h/720.0;

  for (var ii=0; ii<10; ii++) {
    g_data.rnd.push( Math.random()*3/4 + 0.25 );
    g_data.rnd.push( Math.random()/2 + 0.5 );
    g_data.rnd.push( Math.random()/2 + 0.5 );
  }

  app.stage.interactive = true;

  var bg = PIXI.Sprite.from(_img_bg);

  bg.anchor.set(0.5);

  bg.x = app.screen.width / 2;
  bg.y = app.screen.height / 2;

  bg.x = w/2;
  bg.y = h/4;

  app.stage.addChild(bg);

  var container = new PIXI.Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  var fg = PIXI.Sprite.from(_img_fg);
  fg.anchor.set(0.5);

  container.addChild(fg);

  if (typeof _img_suit !== "undefined") {
    var st = PIXI.Sprite.from(_img_suit);
    st.anchor.set(0.5);
    container.addChild(st);
  }

  if (typeof _img_text !== "undefined") {
    var txt = PIXI.Sprite.from(_img_text);
    txt.anchor.set(0.5);
    container.addChild(txt);
  }

  app.stage.addChild(container);

  g_data["app"] = app;
  g_data["bg"] = bg;
  g_data["fg"] = fg;
  g_data["st"] = st;

  let count = 0;
  app.ticker.add( (function(_freq0, _freq1, _freq2) {
    return function() {
      var f = _freq0, fx = _freq1, fy = _freq2;
      fg.y = Math.sin(f*count)*10;
      count += 0.025;
      bg.x = Math.sin(fx*count/2 + (Math.PI/21.0) )*20;
      bg.y = 100+Math.sin(fy*count/2 + (Math.PI/21.0) + (Math.PI/4.0) )*20;
    };
  })(g_data.rnd[0], g_data.rnd[1], g_data.rnd[2]));

}

async function render_svg_to_png(canvas_id, svg_str) {
  var canvas = document.getElementById(canvas_id);
  var gfx_ctx = canvas.getContext('2d');
  var v = await canvg.Canvg.fromString(gfx_ctx, svg_str);
  await v.render();
  var png = canvas.toDataURL();
  return png;
}

function init_pixi_layered_card(canvas_id) {
  var creature_sched = { "base": "minor_arcana_2_0", "attach":{"nesting":[ {"base":"empty" }, {"base":"empty"},{ "base":"goat" }]}};
  var suite_sched = { "base": "minor_arcana_2_0", "attach":{"nesting":[ {"base":"pentacle" }, {"base":"pentacle"},{ "base":"empty" }]}};
  var background_sched = { "base": "cloud", "attach":{"nesting":[{"base":"skull"}]}};

  var seed = '123x';

  var fg_ctx = sibyl.fg_ctx;
  var bg_ctx = sibyl.bg_ctx;

  fg_ctx.global_scale = 0.88;

  fg_ctx.create_background_rect = false;
  var creature_svg_str  = sibyl.mystic_symbolic_sched(fg_ctx, creature_sched);
  var suite_svg_str = sibyl.mystic_symbolic_sched(fg_ctx, suite_sched);

  var bg_id = "bg_ok1234";
  bg_ctx.svg_id = "__background_creature_" + seed;
  bg_ctx.create_background_rect = false;
  bg_ctx.create_svg_header = false;
  bg_ctx.scale = 0.2;
  bg_ctx.global_scale = 0.5;

  var bg_svg_str_single = '<g id="' + bg_id + '">\n' + sibyl.mystic_symbolic_sched(bg_ctx, background_sched) + '\n</g>';

  var _bg = "#777";
  var svg_extra_header = "";
  var w = bg_ctx.svg_width;
  var h = bg_ctx.svg_height;

  var first_bg = true;
  svg_extra_header += "<rect x=\"-" + w.toString() +
    "\" y=\"-" + h.toString() + "\" " +
    "width=\"" + (3*w).toString() +
    "\" height=\"" + (3*h).toString() +
    "\" fill=\"" + _bg +
    "\" data-is-background=\"true\">\n</rect>\n";

  var _n_x = 8;
  var _n_y = 11;
  var dx = 175*bg_ctx.global_scale;
  var dy = 100*bg_ctx.global_scale;
  var bg_svg_str;
  for (var x_idx=0; x_idx<_n_x; x_idx++) {
    for (var y_idx=0; y_idx<_n_y; y_idx++) {
      var _x = Math.floor( x_idx - (_n_x/2) )*dx ;
      var _y = Math.floor( y_idx - (_n_y/2) )*dy ;

      if ((y_idx%2)==1) { _x += dx/2; }

      bg_svg_str += "<g transform=\"";
      bg_svg_str += " translate(" + (-_x).toString() + " " + (-_y).toString() + ")";
      bg_svg_str += "\">";

      if (first_bg) {
        bg_svg_str += bg_svg_str_single;
        first_bg = false;
      }
      else {
        bg_svg_str += '<use xlink:href="#' + bg_id + '"/>\n';
      }

      bg_svg_str  += "</g>";
    }
  }

  var bg_hdr = '<svg version="1.1" id="bg_frame" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500px" height="500px">';
  bg_svg_str = bg_hdr + bg_svg_str + "</svg>";

  g_data.png_card[0].n = 3;
  g_data.png_card[0].text = g_data.png_text["ACE of KEYS"];

  render_svg_to_png("ui_canvas_card5_fg", creature_svg_str).then( _png => {
    g_data.png_card[0].n--;
    g_data.png_card[0].fg = _png;
    if (g_data.png_card[0].n==0) { 
      start_card_canvas("ui_canvas_card5", g_data.png_card[0].bg, g_data.png_card[0].fg, g_data.png_card[0].suit, g_data.png_card[0].text);
    }
  } );

  render_svg_to_png("ui_canvas_card5_suit", suite_svg_str).then( _png => {
    g_data.png_card[0].n--;
    g_data.png_card[0].suit = _png;
    if (g_data.png_card[0].n==0) { 
      start_card_canvas("ui_canvas_card5", g_data.png_card[0].bg, g_data.png_card[0].fg, g_data.png_card[0].suit, g_data.png_card[0].text);
    }
  } );

  render_svg_to_png("ui_canvas_card5_bg", bg_svg_str).then( _png => {
    g_data.png_card[0].n--;
    g_data.png_card[0].bg = _png;
    if (g_data.png_card[0].n==0) { 
      start_card_canvas("ui_canvas_card5", g_data.png_card[0].bg, g_data.png_card[0].fg, g_data.png_card[0].suit, g_data.png_card[0].text);
    }
  } );
  //render_svg_to_png(canvas_id, svg_str).then( _png => { g_data.png_card[0].n--; g_data.png_card[0].fg = _png; } );

  return;

  setTimeout(function() {
    var fg_png = document.getElementById("ui_canvas0").toDataURL();
    var su_png = document.getElementById("ui_canvas1").toDataURL();
    var bg_png = document.getElementById("ui_canvas2").toDataURL();
    init_card_canvas("ui_canvas_x", bg_png, fg_png, su_png, "img/st.png");
  }, 0);

}

// call on initial page load
//
function init() {
  _load("data/tarot_interpretations.json", _tarot_json_cb);

  //DEBUG
  //setTimeout(finit, 1000);

  //init_svg_text().then( _png => { console.log(_png); } );
  init_svg_text();

  return;

  //...
  init_card_canvas();
}

function _bbox(ele) {
  let bbox = ele.getBoundingClientRect();
  return [ [ bbox.left + window.pageXOffset, bbox.bottom + window.pageYOffset ],
           [ bbox.right + window.pageXOffset, bbox.top + window.pageYOffset ] ];
}

// update the caption (reading).
// ui_id is the card id and cap_name is the caption element id.
//
// dxy can be given to do other positioning.
//
function caption_update(ui_id, txt, cap_name, dxy) {
  dxy = ((typeof dxy === "undefined") ? [-220, 120] : dxy);
  //var _m = (g_ui.mobile_view?"_m":"");

  var caption = document.getElementById(cap_name)

  var captxt = document.getElementById(cap_name + "_text");
  captxt.innerHTML = txt;

  console.log(">>>", ui_id );

  var ele = document.getElementById(ui_id);
  var domrect = ele.getBoundingClientRect();

  var b = _bbox(ele);

  caption.style.position = "absolute";
  if (g_ui.mobile_view) {
    caption.style.left = (b[1][0] + 10).toString() + "px";
    caption.style.top = (b[1][1] + 10).toString() + "px";
  }
  else {
    caption.style.left = (b[0][0] + dxy[0]).toString() + "px";
    caption.style.top = (b[1][1] + dxy[1]).toString() + "px";
  }

}

async function init_svg_text() {

  var svg_header = '<svg version="1.1"' +
    ' id="Frame_0" xmlns="http://www.w3.org/2000/svg"' +
    ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
    ' width="190px"' +
    ' height="317px">'

  var txt_ele_numeral = '<text x="0" y="0" id="_text_numeral">' +
    '<tspan' +
    '  id="_tspan_numeral"' +
    //'  x="216"' +
    '  x="95"' +
    //'  y="64"' +
    '  y="28"' +
    ' text-anchor="middle"' +
    '  style="fill:rgb(50,50,50);font-style:normal;font-variant:normal;font-weight:bold;' +
      //'font-stretch:normal;font-size:33px;font-family:\'Caviar Dreams\';' +
      'font-stretch:normal;font-size:15px;font-family:\'Caviar Dreams\';' +
      '-inkscape-font-specification:\'Caviar Dreams, Bold\';' +
      'font-variant-ligatures:normal;font-variant-caps:' +
      'normal;font-variant-numeric:normal;font-feature-settings:' +
      'normal;text-align:center;writing-mode:lr-tb;' +
      'text-anchor:middle;stroke-width:0.26458332px">' +
    '<!--::TEXT::-->' +
    '</tspan>' +
    '</text> ';

  var txt_ele_name =
    //'<rect rx="23" x="41" y="608" width="351" height="46" fill="#efefef" > ' +
    '<rect rx="10" x="18" y="267" width="154" height="20" fill="#efefef" > ' +
    '</rect>' +
    '<text x="0" y="0" id="_text_name">' +
    '<tspan' +
    '  id="_tspan_name"' +
    ' text-anchor="middle"' +
    //'  x="216"' +
    '  x="95"' +
    //'  y="644"' +
    '  y="283"' +
    '  style="fill:rgb(50,50,50);font-style:normal;font-variant:normal;' +
      //'font-weight:bold;font-stretch:normal;font-size:33px;' +
      'font-weight:bold;font-stretch:normal;font-size:15px;' +
      'font-family:\'Caviar Dreams\';-inkscape-font-specification:\'Caviar Dreams, Bold\';'+
      'font-variant-ligatures:normal;font-variant-caps:normal;' +
      'font-variant-numeric:normal;font-feature-settings:normal;' +
      'text-align:center;writing-mode:lr-tb;text-anchor:middle;' +
      'stroke-width:0.26458332px">' +
    '<!--::TEXT::-->' +
    '</tspan>' +
    '</text> ';



  for (var suit_idx=0; suit_idx < g_data.minor_arcana_suit.length; suit_idx++) {
    for (var num_idx=0; num_idx < g_data.minor_arcana.length; num_idx++) {

      var name = g_data.minor_arcana[num_idx].toUpperCase() + " of " + g_data.minor_arcana_suit[suit_idx].toUpperCase() + "S";

      g_data.svg_text[name] = svg_header;

      if ((num_idx>0) && (num_idx<10)) {
        g_data.svg_text[name] += txt_ele_numeral.replace('<!--::TEXT::-->', g_data.numeral[num_idx+1]);
      }

      if ((num_idx<1) || (num_idx>=10)) {
        g_data.svg_text[name] += txt_ele_name.replace('<!--::TEXT::-->', name );
      }

      g_data.svg_text[name] += "</svg>";

    }
  }


  for (var ma_idx=0; ma_idx<g_data.major_arcana.length; ma_idx++) {
    var name = g_data.major_arcana[ma_idx].name;

    g_data.svg_text[name] = svg_header;
    g_data.svg_text[name] += txt_ele_numeral.replace('<!--::TEXT::-->', g_data.numeral[num_idx]);
    g_data.svg_text[name] += txt_ele_name.replace('<!--::TEXT::-->', name);
    g_data.svg_text[name] += "</svg>";

  }

  var canvas_txt = document.getElementById("ui_backbuffer_text_canvas");
  var gfx_ctx = canvas_txt.getContext('2d');
  var v;
  for (var name in g_data.svg_text) {
    v = await canvg.Canvg.fromString(gfx_ctx, g_data.svg_text[name]);
    await v.render();
    g_data.png_text[name] = canvas_txt.toDataURL();

    //console.log( name, g_data.png_text[name] );
  }

  return;

  //test
  var b = document.getElementById("testing");
  var img = document.createElement("img");
  img.src = g_data.png_text["THE FOOL"];;
  b.appendChild(img);

  /*
  var t = svg_header;
  t += txt_ele_name.replace('<!--::TEXT::-->', "middle text");
  t += "</svg>";
  v = await canvg.Canvg.fromString(gfx_ctx, t);
  await v.render();
  var t_png = canvas_txt.toDataURL();
  */
}


$(document).ready(function() {
  //caption_show("ui_card6", "foo");

  // card1 is under card0 so when card0 is hovered over,
  // make card1 semi translucent to see the full card0
  //
  // All other cards have mouse enter/leave events
  // captured to popup the reading or ignore it
  // if the reading button has been toggled.
  //
  $("#ui_card0").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card0", g_tarot.reading[0].sentence, "caption_0" + _m, [200,-150]);
    $("#caption_0" + _m).fadeIn();
    $("#ui_card1" + _m).fadeTo(400, 0.15);
  });

  $("#ui_card0").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_0" + _m).fadeOut();
    }
    $("#ui_card1" + _m).fadeTo(400, 1.0);
  });

  //--

  $("#ui_card1").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card1", g_tarot.reading[1].sentence, "caption_1" + _m, [-180,250]);
    $("#caption_1" + _m).fadeIn();

  });

  $("#ui_card1").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_1" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card2").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card2", g_tarot.reading[2].sentence, "caption_2" + _m, [0,-180]);
    $("#caption_2" + _m).fadeIn();
  });

  $("#ui_card2").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_2" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card3").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card3", g_tarot.reading[3].sentence, "caption_3" + _m, [0,330]);
    $("#caption_3" + _m).fadeIn();
  });

  $("#ui_card3").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_3" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card4").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card4", g_tarot.reading[4].sentence, "caption_4" + _m, [0,-180]);
    $("#caption_4" + _m).fadeIn();
  });

  $("#ui_card4").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_4" + _m).fadeOut();
    }
  });

  //--


  $("#ui_card5").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card5", g_tarot.reading[5].sentence, "caption_5" + _m, [0,330]);
    $("#caption_5" + _m).fadeIn();
  });

  $("#ui_card5").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_5" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card6").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card6", g_tarot.reading[6].sentence, "caption_6" + _m);
    $("#caption_6" + _m).fadeIn();
  });

  $("#ui_card6").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_6" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card7").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card7", g_tarot.reading[7].sentence, "caption_7" + _m, [-220, 300]);
    $("#caption_7" + _m).fadeIn();
  });

  $("#ui_card7").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_7" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card8").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card8", g_tarot.reading[8].sentence, "caption_8" + _m, [-220,-120]);
    $("#caption_8" + _m).fadeIn();
  });

  $("#ui_card8").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_8" + _m).fadeOut();
    }
  });

  //--

  $("#ui_card9").mouseenter( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    caption_update("ui_card9", g_tarot.reading[9].sentence, "caption_9" + _m, [-220,-20]);
    $("#caption_9" + _m).fadeIn();
  });

  $("#ui_card9").mouseleave( function(e) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      $("#caption_9" + _m).fadeOut();
    }
  });

  //---

  // initially update captions with default data
  //
  for (var ii=0; ii<10; ii++) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    var ui_id = "ui_card" + ii.toString();
    var cap_id = "caption_" + ii.toString() + _m;
    caption_update(ui_id, g_tarot.reading[ii].sentence, cap_id, g_ui.caption_dxy[ui_id]);
  }

  //--

  $("#ui_button_reading").mouseenter( function(e) {
    var ele = document.getElementById("ui_button_reading");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      ele.style.color = "#333";
    }
    else {
      ele.style.color = "#fff";
    }
  });

  $("#ui_button_reading").mouseleave( function(e) {
    var ele = document.getElementById("ui_button_reading");
    if (g_ui.button_state.ui_button_reading.state == "off") {
      ele.style.color = "#777";
    }
    else {
      ele.style.color = "#fff";
    }
  });


  // toggle whether all readings are shown at once or
  // only on hover
  //
  $("#ui_button_reading").click( function(e) {


    // disable if all cards are being viewed
    //
    if (g_ui.button_state.ui_button_deck.state == "on") {
      return;
    }

    if (g_ui.button_state.ui_button_reading.state == "off") {
      g_ui.button_state.ui_button_reading.state = "on";
      var ele = document.getElementById("ui_button_reading");
      ele.style.backgroundColor = "#777";
      ele.style.color = "#fff";

      var _m = (g_ui.mobile_view ? "_m" : "");
      for (var ii=0; ii<10; ii++) {
        var ui_id = "ui_card" + ii.toString();
        var cap_id = "caption_" + ii.toString() + _m;
        caption_update(ui_id, g_tarot.reading[ii].sentence, cap_id, g_ui.caption_dxy[ui_id]);
        $("#caption_" + ii.toString() + _m).fadeIn();
      }

    }
    else {
      g_ui.button_state.ui_button_reading.state = "off";
      var ele = document.getElementById("ui_button_reading");
      ele.style.backgroundColor = "transparent";
      ele.style.color = "#333";

      var _m = (g_ui.mobile_view ? "_m" : "");
      for (var ii=0; ii<10; ii++) {
        $("#caption_" + ii.toString() + _m).fadeOut();
      }

    }

  });

  //---

  // doing the highlight and focus is easier then 
  // figuring out how to do it incss.
  // Enable the appropriate button state in the g_ui
  // state object.
  //
  $("#ui_button_deck").mouseenter( function(e) {
    var ele = document.getElementById("ui_button_deck");
    if (g_ui.button_state.ui_button_deck.state == "off") {
      ele.style.color = "#333";
    }
    else {
      ele.style.color = "#fff";
    }
  });

  $("#ui_button_deck").mouseleave( function(e) {
    var ele = document.getElementById("ui_button_deck");
    if (g_ui.button_state.ui_button_deck.state == "off") {
      ele.style.color = "#777";
    }
    else {
      ele.style.color = "#fff";
    }
  });

  // toggle between the deck view pane or the reading
  // pane
  //
  $("#ui_button_deck").click( function(e) {

    var _ele_read = document.getElementById("ui_tarot_reading");
    var _ele_deck = document.getElementById("ui_tarot_deck");

    if (g_ui.button_state.ui_button_deck.state == "off") {
      g_ui.button_state.ui_button_deck.state = "on";
      var ele = document.getElementById("ui_button_deck");
      ele.style.backgroundColor = "#777";
      ele.style.color = "#fff";

      _ele_read.style.display = "none";
      _ele_deck.style.display = "block";

      // disable reading...
      //
      g_ui.button_state.ui_button_reading.state = "off";
      var ele = document.getElementById("ui_button_reading");
      ele.style.backgroundColor = "transparent";
      ele.style.color = "#333";

      for (var ii=0; ii<10; ii++) {
        $("#caption_" + ii.toString()).fadeOut();
        $("#caption_" + ii.toString() + "_m").fadeOut();
      }

    }
    else {
      g_ui.button_state.ui_button_deck.state = "off";
      var ele = document.getElementById("ui_button_deck");
      ele.style.backgroundColor = "transparent";
      ele.style.color = "#777";

      _ele_read.style.display = "grid";
      _ele_deck.style.display = "none";

    }

    console.log("deck");
  });

  //---

  // wip
  //
  $("#ui_button_download").click( function(e) {
    console.log("dl");
  });

  // initially set whether we're in mobile view state
  //
  g_ui.mobile_view = ( ($(window).width() < g_ui.mobile_width) ? true : false );

  init();



});

window.onresize = function() {
  var prev_mobile_view = g_ui.mobile_view;
  g_ui.mobile_view = ( ($(window).width() < g_ui.mobile_width) ? true : false );

  // if we're in the deck view state, turn off all captions
  //
  if (g_ui.button_state.ui_button_deck.state == "on") {
    for (var ii=0; ii<10; ii++) {
      $("#caption_" + ii.toString() + "_m").fadeOut();
      $("#caption_" + ii.toString()).fadeOut();
    }
    return;
  }

  // if we've resized from a mobile view to a desktop view or vice
  // versa, disable/enable the appropriate mobile captions and
  // enable/disable the desktop captions
  //
  if (prev_mobile_view != g_ui.mobile_view) {
    g_ui.button_state.ui_button_reading.state = "off";
    var ele = document.getElementById("ui_button_reading");
    ele.style.backgroundColor = "transparent";
    ele.style.color = "#333";

    var _m = (g_ui.mobile_view ? "_m" : "");
    for (var ii=0; ii<10; ii++) {
      if (prev_mobile_view) {
        $("#caption_" + ii.toString() + "_m").fadeOut();
        $("#caption_" + ii.toString()).fadeIn();
      }
      else {
        $("#caption_" + ii.toString() + "_m").fadeIn();
        $("#caption_" + ii.toString()).fadeOut();
      }
    }
  }

  // update captions
  //
  for (var ii=0; ii<10; ii++) {
    var _m = (g_ui.mobile_view ? "_m" : "");
    var ui_id = "ui_card" + ii.toString();
    var cap_id = "caption_" + ii.toString() + _m;
    caption_update(ui_id, g_tarot.reading[ii].sentence, cap_id, g_ui.caption_dxy[ui_id]);
  }
}
