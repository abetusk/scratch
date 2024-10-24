// 
//   
// To the extent possible under law, the person who associated CC0 with
// this source has waived all copyright and related or neighboring rights
// to data.
//       
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// hard words:
// * patch
// * fling
// * buggy

// denim in 4 with 200
// denim in 4 with 1000

// floor in 4 with 200
// floor in 3 with 1000

// wedge in 4 with 200
// wedge in 4 with 1000

// fetus in 5 with 200
// fetus in 5 with 1000

// mayor in 3 with 200
// mayor in 3 with 1000


// herbs in 3
// snail in 4
// broad in 3
// sleet in 3
// synod in 4
// facet in 3
// diver in 4
// icing in 4
// index in 3
// lanai in 4
// banjo in 4
// yacht in 4 (yacht in 3/teres)
// onion in 4
// court in 3
// madam in 3
// forum in 4
// point in 4
// thief in 3
// enemy in 4
// divan in 4
// genie in 4
// party in 2
// rally in 3
// waste in 3
// petal in 4
// emery in 3
// synod in 4
// macaw in 5
// moody in 4
// track in 3
// elbow in 4
// mixer in 6
// reply in 3
// ankle in 5 (3/tares)
// digit in 4
// socks in 6 (/tares) (3/torse)
// pizza in 4
// drunk in 3
// visit in 3
// forum in 4
// vixen in 4
// stick in 4
// jelly in 5
// touch in 3
// inbox in 4
// table in 3
//
// 

var g_info = {
  "ready": false,

  "button_state": {},

  "cursor": {
    "row": 0,
    "col": 0
  },

  "filt_list" : [],
  "common_filt_list" : [],

  "eldrow_list" : [],
  "eldrow_lookup": {},

  "freq_list": [],
  "freq_lookup": {},

  "allow_list": [],
  "allow_lookup": {},

  "allow_processed": false,


  "common_eldrow_list": [],
  "common_eldrow_lookup": {}
};


function xhr_request(fn, cb) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState==4) {
      if (xhr.status==200) {
        cb(xhr.responseText);
      }
      else {
        console.log("failed to load", fn);
      }
    }
  };

  xhr.open("GET", fn);
  xhr.send();
}

function check_finished() {
  console.log("###", g_info.eldrow_list.length, g_info.common_eldrow_list.length, g_info.freq_list.length);


  let skip = 0;

  if ((g_info.eldrow_list.length > 0) && (g_info.freq_list.length>0)) {

    //if (!g_info.allow_processed) { return; }
    if (g_info.allow_processed) {

      if (g_info.allow_list.length == 0) { return; }

      let _filt_list = g_info.eldrow_list;
      let filt_list = [];
      for (let i=0; i<_filt_list.length; i++) {
        if (_filt_list[i].w in g_info.allow_lookup) {
          filt_list.push( _filt_list[i] );
        }
      }
      g_info.filt_list = filt_list;
    }
    else {
      g_info.allow_list = g_info.eldrow_list;
      g_info.allow_lookup = g_info.eldrow_lookup;
    }

    let list = g_info.eldrow_list;
    let list_lookup = g_info.eldrow_lookup;
    let freq_list = g_info.freq_list;
    for (let i=0; i<freq_list.length; i++) {
      let w = freq_list[i].w;

      if (!(w in list_lookup)) {
        //console.log("skipping", w);
        skip++;
        continue;
      }
      let idx = list_lookup[w];
      if (list[idx].w != w) {
        console.log("error, index mismatch", w, idx);
        continue;
      }

      g_info.eldrow_list[idx].p += freq_list[i].p;


    }

    console.log("# skipped", skip, "from", g_info.freq_list.length);
  }


}

function process_allowlist(data) {

  word_list = data.split("\n");
  let allow_list = [];
  let allow_lookup = {};

  for (let i=0; i<word_list.length; i++) {

    let p = 1;

    if (word_list[i].match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = word_list[i].toLowerCase();
      if (w in allow_lookup) {
        continue;
      }
      allow_lookup[w] = allow_list.length;
      allow_list.push({"w":w, "p": p});
    }

  }

  g_info.allow_list = allow_list;
  g_info.allow_lookup = allow_lookup;

  g_info.allow_list = allow_list;

  check_finished();
}

function process_wordlist(data) {
  //console.log("got wordlist:", data);

  word_list = data.split("\n");
  let eldrow_list = [];
  let eldrow_lookup = {};

  for (let i=0; i<word_list.length; i++) {

    let p = 1;

    if (word_list[i].match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = word_list[i].toLowerCase();
      if (w in eldrow_lookup) {
        continue;
      }
      eldrow_lookup[w] = eldrow_list.length;
      eldrow_list.push({"w":w, "p": p});
    }

  }

  g_info.eldrow_list = eldrow_list;
  g_info.eldrow_lookup = eldrow_lookup;

  g_info.filt_list = eldrow_list;

  check_finished();
}

