//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//    
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

"use strict";


// buf          - array and backbuffer of message values
// cell_tile_n  - number of tiles at cell position
// cell_tile    - list of itles at cell position
// tile_id      - integer code to name of tile mapping
// pdf          - probability distribution function of tiless
// dxyz         - mapping of integer code to delta change
// dxyz_inv     - inverse mapping of dxyz
// dxyz_inv_idx - inverse index of dxyz
// Fs           - adjacency function for tiles for each direction
//
// eps          - local epsilon for floating point fomparison
// FM[XYZ]      - size of dimension [xyz]
// tilesize     - number of tile options
// step_n       - number of buffers (2)
// step_idx     - which time step of step_n are we in
// D            - spatial dimension (3)
// n            - total size of `buf`
// STRIDE[0-5]  - stride variables for accessing `buf`
//
//
function BeliefPropagationCollapse(data, x, width, height, depth, opt) {
  width = ((typeof width === "undefined") ? 8 : width);
  height = ((typeof height === "undefined") ? 8 : height);
  depth = ((typeof depth === "undefined") ? 8 : depth);

  this.data = data;

  this.tile_name = data.tile_name;
  this.tile_id = {};
  for (let ii=0; ii<this.tile_name.length; ii++) {
    this.tile_id[ii] = this.tile_name[ii];
  }

  this.eps = (1/(1024*1024));
  this.max_iter = 1000;

  this.FMX = width;
  this.FMY = height;
  this.FMZ = depth;

  this.FMXxFMYxFMZ = width*height*depth;
  this.tilesize = this.tile_name.length;
  this.step_n = 2;
  this.D = 3;

  this.step_idx = 0;

  this.n = this.step_n*this.FMX*this.FMY*this.FMZ*2*this.D*this.tilesize;

  this.STRIDE0 = this.step_n*this.FMZ*this.FMY*this.FMX*2*this.D*this.tilesize;
  this.STRIDE1 = this.FMZ*this.FMY*this.FMX*2*this.D*this.tilesize;
  this.STRIDE2 = this.FMY*this.FMX*2*this.D*this.tilesize;
  this.STRIDE3 = this.FMX*2*this.D*this.tilesize;
  this.STRIDE4 = 2*this.D*this.tilesize;
  this.STRIDE5 = this.tilesize;

  //this.pdf = data.pdf;
  this.pdf = new Array(this.tilesize);
  for (let ii=0; ii<this.pdf.length; ii++) {
    this.pdf[ii] = 1/this.pdf.length;
  }

  this.buf = new Array(this.n);

  this.dxyz = [
    [-1, 0, 0 ], [ 1, 0, 0],
    [ 0,-1, 0 ], [ 0, 1, 0],
    [ 0, 0,-1 ], [ 0, 0, 1]
  ];

  this.dxyz_inv_idx = [ 1, 0, 3, 2, 5, 4 ];

  this.dxyz_inv = [
    [ 1, 0, 0 ], [-1, 0, 0],
    [ 0, 1, 0 ], [ 0,-1, 0],
    [ 0, 0, 1 ], [ 0, 0,-1]
  ];

  //--

  this.CELL_STRIDE_N0 = this.FMZ*this.FMY*this.FMX;
  this.CELL_STRIDE_N1 = this.FMY*this.FMX;
  this.CELL_STRIDE_N2 = this.FMX;

  this.CELL_STRIDE0 = this.FMZ*this.FMY*this.FMX*this.tilesize;
  this.CELL_STRIDE1 = this.FMY*this.FMX*this.tilesize;
  this.CELL_STRIDE2 = this.FMX*this.tilesize;
  this.CELL_STRIDE3 = this.tilesize;

  this.cell_tile_n = new Array(this.FMZ*this.FMY*this.FMX);
  for (let ii=0; ii<this.cell_tile_n.length; ii++) {
    this.cell_tile_n[ii] = this.tilesize;
  }

  this.cell_tile = new Array(this.FMZ*this.FMY*this.FMX*this.tilesize);
  for (let z=0; z<this.FMZ; z++) {
    for (let y=0; y<this.FMY; y++) {
      for (let x=0; x<this.FMX; x++) {
        for (let b=0; b<this.tilesize; b++) {
          let idx = z*this.CELL_STRIDE1 +
                    y*this.CELL_STRIDE2 +
                    x*this.CELL_STRIDE3 +
                    b;
          this.cell_tile[idx] = b;
        }
      }
    }
  }

  //--

  this.F = new Array( this.tilesize*this.tilesize );
  this.F_STRIDE0 = this.tilesize*this.tilesize;
  this.F_STRIDE1 = this.tilesize;
  for (let a=0; a<this.tilesize; a++) {
    for (let b=0; b<this.tilesize; b++) {
      this.F[ a*this.tilesize + b ]=0;
    }
  }

  //--

  this.Fs = new Array( this.tilesize*this.tilesize*this.D*2 );
  this.FS_STRIDE0 = 2*this.D*this.tilesize*this.tilesize;
  this.FS_STRIDE1 = this.tilesize*this.tilesize;
  this.FS_STRIDE2 = this.tilesize;

  let fs_stride0 = this.tilesize*this.tilesize*this.D*2 ;
  for (let sdir=0; sdir<this.dxyz.length; sdir++) {
    for (let a=0; a<this.tilesize; a++) {
      for (let b=0; b<this.tilesize; b++) {
        let dv_key = this.dxyz[sdir].join(":");
        this.Fs[ sdir*this.FS_STRIDE1 + a*this.FS_STRIDE2 + b ] = data.F[dv_key][a][b];
      }
    }

  }

  for (let ii=0; ii<this.n; ii++) { this.buf[ii] = Math.random(); }

  this.opt = {
    "periodic" : "z"
  };


  this.h_v = new Array(this.tilesize);
  this.mu_v = new Array(this.tilesize);
  this.u_v = [];

  this.svd = {};
  this.SVs = [];
  this.Us = [];

  // NOT WORKING
  //
  if (typeof numeric !== "undefined") {

    let testA = [];
    
    for (let sdir=0; sdir<this.dxyz.length; sdir++) {

      let dv_key = this.dxyz[sdir].join(":");

      let _F = data.F[dv_key];

      for (let ii=0; ii<_F.length; ii++) { testA.push(_F[ii]); }

      let svd = numeric.svd( _F );

      let _SVt = [];
      let _U = [];

      let Vt = numeric.transpose(svd.V);
      let S = [];
      let nz_count = 0;

      for (let ii=0; ii<svd.S.length; ii++) {
        S.push([]);
        for (let jj=0; jj<svd.S.length; jj++) {
          S[ii].push( (ii==jj) ? svd.S[ii] : 0 );
        }
        if (Math.abs(svd.S[ii]) > this.eps) { nz_count++; }
      }

      let SVt_all = numeric.dot(S, numeric.transpose(svd.V));

      for (let ii=0; ii<nz_count; ii++) { _SVt.push(SVt_all[ii]); }

      for (let ii=0; ii<svd.U.length; ii++) {
        _U.push([]);
        for (let jj=0; jj<nz_count; jj++) {
          _U[ii].push( svd.U[ii][jj] );
        }
      }


      console.log("s:", sdir, "nz_count:", nz_count, "/", _F.length, _F[0].length);

      this.SVs.push(_SVt);
      this.Us.push(_U);

      let max_d = -1;
      let checkM = numeric.dot(this.Us[sdir], this.SVs[sdir]);
      for (let ii=0; ii<checkM.length; ii++) {
        for (let jj=0; jj<checkM[ii].length; jj++) {
          let d = Math.abs( checkM[ii][jj] - _F[ii][jj]);
          if (max_d < d) { max_d = d; }
        }
      }
      console.log("GOT: s:", sdir, ", max_d:", max_d);

      this.u_v = new Array(nz_count);

      console.log("this.SVs[", this.SVs[0].length, this.SVs[0][0].length, "], this.Us[", this.Us[0].length, this.Us[0][0].length, ")");
    }

    let test_nz_count=0;
    let test_svd = numeric.svd( testA );
    for (let ii=0; ii<test_svd.S.length; ii++) {
      if (Math.abs(test_svd.S[ii]) > this.eps) { test_nz_count++; }
    }
    console.log("test_nz_count:", test_nz_count, "/", testA.length);



  }

  return this;
}

