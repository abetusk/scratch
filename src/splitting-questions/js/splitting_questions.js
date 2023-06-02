// License: CC0

var g_data = {
  "state": "init",
  "cur_idx": 0,
  "schedule": [],
  "schedule_id": [],
  "answer" : [],
  "prowo" : {
    "found": false,
    "counter": 0,
    "difficulty": 5,
    "input"  : "",
    "output" : ""
  },

  // questions should be designed to get information on what differences
  // in philosophy that cause friction
  //

  // free speech
  // state sponsored religion
  // copyright
  // cultural appropriation
  //

  "survey" : [

    { "question" : "Do you think speech or expression which causes psychological harm in others should be criminilized?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you think speech or expression that encourages violence should be criminilized?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you think whistleblowers that publish classified documents exposing illegality should be jailed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },

    { "question" : "Do you think it should be illegal for citizens to sell digital reproductions of 200 year or older art that their government has taken by violence or stolen?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you think it should be illegal to copy an artists style, without permission, if it's less than 50 years old?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you think, in general, it should be legal to be able to copy and resell any art 50 years after its creation?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },



    { "question" : "Do you think sex work should be decriminalized?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },

    { "question" : "Do you think transsexual people should be referred to by their preferred pronouns (he/she/they/etc.)?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you think transsexual women (people who were born biologically male but then have transitioned to become women) should be, for the most part, excluded from women only spaces?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you believe 'trigger warnings' are largely unnecessary?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },

    { "question" : "Do you believe people should not give birth to any new children?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },
    { "question" : "Do you believe we should reduce our population?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society", "politics" ] },

    { "question" : "Do you consider yourself a Republican?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
    { "question" : "Do you consider yourself an Independent, in the political sense?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },

    { "question" : "Do you believe it's more difficult to be of African descent in the US than it is to be white?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
    { "question" : "Do you believe it's more difficult to be of Asian descent in the US than it is to be white?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
    { "question" : "Do you believe it's more difficult to be a woman in the US than it is to be a man?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },

    { "question" : "Do you believe it's more difficult to be a homosexual in the US than it is to be heterosexual?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },

    { "question" : "Do you consider yourself a Communist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics" ] },
    { "question" : "Do you consider yourself a Capitalist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics" ] },
    { "question" : "Do you consider yourself a Socialist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [  "politics" ] },
    { "question" : "Do you consider yourself a Libertarian?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [  "politics" ] },

    { "question" : "Do you consider yourself politically left of center?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [  "politics" ] },
    { "question" : "Do you consider yourself politically right of center?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [  "politics" ] },

    { "question" : "Do you think the death penalty should exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime" ] },
    { "question" : "Do you think Cannabis (Marijuana/Weed) should be legal for medicinal use?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime", "drugs" ] },
    { "question" : "Do you think Cannabis (Marijuana/Weed) should be legal for recreational use?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime", "drugs" ] },
    { "question" : "Do you think the use of all recreational drugs should be decriminalized?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime", "drugs" ] },
//    { "question" : "Do you think a drug dealer should get the same or worse punishment as a murder?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime" ] },
    { "question" : "Do you think punishment for drug dealing should be worse than that of murder?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime" ] },

    { "question" : "Do you consider yourself against legalized abortion?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [  "politics", "abortion" ] },
    { "question" : "Do you consider yourself for legalized abortion?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "abortion" ] },

    { "question" : "Do you think healthcare should be a fundamental human right?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "healthcare" ] },
    { "question" : "Do you think education should be a fundamental human right?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "education" ] },
    { "question" : "Do you think higher education (college level) should be a fundamental human right?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "education" ] },

    { "question" : "Do you think the invention of agriculture improved the average person's quality of life?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society"  ] },
    { "question" : "Do you think the industrial revolution improved the average person's quality of life?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society"  ] },
    { "question" : "Do you think current technology is improving the average person's quality of life?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society"  ] },

    { "question" : "Do you think the world is getting more dangerous for the average person?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "society"  ] },

    { "question" : "Do you believe in God?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you believe in the Devil?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you believe in a soul?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

//    { "question" : "Do you consider yourself Christian?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
//    { "question" : "Do you consider yourself Catholic?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
//    { "question" : "Do you consider yourself Jewish in the religious sense?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
//    { "question" : "Do you consider yourself Muslim?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
//    { "question" : "Do you consider yourself Buddhist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

    { "question" : "Do you consider yourself agnostic?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself an atheist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself a dualist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself a believer in a mind/body separation?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

    { "question" : "Do you believe ghosts exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

    { "question" : "Do you consider yourself a spiritual person?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },
    { "question" : "Do you believe in an afterlife?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },

    { "question" : "Do you believe in \"Alternative\" (\"Holistic\", \"Complementary\", etc.) medicine is superior to scientifically based medicine?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },
    { "question" : "Do you believe vaccines are effective in preventing disease?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },

    { "question" : "Do you believe life that did not originate on Earth exists elsewhere in the universe?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },
    { "question" : "Do you believe extra-terrestrial aliens have visited earth?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },

    { "question" : "Do you believe evolution describes a real world process?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },
    { "question" : "Do you believe humans evolved from apes?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },

    { "question" : "Do you believe the earth is more than 10,000 years old?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },
    { "question" : "Do you believe the earth is flat?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },

    { "question" : "Are you passionate about science?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },

    { "question" : "Are you passionate about art?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "art" ] },

    { "question" : "Do you believe machines have the potential to be smarter than humans?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "environment" ] },
    { "question" : "Do you believe machines will become smarter than humans in the next 500 years?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "environment" ] },
    { "question" : "Do you believe machines will become smarter than humans in the next 20 years?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "environment" ] },

    { "question" : "Do you think the environment would be better off without humans?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "environment" ] },

    { "question" : "Do you believe the earth's temperature is rising due to human activity?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science", "technology", "ecology" ] },
    { "question" : "Do you believe technology is the most likely way to improve people's standard of living?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science", "technology", "ecology" ] },
    { "question" : "Do you believe a reduction in technology, or a reduction in the reliance on technology, is the most likely way to improve people's standard of living?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science", "technology", "ecology" ] },


    { "question" : "Do you believe money should exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe people should be allowed to own private property?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe people should be allowed to privately own wealth?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you think income should be taxed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you think owned land should be taxed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe richer people should have the income they earn past a certain threshold ($100k/year, say) taxed at a higher rate then the income below the threshold? That is, do you believe a progressive tax should exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },

    { "question" : "Do you believe the general population should have a say in who governs them?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe governance positions should be inherited (for example, like a monarchy)?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },

    { "question" : "Do you eat meat regularly (chicken, turkey, beef, etc.)?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "diet" ] },
    { "question" : "Do you think technological progress will help solve the problems in the world?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "technology" ] }


  ]
};


function rstr(n) {
  n = (n ?? 32);
  let _d = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let _m = [];
  for (let ii=0; ii<n; ii++) {
    _m.push( _d[ Math.floor( Math.random()*_d.length ) ] );
  }
  return _m.join("");
}


async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function prowo_finish() {
  console.log("FOUND", g_data.prowo.counter, g_data.prowo.input, g_data.prowo.output);
}

function prowo(digest) {

  let idx = 0;
  for (idx=0; idx<g_data.prowo.difficulty; idx++) {
    if (digest[idx] != '0') { break; }
  }
  if (idx==g_data.prowo.difficulty) {
    g_data.prowo.found = true;
    g_data.prowo.output = digest;
    prowo_finish();
    return;
  }

  g_data.prowo.input = digest;
  g_data.prowo.counter++;

  digestMessage(g_data.prowo.input).then(prowo);

}

//--------

// https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
// CC-BY-SA user Kim Nyholm (https://stackoverflow.com/users/8450075/kim-nyholm)
//
/*
function _download_data(blob, filename) {

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0)
  }

}
*/

//--------

function ci_lower_bound(pos, n, conf) {
  if (n==0) { return 0; }

  let z = jStat.normal.inv(1.0 - (1.0 - conf)/2.0, 0, 1);
  let phat = 1.0*pos/n;
  let r = (phat + ((z*z)/(2.0*n)) - (z*Math.sqrt((phat*(1-phat) + ((z*z)/(4.0*n)))/n))) / (1.0 + (z*z/n));
  return r;
}

function _freq_load(dat) {
  console.log("freq:", dat);

  dat["lookup"] = {};
  for (var ii=0; ii<dat.survey.length; ii++) {
    if (typeof dat.survey[ii].sha256sum === "undefined") {
      console.log("WHOA:", ii, dat.survey[ii]);
    }
    dat.lookup[dat.survey[ii].sha256sum] = dat.survey[ii].question;
  }

  let ele = document.getElementById("ui_survey_result_table");
  ele.innerHTML = "";

  let table = document.createElement("table");
  table.classList.add("u-full-width");

  let thead = document.createElement("thead");
  let tr = document.createElement("tr");
  let th0 = document.createElement("th");
  let th1 = document.createElement("th");
  let th2 = document.createElement("th");
  let th3 = document.createElement("th");

  th0.innerHTML = "Question";
  th1.innerHTML = "yes";
  th2.innerHTML = "no";
  th3.innerHTML = "skip";

  tr.appendChild(th0);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);

  thead.appendChild(tr);

  table.appendChild(thead);

  table.appendChild(thead);
  let tbody = document.createElement("tbody");

  var _a = [];
  for (var digest in dat.freq) {
    let _yes = dat.freq[digest].yes;
    let _no = dat.freq[digest].no;
    let _y_score = ci_lower_bound(_yes, _yes + _no, 0.95);
    let _n_score = ci_lower_bound(_no, _yes + _no, 0.95);
    let _e = {
      "digest" : digest,
      "question" : dat.lookup[digest],
      "yes" : _yes,
      "no": _no,
      "skip": dat.freq[digest].skip,
      "yscore" : _y_score,
      "nscore" : _n_score,
      "mscore": ((_y_score  > _n_score) ? _y_score : _n_score)

    };
    _a.push(_e);
  }

  _a.sort( function(x,y) { return y.mscore - x.mscore ; } );

  var _count = 0;
  for (let ii=0; ii<_a.length; ii++) {
    if (typeof _a[ii].question === "undefined") {
      continue;
      console.log("wtf:", ii, _a[ii]);
    }
    _count++;

    tr = document.createElement("tr");

    let td0 = document.createElement("td");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");

    /*
    let s0 = document.createElement("div");
    let s1 = document.createElement("div");
    let s2 = document.createElement("div");
    let s3 = document.createElement("div");

    s0.innerHTML = _a[ii].question;
    s1.innerHTML = _a[ii].yes.toString();
    s2.innerHTML = _a[ii].no.toString();
    s3.innerHTML = _a[ii].skip.toString();

    s1.id = "ui_survey_review_yes_" + _a[ii].digest;
    s2.id = "ui_survey_review_no_" + _a[ii].digest;
    s3.id = "ui_survey_review_skip_" + _a[ii].digest;

    td0.appendChild(s0);
    td1.appendChild(s1);
    td2.appendChild(s2);
    td3.appendChild(s3);
    */

    td0.innerHTML = _count.toString() + ": " + _a[ii].question;
    td1.innerHTML = _a[ii].yes.toString();
    td2.innerHTML = _a[ii].no.toString();
    td3.innerHTML = _a[ii].skip.toString();

    td1.id = "ui_survey_review_yes_" + _a[ii].digest;
    td2.id = "ui_survey_review_no_" + _a[ii].digest;
    td3.id = "ui_survey_review_skip_" + _a[ii].digest;

    tr.appendChild(td0);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    tbody.appendChild(tr);

  }

  table.appendChild(tbody);
  ele.appendChild(table);

}

function _fetch_freq() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "data/splitting_questions_freq.json", true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if (xhr.status === 200) {
      _freq_load(xhr.response);
    }
    else {
      console.log("error fetching frequency json data");
    }
  };
  xhr.send();
}

function _show_freq() {
  $("#ui_question_section").fadeOut();
  $("#ui_survey_review").fadeOut();

  setTimeout(function() {
    $("#ui_survey_result").fadeIn();
  }, 1000);

  // html needs to be updated
  //
  setTimeout(function() {
    for (let ii=0; ii<g_data.answer.length; ii++) {
      let digest = g_data.schedule_id[ii];

      //console.log(">>>", digest, g_data.answer[ii]);

      if (g_data.answer[ii] == "yes") {
        $("#ui_survey_review_yes_" + digest).css("background-color", "#eee");
        $("#ui_survey_review_yes_" + digest).css("border-radius", "30px");
      }
      else if (g_data.answer[ii] == "no") {
        $("#ui_survey_review_no_" + digest).css("background-color", "#eee");
        $("#ui_survey_review_no_" + digest).css("border-radius", "30px");
      }
      else if (g_data.answer[ii] == "skip") {
        $("#ui_survey_review_skip_" + digest).css("background-color", "#eee");
        $("#ui_survey_review_skip_" + digest).css("border-radius", "30px");
      }
    }
  }, 0);



}

//--------

function _submit_success(e) {
  var res = e.target.response;
  console.log("submit success", res);
}

function _submit_error(e) {
  console.log("submit error", e);
}

function _submit() {
  let xdata = { "prowo":{}, "answer":[] };

  xdata.prowo = g_data.prowo;
  for (var ii=0; ii<g_data.schedule.length; ii++) {
    xdata.answer.push( { "id":g_data.schedule_id[ii], "a":g_data.answer[ii] } );
  }

  var xhr = new XMLHttpRequest();
  var url = "sq_data.py";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(xdata));

  xhr.addEventListener("load", _submit_success);
  xhr.addEventListener("error", _submit_error);
}

function _wait_submit() {
  if (g_data.prowo.found) {
    _submit();
    return;
  }

  console.log("waiting");

  setTimeout(_wait_submit, 1000);
}

//--------

function _finish() {
  $("#ui_question_section").fadeOut();

  let ele = document.getElementById("ui_survey_review_table");
  ele.innerHTML = "";

  let table = document.createElement("table");
  table.classList.add("u-full-width");

  let thead = document.createElement("thead");
  let tr = document.createElement("tr");
  let th0 = document.createElement("th");
  let th1 = document.createElement("th");
  let th2 = document.createElement("th");
  let th3 = document.createElement("th");

  th1.innerHTML = "Question";
  th2.innerHTML = "Response";

  tr.appendChild(th0);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);

  thead.appendChild(tr);

  table.appendChild(thead);

  table.appendChild(thead);
  let tbody = document.createElement("tbody");


  for (let ii=0; ii < g_data.schedule.length; ii++) {
    tr = document.createElement("tr");

    let td0 = document.createElement("td");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");

    td1.innerHTML = g_data.schedule[ii].question;
    td2.innerHTML = g_data.answer[ii];

    tr.appendChild(td0);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    tbody.appendChild(tr);

  }

  table.appendChild(tbody);
  ele.appendChild(table);

  if (g_data.prowo.found)  {
    $("#ui_result_nonce").html( g_data.prowo.input );
    $("#ui_result_proof").html( g_data.prowo.output );
  }

  setTimeout(function() {
    $("#ui_survey_review").fadeIn();
  }, 500);
}

function _next_question() {

  g_data.state = "transition";

  setTimeout( function() {
    $("#ui_question").fadeOut(400);
    $("#ui_button_yes").fadeOut(400);
    $("#ui_button_no").fadeOut(400);
    $("#ui_button_skip").fadeOut(400);
  }, 50);

  setTimeout(function() {
    $("#ui_button_yes").css("color",  "#333");
    $("#ui_button_yes").css("background-color",  "transparent");

    $("#ui_button_no").css("color",  "#333");
    $("#ui_button_no").css("background-color",  "transparent");

    $("#ui_button_skip").css("color",  "#333");
    $("#ui_button_skip").css("background-color",  "transparent");

    g_data.cur_idx++;
    if (g_data.cur_idx == (g_data.schedule.length)) {
      g_data.state = "finish";
      _finish();
      return;
    }

    $("#ui_question").html( g_data.schedule[ g_data.cur_idx ].question );

    $("#ui_question").fadeIn();
    $("#ui_button_yes").fadeIn();
    $("#ui_button_no").fadeIn();
    $("#ui_button_skip").fadeIn();

    g_data.state = "ready";

    
    $("#ui_progress").html( (g_data.cur_idx+1).toString() + " / " + g_data.schedule.length.toString() );

  }, 500);


}

function _hit_yes() {
  var btn = document.getElementById("ui_button_yes");
  //btn.style.color = '#333';
  //btn.style.color = '#777';
  btn.style.backgroundColor = "transparent";
  btn.style.backgroundColor = "#777";
  btn.style.color = '#fff';

  g_data.answer[ g_data.cur_idx ] = "yes";

  _next_question();
}

function _hit_no() {
  var btn = document.getElementById("ui_button_no");
  //btn.style.color = '#333';
  //btn.style.color = '#777';
  btn.style.backgroundColor = "transparent";
  btn.style.backgroundColor = "#777";
  btn.style.color = '#fff';

  g_data.answer[ g_data.cur_idx ] = "no";
  _next_question();
}

function _hit_skip() {
  var btn = document.getElementById("ui_button_skip");
  //btn.style.color = '#333';
  //btn.style.color = '#777';
  btn.style.backgroundColor = "transparent";
  btn.style.backgroundColor = "#777";
  btn.style.color = '#fff';

  g_data.answer[ g_data.cur_idx ] = "skip";
  _next_question();
}

function _hit_back() {
  var btn = document.getElementById("ui_button_back");
  //btn.style.color = '#333';
  //btn.style.color = '#777';
  btn.style.backgroundColor = "transparent";
  btn.style.backgroundColor = "#777";
  btn.style.color = '#fff';


  if (g_data.cur_idx==0) {

    setTimeout( function() {
      $("#ui_button_back").css("color",  "#333");
      $("#ui_button_back").css("background-color",  "transparent");
    }, 500);

    return;
  }

  g_data.state = "transition";

  setTimeout( function() {
    $("#ui_question").fadeOut(400);
    $("#ui_button_yes").fadeOut(400);
    $("#ui_button_no").fadeOut(400);
    $("#ui_button_skip").fadeOut(400);
  }, 50);

  setTimeout(function() {
    $("#ui_button_yes").css("color",  "#333");
    $("#ui_button_yes").css("background-color",  "transparent");

    $("#ui_button_no").css("color",  "#333");
    $("#ui_button_no").css("background-color",  "transparent");

    $("#ui_button_skip").css("color",  "#333");
    $("#ui_button_skip").css("background-color",  "transparent");

    $("#ui_button_back").css("color",  "#333");
    $("#ui_button_back").css("background-color",  "transparent");

    g_data.cur_idx--;
    $("#ui_question").html( g_data.schedule[ g_data.cur_idx ].question );

    $("#ui_question").fadeIn();
    $("#ui_button_yes").fadeIn();
    $("#ui_button_no").fadeIn();
    $("#ui_button_skip").fadeIn();

    g_data.state = "ready";

    $("#ui_progress").html( (g_data.cur_idx+1).toString() + " / " + g_data.schedule.length.toString() );

  }, 500);

}


function init() {

  prowo(rstr());
  _fetch_freq();

  g_data.cur_idx = 0;
  g_data.schedule = [];
  for (let ii=0; ii<g_data.survey.length; ii++) {
    g_data.schedule.push( g_data.survey[ii] );
    g_data.answer.push("");
    g_data.schedule_id.push("");
  }

  for (let ii=0; ii<g_data.schedule.length; ii++) {
    let idx = ii + Math.floor((g_data.schedule.length-ii)*Math.random());
    if (ii==idx) { continue; }
    let t = g_data.schedule[ii];
    g_data.schedule[ii] = g_data.schedule[idx];
    g_data.schedule[idx] = t;
  }

  // populate ids of question
  //
  for (let ii=0; ii<g_data.schedule.length; ii++) {
    digestMessage(g_data.schedule[ii].question)
      .then((function(x) {
        return function(_digest) {
          g_data.schedule_id[x] = _digest;
        }
      })(ii));
  }


  g_data.state = "ready";

  $("#ui_button_yes").click( function(e) {
    _hit_yes();
  });

  $("#ui_button_no").click( function(e) {
    _hit_no();
  });

  $("#ui_button_skip").click( function(e) {
    _hit_skip();
  });

  $("#ui_button_back").click( function(e) {
    _hit_back();
  });

  $("#ui_button_back1").click( function(e) {
    $("#ui_survey_review").fadeOut();
    setTimeout(function() {
      $("#ui_question_section").fadeIn();
      _hit_back();
    }, 500);
  });

  $("#ui_button_submit_early").click( function(e) {
    _finish();
    //_submit();
  });

  $("#ui_button_submit").click( function(e) {
    _wait_submit();
    _show_freq();
  });
  $("#ui_button_submit1").click( function(e) {
    _wait_submit();
    _show_freq();
  });

  $("#ui_button_exit").click( function(e) {
    _show_freq();
  });

  //$("#ui_button_download").click( function(e) { _download_data(); });



  $("#ui_progress").html( "1 / " + g_data.schedule.length.toString() );
  $("#ui_question").html( g_data.schedule[ g_data.cur_idx ].question );

}

if (typeof module !== "undefined") {
  console.log(JSON.stringify( { "survey": g_data.survey }, undefined, 2));
}
else {
  $(document).ready(function() { init(); });
}


