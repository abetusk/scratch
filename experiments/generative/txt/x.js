
var fs = require("fs");

function irnd(n) {
  return Math.floor(Math.random()*n);
}

let _artifact = JSON.parse(fs.readFileSync("artifact.json"));
let _character = JSON.parse(fs.readFileSync("character.json"));
let _event = JSON.parse(fs.readFileSync("event.json"));
let _setting = JSON.parse(fs.readFileSync("setting.json"));

let artifact = _artifact.artifacts;
let character = _character.characters;
let event = _event.events;
let setting = _setting.settings;

let sentence = [];

function sent0() {
  let s = [];

  s.push("The");
  s.push( character[irnd(character.length)].name )
  //s.push("at the");
  s.push("in the");
  s.push( setting[irnd(setting.length)].name )
  s.push("with a");
  s.push( artifact[irnd(artifact.length)].name )
  s.push("for the");
  s.push( event[irnd(event.length)].name )

  return s;
}

function sent1() {
  let s = [];

  s.push("The");
  s.push( character[irnd(character.length)].name )
  s.push("in the");
  s.push( setting[irnd(setting.length)].name )
  s.push("ready with a");
  s.push( artifact[irnd(artifact.length)].name )
  s.push("for");
  s.push( event[irnd(event.length)].name )

  return s;
}

function sent2() {
  let s = [];

  s.push("The");
  s.push( character[irnd(character.length)].name )
  s.push("whose");
  s.push( event[irnd(event.length)].name )
  s.push("was imminent, went into the");
  s.push( setting[irnd(setting.length)].name )
  s.push("with a");
  s.push( artifact[irnd(artifact.length)].name )
  s.push("in hand");

  return s;
}

function sent3() {
  let s = [];

  s.push("The");
  s.push( character[irnd(character.length)].name )
  s.push(", with their");
  s.push( artifact[irnd(artifact.length)].name )
  s.push("ready, went into the");
  s.push( setting[irnd(setting.length)].name )
  s.push("to pursue their");
  s.push( event[irnd(event.length)].name )

  return s;
}

console.log();
console.log( sent0().join(" ") );

console.log();
console.log( sent1().join(" ") );

console.log();
console.log( sent2().join(" ") );

console.log();
console.log( sent3().join(" ") );

console.log();




