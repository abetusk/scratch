// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var _descr = {
  "*" : "half",
  "+" : "quarter",
  ":" : "eighth",
  "." : "sixteenth"
};

var _rest = [ "Z", "z" ];
var _normal = [ "*c4", "+c4", ":c4", ".c4" ];
var _sharp  = [ "#c4", "=c4", "-c4", ",c4" ];
var _flat = [ "&c4", "@c4", "/c4", "_c4" ];

" hc4 qc4 ec4 sc4";
" Sc4 sc4 ";
" Sc4 sc4 ";

var terms = [
  "measure", "melody"
];

function _unfurl(note_template) {

  let tempo_type = [
    "*", "+", ":", ".",
    "#", "=", "-", ",",
    "&", "@", "/", "_"
  ];

  let note = [];
  for (let i=0; i<note_template.length; i++) {

    let _n = note_template[i];
    if (_n.length == 3) { note.push(_n); continue; }

    let _na = [];

    if (_n.length == 1) {
      for (let s=0; s<=9; s++) {
        _na.push( _n + s.toString() );
      }
    }
    else {
      _na.push( _n );
    }

    for (let j=0; j<tempo_type.length; j++) {
      for (let k=0; k<_na.length; k++) {
        note.push( tempo_type[j] + _na[k] );
      }
    }
  }

  return note;
}

function s2melody(s) {
  let tok0 = s.split("|");

  let melody = [];

  for (let i=0; i<tok0.length; i++) {
    let a = tok0[i].trim().split(/  */);
    melody.push(a);
  }

  return melody;
}

function check_melody_tonic(M) {

  let note_first = "";
  let note_last = "";

  if ((M.length > 0) &&
      (M[0].length > 0)) {

    let measure_first = M[0];
    let measure_last = M[ M.length-1 ];

    note_first = measure_first[0].slice(1);
    note_last = measure_last[ measure_last.length-1 ].slice(1);
  }

  if ((note_first == "") ||
      (note_first != note_last)) {
    return {
      "r": -1,
      "msg": "melody_tonic: first note (" + note_first + ") != last note (" + note_last + ")"
    };
  }

  return { "r": 0, "msg": "" };
}

function check_melody_basic_rhythm(M) {
  let ok_res = { "r": 0, "msg": "" };
  let a_rhythm = [];

  let rhythm_constraint = {
    "*": 1, "#": 1, "&": 1,
    "+": 1, "=": 1, "@": 1,
    ":": 2, "-": 2, "/": 2,
    ".": 4, ",": 4, "_": 4
  };

  for (let m_idx=0; m_idx < M.length; m_idx++) {
    for (let n_idx=0; n_idx < M[m_idx].length; n_idx++) {
      a_rhythm.push( M[m_idx][n_idx][0] );
    }
  }

  if (a_rhythm.length == 0) { return ok_res; }

  let s_val = a_rhythm[0];
  let s_len = 1;

  for (let r_idx=1; r_idx < a_rhythm.length; r_idx++) {
    if (a_rhythm[r_idx] == s_val) { s_len++; continue; }

    if (s_val == 'z') {

      if (s_len > 1) {
        return {
          "r": -1,
          "msg": "basic_rhythm: two rests in a row at " + (r_idx-1).toString()
        };
      }

    }

    else {

      if (!(s_val in rhythm_constraint)) {
        return {
          "r": -1,
          "msg": "basic_rhythm: unknown tempo value " + s_val + " at " + (r_idx-1).toString()
        };
      }

      let _L = rhythm_constraint[ s_val ];
      if ( (s_len % _L) != 0 ) {
        return {
          "r": -1,
          "msg": "basic_rhythm: constraint violation for tempo " + s_val + " at " + (r_idx-1).toString()
        };

      }

    }

    s_val = a_rhythm[r_idx];
    s_len = 1;

  }

  if (s_val == 'z') {

    if (s_len > 1) {
      return {
        "r": -1,
        "msg": "basic_rhythm: two rests in a row at " + (a_rhythm.length-1).toString()
      };
    }

  }

  else {

    if (!(s_val in rhythm_constraint)) {
      return {
        "r": -1,
        "msg": "basic_rhythm: unknown tempo value " + s_val + " at " + (a_rhythm.length-1).toString()
      };
    }

    let _L = rhythm_constraint[ s_val ];
    if ( (s_len % _L) != 0 ) {
      return {
        "r": -1,
        "msg": "basic_rhythm: constraint violation for tempo " + s_val + " at " + (a_rhythm.length-1).toString()
      };
    }

  }


  return ok_res;
}

