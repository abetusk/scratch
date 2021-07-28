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



// global data structure to hold tarot interpretations (loaded from
// `tarot_interpretations.json`)
//
var g_tarot = {
  "ready": false,
  "reading" : [ "", "", "", "", "", "", "", "", "", ""]
};

var g_ui = {
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

  var light_phrases = [ "consider", "aim for", "try", "explore", "look into" ];
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

    var val = {
      "index": p,
      "modifier":light_shadow,
      "name": d[p].name,
      "rank": d[p].rank,
      "suit": d[p].suit,
      "fortune_telling" : fortune,
      "keywords": d[p].keywords,
      "meaning" : meaning,
      "sentence": sentence
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

  var reading = tarot_reading_celtic_cross(g_tarot.data);
  g_tarot["reading"] = reading;

  console.log(reading);

  for (var ii=0; ii<reading.length; ii++) {
    console.log(">>", reading[ii].name, card_mapping[ reading[ii].index ] );

    var _modifier = reading[ii].modifier;

    var ui_id = "ui_card" + ii.toString();
    _load("example_deck_svg/" + card_mapping[reading[ii].index],
        (function(_x,_tarot_data,_idx) {
          return function(d) {
            if (d.type == "loadend") {
              if (d.target.readyState == 4) {

                /*
                $(document).ready(function() {
                  Tipped.create("#" + _x,  _tarot_data.sentence);
                });
                */

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

                console.log(">>> caption_update", _x, _tarot_data.sentence, "caption_" + _idx, g_ui.caption_dxy[_x]);
                caption_update(_x, _tarot_data.sentence, "caption_" + _idx, g_ui.caption_dxy[_x]);

                var _txt = document.createElement("p");
                _txt.innerHTML = _tarot_data.sentence;


                par_ele.appendChild(ele);
                //par_ele.appendChild(_txt);


              }
            }
          }
        })(ui_id,reading[ii], ii));

  }
}

// call on initial page load
//
function init() {
  _load("data/tarot_interpretations.json", _tarot_json_cb);
  setTimeout(finit, 1000);

}

function _bbox(ele) {
  let bbox = ele.getBoundingClientRect();
  return [ [ bbox.left + window.pageXOffset, bbox.bottom + window.pageYOffset ],
           [ bbox.right + window.pageXOffset, bbox.top + window.pageYOffset ] ];
}

function caption_update(ui_id, txt, cap_name, dxy) {
  dxy = ((typeof dxy === "undefined") ? [-220, 120] : dxy);
  var svg_txt = '<svg viewBox="0 0 100px 100px" xmlns="http://www.w3.org/2000/svg">\n' +
      '  <line x1="0" y1="80px" x2="100px" y2="20px" stroke="black" stroke-width="2px" />\n' +
      '</svg>\n';

  var caption = document.getElementById(cap_name)

  var captxt = document.getElementById(cap_name + "_text");
  captxt.innerHTML = txt;

  var ele = document.getElementById(ui_id);
  var domrect = ele.getBoundingClientRect();

  var b = _bbox(ele);

  caption.style.position = "absolute";
  caption.style.left = (b[0][0] + dxy[0]).toString() + "px";
  caption.style.top = (b[1][1] + dxy[1]).toString() + "px";
}

$(document).ready(function() {
  //caption_show("ui_card6", "foo");

  $("#ui_card0").mouseenter( function(e) {
    caption_update("ui_card0", g_tarot.reading[0].sentence, "caption_0", [200,-150]);
    $("#caption_0").fadeIn();
  });

  $("#ui_card0").mouseleave( function(e) {
    $("#caption_0").fadeOut();
  });

  //--

  $("#ui_card1").mouseenter( function(e) {
    caption_update("ui_card1", g_tarot.reading[1].sentence, "caption_1", [-180,250]);
    $("#caption_1").fadeIn();
  });

  $("#ui_card1").mouseleave( function(e) {
    $("#caption_1").fadeOut();
  });

  //--

  $("#ui_card2").mouseenter( function(e) {
    caption_update("ui_card2", g_tarot.reading[2].sentence, "caption_2", [0,-180]);
    $("#caption_2").fadeIn();
  });

  $("#ui_card2").mouseleave( function(e) {
    $("#caption_2").fadeOut();
  });

  //--

  $("#ui_card3").mouseenter( function(e) {
    caption_update("ui_card3", g_tarot.reading[3].sentence, "caption_3", [0,330]);
    $("#caption_3").fadeIn();
  });

  $("#ui_card3").mouseleave( function(e) {
    $("#caption_3").fadeOut();
  });

  //--

  $("#ui_card4").mouseenter( function(e) {
    caption_update("ui_card4", g_tarot.reading[4].sentence, "caption_4", [0,-180]);
    $("#caption_4").fadeIn();
  });

  $("#ui_card4").mouseleave( function(e) {
    $("#caption_4").fadeOut();
  });

  //--


  $("#ui_card5").mouseenter( function(e) {
    caption_update("ui_card5", g_tarot.reading[5].sentence, "caption_5", [0,330]);
    $("#caption_5").fadeIn();
  });

  $("#ui_card5").mouseleave( function(e) {
    $("#caption_5").fadeOut();
  });

  //--

  $("#ui_card6").mouseenter( function(e) {
    caption_update("ui_card6", g_tarot.reading[6].sentence, "caption_6");
    $("#caption_6").fadeIn();
  });

  $("#ui_card6").mouseleave( function(e) {
    $("#caption_6").fadeOut();
  });

  //--

  $("#ui_card7").mouseenter( function(e) {
    caption_update("ui_card7", g_tarot.reading[7].sentence, "caption_7", [-220, 300]);
    $("#caption_7").fadeIn();
  });

  $("#ui_card7").mouseleave( function(e) {
    $("#caption_7").fadeOut();
  });

  //--

  $("#ui_card8").mouseenter( function(e) {
    caption_update("ui_card8", g_tarot.reading[8].sentence, "caption_8", [-220,-120]);
    $("#caption_8").fadeIn();
  });

  $("#ui_card8").mouseleave( function(e) {
    $("#caption_8").fadeOut();
  });

  //--

  $("#ui_card9").mouseenter( function(e) {
    caption_update("ui_card9", g_tarot.reading[9].sentence, "caption_9", [-220,-20]);
    $("#caption_9").fadeIn();
  });

  $("#ui_card9").mouseleave( function(e) {
    $("#caption_9").fadeOut();
  });

  init();

});

