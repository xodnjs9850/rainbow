// Three.js 3D 뷰어. GLB를 띄우고, 없으면 절차적 캐릭터로 대체한다. WebGL이 없으면 mount가 null을 돌려준다.
// GLB는 file://에서 fetch가 막히므로 opts.glbData(base64, assets/toto.glb.js가 제공)로 파싱한다. http로 열릴 때만 opts.glb URL을 fetch한다.
window.LB_VIEWER = (function () {
  var T = window.THREE, lastHandle = null, supportedCache = null;
  var COLORS = { blue: 0x3B82F6, yellow: 0xF59E0B, green: 0x22C55E };
  function supported() {
    if (supportedCache !== null) return supportedCache;
    if (!T) return (supportedCache = false);
    try {
      var c = document.createElement("canvas"), gl = c.getContext("webgl2") || c.getContext("webgl");
      supportedCache = !!gl;
      if (gl) { var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext(); }
    } catch (e) { supportedCache = false; }
    return supportedCache;
  }
  function b64ToBuf(b64) { var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function toon(hex) { return new T.MeshToonMaterial({ color: hex }); }
  // 절차적 캐릭터: 머리·몸통·눈·팔 + 동물별 특징. 높이 약 3.2, 바닥 y≈-1.2.
  function procedural(animal, hex) {
    var g = new T.Group(), m = toon(hex), dark = new T.MeshStandardMaterial({ color: 0x1F2937 }); g.name = "lbModel";
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
  // BLE Core Insert 조립체: 코어 박스·버튼·LED·부저 3점·배터리·keep-out 판. 절차적 모델 기준 위치(몸통 y≈-0.3)로 초기화하며, GLB에서는 fit() 결과로 재배치한다.
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
  // 재질 없는 모델에 토우 재질 적용. 기존 재질은 해제한다.
  function colorize(obj, hex) {
    obj.traverse(function (o) {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])).forEach(function (m) { m.dispose(); });
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      o.material = toon(hex);
    });
    return obj;
  }
  function fit(obj) { // 높이 2.6/폭 3.4에 맞춰 스케일·중심 정렬, 바닥 y=-1.2. 스케일·배치 후의 월드 박스를 돌려준다(코어 재배치용).
    var b = new T.Box3().setFromObject(obj), size = new T.Vector3(), c = new T.Vector3(); b.getSize(size); b.getCenter(c);
    var s = Math.min(3.0 / Math.max(size.y, 1e-6), 3.6 / Math.max(size.x, size.z, 1e-6));
    obj.scale.setScalar(s);
    obj.position.set(-c.x * s, -b.min.y * s - 1.4, -c.z * s);
    return new T.Box3().setFromObject(obj);
  }
  // opts: { glb?, glbData?(base64), animal?, color?("blue"|"yellow"|"green" 또는 0xRRGGBB), onReady?(kind) }
  function mount(el, opts) {
    opts = opts || {};
    if (!supported() || !el) return null;
    if (lastHandle) lastHandle.dispose(); // 뷰어는 항상 하나만 산다.
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
    var raf = 0, alive = true;
    function ready(k) { kind = k; if (opts.onReady) opts.onReady(k); }
    function useProcedural() {
      if (!alive) return;
      model = procedural(opts.animal || "rabbit", hex); scene.add(model); ready("procedural"); if (inserted) applyInsert(true);
    }
    function onGltf(gltf) {
      if (!alive) return;
      model = gltf.scene; model.name = "lbModel";
      // Meshy 미리보기처럼 재질이 없는 GLB는 캐릭터 색 토우 재질을 입힌다(기본 회색 방지).
      var json = gltf.parser && gltf.parser.json; if (!json || !json.materials || !json.materials.length) colorize(model, hex);
      var box = fit(model); scene.add(model);
      core.position.set(0, box.min.y + (box.max.y - box.min.y) * 0.3, box.max.z - (box.max.z - box.min.z) / 3); // 몸통(아래 30%) 앞쪽
      ready("glb"); if (inserted) applyInsert(true);
    }
    if (opts.glbData) {
      try { new T.GLTFLoader().parse(b64ToBuf(opts.glbData), "", onGltf, function () { if (!alive) return; setTimeout(useProcedural, 0); }); }
      catch (e) { if (alive) setTimeout(useProcedural, 0); }
    } else if (opts.glb && location.protocol !== "file:") {
      new T.GLTFLoader().load(opts.glb, onGltf, undefined, function () { if (!alive) return; useProcedural(); });
    } else useProcedural();
    function applyInsert(on) {
      core.visible = on;
      if (!model) return;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        if (on) {
          if (!o.userData.lbOrig) {
            o.userData.lbOrig = o.material;
            o.material = Array.isArray(o.material) ? o.material.map(function (m) { return m.clone(); }) : o.material.clone();
          }
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.transparent = true; m.opacity = 0.35; m.depthWrite = false; m.needsUpdate = true; });
        } else if (o.userData.lbOrig) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); });
          o.material = o.userData.lbOrig; delete o.userData.lbOrig;
        }
      });
    }
    function setInsert(on) { inserted = !!on; applyInsert(inserted); }
    function onEnter() { controls.autoRotate = false; }
    function onLeave() { controls.autoRotate = true; }
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    var ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(function () {
        w = el.clientWidth || w; h = el.clientHeight || h;
        renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
      });
      ro.observe(el);
    }
    function loop() {
      if (!alive) return;
      if (renderer.domElement.isConnected) { controls.update(); renderer.render(scene, camera); }
      raf = requestAnimationFrame(loop);
    }
    loop();
    function dispose() {
      alive = false; cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter); el.removeEventListener("mouseleave", onLeave);
      if (ro) ro.disconnect();
      scene.traverse(function (o) {
        if (!o.isMesh) return;
        if (o.geometry) o.geometry.dispose();
        var mats = (Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []));
        if (o.userData.lbOrig) mats = mats.concat(Array.isArray(o.userData.lbOrig) ? o.userData.lbOrig : [o.userData.lbOrig]); // 삽입 중 dispose: 원본 재질도 해제
        mats.forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      scene.clear();
      controls.dispose(); renderer.dispose(); renderer.forceContextLoss();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (lastHandle === handle) lastHandle = null;
    }
    var handle = { setInsert: setInsert, insert: function () { return inserted; }, kind: function () { return kind; }, dispose: dispose, scene: scene };
    lastHandle = handle; return handle;
  }
  function last() { return lastHandle; }
  return { supported: supported, mount: mount, procedural: procedural, coreAssembly: coreAssembly, colorize: colorize, last: last, COLORS: COLORS };
})();
