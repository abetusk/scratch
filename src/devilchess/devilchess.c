//  
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//      
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

#include <stdio.h>
#include <stdlib.h>

#include <stdint.h>
#include <string.h>

int DEBUG = 0;

// 0000 a
// 0001 b
// 0010 c
// 0011
// 0100 d
// 0101 
// 0110 
// 0111 a
//
// 1000 a
// 1001 b
// 1010 c
// 1011
// 1100 d
// 1101
// 1110 b
// 1111 a

uint64_t g_hc4[] = {
  0,  1,  2,  3,  4,
  0,  1,  2,  3,  4,
  0,  1,  2,  3,  4,
  0,  1,  2,  3,  4,
};

uint64_t g_hc2[] = { 0, 0, 1, 1};

uint64_t b8xy(uint64_t z, uint64_t x, uint64_t y) {
  uint64_t s=0;
  s = (8*y) + x;
  return z & (((uint64_t)1) << s);
}

uint64_t xorrow(uint64_t z, int par, uint64_t block) {

  uint64_t sy, yidx, xidx, b=0;
  uint64_t stride=8;
  uint64_t begy=0;

  if (par==1)  { begy = block; }

  stride = 2*block;

  for (sy=begy; sy<8; sy+=stride) {
    for (yidx=0; yidx<block; yidx++) {
      for (xidx=0; xidx<8; xidx++) {

        if (DEBUG) {
        printf("x:%llu y:%llu %i\n",
            (unsigned long long)(xidx),
            (unsigned long long)(sy+yidx),
            (b8xy(z, xidx, sy+yidx) ? 1 : 0));
        }

        b ^= (b8xy(z, xidx, sy+yidx) ? 1 : 0);
      }
    }
  }

  return b;
}

uint64_t xorcol(uint64_t z, int par, uint64_t block) {

  uint64_t sx, yidx, xidx, b=0;
  uint64_t stride=8;
  uint64_t begx=0;

  if (par==1)  { begx = block; }

  stride = 2*block;

  for (sx=begx; sx<8; sx+=stride) {
    for (xidx=0; xidx<block; xidx++) {
      for (yidx=0; yidx<8; yidx++) {

        if (DEBUG) {
        printf("x:%llu y:%llu %i\n",
            (unsigned long long)(sx+xidx),
            (unsigned long long)(yidx),
            (b8xy(z, sx+xidx, yidx) ? 1 : 0));
        }

        b ^= (b8xy(z, sx+xidx, yidx) ? 1 : 0);
      }
    }
  }

  return b;
}

uint64_t xorsq8(uint64_t z, int C, uint64_t block) {
  uint64_t ix, iy, b, idx_x, idx_y;

  uint64_t sx, sy, stride, begx, begy;

  switch (C) {
    case 0: sx=0; sy=0; break;
    case 1: sx=1; sy=0; break;
    case 2: sx=0; sy=1; break;
    case 3: sx=1; sy=1; break;
  }

  stride = ((uint64_t)2)*block;

  sx *= block;
  sy *= block;

  b = 0;
  for (begy=sy; begy<8; begy+=stride) {
    for (begx=sx; begx<8; begx+=stride) {
      iy = begy;
      for (idx_y=0; idx_y<block; idx_y++) {
        ix = begx;
        for (idx_x=0; idx_x<block; idx_x++) {


          //printf("ix:%llu, iy:%llu %i\n", (unsigned long long)ix, (unsigned long long)iy, (b8xy(z,ix,iy) ? 1 : 0) );


          b ^= (b8xy(z,ix,iy) ? 1 : 0);
          ix++;
        }
        iy++;
      }
    }
  }

  return b;
}

uint64_t board_decode(uint64_t z, uint64_t *s) {
  int i;
  uint64_t u, b, v;
  uint64_t res=0;

  for (i=0; i<6; i++) {
    u = ((i<3) ? 0 : 1);

    switch (i%3) {
      case 0: b=4; break;
      case 1: b=2; break;
      case 2: b=1; break;
    }

    //b = ( ((i<3) ? (4/(1<<i)) : (4/(1<<(i-3)))) );
    if (DEBUG) {
    printf("i%i, u%llu, b%llu\n",
        i, (unsigned long long)u, (unsigned long long)b);
    }

    if (i<3) {
      u = xorcol(z, 0, b);
      v = xorcol(z, 1, b);

      //printf("i:%i ?? %i %i\n", i, (int)u, (int)v);

      s[i] = u + 2*v;
    }
    else {
      u = xorrow(z, 0, b);
      v = xorrow(z, 1, b);

      //printf("i:%i ?? %i %i\n", i, (int)u, (int)v);

      s[i] = u + 2*v;
    }
  }

  for (i=0; i<6; i++) {
    if (!g_hc2[ s[i] ]) {


      res += (((uint64_t)1)<<i);

      //printf("i:%i, s[i]: %i, res %llu\n", (int)i, (int)s[i], (unsigned long long)res);
    }
  }

  return res;
}

