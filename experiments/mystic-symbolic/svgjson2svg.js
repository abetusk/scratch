var fs = require("fs");

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

  var _copy = Object.assign({}, a[idx]);

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


var arg_str = "";
var fn = "";
if (process.argv.length >= 3) {
  fn = process.argv[2];

  if (process.argv.length >= 4) {
    arg_str = process.argv[3];
  }
}

if (fn.length == 0) {
  console.log("provide json");
  process.exit(1);
}

var adata = JSON.parse(fs.readFileSync(fn));

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

    //var _l = jsonsvg2svg(data);
    //var _svg = _l.join("\n");

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
  base = ( (typeof base === "undefined") ? ctx.data[ _irnd(ctx.data.length) ] : base ) ;

  bg_color = ((typeof bg_color === "undefined") ? "#000000" : bg_color);

  var _include_background_rect = true;

  var scale = ctx.scale;
  var complexity = ctx.complexity;

  var top_level = false;

  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth++;

  var ret_str = "";

  if (top_level) {
    ret_str += base.svg_header;

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

  // nesting logic
  //
  ret_str += base.svg_inner;
  if (("nesting" in base.specs) && (ctx.cur_depth <= ctx.max_nest_depth)) {

    var sub_idx = _irnd(ctx.data.length);
    var sub_name = ctx.data[sub_idx].name;

    for (var nest_idx=0; nest_idx<base.specs.nesting.length; nest_idx++) {

      var sub = Object.assign({}, ctx.data[sub_idx]);

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


      //console.log(sub.defs);
      //ret_str += jsonsvg2svg_defs(sub.defs, primary_color, secondary_color);
      ret_str += jsonsvg2svg_defs(sub.defs, secondary_color, primary_color );

      ret_str += t_str_s;
      //ret_str += jsonsvg2svg_child(sub.layers, primary_color, secondary_color);
      //ret_str += jsonsvg2svg_child(sub.layers, secondary_color, primary_color);
      ret_str += mystic_symbolic_random(ctx, sub, secondary_color, primary_color);
      ret_str += t_str_e;

    }
  }



  if (top_level) {
    ret_str += "</g>\n";

    ret_str += base.svg_footer;
  }

  ctx.cur_depth-=1;
  return ret_str;
}

// -----
// -----
// -----
// -----

function mystic_symbolic_sched(ctx, sched, primary_color, secondary_color, bg_color) {
  if (typeof ctx === "undefined") { return ""; }

  if (typeof sched === "string") {
    sched = { "base": sched };
  }
  var base = ctx.symbol[sched.base];

  bg_color = ((typeof bg_color === "undefined") ? "#000000" : bg_color);

  var _include_background_rect = true;

  var scale = ctx.scale;

  var top_level = false;

  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth++;

  var ret_str = "";

  if (top_level) {

    ret_str += base.svg_header;

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

      var sub_sched = sched.attach[attach_id][m_aidx];

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

      ret_str += jsonsvg2svg_defs(sub.defs, primary_color, secondary_color);
      reuse_svg = mystic_symbolic_sched(ctx, sub_sched, primary_color, secondary_color);

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
  }

  if (top_level) {
    ret_str += "</g>\n";
    ret_str += base.svg_footer;
  }

  ctx.cur_depth-=1;
  return ret_str;
}


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

var primary_color = _rgb2hex(prim_rgb.r, prim_rgb.g, prim_rgb.b);
var secondary_color = _rgb2hex(seco_rgb.r, seco_rgb.g, seco_rgb.b);
var bg_color = _rgb2hex(bg_rgb.r, bg_rgb.g, bg_rgb.b);

var g_data = _preprocess_svgjson(adata, primary_color, secondary_color, bg_color);
g_data["cur_depth"] = 0;
g_data["max_depth"] = 1;
g_data["max_nest_depth"] = 1;
g_data["scale"] = 0.5;
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

var ts = "globe(eye_up).crown(circle).arm(cube_die).leg(cloud).tail(rabbit)";

//var ts = "globe @ eye_up ^ circle ~ cube_die | cloud . rabbit"
var ts = "globe @ (eye_up @ angel ) ^ circle ~ cube_die | cloud . rabbit"
//var ts = "globe @ eye_up ^ [circle,circle_spiral] ~ cube_die | cloud . rabbit"
//var ts = "globe @ eye_up ^ [circle,circle_spiral,:] ~ cube_die | cloud . rabbit"

ts = "globe @ ( eye_up @ angel ) ";


var repri=
"   ^   " +
" ~( )~ " +
"   .   " +
"  | |  " ;



function mystic_symbolic_dsl2sched_ring(_s) {
  if (typeof _s === "undefined") { return {}; }
  var s = _s.replace(/ /g, '');
  if ((s.length) == 0) { return {}; }

  //console.log("ring::", _s);

  var ret = { "tok":"", "obj":[], "del_idx":0, "state":"" };

  if (s[0] != '[') { return {}; }


  var cur_idx = 1;
  while (cur_idx < s.length) {
    var r = mystic_symbolic_dsl2sched(s.slice(cur_idx));
    if ("error" in r) { return r; }

    cur_idx += r.del_idx;

    if (r.tok.legth != 0) {
      //console.log("ring>> push tok", r.tok);
      ret.obj.push(r.tok);
    }
    else {
      //console.log("ring>> push obj", r.obj);
      ret.obj.push(r.obj);
    }

    //console.log("???", ret.obj);

    if (r.state == "#list#end") { break; }
    if (r.state != "#list#sep") {
      //console.log("ring>>>", JSON.stringify(r));
      return { "error":"ring error" };
    }

  }

  ret.del_idx = cur_idx;

  //console.log("ring#ret::", JSON.stringify(ret));

  return ret;
}

