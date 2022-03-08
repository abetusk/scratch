#!/usr/bin/node

var fs = require("fs");

var fns = [];
for (var ii=2; ii<process.argv.length; ii++) {
  fns.push(process.argv[ii]);
}

function build_ngram_mc(a, n) {

  let ngram_mc = {
    "word" :  {},
    "key": {},
    "key_a": [],
    "n" : 0,
    "mc" : {},
    "mc_a" : {}
  };

  ngram_mc.n = n;

  let gram = [];
  for (let ii=0; ii<n; ii++) {
    gram.push(a[ii]);
  }

  for (let ii=0; ii<a.length; ii++) {
    if (!(a[ii] in ngram_mc.word)) {
      ngram_mc.word[a[ii]] = { "count" : 0 };
    }
    ngram_mc.word[a[ii]].count++;
  }

  for (let ii=n; ii<a.length; ii++) {
    let key = gram.join(" ");

    if (!(key in ngram_mc.key)) {
      ngram_mc.key[key] = { "count" : 0 };
    }
    ngram_mc.key[key].count++;

    if (!(key in ngram_mc.mc)) {
      ngram_mc.mc[key] = {};
    }

    if (!(a[ii] in ngram_mc.mc[key])) {
      ngram_mc.mc[key][a[ii]] = {
        "count" : 1
      };
    }
    else {
      ngram_mc.mc[key][a[ii]].count++;
    }

    gram = [];
    for (let jj=0; jj<n; jj++) {
      gram.push(a[ii-n+jj+1]);
    }

  }

  for (let key in ngram_mc.key) {
    ngram_mc.key_a.push(key);
  }

  for (let key in ngram_mc.mc) {
    ngram_mc.mc_a[key] = [];
    for (let val in ngram_mc.mc[key]) {
      ngram_mc.mc_a[key].push(val);
    }
  }

  return ngram_mc;
}

function ngram_mc_sentence(ngram_mc) {
  let n = ngram_mc.key_a.length;
  let p = Math.floor(Math.random()*n);

  let key = ngram_mc.key_a[p];

  console.log(n, p, key);

  let sentence = key;

  let max_iter = 100;

  for (let ii=0; ii<max_iter; ii++) {

    console.log("??", key);

    let m = ngram_mc.mc_a[key].length;
    //console.log(key);

    let tok = key.split(" ");

    let q = Math.floor(Math.random()*m);
    let w = ngram_mc.mc_a[key][q];

    sentence += " " + w;

    key = tok[1] + " " + w;
    console.log(">>>", key)

    if (w.slice(-1) == ".") { break; }
  }

  return sentence;

}

var corpusa = [];
for (let ii=0; ii<fns.length; ii++) {
  let txt = fs.readFileSync(fns[ii], 'utf8');

  txt = txt.replace(/\n/g, ' ');
  txt = txt.replace(/  */g, ' ');

  let txta = txt.split(' ');
  for (let jj=0; jj<txta.length; jj++) {
    corpusa.push(txta[jj]);
  }

  
}


var x = build_ngram_mc(corpusa, 2);
//console.log(JSON.stringify(x, null, 2));
//

let s = ngram_mc_sentence(x);

console.log(s);


