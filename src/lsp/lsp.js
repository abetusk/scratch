#!/usr/bin/env node
// 
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//   

var LU_DESCR = {
  "n" : "num",
  "a" : "array",
  "s" : "symbol",
  "p" : "proc",
  "d" : "define",
  "c" : "if (cond)",
  "!" : "set",
  "I" : "introspection",
  "u" : 'nop',
  "E" : "error"
};

var readline = require("readline");

var COMMON_ENV = {
  "+" : { "type": "p", "n_param": 2, "func": function(a,b) { return a+b; } },
  "-" : { "type": "p", "n_param": 2, "func": function(a,b) { return a-b; } },
  "*" : { "type": "p", "n_param": 2, "func": function(a,b) { return a*b; } },
  "/" : { "type": "p", "n_param": 2, "func": function(a,b) { return a/b; } }
};

function _lookup_env(env, key) {
  if (typeof env === "undefined") { return undefined; }
  if (key in env) { return env[key]; }
  if ("par" in env) { return _lookup_env( env.par, key ); }
  return undefined;
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

function _is_num(s) {
  if (s.match( /^-?\d+$/ )) { return true; }
  return false;
}

function _uuid() {
  let a = "abcdefghijkmlnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let _a = [];
  for (let i=0; i<4; i++) {
    _a.push( a[ Math.floor(Math.random()*a.length) ] );
  }
  return _a.join("");
}

function build_ast(tok, idx, par_env) {
  idx = ((typeof idx === "undefined") ? 0 : idx);
  par_env = ((typeof par_env === "undefined") ? { "id": _uuid() } : par_env);

  let _env = { "id": _uuid(), "par": par_env  };

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
    return { "type": "n", "di": 1, "msg": "", "val": parseFloat(t), "env": _env };
  }

  // start of list
  //
  if ( t == '(') {

    let _a_res = { "type": "a", "di": 0, "child": [], "msg": "", "env": _env };

    if ((tok.length - idx) <= 0) {
      return { "type": "E", "msg": "|tok| < 0 (B)", "di":-1 };
    }

    t = tok[idx];
    while (t != ')') {
      let res = build_ast(tok, idx, _env);
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
  return { "type": "s", "di": 1, "msg": "", "val": t, "env": _env };
}

function _lsp_print_env( _env, _indent ) {
  _indent = ((typeof _indent === "undefined") ? 0 : _indent);

  if (typeof _env === "undefined") { return ; }

  let ws = [];
  for (let i=0; i<_indent; i++) { ws.push(" "); }
  for (let key in _env) {
    if (key == 'par') { continue; }
    console.log( ws.join(""), key, ":", _env[key]);
  }
  _lsp_print_env( _env.par, _indent + 2 );
}

function _eval(ast) {

  let _debug = 0;

  if (_debug > 2) { console.log("::eval:", ast); }

  let _type = ast.type;

  if (_type == 'n') { return { "type":'n', "val":ast.val }; }

  if (_type == 's') {

    if      ( ast.val == 'd' ) { return { "type": 'd' }; }
    else if ( ast.val == 'c' ) { return { "type": 'c' }; }
    else if ( ast.val == '!' ) { return { "type": '!' }; }
    else if ( ast.val == 'I' ) {

      _lsp_print_env( ast.env );

      return {"type": 'I' };
    }


    let vv = _lookup_env( ast.env, ast.val );

    if (typeof vv !== "undefined") { return vv; }

    return { "type":"E", "msg":"invalid 's':" + ast.val.toString() };
  }

  if (_type == 'a') {
    let _a = ast.child;
    if (_a.length == 0) { return { "type":"E", "msg":"empty list" }; }

    let u = _eval( _a[0] );

    if (_debug > 2) { console.log(">>>", u); }

    // proc
    //
    if (u.type == 'p') {
      if (u.n_param == 2) {

        let ok0 = _eval( _a[1] );
        let ok1 = _eval( _a[2] );

        if (_debug > 3) {
          console.log(">>>>", ok0, _a[1]);
          console.log(">>>>", ok1, _a[2]);
        }

        let param = [
          _eval( _a[1] ),
          _eval( _a[2] )
        ];

        let _res = u.func( param[0].val, param[1].val );

        if (_debug > 2) { console.log("got:", _res); }

        return { "type":"n", "val": _res };
      }

    }

    // define
    //   define symbol and shove it in env above
    //
    else if (u.type == 'd') {
      ast.env.par[ _a[1].val ] = _eval( _a[2] );
      return { "type": "u", "val": 0 };
    }

    // set
    //   set symbol wherever it is up the env chain
    //
    else if (u.type == '!') {
      let _env = ast.env;
      while (typeof _env !== "undefined") {
        if ( _a[1].val in _env ) { break; }
        _env = _env.par;
      }
      _env[ _a[1].val ] = _eval( _a[2] );
      return { "type": "u", "val": 0 };
    }

    // conditional
    //
    else if (u.type == 'c') {

      let _tst = _eval( _a[1] );

      if (_tst.val != 0) {
        return _eval( _a[2] );
      }
      return _eval( _a[3] );

    }

    else if (u.type == 'I') {

      return { "type": "u", "val": 0 };
    }

  }

  return { "type":"E", "msg": "end of input" };
}

function lsp_print_ast(ast, _indent) {
  _indent = ((typeof _indent === "undefined") ? 0 : _indent);

  let _debug = 0;

  let _lu = LU_DESCR;

  let ws = [];
  for (let i=0; i<_indent; i++) { ws.push(' '); }

  if (ast.type == 'a') {
    console.log( ws.join(""), ast.type , "{", _lu[ ast.type ], "}");
    for (let i=0; i<ast.child.length; i++) {
      lsp_print_ast(ast.child[i], _indent+2);
    }
    return;
  }

  if (ast.type == 's') {
    let vv = _lookup_env( ast.env, ast.val );

    if (typeof vv === "undefined") { return; }

    if (_debug > 1) {
      console.log("/*", JSON.stringify(vv), "*/");
    }


    if (vv.type == 'p') {
      console.log( ws.join(""), ast.type, "{", _lu[ast.type], "}", ":", "'" + ast.val.toString() + "'",
        "=>",
        vv.type, "{", _lu[vv.type], "}", "_" + vv.n_param.toString() + "_" );
    }
    else {
      console.log( ws.join(""), ast.type, "{", _lu[ast.type], "}", ":", "'" + ast.val.toString() + "'",
      "=>",
      vv.type, "{", _lu[vv.type], "}");
    }


    return;
  }

  console.log( ws.join(""), ast.type, "{", _lu[ast.type], "}", ":", ast.val );

}

async function repl() {

  let _debug = 2;

  let _rl = readline.createInterface({
    "input" :  process.stdin,
    "terminal": false
  });
  for await (let _line of _rl) {
    let tok = tokenize(_line);
    let ast = build_ast(tok, 0, COMMON_ENV);

    if (_debug > 1) { lsp_print_ast(ast); }

    let res = _eval(ast);
    console.log(res);

    //console.log(JSON.stringify(ast, undefined, 2));
  }
};

repl();

console.log("...");