BeliefPropagationCollapse.prototype.uMv = function(u,M,v) {
  let a,b, n,m;

  n = M.length;
  m = v.length;

  for (a=0; a<n; a++) {
    u[a] = 0;
    for (b=0; b<m; b++) {
      u[a] += M[a][b]*v[b];
    }
  }


}

// u = Fs[s] . v
//
BeliefPropagationCollapse.prototype.Fs_dot_v = function(u,s,v) {
  let a,b,n;

  n = this.tilesize;
  for (a=0; a<n; a++) {
    u[a] = 0;
    for (b=0; b<n; b++) {
      u[a] += this.Fs[s*this.FS_STRIDE1 + a*this.FS_STRIDE2 + b] * v[b];
    }
  }

}

BeliefPropagationCollapse.prototype.idx = function(t,x,y,z,b,s) {
  return this.STRIDE1*t +
         this.STRIDE2*z +
         this.STRIDE3*y +
         this.STRIDE4*x +
         this.STRIDE5*s +
         b;
}

// considering msg^t_{i,j}(b)
//
// Return current value of incoming message to node j (x+dx,y+dy,z+dz)
// from node i (x,y,z) for tile value b at timestep t.
//
BeliefPropagationCollapse.prototype.msg_ij = function(t,x,y,z, dx,dy,dz, b) {
  let s = 0;
  if      (dx >  0.5) { s = 1; }
  else if (dy < -0.5) { s = 2; }
  else if (dy >  0.5) { s = 3; }
  else if (dz < -0.5) { s = 4; }
  else if (dz >  0.5) { s = 5; }

  let idx = this.idx(t,x,y,z,b,s);
  return this.buf[idx];
}

BeliefPropagationCollapse.prototype.f = function(a,b) {
  return this.F[ this.F_STRIDE1*a + b ];
}

BeliefPropagationCollapse.prototype.f_s = function(sdir,a,b) {
  return this.Fs[ this.FS_STRIDE1*sdir + this.FS_STRIDE2*a + b ];
}

//BeliefPropagationCollapse.prototype.pdf = function(b) { return this.pdf[b]; }

BeliefPropagationCollapse.prototype.msg = function(t,x,y,z, dx,dy,dz, b) {
  return this.msg_ij(t,x,y,z,dx,dy,dz,b);
}


BeliefPropagationCollapse.prototype.oob = function(x,y,z) {
  if ( (x<0) || (x>=this.FMX) ||
       (y<0) || (y>=this.FMY) ||
       (z<0) || (z>=this.FMZ)) { return true; }
  return false;
}

BeliefPropagationCollapse.prototype.pos_n = function(vxyz, x,y,z) {
  vxyz[0] = x;
  vxyz[1] = y;
  vxyz[2] = z;
}

BeliefPropagationCollapse.prototype.pos_z = function(vxyz, x,y,z) {
  vxyz[0] = x;
  vxyz[1] = y;
  vxyz[2] = z % this.FMZ;
}

BeliefPropagationCollapse.prototype.pos = function(vxyz, x,y,z) {
  return this.pos_n(vxyz,x,y,z);
}


BeliefPropagationCollapse.prototype.renormalize_x = function(t_cur) {
  t_cur = ((typeof t_cur === "undefined") ? this.step_idx : t_cur);

  let anch_z=0,
      anch_y=0,
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let S = 0,
      Sinv = 0,
      idx=0;

  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          S=0;
          for (anch_b=0; anch_b<this.tilesize; anch_b++) {
            idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);
            S += this.buf[idx];
          }

          Sinv = ((S<this.eps) ? 0 : (1/S));

          for (anch_b=0; anch_b<this.tilesize; anch_b++) {
            idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);
            this.buf[idx] *= Sinv;
          }

        }
      }
    }
  }

}

