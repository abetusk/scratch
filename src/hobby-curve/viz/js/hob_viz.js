
function lincurve(ctx, p, offset) {
  offset = ((typeof offset == undefined) ? [0,0] : offset);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1.75;
  ctx.beginPath();

  for (let i=1; i<p.length; i++) {
    ctx.moveTo(offset[0] + p[i-1][0], offset[1] + p[i-1][1]);
    ctx.lineTo(offset[0] + p[i][0], offset[1] + p[i][1]);
  }
  ctx.stroke();
}

function lincurve(ctx, p, offset) {
  offset = ((typeof offset == undefined) ? [0,0] : offset);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1.75;
  ctx.beginPath();

  let lw = 1.75;
  let dlw = 1/2;

  for (let i=1; i<p.length; i++) {

    //if (i%2) {
      ctx.lineWidth = lw;
      lw += (Math.random() - 0.5)*dlw;
      if (lw < 0.125) { lw =0.125; }
      if (lw < 1.5) { lw = 1.5; }
      if (lw > 3) { lw = 3; }
      //if (lw > 2.5) { lw = 2.5; }
    //}
    
    ctx.moveTo(offset[0] + p[i-1][0], offset[1] + p[i-1][1]);
    ctx.lineTo(offset[0] + p[i][0], offset[1] + p[i][1]);
    ctx.stroke();

  }
}

function _basic(ctx) {
  let p = [[0, 0], [200, 133], [130, 300], [33, 233], [100, 167]];
  let pnt = Hobby.HobbyLUT(p, 16);
  lincurve(ctx, p, [30,30]);
  lincurve(ctx, pnt, [30,30]);
}

function squiggle(ctx) {
  let m = 10;
  let _K = 5;
  let vdy = 10;
  for (let k=0; k<m; k++) {
    let q = [],
      Qy = 1.5, Qx = 4,
      L = 80, n = 12;

    n = 4;
    L = 200;
    Qy = 4;
    Qx = 6;
    for (let i=0; i<n; i++) {
      let _qx = (((i==0) || (i==(n-1))) ? 0 : Qx);
      q.push( [ L*(i/n) + _qx*(Math.random()-0.5), Qy*(Math.random()-0.5) ] );
    }

    let q_pnt = Hobby.HobbyLUT(q, 32);
    lincurve(ctx, q_pnt, [150,150 + vdy*k]);
  }
}

function init() {
  var canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  //_basic(ctx);
  squiggle(ctx);
}
