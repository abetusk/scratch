# ok
@{%

var g_verbose_flag = true;

function __flatten(d, x) {

  if (typeof(d) === "undefined") { return; }
  if (typeof(d) !== "object") { x.push(d); return; }

  if ("v" in d) { 
    if (typeof(d.v) !== "object") { x.push(d.v); return; }
    for (var i=0; i<d.v.length; i++) {
      __flatten(d.v[i], x);
    }
  }
  else {
    for (var i=0; i<d.length; i++) {
      __flatten(d[i], x)
    }
  }
}

function _flatten(d) {
  var x = [];
  __flatten(d, x);
  return x;
}

function _l() {
  if (!g_verbose_flag) { return; }
  var args = Array.prototype.splice.call(arguments, 0);
  console.log.apply(null, args);
}

%}

main -> _ Sentence _ End {% function(d) { _l("main:", d[1].v); var r = {type:'main', d:d, v: { "s": d[1].v, "e": d[3].v } }; return r; } %}

Sentence -> NounPhrase _ VerbPhrase _ Polite:?                {% function(d) { var r={type:'S',d:d,v:{}}; r.v[d[0].type]=d[0].v; r.v[d[2].type]=d[2].v; _l("s0:",r.v); return r; } %}
#  | Filler:* _ NounPhrase _ Filler:* _ VerbPhrase _ Filler:* _ Polite:? {% function(d) { var r = {type:'S', d:d, v:{}}; r.v[d[2].type] = d[2].v; r.v[d[6].type] = d[6].v; return r; } %}
#  | NounPhrase _ VerbPhrase {% function(d) { var r = {type:'S', d:d, v:{}}; r.v[d[0].type] = d[0].v; r.v[d[2].type] = d[2].v; _l("s.np-vp:",r.v); return r; } %}
  | NounPhrase _ VerbPhrase _ Polite:? {% function(d) { var r = {type:'S', d:d, v:{}}; r.v[d[0].type] = d[0].v; r.v[d[2].type] = d[2].v; _l("s1:",r.v); return r; } %}
  | Filler                                                    {% function(d) { _l("s2:", d[0].v); return {type:"F", d:d, v: { "F": d[0].v }};  } %}
#  | Filler:* _ NounPhrase  _ Filler:* _ FillerVerb:* _ Filler:* _ Polite:?  {%
#  | Filler:* _ NounPhrase  _ FillerVerb:* {%
  | NounPhrase {%
function(d) {
  var r = {type:"SNP", d:d, v: {}};
  r.v[d[0].type] = d[0].v;
  _l("snp3:", r.v);
  return r;
}
%}
  | NounPhrase  _ FillerVerb:* {%
function(d) {
  var r = {type:"SNP", d:d, v: {}};
  r.v[d[0].type] = d[0].v;
  _l("s3:", r.v);
  return r;
}

%}

#  | Filler:* _ NounPhrase _ Filler:* _ Polite:?               {%
#function(d) {
#  var r = {type:"SNP", d:d, v: {}};
#  r.v[d[2].type] = d[2].v;
# return r;
#}
#%}

  | VerbPhrase _ Polite:?               {% function(d) { var r = {type:'VP', d:d, v:{}}; r.v[d[0].type] = d[2].v; _l("s4:",r.v); return r; } %}
  | QuestionVerbPhrase _ Polite:?       {% function(d) { var r = {type:"QVP", d:d, v:{}}; r.v[d[0].type] = d[2].v; _l("s5:",r.v); return r; } %}
#  | Filler:* _ NounPhrase _ Filler:* _ QuestionVerbPhrase _ Filler:* _ Polite:?
  | NounPhrase _ QuestionVerbPhrase _ Polite:?
{%
function (d) {
  var r = {type:"QVP", d:d, v:{}};
  r.v[d[0].type] = d[2].v;
  r.v[d[2].type] = d[6].v;
  _l("s6:", r.v);
  return r;
}
%}
#  | Filler:* _ QuestionVerbPhrase _ Filler:* _ NounPhrase _ Filler:* _ Polite:?
  | QuestionVerbPhrase _ NounPhrase _ Polite:?
{%
function (d) {
  var r = {type:"QVP", d:d, v:{}};
  r.v[d[0].type] = d[2].v;
  r.v[d[2].type] = d[6].v;
  _l("s7:", r.v);
  return r;
}
%}
#  | Filler:* _ NounPhrase _ Filler:* _ QuestionVerbPhrase _ Filler:* _ NounPhrase _ Filler:* _ QuestionVerbFiller:* _ Polite:?
  | NounPhrase _ QuestionVerbPhrase _ NounPhrase _ QuestionVerbFiller:* _ Polite:?
{%
function(d) {
  var r = {type:'S', d:d, v:{}};
  r.v[d[0].type + "0"] = d[2].v;
  r.v[d[2].type] = d[6].v;
  r.v[d[4].type + "1"] = d[10].v;
  _l("s8:", r.v);
  return r;
}
%}

