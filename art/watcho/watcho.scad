// License: CC0

$fn=32;

SCREEN_W = 25;
SCREEN_H = 20;

//OUTER_W = 35.5;
//OUTER_H = 46;
OUTER_W = 39;
OUTER_H = 51;
OUTER_Z = 9.5;

arm_r = 2.75;

module lilplus(s,w,_r) {
  _s = s/2 - _r;
  _w = w/2 - _r;
  union() {

    hull() {
      translate([-_s, _w, 0]) sphere(_r);
      translate([ _s, _w, 0]) sphere(_r);
      translate([ _s,-_w, 0]) sphere(_r);
      translate([-_s,-_w, 0]) sphere(_r);
    }

    hull() {
      translate([ _w,-_s, 0]) sphere(_r);
      translate([ _w, _s, 0]) sphere(_r);
      translate([-_w, _s, 0]) sphere(_r);
      translate([-_w,-_s, 0]) sphere(_r);
    }

  }
  
}

module liltri(b,_r) {

  hull() {
    translate([-b/2,0,0]) sphere(_r);
    translate([ b/2,0,0]) sphere(_r);
    translate([ 0,sqrt(3)*b/2.0,0]) sphere(_r);
  }
}

module lilheart(w,h,_r) {
  dx = w*sqrt(3)/4.5;
  hull() {
    translate([-dx,0,0]) lilcircle(w/2,_r);
    translate([0,-h,0]) lilcircle(w/2,_r);
  }
  hull() {
    translate([ dx,0,0]) lilcircle(w/2,_r);
    translate([0,-h,0]) lilcircle(w/2,_r);
  }
}


module lilpyr(b,h,_r) {
  hull() {
    translate([-b/2,0,0]) sphere(_r);
    translate([ b/2,0,0]) sphere(_r);
    translate([ 0,h,0]) sphere(_r);
  }
}


module lilrect(w,h,_r) {
  _w = w/2 - _r;
  _h = h/2 - _r;
  
  hull() {
    translate([-_w, _h, 0]) sphere(_r);
    translate([-_w,-_h, 0]) sphere(_r);
    translate([ _w,-_h, 0]) sphere(_r);
    translate([ _w, _h, 0]) sphere(_r);
  }
}

module lilcircle(_R,_r) {
  R = _R - _r;
  rotate_extrude(angle=360)
    translate([R,0,0])
    circle(_r);
  linear_extrude(height=2*_r,center=true)
    circle(R);
}

module __lilcircle(_R,_r) {
  N = 16;
  R = _R - _r;
  union() {
    for (i = [0:N]) {
      hull() {
        _c0 = R*cos(i*360/N);
        _s0 = R*sin(i*360/N);
        translate([_c0,_s0,0]) sphere(_r);
        _c1 = R*cos((i+1)*360/N);
        _s1 = R*sin((i+1)*360/N);
        translate([_c1,_s1,0]) sphere(_r);
      }
    }
    linear_extrude(height=2*_r,center=true)
      circle(R);
  }
}

module lilpill(w,h,r) {

  _w = w - r;
  _h = h - r;
  union() {
    translate([-w/2,0,0]) lilcircle(_h/2,r);
    lilrect(w+h, _h, r);
    translate([ w/2,0,0]) lilcircle(_h/2,r);
  }
}

module lilback() {
  _or = 2.5;
  ox = OUTER_W/2;
  oy = OUTER_H/2;
  oz = OUTER_Z/2;
  oz = OUTER_Z/2 + 3;


  trude = 10;
  c0y = 9.75;
  c1y= 36.2;
  c0x = 35;

  ww=1;
  uz = -8;

