T.test("s5: 세션 설정·20행 대기 → 세션 시작 → 게이트웨이 연결·20칸 정상·전원 확인", function () {
  restoreScenes(); var s = sceneById(5); T.eq(s.mode, "teacher"); T.eq(s.key, "session"); T.eq((s.keys || []).join(","), "session,students");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "과학관 체험학습"); T.eq(root.querySelectorAll(".zone.ok").length, 3); T.eq(root.querySelectorAll(".zone.danger").length, 1);
  T.has(root, "60초 이상"); T.eq(root.querySelectorAll("tr.stu").length, 20); T.eq(root.querySelectorAll("tr.stu.ok").length, 0);
  T.has(root.querySelector('tr.stu[data-tag="LB-0917-03"]'), "파랑이");
  T.ok(!root.querySelector("#s5-check")); T.ok(!root.querySelector("#s5-gw .badge.ok"));
  root.querySelector("#s5-start").click(); // sync → 20칸 즉시
  T.eq(root.querySelectorAll("#s5-gw .badge.ok").length, 2);
  T.eq(root.querySelectorAll("tr.stu.ok").length, 20); T.has(root.querySelector("#s5-check"), "38초");
  T.ok(root.querySelector("#s5-start").disabled);
  T.ok(root.textContent.indexOf("이름") >= 0 && root.textContent.indexOf("별칭") >= 0, "별칭 사용 표기");
});
