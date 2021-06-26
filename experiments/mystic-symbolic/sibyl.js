#!/usr/bin/env node
// License CC0
//

var fs = require("fs");
var color = require("./cam02.js");
var getopt = require("posix-getopt");
var parser, opt;

var _VERSION = "0.1.1";

function show_version(fp) {
  fp.write("version: " + _VERSION + "\n");

}

function show_help(fp) {
  show_version(fp)
  fp.write("\n");
  fp.write("usage:\n");
  fp.write("\n");
  fp.write("    sibyl [-h] [-v] [options] <svgjson> <command>\n");
  fp.write("\n");
  fp.write("  <svgjson>                   svgjson file\n");
  fp.write("  <command>                   random|<dsl>\n");
  fp.write("  [-n nest-depth]             max nesting depth (default " + sibyl_opt.max_nest_depth.toString() + ")\n");
  fp.write("  [-a attach-depth]           max attach depth (default " + sibyl_opt.max_attach_depth.toString() + ")\n");
  fp.write("  [-S scale]                  rescale factor (default " + sibyl_opt.scale.toString() + ")\n");
  fp.write("  [-p color]                  set primary color (ex. '#000000') (default random)\n");
  fp.write("  [-s color]                  set secondary color (ex '#ffffff') (default random)\n");
  fp.write("  [-b color]                  set background color (ex. '#777777') (default random)\n");
  fp.write("  [-c color]                  set background2 color (ex. '#888888') (default random)\n");
  fp.write("  [-B background-image]       set background image ('*' for random)\n");
  fp.write("  [-T background-scale]       set background scale factor (default " + sibyl_opt.background_scale.toString() + ")\n");
  fp.write("  [-D tiledx,tiledy]          shift tile background by tiledx,tiledy (ex. '-10,3') (default '0,0')\n");
  fp.write("  [-t]                        tile background\n");
  fp.write("  [-h]                        show help (this screen)\n");
  fp.write("  [-v]                        show version\n");
  fp.write("\n");
  fp.write("\n");
}

var sibyl_opt = {
  "max_attach_depth" : 1,
  "max_nest_depth" : 2,
  "scale" : 0.5,
  "primary_color" : "",
  "secondary_color" : "",
  "background_color" : "",
  "background_color2" : "",
  "use_background_image":false,
  "background_image":"",
  "background_scale": 1,
  "tile_background" : false,
  "tile_background_dx" : 0,
  "tile_background_dy" : 0
};

var long_opt = [
  "p", ":(primary-color)",
  "s", ":(secondary-color)",
  "b", ":(background-color)",
  "c", ":(background-color2)",
  "a", ":(attach-depth)",
  "n", ":(nest-depth)",
  "S", ":(scale)",
  "B", ":(background-image)",
  "T", ":(background-scale)",
  "t", "(background-tile)",
  "D", ":(background-tile-dxy)"
];

parser = new getopt.BasicParser("h" + long_opt.join(""), process.argv);
while ((opt =  parser.getopt()) !== undefined) {
  switch(opt.option) {

    case 'h':
      show_help(process.stdout);
      process.exit(0);
      break;

    case 'v':
      show_version(process.stdout);
      process.exit(0);
      break;

    case 'p':
      sibyl_opt.primary_color = opt.optarg;
      break;

    case 's':
      sibyl_opt.secondary_color = opt.optarg;
      break;

    case 'b':
      sibyl_opt.background_color = opt.optarg;
      break;

    case 'c':
      sibyl_opt.background_color2 = opt.optarg;
      break;

    //---

    case 'B':
      sibyl_opt.use_background_image = true;
      sibyl_opt.background_image = opt.optarg;
      break;

    case 'T':
      sibyl_opt.background_scale = parseFloat(opt.optarg);
      break;

    case 'D':
      var tok = opt.optarg.split(",");

      sibyl_opt.tile_background_dx = parseFloat(tok[0]);
      if (tok.length > 1) {
        sibyl_opt.tile_background_dy = parseFloat(tok[1]);
      }
      break;

    case 't':
      sibyl_opt.tile_background = true;
      break;

    //---

    case 'S':
      sibyl_opt.scale = parseFloat(opt.optarg);
      break;

    case 'n':
      sibyl_opt.max_nest_depth = parseInt(opt.optarg);
      break;

    case 'a':
      sibyl_opt.max_attach_depth = parseInt(opt.optarg);
      break;

    //---

    default:
      show_help(process.stderr);
      process.exit(-1);
      break;
  }
}

var _rcolor = rand_color();
var primary_color   = _rcolor.primary.hex;
var secondary_color = _rcolor.secondary.hex;
var bg_color        = _rcolor.background.hex;
var bg_color2       = _rcolor.background2.hex;

var svg_header = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<!-- Generator: Moho 13.5 build 20210422 -->',
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
  '<svg version="1.1" id="Frame_0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720px" height="720px">'
].join("");

var svg_footer = "</svg>";


