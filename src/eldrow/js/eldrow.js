
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
  console.log("###", g_info.eldrow_list.length, g_info.common_eldrow_list.length);
}

function process_wordlist(data) {
  //console.log("got wordlist:", data);

  word_list = data.split("\n");
  let eldrow_list = [];
  let eldrow_lookup = {};

  for (let i=0; i<word_list.length; i++) {

    if (word_list[i].match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = word_list[i].toLowerCase();
      if (w in eldrow_lookup) {
        continue;
      }
      eldrow_lookup[w] = eldrow_list.length;
      eldrow_list.push(w);
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

    if (common_word_list[i].match(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)) {
      let w = common_word_list[i].toLowerCase();
      if (w in common_eldrow_lookup) {
        continue;
      }
      common_eldrow_lookup[w] = common_eldrow_list.length;
      common_eldrow_list.push(w);
    }

  }

  g_info.common_eldrow_list = common_eldrow_list;
  g_info.common_eldrow_lookup = common_eldrow_lookup;

  g_info.common_filt_list = common_eldrow_list;

  check_finished();
}

function load_lists() {
  xhr_request("data/combined_wordlist.txt", process_wordlist);
  xhr_request("data/common_words", process_common_wordlist);
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
    let w = wlist[i];
    if (flist.length != w.length) {
      console.log("ERROR");
      return undefined;
    }

    let reject = false;
    //let y_count = 0;
    
    // positional matching
    //
    for (let j=0; j<flist.length; j++) {
      let ch = w.charAt(j);

      // if the letter is green and the character doesn't match,
      // reject
      //
      if ( (flist[j].v == 1) && (ch != flist[j].c) ) {

        if (debug) {
          //console.log("reject0", w, ch, "!=", flist[j].c, "(", flist[j].v, ")");
        }

        reject = true;
        break;
      }

      // if the letter is yellow and the character *does* match,
      // reject
      //
      if ( (flist[j].v == 0) && (ch == flist[j].c) ) {

        if (debug) {
          //console.log("reject1", w, ch, "!=", flist[j].c, "(", flist[j].v, ")");
        }

        reject = true;
        break;
      }
      //if ( (flist[j].v == -1) && (

      // if the letter isblack and the character *does* match,
      // reject
      //
      if ( (flist[j].v == -1) && (ch == flist[j].c) ) {
        reject = true;
      }
      //if (chmap[ch] == 0) { y_count++; }
    }
    if (reject) { continue; }

    /*
    if (y_count != src_y_count) {
      //console.log("reject2", w, y_count, src_y_count);
      continue;
    }
    */

    if (debug) {
      console.log("here:", w);
    }

    let w_count = {};
    for (let j=0; j<w.length; j++) {
      let ch = w.charAt(j);

      if (!(ch in w_count)) {
        w_count[ch] = 0
      }
      w_count[ch]++;
    }

    if (debug) {
      console.log("filter word bounds:");
      for (let key in bounds) {
        console.log("  ", key, bounds[key]);
      }
      console.log("---");
    }

    for (let ch in bounds) {
      let count = 0;
      if (ch in w_count) {
        count = w_count[ch];
      }

      if ((count < bounds[ch].min) || (count > bounds[ch].max)) {


        if (debug) {
          console.log("YES, REJECT");
        }

        reject=true;
        break;
      }
    }

    for (let ch in w_count) {
      if (!(ch in bounds)) {

        if (debug) {
          console.log(ch, "!in", w, "...skpping");
        }

        continue;
      }

      if (debug) {
        console.log("w_count[", ch, "]", w_count[ch], "bounds[", ch, "]:", bounds[ch]);
      }

      if ((w_count[ch] < bounds[ch].min) || (w_count[ch] > bounds[ch].max)) {
        reject = true;
        break;
      }
    }




    if (debug) {
      console.log("");
    }

    if (reject) { continue; }

    rlist.push(w);
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

//DEBUG
//_test_filter_list(eldrow_list);
//process.exit();

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
    [ "eases", "onion" ]
  ];

  for (let i=0; i<test_pair.length; i++) {
    let u = eldrow_string( test_pair[i][0], test_pair[i][1] );
    console.log("guess:", test_pair[i][0], "ref:", test_pair[i][1], u);
  }

}

//DEBUG
//
//_test_eldrow_string();
//process.exit();



function entropy_guess(filt_list) {
  if (filt_list.length<2) {
    if (filt_list.length==0) { return []; }
    return [ { "w": filt_list[0], "v": 0 } ];
  }

  let entropy_score = [];

  for (let i=0; i<filt_list.length; i++) {
    let guess = filt_list[i];

    let count = {};
    let entropy = 0;

    for (let j=0; j<filt_list.length; j++) {
      if (i==j) { continue; }

      let ref = filt_list[j];

      let eldrow_s = eldrow_string(guess, ref);

      if (!(eldrow_s in count)) {
        count[eldrow_s] = 0;
      }
      count[eldrow_s]++;
    }

    for (let key in count) {
      let p = count[key]/(filt_list.length-1);
      entropy += -(p*Math.log(p));
    }

    entropy_score.push( {"w": guess, "v": entropy });

    if ((i>0) && ((i%250)==0)) {
      console.log("###", i);
    }
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
    let _entg = entropy_guess(filt_list);
    for (let j=0; (j<_entg.length) && (j<10); j++) {
      console.log(j, _entg[j]);
    }
  }

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

  let filt_list = filter_list(g_info.filt_list, guess_list);
  let entropy_clue = entropy_guess(filt_list);

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

$(document).ready(function() {

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

  let init_word = [ "tares", "aires", "aries", "tales", "rates", "saner", "lanes", "tears", "dares", "reals" ];
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



});


