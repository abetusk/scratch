var CANVAS_ID = 'ui_canvas';

var g_ctx= {
  "two":null,
  "canvas":null,
  "ctx": null,

  "grid_dx": 20,
  "grid_dy": 20,

  "mouse_x": 0,
  "mouse_y": 0,
  "mouse_grid_x": 0,
  "mouse_grid_y": 0,

  "knot": []
};

function process_click(x,y) {

  let knot = g_ctx.knot;

  for (let i=0; i<knot.length; i++) {
    if ((x == knot[i][0]) && (y == knot[i][1])) {
      let _knot = [];
      for (let j=0; j<knot.length; j++) {
        if (i==j) { continue; }
        _knot.push( knot[j] );
      }
      g_ctx.knot = _knot;
      return;
    }
  }

  g_ctx.knot.push([x,y]);

}

function mkgrid() {
  let two = g_ctx.two;

  let W = two.width,
      H = two.height;

  let dx = g_ctx.grid_dx,
      dy = g_ctx.grid_dy;

  let n_col = Math.ceil(W / dx);
  let n_row = Math.ceil(H / dy);

  for (let c=0; c<n_col; c++) {
    let l = two.makeLine(dx*c, 0, dx*c, H);
    l.stroke = "rgb(128,128,128)";
    l.lineWidth = 0.75;
    l.opacity = 0.25;
  }

  for (let r=0; r<n_row; r++) {
    let l = two.makeLine(0, dy*r, W, dy*r);
    l.stroke = "rgb(128,128,128)";
    l.lineWidth = 0.75;
    l.opacity = 0.25;
  }
}

function showKnots() {
  let two = g_ctx.two;
  let knot = g_ctx.knot;

  for (let i=0; i<knot.length; i++) {
    let _knot = two.makeRectangle( knot[i][0], knot[i][1], 5,5);
    _knot.fill = "rgb(20,20,20)";
  }
}

function showCursor() {
  let two = g_ctx.two;
  let gx = g_ctx.mouse_grid_x;
  let gy = g_ctx.mouse_grid_y;

  let csz = [ 10,10];

  let mr = two.makeRectangle(gx, gy, csz[0], csz[1]);
  mr.noFill();
  mr.lineWidth = 1;
  mr.stroke = "rgb(200,200,200)";
  mr.opacity = 0.9;
}

function showCurve() {
  let two = g_ctx.two;

  if (g_ctx.knot.length == 0) { return ; }

  let lut = Hobby.HobbyLUT( g_ctx.knot );

  for (let i=1; i<lut.length; i++) {
    let l = two.makeLine(lut[i-1][0], lut[i-1][1], lut[i][0], lut[i][1]);
    l.linewidth = 1;
    l.noFill();
    l.stroke = "rgb(100,100,100)";
  }

}

function showBGImg() {
  let canvas = g_ctx.canvas;

  let img = document.getElementById('ui_img');

  g_ctx.ctx.drawImage( img, 0, 0 );
}

function draw() {
  let two = g_ctx.two;
  two.clear();

  //showBGImg();

  mkgrid();

  showKnots();
  showCursor();

  showCurve();

  two.update();
}

function initTwoJS() {
  let two = new Two({"fitted":true});
  g_ctx.two = two;

  g_ctx.canvas = document.getElementById(CANVAS_ID);
  two.appendTo(g_ctx.canvas);

  //g_ctx.ctx = g_ctx.canvas.getContext("2d");

  let W = two.width;
  let H = two.height;

  let border_r = two.makeRectangle(W/2, H/2, W, H);
  border_r.noFill();
  border_r.linewidth = 4;
  border_r.stroke = "rgb(50,32,60)";


  window.addEventListener('mouseup', function(ev) {
    process_click( g_ctx.mouse_grid_x, g_ctx.mouse_grid_y );

    draw();
  });

  window.addEventListener('mousemove', function(ev) {
    let r = g_ctx.canvas.getBoundingClientRect();
    let x = ev.clientX - r.left,
        y = ev.clientY - r.top;

    g_ctx.mouse_x = x;
    g_ctx.mouse_y = y;

    g_ctx.mouse_grid_x = g_ctx.grid_dx*Math.round( g_ctx.mouse_x / g_ctx.grid_dx );
    g_ctx.mouse_grid_y = g_ctx.grid_dy*Math.round( g_ctx.mouse_y / g_ctx.grid_dy );

    draw();
  });

  draw();
  return two;
}

