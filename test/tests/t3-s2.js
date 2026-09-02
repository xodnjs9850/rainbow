T.test("s2: 카드 3종 선택 → AI 그림 만들기 → 3안 + 필터 로그 → 선택·이름 → 완료", function () {
  restoreScenes(); var s = sceneById(2); T.eq(s.mode, "student"); T.eq(s.key, "studio");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".tab").length, 3); T.ok(root.querySelector('.tab[data-tab="cards"]').classList.contains("on"));
  T.eq(root.querySelectorAll(".opt").length, 8);
  T.ok(root.querySelector("#s2-gen").disabled, "카드 전엔 비활성"); T.has(root, "카드를 고르고");
  root.querySelector('.opt[data-group="animal"][data-id="rabbit"]').click();
  root.querySelector('.opt[data-group="color"][data-id="blue"]').click();
  T.ok(root.querySelector("#s2-gen").disabled, "표정 전엔 비활성");
  root.querySelector('.opt[data-group="face"][data-id="smile"]').click();
  T.ok(!root.querySelector("#s2-gen").disabled);
  root.querySelector("#s2-gen").click(); // LB.sync=true → 즉시 생성
  T.eq(root.querySelectorAll(".char").length, 3); T.has(root.querySelector(".log"), "학생 사진 없음");
  T.ok(root.querySelector(".char .char-svg").outerHTML.indexOf("#3B82F6") > 0, "선택한 색");
  T.ok(!root.querySelector("#s2-name"), "선택 전엔 이름 없음");
  root.querySelector('.char[data-i="0"]').click();
  T.eq(root.querySelector("#s2-name").value, "토토");
  root.querySelector("#s2-ok").click();
  T.has(root.querySelector("#s2-done"), "토토 선택 완료");
  root.querySelector('.tab[data-tab="text"]').click(); T.has(root, "시연 범위 밖");
});
