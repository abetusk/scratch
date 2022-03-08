
var bez = require("bezier-js");
var opentype = require("opentype.js");
var svgpoints = require("./svg-points.min.js");
var points = require("points");

console.log(svgpoints);
console.log(points);

/*
//let shape = { type: 'path', d: 'M20,20h50v20A2,2,0,0,1,80,35L90,30H50V50a5,5,45,1,0-5-10l-5-10Z' };
let shape = {"type":"path", "d":"M1227 614q-40 -17 -60 -45t-29.5 -61.5t-12.5 -71t-9 -73t-20 -67.5t-45 -56q-11 -4 -18 -0.5t-13 9.5l-12 12t-15 7q-11 -59 -13.5 -121t-4 -123.5t-7.5 -122t-24 -116.5q-15 -9 -26 -6.5t-20 10.5t-17 19t-17 20q-8 80 -9.5 159t-6.5 160q-21 24 -30.5 51.5t-13 56 t-5.5 57t-8.5 55t-20 49.5t-41.5 41q-30 -14 -47 -10.5t-27 17t-15.5 32t-12.5 33.5t-18 22t-31 -2q-38 -32 -55.5 -71t-25 -81t-11.5 -86t-15 -86q-10 -5 -19 -10t-18 -8t-18.5 -3t-20.5 5q-10 8 -18.5 19.5t-15 25.5t-11 29t-8.5 28q-22 -18 -31 -40.5t-12 -47t-1.5 -50 t-0.5 -51t-9 -49t-26 -44.5q-33 15 -52 41t-29 58.5t-13.5 69.5t-6.5 75t-7.5 74.5t-16.5 68.5q-10 29 -29.5 47t-40.5 34.5t-39.5 35.5t-27.5 49q34 40 66.5 80.5t67 80t72 77t79.5 71.5q-30 38 -63.5 73.5t-68.5 69t-70 66.5t-69 67q57 78 127 151.5t146 141.5 q38 9 59.5 -3.5t37 -33t29.5 -42.5t36 -31q14 -27 35 -47t45.5 -35.5t50.5 -26.5t49 -20q34 32 65.5 73t64.5 76.5t70 60t82 23.5q79 -68 141 -137t117 -150q-16 -38 -45.5 -64.5t-62.5 -50t-65.5 -47.5t-55.5 -57q34 -43 71.5 -83.5l75 -81t73.5 -82.5t67 -87Z" };
let x = svgpoints.toPoints(shape);
console.log(x);
*/

function loadsync() {
  let font = opentype.loadSync("./ROCKYAOE.ttf");
  let glyphs = font.glyphs.glyphs;
  for (let g in glyphs) {
    let p = glyphs[g].getPath(0,0, 12);
    let pdata = p.toPathData(3);
    let svgdata = p.toSVG(3);

    //console.log("pdata>>", pdata);
    //console.log("svgdata>>", svgdata);
    //console.log(">>>", g, glyphs[g]);
  }

}

function _load() {
  opentype.load("./ROCKYAOE.ttf", function(err, font) {
    if (err) {
      console.log("error", err);
    }
    else {
      let glyphs = font.glyphs.glyphs;
      for (let g in glyphs) {

        //console.log(glyphs[g].path);
        //continue;

        let p = glyphs[g].getPath(0,0, 12);
        let pdata = p.toPathData(3);
        let svgdata = p.toSVG(3);

        if (pdata.length == 0) { continue; }

        //console.log(pdata);
        let shape = { "type":"path", "d":pdata.toString()};
        //console.log(shape);
        let pnts_ = svgpoints.toPoints(shape);
        let pnts = points.cubify(pnts_);

        //let curv = new bez.Bezier(from_x,from_y, from_ctl_x,from_ctl_y, to_ctl_x,to_ctl_y, to_x,to_y);

        let prevx = 0, prevy = 0;
        for (let idx in pnts) {
          let pnt = pnts[idx];

          if (("moveTo" in pnt) && (pnt.moveTo)) {
            prevx = pnt.x;
            prevy = pnt.y;
            continue;
          }

          let x = pnt.x;
          let y = pnt.y;

          if (!("type" in pnt)) {
            //dd
          }

          console.log(pnt)
        }
        //console.log(pnts);
        console.log();

        //console.log("pdata>>", pdata);
        //console.log("svgdata>>", svgdata);
        //console.log(">>>", g, glyphs[g]);
      }
    }
  });
}

_load();
