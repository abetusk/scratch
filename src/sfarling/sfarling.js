// To the extent possible under law, the person who associated CC0 with
// sfarling has waived all copyright and related or neighboring rights
// to sfarling.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var numeric = require("numeric");
var Q = require("quaternion");
var njs = numeric;

var g_info = {
  "sfarling": {
    "v" : [0,0,0],
    "q": {},
    "d" : [ [1,0,0], [0,1,0], [0,0,1] ]
  }
};

let v = [1,2,3];

function v_renorm( v ) {
  let u = njs.norm2(v);
  for (let i=0; i<3; i++) {
    v[i] /= u;
  }
}

function b_renorm( b ) {
  for (let i=0; i<3; i++) {
    let u = njs.norm2(b[i]);
    for (let j=0; j<3; j++) {
      b[i][j] /= u;
    }
  }
  return b;
}

function b_gram_schmidt(b) {
  let b1 = njs.sub( b[1], njs.dot( 1.0 / njs.norm2(b[0]), njs.dot(b[0], njs.dot(b[0], b[1]) ) ) );
  v_renorm(b1);
  let b2 = njs.sub( b[2], njs.dot( 1.0 / njs.norm2(  b1),   njs.dot(b1, njs.dot(  b1, b[2]) ) ) );
  v_renorm(b2);

  let b2_ = njs.sub(  b2, njs.dot( 1.0 / njs.norm2(b[0]), njs.dot(b[0], njs.dot(b[0],   b2) ) ) );
  v_renorm(b2_);

  for (let i=0; i<3; i++) {
    b[1][i] = b1[i];
    b[2][i] = b2_[i];
  }

  return b;
}

function b_nlerp( b0, b1, t, res ) {
  res = ((typeof res === "undefined") ? [[0,0,0],[0,0,0],[0,0,0]] : res);

  res[0] = njs.add( b0[0], njs.dot(t, njs.sub(b1[0], b0[0])) );
  res[1] = njs.add( b0[1], njs.dot(t, njs.sub(b1[1], b0[1])) );
  res[2] = njs.add( b0[2], njs.dot(t, njs.sub(b1[2], b0[2])) );

  b_renorm(res);

  return res;
}

function b_rand(res) {
  res = ((typeof res === "undefined") ? [[0,0,0],[0,0,0],[0,0,0]] : res);

  for (let i=0; i<3; i++) {
    for (let j=0; j<3; j++) {
      res[i][j] = Math.random();
    }

    let u = njs.norm2(res[i]);

    for (let j=0; j<3; j++) {
      res[i][j] /= u;
    }
  }

  b_gram_schmidt(res);

  if (njs.det(res) < 0) {
    res[2][0] *= -1;
    res[2][1] *= -1;
    res[2][2] *= -1;
  }

  b_renorm(res);

  return res;
}

function check_basis(b) {
  console.log("b0,b1:", njs.dot(b[0],b[1]));
  console.log("b0,b2:", njs.dot(b[0],b[2]));
  console.log("b1,b2:", njs.dot(b[1],b[2]));
}

function b_print(b) {
  console.log(b[0][0], b[0][1], b[0][1]);
  console.log(b[1][0], b[1][1], b[1][1]);
  console.log(b[2][0], b[2][1], b[2][1]);
}

function check0() {

  let _b = [
    [1,0,0],
    [Math.random(), Math.random(), Math.random()],
    [Math.random(), Math.random(), Math.random()]
  ];

  b_renorm(_b);

  console.log(">>",
    njs.norm2(_b[0]),
    njs.norm2(_b[1]),
    njs.norm2(_b[2]));
  check_basis(_b);

  b_gram_schmidt(_b);

  console.log(">>",
    njs.norm2(_b[0]),
    njs.norm2(_b[1]),
    njs.norm2(_b[2]));
  check_basis(_b);

}

function check1() {
  let b0 = [[1,0,0], [0,1,0], [0,0,1]];
  let b1 = b_rand();

  b_print(b0);
  console.log("##");
  b_print(b1);

  console.log(">>", njs.det(b0), njs.det(njs.transpose(b1)));
  process.exit();
}



let b0 = [[1,0,0], [0,1,0], [0,0,1]];
let b1 = b_rand();

let b_t = [];

let n_it = 100;
for (let it=0; it<n_it; it++) {
  let t = it/(n_it-1);

  b_t.push( b_nlerp(b0, b1, t) );

}

for (let xyz=0; xyz<3; xyz++) {
  for (let i=0; i<b_t.length; i++) {
    console.log(b_t[i][xyz][0], b_t[i][xyz][1], b_t[i][xyz][2], "#", njs.det(b_t[i]), njs.det(njs.transpose(b_t[i])  ) );
  }
  console.log("\n\n");
}

