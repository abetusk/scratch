#include <stdio.h>
#include <stdlib.h>

#include <vector>

long int rand_range(int N) {
  long int r;
  r = random();
  return r % N;
}

double drand() {
  return ((double)random() / (RAND_MAX + 1.0));
}

// All variables have names that start at 1
// A negative value in the clause3 structure means it appears negated.
// A 0 in clause3 represents no variable.
// 
//
typedef struct sat3_type {
  int nv;
  std::vector< int > clause3;
} sat3_t;

// v_bp is variable back pointer, 2 values per entry
//   the first is the variable (starting at 1, signed)
//   the second is position in clause3 in the sat instance
//
// v_bp_idx is index into v_bp of variable i-1
// 
// nu are variable to clause values
// pi are clause to variable values, 3 per entry, (1, 0, *)
//
// state is 0 or 1 depending on the parity of time step
// (i.e. which back buffer to use)
//
typedef struct survey_propagation_type {
  sat3_t *sat;
  std::vector< int > v_bp;
  std::vector< int > v_bp_idx;

  std::vector< double > nu[2];
  std::vector< double > pi[2];

  int state;
} sp_t;

// first element assumed to be value (variable starting at 1, signed)
// second element assumed to be position
//
int sat_v_bp_cmp2(const void *a, const void *b) {
  int *ap, *bp;
  int p0, p1, v0, v1;

  ap = (int *)a;
  bp = (int *)b;

  p0 = ap[1];
  p1 = bp[1];
  v0 = ( (ap[0] < 0) ? -ap[0] : ap[0] );
  v1 = ( (bp[0] < 0) ? -bp[0] : bp[0] );

  if (v0<v1) { return -1; }
  else if (v0>v1) { return 1; }

  if (p0<p1) { return -1; }
  else if (p0>p1) { return 1; }

  return 0;
}

// sp instance setup from sat instance
//
void sp_init(sp_t &sp, sat3_t *sat) {
  int i, j, k, nc, nv, n;
  int cur_v, prev_v;
  sp.sat = sat;

  n = (int)(sat->clause3.size());
  nv = sat->nv;

  for (i=0; i<n; i++) {
    sp.v_bp.push_back(sat->clause3[i]);
    sp.v_bp.push_back(i);
  }

  qsort(&(sp.v_bp[0]), (size_t)n, sizeof(int)*2, sat_v_bp_cmp2);

  prev_v = 0;
  for (i=0; i<sp.v_bp.size(); i+=2) {
    cur_v = abs(sp.v_bp[i]);
    if (cur_v != (int)sp.v_bp_idx.size()) {
      for (j=sp.v_bp_idx.size(); j<cur_v; j++) { sp.v_bp_idx.push_back(-1); }
    }
    if (prev_v != cur_v) { sp.v_bp_idx[cur_v-1] = i; }
    prev_v = cur_v;
  }

  for (i=0; i<n; i++) {
    sp.nu[0].push_back(drand());
    sp.nu[1].push_back(0.0);

    sp.pi[0].push_back(0.0);
    sp.pi[0].push_back(0.0);
    sp.pi[0].push_back(0.0);

    sp.pi[1].push_back(0.0);
    sp.pi[1].push_back(0.0);
    sp.pi[1].push_back(0.0);
  }

  for (i=0; i<sp.v_bp.size(); i+=2) { printf("[%i] %i %i\n", i, sp.v_bp[i], sp.v_bp[i+1]); }
  printf("\n----\n");
  for (i=0; i<sp.v_bp_idx.size(); i++) {
    printf("v%i %i\n", i+1, sp.v_bp_idx[i]);
  }
  printf("\n");

}

