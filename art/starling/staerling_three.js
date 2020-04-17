import * as THREE from './js/three.module.js';
import Stats from './jsm/libs/stats.module.js';

import { GUI } from './jsm/libs/dat.gui.module.js';
import { TrackballControls } from './jsm/controls/TrackballControls.js';

var container, stats;
var camera, scene, raycaster, renderer;

var mouse = new THREE.Vector2();
var INTERSECTED;
var radius = 500, theta = 0;
//var frustumSize = 1000;

var controls;


function createControls( camera ) {
	controls = new TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.keys = [ 65, 83, 68 ];
}


var g_ctx = {
  "n": 100,

  "data" : [],

  "obj" : [],
  "line": [],

  "frustumSize":800,
  "camera" : {},
  "geometry": {},
  "scene": {},
  "renderer" : {},
  "raycaster": {},
  "light":[],

  "" : ""


};

init();
animate();

function randsphere() {
  var theta = 2.0 * Math.PI * Math.random(),
      u = Math.random();
  var _s = Math.sqrt(1.0 - u*u);
  return [ _s * Math.cos(theta), _s * Math.sin(theta), u ];
}

function init_staerling() {
  var n = g_ctx.n;

  var sz = 800;
  var c = sz/2;
  var pi2 = Math.PI * 2.0;

  for (var i=0; i<n; i++) {
    var p = randsphere();
    p[0] = p[0]*sz - c;
    p[1] = p[1]*sz - c;
    p[2] = p[2]*sz - c;

    var v = randsphere();
    
    var s = { 
      //"p" : [ Math.random() * sz - c, Math.random() * sz - c, Math.random() * sz - c ],
      "p" : p,
      "v" : v,
      "a" : [ Math.random() * pi2, Math.random() * pi2, Math.random() * pi2 ],
      "d" : [ [ 1, 0, 0 ], [0, 1, 0], [0, 0, 1] ] 
    };
    g_ctx.data.push(s);

  }

}

function staerling_rule_com_naive(flock, s_idx, fac) {
  var n = flock.length;
  fac = ((typeof fac === "undefined") ? (1.0/n) : fac);

  var s_p = flock[s_idx].p;
  var v = [0,0,0];

  var m = 0;
  var _c = [0,0,0];
  for (var ii=0; ii<n; ii++) {
    if (ii==s_idx) { continue; }

    _c[0] += flock[ii].p[0];
    _c[1] += flock[ii].p[1];
    _c[2] += flock[ii].p[2];

    m++;
  }

  if (m==0) { return [0,0,0]; }
  _c[0] /= m;
  _c[1] /= m;
  _c[2] /= m;

  _c[0] = fac * (_c[0] - s_p[0]);
  _c[1] = fac * (_c[1] - s_p[1]);
  _c[2] = fac * (_c[2] - s_p[2]);

  //var d = Math.sqrt(_c[0]*_c[0] + _c[1]*_c[1] + _c[2]*_c[2]);
  //if (d < (1.0/1024.0)) { return [0,0,0]; }

  return _c;
}

function staerling_rule_wcom_naive(flock, s_idx) {
  var n = flock.length;

  var s_p = flock[s_idx].p;
  var v = [0,0,0];

  var m = 0;
  for (var ii=0; ii<n; ii++) {
    if (ii==s_idx) { continue; }

    var dx = flock[ii].p[0] - s_p[0];
    var dy = flock[ii].p[1] - s_p[1]; 
    var dz = flock[ii].p[2] - s_p[2];

    var distsq = ( dx*dx + dy*dy + dz*dz );
    if (distsq < 1.0) { continue; }


    v[0] += dx / distsq;
    v[1] += dy / distsq;
    v[2] += dz / distsq;

    m++;
  }

  if (m>0) {
    v[0] /= m;
    v[1] /= m;
    v[2] /= m;
  }


  return v;
}

function staerling_rule_avoid_naive(flock, s_idx, mindist) {
  mindist = ((typeof mindist === "undefined") ? 1.0 : mindist);

  var n = flock.length;

  var s_p = flock[s_idx].p;
  var v = [0,0,0];

  var m = 0;
  for (var ii=0; ii<n; ii++) {
    if (ii==s_idx) { continue; }

    var dx = flock[ii].p[0] - s_p[0];
    var dy = flock[ii].p[1] - s_p[1]; 
    var dz = flock[ii].p[2] - s_p[2];

    var dist = Math.sqrt( dx*dx + dy*dy + dz*dz );
    if (dist >= mindist) { continue; }


    v[0] += dx ;
    v[1] += dy ;
    v[2] += dz ;

    m++;
  }

  if (m>0) {
    v[0] /= m;
    v[1] /= m;
    v[2] /= m;
  }

  return v;

}