if (sibyl_opt.primary_color.match(/^#[0-9a-fA-F]{6}/)) {
  primary_color = sibyl_opt.primary_color;
}
if (sibyl_opt.secondary_color.match(/^#[0-9a-fA-F]{6}/)) {
  secondary_color = sibyl_opt.secondary_color;
}
if (sibyl_opt.background_color.match(/^#[0-9a-fA-F]{6}/)) {
  bg_color = sibyl_opt.background_color;
}

if (sibyl_opt.background_color2.match(/^#[0-9a-fA-F]{6}/)) {
  bg_color2 = sibyl_opt.background_color;
}


var fn = "./_svg-vocabulary-pretty-printed.json";
var arg_str = "random";

if ( (process.argv.length - parser.optind()) > 1 ) {
  fn = process.argv[parser.optind()];
  arg_str = process.argv[parser.optind()+1];
}

if (fn.length == 0) {
  console.log("provide json");
  show_help(process.stderr);
  process.exit(1);
}

var raw_json = fs.readFileSync(fn);

var adata = JSON.parse(raw_json);
var bg_data = JSON.parse(raw_json);


// https://pegjs.org/online
// https://github.com/pegjs/pegjs
//
var pegjs = require("pegjs");

var gram_fn = "./mystisymbodsl.pegjs";
var gram_str= fs.readFileSync(gram_fn).toString();

var parser = pegjs.generate(gram_str);

function create_node() {
  return {
    "type":"basic",
    "base" : [],
    "nesting":[],
    "horn":[],
    "crown":[],
    "arm":[],
    "leg":[],
    "tail":[]
  };

}

function _clamp(val, _m, _M) {
  if (val < _m) { return _m; }
  if (val > _M) { return _M; }
  return val;
}

function _default_emit(ctx, v) {
  console.log("<>", v.type, v.path, v.ele);
}

function convert_ast(ctx, data, emit) {
  emit = ((typeof emit === "undefined") ? _default_emit : emit);
  var attach_list = {"nesting":1, "horn":1, "crown":1, "arm":1, "leg":1, "tail":1};


  if (data.t == "base") {
    emit(ctx, {"type": "ele", "path":ctx.level, "ele":data.e});

    ctx.cur_node[ctx.cur_attach].push(data.e);
  }

  else if (data.t in attach_list) {

    ctx.cur_attach = data.t;

    ctx.level.pop();
    ctx.level.push(data.t);
    convert_ast(ctx, data.e, emit);
    ctx.level.pop();
  }

  else if (data.t == "sub") {

    var prv_attach = ctx.cur_attach;
    var new_node = create_node();
    var prv_node = ctx.cur_node;
    ctx.cur_node[ctx.cur_attach].push( new_node );
    ctx.cur_node = new_node;
    ctx.cur_attach = "base";
    new_node.type = "sub";

    ctx.level.push("sub_" + ctx.sub_num);
    ctx.sub_num++;
    convert_ast(ctx, data.e, emit);
    ctx.level.pop();

    ctx.cur_node = prv_node;
    ctx.cur_attach = prv_attach;
  }

  else if (data.t == "ring_expr") {
    convert_ast(ctx, data.e, emit);
  }

  else if (data.t == "ring") {

    var prv_attach = ctx.cur_attach;
    var new_node = create_node();
    var prv_node = ctx.cur_node;
    ctx.cur_node[ctx.cur_attach].push( new_node );
    ctx.cur_node = new_node;
    ctx.cur_attach = "base";
    new_node.type = "ring";

    ctx.level.push("ring_" + ctx.ring_num);
    ctx.ring_num++;
    convert_ast(ctx, data.l, emit);
    ctx.level.pop();

    ctx.cur_node = prv_node;
    ctx.cur_attach = prv_attach;
  }
  else if (data.t == "ring_list") {

    var prv_attach = ctx.cur_attach;
    var new_node = create_node();
    var prv_node = ctx.cur_node;
    ctx.cur_node[ctx.cur_attach].push( new_node );
    ctx.cur_node = new_node;
    ctx.cur_attach = "base";
    new_node.type = "ring_ele";

    convert_ast(ctx, data.e, emit);

    ctx.cur_node = prv_node;
    ctx.cur_attach = prv_attach;

    convert_ast(ctx, data.l, emit);
  }
  else if (data.t == "ring_end") {
    var prv_attach = ctx.cur_attach;
    var new_node = create_node();
    var prv_node = ctx.cur_node;
    ctx.cur_node[ctx.cur_attach].push( new_node );
    ctx.cur_node = new_node;
    ctx.cur_attach = "base";
    new_node.type = "ring_ele";

    convert_ast(ctx, data.e, emit);

    ctx.cur_node = prv_node;
    ctx.cur_attach = prv_attach;
  }

  else if (data.t == "rnd_expr") {
    convert_ast(ctx, data.e, emit);
  }
  else if (data.t == "rnd") {
    ctx.level.push("rnd_" + ctx.rnd_num);
    ctx.rnd_num++;
    convert_ast(ctx, data.l, emit);
    ctx.level.pop();


  }
  else if (data.t == "rnd_list") {
    convert_ast(ctx, data.e, emit);
    convert_ast(ctx, data.l, emit);
  }
  else if (data.t == "rnd_end") {
    convert_ast(ctx, data.e, emit);
  }


  if ("a" in data) {
    for (var ii=0; ii<data.a.length; ii++) {
      convert_ast(ctx, data.a[ii], emit);
    }

  }


}

function cleanup(data) {
  var attach_list = {"type":1,"base":1, "nesting":1, "horn":1, "crown":1, "arm":1, "leg":1, "tail":1};
  var res = {};

  if (typeof data === "string") { return data; }
  for (var key in attach_list) {
    if (data[key].length==0) { continue; }
    if (!(key in res)) { res[key] = []; }
    if (key == "type") { res[key] = data[key]; continue; }
    for (var ii=0; ii<data[key].length; ii++) {
      res[key].push( cleanup(data[key][ii]) );
    }
  }
  return res;
}

// [ 'base', 0, 'nesting' 1
//
function ast_find(ast, id) {

  var cur_ast = ast;
  var cur_id = id;
  while (cur_id.length > 0) {
    var link_id = cur_id[0];
    var link_idx = cur_id[1];

    if (!(link_id in cur_ast)) { return ""; }

  }

}

function _flatten_r(data, a, lvl) {

  console.log(lvl, "flatten_r:", JSON.stringify(data), JSON.stringify(a));

  if (typeof data === "string") { a.push(data); return; }

  if ("base" in data) {
    for (var ii=0; ii<data.base.length; ii++) {

      console.log(lvl, "base...", ii, JSON.stringify(data.base[ii]), JSON.stringify(a));

      flatten_r(data.base[ii], a, lvl+1);
    }
    data.base = a;
  }

  var tdata = {};
  for (var key in data) {
    if (key == "base") { continue; }

    console.log(lvl, "...key", key);

    var sub_a = [];
    for (var ii=0; ii<data[key].length; ii++) {
      flatten_r(data[key][ii], sub_a, lvl+1);
    }

    console.log(lvl, "got for key", key, ":", JSON.stringify(sub_a));

    tdata[key] = sub_a;

  }

  for (var key in tdata) {
    if (key === "base") { continue; }
    data[key] = tdata[key];
    console.log(lvl, "data[", key, "]", JSON.stringify(data[key]));
  }

  console.log(lvl, "data", JSON.stringify(data));

}

/*
function flatten_r(data, a, lvl) {
  var key_count = 0;
  for (var key in data) { key_count++; }
  if ((key_count==1) && ("base" in data)) {
    var _a = [];
    for (var ii=0; ii<data.base.length; ii++) {
      _a.push( flatten_r(data.base[ii]) );
    }
    return _a;
  }
  else {
    for (var key in data) {

    }
  }
}
*/

function is_simple(data) {
  //if (typeof data === "string") { return true; }
  if (typeof data === "string") { return false; }
  if (!("base" in data)) { return false; }
  var key_count = 0;
  for (var key in data) {
    key_count++;
  }
  if (key_count==1) { return true; }
  return false;
}

function flatten_r(data, a, lvl) {

  console.log(lvl, "flatten_r:", JSON.stringify(data), JSON.stringify(a));

  if (typeof data === "string") { return data; return; }

  var tdata = {};
  if ("base" in data) {

    if (is_simple(data)) {

      console.log(lvl, "is_simple", JSON.stringify(data));

      var _res = [];
      for (var ii=0; ii<data.base.length; ii++) {
        if (is_simple(data.base[ii])) {
          for (jj=0; jj<data.base[ii].base.length; jj++) {
            _res.push(data.base[ii].base[jj]);
          }
        }
        else {
          _res.push(data.base[ii]);
        }
      }

      console.log(lvl, "res:", JSON.stringify(_res));
      tdata["base"] = _res;
    }
    else {

      var _a = [];
      for (var ii=0; ii<data.base.length; ii++) {

        console.log(lvl, "base...", ii, JSON.stringify(data.base[ii]), JSON.stringify(a));

        _a.push(flatten_r(data.base[ii], a, lvl+1));
      }
      tdata["base"] = _a;
      //data.base = _a;
    }
  }

  for (var key in data) {
    if (key == "base") { continue; }

    console.log(lvl, "...key", key);

    var sub_a = [];
    for (var ii=0; ii<data[key].length; ii++) {
      sub_a.push(flatten_r(data[key][ii], a, lvl+1));
    }

    console.log(lvl, "got for key", key, ":", JSON.stringify(sub_a));

    tdata[key] = sub_a;

  }

  return tdata;


}

function flatten(data) {

  var new_data = {};

  var a = [];
  var x = flatten_r(data, a, 0);
  var x = flatten_r(x, a, 0);
  var x = flatten_r(x, a, 0);

  console.log("GOT FLATTEN:\n", JSON.stringify(x, undefined, 2));
  //console.log(JSON.stringify(a,undefined,2));
  return;

  console.log(">>>", JSON.stringify(data));

  if (typeof data === "string") { return; }
  for (var key in data) {

    console.log(key);

    if (typeof data[key] === "string") { continue; }
    for (var ii=0; ii<data[key].length; ii++) {
      var a = [];

      console.log("???", key, a);
      flatten_r(data[key], a);

      new_data[key] = a;

      console.log("??>",  JSON.stringify(a) );

      //console.log(key, a);
    }
  }

  //for (var key in data) { flatten(data[key]); }
}


// *********************************************
// *********************************************
// *********************************************
// *********************************************


// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// https://stackoverflow.com/users/96100/tim-down
//
function _tohex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function _rgb2hex(r, g, b) {
  return "#" + _tohex(r) + _tohex(g) + _tohex(b);
}

// https://stackoverflow.com/a/596243 CC-BY-SA
// https://stackoverflow.com/users/61574/anonymous
//
function _brightness(r, g, b) {
  return ((r/255.0)*0.299) + (0.587*(g/255.0)) + (0.114*(b/255.0));
}

//  https://stackoverflow.com/a/17243070
// From user Paul S. (https://stackoverflow.com/users/1615483/paul-s)
//
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
 * 0 <= h,s,v, <=1
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
 *
 * 0 <= r,g,b <= 255
*/
function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) { g = r.g, b = r.b, r = r.r; }
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0 : d / max),
    v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return { h: h, s: s, v: v };
}

function HSVtoHSL(h, s, v) {
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  var _h = h,
    _s = s * v, _l = (2 - s) * v;
  _s /= (_l <= 1) ? _l : 2 - _l;
  _l /= 2;
  return { h: _h, s: _s, l: _l };
}

function HSLtoHSV(h, s, l) {
  if (arguments.length === 1) { s = h.s, l = h.l, h = h.h; }
  var _h = h, _s, _v; l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  _v = (l + s) / 2;
  _s = (2 * s) / (l + s);
  return { h: _h, s: _s, v: _v };
}

// ------------------
// ------------------
// ------------------

// Integer random number in range of n
//
function _irnd(n) {
  if (typeof n === "undefined") { n=2; }
  return Math.floor(Math.random()*n);
}

// _rnd()     : 0...1
// _rnd(a)    : 0...a
// -rnd(a,b)  : a...b
//
function _rnd(a,b) {
  a = ((typeof a === "undefined") ? 1.0 : a);
  if (typeof b === "undefined") {
    return Math.random()*a;
  }

  return (Math.random()*(b-a) + a);
}

// Choose random element from array
//
function _crnd(a) {
  if (typeof a === "undefined") { return undefined; }
  var idx = _irnd(a.length);

  var copy = undefined;
  if (typeof a[idx] === "object") {
    _copy = Object.assign({}, a[idx]);
  }
  else {
    _copy = a[idx];
  }

  //return a[idx];
  return _copy;
}

function _choose(a_orig, n) {
  if ((typeof n === "undefined") || (n<1)) { return []; }
  var a = [ ...a_orig ];

  if (n>=a.length) { return a; }

  var len = a.length;
  for (var ii=0; ii<n; ii++) {
    var p = _irnd(len-ii);
    var t = a[ii];
    a[ii] = a[p];
    a[p] = t;
  }

  return a.slice(0,n);
}

function _deg(x,y) { return Math.atan2(y,x)*180.0/Math.PI; }


// ------------------
// ------------------
// ------------------

function jsonsvg2svg_def(x) {
  var _type = x.type;

  var lines = [];
  if ((_type == "linearGradient") || (_type == "radialGradient")) {

    var _line = "<" + _type + " ";

    for (var _key in x) {
      if ((_key === "stops") ||
          (_key === "type")) {
        continue;
      }
      _line += " " + _key + "=\"" + x[_key] + "\"";
    }

    _line += ">";
    lines.push( _line );

    if ("stops" in x) {
      for (var ii=0; ii<x.stops.length; ii++) {
        var _stop_line = "<stop ";
        for (var _key in x.stops[ii]) {
          if (_key === "color" ) {
            _stop_line += " style=\"stop-color:" + x.stops[ii][_key] + ";stop-opacity:1.0;\"";
            continue;
          }
          _stop_line += " " + _key + "=\"" + x.stops[ii][_key] + "\"";
        }
        _stop_line += "/>";
        lines.push( _stop_line );
      }
    }

    lines.push("</" + _type + ">")
  }

  return lines;
}

function jsonsvg2svg_defs(defs, primary_color, secondary_color) {
  if (typeof defs === "undefined") { return ""; }

  var lines = [];
  for (var def_idx=0; def_idx<defs.length; def_idx++) {
    var x = defs[def_idx];
    var _type = x.type;

    if ((_type == "linearGradient") || (_type == "radialGradient")) {

      var _line = "<" + _type + " ";

      for (var _key in x) {
        if ((_key === "stops") ||
            (_key === "type")) {
          continue;
        }
        _line += " " + _key + "=\"" + x[_key] + "\"";
      }

      _line += ">";
      lines.push( _line );

      if ("stops" in x) {
        for (var ii=0; ii<x.stops.length; ii++) {
          var _stop_line = "<stop ";
          for (var _key in x.stops[ii]) {
            if (_key === "color" ) {
              var c = x.stops[ii][_key];

              if ((typeof primary_color !== "undefined") && (c == "#ffffff")) {
                c = primary_color;
              }
              else if ((typeof secondary_color !== "undefined") && (c == "#000000")) {
                c = secondary_color;
              }

              //_stop_line += " style=\"stop-color:" + x.stops[ii][_key] + ";stop-opacity:1.0;\"";
              _stop_line += " style=\"stop-color:" + c + ";stop-opacity:1.0;\"";

              continue;
            }
            _stop_line += " " + _key + "=\"" + x.stops[ii][_key] + "\"";
          }
          _stop_line += "/>";
          lines.push( _stop_line );
        }
      }

      lines.push("</" + _type + ">\n")
    }
  }

  return lines.join("\n");
}

function jsonsvg2svg(_x) {
  var headers = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<!-- Generator: Moho 13.5 build 20210422 -->',
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    '<svg version="1.1" id="Frame_0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720px" height="720px">'
  ];

  var footers = [ '</svg>' ];

  var lines = [];
  var _json = {};

  var x = _x.layers;

  for (var ii=0; ii<headers.length; ii++) {
    lines.push(headers[ii]);
  }

  if ("defs" in _x) {
    var _defs = _x.defs;
    for (var jj=0; jj<_defs.length; jj++) {
      var _d = jsonsvg2svg_def(_defs[jj]);
      for (var idx=0; idx<_d.length; idx++) {
        lines.push( _d[idx] );
      }
    }
  }


  var t = jsonsvg2svg_child(_x.layers);
  for (var ii=0; ii<t.length; ii++) {
    lines.push(t[ii]);
  }

  for (var ii=0; ii<footers.length; ii++) {
    lines.push(footers[ii]);
  }

  return lines;
}

