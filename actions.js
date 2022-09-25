
keys = [];

function keyPressed() {
  keys[key] = true;
  
  if (key == "`") {
    let fs = fullscreen();
    fullscreen(!fs);
    data.fullscreen = fs;
  }

  if (key == "x") {
    setXDivRatio();
  }

  if (key == "y") {
    setYDivRatio();
  }
}

function keyReleased() {
  keys[key] = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
