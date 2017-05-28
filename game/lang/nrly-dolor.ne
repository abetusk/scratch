# ok

@{%

	var g_verbose_flag = true;

	function __flatten(d, x) {
		if (typeof(d) === "undefined") { return; }
		if (typeof(d) !== "object") { x.push(d); return; }
		if ("v" in d) {
			if (typeof(d.v) !== "object") { x.push(d.v); return; }
			for (var j=0; j<d.v.length; j++) { __flatten(d.v[j], x); }
		}
		else { for (var k=0; k<d.length; k++) { __flatten(d[k], x) } }
	}

	function _flatten(d) { var x = []; __flatten(d, x); return x; }

  // log?
	function _l() {
		if (!g_verbose_flag) { return; }
		var args = Array.prototype.splice.call(arguments, 0);
		console.log.apply(null, args);
	}

%}

main -> Sentence _ End                        {% function(d) { _l("m:", d[0].v, d[2].v); return {type:'main', d:d, v: { "s": d[0].v, "e": d[2].v, "t":d[0].type }}} %}

Sentence -> NounPhrase
{%
  function(d) {
    _l("s.np:", d[0].v);
    var r={type:'S',d:d,v:{}};
    r.v[d[0].type]=d[0].v;
    return r;
  }
%}

  | NounPhrase _ VerbPhrase
{%
  function(d) {
    _l("s.np-vp:", d[0].v, d[2].v);
    var r={type:'S',d:d,v:{}};
    r.v[d[0].type]=d[0].v;
    r.v[d[2].type]=d[2].v;
    return r;
  }
%}

  | NounPhrase _ QuestionVerbPhrase
{%
  function(d) {
    _l("s.np-qvp:", d[0].v, d[2].v);
    var r={type:'S',d:d,v:{}};
    r.v[d[0].type]=d[0].v;
    r.v[d[2].type]=d[2].v;
    return r;
  }
%}

  | QuestionVerbPhrase _ NounPhrase
{%
  function(d) {
    _l("s.np-qvp:", d[0].v, d[2].v);
    var r={type:'S',d:d,v:{}};
    r.v[d[0].type]=d[0].v;
    r.v[d[2].type]=d[2].v;
    return r;
  }
%}

  | NounPhrase _ QuestionVerbPhrase _ NounPhrase
{%
  function(d) {
    _l("s.np-qvp:", d[0].v, d[2].v);
    var r={type:'S',d:d,v:{}};
    r.v[d[0].type + "0"]=d[0].v;
    r.v[d[2].type]=d[2].v;
    r.v[d[4].type + "1"]=d[4].v;
    return r;
  }
%}

  | VerbPhrase _ NounPhrase
{%
  function(d) {
    _l("s.vp-np:", d[0].v, d[2].v);
    var r={type:'SC',d:d,v:{}};
    r.v[d[0].type]=d[0].v;
    r.v[d[2].type]=d[2].v;
    return r;
  }
%}

  | f
{%
  function(d) {
    _l("f", d[0].v); 
    var r={type:'f',d:d,v: { "f": d[0].v } };
    return r;
  }
%}


# Filler
#
f -> ("thanks"|"good"|"ok"|"meh"|"blah"|"wtf") {% function(d) { return {type:"F", d:d, v:d[0][0]}} %}
  | ("there"|"blech"|"blorg"|"k"|"thx"|"kthx"|"kthnx") {% function(d) { return {type:"F", d:d, v:d[0][0]}} %}
  | ("over"|"right") _ "there" {% function(d) { return {type:"F", d:d, v:d[0][0] + " " + d[2][0]}} %}
  | (","|"xxx"|"xxo"|"xox"|"oxo") {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | ("hey"|"wassup"|"hi"|"yow"|"yeah"|"yo"|"hello") {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | "w":+ "a":+ "s":+ "u":+ "p":+ {% function(d) { return {type:"F", d:d, v:"donk"}} %}
  | "y":+ [eau]:* [aosx]:+ {% function(d) { return {type:"F", d:d, v:"donk"}} %}
  | ("just"|"bb"|"bye") {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}
  | ("please") {% function(d) { return {type:"F", d:d, v:d[0][0] }} %}

  | ("would") _ ("you") _ ("mind") {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] + " " + d[2][0] }; } %}
  | ("would"|"can"|"could") _ ("you"):? _ ("mind"):? {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] }; } %}
  | ("how") _ ("about"|"bout") _ ("you"):? {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] + " " + d[2][0] }; } %}
  | ("you"):? _ ("mind")  {% function(d) { _l("fv:", d[2][0]);  return { type:"FV", d:d, v:d[2][0] }; } %}


###########################
#                          
#  _ __   ___  _   _ _ __  
# | '_ \ / _ \| | | | '_ \ 
# | | | | (_) | |_| | | | |
# |_| |_|\___/ \__,_|_| |_|
#                          
###########################



