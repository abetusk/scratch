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

var CTX = {
  "v_id": 0
};

var ELEM_FUNC = {
  "*" : 1,
  "/" : 1,
  "+" : 1,
  "-" : 1,

  "^" : 1,
  "sin" : 1,
  "cos": 1,
  "exp" : 1,
  "ln" : 1

};

function _is_num(s) {
  if (s.match( /^-?\d+(.\d*)?$/ )) { return true; }
  return false;
}

function _is_elem_func(s) {
  if (s in ELEM_FUNC) { return true; }
  return false;
}

function _uuid(n) {
  n = ((typeof n === "undefined") ? 4 : n);
  let a = "abcdefghijkmlnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let _a = [];
  for (let i=0; i<n; i++) {
    _a.push( a[ Math.floor(RND()*a.length) ] );
  }
  return _a.join("");
}

function tokenize( _line ) {

  let _debug = 0;

  let __line = _line
    .replace( /\(/g, ' ( ')
    .replace( /\)/g, ' ) ')
    .trim();

  let _tok = __line.split( /  */g);

  if (_debug > 1) {
    console.log(">>", JSON.stringify(_tok));
  }

  return _tok;
}


function build_ast(tok, idx) {
  idx = ((typeof idx === "undefined") ? 0 : idx);

  if ((tok.length - idx) <= 0) {
    return { "type": "E", "msg": "|tok| < 0", "di":-1 };
  }

  let _di = 0;

  let t = tok[idx];
  idx++;
  _di++;

  // number
  //
  if ( _is_num(t) ) {
    return { "type": "n", "di": 1, "msg": "", "val": parseFloat(t), "id": t };
  }

  // start of list
  //
  if ( t == '(') {

    let _a_res = { "type": "a", "di": 0, "child": [], "msg": "", "id" : _uuid(8) };

    if ((tok.length - idx) <= 0) {
      return { "type": "E", "msg": "|tok| < 0 (B)", "di":-1 };
    }

    t = tok[idx];
    while (t != ')') {
      let res = build_ast(tok, idx);
      if (res.type == 'E') { return res; }

      _a_res.child.push( res );

      idx += res.di;
      _di += res.di;

      if ((tok.length - idx) <= 0) {
        return { "type": "E", "msg": "|tok| < 0 (C)", "di":-1 };
      }

      t = tok[idx];
    }
    idx++;
    _di++;

    _a_res.di = _di;
    return _a_res;
  }

  // symbol
  //
  if (_is_elem_func(t)) {
    let _id = _uuid() + "_" + CTX.v_id.toString();
    CTX.v_id++;
    let res = { "type": "F", "di": 1, "msg": "", "val": t, "id": _id, "dep": {}, "par": {} };

    return res;
  }

  // var
  //
  return { "type": "v", "di": 1, "msg": "", "val": t, "id": t, "dep": {}, "par": {} };
}

function process_ast(ast_node) {
  let _env = {};

  if (ast_node.type == 'n') { return _env; }



  if (ast_node.type == 'a') { 

    let child = ast_node.child;
    let F_node = child[0];
    
    _env[child[0].id] = 1;
    for (let i=1; i<child.length; i++) {
      let child_env = process_ast(child[i]);

      for (let ekey in child_env) {
        F_node.dep[ekey] = 1;
        _env[ekey] = 1;
      }

    }

    return _env;
  }

  if ((ast_node.type == 'F') ||
      (ast_node.type == 'v')) {
    _env[ast_node.id] = 1;
    return _env;
  }

  return _env;
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

  let rval = 0;

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
    "val": rval
  };

  return res;
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

//console.log(_uuid(), _uuid(8));

function _WS(n,tok) {
  n = ((typeof n === "undefined") ? 0 : n);
  tok = ((typeof tok === "undefined") ? ' ' : tok);
  let ws = [];
  for (let i=0; i<n; i++) { ws.push(tok); }
  return ws.join("");
}

function _print_ast_redux(ast_node, indent) {
  indent = ((typeof indent === "undefined") ? 0 : indent);

  if (ast_node.type == 'n') {
    console.log(_WS(indent), ast_node.val);
    return;
  }

  if (ast_node.type == 'F') {
    let dep_a = [];
    for (let key in ast_node.dep) { dep_a.push(key); }
    console.log(_WS(indent), ast_node.val, "{", ast_node.id, "}", "[", dep_a.join(" "), "]" );
    return;
  }

  if (ast_node.type == 'v') {
    console.log(_WS(indent), ast_node.val, "{", ast_node.id, "}");
    return;
  }

  if (ast_node.type == 'a') {
    let child = ast_node.child;
    for (let i=0; i<child.length; i++) {
      _print_ast_redux(child[i], indent+1);
    }

    return;
  }

  return;
}

async function repl() {

  let _debug = 2;

  let _rl = readline.createInterface({
    "input" :  process.stdin,
    "terminal": false
  });
  for await (let _line of _rl) {

    _line = _line.trim();

    if ((_line.length == 0) ||
        (_line[0] == ';')) {
      process.stdout.write("$ ");
      continue;
    }

    let tok = tokenize(_line);
    let ast = build_ast(tok, 0);



    let deps = process_ast(ast);
    console.log("...", ast);
    console.log(">>", deps);

    _print_ast_redux(ast);

    process.stdout.write("$ ");

  }
};

process.stdout.write("$ ");
repl();


