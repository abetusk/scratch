///////////////////////////////
// Quaternion to Euler
///////////////////////////////

var RotSeq = ["zyx", "zyz", "zxy", "zxz", "yxz", "yxy", "yzx", "yzy", "xyz", "xyx", "xzy", "xzx"];

function _mmul(m0, m1) {
  var _m = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for (var i=0; i<4; i++) {
    for (var j=0; j<4; j++) {
      for (var k=0; k<4; k++) {
        _m[4*i + j] += m0[4*i + k]*m1[4*k + j];
      }

    }
  }
  return _m;
}

function twoaxisrot(r11, r12, r21, r31, r32) {
  var res = [0, 0, 0];
  res[0] = Math.atan2( r11, r12 );
  res[1] = Math.acos ( r21 );
  res[2] = Math.atan2( r31, r32 );
  return res;
}

function threeaxisrot(r11, r12, r21, r31, r32) {
  var res = [0,0,0];
  res[0] = Math.atan2( r31, r32 );
  res[1] = Math.asin ( r21 );
  res[2] = Math.atan2( r11, r12 );
  return res;
}

function quaternion2Euler(q, rotSeq) {
  var res = [0,0,0];
  switch(rotSeq){
    case 'zyx':
      res =
        threeaxisrot( 2*(q._x*q._y + q._w*q._z),
                       q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z,
                      -2*(q._x*q._z - q._w*q._y),
                       2*(q._y*q._z + q._w*q._x),
                       q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z );
      break;

    case 'zyz':
      res = 
        twoaxisrot( 2*(q._y*q._z - q._w*q._x),
                     2*(q._x*q._z + q._w*q._y),
                     q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z,
                     2*(q._y*q._z + q._w*q._x),
                    -2*(q._x*q._z - q._w*q._y) );
      break;

    case 'zxy':
      res = 
        threeaxisrot( -2*(q._x*q._y - q._w*q._z),
                        q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z,
                        2*(q._y*q._z + q._w*q._x),
                       -2*(q._x*q._z - q._w*q._y),
                        q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z);
      break;

    case 'zxz':
      res =
        twoaxisrot( 2*(q._x*q._z + q._w*q._y),
                    -2*(q._y*q._z - q._w*q._x),
                     q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z,
                     2*(q._x*q._z - q._w*q._y),
                     2*(q._y*q._z + q._w*q._x) );
      break;

    case 'yxz':
      res = 
        threeaxisrot( 2*(q._x*q._z + q._w*q._y),
                       q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z,
                      -2*(q._y*q._z - q._w*q._x),
                       2*(q._x*q._y + q._w*q._z),
                       q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z);
      break;

    case 'yxy':
      res =
        twoaxisrot( 2*(q._x*q._y - q._w*q._z),
                     2*(q._y*q._z + q._w*q._x),
                     q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z,
                     2*(q._x*q._y + q._w*q._z),
                    -2*(q._y*q._z - q._w*q._x) );
      break;

    case 'yzx':
      threeaxisrot( -2*(q._x*q._z - q._w*q._y),
                      q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z,
                      2*(q._x*q._y + q._w*q._z),
                     -2*(q._y*q._z - q._w*q._x),
                      q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z,
                      res);
      break;

    case 'yzy':
      res =
        twoaxisrot( 2*(q._y*q._z + q._w*q._x),
                    -2*(q._x*q._y - q._w*q._z),
                     q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z,
                     2*(q._y*q._z - q._w*q._x),
                     2*(q._x*q._y + q._w*q._z) );
      break;

    case 'xyz':
      res =
      threeaxisrot( -2*(q._y*q._z - q._w*q._x),
                    q._w*q._w - q._x*q._x - q._y*q._y + q._z*q._z,
                    2*(q._x*q._z + q._w*q._y),
                   -2*(q._x*q._y - q._w*q._z),
                    q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z );
      break;

    case 'xyx':
      res = 
      twoaxisrot( 2*(q._x*q._y + q._w*q._z),
                  -2*(q._x*q._z - q._w*q._y),
                   q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z,
                   2*(q._x*q._y - q._w*q._z),
                   2*(q._x*q._z + q._w*q._y) );
      break;

    case 'xzy':
      res = 
      threeaxisrot( 2*(q._y*q._z + q._w*q._x),
                     q._w*q._w - q._x*q._x + q._y*q._y - q._z*q._z,
                    -2*(q._x*q._y - q._w*q._z),
                     2*(q._x*q._z + q._w*q._y),
                     q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z );
      break;

    case 'xzx':
      res =
      twoaxisrot( 2*(q._x*q._z - q._w*q._y),
                   2*(q._x*q._y + q._w*q._z),
                   q._w*q._w + q._x*q._x - q._y*q._y - q._z*q._z,
                   2*(q._x*q._z + q._w*q._y),
                  -2*(q._x*q._y - q._w*q._z) );
      break;
    default:
      break;
  }
  return res;
}

