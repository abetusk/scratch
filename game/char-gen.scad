// Licnese: CC0
//

// viewing from back to front
//

$fs = 1.0/32.0;

module head1(h,w,d) {

  for (idx = [0:0]) {
    rv0 = rands(-0.8,0.8,3);
    rv1 = rands(-0.8,0.8,3);
    rr  = rands(0.75,1.2,2);
    hull() {
      translate([rv0[0], rv0[1], rv0[2]])
        sphere(rr[0]);
      translate([rv1[1], rv1[1], rv1[2]])
        sphere(rr[1]);
    }
  }
}

module head0(h,w,d) {
  sphere(1.0);
}

module head() {
  head0();
}

module body1(h,w,d) {
  hull() {
    translate([0,0,0.25]) sphere(1.6);
    translate([0,0,-0.25]) sphere(1.6);
  }
}

module body0(h,w,d) {
  sphere(1.8);
}

module body(h,w,d) {
  body1();
}

module left_arm() {
  _r = 0.5;
  p = [ [0,0,0],
        [-0.5, -0.25, -1.5],
        [-0.75, 0.5, -3]];
  hull() {
    translate(p[0]) sphere(_r);
    translate(p[1]) sphere(_r);
  }

  hull() {
    translate(p[1]) sphere(_r);
    translate(p[2]) sphere(_r);
  }
}

module right_arm() {
  _r = 0.5;
  p = [ [0,0,0],
        [0.5, -0.25, -1.5],
        [0.75, 0.5, -3]];
  hull() {
    translate(p[0]) sphere(_r);
    translate(p[1]) sphere(_r);
  }

  hull() {
    translate(p[1]) sphere(_r);
    translate(p[2]) sphere(_r);
  }
}


module left_leg() {
  p = [ [0.0, 0.0, 0.0],
        [0.0, 0.5, -1.75],
        [0.0, 0.25, -3.5]];
  _r = 0.5;
  hull() {
    translate(p[0]) sphere(_r);
    translate(p[1]) sphere(_r);
  }
  hull() {
    translate(p[1]) sphere(_r);
    translate(p[2]) sphere(_r);
  }
  
}

module right_leg() {
  p = [ [0.0, 0.0, 0.0],
        [0.0, 0.5, -1.75],
        [0.0, 0., -3.5]];
  _r = 0.5;
  hull() {
    translate(p[0]) sphere(_r);
    translate(p[1]) sphere(_r);
  }
  hull() {
    translate(p[1]) sphere(_r);
    translate(p[2]) sphere(_r);
  }
}

h_leg = 2.0;
h_body = 2.0;
h_head = 1.0;
h_arm = 2.0;

translate([0,0,2.5]) head();
body();
translate([-1.45,0,0.75]) left_arm();
translate([ 1.45,0,0.75]) right_arm();

translate([-0.8,0.0,-1.25]) left_leg();
translate([ 0.8,0.0,-1.25]) right_leg();