BeliefPropagationCollapse.prototype.renormalize = function(t_cur) {
  t_cur = ((typeof t_cur === "undefined") ? this.step_idx : t_cur);

  let anch_z=0,
      anch_y=0,
      anch_x=0,
      anch_b=0, anch_b_idx=0,
      anch_s=0;
  let S = 0,
      Sinv = 0,
      idx=0;

  let ntile = 0;

  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          ntile = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];

          S=0;
          for (anch_b_idx=0; anch_b_idx<ntile; anch_b_idx++) {
            anch_b = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
            idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);
            S += this.buf[idx];
          }

          Sinv = ((S<this.eps) ? 0 : (1/S));

          for (anch_b_idx=0; anch_b_idx<ntile; anch_b_idx++) {
            anch_b = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
            idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);
            this.buf[idx] *= Sinv;
          }

        }
      }
    }
  }

}

BeliefPropagationCollapse.prototype.maxdiff_naive = function(t_cur, t_nxt) {
  t_cur = ((typeof t_cur === "undefined") ? this.step_idx : t_cur);
  t_nxt = ((typeof t_nxt === "undefined") ? (1-t_cur) : t_nxt);

  let anch_z=0,
      anch_y=0,
      anch_x=0,
      anch_b_val=0,
      anch_b_idx=0,
      anch_b=0,
      anch_s=0,
      anch_cell_tile_n=0,
      anch_idx=0;
  let maxdiff=-1,
      d = 0,
      cur_idx=0,
      nxt_idx=0;

  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          for (anch_b=0; anch_b<this.tilesize; anch_b++) {
            cur_idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);
            nxt_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b, anch_s);
            d = Math.abs(this.buf[cur_idx] - this.buf[nxt_idx])
            if (maxdiff < d) { maxdiff = d; }
          }

        }
      }
    }
  }

  return maxdiff;
}

BeliefPropagationCollapse.prototype.maxdiff = function(t_cur, t_nxt) {
  t_cur = ((typeof t_cur === "undefined") ? this.step_idx : t_cur);
  t_nxt = ((typeof t_nxt === "undefined") ? (1-t_cur) : t_nxt);

  let anch_z=0,
      anch_y=0,
      anch_x=0,
      anch_b_val=0,
      anch_b_idx=0,
      anch_b=0,
      anch_s=0,
      anch_cell_tile_n=0,
      anch_idx=0;
  let maxdiff=-1,
      d = 0,
      cur_idx=0,
      nxt_idx=0;

  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        for (anch_b_idx=0; anch_b_idx<anch_cell_tile_n; anch_b_idx++) {

          anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
          for (anch_s=0; anch_s<(2*this.D); anch_s++) {
            anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);

            cur_idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            nxt_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            d = Math.abs(this.buf[cur_idx] - this.buf[nxt_idx])
            if (maxdiff < d) { maxdiff = d; }

          }

        }

      }
    }
  }

  return maxdiff;
}


BeliefPropagationCollapse.prototype.clear = function(t) {
  t = ((typeof t === "undefined") ? this.step_idx : t);

  let anch_z=0,
      anch_y=0, 
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let anch_idx=0;

  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {
          for (anch_b=0; anch_b<this.tilesize; anch_b++) {
            anch_idx = this.idx(t, anch_x, anch_y, anch_z, anch_b, anch_s);
            this.buf[anch_idx] = 0;
          }
        }
      }
    }
  }

}

BeliefPropagationCollapse.prototype.bp_step_naive_x = function() {
  let t_cur = this.step_idx;
  let t_nxt = 1-this.step_idx;

  let iter=0;
  let anch_z=0,
      anch_y=0, 
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let nei_z=0,
      nei_y=0,
      nei_x=0,
      nei_a=0,
      nei_s=0;

  let nei_v = [0,0,0];
  let dv = this.dxyz;

  let anch_idx = 0,
      anch_s_inv = 0,
      nxt_anch_idx = 0;
  let nei_idx=0,
      nei_k_v=[0,0,0];

  let mu_ij_b = 0,
      P_mu_kj_a=1;

  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {
          for (anch_b=0; anch_b<this.tilesize; anch_b++) {
            anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b, anch_s);
            this.buf[anch_idx] = 1;
          }
        }
      }
    }
  }

  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {
        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          this.pos(nei_v, anch_x+dv[anch_s][0], anch_y+dv[anch_s][1], anch_z+dv[anch_s][2]);

          //if (nei_v.join(":") == "1:0:0") { console.log("FUCK YOU"); }

          let _x = anch_x + dv[anch_s][0],
              _y = anch_y + dv[anch_s][1],
              _z = anch_z + dv[anch_s][2];

          //console.log("anch (", anch_x, anch_y, anch_z, ") dv[", anch_s, "](", dv[anch_s].join(":"), ") -> nei(", nei_v[0], nei_v[1], nei_v[2], ")");

          if (this.oob(nei_v[0], nei_v[1], nei_v[2])) {
            for (let ii=0; ii<this.tilesize; ii++) {
              this.buf[ this.idx(t_nxt, anch_x,anch_y,anch_z, ii, anch_s) ] = this.f_s(anch_s, ii, 0);

              //console.log("setting", anch_x, anch_y, anch_z, "(", this.tile_id[ii], ") (", nei_v.join(":"), ") =", this.f_s(anch_s, ii, 0));
            }
            continue;
          }

          //if (nei_v.join(":") == "1:0:0") { console.log("FUCK YOU 1"); }


          anch_s_inv = this.dxyz_inv_idx[anch_s];
          for (anch_b=0; anch_b<this.tilesize; anch_b++) {

            anch_idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b, anch_s);

            mu_ij_b = 0;
            for (nei_a=0; nei_a<this.tilesize; nei_a++) {

              P_mu_kj_a = 1.0;
              P_mu_kj_a *= this.f_s(anch_s, anch_b, nei_a);
              P_mu_kj_a *= this.pdf[nei_a];

          //if (nei_v.join(":") == "1:0:0") { console.log("FUCK YOU 2"); }

              //DEBUG
              //console.log(anch_x,anch_y,anch_z,anch_s,anch_b, "P_mu_kj_a", P_mu_kj_a);

              for (nei_s=0; nei_s<(2*this.D); nei_s++) {
                if (nei_s == anch_s_inv) { continue; }

                this.pos(nei_k_v, nei_v[0]+dv[nei_s][0], nei_v[1]+dv[nei_s][1], nei_v[2]+dv[nei_s][2]);

                //if (nei_v.join(":") == "1:0:0") { console.log("FUCK YOU 3", nei_k_v.join(":")); }


                if (this.oob(nei_k_v[0], nei_k_v[1], nei_k_v[2])) {


                  //if ((nei_v.join(":") == "1:0:0") && (nei_a == 1)) { console.log("FFUFU;ADFUIOJL;KsdgUHAJKLPWDGH K;", this.f_s(nei_s, nei_a, 0)); }

                  P_mu_kj_a *= this.f_s(nei_s, nei_a, 0);

                  continue;
                }

                nei_idx = this.idx(t_cur, nei_v[0], nei_v[1], nei_v[2], nei_a, nei_s);

                P_mu_kj_a *= this.buf[nei_idx];

                //DEBUG
                //console.log("nei_idx:", nei_idx, "(", nei_v.join(","), ")", "->", "P_mu_kj_a", P_mu_kj_a);
              }

              mu_ij_b += P_mu_kj_a;
            }

            nxt_anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b, anch_s);

            //DEBUG
            //console.log("nxt", nxt_anch_idx, "<==", mu_ij_b);

            this.buf[nxt_anch_idx] = mu_ij_b;


          }
        }
      }
    }
  }

  //console.log("BEFORE");
  //this.debug_print(t_nxt);


  this.renormalize_x(t_nxt);

  //console.log("AFTER");
  //this.debug_print(t_nxt);
  //console.log("---");

  return this.maxdiff(t_cur, t_nxt);

}