function staerling_rule_velmatch_naive(flock, s_idx, nei_dist, v_fac) {
  nei_dist = ((typeof nei_dist === "undefined") ? -1.0 : nei_dist);
  v_fac = ((typeof v_fac === "undefined") ? (1.0/8.0) : v_fac);

  var n = flock.length;

  var s_p = flock[s_idx].p;
  var v = [0,0,0];


  var m = 0;
  for (var ii=0; ii<n; ii++) {
    if (ii==s_idx) { continue; }

    var dx = flock[ii].p[0] - s_p[0];
    var dy = flock[ii].p[1] - s_p[1]; 
    var dz = flock[ii].p[2] - s_p[2];

    var dist = Math.sqrt( dx*dx + dy*dy + dz*dz );

    if ( (nei_dist > 0.0) &&
         (dist > nei_dist) ) {
      continue;
    }

    var vx = flock[ii].v[0];
    var vy = flock[ii].v[1];
    var vz = flock[ii].v[2];


    v[0] += vx ;
    v[1] += vy ;
    v[2] += vz ;

    m++;
  }

  if (m>0) {
    v[0] /= m;
    v[1] /= m;
    v[2] /= m;
  }

  v[0] *= v_fac;
  v[1] *= v_fac;
  v[2] *= v_fac;

  return v;
}

function staerling_rule_repel_naive(flock, s_idx, nei_dist, fac) {
  nei_dist = ((typeof nei_dist === "undefined") ? -1.0 : nei_dist);

  var n = flock.length;

  fac = ((typeof fac === "undefined") ? (1.0/n) : fac);

  var s_p = flock[s_idx].p;
  var v = [0,0,0];

  var m = 0;
  var _c = [0,0,0];
  for (var ii=0; ii<n; ii++) {
    if (ii==s_idx) { continue; }

    var dx = (flock[ii].p[0] - s_p[0]);
    var dy = (flock[ii].p[1] - s_p[1]);
    var dz = (flock[ii].p[2] - s_p[2]);

    var dist = Math.sqrt( dx*dx + dy*dy + dz*dz );

    if ( (nei_dist > 0.0) &&
         (dist > nei_dist) ) {
      continue;
    }

    //if (dist < (1.0/1024.0)){ continue; }

    _c[0] = _c[0] - dx;
    _c[1] = _c[1] - dy;
    _c[2] = _c[2] - dz;

    m++;
  }

  return _c;
}

var g_every =50;
var g_counter = g_every+1;

