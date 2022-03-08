// License: CC0
//
// playing around with some level design for an 'unrailed' type
// of game.
//
// Items of interest (for harder levels):
//
// * place start and end at either end of map
// * create an orthogonal-ish slice through the level of black rock
//   between start and end stations
// * trace two non intersecting paths from start station to finish
//   station and fill with generic ground
//   - restart if none found
//   - have a variable probability of direction depending on which path
//     it is and where it is in the map , for example
//     + first path, left half of map, 'up' whp, right half, 'down' whp
//     + second path, left half, 'down' whp, right half, 'down' whp
// * now trace through with water paths
// * grow seed areas with wood and rock
// * Do some checks for solvability
//   - create implied regions based on water isolation
//   - create edge cost from one implied region to another (how much resource
//     it will cost to get from one to the other)
//   - I think this can be modelled as a network flow problem
// * take the minimum cost of the resource bridge solvability and
//   the minimum train path as a lower bound on needed resources in the
//   level
// * a further heuristic is to widen the black rock choke points to make
//   sure the train won't be tied up in a narrow pass for too long
//   - take a path, start 'eating' black rock at some end that has only 2
//     neighbors

var g_data = {
  "dx" : 90,
  "dy" : 20,
  "tile_code": ".|~+*s?",
  "tile_info" : {
    '.' : { "code": '.', 'type': "ground" },
    '|' : { "code": '|', 'type': "tree" },
    '~' : { "code": '~', 'type': "water" },
    '+' : { "code": '+', 'type': "rock" },
    '*' : { "code": '*', 'type': "black_rock" },
    's' : { "code": 's', 'type': "station" },
    '?' : { "code": '?', 'type': "unknown" }
  },
  "default_level_option": {
    "dx":90,
    "dy":20
  },
  "bounds" : [
    [0,0],
    [90,20]
  ],
  "level" : []
};

function irnd(n) {
  return Math.floor(Math.random()*n);
}

function ernd(a) {
  return a[ Math.floor(Math.random()*a.length) ];
}

function print_level(dat) {
  for (var ii=0; ii<dat.level.length; ii++) {
    console.log(dat.level[ii].join(""));
  }
}

function rand_walk(n,start_pos,bounds,step_dir) {
  start_pos = ((typeof start_pos === "undefined") ? [0,15] : start_pos);
  bounds = ((typeof bounds === "undefined") ? [[0,0],[50,30]] : bounds);
  step_dir = ( (typeof step_dir === "undefined") ? [[0,0], [1,0], [0,1], [0,-1]] : step_dir);

  pos = [ start_pos[0], start_pos[1] ];

  var path = [];

  for (var ii=0; ii<n; ii++) {
    var _d = ernd(step_dir);
    pos[0] += _d[0];
    pos[1] += _d[1];

    if ((pos[0] < bounds[0][0]) || (pos[1] < bounds[0][1]) ||
        (pos[0] >= bounds[1][0]) || (pos[1] >= bounds[1][1])) {
      break;
    }

    path.push( [pos[0], pos[1]] );
  }

  return  path;

}

function grow_place(dat, start_pos, n, _tile, opt) {
  opt = ((typeof opt === "undefined") ? {} : opt);
  var lvl = dat.level;
  var n_placed = 0, iter = 0, n_iter = 1000;

  var _dir = [[-1,0],[1,0],[0,1],[0,-1]];
  var bounds = [[0,0],[dat.dx, dat.dy]];

  var placed = {};

  var _p = [start_pos[0], start_pos[1]];
  n_placed = 1;

  var _key = _p[0] + ":" + _p[1];
  placed[_key] = { "key":_key, "x": _p[0], "y":_p[1] }
  var _key_list = [ _key ];

  while ((n_placed < n) && (iter < n_iter)) {
    iter++;

    var _p_idx = irnd(_key_list.length);
    var _p_key = _key_list[_p_idx];
    _p = [ placed[_p_key].x, placed[_p_key].y ];

    var _d = ernd(_dir);

    _p[0] += _d[0];
    _p[1] += _d[1];

    console.log(iter, n_placed, _p, _d, bounds, "idx:", _p_idx, "key:", _p_key);

    if ( (_p[0] < bounds[0][0]) || (_p[0] >= bounds[1][0]) ||
         (_p[1] < bounds[0][1]) || (_p[1] >= bounds[1][1]) ) {
      console.log("oob");
      continue;
    }

    _key = _p[0] + ":" + _p[1];
    if (_key in placed) {
      console.log("collision");
      continue;
    }
    placed[_key] = { "key":_key, "x": _p[0], "y":_p[1] }
    _key_list.push(_key);
    n_placed++;

  }

  console.log("...", _key_list);

  var n_placed_real = 0;
  for (var ele_idx in placed) {
    var xy = [ placed[ele_idx].x, placed[ele_idx].y ];

    if ( dat.level[xy[1]][xy[0]] == '.' ) {
      dat.level[xy[1]][xy[0]] = _tile;
      n_placed_real++;
    }
  }

  return n_placed_real;

}

function make_blank_level(dat, opt) {
  opt = ((typeof opt === "undefined") ? dat.default_level_option : opt);

  for (var y=0; y<opt.dy; y++) {
    dat.level.push([]);
    for (var x=0; x<opt.dx; x++) {
      dat.level[y].push( '.' );
    }
  }

}

function make_level(dat, opt) {
  opt = ((typeof opt === "undefined") ? dat.default_level_option : opt);

  for (var y=0; y<opt.dy; y++) {
    dat.level.push([]);
    for (var x=0; x<opt.dx; x++) {

      var _tile_code = irnd(5);

      var _tile = '';

      switch (_tile_code) {
        case 0: _tile = '.'; break;
        case 1: _tile = '|'; break;
        case 2: _tile = '~'; break;
        case 3: _tile = '+'; break;
        case 4: _tile = '*'; break;
        default: _tile = '?'; break;
      }

      g_data.level[y].push(_tile);

    }
  }
}

make_blank_level(g_data);
print_level(g_data);


var p = rand_walk(10000, [0, Math.floor(g_data.dy/2)], g_data.bounds);

for (var ii=0; ii<p.length; ii++) {
  console.log(ii, p[ii]);
  g_data.level[p[ii][1]][p[ii][0]] = '~';
}

grow_place(g_data, [35,5], 30, '|');
grow_place(g_data, [85,9], 40, '|' );
grow_place(g_data, [15,3], 30, '+' );
grow_place(g_data, [55,5], 40, '+' );
grow_place(g_data, [0,0], 40, '*' );
grow_place(g_data, [6,6], 40, '+' );

grow_place(g_data, [45,8], 40, '~');

console.log(g_data.bounds);

print_level(g_data);
//make_level(g_data);