function process_common_wordlist(common_data) {
  //console.log("got common wordlist:", common_data);

  common_word_list = common_data.split("\n");
  let common_eldrow_list = [];
  let common_eldrow_lookup = {};

  for (let i=0; i<common_word_list.length; i++) {

    let p = 1;

    if (common_word_list[i].match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = common_word_list[i].toLowerCase();
      if (w in common_eldrow_lookup) {
        continue;
      }
      common_eldrow_lookup[w] = common_eldrow_list.length;
      common_eldrow_list.push({"w":w, "p":p});
    }

  }

  g_info.common_eldrow_list = common_eldrow_list;
  g_info.common_eldrow_lookup = common_eldrow_lookup;

  g_info.common_filt_list = common_eldrow_list;

  check_finished();
}

function process_word_freq(data) {
  let lines = data.split("\n");
  let word_list = [];
  let word_lookup = {};

  for (let i=0; i<lines.length; i++) {

    let tok = lines[i].split(",");
    if (tok.length!=2) { continue; }

    let word = tok[0];
    let p = parseFloat(tok[1]);

    if (word.match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = word.toLowerCase();
      if (w in word_lookup) {
        continue;
      }
      word_lookup[word] = word_list.length;
      word_list.push({"w":word, "p": p});
    }

  }

  g_info.freq_list = word_list;
  g_info.freq_lookup = word_lookup;


  check_finished();
}

function load_lists() {
  xhr_request("data/combined_wordlist.txt", process_wordlist);
  xhr_request("data/common_words", process_common_wordlist);

  xhr_request("data/word_freq", process_word_freq);


  if (g_info.allow_processed) {
    xhr_request("data/words_wordle_solutions.txt", process_allowlist);
  }
}


function print_freq(ch_f_l) {
  for (let i=0; i<ch_f_l.length; i++) {
    let ele = ch_f_l[i];
    console.log(ele.c, ele.f);
  }
}

function filter_list(wlist, flist, debug) {
  debug = ((typeof debug === "undefined") ? false : debug);

  let rlist = [];

  let bounds = {};

  //let chmap = {};
  //let src_y_count = 0;
  for (let i=0; i<flist.length; i++) {
    let ch = flist[i].c;
    //chmap[ch] = flist[i].v;
    //if (flist[i].v == 0) { src_y_count++; }
    if (!(ch in bounds)) {
      bounds[ch] = { "min": 0, "max": 5, "incount":0, "outcount":0 };
    }

    if (flist[i].v >= 0) {
      bounds[ch].incount++;
    }
    else {
      bounds[ch].outcount++;
    }
  }

  for (let ch in bounds) {
    if (bounds[ch].incount>0) {
      bounds[ch].min = bounds[ch].incount;
      if (bounds[ch].outcount>0) {
        bounds[ch].max = bounds[ch].incount;
      }
    }
    else if (bounds[ch].outcount>0) {
      bounds[ch].max = bounds[ch].min;
    }

  }


  for (let i=0; i<flist.length; i++) {
    let ch = flist[i].c;
  }

  for (let i=0; i<wlist.length; i++) {
    let w = wlist[i].w;
    let word_weight = wlist[i].p;

    if (flist.length != w.length) {
      console.log("ERROR");
      return undefined;
    }

    let reject = false;
    
    // positional matching
    //
    for (let j=0; j<flist.length; j++) {
      let ch = w.charAt(j);

      // if the letter is green and the character doesn't match,
      // reject
      //
      if ( (flist[j].v == 1) && (ch != flist[j].c) ) {
        reject = true;
        break;
      }

      // if the letter is yellow and the character *does* match,
      // reject
      //
      if ( (flist[j].v == 0) && (ch == flist[j].c) ) {
        reject = true;
        break;
      }

      // if the letter isblack and the character *does* match,
      // reject
      //
      if ( (flist[j].v == -1) && (ch == flist[j].c) ) {
        reject = true;
      }
    }
    if (reject) { continue; }

    let w_count = {};
    for (let j=0; j<w.length; j++) {
      let ch = w.charAt(j);

      if (!(ch in w_count)) {
        w_count[ch] = 0
      }
      w_count[ch]++;
    }

    for (let ch in bounds) {
      let count = 0;
      if (ch in w_count) {
        count = w_count[ch];
      }

      if ((count < bounds[ch].min) || (count > bounds[ch].max)) {
        reject=true;
        break;
      }
    }

    for (let ch in w_count) {
      if (!(ch in bounds)) {
        continue;
      }

      if ((w_count[ch] < bounds[ch].min) || (w_count[ch] > bounds[ch].max)) {
        reject = true;
        break;
      }
    }

    if (reject) { continue; }

    rlist.push( { "w": w, "p": word_weight });
  }


  return rlist;
}

function _test_filter_list(_list) {

  // word was usual
  //
  let guess_list = [
    "S !t !e a !k",
    "!n !a S a l"
  ];


  let pw0 = parse_word(guess_list[0]);
  let _list1 = filter_list(_list, pw0);

  let pw1 = parse_word(guess_list[1]);
  let filt2 = filter_list(_list1, pw1, true);

  console.log(">>>");
  for (let i=0; i<filt2.length; i++) {
    console.log(i, filt2[i]);
  }

}

