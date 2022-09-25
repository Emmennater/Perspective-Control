/*
  Press grave to toggle fullscreen : `
*/

/**********************/
/*    FACE TRACKER    */
/**********************/

video = document.getElementById('video')
let info = null,
  landmarks = null;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia({
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

/**********************/
/*    MAIN PROGRAM    */
/**********************/

function setup() {
  data = [];
  DATA = {
    camX: 0,
    camY: -20,
    camZ: 0,
    pupilD: 2
  };

  // Initialize the Canvas
  RATIO = 1920 / 1080;
  SIZE = 1920; // windowWidth;
  PPI = round((displayDensity() / (0.9 / 96)) * 10000) / 10000;
  createCanvas(SIZE, (SIZE / RATIO) * 2);
  background(0);

  // Calculate screen width & height
  SCREEN_WIDTH = displayWidth / PPI;
  SCREEN_HEIGHT = displayHeight / PPI;

  // Initialize elements
  World = new Scene();
  Overlay = new WorldMap();
  Cam = new Camera();
  Engine = new Projection();

  World.init();
  Engine.init();
  // Engine.run();

  video.addEventListener('play', () => {
    // const canvas = faceapi.createCanvasFromMedia(video)
    // document.body.append(canvas)
    const displaySize = {
      width: video.width,
      height: video.height
    }
    // faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      info = detections;

      // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      // faceapi.draw.drawDetections(canvas, resizedDetections)
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
  });

  X_DIV_RATIO = 32.585566103783;
  Y_DIV_RATIO = 35.918339113960144;
}

function draw() {
  background(0);

  updateLandmarks();

  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      DATA.headX = -iris.center.x/X_DIV_RATIO;
      DATA.headY = iris.center.y;
      DATA.headZ = -iris.center.z/Y_DIV_RATIO;
    }
  }

  if (DATA.headX) {
    DATA.camX = lerp(DATA.camX, DATA.headX, 0.1);
    DATA.camY = lerp(DATA.camY, DATA.headY, 0.02);
    DATA.camZ = lerp(DATA.camZ, DATA.headZ, 0.1);
    Cam.move(DATA.camX, DATA.camY, DATA.camZ);
    Engine.update();
  }

  Engine.run();
  Overlay.run();

  // World.objects[0].move(null, sin(frameCount/50) * 10, null);
  // World.objects[0].move(cos(frameCount/40) * 5, sin(frameCount/30) * 4 + 4, sin(frameCount/40) * 2);
  World.objects[World.objects.length-1].move(null, null, null, frameCount / 100, frameCount / 100 + 50);
}

/**********************/
/*    FACE TRACKER    */
/**********************/

function updateLandmarks() {
  if (!info || !info[0]) return null;
  landmarks = info[0].landmarks._positions;
}

function getIris() {
  if (!landmarks) return null;

  let AVGR = {
    x: 0,
    y: 0,
    z: 0,
    t: 0
  };
  let AVGL = {
    x: 0,
    y: 0,
    z: 0,
    t: 0
  };

  for (let i = 36; i <= 41; i++) {
    AVGR.x += landmarks[i].x - video.width / 2;
    AVGR.z += landmarks[i].y - video.height / 2;
    AVGR.t++;
  }

  for (let i = 42; i <= 47; i++) {
    AVGL.x += landmarks[i].x - video.width / 2;
    AVGL.z += landmarks[i].y - video.height / 2;
    AVGL.t++;
  }

  let RIGHT = {
    x: AVGR.x / AVGR.t,
    z: AVGR.z / AVGR.t
  };
  let LEFT = {
    x: AVGL.x / AVGL.t,
    z: AVGL.z / AVGL.t
  };
  
  // DATA.pupilDist = abs(LEFT.z - RIGHT.z);
  // DATA.pupilDist = constrain(DATA.pupilDist, 1, 7);
  // DATA.pupilD = lerp(DATA.pupilD, DATA.pupilDist, 0.1);

  // let Y = -1/(DATA.pupilD**2)*10 - 15;

  // dist between pts 0 and 16
  let DIST = dist(
    landmarks[0].x, landmarks[0].y,
    landmarks[16].x, landmarks[16].y
  );

  let HEAD_DIST = (1 / DIST) * 2500;

  let CENTER = {
    x: (RIGHT.x + LEFT.x) / 2,
    y: -HEAD_DIST,
    z: (RIGHT.z + LEFT.z) / 2
  };

  return {
    right: RIGHT,
    left: LEFT,
    center: CENTER
  };
}

function setXDivRatio() {
  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      let x = -iris.center.x;
      X_DIV_RATIO = x / (SCREEN_WIDTH / 2);
    }
  }
}

function setYDivRatio() {
  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      let y = -iris.center.y;
      Y_DIV_RATIO = y / (SCREEN_HEIGHT / 2);
    }
  }
}

/*






















*/