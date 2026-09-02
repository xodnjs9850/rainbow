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
T.test("viewer: 새 mount는 이전 뷰어를 dispose한다(뷰어는 항상 하나만 산다)", function () {
  var V = window.LB_VIEWER;
  var elA = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
  var elB = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
  var A = V.mount(elA, { animal: "cat" });
  T.ok(elA.querySelector("canvas"), "A 캔버스 생성");
  var B = V.mount(elB, { animal: "dino" });
  T.ok(!elA.querySelector("canvas"), "A는 dispose되어 캔버스가 사라진다");
  T.ok(elB.querySelector("canvas"), "B 캔버스 생성");
  T.eq(V.last(), B, "마지막 핸들은 B");
  B.dispose();
  T.eq(V.last(), null, "dispose 후 last()는 null");
});
T.test("viewer: 코어 삽입을 켰다 끄면 모델 재질이 원래대로 복원된다", function () {
  var V = window.LB_VIEWER;
  var el = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
  var h = V.mount(el, { animal: "rabbit" });
  h.setInsert(true); h.setInsert(false);
  var model = h.scene.getObjectByName("lbModel");
  T.ok(model, "모델을 이름으로 찾아야 한다");
  var allOpaque = true, anyOrig = false;
  model.traverse(function (o) {
    if (!o.isMesh) return;
    if (o.material.transparent !== false) allOpaque = false;
    if (o.userData.lbOrig) anyOrig = true;
  });
  T.ok(allOpaque, "모든 메시가 불투명 재질로 복원되어야 한다");
  T.ok(!anyOrig, "임시 userData.lbOrig가 남아있지 않아야 한다");
  h.dispose();
});
T.test("viewer: dispose는 scene을 비운다", function () {
  var V = window.LB_VIEWER;
  var el = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
  var h = V.mount(el, { animal: "cat" });
  var sceneRef = h.scene;
  h.dispose();
  T.eq(sceneRef.children.length, 0, "dispose 후 scene은 비어 있어야 한다");
});
T.testAsync("viewer: base64 GLB(glbData)를 파싱해 kind=glb로 띄운다(file:// 대응)", function (done) {
  var V = window.LB_VIEWER, box = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x3B82F6 }));
  new THREE.GLTFExporter().parse(box, function (buf) {
    var u = new Uint8Array(buf), s = ""; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    var el = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
    var h = V.mount(el, { glbData: btoa(s), onReady: function (kind) {
      try {
        T.eq(kind, "glb");
        var foundBox = false;
        h.scene.traverse(function (o) { if (o.isMesh && o.geometry && o.geometry.type === "BoxGeometry") foundBox = true; });
        T.ok(foundBox, "BoxGeometry를 가진 메시를 찾아야 한다");
        h.setInsert(true); T.eq(h.insert(), true); h.dispose(); done();
      } catch (e) { done(e); }
    } });
  }, function (err) { done(err); }, { binary: true });
});
T.testAsync("viewer: 깨진 glbData는 절차적 모델로 대체된다", function (done) {
  var el = T.stage('<div style="width:200px;height:200px"></div>').firstChild;
  var h = LB_VIEWER.mount(el, { glbData: btoa("not a glb"), animal: "dino", onReady: function (kind) {
    try { T.eq(kind, "procedural"); h.dispose(); done(); } catch (e) { done(e); }
  } });
});

T.test("viewer: colorize는 재질 없는 메시에 캐릭터 색 토우 재질과 법선을 준다", function () {
  var g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial()); var grp = new THREE.Group(); grp.add(m);
  LB_VIEWER.colorize(grp, 0x22C55E);
  T.eq(m.material.type, "MeshToonMaterial"); T.eq(m.material.color.getHex(), 0x22C55E);
  T.ok(m.geometry.attributes.normal, "법선 계산됨");
});