// for 'interactive'
//
// format is:
//
// lowercase - green
// uppercase - yellow
// !char     - (a '!' followed by the character) black
//
function parse_word(w) {
  let z = [];

  let tok = w.split(/  */);
  for (let i=0; i<tok.length; i++) {

    if (tok[i].length == 2) {
      let uu = tok[i].replace(/[^a-zA-Z]/, '').toLowerCase();
      z.push({ "c": uu, "v": -1 });
    }
    else {
      if (tok[i].toLowerCase() == tok[i]) {
        z.push({ "c": tok[i], "v": 1 });
      }
      else {
        let uu= tok[i].toLowerCase();
        z.push({ "c": uu, "v": 0 });
      }
    }

  }

  return z;

}

function simple_guess(filt_list) {
  let chmap = {};
  for (let i=0; i<filt_list.length; i++) {
    let w = filt_list[i];

    for (let j=0; j<w.length; j++) {

      let ch = w.charAt(j);

      if (!(ch in chmap)) {
        chmap[ch] = 0;
      }
      chmap[ch]++;
    }
  }

  let guess_list = [];

  for (let i=0; i<filt_list.length; i++) {
    let w = filt_list[i];
    let score = 0;
    for (let j=0; j<w.length; j++) {
      score += chmap[w.charAt(j)];
    }

    guess_list.push( {"w": w, "s": score });
  }

  guess_list.sort( function(a,b) { return ((a.s < b.s) ? 1 : -1); } );

  return guess_list;
}


// Return color pattern for guess against the reference_word.
// That is, if the 'hidden' word is reference_word,
// return what the string in 'guess' would resultin.
// Example:
//
//   guess - 'eerie'
//   ref   - 'agree'
//   ->      'ybgbg'
//
function eldrow_string(guess,reference_word) {

  let a = guess;
  let b = reference_word;

  let n = a.length, m = b.length;
  if (n!=m) { return -1; }

  let u = [ '.', '.', '.', '.', '.' ];

  let a_map = {};
  let b_map = {};

  // get counts of each character
  //
  for (let i=0; i<n; i++) {
    let ch_a = a.charAt(i);
    let ch_b = b.charAt(i);

    if (!(ch_a in a_map)) {
      a_map[ch_a] = {"g":0, "y":0, "b":0, "t":0, "cur":0};
    }
    a_map[ch_a].t++;
    a_map[ch_a].cur++;

    if (!(ch_b in b_map)) {
      b_map[ch_b] = {"g":0, "y":0, "b":0, "t":0, "cur":0};
    }
    b_map[ch_b].t++;
    b_map[ch_b].cur++;
  }

  // fill in green characters
  // and update map
  //
  for (let i=0; i<n; i++) {
    let ch_a = a.charAt(i);
    let ch_b = b.charAt(i);

    if (ch_a == ch_b) {
      u[i] = 'g';

      a_map[ch_a].g++;
      a_map[ch_a].cur--;

      b_map[ch_a].cur--;
    }

  }

  for (let i=0; i<n; i++) {
    let ch_a = a.charAt(i);
    let ch_b = b.charAt(i);

    if (u[i] == 'g') { continue; }

    if ((ch_a in b_map) && (b_map[ch_a].cur>0)) {
      u[i] = 'y';
      b_map[ch_a].cur--;
    }
    else {
      u[i] ='b';
    }

  }

  return u.join("");
}

function _test_eldrow_string() {

  let test_pair = [
    [ "witch", "ditch" ],
    [ "eases", "elect" ],
    [ "eerie", "elect" ],
    [ "ecelt", "elect" ],
    [ "lecte", "elect" ],
    [ "eases", "onion" ],
    [ "eerie", "agree" ]
  ];

  for (let i=0; i<test_pair.length; i++) {
    let u = eldrow_string( test_pair[i][0], test_pair[i][1] );
    console.log("guess:", test_pair[i][0], "ref:", test_pair[i][1], u);
  }

}


// The idea is to measure the entropy
// of the guess by comparing what each
// pattern the guess produces from the
// remaining filter list.
//
// Consider a word W
// For each U in filt_list (not W)
//    create the pattern with W as the guess
//    and U as the hidden pattern, P.
//   Save the pattern P, counting the duplicates
//   Once all patterns are collected, create
//    the entropy score ( #{P_U} / \sum #{P_U} )
// Go through each W to find each of their respective
//   entropy scores, sorting from maximum entropy to
//   min.
//
// Picking maximum entropy indicates the space partitions
//   maximallya (I hope)..
// For example lets say there's a filt_list of some large
//   size but with only one entry that has 'zzzzz' and
//   none of the others having any 'z's in them. Picking
//   'zzzzz' will pick out the one pattern (as 'ggggg')
//   but won't give you any indication as to the rest.
//   Picking a pattern that will split the other patterns
//   will help you make progress faster.
//
function entropy_guess(filt_list) {

  if (filt_list.length<2) {
    if (filt_list.length==0) { return []; }
    return [ { "w": filt_list[0].w, "p": filt_list[0].p, "v": 0, "r": 0 } ];
  }

  let entropy_score = [];

  let R = 0;
  for (let i=0; i<filt_list.length; i++) {
    R += filt_list[i].p;
  }

  for (let i=0; i<filt_list.length; i++) {
    let guess = filt_list[i].w;

    let count = {};
    let entropy = 0;

    let tot = 0;
    for (let j=0; j<filt_list.length; j++) {
      if (i==j) { continue; }

      let ref = filt_list[j].w;

      let eldrow_s = eldrow_string(guess, ref);

      if (!(eldrow_s in count)) {
        count[eldrow_s] = 0;
      }
      //count[eldrow_s]++;
      count[eldrow_s] += filt_list[j].p;

      tot += filt_list[j].p;
    }

    for (let key in count) {
      //let p = count[key]/(filt_list.length-1);
      let p = count[key]/(tot);
      entropy += -(p*Math.log(p));
    }

    entropy_score.push( {"w": guess, "v": entropy, "p": filt_list[i].p, "r": filt_list[i].p/R });

    if ((i>0) && ((i%250)==0)) {
      console.log("###", i);
    }
  }

  entropy_score.sort( function(a,b) { return ((a.v > b.v) ? -1 : 1); } );


  return entropy_score;

}

