// License: CC0
//

var svg_id = 'tarot_test';

var svg_header = '<?xml version="1.0" encoding="utf-8"?>\n' +
  '<!-- Generator: Moho 12.5 build 22414 -->\n' +
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
  '<svg version="1.1" id="Frame_0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720px" height="720px">\n';
var svg_footer = '</svg>\n';

var crown_up = '<path fill="#0000ff" fill-rule="evenodd" stroke="none" ' +
  'd="M 360.000 10.770 ' +
  'C 360.001 10.772 367.082 30.601 367.083 30.603 ' +
  'C 367.082 30.603 360.001 24.014 360.000 24.013 ' +
  'C 359.999 24.014 352.918 30.603 352.917 30.603 ' +
  'C 352.918 30.601 359.999 10.772 360.000 10.770 Z"/>';

var arrow_up_pnts = [ [0, 0], [7,20], [0,14], [-7,20], [0,0] ];

var placeholder_svg = '<path fill="#ffffff" fill-rule="evenodd" stroke="none"' +
'd="M 360.000 142.159 C 361.422 142.159 362.570 141.012 362.570 139.589 ' +
'C 362.570 138.167 361.422 137.019 360.000 137.019 ' +
'C 358.578 137.019 357.430 138.167 357.430 139.589 ' +
'C 357.430 141.012 358.578 142.159 360.000 142.159 Z"/>';

function create_template() {
  var _data = {
    "name": "NAMEID",
    "bbox": {
      "x": { "min": 357.43, "max": 362.57 },
      "y": { "min": 137.019, "max": 142.159 }
    },
    "layers": [ {  
      "tagName": "g",
      "props": { "id": "NAMEID" },
      "children": [ {  
        "tagName": "g",
        "props": { "id": "NAMEID" },
        "children": [ {  
          "tagName": "path",
          "props": {
            "fill": "none",
            "fillRule": "evenodd",
            "stroke": "none",
            "d": "M 360.000 142.159 C 361.422 142.159 362.570 141.012 362.570 139.589 C 362.570 138.167 361.422 137.019 360.000 137.019 C 358.578 137.019 357.430 138.167 357.430 139.589 C 357.430 141.012 358.578 142.159 360.000 142.159 Z"
          },
          "children": []
        }]
      } ]
    } ],
    "specs": {
      "crown": [
        //{ "point": { "x": 360, "y": 25, "t": 0 },
        //  "normal": { "x": 0, "y": -1 } }
      ],
      "nesting": [
        //{ "x": { "min": 50, "max": 150 },
        //  "y": { "min": 50, "max": 150 } }
      ]
    },
    "meta" : {
      //"always_be_nested" : false,
      //"always_nest" : false,
      //"attach_to" : [ "tail", "leg", "arm", "horn", "crown" ],
      //"background" : true,
      //"invert_nested" : false,
      //"never_be_nested" : false,
      //"rotate_clockwise" : false,
      "attach_to":[],
      "never_be_nested": true,
      "background": true,
      "exclude": true
    }
  };
  return _data;
}


var _DEFAULT_WIDTH = 720, _DEFAULT_HEIGHT = 720;

var _w      = _DEFAULT_WIDTH,   _h      = _DEFAULT_HEIGHT,
    _mid_w  = _DEFAULT_WIDTH/2, _mid_h  = _DEFAULT_HEIGHT/2;

var _w2 = _w/2.0, _h2 = _h/2.0,
    _w3 = _w/3.0, _h3 = _h/3.0,
    _w4 = _w/4.0, _h4 = _h/4.0,
    _w5 = _w/5.0, _h5 = _h/5.0,
    _w8 = _w/8.0, _h8 = _h/8.0;

var minor_arcana_pnts = {
  "ace" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "2" : [ [ {"x":_mid_w-_w4, "y":_mid_h-_h4}, {"x":_mid_w+_w4, "y":_mid_h-_h4} ],
          [ {"x":_mid_w-_w4, "y":_mid_h+_h4}, {"x":_mid_w+_w4, "y":_mid_h+_h4} ],
          [ {"x":_mid_w-_w4, "y":_mid_h-_h4}, {"x":_mid_w+_w4, "y":_mid_h+_h4} ],
          [ {"x":_mid_w-_w4, "y":_mid_h+_h4}, {"x":_mid_w+_w4, "y":_mid_h-_h4} ] ],
  "3" : [ [ {"x":_mid_w-_w4, "y":_mid_h-_h3}, {"x":_mid_w+_w4, "y":_mid_h-_h3}, {"x":_mid_w,"y":_mid_h-0*_h8} ],
          [ {"x":_mid_w-_w4, "y":_mid_h+_h3}, {"x":_mid_w+_w4, "y":_mid_h+_h3}, {"x":_mid_w,"y":_mid_h+_h3} ] ],
  "4" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "5" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "6" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "7" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "8" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "9" : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "10" : [
    [
      { "x": _mid_w - 2*_w3, "y": 2*_h - 2.25*_h5 },
      { "x": _mid_w - 2*_w3, "y": 2*_h - 4.25*_h5  },
      { "x": _mid_w - 2*_w3, "y": 2*_h - 6.25*_h5  },
      { "x": _mid_w - 2*_w3, "y": 2*_h - 8.25*_h5  },
      { "x": _mid_w - 2*_w3, "y": 2*_h - 10.25*_h5  },

      { "x": _mid_w + 2*_w3, "y": 2*_h - 2.25*_h5 },
      { "x": _mid_w + 2*_w3, "y": 2*_h - 4.25*_h5  },
      { "x": _mid_w + 2*_w3, "y": 2*_h - 6.25*_h5  },
      { "x": _mid_w + 2*_w3, "y": 2*_h - 8.25*_h5  },
      { "x": _mid_w + 2*_w3, "y": 2*_h - 10.25*_h5  }

    ]
  ],

  "page"    : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "knight"  : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "queen"   : [ [ { "x": _mid_w, "y": _mid_h }] ],
  "king"    : [ [ { "x": _mid_w, "y": _mid_h }] ]
};

