
//WIP!!!

var r = 2;

function pnt_eq( x0,y0, x1,y1 , _eps) {
  _eps = ((typeof _eps === "undefined") ? (1/(1024.0*1024.0)) : _eps);

  let dx = (x0-x1),
      dy = (y0-y1);

  if (Math.fabs(dx) > _eps) { return false; }
  if (Math.fabs(dy) > _eps) { return false; }
  return true;
}

function pnt_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }

  if (a[1] < b[1]) { return -1; }
  if (a[1] > b[1]) { return  1; }

  return 0;
}


for (let x=0; x<(r+1); x++) {
  let d = (r*r) - (x*x);
  if (d < 0) { continue; }
  let y = Math.sqrt(d);

  console.log("x>", x,y);
}

for (let y=0; y<(r+1); y++) {
  let d = (r*r) - (y*y);
  if (d < 0) { continue; }
  let x = Math.sqrt(d);

  console.log("y>", x,y);
}


