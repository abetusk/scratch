//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//   
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var do_double = false;
var show_mult = false;
var  query_word = "";
if (process.argv.length > 2) {
  query_word = process.argv[2];
}

/*
if (query_word.length==0) {
  console.log("provide query word\n");
  process.exit(-1);
}
*/

var squery_word = query_word.toLowerCase().split("").sort().join("");

console.log("##", query_word, "-sorted->", squery_word);

var fs = require("fs");

var s = fs.readFileSync("american-english.json");
var eng = JSON.parse(s);

let _orig = {};
for (let ii=0; ii<eng.word.length; ii++) {
  _orig[eng.word[ii].toLowerCase()] = 1;
}

let word_list = [];
for (let w in _orig) {
  word_list.push(w);
}
word_list.sort();

var info = {
  "w2s" : [ {}, {} ],
  "s2w" : [ {}, {} ],

  "sdup" : [ {}, {} ],

  "small_word": {},
  "small_sword": {},
};

let tot_count=0;

//for (let idx=0; idx<eng.word.length; idx++) {
for (let idx=0; idx<word_list.length; idx++) {
  //let word = eng.word[idx];
  let word = word_list[idx];
  word = word.toLowerCase();

  let a = word.split("");
  let sword = a.sort().join("");

  info.w2s[0][word] = sword;

  if (sword in info.s2w[0]) {
    if (sword in info.sdup[0]) {
      info.sdup[0][sword].push(word);
    }
    else {
      info.sdup[0][sword] = [ word ];
    }
  }
  else {
    info.s2w[0][sword] = word;
  }

  if (query_word.length==0) {
    console.log(word, sword);
  }

  //console.log(word, sword);

  if (word.length < query_word.length) {
    info.small_word[word] = sword;
    info.small_sword[sword] = word;
    tot_count++;
  }

}

if (show_mult) {
  for (let w in info.sdup[0]) {
    console.log(info.sdup[0][w].length+1, w, "->", info.s2w[0][w], info.sdup[0][w].join(" "));
  }
}

if (query_word.length > 0) {

  //console.log(">>>", tot_count);
  if (squery_word in info.s2w[0]) {

    if (squery_word in info.sdup[0]) {
      console.log( info.s2w[0][squery_word], info.sdup[0][squery_word].join(" ") );
    }
    else {
      console.log(info.s2w[0][squery_word]);
    }
  }
  else {
    console.log("not found");
  }

}

if (do_double) {
  let count = 0;

  for (let w0 in info.small_word) {
    if (w0.length > query_word.length) { continue; }

    count++;

    if ((count%10)==0){ console.log(count, "/", tot_count); }


    for (let w1 in info.small_word) {

      if ((w0.length + w1.length) > query_word.length) { continue; }

      let ww = w0 + w1;
      let sww = ww.split("").sort().join("");

      info.w2s[1][ww] = sww;
      info.s2w[1][sww] = ww;



    }
  }

  if (squery_word in info.s2w[1]) {
    console.log(info.s2w[1][squery_word]);
  }
  else {
    console.log("not found");
  }

}
