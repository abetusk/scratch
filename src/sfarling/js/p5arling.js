// LICENSE: CC0

var random2D = function() {}

var g_ctx = {
  "n": 200,
  "dt": 1,
  "W": 500,
  "H": 500,

  "gid_count": 0,

  "flock": []
};

function _rnd(a,b) {
  if (typeof a === "undefined") { return Math.random(); }
  if (typeof b === "undefined") { return a*Math.random(); }
  return ((b-a)*Math.random()) + a;
}

class p5arling {


  // W - width
  // H - height
  //
  // p - position
  // v - velocity
  // a - acceleration
  // w - angular velocity
  //

  constructor(p, v, a, w, minSpeed, maxSpeed, maxForce, _w, _h) {

    let _W = g_ctx.W;
    let _H = g_ctx.H;

    let _sx = _rnd( _W/4, 3*_W/4 );
    let _sy = _rnd( _H/4, 3*_H/4 );

    p = ((typeof p === "undefined") ? createVector( _sx, _sy ) : p);
    //v = ((typeof v === "undefined") ? createVector(0,1) : v);
    v = ((typeof v === "undefined") ? p5.Vector.random2D() : v);
    a = ((typeof a === "undefined") ? createVector(0,0) : a);
    w = ((typeof w === "undefined") ? 0 : w);

    minSpeed = ((typeof minSpeed === "undefined") ? 3 : minSpeed);
    maxSpeed = ((typeof maxSpeed === "undefined") ? 4 : maxSpeed);
    maxForce = ((typeof maxForce === "undefined") ? 128: maxForce);

    _w = ((typeof _w === "undefined") ? 4 : _w);
    _h = ((typeof _h === "undefined") ? 7 : _h);

    this.id = -1;
    this.flock = [];

    this.W = _w;
    this.H = _h;

    this.p = p;
    this.v = v;
    this.a = a;
    this.w = w;
    this.theta = Math.atan2(v.y, v.x);
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;

    this.stressAngularSpeed = Math.PI / 32;
    this.maxAngularSpeed = Math.PI / 16;

    this.body = [
      createVector(-this.W/2,  this.H/2),
      createVector( 0,        -this.H/2),
      createVector( this.W/2,  this.H/2),
    ];

    this.tri = [
      this.p.x + this.body[0].x, this.p.y + this.body[0].y,
      this.p.x + this.body[1].x, this.p.y + this.body[1].y,
      this.p.x + this.body[2].x, this.p.y + this.body[2].y
    ];
  }

  updateTri() {

    let t = this.theta + Math.PI/2;

    let _r = [
      this.body[0].copy().rotate( t ),
      this.body[1].copy().rotate( t ),
      this.body[2].copy().rotate( t )
    ];

    this.tri[0] = this.p.x + _r[0].x;
    this.tri[1] = this.p.y + _r[0].y;

    this.tri[2] = this.p.x + _r[1].x;
    this.tri[3] = this.p.y + _r[1].y;

    this.tri[4] = this.p.x + _r[2].x;
    this.tri[5] = this.p.y + _r[2].y;
  }

  align() {

    let steer = createVector(0,0);
    let tot = 0;
    let dtau = 1/128;

    let damp = 1/128;

    for (let i=0; i<this.flock.length; i++) {
      if (this.flock[i].id == this.id) { continue; }

      let _d = this.p.dist( this.flock[i].p );

      steer.add( this.flock[i].v / _d );
      tot++;
    }

    steer.sub( this.v );

    if (tot > 0) {
      let _theta = Math.atan2( steer.y, steer.x );

      //this.applyTorque( (_theta < 0) ? -dtau : dtau );
      this.applyTorque( damp * _theta );
    }

  }

  cohere() {
    let com = createVector(0,0);
    let tot = 0;

    let _cr = 10.0;

    for (let i=0; i<this.flock.length; i++) {
      if (this.flock[i].id == this.id) { continue; }

      let _d = this.p.dist( this.flock[i].p );
      if (_d < (1/1024)) { continue; }

      let tv = this.flock[i].p.copy();
      tv.sub( this.p );
      tv.mult( _cr / _d );
      tv.add( this.p );

      com.add(tv);
      tot++;
    }

    if (tot > 0) {
      com.sub( this.p );

      let _theta = Math.atan2( com.y, com.x );
      this.applyTorque( _theta / 1024 );
    }

  }

  separate() {

    let com = createVector(0,0);
    let tot = 0;
    let _cr = 10.5;

    for (let i=0; i<this.flock.length; i++) {
      if (this.flock[i].id == this.id) { continue; }

      let _d = this.p.dist( this.flock[i].p );

      if (_d > 20) {  continue; }

      //_d *= _d;
      if (_d < (1/1024)) { continue; }

      let tv = this.p.copy();
      tv.sub( this.flock[i].p.copy() );
      tv.mult( _cr / _d );
      //tv.add( this.p );

      com.add(tv);
      tot++;
    }

    if (tot > 0) {
      com.mult( 1 / tot );
      //com.sub( this.p );

      let _d = com.mag();

      if (_d > (1/1024)) { 
        //console.log(_d);
        let _theta = Math.atan2( com.y, com.x );

        if ( _theta < (-Math.PI/32) ) { _theta = -Math.PI/32; }
        if ( _theta > ( Math.PI/32) ) { _theta =  Math.PI/32; }

        //console.log( _d, _theta );

        this.applyTorque( _d * _theta / 1024 );
      }
    }


  }

