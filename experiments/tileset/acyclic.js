// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// output:
// - vexed_twoloop.png
// - twoloop_poms.json
//
//
// Create a local rule tileset that replicates the "Loop Constraint"
// functionality in DeBroglie (https://github.com/BorisTheBrave/DeBroglie/blob/master/docs/articles/path_constraints.md)
// using only nearest neighbor tile rules and tileset.
//


var fs = require("fs");
var jimp = require("jimp");

let STRIDE = [16,16];

var OUT_TILESET_FN = "vexed_acylic.png";
var OUT_POMS_FN = "acyclic_poms.json";

let REL_MAP = {
  "tee_d": [0,0],
  "tee_l": [1,0],
  "tee_r": [0,1],
  "tee_u": [1,1],

  "bend_rd": [2,0],
  "bend_ru": [2,1],
  "bend_lu": [4,2],
  "bend_ld": [4,0],

  "straight_ud": [4,1],
  "straight_lr": [3,2],

  "end_r" : [2,2],
  "end_d" : [1,2],
  "end_l" : [3,1],
  "end_u" : [0,2],

  "cross": [5,0],

  "empty": [5,2]
};


let TILE_ORDER = [
  "empty",
  "end_r", "end_l", "end_u", "end_d",
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr",
  "tee_r", "tee_u", "tee_l", "tee_d",
  "cross"
];

// up is down (for tiled)
//
let RULE_TEMPLATE = {
  "empty": [ ".", ".", ".", "." ],

  "end_r" : [ "o", ".", ".", "." ], "end_l" : [ ".", "o", ".", "." ],
  "end_u" : [ ".", ".", ".", "o" ], "end_d" : [ ".", ".", "o", "." ],

  "bend_rd" : [ "o", ".", "o", "." ], "bend_ru" : [ "o", ".", ".", "o" ],
  "bend_lu" : [ ".", "o", ".", "o" ], "bend_ld" : [ ".", "o", "o", "." ],

  "straight_ud" : [ ".", ".", "o", "o" ], "straight_lr" : [ "o", "o", ".", "." ],

  "tee_r" : [ "o", ".", "o", "o" ], "tee_u" : [ "o", "o", ".", "o" ],
  "tee_l" : [ ".", "o", "o", "o" ], "tee_d" : [ "o", "o", "o", "." ],

  "cross" : [ "o", "o", "o", "o" ]
}

let LEVEL_TEMPLATE = {
  "end_r_p" : [ "p$$", ".", ".", "." ],
  "end_l_p" : [ ".", "p$$", ".", "." ],
  "end_u_p" : [ ".", ".", ".", "p$$" ],
  "end_d_p" : [ ".", ".", "p$$", "." ],

  "end_r_q" : [ "q$$", ".", ".", "." ],
  "end_l_q" : [ ".", "q$$", ".", "." ],
  "end_u_q" : [ ".", ".", ".", "q$$" ],
  "end_d_q" : [ ".", ".", "q$$", "." ],

  "bend_rd_p" : [ "p$$", ".", "q$$", "." ],
  "bend_rd_q" : [ "q$$", ".", "p$$", "." ],

  "bend_ru_p" : [ "p$$", ".", ".", "q$$" ],
  "bend_ru_q" : [ "q$$", ".", ".", "p$$" ],

  "bend_lu_p" : [ ".", "p$$", ".", "q$$" ],
  "bend_lu_q" : [ ".", "q$$", ".", "p$$" ],

  "bend_ld_p" : [ ".", "p$$", "q$$", "." ],
  "bend_ld_q" : [ ".", "q$$", "p$$", "." ],

  "straight_ud_p" : [ ".", ".", "p$$", "q$$" ],
  "straight_ud_q" : [ ".", ".", "q$$", "p$$" ],

  "straight_lr_p" : [ "p$$", "q$$", ".", "." ],
  "straight_lr_q" : [ "q$$", "p$$", ".", "." ]
};


