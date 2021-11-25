/* 
 * create a canvas, load an image, write image to local canvas,
 * write to file
 *
 */

/* License: CCO */

/*
 * references:
 * https://shihn.ca/posts/2020/roughjs-algorithms/
 *
 */

var _canvas = require("canvas");
var fs = require("fs");
var bez = require("bezier-js");

function _write_img(ctx, fn) {
  let buf = canvas.toBuffer("image/png");
  fs.writeFileSync(fn, buf);
}

// crazyLine
// Ported from Crazyline. By Steve Hanov, 2008
// http://stevehanov.ca/blog/index.php?id=33
// Originally released to the public domain.
//
function crazyLine(fromX, fromY, toX, toY) {

  // The idea is to draw a curve, setting two control points at random 
  // close to each side of the line. The longer the line, the sloppier it's drawn.
  var control1x, control1y;
  var control2x, control2y;

  // calculate the length of the line.
  var length = Math.sqrt( (toX-fromX)*(toX-fromX) + (toY-fromY)*(toY-fromY));
  
  // This offset determines how sloppy the line is drawn. It depends on the 
  // length, but maxes out at 20.
  var offset = length/20;
  if (offset > 20) { offset = 20; }

  // Overshoot the destination a little, as one might if drawing with a pen.
  toX += (Math.random())*offset/4;
  toY += (Math.random())*offset/4;

  var t1X = fromX, t1Y = fromY;
  var t2X = toX, t2Y = toY;

  // t1 and t2 are coordinates of a line shifted under or to the right of 
  // our original.
  t1X += offset;
  t2X += offset;
  t1Y += offset;
  t2Y += offset;

  // create a control point at random along our shifted line.
  var r = Math.random();
  control1X = t1Y + r * (t2X-t1X);
  control1Y = t1Y + r * (t2Y-t1Y);

  // now make t1 and t2 the coordinates of our line shifted above 
  // and to the left of the original.

  t1X = fromX - offset;
  t2X = toX - offset;
  t1Y = fromY - offset;
  t2Y = toY - offset;

  // create a second control point at random along the shifted line.
  r = Math.random();
  control2X = t1X + r * (t2X-t1X);
  control2Y = t1Y + r * (t2Y-t1Y);

  return new bez.Bezier(fromX,fromY, control1X,control1Y, control2X,control2Y, toX,toY);
}

function crazyArc(centerX, centerY, radius, angleStart, angleDelta) {

  // The idea is to draw a curve, setting two control points at random 
  // close to each side of the line. The longer the line, the sloppier it's drawn.
  var control1x, control1y;
  var control2x, control2y;

  // calculate the length of the line.
  var length = Math.sqrt( (toX-fromX)*(toX-fromX) + (toY-fromY)*(toY-fromY));
  
  // This offset determines how sloppy the line is drawn. It depends on the 
  // length, but maxes out at 20.
  var offset = length/20;
  if (offset > 20) { offset = 20; }

  // Overshoot the destination a little, as one might if drawing with a pen.
  toX += (Math.random())*offset/4;
  toY += (Math.random())*offset/4;

  var t1X = fromX, t1Y = fromY;
  var t2X = toX, t2Y = toY;

  // t1 and t2 are coordinates of a line shifted under or to the right of 
  // our original.
  t1X += offset;
  t2X += offset;
  t1Y += offset;
  t2Y += offset;

  // create a control point at random along our shifted line.
  var r = Math.random();
  control1X = t1Y + r * (t2X-t1X);
  control1Y = t1Y + r * (t2Y-t1Y);

  // now make t1 and t2 the coordinates of our line shifted above 
  // and to the left of the original.

  t1X = fromX - offset;
  t2X = toX - offset;
  t1Y = fromY - offset;
  t2Y = toY - offset;

  // create a second control point at random along the shifted line.
  r = Math.random();
  control2X = t1X + r * (t2X-t1X);
  control2Y = t1Y + r * (t2Y-t1Y);

  return new bez.Bezier(fromX,fromY, control1X,control1Y, control2X,control2Y, toX,toY);
}


//  https://stackoverflow.com/a/18690585
// CC-BY-SA user1693593
//
function handDrawnArc(cx, cy, r, a_s, a_e) {

  let x, y,                                      /// the calced point
      tol = Math.random() * (r * 0.03) + (r * 0.025), ///tolerance / fluctation
      dx = Math.random() * tol * 0.75,           /// "bouncer" values
      dy = Math.random() * tol * 0.75,
      ix = (Math.random() - 1) * (r * 0.0044),   /// speed /incremental
      iy = (Math.random() - 1) * (r * 0.0033),
      rx = r + Math.random() * tol,              /// radius X 
      ry = (r + Math.random() * tol) * 0.8,      /// radius Y
      a = 0,                                     /// angle
      ad = 3*Math.PI/180.0,                                    /// angle delta (resolution)
      i = 0,                                     /// counter
      start = Math.random() + 50,                /// random delta start
      tot = 360 + Math.random() * 50 - 100,  /// end angle
      points = [],                               /// the points array
      deg2rad = Math.PI / 180;                   /// degrees to radians

  let n = Math.floor( Math.abs((a_e - a_s)/ad) + 0.5 );


  for (let idx=0; idx < n; idx++) {
    dx += ix;
    dy += iy;

    if (dx < -tol || dx > tol) ix = -ix;
    if (dy < -tol || dy > tol) iy = -iy;

    let cur_ang = a_s + ((i*(a_e - a_s))/n);

    x = cx + (rx + dx * 2) * Math.cos(cur_ang);
    y = cy + (ry + dy * 2) * Math.sin(cur_ang);

    //points.push(x, y);
    points.push(x);
    points.push(y);
  }

  for (let i=0; i<points.length; i+=2) {
    console.log(points[i], points[i+1]);
  }

  return points;
}

function drawHumanLine(ctx, srcx,srcy, dstx,dsty, subdiv) {
  subdiv = ((typeof subdiv === "undefined") ? 64 : subdiv);
  var cl = crazyLine(srcx,srcy, dstx,dsty);
  ctx.beginPath();
  let lut = cl.getLUT(subdiv);
  ctx.moveTo(lut[0].x, lut[0].y);
  for (let ii=1; ii<lut.length; ii++) {
    ctx.lineTo(lut[ii].x, lut[ii].y);
  }
  ctx.stroke();
}

function bez_example(ctx) {

  //var b = new bez.Bezier(

}


var info = {
  "width": 512,
  "height":512
};

var canvas = _canvas.createCanvas(info.width, info.height);
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, 50, 50);


let cx = 512/2;
let cy = 512/2;
let rad = 30;
let rho_s = Math.pi/4.0;
let rho_e = Math.pi/6.0;

let dx_s = Math.cos(rho_s)*rad;
let dy_s = Math.sin(rho_s)*rad;

let dx_e = Math.cos(rho_e)*rad;
let dy_e = Math.sin(rho_e)*rad;

//drawHumanLine(ctx, 20, 20, 100, 200);
//drawHumanLine(ctx, 20, 20, 100, 200);
//drawHumanLine(ctx, 20, 20, 100, 200);
//_write_img(ctx, "./out.png");

let p = handDrawnArc(256, 256, 100, Math.PI/3.0, Math.PI);
//console.log(p);


/*(
_canvas.loadImage("./3cat-hart.png").then(img => {
  ctx.drawImage(img, 128, 128, 256, 256);
});
*/

