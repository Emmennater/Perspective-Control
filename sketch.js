/*
  Press grave to toggle fullscreen : `
*/

/**********************/
/*      DETAILS       */
/**********************/

const PI = 3.14159265359;
const HEAD_WIDTH = 7.8; // inches
const WEBCAM_FOV = 78 * (PI / 180); // radians

/**********************/
/*    FACE TRACKER    */
/**********************/

let info = null, landmarks = null;

function startVideo() {
  navigator.getUserMedia({
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function setupVideo() {
  video = document.getElementById('video')
  startVideo(video)

  video.addEventListener('play', () => {
    const displaySize = {
      width: video.width,
      height: video.height
    }
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      info = detections;
    }, 100)
  })
}

/**********************/
/*    MAIN PROGRAM    */
/**********************/

function setup() {

  // Setup video and eye tracking
  let modelsUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelsUrl + 'tiny_face_detector_model-weights_manifest.json'),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelsUrl + 'face_landmark_68_model-weights_manifest.json'),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelsUrl + 'face_recognition_model-weights_manifest.json'),
    faceapi.nets.faceExpressionNet.loadFromUri(modelsUrl + 'face_expression_model-weights_manifest.json')  
  ]).then(setupVideo)

  // Resume
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

  // Eye tracking fine tuning (adjusting)
  DEF_X_DIV_RATIO = 32.738221303859284;
  DEF_Z_DIV_RATIO = 33.2373100389952;
  X_DIV_RATIO = DEF_X_DIV_RATIO; // 32.585566103783;
  Z_DIV_RATIO = DEF_Z_DIV_RATIO; // 35.918339113960144;
  X_OFFSET = -77.59896304945896;
  Z_OFFSET = -74.81295890893206;
}

function draw() {
  background(0);

  updateLandmarks();

  if (landmarks) {
    updateHead3DSpace();
    // let iris = getIris();
    // if (iris != null) {
    //   DATA.headX = (-iris.center.x) / X_DIV_RATIO + X_OFFSET;
    //   DATA.headY = iris.center.y;
    //   DATA.headZ = (-iris.center.z) / Z_DIV_RATIO + Z_OFFSET;
    // }
  }

  if (DATA.headX) {
    DATA.camX = lerp(DATA.camX, DATA.headX, 0.1);
    DATA.camY = lerp(DATA.camY, DATA.headY, 0.1);
    DATA.camZ = lerp(DATA.camZ, DATA.headZ, 0.1);
    Cam.move(DATA.camX, DATA.camY, DATA.camZ);
    Engine.update();
  }

  Engine.run();
  Overlay.run();

  // World.objects[0].move(null, sin(frameCount/50) * 10, null);
  // World.objects[0].move(cos(frameCount/40) * 5, sin(frameCount/30) * 4 + 4, sin(frameCount/40) * 2);
  World.objects[World.objects.length - 1].move(null, null, null, frameCount / 100, frameCount / 100 + 50);
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
    center: CENTER,
    eyeToEye: DIST
  };
}

function setXDivRatio() {
  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      // let x = abs(iris.center.x);
      // DATA.headX = (-iris.center.x) / X_DIV_RATIO + X_OFFSET;
      
      let x = abs(DATA.headX);
      X_DIV_RATIO = x / (SCREEN_WIDTH / 2);
    }
  }
}

function setZDivRatio() {
  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      // let z = abs(iris.center.z);
      
      let z = abs(DATA.headZ);
      Z_DIV_RATIO = z / (SCREEN_HEIGHT / 2);
    }
  }
}

function setCenter() {
  if (landmarks) {
    let iris = getIris();
    if (iris != null) {
      // Reset these
      X_DIV_RATIO = 1;
      Z_DIV_RATIO = 1;

      // Calibrate x and z
      let x = iris.center.x;
      let z = iris.center.z;
      X_OFFSET = -iris.center.x;
      Z_OFFSET = -iris.center.z;
      
      // let x = iris.center.x / X_DIV_RATIO;
      // let z = iris.center.z / Z_DIV_RATIO;
      // X_OFFSET = x;
      // Y_OFFSET = z;
    }
  }
}

function resetCalibration() {
  X_OFFSET = 0;
  Y_OFFSET = 0;
  X_DIV_RATIO = 1;
  Z_DIV_RATIO = 1;
}

function updateHead3DSpace() {
  let x, y, z;

  // Get eye position on video
  let iris = getIris();
  if (iris == null) return;

  // Find distance from head to camera
  let D = (HEAD_WIDTH * WEBCAM_FOV) * (video.width / iris.eyeToEye)
    /* fine tuning */ * 0.5 - 4;
  
  // print("Distance: "+D+"\"");

  // X & Y Values
  let cx = iris.center.x + X_OFFSET;
  let headAngle = cx / (video.width / 2) * WEBCAM_FOV;
  y = D;
  x = cx;
  // y = cos(headAngle) * D;
  // x = sin(headAngle) * D;

  // Z Value
  let cz = iris.center.z + Z_OFFSET;
  z = cz;
  // headAngle = cz / (video.height / 2) * WEBCAM_FOV;
  // z = sin(headAngle) * D;

  DATA.headX = -x / X_DIV_RATIO;
  DATA.headY = -y / 1.2 - 5;
  DATA.headZ = -z / Z_DIV_RATIO;
  
  // print("("+x+","+y+","+z+")");

}

/*






















*/