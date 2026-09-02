T.test("s6: 상황 재생 → 노랑이 확인 필요 → 확인 → 인솔 복귀 → 복구 → SOS → 확인 → 오입력 기록", function () {
  restoreScenes(); var s = sceneById(6); T.eq(s.mode, "teacher"); T.eq(s.key, "alerts");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".tile").length, 20); T.eq(root.querySelectorAll(".tile.ok").length, 20);
  T.has(root.querySelector("#s6-alerts"), "알림이 없어요"); T.eq(root.querySelectorAll("#s6-timeline li").length, 0);
  root.querySelector("#s6-play").click(); // sync → 주의를 지나 확인 필요까지
  var y = root.querySelector('.tile[data-tag="LB-0917-11"]');
  T.ok(y.classList.contains("danger")); T.has(y, "확인 필요");
  T.ok(root.querySelector("#s6-a1")); T.has(root.querySelector("#s6-a1"), "야외광장"); T.ok(root.querySelector("#s6-confirm"));
  T.ok(root.querySelector("#s6-play").disabled);
  root.querySelector("#s6-confirm").click();
  T.eq(root.querySelectorAll(".s6-act").length, 3);
  root.querySelector('.s6-act[data-act="인솔 복귀"]').click(); // sync → 복구 후 SOS 즉시
  y = root.querySelector('.tile[data-tag="LB-0917-11"]'); T.ok(y.classList.contains("ok"));
  T.has(root.querySelector("#s6-a1"), "인솔 복귀"); T.has(root.querySelector("#s6-a1"), "42초");
  var b = root.querySelector('.tile[data-tag="LB-0917-03"]'); T.ok(b.classList.contains("danger"), "SOS");
  T.ok(root.querySelector("#s6-confirm2")); T.has(root.querySelector("#s6-a2"), "SOS");
  root.querySelector("#s6-confirm2").click();
  T.has(root.querySelector("#s6-a2"), "오입력 기록"); T.eq(root.querySelectorAll(".tile.ok").length, 20);
  T.eq(root.querySelectorAll("#s6-timeline li").length, 6);
  T.ok(root.textContent.indexOf("GPS") >= 0, "구역 기반 표기");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.has(root.querySelector("#s6-alerts"), "알림이 없어요");
});
