#include <stdio.h>
#include <stdlib.h>

#include <string.h>

double drand() {
  int r=0;
  r = rand();
  return (double)r / (double)(RAND_MAX + 1.0);
}

int main(int argc, char **argv) {
  double p, q=0.5, M[2];
  int i, it, n_it=1000;
  int val=0, n=16;
  int verbose = 1;

  if (argc>=2) {
    if (strncmp(argv[1], "-h", 2)==0) {
      printf("usage:\n\n  codegenerator [q=0.5] [n_it=1000] [seqlen=16]\n\n");
      exit(0);
    }
    q = atof(argv[1]);
    if (argc>=3) {
      n_it = atoi(argv[2]);
      if (argc>=4) {
        n = atoi(argv[3]);
      }
    }
  }

  M[0] = q;
  M[1] = 1;

  for (it=0; it<n_it; it++) {

    val = rand()%2;
    for (i=0; i<n; i++) {

      if (verbose) { printf("%i", val); }
      
      p = M[val];
      if (drand() <= p) { val = 1-val; }



    }
    if (verbose) { printf("\n"); }

  }

}
