/*
 * License: CC0 (https://creativecommons.org/publicdomain/zero/1.0/)
 *
 * To the extent possible under law, all copyright and related or neighboring rights are waived
 * on this file.
 * This work is published from: United States.
 */

// Mean to be used from the command line to generate a random integer
//
// Uses 4 bytes from /dev/urandom to create seed if none is provided
// and uses srand/rand to generate the random number.
//
// example usage:
//
// # generate a random integer from 0 to 1 (inclusive)
//   irnd
//
// # generate a random integer from 0 to 9 (inclusive)
//   irnd -n 10
//
// # generate a random integer from 0 to 9 (inclusive) with seed 1234
//   irnd -n 10 -s 1234
//

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include <errno.h>
#include <stdint.h>
#include <unistd.h>

void usage(FILE *fp) {
  fprintf(fp, "\nirnd: command line random number generator (base 10)\n\n");
  fprintf(fp, "usage:\n  irnd [-h] [-n range] [-s seed] [range]\n");
  fprintf(fp, "\n\n");
  fprintf(fp, "  [-n range]   range (default 2)\n");
  fprintf(fp, "  [-s seed]    seed (default random)\n");
  fprintf(fp, "  [-h]         help (this screen)\n");
  fprintf(fp, "\n");
}

int main(int argc, char **argv) {
  double d;
  int i, n = 2;

  uint32_t seed=0;

  FILE *fp;
  unsigned char byt[4] = {0,0,0,0};

  int opt;

  while ((opt = getopt(argc, argv, "hn:s:")) != -1) {
    switch (opt) {
      case 'h':
        usage(stdout);
        exit(0);
        break;
      case 'n':
        n = atoi(optarg);
        break;
      case 's':
        seed = (uint32_t)atol(optarg);
        break;
      default:
        usage(stderr);
        exit(-1);
        break;
    }
  }
  
  if (optind < argc) {
    n = atoi(argv[optind]);
  }

  if (seed==0) {
    fp = fopen("/dev/urandom", "r");
    if (!fp) { perror("/dev/urandom"); exit(-1); }
    for (i=0; i<4; i++) {
      byt[i] = (unsigned char)fgetc(fp);
    }
    fclose(fp);
    seed = (uint32_t)( *((uint32_t *)byt) );
  }


  srand((unsigned int)seed);

  d = (double)( ((double)rand()) / (RAND_MAX + 1.0) );
  printf("%i\n", (int) ( ((double)n) * d ) );
}