BeliefPropagationCollapse.prototype.bp_step_naive = function() {
  let t_cur = this.step_idx;
  let t_nxt = 1-this.step_idx;

  let iter=0;
  let anch_z=0,
      anch_y=0, 
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let nei_s=0;

  let anch_v = [0,0,0];
  let nei_v = [0,0,0];
  let dv = this.dxyz;

  let anch_idx = 0,
      anch_s_inv = 0,
      nxt_anch_idx = 0;
  let nei_idx=0,
      nei_k_v=[0,0,0];

  let mu_ij_b = 0,
      P_mu_kj_a=1;

  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        for (let anch_b_idx=0; anch_b_idx<anch_cell_tile_n; anch_b_idx++) {

          let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
          for (anch_s=0; anch_s<(2*this.D); anch_s++) {
            anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[anch_idx] = 1;
          }

        }

      }
    }
  }

  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        anch_v[0] = anch_x;
        anch_v[1] = anch_y;
        anch_v[2] = anch_z;


        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        if (anch_cell_tile_n<=1) {

          //DEBUG
          console.log("anchor tile", anch_x, anch_y, anch_z, "(", anch_cell_tile_n, ") ...  skipping");

          continue;
        }


        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          this.pos(nei_v, anch_x+dv[anch_s][0], anch_y+dv[anch_s][1], anch_z+dv[anch_s][2]);
          if (this.oob(nei_v[0], nei_v[1], nei_v[2])) {

            //DEBUG
            //console.log("  oob neighbor tile", nei_v[0], nei_v[1], nei_v[2], "... skipping");

            continue;
          }

          //DEBUG
          console.log("anchor", anch_x, anch_y, anch_z, "s" + anch_s.toString(), "(dv:", dv[anch_s], ")", "(n:", anch_cell_tile_n, ")");

          anch_s_inv = this.dxyz_inv_idx[anch_s];

          for (let anch_b_idx=0; anch_b_idx < anch_cell_tile_n; anch_b_idx++) {
            let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];

            //DEBUG
            console.log("  anch[", anch_x, anch_y, anch_z, "]:", "b:", anch_b_val, this.tile_id[anch_b_val], "(bidx:", anch_b_idx,")");

            //anch_idx = this.idx(t_cur, anch_x, anch_y, anch_z, anch_b_val, anch_s);

            mu_ij_b = 0;

            let nei_cell_tile_n = this.cell_tile_n[ nei_v[2]*this.CELL_STRIDE_N1 + nei_v[1]*this.CELL_STRIDE_N2 + nei_v[0]];
            if (nei_cell_tile_n<=1) { continue; }
            for (let nei_a_idx=0; nei_a_idx < nei_cell_tile_n; nei_a_idx++) {
              let nei_a_val = this.cell_tile[ nei_v[2]*this.CELL_STRIDE1 + nei_v[1]*this.CELL_STRIDE2 + nei_v[0]*this.CELL_STRIDE3 + nei_a_idx ];

              P_mu_kj_a = 1.0;
              P_mu_kj_a *= this.f_s(anch_s, anch_b_val, nei_a_val);
              P_mu_kj_a *= this.pdf[nei_a_val];

              //DEBUG
              console.log("   g(nei:" + this.tile_name[nei_a_val] +")",
                "f_s(s" + anch_s.toString() + ",anch:" + this.tile_name[anch_b_val] + ",nei:" + this.tile_name[nei_a_val] +") =",
                this.f_s(anch_s, anch_b_val, nei_a_val), this.pdf[nei_a_val] );

              for (nei_s=0; nei_s<(2*this.D); nei_s++) {
                if (nei_s == anch_s_inv) { continue; }

                this.pos(nei_k_v, nei_v[0]+dv[nei_s][0], nei_v[1]+dv[nei_s][1], nei_v[2]+dv[nei_s][2]);
                if (this.oob(nei_k_v[0], nei_k_v[1], nei_k_v[2])) { continue; }

                nei_idx = this.idx(t_cur, nei_v[0], nei_v[1], nei_v[2], nei_a_val, nei_s);
                P_mu_kj_a *= this.buf[nei_idx];

                //XXX
                //DEBUG
                console.log("    mu_{[" + nei_k_v.toString() + "],[" + nei_v.toString() + "]}(" + this.tile_name[nei_a_val] +") =",
                  this.buf[nei_idx], "(t_cur:", t_cur, ", t_nxt:", t_nxt, ")");
              }

              mu_ij_b += P_mu_kj_a;
            }

            //DEBUG
            console.log(" mu_{[", nei_v.join(","), "],[", anch_v.join(","), "]}(", this.tile_name[anch_b_val], ") =", mu_ij_b);
            console.log("");

            nxt_anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[nxt_anch_idx] = mu_ij_b;
          }
        }
      }
    }
  }

  this.renormalize(t_nxt);

  return this.maxdiff(t_cur, t_nxt);
}

