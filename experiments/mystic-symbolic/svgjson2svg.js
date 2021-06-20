var fs = require("fs");

// ------------------
// ------------------
// ------------------

// Integer random number in range of n
//
function _irnd(n) {
  if (typeof n === "undefined") { n=2; }
  return Math.floor(Math.random()*n);
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


var fn = "";
if (process.argv.length >= 3) {
  fn = process.argv[2];
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

function jsonsvg2svg_defs(defs) {

  if (typeof defs === "undefined") { return ""; }

  for (var def_idx=0; def_idx<defs.length; def_idx++) {
    var x = defs[def_idx];
    var _type = x.type;

    var lines = [];
    if (_type == "linearGradient") {

      var _line = "<linearGradient ";

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

      lines.push("</linearGradient>")
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

function jsonsvg2svg_child(x) {
  var lines = [];

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
        _line += " " + prop_key + "=\"" + _json.props[prop_key] + "\"";
      }
    }

    if ((tag !== "path") && (tag.length>0)) { _line += ">\n"; }

    if ("children" in _json) {
      var _d = jsonsvg2svg_child(_json.children);
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

function _preprocess_svgjson(adata) {
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
    _svg_inner = jsonsvg2svg_child(data.layers);

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

var g_data = _preprocess_svgjson(adata);
g_data["cur_depth"] = 0;
g_data["max_depth"] = 2;
g_data["scale"] = 0.5;
g_data["complexity"] = 4;

g_data["svg_width"] = 720.0;
g_data["svg_height"] = 720.0;

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
function _recur(ctx, base, sched) {
  if (typeof ctx === "undefined") { return ""; }

  var scale = ctx.scale;
  var complexity = ctx.complexity;

  var top_level = false;

  if (ctx.cur_depth >= ctx.max_depth) { return ""; }
  if (ctx.cur_depth == 0) { top_level = true; }
  ctx.cur_depth+=1;

  var ret_str = "";

  if (top_level) {
    ret_str += base.svg_header;
    ret_str += jsonsvg2svg_defs(base.defs);

  }

  var base_specs = base.specs;
  var base_meta = base.meta;
  var base_bbox = base.bbox;

  // nesting logic
  //
  if ("nesting" in base.specs) {
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
      ret_str += jsonsvg2svg_defs(sub.defs);

      ret_str += t_str_s;
      ret_str += jsonsvg2svg_child(sub.layers);
      ret_str += t_str_e;

    }
  }




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

      ret_str += jsonsvg2svg_defs(sub.defs);
      ret_str += t_str_s;

      // render svg from svgjson data
      //
      ret_str += jsonsvg2svg_child(sub.layers);

      ret_str += _recur(ctx, sub);
      ret_str += t_str_e;

    }

  }

  if (top_level) {
    ret_str += base.svg_inner;
    ret_str += base.svg_footer;
  }

  ctx.cur_depth-=1;
  return ret_str;
}

var base_symbol = g_data.symbol["hands_giving"];

console.log( _recur(g_data, base_symbol) );

//example0_a();