//---
//
// output name:
//
// <type>_<subtype>_[pq](\d+)_D(\d+)
//
// for example:
//
//   bend_rd_q0_D3
//   |    |  |  |
//   |    |  |  .- 4th branch dock
//   |    |  |
//   |    |  .---- p/q parity dock, 0th level
//   |    |
//   |    .------- subtype (right/down)
//   |
//   .------------ type (bend)
//
//
function create_acyclic_level_tiles(template, cur_id, nxt_id) {

  let out = [ ];

  for (let key in template) {

    let _dock = template[key];

    let empty_count = 0;
    let empty_pos = [];

    let tmp_dock = [];
    for (let idir=0; idir<4; idir++) {
      let v = _dock[idir].replace( '$$', cur_id.toString() );
      tmp_dock.push(v);

      if (v == '.') {
        empty_pos.push(idir);
        empty_count++;
      }
    }

    if (nxt_id < 0) {
      let sfx = cur_id.toString() + "_" + "D0";
      out.push({"name": key + sfx, "dock": tmp_dock});
      continue;
    }

    for (bcount=0; bcount < (1<<empty_count); bcount++) {

      let v = [];

      let cur_dock = [];
      for (let _pos=0; _pos<tmp_dock.length; _pos++) {
        cur_dock.push(tmp_dock[_pos]);
      }

      for (let bpos=0; bpos<empty_pos.length; bpos++) {
        let _val = ((bcount & (1<<bpos))  ? 1 : 0);

        if (_val != 0) {
          cur_dock[ empty_pos[bpos] ] = 'p' + nxt_id.toString();
        }
      }

      let sfx = cur_id.toString() + "_" + "D" + bcount;
      out.push({"name": key + sfx, "dock": cur_dock });

    }

  }

  return out;

}