NounPhrase -> Article:? _ Noun    {% function(d) { _l("np:", d[2].v); return {type:'N', d:d, v: d[2].v }} %}
  | Article:? _ Adjective _ Adjective:* _ Noun    
{%
  function(d) {
    _l("a-np:", d[2].v, d[6].v);
    adj = _flatten(d[4]);
		adj.unshift(d[2].v);
    if (adj.length>0) { return {type:'NP', d:d, v: { "Adj": adj, "N": d[6].v } }; }
    return {type:'N', d:d, v: d[6].v };
  } 
%}
  | f _ NounPhrase
{%
  function(d) {
    _l("f-np:", d[2].v);
    var r={type:'NP', d:d, v: {}};
    if (d[2].type == "N") {
      r.v = d[2].v;
      r.type = "N";
    }
    else {
      r.v[d[2].type]=d[2].v;
    }
    return r;
  }
%}


Article -> ("a"|"an"|"the"|"le"|"they"|"thay"|"that"|"he"|"she"|"it") {% function(d) { _l("art:", d[0][0]); return {"type":"PN", d:d, v:d[0][0] }} %}

Adjective ->
  ("green"|"brown"|"black"|"yellow"|"purple"|"violet"|"rose"|"red"|"pink"|"blue"|"orange"|"tiel"|"grey"|"gray") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("big"|"tall"|"small"|"short"|"skinny"|"thin"|"round"|"fat"|"square"|"long") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("delicious"|"lovely"|"nice"|"cool"|"smelly") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("clean"|"wet"|"slimy"|"rich"|"poor"|"hungry"|"thirsty") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("old"|"young"|"new"|"antique") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("spotted"|"checkered"|"scaled"|"zigzag"|"flowery"|"fuzzy") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("gold"|"wooden"|"plastic"|"synthetic"|"leaved"|"patterned") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("gardening"|"shopping"|"riding"|"worn") {% function(d) { _l("adj:", d[0][0]); return {"type":"Adj", d:d, v:d[0][0] }; } %}
  | ("large"|"small"|"long"|"short"|"thick"|"narrow"|"deep"|"flat") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("whole"|"low"|"high"|"near"|"far"|"gone") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("fast"|"quick"|"slow"|"early"|"late") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("bright"|"dark"|"cloudy"|"hot"|"warm"|"cool"|"cold"|"windy"|"noisy"|"loud"|"quiet"|"dry"|"wet"|"clear") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("hard"|"soft"|"heavy"|"light"|"strong"|"weak"|"clean"|"tidy"|"clean"|"dirty"|"empty"|"full"|"close") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("living"|"thirsty"|"hungry"|"fat"|"old"|"fresh"|"dead"|"healthy") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("tastey"|"sweet"|"sour"|"bitter"|"salty") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("valued"|"good"|"bad"|"great"|"important"|"useful"|"expensive"|"cheap"|"free"|"difficult"|"strong"|"weak"|"able"|"free"|"rich") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("afraid"|"brave"|"fine"|"sad"|"proud"|"comfortable"|"happy"|"liked"|"clever"|"interesting"|"famous"|"exciting"|"funny") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("kind"|"polite"|"fair"|"share"|"busy"|"free"|"lazy"|"lucky"|"well"|"safe"|"careful"|"safe"|"dangerous") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("damn"|"fucking"|"freakin"|"freaking"|"fudging"|"friggin"|"frigging"|"friggin'"|"freakin'") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | ("front"|"back"|"side"|"top"|"bottom") {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v:d[0][0] }; } %}
  | Adjective _ Adjective {% function(d) { _l("adj:", d[0][0]); return {type:"Adj", d:d, v: [ d[0].v, d[2].v ] }; } %}

Noun -> "cat"   {% function(d) { _l("n:", d[0][0]); return {type:'N', d:d, v:"cat"}} %}
  | "dog"       {% function(d) { _l("n:", d[0][0]); return {type:'N', d:d, v:"dog"}} %}
  | "rabbit"    {% function(d) { _l("n:", d[0][0]); return {type:'N', d:d, v:"rabbit"}} %}
  | "bunny"     {% function(d) { _l("n:", d[0][0]); return {type:'N', d:d, v:"bunny"}} %}
  | "you"       {% function(d) { _l("n:", d[0][0]); return {type:'N', d:d, v:"you"}} %}
  | Direction   {% function(d) { _l("n:", d[0][0]); return {type:"ND", d:d, v:d[0].v};} %}
  | ("goblin"|"gob"|"skel"|"bones"|"boney"|"skeleton"|"crow"|"raven"|"bird") {% function(d) { _l("n:", d[0][0]);  return {type:"Na", d:d, v:d[0][0]};} %}
  | ("cat"|"dog"|"rabbit"|"kitty"|"kitteh"|"kitten"|"doggy"|"bunny") {% function(d) { _l("n:", d[0][0]);  return {type:"Na", d:d, v:d[0][0] };} %}
  | ("me"|"I"|"you"|"it") {% function(d) { _l("n:", d[0][0]);  return {type:"Nm", d:d, v:d[0][0] }} %}
  | ("door"|"tree"|"statue"|"key"|"chest") {% function(d) { _l("n:", d[0][0]);  return {type:"Ni", d:d, v:d[0][0]}} %}

