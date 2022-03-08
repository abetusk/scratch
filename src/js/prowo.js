// License: CC0
//
// proof of work
//

var _isnode = false;

var g_prowo = {
  "isnode" : false,
  "state" : "idle",
  "base_msg" : "ok...",
  "msg" : "ok...",
  "counter": 0,
  "difficulty": 4,
  "cb": _default_prowo_cb
};

function init() {
  var m = [];
  var t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var ii=0; ii<32; ii++) {
    m.push( t[ Math.floor(Math.random()*t.length) ] );
  }
  g_prowo.base_msg = m.join("");
  g_prowo.msg = m.join("");
  console.log(">>>", g_prowo.base_msg);
}

if (typeof module !== "undefined") {
  _isnode = true;
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

//digestMessage(text).then(digestHex => console.log(digestHex));


function _default_prowo_cb(digest) {
  //var s = new TextEncoder().decode(digest);

  var _k = g_prowo.difficulty;

  var _found = true;
  for (var ii=0; ii<_k; ii++) {
    if (digest[ii] != '0') { _found = false; break; }
  }

  if (_found) {
    g_prowo.state = "found";
    console.log(g_prowo.state, digest, g_prowo.msg, g_prowo.counter);
  }
  else {
    g_prowo.counter ++;
    g_prowo.msg = g_prowo.base_msg + g_prowo.counter.toString();
    digestMessage(g_prowo.msg).then( digest => g_prowo.cb(digest) );
  }

  //console.log(g_prowo.state, digest);
}

function prowo(txt, cb) {
  if (typeof cb === "undefined") { cb = _default_prowo_cb; }
  g_prowo.cb = cb;
  //console.log("???????");
  if (_isnode) {
  }
  else {
    g_prowo.counter = 0;
    g_prowo.base_msg = txt;
    g_prowo.msg = txt + g_prowo.counter.toString();
    //console.log("...");
    digestMessage(g_prowo.msg).then( digest => cb(digest) );
  }
}

init();

prowo("testing");
