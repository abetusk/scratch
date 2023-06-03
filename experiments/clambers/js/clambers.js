
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

function clambers_init() {
  let ele = document.getElementById("ui_button_unscramble");
  ele.onclick = clambers_ui_unscramble;
}

function clambers_ui_unscramble() {
  let ele = document.getElementById("ui_word");

  let v = ele.value;

  lw 

  console.log(">>>", ele.value);
}
