// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var TEMPO_DESCR = {
  "o" : "whole",
  "*" : "half",
  "+" : "quarter",
  ":" : "eighth",
  "." : "sixteenth",
};

var BARD_NOTE = [
  "c", "u",   "d", "v",
  "e",
  "f", "w",   "g", "x",   "a", "y",
  "b"
];

var BARD_NOTE_DESCR = {
  "c": "C", "u": "C#/B flat",
  "d": "D", "v": "D#/E flat",
  "e": "E",
  "f": "F", "w": "F#/G flat",
  "g": "G", "x": "G#/A flat",
  "a": "A", "y": "A#/B flat",
  "b": "B",
  "z": "quarter rest", "Z":"half rest"
};

var _rest = [ "Z", "z" ];

var terms = [
  "measure", "melody"
];

var BARD_NOTE_MIDI_MAP = {};

//                 0    1    2    3    4    5    6    7    8    9    10   11
var BASE_NOTE = [ "c", "u", "d", "v", "e", "f", "w", "g", "x", "a", "y", "b" ];

function init_note_map() {

  let midi_idx = 0;
  for (let octave=-1; octave <= 9; octave++) {
    for (let idx=0; idx<BASE_NOTE.length; idx++) {

      if ((octave == 9) && (idx >= 8)) { continue; }

      let note = BASE_NOTE[idx] + octave.toString();
      BARD_NOTE_MIDI_MAP[note] = midi_idx;
      midi_idx++;
    }
  }

}
init_note_map();

function s2melody(s) {
  let tok0 = s.split("|");

  let melody = [];

  for (let i=0; i<tok0.length; i++) {
    let a = tok0[i].trim().split(/  */);
    melody.push(a);
  }

  return melody;
}

function check_melody_start_note(M, base_note) {
  if (M.length == 0) {
    return {
      "r": -1,
      "msg": "start_note: no melody",
      "score":-1
    };
  }

  if (M[0].length == 0) {
    return {
      "r": -1,
      "msg": "start_note: invalid first measure",
      "score":-1
    };
  }

  let note = M[0][0];
  if (note == base_note) { return { "r": 0, "msg":"", "score":0 }; }

  if (note.length != 3) {
    return {
      "r": -1,
      "msg": "start_note: invalid first note {" + note + "}",
      "score":-1
    };
  }

  let _bn = note.slice(1);
  if (_bn != base_note) {
    return {
      "r": -1,
      "msg": "start_note: invalid first note {" + note + " != " + base_note + "}",
      "score":-1
    };
  }

  return { "r": 0, "msg": "", "score": 0 };
}

// "do not exceed a total range of a major 10th":
//   16 semitones
// to semitones for a major valur v is:
//
//   lookup:
//     major 2nd = 2 semitones
//     major 3rd = 4 semitones
//     major 4th = 5 semitones
//     major 5th = 7 semitones
//     major 6th = 9 semitones
//     major 7th = 11 semitones
//     major 8th = 12 semitones
//     major 9th = 14 semitones
//     major 10th = 16 semitones
//
//
//   12*floor( (v-1)/7 ) + (major[v%7])
//
// "use 2nds and 3rds freely" skip 1-2/3-4 semitones
//   freely
//   - in the scale, if next note is 1-2 semitones, this
//     is considered a 2nd, if the next note is 3-4 semitones,
//     it's considered a 3rd
//
function check_melody_stride(M) {

  let mM = [-1,-1];

  let _midi = BARD_NOTE_MIDI_MAP;

  for (let measure_idx=0; measure_idx<M.length; measure_idx++) {

    for (let n_idx=0; n_idx<M[measure_idx].length; n_idx++) {
      let note = M[measure_idx][n_idx];

      if ((note == 'z') || (note == 'Z')) { continue; }

      if (note.length != 3) {
        return {
          "r": -1,
          "msg" : "melody_stride: invalid note {" + note.toString() + "}",
          "score":-1
        };
      }

      let base_note = note.slice(1);

      if (!(base_note in _midi)) {
        return { "r": -1, "msg" : "melody_stride: note {" + note.toString() + "} not in midi map", "score":-1 };
      }

      let val = _midi[base_note];

      if ((mM[0] < 0) || (val < mM[0])) { mM[0] = val; }
      if ((mM[1] < 0) || (val > mM[1])) { mM[1] = val; }
    }

  }

  if ((mM[1] - mM[0]) > 16) {
    return { "r": -1, "msg" : "melody_stride: stride too large (got:" + (mM[1]-mM[0]).toString() + ")", "score": -1 };
  }

  return { "r": 0, "msg": "", "score": 0 }
}

