var fs = require("fs");

var epiteth = [
  "Devourer in Mist", "S'glhuo Herald", "Stars Devourer", "Nile and Universe's Equilibrium Creator", "Cold Flame",
  "Pole Lord", "Moon God", "Silent Shouter on the Hill", "Spider God", "Spinner in Darkness",
  "Serpent Goddess", "Aeg", "Aega", "Widow in the Woods", "Many-Mother",
  "Pestilence Bringer", "Crabs Master", "Soul-Chilling Ice-God", "Great Water Lizard", "Sarnath Doom",
  "Black One", "Space Filler", "He Who Comes in Dark", "Faceless Ones", "Berkeley Toad",
  "Serpent-Bearded Byatis", "Horror from the Hills", "Feeder", "Caug-Narfagn", "Serpent Skirted One",
  "Space Colour Out", "Runes Master", "Bloody Crooked One", "Dark Water God", "Living Flame",
  "Burning One", "R'lyeh Master", "Great Dreamer", "Cthulhu Secret Daughter", "Dream-Daemon",
  "Destroying Eye", "Waiting Dark", "Mortician God", "She Whose Hand Embalms", "Burrower from the Bluff",
  "Stone-Thing", "Lizards Lord", "White God", "Pale Beast", "Labyrinth God",
  "Star-Seed", "Plant-God", "Azathoth A Seed", "Volcano Lord", "Thoa",
  "Deep Waters Sound", "Aether Anemone", "Lake Inhabitant", "Dead Dreams Lord", "Moon Blind God",
  "Flesh Corrupter", "Temple Master", "Glhuun", "Twice-Invoked", "Insane Eater",
  "Golgoroth", "Forgotten Old One", "Black Stone God", "Golgoroð", "Horror Under Warrendown",
  "Demon Bird-God", "Balsagoð Bird-God", "Aartnna Destroyer God", "Dreams Eater", "Night Shadow",
  "Lurker in Doom-laden Shadows", "Othuyeg Mate", "Dark One", "Contagion", "Unspeakable",
  "He Who is Not to be Named", "Interstellar Spaces Lord", "King in Yellow", "Peacock King", "Zukala-Koth",
  "Great Tentacled God", "Outsider", "Great One", "Cykranosh God", "Ziulquag-Manzah",
  "Cthulhu's Mate", "Xothic Matriarch", "Sea Horror", "Shining Hunter", "Darkness Mistress",
  "Wind Walker", "Wendigo", "Cold White Silence God", "Watery Gates Guardian and Key", "Deep Lobster",
  "Yekub God", "Ravenous One", "Cthulhu Bride", "Diseases Leviathan", "Great One",
  "Cannoosut", "All-in-All", "Greater-than-Gods", "Forgotten Spawn", "Dead One",
  "Supreme Unknown", "Yaksh Scourge", "Devil-dingo", "Grey", "He Who Devours All in Dark",
  "Forest-Goddess", "Doom Harbinger", "Mappo's Dragon", "River Abomination", "Devourer",
  "Cancer God", "Eternal", "Black Lake Lord", "Monster in the Moon", "Charnel God",
  "Great Ghoul", "Zul-Bha-Sair Lord", "Morddoth", "Thousand-Faced Moon", "Steel Storm",
  "Shadows She-Daemon", "Cthulhu Twin Spawn", "Wolf-Thing", "Stalker in the Snows", "He Who Hunts",
  "Na-girt-a-lu", "Forgotten God", "Thing That Should Not Be", "Ages Heart", "Aeons Leech",
  "Twin Blasphemies", "Kraken Within", "Zombifying Essence", "Thing which Should Not Be", "Red Abyss Haunter",
  "Shatterer", "Mnomquah's Mate", "Oceanic Horror", "Doom-Walker", "Pharol Black",
  "Elder One", "Leopard That Stalks the Night", "Dust Treader", "Z'ylsm Eye", "He Who Dwells Beneath Our Feet",
  "Crystalloid Intellect", "Seeker in Skies", "One from the Sun Race", "All Winds Father", "Hominids Terror",
  "Ivory Throne He", "Ancients Bearer of the Cup of the Blood", "White Worm", "Hog", "Crocodile God",
  "Great Manipulator", "Ishmagon", "Fallen Wisdom", "Wicked Sight Eye", "Abyssal Slime Mistress",
  "Death Reborn", "Zishaik", "Chushaik", "Souls Devourer", "Fidelity God",
  "God in the Box", "Big Black Thing", "Tenebrous One", "Burrower Beneath", "Great Chthonian",
  "Devourer in the Earth", "Lost One", "Whiteness", "Night Monarch", "Terror that Walketh in Darkness",
  "Shining One", "Shadow in the Crimson Light", "Endless Void Master", "Xuthal Demon-God", "God-Beast",
  "N'kai Sleeper", "Toad-God", "Zhothaqqua", "Sadagowah", "Watery Dweller Beneath",
  "Swamps Father", "Bayou Plant God", "Pain Lord", "Great Horned Mother", "Creation Black Glory",
  "Mother and Father to All Marine Life", "Hermaphroditic God", "Thing from Beyond", "Secrets Keeper", "Yig's Terrifying Son",
  "Starfish God", "Ravermos Sleeper", "Gsarthotegga", "Shaggai Doom", "Dread One",
  "Goat God", "Ever-Consuming", "Illusions Maker", "Unreality Lord", "Higher Dimension Being",
  "Terror Lord", "Atlantis Black Kraken", "Elder Night Demon-God", "Yama", "Faceless One",
  "Defiler", "Thule Worm-God of the Lords", "Serpents Father", "Seas Master", "Dark Stalker",
  "Depths Dweller", "Things Which Dwell Beneath the Surface Lord", "Oldest Dreamer", "Giants Chief", "Thing in the Pit",
  "All-Consuming Fog", "Whirling Vortices Black Lord", "Twin Obscenities", "Fiery Messenger", "Dweller in the Depths",
  "Swarms Matriarch", "Zystulzhemgni", "Dark Silent One", "Old Night", "Zul-Che-Quon",
  "Zuchequon", "Feaster from Stars", "Sky-Devil", "Ossadagowah"
  ];


