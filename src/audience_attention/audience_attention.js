// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// poll a known URL based on how long a user spends on the site
// to capture how much 'attention' someone is giving your site
//
// inspired by bert hubert's "audience-minutes.js" package
// https://github.com/berthubert/audience-minutes
//

var AudienceAttention;

(function() {

  let _AudienceAttention = function() {
    let _now_s = Date.now();

    this.MAX_INTERVAL_MS = 5*60*1000;
    this.debug_level = 2;

    this.source_url = ((typeof window !== "undefined") ? window.location.href : "" );
    this._s_url = this.source_url;
    this._s_url = this._s_url.replace( /https?:\/\//, '' );
    this._s_url = this._s_url.replace( /\//g, '-' );
    this._s_url = this._s_url.replace( /\?.*$/g, '' );
    this._s_url = this._s_url.replace( /\&.*$/g, '' );

    this.poll_type = "power-law";

    this.poll_types = ["linear", "exponential", "power-law", "custom"];
    this.poll_code = {
      "linear" : "l",
      "exponential" : "e",
      "power-law" : "p",
      "custom" : "c"
    };

    this.interval_s = 1;

    this.poll_e_coefficient = 0.25;
    this.poll_e_exponent = 5/1000;

    this.poll_pl_coefficient = 1/60;
    this.poll_pl_exponent = 1.5;

    this.report_prob = 1;
    this.activity = false;
    this.scroll_p = 0;
    this.activity_ds = 0;
    this.init_s = _now_s;
    this.last_s = _now_s;

    this.report_type = {
      "scroll" : true,
      "ms": true,
      "poll_type" : true,
      "report_prob": true,
      "location": true
    };

    return this;
  };


  _AudienceAttention.prototype.reportHook = function() {

    let s = Date.now();
    let ds = s - this.init_s;

    if (this.activity) {
      if (Math.random() >= this.report_prob) { return; }

      this.last_s = s;

      let poll_code = this.poll_code[ this.poll_type ];

      let _rt = this.report_type;

      let url = "/report/audience_attention.json?";
      url += (_rt.scroll ?  ("scroll="+Math.round(this.scroll_p)) : "" );
      url += (_rt.ms ? ("&ms="+ds) : "" );
      url += (_rt.poll_type ? ("&t="+poll_code) : "" );
      url += (_rt.location ? ("&l="+this._s_url) : "" ); 
      url += (_rt.report_prob ? ("&p="+this.report_prob) : "" );

      if (this.debug_level>0) { console.log(url); }

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
            
      // fallbacks for IE and older browsers:
      //
      xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
      xhr.setRequestHeader("Pragma", "no-cache");

      xhr.send();

      this.activity = false;
    }

    let next_interval_ms = this.interval_s * 1000;

    if (this.poll_type === "exponential") {
      let x = this.poll_e_exponent * ds;
      if (x > 30) { next_interval_ms = this.MAX_INTERVAL_MS; }
      else {
        next_interval_ms = this.poll_e_coefficient * Math.exp(x);
      }
    }
    else if (this.poll_type === "power-law") {
      next_interval_ms = this.poll_pl_coefficient * Math.pow( ds, this.poll_pl_exponent );
    }
    else if (this.poll_type === "custom") {
    }

    setTimeout(function() { AudienceAttention.reportHook(); } , next_interval_ms );

  };

  AudienceAttention = new _AudienceAttention();

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function(event) {
      document.addEventListener('scroll', function(e) {
        AudienceAttention.activity = true;

        let scrollHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        AudienceAttention.scroll_p = 100.0*window.pageYOffset/(scrollHeight-window.innerHeight);
      });

      document.addEventListener('mousemove', function(e) { AudienceAttention.activity = true; });

      setTimeout(function() { AudienceAttention.reportHook(); } , AudienceAttention.interval_s * 1000);

    });
  }

  if (typeof module !== "undefined") {
    module.exports = AudienceAttention;
  }

})();

