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

var svgjson_data = {
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
          "fill": "#ffffff",
          "fillRule": "evenodd",
          "stroke": "none",
          "d": "M 360.000 142.159 C 361.422 142.159 362.570 141.012 362.570 139.589 C 362.570 138.167 361.422 137.019 360.000 137.019 C 358.578 137.019 357.430 138.167 357.430 139.589 C 357.430 141.012 358.578 142.159 360.000 142.159 Z"
        },
        "children": []
      }]
    } ]
  } ],
  "specs": {
    "leg": [
      { 
        "point": { "x": 360, "y": 25, "t": 0 },
        "normal": { "x": 0, "y": -1 }
      }
    ],
    "nesting": [
      { 
        "x": { "min": 50, "max": 150 },
        "y": { "min": 50, "max": 150 }
      }
    ]
  }
};


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

svg_tarot();