function check_melody_repeat(M, min_rep_count) {
  let res = { "r": 0, "msg": "", "score": 0, "match_count": 0, "data": [] };

  for (let measure_idx=0; measure_idx<M.length; measure_idx++) {
    for (let m1_idx=(measure_idx+1); m1_idx < M.length; m1_idx++) {

      let _ml = M[measure_idx].length;
      if (_ml != M[m1_idx].length) { continue; }

      let found = true;
      for (let n=0; n < _ml; n++) {
        if (M[measure_idx][n] != M[m1_idx][n]) { found = false; break; }
      }

      //WIP
      if (found) {
        res.match_count++;
        res.data.push( [measure_idx, m1_idx] );
      }
    }
  }

  if (res.match_count < min_rep_count) {
    res.r = -1;
    res.msg = "melody_repeat: failed to meet min. measure rep. count (" + res.match_count.toString() + " != " + min_rep_count +")";
  }

  return res;
}

function check_melody_progression(M, prog) {

  let prog_cur_idx = 0,
      prog_nxt_idx = 1,
      prog_prv_idx = -1;



  for (let measure_idx=0; measure_idx<M.length; measure_idx++) {

    for (let n_idx=0; n_idx<M[measure_idx].length; n_idx++) {
      let note = M[measure_idx][n_idx];
      if ((note == 'z') || (note == 'Z')) { continue; }
      let base_note = note[1];

      if ((prog_prv_idx >= 0) &&
          (prog[prog_prv_idx] == base_note)) {
        continue;
      }

      if ( prog[prog_cur_idx] == base_note ) {
        prog_prv_idx = prog_cur_idx;
        prog_cur_idx = (prog_cur_idx+1)%prog.length;
      }
      else {
        return {
          "r" : -1,
          "msg": "melody_progression: expected note {" + ((prog_prv_idx >= 0) ? (prog[prog_prv_idx] + "," + prog[prog_cur_idx]) : prog[prog_cur_idx]) + "}," +
            "got measure[" + measure_idx.toString() + "], note[" + n_idx.toString() + "] {" + note + "}",
          "score": -1
        };
      }


    }
  }

  return { "r": 0, "msg": "", "score": 0 }
}


function check_melody_length(M, mM_measure) {
  if ((M.length < mM_measure[0]) ||
      (M.length >= mM_measure[1])) {
    return {
      "r": -1,
      "msg": "melody_length: length (" + M.length.toString() + ") out of range ([" + mM_measure[0].toString() + ":" + mM_measure[1].toString() + "))",
      "score": -1
    };
  }

  return {"r":0, "msg": "", "score": 0 };
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
      "msg": "melody_tonic: first note (" + note_first + ") != last note (" + note_last + ")",
      "score": -1
    };
  }

  return { "r": 0, "msg": "", "score": 0 };
}

