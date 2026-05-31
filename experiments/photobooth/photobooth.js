
var g_ctx = {
  "ctx": null,
  "canvas": null,
  "btn": null
};


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




function _stream_func(s) {
  let video = document.getElementById("ui_camera");
  video.srcObject = s;
}

function _stream_err(e) {
  console.log("stream error:", e);
}

function init() {
  navigator.mediaDevices.getUserMedia({"video": true})
    .then(_stream_func)
    .catch(_stream_err);

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

    //var info = document.getElementById("fileInfo").value;

    var formData = new FormData();
    formData.append( "fileData", _b );

    //var uri = "ul.cgi";
    var uri = "cgi-bin/ul.cgi";
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
