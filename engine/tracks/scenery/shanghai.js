import * as K from "three";
var fe = "https://media.formula1.com/image/upload/c_fit,h_1408/q_auto/v1740000001/common/f1/2026/track/2026trackshanghaidetailed.webp", re = [[774, 730], [955, 220], [980, 163], [1010, 129], [1045, 109], [1077, 105], [1107, 112], [1137, 132], [1156, 159], [1163, 184], [1157, 209], [1143, 229], [1125, 239], [1107, 236], [1092, 223], [1077, 202], [1063, 192], [1049, 190], [1035, 195], [1023, 206], [1017, 224], [1020, 242], [1029, 261], [1044, 280], [1062, 294], [1082, 302], [1106, 303], [1230, 286], [1396, 263], [1422, 262], [1515, 285], [1648, 318], [1665, 329], [1671, 342], [1663, 354], [1638, 367], [1596, 382], [1558, 388], [1502, 386], [1335, 377], [1303, 379], [1266, 390], [1232, 414], [1207, 447], [1195, 480], [1194, 516], [1201, 547], [1221, 585], [1258, 653], [1272, 690], [1273, 720], [1265, 747], [1249, 769], [1227, 786], [1200, 797], [1170, 798], [1104, 789], [1084, 787], [1067, 792], [1056, 804], [1056, 822], [1066, 852], [1080, 891], [1094, 909], [1115, 916], [1458, 929], [1594, 931], [1608, 927], [1616, 918], [1617, 907], [1607, 880], [1602, 861], [1605, 845], [1616, 834], [1636, 826], [1658, 824], [1680, 828], [1708, 844], [1729, 866], [1746, 894], [1752, 924], [1748, 953], [1735, 982], [1713, 1008], [1684, 1025], [1656, 1036], [1623, 1039], [500, 1040], [321, 1040], [304, 1037], [297, 1030], [300, 1019], [315, 1006], [344, 990], [369, 983], [395, 981], [659, 969], [674, 966], [682, 954]], pe = [[1077, 105], [1163, 184], [1017, 224], [1082, 302], [1410, 262], [1671, 342], [1194, 500], [1249, 769], [1056, 804], [1094, 909], [1616, 918], [1658, 824], [1752, 924], [297, 1030], [369, 983], [674, 966]];
function se(f) {
  let o = new f.CatmullRomCurve3(re.map(([G, S]) => new f.Vector3(G - 1e3, 0, S - 570)), true, "centripetal");
  o.arcLengthDivisions = 12e3;
  let e = 5451 / o.getLength(), x = ([G, S]) => new f.Vector3((G - 1e3) * e, 0, (S - 570) * e), T = new f.CatmullRomCurve3(re.map(x), true, "centripetal");
  T.arcLengthDivisions = 12e3, T.updateArcLengths();
  let p = Array.from({ length: 2601 }, (G, S) => {
    let l = S / 2600, a = T.getPointAt(l), k = T.getTangentAt(l);
    return { u: l, p: a, t: k, n: new f.Vector3(-k.z, 0, k.x) };
  }), g = (G) => {
    let S = 0, l = 1 / 0;
    for (let a = 0; a < p.length; a++) {
      let k = G.distanceToSquared(p[a].p);
      k < l && (l = k, S = a);
    }
    return p[S].u;
  }, c = pe.map((G, S) => ({ name: "T" + (S + 1), u: g(x(G)), point: x(G) })), L = [[695, 920], [724, 898], [749, 848], [783, 758], [817, 662], [852, 568], [888, 473], [923, 378], [955, 294], [960, 257], [955, 220]], P = new f.CatmullRomCurve3(L.map(x), false, "centripetal");
  return P.arcLengthDivisions = 1600, { curve: T, samples: p, scale: e, world: x, corners: c, pit: P, length: 5451, closest: g, source: fe };
}
import * as Y from "three";
function ae() {
  let f = (P, G = 0.8, S = 0) => new Y.MeshStandardMaterial({ color: P, roughness: G, metalness: S });
  function o(P, G = 256, S = 13) {
    let l = document.createElement("canvas");
    l.width = l.height = G;
    let a = l.getContext("2d"), k = a.createImageData(G, G), j = 18237;
    for (let v = 0; v < G * G; v++) {
      j = j * 1664525 + 1013904223 >>> 0;
      let E = (j / 4294967296 - 0.5) * S;
      for (let m = 0; m < 3; m++) k.data[v * 4 + m] = Math.max(0, P[m] + E);
      k.data[v * 4 + 3] = 255;
    }
    a.putImageData(k, 0, 0);
    let I = new Y.CanvasTexture(l);
    return I.colorSpace = Y.SRGBColorSpace, I.wrapS = I.wrapT = Y.RepeatWrapping, I.anisotropy = 4, I;
  }
  let e = f(16777215, 0.94);
  e.map = o([71, 73, 75], 256, 21);
  let x = o([127, 127, 127], 128, 50);
  x.colorSpace = Y.NoColorSpace, e.bumpMap = x, e.bumpScale = 0.018;
  let T = f(16777215, 0.99);
  T.map = o([91, 111, 71], 256, 22), T.map.repeat.set(200, 200);
  let p = f(16777215, 0.99);
  p.map = o([176, 166, 139], 128, 38), p.map.repeat.set(2, 3);
  let g = f(12699324, 0.91);
  g.bumpMap = x, g.bumpScale = 0.024;
  let c = f(14803673, 0.55, 0.16), L = f(4810613, 0.22, 0.52);
  return L.envMapIntensity = 0.8, { asphalt: e, grass: T, gravel: p, concrete: g, roof: c, glass: L, white: f(15263708, 0.78), red: f(10434867, 0.69), dark: f(2569273, 0.63), steel: f(11121068, 0.37, 0.68), teal: f(4353124, 0.78), water: f(5602690, 0.18, 0.45), gold: f(13151604, 0.4, 0.52), black: f(1186848, 0.88) };
}
import * as d from "three";
var J = (f = 0, o = 0, e = 0) => new d.Vector3(f, o, e);
function ie(f, o, e) {
  let x = new d.Group();
  x.name = "Shanghai track surface, kerbs and barriers", f.add(x);
  let T = o.samples, p = T.length;
  function g(z, b, n, i, h = false) {
    let C = [], t = [], r = [], w = [];
    for (let V = 0; V < p; V++) {
      let F = T[V];
      for (let N of [z, b]) if (C.push(F.p.x + F.n.x * N, n, F.p.z + F.n.z * N), t.push(N / 5, V / 4), h) {
        let B = new d.Color(Math.floor(V * o.length / (p - 1) / 2.8) % 2 ? 13225411 : 10365738);
        w.push(B.r, B.g, B.b);
      }
      if (V < p - 1) {
        let N = T[Math.max(0, V - 2)].t, B = T[Math.min(p - 1, V + 2)].t, Z = Math.abs(Math.atan2(N.x * B.z - N.z * B.x, N.dot(B)));
        if (!h || Z > 9e-3) {
          let O = V * 2;
          r.push(O, O + 1, O + 2, O + 1, O + 3, O + 2);
        }
      }
    }
    let y = new d.BufferGeometry();
    y.setAttribute("position", new d.Float32BufferAttribute(C, 3)), y.setAttribute("uv", new d.Float32BufferAttribute(t, 2)), h && y.setAttribute("color", new d.Float32BufferAttribute(w, 3)), y.setIndex(r), y.computeVertexNormals();
    let M = new d.Mesh(y, i);
    return M.receiveShadow = true, x.add(M), M;
  }
  g(-10.2, 10.2, 0.018, e.gravel), g(-7.7, 7.7, 0.028, e.asphalt), g(-7.78, -7.61, 0.041, e.white), g(7.61, 7.78, 0.041, e.white);
  let c = new d.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, side: d.DoubleSide });
  g(-9.05, -7.85, 0.039, c, true), g(7.85, 9.05, 0.039, c, true);
  let L = Array.from({ length: 361 }, (z, b) => {
    let n = b / 360, i = o.pit.getPointAt(n), h = o.pit.getTangentAt(n);
    return { p: i, n: J(-h.z, 0, h.x) };
  }), P = [], G = [], S = [];
  L.forEach((z, b) => {
    for (let n of [-1, 1]) P.push(z.p.x + z.n.x * n * 3.4, 0.032, z.p.z + z.n.z * n * 3.4), G.push(n, b / 5);
    if (b < L.length - 1) {
      let n = b * 2;
      S.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  });
  let l = new d.BufferGeometry();
  l.setAttribute("position", new d.Float32BufferAttribute(P, 3)), l.setAttribute("uv", new d.Float32BufferAttribute(G, 2)), l.setIndex(S), l.computeVertexNormals();
  let a = new d.Mesh(l, e.asphalt);
  a.receiveShadow = true, x.add(a);
  let k = o.curve.getPointAt(0), j = o.curve.getTangentAt(0), I = J(-j.z, 0, j.x), v = new d.Group();
  v.position.copy(k);
  for (let z = 0; z < 4; z++) for (let b = 0; b < 20; b++) {
    let n = new d.Mesh(new d.PlaneGeometry(0.78, 0.78), (z + b) % 2 ? e.dark : e.white);
    n.rotation.x = -Math.PI / 2, n.rotation.z = Math.atan2(I.z, I.x), n.position.copy(I.clone().multiplyScalar((b - 9.5) * 0.78)).addScaledVector(j, (z - 1.5) * 0.78), n.position.y = 0.05, v.add(n);
  }
  x.add(v);
  let E = [];
  for (let z of [-1, 1]) for (let b = 0; b < p - 1; b += 5) {
    let n = T[b], i = T[Math.min(b + 5, p - 1)];
    if (z > 0 && (n.u < 0.12 || n.u > 0.955)) continue;
    let h = n.p.clone().addScaledVector(n.n, z * 24), C = true;
    for (let w = 0; w < p - 1; w += 8) if (T[w].p.distanceTo(h) < 12) {
      C = false;
      break;
    }
    if (!C) continue;
    let t = i.p.clone().addScaledVector(i.n, z * 24), r = t.clone().sub(h);
    r.length() > 15 || r.length() < 0.4 || E.push({ p: h.clone().add(t).multiplyScalar(0.5), d: r, len: r.length() });
  }
  let m = new d.InstancedMesh(new d.BoxGeometry(0.45, 0.74, 1), e.concrete, E.length), _ = new d.InstancedMesh(new d.CylinderGeometry(0.045, 0.045, 2.4, 5), e.steel, E.length), U = new d.Matrix4(), W = new d.Quaternion();
  E.forEach((z, b) => {
    W.setFromUnitVectors(J(0, 0, 1), z.d.clone().normalize()), U.compose(z.p.clone().add(J(0, 0.39, 0)), W, J(1, 1, z.len)), m.setMatrixAt(b, U), U.compose(z.p.clone().add(J(0, 1.9, 0)), new d.Quaternion(), J(1, 1, 1)), _.setMatrixAt(b, U);
  }), m.castShadow = true, x.add(m, _);
  let H = [];
  for (let z of E) for (let b of [1.05, 1.7, 2.4, 3.05]) {
    let n = z.p.clone().addScaledVector(z.d, -0.5), i = z.p.clone().addScaledVector(z.d, 0.5);
    H.push(n.x, b, n.z, i.x, b, i.z);
  }
  let D = new d.BufferGeometry();
  D.setAttribute("position", new d.Float32BufferAttribute(H, 3)), x.add(new d.LineSegments(D, new d.LineBasicMaterial({ color: 8227462, transparent: true, opacity: 0.7 })));
  let q = new d.Group();
  for (let z of [0, 5, 13]) {
    let b = o.corners[z], n = o.curve.getPointAt(b.u), i = o.curve.getTangentAt(b.u), h = J(-i.z, 0, i.x), C = new d.Mesh(new d.PlaneGeometry(65, 80), e.gravel);
    C.rotation.x = -Math.PI / 2, C.rotation.z = Math.atan2(i.x, i.z), C.position.copy(n).addScaledVector(h, z === 13 ? -54 : 48), C.position.y = 0.01, q.add(C);
  }
  return f.add(q), { group: x, pit: a, runoff: q };
}
import * as u from "three";
var oe = (f = 0, o = 0, e = 0) => new u.Vector3(f, o, e);
function ce(f, o, e) {
  let x = new u.Group();
  x.name = "Shanghai architectural study", f.add(x);
  let T = [], p = [], g = (t, r, w = x) => {
    let y = new u.Mesh(t, r);
    return y.castShadow = true, y.receiveShadow = true, w.add(y), y;
  };
  function c(t, r, w, y = x) {
    let M = g(new u.BoxGeometry(...t), w, y);
    return M.position.set(...r), M;
  }
  function L(t, r = 20, w = 3, y = "#e5e7d8", M = "#20363b") {
    let V = document.createElement("canvas");
    V.width = 1024, V.height = 128;
    let F = V.getContext("2d");
    F.fillStyle = M, F.fillRect(0, 0, 1024, 128), F.fillStyle = y, F.font = "600 69px sans-serif", F.textAlign = "center", F.fillText(t, 512, 89);
    let N = new u.CanvasTexture(V);
    return N.colorSpace = u.SRGBColorSpace, g(new u.PlaneGeometry(r, w), new u.MeshBasicMaterial({ map: N, side: u.FrontSide }));
  }
  let P = o.world([955, 220]).sub(o.world([682, 954])).normalize(), G = oe(-P.z, 0, P.x), S = o.world([815, 620]), l = Math.atan2(P.x, P.z), a = new u.Group();
  a.position.copy(S).addScaledVector(G, 55), a.rotation.y = l, x.add(a), c([41, 0.25, 378], [0, 0.08, 0], e.concrete, a);
  let k = c([41, 5, 378], [0, 11.5, 0], e.glass, a);
  c([0.45, 14, 378], [-20, 7, 0], e.dark, a);
  let j = c([40, 1.4, 386], [0, 15, 0], e.roof, a), I = c([43, 0.65, 388], [0, 16.2, 0], e.roof, a);
  T.push(I, k, j);
  for (let t = 0; t < 22; t++) {
    let r = -178.5 + t * 17, w = [2248272, 9058098, 4675182, 8483153][Math.floor(t / 2) % 4];
    c([0.5, 7.3, 0.35], [20.3, 3.65, r - 8], e.steel, a), c([33, 0.1, 15.5], [2, 0.26, r], e.concrete, a), c([0.12, 4.8, 15.2], [-15, 0.26 + 2.4, r], e.teal, a);
    let y = L("F1M  /  " + String(Math.floor(t / 2) + 1).padStart(2, "0"), 12, 1.2, "#e7e4cc", "#" + w.toString(16).padStart(6, "0"));
    a.add(y), y.position.set(20.65, 7.7, r), y.rotation.y = Math.PI / 2;
  }
  c([14, 0.018, 382], [29, 0.015, 0], e.concrete, a), c([0.35, 1, 430], [44.8, 0.52, 0], e.concrete, a);
  for (let t = 0; t < 11; t++) {
    let r = -170 + t * 34;
    c([0.14, 0.024, 13], [25.5, 0.04, r], e.white, a), c([8, 0.025, 0.14], [29.5, 0.04, r - 6.5], e.white, a), c([8, 0.025, 0.14], [29.5, 0.04, r + 6.5], e.white, a);
  }
  let v = new u.Group();
  v.position.copy(S).addScaledVector(G, -66), v.rotation.y = l, x.add(v), c([57, 3, 380], [0, 1.5, 0], e.dark, v);
  for (let t = 0; t < 14; t++) c([3.5, 1.1, 366], [-22 + t * 3.5, 3.55 + t * 1.25, 0], e.concrete, v);
  let E = new u.BoxGeometry(0.48, 0.55, 0.5), m = new u.InstancedMesh(E, e.red, 14 * 260), _ = new u.Matrix4(), U = 0;
  for (let t = 0; t < 14; t++) for (let r = 0; r < 260; r++) _.makeTranslation(-22 + t * 3.5, 4.4 + t * 1.25, -178 + r * 1.36), m.setMatrixAt(U++, _), m.setColorAt(U - 1, new u.Color(r % 40 < 4 ? 12827040 : (t + r) % 9 === 0 ? 4810347 : 12624013));
  v.add(m);
  let W = [], H = [];
  for (let t = 0; t <= 8; t++) for (let r = 0; r <= 16; r++) {
    let w = -34 + r / 16 * 76, y = -200 + t / 8 * 400, M = 29 + 6 * Math.cos((r / 16 - 0.5) * Math.PI) + 2 * Math.cos(t / 8 * Math.PI * 2);
    W.push(w, M, y);
  }
  for (let t = 0; t < 8; t++) for (let r = 0; r < 16; r++) {
    let w = t * 17 + r;
    H.push(w, w + 1, w + 17, w + 1, w + 18, w + 17);
  }
  let D = new u.BufferGeometry();
  D.setAttribute("position", new u.Float32BufferAttribute(W, 3)), D.setIndex(H), D.computeVertexNormals();
  let q = e.roof.clone();
  q.side = u.DoubleSide;
  let z = g(D, q, v);
  T.push(z);
  for (let t of [-184, -92, 0, 92, 184]) for (let r of [-28, 34]) g(new u.CylinderGeometry(0.7, 0.95, 30, 10), e.steel, v).position.set(r, 15, t);
  for (let t of [-200, 200]) {
    g(new u.CylinderGeometry(15, 14, 28, 32), e.red, v).position.set(9, 14, t);
    let w = g(new u.TorusGeometry(15, 0.6, 8, 40), e.gold, v);
    w.rotation.x = Math.PI / 2, w.position.set(9, 28, t);
  }
  let b = new u.Group();
  b.position.copy(S).addScaledVector(P, 27), b.rotation.y = l, x.add(b), c([139, 7, 19], [0, 30, 0], e.glass, b), c([145, 1.2, 25], [0, 34.4, 0], e.roof, b);
  let n = L("SHANGHAI  INTERNATIONAL  CIRCUIT", 90, 3.6);
  b.add(n), n.position.set(0, 30.2, -9.65), n.rotation.y = Math.PI;
  for (let t of [-61, 61]) c([7, 25, 13], [t, 12.5, 0], e.red, b);
  let i = o.corners[13].point;
  for (let t = 0; t < 6; t++) {
    let r = new u.Group();
    r.position.copy(i).add(oe(-28 + t * 38, 0, 83)), x.add(r), c([31, 2, 38], [0, 1, 0], e.concrete, r);
    for (let B = 0; B < 5; B++) c([31, 0.8, 4], [0, 2 + B * 0.8, 15 - B * 4], e.concrete, r);
    let w = g(new u.CylinderGeometry(0.45, 0.8, 16, 8), e.steel, r);
    w.position.y = 8;
    let y = [], M = [], V = 36, F = 7;
    for (let B = 0; B <= F; B++) for (let Z = 0; Z <= V; Z++) {
      let O = Z / V * Math.PI * 2, X = B / F, ne = 18 * X * (1 + 0.08 * Math.cos(O * 5));
      y.push(Math.cos(O) * ne, 16 + 3 * Math.sin(X * Math.PI * 0.8) + 1.3 * Math.cos(O * 5) * X * X, Math.sin(O) * ne * 0.82);
    }
    for (let B = 0; B < F; B++) for (let Z = 0; Z < V; Z++) {
      let O = B * (V + 1) + Z;
      M.push(O, O + 1, O + V + 1, O + 1, O + V + 2, O + V + 1);
    }
    let N = new u.BufferGeometry();
    N.setAttribute("position", new u.Float32BufferAttribute(y, 3)), N.setIndex(M), N.computeVertexNormals(), g(N, q, r);
  }
  let h = new u.Group();
  h.position.copy(S).addScaledVector(G, 123), h.rotation.y = l, x.add(h), c([75, 0.05, 290], [0, 0.03, 0], e.water, h);
  for (let t = 0; t < 8; t++) {
    let r = -120 + t * 34;
    c([22, 0.9, 22], [0, 1, r], e.concrete, h), c([18, 5.5, 18], [0, 4.2, r], e.glass, h), c([23, 0.8, 23], [0, 7.4, r], e.roof, h);
  }
  c([4, 0.35, 289], [0, 0.4, 0], e.concrete, h);
  let C = a.localToWorld(oe(2, 0.32, -8.5));
  return { root: x, pit: a, stand: v, mid: S, dir: P, normal: G, yaw: l, roofs: T, activeBay: C, setCutaway(t) {
    for (let r of T) r.visible = !t;
  } };
}
import * as R from "three";
function le(f, o, e, x) {
  let T = new R.Group();
  f.add(T);
  let p = new R.Mesh(new R.PlaneGeometry(3300, 2600), e.grass);
  p.rotation.x = -Math.PI / 2, p.position.y = -0.045, p.receiveShadow = true, T.add(p);
  let g = [], c = 132, L = () => (c = c * 1664525 + 1013904223 >>> 0, c / 4294967296);
  for (let l = 0; l < 1500 && g.length < 400; l++) {
    let a = (L() - 0.5) * 1900, k = (L() - 0.5) * 1550, j = new R.Vector3(a, 0, k), I = 1e9;
    for (let E = 0; E < o.samples.length; E += 12) I = Math.min(I, j.distanceToSquared(o.samples[E].p));
    if (I < 45 * 45) continue;
    let v = x.pit.worldToLocal(j.clone());
    Math.abs(v.x) < 160 && Math.abs(v.z) < 240 || g.push({ x: a, z: k, size: 5 + L() * 5 });
  }
  let P = new R.InstancedMesh(new R.IcosahedronGeometry(1, 1), new R.MeshStandardMaterial({ color: 4154695, roughness: 1 }), g.length), G = new R.InstancedMesh(new R.CylinderGeometry(0.35, 0.55, 1, 5), e.dark, g.length), S = new R.Matrix4();
  return g.forEach((l, a) => {
    S.compose(new R.Vector3(l.x, l.size * 0.8, l.z), new R.Quaternion(), new R.Vector3(l.size * 0.65, l.size * 0.75, l.size * 0.65)), P.setMatrixAt(a, S), P.setColorAt(a, new R.Color().setHSL(0.27 + a % 7 * 8e-3, 0.18, 0.36 + a % 5 * 0.018)), S.compose(new R.Vector3(l.x, l.size * 0.33, l.z), new R.Quaternion(), new R.Vector3(1, l.size * 0.66, 1)), G.setMatrixAt(a, S);
  }), P.castShadow = true, T.add(P, G), T;
}
import * as s from "three";
var Q = (f = 0, o = 0, e = 0) => new s.Vector3(f, o, e);
function de(f, o, e, x, T) {
  let p = new s.Group();
  p.name = "Track finish, spectators and furnishings", f.add(p);
  let g = (n, i, h) => {
    let C = new s.InstancedMesh(n, i, h);
    return p.add(C), C;
  }, c = new s.Matrix4(), L = new s.Quaternion(), P = [], G = [], S = [], l = [];
  o.samples.forEach((n, i) => {
    let h = n.u, C = o.curve.getTangentAt(h), t = Q(-C.z, 0, C.x).normalize(), r = o.curve.getTangentAt((h + 0.998) % 1), w = r.x * C.z - r.z * C.x, y = s.MathUtils.clamp(w * 90, -2.2, 2.2);
    for (let M of [y - 1.15, y + 1.15]) G.push(n.p.x + t.x * M, n.p.y + 0.058, n.p.z + t.z * M), l.push(M, i * 0.08);
    if (i < o.samples.length - 1) {
      let M = i * 2;
      S.push(M, M + 1, M + 2, M + 1, M + 3, M + 2);
    }
  });
  let a = new s.BufferGeometry();
  a.setAttribute("position", new s.Float32BufferAttribute(G, 3)), a.setAttribute("uv", new s.Float32BufferAttribute(l, 2)), a.setIndex(S), a.computeVertexNormals();
  let k = document.createElement("canvas");
  k.width = 64, k.height = 128;
  let j = k.getContext("2d");
  for (let n = 0; n < 64; n++) {
    let i = Math.sin(n / 63 * Math.PI) ** 2;
    j.fillStyle = "rgba(10,13,15," + i * (0.16 + 0.12 * (Math.sin(n * 19) + 1) / 2) + ")", j.fillRect(n, 0, 1, 128);
  }
  let I = new s.CanvasTexture(k);
  I.wrapS = I.wrapT = s.RepeatWrapping;
  let v = new s.MeshStandardMaterial({ map: I, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), E = new s.Mesh(a, v);
  E.receiveShadow = true, p.add(E);
  let m = [], _ = T === "suzuka" ? 15 : 14, U = T === "suzuka" ? 290 : 260, W = 419, H = () => (W = W * 1664525 + 1013904223 >>> 0, W / 4294967296);
  e.stand.updateWorldMatrix(true, false);
  for (let n = 0; n < _; n++) for (let i = 0; i < U; i++) {
    if (H() > 0.58) continue;
    let h = T === "suzuka" ? Q(23 - n * 3.4, 4.12 + n, -195 + i * 1.35) : Q(-22 + n * 3.5, 4.65 + n * 1.25, -178 + i * 1.36);
    h.applyMatrix4(e.stand.matrixWorld), m.push({ p: h, color: [7634809, 13678235, 10830133, 14998984, 3560290, 4352855][Math.floor(H() * 6)] });
  }
  let D = g(new s.CylinderGeometry(0.19, 0.23, 0.54, 5), x.white, m.length), q = g(new s.SphereGeometry(0.14, 6, 4), new s.MeshStandardMaterial({ color: 13086609, roughness: 1 }), m.length);
  m.forEach((n, i) => {
    c.compose(n.p, L, Q(1, 1, 1)), D.setMatrixAt(i, c), D.setColorAt(i, new s.Color(n.color)), c.compose(n.p.clone().add(Q(0, 0.4, 0)), L, Q(1, 1, 1)), q.setMatrixAt(i, c);
  });
  let z = (n, i, h, C = p) => {
    let t = new s.Mesh(new s.BoxGeometry(...n), h);
    return t.position.copy(i), t.castShadow = t.receiveShadow = true, C.add(t), t;
  };
  for (let n = 0; n < 7; n++) {
    let i = e.mid.clone().addScaledVector(e.normal, T === "suzuka" ? 123 : 170).addScaledVector(e.dir, -145 + n * 43);
    i.y = T === "suzuka" ? o.terrainHeight(i.x, i.z) : 0;
    let h = new s.Mesh(new s.CylinderGeometry(0.08, 0.11, 12, 7), x.steel);
    h.position.copy(i).add(Q(0, 6, 0)), p.add(h);
    let C = document.createElement("canvas");
    C.width = 256, C.height = 144;
    let t = C.getContext("2d");
    if (t.fillStyle = T === "suzuka" ? "#eee9db" : "#ae3931", t.fillRect(0, 0, 256, 144), t.fillStyle = T === "suzuka" ? "#b13e3b" : "#dbc68a", t.beginPath(), T === "suzuka") t.arc(128, 72, 40, 0, 7);
    else for (let M = 0; M < 10; M++) {
      let V = M * Math.PI / 5 - Math.PI / 2, F = M % 2 ? 15 : 36;
      t.lineTo(56 + Math.cos(V) * F, 48 + Math.sin(V) * F);
    }
    if (t.fill(), T === "shanghai") for (let [M, V] of [[105, 23], [126, 48], [126, 79], [105, 104]]) {
      t.beginPath();
      for (let F = 0; F < 10; F++) {
        let N = F * Math.PI / 5 - Math.PI / 2, B = F % 2 ? 5 : 11;
        t.lineTo(M + Math.cos(N) * B, V + Math.sin(N) * B);
      }
      t.fill();
    }
    let r = new s.CanvasTexture(C);
    r.colorSpace = s.SRGBColorSpace;
    let w = new s.PlaneGeometry(4.4, 2.45, 12, 5);
    w.translate(2.2, 0, 0);
    let y = new s.Mesh(w, new s.MeshStandardMaterial({ map: r, side: s.DoubleSide, roughness: 0.85 }));
    y.position.copy(i).add(Q(0, 10.4, 0)), y.rotation.y = e.yaw, y.userData.base = w.attributes.position.array.slice(), p.add(y), P.push(y);
  }
  let b = new s.MeshStandardMaterial({ color: 16115132, emissive: 16768421, emissiveIntensity: 0.7, roughness: 0.5 });
  for (let n of [-144, -76, -8, 60, 128]) {
    let i = z([22, 0.06, 0.22], Q(0, 6.7, n), b, e.pit);
    i.name = "Pit ceiling strip", p.attach(i);
  }
  for (let n of o.corners.filter((i, h) => [0, o.corners.length - 3].includes(h))) for (let i of [100, 50]) {
    let h = (n.u - i / o.length + 1) % 1, C = o.curve.getPointAt(h), t = o.curve.getTangentAt(h), r = Q(-t.z, 0, t.x).normalize();
    C.addScaledVector(r, -14);
    let w = new s.Group();
    w.position.copy(C).add(Q(0, 1.25, 0)), w.rotation.y = Math.atan2(-t.x, -t.z), p.add(w), z([1.7, 2, 0.13], Q(), x.white, w);
    let y = document.createElement("canvas");
    y.width = 128, y.height = 128;
    let M = y.getContext("2d");
    M.fillStyle = "#e8e6db", M.fillRect(0, 0, 128, 128), M.fillStyle = "#25373b", M.font = "bold 53px sans-serif", M.textAlign = "center", M.fillText(String(i), 64, 85);
    let V = new s.CanvasTexture(y);
    V.colorSpace = s.SRGBColorSpace;
    for (let [F, N] of [[0.071, 0], [-0.071, Math.PI]]) {
      let B = new s.Mesh(new s.PlaneGeometry(1.6, 1.9), new s.MeshBasicMaterial({ map: V, side: s.FrontSide }));
      B.position.z = F, B.rotation.y = N, w.add(B);
    }
  }
  return { root: p, crowdCount: m.length, update(n) {
    for (let i of P) {
      let h = i.geometry.attributes.position, C = i.userData.base;
      for (let t = 0; t < h.count; t++) {
        let r = C[t * 3], w = C[t * 3 + 1];
        h.setZ(t, Math.sin(r * 1.7 - n * 2.3 + w * 0.5) * 0.19 * r / 4.4 + Math.sin(r * 3.1 - n * 3.5) * 0.06 * r / 4.4);
      }
      h.needsUpdate = true;
    }
  }, setQuality(n) {
    q.visible = n !== "low";
  } };
}
import * as A from "three";
var $ = (f = 0, o = 0, e = 0) => new A.Vector3(f, o, e), ue = { day: { label: "\u0E01\u0E25\u0E32\u0E07\u0E27\u0E31\u0E19", top: 7445947, horizon: 14016476, sun: 16773336, sky: 14938093, ground: 5399372, power: 2.65, fill: 1.4, exposure: 1.03, density: 14e-5, offset: $(-300, 620, -250) }, late: { label: "\u0E41\u0E2A\u0E07\u0E40\u0E22\u0E47\u0E19", top: 7903921, horizon: 14927788, sun: 16764052, sky: 14343125, ground: 5852227, power: 2.45, fill: 1.25, exposure: 1.01, density: 19e-5, offset: $(-570, 270, 190) }, cloud: { label: "\u0E1F\u0E49\u0E32\u0E04\u0E23\u0E36\u0E49\u0E21", top: 10793915, horizon: 14278102, sun: 14870501, sky: 14477288, ground: 6252886, power: 0.85, fill: 2, exposure: 1.08, density: 21e-5, offset: $(-300, 620, -250) } }, ee = class {
  constructor(o, e) {
    this.scene = o, this.renderer = e, this.previous = { fog: o.fog, background: o.background, exposure: e.toneMappingExposure }, this.root = new A.Group(), this.root.name = "Circuit daylight and atmosphere", o.add(this.root), this.fill = new A.HemisphereLight(16777215, 5399372, 1.4), this.sun = new A.DirectionalLight(16773077, 2.65), this.sun.castShadow = true, this.sun.shadow.mapSize.set(2048, 2048), Object.assign(this.sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 1, far: 1600 }), this.sun.shadow.normalBias = 0.045, this.sun.shadow.bias = -8e-5, this.sun.shadow.radius = 2, this.root.add(this.fill, this.sun, this.sun.target), this.uniforms = { top: { value: new A.Color() }, horizon: { value: new A.Color() }, direction: { value: $(-0.4, 0.75, -0.3).normalize() }, glow: { value: new A.Color(16773075) } }, this.sky = new A.Mesh(new A.SphereGeometry(1, 32, 16), new A.ShaderMaterial({ side: A.BackSide, depthWrite: false, fog: false, uniforms: this.uniforms, vertexShader: "varying vec3 vRay;void main(){vRay=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}", fragmentShader: `varying vec3 vRay;uniform vec3 top;uniform vec3 horizon;uniform vec3 direction;uniform vec3 glow;void main(){vec3 r=normalize(vRay);float h=pow(max(r.y,0.),.42);vec3 c=mix(horizon,top,h);float s=pow(max(dot(r,direction),0.),160.);c+=glow*s*.27;gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}` })), this.sky.frustumCulled = false, this.sky.renderOrder = -100, this.root.add(this.sky), o.fog = new A.FogExp2(14016476, 14e-5), this.setPreset("day", true);
  }
  setPreset(o, e = false) {
    this.name = ue[o] ? o : "day", this.target = ue[this.name], e && this.mix(1);
  }
  mix(o) {
    let e = this.target;
    this.uniforms.top.value.lerp(new A.Color(e.top), o), this.uniforms.horizon.value.lerp(new A.Color(e.horizon), o), this.uniforms.glow.value.lerp(new A.Color(e.sun), o), this.fill.color.lerp(new A.Color(e.sky), o), this.fill.groundColor.lerp(new A.Color(e.ground), o), this.sun.color.lerp(new A.Color(e.sun), o), this.sun.intensity = A.MathUtils.lerp(this.sun.intensity, e.power, o), this.fill.intensity = A.MathUtils.lerp(this.fill.intensity, e.fill, o), this.renderer.toneMappingExposure = A.MathUtils.lerp(this.renderer.toneMappingExposure, e.exposure, o), this.scene.fog?.color.lerp(new A.Color(e.horizon), o), this.scene.fog && (this.scene.fog.density = A.MathUtils.lerp(this.scene.fog.density, e.density, o)), this.offset ?? (this.offset = e.offset.clone()), this.offset.lerp(e.offset, o), this.uniforms.direction.value.copy(this.offset).normalize();
  }
  update(o, e, x) {
    this.mix(1 - Math.exp(-Math.max(0, o) * 2.2)), e.getWorldPosition(this.sky.position), this.sun.target.position.copy(x), this.sun.position.copy(x).add(this.offset);
  }
  quality(o) {
    let e = o === "low" ? 1024 : 2048;
    this.sun.shadow.mapSize.x !== e && (this.sun.shadow.map?.dispose(), this.sun.shadow.map = null, this.sun.shadow.mapSize.set(e, e)), this.sun.castShadow = o !== "low";
  }
  dispose() {
    this.root.removeFromParent(), this.sky.geometry.dispose(), this.sky.material.dispose(), this.sun.shadow.map?.dispose(), this.scene.fog = this.previous.fog, this.scene.background = this.previous.background, this.renderer.toneMappingExposure = this.previous.exposure;
  }
};
var te = { id: "shanghai", name: "Shanghai International Circuit", lengthMetres: 5451, roadWidthMetres: 15.4, corners: 16, garageYawSign: -1, overviewAxis: [0.32, 1.9, 1] };
function Pe({ scene: f, renderer: o, environment: e = true, detail: x = true, quality: T = "balanced" } = {}) {
  if (!f || !o) throw Error("mountCircuit requires a Three.js scene and renderer");
  let p = new K.Group();
  p.name = te.id + " / PRESENTATION 02", f.add(p);
  let g = se(K), c = ae(), L = ie(p, g, c), P = ce(p, g, c), G = le(p, g, c, P), S = x ? de(p, g, P, c, te.id) : null, l = e ? new ee(f, o) : null, a = false, k = T, j = { root: p, track: g, materials: c, circuit: L, architecture: P, landscape: G, finish: S, environment: l, metadata: { ...te, version: "PRESENTATION 02", units: "metres", up: "Y", carForward: "-Z", surveyed: false, collision: false, racingAI: false }, sampleRoute(I, v = "track", E = 0) {
    let m = v === "pit" ? g.pit : g.curve, _ = m.getLength(), U = v === "pit" ? K.MathUtils.clamp(I, 0, _) : (I % _ + _) % _, W = U / _, H = m.getPointAt(W), D = m.getTangentAt(W), q = new K.Vector3(-D.z, 0, D.x).normalize();
    return H.addScaledVector(q, E), { distance: U, u: W, position: H, tangent: D, normal: q };
  }, setLighting(I) {
    l?.setPreset(I);
  }, setQuality(I) {
    k = ["low", "balanced", "high"].includes(I) ? I : "balanced", l?.quality(k), S?.setQuality(k);
  }, update({ dt: I = 0, time: v = 0, camera: E, focus: m } = {}) {
    a || (P.update?.(v), S?.update(v), l && E && l.update(I, E, m ?? P.mid));
  }, dispose() {
    if (a) return;
    a = true, l?.dispose();
    let I = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set();
    p.traverse((m) => {
      m.geometry && I.add(m.geometry);
      for (let _ of m.material ? Array.isArray(m.material) ? m.material : [m.material] : []) {
        v.add(_);
        for (let U of Object.values(_)) U?.isTexture && E.add(U);
      }
    });
    for (let m of Object.values(c)) {
      v.add(m);
      for (let _ of Object.values(m)) _?.isTexture && E.add(_);
    }
    p.removeFromParent();
    for (let m of I) m.dispose();
    for (let m of v) m.dispose();
    for (let m of E) m.dispose();
  } };
  return j.setQuality(k), j;
}
export {
  Pe as mountCircuit
};

export { se as createAuthoredTrack33 };
