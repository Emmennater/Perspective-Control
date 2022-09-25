class Scene {
  constructor() {
    this.objects = [];
  }

  init() {
    this.objects.push(new Box(-1, 2, -1, 2, 2, 2));
    this.objects.push(new Box(-9, 0, -5, 4, 4, 4));
    this.objects.push(new Box(4, 8, -4, 4, 4, 4));
    this.objects.push(new Box(-10, 0, -5, 1, 15, 8));
    this.objects.push(new Box(9, 0, -5, 1, 5, 8));
    this.objects.push(new Box(-10, 15, -5, 20, 1, 8));
  }
}

class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    // Store calculations in here for later
    this.planeIntersect = null;
    this.calculated = false;
  }
}

class Triangle {
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.col = color(0);
    this.update();
  }
  
  update() {
    let p1 = this.p1, p2 = this.p2, p3 = this.p3;
    this.normal = getPlaneNormalVector(p1, p2, p3);
    this.center = {
      x: (p1.x + p2.x + p3.x) / 3,
      y: (p1.y + p2.y + p3.y) / 3,
      z: (p1.z + p2.z + p3.z) / 3
    };
  }
}

class Box {
  constructor(x, y, z, l, w, h) {
    this.x = x + l/2;
    this.y = y + w/2;
    this.z = z + h/2;
    this.l = l;
    this.w = w;
    this.h = h;
    this.rotX = 0;
    this.rotZ = 0;
    this.tris = [];
    this.verts = [];
    this.map_verticies = [];
    this.init();
  }

  init() {
    // Create 8 verticies (reusable)
    for (let i=0; i<8; i++)
      this.verts[i] = new Point();
    
    this.update();

    // Create 6 faces (12 triangles)
    this.tris = this.tris.concat(
      createFace(this.verts[0], this.verts[1], this.verts[2], this.verts[3])
    );
    this.tris = this.tris.concat(
      createFace(this.verts[1], this.verts[5], this.verts[6], this.verts[2])
    );
    this.tris = this.tris.concat(
      createFace(this.verts[5], this.verts[4], this.verts[7], this.verts[6])
    );
    this.tris = this.tris.concat(
      createFace(this.verts[4], this.verts[0], this.verts[3], this.verts[7])
    );
    this.tris = this.tris.concat(
      createFace(this.verts[4], this.verts[5], this.verts[1], this.verts[0])
    );
    this.tris = this.tris.concat(
      createFace(this.verts[3], this.verts[2], this.verts[6], this.verts[7])
    );

    this.map_verticies[0] = { x: this.x - this.l / 2, y: this.y - this.w / 2 };
    this.map_verticies[1] = { x: this.x + this.l / 2, y: this.y - this.w / 2 };
    this.map_verticies[2] = { x: this.x + this.l / 2, y: this.y + this.w / 2 };
    this.map_verticies[3] = { x: this.x - this.l / 2, y: this.y + this.w / 2 };
  }
  
  update() {
    // Set verticies
    this.verts[0].x = - this.l / 2;
    this.verts[0].y = - this.w / 2;
    this.verts[0].z = - this.h / 2;
    
    this.verts[1].x = + this.l / 2;
    this.verts[1].y = - this.w / 2;
    this.verts[1].z = - this.h / 2;
    
    this.verts[2].x = + this.l / 2;
    this.verts[2].y = - this.w / 2;
    this.verts[2].z = + this.h / 2;
    
    this.verts[3].x = - this.l / 2;
    this.verts[3].y = - this.w / 2;
    this.verts[3].z = + this.h / 2;
    
    this.verts[4].x = - this.l / 2;
    this.verts[4].y = + this.w / 2;
    this.verts[4].z = - this.h / 2;
    
    this.verts[5].x = + this.l / 2;
    this.verts[5].y = + this.w / 2;
    this.verts[5].z = - this.h / 2;
    
    this.verts[6].x = + this.l / 2;
    this.verts[6].y = + this.w / 2;
    this.verts[6].z = + this.h / 2;
    
    this.verts[7].x = - this.l / 2;
    this.verts[7].y = + this.w / 2;
    this.verts[7].z = + this.h / 2;
    
    // Rotate
    rotateObjectX(this, this.rotX);
    rotateObjectZ(this, this.rotZ);
    
    // Translate
    translateObject(this, this.x, this.y, this.z);
    
    // Update triangles
    for (let i in this.tris) {
      this.tris[i].update();
    }
  }
  
  move(x, y, z, rx, rz) {
    this.x = x == null ? this.x : x;
    this.y = y == null ? this.y : y;
    this.z = z == null ? this.z : z;
    this.rotX = rx == null ? this.rotX : rx;
    this.rotZ = rz == null ? this.rotZ : rz;
    
    this.update();
    
    // this.map_verticies[0] = { x: this.x - this.l / 2, y: this.y - this.w / 2 };
    // this.map_verticies[1] = { x: this.x + this.l / 2, y: this.y - this.w / 2 };
    // this.map_verticies[2] = { x: this.x + this.l / 2, y: this.y + this.w / 2 };
    // this.map_verticies[3] = { x: this.x - this.l / 2, y: this.y + this.w / 2 };
    
    Engine.updateObject(this);
  }
}

function createFace(p1, p2, p3, p4) {
  return [new Triangle(p1, p2, p3), new Triangle(p3, p4, p1)];
}

/*























*/
