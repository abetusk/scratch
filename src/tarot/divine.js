// License: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//

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

console.log(ans);

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

    var _meaning = _capitalize(ans[ii].meaning, -1);

    if (ii==0) {
      console.log("the heart of the matter is", _meaning);
      console.log("your general life at present is", _meaning);
      console.log("what influences you right now is", _meaning);

      console.log("");
      console.log("The influence that is affecting you or the matter of inquiry generally is", _meaning);
      console.log("");
    }
    else if (ii==1) {
      console.log("the problem or challenge right now is", _meaning);
      console.log("what helps you right now is", _meaning);
      console.log("what hinders you right now is ", _meaning);

      console.log("");
      console.log("\nThe nature of the obstacle in front of you is", _meaning);
      console.log("");
    }
    else if (ii==2) {
      console.log("at the moment, the root cause of the problem is", _meaning);
      console.log("currently, your subconscious influences are", _meaning);

      console.log("");
      console.log("The aim or ideal of the matter is", _meaning);
      console.log("The best that can be acheived under the circumstances are", _meaning);
      console.log("");
    }
    else if (ii==3) {
      console.log("your recent past is", _meaning);
      console.log("what brought you here today is", _meaning);
      console.log("the reason you're here today pertains to", _meaning);

      console.log("");
      console.log("The foundation or basis of the matter that has already passed into actuality is", _meaning);
      console.log("");
    }

    else if (ii==4) {
      console.log("what will happen if nothing changes is", _meaning);
      console.log("the best possible outcome is", _meaning);
      console.log("what you desire as the outcome is", _meaning);
      console.log("your conscious goals and desires are", _meaning);

      console.log("");
      console.log("The influence that has just passed or has passed away is", _meaning);
      console.log("");
    }
    else if (ii==5) {
      console.log("what will happen soon is", _meaning);
      console.log("whether the situation is on hold or ersovling orwhat the situation has on the future is", _meaning);

      console.log("");
      console.log("The influence that is coming into action and will operate in the near future is", _meaning);
      console.log("");
    }

    else if (ii==6)  {
      console.log("you subconscious desire is", _meaning);
      console.log("how you are currently addressing the situation is", _meaning);
      console.log("your true feelings about the situation are", _meaning);

      console.log("");
      console.log("Your position or attitude of the circumstances is", _meaning);
      console.log("");
    }
    else if (ii==7) {
      console.log("other people and their influence, control and desires are", _meaning);
      console.log("the environment that's outside of your control is", _meaning);
      console.log("events outside of your control are", _meaning);

      console.log("");
      console.log("Your environment..", _meaning);
      console.log("");
    }

    else if (ii==8) {
      console.log("what you want or are afraid of is", _meaning);
      console.log("what is hidden is", _meaning);
      console.log("your mindset is", _meaning);
    }
    else if (ii==9) {
      console.log("the likely long term outcome is", _meaning);
    }

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


