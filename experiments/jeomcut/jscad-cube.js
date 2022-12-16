// LICENSE: cc0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//
//
const jscad = require('@jscad/modeling')
const io = require("@jscad/io");

const { cube } = jscad.primitives

function triangulate(geom) {
  let vert = [];
  let p = jscad.modifiers.generalize({snap:true, triangulate:true}, geom).polygons;

  for (let i=0; i<p.length; i++) {
    for (let j=0; j<p[i].vertices.length; j++) {
      for (let k=0; k<p[i].vertices[j].length; k++) {
        vert.push(p[i].vertices[j][k]);
      }
    }
  }

  return vert;
}

function vert_to_gnuplot(v) {
  for (let i=0; i<v.length; i+=3) {
    if ((i%9)==0) { console.log("\n"); }
    console.log(v[i+0], v[i+1], v[i+2]); 
  }
}

function export_cube_example() {
  let c = cube({size:1});

  for (let i_p=0; i_p<c.polygons.length; i_p++) {
    for (let i_v=0; i_v<c.polygons[i_p].vertices.length; i_v++) {
      let v = c.polygons[i_p].vertices[i_v];
      console.log("{", i_p, i_v, "}", v.join(" "));
    }
  }

  let obj_txt_out = io.objSerializer.serialize({}, c);
  console.log(obj_txt_out.join("\n"));
}


//export_cube_example();
let v = triangulate(cube({size:1}));
vert_to_gnuplot(v);

//----

function main () {
  return cube({ size: 1 })
}
module.exports = { main }