BeliefPropagationCollapse.prototype.bp_step_mat = function() {
  let t_cur = this.step_idx;
  let t_nxt = 1-this.step_idx;

  let iter=0;
  let anch_z=0,
      anch_y=0, 
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let nei_s=0;

  let anch_v = [0,0,0];
  let nei_v = [0,0,0];
  let dv = this.dxyz;

  let anch_idx = 0,
      anch_s_inv = 0,
      nxt_anch_idx = 0;
  let nei_idx=0,
      nei_k_v=[0,0,0];

  let mu_ij_b = 0,
      P_mu_kj_a=1,
      h_ij_a = 1;


  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        for (let anch_b_idx=0; anch_b_idx<anch_cell_tile_n; anch_b_idx++) {

          let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
          for (anch_s=0; anch_s<(2*this.D); anch_s++) {
            anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[anch_idx] = 1;
          }

        }

      }
    }
  }


  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        anch_v[0] = anch_x;
        anch_v[1] = anch_y;
        anch_v[2] = anch_z;

        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        if (anch_cell_tile_n<=1) {

          //DEBUG
          console.log("anchor tile", anch_x, anch_y, anch_z, "(", anch_cell_tile_n, ") ...  skipping");

          continue;
        }

        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          this.pos(nei_v, anch_x+dv[anch_s][0], anch_y+dv[anch_s][1], anch_z+dv[anch_s][2]);
          if (this.oob(nei_v[0], nei_v[1], nei_v[2])) { continue; }

          //DEBUG
          console.log("anchor", anch_x, anch_y, anch_z, "s" + anch_s.toString(), "(dv:", dv[anch_s], ")", "(n:", anch_cell_tile_n, ")");

          anch_s_inv = this.dxyz_inv_idx[anch_s];

          // init our h^t_{i,j}(a) vector
          //
          for (let ii=0; ii<this.h_v.length; ii++) { this.h_v[ii] = 0; }

          // fill in h_v vector
          //
          let nei_cell_tile_n = this.cell_tile_n[ nei_v[2]*this.CELL_STRIDE_N1 + nei_v[1]*this.CELL_STRIDE_N2 + nei_v[0]];
          if (nei_cell_tile_n<=1) { continue; }
          for (let nei_a_idx=0; nei_a_idx < nei_cell_tile_n; nei_a_idx++) {
            let nei_a_val = this.cell_tile[ nei_v[2]*this.CELL_STRIDE1 + nei_v[1]*this.CELL_STRIDE2 + nei_v[0]*this.CELL_STRIDE3 + nei_a_idx ];

            this.h_v[nei_a_val] = this.pdf[nei_a_val];

            for (nei_s=0; nei_s<(2*this.D); nei_s++) {
              if (nei_s == anch_s_inv) { continue; }
              nei_idx = this.idx(t_cur, nei_v[0], nei_v[1], nei_v[2], nei_a_val, nei_s);
              this.h_v[nei_a_val] *= this.buf[nei_idx];
            }

          }

          // Custom function to do the F . h_v = mu_vmatrix-vector multiplication.
          // Once the multiplication is done, populate the mu buffer with results
          //
          this.Fs_dot_v(this.mu_v, anch_s, this.h_v);
          for (let anch_b_idx=0; anch_b_idx < anch_cell_tile_n; anch_b_idx++) {
            let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];

            nxt_anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[nxt_anch_idx] = this.mu_v[anch_b_val];
          }

        }
      }
    }
  }

  this.renormalize(t_nxt);

  return this.maxdiff(t_cur, t_nxt);
}

