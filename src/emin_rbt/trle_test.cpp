#include <stdio.h>
#include <stdlib.h>

#include <string.h>
#include <stdint.h>
#include <getopt.h>

#include <vector>
#include <string>

#include "TRLE.hpp"

void _estimate() {
  int i, j, D = 10000, N = 128*128*128;
  int idir;

  std::vector< TRLE > m_bv_tile,
                      m_support[6];

  m_bv_tile.resize(D);
  for (idir=0; idir<6; idir++) {
    m_support[idir].resize(D);
  }


  for (i=0; i<D; i++) {
    m_bv_tile[i].init(0, N, 0);
    for (idir=0; idir<6; idir++) {
      m_support[idir][i].init(0, N, 0);
    }
  }

}

int _trle_test0() {
  int N = 10000, M = 100,
      i, j,
      r,
      it=0, n_it=100000;

  TRLE trle;
  int32_t *buf;
  int32_t val;
  int64_t idx;


  buf = (int32_t *)malloc(sizeof(int32_t)*N);
  memset(buf, 0, sizeof(int32_t)*N);

  trle.init(0, N, 0);

  for (it=0; it<n_it; it++) {
    idx = (int64_t) (rand() % N);
    val = (int32_t) (rand() % M);

    buf[idx] = val;
    trle.update(idx, val);
  }


  r = trle.consistency();
  if (r<0) { return r; }
  //printf("got: %i\n", r);

  for (idx=0; idx<N; idx++) {
    r = trle.read( &val, idx );
    if (r<0) {
      //printf("read failed, idx:%i\n", (int)idx);
      return -1;
    }

    if (buf[idx] != val) {
      //printf("buf[%i] %i != %i\n", (int)idx, (int)buf[idx], (int)val);
      return -1;
    }

  }

  //trle.print();
  //printf(">>> node count:%i\n", (int)trle.m_node_count);

  free(buf);
  return 0;
}

int _trle_test1() {
  int N = 10000, M = 10,
      i, j, r,
      it=0, n_it=100000;

  TRLE trle;
  int32_t *buf;
  int32_t val;
  int64_t idx;

  buf = (int32_t *)malloc(sizeof(int32_t)*N);
  memset(buf, 0, sizeof(int32_t)*N);

  trle.init(0, N, 0);

  for (it=0; it<n_it; it++) {
    idx = (int64_t) (rand() % N);
    val = (int32_t) (rand() % M);

    buf[idx] = val;

    trle.update(idx, val);
  }

  r = trle.consistency();
  if (r<0) { return r; }

  for (idx=0; idx<N; idx++) {
    r = trle.read(&val, idx);
    if (r<0) { return r; }

    if (buf[idx] != val) { return -1; }
  }

  printf("node_count:%i/%i\n", (int)trle.m_node_count, (int)N);

  free(buf);
  return 0;
}

int _trle_test2() {
  int N = 10000, M = 10,
      i, j, r,
      it=0, n_it=100000;

  TRLE trle;
  int32_t *buf;
  int32_t val;
  int64_t idx;

  buf = (int32_t *)malloc(sizeof(int32_t)*N);
  memset(buf, 0, sizeof(int32_t)*N);

  trle.init(0, N, 0);

  for (it=0; it<n_it; it++) {
    idx = (int64_t) (rand() % N);
    val = (int32_t) (rand() % M);

    buf[idx] = val;

    trle.update(idx, val);
  }

  r = trle.consistency();
  if (r<0) { return r; }

  for (idx=0; idx<N; idx++) {
    r = trle.read(&val, idx);
    if (r<0) { return r; }

    if (buf[idx] != val) { return -1; }
  }

  for (idx=0; idx<N; idx++) {
    trle.update(idx, 2);
    buf[idx] = 2;
  }

  for (idx=0; idx<N; idx++) {
    r = trle.read(&val, idx);
    if (r<0) { return r; }
    if (buf[idx] != val) { return -1; }
  }

  printf("node_count:%i/%i\n", (int)trle.m_node_count, (int)N);

  free(buf);
  return 0;
}

int main(int argc, char **argv) {
  int r, ch;
  TRLE trle;
  int64_t N = 1021;

  r = _trle_test0();
  printf("_trle_test0(): got %i\n", r);

  r = _trle_test1();
  printf("_trle_test1(): got %i\n", r);

  r = _trle_test2();
  printf("_trle_test2(): got %i\n", r);

  _estimate();
  printf("hit any key to quit\n"); fflush(stdout);
  ch = fgetc(stdin);
  exit(-1);

  trle.init(0, N, 1);

  trle.print();

  r = trle.update(30, 5);
  printf("got:%i (%i)\n", r, trle.consistency());

  r = trle.update(31, 5);
  printf("got:%i (%i)\n", r, trle.consistency());

  r = trle.update(32, 5);
  printf("got:%i (%i)\n", r, trle.consistency());

  //printf("before>--------------------\n");
  //trle.print();
  //printf("before<--------------------\n");


  r = trle.update(31, 0);
  printf("got:%i (%i)\n", r, trle.consistency());

  //trle.print();

  //printf("--------------------\n");
  //printf("--------------------\n");

  printf("--------------------\n");

  //r = trle.update(30, 0);
  //printf("got:%i (%i)\n", r, trle.consistency());

  trle.print();
}

/*
int main(int argc, char **argv) {
  rb_red_blk_tree *tree;
  vir_t *key,
        key_lo,
        key_hi;
  int64_t N = 1021;

  tree = RBTreeCreate(_key_cmp, _key_destroy, _info_destroy, _key_print, _info_print);

  key = (vir_t *)malloc(sizeof(vir_t));
  key->val = 0;
  key->s = 0;
  key->e = N;

  key_lo.val = 0; key_lo.s = 0; key_lo.e = N;
  key_hi.val = 0; key_hi.s = N; key_hi.e = N;

  RBTreeInsert(tree, key, NULL);

  RBTreePrint(tree);
  RBEnumerate(tree, &key_lo, &key_hi);

  RBTreeDestroy(tree);
}
*/
