
var bez = require("./bez.cjs");
var hob = require("./mp_path.js");

function _bez_example() {
  let b = new bez.Bezier(100,25, 10,90, 110, 100, 160,195);
  //console.log(b);


  let n = 100;
  let lut = b.getLUT(n);
  //console.log(lut);
  for (let i=0; i<lut.length; i++) {
    console.log(lut[i].x, lut[i].y);
  }

}

function _hob_example() {
  let p = [[0, 0], [200, 133], [130, 300], [33, 233], [100, 167]];

  //let knots = hob.makeknots(p,1,false);
  //hob.mp_make_choices(knots[0]);

  let knots = hob.Hobby(p);

  let bez_chain = [];
  for (let i=0; i<(knots.length-1); i++) {

    let _b = new bez.Bezier( knots[i].x_pt, knots[i].y_pt,
                             knots[i].rx_pt, knots[i].ry_pt,
                             knots[i+1].lx_pt, knots[i+1].ly_pt,
                             knots[i+1].x_pt, knots[i+1].y_pt );

    bez_chain.push( _b );
  }

  for (let i=0; i<bez_chain.length; i++) {
    let lut = bez_chain[i].getLUT(16);
    for (let j=0; j<lut.length; j++) {
      console.log(lut[j].x, lut[j].y);
    }
  }

}

function _Bezier(x,y, rx,ry, lx,ly, xn,yn) {
  return new bez.Bezier( x,y,
                         rx,ry,
                         lx,ly,
                         xn,yn );
}

function HobbyLUT(p, seg) {
  seg = ((typeof seg === "undefined") ? 100 : seg);

  let knots = hob.Hobby(p);

  let bez_chain = [];
  for (let i=0; i<(knots.length-1); i++) {
    let _b = new bez.Bezier( knots[i].x_pt, knots[i].y_pt,
                             knots[i].rx_pt, knots[i].ry_pt,
                             knots[i+1].lx_pt, knots[i+1].ly_pt,
                             knots[i+1].x_pt, knots[i+1].y_pt );
    bez_chain.push( _b );
  }

  let out_pnt = [];
  for (let i=0; i<bez_chain.length; i++) {
    let lut = bez_chain[i].getLUT(seg);
    for (let j=0; j<(lut.length-1); j++) {
      out_pnt.push([ lut[j].x, lut[j].y ]);
    }
  }

  return out_pnt;
}

//_hob_example();

if (typeof module !== "undefined") {
  module.exports["HobbyLib"] = hob;
  module.exports["BezierLib"] = bez;

  module.exports["Hobby"] = hob.Hobby;
  module.exports["Bezier"] = _Bezier;

  module.exports["HobbyLUT"] = HobbyLUT;
}