function test_entropy_guess_x() {
  let filt = [
    { "w": "batch", "p":1 },
    { "w": "gatch", "p":1 },
    { "w": "hatch", "p":1 },
    { "w": "latch", "p":1 },
    { "w": "match", "p":1 },
    { "w": "patch", "p":1 }
  ];

  let cand = g_info.eldrow_list;

  let x = entropy_guess_x(filt, cand);

  console.log(x);
}

function entropy_guess_x(filt_list, candidate) {
  if (filt_list.length<2) {
    if (filt_list.length==0) { return []; }
    return [ { "w": filt_list[0].w, "p": filt_list[0].p, "v": 0 } ];
  }

  let entropy_score = [];

  for (let i=0; i<candidate.length; i++) {
    let guess = candidate[i].w;

    let count = {};
    let entropy = 0;

    let tot = 0;
    for (let j=0; j<filt_list.length; j++) {
      let ref = filt_list[j].w;

      let eldrow_s = eldrow_string(guess, ref);

      if (!(eldrow_s in count)) {
        count[eldrow_s] = 0;
      }
      count[eldrow_s] += filt_list[j].p;

      tot += filt_list[j].p;
    }

    for (let key in count) {
      let p = count[key]/(tot);
      entropy += -(p*Math.log(p));
    }

    entropy_score.push( {"w": guess, "v": entropy, "p":0, "r":0 });

    //if ((i>0) && ((i%250)==0)) { console.log("###", i); }
  }

  entropy_score.sort( function(a,b) { return ((a.v > b.v) ? -1 : 1); } );

  return entropy_score;
}

function _test_entropy_guess() {

  let filt_list = [
    "ditty", "kitty", "witty", "pithy", "dirty", "hitch", "fifty", "tizzy", "ritzy", "ditch"
  ];

  let ee = entropy_guess(filt_list);

  console.log(ee);
}

//DEBUG
//_test_entropy_guess();
//process.exit()

//-----------
//-----------
//-----------

/*
let _init = simple_guess(filt_list);
for (let j=0; (j<_init.length) && (j<10); j++) {
  console.log(j, _init[j]);
}
*/

