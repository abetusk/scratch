/* 
 * License: CC0
 */

#include <stdio.h>
#include <stdlib.h>

#include <math.h>

#include <fftw3.h>

#define SAMPLE_SIZE 44100

double square_wave(double t, double hz) {
  double s = 0;
  s = (t*hz) - ((int)(t*hz));
  if (s < 0.5) { return -0.5; }
  return 0.5;
}

double saw_wave(double t, double hz) {
  double s = 0;
  s = (t*hz) - ((int)(t*hz));
  return s-0.5;
}

double triangle_wave(double t, double hz) {
  double s = 0;
  s = (t*hz) - ((int)(t*hz));
  if (s<0.5) {
    return (2.0*s) - 0.5;
  }
  return (0.5-s)*2.0 + 0.5;
}

double sine_wave(double t, double hz) {
  return sin(t*hz*2.0*M_PI);
}

void f_wave(double (*f)(double, double), fftw_complex *v, double hz, int n) {
  int i;
  double t;

  for (i=0; i<n; i++) {
    t = (double)i/(double)SAMPLE_SIZE;
    v[i][0] = f(t, hz);
    v[i][1] = 0.0;
  }

}

void print_real(fftw_complex *v, int n) {
  int i;
  double t;
  for (i=0; i<n; i++) {
    t = (double)i/(double)SAMPLE_SIZE;
    printf("%f %f\n", t, v[i][0]);
  }

}

void print_imag(fftw_complex *v, int n) {
  int i;
  double t;
  for (i=0; i<n; i++) {
    t = (double)i/(double)SAMPLE_SIZE;
    printf("%f %f\n", t, v[i][1]);
  }
}

void print_power_t(fftw_complex *v, int n) {
  int i;
  double t;
  for (i=0; i<n; i++) {
    t = (double)i/(double)SAMPLE_SIZE;
    printf("%f %f\n", t, v[i][1]*v[i][1] + v[i][0]*v[i][0]);
  }
}

void print_power_f(fftw_complex *v, int n) {
  int i;
  double t, y;
  for (i=0; i<n; i++) {
    t = (double)i;
    y = v[i][1]*v[i][1] + v[i][0]*v[i][0];
    printf("%f %f\n", t, y);
  }
}

int main(int argc, char **argv) {
  int i, sz;
  fftw_complex *in0, *in1, *in2, *in_0_1, *in_0_2, *out;
  fftw_complex *in_1_3, *in_2_3, *in3;
  fftw_plan p;

  sz = SAMPLE_SIZE;

  in0 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);
  in1 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);
  in2 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);
  in3 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);

  in_0_1 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);
  in_0_2 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);

  in_1_3 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);
  in_2_3 = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);

  out = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * sz);

  /*
  f_wave(square_wave, in0, 440.0, sz);
  f_wave(square_wave, in1, 523.0, sz);
  f_wave(square_wave, in2, 554.0, sz);
  */
  f_wave(triangle_wave, in0, 440.0, sz);
  f_wave(triangle_wave, in1, 523.0, sz);
  f_wave(triangle_wave, in2, 554.0, sz);
  f_wave(triangle_wave, in3, 659.0, sz);

  for (i=0; i<sz; i++) {
    in_0_1[i][0] = (in0[i][0] + in1[i][0])/2.0;
    in_0_1[i][1] = (in0[i][1] + in1[i][1])/2.0;

    in_0_2[i][0] = (in0[i][0] + in2[i][0])/2.0;
    in_0_2[i][1] = (in0[i][1] + in2[i][1])/2.0;

    in_1_3[i][0] = (in1[i][0] + in3[i][0])/2.0;
    in_1_3[i][1] = (in1[i][1] + in3[i][1])/2.0;

    in_2_3[i][0] = (in2[i][0] + in3[i][0])/2.0;
    in_2_3[i][1] = (in2[i][1] + in3[i][1])/2.0;
  }

  //f_wave(triangle_wave, in, 440, SAMPLE_SIZE);
  //f_wave(saw_wave, in, 440, SAMPLE_SIZE);
  //f_wave(sine_wave, in, 440, SAMPLE_SIZE);

  //p = fftw_plan_dft_1d(sz, in_1_3, out, FFTW_FORWARD, FFTW_ESTIMATE);
  p = fftw_plan_dft_1d(sz, in_2_3, out, FFTW_FORWARD, FFTW_ESTIMATE);
  fftw_execute(p);

  print_power_f(out, sz);

  fftw_destroy_plan(p);
  fftw_free(in0);
  fftw_free(in1);
  fftw_free(in2);
  fftw_free(in3);
  fftw_free(in_0_1);
  fftw_free(in_0_2);
  fftw_free(in_1_3);
  fftw_free(in_2_3);
  fftw_free(out);
}
