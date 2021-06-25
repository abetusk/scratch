// License: CC0
//

expr
  = ws "(" e:expr ")" a:attach+ ws { return {"d":"cp1", "t":"sub", "e":e, "a": a}; }
  / ws "(" e:expr ")" ws { return {"d":"cp0", "t":"sub", "e":e}; }
  / ws e:word a:attach+ ws { return { "d":"cp2", "t":"base", "e":e.join(""), "a":a }; } 
  / ws e:word  ws { return { "d":"cp3", "t":"base", "e":e.join("") }; }
  / ws w:ring a:attach+ ws { return { "t":"ring_expr", "e": w, "a":a}; }
  / ws w:ring ws { return {"t":"ring_expr", "e":w}; }
  / ws w:rnd a:attach+ ws { return { "t":"rnd_expr", "e":w, "a":a}; }
  / ws w:rnd ws { return {"t":"rnd_expr", "e":w }; }
//  / space* w:rnd a:attach? space* { return w; }


attach
  = ws "@" e:expr { return {"t":"nesting", "e":e}; }
//  / ws "@" e:expr a:attach+ { return {"t":"nesting", "e":e, "a":a}; }
  / ws "^" e:expr { return { "t":"crown", "e":e }; }
//  / ws "^" e:expr a:attach+ { return { "t":"crown", "e":e, "a":a}; }
  / ws "!" e:expr { return { "t":"horn", "e":e }; }
//  / ws "!" e:expr a:attach+ { return { "t":"horn", "e":e, "a":a}; }
  / ws "~" e:expr { return { "t":"arm", "e":e }; }
//  / ws "~" e:expr a:attach+ { return { "t":"arm", "e":e, "a":a}; }
  / ws "|" e:expr { return { "t":"leg", "e":e }; }
//  / ws "|" e:expr a:attach+ { return { "t":"leg", "e":e, "a":a}; }
  / ws "." e:expr { return { "t":"tail", "e":e }; }
//  / ws "." e:expr a:attach+ { return { "t":"tail", "e":e, "a":a}; }

ring
  = ws "[" r:ring_list "]" ws { return { "t":"ring", "l":r }; }

// ring_list
//  = ws w:word "," r:ring_list  ws { return {"t":"ring_list", "e":w.join(""), "l":r }; }
//  / ws w:word ws { return {"t":"ring_end", "e":w.join("") }; }

ring_list
  = ws e:expr "," r:ring_list  ws { return {"t":"ring_list", "e":e, "l":r }; }
  / ws e:expr ws { return {"t":"ring_end", "e":e }; }

rnd
  = ws "{" r:rnd_list "}" ws { return { "t":"rnd", "l":r }; }
  
rnd_list
  = ws w:rndword "," r:rnd_list ws { return { "t":"rnd_list", "e":w.join(""), "l":r }; }
  / ws w:rndword ws { return { "t":"rnd_end", "e":w.join("") }; }

rndword = [a-zA-Z0-9_*/-]+

//word = letter+ "/"?
word = letter+ 
letter = [a-zA-Z0-9_*/-]
ws = [ \t\n\r]*

