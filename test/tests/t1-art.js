T.test("art: 캐릭터 SVG는 동물별로 다르고 색이 들어가며 자세 3종", function () {
  var A = window.LB_ART; T.ok(A, "LB_ART 없음");
  var r = A.character("rabbit", "#3B82F6", "smile", 0);
  T.ok(r.indexOf("<svg") === 0, "svg로 시작"); T.ok(r.indexOf("#3B82F6") > 0, "색 반영");
  T.ok(r.indexOf("<ellipse") > 0, "토끼 귀");
  T.ok(A.character("cat", "#F59E0B", "brave", 1).indexOf("<polygon") > 0, "고양이 귀");
  T.ok(A.character("dino", "#22C55E", "smile", 2).indexOf("<polygon") > 0, "공룡 등");
  var p0 = A.character("rabbit", "#000", "smile", 0), p2 = A.character("rabbit", "#000", "smile", 2);
  T.ok(p0 !== p2, "자세가 다르면 SVG가 다르다");
  T.ok(r.indexOf("__C__") < 0 && r.indexOf("__S__") < 0, "치환 토큰이 남지 않는다");
});
T.test("art: 소지방식 아이콘 3종과 BLE 단면 오버레이", function () {
  var A = window.LB_ART;
  ["clip", "band", "pocket"].forEach(function (id) { T.ok(A.carry(id).indexOf("<svg") === 0, id); });
  T.eq(A.carry("nope"), "");
  var o = A.insertOverlay();
  T.ok(o.indexOf("<svg") === 0); T.ok(o.indexOf("keep-out") > 0, "keep-out 라벨"); T.ok(o.indexOf("버튼") > 0, "버튼 라벨");
});
