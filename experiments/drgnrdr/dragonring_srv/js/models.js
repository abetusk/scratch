// Dragon models.  Each model registers an id, a label for the panel
// and a create function; create(done) calls done(model) once the model
// is ready (now for built-in models, later for files that load).
//
// A model is { root: THREE.Object3D, animate(dt, cadence, turn, speed),
// and optionally setRider(visible) and stroke() (one pedal stroke:
// start a wing downbeat) }.
// root faces +z with +y up and the rider's seat near the origin; the
// game moves and turns root, animate() moves the parts (cadence in
// strokes per minute, turn -1..1 with > 0 = left, speed in units/s).
//
// The built-in "teal-dragon" (js/dragon.js) is the fallback: an
// unknown id, or a model whose create throws or reports an error,
// gives the teal dragon instead.
//
(function() {
  var DR = window.DR = window.DR || {};

  var FALLBACK = "teal-dragon", list = [], byId = {};

  function register(id, label, create) {
    if (!byId[id]) { list.push(id); }
    byId[id] = { id: id, label: label, create: create };
  }

  // done(model, idUsed, error)
  //
  function create(id, done) {
    function fallback(err) {
      console.warn("dragonride: model \"" + id + "\" unavailable (" + err + "); using " + FALLBACK);
      byId[FALLBACK].create(function(m) { done(m, FALLBACK, String(err)); });
    }
    if (!byId[id]) { fallback("not registered");  return; }
    try {
      byId[id].create(function(m, err) {
        if (err || !m) { fallback(err || "no model");  return; }
        done(m, id, null);
      });
    }
    catch (e) { fallback(e); }
  }

  // Panel options: label -> id.
  //
  function options() {
    var o = {};
    list.forEach(function(id) { o[byId[id].label] = id; });
    return o;
  }

  DR.Models = { FALLBACK: FALLBACK, register: register, create: create, options: options, ids: function() { return list.slice(); } };
})();