async function _main() {

  let l_list = [];
  let fin_dock = [
    {"name":"0", "dock":["*", "*", "*", "*"], "id":0},
    {"name":"empty", "dock":[".", ".", ".", "."], "id":1}
  ];

  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 0, 1) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 1, 2) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 2, 3) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 3, -1) );

  // flatten/..
  //
  cur_id = fin_dock.length;
  for (let idx=0; idx<l_list.length; idx++) {
    for (let ii=0; ii<l_list[idx].length; ii++) {
      fin_dock.push( l_list[idx][ii] );
      fin_dock[ fin_dock.length-1 ]["id"] = cur_id;
      cur_id++;
    }
  }

  for (let ii=0; ii<fin_dock.length; ii++) {
    console.log(JSON.stringify(fin_dock[ii]));
  }

  let n_tile = fin_dock.length;
  let wh_cell = Math.ceil( Math.sqrt(n_tile) );

  console.log(">>>", wh_cell);

  let src_tileset = await jimp.read("./img/vexed4col_1.png");
  let out_img_tile_size = [wh_cell,wh_cell];
  let _os = out_img_tile_size;
  let out_img = new jimp(_os[0]*STRIDE[0], _os[1]*STRIDE[1]);
  let out_pxy = [0,0];

  let mask_img = [
    await jimp.read("./img/mask_right.png"),
    await jimp.read("./img/mask_left.png"),
    await jimp.read("./img/mask_up.png"),
    await jimp.read("./img/mask_down.png")
  ];


  for (let tile_idx=1; tile_idx<fin_dock.length; tile_idx++) {
    let ele = fin_dock[tile_idx];

    if ( ele.name == "empty" ) {

      let y_off = 3*0;
      let tile_pos = REL_MAP[ele.name];
      let px = STRIDE[0]*tile_pos[0];
      let py = STRIDE[1]*tile_pos[1] + (y_off*STRIDE[1]);

      out_img.blit( src_tileset, out_pxy[0], out_pxy[1], px, py, STRIDE[0], STRIDE[1] );

    }
    else {

      let name_tok = ele.name.split("_");

      let _rm_name = name_tok.slice(0,2).join("_");
      let _lvl = parseInt(name_tok[2].slice(1));

      let y_off = 3*_lvl;
      let tile_pos = REL_MAP[_rm_name];
      let px = STRIDE[0]*tile_pos[0];
      let py = STRIDE[1]*tile_pos[1] + (y_off*STRIDE[1]);

      out_img.blit( src_tileset, out_pxy[0], out_pxy[1], px, py, STRIDE[0], STRIDE[1] );

    }

    out_pxy[0] += STRIDE[0];
    if (out_pxy[0] >= (out_img_tile_size[0]*STRIDE[0])) {
      out_pxy[0]=0;
      out_pxy[1] += STRIDE[1];
    }


  }

  console.log("## writing", OUT_TILESET_FN);
  out_img.write( OUT_TILESET_FN );


  return;

  let full_tilelist = [];

  let tile_group = [ base_tiles, a_tiles, b_tiles, c_tiles ];
  let tile_pfx = [ 'a_', 'b_', 'c_', 'd_' ];
  let tile_base_idx = [0,1,2,3];

  let cur_tile_id = 1;

  for (let group_idx=0; group_idx<tile_pfx.length; group_idx++) {
    let _order = tile_group[group_idx];
    for (let tile_idx=0; tile_idx<_order.length; tile_idx++) {
      let template_name = _order[tile_idx];

      name = tile_pfx[group_idx] + template_name;

      let y_off = tile_base_idx[group_idx];
      let tile_pos = rel_map[template_name];
      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (3*y_off*stride[1]);

      //console.log(template_name, name, px, py, "(", out_pxy, ")");

      out_img.blit(src_tileset, out_pxy[0], out_pxy[1], px, py, stride[0], stride[1]);

      out_pxy[0] += stride[0];
      if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
        out_pxy[0]=0;
        out_pxy[1] += stride[1];
      }


      let dock_template = RULE_TEMPLATE[template_name];
      let tile_dock = [ 0, 0, 0, 0 ];
      for (let idir=0; idir<4; idir++) {
        if      (dock_template[idir] == '.') { tile_dock[idir] = 0; }
        else if (dock_template[idir] == 'o') { tile_dock[idir] = group_idx; }
      }


      full_tilelist.push({"name":name, "dock":tile_dock, "id": cur_tile_id});
      cur_tile_id++;

    }

  }

  //console.log(">>>>", out_pxy);

  let join_buf = new jimp(stride[0], stride[1]);
  let mask_buf = new jimp(stride[0], stride[1]);

  for (let group_idx=0; group_idx<2; group_idx++) {

    let src_group_id = group_idx+1;
    let dst_group_id = 3;

    for (let ii=0; ii<a_tiles.length; ii++) {

      let base_name = a_tiles[ii];

      let y_off = group_idx;
      let tile_pos = rel_map[base_name];
      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (3*y_off*stride[1]);

      let c_y_off = 2;
      let c_tile_pos = rel_map["cross"];
      let c_px = stride[0]*c_tile_pos[0];
      let c_py = stride[1]*c_tile_pos[1] + (3*c_y_off*stride[1]);


      if (!(base_name in gen_info)) { continue; }

      for (let dock_idx=0; dock_idx<gen_info[base_name].length; dock_idx++) {
        let dock = gen_info[base_name][dock_idx];

        let pfx = ((group_idx==0) ? "a_" : "b_");
        let new_tile_name = pfx + base_name + "_c" + dock_idx.toString();

        let src_dock = RULE_TEMPLATE[base_name];

        //console.log(base_name, dock, src_dock, new_tile_name);

        let tile_dock = [ 0, 0, 0, 0 ];

        join_buf.blit( src_tileset, 0, 0, px, py, stride[0], stride[1] );

        for (let idir=0; idir<4; idir++) {

          if      (src_dock[idir] == '.') { tile_dock[idir] = 0; }
          else if (src_dock[idir] == 'o') { tile_dock[idir] = src_group_id; }

          if (dock[idir] == '.') { continue; }

          mask_buf.blit( src_tileset, 0,0, c_px,c_py, stride[0], stride[1] );
          mask_buf.mask( mask_img[idir], 0,0 );
          join_buf.blit( mask_buf, 0, 0 );

          //else if (src_dock[idir] == 'c') { tile_dock[idir] = dst_group_id; }

          //if      (dock[idir] == '.') { tile_dock[idir] = 0; }
          //else if (dock[idir] == 'o') { tile_dock[idir] = src_group_id; }
          if (dock[idir] == 'c') { tile_dock[idir] = dst_group_id; }


        }

        out_img.blit(join_buf, out_pxy[0], out_pxy[1], 0,0, stride[0],stride[1]);

        out_pxy[0] += stride[0];
        if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
          out_pxy[0]=0;
          out_pxy[1] += stride[1];
        }


        full_tilelist.push({"name":new_tile_name, "dock":tile_dock, "id":cur_tile_id});
        cur_tile_id++;

      }

    }

  }

  let rule_list = [];

  let oppo_idir = [1,0, 3,2, 5,4];

  let base_tile_id = 1;
  for (let src_tile_idx=0; src_tile_idx<full_tilelist.length; src_tile_idx++) {

    let _src = full_tilelist[src_tile_idx];
    for (let dst_tile_idx=0; dst_tile_idx<full_tilelist.length; dst_tile_idx++) {

      let _dst = full_tilelist[dst_tile_idx];

      for (let idir=0; idir<4; idir++) {
        let rdir = oppo_idir[idir];

        if (_src.dock[idir] == _dst.dock[rdir]) {
          rule_list.push([ _src.id, _dst.id, idir, 1 ]);
          //rule_list.push([ _dst.id, _src.id, rdir, 1 ]);
        }



      }

      rule_list.push( [_src.id, 0, 4, 1] );
      rule_list.push( [_src.id, 0, 5, 1] );

      rule_list.push( [0, _src.id, 4, 1] );
      rule_list.push( [0, _src.id, 5, 1] );

    }

    for (let idir=0; idir<4; idir++) {
      let rdir = oppo_idir[idir];
      if (_src.dock[idir] == 0) { rule_list.push([ _src.id, 0, idir, 1 ]); }
      if (_src.dock[idir] == 0) { rule_list.push([ 0, _src.id, rdir, 1 ]); }
    }


  }




  let tile_name = [ "." ];
  for (let ii=0; ii<full_tilelist.length; ii++) {
    //console.log("tile[", ii, "]:", JSON.stringify(full_tilelist[ii]));
    tile_name.push( full_tilelist[ii].name );
  }

  out_img.write( OUT_TILESET_FN );

  let _sz = [32,32];

  let empty_tile_id = 1;
  let a_end_r = -1;
  let a_end_u = -1;
  let b_end_d = -1;
  let b_end_l = -1;

  for (let ii=0; ii<full_tilelist.length; ii++) {
    if (full_tilelist[ii].name == "a_end_r") { a_end_r = full_tilelist[ii].id; }
    if (full_tilelist[ii].name == "a_end_u") { a_end_u = full_tilelist[ii].id; }

    if (full_tilelist[ii].name == "b_end_d") { b_end_d = full_tilelist[ii].id; }
    if (full_tilelist[ii].name == "b_end_l") { b_end_l = full_tilelist[ii].id; }
  }

  let remove_name = [
    "a_end_r", "a_end_l", "a_end_u", "a_end_d",
    "b_end_r", "b_end_l", "b_end_u", "b_end_d"
  ];
  let remove_tile_id = [];

  // order matters on constraints
  //
  let _constraint = [];
  for (let ii=0; ii<full_tilelist.length; ii++) {
    for (let jj=0; jj<remove_name.length; jj++) {
      if (full_tilelist[ii].name == remove_name[jj]) {
        remove_tile_id.push( full_tilelist[ii].id );
        let _id = full_tilelist[ii].id;
        _constraint.push({"type":"remove", "range":{"tile":[_id,_id+1], "x":[], "y":[], "z":[] }});
      }
    }

  }

  _constraint.push({"type":"add",  "range":{"tile":[a_end_r,a_end_r+1],"x":[1,2], "y":[0,1], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[a_end_u,a_end_u+1],"x":[-1,0], "y":[-2,-1], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[b_end_d,b_end_d+1],"x":[0,1], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[b_end_l,b_end_l+1],"x":[-2,-1], "y":[-1,0], "z":[0,1]}});

  _constraint.push({"type":"force",  "range":{"tile":[a_end_r,a_end_r+1],"x":[1,2], "y":[0,1], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[a_end_u,a_end_u+1],"x":[-1,0], "y":[-2,-1], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[b_end_d,b_end_d+1],"x":[0,1], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[b_end_l,b_end_l+1],"x":[-2,-1], "y":[-1,0], "z":[0,1]}});

  _constraint.push({"type":"remove", "range":{"tile":[0,1],"x":[], "y":[], "z":[]}});

  let tile_weight = [];
  for (let i=0; i<tile_name.length; i++) {
    tile_weight.push(1);
  }
  tile_weight[1] = 10;


  let poms = {
    "rule": rule_list,
    "name": tile_name,
    "weight" : tile_weight,
    "constraint": _constraint,
    "tileset": {
      "image": OUT_TILESET_FN,
      "tilecount": full_tilelist.length,
      "imagewidth" : stride[0]*out_img_tile_size[0],
      "imageheight" : stride[1]*out_img_tile_size[1],
      "tilewidth": stride[0],
      "tileheight": stride[1]
    },
    "size" :      [_sz[0],_sz[1],1],
    "quiltSize" : [_sz[0],_sz[1],1],
    "boundaryCondition" : {
      "x+":{"type":"tile","value":0}, "x-":{"type":"tile","value":0},
      "y+":{"type":"tile","value":0}, "y-":{"type":"tile","value":0},
      "z+":{"type":"tile","value":0}, "z-":{"type":"tile","value":0}
    }
  };

  fs.writeFileSync( OUT_POMS_FN, JSON.stringify(poms, undefined, 2) );

  return 0;
}

_main();
