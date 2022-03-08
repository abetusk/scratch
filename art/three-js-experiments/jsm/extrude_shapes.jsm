import * as THREE from '../js/three.module.js';
import { TrackballControls } from '../jsm/TrackballControls.js';

var camera, scene, renderer, controls;
var g_ctx = {"x":0};

init();
animate();


function init() {

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.style.color = '#fff';
  info.style.link = '#f80';
  info.innerHTML = '<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - geometry extrude shapes';
  document.body.appendChild( info );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x222222 );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 0, 500 );

  controls = new TrackballControls( camera, renderer.domElement );
  controls.minDistance = 200;
  controls.maxDistance = 500;

  scene.add( new THREE.AmbientLight( 0x222222 ) );

  var light = new THREE.PointLight( 0xffffff );
  light.position.copy( camera.position );
  scene.add( light );

  //

  /*
  var closedSpline = new THREE.CatmullRomCurve3( [
    new THREE.Vector3( - 60, - 100, 60 ),
    new THREE.Vector3( - 60, 20, 60 ),
    new THREE.Vector3( - 60, 120, 60 ),
    new THREE.Vector3( 60, 20, - 60 ),
    new THREE.Vector3( 60, - 100, - 60 )
  ] );

  closedSpline.curveType = 'catmullrom';
  closedSpline.closed = true;

  var extrudeSettings = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: closedSpline
  };

  var pts = [], count = 3;
  for ( var i = 0; i < count; i ++ ) {
    var l = 20;
    var a = 2 * i / count * Math.PI;
    pts.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );

  }

  var shape = new THREE.Shape( pts );
  var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
  var material = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );
  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  */


  //


  var randomPoints = [];

  for ( var i = 0; i < 10; i ++ ) {

    randomPoints.push( new THREE.Vector3( ( i - 4.5 ) * 50, THREE.MathUtils.randFloat( - 50, 50 ), THREE.MathUtils.randFloat( - 50, 50 ) ) );

  }

  var randomSpline = new THREE.CatmullRomCurve3( randomPoints );
  console.log(randomSpline);
  console.log(g_ctx);
  g_ctx["spline"] = randomSpline;

  //

  var extrudeSettings = {
    steps: 200,
    bevelEnabled: false,
    extrudePath: randomSpline
  };


  var pts = [], numPts = 10;

  for ( var i = 0; i < numPts * 2; i ++ ) {
    //var l = i % 2 == 1 ? 10 : 20;
    var l = 20;
    var a = i / numPts * Math.PI;
    pts.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );
  }

  var shape = new THREE.Shape( pts );
  var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
  var material2 = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
  var mesh = new THREE.Mesh( geometry, material2 );

  // to remove:
  // scene.remove(mesh);

  g_ctx["shape"] = shape;
  g_ctx["geometry"] = geometry;
  g_ctx["mesh"] = mesh;

  console.log(geometry);

  scene.add( mesh );

  g_ctx["scene"] = scene;

  //

  /*
  var materials = [ material, material2 ];

  var extrudeSettings = {
    depth: 20,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 4,
    bevelSegments: 1
  };

  var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );

  var mesh = new THREE.Mesh( geometry, materials );

  mesh.position.set( 50, 100, 50 );

  scene.add( mesh );
  */

  g_xx = g_ctx;

}

function animate() {

  requestAnimationFrame( animate );

  controls.update();
  renderer.render( scene, camera );

  if ("spline" in g_ctx) {
    g_ctx.spline.points[0].z += 0.1;

  }

}

