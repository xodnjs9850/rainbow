# LIX Buddy 데모 — 실제 자산·Three.js 3D 뷰어 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 장면 2의 AI 그림을 실제 이미지(`assets/char-1~3.png`)로, 장면 3의 3D 미리보기를 Three.js 뷰어(`assets/toto.glb`, 없으면 절차적 3D)로 바꾼다. 자산이 없어도 데모가 깨지지 않는다.

**Architecture:** `vendor/three.bundle.js`(이미 반입됨, `window.THREE`에 Three.js + `GLTFLoader` + `OrbitControls`)를 classic script로 로드. 새 모듈 `js/viewer.js`(`window.LB_VIEWER`)가 캔버스 마운트·GLB 로드·절차적 대체·코어 삽입 표시·자동 회전을 담당하고, 장면 3은 뷰어를 한 번만 마운트하도록 렌더 구조를 "골격 1회 + 부분 갱신"으로 바꾼다. 장면 2는 `<img>`에 `onerror` SVG 대체.

**Tech Stack:** Three.js 0.170(번들), classic script, 기존 테스트 하네스(헤드리스 Edge에서 WebGL 동작 확인됨).

**Spec:** `docs/superpowers/specs/2026-09-02-lixbuddy-demo-site-design.md` §1 마지막 행, §3.3 행 2·3, §5 (이미 갱신됨)

