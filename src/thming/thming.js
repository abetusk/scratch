var m = require("mathjs");



var x = m.parse("2 + 3");
console.log(x);


function _rule_eq(_in, _out) {
  if (typeof _in === "undefined") { return false ; }
  if (typeof _out === "undefined") { return false ; }
  if (typeof _in.length === "undefined") { return false ; }
  if (_in.length !=3 ) { return false; }

  if (_in[1] !== "=") { return false; }

  var __out = _out;
  if (typeof _out.length !== "undefined") {
    if (_out.length != 1) { return false; }
    __out = _out[0];
  }

  if (_in[0] == __out) { return true; }
  if (_in[2] == __out) { return true; }

  return false;
}

var rule = {
  "eq": { "name" : "equal", "shortName": "eq", "f": _rule_eq }
};

function checkRule(rule, _in, _out) {

  for (var rname in rule) {
    var r = rule[rname];

    console.log("# considering", r, r.name, r.shortName);
    if (r.f(_in,_out)) { return true; }
  }

  return false;
}

var tsts = [
  [ [ "a", "=", "b" ], "a", true ],
  [ [ "a", "=", "b" ], ["a"], true ],
  [ [ "a", "=", "b" ], "b", true ],
  [ [ "a", "=", "b" ], ["b"], true ],
  [ [ "a", "=", "b" ], ["c"], false]
];

var sample_proof0 = [
  [ `\ln(1+x)`, `=`, `\sum_{k=0}^{\infty} \frac{x^k}{k!}` , "taylor_expansion_ln_1_plus_x" ],
  [ `\ln(1+x)`, `=`, `\frac{x^0}{0}`, `+`, `\sum{k=1}^{\infty} \frac{x^k}{k}`, "sum_first_ele" ],
  [ `\ln(1+x)`, `=`, `x^0`, `+`, `\sum{k=1}^{\infty} \frac{x^k}{k}`, "fraction_denom_1" ],
  [ `\ln(1+x)`, `=`, `1`, `+`, `\sum{k=1}^{\infty} \frac{x^k}{k}`, "variable_power_0" ],
  [ `\ln(1+x)`, `=`, `1`, `+`, `\frac{x^1}{1}` , `+`, `\sum{k=2}^{\infty} \frac{x^k}{k}`, "sum_first_ele" ],
  [ `\ln(1+x)`, `=`, `1`, `+`, `x^1` , `+`, `\sum{k=2}^{\infty} \frac{x^k}{k}`, "fraction_denom_1" ],
  [ `\ln(1+x)`, `=`, `1`, `+`, `x` , `+`, `\sum{k=2}^{\infty} \frac{x^k}{k}`, "variable_power_1" ],

];

console.log(">>>");

for (var idx=0; idx<tsts.length; idx++) {
  var r = checkRule(rule, tsts[idx][0],  tsts[idx][1]);
  if (r!=tsts[idx][2]) { 
    console.log("test failed for test, got", r, ", expected", tsts[idx][2], "(", idx, JSON.stringify(tsts[idx]), ")");
  }
  else {
    console.log("ok", idx);
  }
}

