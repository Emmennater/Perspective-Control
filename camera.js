/*
  FOV = distanceFromMonitor & screenSize
  FOVX & FOVY
*/

class Camera {
  /*
    Units:
    ~ Distance: Inches
    ~ Angle:    Radians
  */

  constructor(x = 0, y = -25.8, z = 0) {
    // Camera position
    this.x = x;
    this.y = y;
    this.z = z;

    // Viewport
    this.vp = new Viewport();
    this.far = 1000;

    // print(SCREEN_WIDTH + "\" x " + SCREEN_HEIGHT + "\"");

    // Calculate angles to viewport
    this.calcViewportAngles();
  }

  calcViewportAngles() {
    this.vpBL = vectorToXYZ(this, this.vp.vert[0]);
    this.vpBR = vectorToXYZ(this, this.vp.vert[1]);
    this.vpTR = vectorToXYZ(this, this.vp.vert[2]);
    this.vpTL = vectorToXYZ(this, this.vp.vert[3]);
    this.fov = vAngleBetween(this.vpTR, this.vpTL);
  }

  move(x = this.x, y = this.y, z = this.z) {
    this.x = x;
    this.y = y;
    this.z = z;

    // Updates
    this.calcViewportAngles();
  }
}

class Viewport {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = SCREEN_WIDTH;
    this.h = SCREEN_HEIGHT;
    this.vert = [
      { x: this.x - this.w / 2, y: this.y, z: this.z - this.h / 2 },
      { x: this.x + this.w / 2, y: this.y, z: this.z - this.h / 2 },
      { x: this.x + this.w / 2, y: this.y, z: this.z + this.h / 2 },
      { x: this.x - this.w / 2, y: this.y, z: this.z + this.h / 2 },
    ];
  }
}

/*



























*/
