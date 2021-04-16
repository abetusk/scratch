// License: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//


function seedstring() {
  var s = "abcdefghijklmnopqrustvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var _r = "";
  for (var i=0; i<32; i++) {
    var idx = Math.floor(Math.random() * s.length);
    _r += s[idx];
  }
  return _r;
}

var seed = seedstring();

var fs = require("fs");

var srand = require("./seedrandom.js");
srand(seed, { "global": true });

console.log("seed:", seed);

var dat = fs.readFileSync("./tarot_interpretations.json");
var tarot = JSON.parse(dat);
//console.log(tarot.tarot_interpretations);

var _narrative = [
  "The heart of the issue or influecne affecting the matter of inquery",
  "The obstacle that stands in the way",
  "Either the goal or the best potential result in the current situation",
  "The foundation of the issue which has passed into reality",

  "The past or influence that is departing",

  "The future or influence that is approaching",
  "You, either as you are, could be or are preseneting yourself to be",
  "Your house or environment",
  "Your hopes and fears",
  "The ultimate result or cumulation about the influsences from the other cards in the divintation"
];

/*
var narrative_fatalistic = [
  "Your situation",
  "An influence now coming into play",
  "Your hope or goal",
  "The issue at the root of your question",
  "An influence that will soon have an impact",
  "Your history",
  "Your feeling about the situation",
  "The mood of those closest to you",
  "Your fear",
  "The outcome"
];
*/

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

function _irand(param0, param1) {
  var _start = 0, _range = 2;
  if (typeof param0 !== "undefined") {
    if (typeof param1 !== "undefined") {
      _start = param0;
      _range = param1;
    }
    else {
      _range = param0;
    }
  }

  return Math.floor(Math.random()*_range) + _start;
}

var narrative = narrative_fatalistic;

function tarot_reading_celtic_cross(tarot_data) {
  var d = tarot_data.tarot_interpretations;
  var n = d.length;
  var a_idx = [];

  var card_spread = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ];
  var n_card = card_spread.length;

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
    
    var val = {
      "index": p,
      "modifier":light_shadow,
      "name": d[p].name,
      "rank": d[p].rank,
      "suit": d[p].suit,
      "fortune_telling" : fortune,
      "keywords": d[p].keywords,
      "meaning" : meaning
    };

    //console.log( card_spread[ii], d[p].name );
    res.push(val);
  }

  return res;
}

var ans = tarot_reading_celtic_cross(tarot);


console.log("----");
console.log("Envision your question that you would like answered or to get insight into...");
console.log("----");

var verbose_reading = false;

if (verbose_reading) {
  for (var ii=0; ii<ans.length; ii++) {

    console.log("");
    console.log(narrative[ii] +":");
    console.log("Card: " + ans[ii].name + " (" + ans[ii].modifier + ")");
    console.log("Card Meaning: " + ans[ii].fortune_telling);
    console.log("Interpretation: " + ans[ii].meaning);
    //console.log(ans[ii].keywords, ans[ii].meaning);
    console.log("");
    //console.log(narrative[ii] + " ... is ... " + ans[ii].meaning);

    if (ans[ii].modifier == "light") {
      var phrases = [
        "you should consider",
        "you should contemplate",
        "think over",
        "try to aim for"

      ];

      var idx = _irand(phrases.length);
      console.log(idx);
      var phrase = phrases[ _irand(phrases.length) ];

      //console.log(narrative[ii] + ", you should consider ... " + ans[ii].meaning);
      console.log(narrative[ii] + ", " + phrase + " ... " + ans[ii].meaning);
    }
    else {
      console.log(narrative[ii] + ", you should be wary of  ... " + ans[ii].meaning);
    }

    console.log("---");
  }
}
else {
  for (var ii=0; ii<ans.length; ii++) {

    if (ans[ii].modifier == "light") {

      var phrases = [
        //"you should consider",
        "consider",
        "aim for",
        "try",
        "explore",
        "look into"

        //"you should contemplate",
        //"contemplate",
        //"examine",
        //"weigh"
        //"deliberate on",
        //"think over"
      ];

      var phrase = phrases[ _irand(phrases.length) ];

      //console.log(ans[ii].name + " (" + ans[ii].modifier + "): " + narrative[ii] + ", you should consider ... " + ans[ii].meaning);
      console.log(ans[ii].name + " (" + ans[ii].modifier + "): " + narrative[ii] + ", " + phrase + " ... " + ans[ii].meaning);
    }
    else {
      var phrases = [
        "be wary of",
        "avoid",
        //"abstain from",
        "steer clear of",
        "forgo",
        "refain from",
        "resist",
        "stop",
        "be suspicious of"
      ];

      var phrase = phrases[ _irand(phrases.length) ];

      console.log(ans[ii].name + " (" + ans[ii].modifier + "): " + narrative[ii] + ", " + phrase + " ... " + ans[ii].meaning);
    }

    console.log("---");
  }

}


