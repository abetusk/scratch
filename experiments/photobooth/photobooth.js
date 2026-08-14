
var g_ctx = {
  "ctx": null,
  "canvas": null,
  "btn": null
};


//const socket = io("http://192.168.0.1:3000");
//const socket = io("http://localhost:3000");
const socket = io("http://localhost:8182");
//const socket = io("http://127.0.0.1:3000");

socket.on("connect_error", (err) => {
  console.log("err", err.message);
});

socket.on("connection", () => {
  console.log("connection?");
  //log("Connected to server");
});

socket.on("connect", () => {
  console.log("connect?");
  //log("Connected to server");
});

socket.on("msg", data => {
  log("Server: " + data);
});

function send() {
  const t = document.getElementById("text").value;
  socket.emit("msg", t);
  log("Client: " + t);
}

function log(msg) {
  const div = document.getElementById("log");
  div.innerHTML += msg + "<br>";
}


//----
//----
//----

function sendFile( file ) {
  console.log("file:");
  console.log(file);

  for (x in file) {
    console.log(x, file[x]);
  }

  var info = document.getElementById("fileInfo").value;

  var formData = new FormData();
  formData.append( "fileData", file );
  formData.append( "fileInfo", info);
  formData.append( "fileName", file["name"])
  formData.append( "fileTime", file["lastModified"]);

  var uri = "ul.py";
  var xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", uploadProgress, false );
  xhr.addEventListener("load", uploadComplete, false );
  xhr.addEventListener("error", uploadError, false );
  xhr.addEventListener("abort", uploadAbort, false );

  xhr.open( "POST", uri );
  xhr.send( formData );

}


//----
//----
//----


async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}


function delete_cookie(key, path) {
  var a = document.cookie.split(";");
  for (var ii=0; ii<a.length; ii++) {
    var kv = a[ii].split("=");
    if (kv[0].trim() == key) {
      if (typeof path !== 'undefined') {
        document.cookie = key + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT;path=" + path;
      }
      else {
        document.cookie = key + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
  }
}


function update_cookie_credential() {

  let u = "anonymous";
  let h = "xxxx";

  document.cookie = "username=" + u;
  document.cookie = "passhash=" + h;
}



function _stream_func(s) {
  let video = document.getElementById("ui_camera");
  video.srcObject = s;
}

function _stream_err(e) {
  console.log("stream error:", e);

  let err_ele = document.getElementById("ui_error_message");
  err_ele.innerHTML = e;
}

function init() {

  update_cookie_credential();

  let _desktop = false;

  let err_ele = document.getElementById("ui_error_message");
  err_ele.innerHTML = "cp.0:" + JSON.stringify(navigator);


  if (_desktop) {
    navigator.mediaDevices.getUserMedia({"video": true})
      .then(_stream_func)
      .catch(_stream_err);
  }
  else {
    let _u = navigator.mediaDevices.getUserMedia({
      "video": {
        //"width": {"ideal":4096 },
	//"height":{"ideal": 2160 },
	//"height":{"ideal": 4096 },
	//"height":{"ideal": 2160 },
	"height":{"ideal": 3840 },
        "facingMode":"environment"
      },
      "audio":false
    })
      .then(_stream_func)
      .catch(_stream_err);

  let err_ele = document.getElementById("ui_error_message");
  err_ele.innerHTML = _u;

  }

  let btn = document.getElementById("ui_capture");
  //let btn_dl = document.getElementById("ui_download");
  let canvas = document.getElementById("ui_canvas");
  let ctx = canvas.getContext('2d');
  let vid = document.getElementById('ui_camera');


  g_ctx.ctx = ctx;
  g_ctx.canvas = canvas;
  g_ctx.btn = btn;
  g_ctx.vid = vid;

  btn.addEventListener('click', photo_snap);
  vid.addEventListener('click', photo_snap);

  //btn_dl.addEventListener('click', photo_download);

}

function uploadComplete(x) {
  console.log("uc:", this.response);
  return;

}


function __uploadComplete(x) {
  var json_data = JSON.parse( this.response );

  console.log( json_data.id , json_data);
  //window.location.href = "ngc_view?id=" + json_data.id;

  g_data.message.push("complete");

  var msg = "...";
  var info = "...";
  if ("id" in json_data) {
    msg = "success";
    info = json_data.id;
  }
  else if ("info" in json_data) {
    msg = "fail";
    info = json_data.info;
  }

  _add_info_row('upload', msg, info);

}

function uploadError() {
  console.log("upload error");
}

function uploadAbort() {
  console.log("upload abort");
}

function uploadProgress() {
  console.log("upload progress");
}


function photo_snap() {
  let vid = g_ctx.vid;

  g_ctx.canvas.width = vid.videoWidth;
  g_ctx.canvas.height = vid.videoHeight;

  let w = g_ctx.canvas.width;
  let h = g_ctx.canvas.height;

  g_ctx.ctx.drawImage(vid, 0, 0, w,h);


  g_ctx.ctx.canvas.toBlob( function(_b) {
    let _img = document.createElement("img");
    let url = URL.createObjectURL(_b);

    _img.src = url;

    let _user = "anonymous";
    let _pwhash = "xxxx";

    //var info = document.getElementById("fileInfo").value;

    var formData = new FormData();
    formData.append( "fileData", _b );
    //formData.append( "username", _user );
    //formData.append( "passhash", _pwhash );

    //var uri = "ul.cgi";
    var uri = "cgi-bin/ul.cgi";
    //var uri = "cgi-bin/ul.py";
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false );
    xhr.addEventListener("load", uploadComplete, false );
    xhr.addEventListener("error", uploadError, false );
    xhr.addEventListener("abort", uploadAbort, false );

    xhr.open( "POST", uri );
    xhr.send( formData );
  });

}

function photo_download() {
  let dl_link;
  let data = g_ctx.canvas.toDataURL('image/png');

  console.log(data);
}

//---
//---
//---