**작업 폴더:** `C:\Users\xodnj\Desktop\project\rainbow`. 테스트 명령(공통):

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --dump-dom "file:///C:/Users/xodnj/Desktop/project/rainbow/test/test.html" 2>/dev/null | grep -E "PASS|FAIL|passed"
```

현재 `31 passed, 0 failed`. 이미 반입된 파일(커밋 전 상태): `vendor/three.bundle.js`, `tools/three-entry.js`, `tools/README.md`, `assets/README.md`, 설계서 수정.

---

### Task 1: 번들 반입 커밋 + 뷰어 모듈 `js/viewer.js`

**Files:**
- Commit as-is: `vendor/three.bundle.js`, `tools/`, `assets/README.md`, 설계서
- Create: `js/viewer.js`, `test/tests/t1-viewer.js`
- Modify: `test/test.html`(scripts 블록 맨 앞에 `../vendor/three.bundle.js`, `../js/art.js` 다음에 `../js/viewer.js`; tests 블록 t1-art 다음에 `tests/t1-viewer.js`), `demo.html`(같은 순서로 `vendor/three.bundle.js`를 첫 스크립트로, `js/viewer.js`를 `js/art.js` 다음에)

- [ ] **Step 1: 반입 파일 커밋**

```bash
git add vendor tools assets docs && git commit -m "chore: Three.js 오프라인 번들·자산 폴더 안내·설계서 갱신(실제 자산·3D 뷰어)"
```

- [ ] **Step 2: 실패하는 테스트** — `test/tests/t1-viewer.js`

```js
T.test("viewer: WebGL 지원 확인, 절차적 캐릭터 마운트, 코어 삽입 토글, dispose", function () {
  var V = window.LB_VIEWER; T.ok(V, "LB_VIEWER 없음"); T.ok(window.THREE && THREE.GLTFLoader, "THREE 번들 없음");
  T.ok(V.supported(), "헤드리스 Edge는 WebGL을 지원해야 한다");
  var el = T.stage('<div id="v1" style="width:320px;height:300px"></div>').querySelector("#v1");
  var h = V.mount(el, { animal: "cat", color: "yellow" });   // glb 없음 → 즉시 절차적
  T.ok(h, "핸들"); T.ok(el.querySelector("canvas"), "캔버스 생성"); T.eq(h.kind(), "procedural");
  T.eq(h.insert(), false); h.setInsert(true); T.eq(h.insert(), true); h.setInsert(false); T.eq(h.insert(), false);
  T.eq(V.last(), h, "마지막 핸들 노출(테스트용)");
  h.dispose(); T.ok(!el.querySelector("canvas"), "dispose 후 캔버스 제거");
});
T.test("viewer: 동물별 절차적 모델은 서로 다른 부품 수를 가진다", function () {
  var V = window.LB_VIEWER;
  var a = V.procedural("rabbit", 0x3B82F6).children.length, b = V.procedural("cat", 0x3B82F6).children.length, c = V.procedural("dino", 0x3B82F6).children.length;
  T.ok(a > 0 && b > 0 && c > 0); T.ok(!(a === b && b === c), "세 동물 형태가 다르다");
  T.ok(V.coreAssembly().children.length >= 6, "코어 조립체 6부품 이상");
});
```

- [ ] **Step 3: 실행해 실패 확인** — Expected: `FAIL viewer: ... — LB_VIEWER 없음` (test.html에 스크립트 태그를 먼저 넣었는데 파일이 없으면 404 콘솔 오류만 나고 다음 스크립트는 계속 로드된다).

- [ ] **Step 4: 뷰어 작성** — `js/viewer.js`

```js
// Three.js 3D 뷰어. GLB를 띄우고, 없으면 절차적 캐릭터로 대체한다. WebGL이 없으면 mount가 null을 돌려준다.
// 외부 요청 없음: vendor/three.bundle.js와 assets/의 로컬 파일만 쓴다.
window.LB_VIEWER = (function () {
  var T = window.THREE, lastHandle = null;
  var COLORS = { blue: 0x3B82F6, yellow: 0xF59E0B, green: 0x22C55E };
  function supported() {
    if (!T) return false;
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
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
  // opts: { glb?, animal?, color?("blue"|"yellow"|"green" 또는 0xRRGGBB), onReady?(kind) }
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
    if (opts.glb) {
      new T.GLTFLoader().load(opts.glb, function (gltf) {
        model = gltf.scene; fit(model); scene.add(model); ready("glb"); if (inserted) applyInsert(true);
      }, undefined, function () { useProcedural(); });
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
```

- [ ] **Step 5: 실행해 통과 확인** — Expected: `33 passed, 0 failed`. 실패하면 `node --check js/viewer.js`와 콘솔 오류를 본다. `OrbitControls`가 `document` 이벤트를 걸기 때문에 테스트 페이지에서 경고가 날 수 있으나 오류는 아니다.

- [ ] **Step 6: 커밋**

```bash
git add js/viewer.js test demo.html && git commit -m "feat: Three.js 3D 뷰어 모듈 — GLB 로드·절차적 대체·코어 삽입·자동 회전"
```

---

### Task 2: 장면 3을 뷰어로 교체

**Files:**
- Modify: `js/scenes/s3-model.js`, `test/tests/t3-s3.js`, `css/studio.css`

- [ ] **Step 1: 테스트 수정** — `test/tests/t3-s3.js` 전체를 다음으로 교체

```js
T.test("s3: Tripo 작업이 success에 도달하면 BLE 코어 넣기가 열리고 3D 뷰어가 삽입 상태로 바뀐다", function () {
  restoreScenes(); var s = sceneById(3); T.eq(s.mode, "student");
  var root = T.stage('<div style="width:1400px"></div>'); s.reset(); s.render(root, LB_DATA); // sync → stage=2
  T.has(root, "task_demo_7f3a"); T.eq(root.querySelectorAll(".stages li").length, 3);
  T.eq(root.querySelectorAll(".stages li.done").length, 2); T.has(root.querySelector(".stages li.cur"), "success");
  T.has(root.querySelector("#s3-time"), "48초");
  T.ok(root.querySelector("#s3-view canvas"), "뷰어 캔버스"); T.has(root, "시연용 미리보기");
  var h = LB_VIEWER.last(); T.ok(h, "뷰어 핸들"); T.eq(h.insert(), false);
  T.ok(root.querySelector("#s3-legend").hidden, "처음엔 범례 숨김");
  T.ok(!root.querySelector("#s3-insert").disabled);
  root.querySelector("#s3-insert").click();
  T.eq(h.insert(), true); T.ok(!root.querySelector("#s3-legend").hidden); T.has(root.querySelector("#s3-legend"), "keep-out");
  T.ok(root.querySelector("#s3-done")); T.ok(root.querySelector("#s3-insert").disabled);
  T.ok(root.querySelector("#s3-view canvas"), "삽입 후에도 같은 캔버스(재마운트 없음)");
  T.has(root, "42×28×9mm"); T.has(root, "0.25mm/side");
  s.reset(); T.ok(!root.querySelector("#s3-view canvas"), "reset이 뷰어를 dispose");
});
T.test("s3: sync가 아니면 처음엔 queued이고 버튼이 잠겨 있다", function () {
  restoreScenes(); var s = sceneById(3); LB.sync = false;
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root.querySelector(".stages li.cur"), "queued"); T.ok(root.querySelector("#s3-insert").disabled);
  LB.clearTimers(); LB.sync = true; s.reset();
});
```

- [ ] **Step 2: 실행해 실패 확인** — Expected: `FAIL s3: ... 뷰어 캔버스`.

- [ ] **Step 3: 장면 3 재작성** — `js/scenes/s3-model.js`

골격을 한 번 그리고, 작업 카드·액션만 부분 갱신한다. 뷰어는 `render`에서 한 번 마운트하고 `reset`에서 dispose한다.

```js
(function () {
  var esc = LB.esc, root, data, stage, inserted, scheduled, viewer = null;
  var PARTS = [["코어 박스", "#1F4E79"], ["버튼", "#F59E0B"], ["LED 창", "#22C55E"], ["부저 구멍", "#374151"], ["배터리 접근부", "#9CA3AF"], ["안테나 keep-out", "#DC2626"]];
  function paintTask() {
    var t = data.tripo, el = root.querySelector("#s3-task"); if (!el) return;
    el.innerHTML = '<h3>Tripo 작업</h3><div class="mono muted">' + esc(t.task) + '</div>'
      + '<ol class="stages">' + t.stages.map(function (s, i) { return '<li class="' + (i < stage ? 'done' : i === stage ? 'cur' : '') + '">' + esc(s) + '</li>'; }).join("") + '</ol>'
      + '<div class="bar"><i style="width:' + [10, 60, 100][stage] + '%"></i></div>'
      + (stage === 2 ? '<p id="s3-time" class="hint">생성 시간 ' + esc(t.genTime) + '</p>' : '<p class="hint">모델을 만들고 있어요…</p>');
  }
  function paintActions() {
    var el = root.querySelector("#s3-actions"); if (!el) return;
    el.innerHTML = '<button id="s3-insert" class="btn big"' + (stage === 2 && !inserted ? '' : ' disabled') + '>BLE 코어 넣기</button>'
      + (inserted ? '<span id="s3-done" class="badge ok big">코어 공간 결합 완료</span>' : '');
    var lg = root.querySelector("#s3-legend"); if (lg) lg.hidden = !inserted;
    var v = root.querySelector("#s3-view"); if (v) v.classList.toggle("dim", stage < 2);
    el.querySelector("#s3-insert").onclick = function () {
      if (stage === 2 && !inserted) { inserted = true; if (viewer) viewer.setInsert(true); paintActions(); }
    };
  }
  function skeleton() {
    var c = data.core, h = data.hero.card;
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>2D에서 3D로</h2><span class="badge gray">Tripo V3 · image-to-model</span></div>'
      + '<div class="row three">'
      + '<div id="s3-task" class="card"></div>'
      + '<div class="card center"><h3>3D 미리보기 <span class="muted small">드래그로 돌려보기</span></h3>'
      + '<div id="s3-view" class="view3d"></div>'
      + '<ul id="s3-legend" class="legend" hidden>' + PARTS.map(function (p) { return '<li><i style="background:' + p[1] + '"></i>' + esc(p[0]) + '</li>'; }).join("") + '</ul>'
      + '<p class="hint">시연용 미리보기 · 실제 서비스에서는 Tripo 출력물</p>'
      + '<div id="s3-actions" class="actions" style="justify-content:center"></div></div>'
      + '<div class="card"><h3>BLE 코어 규격 <span class="badge gray">규칙 엔진</span></h3>'
      + '<dl class="kv"><dt>외형 W×H×D</dt><dd>' + esc(c.size) + '</dd><dt>조립 공차</dt><dd>' + esc(c.tolerance) + '</dd>'
      + '<dt>최소 벽두께</dt><dd>' + esc(c.wall) + '</dd><dt>최대 외형</dt><dd>' + esc(c.maxBox) + '</dd></dl>'
      + '<h4>자동으로 들어가는 것</h4><ul class="parts">' + c.parts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ul>'
      + '<p class="hint">치수·공차·안테나 공간은 AI가 아니라 규칙 기반 엔진이 넣어요.</p></div></div></div>';
    var view = root.querySelector("#s3-view");
    if (window.LB_VIEWER && LB_VIEWER.supported()) {
      viewer = LB_VIEWER.mount(view, { glb: "assets/toto.glb", animal: h.animal, color: h.color });
    }
    if (!viewer) { // WebGL 불가: SVG 대체
      var hex = "#3B82F6"; data.cards.colors.forEach(function (x) { if (x.id === h.color) hex = x.hex; });
      view.innerHTML = '<div class="spin"><div class="spin-inner">' + LB_ART.character(h.animal, hex, h.face, 0) + '</div></div>';
    }
  }
  LB.registerScene({
    id: 3, mode: "student", key: null, title: "2D에서 3D로",
    summary: "Tripo가 외형을 만들고 규칙 엔진이 BLE 코어 공간을 넣는다",
    note: "Tripo는 외형만 만듭니다. 치수·공차·안테나 공간은 규칙 기반 엔진이 넣습니다. 프롬프트만으로 케이스가 나오지 않습니다.",
    reset: function () { stage = 0; inserted = false; scheduled = false; if (viewer) { viewer.dispose(); viewer = null; } },
    render: function (r, d) {
      root = r; data = d; skeleton(); paintTask(); paintActions();
      if (!scheduled) {
        scheduled = true;
        LB.later(function () { if (stage < 1) { stage = 1; paintTask(); paintActions(); } }, 1000);
        LB.later(function () { if (stage < 2) { stage = 2; paintTask(); paintActions(); } }, 2000);
      }
    }
  });
})();
```

- [ ] **Step 4: CSS** — `css/studio.css`에 추가(기존 `.spin` 규칙은 대체 경로용으로 유지)

```css
.view3d{width:100%;max-width:480px;height:420px;margin:8px auto;border-radius:16px;background:radial-gradient(circle at 50% 35%,#fff 0,#EFF6FF 70%);position:relative;overflow:hidden;transition:opacity .3s}
.view3d.dim{opacity:.35}
.view3d canvas{display:block;width:100%!important;height:100%!important}
.legend{list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;padding:0;margin:6px 0 0;font-size:15px}
.legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
```

- [ ] **Step 5: 실행해 통과 확인** — Expected: `33 passed, 0 failed`. 그리고 헤드리스 스크린샷으로 `demo.html#3`을 1920×1080에서 찍어 캔버스 안에 캐릭터가 보이는지 확인(`--screenshot`은 첫 프레임 뒤에 찍히므로 절차적 모델이 보여야 한다. 실제 GLB는 아직 없다).

- [ ] **Step 6: 커밋**

```bash
git add js/scenes/s3-model.js test/tests/t3-s3.js css/studio.css && git commit -m "feat: 장면 3 3D 미리보기를 Three.js 뷰어로 — GLB 우선, 절차적 대체, 코어 삽입 3D 표시"
```

---

### Task 3: 장면 2를 실제 이미지로

**Files:**
- Modify: `js/scenes/s2-character.js`, `test/tests/t3-s2.js`, `css/studio.css`

- [ ] **Step 1: 테스트 수정** — `test/tests/t3-s2.js`의 메인 테스트에서 `T.ok(root.querySelector(".char .char-svg").outerHTML.indexOf("#3B82F6") > 0, "선택한 색");` 줄을 다음 두 줄로 교체

```js
  var img = root.querySelector('.char[data-i="0"] img'); T.ok(img, "실제 이미지 태그");
  T.ok(/assets\/char-1\.png$/.test(img.getAttribute("src")), "assets/char-1.png");
```

그리고 파일 끝에 대체 경로 테스트 추가:

```js
T.test("s2: 이미지 로드 실패 시 SVG 캐릭터로 대체된다", function () {
  restoreScenes(); var s = sceneById(2);
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  root.querySelector('.opt[data-group="animal"][data-id="dino"]').click();
  root.querySelector('.opt[data-group="color"][data-id="green"]').click();
  root.querySelector('.opt[data-group="face"][data-id="smile"]').click();
  root.querySelector("#s2-gen").click();
  var img = root.querySelector('.char[data-i="1"] img'); T.ok(img);
  img.onerror();   // 브라우저의 onerror를 직접 호출해 대체 경로 검증
  var svg = root.querySelector('.char[data-i="1"] .char-svg'); T.ok(svg, "SVG 대체");
  T.ok(svg.outerHTML.indexOf("#22C55E") > 0, "선택한 색 반영"); T.ok(!root.querySelector('.char[data-i="1"] img'), "img 제거");
});
```

- [ ] **Step 2: 실행해 실패 확인** — Expected: `FAIL s2: ... 실제 이미지 태그`.

- [ ] **Step 3: 장면 2 수정** — `js/scenes/s2-character.js`

`results`를 SVG 문자열 배열에서 `{src, svg}` 배열로 바꾼다. 생성 콜백:

```js
        results = [0, 1, 2].map(function (p) {
          return { src: "assets/char-" + (p + 1) + ".png", svg: LB_ART.character(sel.animal, colorHex(sel.color), sel.face, p) };
        });
```

결과 그리드 렌더(기존 `results.map(function (svg, i) {...})`를 교체):

```js
    else if (results) right = '<div class="char-grid">' + results.map(function (r, i) {
        return '<button class="char' + (chosen === i ? ' on' : '') + '" data-i="' + i + '"' + (named ? ' disabled' : '') + '>'
          + '<span class="char-pic"><img src="' + esc(r.src) + '" alt="' + (i + 1) + '안"></span><span>' + (i + 1) + '안</span></button>';
      }).join("") + '</div>'
```

`paint()` 끝, `.char` 클릭 바인딩 앞에 이미지 대체 바인딩 추가:

```js
    root.querySelectorAll(".char img").forEach(function (im, i) {
      im.onerror = function () { var pic = im.parentNode; if (pic) pic.innerHTML = results[i].svg; };
    });
```

`.char` 클릭 핸들러는 그대로. (이미지 3장이 같은 파일명이므로 `assets/`에 실제 파일이 있으면 1~3안이 각각 다른 그림이 된다.)

- [ ] **Step 4: CSS** — `css/studio.css`에 추가

```css
.char-pic{display:block;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:#fff}
.char-pic img{display:block;width:100%;height:100%;object-fit:contain}
.char-pic .char-svg{width:100%;height:100%}
```

- [ ] **Step 5: 실행해 통과 확인** — Expected: `34 passed, 0 failed`.

- [ ] **Step 6: 커밋**

```bash
git add js/scenes/s2-character.js test/tests/t3-s2.js css/studio.css && git commit -m "feat: 장면 2 AI 그림을 실제 이미지(assets/char-1~3.png)로, 없으면 SVG 대체"
```

---

### Task 4: README·검증

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README에 자산 절 추가** — "## 오프라인으로 열기" 앞에:

```markdown
## 캐릭터 자산 넣기

`assets/` 폴더에 다음 파일을 넣으면 장면 2·3이 실제 이미지와 3D 모델을 사용합니다. 없으면 절차적 3D 캐릭터와 SVG로 자동 대체됩니다. 자세한 조건은 `assets/README.md`.

| 파일 | 내용 |
|---|---|
| `char-1.png` `char-2.png` `char-3.png` | 오리지널 캐릭터 AI 이미지 3안 |
| `toto.glb` | `char-1.png`를 Tripo에 넣어 받은 3D 모델 |

3D 미리보기는 레포 안 `vendor/three.bundle.js`(Three.js)로 동작하며 외부 요청이 없습니다. 마우스로 드래그해 돌려볼 수 있고, 올려두면 회전이 멈춥니다.
```

"## 하지 않는 것" 문단의 "실제 AI·Tripo 호출"은 유지(자산은 사전에 만든 파일이다).

- [ ] **Step 2: 헤드리스 검증**

`demo.html#3` 1920×1080 스크린샷(절차적 토끼가 캔버스 안에 보임), `demo.html#2`는 카드 선택 후 상태를 헤드리스로 만들 수 없으니 테스트로 대신. 콘솔: `demo.html#3`에서 `assets/toto.glb` 404 1건은 **예상된 것**(자산 미투입)이며 그 외 오류 0. 스위트 `34 passed, 0 failed`. 외부 요청 0 (`git grep -nE "https?://" -- ':!docs' ':!vendor'` → xmlns만).

- [ ] **Step 3: 커밋**

```bash
git add README.md && git commit -m "docs: README — 캐릭터 자산 넣기 안내"
```

---

## 자기 검토

- 스펙 §3.3 행 2(실제 이미지, SVG 대체) → Task 3. 행 3(Three.js, GLB, 절차적 대체, 반투명+코어 조립체, 범례, 회전 계속·hover 정지·드래그) → Task 1·2. §5 파일 구조(viewer.js, vendor, assets) → Task 1. 외부 자원 0 → 번들·로컬 자산만.
- 타이밍: 뷰어는 장면 3에서 한 번만 마운트되고 `reset()`에서 dispose되므로 장면 이탈·R 초기화 시 WebGL 컨텍스트가 누적되지 않는다(엔진은 reset → stage 비움 → render 순서).
- GLB 404는 자산 미투입 상태의 정상 동작. 파일이 들어오면 콘솔 오류도 사라진다.
