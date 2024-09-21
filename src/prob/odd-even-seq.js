// https://x.com/littmath/status/1834273354628424080

var N = 100;
var n_it = 1000000;

for (let n = 4; n<=N; n+=2) {
  let count = [0,0];

  let coin = [];
  for (let i=0; i<n; i++) { coin.push(0); }


  for (let it=0; it<n_it; it++) {
    for (let i=0; i<n; i++) {
      coin[i] = Math.floor(Math.random()*2);
    }

    let prv_a = 0;
    let prv_b = 0;
    for (let i=1; i<n; i++) {
      let a = i;
      let b = 2*i;

      if (b >= n) {
        b = ((2*i)+1)%n;
      }

      let s = 0;
      if ((coin[prv_a] == 0) &&
          (coin[a] == 0)) {
        s++;
      }

      if ((coin[prv_b] == 0) &&
          (coin[b] == 0)) {
        s--;
      }

      prv_a = a;
      prv_b = b;


      if (s == 0) { continue; }

      if (s<0) { count[1]++; }
      else { count[0]++; }
      break;
    }

  }

  let v = (count[1] / (count[0] + count[1])) - 0.5;

  console.log(n, v);
}
