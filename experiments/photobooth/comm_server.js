const ws = require('ws');
var https = require("https");
var fs = require("fs");

var https_srv = https.createServer({
  "cert": fs.readFileSync("./ssl/ssl-cert-snakeoil.pem"),
  "key": fs.readFileSync("./ssl/ssl-cert-snakeoil.key")
  }, function(req,res) {
    res.writeHead(200);
    res.end("wss srv running\n");
  });



//const srv = new ws.Server({ "port": 8080 });
const srv = new ws.WebSocketServer({ "server": https_srv });

//console.log(srv);

var g_ctx = {
  "conn_info": {},
  "conn_id": 0,
  "id": 0
};

srv.on('connection', (conn) => {
  console.log('Client connected');

  g_ctx.conn_info[ g_ctx.conn_id.toString() ] = {
    "id": g_ctx.conn_id,
    "conn": conn,
    "cert": fs.readFileSync("./ssl/ssl-cert-snakeoil.pem"),
    "key": fs.readFileSync("./ssl/ssl-cert-snakeoil.key"),
    "type": "client"
  };
  g_ctx.conn_id++;

  conn.on('message', function(msg) {
    console.log("Received: ", msg.toString().length );
    //console.log("conn:", conn);

    let s = msg.toString();
    let _msg_json = {
      "type": "error",
      "data": "bad data"
    };

    //_msg_json = msg;
    if (s.length == 0) { return; }
    if (s[0] == '{') { _msg_json = JSON.parse( s ); }

    for (let conn_id in g_ctx.conn_info) {
      let _to_conn = g_ctx.conn_info[conn_id].conn;
      let snd_msg = {
        "type": "error",
        "data": "bad data",
        "id": g_ctx.id
      };

      if (_msg_json.type == "click") {
        snd_msg.type = "click";
        snd_msg.data = "click";
      }
      else if (_msg_json.type == "png") {
        snd_msg.type = "png";
        snd_msg.data = _msg_json.data
      }
      else if (_msg_json.type == "jpeg") {
        snd_msg.type = "jpeg";
        snd_msg.data = _msg_json.data
      }




      // don't send back to original
      //
      if (_to_conn == conn) { } //console.log("!!!"); }
      else {
        //console.log(".._", conn_id, "_>",
        //  g_ctx.conn_info[conn_id].id, 
        //  g_ctx.conn_info[conn_id].type, JSON.stringify(snd_msg) );

        _to_conn.send( JSON.stringify(snd_msg) );
      }
    }

    /*
    else {

      let snd_msg = {
        "message": "hello",
        "id": g_ctx.id
      };
      conn.send( JSON.stringify(snd_msg) );
    }
    //g_ctx.id++;
    */

  });

  conn.on('close', function(info) {
    console.log('Client disconnected', info)
  });
});

https_srv.listen(8080, function() { console.log("wss://locahost:8080/ running"); });

//console.log('Server running on localhost:8080');
