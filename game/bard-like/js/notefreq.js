
let n_octave = 9;
let note_lookup = [ 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b' ];

let s = Math.pow(2, 1/12);
let note_ref_freq = [];
let base_freq = 27.5;
for (let octave_idx = 0; octave_idx < 9; octave_idx++) {
  note_ref_freq.push( base_freq * Math.pow(2, octave_idx) );
}

var note_freq = {
  "note": [],
  "freq": [],
  "note2freq": {}
};

for (let octave_idx = 0; octave_idx < n_octave; octave_idx++) {
  for (let note_idx=0; note_idx < note_lookup.length; note_idx++) {

    let note = note_lookup[note_idx];

    let k = note_idx - 9;

    let fqnote = note + octave_idx.toString();
    let f = note_ref_freq[octave_idx] * Math.pow(2, k / 12);

    note_freq.note.push(fqnote);
    note_freq.freq.push( f );


    note_freq.note2freq[fqnote] = f;


  }
}

console.log(JSON.stringify(note_freq, undefined, 2));
