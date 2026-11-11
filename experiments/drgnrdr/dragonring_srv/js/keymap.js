// Key remapping panel.  Lists every action with its keys; clicking a
// key removes it, "+" waits for the next key press and adds it.  A key
// can belong to one action only: adding it to one removes it from any
// other.  Esc while waiting cancels.
//
//   DR.KeyMap.open(keys, onChange, onClose)
//
// 'keys' (action -> list of KeyboardEvent.code) is edited in place;
// onChange runs after every edit.
//
(function() {
  var DR = window.DR = window.DR || {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls)  { e.className = cls; }
    if (text) { e.textContent = text; }
    return e;
  }

  function open(keys, onChange, onClose) {
    var box = el("div", "keymap"), card = el("div", "card"),
        note = el("div", "note", "Click a key to remove it.  + then press a key to add it."),
        rows = el("div", "rows"), wait = null;
    card.appendChild(el("h3", null, "Keys"));
    card.appendChild(note);
    card.appendChild(rows);

    function render() {
      rows.innerHTML = "";
      Object.keys(DR.LABELS).forEach(function(a) {
        if (!keys[a]) { keys[a] = []; }
        var row = el("div", "row"), chips = el("div", "chips");
        row.appendChild(el("span", "act", DR.LABELS[a]));
        keys[a].forEach(function(code) {
          var b = el("button", "chip", DR.keyName(code));
          b.title = "remove " + code;
          b.onclick = function() {
            keys[a].splice(keys[a].indexOf(code), 1);
            onChange();
            render();
          };
          chips.appendChild(b);
        });
        if (!keys[a].length) { chips.appendChild(el("span", "unbound", "no key")); }
        var add = el("button", "add" + ( (wait === a) ? " waiting" : "" ), ( (wait === a) ? "press a key…" : "+" ));
        add.onclick = function() { wait = a;  render(); };
        chips.appendChild(add);
        row.appendChild(chips);
        rows.appendChild(row);
      });
    }

    function onKey(e) {
      if (wait === null) { return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.code === "Escape") {
        wait = null;
        render();
        return;
      }
      var moved = null;
      Object.keys(keys).forEach(function(a) {
        var i = keys[a].indexOf(e.code);
        if ( (i >= 0) && (a !== wait) ) { keys[a].splice(i, 1);  moved = a; }
      });
      if (keys[wait].indexOf(e.code) < 0) { keys[wait].push(e.code); }
      note.textContent = ( moved ? DR.keyName(e.code) + " moved from \"" + DR.LABELS[moved] + "\" to \"" + DR.LABELS[wait] + "\"."
                                 : "Click a key to remove it.  + then press a key to add it." );
      wait = null;
      onChange();
      render();
    }

    var bar = el("div", "bar"),
        def = el("button", null, "defaults"),
        cls = el("button", null, "close");
    def.onclick = function() {
      Object.keys(keys).forEach(function(a) { delete keys[a]; });
      Object.assign(keys, JSON.parse(JSON.stringify(DR.KEYS)));
      onChange();
      render();
    };
    cls.onclick = function() {
      window.removeEventListener("keydown", onKey, true);
      box.remove();
      if (onClose) { onClose(); }
    };
    bar.appendChild(def);
    bar.appendChild(cls);
    card.appendChild(bar);
    box.appendChild(card);
    document.body.appendChild(box);
    window.addEventListener("keydown", onKey, true);
    render();
  }

  DR.KeyMap = { open: open };
})();