function jsonsvg2svg_child(x, primary_color, secondary_color) {
  custom_prop = ((typeof custom_prop === "undefined") ? {} : custom_prop);
  var lines = [];

  var remap = {
    "fillRule": "fill-rule",
    "strokeWidth":"stroke-width",
    "strokeLinejoin":"stroke-linejoin",
    "strokeLinecap":"stroke-linecap",
    "vectorEffect":"vector-effect"
  };

  for (var ii=0; ii<x.length; ii++) {
    _json = x[ii];

    var tag = "";
    var _line = "";

    if ("tagName" in _json) {
      _line += "<" + _json["tagName"] + " ";
      tag = _json["tagName"];
    }

    if ("props" in _json) {
      for (var prop_key in _json.props) {

        var _val = _json.props[prop_key];
        if ((prop_key == "fill") || (prop_key == "stroke")) {

          if ((typeof primary_color !== "undefined") && (_val == "#ffffff")) {
            _val = primary_color;
          }
          else if ((typeof secondary_color !== "undefined") && (_val == "#000000")) {
            _val = secondary_color;
          }
        }

        var real_prop_key = prop_key;
        if (real_prop_key in remap) {
          real_prop_key = remap[prop_key];
        }

        // experiment
        if (real_prop_key == "stroke-width") { _val = 4; }

        _line += " " + real_prop_key + "=\"" + _val + "\"";

      }
    }

    if ((tag !== "path") && (tag.length>0)) { _line += ">\n"; }

    if ("children" in _json) {
      var _d = jsonsvg2svg_child(_json.children, primary_color, secondary_color);
      _line += _d.join("\n");
    }

    if ((tag !== "path") && (tag.length > 0)) {
      _line += "</" + tag + ">\n";
    }
    else if (tag === "path") {
      _line += "/>\n";
    }

    lines.push(_line);
  }

  return lines;
}

function _preprocess_svgjson(adata, primary_color, secondary_color) {
  var xdata = {};

  for (var idx=0; idx<adata.length; idx++) {
    var data = adata[idx];

    var svg_width = 720.0, svg_height = 720.0;

    var specs = data.specs;

    for (var _key in specs) {

      // the recursinve bounding box (image to nest under)
      //
      if (_key === "nesting") {
      }

      // otherwise there are keypoints to anchor to
      //
      else {
        for (var ii=0; ii<specs[_key].length; ii++) {

          // SVG has y inverted (from top of svg image, in this case 720px)
          //
          //specs[_key][ii].point.y = svg_height - specs[_key][ii].point.y;
          //specs[_key][ii].normal.y *= -1.0;
        }
      }
    }

    var _svg_inner = [];
    _svg_inner = jsonsvg2svg_child(data.layers, primary_color, secondary_color);

    adata[idx]["svg_header"] = ['<?xml version="1.0" encoding="utf-8"?>',
      '<!-- Generator: Moho 13.5 build 20210422 -->',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      '<svg version="1.1" id="Frame_0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720px" height="720px">'].join("\n");
    adata[idx]["svg_footer"] = "</svg>";
    adata[idx]["svg_inner"] = _svg_inner.join("\n");

  }

  xdata["data"] = adata;

  xdata["symbol"] = {};
  for (var ii=0; ii<adata.length; ii++) {
    xdata.symbol[ adata[ii].name ] = adata[ii];
  }

  return xdata;
}

//            crown
//      horn          horn
//         arm     arm
//           nesting 
//         leg     leg
//             tail
//
//            anchor
//
//
// looks like mystic symbolic uses a 'complexity' feature
// that allocates units to crown/horn/arm/leg/tail, with
// nesting always chosen, up to whatever depth.
//
// So for example, choosing 'hands_claddagh' at complexity
// 0 will only every choose a 'hands_claddagh' with a nested
// image.
// Choosing "complexity 1" ill choose a nesting image for the
// 'hands_claddagh' and then recur on one of crown, horn, arm,
// leg or tail.
// "complexity 2" will choose two from the list of (crown,
// horn, arm, leg, tail), etc.
//
// I'm not sure why setting "complexity 0" always chooses the
// 'hands_claddagh' as the main image with another nested inside...
// maybe this is an artifact of the weird size ratio of the 'hands_claddagh'?
// Choosing another image, like ''hand_fist' lets it be embedded
// in another image.
//
// ok, so it's the meta information...there are 'always_be_ntested'
// and 'always_nest' flags and this is probably why it's being
// giving the results we see.
//
// It looks like the creature generator doesn't really recur...
// It takes a base image, with nesting, then goes out to each of
// the attachments, using one symbol only, with an optional nesting
// within the attahced symbol.
// As far as I can tell, no attached symbols have themselves
// other attachments coming  off of their attachments.
//
// each symbol paths has a 'fill', 'stroke' and 'stroke-width'
// which can be changed as needed. 'fill-rule' can be kept
// as 'evenodd'?
// The svg for each has the fill and stroke broken out into
// json elements, so maybe we should consider only constructing
// the svg on the fly.
//
//
//
function mystic_symbolic_random(ctx, base, primary_color, secondary_color, bg_color) {
  if (typeof ctx === "undefined") { return ""; }
  primary_color = ((typeof primary_color === "undefined") ? "#ffffff" : primary_color);
  secondary_color = ((typeof secondary_color === "undefined") ? "#000000" : secondary_color);
  bg_color = ((typeof bg_color === "undefined") ? "#777777" : bg_color);

  base = ( (typeof base === "undefined") ? ctx.data[ _irnd(ctx.data.length) ] : base ) ;

  var use_bottom_nest_anchor_point = false;

  var _include_background_rect = ctx.create_background_rect;

  // can randomize this later if desired.
  //
  var invert_flag = false;

  var scale = ctx.scale;
  var complexity = ctx.complexity;

  var top_level = false;

  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth++;

  var ret_str = "";

  if (top_level) {

    if (ctx.create_svg_header) {
      ret_str += base.svg_header;
    }

    ret_str += "<g transform=\"translate(" + (ctx.svg_width/2).toString() + " " + (ctx.svg_height/2).toString() + ") " +
      " scale(" + scale.toString() + " " + scale.toString() + ") " +
      " translate(" + (-ctx.svg_width/2).toString() + " " + (-ctx.svg_height/2).toString() + ")\">\n";

    if (_include_background_rect) {
      var w = ctx.svg_width;
      var h = ctx.svg_height;
      _bg = bg_color;
      ret_str += "<rect x=\"-" + w.toString() + "\" y=\"-" + h.toString() + "\" ";
      ret_str += "width=\"" + (3*w).toString() + "\" height=\"" + (3*h).toString() + "\" fill=\"" + _bg + "\" data-is-background=\"true\">\n</rect>\n";
    }
    ret_str += jsonsvg2svg_defs(base.defs, primary_color, secondary_color);
  }

  var base_specs = base.specs;
  var base_meta = base.meta;
  var base_bbox = base.bbox;

  if (ctx.cur_depth <= ctx.max_depth) {

    // attach to logic
    //
    var candidate_attach_list = [];
    for (var spec_key in base_specs) {
      if ((spec_key === "anchor") || (spec_key === "nesting")) { continue; }
      candidate_attach_list.push(spec_key);
    }
    var attach_list = _choose(candidate_attach_list, complexity);

    for (var attach_list_idx=0; attach_list_idx < attach_list.length; attach_list_idx++) {
      var sub_idx = _irnd(ctx.data.length);
      var sub_name = ctx.data[sub_idx].name;

      var attach_id = attach_list[attach_list_idx];

      var reuse_svg = "";
      for (var aidx=0; aidx < base.specs[attach_id].length; aidx++) {

        var sub = Object.assign({}, ctx.symbol[sub_name]);

        var _invert = ( ((aidx%2)==0) ? false : true );
        var f = (_invert ? -1.0 : 1.0);

        var base_attach_point = [ base.specs[attach_id][aidx].point.x, base.specs[attach_id][aidx].point.y ];
        var base_attach_deg = _deg( base.specs[attach_id][aidx].normal.x, base.specs[attach_id][aidx].normal.y );

        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, f*sub.specs.anchor[0].normal.y );

        var deg = base_attach_deg - sub_anchor_deg;
        if (_invert) { deg *= -1; }

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + base_attach_point[0].toString() + " " + base_attach_point[1].toString() + ")";
        t_str_s += " scale(" + scale.toString() + " " + (f*scale).toString() + ")";
        t_str_s += " rotate(" + (deg).toString() + ")";
        t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        if (aidx == 0) {
          ret_str += jsonsvg2svg_defs(sub.defs, primary_color, secondary_color);
          //reuse_svg = jsonsvg2svg_child(sub.layers, primary_color, secondary_color);
          reuse_svg = mystic_symbolic_random(ctx, sub, primary_color, secondary_color);
        }

        //ret_str += jsonsvg2svg_defs(sub.defs);
        ret_str += t_str_s;

        // render svg from svgjson data
        //
        //ret_str += jsonsvg2svg_child(sub.layers);
        //ret_str += mystic_symbolic_random(ctx, sub);
        ret_str += reuse_svg;

        ret_str += t_str_e;

      }

    }

  }

  if (invert_flag) {
    var w = ctx.svg_width;
    var h = ctx.svg_height;

    ret_str += "<g transform=\"";
    ret_str += " translate(" + (w/2).toString() + " " + (h/2).toString() + ")";
    ret_str += " rotate(180)";
    ret_str += " scale(1 -1)";
    ret_str += " translate(" + (-w/2).toString() + " " + (-h/2).toString() + ")";
    ret_str += "\">";
  }

  ret_str += jsonsvg2svg_child(base.layers, primary_color, secondary_color);

  if (invert_flag) {
    ret_str += "</g>";
  }


  // nesting logic
  //
  if (("nesting" in base.specs) && (ctx.cur_depth <= ctx.max_nest_depth)) {

    var sub_idx = _irnd(ctx.data.length);
    var sub_name = ctx.data[sub_idx].name;

    for (var nest_idx=0; nest_idx<base.specs.nesting.length; nest_idx++) {

      var sub = Object.assign({}, ctx.data[sub_idx]);

      if (use_bottom_nest_anchor_point) {

        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1 );

        var nest_bbox = base.specs.nesting[nest_idx];
        var base_attach = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            (nest_bbox.y.max) ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_scale = min_dim / ctx.svg_width;

        // nest areas are always axis aligned, pointing up
        //
        var deg = nest_anchor_deg - sub_anchor_deg;

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + base_attach[0].toString() + " " + base_attach[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += " rotate(" + (deg).toString() + ")";
        t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";


        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );

        ret_str += t_str_s;
        ret_str += mystic_symbolic_random(ctx, sub, secondary_color, primary_color);
        ret_str += t_str_e;

      }
      else {


        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1 );

        var nest_bbox = base.specs.nesting[nest_idx];
        var nest_center = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            nest_bbox.y.min + ((nest_bbox.y.max - nest_bbox.y.min) / 2.0) ];

        //var nest_ul = [ nest_bbox.x.min , nest_bbox.y.min ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_ul = [ nest_center[0] - min_dim/2, nest_center[1] - min_dim/2 ];

        var nest_scale = min_dim / ctx.svg_width;

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + nest_ul[0].toString() + " " + nest_ul[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );
        ret_str += t_str_s;
        ret_str += mystic_symbolic_random(ctx, sub, secondary_color, primary_color);
        ret_str += t_str_e;
      }



    }
  }



  if (top_level) {
    ret_str += "</g>\n";

    if (ctx.create_svg_header) {
      ret_str += base.svg_footer;
    }
  }

  ctx.cur_depth-=1;
  return ret_str;
}