function mystic_symbolic_dsl2sched(_s) {
  if (typeof _s === "undefined") { return {}; }

  var s = _s.replace(/ /g, '');

  //console.log("sched>>", s);

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
    "(" : "#sub#beg",
    ")" : "#sub#end"
  };

  var tok_kw_skip = {
    ":" : "#list#null",
    "," : "#list#sep",
    "[" : "#list#beg",
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

    //console.log("[", cur_idx, "]", s[cur_idx]);

    if (s[cur_idx] in tok_kw) {
      //console.log(cur_idx, "'" + cur_tok +"'", "(", state, ")");

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

        //console.log("....state:", state);

        if (!("attach" in sched)) { sched["attach"] = {}; }
        if (!(state in sched.attach)) {
          sched.attach[state] = [];
        }

        if (cur_val_type == "string") {

        //if (cur_tok.length > 0) {
          //sched.attach[state].push({"base":cur_tok});
          sched.attach[state].push(cur_tok);
        }
        else if (cur_val_type == "object") {

          //console.log("sched>> adding", JSON.stringify(cur_obj), "to state, ", state);

          sched.attach[state].push(cur_obj);
        }
        else if (cur_val_type == "array") {
          sched.attach[state].push(...cur_obj);
        }
        else {
          return { "error":"unknown val type '" + cur_val_type + "' (" + s + ")" };
        }
      }
      else {
        //console.log("...skipped...");
      }

      //console.log("??", cur_idx);

      if (new_state == "#list#beg") {


        var ret = mystic_symbolic_dsl2sched_ring(s.slice(cur_idx));
        if ("error" in ret) { return ret; }

        //console.log("listbeg finished", JSON.stringify(ret));

        cur_obj = ret.obj;
        cur_idx += ret.del_idx;
        cur_val_type = "array";
        continue;
      }
      else if ((new_state == "#list#sep") || (new_state == "#list#end")) {
        return { "obj": sched, "tok": cur_tok, "del_idx": (cur_idx+1), "state":new_state };
      }

      else if (new_state == "#sub#beg") {

        //console.log("subbeg beg");

        cur_idx++;
        var ret = mystic_symbolic_dsl2sched(s.slice(cur_idx));
        if ("error" in ret) { return ret; }


        cur_tok = ret.tok;
        cur_obj = ret.obj;
        cur_idx += ret.del_idx;
        cur_val_type = "object";

        //console.log("#sub#beg finished", "state:", state, "new_state", new_state, "cur_idx:", cur_idx, "now s[]:", s[cur_idx], JSON.stringify(ret));

        continue;
      }
      else if (new_state == "#sub#end") {
        return { "obj": sched, "tok": cur_tok, "del_idx": (cur_idx+1), "state":new_state, "val_type":cur_val_type };
      }

      else {
        state = new_state;
        //return { "error": "unexpected state:" + new_state + " at index " + i.toString() + " ('..." + s.slice(i-10,i+10) + "...')"  };

        //console.log("new state ", new_state);
      }

      //console.log("cp", cur_idx);

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
              (s.charCodeAt(cur_idx) == "_".charCodeAt(0)) ) {
      cur_tok += s[cur_idx];
      cur_val_type = "string";
      cur_idx++;
    }
    else {
      //return {"error" : "invalide character at " + i.toString() + " (" + s.slice(i-10,i+10) +")" };
      return {"error" : "invalide character (" + s[cur_idx] + ") at " + cur_idx.toString() + " (" + s +")" };
    }

  }

  //console.log("fuuuuu", cur_tok, cur_obj, cur_val_type);

  // proces previous state
  //
  if (state == "base") {
    sched["base"] = cur_tok;
  }
  else {
  //else if (!(s[cur_idx] in tok_kw_skip)) {
    if (!("attach" in sched)) { sched["attach"] = {}; }
    if (!(state in sched.attach)) {
      sched.attach[state] = [];
    }

    if (cur_val_type == "string") {
      sched.attach[state].push(cur_tok);
    }
    else if (cur_val_type == "array") {

      //console.log("sched>> adding", JSON.stringify(cur_obj), "to state, ", state);

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

//var r = mystic_symbolic_dsl2sched(ts );
var sched  = mystic_symbolic_dsl2sched( arg_str );
//console.log(JSON.stringify(sched, undefined, 2));

//console.log( mystic_symbolic_random(g_data, base_symbol, primary_color, secondary_color, bg_color) );
console.log( mystic_symbolic_sched(g_data, sched , primary_color, secondary_color, bg_color) );
process.exit();

console.log("<!-- primary(", prim_hue, prim_sat, prim_val,"), secondary(", seco_hue, seco_sat, seco_val, ") bg(", bg_hue, bg_sat, bg_val, ") -->");
console.log("<!-- ", primary_color, secondary_color, bg_color, "-->");