function staerling_tick() {
  var n = g_ctx.n;

  var vfac = 1.0;

  g_counter++;
  g_counter=0;

  // init delv
  //
  var _del_v = [];
  for (var ii=0; ii<n; ii++) { _del_v.push([0,0,0]); }

  // com naive
  //
  //var _f0 = 1.0/64.0;
  var _f0 = 1.0/8.0;
  for (var ii=0; ii<n; ii++) {
    var v = staerling_rule_com_naive(g_ctx.data, ii, 160.0, 1.0/8.0);
    _del_v[ii][0] += v[0]*_f0;
    _del_v[ii][1] += v[1]*_f0;
    _del_v[ii][2] += v[2]*_f0;
  }

  /*
  // wcom naive
  //
  var _f1 = 100.0;
  for (var ii=0; ii<n; ii++) {
    //var v = staerling_rule_wcom_naive(g_ctx.data, ii, 16.0, 1.0/2.0);
    var v = staerling_rule_wcom_naive(g_ctx.data, ii, -1.0, 1.0);
    _del_v[ii][0] += v[0]*_f1;
    _del_v[ii][1] += v[1]*_f1;
    _del_v[ii][2] += v[2]*_f1;
  }
  */

  // repel naive
  //
  //var _f2 = 100000*1.0/16.0;
  //var _f2 = 100;
  var _f2 = 100.0;
  for (var ii=0; ii<n; ii++) {
    var v = staerling_rule_repel_naive(g_ctx.data, ii, 64.0);
    _del_v[ii][0] += v[0]*_f2;
    _del_v[ii][1] += v[1]*_f2;
    _del_v[ii][2] += v[2]*_f2;
  }

  // rule vel. match
  //
  //var _f3 = 10.0;
  var _f3 = 1.0;
  for (var ii=0; ii<n; ii++) {
    var v = staerling_rule_velmatch_naive(g_ctx.data, ii, 320.0, 1.0/8.0);

    _del_v[ii][0] += v[0] * _f3;
    _del_v[ii][1] += v[1] * _f3;
    _del_v[ii][2] += v[2] * _f3;
  }

  // update
  //
  for (var ii=0; ii<n; ii++) {
    var _a = [ g_ctx.data[ii].v[0],
               g_ctx.data[ii].v[1],
               g_ctx.data[ii].v[2] ],
        _b = [ _del_v[ii][0],
               _del_v[ii][1],
               _del_v[ii][2] ];

    var _a_len = Math.sqrt(_a[0]*_a[0] + _a[1]*_a[1] + _a[2]*_a[2]);
    var _b_len = Math.sqrt(_b[0]*_b[0] + _b[1]*_b[1] + _b[2]*_b[2]);

    if (_b_len < (1.0/(1024.0*1024.0))) { continue; }
    if (_a_len < (1.0/(1024.0*1024.0))) {
      _a[0] = _b[0];
      _a[1] = _b[1];
      _a[2] = _b[2];
      _a_len = _b_len;
    }

    var _a_n = [ _a[0]/_a_len, _a[1]/_a_len, _a[2]/_a_len ];
    var _b_n = [ _b[0]/_b_len, _b[1]/_b_len, _b[2]/_b_len ];

    var theta = Math.acos( _a_n[0]*_b_n[0] + _a_n[1]*_b_n[1] + _a_n[2]*_b_n[2] );
    if (theta < g_ctx.theta_max) {

      g_ctx.data[ii].v[0] += _del_v[ii][0];
      g_ctx.data[ii].v[1] += _del_v[ii][1];
      g_ctx.data[ii].v[2] += _del_v[ii][2];

    }
    else {

      g_ctx.data[ii].v[0] += _del_v[ii][0]/16.0;
      g_ctx.data[ii].v[1] += _del_v[ii][1]/16.0;
      g_ctx.data[ii].v[2] += _del_v[ii][2]/16.0;

    }



    // renorm
    //
    var _x = g_ctx.data[ii].v[0];
    var _y = g_ctx.data[ii].v[1];
    var _z = g_ctx.data[ii].v[2];

    var d = Math.sqrt(_x*_x + _y*_y + _z*_z);
    if (d < (1.0/(1024.0*1024.0))) {
      g_ctx.data[ii].v[0] = 1.0;
      g_ctx.data[ii].v[1] = 0.0;
      g_ctx.data[ii].v[2] = 0.0;
      continue;
    }

    g_ctx.data[ii].v[0] /= d;
    g_ctx.data[ii].v[1] /= d;
    g_ctx.data[ii].v[2] /= d;

  }


  if (g_counter >= g_every) {
    console.log("0v:", g_ctx.data[0].v);
  }

  for (var ii=0; ii<n; ii++) {
    g_ctx.data[ii].p[0] += vfac * g_ctx.data[ii].v[0];
    g_ctx.data[ii].p[1] += vfac * g_ctx.data[ii].v[1];
    g_ctx.data[ii].p[2] += vfac * g_ctx.data[ii].v[2];
  }

  var com = [0,0,0];
  for (var ii=0; ii<n; ii++) {
    com[0] += g_ctx.data[ii].p[0];
    com[1] += g_ctx.data[ii].p[1];
    com[2] += g_ctx.data[ii].p[2];
  }

  com[0] /= n; com[1] /= n; com[2] /= n;

  for (var ii=0; ii<n; ii++) {
    g_ctx.data[ii].p[0] -= com[0];
    g_ctx.data[ii].p[1] -= com[1];
    g_ctx.data[ii].p[2] -= com[2];
  }

  if (g_counter >= g_every) {
    g_counter=0;
  }

}

