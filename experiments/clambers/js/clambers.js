// License: CC0
//

var g_ctx = {
  "data": {},
  "ready": false
};

function letsort(w) {
  return w.split("").sort().join("");
}

function load_json(e) {
  if (this.status == 200) {
    g_ctx.data  = JSON.parse(this.response);
    g_ctx.ready = true;
  }
}

function req_json(url, cb) {
  cb = ((typeof cb === "undefined") ? load_json : cb);
  let req = new XMLHttpRequest();
  req.responseType = 'text';
  req.open("GET", url, true);
  req.onload = cb;
  req.send(null);
}

function ui_update_answer_list( word_list ) {
  let ui_title = document.getElementById("ui_answer_title");
  let ui_list = document.getElementById("ui_answer_list");

  ui_list.innerHTML = '';

  if (word_list.length==0) {
    ui_title.innerHTML = 'No answer found';
    return;
  }

  ui_title.innerHTML = 'Word list:';

  for (let idx=0; idx<word_list.length; idx++) {
    let w = word_list[idx];
    let _li = document.createElement("li");
    _li.appendChild(document.createTextNode(w));
    ui_list.appendChild(_li);
  }

}

function clambers_ui_unscramble() {

  console.log("bang");

  if (!g_ctx.ready) {
    setTimeout(clambers_ui_unscramble, 50);
    return;
  }

  let ele = document.getElementById("ui_word");

  let v = ele.value;
  let sv = letsort(v);

  console.log(">>>", ele.value, sv, g_ctx.data[sv]);

  if (sv in g_ctx.data) {
    ui_update_answer_list( g_ctx.data[sv] );
  }
  else {
    ui_update_answer_list( [] );
  }

}

function ui_word_cr(x) {
  if (typeof x === "undefined") { return; }
  if (x.key == 'Enter') {
    clambers_ui_unscramble();
  }
}

function clambers_init() {
  let ele = document.getElementById("ui_button_unscramble");
  ele.onclick = clambers_ui_unscramble;
  req_json("data/scram_word.json");

  document.getElementById("ui_word").onkeydown = ui_word_cr;
}


