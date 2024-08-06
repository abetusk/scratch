var g_nighthubbub_info = {
  "ready": false,
  "data": {},
  "sched": []
};

var op = {
  "h1": function(txt) {
    let h = document.createElement("h1"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "h2": function(txt) {
    let h = document.createElement("h2"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "h3": function(txt) {
    let h = document.createElement("h3"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "h4": function(txt) {
    let h = document.createElement("h4"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "h5": function(txt) {
    let h = document.createElement("h5"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "h6": function(txt) {
    let h = document.createElement("h6"); 
    if (typeof txt !== "undefined") { h.innerHTML = txt; }
    return h;
  },

  "br": function() { return document.createElement("br"); },

  "img": function(src, w) {
    let _img = document.createElement("img");
    _img.src = src;
    if (typeof w !== "undefined") {
      _img.style.width = w;
    }
    return _img;
  },

  "div": function(n) {
    n = ((typeof n === "undefined") ? 0 : n);
    let n2s = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve" ];
    let d = document.createElement("div");
    if (n>0) {
      d.classList.add(n2s[n]);
      d.classList.add("columns");
    }
    return d;
  },
  "row": function() { let d = document.createElement("div"); d.className = "row"; return d; },
  "span": function(txt, font_size) {
    //n = ((typeof n === "undefined") ? 0 : n);
    //let n2s = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve" ];
    let s = document.createElement("span");
    //if (n>0) {
    //  s.classList.add(n2s[n]);
    //  s.classList.add("columns");
    //}
    if (typeof txt !== "undefined") {
      s.innerHTML = txt;
    }
    if (typeof font_size !== "undefined") {
      s.style.fontSize = font_size;
    }
    return s;
  },
  "text": function(v) { return document.createTextNode(v); },
  "t": function(v) { return document.createTextNode(v); }
};

function get_schedule(url) {
  let req  = new XMLHttpRequest();
  req.responseType = 'json';
  req.open("GET", url, true);
  req.onload = function() {
    //let resp = req.response;
    let data = req.response;
    g_nighthubbub_info.data = data;
    g_nighthubbub_info.sched = data.schedule;

    g_nighthubbub_info.ready = true;

    ready();

  };
  req.send(null);
}

/*
	<div class='row'>

		<div class='two columns' style='line-height:1.1;' >
			<span style='font-size:4.5em;' > 02 </span> <br>
			<span style='font-size:3em;' > SUN </span>
		</div>

		<div class='two columns'>
			<h3> thumb </h3>
		</div>

		<div class='eight columns'>
			<h2 > EVENT NAME </h2>
			<h4> extra information </h4>
		</div>

	</div>
*/

function add_event(list_id, day_num, day_week, thumb_img, band, venue, url ) {
  let ele = document.getElementById(list_id);

  let r = op.row();

  let dt = op.div(2);

  dt.style.lineHeight = "1.1";

  dt.appendChild( op.span(day_num, "4.5em") );
  dt.appendChild( op.br() );
  dt.appendChild( op.span(day_week, "3em") );

  let thumb_div = op.div(2);

  //let thumb = op.img(thumb_img);

  if (thumb_img != "") {
    //thumb.appendChild( op.h3(thumb_img) );
    thumb_div.appendChild( op.img(thumb_img, "100%") );
  }
  else {
    thumb_div.innerHTML = "&nbsp;";
    //thumb_div.appendChild( op.text("") );
  }

  let ev = op.div(6);

  let link = op.div(2);

  if ((typeof url !== "undefined") &&
      (url.length > 0)) {
    link.innerHTML = "<a href='" + url + "'>X</a>";
  }

  ev.appendChild( op.h2(band) );
  ev.appendChild( op.h4(venue) );

  r.appendChild(dt);
  r.appendChild(thumb_div);
  r.appendChild(ev);
  r.appendChild(link);

  ele.appendChild(r);
}

function clear_events() {
  let ele = document.getElementById("event_list");
  ele.innerHTML = "";

}

function populate_events() {

  let day_code = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

  let ele = document.getElementById("event_list");
  ele.innerHTML = "";

  let sched = g_nighthubbub_info.sched;
  for (let ii=0; ii < sched.length; ii++) {

    let dt = Date.parse( sched[ii].datetime );
    let ds = new Date(dt);

    let _d = ds.getDate().toString();
    if (_d.length == 1) { _d = "0" + _d; }


    let day_num = _d;
    let day_week = day_code[ ds.getDay() ];
    let thumb = sched[ii].img;
    let band = sched[ii].name;
    let venue = sched[ii].venue;
    let url = sched[ii].url;

    if ((typeof sched[ii].showtime !== "undefined") &&
        (sched[ii].showtime.length > 0)) {
      venue += ", " + sched[ii].showtime;
    }


    add_event( "event_list", day_num, day_week, thumb, band, venue, url );
  }
}

function ready() {

  populate_events();

}

// main entry point
//
function init() {

  get_schedule("data/sched.json");

}
