#!/usr/bin/env node
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var fs = require("fs");

let TODO_JSON = process.env['HOME'] + "/.config/todo/todo.json";

function show_help(fp, msg) {
  if (typeof msg !== "undefined") {
    fp.write(msg + "\n");
  }

  fp.write("help ...\n");
}

if (!fs.existsSync(TODO_JSON)) {
  show_help(process.stderr, "could not find todo.json (" + TODO_JSON + ")");
  process.exit(-1);
}

var todo_data = JSON.parse(fs.readFileSync( TODO_JSON ));
let fp = process.stdout;
let argv = process.argv.slice(2);

function show_all(fp,data) {

  fp.write("\n");

  fp.write("mondo:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "mondo") {
      fp.write("  " + ele.title + "\n");
    }
  }
  fp.write("\n");

  fp.write("mezzo:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "mezzo") {
      fp.write("  " + ele.title + "\n");
    }
  }
  fp.write("\n");

  fp.write("nigh:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "nigh") {
      fp.write("  " + ele.title + "\n");
    }
  }
  fp.write("\n");

  fp.write("^^sotto^^:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "sotto") {
      fp.write("  " + ele.title + "\n");
    }
  }
  fp.write("\n");

}

if (argv.length < 1) {
  show_all(fp, todo_data.todo);
}



process.exit(0);
