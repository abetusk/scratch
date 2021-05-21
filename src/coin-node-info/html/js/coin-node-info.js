// License: cc0
//

function retrieve_json(loc, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      cb(xhr.response);
    }
  }

  xhr.open("GET", loc, true);
  xhr.send("");
}

function _pop_div_row(ui_id, dat, fields) {
  var ele = document.getElementById(ui_id);
  ele.innerHTML = '';

  var hdr = document.createElement('div');
  hdr.className='pure-g row';
  var row = document.createElement('div');
  row.className='pure-g row';

  for (var idx=0; idx<fields.length; idx++) {
    var f = fields[idx];

    var _e = document.createElement('div');
    var _t = document.createTextNode(f);

    _e.className = 'pure-u-1-8 col';
    _e.appendChild(_t);
    hdr.appendChild(_e);

    var _e1 = document.createElement('div');
    var _t1 = document.createTextNode(((f in dat) ? dat[f] : ''));

    _e1.className = 'pure-u-1-8 col';
    _e1.appendChild(_t1);
    row.appendChild(_e1);


  }
  ele.appendChild(hdr);
  ele.appendChild(row);


}

function _app_div_row(ui_id, dat, fields) {
  var ele = document.getElementById(ui_id);

  var row = document.createElement('div');
  row.className='pure-g row';

  for (var idx=0; idx<fields.length; idx++) {
    var f = fields[idx];

    var _e = document.createElement('div');
    var _t = document.createTextNode(((f in dat) ? dat[f] : ''));

    _e.className = 'pure-u-1-8 col';
    _e.appendChild(_t);
    row.appendChild(_e);


  }
  ele.appendChild(row);

}

// blockchaininfo.json  info.json  networkinfo.json  peerinfo.json

function pop_blockchaininfo(dat_str) {
  var dat = JSON.parse(dat_str);
  var fields = ['chain', 'blocks', 'difficulty', 'mediantime', 'verificationprogress'];

  _pop_div_row("ui_blockchaininfo", dat, fields);
}

function pop_info(dat_str) {
  var dat = JSON.parse(dat_str);
  var fields = ['version', 'connections', 'blocks', 'difficulty', 'testnet'];
  _pop_div_row("ui_info", dat, fields);
}

function pop_networkinfo(dat_str) {
  var dat = JSON.parse(dat_str);
  var fields = ['version', 'subversion', 'protocolversion', 'localrelay', 'networkactive', 'connections'];
  _pop_div_row("ui_networkinfo", dat, fields);

  var ele = document.getElementById("ui_networkinfo");

  var addr_fields = ['address', 'port', 'score'];

  var hdr_ele = document.createElement('div');
  hdr_ele.className='pure-g row';
  for (var hdr_idx=0; hdr_idx < addr_fields.length; hdr_idx++) {
    var _e = document.createElement('div');
    var _t = document.createTextNode(addr_fields[hdr_idx]);

    _e.className = 'pure-u-1-3 col';
    _e.appendChild(_t);
    hdr_ele.appendChild(_e);
  }
  ele.appendChild(hdr_ele);

  for (var idx=0; idx<dat["localaddresses"].length; idx++) {
    var row_ele = document.createElement('div');
    row_ele.className='pure-g row';
    var _r = dat["localaddresses"][idx];
    for (var hdr_idx=0; hdr_idx < addr_fields.length; hdr_idx++) {
      var _netdat = dat["localaddresses"][idx];
      var _e = document.createElement('div');
      var _t = document.createTextNode( ((addr_fields[hdr_idx] in _netdat) ? _netdat[addr_fields[hdr_idx]] : '') );

      _e.className = 'pure-u-1-3 col';
      _e.appendChild(_t);
      row_ele.appendChild(_e);
    }
    ele.appendChild(row_ele);
  }

}

function pop_peerinfo(dat_str) {
  var dat = JSON.parse(dat_str);

  var fields = ['id', 'version', 'subver', 'synced_blocks', 'whitelisted', 'addr'];

  var ui_id = 'ui_peerinfo';
  var ele = document.getElementById(ui_id);
  ele.innerHTML = '';

  _pop_div_row(ui_id, dat[0], fields);
  for (var idx=1; idx<dat.length; idx++) {
    _app_div_row(ui_id, dat[idx], fields);
  }
}

function get_coin_info_data() {
  retrieve_json("json/blockchaininfo.json", pop_blockchaininfo);
  retrieve_json("json/info.json", pop_info);
  retrieve_json("json/networkinfo.json", pop_networkinfo);
  retrieve_json("json/peerinfo.json", pop_peerinfo);
}
