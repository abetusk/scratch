const ws = require('ws');
const srv = new ws.Server({ port: 8080 });

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
    "type": "client"
  };
  g_ctx.conn_id++;

  conn.on('message', (msg) => {
    console.log("Received: ", msg.toString() );

    console.log("conn:", conn);

    let s = msg.toString();
    let _to_msg = "";
    if (s.length == 0) { return; }
    if (s[0] == '{') {
      let msg_json = JSON.parse( s );

      _to_msg = msg_json["type"];
      console.log(">>>", msg_json);
    }


    let conn_info = g_ctx.conn_info;

    for (let conn_id in conn_info) {
      let _to_conn = conn_info[conn_id].conn;
      let snd_msg = {
        "message": _to_msg,
        "id": g_ctx.id
      };




      if (_to_conn == conn) {
        console.log("!!!");
      }
      else {
        console.log(".._", conn_id, "_>",
          conn_info[conn_id].id, 
          conn_info[conn_id].type, JSON.stringify(snd_msg) );

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

console.log('Server running on ws://localhost:8080');