function _nop_0() {

  let filt_list = eldrow_list;
  let common_filt_list = common_eldrow_list;


  let init_guess = false;

  // from common_words
  // 0 { w: 'tares', v: 4.2929138319585025 }
  // 1 { w: 'lares', v: 4.262320253156736 }
  // 2 { w: 'rales', v: 4.237659195416323 }
  // 3 { w: 'rates', v: 4.2251119474655345 }
  // 4 { w: 'teras', v: 4.211508949219614 }
  // 5 { w: 'nares', v: 4.2047236162954675 }
  // 6 { w: 'soare', v: 4.200955816765088 }
  // 7 { w: 'tales', v: 4.19651403834994 }
  // 8 { w: 'reais', v: 4.192902374040881 }
  // 9 { w: 'tears', v: 4.180813674342018 }
  //
  //
  // for dict words...
  // 0 { w: 'tares', v: 4.31516606489582 }
  // 1 { w: 'aires', v: 4.266811500170044 }
  // 2 { w: 'aries', v: 4.251729916339912 }
  // 3 { w: 'tales', v: 4.243375458081789 }
  // 4 { w: 'rates', v: 4.235345876507782 }
  // 5 { w: 'saner', v: 4.209790936114125 }
  // 6 { w: 'lanes', v: 4.205873736883651 }
  // 7 { w: 'tears', v: 4.198283971438555 }
  // 8 { w: 'dares', v: 4.191971269117911 }
  // 9 { w: 'reals', v: 4.186939975131778 }
  //
  if (init_guess) {
    let _entg = entropy_guess(g_info.eldrow_list);
    for (let j=0; (j<_entg.length) && (j<10); j++) {
      console.log(j, _entg[j]);
    }
  }

  /*
  if (init_guess) {
    let _entg = entropy_guess(filt_list);
    for (let j=0; (j<_entg.length) && (j<10); j++) {
      console.log(j, _entg[j]);
    }
  }
  */

  // common ...
  // 0 { w: 'tares', v: 4.35545617859925 }
  // 1 { w: 'sante', v: 4.292023695903776 }
  // 2 { w: 'rates', v: 4.280554229735229 }
  // 3 { w: 'tears', v: 4.275069412520974 }
  // 4 { w: 'saile', v: 4.270638240003648 }
  // 5 { w: 'tales', v: 4.264966223562772 }
  // 6 { w: 'saine', v: 4.264139158399639 }
  // 7 { w: 'saner', v: 4.25567122764231 }
  // 8 { w: 'artes', v: 4.240703415121273 }
  // 9 { w: 'tires', v: 4.225039954040188 }
  // ...
  //
  //
  if (init_guess) {
    let _entg = entropy_guess(common_filt_list);
    for (let j=0; (j<_entg.length) && (j<10); j++) {
      console.log(j, _entg[j]);
    }

    let n = _entg.length;
    for (let j=0; j<10; j++) {
      console.log(n-j-1, _entg[n-j-1]);
    }
  }

  for (let i=0; i<5; i++) {
    console.log("[a-z] - green\n[A-Z] - yellow\n![a-zA-Z] - black\n");
    let word = readline.question(i.toString() +  "> ");

    if (word.split(/  */).length != 5) {
      console.log("::: Invalid word (", word, "), please re-enter");
      i--;
      continue;
    }

    let pw = parse_word(word);

    filt_list = filter_list(filt_list, pw);
    common_filt_list = filter_list(common_filt_list, pw);

    if (filt_list.length==1) {
      console.log("FOUND:", filt_list[0]);
      break;
    }

    if (filt_list.length==0) {
      console.log("ERROR, not found");
      break;
    }

    //console.log(filt_list);

    //for (let j=0; (j<filt_list.length) && (j<10) ; j++) {
    //  console.log("xx:", j, filt_list[j]);
    //}

    console.log("# filtered word count:", filt_list.length, common_filt_list.length );

    _entg = entropy_guess(filt_list);
    for (let j=0; (j<_entg.length) && (j<5); j++) {
      console.log(j, _entg[j]);
    }

    if (_entg.length > 10) {
      let n = _entg.length;
      for (let j=0; j<5; j++) {
        console.log(n-j-1, _entg[n-j-1]);
      }
    }

    console.log("...");

    _common_entg = entropy_guess(common_filt_list);

    if (_common_entg.length < 25) {
      for (let j=0; j<_common_entg.length; j++) {
        console.log("common:", j, _common_entg[j]);
      }
    }
    else {
      for (let j=0; (j<_common_entg.length) && (j<5); j++) {
        console.log("common:", j, _common_entg[j]);
      }
      if (_common_entg.length>25) {

        console.log("...");
        let n = _common_entg.length;
        for (let j=0; j<5; j++) {
          console.log("common:", n-j-1, _common_entg[n-j-1]);
        }

      }
    }

    //for (let j= (((_entg.length - 5) < 0) ? _entg.length : (_entg.length-5)); j<(_entg.length); j++) {
    //for (let j=(_entg.length-1); (j>0) && (j>_entg.length-5); j--) {
    //  console.log(j, _entg[j]);
    //}

    /*
    console.log("");
    let _g = simple_guess(filt_list);
    for (let j=0; (j<_g.length) && (j<10); j++) {
      console.log(j, _g[j]);
    }
    */

  }

}

//----

function flash_button(_id) {
  setTimeout( function() { $(_id).css("background", "#f00"); }, 100 );
  setTimeout( function() { $(_id).css("background", "#fff"); }, 200 );
  setTimeout( function() { $(_id).css("background", "#f00"); }, 300 );
  setTimeout( function() { $(_id).css("background", "#fff"); }, 400 );
}

