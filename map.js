class WorldMap {
  constructor() {
    this.SCL = 0.05 * PPI;

    // Initialize the Canvas
    let RATIO = 1920 / 1080;
    let SIZE = 640;
    this.width = SIZE;
    this.height = SIZE / RATIO;
    this.graphic = createGraphics(this.width, this.height);
  }

  run() {
    if (!this.visible) return;
    this.interact();
    this.drawOverlay();
  }

  interact() {
    const SCL = this.SCL;
    const G = this.graphic;

    // Only if mouse over canvas
    if (mouseX < 0 || mouseY < 0 || mouseX >= G.width || mouseY >= G.height)
      return;

    let MX = mouseX - G.width / 2;
    let MY = -(mouseY - G.height / 2);

    // Drag to move camera
    if (mouseIsPressed) {
      Cam.move(MX / SCL, MY / SCL);
      Engine.update();
    }
  }

  drawOverlay(x, y) {
    const SCL = this.SCL;
    const G = this.graphic;

    // Draw border
    G.background(0);
    G.noFill();
    G.stroke(90);
    G.strokeWeight(2);
    G.rect(0, 0, G.width, G.height);

    G.push();
    G.translate(G.width / 2, G.height / 2);
    G.scale(SCL, -SCL);

    // Draw cam pos
    G.fill(80, 180, 80);
    G.stroke(20, 90, 20);
    G.strokeWeight(1 / SCL);
    G.circle(Cam.x, Cam.y, 8 / SCL);

    // Draw viewport
    G.stroke(180);
    G.strokeWeight(2 / SCL);
    G.line(
      Cam.vp.x - Cam.vp.w / 2,
      Cam.vp.y,
      Cam.vp.x + Cam.vp.w / 2,
      Cam.vp.y
    );
    
    // Draw VP intersects
    G.noFill();
    G.stroke(255, 0, 0);
    G.strokeWeight(4 / SCL);
    for (let i in World.objects) {
      let tris = World.objects[i].tris;
      for (let j in tris) {
        let pts = [tris[j].p1, tris[j].p2, tris[j].p3];
        for (let k in pts) {
          let pt = pts[k].planeIntersect;
          if (pt == null) continue;
          G.point(pt.x, Cam.vp.y);
        }
      }
    }

    // Draw lines to viewport
    G.stroke(180);
    G.strokeWeight(1 / SCL);
    G.line(
      Cam.x,
      Cam.y,
      Cam.x + Cam.vpTL.x * Cam.far,
      Cam.y + Cam.vpTL.y * Cam.far
    );
    G.line(
      Cam.x,
      Cam.y,
      Cam.x + Cam.vpTR.x * Cam.far,
      Cam.y + Cam.vpTR.y * Cam.far
    );

    // Draw world objects
    G.fill(180);
    G.stroke(100);
    G.strokeWeight(1 / SCL);
    for (let i in World.objects) {
      let pts = World.objects[i].map_verticies;
      G.beginShape();
      for (let j in pts) {
        G.vertex(pts[j].x, pts[j].y);
      }
      G.endShape(CLOSE);
    }

    G.pop();

    image(G, 0, 0);
  }
}

/*
























*/
