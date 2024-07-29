
var fs = require("fs");
var jimp = require("jimp");

var wang_3edge_map = [
  24, 78, 75, 51, 72, 21, 48, 45, 18,
  26, 80, 77, 53, 74, 23, 50, 47, 20,
  17, 71, 68, 44, 65, 14, 41, 38, 11,
  25, 79, 76, 52, 73, 22, 49, 46, 19,
   8, 62, 59, 35, 56,  5, 32, 29, 2,
  15, 69, 66, 42, 63, 12, 39, 36, 9,
  16, 70, 67, 43, 64, 13, 40, 37, 10,
   7, 61, 58, 34, 55,  4, 31, 28, 1,
   6, 60, 57, 33, 54,  3, 30, 27, 0
];

async function _main() {
  let img_px = await jimp.read("./img/purple_x.png");

  let mask_img = [
    await jimp.read("./img/mask_right.png"),
    await jimp.read("./img/mask_left.png"),
    await jimp.read("./img/mask_up.png"),
    await jimp.read("./img/mask_down.png")
  ];

  //console.log(img_px);
  //console.log(mask_img)

  let xx  = img_px.mask( mask_img[0], 0, 0 );

  console.log(">>>", xx);

  xx.write("out.png");


  return;
}

_main();


function fuckyou() {

  let basepos_idir = [ 2, 0, 3, 1 ];

  let path_a = [ 1,3,9,27, 12,36,28,4 ];

  // up
  // right
  // down
  // left
  //
  function base3edge(edge, n) {

    let base = [27, 9, 3, 1];

    edge[0] = 0;
    edge[1] = 0;
    edge[2] = 0;
    edge[3] = 0;


    for (let i=0; i<base.length; i++) {
      let q = Math.floor(n/base[i]);
      edge[ base.length-i-1 ] = q;
      n -= q*base[i];
    }

    return edge;

  }

  let _e = [0,0,0,0];
  console.log( 35, base3edge(_e, 35) );
  console.log( 9, base3edge(_e, 9) );
  console.log( 0, base3edge(_e, 0) );
  console.log( 70, base3edge(_e, 70) );

  // rotations are counterclockwise
  //
  //
  //
  var _info = {
    "stride": [32,32],
    "dim": [9,9],

    "tile" : {
      "." : [8,8],

      "end_a_0" : [5,8],
      "end_a_1" : [8,7],
      "end_a_2" : [7,8],
      "end_a_3" : [7,8],

      "bend_a_0": [5,7],
      "bend_a_1": [7,7],
      "bend_a_2": [7,5],
      "bend_a_3": [5,5],

      "path_a_0": [7,5],
      "path_a_1": [5,7],


      "end_b_0" : [0,8],
      "end_b_1" : [8,4],
      "end_b_2" : [8,4],
      "end_b_3" : [8,0],

      "bend_b_0": [0,4],
      "bend_b_1": [4,0],
      "bend_b_2": [0,0],
      "bend_b_3": [4,4],

      "path_b_0": [8,1],
      "path_b_1": [1,8],




      "beg_ab_0": [5,4],
      "beg_ab_1": [4,5]

    }
  };

}