// -----
// -----
// -----
// -----

function parse_invert_name(sym) {
  var invert_flag = false;
  var symbol_name = sym;
  if (sym.length == 0) {
    return {"invert":false, "name":""}
  }
  if (sym[0] == '-') {
    invert_flag = true;
    symbol_name = sym.slice(1);
  }

  return { "invert": invert_flag, "name":symbol_name};
}

function mystic_symbolic_sched(ctx, sched, primary_color, secondary_color, bg_color) {
  if (typeof ctx === "undefined") { return ""; }
  primary_color = ((typeof primary_color === "undefined") ? "#ffffff" : primary_color);
  secondary_color = ((typeof secondary_color === "undefined") ? "#000000" : secondary_color);
  bg_color = ((typeof bg_color === "undefined") ? "#777777" : bg_color);

  var use_bottom_nest_anchor_point = false;

  if (typeof sched === "string") {
    sched = { "base": sched };
  }

  var symbol_info = parse_invert_name(sched.base);
  var invert_flag = symbol_info.invert;
  var symbol_name = symbol_info.name;

  if (!(symbol_name in ctx.symbol)) {
    return {"error":"could not find symbol" + actual_symbol};
  }
  var base = ctx.symbol[symbol_name];

  var _include_background_rect = ctx.create_background_rect;
  var scale = ctx.scale;
  var top_level = false;

  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth++;

  var ret_str = "";

  if (top_level) {

    if (ctx.create_svg_header) {
      ret_str += base.svg_header;
    }

    //ret_str += "<g transform=\"translate(360 360) scale(0.5 0.5) translate(-360 -360)\">\n";
    ret_str += "<g transform=\"translate(360 360) scale(" + scale.toString() + " " + scale.toString() + ") translate(-360 -360)\">\n";

    if (_include_background_rect) {
      var w = ctx.svg_width;
      var h = ctx.svg_height;
      _bg = bg_color;
      ret_str += "<rect x=\"-" + w.toString() + "\" y=\"-" + h.toString() + "\" ";
      ret_str += "width=\"" + (3*w).toString() + "\" height=\"" + (3*h).toString() + "\" fill=\"" + _bg + "\" data-is-background=\"true\">\n</rect>\n";
    }
    ret_str += jsonsvg2svg_defs(base.defs, primary_color, secondary_color);
  }

  var base_specs = base.specs;
  var base_meta = base.meta;
  var base_bbox = base.bbox;

  var attach_list = [];
  if ("attach" in sched) {
    for (var key in sched.attach) {
      attach_list.push(key);
    }
  }

  for (var attach_list_idx=0; attach_list_idx < attach_list.length; attach_list_idx++) {

    // if attach id is in our schedule...
    // find the sub component name
    //
    var attach_id = attach_list[attach_list_idx];
    var sched_mod_data = sched.attach[attach_id];

    // make sure we have it in our compnent and
    // skip the nesting, as that will be handled below
    //
    if (!(attach_id in base.specs)) { continue; }
    if (attach_id === "nesting") { continue; }

    var reuse_svg = "";
    for (var aidx=0; aidx < base.specs[attach_id].length; aidx++) {

      var sub_name = "";
      var m_aidx = aidx % sched_mod_data.length
      if (typeof sched_mod_data[m_aidx] === "string") {
        sub_name = sched_mod_data[m_aidx];
      }
      else {
        sub_name = sched_mod_data[m_aidx].base;
      }

      var sub_symbol_info = parse_invert_name(sub_name);
      var sub_invert_flag = sub_symbol_info.invert;
      var sub_symbol_name = sub_symbol_info.name;

      if (!(sub_symbol_name in ctx.symbol)) {
        return {"error":"could not find symbol" + sub_symbol_name};
      }

      var sub_sched = sched.attach[attach_id][m_aidx];

      //var sub = Object.assign({}, ctx.symbol[sub_name]);
      var sub = Object.assign({}, ctx.symbol[sub_symbol_name]);

      var _invert = ( ((aidx%2)==0) ? false : true );
      var f = (_invert ? -1.0 : 1.0);
      if (sub_invert_flag) {
        _invert = (_invert ? false : true);
        f *= -1.0;
      }

      var base_attach_point = [ base.specs[attach_id][aidx].point.x, base.specs[attach_id][aidx].point.y ];
      var base_attach_deg = _deg( base.specs[attach_id][aidx].normal.x, base.specs[attach_id][aidx].normal.y );

      var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
      var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, f*sub.specs.anchor[0].normal.y );

      var deg = base_attach_deg - sub_anchor_deg;
      if (_invert) { deg *= -1; }

      var t_str_s = "<g transform=\"";
      t_str_s += " translate(" + base_attach_point[0].toString() + " " + base_attach_point[1].toString() + ")";
      t_str_s += " scale(" + scale.toString() + " " + (f*scale).toString() + ")";
      t_str_s += " rotate(" + (deg).toString() + ")";
      t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
      t_str_s += "\">";

      var t_str_e = "</g>";

      ret_str += jsonsvg2svg_defs(sub.defs, primary_color, secondary_color);
      reuse_svg = mystic_symbolic_sched(ctx, sub_sched, primary_color, secondary_color);

      ret_str += t_str_s;
      ret_str += reuse_svg;
      ret_str += t_str_e;

    }

  }

  if (invert_flag) {
    var w = ctx.svg_width;
    var h = ctx.svg_height;

    ret_str += "<g transform=\"";
    ret_str += " translate(" + (w/2).toString() + " " + (h/2).toString() + ")";
    ret_str += " rotate(180)";
    ret_str += " scale(1 -1)";
    ret_str += " translate(" + (-w/2).toString() + " " + (-h/2).toString() + ")";
    ret_str += "\">";
  }

  ret_str += jsonsvg2svg_child(base.layers, primary_color, secondary_color);

  if (invert_flag) {
    ret_str += "</g>";
  }


  // nesting logic
  //
  if (("attach" in sched) && ("nesting" in sched.attach) && ("nesting" in base.specs)) {

    for (var nest_idx=0; nest_idx<base.specs.nesting.length; nest_idx++) {

      var sched_nest_n = sched.attach.nesting.length;

      var sub_sched = {};
      if (typeof sched.attach.nesting[nest_idx % sched_nest_n] === "string") {
        sub_sched = {"base":sched.attach.nesting[nest_idx % sched_nest_n]};
      }
      else {
        sub_sched = sched.attach.nesting[nest_idx % sched_nest_n];
      }
      var sub_name = sub_sched.base;

      var sub_symbol_info = parse_invert_name(sub_name);
      var sub_invert_flag = sub_symbol_info.invert;
      var sub_symbol_name = sub_symbol_info.name;

      if (!(sub_symbol_name in ctx.symbol)) {
        return {"error":"could not find symbol" + sub_symbol_name};
      }

      var sub = Object.assign({}, ctx.symbol[sub_symbol_name]);

      if (use_bottom_nest_anchor_point) {

        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1 );

        var nest_bbox = base.specs.nesting[nest_idx];
        var base_attach = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            (nest_bbox.y.max) ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_scale = min_dim / ctx.svg_width;

        // nest areas are always axis aligned, pointing up
        //
        var deg = nest_anchor_deg - sub_anchor_deg;

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + base_attach[0].toString() + " " + base_attach[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += " rotate(" + (deg).toString() + ")";
        t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );
        ret_str += t_str_s;
        ret_str += mystic_symbolic_sched(ctx, sub_sched, secondary_color, primary_color);
        ret_str += t_str_e;
      }
      else {

        var f = (sub_invert_flag ? -1.0 : 1.0);

        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1*f );

        var nest_bbox = base.specs.nesting[nest_idx];
        var nest_center = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            nest_bbox.y.min + ((nest_bbox.y.max - nest_bbox.y.min) / 2.0) ];


        //var nest_ul = [ nest_bbox.x.min , nest_bbox.y.min ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_ul = [ nest_center[0] - min_dim/2, nest_center[1] - min_dim/2 ];

        var nest_scale = min_dim / ctx.svg_width;

        var nest_deg = 0.0;
        if (sub_invert_flag) {
          nest_deg = 180;
          f = -1.0;
        }

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + nest_ul[0].toString() + " " + nest_ul[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += " translate(" + (720/2).toString() + " " + (720/2).toString() + ")";
        t_str_s += " rotate(" + (nest_deg).toString() + ")";
        t_str_s += " scale(1 " +  (f).toString() + ")";
        t_str_s += " translate(" + (-720/2).toString() + " " + (-720/2).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );
        ret_str += t_str_s;
        ret_str += mystic_symbolic_sched(ctx, sub_sched, secondary_color, primary_color);
        ret_str += t_str_e;
      }

    }
  }

  if (top_level) {
    ret_str += "</g>\n";

    if (ctx.create_svg_header) {
      ret_str += base.svg_footer;
    }
  }

  ctx.cur_depth-=1;
  return ret_str;
}

