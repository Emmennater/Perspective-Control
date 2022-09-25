class Projection {
  constructor() {
    this.dataPoints = [];

    // Initialize the Canvas
    this.RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
    this.SIZE = displayWidth;
    this.miniSize = 640;
    this.width = this.SIZE;
    this.height = this.SIZE / this.RATIO;
    this.graphic = createGraphics(this.width, this.height);
  }

  init() {
    this.update();
  }

  update() {
    this.castAll();
    this.illuminate();
  }

  run() {
    this.drawObjects();
  }

  drawObjects() {
    const G = this.graphic;
    const MAG = this.SIZE / displayWidth;
    const SCLR = MAG * PPI;

    G.background(0);
    
    // Draw border
    if (!fullscreen()) {
      G.noFill();
      G.stroke(90);
      G.strokeWeight(4);
      G.rect(0, -1, G.width, G.height+1);
    }
    
    G.push();
    G.translate(G.width / 2, G.height / 2);
    G.scale(1, -1);
    
    let TRIS = [];
    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        TRIS.push(tris[j]);
      }
    }

    // Sort triangles
    TRIS.sort(function (a, b) {
      let AD = sqrt(
        (a.center.x - Cam.x) ** 2 +
          (a.center.y - Cam.y) ** 2 +
          (a.center.z - Cam.z) ** 2
      );
      let BD = sqrt(
        (b.center.x - Cam.x) ** 2 +
          (b.center.y - Cam.y) ** 2 +
          (b.center.z - Cam.z) ** 2
      );
      return BD - AD;
    });

    // Draw triangles
    for (let i in TRIS) {
      let pts = [TRIS[i].p1, TRIS[i].p2, TRIS[i].p3];
      let tri = TRIS[i];

      if (
        tri.normal.x * (tri.p1.x - Cam.x) +
          tri.normal.y * (tri.p1.y - Cam.y) +
          tri.normal.z * (tri.p1.z - Cam.z) <
        0
      ) {
      } else continue;

      G.fill(tri.col);
      G.stroke(tri.col);
      G.strokeWeight(1);
      G.beginShape();
      for (let k in pts) {
        let pt = pts[k].planeIntersect;
        if (pt == null) continue;
        G.vertex(pt.x * SCLR, pt.y * SCLR);
      }
      G.endShape(CLOSE);
    }
    G.pop();

    if (!fullscreen())
      image(G, 0, Overlay.height, this.miniSize, this.miniSize / this.RATIO);
    else image(G, 0, 0, width, height);
  }

  castAll() {
    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        tris[j].p1.planeIntersect = null;
        tris[j].p2.planeIntersect = null;
        tris[j].p3.planeIntersect = null;
        tris[j].p1.calculated = false;
        tris[j].p2.calculated = false;
        tris[j].p3.calculated = false;
      }
    }

    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        // Determine if this triangle is facing the camera
        if (
          tris[j].normal.x * (tris[j].p1.x - Cam.x) +
          tris[j].normal.y * (tris[j].p1.y - Cam.y) +
          tris[j].normal.z * (tris[j].p1.z - Cam.z) >= 0
        ) continue;

        this.castPoint(tris[j].p1);
        this.castPoint(tris[j].p2);
        this.castPoint(tris[j].p3);
      }
    }
  }

  castPoint(pt) {
    if (pt.calculated) return;

    // See if line casted to point clips through viewport
    // If so... where
    let result = vectorPlaneIntersect(
      { x: Cam.x, y: Cam.y, z: Cam.z },
      { x: pt.x, y: pt.y, z: pt.z },
      Cam.vp.vert[0],
      Cam.vp.vert[1],
      Cam.vp.vert[2]
    );

    pt.calculated = true;
    if (result == null) return;

    // Since the plane is stationary and perpendicular to the origin
    // We dont have to do anything fancy here...
    let pt2D = { x: result.x, y: result.z };

    // Store intersection in point
    pt.planeIntersect = pt2D;
  }

  light(dir, normal, col) {
    let newCol = 0;
    let light_dir = getNormal(dir);
    let dp = 1 - v3Dot(normal, light_dir);
    return color(red(col) * dp, green(col) * dp, blue(col) * dp);
  }

  illuminate() {
    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        //Light 1
        let dir = { x: -0.5, y: 1, z: 0 };
        let col = color(70);
        let col2 = this.light(dir, tris[j].normal, col);
        tris[j].col = col2;
      }
    }

    // Ambiance
    let AMB = color(20);
    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        let col = tris[j].col;
        tris[j].col = color(
          max(red(AMB), red(col)),
          max(green(AMB), green(col)),
          max(blue(AMB), blue(col))
        );
      }
    }
  }

  updateObject(obj) {
    // Casting
    let tris = obj.tris;
    for (let i in tris) {
      tris[i].p1.planeIntersect = null;
      tris[i].p2.planeIntersect = null;
      tris[i].p3.planeIntersect = null;
      tris[i].p1.calculated = false;
      tris[i].p2.calculated = false;
      tris[i].p3.calculated = false;
    }
    for (let i in tris) {
      if (
        tris[i].normal.x * (tris[i].p1.x - Cam.x) +
        tris[i].normal.y * (tris[i].p1.y - Cam.y) +
        tris[i].normal.z * (tris[i].p1.z - Cam.z) >= 0
      ) continue;

      this.castPoint(tris[i].p1);
      this.castPoint(tris[i].p2);
      this.castPoint(tris[i].p3);
    }

    // Lighting
    tris = obj.tris;
    for (let i in tris) {
      //Light 1
      let dir = { x: -0.5, y: 1, z: 0 };
      let col = color(70);
      let col2 = this.light(dir, tris[i].normal, col);
      tris[i].col = col2;
    }
    let AMB = color(20);
    for (let i in tris) {
      let col = tris[i].col;
      tris[i].col = color(
        max(red(AMB), red(col)),
        max(green(AMB), green(col)),
        max(blue(AMB), blue(col))
      );
    }
  }
}

/*
























*/