  difference() {

    union() {

      hull() {
        translate([0,0,oz-_or-2])
        hull() {
          translate([-(ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or),-(oy-_or)]) sphere(_or);
          translate([-(ox-_or),-(oy-_or)]) sphere(_or);
        };

      };

        // left lil cheek
        translate([0,0,oz-_or])
        hull() {
          translate([-(ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or),10]) sphere(_or);
          translate([ (-_or+ww),-(oy-_or)]) sphere(_or);
          translate([-(ox-_or),-(oy-_or)]) sphere(_or);

          translate([-(ox-_or), (oy-_or),uz]) sphere(_or);
          translate([ (ox-_or), (oy-_or),uz]) sphere(_or);
          translate([ (ox-_or)/3,-(oy-_or),uz]) sphere(_or);
          translate([-(ox-_or),-(oy-_or),uz]) sphere(_or);

        };

        // right lil cheeck
        translate([0,0,oz-_or])
        hull() {
          translate([ (ox-_or), (oy-_or)]) sphere(_or);
          translate([-(ox-_or), (oy-_or)]) sphere(_or);
          translate([-(ox-_or),10]) sphere(_or);
          translate([ (_or-ww),-(oy-_or)]) sphere(_or);
          translate([(ox-_or),-(oy-_or)]) sphere(_or);

          translate([ (ox-_or), (oy-_or),uz]) sphere(_or);
          translate([-(ox-_or), (oy-_or),uz]) sphere(_or);
          translate([-(ox-_or)/3,-(oy-_or),uz]) sphere(_or);
          translate([(ox-_or),-(oy-_or),uz]) sphere(_or);
        };

      // side pills
      //
      //translate([-ox,-oy/2+3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([-ox+1,-c0y-4,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);

      //translate([ ox,-oy/2+3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([ ox-1,-c0y-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);

      //translate([-ox, oy/2-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([-ox+1, c1y/2-5,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      //translate([ ox-1, oy/2-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([ ox-1, c1y/2-5,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);

    };

    // middle ridges
    translate([-11,0,oz]) rotate(90, [0,0,1]) lilpill(15,1.25,0.45);
    translate([-3.75,0,oz]) rotate(90, [0,0,1]) lilpill(15,1.25,0.45);
    translate([ 3.75,0,oz]) rotate(90, [0,0,1]) lilpill(15,1.25,0.45);
    translate([ 11,0,oz]) rotate(90, [0,0,1]) lilpill(15,1.25,0.45);

    // top panel outline
    translate([0,22,oz]) lilpill(30,0.5,0.125);
    translate([0,11,oz]) lilpill(30,0.5,0.125);
    translate([15.05,(22+11)/2,oz]) rotate(90,[0,0,1]) lilpill(10.5,0.5,0.125);
    translate([-15.05,(22+11)/2,oz]) rotate(90,[0,0,1]) lilpill(10.5,0.5,0.125);

    translate([ 13, 20,oz]) lilcircle(0.5,0.125);
    translate([-13, 20,oz]) lilcircle(0.5,0.125);
    translate([-13,13,oz]) lilcircle(0.5,0.125);
    translate([ 13,13,oz]) lilcircle(0.5,0.125);

    // bottom panel outline
    translate([0,-22,oz]) lilpill(30,0.5,0.125);
    translate([0,-11,oz]) lilpill(30,0.5,0.125);
    translate([15.05,-(22+11)/2,oz]) rotate(90,[0,0,1]) lilpill(10.5,0.5,0.125);
    translate([-15.05,-(22+11)/2,oz]) rotate(90,[0,0,1]) lilpill(10.5,0.5,0.125);

    translate([-13,-20,oz]) lilcircle(0.5,0.125);
    translate([ 13,-20,oz]) lilcircle(0.5,0.125);
    translate([-13,-13,oz]) lilcircle(0.5,0.125);
    translate([ 13,-13,oz]) lilcircle(0.5,0.125);

    
  }

}

//lilback();

module lilbody() {
  _or = 2.5;
  ox = OUTER_W/2;
  oy = OUTER_H/2;
  oz = OUTER_Z/2;


  trude = 10;
  c0y = 9.75;
  c1y= 36.2;
  c0x = 35;


