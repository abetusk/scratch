#!/usr/bin/env node
// 
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//   

// This is still a work in progress.
//
// Some issues that I'm working through:
//
// funcdef  : this needs to have a parameter list and have a local environment
//            passed in when called. I'm still trying to work through exactly how to do
//            this.
// proc     : right now, they take in literal values as parameters and this probably should
//            be some sort of AST or something. I haven't figured out how to make it
//            generalized to the point where you can do things like eval recursively
// eval     : related to proc and funcdef, this should evaluate a quoted symbol list, say
//            and maybe have some sort of environment passed in? Currently this isn't even
//            in the list of lookup types
//
// I think how the proceduresl, lambdas, evals etc are resolved is the last major point.
//
// Some minor points:
//
// define and set scoping issues might need to be looked at. Right now, def only goes
// one level up.
//
// I'm also unclear about return values and how to process them for different functions.
//
// Should there be an explicit env/dict command? Is this just the define in disguise?
// Some other semantics for scoping issues?
//

var LU_DESCR = {
  "n" : "num",
  "a" : "array",
  "s" : "symbol",
  "p" : "proc",
  "P" : "proc (lambda, result of funcdef)",
  "d" : "define",
  "c" : "if (cond)",
  "?" : "if (cond)",
  "!" : "set",
  "q" : "quote",
  "@" : "at (array)",
  "e" : "eval",

  "f" : "funcdef",

  "I" : "introspection",
  "u" : 'nop',
  "h" : "help",
  "E" : "error"
};

var readline = require("readline");

function _lsp_ce_add() {
  let s = 0;
  for (let i=0; i<arguments.length; i++) {
    let ele = arguments[i];
    if (ele.type != 'n') { return {"type":'E', "msg":"invalid type to commen env '+'"}; }
    s += ele.val;
  }
  return _lsp_num(s);
}

function _lsp_ce_sub() {
  let s = 0;
  for (let i=0; i<arguments.length; i++) {
    let ele = arguments[i];
    if (ele.type != 'n') { return {"type":'E', "msg":"invalid type to commen env '-'"}; }
    if (i==0) { s += ele.val; }
    else { s -= ele.val }
  }
  return _lsp_num(s);
}

function _lsp_ce_mul() {
  let s = 1;
  for (let i=0; i<arguments.length; i++) {
    let ele = arguments[i];
    if (ele.type != 'n') { return {"type":'E', "msg":"invalid type to commen env '*'"}; }
    s *= ele.val;
  }
  return _lsp_num(s);
}

function _lsp_ce_div() {
  let s = 1;
  for (let i=0; i<arguments.length; i++) {
    let ele = arguments[i];
    if (ele.type != 'n') { return {"type":'E', "msg":"invalid type to commen env '/'"}; }
    if (i==0) { s *= ele.val; }
    else { s /= ele.val }
  }
  return _lsp_num(s);
}




var COMMON_ENV = {
  //"+" : { "type": "p", "n_param": 2, "func": function(a,b) { return _lsp_num(a+b); } },
  //"-" : { "type": "p", "n_param": 2, "func": function(a,b) { return _lsp_num(a-b); } },
  //"*" : { "type": "p", "n_param": 2, "func": function(a,b) { return _lsp_num(a*b); } },
  //"/" : { "type": "p", "n_param": 2, "func": function(a,b) { return _lsp_num(a/b); } }

  "+" : { "type": "p", "n_param": -1, "func": _lsp_ce_add },
  "-" : { "type": "p", "n_param": -1, "func": _lsp_ce_sub },
  "*" : { "type": "p", "n_param": -1, "func": _lsp_ce_mul },
  "/" : { "type": "p", "n_param": -1, "func": _lsp_ce_div },

  "id": "0000",
  "par": undefined
};

function _lookup_env(env, key) {
  if (typeof env === "undefined") { return undefined; }
  if (key in env) { return env[key]; }
  if ("par" in env) { return _lookup_env( env.par, key ); }
  return undefined;
}

function _lsp_num( v ) { return {"type":"n", "val": v}; }

