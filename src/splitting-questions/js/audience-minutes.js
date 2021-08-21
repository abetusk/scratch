/*
 *
  MIT License

  Copyright (c) 2021 bert hubert

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

*/


// this small script is intended to give you some insight in how people spend
// time on your site.
// It does not track users, there are no cookies or any stored data, and it only gives some probabilistic insights


// here you can pick the granularity in time
var intervalSeconds=60;
// and here the reporting probability. The busier your site is the lower you can set this &
// still get sufficient reports
var reportingProbability=0.1;

var hadActivity=false;
var scrollPerc=0;
var activityCount=0;

// this is called every intervalSeconds to see if there was any activity
function reportOrNot()
{
    if(hadActivity) {
        activityCount++;
        if(Math.random() < reportingProbability) {
            let url = '/articles/report.json?scrollPerc='+Math.round(scrollPerc)+"&count="+activityCount;
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url);
            oReq.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
            
            // fallbacks for IE and older browsers:
            oReq.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
            oReq.setRequestHeader("Pragma", "no-cache");

            oReq.send();
        }
        hadActivity=false;
    }
}

document.addEventListener("DOMContentLoaded", function(event) { 
    document.addEventListener('scroll', function(e) {
        hadActivity=true;
        // I found this on Stacj Overflow somewhere..
        let scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        scrollPerc=100.0*window.pageYOffset/(scrollHeight-window.innerHeight);  
    });

    document.addEventListener('mousemove', function(e) {
        hadActivity=true;
    });
    
    setInterval(reportOrNot, intervalSeconds * 1000);
});