// -----
// -----
// -----
// -----

function get_base_string(sched, idx) {
  if (typeof sched === "string") {
    return sched;
  }
  if (!("base" in sched)) {
    return {"error":"no 'base' in sched:" + JSON.stringify(sched)};
  }
  return get_base_string(sched.base[idx%sched.base.length], idx);
}

function mystic_symbolic_sched2(ctx, sched, idx, primary_color, secondary_color, bg_color) {
  if (typeof ctx === "undefined") { return ""; }
  primary_color = ((typeof primary_color === "undefined") ? "#ffffff" : primary_color);
  secondary_color = ((typeof secondary_color === "undefined") ? "#000000" : secondary_color);
  bg_color = ((typeof bg_color === "undefined") ? "#777777" : bg_color);

  var use_bottom_nest_anchor_point = false;

  var symbol_name = sched;
  if (typeof symbol_name !== "string") {
    //sched = { "base": sched };

    if (!("base" in sched)) {
      return {"error":"could not find 'base' in sched:" + JSON.stringify(sched)};
    }

    symbol_name = get_base_string(sched.base[idx%sched.base.length], idx);
    if ((typeof symbol_name !== "string") && ("error" in symbol_name)) {
      return symbol_name;
    }

  }
  else {
    sched = { "base": sched };
  }
  //var base = ctx.symbol[sched.base];

  var _include_background_rect = true;
  var scale = ctx.scale;
  var top_level = false;

  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth++;

  var ret_str = "";

  if (top_level) {

    if (ctx.create_svg_header) {
      ret_str += base.svg_header;
    }

    ret_str += "<g transform=\"translate(360 360) scale(0.5 0.5) translate(-360 -360)\">\n";

    if (_include_background_rect) {
      var w = ctx.svg_width;
      var h = ctx.svg_height;
      _bg = bg_color;
      ret_str += "<rect x=\"-" + w.toString() + "\" y=\"-" + h.toString() + "\" ";
      ret_str += "width=\"" + (3*w).toString() + "\" height=\"" + (3*h).toString() + "\" fill=\"" + _bg + "\" data-is-background=\"true\">\n</rect>\n";
    }
    ret_str += jsonsvg2svg_defs(base.defs, primary_color, secondary_color);
  }

  var base_specs = base.specs;
  var base_meta = base.meta;
  var base_bbox = base.bbox;

  var attach_kind = ["nesting", "crown", "horn", "arm", "leg", "tail"];

  var attach_list = [];

  for (var ii=0; ii<attach_kind.length; ii++) {
    if (attach_kind[ii] in sched) {
      attach_list.push(attach_kind[ii]);
    }
  }

  for (var attach_list_idx=0; attach_list_idx < attach_list.length; attach_list_idx++) {

    // if attach id is in our schedule...
    // find the sub component name
    //
    var attach_id = attach_list[attach_list_idx];
    var sched_mod_data = sched[attach_id];

    // make sure we have it in our compnent and
    // skip the nesting, as that will be handled below
    //
    if (!(attach_id in base.specs)) { continue; }
    if (attach_id === "nesting") { continue; }

    var reuse_svg = "";
    for (var aidx=0; aidx < base.specs[attach_id].length; aidx++) {

      var sub_name = "";
      var m_aidx = aidx % sched_mod_data.length
      if (typeof sched_mod_data[m_aidx] === "string") {
        sub_name = sched_mod_data[m_aidx];
      }
      else {
        //sub_name = sched_mod_data[m_aidx].base;
        sub_name = get_base_string(sched_mod_data[aidx%sched_mod_data.length], aidx);
      }

      var sub_sched = sched.attach[attach_id][m_aidx];

      var sub = Object.assign({}, ctx.symbol[sub_name]);

      var _invert = ( ((aidx%2)==0) ? false : true );
      //var _invert = ( ((aidx%2)==0) ? true : false );
      var f = (_invert ? -1.0 : 1.0);

      var base_attach_point = [ base.specs[attach_id][aidx].point.x, base.specs[attach_id][aidx].point.y ];
      var base_attach_deg = _deg( base.specs[attach_id][aidx].normal.x, base.specs[attach_id][aidx].normal.y );

      var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
      var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, f*sub.specs.anchor[0].normal.y );

      var deg = base_attach_deg - sub_anchor_deg;
      if (_invert) { deg *= -1; }

      var t_str_s = "<g transform=\"";
      t_str_s += " translate(" + base_attach_point[0].toString() + " " + base_attach_point[1].toString() + ")";
      t_str_s += " scale(" + scale.toString() + " " + (f*scale).toString() + ")";
      t_str_s += " rotate(" + (deg).toString() + ")";
      t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
      t_str_s += "\">";

      var t_str_e = "</g>";

      ret_str += jsonsvg2svg_defs(sub.defs, primary_color, secondary_color);
      reuse_svg = mystic_symbolic_sched2(ctx, sub_sched, primary_color, secondary_color);

      ret_str += t_str_s;
      ret_str += reuse_svg;
      ret_str += t_str_e;

    }

  }

  ret_str += jsonsvg2svg_child(base.layers, primary_color, secondary_color);

  // nesting logic
  //
  if (("attach" in sched) && ("nesting" in sched.attach) && ("nesting" in base.specs)) {

    for (var nest_idx=0; nest_idx<base.specs.nesting.length; nest_idx++) {

      var sched_nest_n = sched.attach.nesting.length;

      var sub_sched = {};
      if (typeof sched.attach.nesting[nest_idx % sched_nest_n] === "string") {
        sub_sched = {"base":sched.attach.nesting[nest_idx % sched_nest_n]};
      }
      else {
        sub_sched = sched.attach.nesting[nest_idx % sched_nest_n];
      }
      var sub_name = sub_sched.base;
      var sub = Object.assign({}, ctx.symbol[sub_name]);

      if (use_bottom_nest_anchor_point) {

        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1 );

        var nest_bbox = base.specs.nesting[nest_idx];
        var base_attach = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            (nest_bbox.y.max) ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_scale = min_dim / ctx.svg_width;

        // nest areas are always axis aligned, pointing up
        //
        var deg = nest_anchor_deg - sub_anchor_deg;

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + base_attach[0].toString() + " " + base_attach[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += " rotate(" + (deg).toString() + ")";
        t_str_s += " translate(" + (-sub_anchor_point[0]).toString() + " " + (-sub_anchor_point[1]).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );
        ret_str += t_str_s;
        ret_str += mystic_symbolic_sched2(ctx, sub_sched, secondary_color, primary_color);
        ret_str += t_str_e;
      }
      else {


        var sub_anchor_point = [ sub.specs.anchor[0].point.x, sub.specs.anchor[0].point.y ];
        var sub_anchor_deg = _deg( sub.specs.anchor[0].normal.x, sub.specs.anchor[0].normal.y );

        var nest_anchor_deg = _deg( 0, -1 );

        var nest_bbox = base.specs.nesting[nest_idx];
        var nest_center = [ nest_bbox.x.min + ((nest_bbox.x.max - nest_bbox.x.min) / 2.0),
                            nest_bbox.y.min + ((nest_bbox.y.max - nest_bbox.y.min) / 2.0) ];

        var nest_ul = [ nest_bbox.x.min , nest_bbox.y.min ];

        var nest_dx = Math.abs(nest_bbox.x.max - nest_bbox.x.min);
        var nest_dy = Math.abs(nest_bbox.y.max - nest_bbox.y.min);
        var min_dim = ( (nest_dx < nest_dy) ? nest_dx : nest_dy );

        var nest_scale = min_dim / ctx.svg_width;

        var t_str_s = "<g transform=\"";
        t_str_s += " translate(" + nest_ul[0].toString() + " " + nest_ul[1].toString() + ")";
        t_str_s += " scale(" + (nest_scale).toString() + " " + (nest_scale).toString() + ")";
        t_str_s += "\">";

        var t_str_e = "</g>";

        ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );
        ret_str += t_str_s;
        ret_str += mystic_symbolic_sched2(ctx, sub_sched, secondary_color, primary_color);
        ret_str += t_str_e;
      }

    }
  }

  if (ctx.create_svg_header && top_level) {
    ret_str += "</g>\n";
    ret_str += base.svg_footer;
  }

  ctx.cur_depth-=1;
  return ret_str;
}

