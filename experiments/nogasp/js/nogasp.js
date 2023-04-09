console.log("...");

var g_ctx = {

  // message:bw   - display white on black message
  // message:list - display multiple messages
  // input        - let user input
  //
  "state" : "message:bw",

  "pause": false,

  "family": "",
  "color": "",

  //"fgdt" : 500,
  "fgdt" : 900,
  "fgrgb" : "#eee",
  "bgdt" : 500,
  "fgrgb" : "#222",

  "letter_width" : [ 15, 15, 15, 15, 15, 15, 15, 15 ],
  "ds": (1/(2000/50)),

  "msg" : ["NO GASP"],
  "msg_idx" : 0,
  "perm" : []
};

var g_rng = {
  "double" : Math.random
};

function irnd(n) {
  return Math.floor(Math.random()*n);
}

// _rnd()     : 0...1
// _rnd(a)    : 0...a
// -rnd(a,b)  : a...b
//
function _rnd(a,b) {
  a = ((typeof a === "undefined") ? 1.0 : a);
  if (typeof b === "undefined") {
    //return Math.random()*a;
    return g_rng.double()*a;
  }

  //return (Math.random()*(b-a) + a);
  return (g_rng.double()*(b-a) + a);
}



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



function update_textfont(ui_id, msg, sz, fam) {
  ui_id = ((typeof ui_id === "undefined") ? "ui_main" : ui_id);
  msg = ((typeof msg === "undefined") ? "WITCH CAT" : msg);
  sz = ((typeof sz === "undefined") ? "250px" : sz);
  fam = ((typeof fam === "undefined") ? "customfont0" : fam);

  let ele = document.getElementById(ui_id);
  ele.innerHTML = msg;
  ele.style.fontSize = sz;
  ele.style.fontFamily = fam;
}

function display_msg_rchr(msg) {

  let N = 109;

  let ele = document.getElementById("ui_main");
  ele.innerHTML = "";

  for (let idx=0; idx<msg.length; idx++) {
    console.log(">>>", msg[idx]);

    let span = document.createElement("span");
    span.id = "ui_span" + idx;
    span.innerHTML = msg[idx];
    span.style.fontSize = "250px";
    span.style.fontFamily = "customfont" + irnd(N);


    ele.appendChild(span);
  }
}

function display_msg(msg, fam, color) {
  let N = 109;

  fam = ((typeof fam === "undefined") ? ("customfont" + irnd(N)) : fam);
  color = ((typeof color === "undefined") ? ((irnd(2)==0) ? "black" : "#eee") : color);

  g_ctx.family = fam;
  g_ctx.color = color;

  let ele = document.getElementById("ui_main");
  ele.innerHTML = "";

  // dynamic letter size (width)
  //
  let n = 1;
  if (msg.length > n) { n = msg.length; }
  let letter_width = Math.ceil( 100/n );

  g_ctx.letter_width = letter_width;
  g_ctx.msg_let_w = [];

  let letter_width_s = letter_width.toString() + "vw";

  for (let idx=0; idx<msg.length; idx++) {
    let span = document.createElement("span");
    span.id = "ui_span" + idx;

    span.innerHTML = ((msg[idx] == " ") ? "&nbsp;" : msg[idx]);
    span.style.fontSize = letter_width_s;
    span.style.fontFamily = fam;
    span.style.margin = "1vw";
    span.style.color = color;

    ele.appendChild(span);

    g_ctx.msg_let_w.push( g_ctx.letter_width );
  }
}

function change_bg_color() {
  let h = _rnd();
  let s = _rnd(0.5,1.0);
  let v = _rnd(0.5,1.0);

  let rgb = HSVtoRGB(h,s,v);
  let rgb_hex = _rgb2hex(rgb.r, rgb.g, rgb.b);

  let bg_ele = document.getElementById("ui_body");
  bg_ele.style.background = rgb_hex;
}

function change_fg_color() {
  let h = _rnd();
  let s = _rnd(0.5,1.0);
  let v = _rnd(0.5,1.0);

  let rgb = HSVtoRGB(h,s,v);
  let rgb_hex = _rgb2hex(rgb.r, rgb.g, rgb.b);

  let msg = g_ctx.msg[ g_ctx.msg_idx ];

  for (var idx=0; idx<msg.length; idx++) {
    let ele = document.getElementById("ui_span" + idx);
    ele.style.color = rgb_hex;
  }
}

function _rcolorhex() {
  let h = _rnd();
  let s = _rnd(0.5,1.0);
  let v = _rnd(0.5,1.0);

  let rgb = HSVtoRGB(h,s,v);
  let rgb_hex = _rgb2hex(rgb.r, rgb.g, rgb.b);

  return rgb_hex;
}

