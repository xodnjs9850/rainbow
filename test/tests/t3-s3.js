T.test("s3: Tripo 작업이 success에 도달하면 BLE 코어 넣기가 열리고 단면 오버레이가 나타난다", function () {
  restoreScenes(); var s = sceneById(3); T.eq(s.mode, "student");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA); // LB.sync=true → 타이머 즉시 → stage=2
  T.has(root, "task_demo_7f3a"); T.eq(root.querySelectorAll(".stages li").length, 3);
  T.eq(root.querySelectorAll(".stages li.done").length, 2); T.has(root.querySelector(".stages li.cur"), "success");
  T.has(root.querySelector("#s3-time"), "48초");
  T.ok(root.querySelector(".spin .char-svg"), "미리보기 캐릭터"); T.has(root, "실제 Tripo 출력이 아닌");
  T.ok(root.querySelector("#s3-overlay").hidden, "처음엔 오버레이 숨김");
  T.ok(!root.querySelector("#s3-insert").disabled);
  root.querySelector("#s3-insert").click();
  T.ok(!root.querySelector("#s3-overlay").hidden); T.has(root.querySelector("#s3-overlay"), "keep-out");
  T.ok(root.querySelector("#s3-done")); T.ok(root.querySelector("#s3-insert").disabled);
  T.has(root, "42×28×9mm"); T.has(root, "0.25mm/side");
});
T.test("s3: sync가 아니면 처음엔 queued이고 버튼이 잠겨 있다", function () {
  restoreScenes(); var s = sceneById(3); LB.sync = false;
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root.querySelector(".stages li.cur"), "queued"); T.ok(root.querySelector("#s3-insert").disabled);
  LB.clearTimers(); LB.sync = true;
});
