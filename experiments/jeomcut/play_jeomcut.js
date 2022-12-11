//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//


var mcut = require("./mcut.js");
var jeom = require("./jeom.js");



function _main() {



}

function _wait_lib_load() {
  if (!mcut.calledRun) {
    setTimeout(_wait_lib_load, 1);
    return;
  }

  _main();
}
_wait_lib_load();