function update_ikol_msg(msg, fam, color, let_idx) {

  let N = 109;
  let rgb_hex = "#eee";

  //msg = ((typeof msg === "undefined") ? g_ctx.msg[g_ctx.msg_idx] : msg);
  msg = ((typeof msg === "undefined") ? "..."  : msg);
  fam = ((typeof fam === "undefined") ? ("customfont" + irnd(N)) : fam);
  color = ((typeof color === "undefined") ? rgb_hex : color);

  g_ctx.family = fam;
  g_ctx.color = color;

  //let_idx = ((typeof let_idx === "undefined") ? irnd(msg.length) : let_idx);
  if (typeof let_idx === "undefined") {
    if (g_ctx.perm.length == 0) {
      for (let i=0; i<msg.length; i++) {
        g_ctx.perm.push(i);
      }
      for (let i=0; i<g_ctx.perm.length; i++) {
        let p = g_ctx.perm[i];
        let j = i + irnd(g_ctx.perm.length-i);
        g_ctx.perm[i] = g_ctx.perm[j];
        g_ctx.perm[j] = p;
      }
    }
    let_idx = g_ctx.perm.pop();
  }
  else { }

  let span = document.getElementById("ui_span" + let_idx);
  span.style.fontFamily = fam;
  span.style.color = color;

}

function update_ikol_msg_all(msg, fam, color) {
  let n = 1;
  if (msg.length > n) { n = msg.length; }
  let letter_width = 100/n;

  msg = ((typeof msg === "undefined") ? "..." : msg);
  for (let i=0; i<msg.length; i++) {
    update_ikol_msg(msg, fam, color, i);

    g_ctx.msg_let_w[i] = letter_width;

  }
}


//-----
//-----
//-----

function ui_switch_to_input() {
  let a = document.getElementById("ui_main");
  a.style.display = 'none';

  let b = document.getElementById("ui_input");
  b.style.display = '';
}

function ui_switch_to_display() {
  let a = document.getElementById("ui_main");
  a.style.display = '';

  let b = document.getElementById("ui_input");
  b.style.display = 'none';
}

function _click(c) {
  console.log(">> _click", c);

  if (g_ctx.state == "message:bw") {
    _pause();
    g_ctx.state = "input";
    ui_switch_to_input();
  }
}

function _button(e) {
  console.log(">> _button", e);

  if (g_ctx.state == "input") {
    _resume();
    g_ctx.state = "message:bw";

    let input = document.getElementById("ui_input_text");
    g_ctx.msg = [ input.value ];
    g_ctx.msg_idx = 0;
    display_msg(g_ctx.msg[g_ctx.msg_idx]);
    update_ikol_msg_all(g_ctx.msg[g_ctx.msg_idx]); 

    ui_switch_to_display();
    e.stopPropagation();
  }

}

function _key(x) {
  console.log(">> _key:", x);
}

function _process() {
  if (g_ctx.paused) { return; }
  update_ikol_msg_all(g_ctx.msg[g_ctx.msg_idx]);
}

function _pause()   { g_ctx.paused = true; }
function _resume()  { g_ctx.paused = false; }


function _wobbly_timer() {
  //let ds = 1.0 / (4000/50);
  let ds = g_ctx.ds;

  //let fam = g_ctx.family;
  //let color = g_ctx.color;

  let msg = g_ctx.msg[0];
  for (let idx=0; idx<msg.length; idx++) {
    let span = document.getElementById("ui_span" + idx.toString());

    let lw_s = g_ctx.msg_let_w[idx].toString() + "vw";

    //span.innerHTML = ((msg[idx] == " ") ? "&nbsp;" : msg[idx]);
    span.style.fontSize = lw_s;
    //span.style.fontFamily = fam;
    //span.style.margin = "1vw";
    //span.style.color = color;

    g_ctx.msg_let_w[idx] += ds;

    if (idx==0) {
      //console.log( g_ctx.msg_let_w[idx]);
    }
  }

}

function init() {

  let param = new URLSearchParams(window.location.search);
  if (param.get('msg') !== null) {
    console.log(">>>", param.get('msg'));
    g_ctx.msg = [ param.get('msg') ];
    g_ctx.msg_idx = 0;
  }

  if (param.get('fgdt') !== null) { g_ctx.fgdt = param.get('fgdt'); }
  if (param.get('fgrgb') !== null) { g_ctx.fgrgb= param.get('fgrgb'); }
  if (param.get('bgdt') !== null) { g_ctx.bgdt = param.get('bgdt'); }
  if (param.get('bgrgb') !== null) { g_ctx.bgrgb= param.get('bgrgb'); }

  let body = document.getElementById("ui_body");
  body.addEventListener('click', _click);

  let button = document.getElementById("ui_input_button");
  button.addEventListener('click', _button);
  //cbutton.addEventListener('onclick', _button);

  let inp = document.getElementById("ui_input_text");
  inp.value = g_ctx.msg[g_ctx.msg_idx];

  display_msg(g_ctx.msg[g_ctx.msg_idx]);
  update_ikol_msg_all(g_ctx.msg[g_ctx.msg_idx]); 

  setInterval(_process, g_ctx.fgdt);

  setInterval(_wobbly_timer, 50);

}

// 75
