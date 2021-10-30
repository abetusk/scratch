// license: CC0
//

FN = 20;

outer_d = 15;
outer_ledge = 12.92;

//inner_width = 4.09;
inner_width = 3.05;
inner_height = 3.27;

z_height = 5.86;

material_height = 3.13;

//_insert_length  = z_height + material_height + 2;
_insert_length  = z_height + 2*material_height + 4;

forefinger_length = 35;
knuckle_length = 30;

knuckle_d = 25;
forefinger_d = 21;

module _model() {
  
  difference() {
    union() {
      circle(outer_d/2);
      translate([0, outer_d/4]) square([outer_ledge, outer_d/2], center=true);
    }
    
    square([inner_width, inner_height], center=true);
  }

}


module _insert() {
  square([inner_width, _insert_length], center=true);
}

module forefinger() {
  difference() {
    square([forefinger_length, outer_d], center=true);
    translate([-forefinger_length/2+5, 0])
      square([inner_width, material_height], center=true);
    translate([ forefinger_length/2-5, 0])
      square([inner_width, material_height], center=true);
    translate([0,outer_d/2]) square([material_height, outer_d], center=true);
  }
}

module forefinger_loop() {
  _h = outer_d + 4;
  _w = _insert_length-4;
  _od = forefinger_d+4;
  _m  = material_height;
  difference() {
    union() {
      square([_w, _h], center=true);
      square([knuckle_d + _w, _h], center=true);
      translate([  _w/2 + _od/2, 0]) circle(_od/2, $fn=FN);
      translate([-(_w/2 + _od/2), 0]) circle(_od/2, $fn=FN);
    }
    translate([_insert_length/2-_m,_h/4]) square([material_height, _h/2 + 0.5], center=true);
    translate([-_insert_length/2+_m,_h/4]) square([material_height, _h/2 + 0.5], center=true);
    translate([-_od/2 - _w/2, 0]) circle(forefinger_d/2, $fn=FN);
    translate([ _od/2 + _w/2, 0]) circle(forefinger_d/2, $fn=FN);
  }
}

module knuckle() {
  _cr =  3;
  _mcd = outer_d + 4 - 4*_cr ;
  difference() {
    union() {
      square([knuckle_length, outer_d+4], center=true);
      translate([knuckle_length/2, 0]) circle((outer_d+4)/2);
      translate([-knuckle_length/2 + _cr/4, outer_d/2 + 2 - _cr ]) circle(_cr, $fn=FN);
      translate([-knuckle_length/2 + _cr/4, -outer_d/2 - 2 + _cr ]) circle(_cr, $fn=FN);
    }
    translate([-knuckle_length/2 , 0]) circle(_mcd/2, $fn=FN);
    translate([knuckle_length/2, 0]) circle(outer_d/2);
    translate([0, (outer_d+4)/2]) square([material_height, (outer_d+4)], center=true);
  }
}

module knuckle_loop() {
  _h = outer_d + 4;
  _w = 3*material_height;
  _od = knuckle_d+4;
  difference() {
    union() {
      square([_w, _h], center=true);
      square([knuckle_d + _w, _h], center=true);
      translate([  _w/2 + _od/2, 0]) circle(_od/2, $fn=FN);
      translate([-(_w/2 + _od/2), 0]) circle(_od/2, $fn=FN);
    }
    translate([0,_h/4]) square([material_height, _h/2 + 0.5], center=true);
    translate([-_od/2 - _w/2, 0]) circle(knuckle_d/2, $fn=FN);
    translate([ _od/2 + _w/2, 0]) circle(knuckle_d/2, $fn=FN);
  }
}

translate([20,20]) _insert();
translate([20,40]) _insert();
translate([0,20]) forefinger();
translate([0,40]) forefinger();
knuckle();
translate([0,-25]) knuckle_loop();

translate([38,16]) rotate(90, [0,0,1]) forefinger_loop();