BeliefPropagationCollapse.prototype.bp_step_svd = function() {
  let t_cur = this.step_idx;
  let t_nxt = 1-this.step_idx;

  let iter=0;
  let anch_z=0,
      anch_y=0, 
      anch_x=0,
      anch_b=0,
      anch_s=0;
  let nei_s=0;

  let anch_v = [0,0,0];
  let nei_v = [0,0,0];
  let dv = this.dxyz;

  let anch_idx = 0,
      anch_s_inv = 0,
      nxt_anch_idx = 0;
  let nei_idx=0,
      nei_k_v=[0,0,0];

  let mu_ij_b = 0,
      P_mu_kj_a=1,
      h_ij_a = 1;


  // clear out destination messages
  //
  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        for (let anch_b_idx=0; anch_b_idx<anch_cell_tile_n; anch_b_idx++) {

          let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];
          for (anch_s=0; anch_s<(2*this.D); anch_s++) {
            anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[anch_idx] = 1;
          }

        }

      }
    }
  }


  for (anch_z=0; anch_z<this.FMZ; anch_z++) {
    for (anch_y=0; anch_y<this.FMY; anch_y++) {
      for (anch_x=0; anch_x<this.FMX; anch_x++) {

        anch_v[0] = anch_x;
        anch_v[1] = anch_y;
        anch_v[2] = anch_z;

        let anch_cell_tile_n = this.cell_tile_n[ anch_z*this.CELL_STRIDE_N1 + anch_y*this.CELL_STRIDE_N2 + anch_x ];
        if (anch_cell_tile_n<=1) {

          //DEBUG
          console.log("anchor tile", anch_x, anch_y, anch_z, "(", anch_cell_tile_n, ") ...  skipping");

          continue;
        }

        for (anch_s=0; anch_s<(2*this.D); anch_s++) {

          this.pos(nei_v, anch_x+dv[anch_s][0], anch_y+dv[anch_s][1], anch_z+dv[anch_s][2]);
          if (this.oob(nei_v[0], nei_v[1], nei_v[2])) { continue; }

          //DEBUG
          console.log("anchor", anch_x, anch_y, anch_z, "s" + anch_s.toString(), "(dv:", dv[anch_s], ")", "(n:", anch_cell_tile_n, ")");

          anch_s_inv = this.dxyz_inv_idx[anch_s];

          // init our h^t_{i,j}(a) vector
          //
          for (let ii=0; ii<this.h_v.length; ii++) { this.h_v[ii] = 0; }

          // fill in h_v vector
          //
          let nei_cell_tile_n = this.cell_tile_n[ nei_v[2]*this.CELL_STRIDE_N1 + nei_v[1]*this.CELL_STRIDE_N2 + nei_v[0]];
          if (nei_cell_tile_n<=1) { continue; }
          for (let nei_a_idx=0; nei_a_idx < nei_cell_tile_n; nei_a_idx++) {
            let nei_a_val = this.cell_tile[ nei_v[2]*this.CELL_STRIDE1 + nei_v[1]*this.CELL_STRIDE2 + nei_v[0]*this.CELL_STRIDE3 + nei_a_idx ];

            this.h_v[nei_a_val] = this.pdf[nei_a_val];

            for (nei_s=0; nei_s<(2*this.D); nei_s++) {
              if (nei_s == anch_s_inv) { continue; }
              nei_idx = this.idx(t_cur, nei_v[0], nei_v[1], nei_v[2], nei_a_val, nei_s);
              this.h_v[nei_a_val] *= this.buf[nei_idx];
            }

          }

          this.uMv(this.u_v, this.SVs[anch_s], this.h_v);
          this.uMv(this.h_v, this.Us[anch_s], this.u_v);

          this.Fs_dot_v(this.mu_v, anch_s, this.h_v);
          for (let anch_b_idx=0; anch_b_idx < anch_cell_tile_n; anch_b_idx++) {
            let anch_b_val = this.cell_tile[ anch_z*this.CELL_STRIDE1 + anch_y*this.CELL_STRIDE2 + anch_x*this.CELL_STRIDE3 + anch_b_idx ];

            nxt_anch_idx = this.idx(t_nxt, anch_x, anch_y, anch_z, anch_b_val, anch_s);
            this.buf[nxt_anch_idx] = this.mu_v[anch_b_val];
          }

        }
      }
    }
  }

  this.renormalize(t_nxt);

  return this.maxdiff(t_cur, t_nxt);
}

BeliefPropagationCollapse.prototype.debug_print_x = function(t, _digit) {
  t = ((typeof t === "undefined") ? this.step_idx : t);
  _digit = ((typeof _digit == "undefined") ? 3 : _digit);

  let space_width = 16;
  let B = Math.pow(10, _digit);

  for (let z=0; z<this.FMZ; z++) {
    for (let y=0; y<this.FMY; y++) {
      for (let x=0; x<this.FMX; x++) {

        console.log(x,y,z);

        for (let b=0; b<this.tilesize; b++) {

          let valid = false;
          for (let s=0; s<(this.D*2); s++) {
            let idx = this.idx(t,x,y,z,b,s);
            if ( this.buf[idx] > this.eps ) { valid = true; break; }
          }
          if (!valid) { continue; }

          let count = 0;
          let sfx = "";
          for (let dvidx=0; dvidx<this.dxyz.length; dvidx++) {
            let dv_key = this.dxyz[dvidx].join(":");
            if (count>0) { sfx += " "; }

            let idx = this.idx(t,x,y,z,b,dvidx);

            let v = this.buf[idx];
            let vs = (Math.floor(v*B)/B).toString();

            if (vs == "0") { vs = "" ; }
            else { vs = "(" + vs + ")"; }
            let str_ele = dv_key + " " + vs  ;
            if (str_ele.length < space_width) {
              str_ele += " ".repeat(space_width - str_ele.length);
            }
            sfx += str_ele;
            count++;
          }

          console.log("  ", this.tile_name[b], sfx);

        }

      }

    }
  }
}

BeliefPropagationCollapse.prototype.debug_print = function(t, _digit) {
  t = ((typeof t === "undefined") ? this.step_idx : t);
  _digit = ((typeof _digit == "undefined") ? 3 : _digit);

  let space_width = 16;
  let B = Math.pow(10, _digit);

  //for (let ii=0; ii<this.cell_tile_n.length; ii++) { console.log("cell_tile_n[", ii, "]", this.cell_tile_n[ii]); }
  //for (let ii=0; ii<this.cell_tile.length; ii++) { console.log("cell_tile[", ii, "]", this.cell_tile[ii]); }

  console.log("step:", t);

  for (let z=0; z<this.FMZ; z++) {
    for (let y=0; y<this.FMY; y++) {
      for (let x=0; x<this.FMX; x++) {

        console.log("[", x,y,z, "]", "(n:", this._cell_tile_n(x,y,z) , ")");

        let ntile = this.cell_tile_n[ z*this.CELL_STRIDE_N1 + y*this.CELL_STRIDE_N2 + x ];

        for (let b_idx=0; b_idx<ntile; b_idx++) {
          let b = this.cell_tile[ z*this.CELL_STRIDE1 + y*this.CELL_STRIDE2 + x*this.CELL_STRIDE3 + b_idx ];

          /*
          let valid = false;
          for (let s=0; s<(this.D*2); s++) {
            let idx = this.idx(t,x,y,z,b,s);
            if ( this.buf[idx] > this.eps ) { valid = true; break; }
          }
          if (!valid) { continue; }
          */

          let count = 0;
          let sfx = "";
          for (let dvidx=0; dvidx<this.dxyz.length; dvidx++) {
            let dv_key = this.dxyz[dvidx].join(":");
            if (count>0) { sfx += " "; }

            let idx = this.idx(t,x,y,z,b,dvidx);

            let v = this.buf[idx];
            let vs = (Math.floor(v*B)/B).toString();

            if (vs == "0") { vs = "" ; }
            else { vs = "(" + vs + ")"; }
            let str_ele = dv_key + " " + vs  ;
            if (str_ele.length < space_width) {
              str_ele += " ".repeat(space_width - str_ele.length);
            }
            sfx += str_ele;
            count++;
          }

          console.log("  ", this.tile_name[b] + "(" + b.toString() + ")", sfx);

        }

      }

    }
  }
}

