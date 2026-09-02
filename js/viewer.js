// Three.js 3D 뷰어. GLB를 띄우고, 없으면 절차적 캐릭터로 대체한다. WebGL이 없으면 mount가 null을 돌려준다.
// GLB는 file://에서 fetch가 막히므로 opts.glbData(base64, assets/toto.glb.js가 제공)로 파싱한다. http로 열릴 때만 opts.glb URL을 fetch한다.
window.LB_VIEWER = (function () {
  var T = window.THREE, lastHandle = null;
  var COLORS = { blue: 0x3B82F6, yellow: 0xF59E0B, green: 0x22C55E };
  function supported() {
    if (!T) return false;
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  function b64ToBuf(b64) { var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function toon(hex) { return new T.MeshToonMaterial({ color: hex }); }
  // 절차적 캐릭터: 머리·몸통·눈·팔 + 동물별 특징. 높이 약 3.2, 바닥 y≈-1.2.
  function procedural(animal, hex) {
    var g = new T.Group(), m = toon(hex), dark = new T.MeshStandardMaterial({ color: 0x1F2937 });
    var head = new T.Mesh(new T.SphereGeometry(0.8, 48, 48), m); head.position.y = 1; g.add(head);
    var body = new T.Mesh(new T.CapsuleGeometry(0.5, 0.6, 8, 24), m); body.position.y = -0.3; g.add(body);
    [-0.28, 0.28].forEach(function (x) { var e = new T.Mesh(new T.SphereGeometry(0.09, 16, 16), dark); e.position.set(x, 1.1, 0.72); g.add(e); });
    [-0.7, 0.7].forEach(function (x) { var a = new T.Mesh(new T.CapsuleGeometry(0.12, 0.5, 6, 12), m); a.position.set(x, -0.2, 0); a.rotation.z = x < 0 ? 0.5 : -0.5; g.add(a); });
    if (animal === "cat") {
      [-0.45, 0.45].forEach(function (x) { var e = new T.Mesh(new T.ConeGeometry(0.28, 0.6, 4), m); e.position.set(x, 1.75, 0); e.rotation.y = Math.PI / 4; g.add(e); });
    } else if (animal === "dino") {
      [-0.35, 0, 0.35].forEach(function (x, i) { var s = new T.Mesh(new T.ConeGeometry(0.16, 0.5, 8), m); s.position.set(x, 1.7 + (i === 1 ? 0.1 : 0), -0.2); g.add(s); });
      var tail = new T.Mesh(new T.ConeGeometry(0.22, 0.9, 12), m); tail.position.set(0, -0.6, -0.7); tail.rotation.x = -1.2; g.add(tail);
    } else { // rabbit
      [-0.35, 0.35].forEach(function (x) { var e = new T.Mesh(new T.CapsuleGeometry(0.16, 0.9, 8, 16), m); e.position.set(x, 2, 0); e.rotation.z = x < 0 ? 0.15 : -0.15; g.add(e); });
    }
    return g;
  }
  // 빗금 텍스처(안테나 keep-out)
  function hatchTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 64; var x = c.getContext("2d");
    x.fillStyle = "rgba(220,38,38,.18)"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#DC2626"; x.lineWidth = 3;
    for (var i = -64; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 64, 0); x.stroke(); }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 1); return t;
  }
  // BLE Core Insert 조립체: 코어 박스·버튼·LED·부저 3점·배터리·keep-out 판. 몸통 위치(y≈-0.3) 기준.
  function coreAssembly() {
    var g = new T.Group();
    var box = new T.Mesh(new T.BoxGeometry(0.72, 0.48, 0.16), new T.MeshStandardMaterial({ color: 0x1F4E79, transparent: true, opacity: 0.9 })); g.add(box);
    var btn = new T.Mesh(new T.SphereGeometry(0.07, 16, 16), new T.MeshStandardMaterial({ color: 0xF59E0B })); btn.position.set(-0.2, 0.08, 0.1); g.add(btn);
    var led = new T.Mesh(new T.BoxGeometry(0.12, 0.08, 0.04), new T.MeshStandardMaterial({ color: 0x22C55E, emissive: 0x16A34A, emissiveIntensity: 0.6 })); led.position.set(0.18, 0.1, 0.1); g.add(led);
    [-0.08, 0, 0.08].forEach(function (x) { var d = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.05, 8), new T.MeshStandardMaterial({ color: 0x374151 })); d.position.set(x - 0.15, -0.12, 0.1); d.rotation.x = Math.PI / 2; g.add(d); });
    var bat = new T.Mesh(new T.BoxGeometry(0.2, 0.12, 0.06), new T.MeshStandardMaterial({ color: 0xD1D5DB })); bat.position.set(0.18, -0.12, 0.1); g.add(bat);
    var keep = new T.Mesh(new T.PlaneGeometry(0.72, 0.18), new T.MeshBasicMaterial({ map: hatchTexture(), transparent: true, side: T.DoubleSide })); keep.position.set(0, 0.36, 0.09); g.add(keep);
    g.position.set(0, -0.3, 0.3);
    return g;
  }
  function fit(obj) { // 높이 2.6에 맞춰 스케일·중심 정렬, 바닥 y=-1.2
    var b = new T.Box3().setFromObject(obj), size = new T.Vector3(), c = new T.Vector3(); b.getSize(size); b.getCenter(c);
    var s = 2.6 / Math.max(size.y, 1e-6); obj.scale.setScalar(s);
    obj.position.set(-c.x * s, -b.min.y * s - 1.2, -c.z * s);
  }
  // opts: { glb?, glbData?(base64), animal?, color?("blue"|"yellow"|"green" 또는 0xRRGGBB), onReady?(kind) }
  function mount(el, opts) {
    opts = opts || {};
    if (!supported() || !el) return null;
    var w = el.clientWidth || 320, h = el.clientHeight || 300;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h);
    el.appendChild(renderer.domElement);
    var scene = new T.Scene(), camera = new T.PerspectiveCamera(38, w / h, 0.1, 100); camera.position.set(0, 0.6, 5.2);
    scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, 1.1));
    var sun = new T.DirectionalLight(0xffffff, 1.3); sun.position.set(3, 5, 4); scene.add(sun);
    var controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableZoom = false; controls.autoRotate = true; controls.autoRotateSpeed = 3; controls.target.set(0, 0.2, 0);
    var hex = typeof opts.color === "number" ? opts.color : (COLORS[opts.color] || COLORS.blue);
    var model = null, kind = null, inserted = false, core = coreAssembly(); core.visible = false; scene.add(core);
    var originals = [];
    function ready(k) { kind = k; if (opts.onReady) opts.onReady(k); }
    function useProcedural() { model = procedural(opts.animal || "rabbit", hex); scene.add(model); ready("procedural"); if (inserted) applyInsert(true); }
    function onGltf(gltf) { model = gltf.scene; fit(model); scene.add(model); ready("glb"); if (inserted) applyInsert(true); }
    if (opts.glbData) {
      try { new T.GLTFLoader().parse(b64ToBuf(opts.glbData), "", onGltf, function () { setTimeout(useProcedural, 0); }); }
      catch (e) { setTimeout(useProcedural, 0); }
    } else if (opts.glb && location.protocol !== "file:") {
      new T.GLTFLoader().load(opts.glb, onGltf, undefined, function () { useProcedural(); });
    } else useProcedural();
    function applyInsert(on) {
      if (!model) return;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        if (!o.userData.lbOrig) { o.userData.lbOrig = o.material; o.material = Array.isArray(o.material) ? o.material.map(function (m) { return m.clone(); }) : o.material.clone(); originals.push(o); }
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.transparent = true; m.opacity = on ? 0.35 : 1; m.depthWrite = !on; m.needsUpdate = true; });
      });
      core.visible = on;
    }
    function setInsert(on) { inserted = !!on; applyInsert(inserted); }
    el.addEventListener("mouseenter", function () { controls.autoRotate = false; });
    el.addEventListener("mouseleave", function () { controls.autoRotate = true; });
    var raf = 0, alive = true;
    function loop() { if (!alive) return; controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); }
    loop();
    function dispose() {
      alive = false; cancelAnimationFrame(raf); controls.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (lastHandle === handle) lastHandle = null;
    }
    var handle = { setInsert: setInsert, insert: function () { return inserted; }, kind: function () { return kind; }, dispose: dispose, scene: scene };
    lastHandle = handle; return handle;
  }
  function last() { return lastHandle; }
  return { supported: supported, mount: mount, procedural: procedural, coreAssembly: coreAssembly, last: last, COLORS: COLORS };
})();