void board_encode(uint64_t z, uint64_t pos) {

}

void i2a(uint64_t u, uint64_t *a) {
  uint64_t i;



  for (i=0; i<6; i++) {
    a[i] = 0;
    a[i] = ( (uint64_t)( u & (((uint64_t)1)<<i) ) ? 1 : 0 );
  }
}

void debug_print(uint64_t z, uint64_t s) {
  uint64_t i, j;
  
  if (s==0) { s = 16; }

  for (j=0; j<8; j++) {
    if ((j>0) && ((j%s)==0)) { printf("\n"); }
    for (i=0; i<8; i++) {
      if ((i>0) && ((i%s)==0)) { printf(" "); }
      printf("%c", (b8xy(z, i, j) ? '1' : '.'));
    }
    printf("\n");
  }
  printf("\n");
}

uint64_t mkchoice(uint64_t z, uint64_t choice, char *v_sched) {
  int i;
  uint64_t choice_s[6], board_state[6], b;
  uint64_t xidx=0, yidx=0;
  uint64_t pos;

  i2a(choice, choice_s);
  board_decode(z, board_state);

  if (DEBUG) {
  printf("choice(%i): %i %i %i %i %i %i\n",
      (int)choice,
      (int)choice_s[0], (int)choice_s[1], (int)choice_s[2],
      (int)choice_s[3], (int)choice_s[4], (int)choice_s[5] );

  printf("board_state(%llu): %i %i %i %i %i %i\n",
      (unsigned long long)z,
      (int)board_state[0], (int)board_state[1], (int)board_state[2],
      (int)board_state[3], (int)board_state[4], (int)board_state[5] );
  }


  for (i=0; i<3; i++) {

    /*
    b = g_hc2[ board_state[i] ];

    // 00 -> 01 (r)
    if ((board_state[i]==0) &&
        (b==0) && (choice_s[i]==0)) {
      v_sched[i] = 'r';
    }

    // 00 -> 10 (l)
    else if ( (board_state[i]==0) &&
              (b==0) && (choice_s[i]==1)) {
      v_sched[i] = 'l';
    }

    // 
    else if ( (board_state[i]==0) &&
              (b==0) && (choice_s[i]==1)) {
      v_sched[i] = 'l';
    }

    switch (board_state[i]) {
      case 0:  v_sched[i] = ((b==choice_s[i]
    }
    */

    b = g_hc2[ board_state[i] ];
    if (b == choice_s[i]) {
      v_sched[i] = 'l';
      xidx += 4>>i;
    }
    else {
      v_sched[i] = 'r';
    }
  }

  for (i=3; i<6; i++) {
    b = g_hc2[ board_state[i] ];
    if (b == choice_s[i]) {
      v_sched[i] = 'u';
      yidx += 4>>(i-3);
    }
    else {
      v_sched[i] = 'd';
    }
  }

  pos = 8*yidx + xidx;

  z ^= (((uint64_t)1)<<pos);

  if (DEBUG) {
  printf("xidx: %i, yidx: %i\n", (int)xidx, (int)yidx);
  }

  return z;
}

