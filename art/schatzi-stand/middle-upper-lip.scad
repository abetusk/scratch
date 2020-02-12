// License: CC0
//

$fn=32;

_m1_r = 1/2;
_m2_r = 2/2;
_m3_r = 3/2;


_bearing_outer_r = 5/2;
_bearing_inner_r = 2/2;

_linkage_w = 20;

_lip_dx = -12;
_lip_dy = -25;
_lip_w = 5;
_lip_h = 4;

_lip_actuator_gap_dx = 20;
_lip_actuator_gap_dy = 10;

_servo_wheel_r = 16/2;
_servo_access_r = 8/2;
_servo_wheel_ds = (14.5+13)/2;
_servo_wheel_ns = 12;

_lip_link_top_actuator_w = 10;

_servo_w = 20.5;
_servo_d = 9;
_servo_h = 19.5;
_servo_dw = (21.5 + 26.75)/2;

_servo_shift_dx = _servo_w + 10;
_servo_shift_gap_z = 30;
_servo_shift_h = 40;
_servo_shift_w = 30;

module lip_actuator() {
  
  _bor = _bearing_outer_r;
  _bir = _bearing_inner_r;
  
  difference() {
    union() {
      translate([0, _linkage_w/2]) circle(_bor);
      translate([0,-_linkage_w/2]) circle(_bor);
      
      translate([-_bor,0]) square([2*_bor,_linkage_w], center=true);
      
      translate([_lip_dx, _lip_dy]) square([_lip_w, _lip_h], center=true);
      translate([_lip_dx-_lip_w/2, _lip_dy]) circle(_lip_h/2);
      
      
      hull() {
        translate([_lip_dx+_lip_w/2-_m2_r, _lip_dy+_m2_r]) circle(_m2_r);
        translate([_lip_dx+_lip_w/2-_m2_r, _lip_dy+6]) circle(_m2_r);
      };
      
      hull() {
        translate([_lip_dx+_lip_w/2-_m2_r, _lip_dy+6]) circle(_m2_r);
        translate([-_bor,-_linkage_w/2 + _bor]) circle(_m2_r);
      }
    };
    
    translate([0,  _linkage_w/2]) circle(_bir);
    translate([0, -_linkage_w/2]) circle(_bir);
    
    translate([-_bor,  _linkage_w/4]) circle(_m2_r);
    translate([-_bor, -_linkage_w/4]) circle(_m2_r);
    translate([_lip_dx, _lip_dy]) circle(_m2_r);
  }  
  
}

module lip_link_top() {
  _bor = _bearing_outer_r;
  _bir = _bearing_inner_r;

  difference() {
    union() {
      hull() {
        circle(_bor);
        translate([_lip_actuator_gap_dx/3, _lip_actuator_gap_dy]) circle(_bor);
      }
      hull() {
        translate([_lip_actuator_gap_dx/3, _lip_actuator_gap_dy]) circle(_bor);
        translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) circle(_bor);
      }
    }
    
    circle(_bir);
    translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) circle(_bir);
  }
}


module lip_link_bottom() {
  _bor = _bearing_outer_r;
  _bir = _bearing_inner_r;

  difference() {
    union() {
      hull() {
        circle(_bor);
        translate([_lip_actuator_gap_dx/3, _lip_actuator_gap_dy]) circle(_bor);
      }
      
      translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) circle(_servo_wheel_r+2*_m1_r);
      hull() {
        translate([_lip_actuator_gap_dx/3, _lip_actuator_gap_dy]) circle(_bor);
        translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) circle(_bor);
      }
    }
    
    circle(_bir);
    translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) circle(_servo_access_r);
    
    for (ang = [0: (360/_servo_wheel_ns): 360]) {
      translate([_lip_actuator_gap_dx, _lip_actuator_gap_dy]) rotate(ang, [0,0,1]) translate([_servo_wheel_ds/2,0]) circle(_m1_r);
    }
  }
}

module lip_link_top_actuator() {
  _bor = _bearing_outer_r;
  _bir = _bearing_inner_r;

