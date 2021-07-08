var alea = require("./alea.js");

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
var rng = new alea(seed);

var minor_arcana = ["ace", "2", "3", "4",
                    "5", "6", "7", "8", "9", "10",
                    "page", "knight", "queen", "king"];
var minor_arcana_suit = ["pentacle", "key", "sword", "cup"];
var major_arcana = [ "fool" ];

for (var suit_idx=0; suit_idx < minor_arcana_suit.length; suit_idx++) {
  for (var card_idx=0; card_idx < minor_arcana.length; card_idx++) {
    console.log(minor_arcana_suit[suit_idx], minor_arcana[card_idx], rstr(rng, 32));
  }
}

for (var midx=0; midx<major_arcana.length; midx++) {
  console.log(major_arcana[midx], rstr(rng, 32));
}