Filler -> ("thanks"|"good"|"ok"|"meh"|"blah"|"wtf") _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0]}} %}
  | ("there"|"blech"|"blorg"|"k"|"thx"|"kthx"|"kthnx") _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0]}} %}
  | ("over"|"right") _ "there" _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0] + " " + d[2][0]}} %}
  | (","|"xxx"|"xxo"|"xox"|"oxo") _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | ("hey"|"yo"|"wassup"|"hi"|"yow"|"yeah"|"ya") _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | ("bb"|"bye") _ "?":* {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | Filler _ Filler {% function(d) { return {type:"F", d:d, v:d[0].v + " " + d[2].v }} %}

NounPhrase -> Noun    {% function(d) { return {type:'N', d:d, v: d[0].v }} %}
  | Article:? _ Noun    {% function(d) {return {type:'N', d:d, v: d[2].v }} %}
  | Article:? _ Adjective:* _ Noun
{% function(d) {
  adj = _flatten(d[2]);
  if (adj.length>0) { return {type:'N', d:d, v: { "Adj": adj, "N": d[4].v } }; }
  return {type:'N', d:d, v: d[4].v };
}
%}
  | NounPhrase _ Filler    {% function(d) { _l("np-f:", d[0].v, d[2].v); return {type:'NP', d:d, v: d[0].v }} %}
  | Filler _ NounPhrase    {% function(d) { _l("f-np:", d[0].v, d[2].v); return {type:'NP', d:d, v: d[2].v }} %}
  | Filler _ NounPhrase _ Filler    {% function(d) { _l("f-np-f:", d[0].v, d[2].v); return {type:'NP', d:d, v: d[2].v }} %}

Article -> ("a"|"an"|"the"|"le"|"they"|"thay"|"that") {% function(d) { return {"type":"PN", d:d, v:d[0][0] }} %}

Adjective ->
  ("green"|"brown"|"black"|"yellow"|"purple"|"violet"|"rose"|"red"|"pink"|"blue"|"orange"|"tiel"|"grey"|"gray") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("big"|"tall"|"small"|"short"|"skinny"|"thin"|"round"|"fat"|"square"|"long") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("delicious"|"lovely"|"nice"|"cool"|"smelly") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("clean"|"wet"|"slimy"|"rich"|"poor"|"hungry"|"thirsty") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("old"|"young"|"new"|"antique") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("spotted"|"checkered"|"scaled"|"zigzag"|"flowery"|"fuzzy") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("gold"|"wooden"|"plastic"|"synthetic"|"leaved"|"patterned") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("gardening"|"shopping"|"riding"|"worn") {% function(d) { return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("large"|"small"|"long"|"short"|"thick"|"narrow"|"deep"|"flat") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("whole"|"low"|"high"|"near"|"far"|"gone") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("fast"|"quick"|"slow"|"early"|"late") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("bright"|"dark"|"cloudy"|"hot"|"warm"|"cool"|"cold"|"windy"|"noisy"|"loud"|"quiet"|"dry"|"wet"|"clear") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("hard"|"soft"|"heavy"|"light"|"strong"|"weak"|"clean"|"tidy"|"clean"|"dirty"|"empty"|"full"|"close") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("living"|"thirsty"|"hungry"|"fat"|"old"|"fresh"|"dead"|"healthy") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("tastey"|"sweet"|"sour"|"bitter"|"salty") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("valued"|"good"|"bad"|"great"|"important"|"useful"|"expensive"|"cheap"|"free"|"difficult"|"strong"|"weak"|"able"|"free"|"rich") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("afraid"|"brave"|"fine"|"sad"|"proud"|"comfortable"|"happy"|"liked"|"clever"|"interesting"|"famous"|"exciting"|"funny") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("kind"|"polite"|"fair"|"share"|"busy"|"free"|"lazy"|"lucky"|"well"|"safe"|"careful"|"safe"|"dangerous") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("damn"|"fucking"|"freakin"|"freaking"|"fudging") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("front"|"back"|"side"|"top"|"bottom") {% function(d) { return {type:"Adj", d:d, v:d[0][0] }; } %}
  | Adjective _ Adjective {% function(d) { return {type:"Adj", d:d, v: [ d[0].v, d[2].v ] }; } %}

Noun -> "cat"   {% function(d) {return {type:'N', d:d, v:"cat"}} %}
  | "dog"       {% function(d) {return {type:'N', d:d, v:"dog"}} %}
  | "rabbit"    {% function(d) {return {type:'N', d:d, v:"rabbit"}} %}
  | "bunny"     {% function(d) {return {type:'N', d:d, v:"bunny"}} %}
  | "you"       {% function(d) {return {type:'N', d:d, v:"you"}} %}
  | Direction   {% function(d) {return {type:"ND", d:d, v:d[0].v};} %}
  | ("goblin"|"gob"|"skel"|"bones"|"boney"|"skeleton"|"crow"|"raven"|"bird") {% function(d) { return {type:"Na", d:d, v:d[0][0]};} %}
  | ("cat"|"dog"|"rabbit"|"kitty"|"kitteh"|"kitten"|"doggy"|"bunny") {% function(d) { return {type:"Na", d:d, v:d[0][0] };} %}
  | ("me"|"I"|"you"|"it") {% function(d) { return {type:"Nm", d:d, v:d[0][0] }} %}
  | ("door"|"tree"|"statue"|"key"|"chest") {% function(d) { return {type:"Ni", d:d, v:d[0][0]}} %}

Direction ->
  ("up"|"down"|"left"|"right") {% function(d) { return {type:"N", d:d, v:d[0][0]}; } %}
  | Direction _ Unit {% function(d) { return {type:"ND", d:d, v:{ "D":d[0].v, "Unit":d[2].v} }; } %}

Unit ->
  ("x")

QuestionVerbPhrase ->
  ("where"|"what"|"why") _ ("'s"|"is"):? _ ("up"):? {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}
  | ("what") _ ("'s"|"is"):? _ ("up") _ ("with"):? {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}
  | ("do"):? _ ("you") _ ("know") _ ("where") {% function(d) { var r={type:"AV", d:d, v:d[6][0]}; return r; } %}
  | ("how") _ ("'s"|"is"):? _ ("it"):? _ ("goin"|"going"|"goes"):?  {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}
  | QuestionVerbPhrase _ Filler {% function(d) { return {type:"AV", d:d, v:d[0].v}; } %}
  | Filler _ QuestionVerbPhrase {% function(d) { return {type:"AV", d:d, v:d[2].v}; } %}
  | Filler _ QuestionVerbPhrase _ Filler {% function(d) { return {type:"AV", d:d, v:d[2].v}; } %}

QuestionVerbFiller ->
  ("is") {% function(d) { return {type:"VF", d:d, v:d[0][0]}; } %}
  | FillerVerb {% function(d) { return {type:"VF", d:d, v:d[0].v};} %}

VerbPhrase -> Verb {% function(d) { return { type:"V", d:d, v: d[0].v }} %}
  | Verb _ NounPhrase {% function(d) { var r={type:"VP",d:d,v: { "V": d[0].v}}; r.v[d[2].type]=d[2].v; return r;} %}
  | Verb _ Filler {% function(d) { return { type:"V", d:d, v: d[0].v }} %}
  | Filler _ Verb {% function(d) { return { type:"V", d:d, v: d[2].v }} %}
  | Filler _ Verb _ Filler {% function(d) { return { type:"V", d:d, v: d[2].v }} %}

Polite ->
  ("please") {% function(d) { return { type:"polite", d:d, v: d[0][0] }; } %}

FillerVerb ->
  Polite:? _ ("would") _ ("you") _ ("mind") _  Polite:? {% function(d) { return { type:"FV", d:d, v:d[2][0] + " " + d[4][0] }; } %}
  | Polite:? _ ("would"|"can"|"could") _ ("you"):? _ ("mind"):? _ Polite:? {% function(d) { return { type:"FV", d:d, v:d[2][0] }; } %}
  | Polite:? _ ("how") _ ("about"|"bout") _ ("you"):? _ Polite:? {% function(d) { return { type:"FV", d:d, v:d[2][0] + " " + d[4][0] }; } %}
  | Polite:? _ ("you"):? _ ("mind")  _ Polite:? {% function(d) { return { type:"FV", d:d, v:d[4][0] }; } %}
  | Filler _ FillerVerb {% function(d) { return { type:"FV", d:d, v:d[2].v }; } %}
  | FillerVerb _ Filler {% function(d) { return { type:"FV", d:d, v:d[0].v }; } %}

Verb -> ("go"|"going"):? _ "run" _ "to":?  {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going") _ "next":? _ "to":?  {% function(d) { return { type:"V", d:d, v: d[0][0] }} %}
  | ("go"|"going"):? _ ("walk"|"walking") _ "to":?  {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("pick"|"picking") _ "up" {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("open"|"opening") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("close"|"closing") {% function(d) { return { "type":"V", "d":d, "v": d[2][0] }; } %}
  | ("go"|"going"):? _ ("shut"|"shutting") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("get"|"getting"|"place"|"grab"|"grabbing") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
#  | ("go"|"going") _ ("shut"|"to") {% function(d) { return { type:"V", d:d, v: d[2] }} %}
#  | FillerVerb _ Verb  {% function(d) { return { type:"V", d:d, v: d[2].v }} %}
#  | Polite _ Filler:? _ Verb  {% function(d) { return { type:"V", d:d, v: d[4].v }} %}

_ -> [\s]:* {% function(d) { return null; } %}

End -> (".") {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | ("?") {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | ("!") {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | null {% function(d) { return { type:"end", d:d, v:"" }} %}

