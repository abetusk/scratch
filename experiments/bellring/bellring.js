// LICENSE: CC0
//

var DEBUG_LVL = 0;

function count_anti(a,b) {
  let n = a.length;
  let c = 0;
  for (let i=0; i<n; i++) {
    if (a[i].v != b[i].v) { c++; }
  }
  return c;
}

function swaptill_d(a,b, theta, m) {
  let target = Math.cos(Math.PI*theta);

  let tot  = 0;
  let keep = 0;
  let discard = 0;

  let n = a.length;
  for (let it=0; it<m; it++) {
    for (let idx0=0; idx0<n; idx0++) {
      let u0 = a[idx0].v;
      let v0 = b[idx0].v;

      if (u0==v0) { continue; }

      for (let idx1=idx0+1; idx1<n; idx1++) {
        let u1 = a[idx1].v;
        let v1 = b[idx1].v;

        if (u1==v1) { continue; }
        if (u0==u1) { continue; }

        tot++;

        let cur = corr_ab(a,b);

        b[idx0].v = v1;
        b[idx1].v = v0;

        let tst = corr_ab(a,b);

        let res_test = Math.abs(target-tst);
        let res_cur = Math.abs(target-cur);

        console.log("##", idx0, idx1, "target:", target, ", tst:", tst, ", cur:", cur, ", res_test:", res_test, ", res_cur:", res_cur);

        if (Math.abs(target-tst) < Math.abs(target-cur)) {
          keep++;
        }
        else {
          b[idx0].v = v0;
          b[idx1].v = v1;
          discard++;
        }

        break;

      }

    }
  }

  return {"tot":tot, "keep":keep, "discard":discard};
}

function swaptill_m(a,b, theta, m) {
  let target = Math.cos(Math.PI*theta);

  let c = 0;

  let n = a.length;
  for (let it=0; it<m; it++) {
    let idx0 = Math.floor(Math.random()*n);
    let idx1 = Math.floor(Math.random()*n);
    if (idx0 == idx1) { continue; }

    let u0 = a[idx0].v;
    let u1 = a[idx1].v;

    let v0 = b[idx0].v;
    let v1 = b[idx1].v;

    let t = 0;

    if ((u0 != v0) && (u1 != v1) && (u0 != u1)) {
      t++;
    }

    if ((u0 == v0) && (u1 == v1) && (u0 != u1)) {
      t++;
    }

    if (t>0) {
      let cur = corr_ab(a,b);

      b[idx0].v = v1;
      b[idx1].v = v0;

      let tst = corr_ab(a,b);

      if (Math.abs(target-tst) < Math.abs(target-cur)) {
        // keep
        c++;
      }
      else {
        // swap back
        b[idx0].v = v0;
        b[idx1].v = v1;
      }

    }

  }
}

function swaptill_x(a,b, theta) {

  let c = 0;

  let target = Math.cos(Math.PI*theta);

  let n = a.length;
  for (let i=1; i<n; i+=2) {

    let u0 = a[i-1].v;
    let u1 = a[i].v;

    let v0 = b[i-1].v;
    let v1 = b[i].v;

    let t = 0;

    if ((u0 != v0) && (u1 != v1) && (u0 != u1)) {
      t++;
    }

    if ((u0 == v0) && (u1 == v1) && (u0 != u1)) {
      t++;
    }

    if (t>0) {

      if (DEBUG_LVL > 0) {
        console.log("## swapping idx:", i-1, i);
      }

      let cur = corr_ab(a,b);

      b[i-1].v = v1;
      b[i].v = v0;

      let tst = corr_ab(a,b);

      if (Math.abs(target-tst) < Math.abs(target-cur)) {
        // keep
        c++;
      }
      else {
        // swap back
        b[i-1].v = v0;
        b[i].v = v1;
      }

    }
  }

  if (DEBUG_LVL > 0) {
    console.log("# swaptill, theta:", theta, ",count:", c);
  }

}

function swaptill(a,b, theta) {

  let c = 0;

  let n = a.length;
  for (let i=1; i<n; i+=2) {

    let u0 = a[i-1].v;
    let u1 = a[i].v;

    let v0 = b[i-1].v;
    let v1 = b[i].v;

    if ((u0 != v0) &&
        (u1 != v1) &&
        (u0 != u1)) {

      if (DEBUG_LVL > 0) {
        console.log("## swapping idx:", i-1, i);
      }


      b[i-1].v = v1;
      b[i].v = v0;

      c++;
    }
  }

  if (DEBUG_LVL > 0) {
    console.log("# swaptill, theta:", theta, ",count:", c);
  }

}

function genpair(theta, n) {
  let ab = { "a": [], "b": [] };
  for (let i=0; i<n; i++) {
    let u = ((Math.random() < 0.5) ? 0 : 1);
    let v = u;

    if (Math.random() < theta) {
      v = 1-u;
    }

    ab.a.push( {"v": u, "theta": 0.0 } );
    ab.b.push( {"v": v, "theta": theta } );
  }

  return ab;
}

function corr_ab(a,b) {
  let n = a.length;

  let m = 0;
  for (let i=0; i<n; i++) {
    m += ((a[i].v == b[i].v) ? 1 : -1);
  }

  return m / n;
}

function corr(ab) {
  return corr_ab(ab.a, ab.b);
}

function _corr(ab) {
  let n = ab.a.length;

  let m = 0;
  for (let i=0; i<n; i++) {
    m += ((ab.a[i].v == ab.b[i].v) ? 1 : -1);
  }

  return m / n;
}

function print_ab(ab) {
  for (let i=0; i<ab.a.length; i++) {
    console.log("a[:", i, "]", ab.a[i].v, "{", ab.a[i].theta, "}, b[", i, "]:", ab.b[i].v, "{", ab.b[i].theta, "}");
  }
}

let N = 64;
let n = 1024;

for (let idx=0; idx<=N; idx++) {

  //##### DEBUG #####
  if (idx > 5) { break; }

  let theta = idx / N;

  if (DEBUG_LVL > 0) {
    console.log("\n##-------- theta:", theta, "(", idx, "/", N, ")");
  }

  let ab = genpair(theta, n);

  if (DEBUG_LVL > 0) {
    print_ab(ab);
  }

  if (DEBUG_LVL > 0) {
    console.log("#before swap, theta, correlation");
    console.log("#", theta, corr(ab));
  }

  let bef_anti = count_anti(ab.a, ab.b);

  let c = swaptill_d(ab.a, ab.b, theta, 100);
  console.log("##", c, "(of", bef_anti, "/", count_anti(ab.a, ab.b), ")");
  //swaptill_m(ab.a, ab.b, theta, 128*1024);
  //swaptill_x(ab.a, ab.b, theta);
  //swaptill_x(ab.a, ab.b, theta);

  if (DEBUG_LVL > 0) {
    console.log("\n\n###### after swap");
  }

  if (DEBUG_LVL > 0) {
    print_ab(ab);
  }

  if (DEBUG_LVL > 0) {
    console.log("#after swap, theta, correlation");
  }
  console.log(theta, corr(ab));
}
