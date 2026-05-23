
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

    console.log("???", _b);

    let _form_data = new FormData();
    _form_data.append('file', _b, 'img.png');

    fetch('ul.cgi', {
      "method" : "POST",
      "body": _form_data
    })
    .then( resp => resp.json() )
    .then( data => console.log("success?", data) )
    .catch( err => console.error("error:", err ) );

  });


}

function photo_download() {
  let dl_link
  let data = g_ctx.canvas.toDataURL('image/png');
}
