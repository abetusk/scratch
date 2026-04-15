
var g_ctx = {
  "ctx": null,
  "canvas": null,
  "btn": null
};

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

  //btn_dl.addEventListener('click', photo_download);

}

function photo_snap() {
  let vid = g_ctx.vid;


  g_ctx.canvas.width = vid.videoWidth;
  g_ctx.canvas.height = vid.videoHeight;

  let w = g_ctx.canvas.width;
  let h = g_ctx.canvas.height;

  g_ctx.ctx.drawImage(vid, 0, 0, w,h);
}

function photo_download() {
  let dl_link
  let data = g_ctx.canvas.toDataURL('image/png');
}