function check_melody_basic_rhythm(M) {
  let ok_res = { "r": 0, "msg": "", "score": 0 };
  let a_rhythm = [];

  // rhythm constrained to multiples of value
  //
  let rhythm_constraint = {
    "*": 1,
    "+": 1,
    ":": 2,
    ".": 4,
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
          "msg": "basic_rhythm: two rests in a row at " + (r_idx-1).toString(),
          "score": -1
        };
      }

    }

    else {

      if (!(s_val in rhythm_constraint)) {
        return {
          "r": -1,
          "msg": "basic_rhythm: unknown tempo value " + s_val + " at " + (r_idx-1).toString(),
          "score": -1
        };
      }

      let _L = rhythm_constraint[ s_val ];
      if ( (s_len % _L) != 0 ) {
        return {
          "r": -1,
          "msg": "basic_rhythm: constraint violation for tempo " + s_val + " at " + (r_idx-1).toString(),
          "score": -1
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
        "msg": "basic_rhythm: two rests in a row at " + (a_rhythm.length-1).toString(),
        "score": -1
      };
    }

  }

  else {

    if (!(s_val in rhythm_constraint)) {
      return {
        "r": -1,
        "msg": "basic_rhythm: unknown tempo value " + s_val + " at " + (a_rhythm.length-1).toString(),
        "score": -1
      };
    }

    let _L = rhythm_constraint[ s_val ];
    if ( (s_len % _L) != 0 ) {
      return {
        "r": -1,
        "msg": "basic_rhythm: constraint violation for tempo " + s_val + " at " + (a_rhythm.length-1).toString(),
        "score": -1
      };
    }

  }


  return ok_res;
}

function check_melody_notes(M, notes) {
  let res = { "r": 0, "msg": "", "score": 0 };

  for (let im=0; im<M.length; im++) {

    let _measure = M[im];
    for (let j=0; j<_measure.length; j++) {

      let _found = false;
      for (let k=0; k<notes.length; k++) {
        if ( _measure[j] == notes[k] ) { _found = true; break; }
      }

      if (!_found) {
        res.r = -1;
        res.msg = "melody_notes: measure[" + im.toString() + "], note[" + j.toString() + "]{" + _measure[j] + "} not in permissable note list";
        break;
      }
    }
  }

  return res;
}

