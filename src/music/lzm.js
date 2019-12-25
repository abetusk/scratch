var fs = require("fs");

var S = 1024;

if (process.argv.length != 3) {
  console.log("provide midi json file");
  process.exit(-1);
}

var fn = process.argv[2];

var midijson = JSON.parse(fs.readFileSync(fn));

function tokenize(note_track, bpm) {

  var sec_per_beat = 60.0/bpm;
  var quant_n = 64;
  var quant_s = sec_per_beat/quant_n;
  var window_n = quant_n*2;
  var window_s = sec_per_beat/window_n;

  var token = [];

  var start_t = 0;
  var idx_s = 0;
  var cur_group = { "name" : "", "time" : "", "duration" : 0, "beat_duration": 0, "notes" : [] };
  for (var ii=0; ii<note_track.length; ii++) {

    if (ii==0) {
      start_t = note_track[ii].time;
    }

    var beat_s = Math.floor(quant_n * (note_track[ii].duration + window_s)) / quant_n;
    console.log(beat_s, note_track[ii]);

    //if (Math.abs(start_t - note_track[ii].time





  }
  

}

var music_dict = {
  "S":S,
  "enc":[],
  "M":{}
};

tokenize(midijson.tracks[1].notes, midijson.header.bpm);

process.exit();

for (var track_idx=0; track_idx < midijson.tracks.length; track_idx++) {
  var track = midijson.tracks[track_idx];

  var prev_pfx = "";
  var pfx = "";

  for (var note_idx=0; note_idx < track.notes.length; note_idx++) {
    var note = track.notes[note_idx];

    var enc_dur_str = Math.floor(note.duration * S).toString();
    var tok = note.name + ":" + enc_dur_str;

    var x = ((pfx.length == 0) ? tok : (pfx + "," + tok));

    if (x in music_dict.M) {
      music_dict.M[x].freq ++;
      pfx = x;
    }
    else {
      music_dict.M[x] = { "freq": 1, "T":{} };
      music_dict.enc.push(x);
      pfx = "";
    }
  }
}

for (var ii=1; ii<music_dict.enc.length; ii++) {

  var src = music_dict.enc[ii-1];
  var dst = music_dict.enc[ii];

  if (dst in music_dict.M[src].T) {
    music_dict.M[src].T[dst].freq++;
  }
  else {
    music_dict.M[src].T[dst] = { "freq" : 1 };
  }

}

console.log(JSON.stringify(music_dict));

function print_note_freq(m) {
  for (var pfx in m.M) {
    console.log(m.M[pfx].freq.toString() +  " " + pfx);
  }
}

//console.log(JSON.stringify(music_dict.enc));