BeliefPropagationCollapse.prototype._cell_tile_n = function(x,y,z) {
  return this.cell_tile_n[ z*this.CELL_STRIDE_N1 + y*this.CELL_STRIDE_N2 + x ];
}

BeliefPropagationCollapse.prototype._cell_tile_n_idx = function(x,y,z) {
  return z*this.CELL_STRIDE_N1 + y*this.CELL_STRIDE_N2 + x;
}

BeliefPropagationCollapse.prototype._cell_tile_idx = function(x,y,z,idx) {
  return z*this.CELL_STRIDE1 + y*this.CELL_STRIDE2 + x*this.CELL_STRIDE3 + idx;
}

BeliefPropagationCollapse.prototype._cell_tile = function(x,y,z,idx) {
  return this.cell_tile[ z*this.CELL_STRIDE1 + y*this.CELL_STRIDE2 + x*this.CELL_STRIDE3 + idx ];
}

BeliefPropagationCollapse.prototype.filter_keep = function(x,y,z, tile_map) {

  let ctn_idx = this._cell_tile_n_idx(x,y,z);

  let ntile = this.cell_tile_n[ ctn_idx ];
  for (let idx=0; idx<ntile; idx++) {
    let ct_idx = this._cell_tile_idx(x,y,z,idx);
    let tile_id = this.cell_tile[ ct_idx ];
    let tile_name = this.tile_id[ tile_id ];

    if (tile_name in tile_map) { continue; }

    ntile--;
    let ct_idx_end = this._cell_tile_idx(x,y,z,ntile);

    let a = this.cell_tile[ ct_idx ];
    this.cell_tile[ ct_idx ] = this.cell_tile[ ct_idx_end ];
    this.cell_tile[ ct_idx_end ] = a;
    idx--;

  }

  this.cell_tile_n[ ctn_idx ] = ntile;
}

BeliefPropagationCollapse.prototype.filter_discard = function(x,y,z, tile_map) {

  let ctn_idx = this._cell_tile_n_idx(x,y,z);

  let ntile = this.cell_tile_n[ ctn_idx ];
  for (let idx=0; idx<ntile; idx++) {
    let ct_idx = this._cell_tile_idx(x,y,z,idx);
    let tile_id = this.cell_tile[ ct_idx ];
    let tile_name = this.tile_id[ tile_id ];
    if (!(tile_name in tile_map)) { continue; }

    ntile--;
    let ct_idx_end = this._cell_tile_idx(x,y,z,ntile);

    let a = this.cell_tile[ ct_idx ];
    this.cell_tile[ ct_idx ] = this.cell_tile[ ct_idx_end ];
    this.cell_tile[ ct_idx_end ] = a;
    idx--;

  }

  this.cell_tile_n[ ctn_idx ] = ntile;
}


