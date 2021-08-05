
var g_data = {
"rnd":[]
};


function init_card_canvas(pixi_canvas_id, _img_bg, _img_fg, _img_suit, _img_text) {
  //var w = 432, h=720;
  var bg_s = 1440;

  //var w = 191.25, h= 300;
  var w = 190, h = 317;
  //const app = new PIXI.Application({ antialias: true, width: w, height: h, view: document.getElementById("ui_card3_canvas")  });
  const app = new PIXI.Application({ antialias: true, width: w, height: h, view: document.getElementById(pixi_canvas_id)  });

  var _scale = h/720.0;

  for (var ii=0; ii<10; ii++) {
    g_data.rnd.push( Math.random()*3/4 + 0.25 );
    g_data.rnd.push( Math.random()/2 + 0.5 );
    g_data.rnd.push( Math.random()/2 + 0.5 );
  }


  //document.body.appendChild(app.view);
  //var ele = document.getElementById("ui_card3");
  //ele.innerHTML = "";
  //ele.appendChild(app.view);

  app.stage.interactive = true;

  //var bg = PIXI.Sprite.from('img/10-WHEEL_of_FORTUNE_bg1.png');
  //var bg = PIXI.Sprite.from('img/bg.png');
  var bg = PIXI.Sprite.from(_img_bg);

  bg.anchor.set(0.5);

  bg.x = app.screen.width / 2;
  bg.y = app.screen.height / 2;

  bg.x = w/2;
  bg.y = h/4;

  //bg.scale.x = _scale;
  //bg.scale.y = _scale;

  //bg.width = 0.5;
  //bg.height = 0.5;
  //bg.width  = Math.floor(bg_w);
  //bg.height = bg_h;

  app.stage.addChild(bg);

  var container = new PIXI.Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // add a bunch of sprites
  //var fg = PIXI.Sprite.from('img/10-WHEEL_of_FORTUNE_fg.png');
  //var fg = PIXI.Sprite.from('img/fg.png');
  var fg = PIXI.Sprite.from(_img_fg);
  fg.anchor.set(0.5);

  //fg.scale.x = _scale;
  //fg.scale.y = _scale;
  //fg.width  = 432*_scale;
  //fg.height = 720*_scale;

  container.addChild(fg);

  if (typeof _img_suit !== "undefined") {
    //var st = PIXI.Sprite.from('img/10-WHEEL_of_FORTUNE_st.png');
    //var st = PIXI.Sprite.from('img/st.png');
    var st = PIXI.Sprite.from(_img_suit);
    //var st = PIXI.Sprite.from(_img_txt);
    st.anchor.set(0.5);
    container.addChild(st);
  }

  if (typeof _img_text !== "undefined") {
    var txt = PIXI.Sprite.from(_img_text);
    //var st = PIXI.Sprite.from(_img_txt);
    txt.anchor.set(0.5);
    container.addChild(txt);
  }

  //st.scale.x = _scale;
  //st.scale.y = _scale;
  //st.width = 432*_scale;
  //st.height = 720*_scale;


  app.stage.addChild(container);



  /*
  // let's create a moving shape
  const thing = new PIXI.Graphics();
  app.stage.addChild(thing);
  thing.x = app.screen.width / 2;
  thing.y = app.screen.height / 2;
  thing.lineStyle(0);

  container.mask = thing;


  app.stage.on('pointertap', () => {
    if (!container.mask) { container.mask = thing; }
    else { container.mask = null; }
  });
  */

  /*
  const help = new PIXI.Text('Click or tap to turn masking on / off.', {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: 'bold',
    fill: 'white',
  });

  help.y = app.screen.height - 26;
  help.x = 10;
  app.stage.addChild(help);
  */


  g_data["app"] = app;
  g_data["bg"] = bg;
  g_data["fg"] = fg;
  g_data["st"] = st;

  let count = 0;

  //app.ticker.add(() => {
  //app.ticker.add( (function(_x) {
  app.ticker.add( (function(_freq0, _freq1, _freq2) {
    return function() {

      //var f = g_data.rnd[3*_x];
      var f = _freq0;

      fg.y = Math.sin(f*count)*10;
      count += 0.025;

      //fx = g_data.rnd[3*_x + 1];
      //fy = g_data.rnd[3*_x + 2];
      var fx = _freq1;
      var fy = _freq2;

      //bg.width = 1440/2;
      //bg.height= 1440/2;
      bg.x = Math.sin(fx*count/2 + (Math.PI/21.0) )*20;
      bg.y = 100+Math.sin(fy*count/2 + (Math.PI/21.0) + (Math.PI/4.0) )*20;

    };
  })(g_data.rnd[0], g_data.rnd[1], g_data.rnd[2]));
  //})(g_data.rnd[3*idx], g_data.rnd[3*idx+1], g_data.rnd[3*idx+2]));

  var bg_w = bg.width,
      bg_h = bg.height;
  console.log("??", bg_w, bg_h, bg);


}

function init() {
  for (var ii=0; ii<10; ii++) {
    var ui_id = "ui_card" + ii.toString() + "_canvas";
    init_card_canvas(ui_id, ii);
  }
}

//init();
