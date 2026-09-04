var dt_reconnect_attempt = 1000;

var g_ctx = {
  "png" : ""
};

var g_ws = {};

function _connect() {
  const ws = new WebSocket('ws://localhost:8080');
  g_ws = ws;
  
  ws.onopen = function() { console.log('Connected to server'); }
  ws.onmessage = function(event) {
    document.getElementById('log').innerText = event.data.slice(0,32) + "..." + event.data.slice(-1);
    let _from_msg = JSON.parse(event.data);
    if (_from_msg.type == 'png') {

      g_ctx.png = _from_msg.data;

      let ele = document.getElementById("ui_img");

      //console.log("???", ele, _from_msg.data);



      ele.src = _from_msg.data.toString();
    }
  };

  ws.onclose = function(ev) {
    console.log("connection lost... will retry");

    setTimeout( () => {
      console.log("attempting...");
      _connect();
    }, dt_reconnect_attempt);
  };

}

function send_msg(v) {
  //g_ws.send( JSON.stringify({"message": "ok...", "id": 1, "type": v }) );
  g_ws.send( JSON.stringify({"data": "ok...", "id": 1, "type": v }) );
}


function init() {
  _connect();
}

