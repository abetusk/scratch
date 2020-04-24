// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
//
// where possible, this is licensed under CC0
//

/*
var img = new Image(300,227);
//img.src = './rhino.jpg';
//img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
img.src = 'data:,';
img.onload = function() {
  draw_img(this);
};
//draw(img);
*/

draw('canvas_real');
draw('canvas_imag');
draw('canvas_pow');

function gabor_filter_real(x,y,lambda,theta,psi,sigma,gamma) {
  var _x = x*Math.cos(theta) + y*Math.sin(theta);
  var _y = -x*Math.sin(theta) + y*Math.cos(theta);

  var val = Math.exp( - ((_x*_x) + (gamma*gamma*_y*_y)) / (2.0*sigma*sigma) ) *
    Math.cos( 2.0*Math.PI*(_x/lambda) + psi );

  return val;
}

function gabor_filter_imag(x,y,lambda,theta,psi,sigma,gamma) {
  var _x = x*Math.cos(theta) + y*Math.sin(theta);
  var _y = -x*Math.sin(theta) + y*Math.cos(theta);

  var val = Math.exp( - ((_x*_x) + (gamma*gamma*_y*_y)) / (2.0*sigma*sigma) ) *
    Math.sin( 2.0*Math.PI*(_x/lambda) + psi );

  return val;
}

function gabor_filter_pow(x,y,lambda,theta,psi,sigma,gamma) {
  var _re, _im;

  _re = gabor_filter_real(x,y,lambda,theta,psi,sigma,gamma);
  _im = gabor_filter_imag(x,y,lambda,theta,psi,sigma,gamma);

  return Math.sqrt(_re*_re + _im*_im);
}

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately/54024653#54024653
// https://stackoverflow.com/users/860099/kamil-kie%c5%82czewski
// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
//
function hsv2rgb(h,s,v) {                              
  let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];       
}   

// https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
// https://stackoverflow.com/users/166491/mic
//
function rgb2hsv (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}

function _clamp(val,_m, _M) {
  if (val < _m) { return _m; }
  if (val > _M) { return _M; }
  return val;
}

var default_opt = {
  "img_center" : [127,127],
  "img_scale" : [ 1.0/128.0, 1.0/128.0 ],
  "lambda" : 0.25,
  "theta" : 0.3 * 2.0 * Math.PI,
  "psi" : 0.1 * 2.0 * Math.PI,
  //"sigma": 1.2,
  "sigma": 1.0/10.0,
  "gamma" : 1.1
};

function draw_gabor_func_complex(opt) {
  var _w,_h, val, ival;
  var x,y, _ang, _r;
  var val_r, val_i;
  var _rgb;

  var canvas_name = "canvas_complex";
  var canvas, ctx, imageData, data;

  canvas = document.getElementById(canvas_name);
  ctx = canvas.getContext('2d');
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;

  _w = canvas.width;
  _h = canvas.height;

  console.log(_w, _h);
  console.log(data.length);

  for (var ii=0; ii<_h; ii++) {
    for (var jj=0; jj<_w; jj++) {
      pos = 4*((ii*_w) + jj);

      x = (jj - opt.img_center[0]) * opt.img_scale[0];
      y = (ii - opt.img_center[1]) * opt.img_scale[1];

      //val = gabor_filter_real(x,y,opt.lambda,opt.theta,opt.psi,opt.sigma,opt.gamma);
      val_r = gabor_filter_real(x,y,opt.lambda,opt.theta,opt.psi,opt.sigma,opt.gamma);
      val_i = gabor_filter_imag(x,y,opt.lambda,opt.theta,opt.psi,opt.sigma,opt.gamma);

      _ang = Math.atan2(val_i, val_r);
      _r = Math.sqrt(val_r*val_r + val_i*val_i);

      _ang = _clamp(360.0*(_ang + Math.PI)/(2.0*Math.PI), 0, 360);
      _r = _clamp(_r, 0,1);

      _rgb = hsv2rgb( _ang, 1.0-_r, _r );
      //_rgb = hsv2rgb( _ang, _r, _r );
      //_rgb = hsv2rgb( _ang, 1.0, _r );
      //_rgb = hsv2rgb( _ang, _r, 1.0);

      ival = _clamp(Math.floor(255.0*(val + 1.0)/2.0), 0, 255);
      data[pos]   = _clamp(_rgb[0]*255.0, 0, 255);
      data[pos+1] = _clamp(_rgb[1]*255.0, 0, 255);
      data[pos+2] = _clamp(_rgb[2]*255.0, 0, 255);
      data[pos+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function draw_gabor_func(opt) {
  var _w,_h, val, ival;
  var x,y;

  var canvas_names = ["canvas_real", "canvas_imag", "canvas_pow"];
  var gfunc = [ gabor_filter_real, gabor_filter_imag, gabor_filter_pow ];

  var canvas, ctx, imageData, data;
  var _func;

  for (var name_idx=0; name_idx < canvas_names.length; name_idx++) {
    canvas = document.getElementById(canvas_names[name_idx]);
    ctx = canvas.getContext('2d');
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;

    _func = gfunc[name_idx];

    _w = canvas.width;
    _h = canvas.height;

    console.log(_w, _h);
    console.log(data.length);

    for (var ii=0; ii<_h; ii++) {
      for (var jj=0; jj<_w; jj++) {
        pos = 4*((ii*_w) + jj);

        x = (jj - opt.img_center[0]) * opt.img_scale[0];
        y = (ii - opt.img_center[1]) * opt.img_scale[1];

        //val = gabor_filter_real(x,y,opt.lambda,opt.theta,opt.psi,opt.sigma,opt.gamma);
        val = _func(x,y,opt.lambda,opt.theta,opt.psi,opt.sigma,opt.gamma);

        ival = _clamp(Math.floor(255.0*(val + 1.0)/2.0), 0, 255);
        data[pos] = ival;
        data[pos+1] = ival;
        data[pos+2] = ival;
        data[pos+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

function draw(canvas_name) {
  var canvas = document.getElementById(canvas_name);
  var ctx = canvas.getContext('2d');
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.log("len:", imageData.data.length);
  for (var i=0; i<imageData.data.length; i+=4) {
    imageData.data[i] = 255;
    imageData.data[i+1] = 0;
    imageData.data[i+2] = 0;
    imageData.data[i+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  console.log("??");
}

function draw_img(img) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  img.style.display = 'none';
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  console.log("len:", data.length);
  for (var i=0; i<data.length; i+=4) {
    //data[i] = (i)%255;
    //data[i+1] = (2*i)%255;
    //data[i+2] = (3*i)%255;
    data[i] = 255;
    data[i+1] = 255;
    data[i+2] = 255;
    data[i+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  console.log("??");

    
  var invert = function() {
    for (var i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscale = function() {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var invertbtn = document.getElementById('invertbtn');
  invertbtn.addEventListener('click', invert);
  var grayscalebtn = document.getElementById('grayscalebtn');
  grayscalebtn.addEventListener('click', grayscale);
}
