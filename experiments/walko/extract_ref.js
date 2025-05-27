
var jimp = require("jimp").Jimp;

let fns = [
  "ref/frame-01.png", "ref/frame-02.png", "ref/frame-03.png",
  "ref/frame-04.png", "ref/frame-05.png", "ref/frame-06.png",
  "ref/frame-07.png", "ref/frame-08.png", "ref/frame-09.png",
  "ref/frame-10.png", "ref/frame-11.png", "ref/frame-12.png"
];

let color_map = {
  "hip_anchor": [ 0, 225, 0 ],
  "right_knee": [0,100,0],
  "right_ankle": [0,90,0],
  "left_knee": [100,0,0],
  "left_ankle": [90, 0, 0]
};

async function main() {

  let frame = [];


  let info = {
    "width": -1,
    "height": -1,
    "frame": []
  };



  for (let frame_idx=0; frame_idx<fns.length; frame_idx++) {

    let cur_info = {"width":-1, "height":-1};

    let color_found_map = {};
    for (let key in color_map) {
      color_found_map[key] = 0;
      cur_info[key] = { "x":-1, "y": -1 };
    }

    frame.push( await jimp.read(fns[frame_idx]) );

    let data = frame[frame_idx].bitmap.data;

    cur_info.width = frame[frame_idx].bitmap.width;
    cur_info.height = frame[frame_idx].bitmap.height;

    for (let i=0; i<data.length; i+=4) {

      let rgba = [ data[i+0], data[i+1], data[i+2], data[i+3] ];

      for (let key in color_found_map) {
        let co = color_map[key];
        if (color_found_map[key]) { continue; }

        //console.log(key, rgba, co);

        if ((rgba[0] == co[0]) && (rgba[1] == co[1]) && (rgba[2] == co[2])) {
          color_found_map[key] = 1;

          let _x = (i/4) % cur_info.width;
          let _y = Math.floor((i/4) / cur_info.width);

          cur_info[key].x = _x;
          cur_info[key].y = cur_info.height - _y;

          //console.log(frame_idx, key, ">>>>", i, _x, _y);
        }
      }
    }

    info.frame.push(cur_info);

  }

  //console.log(frame[0].bitmap.data.length);



  console.log( JSON.stringify(info, undefined, 2) );


}

main();


