
var g_data = {
  "state": "init",
  "cur_idx": 0,
  "schedule": [],
  "schedule_id": [],
  "answer" : [],
  "prowo" : {
    "found": false,
    "counter": 0,
    "difficulty": 4,
    "input"  : "",
    "output" : ""
  },
  "survey" : [
    { "question" : "Do you consider yourself a Democrat?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
    { "question" : "Do you consider yourself a Replublican?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
    { "question" : "Do you consider yourself an Independant?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "US", "US politics", "politics" ] },
  ],
  "_survey": [

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
    { "question" : "Do you think the use of all recreational drugs should be decriminalizzed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime", "drugs" ] },
    { "question" : "Do you think a drug dealer should get the same or worse punishment as a murder?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "crime" ] },

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

    { "question" : "Do you consider yourself Christian?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself Catholic?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself Jewish in the religious sense?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself Muslim?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself Buddhist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself agnostic?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself an atheist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself a dualist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },
    { "question" : "Do you consider yourself a believer in a mind/body separation?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

    { "question" : "Do you believe ghosts exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion" ] },

    { "question" : "Do you consider yourself a spiritual person?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },
    { "question" : "Do you believe in an afterlife?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },

    { "question" : "Do you believe in \"Eastern\" medicine is superior to \"Western\" medicine?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },
    { "question" : "Do you believe vaccines are effective in preventing disease?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "religion", "spirituality" ] },

    { "question" : "Do you believe extra-terrestrial aliens exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science" ] },
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
    { "question" : "Do you believe a reduction in technology, or the reliance on technology, is the most likely way to improve people's standard of living?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "science", "technology", "ecology" ] },


    { "question" : "Do you believe money should exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe people should be allowed to own private property?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe people should be allowed to privately own wealth?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you think income should be taxed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you think owned land should be taxed?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe richer people should have the income they earn past a certain threshold ($100k/year, say) at a higher rate then the income below the threshold? That is, do you believe a progressive tax should exist?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },

    { "question" : "Do you believe the general population should have a say in who governs them?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },
    { "question" : "Do you believe governance should be inhereted (for example, like a monarchy)?", "answer_candidate" : [ "yes", "no", "skip" ], "tag" : [ "politics", "economics" ] },

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

function submit() {
  let xdata = { "prowo":{}, "answer":[] };

  xdata.prowo = g_data.prowo;
  for (var ii=0; ii<g_data.schedule.length; ii++) {
    xdata.answer.push( { "id":g_data.schedule_id[ii], "a":g_data.answer[ii] } );
  }

  var xhr = new XMLHttpRequest();
  var url = "sq_data.php";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(xdata));
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

  $("#ui_progress").html( "1 / " + g_data.schedule.length.toString() );
  $("#ui_question").html( g_data.schedule[ g_data.cur_idx ].question );

}

$(document).ready(function() {
  init();
});
