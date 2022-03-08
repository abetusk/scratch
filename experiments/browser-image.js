// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
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

draw();

function draw() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.log("len:", imageData.data.length);
  for (var i=0; i<imageData.data.length; i+=4) {
    imageData.data[i] = 255;
    imageData.data[i+1] = 0;
    imageData.data[i+2] = 0;
    imageData.data[i+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0, 0, 0, 300, 227);
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
