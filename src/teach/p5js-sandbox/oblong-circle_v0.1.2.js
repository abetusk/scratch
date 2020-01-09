

function oblong_circle(radius, range, npnt, center) {
  var nControlPoints = ( (typeof npts === "undefined") ? 5 : npnt );
  var pnt = [];
  var tng = [];
  var rads = [];

  var c = ( (typeof center == "undefined") ? [0,0] : center );

  var rot = [ [ cos( PI/2.0), sin(PI/2.0) ], [ - sin(PI/2.0), cos(PI/2.0) ] ];

  range = ( (typeof range === "undefined") ? [-10, 10] : range);

  //var cur_r = 400/4;
  cur_r = ( (typeof radius === "undefined") ? 100 : radius );
  for (var ii=0; ii<nControlPoints; ii++) {
    rads.push(cur_r);
    var xy = [ cos( 2.0*PI*ii/nControlPoints), sin(2.0*PI*ii/nControlPoints) ];
    var txy = [ [ xy[1], -xy[0] ], [ -xy[1], xy[0] ] ];
    pnt.push(xy);
    tng.push(txy);
   
    // don't chage radius too drastically, just change incrementally.
    //
    //cur_r += random(-10,10);
    cur_r += random(range[0], range[1]);
  }

  for (var ii=0; ii<pnt.length; ii++) {
    f = 2/pnt.length;
    for (var jj=0; jj<2; jj++) {
      pnt[ii][jj] = (pnt[ii][jj]*rads[ii]) + c[jj];
      tng[ii][0][jj] = (rads[ii]*tng[ii][0][jj]*f) + pnt[ii][jj];
      tng[ii][1][jj] = (rads[ii]*tng[ii][1][jj]*f) + pnt[ii][jj];
    }
  }

  return { "point" : pnt, "tangent" : tng, "radius" : rads };
}

function render_oblong(dat) {
  var pnt = dat.point;
  var tng = dat.tangent;
  var rads = dat.radius;

  noFill();
  strokeWeight(4);
  point(200,200);
  for (var ii=0; ii<pnt.length; ii++) {
    var iip = (ii + pnt.length - 1)%(pnt.length);
    bezier(pnt[iip][0], pnt[iip][1],
           tng[iip][1][0], tng[iip][1][1],
           tng[ii][0][0], tng[ii][0][1],
           pnt[ii][0], pnt[ii][1]);
  }


}

function render_oblong_lines(_in, _out, steps) {

  var in_pnt = _in.point;
  var in_tng = _in.tangent;

  var out_pnt = _out.point;
  var out_tng = _out.tangent;

  var steps = ((typeof steps === "undefined") ? 10 : steps)
  for (var ii=0; ii < _in.point.length; ii++) {
    iip = (ii + in_pnt.length - 1)%(in_pnt.length);

    for (var step = 0; step < steps; step++) {
      var t = step / steps;
      var x0 = bezierPoint( in_pnt[iip][0], in_tng[iip][1][0], in_tng[ii][0][0], in_pnt[ii][0], t);
      var y0 = bezierPoint( in_pnt[iip][1], in_tng[iip][1][1], in_tng[ii][0][1], in_pnt[ii][1], t);

      var x1 = bezierPoint( out_pnt[iip][0], out_tng[iip][1][0], out_tng[ii][0][0], out_pnt[ii][0], t);
      var y1 = bezierPoint( out_pnt[iip][1], out_tng[iip][1][1], out_tng[ii][0][1], out_pnt[ii][1], t);

      line(x0,y0, x1,y1);
    }

  }

}

function setup() {
  createCanvas(400, 400);
  background(220);

  var nControlPoints = 7;
  var pnt = [];
  var tng = [];
  var rads = [];

  var c = [200,200];

  var dat0 = oblong_circle(400/4, [-10,10], 7, c);
  var dat1 = oblong_circle(400/8, [-5,5], 7, c);
  var dat2 = oblong_circle(400/16, [-1,1], 7, c);

  render_oblong(dat0);
  render_oblong(dat1);
  render_oblong(dat1);

  render_oblong_lines(dat1, dat0, 10);
  render_oblong_lines(dat2, dat1, 15);
}