function check_melody_rhythm(M, rhythm_lib) {
  let res = { "r": 0, "msg": "", "score": 0 };

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

function descr_ex1_1() {
  let descr = [];
  let valid_notes = [ "e4", "g4", "a4", "b4" ];
  let rhythm_lib = [ [ "+", "+", "+", "*" ] ];
  let n_measure = [6,7];

  let rhythm_s = [];
  for (let i=0; i<rhythm_lib.length; i++) {
    rhythm_s.push( rhythm_lib[i].join("") );
  }


  //descr.push("note restrict " + valid_notes.join(" "));
  //descr.push("rhythm restrict " + rhythm_s.join(" "));

  descr.push("restrict " + valid_notes.join(" "));
  descr.push("restrict " + rhythm_s.join(" "));

  if ((n_measure[1]-1) == n_measure[0]) {
    descr.push("measure length " + n_measure[0].toString());
  }
  else {
    descr.push("measure length [" + n_measure[0].toString(), n_measure[1].toString(), ")");
  }
  descr.push("constraint: tonic,basic rhythm");

  return "(" + descr.join( ") (" ) + ")"
}

function ex1_1(M) {
  let ok_res = { "r":0, "msg": ""};

  let valid_notes = [ "+e4", "*e4", "+g4", "*g4", "+a4", "*a4", "+b4", "*b4" ];
  let rhythm_lib = [ [ "+", "+", "+", "*" ] ];

  let n_measure = [6,7];

  let res = {};

  res = check_melody_length(M, n_measure);
  if (res.r != 0) { return res; }

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

function descr_ex1_2() {
  let descr = [];
  let valid_notes = ["f", "a", "b", "c"];
  let rhythm_lib = [
    [ ":", ":", ":", ":", "+", "+" ],
    [ "+", "+", ":", ":", "+" ]
  ];
  let n_measure = [4,8];

  let rhythm_s = [];
  for (let i=0; i<rhythm_lib.length; i++) {
    rhythm_s.push( rhythm_lib[i].join("") );
  }

  descr.push("restrict " + valid_notes.join(" "));
  descr.push("restrict " + rhythm_s.join(" "));
  if ((n_measure[1]-1) == n_measure[0]) {
    descr.push("measure length " + n_measure[0].toString());
  }
  else {
    descr.push("measure length [" + n_measure[0].toString() + " : " + n_measure[1].toString() + ")");
  }
  descr.push("constraint: tonic,basic rhythm");

  return "(" + descr.join( ") (" ) + ")"
}

function ex1_2(M) {

  let ok_res = { "r": 0, "msg": "", "score": 0 };

  let _vnre = "[\*\+\:\.][fabc][345]";

  let valid_notes = [
    "*f4", "+f4", ":f4", ".f4",
    "*f3", "+f3", ":f3", ".f3",
    "*f5", "+f5", ":f5", ".f5",

    "*a4", "+a4", ":a4", ".a4",
    "*a3", "+a3", ":a3", ".a3",
    "*a5", "+a5", ":a5", ".a5",

    "*b4", "+b4", ":b4", ".b4",
    "*b3", "+b3", ":b3", ".b3",
    "*b5", "+b5", ":b5", ".b5",

    "*c4", "+c4", ":c4", ".c4",
    "*c3", "+c3", ":c3", ".c3",
    "*c5", "+c5", ":c5", ".c5"
  ];


  let rhythm_lib = [
    [ ":", ":", ":", ":", "+", "+" ],
    [ "+", "+", ":", ":", "+" ]
  ];

  let n_measure = [4,8];

  let res = {};

  res = check_melody_length(M, n_measure);
  if (res.r != 0) { return res; }

  res = check_melody_stride(M);
  if (res.r != 0) { return res; }

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

function descr_ex1_3(M) {

  let descr = [];
  let valid_notes = ["d", "a", "f", "e", "c"];
  let note_progression = [ "d", "a", "f", "e", "c" ];

  let rhythm_lib = [
    [ "+", ":", ":", "*" ],
    [ "z", "+", "+", "+" ]
  ];
  let n_measure = [6,11];

  let rhythm_s = [];
  for (let i=0; i<rhythm_lib.length; i++) {
    rhythm_s.push( rhythm_lib[i].join("") );
  }

  descr.push("restrict " + valid_notes.join(" "));
  descr.push("progression " + note_progression.join(" "));
  descr.push("restrict " + rhythm_s.join(" "));
  if ((n_measure[1]-1) == n_measure[0]) {
    descr.push("measure length " + n_measure[0].toString());
  }
  else {
    descr.push("measure length [" + n_measure[0].toString() + " : " + n_measure[1].toString() + ")");
  }
  descr.push("constraint: tonic,basic rhythm");

  return "(" + descr.join( ") (" ) + ")"

}

function ex1_3(M) {

  let ok_res = { "r": 0, "msg": "", "score": 0 };

  let valid_notes = [
    "*d4", "+d4", ":d4", ".d4",
    "*d3", "+d3", ":d3", ".d3",
    "*d5", "+d5", ":d5", ".d5",

    "*a4", "+a4", ":a4", ".a4",
    "*a3", "+a3", ":a3", ".a3",
    "*a5", "+a5", ":a5", ".a5",

    "*f4", "+f4", ":f4", ".f4",
    "*f3", "+f3", ":f3", ".f3",
    "*f5", "+f5", ":f5", ".f5",

    "*e4", "+e4", ":e4", ".e4",
    "*e3", "+e3", ":e3", ".e3",
    "*e5", "+e5", ":e5", ".e5",

    "*c4", "+c4", ":c4", ".c4",
    "*c3", "+c3", ":c3", ".c3",
    "*c5", "+c5", ":c5", ".c5",

    "z", "Z"
  ];

  let note_progression = [ "d", "a", "f", "e", "c" ];

  let rhythm_lib = [
    [ "+", ":", ":", "*" ],
    [ "z", "+", "+", "+" ]
  ];
  let n_measure = [6,11];

  let res = {};

  res = check_melody_length(M, n_measure);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_stride(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_notes(M, valid_notes);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_rhythm(M, rhythm_lib);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_tonic(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_basic_rhythm(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_progression(M, note_progression);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  return ok_res;
}

function descr_ex1_4(M) {

  let descr = [];
  let valid_notes = ["c", "d", "e", "f", "g", "a", "b"];
  let rhythm_lib = [ [ "+", ":", ":", "*" ] ];
  let n_measure = [6,11];

  let first_note = "c4";

  let rhythm_s = [];
  for (let i=0; i<rhythm_lib.length; i++) {
    rhythm_s.push( rhythm_lib[i].join("") );
  }

  descr.push("restrict " + valid_notes.join(" "));
  descr.push("restrict " + rhythm_s.join(" "));
  if ((n_measure[1]-1) == n_measure[0]) {
    descr.push("measure length " + n_measure[0].toString());
  }
  else {
    descr.push("measure length [" + n_measure[0].toString() + " : " + n_measure[1].toString() + ")");
  }
  descr.push("constraint: tonic{" + first_note + "},basic rhythm");

  return "(" + descr.join( ") (" ) + ")"
}



function ex1_4(M) {
  let ok_res = { "r": 0, "msg": "", "score": 0 };

  let valid_notes = enumerate_note( "*+:.", "cdefgab", [3,6]);
  let rhythm_lib = [ [ "+", ":", ":", "*" ] ];
  let n_measure = [6,11];

  let first_note = "c4";

  let res = {};

  res = check_melody_start_note(M, first_note);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_length(M, n_measure);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_stride(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_notes(M, valid_notes);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_rhythm(M, rhythm_lib);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_tonic(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_basic_rhythm(M);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  res = check_melody_repeat(M, 1);
  if (res.r != 0) { return res; }
  ok_res.score += res.score;

  return ok_res;
}

function ex1_1_example_solution() {
  return "+e4 +e4 +e4 *g4 | " +
    "+e4 +e4 +e4 *a4 | " +
    "+e4 +e4 +e4 *b4 | " +
    "+e4 +e4 +e4 *g4 | " +
    "+e4 +e4 +e4 *a4 | " +
    "+e4 +e4 +e4 *e4";
}

function ex1_2_example_solution() {
  return ":f4 :f4 :f4 :f4 +a4 +b4 | " +
    "+b4 +c4 :f4 :f4 +a4 | " +
    ":a4 :b4 :c4 :f4 +a4 +a4 | " +
    "+c4 +c4 :b4 :b4 +f4";
}

function ex1_3_example_solution() {
  return "+d4 :d4 :d4 *d4 | " +
    "z +d4 +d4 +d4 | " +
    "z +a4 +f4 +e4 | " +
    "z +c4 +d4 +d4 | " +
    "+a4 :a4 :f4 *e4 | " +
    "z +e4 +c4 +d4";
}

function ex1_4_example_solution() {
  return "+c4 :d4 :d4 *e4 | " +
    "+a4 :d4 :e4 *a4 | " +
    "+a4 :d4 :e4 *e4 | " +
    "+g4 :a4 :b4 *c4 | " +
    "+c4 :d4 :d4 *e4 | " +
    "+g4 :a4 :b4 *c4";
}



//     uvxyz
//     U     V      X    Y    Z
//     C#    D#     F#   G#   A#
//  C     D     E F    G    A    B
//

// a_t - tempo, array of tempo (Hqes)
// a_n - generalized note class (cudvefxgyazb)
// a_o - octave range, min/max-1
//
function enumerate_note( a_t, a_n, a_o ) {

  let note_list = [];

  for (let i=0; i<a_t.length; i++) {
    for (let j=0; j<a_n.length; j++) {
      let _tc = a_t[i];
      let _nc = a_n[j];

      for (let octave=a_o[0]; octave<a_o[1]; octave++) {
        let note = _tc + _nc + octave.toString();
        note_list.push(note);
      }
    }
  }

  return note_list;
}

//----
//----
//----
//----

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

        let tempo = [ 'o', '*', '+', ':', '.'];

        console.log("");
        console.log("  note format:");
        console.log("");
        console.log("       tempo                octave         rest note");
        console.log("         |                    |                |");
        console.log("      {o*+:.}{cudvefwgxayb}{<0-9}      { o*+:.}z");
        console.log("                  |                        |");
        console.log("                 note               tempo (optional)");
        console.log("")
        console.log("  example:");
        console.log("");
        console.log("    :z :g4 :g4 :g4 | *v4 | :z :f4 :f4 :f4 | *d4");
        console.log("");
        console.log("  tempo:");
        console.log("");
        for (let i=0; i<tempo.length; i++) {
          console.log("    " + tempo[i] + " " + TEMPO_DESCR[tempo[i]])
        }
        console.log("");
        console.log("  notes:");
        console.log("");
        for (let i=0; i<4; i+=2) {
          console.log("    " + BARD_NOTE[i] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[i] ] +
            "    " +BARD_NOTE[i+1] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[i+1] ] );
        }
        console.log("    " + BARD_NOTE[4] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[4] ] );
        for (let i=5; i<10; i+=2) {
          console.log("    " + BARD_NOTE[i] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[i] ] +
            "    " +BARD_NOTE[i+1] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[i+1] ] );
        }
        console.log("    " + BARD_NOTE[11] + "  " + BARD_NOTE_DESCR[ BARD_NOTE[11] ] );


        console.log("");
        console.log("");
        console.log("op:");
        console.log("");
        console.log("  s2m - string to melody format");
        console.log("  ct  - check tonic constraint");
        console.log("  cr  - check basic rhythm constraint");
        console.log("");
        console.log("challenges:");
        console.log("");
        console.log("  ex1.1:", descr_ex1_1());
        console.log("  ex1.2:", descr_ex1_2());
        console.log("  ex1.3:", descr_ex1_3());
        console.log("  ex1.4:", descr_ex1_4());
        console.log("");

      }

      else if (tok[0] == 'unfurl') {
        let u = _unfurl( tok.slice(1) );

        let _a = [], _fold = 12;
        for (let i=0; i<u.length; i++) {
          if ((_a.length > 0) && ((i%_fold)==0)) {
            console.log( _a.join(" ") );
            _a = [];
          }
          _a.push( u[i] );
        }
        if (_a.length > 0) { console.log(_a.join(" ")); }

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
        let res = ex1_1( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.1.sol') {
        let _sol = ex1_1_example_solution();
        console.log(">>>", _sol);
        let M = s2melody( _sol );
        let res = ex1_1( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.2') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = ex1_2( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.2.sol') {
        let _sol = ex1_2_example_solution();
        console.log(">>>", _sol);
        let M = s2melody( _sol );
        let res = ex1_2( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.3') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = ex1_3( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.3.sol') {
        let _sol = ex1_3_example_solution();
        console.log(">>>", _sol);
        let M = s2melody( _sol );
        let res = ex1_3( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.4') {
        let M = s2melody( tok.slice(1).join(" ") );
        let res = ex1_4( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
      }

      else if (tok[0] == 'ex1.4.sol') {
        let _sol = ex1_4_example_solution();
        console.log(">>>", _sol);
        let M = s2melody( _sol );
        let res = ex1_4( M );
        console.log(">>", ((res.r == 0) ? "PASS:" : "FAIL:"), res);
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

  ex1_1( s2melody(melo0) );
  ex1_1( s2melody(melo1) );
  ex1_1( s2melody(melo2) );
  ex1_1( s2melody(melo3) );
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
