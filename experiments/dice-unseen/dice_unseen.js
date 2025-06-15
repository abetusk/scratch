// LICENSE: CC0
//
//

// Given T dice (6 sided, equal probability), which is more likely,
// 2 unseen faces or 3?
//

let T_MAX = 20;
let n_it = 1000000;

function irnd6() {
  return Math.floor( Math.random() * 6 );
}


function unseen(n) {
  let a = [0,0,0,0,0,0];

  for (let i=0; i<n; i++) {
    a[irnd6()]++;
  }

  let count = 0;
  for (let i=0; i<6; i++) {
    if (a[i]==0) { count++; }
  }

  return count;
}

let T = 8;

for (let T=6; T<10; T++) {

  console.log("#T:", T);

  let t_freq = [];
  for (let i=0; i<T; i++) { t_freq.push(0); }

  for (let it=0; it<n_it; it++) {
    t_freq[ unseen(T) ] ++;
  }

  for (let i=0; i<t_freq.length; i++) {
    t_freq[i] /= n_it;
  }

  for (let i=0; i<t_freq.length; i++) {
    console.log(i, t_freq[i]);
  }

  console.log("");

}
