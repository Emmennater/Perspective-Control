function getNormal(obj) {
  let MAX = -Infinity;
  for (let i in obj) MAX = abs(obj[i]) > MAX ? abs(obj[i]) : MAX;
  for (let i in obj) obj[i] /= MAX;
  return obj;
}

function vectorTo(x1, y1, x2, y2) {
  return getNormal({ x: x2 - x1, y: y2 - y1 });
}

function vectorToXY(p1, p2) {
  return getNormal({ x: p2.x - p1.x, y: p2.y - p1.y });
}

function vectorToXZ(p1, p2) {
  return getNormal({ x: p2.x - p1.x, z: p2.z - p1.z });
}

function vectorToXYZ(p1, p2) {
  return getNormal({ x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z });
}

function vDot(A, B) {
  return A.x * B.x + A.y * B.y;
}

function v3Dot(A, B) {
  return A.x * B.x + A.y * B.y + A.z * B.z;
}

function v2Mag(v) {
  return sqrt(v.x ** 2 + v.y ** 2);
}

function v3Cross(U, V) {
  return {
    x: U.y * V.z - U.z * V.y,
    y: U.z * V.x - U.x * V.z,
    z: U.x * V.y - U.y * V.x,
  };
}

function v3Mult(V, n) {
  return {
    x: V.x * n,
    y: V.y * n,
    z: V.z * n,
  };
}

function v3Add(U, V) {
  return {
    x: U.x + V.x,
    y: U.y + V.y,
    z: U.z + V.z,
  };
}

function v3Neg(V) {
  return {
    x: -V.x,
    y: -V.y,
    z: -V.z,
  };
}

function vAngleBetween(A, B) {
  return acos(vDot(A, B) / (v2Mag(A) * v2Mag(B)));
}

function getPlaneNormalVector(p1, p2, p3) {
  let a = vectorToXYZ(p1, p2);
  let b = vectorToXYZ(p1, p3);
  return v3Cross(a, b);
}

function vectorPlaneIntersect(rayP, rayT, p1, p2, p3) {
  let planeP = p1;
  let rayD = getNormal(vectorToXYZ(rayP, rayT)); // Make sure direction is normalized
  let planeN = getPlaneNormalVector(p1, p2, p3);

  let denom = v3Dot(rayD, planeN);
  if (abs(denom) < 0.0001) return null;
  let d = v3Dot(planeP, v3Neg(planeN));
  let t = -(d + v3Dot(rayP, planeN)) / denom;
  return v3Add(rayP, v3Mult(rayD, t));
}

function multiplyMatrixVector(v, m) {
  //v = vec3d and m = mat4x4
  var o = {};
  o.x = v.x * m[0][0] + v.y * m[1][0] + v.z * m[2][0] + m[3][0];
  o.y = v.x * m[0][1] + v.y * m[1][1] + v.z * m[2][1] + m[3][1];
  o.z = v.x * m[0][2] + v.y * m[1][2] + v.z * m[2][2] + m[3][2];
  var w = v.x * m[0][3] + v.y * m[1][3] + v.z * m[2][3] + m[3][3];

  if (w !== 0) {
    o.x /= w;
    o.y /= w;
    o.z /= w;
  }

  return o;
}

function rotateObjectX(obj, theta) {
  //Matrix Rotate X
  var matRotX = [];
  for (var i = 0; i < 4; i++) {
    matRotX[i] = [];
    for (var j = 0; j < 4; j++) {
      matRotX[i][j] = 0;
    }
  }
  matRotX[0][0] = 1.0;
  matRotX[1][1] = cos(theta);
  matRotX[1][2] = sin(theta);
  matRotX[2][1] = -sin(theta);
  matRotX[2][2] = cos(theta);
  matRotX[3][3] = 1.0;

  for (let i in obj.verts) {
    let vert = obj.verts[i];
    let newV = multiplyMatrixVector(vert, matRotX);
    vert.x = newV.x;
    vert.y = newV.y;
    vert.z = newV.z;
  }
}

function rotateObjectZ(obj, theta) {
  //Matrix Rotate Z
  var matRotZ = [];
  for (var i = 0; i < 4; i++) {
    matRotZ[i] = [];
    for (var j = 0; j < 4; j++) {
      matRotZ[i][j] = 0;
    }
  }
  matRotZ[0][0] = cos(theta);
  matRotZ[0][1] = sin(theta);
  matRotZ[1][0] = -sin(theta);
  matRotZ[1][1] = cos(theta);
  matRotZ[2][2] = 1.0;
  matRotZ[3][3] = 1.0;

  for (let i in obj.verts) {
    let vert = obj.verts[i];
    let newV = multiplyMatrixVector(vert, matRotZ);
    vert.x = newV.x;
    vert.y = newV.y;
    vert.z = newV.z;
  }
}

function translateObject(obj, x, y, z) {
  for (let i in obj.verts) {
    let vert = obj.verts[i];
    vert.x += x;
    vert.y += y;
    vert.z += z;
  }
}

/*





















*/
