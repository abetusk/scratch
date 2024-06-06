// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this work has waived all copyright and related or neighboring rights
// to this work.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

function ease_in_alpha(x, alpha) {
  return Math.pow(x, alpha);
}

function ease_out_alpha(x, alpha) {
  return 1-Math.pow(1-x, alpha);
}

function ease_in_out_alpha(x, alpha) {

  if (x<0.5) {
    return ease_in_alpha(2*x, alpha)/2.0;
  }
  return (ease_out_alpha(2*(x-0.5), alpha)/2.0) + 0.5;
}

function _main() {
  let alpha = 1.5;

  let N = 100;

  for (let ix=0; ix<=N; ix++) {
    let x = ix/N;
    console.log(x, ease_in_alpha(x, alpha));
  }
  console.log("\n\n");

  for (let ix=0; ix<=N; ix++) {
    let x = ix/N;
    console.log(x, ease_out_alpha(x, alpha));
  }
  console.log("\n\n");

  for (let ix=0; ix<=N; ix++) {
    let x = ix/N;
    console.log(x, ease_in_out_alpha(x, alpha));
  }
  console.log("\n\n");

}

_main();