// UNTESTED
int sp_update(sp_t &sp, double rho) {
  int i, j, k, n;
  int ii, jj;
  int t0, t1;
  int c_name, v_name;
  int *clause;

  int x, y, z;
  int var_i, var_j, clause_a, clause_b, clause_b_pos;
  int idx, idx_n;
  double s_prod, u_prod, renorm;
  double nu_a;

  int s_count, u_count;

  double eps = 1.0e-20;

  t0 = sp.state;
  t1 = 1-sp.state;

  n = (int)sp.sat->clause3.size();
  clause = &(sp.sat->clause3[0]);

  // Upate pi (variable to clause messages) for next timestep.
  // Take care to account for condition there are no same/different
  // clasuse with the variable in them (terms disappear).
  //

  for (x=0; x<n; x++) {

    clause_a = i/3;
    var_i = abs(clause[x]);


    s_prod = 1.0;
    u_prod = 1.0;
    s_count=0;
    u_count=0;

    idx = sp.v_bp_idx[var_i-1];
    idx_n = sp.v_bp.size();
    if (v_name < sp.v_bp.size()) { idx_n = sp.v_bp_idx[v_name] - idx; }
    for (y=0; y<idx_n; y+=2) {
      clause_b_pos = sp.v_bp[y+1];
      clause_b = clause_b_pos/3;
      if (clause_a == clause_b) { continue; }

      if (clause[x] == clause[clause_b_pos]) {
        s_prod *= 1.0 - sp.nu[t0][clause_b_pos];
        s_count++;
      }
      else {
        u_prod *= 1.0 - sp.nu[t0][clause_b_pos];
        u_count++;
      }
    }

    sp.pi[t1][3*x+0] = s_prod;
    if (u_count>0) { sp.pi[t1][3*x+0] *= (1.0 - rho * u_prod); }

    sp.pi[t1][3*x+1] = u_prod;
    if (s_count>0) { sp.pi[t1][3*x+1] *= (1.0 - rho * s_prod); }

    sp.pi[t1][3*x+2] = s_prod * u_prod;

  }

  // use precalculated pi to update nu
  //

  for (x=0; x<n; x++) {

    for (ii=0; ii<3; ii++) {
      nu_a = 1.0;

      y = x+((ii+1)%3);
      renorm =
        sp.pi[t1][3*y+0] +
        sp.pi[t1][3*y+1] +
        sp.pi[t1][3*y+2];
      if (renorm < eps) { renorm = 1.0; }
      nu_a *= sp.pi[t1][y];

      y = x+((ii+2)%3);
      renorm =
        sp.pi[t1][3*y+0] +
        sp.pi[t1][3*y+1] +
        sp.pi[t1][3*y+2];
      if (renorm < eps) { renorm = 1.0; }
      nu_a *= sp.pi[t1][y];

      sp.nu[t1][x] = nu_a;
    }

  }

  sp.state = t1;
}


// Print CNF output
//
void sat3_print(FILE *fp, sat3_t &sat, const char *comment) {
  int i;
  fprintf(fp, "c %s\n", comment);
  fprintf(fp, "c\n");
  fprintf(fp, "p cnf %i %i\n", sat.nv, (int)sat.clause3.size()/3);
  for (i=0; i<sat.clause3.size(); i+=3) {
    fprintf(fp, "%i %i %i 0\n",
        sat.clause3[i],
        sat.clause3[i+1],
        sat.clause3[i+2]);
  }
}

void sat3_rand(sat3_t &sat, int nvar, int nclause) {
  int ii, jj, var_name;

  sat.clause3.clear();
  sat.nv = nvar;

  for (ii=0; ii<nclause; ii++) {
    for (jj=0; jj<3; jj++) {
      var_name = rand_range(nvar)+1;
      if (drand()< 0.5) { var_name = -var_name; }
      sat.clause3.push_back(var_name);
    }
  }

}

int main(int argc, char **argv) {
  sp_t sp;
  sat3_t sat;

  sat3_rand(sat, 10, 40);
  sat3_print(stdout, sat, "sp sat3");



  sp_init(sp, &sat);


}