  update(dt) {
    if (isNaN(this.p.x)) {
      console.log("cp.-1!!!", this.p.x, this.p.y, this.v.x, this.v.y, this.w, this.a.x, this.a.y);
    }


    this.align();
    this.cohere();
    this.separate();

    if (isNaN(this.p.x)) {
      console.log("cp.0!!!", this.p.x, this.p.y, this.v.x, this.v.y, this.w, this.a.x, this.a.y);
    }


    this.v.x += this.a.x * dt;
    this.v.y += this.a.y * dt;
    let speed = Math.sqrt( (this.v.x * this.v.x) + (this.v.y * this.v.y) );

    speed *= (1 - (this.w / (8*this.maxAngularSpeed)));

    if (speed < this.minSpeed) {
      //this.v.x = (this.v.x / speed) * this.minSpeed;
      //this.v.y = (this.v.y / speed) * this.minSpeed;

      this.v.x = Math.cos(this.theta) * this.minSpeed;
      this.v.y = Math.sin(this.theta) * this.minSpeed;
    }

    if (speed > this.maxSpeed) {
      this.v.x = (this.v.x / speed) * this.maxSpeed;
      this.v.y = (this.v.y / speed) * this.maxSpeed;
    }

    if ( Math.abs( this.w ) > this.maxAngularSpeed ) {
      this.w = ( (this.w < 0) ? -this.maxAngularSpeed : this.maxAngularSpeed );
    }

    if (this.w > this.stressAngularSpeed) {
      this.w *= 0.99;
    }

    this.p.x += this.v.x * dt;
    this.p.y += this.v.y * dt;

    if (isNaN(this.p.x)) {
      console.log("cp.1!!!", this.p.x, this.p.y, this.v.x, this.v.y, this.w, this.a.x, this.a.y);
    }

    this.theta += this.w * dt;

    //this.theta = Math.atan2( this.v.y, this.v.x );


    // constant velocity
    //
    this.v.x = Math.cos(this.theta) * speed;
    this.v.y = Math.sin(this.theta) * speed;

    //this.w *= 0.99;

    // wrap around boundaries
    //
    if (this.p.x < 0) { this.p.x += g_ctx.W; }
    if (this.p.y < 0) { this.p.y += g_ctx.H; }

    if (this.p.x >= g_ctx.W) { this.p.x -= g_ctx.W; }
    if (this.p.y >= g_ctx.H) { this.p.y -= g_ctx.H; }

    // viz
    //
    this.updateTri();
  }

  applyForce(force) {
    this.a.x += force.x;
    this.a.y += force.y
    const forceMagnitude = Math.sqrt( (this.a.x * this.a.x) + (this.a.y * this.a.y) );

    const _eps = (1.0/(1024.0*1024.0));

    if (forceMagnitude < (_eps)) { return; }

    if (forceMagnitude > this.maxForce) {
      this.a.x = (this.a.x / forceMagnitude) * this.maxForce;
      this.a.y = (this.a.y / forceMagnitude) * this.maxForce;
    }
  }

  applyTorque(torque, momentOfInertia) {
    momentOfInertia = ((typeof momentOfInertia === "undefined") ? 1 : momentOfInertia);
    const angularAcceleration = torque / momentOfInertia;
    this.w += angularAcceleration;

    if ( Math.abs( this.w ) > this.maxAngularSpeed ) {
      this.w = ( (this.w < 0) ? -this.maxAngularSpeed : this.maxAngularSpeed );
    }


  }

  resetAcceleration() {
    this.a.x = 0;
    this.a.y = 0;
  }

  reset() { this.resetAcceleration(); }
}



function init_flock() {

  for (let i=0; i<g_ctx.n; i++) {
    g_ctx.flock.push( new p5arling() );
  }

  let flock = g_ctx.flock;

  for (let i=0; i<g_ctx.n; i++) {
    flock[i].id = i;
    flock[i].flock = flock;
  }
};

function setup() {

  random2D = p5.Vector.random2D;
  angleMode( RADIANS );

  createCanvas(g_ctx.W, g_ctx.H);

  init_flock();

  console.log(">>>", g_ctx.flock.length);
}

function draw() {

  background(220);

  g_ctx.dt = 0.5;

  let _f = 1/2;

  let flock = g_ctx.flock;

  for (let i=0; i<flock.length; i++) {
    //F = p5.Vector.random2D().mult(1);
    //flock[i].applyForce( F );
    //flock[i].applyTorque( (random()-0.5)/256 );

    flock[i].update(g_ctx.dt);
    flock[i].reset();
  }

  // draw
  for (let i=0; i<flock.length; i++) {
    triangle(...flock[i].tri);
  }
}


