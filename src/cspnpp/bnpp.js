
var N = 10;
var M = 6;

let C = {};
let V = {};
let V_base_name = [];
let V_name = [];

function mk_c(type, v0_name, v1_name, res_name, mod) {

  let v0 = V[v0_name];
  let v1 = V[v1_name];
  let res = ((typeof res_name === "undefined") ? undefined : C[res_name]);
  mod = ((typeof mod === "undefined") ? 0 : mod);

  let v0_d = {},
      v1_d = {},
      res_d = {};

  for (let i=0; i<v0.domain.length; i++) { v0_d[ v0.domain[i] ] = 1; }
  for (let i=0; i<v1.domain.length; i++) { v1_d[ v1.domain[i] ] = 1; }

  if (typeof res !== "undefined") {
    for (let i=0; i<res.domain.length; i++) { res_d[ res.domain[i] ] = 1; }
  }

  if (type == "add") {

    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let s = v0.domain[i] + v1.domain[j];
        if (s in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][s] = 0; }
      }
    }

    return {
      "type": "add",
      "p": [v0, v1, res],
      "f": t
    };
  }

  else if (type == "addmod") {
    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let s = (v0.domain[i] + v1.domain[j]) % mod;
        if (s in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][s] = 0; }
      }
    }

    return {
      "type": "addmod",
      "mod": mod,
      "p": [v0,v1,res],
      "f": t
    };
  }

  else if (type == "equal") {

    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        if (v0.domain[i] == v1.domain[j]) {
          t[v0.domain[i]][v1.domain[j]] = 1;
        }
        else {
          t[v0.domain[i]][v1.domain[j]] = 0;
        }
      }
    }

    return {
      "type": "equal",
      "p": [v0,v1],
      "f": t
    };
  }

  else if (type == "sub") {
    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let s = (v0.domain[i] - v1.domain[j]);
        if (s in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][s] = 0; }
      }
    }

    return {
      "type": "sub",
      "p": [v0,v1,res],
      "f": t
    };
  }

  else if (type == "submod") {

    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let s = (v0.domain[i] - v1.domain[j]) % mod;
        if (s in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][s] = 0; }
      }
    }

    return {
      "type": "submod",
      "mod": mod,
      "p": [v0,v1,res],
      "f": t
    };
  }

  else if (type == "mul") {
    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let m = (v0.domain[i] * v1.domain[j]);
        if (m in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][m] = 0; }
      }
    }

    return {
      "type": "mul",
      "p": [v0,v1,res],
      "f": t
    };
  }

  else if (type == "mulmod") {
    let t = {};
    for (let i=0; i<v0.domain.length; i++) {
      t[v0.domain[i]] = {};
      for (let j=0; j<v1.domain.length; j++) {
        t[v0.domain[i]][v1.domain[j]] = {};

        let m = (v0.domain[i] * v1.domain[j]) % mod;
        if (m in res_domain)  { t[v0.domain[i]][v1.domain[j]][res.domain[k]] = 1; }
        else                  { t[v0.domain[i]][v1.domain[j]][m] = 0; }
      }
    }

    return {
      "type": "mul",
      "p": [v0,v1,res],
      "f": t
    };
  }

  return null;
}

function print_state(x) {
  for (let i=0; i<x.length; i++) {


    let s = [];
    for (let j=0; j<x[i].length; j++) {
      s.push( x[i][j].name + ": [" + x[i][j].val.join(",") + "]");
    }
    console.log(s.join(" "));
  }
}

for (let i=0; i<N; i++) {
  V_base_name.push("v_" + i.toString());
  for (let j=0; j<M; j++) {
    let v2 = {
      "name": "v_" + i.toString() + ";" + j.toString(),
      "domain": [-1,1],
      "val" : [-1,1],
      "constraint" : {}
    };
    V[v2.name] = v2;
    V_name.push(v2.name);
  }
}

console.log( mk_c("equal", "v_0;0", "v_1;0") );