// pick a random hue and sat/val from a restricted range
// convert to xyz, force luminances the same
// convert back to rgb
//

function rand_color() {
  var res = {
    "primary" : { "hex":"#000000" },
    "secondary" : {"hex":"#ffffff" },
    "background": { "hex":"#777777" },
    "background2": { "hex":"#555555" }
  };


  var prim_hue = Math.random();
  //var prim_sat = _rnd(0.45, 0.60);
  var prim_sat = _rnd(0.25, 0.50);
  var prim_val = _rnd(0.75, 1.0);

  var seco_hue = prim_hue + 0.35;
  var seco_sat = 1.0 - prim_sat;
  var seco_val = _rnd(0.25, 0.6);
  if (seco_hue > 1.0) { seco_hue - 1.0; }

  var bg_hue = prim_hue - 0.33;
  var bg_sat = (Math.random()*.5);
  var bg_val = (Math.random()*0.5)+0.5;
  if (bg_hue < 0.0) { bg_hue += 1.0; }


  var prim_rgb = HSVtoRGB(prim_hue, prim_sat, prim_val);
  var seco_rgb = HSVtoRGB(seco_hue, seco_sat, seco_val);
  var bg_rgb = HSVtoRGB(bg_hue, bg_sat, bg_val);

  var del_sat = 0.125;
  var del_val = 0.125;

  var prim_brightness = _brightness(prim_rgb.r, prim_rgb.g, prim_rgb.b);
  var seco_brightness = _brightness(seco_rgb.r, seco_rgb.g, seco_rgb.b);
  var bg_brightness = _brightness(bg_rgb.r, bg_rgb.g, bg_rgb.b);

  //var seco_fac = (3.0/5.0);
  //var bg_fac = (2.0/5.0);

  var prim_xyz = color.rgb2xyz(prim_rgb.r, prim_rgb.g, prim_rgb.b);
  var seco_xyz = color.rgb2xyz(seco_rgb.r, seco_rgb.g, seco_rgb.b);
  var bg_xyz = color.rgb2xyz(bg_rgb.r, bg_rgb.g, bg_rgb.b);

  /*
  console.log("before:");
  console.log("  prim:", "h:", prim_hue, "s:", prim_sat, "v:", prim_val, "rgb:", prim_rgb, "xyz:", prim_xyz, "bright:", prim_brightness);
  console.log("  seco:", "h:", seco_hue, "s:", seco_sat, "v:", seco_val, "rgb:", seco_rgb, "xyz:", seco_xyz, "bright:", seco_brightness);
  console.log("  bg:", "h:", bg_hue, "s:", bg_sat, "v:", bg_val, "rgb:", bg_rgb, "xyz:", bg_xyz, "bright:", bg_brightness);
  */

  //testing
  var _rgb = {}, _xyz= {};

  _xyz = color.rgb2xyz(prim_rgb.r, prim_rgb.g, prim_rgb.b);
  prim_brightness = _xyz.y;
  //prim_brightness = _xyz.x;

  _xyz = color.rgb2xyz(seco_rgb.r, seco_rgb.g, seco_rgb.b);
  seco_brightness = _xyz.y;
  //seco_brightness = _xyz.x;

  _xyz = color.rgb2xyz(bg_rgb.r, bg_rgb.g, bg_rgb.b);
  bg_brightness = _xyz.y;
  //bg_brightness = _xyz.x;

  //ok
  var prim_fac = 1.0;
  var seco_fac = (3.0/2.0);
  var bg_fac = (2.0/4.0);

  /*
  prim_fac = (7.0/5.0);
  seco_fac = (4.0/4.0);
  bg_fac = (2.0/5.0);
  */


  //var root_brightness = seco_brightness;
  var root_brightness = prim_brightness;

  //prim_fac = 3.0/5.0;
  //seco_fac = 1.0;
  //bg_fac = (4.0/5.0);

  for (var _sat = 0.0; _sat <= 1.0; _sat += del_sat) {
    for (var _val = 0.0; _val <= 1.0; _val += del_val) {

      var _tc_prim = HSVtoRGB( prim_hue, _sat, _val );
      var _d_cur = Math.abs(_brightness(_tc_prim.r, _tc_prim.g, _tc_prim.b) - (prim_fac*root_brightness));
      var _d_prv = Math.abs(root_brightness - (prim_fac*prim_brightness));

      //_xyz = color.rgb2xyz(_tc_prim.r, _tc_prim.g, _tc_prim.b);
      //_d_cur = Math.abs(_xyz.y - (prim_fac*root_brightness));
      //_xyz = color.rgb2xyz(prim_rgb.r, prim_rgb.g, prim_rgb.b);
      //_d_prv = Math.abs(_xyz.y - (prim_fac*root_brightness));

      if ( _d_cur < _d_prv ) {

        _rgb = HSVtoRGB( prim_hue, _sat, _val );
        _xyz = color.rgb2xyz(_rgb.r, _rgb.g, _rgb.b);

        prim_brightness = _brightness(_tc_prim.r, _tc_prim.g, _tc_prim.b);
        prim_sat = _sat;
        prim_val = _val;

        prim_rgb = HSVtoRGB( prim_hue, prim_sat, prim_val );

      }

      var _tc_seco = HSVtoRGB( seco_hue, _sat, _val );
      _d_cur = Math.abs(_brightness(_tc_seco.r, _tc_seco.g, _tc_seco.b) - (seco_fac*root_brightness));
      _d_prv = Math.abs(seco_brightness - (seco_fac*root_brightness));

      //_xyz = color.rgb2xyz(_tc_seco.r, _tc_seco.g, _tc_seco.b);
      //_d_cur = Math.abs(_xyz.y - (seco_fac*root_brightness));
      //_xyz = color.rgb2xyz(seco_rgb.r, seco_rgb.g, seco_rgb.b);
      //_d_prv = Math.abs(_xyz.y - (seco_fac*root_brightness));

      if ( _d_cur < _d_prv ) {

        _rgb = HSVtoRGB( seco_hue, _sat, _val );
        _xyz = color.rgb2xyz(_rgb.r, _rgb.g, _rgb.b);

        seco_brightness = _brightness(_tc_seco.r, _tc_seco.g, _tc_seco.b);
        seco_sat = _sat;
        seco_val = _val;

        seco_rgb = HSVtoRGB( seco_hue, seco_sat, seco_val );

      }

      var _tc_bg = HSVtoRGB( bg_hue, _sat, _val );
      _d_cur = Math.abs(_brightness(_tc_bg.r, _tc_bg.g, _tc_bg.b) - (bg_fac*root_brightness));
      _d_prv = Math.abs(bg_brightness - (bg_fac*root_brightness));

      //_xyz = color.rgb2xyz(_tc_bg.r, _tc_bg.g, _tc_bg.b);
      //_d_cur = Math.abs(_xyz.y - (bg_fac*root_brightness));
      //_xyz = color.rgb2xyz(bg_rgb.r, bg_rgb.g, bg_rgb.b);
      //_d_prv = Math.abs(_xyz.y - (bg_fac*root_brightness));

      if ( _d_cur < _d_prv ) {

        _rgb = HSVtoRGB( bg_hue, _sat, _val );
        _xyz = color.rgb2xyz(_rgb.r, _rgb.g, _rgb.b);

        bg_brightness = _brightness(_tc_bg.r, _tc_bg.g, _tc_bg.b);
        bg_sat = _sat;
        bg_val = _val;

        bg_rgb = HSVtoRGB( bg_hue, bg_sat, bg_val );
      }

    }
  }

  seco_rgb = HSVtoRGB(seco_hue, seco_sat, seco_val);
  bg_rgb = HSVtoRGB(bg_hue, bg_sat, bg_val);

  //var bg_sat2 = _clamp(bg_sat - 0.25, 0.0, 1.0);
  //var bg_val2 = _clamp(bg_val - 0.1, 0.0, 1.0);
  //var bg_rgb2 = HSVtoRGB(bg_hue, bg_sat2, bg_val2);

  var bg_sat2 = _clamp(bg_sat + 0.25, 0.0, 1.0);
  var bg_val2 = _clamp(bg_val - 0.1, 0.0, 1.0);
  var bg_rgb2 = HSVtoRGB(bg_hue, bg_sat2, bg_val2);


  res.primary.hex = _rgb2hex(prim_rgb.r, prim_rgb.g, prim_rgb.b);
  res.secondary.hex = _rgb2hex(seco_rgb.r, seco_rgb.g, seco_rgb.b);
  res.background.hex = _rgb2hex(bg_rgb.r, bg_rgb.g, bg_rgb.b);
  res.background2.hex = _rgb2hex(bg_rgb2.r, bg_rgb2.g, bg_rgb2.b);

  return res;
}