var spell = JSON.parse(fs.readFileSync("spells.json"));
var monster = JSON.parse(fs.readFileSync("monsters.json"));
var item = JSON.parse(fs.readFileSync("magicitems.json"));

var data = [ spell, monster, item ];

var idx = [];
for (var ii=0; ii<data.length; ii++) {
  idx.push( Math.floor(Math.random()*(data[ii].length)) );
}

var spell_tok = data[0][idx[0]].name.split(" ");
//console.log(spell_tok);

var monster_tok = data[1][idx[1]].name.split(" ");
var item_tok = data[2][idx[2]].name.replace(/[Tt]he */, '').split(" ");

var item_type = '';
var itme_effect = '';

if (item_tok.length > 1) {
  if (item_tok[1] == "of") {
    item_type = item_tok[0];
    item_effect = item_tok.slice(2).join(" ");
  }
}

var ep = epiteth[ Math.floor(Math.random()*epiteth.length) ];
var m = monster_tok.join(" ");

console.log("orig:");
console.log("monster:", m);
console.log("spell:", spell_tok.join(" "));
console.log("item:", item_tok.join(" "));
console.log("epiteth:", ep);

m = m.replace(/Adult|Young/, '');
m = m.replace(/^(.*) *, *(.*)$/, '$2 $1');

var choice = [];

var sp = spell_tok.join(" ");
if ((spell_tok.length == 3) && (spell_tok[1] == "of")) {
  sp = spell_tok.slice(2) + " " + spell_tok[0];
}

console.log("");
console.log( ">>>", data[0][idx[0]].name, ",", data[1][idx[1]].name, ",", data[2][idx[2]].name );

choice.push( sp + " " + ep);
choice.push( sp + " " + m);
//choice.push( sp + " " + ep);
//choice.push( sp + " " + m);

if (item_type != '') {
  console.log("");
  console.log("a>>",  item_effect, sp, m, item_type );
  console.log("b>>",  sp, m,  item_type, item_effect );
  console.log("c>>",  m, item_type, item_effect );
  console.log("d>>",  m, item_effect, item_type );
  console.log("e>>",  sp, item_effect, item_type );
  console.log("");

  console.log("x>>", ep, item_effect, item_type);
  console.log("y>>", sp, ep);
  console.log("");

  choice.push( m + " " + item_effect + " " + item_type);
  choice.push( ep + " " + item_effect + " " + item_type);


}
else {

  console.log("");
  console.log("b>>",  sp, m, item_tok.join(" "));
  console.log("");

  console.log("x>>", ep, item_tok.join(" "));
  console.log("y>>", sp, ep);
  console.log("");

  choice.push( ep + " " + item_tok.join(" "));
  choice.push( m + " " + item_tok.join(" "));


}




if (spell_tok.length > 1) {
  console.log("");
  console.log(spell_tok[0], monster_tok.join(" "), spell_tok[ spell_tok.length-1 ]);
  console.log("");

  choice.push( spell_tok[0] + " " +  monster_tok.join(" ")  + " " +  spell_tok[ spell_tok.length-1 ]);

}

console.log(">>>>>>>>>", choice[ Math.floor(Math.random()*choice.length) ]);