function process_row(_row) {

  let guess_list = [];
  for (let i=0; i<5; i++) {
    let button_id = "#ui_button_" + _row + "_" + i;
    let ch = $(button_id).html();

    let val = -1;
    if (g_info.button_state[button_id] == 0) {
      val = -1;
    }
    else if (g_info.button_state[button_id] == 1) {
      val = 1;
    }
    else if (g_info.button_state[button_id] == 2) {
      val = 0;
    }

    guess_list.push( { "c": ch, "v": val });
  }

  let _filt_list = filter_list(g_info.filt_list, guess_list);

  let filt_list = [];
  for (let i=0; i<_filt_list.length; i++) {
    if (_filt_list[i].w in g_info.allow_lookup) {
      filt_list.push( _filt_list[i] );
    }
  }

  let entropy_clue = entropy_guess(filt_list);

  console.log(">>filt_list:", filt_list.length, filt_list);

  if (entropy_clue.length < 20) {
    for (let i=0; i<entropy_clue.length; i++) {
      console.log("ebef:", entropy_clue[i]);
    }
  }

  //HACK
  //
  if (filt_list.length <= 2) {

    //...

    entropy_clue.sort( function(a,b) { return ((a.r > b.r) ? -1 : 1); } );

    console.log("!!!!", filt_list.length);
    for (let ii=0; ii<entropy_clue.length; ii++) {
      console.log("...", entropy_clue[ii]);
    }

  }

  else if (filt_list.length < 1000) {
  //else if (filt_list.length < 200) {

    let _x_entropy_clue = entropy_guess_x(filt_list, g_info.eldrow_list);

    for (let ii=0; ii<_x_entropy_clue.length; ii++) {

      if (ii<10) {
        console.log(">>>", _x_entropy_clue[ii]);
      }

      entropy_clue.push( _x_entropy_clue[ii] );
    }

    //entropy_score.sort( function(a,b) { return ((a.v > b.v) ? -1 : 1); } );
    entropy_clue.sort( function(a,b) { return ((a.v > b.v) ? -1 : 1); });

    console.log(">>>entropy_clue");
    let n = ((entropy_clue.length < 10) ? entropy_clue.length : 10);
    for (let ii=0; ii<n; ii++) {
      console.log("  ..:", entropy_clue[ii]);
    }
  }

  let common_filt_list = filter_list(g_info.common_filt_list, guess_list);
  let common_entropy_clue = entropy_guess(common_filt_list);

  let i=0;
  for (i=0; (i<10) && (i<entropy_clue.length); i++) {
    let _id = "#ui_suggestion_" + i;
    $(_id).html(entropy_clue[i].w);
  }
  for (; i<10; i++) {
    let _id = "#ui_suggestion_" + i;
    $(_id).html("...");
  }

  i=0;
  for (i=0; (i<10) && (i<common_entropy_clue.length); i++) {
    let _id = "#ui_common_suggestion_" + i;
    $(_id).html(common_entropy_clue[i].w);
  }
  for (; i<10; i++) {
    let _id = "#ui_common_suggestion_" + i;
    $(_id).html("...");
  }

  g_info.filt_list = filt_list;
  g_info.common_filt_list = common_filt_list;

}

function process_key(key) {
  let button_id = "#ui_button_" + g_info.cursor.row + "_" + g_info.cursor.col;

  console.log(">>>", key, g_info.cursor.row, g_info.cursor.col);

  if (key == 'enter') {
    console.log("enter");

    if (g_info.cursor.col < 5) {
      flash_button(button_id);
      return;
    }

    process_row(g_info.cursor.row);

    g_info.cursor.row++;
    g_info.cursor.col=0;
    return;
  }

  if (key == 'bksp') {

    console.log("before:", g_info.cursor.col);

    g_info.cursor.col--;
    if (g_info.cursor.col < 0) {
      g_info.cursor.col = 0;
    }
    let _id = "#ui_button_" + g_info.cursor.row + "_" + g_info.cursor.col;
    $(_id).html("&nbsp;");

    return;
  }

  if (g_info.cursor.col >= 5) {
    console.log("eol:", g_info.cursor.row, g_info.cursor.col);
    return;
  }

  //let button_id = "#ui_button_" + g_info.cursor.row + "_" + g_info.cursor.col;

  $(button_id).html(key);

  g_info.cursor.col++;
  if (g_info.cursor.col > 4) {
    g_info.cursor.col = 5;
  }

}

