/*
 * 
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

#include <stdio.h>
#include <stdlib.h>

#include <string.h>
#include <getopt.h>
#include <unistd.h>
#include <errno.h>
#include <math.h>

#include <sys/time.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#include <string>

#include "lodepng.h"
#include "simplexnoise1234.h"

struct option longopt[] = {
  {"help", no_argument, 0, 'h'},
  {"width", required_argument, 0, 'W'},
  {"height", required_argument, 0, 'H'},
  {"alpha", required_argument, 0, 'A'},
  {0,0,0,0},
};

void show_help(FILE *fp) {
  fprintf(fp, "\n");
  fprintf(fp, "noise image\n");
  fprintf(fp, "\n");
  fprintf(fp, "usage:    noimg [-W width] [-H height] [-A alpha] [-h] [-x x] [-y y] [-s s] <file>\n");
  fprintf(fp, "\n");
  fprintf(fp, "  -H|--height <height>       height\n");
  fprintf(fp, "  -W|--width <width>         width\n");
  fprintf(fp, "  -A|--alpha <alpha>         alpha\n");
  fprintf(fp, "  -x <x>                     start x (default 0)\n");
  fprintf(fp, "  -y <y>                     start y (default 0)\n");
  fprintf(fp, "  -s <scale>                 scale (default 1)\n");
  fprintf(fp, "  -u <u>                     upper scale (0 to 1, 1 default)\n");
  fprintf(fp, "  -l <l>                     lower scale (0 to 1, 0 default)\n");
  fprintf(fp, "  -z <z>                     z value (0 default)\n");
  fprintf(fp, "  -h|--help                  help\n");
  fprintf(fp, "  <file>                     output png file\n");
  fprintf(fp, "\n");
}

typedef struct noimg_opt_type {
  int width;
  int height;
  double alpha;

  double start_x;
  double start_y;

  double scale_x;
  double scale_y;

  double upper_threshold;
  double lower_threshold;

  double z;

  std::string filename;
} noimg_opt_t;

double _clamp(double a, double l, double u) {
  if (a<l) { return l; }
  if (a>u) { return u; }
  return a;
}

int main(int argc, char **argv) {
  int option_index, ch;
  int i, j;
  noimg_opt_t opt;
  float f, x, y;

  unsigned char *img_b=NULL;
  size_t fn_sz=0;
  unsigned int r;

  opt.width = 0;
  opt.height = 0;
  opt.alpha = 1.0;

  opt.scale_x = 1.0;
  opt.scale_y = 1.0;

  opt.start_x = 1.0;
  opt.start_y = 1.0;

  opt.z = 0.0;
  opt.lower_threshold = 0.0;
  opt.upper_threshold = 1.0;

  while ((ch=getopt_long(argc, argv, "vhW:H:A:x:y:s:u:l:z:", longopt, &option_index)) >= 0) {
    switch (ch) {
      case 'W':
        opt.width  = atoi(optarg);
        break;
      case 'H':
        opt.height = atoi(optarg);
        break;
      case 'A':
        opt.alpha = atof(optarg);
        break;

      case 's':
        opt.scale_x = atof(optarg);
        opt.scale_y = atof(optarg);
        break;

      case 'x':
        opt.start_x = atof(optarg);
        break;
      case 'y':
        opt.start_y = atof(optarg);
        break;

      case 'z':
        opt.z = atof(optarg);
        break;
      case 'u':
        opt.upper_threshold = _clamp(atof(optarg), 0.0, 1.0);
        break;
      case 'l':
        opt.lower_threshold = _clamp(atof(optarg), 0.0, 1.0);
        break;

      case 'h':
        show_help(stdout);
        exit(0);
        break;
      default:
        show_help(stderr);
        exit(1);
        break;
    }
  }

  if (optind < argc) {
    opt.filename = argv[optind];
  }

  //---

  if ((opt.width <= 0) ||
      (opt.height <= 0)) {
    fprintf(stderr, "width and height must > 0\n");
    show_help(stderr);
    exit(-1);
  }

  if ((opt.alpha < 0.0) || (opt.alpha > 1.0)) {
    fprintf(stderr, "alpha must be in [0,1]\n");
    show_help(stderr);
    exit(-2);
  }

  if (opt.filename.size() == 0) {
    fprintf(stderr, "provide destination png\n");
    show_help(stderr);
    exit(-3);
  }

  if (opt.lower_threshold >= opt.upper_threshold) {
    fprintf(stderr, "lower threshold (%f) must be less than upper threshold (%f)\n",
        (float)opt.lower_threshold, (float)opt.upper_threshold);
    show_help(stderr);
    exit(-11);
  }

  //---


  img_b = (unsigned char *)malloc(sizeof(unsigned char)*opt.width*opt.height*4);
  if (img_b==NULL) {
    fprintf(stderr, "allocation error (%lli)\n",
        (long long int)(sizeof(unsigned char)*opt.width*opt.height*4));
    exit(-4);
  }

  for (i=0; i<opt.width; i++) {
    for (j=0; j<opt.height; j++) {
      x = (float)i / (float)opt.width;
      y = (float)j / (float)opt.height;

      //f = (snoise2(opt.start_x + (opt.scale_x*x), opt.start_y + (opt.scale_y*y)) + 1.0)/(2.0 + (1.0/65536.0));
      f = snoise3(opt.start_x + (opt.scale_x*x), opt.start_y + (opt.scale_y*y), opt.z);
      f += 1.0;
      f /= (2.0 + (1.0/65536.0));
      f = (f*(opt.upper_threshold - opt.lower_threshold)) + opt.lower_threshold;

      img_b[4*(j*opt.width + i) + 0] = (int)(f*255.0);
      img_b[4*(j*opt.width + i) + 1] = (int)(f*255.0);
      img_b[4*(j*opt.width + i) + 2] = (int)(f*255.0);
      img_b[4*(j*opt.width + i) + 3] = (int)(opt.alpha*255.0);
    }
  }

  r = lodepng_encode32_file(opt.filename.c_str(), img_b, (unsigned)opt.width, (unsigned)opt.height);
  if (r<0) {
    perror(opt.filename.c_str());
    exit(-5);
  }

  return 0;
}
