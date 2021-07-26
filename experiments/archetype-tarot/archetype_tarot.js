#!/usr/bin/env node

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

var fs = require("fs");

function _irnd(n) {
  return Math.floor(Math.random()*n);
}

function _crnd(x) {
  var n = x.length;
  var idx = Math.floor(Math.random()*n);
  return x[idx];
}


function read_json(fn) {
  var _str = fs.readFileSync(fn, {encoding: 'utf-8'})
  var _json = JSON.parse(_str);
  return _json;
}

var artifact = read_json("./artifact.json");
var character = read_json("./character.json");
var event = read_json("./event.json");
var setting = read_json("./setting.json");

var c = _crnd(character.characters);
var a = _crnd(artifact.artifacts);
var e = _crnd(event.events);
var s = _crnd(setting.settings);

function _sentence(d, _type) {
  if (typeof(_type) === "undeifned") { _type = ""; }
  var _m = "someone who";
  var _m1 = "who has";
  if ((_type == "item") || (_type == "artifact") ||
      (_type == "event")) {
    _m = "something that";
    _m1 = "that has";
  }
  else if (_type == "setting") {
    _m = "somewhere that";
    _m1 = "that has";
  }
  //else if (_type == "event") { }

  var q = d.qualities;
  if ((d.qualities.length == 0) ||
      (d.qualities[0] == "")) {
    q = d.synonyms;
  }

  if (q.length == 0) {
    console.log("The", "[", d.name, "]", _type, "represents", _m, "is", q.slice(0,-1).join(", "), "or", q.slice(-1)[0], "and", _m1, _n, d.nature, "nature.");
  }
  else if (q.length > 1) {
    var _n = ((d.nature[0] == 'e') ? "an" : "a");
    console.log("The", "[", d.name, "]", _type, "represents", _m, "is", q.slice(0,-1).join(", "), "or", q.slice(-1)[0], "and", _m1, _n, d.nature, "nature.");
  }
  else {
    var _n = ((d.nature[0] == 'e') ? "an" : "a");
    console.log("The", "[", d.name, "]", _type, "represents", _m, " is", q.slice(-1)[0], "and", _m1, _n, d.nature, "nature.");
  }
}

_sentence(c, "character");
_sentence(a, "item");
_sentence(e, "event");
_sentence(s, "setting");

/*
console.log("character:", c);
console.log("item:", a);
console.log("event:", e);
console.log("setting:", s);
*/
