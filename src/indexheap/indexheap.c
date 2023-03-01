/*
 * LICENSE: CC0
 *
 * To the extent possible under law, the person who associated CC0 with
 * this project has waived all copyright and related or neighboring rights
 * to this project.
 *
 */
    

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include <stdint.h>

typedef struct indexheap_type {

  int64_t size;
  int64_t capacity;

  // source index into heap position
  //
  int64_t *idx_heap;

  // back pointer (index) to idx_heap
  // where the source index can be
  // located
  //
  int64_t *heap_idx_bp;
  union {
    float *heapf;
    double *heapd;
    int32_t *heapi32;
    int64_t *heapi64;
    char *heapc;
  };

  int32_t type;

  
} indexheap_t;

#define indexheap_lchild(_ii) ((2*(_ii))+1)
#define indexheap_rchild(_ii) ((2*(_ii))+2)

// type:
//   0 : float
//   1 : double
//   2 : int32_t
//   3 : int64_t
//   4 : char
//
// -1  :   *a <  *b
//  1  :   *a >  *b
//  0  :   *a == *b
//
static int32_t _cmp_t(void *a, void *b, int32_t type) {
  int32_t i32_a, i32_b;
  int64_t i64_a, i64_b;
  float f_a, f_b;
  double d_a, d_b;
  char c_a, c_b;

  switch (type) {
    case 0:
      f_a = (float)(*((float *)a));
      f_b = (float)(*((float *)b));
      if (f_a < f_b) { return -1; }
      if (f_a > f_b) { return  1; }
      break;

    case 1:
      d_a = (double)(*((double *)a));
      d_b = (double)(*((double *)b));
      if (d_a < d_b) { return -1; }
      if (d_a > d_b) { return  1; }
      break;

    case 2:
      i32_a = (int32_t)(*((int32_t *)a));
      i32_b = (int32_t)(*((int32_t *)b));
      if (i32_a < i32_b) { return -1; }
      if (i32_a > i32_b) { return  1; }
      break;

    case 3:
      i64_a = (int64_t)(*((int64_t *)a));
      i64_b = (int64_t)(*((int64_t *)b));
      if (i64_a < i64_b) { return -1; }
      if (i64_a > i64_b) { return  1; }
      break;

    case 4:
      c_a = (char)(*((char *)a));
      c_b = (char)(*((char *)b));
      if (c_a < c_b) { return -1; }
      if (c_a > c_b) { return  1; }
      break;

    default:
      return 0;
      break;
  }

  return 0;
}

int32_t indexheap_cmp(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  void *a, *b;

  switch (h->type) {
    case 0:
      a = (void *)(&(h->heapf[idx_a]));
      b = (void *)(&(h->heapf[idx_b]));
      break;

    case 1:
      a = (void *)(&(h->heapd[idx_a]));
      b = (void *)(&(h->heapd[idx_b]));
      break;

    case 2:
      a = (void *)(&(h->heapi32[idx_a]));
      b = (void *)(&(h->heapi32[idx_b]));
      break;

    case 3:
      a = (void *)(&(h->heapi64[idx_a]));
      b = (void *)(&(h->heapi64[idx_b]));
      break;

    case 4:
      a = (void *)(&(h->heapc[idx_a]));
      b = (void *)(&(h->heapc[idx_b]));
      break;

    default:
      return 0;
      break;
  }

  return _cmp_t(a, b, h->type);
}

// ???
/*
int32_t __indexheap_cmp_t(indexheap_t *h, int64_t idx_a, int64_t idx_b, int32_t type) {
  int32_t i32_a, i32_b;
  int64_t i64_a, i64_b;
  float f_a, f_b;
  double d_a, d_b;
  char c_a, c_b;

  if ((type == 0) || (type > 4)) { return 0; }

  return 0;
}

int32_t indexheap_cmp_f(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  return indexheap_cmp_t(h, idx_a, idx_b, 0);
}

int32_t indexheap_cmp_d(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  return indexheap_cmp_t(h, idx_a, idx_b, 1);
}

int32_t indexheap_cmp_i32(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  return indexheap_cmp_t(h, idx_a, idx_b, 2);
}

int32_t indexheap_cmp_i64(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  return indexheap_cmp_t(h, idx_a, idx_b, 3);
}

int32_t indexheap_cmp_c(indexheap_t *h, int64_t idx_a, int64_t idx_b) {
  return indexheap_cmp_t(h, idx_a, idx_b, 4);
}
*/

//---

