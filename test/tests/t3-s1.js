T.test("s1: 소지방식 3장 선택 + 약속 3개 체크 → 약속했어요 → 완료 배지·요약", function () {
  restoreScenes(); var s = sceneById(1); T.eq(s.mode, "student"); T.eq(s.key, null);
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "보호자 동의 완료 · 2026-09-10");
  T.eq(root.querySelectorAll(".pick").length, 3); T.eq(root.querySelectorAll(".promise input").length, 3);
  T.ok(root.querySelector("#s1-go").disabled, "처음엔 비활성");
  root.querySelector('.pick[data-id="band"]').click();
  T.ok(root.querySelector('.pick[data-id="band"]').classList.contains("on"));
  T.ok(root.querySelector("#s1-go").disabled, "약속 전엔 비활성");
  root.querySelectorAll(".promise input").forEach(function (i) { i.checked = true; i.dispatchEvent(new Event("change")); });
  T.ok(!root.querySelector("#s1-go").disabled);
  root.querySelector("#s1-go").click();
  T.ok(root.querySelector("#s1-done")); T.has(root.querySelector("#s1-summary"), "손목 밴드"); T.has(root.querySelector("#s1-summary"), "LB-0917-03");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.ok(!root.querySelector("#s1-done"), "reset 후 초기 상태");
});
