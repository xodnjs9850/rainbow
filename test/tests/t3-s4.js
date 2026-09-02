T.test("s4: 자동 검수 8항목 → 벽두께 경고 → 자동 보정 → 전체 통과 → 승인 → 출력 큐", function () {
  restoreScenes(); var s = sceneById(4); T.eq(s.mode, "student");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "제작담당 화면"); T.eq(root.querySelectorAll(".chk").length, 8);
  T.eq(root.querySelectorAll(".chk.ok, .chk.warn").length, 0); T.ok(!root.querySelector("#s4-fix"));
  T.ok(!root.querySelector("#s4-approve-card"), "검수 전엔 승인 카드 없음");
  root.querySelector("#s4-run").click(); // sync → 8항목 즉시
  T.eq(root.querySelectorAll(".chk.ok").length, 7); T.eq(root.querySelectorAll(".chk.warn").length, 1);
  T.has(root.querySelector(".chk.warn"), "귀 끝 1.6mm"); T.ok(root.querySelector("#s4-fix"));
  T.ok(!root.querySelector("#s4-approve-card"), "경고가 있으면 승인 카드 없음");
  root.querySelector("#s4-run").onclick();
  T.eq(root.querySelectorAll(".chk.ok").length, 7, "이미 실행된 검수는 재실행되지 않는다");
  T.ok(root.querySelector("#s4-run").disabled, "실행 후엔 버튼 비활성");
  root.querySelector("#s4-fix").click();
  T.eq(root.querySelectorAll(".chk.ok").length, 8); T.has(root.querySelector('.chk[data-id="wall"]'), "2.1mm");
  T.ok(root.querySelector("#s4-approve-card")); T.has(root.querySelector("#s4-approve-card"), "제작담당 승인 필요");
  T.ok(!root.querySelector("#s4-queue"));
  root.querySelector("#s4-approve").click();
  T.has(root.querySelector("#s4-queue"), "LB-0917-03"); T.has(root.querySelector("#s4-queue"), "1시간 40분");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".chk.ok").length, 0, "reset 후 초기 상태");
});
