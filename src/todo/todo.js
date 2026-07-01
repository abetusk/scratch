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

var TODO_VERSION = "0.1.0";

let TODO_JSON = process.env['HOME'] + "/.config/todo/todo.json";

function _ws(n) {
  let a = [];
  for (let i=0; i<n; i++) { a.push(" "); }
  return a.join("");
}

function show_help(fp, msg) {
  if (typeof msg !== "undefined") { fp.write(msg + "\n"); }

  fp.write("\ntodo - a simple command line todo interface (v" + TODO_VERSION + ")\n\n");
  fp.write("  todo [verbose|help]\n\n");
  fp.write("               (no args) print todo\n");
  fp.write("    verbose    print notes with todo items\n");
  fp.write("    help       this screen\n");
  fp.write("\n");
  fp.write("To add todo items, edit the `todo.json` file\n");
  fp.write("located in '" + TODO_JSON + "'.\n");
  fp.write("\n");
  fp.write("Items have a \"scope\", which consists of:\n\n");

  let descr_map = {};
  for (let i=0; i<todo_data.template.description.length; i++) {
    let descr = todo_data.template.description[i];
    for (let _key in descr) {
      descr_map[_key] = descr[_key];
    }
  }

  for (let i=0; i<todo_data.template.scope.length; i++) {
    let scope_name = todo_data.template.scope[i];
    fp.write("  " + scope_name + _ws( 10 - scope_name.length ) + descr_map[scope_name] + "\n");
  }
  fp.write("\n");

  fp.write("Items may be further adorned with a 'note' field.\n");
  fp.write("Completed todo items ('finire') can be adorned with a 'finished_date' field.\n");
  fp.write("\n\n");

}

if (!fs.existsSync(TODO_JSON)) {
  show_help(process.stderr, "could not find todo.json (" + TODO_JSON + ")");
  process.exit(-1);
}

var todo_data = JSON.parse(fs.readFileSync( TODO_JSON ));
let fp = process.stdout;
let argv = process.argv.slice(2);

function show_all(fp,data, flag) {
  flag = ((typeof flag === "undefined") ? {} : flag);

  fp.write("\n");

  fp.write("mondo:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "mondo") {
      fp.write("  " + ele.title + "\n");

      if (("note" in flag) &&
          (flag.note) &&
          ("note" in ele)) {
        fp.write("    " + ele.note + "\n\n");
      }
    }
  }
  fp.write("\n");

  fp.write("mezzo:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "mezzo") {
      fp.write("  " + ele.title + "\n");
      if (("note" in flag) &&
          (flag.note) &&
          ("note" in ele)) {
        fp.write("    " + ele.note + "\n\n");
      }
    }
  }
  fp.write("\n");

  fp.write("divertire:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "divertire") {
      fp.write("  " + ele.title + "\n");
      if (("note" in flag) &&
          (flag.note) &&
          ("note" in ele)) {
        fp.write("    " + ele.note + "\n\n");
      }
    }
  }
  fp.write("\n");

  fp.write("nigh:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "nigh") {
      fp.write("  " + ele.title + "\n");
      if (("note" in flag) &&
          (flag.note) &&
          ("note" in ele)) {
        fp.write("    " + ele.note + "\n\n");
      }
    }
  }
  fp.write("\n");

  fp.write("^^sotto^^:\n---\n");
  for (let i=0; i<data.length; i++) {
    let ele = data[i];
    if (ele.scope == "sotto") {
      fp.write("  " + ele.title + "\n");
      if (("note" in flag) &&
          (flag.note) &&
          ("note" in ele)) {
        fp.write("    " + ele.note + "\n\n");
      }
    }
  }
  fp.write("\n");

}

if (argv.length < 1) {
  show_all(fp, todo_data.todo);
}
else {
  if ((argv[0] == "verbose") || (argv[0] == 'v')) {
    show_all(fp, todo_data.todo, { "note": true });
  }
  else if (argv[0] == "help") {
    show_help(fp);
  }
  else {
    show_help(process.stderr , "invalid option");
  }
}



process.exit(0);