void rando(uint64_t seed) {
  uint64_t i, x, y, t;
  uint64_t z=0, a=0, w=0;
  int u;
  //int seed=0;

  char sched[6];

  uint64_t choice_s[6], guess_s[6];
  uint64_t state[6] = {0};

  uint64_t choice, guess;
  uint64_t xx, yy;


  //if (argc>1) { seed = atoi(argv[1]); }

  printf("# seed: %i\n", (int)seed);
  srand((unsigned int)seed);

  for (i=0; i<64; i++) {
    if (rand()%2) {
      z |= ( ((uint64_t)1) << i );
    }
  }
  printf("# z: %llu\n", (unsigned long long)z);

  choice = rand() % 64;

  w = mkchoice(z, choice, sched);

  //printf("# choice: %i\n", (int)choice);

  for (i=0; i<6; i++) {
    printf("%c", sched[i]);
  }
  printf("\n");

  guess = board_decode(w, state);


  i2a(choice, choice_s);
  printf("# choice(%llu): %i %i %i %i %i %i\n",
      //(unsigned long long)z,
      (unsigned long long)choice,
      (int)choice_s[0], (int)choice_s[1], (int)choice_s[2],
      (int)choice_s[3], (int)choice_s[4], (int)choice_s[5] );

  i2a(guess, guess_s);
  printf("# guess(%llu): %i %i %i %i %i %i\n",
      //(unsigned long long)w,
      (unsigned long long)guess,
      (int)guess_s[0], (int)guess_s[1], (int)guess_s[2],
      (int)guess_s[3], (int)guess_s[4], (int)guess_s[5] );

  //guess = board_decode(w, state);
  //printf("guess(%i):", (int)guess);
  //for (i=0; i<6; i++) {
  //  printf(" %llu", (unsigned long long)state[i]);
  //}
  //printf("\n\n");


  printf("\n");

  printf("Z STATE:\n");
  debug_print(z, 4);
  printf("---\n");
  printf("---\n");

  printf("W STATE:\n");
  debug_print(w, 4);
  printf("---\n");
  printf("---\n");

  /*
  printf("\n\n---\n\n");
  debug_print(z, 2);
  printf("\n\n---\n\n");
  debug_print(z, 0);
  printf("\n\n---\n\n");
  */

  board_decode(z, state);
  for (i=0; i<6; i++) {
    printf(" %llu", (unsigned long long)state[i]);
  }
  printf("\n");
  //exit(0);

  /*
  xx = z ^ (((uint64_t)1) << 21);
  yy = board_decode(xx, state);
  printf("test... (%i)", (int)yy);
  for (i=0; i<6; i++) {
    printf(" %llu", (unsigned long long)state[i]);
  }
  printf("\n");
  //exit(0);
  */

  exit(0);

  t = xorcol(z, 0, 4);
  printf("col: %llu, 0, 4: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorcol(z, 1, 4);
  printf("col: %llu, 1, 4: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorcol(z, 0, 2);
  printf("col: %llu, 0, 2: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorcol(z, 1, 2);
  printf("col: %llu, 1, 2: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorcol(z, 0, 1);
  printf("col: %llu, 0, 1: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorcol(z, 1, 1);
  printf("col: %llu, 1, 1: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  //---


  t = xorrow(z, 0, 4);
  printf("row: %llu, 0, 4: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorrow(z, 1, 4);
  printf("row: %llu, 1, 4: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorrow(z, 0, 2);
  printf("row: %llu, 0, 2: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorrow(z, 1, 2);
  printf("row: %llu, 1, 2: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorrow(z, 0, 1);
  printf("row: %llu, 0, 1: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  t = xorrow(z, 1, 1);
  printf("row: %llu, 1, 1: %llu\n",
      (unsigned long long)z,
      (unsigned long long)t);

  exit(0);

  //--

}

void help(void) {
  printf("\nusage:\n");
  printf("\n");
  printf("  devilchess <seed|state> [choose|decode] [pos]\n");
  printf("\n");
}

uint64_t randstate(void) {
  uint64_t z=0, i;

  for (i=0; i<64; i++) {
    if (rand()%2) {
      z |= ( ((uint64_t)1) << i );
    }
  }
  //printf("# z: %llu\n", (unsigned long long)z);

  return z;
}

int main(int argc, char **argv) {
  uint64_t i, x, y, t;
  uint64_t z=0, a=0, w=0;
  int u;
  unsigned int seed=0;
  uint64_t useed=0;

  char sched[6];

  uint64_t choice_s[6], guess_s[6];
  uint64_t state[6] = {0};

  uint64_t choice, guess;
  uint64_t xx, yy;

  int pos;

  if (argc<=1) {
    help();
    exit(1);
  }

  useed = strtoull(argv[1], NULL, 10);

  if (argc==2) {
    //useed = strtoull(argv[1], NULL, 10);
    //seed = atoi(argv[1]);
    rando(useed);
    exit(0);
  }

  if (argc==3) {
    if (strncmp(argv[2], "decode", strlen("decode"))==0){

      guess = board_decode(useed, state);
      printf("%i\n", (int)guess);

    }
    else {
      help();
      exit(1);
    }
  }

  if (argc==4) {
    pos = atoi(argv[3]);
    seed = (unsigned int)useed;
    if (strncmp(argv[2], "choose", strlen("choose"))==0) {
      srand(seed);

      z = randstate();
      w = mkchoice(z, pos, sched);

      printf("%llu\n", (unsigned long long)w);
    }

    else {
      help();
      exit(-1);
    }
    
  }


}