function init() {

  init_staerling();

  var frus = g_ctx.frustumSize;

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  var aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera( frus * aspect / - 2, frus * aspect / 2, frus / 2, frus / - 2, 1, 1000 );
  camera.position.z = 500;


  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  var light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );

  //var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

  var x = -2.5, y=-5;
  var pnts = [
    [x + 2.5, y + 2.5],
    [x + 2.5, y + 2.5, x + 2, y, x, y],
    [x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5],
    [x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5],
    [x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5],
    [x + 8, y + 3.5, x + 8, y, x + 5, y],
    [x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5]
  ];
  var shape = new THREE.Shape();
  shape.moveTo(pnts[0][0], pnts[0][1]);
  for (var ii=1; ii<pnts.length; ii++) {
    shape.bezierCurveTo(pnts[ii][0], pnts[ii][1], pnts[ii][2], pnts[ii][3], pnts[ii][4], pnts[ii][5]);
  }
  var geometry = new THREE.ShapeBufferGeometry(shape);

  for ( var i = 0; i < g_ctx.n; i ++ ) {
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = g_ctx.data[i].p[0];
    object.position.y = g_ctx.data[i].p[1];
    object.position.z = g_ctx.data[i].p[2];

    object.rotation.x = g_ctx.data[i].a[0];
    object.rotation.y = g_ctx.data[i].a[1];
    object.rotation.z = g_ctx.data[i].a[2];

    object.scale.x = 2.0;
    object.scale.y = 2.0;
    object.scale.z = 2.0;
    //object.scale.x = Math.random() + 0.5;
    //object.scale.y = Math.random() + 0.5;
    //object.scale.z = Math.random() + 0.5;

    scene.add( object );

    g_ctx.obj.push(object);


    var points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 1, 0 ) );
    var g = new THREE.BufferGeometry().setFromPoints(points);

    var mat = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    var line = new THREE.Line(g, mat);

    g_ctx.line.push(line);

    scene.add(line);

  }

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  /*
  var gui = new GUI();
  gui.add(params, 'orthographicCamera').name('use orthographic').onChange(function(value) {
    controls.dispose();
    createControls(camera);
  });
  */

  createControls(camera);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  //

  window.addEventListener( 'resize', onWindowResize, false );

  g_ctx.camera = camera;
  g_ctx.geometry = geometry;
  g_ctx.scene = scene;
  g_ctx.renderer = renderer;
  g_ctx.raycaster = raycaster;
  g_ctx.light.push(light);

}

function onWindowResize() {
  var frus = g_ctx.frustumSize;

  var aspect = window.innerWidth / window.innerHeight;

  g_ctx.camera.left = - frus * aspect / 2;
  g_ctx.camera.right = frus * aspect / 2;
  g_ctx.camera.top = frus / 2;
  g_ctx.camera.bottom = - frus / 2;

  g_ctx.camera.updateProjectionMatrix();

  g_ctx.renderer.setSize( window.innerWidth, window.innerHeight );

  controls.handleResize();
}

function onDocumentMouseMove( event ) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

//

var once = true;

function animate() {
  var f = 100.0;

  staerling_tick();

  var n = g_ctx.n;
  for (var ii=0; ii<n; ii++) {
    g_ctx.obj[ii].position.x = g_ctx.data[ii].p[0];
    g_ctx.obj[ii].position.y = g_ctx.data[ii].p[1];
    g_ctx.obj[ii].position.z = g_ctx.data[ii].p[2];

    g_ctx.line[ii].position.x = g_ctx.data[ii].p[0];
    g_ctx.line[ii].position.y = g_ctx.data[ii].p[1];
    g_ctx.line[ii].position.z = g_ctx.data[ii].p[2];

    g_ctx.line[ii].geometry.attributes.position.array[0] = 0;
    g_ctx.line[ii].geometry.attributes.position.array[1] = 0;
    g_ctx.line[ii].geometry.attributes.position.array[2] = 0;
    g_ctx.line[ii].geometry.attributes.position.array[3] = g_ctx.data[ii].v[0]*f;
    g_ctx.line[ii].geometry.attributes.position.array[4] = g_ctx.data[ii].v[1]*f;
    g_ctx.line[ii].geometry.attributes.position.array[5] = g_ctx.data[ii].v[2]*f;

    g_ctx.obj[ii].position.needsUpdate = true;
    g_ctx.line[ii].geometry.attributes.position.needsUpdate = true;

    if (once) {
      console.log(g_ctx.line[0]);

      once = false;
    }
  }

  requestAnimationFrame( animate );
  controls.update();
  stats.update();
  render();
}

function render() {

  theta += 0.0;

  /*
  camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
  camera.lookAt( scene.position );
  camera.updateMatrixWorld();
  */

  //g_ctx.obj[0].position.x += 1.1;
  //g_ctx.obj[0].needsUpdate = true;

  // find intersections
  //
  /*
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( scene.children );
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
    }
  } else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    INTERSECTED = null;
  }
  */

  renderer.render( scene, camera );

}

export { g_ctx };
