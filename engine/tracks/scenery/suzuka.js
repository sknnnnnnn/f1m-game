import * as J from "three";
var we = "https://media.formula1.com/image/upload/c_fit,h_1408/q_auto/v1740000001/common/f1/2026/track/2026tracksuzukadetailed.webp", ae = [[1500, 449, 12], [1660, 646, 8], [1838, 879, 4], [1861, 920, 3], [1873, 948, 2], [1868, 975, 1.4], [1855, 1012, 1], [1835, 1031, 1], [1810, 1037, 1], [1786, 1031, 2], [1763, 1011, 3], [1718, 946, 5], [1675, 890, 7], [1652, 874, 8], [1628, 869, 9], [1603, 867, 10], [1578, 862, 11], [1557, 849, 12], [1544, 829, 13], [1533, 797, 15], [1521, 762, 17], [1509, 741, 18], [1492, 727, 19], [1469, 716, 21], [1443, 712, 22], [1413, 712, 23], [1390, 705, 24], [1374, 691, 25], [1366, 674, 26], [1365, 652, 27], [1374, 621, 28], [1384, 589, 29], [1394, 553, 30], [1394, 532, 31], [1385, 508, 31], [1369, 488, 31], [1344, 475, 31], [1315, 461, 31], [1284, 449, 31], [1251, 444, 30], [1217, 445, 29], [1184, 454, 28], [1152, 472, 27], [1128, 491, 26], [1101, 523, 24], [1051, 586, 20], [1025, 612, 18], [1014, 616, 17], [954, 622, 13], [889, 627, 10], [876, 622, 9], [871, 609, 8.5], [855, 536, 8], [840, 463, 9], [828, 398, 11], [825, 367, 12], [829, 341, 13], [842, 311, 15], [861, 271, 17], [866, 248, 18], [858, 235, 18.5], [844, 230, 19], [832, 235, 19], [815, 261, 20], [780, 318, 23], [754, 352, 25], [730, 373, 27], [701, 391, 28], [671, 402, 29], [637, 407, 30], [604, 408, 31], [578, 405, 32], [542, 396, 33], [498, 380, 34], [460, 361, 35], [427, 340, 36], [405, 319, 37], [387, 295, 38], [373, 268, 39], [354, 224, 40], [335, 174, 40], [324, 147, 40], [311, 129, 40], [290, 117, 39], [269, 112, 39], [244, 114, 38], [219, 121, 38], [195, 130, 37], [180, 146, 36], [171, 165, 35], [169, 184, 34], [175, 205, 33], [188, 225, 32], [207, 244, 31], [234, 264, 30], [280, 297, 29], [334, 333, 28], [389, 363, 27], [440, 390, 26], [499, 416, 25], [565, 439, 24], [686, 482, 23], [815, 528, 22], [867, 549, 21], [895, 557, 21], [921, 554, 21], [951, 545, 21], [980, 531, 21], [1009, 513, 21], [1051, 480, 21], [1123, 419, 20], [1185, 368, 20], [1201, 360, 20], [1209, 362, 20], [1233, 382, 20], [1246, 385, 20], [1258, 380, 20], [1281, 363, 20], [1305, 350, 20], [1326, 344, 20], [1350, 344, 20], [1380, 351, 19], [1409, 364, 18], [1435, 382, 17], [1461, 405, 15]], xe = [[1861, 920], [1810, 1037], [1675, 890], [1557, 849], [1509, 741], [1374, 691], [1251, 444], [1025, 612], [876, 622], [825, 367], [844, 230], [637, 407], [311, 129], [169, 184], [895, 557], [1201, 360], [1246, 385], [1326, 344]];
function ie(x) {
  let o = new x.CatmullRomCurve3(ae.map(([S, T]) => new x.Vector3(S - 1020, 0, T - 570)), true, "centripetal");
  o.arcLengthDivisions = 16e3;
  let t = 5807 / o.getLength(), m = () => new x.CatmullRomCurve3(ae.map(([S, T, B]) => new x.Vector3((S - 1020) * t, B, (T - 570) * t)), true, "centripetal"), p = m();
  p.arcLengthDivisions = 16e3, t *= 5807 / p.getLength(), p = m(), p.arcLengthDivisions = 16e3, p.updateArcLengths();
  let h = Array.from({ length: 3201 }, (S, T) => {
    let B = T / 3200, N = p.getPointAt(B), _ = p.getTangentAt(B), d = new x.Vector3(-_.z, 0, _.x).normalize();
    return { u: B, p: N, t: _, n: d };
  }), A = null, P = (S, T, B = false) => {
    let N = null, _ = 1 / 0;
    for (let d = 0; d < h.length; d += 3) {
      let e = h[d];
      if (B && A && Math.abs(e.u - A) < 0.018) continue;
      let s = (e.p.x - S) ** 2 + (e.p.z - T) ** 2;
      s < _ && (_ = s, N = e);
    }
    return { s: N, d: Math.sqrt(_) };
  }, E = ([S, T]) => {
    let B = (S - 1020) * t, N = (T - 570) * t;
    return new x.Vector3(B, P(B, N).s.p.y, N);
  }, k = (S) => P(S.x, S.z).s.u, l = xe.map((S, T) => {
    let B = E(S), N = k(B);
    return { name: "T" + (T + 1), u: N, point: p.getPointAt(N) };
  }), F = k(E([855, 545])), V = h.reduce((S, T) => T.u > l[13].u && T.u < l[14].u && Math.abs(T.p.x - -165 * t) < Math.abs((S?.p.x ?? 1e9) - -165 * t) ? T : S, null);
  A = V.u;
  let y = E([1461, 405]), U = E([1838, 879]), L = U.clone().sub(y);
  L.y = 0, L.normalize();
  let w = new x.Vector3(-L.z, 0, L.x), z = y.clone().lerp(U, 0.47), R = (S, T, B = z.y) => z.clone().addScaledVector(L, S).addScaledVector(w, T).setY(B), a = p.getPointAt(l[17].u), M = E([1838, 879]), v = [a, R(-260, 17, 17), R(-210, 28), R(-100, 28), R(80, 28), R(200, 28), M.clone().addScaledVector(L, -35).addScaledVector(w, 6), M], O = new x.CatmullRomCurve3(v, false, "centripetal");
  return O.arcLengthDivisions = 2e3, { curve: p, samples: h, scale: t, world: E, corners: l, pit: O, length: p.getLength(), closest: k, nearest: P, source: we, bridge: V, frame: { dir: L, normal: w, mid: z }, terrainHeight(S, T) {
    let B = P(S, T, true);
    return B.s.p.y - 1.8 - Math.min(9, B.d * 0.025);
  } };
}
import * as Z from "three";
function ce() {
  let x = (k, l = 0.8, F = 0) => new Z.MeshStandardMaterial({ color: k, roughness: l, metalness: F });
  function o(k, l = 256, F = 13) {
    let V = document.createElement("canvas");
    V.width = V.height = l;
    let y = V.getContext("2d"), U = y.createImageData(l, l), L = 18237;
    for (let z = 0; z < l * l; z++) {
      L = L * 1664525 + 1013904223 >>> 0;
      let R = (L / 4294967296 - 0.5) * F;
      for (let a = 0; a < 3; a++) U.data[z * 4 + a] = Math.max(0, k[a] + R);
      U.data[z * 4 + 3] = 255;
    }
    y.putImageData(U, 0, 0);
    let w = new Z.CanvasTexture(V);
    return w.colorSpace = Z.SRGBColorSpace, w.wrapS = w.wrapT = Z.RepeatWrapping, w.anisotropy = 4, w;
  }
  let t = x(16777215, 0.94);
  t.map = o([71, 73, 75], 256, 21);
  let m = o([127, 127, 127], 128, 50);
  m.colorSpace = Z.NoColorSpace, t.bumpMap = m, t.bumpScale = 0.018;
  let p = x(16777215, 0.99);
  p.map = o([91, 111, 71], 256, 22), p.map.repeat.set(200, 200);
  let h = x(16777215, 0.99);
  h.map = o([176, 166, 139], 128, 38), h.map.repeat.set(2, 3);
  let A = x(12699324, 0.91);
  A.bumpMap = m, A.bumpScale = 0.024;
  let P = x(14803673, 0.55, 0.16), E = x(4810613, 0.22, 0.52);
  return E.envMapIntensity = 0.8, { asphalt: t, grass: p, gravel: h, concrete: A, roof: P, glass: E, white: x(15263708, 0.78), red: x(10434867, 0.69), dark: x(2569273, 0.63), steel: x(11121068, 0.37, 0.68), teal: x(4353124, 0.78), water: x(5602690, 0.18, 0.45), gold: x(13151604, 0.4, 0.52), black: x(1186848, 0.88) };
}
import * as u from "three";
var K = (x = 0, o = 0, t = 0) => new u.Vector3(x, o, t);
function le(x, o, t) {
  let m = new u.Group();
  m.name = "Suzuka elevated circuit", x.add(m);
  let p = o.samples, h = p.length;
  function A(r, n, i, C, f = false) {
    let g = [], j = [], q = [], D = [];
    for (let H = 0; H < h; H++) {
      let ee = p[H];
      for (let Y of [r, n]) if (g.push(ee.p.x + ee.n.x * Y, ee.p.y + i, ee.p.z + ee.n.z * Y), j.push(Y / 4, H / 4), f) {
        let X = new u.Color(Math.floor(ee.u * o.length / 2.6) % 2 ? 14933967 : 11089974);
        D.push(X.r, X.g, X.b);
      }
      if (H < h - 1) {
        let Y = p[Math.max(0, H - 2)].t, X = p[Math.min(h - 1, H + 2)].t, he = Math.abs(Math.atan2(Y.x * X.z - Y.z * X.x, Y.x * X.x + Y.z * X.z));
        if (!f || he > 8e-3) {
          let te = H * 2;
          q.push(te, te + 1, te + 2, te + 1, te + 3, te + 2);
        }
      }
    }
    let W = new u.BufferGeometry();
    W.setAttribute("position", new u.Float32BufferAttribute(g, 3)), W.setAttribute("uv", new u.Float32BufferAttribute(j, 2)), f && W.setAttribute("color", new u.Float32BufferAttribute(D, 3)), W.setIndex(q), W.computeVertexNormals();
    let $ = new u.Mesh(W, C);
    $.receiveShadow = true, m.add($);
  }
  let P = o.bridge.u, E = [], k = [];
  p.forEach((r, n) => {
    let i = Math.abs(r.u - P) < 0.012, C = i ? 10.1 : 26;
    for (let f of [-C, C]) E.push(r.p.x + r.n.x * f, r.p.y - 0.07, r.p.z + r.n.z * f);
    if (n < h - 1) {
      let f = 2 * n;
      k.push(f, f + 1, f + 2, f + 1, f + 3, f + 2);
    }
  });
  let l = new u.BufferGeometry();
  l.setAttribute("position", new u.Float32BufferAttribute(E, 3)), l.setIndex(k), l.computeVertexNormals();
  let F = new u.Mesh(l, new u.MeshStandardMaterial({ color: 7768913, roughness: 1 }));
  F.receiveShadow = true, m.add(F), A(-8.4, 8.4, 0.012, t.gravel), A(-7, 7, 0.035, t.asphalt), A(-7.07, -6.9, 0.055, t.white), A(6.9, 7.07, 0.055, t.white);
  let V = new u.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  A(-8.4, -7.18, 0.09, V, true), A(7.18, 8.4, 0.09, V, true);
  let y = Array.from({ length: 401 }, (r, n) => {
    let i = o.pit.getPointAt(n / 400), C = o.pit.getTangentAt(n / 400);
    return { p: i, n: K(-C.z, 0, C.x).normalize() };
  }), U = [], L = [], w = [];
  y.forEach((r, n) => {
    for (let i of [-1, 1]) U.push(r.p.x + r.n.x * i * 3.6, r.p.y + 0.04, r.p.z + r.n.z * i * 3.6), L.push(i, n / 5);
    if (n < 400) {
      let i = n * 2;
      w.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
    }
  });
  let z = new u.BufferGeometry();
  z.setAttribute("position", new u.Float32BufferAttribute(U, 3)), z.setAttribute("uv", new u.Float32BufferAttribute(L, 2)), z.setIndex(w), z.computeVertexNormals();
  let R = new u.Mesh(z, t.asphalt);
  R.receiveShadow = true, m.add(R);
  let a = p[0], M = new u.Group();
  M.position.copy(a.p), M.quaternion.setFromUnitVectors(K(0, 1, 0), a.n.clone().cross(a.t).normalize());
  for (let r = 0; r < 3; r++) for (let n = 0; n < 18; n++) {
    let i = new u.Mesh(new u.PlaneGeometry(0.77, 0.77), (r + n) % 2 ? t.dark : t.white);
    i.rotation.x = -Math.PI / 2, i.position.copy(a.n.clone().multiplyScalar((n - 8.5) * 0.77)).addScaledVector(a.t, (r - 1) * 0.77), i.position.y = 0.07, M.add(i);
  }
  m.add(M);
  let v = [];
  for (let r of [-1, 1]) for (let n = 0; n < h - 5; n += 5) {
    let i = p[n], C = p[n + 5];
    if (r > 0 && (i.u < 0.105 || i.u > 0.975)) continue;
    let f = Math.abs(i.u - P) < 0.012, g = f ? 10.3 : 28, j = i.p.clone().addScaledVector(i.n, r * g), q = C.p.clone().addScaledVector(C.n, r * g), D = q.clone().sub(j);
    if (D.length() > 13 || D.length() < 0.3) continue;
    let W = true;
    for (let $ = 0; $ < h; $ += 7) {
      let H = p[$].p;
      if (Math.abs(H.y - j.y) < 5 && Math.hypot(H.x - j.x, H.z - j.z) < 9) {
        W = false;
        break;
      }
    }
    W && v.push({ p: j.clone().add(q).multiplyScalar(0.5), d: D, len: D.length() });
  }
  let O = new u.InstancedMesh(new u.BoxGeometry(0.45, 0.85, 1), t.concrete, v.length), S = new u.InstancedMesh(new u.CylinderGeometry(0.045, 0.045, 2.3, 5), t.steel, v.length), T = new u.Matrix4(), B = new u.Quaternion(), N = [];
  v.forEach((r, n) => {
    B.setFromUnitVectors(K(0, 0, 1), r.d.clone().normalize()), T.compose(r.p.clone().add(K(0, 0.45, 0)), B, K(1, 1, r.len)), O.setMatrixAt(n, T), T.compose(r.p.clone().add(K(0, 1.95, 0)), new u.Quaternion(), K(1, 1, 1)), S.setMatrixAt(n, T);
    for (let i of [1.1, 1.8, 2.7]) for (let C of [-0.5, 0.5]) {
      let f = r.p.clone().addScaledVector(r.d, C).add(K(0, i, 0));
      N.push(...f.toArray());
    }
  }), m.add(O, S);
  let _ = new u.BufferGeometry();
  _.setAttribute("position", new u.Float32BufferAttribute(N, 3)), m.add(new u.LineSegments(_, new u.LineBasicMaterial({ color: 7636604, transparent: true, opacity: 0.65 })));
  let d = new u.Group(), e = o.bridge;
  d.position.copy(e.p), d.rotation.y = Math.atan2(e.t.x, e.t.z), m.add(d);
  let s = (r, n) => {
    let i = new u.Mesh(new u.BoxGeometry(...r), t.concrete);
    return i.position.set(...n), i.castShadow = i.receiveShadow = true, d.add(i), i;
  };
  s([20.2, 1.5, 80], [0, -0.9, 0]);
  for (let r of [-34, 34]) for (let n of [-8.8, 8.8]) s([1.5, 13, 2.4], [n, -8.1, r]);
  return { group: m, pit: R, deck: d };
}
import * as b from "three";
var oe = (x = 0, o = 0, t = 0) => new b.Vector3(x, o, t);
function de(x, o, t) {
  let m = new b.Group();
  m.name = "Suzuka architecture interpretation", x.add(m);
  let p = [], { dir: h, normal: A, mid: P } = o.frame, E = Math.atan2(h.x, h.z), k = (e, s, r = m) => {
    let n = new b.Mesh(e, s);
    return n.castShadow = n.receiveShadow = true, r.add(n), n;
  };
  function l(e, s, r, n = m) {
    let i = k(new b.BoxGeometry(...e), r, n);
    return i.position.set(...s), i;
  }
  function F(e, s, r, n, i = m) {
    e = oe(...e), s = oe(...s);
    let C = s.clone().sub(e), f = k(new b.CylinderGeometry(r, r, C.length(), 8), n, i);
    return f.position.copy(e).add(s).multiplyScalar(0.5), f.quaternion.setFromUnitVectors(oe(0, 1, 0), C.normalize()), f;
  }
  function V(e, s, r, n, i, C = 0) {
    let f = document.createElement("canvas");
    f.width = 1024, f.height = 128;
    let g = f.getContext("2d");
    g.fillStyle = "#f2eee2", g.fillRect(0, 0, 1024, 128), g.fillStyle = "#b83b36", g.font = "bold 70px sans-serif", g.textAlign = "center", g.fillText(e, 512, 90);
    let j = new b.CanvasTexture(f);
    j.colorSpace = b.SRGBColorSpace;
    let q = k(new b.PlaneGeometry(s, r), new b.MeshBasicMaterial({ map: j, side: b.FrontSide }), n);
    return q.position.set(...i), q.rotation.y = C, q;
  }
  let y = new b.Group();
  y.position.copy(P).addScaledVector(A, 70), y.rotation.y = E, m.add(y), l([43, 0.35, 414], [0, 0, 0], t.concrete, y), l([0.5, 7.5, 414], [20.5, 3.75, 0], t.dark, y);
  let U = l([42, 4.3, 414], [0, 10, 0], t.glass, y), L = l([47, 0.7, 424], [0, 12.7, 0], t.roof, y);
  p.push(U, L), l([1, 1.8, 416], [-21.2, 7.3, 0], t.white, y);
  for (let e = 0; e < 24; e++) {
    let s = -195.5 + e * 17;
    l([41, 6.4, 0.3], [0, 3.2, s - 8.3], t.concrete, y), l([0.6, 7.2, 0.7], [-20.7, 3.6, s - 8.3], e % 4 < 2 ? t.red : t.teal, y), V("F1M / " + String(Math.floor(e / 2) + 1).padStart(2, "0"), 12, 1.1, y, [-21.75, 7.3, s], -Math.PI / 2), l([33, 0.08, 16], [0, 0.2, s], t.concrete, y);
  }
  l([16.8, 0.1, 416], [-29.6, 0.04, 0], t.concrete, y), l([0.4, 1.1, 440], [-47, 0.58, 0], t.concrete, y);
  for (let e = 0; e < 12; e++) {
    let s = -187 + e * 34;
    l([8, 0.025, 0.14], [-29, 0.25, s - 6.5], t.white, y), l([8, 0.025, 0.14], [-29, 0.25, s + 6.5], t.white, y);
  }
  let w = new b.Group();
  w.position.copy(P).addScaledVector(A, -62), w.rotation.y = E, m.add(w), l([54, 3, 404], [0, 1.5, 0], t.dark, w);
  for (let e = 0; e < 15; e++) l([3.4, 1.05, 396], [23 - e * 3.4, 3 + e * 1, 0], t.concrete, w);
  let z = new b.InstancedMesh(new b.BoxGeometry(0.48, 0.54, 0.48), t.white, 15 * 290), R = new b.Matrix4(), a = 0;
  for (let e = 0; e < 15; e++) for (let s = 0; s < 290; s++) R.makeTranslation(23 - e * 3.4, 3.95 + e, -195 + s * 1.35), z.setMatrixAt(a, R), z.setColorAt(a, new b.Color([13067093, 14207372, 8234424, 7442560][Math.floor(s / 24) % 4])), a++;
  w.add(z);
  let M = l([65, 0.65, 419], [3, 24, 0], t.roof, w);
  M.rotation.z = -0.06, p.push(M);
  for (let e = -198; e <= 198; e += 66) F([-26, 0, e], [-26, 25, e], 0.6, t.steel, w), F([-26, 22, e], [30, 24, e], 0.4, t.steel, w), F([-26, 18, e], [23, 24, e], 0.26, t.steel, w);
  V("SUZUKA  /  JAPAN", 135, 5, w, [30.5, 14, 0], Math.PI / 2);
  let v = new b.Group();
  v.position.copy(o.world([1500, 590])).addScaledVector(A, 120), v.position.y = o.terrainHeight(v.position.x, v.position.z), v.rotation.y = E, m.add(v);
  let O = 28, S = 35;
  for (let e of [-6, 6]) F([-15, 0, e], [0, S, e], 0.75, t.white, v), F([15, 0, e], [0, S, e], 0.75, t.white, v);
  F([0, S, -7], [0, S, 7], 1, t.gold, v), l([39, 0.5, 28], [0, 0, 0], t.concrete, v);
  let T = new b.Group();
  T.position.y = S, v.add(T);
  for (let e of [-1.7, 1.7]) {
    let s = k(new b.TorusGeometry(O, 0.45, 8, 96), t.white, T);
    s.position.z = e;
  }
  let B = [];
  for (let e = 0; e < 32; e++) {
    let s = e / 32 * Math.PI * 2, r = Math.cos(s) * O, n = Math.sin(s) * O;
    F([0, 0, -1.7], [r, n, -1.7], 0.12, t.steel, T), F([0, 0, 1.7], [r, n, 1.7], 0.12, t.steel, T);
    let i = new b.Group();
    i.position.set(r, n, 0), T.add(i);
    let C = new b.MeshStandardMaterial({ color: [12210504, 13610325, 6200201, 6651806][e % 4], roughness: 0.52 });
    l([2.4, 2, 2.5], [0, -1.3, 0], C, i), l([2.3, 0.7, 2.55], [0, -0.8, 0], t.glass, i), l([2.6, 0.2, 2.8], [0, -0.2, 0], t.white, i), B.push(i);
  }
  for (let [e, s] of [[3, -1], [10, 1], [15, -1]]) {
    let r = o.corners[e], n = r.point, i = o.curve.getTangentAt(r.u), C = oe(-i.z, 0, i.x).normalize(), f = new b.Group();
    f.position.copy(n).addScaledVector(C, s * 72), f.position.y = o.terrainHeight(f.position.x, f.position.z), f.rotation.y = Math.atan2(i.x, i.z), m.add(f);
    for (let g = 0; g < 8; g++) l([3, 1, 86], [-12 + g * 3, 1 + g * 0.95, 0], t.concrete, f);
  }
  let N = o.samples[0], _ = new b.Group();
  _.position.copy(N.p), _.rotation.y = Math.atan2(N.t.x, N.t.z), m.add(_);
  for (let e of [-13, 13]) l([0.5, 8, 0.6], [e, 4, 0], t.steel, _);
  l([27, 1.6, 0.7], [0, 8, 0], t.white, _), V("F1M  /  SUZUKA", 21, 1.4, _, [0, 8, -0.38], Math.PI);
  for (let e = 0; e < 5; e++) l([0.42, 0.6, 0.3], [-1.5 + e * 0.75, 6.85, -0.4], t.red, _);
  for (let e = 0; e < 7; e++) {
    let s = new b.Group();
    s.position.copy(P).addScaledVector(A, 102).addScaledVector(h, -165 + e * 52), s.rotation.y = E, m.add(s), l([27, 6, 37], [0, 3, 0], t.white, s), l([29, 0.5, 39], [0, 6.5, 0], t.roof, s), l([0.2, 3.2, 30], [-13.6, 3.6, 0], t.glass, s);
  }
  let d = y.localToWorld(oe(-2, 0.23, -8.5));
  return { root: m, pit: y, stand: w, mid: P, dir: h, normal: A, yaw: E, activeBay: d, roofs: p, wheelRoot: v, setCutaway(e) {
    for (let s of p) s.visible = !e;
  }, update(e) {
    T.rotation.z = e * 0.014;
    for (let s of B) s.rotation.z = -T.rotation.z;
  } };
}
import * as I from "three";
function ue(x, o, t, m) {
  let p = new I.Group();
  p.name = "Authored rolling terrain", x.add(p);
  let h = new I.Box3().setFromPoints(o.samples.map((a) => a.p)), A = h.max.x - h.min.x + 450, P = h.max.z - h.min.z + 450, E = h.getCenter(new I.Vector3()), k = new I.PlaneGeometry(A, P, 140, 90);
  k.rotateX(-Math.PI / 2);
  let l = k.attributes.position;
  for (let a = 0; a < l.count; a++) {
    let M = l.getX(a) + E.x, v = l.getZ(a) + E.z;
    l.setXYZ(a, M, o.terrainHeight(M, v), v);
  }
  k.computeVertexNormals();
  let F = new I.Mesh(k, t.grass);
  F.receiveShadow = true, p.add(F);
  let V = [], y = 9231, U = () => (y = y * 1664525 + 1013904223 >>> 0, y / 4294967296);
  for (let a = 0; a < 3500 && V.length < 650; a++) {
    let M = E.x + (U() - 0.5) * A * 0.9, v = E.z + (U() - 0.5) * P * 0.9;
    if (o.nearest(M, v).d < 48) continue;
    let S = m.pit.worldToLocal(new I.Vector3(M, m.mid.y, v));
    Math.abs(S.x) < 150 && Math.abs(S.z) < 265 || Math.hypot(M - m.wheelRoot.position.x, v - m.wheelRoot.position.z) < 48 || V.push({ x: M, z: v, y: o.terrainHeight(M, v), s: 5 + U() * 6 });
  }
  let L = new I.InstancedMesh(new I.IcosahedronGeometry(1, 1), new I.MeshStandardMaterial({ color: 4677959, roughness: 1 }), V.length), w = new I.InstancedMesh(new I.CylinderGeometry(0.28, 0.45, 1, 5), t.dark, V.length), z = new I.Matrix4(), R = new I.Quaternion();
  return V.forEach((a, M) => {
    z.compose(new I.Vector3(a.x, a.y + a.s * 0.85, a.z), R, new I.Vector3(a.s * 0.64, a.s * 0.75, a.s * 0.64)), L.setMatrixAt(M, z), L.setColorAt(M, new I.Color().setHSL(0.25 + M % 8 * 8e-3, 0.17, 0.3 + M % 5 * 0.023)), z.compose(new I.Vector3(a.x, a.y + a.s * 0.35, a.z), R, new I.Vector3(1, a.s * 0.7, 1)), w.setMatrixAt(M, z);
  }), p.add(L, w), p;
}
import * as c from "three";
var Q = (x = 0, o = 0, t = 0) => new c.Vector3(x, o, t);
function pe(x, o, t, m, p) {
  let h = new c.Group();
  h.name = "Track finish, spectators and furnishings", x.add(h);
  let A = (d, e, s) => {
    let r = new c.InstancedMesh(d, e, s);
    return h.add(r), r;
  }, P = new c.Matrix4(), E = new c.Quaternion(), k = [], l = [], F = [], V = [];
  o.samples.forEach((d, e) => {
    let s = d.u, r = o.curve.getTangentAt(s), n = Q(-r.z, 0, r.x).normalize(), i = o.curve.getTangentAt((s + 0.998) % 1), C = i.x * r.z - i.z * r.x, f = c.MathUtils.clamp(C * 90, -2.2, 2.2);
    for (let g of [f - 1.15, f + 1.15]) l.push(d.p.x + n.x * g, d.p.y + 0.058, d.p.z + n.z * g), V.push(g, e * 0.08);
    if (e < o.samples.length - 1) {
      let g = e * 2;
      F.push(g, g + 1, g + 2, g + 1, g + 3, g + 2);
    }
  });
  let y = new c.BufferGeometry();
  y.setAttribute("position", new c.Float32BufferAttribute(l, 3)), y.setAttribute("uv", new c.Float32BufferAttribute(V, 2)), y.setIndex(F), y.computeVertexNormals();
  let U = document.createElement("canvas");
  U.width = 64, U.height = 128;
  let L = U.getContext("2d");
  for (let d = 0; d < 64; d++) {
    let e = Math.sin(d / 63 * Math.PI) ** 2;
    L.fillStyle = "rgba(10,13,15," + e * (0.16 + 0.12 * (Math.sin(d * 19) + 1) / 2) + ")", L.fillRect(d, 0, 1, 128);
  }
  let w = new c.CanvasTexture(U);
  w.wrapS = w.wrapT = c.RepeatWrapping;
  let z = new c.MeshStandardMaterial({ map: w, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), R = new c.Mesh(y, z);
  R.receiveShadow = true, h.add(R);
  let a = [], M = p === "suzuka" ? 15 : 14, v = p === "suzuka" ? 290 : 260, O = 419, S = () => (O = O * 1664525 + 1013904223 >>> 0, O / 4294967296);
  t.stand.updateWorldMatrix(true, false);
  for (let d = 0; d < M; d++) for (let e = 0; e < v; e++) {
    if (S() > 0.58) continue;
    let s = p === "suzuka" ? Q(23 - d * 3.4, 4.12 + d, -195 + e * 1.35) : Q(-22 + d * 3.5, 4.65 + d * 1.25, -178 + e * 1.36);
    s.applyMatrix4(t.stand.matrixWorld), a.push({ p: s, color: [7634809, 13678235, 10830133, 14998984, 3560290, 4352855][Math.floor(S() * 6)] });
  }
  let T = A(new c.CylinderGeometry(0.19, 0.23, 0.54, 5), m.white, a.length), B = A(new c.SphereGeometry(0.14, 6, 4), new c.MeshStandardMaterial({ color: 13086609, roughness: 1 }), a.length);
  a.forEach((d, e) => {
    P.compose(d.p, E, Q(1, 1, 1)), T.setMatrixAt(e, P), T.setColorAt(e, new c.Color(d.color)), P.compose(d.p.clone().add(Q(0, 0.4, 0)), E, Q(1, 1, 1)), B.setMatrixAt(e, P);
  });
  let N = (d, e, s, r = h) => {
    let n = new c.Mesh(new c.BoxGeometry(...d), s);
    return n.position.copy(e), n.castShadow = n.receiveShadow = true, r.add(n), n;
  };
  for (let d = 0; d < 7; d++) {
    let e = t.mid.clone().addScaledVector(t.normal, p === "suzuka" ? 123 : 170).addScaledVector(t.dir, -145 + d * 43);
    e.y = p === "suzuka" ? o.terrainHeight(e.x, e.z) : 0;
    let s = new c.Mesh(new c.CylinderGeometry(0.08, 0.11, 12, 7), m.steel);
    s.position.copy(e).add(Q(0, 6, 0)), h.add(s);
    let r = document.createElement("canvas");
    r.width = 256, r.height = 144;
    let n = r.getContext("2d");
    if (n.fillStyle = p === "suzuka" ? "#eee9db" : "#ae3931", n.fillRect(0, 0, 256, 144), n.fillStyle = p === "suzuka" ? "#b13e3b" : "#dbc68a", n.beginPath(), p === "suzuka") n.arc(128, 72, 40, 0, 7);
    else for (let g = 0; g < 10; g++) {
      let j = g * Math.PI / 5 - Math.PI / 2, q = g % 2 ? 15 : 36;
      n.lineTo(56 + Math.cos(j) * q, 48 + Math.sin(j) * q);
    }
    if (n.fill(), p === "shanghai") for (let [g, j] of [[105, 23], [126, 48], [126, 79], [105, 104]]) {
      n.beginPath();
      for (let q = 0; q < 10; q++) {
        let D = q * Math.PI / 5 - Math.PI / 2, W = q % 2 ? 5 : 11;
        n.lineTo(g + Math.cos(D) * W, j + Math.sin(D) * W);
      }
      n.fill();
    }
    let i = new c.CanvasTexture(r);
    i.colorSpace = c.SRGBColorSpace;
    let C = new c.PlaneGeometry(4.4, 2.45, 12, 5);
    C.translate(2.2, 0, 0);
    let f = new c.Mesh(C, new c.MeshStandardMaterial({ map: i, side: c.DoubleSide, roughness: 0.85 }));
    f.position.copy(e).add(Q(0, 10.4, 0)), f.rotation.y = t.yaw, f.userData.base = C.attributes.position.array.slice(), h.add(f), k.push(f);
  }
  let _ = new c.MeshStandardMaterial({ color: 16115132, emissive: 16768421, emissiveIntensity: 0.7, roughness: 0.5 });
  for (let d of [-144, -76, -8, 60, 128]) {
    let e = N([22, 0.06, 0.22], Q(0, 6.7, d), _, t.pit);
    e.name = "Pit ceiling strip", h.attach(e);
  }
  for (let d of o.corners.filter((e, s) => [0, o.corners.length - 3].includes(s))) for (let e of [100, 50]) {
    let s = (d.u - e / o.length + 1) % 1, r = o.curve.getPointAt(s), n = o.curve.getTangentAt(s), i = Q(-n.z, 0, n.x).normalize();
    r.addScaledVector(i, -14);
    let C = new c.Group();
    C.position.copy(r).add(Q(0, 1.25, 0)), C.rotation.y = Math.atan2(-n.x, -n.z), h.add(C), N([1.7, 2, 0.13], Q(), m.white, C);
    let f = document.createElement("canvas");
    f.width = 128, f.height = 128;
    let g = f.getContext("2d");
    g.fillStyle = "#e8e6db", g.fillRect(0, 0, 128, 128), g.fillStyle = "#25373b", g.font = "bold 53px sans-serif", g.textAlign = "center", g.fillText(String(e), 64, 85);
    let j = new c.CanvasTexture(f);
    j.colorSpace = c.SRGBColorSpace;
    for (let [q, D] of [[0.071, 0], [-0.071, Math.PI]]) {
      let W = new c.Mesh(new c.PlaneGeometry(1.6, 1.9), new c.MeshBasicMaterial({ map: j, side: c.FrontSide }));
      W.position.z = q, W.rotation.y = D, C.add(W);
    }
  }
  return { root: h, crowdCount: a.length, update(d) {
    for (let e of k) {
      let s = e.geometry.attributes.position, r = e.userData.base;
      for (let n = 0; n < s.count; n++) {
        let i = r[n * 3], C = r[n * 3 + 1];
        s.setZ(n, Math.sin(i * 1.7 - d * 2.3 + C * 0.5) * 0.19 * i / 4.4 + Math.sin(i * 3.1 - d * 3.5) * 0.06 * i / 4.4);
      }
      s.needsUpdate = true;
    }
  }, setQuality(d) {
    B.visible = d !== "low";
  } };
}
import * as G from "three";
var ne = (x = 0, o = 0, t = 0) => new G.Vector3(x, o, t), fe = { day: { label: "\u0E01\u0E25\u0E32\u0E07\u0E27\u0E31\u0E19", top: 7445947, horizon: 14016476, sun: 16773336, sky: 14938093, ground: 5399372, power: 2.65, fill: 1.4, exposure: 1.03, density: 14e-5, offset: ne(-300, 620, -250) }, late: { label: "\u0E41\u0E2A\u0E07\u0E40\u0E22\u0E47\u0E19", top: 7903921, horizon: 14927788, sun: 16764052, sky: 14343125, ground: 5852227, power: 2.45, fill: 1.25, exposure: 1.01, density: 19e-5, offset: ne(-570, 270, 190) }, cloud: { label: "\u0E1F\u0E49\u0E32\u0E04\u0E23\u0E36\u0E49\u0E21", top: 10793915, horizon: 14278102, sun: 14870501, sky: 14477288, ground: 6252886, power: 0.85, fill: 2, exposure: 1.08, density: 21e-5, offset: ne(-300, 620, -250) } }, re = class {
  constructor(o, t) {
    this.scene = o, this.renderer = t, this.previous = { fog: o.fog, background: o.background, exposure: t.toneMappingExposure }, this.root = new G.Group(), this.root.name = "Circuit daylight and atmosphere", o.add(this.root), this.fill = new G.HemisphereLight(16777215, 5399372, 1.4), this.sun = new G.DirectionalLight(16773077, 2.65), this.sun.castShadow = true, this.sun.shadow.mapSize.set(2048, 2048), Object.assign(this.sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 1, far: 1600 }), this.sun.shadow.normalBias = 0.045, this.sun.shadow.bias = -8e-5, this.sun.shadow.radius = 2, this.root.add(this.fill, this.sun, this.sun.target), this.uniforms = { top: { value: new G.Color() }, horizon: { value: new G.Color() }, direction: { value: ne(-0.4, 0.75, -0.3).normalize() }, glow: { value: new G.Color(16773075) } }, this.sky = new G.Mesh(new G.SphereGeometry(1, 32, 16), new G.ShaderMaterial({ side: G.BackSide, depthWrite: false, fog: false, uniforms: this.uniforms, vertexShader: "varying vec3 vRay;void main(){vRay=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}", fragmentShader: `varying vec3 vRay;uniform vec3 top;uniform vec3 horizon;uniform vec3 direction;uniform vec3 glow;void main(){vec3 r=normalize(vRay);float h=pow(max(r.y,0.),.42);vec3 c=mix(horizon,top,h);float s=pow(max(dot(r,direction),0.),160.);c+=glow*s*.27;gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}` })), this.sky.frustumCulled = false, this.sky.renderOrder = -100, this.root.add(this.sky), o.fog = new G.FogExp2(14016476, 14e-5), this.setPreset("day", true);
  }
  setPreset(o, t = false) {
    this.name = fe[o] ? o : "day", this.target = fe[this.name], t && this.mix(1);
  }
  mix(o) {
    let t = this.target;
    this.uniforms.top.value.lerp(new G.Color(t.top), o), this.uniforms.horizon.value.lerp(new G.Color(t.horizon), o), this.uniforms.glow.value.lerp(new G.Color(t.sun), o), this.fill.color.lerp(new G.Color(t.sky), o), this.fill.groundColor.lerp(new G.Color(t.ground), o), this.sun.color.lerp(new G.Color(t.sun), o), this.sun.intensity = G.MathUtils.lerp(this.sun.intensity, t.power, o), this.fill.intensity = G.MathUtils.lerp(this.fill.intensity, t.fill, o), this.renderer.toneMappingExposure = G.MathUtils.lerp(this.renderer.toneMappingExposure, t.exposure, o), this.scene.fog?.color.lerp(new G.Color(t.horizon), o), this.scene.fog && (this.scene.fog.density = G.MathUtils.lerp(this.scene.fog.density, t.density, o)), this.offset ?? (this.offset = t.offset.clone()), this.offset.lerp(t.offset, o), this.uniforms.direction.value.copy(this.offset).normalize();
  }
  update(o, t, m) {
    this.mix(1 - Math.exp(-Math.max(0, o) * 2.2)), t.getWorldPosition(this.sky.position), this.sun.target.position.copy(m), this.sun.position.copy(m).add(this.offset);
  }
  quality(o) {
    let t = o === "low" ? 1024 : 2048;
    this.sun.shadow.mapSize.x !== t && (this.sun.shadow.map?.dispose(), this.sun.shadow.map = null, this.sun.shadow.mapSize.set(t, t)), this.sun.castShadow = o !== "low";
  }
  dispose() {
    this.root.removeFromParent(), this.sky.geometry.dispose(), this.sky.material.dispose(), this.sun.shadow.map?.dispose(), this.scene.fog = this.previous.fog, this.scene.background = this.previous.background, this.renderer.toneMappingExposure = this.previous.exposure;
  }
};
var se = { id: "suzuka", name: "Suzuka International Racing Course", lengthMetres: 5807, roadWidthMetres: 14, corners: 18, garageYawSign: 1, overviewAxis: [1, 1.75, 0.22] };
function Re({ scene: x, renderer: o, environment: t = true, detail: m = true, quality: p = "balanced" } = {}) {
  if (!x || !o) throw Error("mountCircuit requires a Three.js scene and renderer");
  let h = new J.Group();
  h.name = se.id + " / PRESENTATION 02", x.add(h);
  let A = ie(J), P = ce(), E = le(h, A, P), k = de(h, A, P), l = ue(h, A, P, k), F = m ? pe(h, A, k, P, se.id) : null, V = t ? new re(x, o) : null, y = false, U = p, L = { root: h, track: A, materials: P, circuit: E, architecture: k, landscape: l, finish: F, environment: V, metadata: { ...se, version: "PRESENTATION 02", units: "metres", up: "Y", carForward: "-Z", surveyed: false, collision: false, racingAI: false }, sampleRoute(w, z = "track", R = 0) {
    let a = z === "pit" ? A.pit : A.curve, M = a.getLength(), v = z === "pit" ? J.MathUtils.clamp(w, 0, M) : (w % M + M) % M, O = v / M, S = a.getPointAt(O), T = a.getTangentAt(O), B = new J.Vector3(-T.z, 0, T.x).normalize();
    return S.addScaledVector(B, R), { distance: v, u: O, position: S, tangent: T, normal: B };
  }, setLighting(w) {
    V?.setPreset(w);
  }, setQuality(w) {
    U = ["low", "balanced", "high"].includes(w) ? w : "balanced", V?.quality(U), F?.setQuality(U);
  }, update({ dt: w = 0, time: z = 0, camera: R, focus: a } = {}) {
    y || (k.update?.(z), F?.update(z), V && R && V.update(w, R, a ?? k.mid));
  }, dispose() {
    if (y) return;
    y = true, V?.dispose();
    let w = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set(), R = /* @__PURE__ */ new Set();
    h.traverse((a) => {
      a.geometry && w.add(a.geometry);
      for (let M of a.material ? Array.isArray(a.material) ? a.material : [a.material] : []) {
        z.add(M);
        for (let v of Object.values(M)) v?.isTexture && R.add(v);
      }
    });
    for (let a of Object.values(P)) {
      z.add(a);
      for (let M of Object.values(a)) M?.isTexture && R.add(M);
    }
    h.removeFromParent();
    for (let a of w) a.dispose();
    for (let a of z) a.dispose();
    for (let a of R) a.dispose();
  } };
  return L.setQuality(U), L;
}
export {
  Re as mountCircuit
};

export { ie as createAuthoredTrack33 };
