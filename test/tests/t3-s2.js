T.test("s2: AI 그림 만들기 → 3안 + 필터 로그 → 선택·이름 → 완료", function () {
  restoreScenes(); var s = sceneById(2); T.eq(s.mode, "student"); T.eq(s.key, "studio");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".tab").length, 0, "탭 없음"); T.eq(root.querySelectorAll(".opt").length, 0, "카드 없음");
  T.ok(!root.querySelector("#s2-gen").disabled, "버튼은 바로 활성"); T.has(root, "만들기를 누르면");
  T.has(root, "토토");
  root.querySelector("#s2-gen").click(); // LB.sync=true → 즉시 생성
  T.eq(root.querySelectorAll(".char").length, 3); T.has(root.querySelector(".log"), "학생 사진 없음");
  T.ok(root.querySelector("#s2-gen").disabled, "생성 후 버튼 비활성");
  root.querySelector("#s2-gen").onclick(); T.eq(root.querySelectorAll(".char").length, 3, "재생성 가드");
  var img = root.querySelector('.char[data-i="0"] img'); T.ok(img, "실제 이미지 태그");
  T.ok(/assets\/char-1\.png$/.test(img.getAttribute("src")), "assets/char-1.png");
  T.ok(!root.querySelector("#s2-name"), "선택 전엔 이름 없음");
  root.querySelector('.char[data-i="0"]').click();
  T.eq(root.querySelector("#s2-name").value, "토토");
  var ni = root.querySelector("#s2-name");
  ni.value = "뭉치"; ni.dispatchEvent(new Event("input"));
  root.querySelector('.char[data-i="1"]').click();
  T.eq(root.querySelector("#s2-name").value, "뭉치", "입력한 이름은 다른 안을 골라도 유지된다");
  root.querySelector("#s2-ok").click();
  T.has(root.querySelector("#s2-done"), "뭉치 선택 완료");
  T.ok(root.querySelector('.char[data-i="0"]').disabled, "완료 후엔 안 선택 버튼 비활성");
  T.ok(root.querySelector("#s2-name").disabled, "완료 후 이름 입력 비활성");
});

T.test("s2: 공백만 입력한 이름은 기본값으로 돌아간다", function () {
  restoreScenes(); var s = sceneById(2);
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  root.querySelector("#s2-gen").click();
  root.querySelector('.char[data-i="2"]').click();
  var ni = root.querySelector("#s2-name"); ni.value = "   "; ni.dispatchEvent(new Event("input"));
  root.querySelector("#s2-ok").click();
  T.has(root.querySelector("#s2-done"), "토토 선택 완료", "공백 이름은 기본값으로");
});

T.test("s2: 이미지 로드 실패 시 SVG 캐릭터로 대체된다", function () {
  restoreScenes(); var s = sceneById(2);
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  root.querySelector("#s2-gen").click();
  var img = root.querySelector('.char[data-i="1"] img'); T.ok(img);
  img.onerror();   // 브라우저의 onerror를 직접 호출해 대체 경로 검증
  var svg = root.querySelector('.char[data-i="1"] .char-svg'); T.ok(svg, "SVG 대체");
  T.ok(svg.outerHTML.indexOf("#3B82F6") > 0, "주인공 색 반영"); T.ok(!root.querySelector('.char[data-i="1"] img'), "img 제거");
});