  difference() {
    union() {
      hull() {
        circle(_bor);
        translate([_lip_link_top_actuator_w,0]) circle(_bor);
      };

      translate([_lip_link_top_actuator_w,0]) circle(_servo_wheel_r+2*_m1_r);

      translate([_lip_link_top_actuator_w + _servo_wheel_r + 2*_m1_r, 0])
      hull() {
        translate([0, 0]) circle(_bor);
        translate([_bor, 0]) circle(_bor);
      };

      translate([_lip_link_top_actuator_w, (_servo_wheel_r + 2*_m1_r)])
      hull() {
        translate([0, 0]) circle(_bor);
        translate([0,_bor]) circle(_bor);
      };
      
      translate([_lip_link_top_actuator_w, -(_servo_wheel_r + 2*_m1_r)])
      hull() {
        translate([0, 0]) circle(_bor);
        translate([0,-_bor]) circle(_bor);
      };

    }

    circle(_bir);
    translate([_lip_link_top_actuator_w,0]) circle(_servo_access_r);
    
    translate([_lip_link_top_actuator_w, -(_servo_wheel_r + 2*_m1_r + _bor)]) circle(_bir);
    translate([_lip_link_top_actuator_w,  (_servo_wheel_r + 2*_m1_r + _bor)]) circle(_bir);
    translate([_lip_link_top_actuator_w +  (_servo_wheel_r + 2*_m1_r + _bor), 0]) circle(_bir);
    
    for (ang = [0: (360/_servo_wheel_ns): 360]) {
      translate([_lip_link_top_actuator_w,0]) rotate(ang, [0,0,1]) translate([_servo_wheel_ds/2,0]) circle(_m1_r);
    }
  }
}

module servo_sleeve_bottom() {
  
  _r = 2;
  _dx = 5;
  _dy = 8;
  
  union() {
    difference() {
      hull() {
        translate([ -(_servo_w - _servo_d/2), 0]) circle(7*_servo_d/8);
        translate([  (_servo_w - _servo_d/2), 0]) circle(7*_servo_d/8);
      };
      square([_servo_w, _servo_d], center=true);
      translate([ -_servo_dw/2,0]) circle(_m2_r);
      translate([  _servo_dw/2,0]) circle(_m2_r);
    }

    difference() {
      translate([ _servo_shift_dx, _servo_shift_gap_z/2])
      hull() {
        translate([  (_servo_shift_w/2 - _r),  (_servo_shift_h/2 - _r) ]) circle(_r);
        translate([ -(_servo_shift_w/2 - _r),  (_servo_shift_h/2 - _r) ]) circle(_r);
        translate([ -(_servo_shift_w/2 - _r), -(_servo_shift_h/2 - _r) ]) circle(_r);
        translate([  (_servo_shift_w/2 - _r), -(_servo_shift_h/2 - _r) ]) circle(_r);
      };
      
      translate([ _servo_shift_dx + _dx/2, _servo_shift_gap_z/2])
      union() {
        translate([-_dx,-_dy]) circle(_m3_r);
        translate([ _dx,-_dy]) circle(_m3_r);
        translate([ _dx, _dy]) circle(_m3_r);
        translate([-_dx, _dy]) circle(_m3_r);
      };

    }

  }  
}


module servo_sleeve_bottom() {
  
  _r = 2;
  _dx = 5;
  _dy = 8;
  
  union() {
    difference() {
      hull() {
        translate([ -(_servo_w - _servo_d/2), 0]) circle(7*_servo_d/8);
        translate([  (_servo_w - _servo_d/2), 0]) circle(7*_servo_d/8);
      };
      square([_servo_w, _servo_d], center=true);
      translate([ -_servo_dw/2,0]) circle(_m2_r);
      translate([  _servo_dw/2,0]) circle(_m2_r);
    }

    difference() {
      translate([ _servo_shift_dx, _servo_shift_gap_z/2])
      hull() {
        translate([  (_servo_shift_w/2 - _r),  (_servo_shift_h/2 - _r) ]) circle(_r);
        translate([ -(_servo_shift_w/2 - _r),  (_servo_shift_h/2 - _r) ]) circle(_r);
        translate([ -(_servo_shift_w/2 - _r), -(_servo_shift_h/2 - _r) ]) circle(_r);
        translate([  (_servo_shift_w/2 - _r), -(_servo_shift_h/2 - _r) ]) circle(_r);
      };
      
      translate([ _servo_shift_dx + _dx/2, _servo_shift_gap_z/2])
      union() {
        translate([-_dx,-_dy]) circle(_m3_r);
        translate([ _dx,-_dy]) circle(_m3_r);
        translate([ _dx, _dy]) circle(_m3_r);
        translate([-_dx, _dy]) circle(_m3_r);
      };

    }

  }  
}

lip_actuator();
translate([6, 10]) lip_link_top();
translate([6, -2]) lip_link_bottom();
translate([2,-15]) lip_link_top_actuator();
translate([45,5]) rotate(-90, [0,0,1]) servo_sleeve_bottom();
translate([90,-20]) rotate(90, [0,0,1]) servo_sleeve_bottom();