// pick random hsv in a restricted range
//
function rand_color_hsv() {
  var res = {
    "primary" : { "hex":"#000000" },
    "secondary" : {"hex":"#ffffff" },
    "background": { "hex":"#777777" }
  };


  var prim_hue = Math.random();
  var prim_sat = _rnd(0.45, 0.60);
  var prim_val = _rnd(0.75, 1.0);

  var seco_hue = prim_hue + 0.35;
  var seco_sat = 1.0 - prim_sat;
  var seco_val = _rnd(0.25, 0.6);
  if (seco_hue > 1.0) { seco_hue -= 1.0; }

  var bg_hue = prim_hue - 0.35;
  var bg_sat = (Math.random()*.5);
  var bg_val = (Math.random()*0.5)+0.5;

  if (bg_hue < 0.0) { bg_hue += 1.0; }

  var prim_rgb = HSVtoRGB(prim_hue, prim_sat, prim_val);
  var seco_rgb = HSVtoRGB(seco_hue, seco_sat, seco_val);
  var bg_rgb = HSVtoRGB(bg_hue, bg_sat, bg_val);

  //var prim_xyz = 

  res.primary.hex = _rgb2hex(prim_rgb.r, prim_rgb.g, prim_rgb.b);
  res.secondary.hex = _rgb2hex(seco_rgb.r, seco_rgb.g, seco_rgb.b);
  res.background.hex = _rgb2hex(bg_rgb.r, bg_rgb.g, bg_rgb.b);

  return res;
}





function mystic_symbolic_dsl2sched_ring(_s, data) {
  if (typeof _s === "undefined") { return {}; }
  var s = _s.replace(/ /g, '');
  if ((s.length) == 0) { return {}; }

  var ret = { "tok":"", "obj":[], "del_idx":0, "state":"" };
  if (s[0] != '[') { return {}; }
  var cur_idx = 1;
  while (cur_idx < s.length) {
    var r = mystic_symbolic_dsl2sched(s.slice(cur_idx), data);
    if ("error" in r) { return r; }

    cur_idx += r.del_idx;

    if (r.tok.legth != 0) {
      ret.obj.push(r.tok);
    }
    else {
      ret.obj.push(r.obj);
    }

    if (r.state == "#list#end") { break; }
    if (r.state != "#list#sep") {
      return { "error":"ring error" };
    }

  }

  ret.del_idx = cur_idx;

  return ret;
}

function mystic_symbolic_dsl2sched_rnd(_s, data) {
  if (typeof _s === "undefined") { return {}; }
  var s = _s.replace(/ /g, '');
  if ((s.length) == 0) { return {}; }

  var state = "init";

  var ret = { "tok":"", "obj":[], "del_idx":0, "state":"" };
  if (s[0] != '{') { return {}; }
  var end_idx = s.search('}');
  if (end_idx < 0) {
    return { "error":"could not find end token '}'"};
  }

  var neg_lookup = {}, pos_lookup = {};

  var rlist = s.slice(1, end_idx).split(",");
  for (var ii=0; ii<rlist.length; ii++) {
    if (rlist[ii].length==0) { continue; }
    if (rlist[ii] == '*') {
      for (var symbol_name in data.symbol) {
        pos_lookup[symbol_name] = ii;
      }
    }
    else if (rlist[ii][0] == '-') {
      neg_lookup[rlist[ii].slice(1)] = ii;
    }
    else {
      pos_lookup[rlist[ii]] = ii;
    }
  }

  var choice_a = [];
  for (var key in pos_lookup) {
    if (key in neg_lookup) { continue; }
    choice_a.push(key);
  }

  ret.tok = _crnd(choice_a);
  ret.del_idx = end_idx;

  return ret;
}

function mystic_symbolic_dsl2sched(_s, data) {
  if (typeof _s === "undefined") { return {}; }

  var s = _s.replace(/ /g, '');

  var sched = { "base": "" };
  var base_str = "";
  var cur_tok = "";

  var state = "base";

  var tok_kw = {
    "@" : "nesting",
    "^" : "crown",
    "!" : "horn",
    "~" : "arm",
    "|" : "leg",
    "." : "tail",
    ":" : "#list#null",
    "," : "#list#sep",
    "[" : "#list#beg",
    "]" : "#list#end",
    "{" : "#rnd#beg",
    "}" : "#rnd#end",
    "(" : "#sub#beg",
    ")" : "#sub#end"
  };

  var tok_kw_skip = {
    ":" : "#list#null",
    "," : "#list#sep",
    "[" : "#list#beg",
    "{" : "#rnd#beg",
    //"]" : "#list#end",
    "(" : "#sub#beg"
    //")" : "#sub#end"
  }

  var state_skip = {
    "#list#null" : 1,
    "#list#sep" : 1,
    "#list#beg" : 1,
    //"#list#end" : 1,
    "#sub#beg" : 1
    //"#sub#end" : 1
  }

  var cur_idx = 0;
  var cur_obj = {};
  var cur_val_type = "";
  var cur_tok = "";
  while (cur_idx < s.length) {

    if (s[cur_idx] in tok_kw) {

      // we're changing state, so take our current token
      // and add it the appropriate current state structure
      // element.
      //
      var new_state = tok_kw[s[cur_idx]];

      // proces previous state
      //
      if (state == "base") {
        sched["base"] = cur_tok;
      }
      else if (!(s[cur_idx] in tok_kw_skip)) {

        if (!("attach" in sched)) { sched["attach"] = {}; }
        if (!(state in sched.attach)) {
          sched.attach[state] = [];
        }

        if (cur_val_type == "string") {
          sched.attach[state].push(cur_tok);
        }
        else if (cur_val_type == "object") {

          sched.attach[state].push(cur_obj);
        }
        else if (cur_val_type == "array") {
          sched.attach[state].push(...cur_obj);
        }
        else {
          return { "error":"unknown val type '" + cur_val_type + "' (" + s + ")" };
        }
      }
      else { }

      if (new_state == "#list#beg") {
        var ret = mystic_symbolic_dsl2sched_ring(s.slice(cur_idx), data);
        if ("error" in ret) { return ret; }

        cur_obj = ret.obj;
        cur_idx += ret.del_idx;
        cur_val_type = "array";

        continue;
      }
      else if ((new_state == "#list#sep") || (new_state == "#list#end")) {
        return { "obj": sched, "tok": cur_tok, "del_idx": (cur_idx+1), "state":new_state };
      }

      else if (new_state == "#rnd#beg") {
        var ret = mystic_symbolic_dsl2sched_rnd(s.slice(cur_idx), data);
        if ("error" in ret) { return ret; }

        cur_tok = ret.tok;
        cur_obj = ret.obj;
        cur_idx += ret.del_idx;
        cur_val_type = "string";

        new_state = tok_kw[s[cur_idx]];
        if (new_state != "#rnd#end") {
          return { "error" : "expected '#rnd#end' token '}', got" + s[cur_idx] };
        }

        /*
        if (state != "base") {

          if (!("attach" in sched)) { sched.attach = {}; }
          if (!(state in sched.attach)) { sched.attach[state] = []; }

          if (cur_val_type == "string")       { sched.attach[state].push(cur_tok); }
          else if (cur_val_type == "object")  { sched.attach[state].push(cur_obj); }
          else if (cur_val_type == "array")   { sched.attach[state].push(...cur_obj); }
          else {
            return { "error":"unknown val type '" + cur_val_type + "' (" + s + ")" };
          }
        }
        else {
          if (cur_val_type == "string")       { sched.base = (cur_tok); }
          else if (cur_val_type == "object")  { sched.base = (cur_obj); }
          else if (cur_val_type == "array")   { sched.base = (cur_obj); }
          else {
            return { "error":"unknown val type '" + cur_val_type + "' (" + s + ")" };
          }
        }
        */

        cur_idx++;

        continue;
      }

      else if (new_state == "#sub#beg") {

        cur_idx++;
        var ret = mystic_symbolic_dsl2sched(s.slice(cur_idx), data);
        if ("error" in ret) { return ret; }

        cur_tok = ret.tok;
        cur_obj = ret.obj;
        cur_idx += ret.del_idx;
        cur_val_type = "object";

        continue;
      }
      else if (new_state == "#sub#end") {
        return { "obj": sched, "tok": cur_tok, "del_idx": (cur_idx+1), "state":new_state, "val_type":cur_val_type };
      }

      else {
        state = new_state;
      }

      cur_tok = "";
      cur_obj = {};
      state = new_state;

      cur_idx++;

    }
    else if ( (("a".charCodeAt(0) <= s.charCodeAt(cur_idx)) &&
               (s.charCodeAt(cur_idx) <= "z".charCodeAt(0))) ||
              (("A".charCodeAt(0) <= s.charCodeAt(cur_idx)) &&
               (s.charCodeAt(cur_idx) <= "Z".charCodeAt(0))) ||
              (("0".charCodeAt(0) <= s.charCodeAt(cur_idx)) &&
               (s.charCodeAt(cur_idx) <= "9".charCodeAt(0))) ||
              (s.charCodeAt(cur_idx) == "_".charCodeAt(0) ||
              (s.charCodeAt(cur_idx) == "-".charCodeAt(0))) ) {
      cur_tok += s[cur_idx];
      cur_val_type = "string";
      cur_idx++;
    }
    else {
      return {"error" : "invalid character (" + s[cur_idx] + ") at " + cur_idx.toString() + " (" + s +")" };
    }

  }

  // proces previous state
  //
  if (state == "base") {

    if (cur_val_type == "string") {
      sched["base"] = cur_tok;
    }
    else if (cur_val_type == "array") {
      sched["base"] = cur_obj;
    }
  }
  else {
    if (!("attach" in sched)) { sched["attach"] = {}; }
    if (!(state in sched.attach)) {
      sched.attach[state] = [];
    }

    if (cur_val_type == "string") {
      sched.attach[state].push(cur_tok);
    }
    else if (cur_val_type == "array") {
      sched.attach[state].push(...cur_obj);
    }
    else if (cur_val_type == "object") {
      sched.attach[state].push(cur_obj);
    }
    else {
      return { "error":"unknown val type '" + cur_val_type + "' (" + s + ")" };
    }
  }

  return sched;
}