var g_result = {};
var g_ctx = {"init":false};

import * as THREE from '../build/three.module.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { BVHLoader } from '../jsm/loaders/BVHLoader.js';

var clock = new THREE.Clock();

var camera, controls, scene, renderer;
var mixer, skeletonHelper;
g_xx = mixer;

init();
animate();

var loader = new BVHLoader();
//loader.load( "models/bvh/pirouette.bvh", function ( result ) {
//loader.load( "models/bvh/08_11.bvh", function ( result ) {
//loader.load( "models/bvh/walk_male.bvh", function ( result ) {
//loader.load( "models/bvh/02_02.bvh", function ( result ) {
//loader.load( "models/bvh/37_01.bvh", function ( result ) {
//loader.load( "models/bvh/07_05.bvh", function ( result ) {
loader.load( "models/bvh/08_11.bvh", function ( result ) {
//loader.load( "models/bvh/120_19.bvh", function ( result ) {



  g_result = result;
  console.log(result);

  skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );

  // allow animation mixer to bind to THREE.SkeletonHelper directly
  //
  skeletonHelper.skeleton = result.skeleton;

  var boneContainer = new THREE.Group();
  boneContainer.add( result.skeleton.bones[ 0 ] );

  scene.add( skeletonHelper );
  scene.add( boneContainer );

  // play animation
  //
  mixer = new THREE.AnimationMixer( skeletonHelper );

  //mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
  //
  mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();

  g_ctx["init"] = true;
  g_ctx["bpos"] = [];
  for (var ii=0; ii<result.skeleton.bones.length; ii++) {
    var _g = new THREE.BoxBufferGeometry( 4, 4, 4 );
    var _o = new THREE.Mesh( _g, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
    g_ctx.bpos.push(_o);

    scene.add(_o);
  }

g_xx = mixer;

} );

function init() {

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 200, 400 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xeeeeee );

  scene.add( new THREE.GridHelper( 400, 10 ) );

  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 300;
  controls.maxDistance = 700;



  //var _g = new THREE.BoxBufferGeometry( 10, 10, 5 );
  //var _o = new THREE.Mesh( _g, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

  //g_ctx["g"] = _g;
  //g_ctx["o"] = _o;

	//_o.position.x = 0;
	//_o.position.y = 0;
	//_o.position.z = 0;

  //scene.add(_o);

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

var once = true;

function animate() {

  //var alpha = 1.0;
  var alpha = 66/100;

  requestAnimationFrame( animate );

  var delta = clock.getDelta();

  if ( mixer ) { mixer.update( alpha*delta ); }

  if (g_ctx.init) {
  }

  if ("skeleton" in g_result) {
    for (var ii=0; ii<g_result.skeleton.bones.length; ii++) {
      if (g_result.skeleton.bones[ii].name == 'ENDSITE') { continue; }
      if (g_result.skeleton.bones[ii].name == 'neck') { continue; }
      if (g_result.skeleton.bones[ii].name == 'lCollar') { continue; }
      if (g_result.skeleton.bones[ii].name == 'rCollar') { continue; }
      var skel = g_result.skeleton.bones[ii].getWorldPosition();
      g_ctx.bpos[ii].position.x = skel.x;
      g_ctx.bpos[ii].position.y = skel.y;
      g_ctx.bpos[ii].position.z = skel.z;
    }

  }

  if (once) {
    if ("skeleton" in g_result) {
      once = false;
    }
  }


  renderer.render( scene, camera );

}