function create_tarot_json(data, id, pnts, nesting) {
  if (typeof pnts === "undefined") { pnts = []; }
  if (typeof nesting === "undefined") {
    nesting = { 
      "x": { "min": 20, "max": 700 },
      "y": { "min": 20, "max": 700 }
    };
  }

  if (typeof data === "undefined") {
    data = create_template();
  }

  data.name = id;
  for (var ii=0; ii<data.layers.length; ii++) {
    data.layers[ii].props.id = id;
    for (var jj=0; jj<data.layers[ii].children.length; jj++) {
      data.layers[ii].children[jj].props.id = id;
    }
  }

  // Set the meta flag to exclude from
  // random choice
  //
  if (!("meta" in data)) {
    data["meta"] = { "exclude":true, "attach_to":[], "never_be_nested":true };
  }

  if (!("specs" in data)) { data["specs"] = {}; }

  // Create anchor just in case.
  // We don't intend to use it but
  // at least it will prevent things from breaking
  // if it gets accessed.
  //
  data.specs["anchor"] = [ { "point":{"x": 360,"y":700}, "normal":{"x":0,"y":-1}  } ];

  // The crown is where we expect to put the minor
  // arcana suite
  //
  data.specs["crown"] = [];
  for (var ii=0; ii<pnts.length; ii++) {
    data.specs.crown.push( { "point": { "x": pnts[ii].x, "y":pnts[ii].y }, "normal":{"x":0.0, "y":-1} });
  }

  // Create huge nesting box
  //
  data.specs["nesting"] = [];
  data.specs.nesting.push( {
    "x":{"min":nesting.x.min, "max":nesting.x.max},
    "y":{"min":nesting.y.min, "max":nesting.y.max}
  });

  return data;
}

var minor_arcana_list = ["ace", "2", "3", "4", "5", "6", "7",  "8", "9", "10", "page", "knight", "queen", "king"];

var tarot_minor_json = [];


var suite = "wands";
for (var ii=0; ii<minor_arcana_list.length; ii++) {
  var card_type = minor_arcana_list[ii];
  for (var jj=0; jj<minor_arcana_pnts[card_type].length; jj++) {
    var card_id = suite + "_" + card_type + "_" + jj;
    var _dat = create_template();
    create_tarot_json(_dat, card_id, minor_arcana_pnts[card_type][jj]);
    tarot_minor_json.push(_dat);
  }
}

console.log(JSON.stringify(tarot_minor_json, undefined, 2));

function create_tarot_test(data_template, id) {
  var data = Object.assign({}, data_template);
  data.name = id;
  for (var ii=0; ii<data.layers.length; ii++) {
    data.layers[ii].probs.id = id;
    for (var jj=0; jj<data.layers[ii].children.length; jj++) {
      data.layers[ii].children[jj].props.id = id;
    }
  }
}

// #0000ff (blue) crown
// #ff0000 (red) anchor
// #be0027 (maroon) tail
// #ff00ff (purple) nestbox
//
function svg_anchor(s_x,s_y,pnts,color) {
  color = ((typeof color === "undefined") ? "#0000ff" : color);
  var _s = '<path fill="' + color + '" fill-rule="evenodd" stroke="none" d="';;
  var _e = ' Z"/>';

  var _m = "";

  _m += " M " + s_x.toString() + " " + s_y.toString();

  var x = s_x + pnts[0][0];
  var y = s_y + pnts[0][1];

  var prev_x = x;
  var prev_y = y;

  for (var ii=1; ii<pnts.length; ii++) {
    x = (s_x + pnts[ii][0]);
    y = (s_y + pnts[ii][1]);

    _m += " C";
    _m += " " + prev_x.toString() + " " + prev_y.toString();
    _m += " " + x.toString() + " " + y.toString();
    _m += " " + x.toString() + " " + y.toString();

    prev_x = x;
    prev_y = y;

  }

  return _s + _m + _e;
}

function svg_nest(s_x,s_y,d_x,d_y) {
  var color = "#ff00ff";
  var _s = '<path fill="' + color + '" fill-rule="evenodd" stroke="none" d="';;
  var _e = ' Z"/>';

  var _m = "";

  var pnts = [ [s_x,s_y], [s_x+d_x,s_y], [s_x+d_x,s_y+d_y], [s_x,s_y+d_y] ];

  var x = pnts[0][0];
  var y = pnts[0][1];

  var prv_x = x;
  var prv_y = y;
  _m += " M " + x.toString() + " " + y.toString();
  for (var ii=1; ii<pnts.length; ii++) {
    x = pnts[ii][0];
    y = pnts[ii][1];

    _m += " C";
    _m += " " + prv_x.toString() + " " + prv_y.toString();
    _m += " " + x.toString() + " " + y.toString();
    _m += " " + x.toString() + " " + y.toString();

    prv_x = x;
    prv_y = y;

  }

  return _s + _m + _e;
}

function svg_tarot() {

  console.log(svg_header);

  console.log("<g id='" + svg_id + "'>");
  console.log("<g id='" + svg_id + "'>");
  console.log(placeholder_svg);
  console.log("</g></g>");

  console.log('<g id="specs">');
  console.log(svg_anchor(360,11, arrow_up_pnts, "#0000ff"));
  console.log(svg_anchor(360,700,arrow_up_pnts,"#ff0000"));
  console.log(svg_nest(50,50,100,100));
  console.log('</g>');

  console.log(svg_footer);

}

//svg_tarot();

