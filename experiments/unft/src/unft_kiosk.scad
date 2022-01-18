// License: CC0

FN=32;

FRONT_WIDTH = 140;
FRONT_HEIGHT = 250;

EINK_WINDOW_HEIGHT = 90;
EINK_WINDOW_WIDTH = 66;
EINK_WINDOW_X_OFFSET = 4;

EINK_SCREW_R = 3.15/2;
//EINK_SCREW_DY = 100;
//EINK_SCREW_DX = 75.5;
EINK_SCREW_DY = 97;
EINK_SCREW_DX = 72.5;

THERM_WINDOW_WIDTH = 71.5;
THERM_WINDOW_HEIGHT = 46;  //45
THERM_SCREW_DX = 74.75;
THERM_SCREW_DY = 18.25;
THERM_SCREW_R = 2.75/2;

THERM_WINDOW_Y_OFFSET = -2; // 12; // 16

BUTTON_R = 28/2;

RPI_SCREW_DX = 58;
RPI_SCREW_DY = 23;
RPI_SCREW_R = 2.75/2;

module front_panel() {
  
  eink_cx = 0;
  eink_cy = 50;

  button_cx = 0;
  button_cy = -25;

  therm_cx = 0;
  therm_cy = -75;
  
  edx = EINK_SCREW_DX;
  edy = EINK_SCREW_DY;
  er = EINK_SCREW_R;
  
  ewx = EINK_WINDOW_WIDTH;
  ewy = EINK_WINDOW_HEIGHT;
  eo = EINK_WINDOW_X_OFFSET;
  
  tdx = THERM_SCREW_DX;
  tdy = THERM_SCREW_DY;
  tr = THERM_SCREW_R;
  
  twx = THERM_WINDOW_WIDTH;
  twy = THERM_WINDOW_HEIGHT;
  tu  = THERM_WINDOW_Y_OFFSET;
  
  
  difference() {
    square([FRONT_WIDTH, FRONT_HEIGHT], center=true);

    translate([eink_cx-eo, eink_cy])
    union() {
      translate([-edx/2, -edy/2]) circle(er, $fn=FN);
      translate([ edx/2, -edy/2]) circle(er, $fn=FN);
      translate([ edx/2,  edy/2]) circle(er, $fn=FN);
      translate([-edx/2,  edy/2]) circle(er, $fn=FN);
    }
    
    translate([eink_cx, eink_cy])
     square([ewx, ewy], center=true);
    
    
    translate([therm_cx, therm_cy])
    union() {
      translate([-tdx/2, -tdy/2]) circle(tr, $fn=FN);
      translate([ tdx/2, -tdy/2]) circle(tr, $fn=FN);
      translate([ tdx/2,  tdy/2]) circle(tr, $fn=FN);
      translate([-tdx/2,  tdy/2]) circle(tr, $fn=FN);
      
      translate([0, tu]) square([twx,twy], center=true);
    }
    
    translate([button_cx, button_cy])
    circle(BUTTON_R, $fn=FN);
    
    
  }
}

rotate(90, [0,0,1])
translate([0,0,-2])
front_panel();