// simple sentences...loose a lot of complexity and nuance
//
function sched2sentence(sched, is_root) {
  is_root = ((typeof is_root === "undefined") ? true : is_root);

  var sentence = (sched.base.match(/^[aeiouAEIOU]/) ? "an " : "a ");
  sentence += sched.base;

  var attach_order = ["nesting", "crown", "horn", "arm", "leg", "tail"];
  var count=0;

  var attach_count=0;
  for (var akey in sched.attach) { attach_count++; }

  for (var ii=0; ii<attach_order.length; ii++) {
    var attach_id = attach_order[ii];
    if (!(attach_id in sched.attach)) { continue; }

    if (count>0) {
      if (count == (attach_count-1)) { sentence += " and"; }
      else { sentence += ","; }
    }
    else {
      sentence += " with"
    }

    if (typeof sched.attach[attach_id][0] === "string") {
      var ele = sched.attach[attach_id][0]; 

      sentence += (ele.match(/^[aeiouAEIOU]/) ? " an" : " a");
      sentence += " " + ele;
      if (attach_id=="nesting") {
        sentence += " inside of it";
      }
      else {
        sentence += " for";
        //sentence += (attach_id.match(/^[aeiouAEIOU]/) ? " an" : " a");
        sentence += " its";
        sentence += " " + attach_id;
      }
    }
    else {
      //sentence += " that has " + (attach_id.match(/^[aeiouAEIOU]/) ? "an " : "a ") + attach_id + " with ";
      sentence += " that has " + attach_id + "s with ";
      sentence += sched2sentence(sched.attach[attach_id][0], is_root);
    }
    count++;
  }

  return sentence;
}

var tarot = {
  "major": ["fool", "magician", "priestess", "empress", "emperor", "hierophant",
            // lovers                                                           justice
            "woman_stand man_stand", "chariot", "strength", "hermit", "wheel", "?",
            // hanged man  temperance
            "?", "death", "?", "devil", "tower", "starburst", "moon", "sun",
            // judgement
            "?", "globe" ],
            // wands
  "minor" : [ "?", "pentacle", "cup", "sword" ]
};

//---------------------------
//                   _       
//   _ __ ___   __ _(_)_ __  
//  | '_ ` _ \ / _` | | '_ \ 
//  | | | | | | (_| | | | | |
//  |_| |_| |_|\__,_|_|_| |_|
//                           
//---------------------------


var bg_ctx = _preprocess_svgjson(bg_data, bg_color, bg_color);
bg_ctx["create_svg_header"] = false;
bg_ctx["create_background_rect"] = false;
bg_ctx["cur_depth"] = 0;
bg_ctx["max_depth"] = 1;
bg_ctx["max_nest_depth"] = 0;
bg_ctx["scale"] = sibyl_opt.background_scale;
bg_ctx["complexity"] = 1;

bg_ctx["svg_width"] = 720.0;
bg_ctx["svg_height"] = 720.0;


var g_data = _preprocess_svgjson(adata, primary_color, secondary_color, bg_color);
g_data["create_svg_header"] = true;
g_data["create_background_rect"] = true;
g_data["cur_depth"] = 0;
g_data["max_depth"] = sibyl_opt.max_attach_depth;
g_data["max_nest_depth"] = sibyl_opt.max_nest_depth;
g_data["scale"] = sibyl_opt.scale;
g_data["complexity"] = 4;

g_data["svg_width"] = 720.0;
g_data["svg_height"] = 720.0;

var base_symbol = g_data.symbol["eye_up"];

var sched = {
  "base" : "globe",
  "attach" : {
    "nest" : "eye_up",
    "crown" : "circle",
    "arm" : "cube_die",
    "leg" : "cloud",
    "tail" : "rabbit"
  }
};


var repri=
"           " +
"  !^!      " +
" ~(@)~ []  " +
"   .       " +
"  | |      " ;


if (arg_str == "random") {

  var bg_svg = "";
  if (sibyl_opt.use_background_image) {

    g_data.create_svg_header = false;
    g_data.create_background_rect = false;
    bg_ctx.create_svg_header = false;

    if (sibyl_opt.tile_background) {

      bg_ctx.create_background_rect = false;

      var bg_sched  = mystic_symbolic_dsl2sched( sibyl_opt.background_image, bg_ctx );
      var bg_svg_single = mystic_symbolic_sched(bg_ctx, bg_sched , bg_color, bg_color2, bg_color);

      var _n = Math.floor(2.0 / sibyl_opt.background_scale);

      var _w2 = bg_ctx.svg_width/2.0;
      var _h2 = bg_ctx.svg_height/2.0;

      var _bg_scale = sibyl_opt.background_scale;

      var dx = _bg_scale*bg_ctx.svg_width;
      var dy = _bg_scale*bg_ctx.svg_height;

      var offset_x = sibyl_opt.tile_background_dx;
      var offset_y = sibyl_opt.tile_background_dy;

      for (var x_idx=0; x_idx <= _n; x_idx++) {
        for (var y_idx=0; y_idx <= _n; y_idx++) {

          var _x = Math.floor( x_idx - (_n/2) )*dx + offset_x;
          var _y = Math.floor( y_idx - (_n/2) )*dy + offset_y;

          if ((y_idx%2)==1) { _x += dx/2; }

          bg_svg += "<g transform=\"";
          bg_svg += " translate(" + (-_x).toString() + " " + (-_y).toString() + ")";
          bg_svg += "\">";

          bg_svg += bg_svg_single;

          bg_svg += "</g>";

        }
      }

    }
    else {
      var bg_sched  = mystic_symbolic_dsl2sched( sibyl_opt.background_image, bg_ctx );
      bg_svg = mystic_symbolic_sched(bg_ctx, bg_sched , bg_color, bg_color2, bg_color);
    }

  }

  var creature_svg = mystic_symbolic_random(g_data, undefined, primary_color, secondary_color, bg_color);

  if (sibyl_opt.use_background_image) {
    console.log(svg_header);
    console.log(bg_svg);
  }

  console.log( creature_svg );

  if (sibyl_opt.use_background_image) {
    console.log(svg_footer);
  }


}

else {

  /*
  var raw_sched = {};
  try {
    raw_sched = parser.parse(arg_str);
  }
  catch (e) {
    console.log("got PEG error:", e);
    process.exit();
  }

  console.log("raw_sched:\n------------------------------\n", JSON.stringify(raw_sched, undefined, 2), "\n-----------------------------\n");

  var ctx = { "data":{},"level": [],  "ring_num":0, "rnd_num":0, "sub_num":0};
  ctx["orig_data"] = raw_sched;
  ctx.data = create_node();
  ctx["cur_node"]  = ctx.data;
  ctx["cur_attach"] = "base";
  convert_ast(ctx, raw_sched, function() {} );

  var c_sched = cleanup(ctx.data);

  console.log("cleaned sched:\n", JSON.stringify(c_sched, undefined, 2), "\n====================\n");
  */

  /*
  var sched  = flatten(c_sched);
  console.log( JSON.stringify(sched, undefined, 2) );
  */

  var bg_svg = "";
  if (sibyl_opt.use_background_image) {

    g_data.create_svg_header = false;
    g_data.create_background_rect = false;
    bg_ctx.create_svg_header = false;

    if (sibyl_opt.tile_background) {

      bg_ctx.create_background_rect = false;

      var bg_sched  = mystic_symbolic_dsl2sched( sibyl_opt.background_image, bg_ctx );
      var bg_svg_single = mystic_symbolic_sched(bg_ctx, bg_sched , bg_color, bg_color2, bg_color);

      var _n = Math.floor(2.0 / sibyl_opt.background_scale);

      var _w2 = bg_ctx.svg_width/2.0;
      var _h2 = bg_ctx.svg_height/2.0;

      var _bg_scale = sibyl_opt.background_scale;

      var dx = _bg_scale*bg_ctx.svg_width;
      var dy = _bg_scale*bg_ctx.svg_height;

      var offset_x = sibyl_opt.tile_background_dx;
      var offset_y = sibyl_opt.tile_background_dy;

      for (var x_idx=0; x_idx <= _n; x_idx++) {
        for (var y_idx=0; y_idx <= _n; y_idx++) {

          var _x = Math.floor( x_idx - (_n/2) )*dx + offset_x;
          var _y = Math.floor( y_idx - (_n/2) )*dy + offset_y;

          if ((y_idx%2)==1) { _x += dx/2; }

          bg_svg += "<g transform=\"";
          bg_svg += " translate(" + (-_x).toString() + " " + (-_y).toString() + ")";
          bg_svg += "\">";

          bg_svg += bg_svg_single;

          bg_svg += "</g>";

        }
      }

    }
    else {
      bg_ctx.create_background_rect = true;

      var bg_sched  = mystic_symbolic_dsl2sched( sibyl_opt.background_image, bg_ctx );
      bg_svg = mystic_symbolic_sched(bg_ctx, bg_sched , bg_color, bg_color2, bg_color);
    }
  }


  var sched  = mystic_symbolic_dsl2sched( arg_str, g_data );
  var creature_svg = mystic_symbolic_sched(g_data, sched , primary_color, secondary_color, bg_color);

  if (sibyl_opt.use_background_image) {
    console.log(svg_header);
    console.log(bg_svg);
  }

  console.log( creature_svg );

  if (sibyl_opt.use_background_image) {
    console.log(svg_footer);
  }

  //var sentence = sched2sentence(sched);
  //console.log("<!--", sentence, " -->");
}

console.log("<!-- ", primary_color, secondary_color, bg_color, bg_color2, "-->");