Direction ->
  ("up"|"down"|"left"|"right") {% function(d) { return {type:"N", d:d, v:d[0][0]}; } %}
  | Direction _ Unit {% function(d) { return {type:"ND", d:d, v:{ "D":d[0].v, "Unit":d[2].v} }; } %}

Unit ->
  ("x")

########################
#
# __   _____ _ __| |__  
# \ \ / / _ \ '__| '_ \ 
#  \ V /  __/ |  | |_) |
#   \_/ \___|_|  |_.__/ 
#
########################

VerbPhrase ->
  Verb
{%
  function(d) {
    _l("v:", d[0].v);
    return { type:"V", d:d, v: d[0].v };
  }
%}

  | Verb _ NounPhrase
{%
  function(d) {
    _l("v-np:", d[0].v, d[2].v);
    var r={type:"VP",d:d,v: { "V": d[0].v}};
    r.v[d[2].type]=d[2].v;
    return r;
  }
%}

  | f _ VerbPhrase
{%
  function(d) {
    _l("f-vp:", d[2].v);
    var r = { type:"VP", d:d, v: d[2].v }
    if (d[2].type=="V") { r.type="V"; }
    return r;
  }
%}

#  | fv _ VerbPhrase
#{%
#  function(d) {
#    _l("fv-vp:", d[2].v);
#    var r = { type:"VP", d:d, v: d[2].v }
#    if (d[2].type=="V") { r.type="V"; }
#    return r;
#  }
#%}

#fv ->
#  ("would") _ ("you") _ ("mind") {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] + " " + d[2][0] }; } %}
#  | ("would"|"can"|"could") _ ("you"):? _ ("mind"):? {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] }; } %}
#  | ("how") _ ("about"|"bout") _ ("you"):? {% function(d) { _l("fv:", d[0][0]);  return { type:"FV", d:d, v:d[0][0] + " " + d[2][0] }; } %}
#  | ("you"):? _ ("mind")  {% function(d) { _l("fv:", d[2][0]);  return { type:"FV", d:d, v:d[2][0] }; } %}


Verb -> ("go"|"going"):? _ ("run") _ ("to"):?  {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going") _ ("next"):? _ ("to"):?  {% function(d) { return { type:"V", d:d, v: d[0][0] }} %}
  | ("go"|"going"):? _ ("walk"|"walking") _ ("over"):? _ ("to"):?  {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("pick"|"picking") _ ("up") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("open"|"opening") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("close"|"closing") {% function(d) { return { "type":"V", "d":d, "v": d[2][0] }; } %}
  | ("go"|"going"):? _ ("drop"|"shut"|"shutting") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("get"|"getting"|"place"|"grab"|"grabbing") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}
  | ("go"|"going"):? _ ("use"|"getting"|"place"|"grab"|"grabbing") {% function(d) { return { type:"V", d:d, v: d[2][0] }} %}

QuestionVerbPhrase -> QuestionVerb {% function(d) { return {type:"VQ", d:d, v:d[0].v }; } %}
 	| f _ QuestionVerb {% function(d) { return {type:"VQ", d:d, v:d[2].v }; } %}
#  | fv _ QuestionVerb {% function(d) { return {type:"VQ", d:d, v:d[2].v }; } %}

QuestionVerb ->
  ("where"|"what"|"why") _ ("'s"|"is"):? _ ("up"):? _ ("with"):? {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}
#  | ("what") _ ("'s"|"is"):? _ ("up"):? _ ("with"):? {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}
  | ("do"):? _ ("you") _ ("know") _ ("where") {% function(d) { var r={type:"AV", d:d, v:d[6][0]}; return r; } %}
  | ("how") _ ("'s"|"is"):? _ ("it"):? _ ("goin"|"going"|"goes"):? _ ("with"):? {% function(d) { var r={type:"AV", d:d, v:d[0][0]}; return r; } %}


_ -> [\s]:* {% function(d) { return null; } %}
#_ -> [\s]:+ {% function(d) { return null; } %}

End -> ("."):+ {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | ("?"):+ {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | ("!"):+ {% function(d) { return { type:"end", d:d, v: d[0][0] }} %}
  | null  {% function(d) { return { type:"end", d:d, v: "" };} %}
  | f _ End {% function(d) { return { type:"end", d:d, v:d[2].v }; } %}

#SentenceJoin -> "," {% function(d) { return { type:"join", d:d, v: d[0].v }} %}
#  | "and" {% function(d) { return { type:"join", d:d, v: d[0].v }} %}

