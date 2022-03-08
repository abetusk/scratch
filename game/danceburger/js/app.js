

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

var cursor;
var msgDebug;

var g_state = {
  "window_dt": 0.25,
  "ticker" : {},
  "d" : ""
};
console.log

function update() {

  if      (cursor.left.isDown)  { g_state.d = 'l'; }
  else if (cursor.right.isDown) { g_state.d = 'r'; }
  else if (cursor.up.isDown)    { g_state.d = 'u'; }
  else if (cursor.down.isDown)  { g_state.d = 'd'; }


  if (g_state.d != "") {
    console.log(g_state.d);
    if ((g_state.d === 'u') && (cursor.up.isUp))    { g_state.d = ''; }
    if ((g_state.d === 'l') && (cursor.left.isUp))  { g_state.d = ''; }
    if ((g_state.d === 'r') && (cursor.right.isUp)) { g_state.d = ''; }
    if ((g_state.d === 'd') && (cursor.down.isUp))  { g_state.d = ''; }
  }

  var x = g_state.ticker.getProgress();
  //console.log(">>", x);

  if (((1.0 - x) < g_state.window_dt) ||
      (x < g_state.window_dt)) {
    //console.log(x);
    //msgDebug.setText([ x ]);
    msgDebug.setText(['X', '.']);
  }
  else {
    msgDebug.setText(['.', '.']);
  }


}

function preload () {
  //this.load.setBaseURL('http://labs.phaser.io');
  this.load.setBaseURL('http://localhost:8000');

  this.load.image('sky', 'assets/skies/space3.png');
  this.load.image('logo', 'assets/sprites/phaser3-logo.png');
  this.load.image('red', 'assets/particles/red.png');
}

function create () {
  this.add.image(400, 300, 'sky');

  var particles = this.add.particles('red');

  var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
  });

  var logo = this.physics.add.image(400, 100, 'logo');

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);

  //---

  cursor = this.input.keyboard.createCursorKeys();
  msgDebug = this.add.text(300, 10, 'ok', {font: '16px Courier', fill: '#00ff00' });

  var bpm = 120;
  g_state.ticker = this.time.addEvent({ delay: 1000*(60 / bpm), loop: true });
}

function init() {
}

function __init() {

  var opts = {
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1
  };

  let type = "WebGL";
  if(!PIXI.utils.isWebGLSupported()){
    type = "canvas";
  }

  PIXI.utils.sayHello(type);

  let app = new PIXI.Application(opts);
  document.body.appendChild(app.view);

  app.renderer.backgroundColor = 0x061639;

  app.renderer.view.style.position = "absolute";
  app.renderer.view.style.display = "block";
  app.renderer.autoResize = true;
  app.renderer.resize(window.innerWidth, window.innerHeight);



}