if (typeof module !== "undefined") {

  var fs = require("fs");
  var numeric = require("./numeric.js");

  function _load(fn) {
    let data = fs.readFileSync(fn);
    let tilelib = JSON.parse(data);
    return tilelib;
  }

  function test0() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 2,2,1);

    let keep_map = {
      ".000" : true,
      "r000" : true,
      "|000" : true
    };

    bpc.filter_keep(0,0,0, keep_map);
    bpc.filter_keep(0,1,0, keep_map);
    bpc.filter_keep(1,0,0, keep_map);
    bpc.filter_keep(1,1,0, keep_map);

    bpc.renormalize();
    bpc.debug_print();

  }

  function test1() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 4,3,1);

    bpc.filter_keep(0,2,0, {"r000":1});
    bpc.filter_keep(0,1,0, {"|000":1,"T003":1});
    bpc.filter_keep(0,0,0, {"r003":1});

    bpc.filter_keep(1,2,0, {"|001":1});
    bpc.filter_keep(1,1,0, {".000":1,"|001":1});
    bpc.filter_keep(1,0,0, {"|001":1});

    bpc.filter_keep(2,2,0, {"|001":1, "T000":1});
    bpc.filter_keep(2,1,0, {'|000':1, '|001':1, '+000':1, 'T000':1, 'T001':1, 'T002':1, 'T003':1, 'r000':1, 'r001':1, 'r002':1, 'r003':1, '.000':1 });
    bpc.filter_keep(2,0,0, {"|001":1, "T002":1 });

    bpc.filter_keep(3,2,0, {"r001":1});
    bpc.filter_keep(3,1,0, {"|000":1,"T001":1});
    bpc.filter_keep(3,0,0, {"r002":1});

    bpc.renormalize();
    bpc.debug_print();

  }

  function test2() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 4,3,1);

    bpc.filter_keep(0,2,0, {"r000":1});
    bpc.filter_keep(0,1,0, {"|000":1,"T003":1});
    bpc.filter_keep(0,0,0, {"r003":1});

    bpc.filter_keep(1,2,0, {"|001":1});
    bpc.filter_keep(1,1,0, {".000":1,"|001":1});
    bpc.filter_keep(1,0,0, {"|001":1});

    bpc.filter_keep(2,2,0, {"|001":1, "T000":1});
    bpc.filter_keep(2,1,0, {'|000':1, '|001':1, '+000':1, 'T000':1, 'T001':1, 'T002':1, 'T003':1, 'r000':1, 'r001':1, 'r002':1, 'r003':1, '.000':1 });
    bpc.filter_keep(2,0,0, {"|001":1, "T002":1 });

    bpc.filter_keep(3,2,0, {"r001":1});
    bpc.filter_keep(3,1,0, {"|000":1,"T001":1});
    bpc.filter_keep(3,0,0, {"r002":1});

    console.log("INIT:\n---");
    bpc.debug_print(bpc.step_idx);
    console.log("---\n");


    bpc.renormalize();

    let n_it = 1;

    for (let ii=0; ii<n_it; ii++) {
      bpc.bp_step_naive();
      bpc.step_idx = 1-bpc.step_idx
    }


    bpc.debug_print(1-bpc.step_idx);

  }

  function test3() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 3,3,1);

    bpc.filter_keep(0,2,0, {"r000":1});
    bpc.filter_keep(0,1,0, {"|000":1,"T003":1});
    bpc.filter_keep(0,0,0, {"r003":1});

    bpc.filter_keep(1,2,0, {"|001":1,"T000":1});
    bpc.filter_keep(1,1,0, {".000":1,"|001":1,"r002":1,"r003":1,"T002":1});
    bpc.filter_keep(1,0,0, {"|001":1});

    bpc.filter_keep(2,2,0, {"r001":1});
    bpc.filter_keep(2,1,0, {'|000':1,"T001":1});
    bpc.filter_keep(2,0,0, {"r002":1});

    // expect:
    //
    // 0,1,0: 2/5 |000, 3/5 T003
    // 2,1,0: 2/5 |000, 3/5 T001
    // 1,2,0: 2/5 |001, 3/5 T000
    // 1,1,0: 1/5 all
    //

    bpc.renormalize();

    let iter = 0, max_it = 1000;
    let maxdiff = -1;

    for (iter=0; iter<max_it; iter++) {

      console.log("ITER[", iter, "]: step_idx:", bpc.step_idx, "\n---");
      bpc.debug_print(bpc.step_idx);
      console.log("maxdiff:", maxdiff, "\n---\n");

      maxdiff = bpc.bp_step_naive();
      bpc.step_idx = 1-bpc.step_idx

      if (Math.abs(maxdiff) < bpc.eps) { break; }

    }

    console.log("fin maxdiff:", maxdiff, "(", bpc.eps, ")");

    bpc.debug_print(bpc.step_idx);

  }

  function test4() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 3,3,1);

    bpc.filter_keep(0,2,0, {"r000":1});
    bpc.filter_keep(0,1,0, {"|000":1,"T003":1});
    bpc.filter_keep(0,0,0, {"r003":1});

    bpc.filter_keep(1,2,0, {"|001":1,"T000":1});
    bpc.filter_keep(1,1,0, {".000":1,"|001":1,"r002":1,"r003":1,"T002":1});
    bpc.filter_keep(1,0,0, {"|001":1});

    bpc.filter_keep(2,2,0, {"r001":1});
    bpc.filter_keep(2,1,0, {'|000':1,"T001":1});
    bpc.filter_keep(2,0,0, {"r002":1});

    // expect:
    //
    // 0,1,0: 2/5 |000, 3/5 T003
    // 2,1,0: 2/5 |000, 3/5 T001
    // 1,2,0: 2/5 |001, 3/5 T000
    // 1,1,0: 1/5 all
    //

    bpc.renormalize();

    let iter = 0, max_it = 1000;
    let maxdiff = -1;

    for (iter=0; iter<max_it; iter++) {

      console.log("ITER[", iter, "]: step_idx:", bpc.step_idx, "\n---");
      bpc.debug_print(bpc.step_idx);
      console.log("maxdiff:", maxdiff, "\n---\n");

      maxdiff = bpc.bp_step_mat();
      bpc.step_idx = 1-bpc.step_idx

      if (Math.abs(maxdiff) < bpc.eps) { break; }

    }

    console.log("fin maxdiff:", maxdiff, "(", bpc.eps, ")");

    bpc.debug_print(bpc.step_idx);

  }

  // NOTE WORKING - something wrong with svd optimization
  //
  function test5() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 3,3,1);

    bpc.filter_keep(0,2,0, {"r000":1});
    bpc.filter_keep(0,1,0, {"|000":1,"T003":1});
    bpc.filter_keep(0,0,0, {"r003":1});

    bpc.filter_keep(1,2,0, {"|001":1,"T000":1});
    bpc.filter_keep(1,1,0, {".000":1,"|001":1,"r002":1,"r003":1,"T002":1});
    bpc.filter_keep(1,0,0, {"|001":1});

    bpc.filter_keep(2,2,0, {"r001":1});
    bpc.filter_keep(2,1,0, {'|000':1,"T001":1});
    bpc.filter_keep(2,0,0, {"r002":1});

    // expect:
    //
    // 0,1,0: 2/5 |000, 3/5 T003
    // 2,1,0: 2/5 |000, 3/5 T001
    // 1,2,0: 2/5 |001, 3/5 T000
    // 1,1,0: 1/5 all
    //

    bpc.renormalize();

    let iter = 0, max_it = 1000;
    let maxdiff = -1;

    for (iter=0; iter<max_it; iter++) {

      console.log("ITER[", iter, "]: step_idx:", bpc.step_idx, "\n---");
      bpc.debug_print(bpc.step_idx);
      console.log("maxdiff:", maxdiff, "\n---\n");

      maxdiff = bpc.bp_step_svd();
      bpc.step_idx = 1-bpc.step_idx

      if (Math.abs(maxdiff) < bpc.eps) { break; }

    }

    console.log("fin maxdiff:", maxdiff, "(", bpc.eps, ")");

    bpc.debug_print(bpc.step_idx);

  }

  function debugg___() {
    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 2,3,4);
    for (let t=0; t<2; t++) {
      for (let z=0; z<4; z++) {
        for (let y=0; y<3; y++) {
          for (let x=0; x<2; x++) {
            for (let s=0; s<6; s++) {
              for (let b=0; b<bpc.tilesize; b++) {
                let idx = bpc.idx(t,x,y,z,b,s);
                console.log(t,x,y,z,b,s, "-->", idx);
              }
            }
          }
        }
      }
    }
  }

  function main() {

    //debugg___();
    //process.exit();

    //test0();
    //console.log("---");
    //test1();
    //console.log("---");
    //test2();
    //console.log("---");
    //test3();
    //process.exit();

    //test4();
    //process.exit();

    test5();
    process.exit();

    let tilelib = _load("./data/stair.json");
    let bpc = new BeliefPropagationCollapse(tilelib,null, 4,3,1);

    console.log(">>", bpc.n);

    for (let ii=0; ii<1; ii++) {
      bpc.bp_step_naive();
      bpc.step_idx = 1-bpc.step_idx
    }

    bpc.debug_print(bpc.step_idx);
  }

  main();

  module.exports = BeliefPropagationCollapse;
}