  difference() {  
    union() {
      hull() {
        translate([0,0,oz-_or])
        hull() {
          translate([-(ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or),-(oy-_or)]) sphere(_or);
          translate([-(ox-_or),-(oy-_or)]) sphere(_or);
        };
        translate([0,0,-(oz-_or)])
        hull() {
          translate([-(ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or), (oy-_or)]) sphere(_or);
          translate([ (ox-_or),-(oy-_or)]) sphere(_or);
          translate([-(ox-_or),-(oy-_or)]) sphere(_or);
        };
      };

      translate([-(ox-3),-0.5,oz]) rotate(90,[0,0,1]) liltri(1,0.25);

      // side pills
      //
      //translate([-ox,-oy/2+3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([-ox+1,-c0y-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      //translate([ ox,-oy/2+3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([ ox-1,-c0y-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);

      //translate([-ox, oy/2-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([-ox+1, c1y/2-5,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      //translate([ ox-1, oy/2-3,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);
      translate([ ox-1, c1y/2-5,0]) rotate(90, [1,0,0]) rotate(90, [0,1,0]) lilpill(3, 3, 2);

      // front nurnies
      //
      translate([-(ox - 8.5),-(oy - 7),oz]) lilplus(7,2.75,0.75);
      //translate([ (ox - 9),-(oy - 8),oz]) liltri(4,0.75);
      translate([ (ox - 8.5),-(oy - 10),oz]) lilheart(3.5,1.25,0.75);
//translate([0,10,0])lilheart(5,4.25,0.25);

      // big circle
      translate([ (ox - 16), -(oy - 6.5), oz]) lilcircle(3,0.75);

      // next to sunk pill
      translate([(ox - 14),-(oy - 12),oz]) lilcircle(0.75,0.35);

      // select/start
      translate([-(ox - 17),-(oy - 8),oz]) rotate(0,[0,0,1]) lilrect(3.0,1.25,0.5);
      translate([-(ox - 16.5),-(oy - 6),oz]) rotate(0,[0,0,1]) lilrect(3.0,1.25,0.5);

      // little circle lower right
      translate([ (ox - 9.5),-(oy - 4.5),oz]) rotate(0,[0,0,1]) lilcircle(1.25,0.55);
      
    }

    translate([-(ox - 15), -(oy - 12), oz]) lilrect(15,1.5,0.75);

    // chop off lower half
    translate([0,0,-oz/2]) cube([100,100,oz],center=true);
  }
}

module lilarm_l() {
  _r = arm_r;
  p = [[0,0,0],[0,-5,1],[0,-8,3],[2,-8,4],[4,-8,4]];

  for (i = [1:len(p)-1]) {
    hull() {
       translate(p[i-1]) sphere(_r);
       translate(p[i]) sphere(_r);
    }
  }

}

module lilarm_r() {
  _r = arm_r;
  p = [[0,0,0],[0,-5,1],[0,-8,3],[-2,-8,4],[-4,-8,4]];

  for (i = [1:len(p)-1]) {
    hull() {
       translate(p[i-1]) sphere(_r);
       translate(p[i]) sphere(_r);
    }
  }

}

module lilfoot() {
  _r0 = 3;
  _r1 = 1;
  p = [[0,0,0],[0,0,5.75],[0,1,6]];
  r = [3,3,2.8];

  for (i = [1:len(p)-1]) {
    hull() {
       translate(p[i-1]) sphere(r[i-1]);
       translate(p[i]) sphere(r[i]);
    }
  }

}

module watcho_face() {
  _or = 2.5;
  ox = OUTER_W/2;
  oy = OUTER_H/2;
  oz = OUTER_Z/2;

  difference() {

    union() {
      lilbody();
      translate([-18,-13,0]) lilarm_l();
      translate([ 18,-13,0]) lilarm_r();

      translate([-7,-24,0]) lilfoot();
      translate([ 7,-24,0]) lilfoot();
    };
    //translate([0,0,-5/2]) cube([OUTER_W, OUTER_H, 5],center=true);
    translate([0,0,-5/2]) cube([OUTER_W+10, OUTER_H+10, 5],center=true);
    translate([0,0, 1]) cube([OUTER_W-5,OUTER_H-5,4], center=true);
  }

}

module access_holes() {

  trude = 10;
  c0y = 9.75;
  c1y= 36.2;
  c0x = 35;

