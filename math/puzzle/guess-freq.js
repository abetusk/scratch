// A function, f, that is guaranteed to choose R to be integral in [0,2^n-1],
// and return 1 if sin(R x) >= 0 and 0 if sin(R x) < x,
// with x an s bit float,
// find R.
//
//

function f(x, R) {
  var r = Math.floor( (Math.sin(R * x) + 1.0) );
  //console.log("r:", r);
  if (r>=1) { return 1; }
  return 0;
}

function _f(x, R) {
  return (Math.sin(R * x) + 1.0);
}

function alg(n, R) {
  var ans = 0.0;
  var dx = 2.0 * Math.PI * Math.pow(1.0/2.0, 2*n);
  for (var ii=0; ii<n; ii++) {
    var x = Math.PI * Math.pow(1.0/2.0, ii) + dx;
    var res = f(x, R);

    if (res < 0.5) { ans += Math.pow(2.0, ii); }
  }
  return ans;
}

var n = 12;
var dx = 2.0 * Math.PI * Math.pow(1.0/2.0, 2*n);
//for (var r=0; r<n;  r++) {
//  var R =  Math.pow(2.0, r);
for (var R=0; R<Math.pow(2.0, n); R+=1) {
  console.log("#", R);
  for (var ii=0; ii<n; ii++) {
    var x = Math.PI * Math.pow(1.0/2.0, ii) + dx;
    console.log(x, ii, f(x, R));
  }
  var _r = alg(n,R);
  if (_r != R) { console.log("NOPE"); }
  console.log(">>", alg(n,R));
  console.log("");
}