function _lsp_help() {
  console.log("help:");
  for (let key in LU_DESCR) {
    console.log("  ", key, ":", LU_DESCR[key]);
  }
  console.log("");
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

function _lsp_env_new(par_env) {
  par_env = ((typeof par_env === "undefined") ? COMMON_ENV : par_env);
  return { "id": _uuid(), "par": par_env };
}

function build_ast(tok, idx) {
  idx = ((typeof idx === "undefined") ? 0 : idx);
  //par_env = ((typeof par_env === "undefined") ? { "id": _uuid() } : par_env);

  //let _env = { "id": _uuid(), "par": par_env  };

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
    //return { "type": "n", "di": 1, "msg": "", "val": parseFloat(t), "env": _env };
    return { "type": "n", "di": 1, "msg": "", "val": parseFloat(t) };
  }

  // start of list
  //
  if ( t == '(') {

    //let _a_res = { "type": "a", "di": 0, "child": [], "msg": "", "env": _env };
    let _a_res = { "type": "a", "di": 0, "child": [], "msg": "" };

    if ((tok.length - idx) <= 0) {
      return { "type": "E", "msg": "|tok| < 0 (B)", "di":-1 };
    }

    t = tok[idx];
    while (t != ')') {
      //let res = build_ast(tok, idx, _env);
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
  //return { "type": "s", "di": 1, "msg": "", "val": t, "env": _env };
  return { "type": "s", "di": 1, "msg": "", "val": t };
}



function _build_ast(tok, idx, par_env) {
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

function _eval(ast, _env) {
  _env = ((typeof _env === "undefined") ? {"par": COMMON_ENV } : _env);

  let _debug = 0;

  if (_debug > 2) { console.log("::eval:", ast); }

  let _type = ast.type;

  if (_type == 'n') { return { "type":'n', "val":ast.val }; }

  if (_type == 's') {

    if      ( ast.val == 'd' ) { return { "type": 'd' }; }
    else if ( ast.val == 'c' ) { return { "type": 'c' }; }
    else if ( ast.val == '?' ) { return { "type": 'c' }; }
    else if ( ast.val == '!' ) { return { "type": '!' }; }
    else if ( ast.val == '@' ) { return { "type": '@' }; }
    else if ( ast.val == 'e' ) { return { "type": 'e' }; }

    else if ( ast.val == 'q' ) { return { "type": 'q' }; }
    else if ( ast.val == 'f' ) { return { "type": 'f' }; }

    else if ( ast.val == 'h' ) { return { 'type': 'h' }; }
    else if ( ast.val == 'I' ) { return { "type": 'I' }; }


    if (_debug > 2) {
      console.log("");
      console.log(":::s::: ast.val:", ast.val);
      _lsp_print_env( _env );
      console.log("");
    }

    //let vv = _lookup_env( ast.env, ast.val );
    let vv = _lookup_env( _env, ast.val );

    if (typeof vv !== "undefined") { return vv; }

    return { "type":"E", "msg":"invalid 's':" + ast.val.toString() };
  }

  if (_type == 'a') {
    let _a = ast.child;
    if (_a.length == 0) { return { "type":"E", "msg":"empty list" }; }

    let _child_env = _lsp_env_new(_env);
    let u = _eval( _a[0], _child_env );

    if (_debug > 2) { console.log(">>>", u); }

    // ?????
    //
    if (u.type == 'P') {

      //console.log("??? u:", JSON.stringify(u));

      let _parm = u.param;
      let _proc = u.val;

      let _local_env = _lsp_env_new(_child_env);

      for (let i=0; i<_parm.child.length; i++) {

        //console.log("parm[", i, "]:", _parm.child[i].val);

        //_ast_func.env[ _parm[i] ] = _eval( _a[i+1], _child_env );
        _local_env[ _parm.child[i].val ] = _eval( _a[i+1], _child_env );
      }

      //console.log("local_env:", _local_env);

      return _eval( _proc, _local_env );
    }

    // eval
    //
    else if (u.type == 'e') {
      if (_a.length < 2) { return { "type":"u", "val":0 }; }

      //console.log("--eval--");

      // assume first parameter is a quote, say,
      // now we have an ast that needs to be evaluated.
      //
      let __res = _eval( _a[1], _child_env );

      /*
      console.log( "__res.env.id:", __res); //_res.env.id);
      if (__res.type == 'a') {
        for (let i=0; i<__res.child.length; i++) {
          console.log("  ", i, ("env" in __res.child[i]) ? __res.child[i].env.id : 'nil')
        }
      }
      */

      let _res = _eval( __res, _child_env );

      //console.log( "_res.env.id:", _res); //_res.env.id);

      return _res;
    }

    // proc
    //
    else if (u.type == 'p') {
      let param = [];
      for (let i=1; i<_a.length; i++) {
        param.push( _eval( _a[i], _child_env ) );
      }

      let param_val = [];
      for (let i=0; i<param.length; i++) {
        param_val.push( param[i].val );
      }

      let _res = u.func( ...param );
      return _res;
    }

    // define
    //   define symbol and shove it in env above
    //
    //   This might be wrong, we might want to walk the
    //   heirarchy until we reach the root or the first
    //   child not defined and place it there.
    //   As it stands, this only goes one level up th
    //   heirarchy
    //
    else if (u.type == 'd') {
      //ast.env.par[ _a[1].val ] = _eval( _a[2], _child_env );
      //_child_env.par[ _a[1].val ] = _eval( _a[2], _child_env );
      _env.par[ _a[1].val ] = _eval( _a[2], _child_env );

      if (_debug > 2) {
        console.log("\n=== define");
        console.log( JSON.stringify( _child_env, undefined, 2 ) );
        console.log("===\n");
      }

      return { "type": "u", "val": 0 };
    }

    // set
    //   set symbol wherever it is up the env chain
    //
    else if (u.type == '!') {
      //let _env = ast.env;
      //while (typeof _env.par !== "undefined") {
      //  if ( _a[1].val in _env ) { break; }
      //  _env = _env.par;
      //}
      //_env[ _a[1].val ] = _eval( _a[2], _child_env );

      let _local_env = _child_env;
      while (typeof _local_env.par !== "undefined") {
        if ( _a[1].val in _local_env ) { break; }
        _local_env = _local_env.par;
      }
      _local_env[ _a[1].val ] = _eval( _a[2], _child_env );


      return { "type": "u", "val": 0 };
    }

    // at (array)
    //
    else if (u.type == '@') {
      let _at_idx = _eval( _a[1], _child_env );
      let _at_a = _eval( _a[2], _child_env );

      if ((_at_idx.type == 'n') &&
          (_at_a.type == 'a')) {

        let _idx = _at_idx.val;
        if ((_idx < 0) ||
            (_idx >= _at_a.child.length)) {
          return { "type": "E", "msg": "@ OOB" };
        }

        return _at_a.child[_idx];

      }
      else {
        return {"type": "E", "msg" : "invalid parameters to '@'" };
      }
    }


    // conditional
    //
    else if ((u.type == 'c') ||
             (u.type == '?')) {

      let _tst = _eval( _a[1], _child_env );

      if (_tst.val != 0) {
        return _eval( _a[2], _child_env );
      }
      return _eval( _a[3], _child_env );

    }

    // quote...
    // completed? Still unsure about the resolution...:
    //   quote number -> number
    //   quote array -> array
    //
    else if (u.type == 'q') {

      if (_debug > 3) {
        console.log("q...", _a.length, _a);

        for (let i=0; i<_a.length; i++) {
          console.log("  ", i, ":" + _a[i].type + ":", _a[i].val ? _a[i].val : '');

          if (_a[i].type == 'a') {
            let _b = _a[i].child;
            for (let j=0; j<_b.length; j++) {
              console.log("    ", j, _b[j].type );
            }
          }
        }
      }

      if (_a[1].type == 'a') {
        return { "type": "a", "child" : _a[1].child };
      }

      return { "type": _a[1].type, "val": _a[1].val };
    }

    // funcdef (lambda)
    //
    // WIP!!
    //
    else if (u.type == 'f') {

      //console.log("funcdef ... _a:", _a);

      //console.log(">1>>", JSON.stringify(_a[1]));
      //console.log(">2>>", JSON.stringify(_a[2]));

      let _res = {
        "type": "P",
        "param": _a[1],
        "val": _a[2]
      };

      return _res;

      //for (let i=0; i<_a.length; i++) {
      //  console.log("  ", i, JSON.stringify(_a[i], undefined, 2));
      //}

      return { "type": "u", "val": -1 };
    }

    else if (u.type == 'h') {
      _lsp_help();
      return { "type": "u", "val": 0 };
    }

    else if (u.type == 'I') {
      //_lsp_print_env( ast.env );
      _lsp_print_env( _env );
      return { "type": "u", "val": 0 };
    }

  }

  return { "type":"E", "msg": "end of input" };
}

function lsp_print_ast(ast, _env, _indent) {
  _indent = ((typeof _indent === "undefined") ? 0 : _indent);
  _env = ((typeof _env === "undefined") ? COMMON_ENV : _env);

  let _debug = 0;

  let _lu = LU_DESCR;

  let ws = [];
  for (let i=0; i<_indent; i++) { ws.push(' '); }

  if (ast.type == 'a') {
    console.log( ws.join(""), ast.type , "{", _lu[ ast.type ], "}");
    for (let i=0; i<ast.child.length; i++) {
      //lsp_print_ast(ast.child[i], _indent+2);
      lsp_print_ast(ast.child[i], _env, _indent+2);
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
        vv.type, "{", _lu[vv.type], "}" );
        //vv.type, "{", _lu[vv.type], "}", "_" + vv.n_param.toString() + "_" );
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

    if (_debug > 1) { lsp_print_ast(ast, COMMON_ENV); }

    let res = _eval(ast);
    console.log(res);

    //console.log(JSON.stringify(ast, undefined, 2));
  }
};

repl();

console.log("...");