void indexheap_debug_print_f(indexheap_t *h) {
  int64_t i, p2, p2_c;
  printf("indexheap:\n");
  printf("  size: %i\n", (int)h->size);
  printf("  capacity: %i\n", (int)h->capacity);
  printf("  type: %i\n", (int)h->type);
  printf("  idx_heap[%i/%i]:\n", (int)h->size, (int)h->capacity);

  p2 = 16;
  p2_c = p2;
  printf("   ");
  for (i=0; i<h->size; i++) {
    if (p2_c==0) {
      printf("\n   ");
      //p2 *= 2;
      p2_c = p2;
    }
    printf(" %i", (int)h->idx_heap[i]);
    p2_c--;
  }
  printf("\n");

  printf("  heapf,heap_idx_bp[%i/%i]:\n", (int)h->size, (int)h->capacity);

  p2 = 1;
  p2_c = 1;
  printf("   ");
  for (i=0; i<h->size; i++) {
    if (p2_c==0) {
      printf("\n   ");
      p2 *= 2;
      p2_c = p2;
    }
    printf(" %f[%i]", (float)h->heapf[i], (int)h->heap_idx_bp[i]);
    p2_c--;
  }
  printf("\n");

}


indexheap_t *indexheap_alloc_t(int64_t capacity, int type) {
  int64_t n;
  indexheap_t *h;

  if ((type<0) || (type >= 5)) { return NULL; }

  n = capacity;

  h = (indexheap_t *)malloc(sizeof(indexheap_t));
  h->type = type;
  h->size = 0;
  h->capacity = n;
  h->idx_heap     = (int64_t *)malloc(sizeof(int64_t)*n);
  h->heap_idx_bp  = (int64_t *)malloc(sizeof(int64_t)*n);

  switch (type) {
    case 0:
      h->heapf = (float *)malloc(sizeof(float)*n);
      break;
    case 1:
      h->heapd = (double *)malloc(sizeof(double)*n);
      break;
    case 2:
      h->heapi32 = (int32_t *)malloc(sizeof(int32_t)*n);
      break;
    case 3:
      h->heapi64 = (int64_t *)malloc(sizeof(int64_t)*n);
      break;
    case 4:
      h->heapc = (char *)malloc(sizeof(char)*n);
      break;
    default:
      free(h->idx_heap);
      free(h->heap_idx_bp);
      return NULL;
      break;
  }

  return h;
}

/*
int32_t indexheap_push_t(indexheap_t *h, void *data) {
  return 0;
}

int32_t indexheap_pop_t(indexheap_t *h, void *data) {
  return 0;
}

int32_t indexheap_update_t(indexheap_t *h, int64_t idx, void *data) {
  return 0;
}
*/

int32_t indexheap_swap_f(indexheap_t *h, int64_t heap_idx_a, int64_t heap_idx_b) {
  int64_t idx, idx_bp, t_idx;
  float t_f;

  t_f   = h->heapf[heap_idx_a];
  t_idx = h->heap_idx_bp[heap_idx_a];

  h->heapf[heap_idx_a] = h->heapf[heap_idx_b];
  h->heap_idx_bp[heap_idx_a]   = h->heap_idx_bp[heap_idx_b];

  h->heapf[heap_idx_b] = t_f;
  h->heap_idx_bp[heap_idx_b] = t_idx;

  h->idx_heap[ h->heap_idx_bp[heap_idx_a] ] = heap_idx_a;
  h->idx_heap[ h->heap_idx_bp[heap_idx_b] ] = heap_idx_b;

  return 0;
}

int32_t indexheap_push_f(indexheap_t *h, float data) {
  int64_t n;
  int64_t idx_par, idx;
  float t_f;
  int64_t t_idx;

  if ((h->size) >= (h->capacity)) { return -1; }

  h->idx_heap[ h->size ] = h->size;
  h->heap_idx_bp[ h->size ] = h->size;
  h->heapf[ h->size ] = data;
  h->size++;

  idx = h->size-1;
  while (idx > 0) {
    idx_par = (idx-1)/2;
    if ( h->heapf[idx_par] < h->heapf[idx] ) {
      indexheap_swap_f(h, idx_par, idx);
    }
    idx = idx_par;
  }

  return 0;
}

// note that this will potentially leave the heap
// in an intermediate state if you pop off an entry
// that has a pointer to the laste element
//
int32_t indexheap_pop_f(indexheap_t *h, float *data) {
  int64_t max_heap_idx,
          heap_idx_par,
          heap_idx_lc, heap_idx_rc;
  float val, max_heap_val;

  if (h->size <= 0) { return -1; }

  val = h->heapf[0];
  indexheap_swap_f(h, 0, h->size-1);
  h->size--;

  heap_idx_par = 0;
  max_heap_idx = heap_idx_par;
  max_heap_val = h->heapf[heap_idx_par];

  while (heap_idx_par < h->size) {
    heap_idx_lc = indexheap_lchild(heap_idx_par);
    heap_idx_rc = indexheap_rchild(heap_idx_par);

    max_heap_idx = heap_idx_par;
    max_heap_val = h->heapf[max_heap_idx];

    if ((heap_idx_lc < h->size) &&
        (h->heapf[heap_idx_lc] > max_heap_val)) {

      max_heap_idx = heap_idx_lc;
      max_heap_val = h->heapf[max_heap_idx];
    }
    
    if ((heap_idx_rc < h->size) &&
        (h->heapf[heap_idx_rc] > max_heap_val)) {

      max_heap_idx = heap_idx_rc;
      max_heap_val = h->heapf[max_heap_idx];
    }

    if (heap_idx_par == max_heap_idx) { break; }

    indexheap_swap_f(h, heap_idx_par, max_heap_idx);

    heap_idx_par = max_heap_idx;
  }

  if (data!=NULL) { *data = val; }
  return 0;
}

