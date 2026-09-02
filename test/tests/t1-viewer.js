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
