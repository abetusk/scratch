include <../utils/bezier.scad>
include <../utils/sweep.scad>

sphere(1.0);

 control_points = adjust_bezier_length([[0, 0, 100], [0, 0, 0], [200, 0, 20], [100, -100, 50]], 250);

 sweep(control_points, circle_points(0.5, $fn = 64));

    curve = bezier_path(control_points);

for(p = control_points)
            translate(p)
                sphere(1);