// update the heap entry at heap_idx and then put
// the heap and surrounding indicies into a consistent
// state
//
int32_t indexheap_update_f(indexheap_t *h, int64_t heap_idx, float data) {
  int64_t max_heap_idx,
          heap_idx_par,
          heap_idx_lc,
          heap_idx_rc;
  float max_heap_val;

  if ((heap_idx<0) || (heap_idx >= h->size)) { return -1; }

  h->heapf[heap_idx] = data;

  // bubble up value
  //
  while (heap_idx > 0) {
    heap_idx_par = (heap_idx-1)/2;
    if (h->heapf[heap_idx] <= h->heapf[heap_idx_par]) { break; }

    indexheap_swap_f(h, heap_idx_par, heap_idx);
    heap_idx = heap_idx_par;
  }

  // push value down
  //
  heap_idx_par = heap_idx;
  max_heap_idx = heap_idx_par;
  max_heap_val = h->heapf[heap_idx_par];

  while (heap_idx_par < h->size) {
    heap_idx_lc = indexheap_lchild(heap_idx_par);
    heap_idx_rc = indexheap_rchild(heap_idx_par);

    max_heap_idx = heap_idx_par;
    max_heap_val = h->heapf[max_heap_idx];

    if ((heap_idx_lc < h->size) &&
        (h->heapf[heap_idx_lc] > max_heap_val)) {
      max_heap_idx = heap_idx_lc;
      max_heap_val = h->heapf[max_heap_idx];
    }
    
    if ((heap_idx_rc < h->size) &&
        (h->heapf[heap_idx_rc] > max_heap_val)) {
      max_heap_idx = heap_idx_rc;
      max_heap_val = h->heapf[max_heap_idx];
    }

    if (heap_idx_par == max_heap_idx) { break; }

    indexheap_swap_f(h, heap_idx_par, max_heap_idx);

    heap_idx_par = max_heap_idx;
  }

  return 0;
}

int32_t indexheap_cell_update_f(indexheap_t *h, int64_t cell_idx, float val) {
  return indexheap_update_f(h, h->idx_heap[cell_idx], val);
}

int32_t indexheap_consistency_check_sched_f(indexheap_t *h, float *f, float _eps) {
  int64_t i, bp_idx;
  float f_d;
  for (i=0; i<h->size; i++) {
    f_d = fabs(f[i] -  h->heapf[ h->idx_heap[i] ]);
    if ( f_d > _eps ) {

      printf("!! i:%i, idx[%i]:%i, heapf[%i]:%f, f[%i]:%f\n",
          (int)i,
          (int)i,
          (int)h->idx_heap[i],
          (int)h->idx_heap[i],
          (float)h->heapf[ h->idx_heap[i] ],
          (int)h->idx_heap[i],
          (float)f[ h->idx_heap[i] ]);

      return -1;
    }

  }
  return 0;
}