if ((typeof $ !== "undefined") && (typeof document !== "undefined")) {

$(document).ready(function() {

  let url = window.location.href;
  let url_tok = url.split("?");
  console.log(url_tok);
  if (url_tok.length > 1) {
    if (url_tok[1] == "nyt") {
      console.log("???");
      g_info.allow_processed = true;
    }
  }

  $(document).on('keyup', function(e) {
    //let tag = e.target.tagName.toLowerCase();
    //console.log(tag, e);
    console.log(e.key, e.which);

    if (e.key == "Backspace") {
      let _id = "#ui_kb_bksp";
      $(_id).click();
    }
    else if ((e.key == "ArrowUp") || (e.key=="ArrowDown")) {

      let dx = 0;
      if (e.key == "ArrowUp") { dx = 1; }
      else if (e.key == "ArrowDown") { dx = 2; }

      let _id = "#ui_button_" + g_info.cursor.row + "_" + g_info.cursor.col;

      g_info.button_state[_id] = (g_info.button_state[_id]+dx)%3;

      if (g_info.button_state[_id] == 0) {
        $(_id).css('background', "#fff");
      }
      else if (g_info.button_state[_id] == 1) {
        $(_id).css('background', "#b9e776");
      }
      else if (g_info.button_state[_id] == 2) {
        $(_id).css('background', "#fbea81");
      }

    }
    else {

      let key = e.key.replace(/[^a-zA-Z]/g, '');
      if (key.length > 0) {
        let _id = "#ui_kb_" + e.key.toLowerCase();
        $(_id).click();
      }
    }
  });

  load_lists();

  for (let i=0; i<5; i++) {
    for (let j=0; j<5; j++) {
      let _id = "#ui_button_" + i + "_" + j;

      g_info.button_state[_id] = 0;
      $(_id).css("user-select", "none");

      $(_id).click( (function(_x) {
        return function(e) {
          g_info.button_state[_x] = (g_info.button_state[_x]+1)%3;

          if (g_info.button_state[_x] == 0) {
            $(_x).css('background', "#fff");
          }
          else if (g_info.button_state[_x] == 1) {
            $(_x).css('background', "#b9e776");
          }
          else if (g_info.button_state[_x] == 2) {
            $(_x).css('background', "#fbea81");
          }

        };
      })(_id) );

    /*
    $(_id).mouseenter( (function(_x) {
      return function(e) { $(_x).css("background", "#eee"); }; })(_id)
    );

    $(_id).mouseleave( (function(_x) {
      return function(e) { $(_x).css("background", "#fff"); }; })(_id)
    );

    $(_id).mousedown( (function(_x) {
      return function(e) { $(_x).css("background", "#aaa"); }; })(_id)
    );

    $(_id).mouseup( (function(_x) {
      return function(e) { $(_x).css("background", "#eee"); }; })(_id)
    );
    */



    }
  }

  let alphabet = "abcdefghijklmnopqrstuvwxyz";

  let key_list = [];
  for (let i=0; i<alphabet.length; i++) {
    let ch = alphabet.charAt(i);
    key_list.push(ch);
  }
  key_list.push("bksp");
  key_list.push("enter");


  for (let i=0; i<key_list.length; i++) {
    let ch = key_list[i];

    let _id = "#ui_kb_" + ch;

    $(_id).css("user-select", "none");

    $(_id).mouseenter( (function(_x) {
        return function(e) {
          $(_x).css("background", "#eee");
        };
      })(_id)
    );

    $(_id).mouseleave( (function(_x) {
        return function(e) {
          $(_x).css("background", "#fff");
        };
      })(_id)
    );

    $(_id).mousedown( (function(_x) {
        return function(e) {
          $(_x).css("background", "#aaa");
        };
      })(_id)
    );

    $(_id).mouseup( (function(_x) {
        return function(e) {
          $(_x).css("background", "#eee");
        };
      })(_id)
    );

    $(_id).click( (function(_x) {
        return function(e) {
          let tok = _x.split("_");
          process_key(tok[2]);
        };
      })(_id)
    );


  }

  //let init_word = [ "tares", "aires", "aries", "tales", "rates", "saner", "lanes", "tears", "dares", "reals" ];
  let init_word = [
    "tares",
    "tears",
    "tores",
    "stare",
    "tries",
    "soare",
    "torse",
    "tires",
    "share",
    "teras" ];


  let common_init_word = [
    "tares", "sante", "rates", "tears", "saile", "tales", "saine", "saner", "artes", "tires"
  ];

  for (let i=0; (i<10) ; i++) {
    let _id = "#ui_suggestion_" + i;

    $(_id).html( init_word[i] );
  }

  for (let i=0; (i<10); i++) {
    let _id = "#ui_common_suggestion_" + i;
    $(_id).html( common_init_word[i] );
  }


  $("#ui_help").click( function() {
    $("#ui_modal_help").css("display", "block");
  });

  $("#ui_modal_help").click( function() {
    $("#ui_modal_help").css("display", "none");
  });


});


}

