
// constraint is an object with index and point information that constrains the control
// point to an x/y position.
//
// for example:
//  constraint = [
//    { "index" : 2, "position": [ 30, 20] },
//    { "index" : 4, "position": [ -30, 25] }
//  ];
//
//  coordinates are absolute
//
function oblong_circle_constrained(radius, range, npnt, center, constraint, phase) {
  var nControlPoints = ( (typeof npnt === "undefined") ? 5 : npnt );
  var pnt = [];
  var tng = [];
  var rads = [];
  
  var ii;
  
  print("--");
  
  phase = ( (typeof phase === "undefined") ? 0.0 : phase );

  var c = ( (typeof center === "undefined") ? [0,0] : center );
  var cp = ( (typeof constraint === "undefined") ? [] : constraint);
  var clu = {};
  var clug = {};
  for (ii=0; ii<cp.length; ii++) {
    clu[cp[ii].index] = cp[ii].position;
    if ("tangent" in cp[ii]) {
      print("@@");
      clug[cp[ii].index] = cp[ii].tangent;
    }
  }

  print(clug);


  var rot = [ [ cos( PI/2.0), sin(PI/2.0) ], [ - sin(PI/2.0), cos(PI/2.0) ] ];

  range = ( (typeof range === "undefined") ? [-10, 10] : range);

  cur_r = ( (typeof radius === "undefined") ? 100 : radius );
  for (ii=0; ii<nControlPoints; ii++) {
    
    print(">", ii);
    
    if (ii in clu) {
      var _x = clu[ii][0];
      var _y = clu[ii][1];
      
      print("??", ii, ii in clu, ii in clug);

      cur_r = sqrt( (_x - c[0])*(_x - c[0]) + (_y - c[1])*(_y - c[1]) );
      var _xy = [ (_x - c[0])/cur_r, (_y - c[1])/cur_r ];
      var _txy = [ [ _xy[1], -_xy[0] ], [ -_xy[1], _xy[0] ] ];
      if (ii in clug) {
        //_txy = [ [ clug[ii][0][0] - _x, clug[ii][0][1] - _y],
        //         [ clug[ii][1][0] - _x, clug[ii][1][1] - _y] ];
        _txy = [ [ clug[ii][1][0] - _x, clug[ii][1][1] - _y],
                 [ clug[ii][0][0] - _x, clug[ii][0][1] - _y] ];
              
        var _s0 = sqrt( (_txy[0][0]*_txy[0][0]) + (_txy[0][1]*_txy[0][1]) );
        var _s1 = sqrt( (_txy[1][0]*_txy[1][0]) + (_txy[1][1]*_txy[1][1]) );
        _txy[0][0] /= _s0;
        _txy[0][1] /= _s0;
        _txy[1][0] /= _s1;
        _txy[1][1] /= _s1;
        print("!!", _txy);
      }
      pnt.push(_xy);
      tng.push(_txy);

      rads.push(cur_r);

      continue;
    }
    
    rads.push(cur_r);
    var xy = [ cos( 2.0*PI*ii/nControlPoints + phase), sin(2.0*PI*ii/nControlPoints + phase) ];
    var txy = [ [ xy[1], -xy[0] ], [ -xy[1], xy[0] ] ];
    pnt.push(xy);
    tng.push(txy);

    // don't chage radius too drastically, just change incrementally.
    //
    //cur_r += random(-10,10);
    cur_r += random(range[0], range[1]);
  }

  for (ii=0; ii<pnt.length; ii++) {
    f = 2/pnt.length;
    for (var jj=0; jj<2; jj++) {
      pnt[ii][jj] = (pnt[ii][jj]*rads[ii]) + c[jj];
      tng[ii][0][jj] = (rads[ii]*tng[ii][0][jj]*f) + pnt[ii][jj];
      tng[ii][1][jj] = (rads[ii]*tng[ii][1][jj]*f) + pnt[ii][jj];
    }
  }

  return { "point" : pnt, "tangent" : tng, "radius" : rads };
}