int32_t indexheap_consistency_check(indexheap_t *h) {
  int64_t i, idx_bp, idx;
  char *tbuf=NULL;
  int32_t err_code = 0;

  int64_t idx_child;

  if (h==NULL) { return 1; }
  if (h->size < 0) { return -1; }
  if (h->size > h->capacity) { return -2; }
  if (h->capacity< 0) { return -3; }
  if (h->type < 0) { return -4; }
  if (h->type > 4) { return -5; }
  if (h->capacity == 0) { return 0; }

  if (h->idx_heap == NULL) { return -6; }
  if (h->heap_idx_bp == NULL) { return -6; }
  if (h->heapc == NULL) { return -7; }
  if (h->size == 0) { return 0; }

  tbuf = (char *)malloc(sizeof(char)*(h->size));

  // check idx goes to uniq position
  //
  for (i=0; i<(h->size); i++) {
    if (h->idx_heap[i] < 0)     { err_code =  -8; goto ih_consistency_unwind; }
    if (h->heap_idx_bp[i] < 0)  { err_code =  -8; goto ih_consistency_unwind; }
    if (h->idx_heap[i] >= h->size)    { err_code =  -9; goto ih_consistency_unwind; }
    if (h->heap_idx_bp[i] >= h->size) { err_code =  -9; goto ih_consistency_unwind; }
  }

  for (i=0; i<(h->size); i++) { tbuf[i] = 0; }
  for (i=0; i<(h->size); i++) {
    if (tbuf[ h->heap_idx_bp[i] ] != 0) { err_code = -10; goto ih_consistency_unwind; }
    tbuf[ h->heap_idx_bp[i] ] = 1;
  }

  for (i=0; i<(h->size); i++) { tbuf[i] = 0; }
  for (i=0; i<(h->size); i++) {
    if (tbuf[ h->idx_heap[i] ] != 0) { err_code = -10; goto ih_consistency_unwind; }
    tbuf[ h->idx_heap[i] ] = 1;
  }
  free(tbuf);
  tbuf = NULL;

  for (i=0; i<(h->size); i++) {
    idx = h->idx_heap[i];
    if (i != h->heap_idx_bp[idx]) { return -20; }
  }

  // check heap property maintained in heap list
  //
  for (i=0; i<(h->size); i++) {
    idx_child = indexheap_lchild(i);
    if (idx_child < 0) { return -11; }
    if (idx_child < h->size) {
      if ( indexheap_cmp(h, i, idx_child) < 0 ) {
        return -13;
      }
    }

    idx_child = indexheap_rchild(i);
    if (idx_child < 0) { return -12; }
    if (idx_child < h->size) {
      if ( indexheap_cmp(h, i, idx_child) < 0 ) {
        return -14;
      }
    }
  }


ih_consistency_unwind:
  if (tbuf) { free(tbuf); }
  return err_code;
}

int main(int argc, char **argv) {
  int32_t ret;
  int64_t i, n, it, n_it, idx;
  float f, _eps;

  float *sched;

  _eps = 1.0/(1024.0*1024.0*1024.0*1024.0);

  n = 10;

  sched = (float *)malloc(sizeof(float)*n);

  indexheap_t *h;

  h = indexheap_alloc_t(n, 0);


  ret = indexheap_consistency_check(h);

  for (i=0; i<n; i++) {
    f = (float)rand() / (RAND_MAX + 1.0);
    sched[i] = f;
    printf("push idx:%i, f:%f\n", (int)i, (float)f);
    indexheap_push_f(h, f);

    ret = indexheap_consistency_check(h);
    printf("[%i] consistency: %i\n", (int)i, (int)ret);
    if (ret < 0) { printf("ERROR\n"); exit(-1); }
    ret = indexheap_consistency_check_sched_f(h, sched, _eps);
    printf("[%i] consistency_sched: %i\n", (int)i, (int)ret);
    if (ret < 0) { printf("ERROR\n"); exit(-1); }

  }

  ret = indexheap_consistency_check_sched_f(h, sched, _eps);
  printf("consistency_sched: %i\n", (int)ret);
  if (ret < 0) { printf("ERROR\n"); exit(-1); }

  indexheap_debug_print_f(h);

  for (i=0; i<n; i++) {
    f = (float)(rand()/(RAND_MAX + 1.0));
    ret = indexheap_update_f(h, i, f);
    printf("update idx:%i, f:%f (got %i)\n", (int)i, (float)f, (int)ret);

    ret = indexheap_consistency_check(h);
    printf("[%i] consistency: %i\n", (int)i, (int)ret);
    if (ret < 0) {
      printf("ERROR\n");
      indexheap_debug_print_f(h);
      exit(-1);
    }
  }

  n_it = 1000;
  for (it=0; it<n_it; it++) {
    idx = rand()%n;
    f = (float)(rand()/(RAND_MAX+1.0));

    ret = indexheap_update_f(h, idx, f);
    printf("update idx:%i, f:%f (got %i)\n", (int)idx, (float)f, (int)ret);

    ret = indexheap_consistency_check(h);
    printf("[%i] consistency: %i\n", (int)i, (int)ret);
    if (ret < 0) {
      printf("ERROR\n");
      indexheap_debug_print_f(h);
      exit(-1);
    }
  }


  printf("---\n");

  n_it = 4;
  for (it=0; it<n_it; it++) {
    idx = rand()%n;
    f = (float)(rand()/(RAND_MAX+1.0));

    printf("updating cell entry %i with %f\n", (int)idx, (float)f);
    indexheap_debug_print_f(h);

    ret = indexheap_cell_update_f(h, idx, f);
    printf("update cell_idx:%i, f:%f (got %i)\n", (int)idx, (float)f, (int)ret);
    indexheap_debug_print_f(h);

    printf("\n-------\n\n");

  }


  indexheap_debug_print_f(h);

  ret = indexheap_consistency_check(h);
  printf("consistency: %i\n", (int)ret);
  if (ret < 0) { printf("ERROR\n"); exit(-1); }

  free(sched);

  return 0;
}