else {

  let fs = require("fs");

  g_info.allow_processed = true;

  let word_data = fs.readFileSync("../data/combined_wordlist.txt", "utf8");
  //let word_data = fs.readFileSync("../data/words_wordle.txt", "utf8");
  process_wordlist(word_data);

  let common_word_data = fs.readFileSync("../data/common_words", "utf8");
  process_common_wordlist(common_word_data);

  let freq_data = fs.readFileSync("../data/word_freq", "utf8");
  process_word_freq(freq_data);

  let allow_data = fs.readFileSync("../data/words_wordle_solutions.txt", "utf8");
  process_allowlist(allow_data);

  console.log("# filt_list:", g_info.filt_list.length);

  let ok = [
    "rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve",
    "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate",
    "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry",
    "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed",
    "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crate",
    "cluck", "spike", "mimic", "pound", "maxim", "linen", "unmet", "flesh", "booby",
    "forth", "first", "stand", "belly", "ivory", "seedy", "print", "yearn", "drain",
    "bribe", "stout", "panel", "crass", "flume", "offal", "agree", "error", "swirl",
    "argue", "bleed", "delta", "flick", "totem", "wooer", "front", "shrub", "parry",
    "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy", "round",
    "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult",
    "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab",
    "guild", "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought",
    "belch", "dutch", "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss",
    "growl", "fling", "dozen", "boozy", "erode", "world", "gouge", "click", "briar",
    "great", "altar", "pulpy", "blurt", "coast", "duchy", "groin", "fixer", "group",
    "rogue", "badly", "smart", "pithy", "gaudy", "chill", "heron", "vodka", "finer",
    "surer", "radio", "rouge", "perch", "retch", "wrote", "clock", "tilde", "store",
    "prove", "bring", "solve", "cheat", "grime", "exult", "usher", "epoch", "triad",
    "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace", "using",
    "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky",
    "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss",
    "siege", "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor",
    "abbey", "tangy", "panic", "solar", "shire", "proxy", "point", "robot", "prick",
    "wince", "crimp", "knoll", "sugar", "whack", "mount", "perky", "could", "wrung",
    "light", "those", "moist", "shard", "pleat", "aloft", "skill", "elder", "frame",
    "humor", "pause", "ulcer", "ultra", "robin", "cynic", "aroma", "caulk", "shake",
    "dodge", "swill", "tacit", "other", "thorn", "trove", "bloke", "vivid", "spill",
    "chant", "choke", "rupee", "nasty", "mourn", "ahead", "brine", "cloth", "hoard",
    "sweet", "month", "lapse", "watch", "today", "focus", "smelt", "tease", "cater",
    "movie", "saute", "allow", "renew", "their", "slosh", "purge", "chest", "depot",
    "epoxy", "nymph", "found", "shall", "harry", "stove", "lowly", "snout", "trope",
    "fewer", "shawl", "natal", "comma", "foray", "scare", "stair", "black", "squad",
    "royal", "chunk", "mince", "shame", "cheek", "ample", "flair", "foyer", "cargo",
    "oxide", "plant", "olive", "inert", "askew", "heist", "shown", "zesty", "hasty",
    "trash", "fella", "larva", "forgo", "story", "hairy", "train", "homer", "badge",
    "midst", "canny", "fetus", "butch", "farce", "slung", "tipsy", "metal", "yield",
    "delve", "being", "scour", "glass", "gamer", "scrap", "money", "hinge", "album",
    "vouch", "asset", "tiara", "crept", "bayou", "atoll", "manor", "creak", "showy",
    "phase", "froth", "depth", "gloom", "flood", "trait", "girth", "piety", "payer",
    "goose", "float", "donor", "atone", "primo", "apron", "blown", "cacao", "loser",
    "input", "gloat", "awful", "brink", "smite", "beady", "rusty", "retro", "droll",
    "gawky", "hutch", "pinto", "gaily", "egret", "lilac", "sever", "field", "fluff",
    "hydro", "flack", "agape", "voice", "stead", "stalk", "berth", "madam", "night",
    "bland", "liver", "wedge", "augur", "roomy", "wacky", "flock", "angry", "bobby",
    "trite", "aphid", "tryst", "midge", "power", "elope", "cinch", "motto", "stomp",
    "upset", "bluff", "cramp", "quart", "coyly", "youth", "rhyme", "buggy", "alien",
    "smear", "unfit", "patty", "cling", "glean", "label", "hunky", "khaki", "poker",
    "gruel", "twice", "twang", "shrug", "treat", "unlit", "waste", "merit", "woven",
    "octal", "needy", "clown", "widow", "irony", "ruder", "gauze", "chief", "onset",
    "prize", "fungi", "charm", "gully", "inter", "whoop", "taunt", "leery", "class",
    "theme", "lofty", "tibia", "booze", "alpha", "thyme", "eclat", "doubt", "parer",
    "chute", "stick", "trice", "alike", "sooth", "recap", "saint", "liege", "glory",
    "grate", "admit", "brisk", "soggy", "usurp", "scald", "scorn", "leave", "twine",
    "sting", "bough", "marsh", "sloth", "dandy", "vigor", "howdy", "enjoy"];


  for (let idx=0; idx<ok.length; idx++) {
    let ref_word = ok[idx];

    let guess = "tares";
    //let guess = "soars";

    console.log("## ref:", ref_word);

    let _filt_list = g_info.eldrow_list;
    let filt_list = [];
    for (let i=0; i<_filt_list.length; i++) {
      if (_filt_list[i].w in g_info.allow_lookup) {
        filt_list.push( _filt_list[i] );
      }
    }


    let it=0;
    for (it=0; it<5; it++) {

      if (guess == ref_word) { break; }

      let _c = eldrow_string(guess, ref_word);

      let _x = "";
      for (let i=0; i<_c.length; i++) {
        let ch = _c.charAt(i);
        if (i>0) { _x += " "; }
        if (ch == 'g') { _x += guess.charAt(i); }
        else if (ch == 'y') { _x += guess.charAt(i).toUpperCase(); }
        else if (ch == 'b') { _x += "!" + guess.charAt(i); }
      }
      let pw = parse_word(_x);


      console.log(guess, _c, _x, pw);

      filt_list = filter_list(filt_list, pw);

      let entropy_clue = entropy_guess(filt_list);

      if (filt_list.length <= 2) {
        entropy_clue.sort( function(a,b) { return ((a.r > b.r) ? -1 : 1); } );
      }
      else if (filt_list.length < 1000) {
        let _x_entropy_clue = entropy_guess_x(filt_list, g_info.eldrow_list);
        for (let ii=0; ii<_x_entropy_clue.length; ii++) {
          entropy_clue.push( _x_entropy_clue[ii] );
        }
        entropy_clue.sort( function(a,b) { return ((a.v > b.v) ? -1 : 1); });
      }

      if (entropy_clue.length == 0) {
        console.log("ERROR on", ref_word);
        break;
      }

      guess = entropy_clue[0].w;
    }

    console.log("DONE:", it+1);

  }

  console.log("...");
}