  bx = 0.325;
  bh = 3.55;
  br = 0.75;
  bz = 2.2;

  usb_dw0 = 3.75;
  usb_dw1 = 3;
  usb_p = [ [-usb_dw0,1], [-usb_dw0,0], [-usb_dw1,-1], [usb_dw1,-1], [usb_dw0,0], [usb_dw0,1] ];
  usb_r = 0.25;
  usbx = 10;
  usby = 22.5;

  color([0.5,0,0])
  translate([0,c0y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0,0])
  translate([c0x,c0y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0,0])
  translate([0,c1y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }


  color([0.5,0,0])
  translate([c0x,c1y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0.0])
  translate([0,usby,bz]) rotate(90,[0,1,0]) rotate(-90, [0,0,1]) linear_extrude(height=trude, center=true)
  hull() {
    for (i = [0:len(usb_p)-1]) {
      translate([usb_p[i][0], usb_p[i][1], 0]) circle(usb_r);
    }
  }

  color([0,0,0.2])
  translate([17,26,0])
    cube([30,30,40], center=true);

}


module access_holes_bottom() {

  trude = 10;
  c0y = 9.75;
  c1y= 36.2;
  c0x = 35;

  bx = 0.325;
  bh = 3.55;
  br = 0.75;
  bz = 2.2;

  usb_dw0 = 3.75;
  usb_dw1 = 3;
  usb_p = [ [-usb_dw0,1], [-usb_dw0,0], [-usb_dw1,-1], [usb_dw1,-1], [usb_dw0,0], [usb_dw0,1] ];
  usb_r = 0.25;
  usbx = 10;
  usby = 22.5;

  color([0.5,0,0])
  translate([0,c0y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0,0])
  translate([c0x,c0y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0,0])
  translate([0,c1y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }


  color([0.5,0,0])
  translate([c0x,c1y,bz]) rotate(90,[0,1,0]) linear_extrude(height=trude, center=true) 
  union() {
    hull() {
      translate([ bx, (bh/2 - br), 0]) circle(br);
      translate([-bx, (bh/2 - br), 0]) circle(br);
      translate([-bx,-(bh/2 - br), 0]) circle(br);
      translate([ bx,-(bh/2 - br), 0]) circle(br);

    }
  }

  color([0.5,0.0])
  translate([35,0,0]) translate([0,usby,bz]) rotate(90,[0,1,0]) rotate(90, [0,0,1]) linear_extrude(height=trude, center=true)
  hull() {
    for (i = [0:len(usb_p)-1]) {
      translate([usb_p[i][0], usb_p[i][1], 0]) circle(usb_r);
    }
  }

  // screw holes

}


//access_holes();

//color([55/256,140/256,120/256]) translate([OUTER_W/2,OUTER_H/2,0]) watcho();
//color([75/256,154/256,135/256]) translate([OUTER_W/2 - 2.5,OUTER_H/2 - 2.5,-10]) watcho();

module fin() {
  difference() {
    color([75/256,154/256,135/256])  translate([17,23,2]) watcho_face();
    access_holes();
  }
}

module fin1() {
  difference() {
    
    difference() {
      translate([17,23,2]) 
      difference() {

        union() {
          lilback();
          rotate(180,[0,1,0]) union() {
            translate([-18,-13,0])  lilarm_l();
            translate([ 18,-13,0]) lilarm_r();

            translate([-7,-24,0]) lilfoot();
            translate([ 7,-24,0]) lilfoot();
          }
        }

        translate([0,0,-20/2]) cube([OUTER_W+25, OUTER_H+25, 20],center=true);
        translate([0,0, 1]) cube([OUTER_W-5,OUTER_H-5,4], center=true);
      }
      access_holes_bottom();
    }
    //wip
  //  access_holes();
  }
}

fin();
translate([34,0,0]) rotate(180,[0,1,0]) fin1();


//import("uno_top.stl");
//translate([100,0,0]) import("uno_bottom_24mm.stl");
//lilpill(20,5,0.75);
//lilcircle(10,1.5);