function check_melody_notes(M, notes) {
  let res = { "r": 0, "msg": "" };

  for (let im=0; im<M.length; im++) {

    let _measure = M[im];
    for (let j=0; j<_measure.length; j++) {

      let _found = false;
      for (let k=0; k<notes.length; k++) {
        if ( _measure[j] == notes[k] ) { _found = true; break; }
      }

      if (!_found) {
        res.r = -1;
        res.msg = "melody_notes: measure:" + im.toString() + ", note:" + _measure[j] + " (" + j.toString() + ")";
        break;
      }
    }
  }

  return res;
}

function check_melody_rhythm(M, rhythm_lib) {
  let res = { "r": 0, "msg": "" };

  for (let im=0; im<M.length; im++) {
    let _measure = M[im];

    let _found = false;

    for (let r_idx=0; r_idx < rhythm_lib.length; r_idx++) {
      let rhythm = rhythm_lib[r_idx];
      if (rhythm.length != _measure.length) { continue; }

      let _rhythm_match = true;
      for (let t_idx=0; t_idx < rhythm.length; t_idx++) {
        if (rhythm[t_idx] != _measure[t_idx][0]) { _rhythm_match = false; break; }
      }

      if (_rhythm_match) { _found = true; break; }
    }

    if (!_found) {
      res.r = -1;
      res.msg = "melody_rhythm: measure (" + im.toString() + ") tempo pattern not found";
      break;
    }

  }

  return res;
}

function ex_1_1(M) {
  let ok_res = { "r":0, "msg": ""};

  let valid_notes = _unfurl( [ "e4", "g4", "a4", "b4" ] );
  let rhythm_lib = [ [ "+", "+", "+", "*" ] ];

  let n_measure = 6;

  res = check_melody_notes(M, valid_notes);
  if (res.r != 0) { return res; }

  res = check_melody_rhythm(M, rhythm_lib);
  if (res.r != 0) { return res; }

  res = check_melody_tonic(M);
  if (res.r != 0) { return res; }

  res = check_melody_basic_rhythm(M);
  if (res.r != 0) { return res; }

  return ok_res;

}

function parse_line(line) {
  let tok = line.trim().split(/  */);
  return tok;
}

// use rlwrap to get command history.
// e.g.
//
//   rlwrap node bard-puzzle.js repl
//
function _main_repl() {
  var readline = require("node:readline");
  async function readLines() {
    let rl = readline.createInterface({
      "input": process.stdin,
      "output": process.stdout,
      "terminal": false
    });

    process.stdout.write("$ ");

    for await (let line of rl) {

      let tok = parse_line(line);

      if (tok.length == 0) { continue; }

      if ((tok[0] == 'help') || (tok[0] == '?'))  {
        console.log("");
        console.log("  norm:", _normal.join(" "));
        console.log("  shrp:", _sharp.join(" "));
        console.log("  flat:", _flat.join(" "));
        console.log("  rest:", _rest.join(" "));
        console.log("");
        console.log("op:");
        console.log("");
        console.log("  s2m - string to melody format");
        console.log("  ct  - check tonic constraint");
        console.log("  cr  - check basic rhythm constraint");
        console.log("");
      }

      else if (tok[0] == 's2m') {
        let M = s2melody( tok.slice(1).join(" ") );
        console.log(M);
      }

      else if (tok[0] == 'ct') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = check_melody_tonic(M);
        console.log(res);
      }

      else if (tok[0] == 'cr') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = check_melody_basic_rhythm(M);
        console.log(res);
      }

      else if (tok[0] == 'ex1.1') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = ex_1_1( M );
        console.log(">>", res);
      }


      process.stdout.write("$ ");
    }
  }

  readLines();
}

function _test0() {
  let melo0 = "+e4 +e4 +e4 *a4 | +a4 +a4 +a4 *b4"
  let melo1 = "+e3 +e4 +e4 *a4 | +a4 +a4 +a4 *b4"
  let melo2 = "+e4 +e4 +e4 *a4 | +c4 +a4 +a4 *b4"
  let melo3 = ".e4 +e4 +e4 *a4 | +a4 +a4 +a4 *b4"

  console.log( s2melody(melo0) );

  ex_1_1( s2melody(melo0) );
  ex_1_1( s2melody(melo1) );
  ex_1_1( s2melody(melo2) );
  ex_1_1( s2melody(melo3) );
}

if ((typeof process !== "undefined") &&
    (typeof process.argv !== "undefined")) {
  let argv = process.argv.slice(1);

  if ((argv.length > 1) &&
      (argv[1] == "repl")) {
    _main_repl();
  }
  else {
    console.log("provide command, one of: help, repl");
  }

}
