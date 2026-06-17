#!/usr/bin/env node
// 
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//   


var readline = require("readline");
var srand = require("seedrandom");

var RND = srand("lsp.js");

function _uuid(n) {
  n = ((typeof n === "undefined") ? 4 : n);
  let a = "abcdefghijkmlnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let _a = [];
  for (let i=0; i<n; i++) {
    _a.push( a[ Math.floor(RND()*a.length) ] );
  }
  return _a.join("");
}

function _UOP(op, a, par) {
  let res = {
    "type": "op",
    "val": op,
    "param" : [a],
    "par": par
  };

  return res;
}

function _BOP(op, a, b, par) {

  let res = {
    "type": "op",
    "val": op,
    "param" : [a,b],
    "par": par
  };

  return res;
}

function _VAR(v) {
  let res = {
    "type": "var",
    "val" : v
  };
  return res
}

function _NUM(v) {
  let res = {
    "type": "num",
    "val" : v
  };
  return res
}

function _eval( E, env ) {
  env = ((typeof env === "undefined") ? {} : env);

  let _type = E.type;

  if (_type == 'num') {
    return { "type":"num", "val": E.val };
  }

  if (_type == 'var') {
    if (!(E.val in env)) {
      return {"type":"error", "val": -1, "msg": "could not find " + E.val.toString() + " in env"};
    }
    return {"type":"num", "val": env[E.val]};
  }

  // else we have an expression

  let op = E.val;
  let param = E.param;
  let _vals = [];

  let _rval = 0;

  for (let i=0; i<param.length; i++) {
    let _r = _eval( param[i], env );
    if (_r.type == "error") { return _r; }
    _vals.push(_r);

    if      (op == '+') { rval = (rval+_r.val); }
    else if (op == '-') { rval = ((i==0) ? _r.val : (rval-_r.val)); }
    else if (op == '*') { rval = ((i==0) ? _r.val : (rval*_r.val)); }
    else if (op == '/') { rval = ((i==0) ? _r.val : (rval/_r.val)); }
    else if (op == 'cos') { rval = Math.cos(_r.val); }
    else if (op == 'sin') { rval = Math.sin(_r.val); }
    else if (op == '^') { rval = ((i==0) ? _r.val : Math.pow(rval, _r.val)); }
  }

  let res = {
    "type": "num",
    "val": rval;
  };

  return res;
}

function _is_num(s) {
  if (s.match( /^-?\d+(.\d*)?$/ )) { return true; }
  return false;
}



/*
function _build( tok ) {

  let valid_op = [ '+', '-', '*', '/', 'cos', 'sin', '^' ];

  let _err = { "type": "error", "val": -1, "msg": "error" }

  if (tok.length == 0) { return _err; }

  if (tok.length == 1) {
    if (_is_num(tok[0])) {
      return { "type": "num", "val" : parseFloat(tok[0]) };
    }
    _err.msg = "invalid number";
    return _err;
  }

  let op = tok[0];

  let op_idx = -1;

  for (let i=0; i<valid_op.length; i++) {
    if (op == valid_op[i]) { op_idx = i; break; }
  }

  if (op_idx < 0) {
    _err.msg = "invalid op";
    return _err;
  }

  let ast = [];
  for (let i=(tok.length-1); i>=0; i--) {
  ast.push( 





}
*/

console.log(_uuid(), _uuid(8));

