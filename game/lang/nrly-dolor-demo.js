var nearley = require("nearley");
var grammar = require("./nrly-dolor.js");
//var grammar = require("./nrly-en-simp.js");
var readline = require("readline");

function ActionCommand() {
  this.x = "ok";

  return this;
}

ActionCommand.prototype.parse = function(text, tree) {
  var s = tree.s;

  console.log("---");
  console.log("<<<", text);
  console.log(">>>", s);

  if ("AV" in s) {
    var src = "you";
    var v = s["AV"];
    var dst = "you";

    if ("N0" in s) { src = s["N0"]; }
    if ("N1" in s) { dst = s["N1"]; }
    if ("N" in s) { src = s["N"]; }

    console.log("question: (src:", src, ")", "(q:", v, ")", "(dst:", dst, ")");
  }

  else if ("VP" in s) {
    var src = "you";
    var v = s["VP"]["V"];
    var adj = [];
    var dst = ".";
    if ("N" in s) { src = s["N"]; }
    if ("N" in s["VP"]) { dst = s["VP"]["N"]; }
    if ("NP" in s["VP"]) {
      if ("Adj" in s.VP.NP) {
        dst = s.VP.NP.Adj.join(" ");
        dst += " ";
      } else { dst = ""; }
      dst += s.VP.NP.N;
    }

    console.log("command: (src:", src, ")", "(v:", v, ")", "(obj:", dst, ")");
  }

  else if ("V" in s) {
    var src = "you";
    var dst = ".";
    var v = s["V"];

    if ("N" in s) { src = s["N"]; }

    console.log("command: (src:", src, ")", "(v:", v, ")", "(obj:", dst, ")");
  }

  else if ("N" in s) {
    var src = s["N"];

    //console.log("!", src);
    console.log("command: (sel:", src, ")");

    if (/^(skel|skeleton|bones)$/.test(src)) {
      console.log(" select('bones');");
    }
    else if (/^(gob|goblin)$/.test(src)) {
      console.log(" select('goblin');");
    }
    else if (/^(crow|raven)$/.test(src)) {
      console.log("  select('crow');");
    }
  }

  else if ("SNP" in s) {
    console.log("snp:", s);
  }

  console.log(tree);
  //else if ("" in s) { }

}

var wind = new ActionCommand();


function parse_line(line) {
  var err = undefined;
  var res;
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParseStart);
  console.log("\n");
    //parser.feed(line);
  try {
    parser.feed(line);
    res = parser.results;
  } catch(parseError) {
    console.log("\nerror", parseError, parseError.offset);
    err = parseError;
  }


  console.log("err:", err);

  if (typeof(err) === "undefined") {

    //console.log("res:", res);
    for (var i=0; i<res.length; i++) {
      console.log("  [", i, "]", JSON.stringify(res[i].v));
    }

    //console.log("\n", line, "\n---\n", JSON.stringify(res, null, 2), "\n");
    if (res.length>0) {
      console.log("\n>", JSON.stringify(res[0].v, null, 2));
      wind.parse(line, res[0].v);
    }

  }
}

//var rl = readline.createInterface({ output: process.stdout });

/*
process.stdout.write("ok...");
readline.moveCursor(process.stdout,-1,0);
process.stdout.write("!");
process.exit();
*/

//var stdin = process.openStdin();
var stdin = process.stdin;
var stdout = process.stdout;
var cursor_pos_x = 0;
var prompt = "$ ";

//require("tty").setRawMode(true);
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding("utf8");

var line = "";

stdin.on("keypress", function(chunk, key) {
  process.stdout.write("got:", chunk, "\n");
  if (key && key.ctrl && (key.name=='c')) { process.exit(); }
});


stdout.write(prompt);

stdin.on("data", function(key) {
  if (key=='\u0003') {
    console.log("exiting\n");
    process.exit();
  }

  var ord = key.charCodeAt(0);
  //console.log("key:", key, ord);

  if (ord==127) {
    if (cursor_pos_x > prompt.length) {
      cursor_pos_x -= 1;
      readline.moveCursor(stdout,-1,0);
      stdout.write(" ");
      readline.moveCursor(stdout,-1,0);
    }

    if (line.length>0) {
      line = line.slice(0,line.length-1);
    }
    return;
  }

  //console.log("got:", key, line);
  //process.stdout.write(key);

  //if (key=='\n') { console.log(">>>", line, "\n"); line=""; }

  if (ord==13) {

    if (line.length>0) {

      //console.log("\n>>>", line, "\n" + prompt);
      //stdout.write("\n>>> " + line);

      parse_line(line);
    }
    stdout.write("\n");
    stdout.write(prompt);

    line="";
    cursor_pos_x = prompt.length;
    return;
  }
  else { line += key; }

  cursor_pos_x += 1;
  stdout.write(key);

  //console.log("   (", line, ")");
});