function oblong_circle(radius, range, npnt, center) {
  var nControlPoints = ( (typeof npts === "undefined") ? 5 : npnt );
  var pnt = [];
  var tng = [];
  var rads = [];
  
  var ii;

  var c = ( (typeof center == "undefined") ? [0,0] : center );

  var rot = [ [ cos( PI/2.0), sin(PI/2.0) ], [ - sin(PI/2.0), cos(PI/2.0) ] ];

  range = ( (typeof range === "undefined") ? [-10, 10] : range);

  //var cur_r = 400/4;
  cur_r = ( (typeof radius === "undefined") ? 100 : radius );
  for (ii=0; ii<nControlPoints; ii++) {
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

  for (ii=0; ii<pnt.length; ii++) {
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
  
  var showTangent = true;

  noFill();
  strokeWeight(4);
  //point(200,200);
  for (var ii=0; ii<pnt.length; ii++) {
    var iip = (ii + pnt.length - 1)%(pnt.length);
    bezier(pnt[iip][0], pnt[iip][1],
           tng[iip][1][0], tng[iip][1][1],
           tng[ii][0][0], tng[ii][0][1],
           pnt[ii][0], pnt[ii][1]);
    
    if (showTangent) {
      strokeWeight(1);
      line(pnt[ii][0], pnt[ii][1], tng[ii][0][0], tng[ii][0][1]);
      line(pnt[ii][0], pnt[ii][1], tng[ii][1][0], tng[ii][1][1]);
      strokeWeight(4);
    }
  }

}

function setup() {
  createCanvas(400, 400);
  background(220);

  var nControlPoints = 7;
  var n = 8;
  var pnt = [];
  var tng = [];
  var rads = [];

  var c = [200,200];
  
  var constraint0 = [
    { "index" : 0, "position": [ 300, 200] },
    { "index" : 4, "position": [ 50, 200] }
    
  ];

  var dat0 = oblong_circle_constrained(400/2.5, [-10,10], n, c);
  var dat1 = oblong_circle_constrained(400/6, [-5,5], n, c);

  var inner_cp = 8;
  var inner_count = 8;
  var p0 = dat0.point[0];
  var p1 = dat1.point[0];
  var phase = 0;

  var _f = 4/100;
  var fudge0 = [ _f*(p0[0] - c[0]), _f*(p0[1] - c[1]) ];
  var fudge1 = [ _f*(p1[0] - c[0]), _f*(p1[1] - c[1]) ];
  

  var cns = [
      { "index" : 0, "position": [ dat0.point[0][0] - fudge0[0], dat0.point[0][1] - fudge0[0]] },
      { "index" : int(inner_cp/2), "position": [ dat1.point[0][0] + fudge1[0], dat1.point[0][1]  + fudge1[1]] }
  ];
  var tcent = [ p1[0] + (p0[0] - p1[0])/2, p1[1] + (p0[1] - p1[1])/2 ];
  var _iod0 = oblong_circle_constrained((400/6 - 400/2.5), [-3,3], inner_cp, tcent, cns, phase);
    render_oblong(_iod0);
  
  var prv_left_pnt = _iod0.point[int(inner_cp/4)];
  var prv_tng = _iod0.tangent[int(inner_cp/4)];

  
  for (var ii=1; ii<inner_count; ii++) {
    p0 = dat0.point[ii];
    p1 = dat1.point[ii];
    phase = 2.0*PI*ii/inner_count;
    

    fudge0 = [ _f*(p0[0] - c[0]), _f*(p0[1] - c[1]) ];
    fudge1 = [ _f*(p1[0] - c[0]), _f*(p1[1] - c[1]) ];
    cns = [
      { "index" : 0, "position": [ p0[0] - fudge0[0], p0[1] - fudge0[1]] },
      { "index" : int(inner_cp/2), "position": [ p1[0] + fudge1[0], p1[1] + fudge1[1]] },
      //{ "index" : int(3*inner_cp/4), "position": [ prv_left_pnt[0], prv_left_pnt[1] ] }
      //{ "index" : int(3*inner_cp/4), "position": [ prv_left_pnt[0], prv_left_pnt[1] ],
      //  "tangent" : [ [ prv_tng[0][0], prv_tng[0][1] ],
      //                [ prv_tng[1][0], prv_tng[1][1] ] ] }
      ];
    tcent = [ p1[0] + (p0[0] - p1[0])/2, p1[1] + (p0[1] - p1[1])/2 ];
    _iod0 = oblong_circle_constrained((400/6 - 400/2.5)*(5/8), [-3,3], inner_cp, tcent, cns, phase);
    render_oblong(_iod0)
    //if (ii==1) {render_oblong(_iod0); }
    
    prv_left_pnt = _iod0.point[int(inner_cp/4)];
    prv_tng = _iod0.tangent[int(inner_cp/4)];
  }


  render_oblong(dat0);
  render_oblong(dat1);

}

