T.test("s3: Tripo 작업이 success에 도달하면 BLE 코어 넣기가 열리고 3D 뷰어가 삽입 상태로 바뀐다", function () {
  restoreScenes(); var s = sceneById(3); T.eq(s.mode, "student");
  var root = T.stage('<div style="width:1400px"></div>'); s.reset(); s.render(root, LB_DATA); // sync → stage=2
  T.has(root, "task_demo_7f3a"); T.eq(root.querySelectorAll(".stages li").length, 3);
  T.eq(root.querySelectorAll(".stages li.done").length, 2); T.has(root.querySelector(".stages li.cur"), "success");
  T.has(root.querySelector("#s3-time"), "48초");
  T.ok(root.querySelector("#s3-view canvas"), "뷰어 캔버스"); T.has(root, "시연용 미리보기");
  var h = LB_VIEWER.last(); T.ok(h, "뷰어 핸들"); T.eq(h.insert(), false);
  T.ok(root.querySelector("#s3-legend").hidden, "처음엔 범례 숨김");
  T.ok(!root.querySelector("#s3-insert").disabled);
  root.querySelector("#s3-insert").click();
  T.eq(h.insert(), true); T.ok(!root.querySelector("#s3-legend").hidden); T.has(root.querySelector("#s3-legend"), "keep-out");
  T.ok(root.querySelector("#s3-done")); T.ok(root.querySelector("#s3-insert").disabled);
  T.ok(root.querySelector("#s3-view canvas"), "삽입 후에도 같은 캔버스(재마운트 없음)");
  T.has(root, "42×28×9mm"); T.has(root, "0.25mm/side");
  s.reset(); T.ok(!root.querySelector("#s3-view canvas"), "reset이 뷰어를 dispose");
  s.render(root, LB_DATA); T.ok(root.querySelector("#s3-view canvas"), "재렌더 후 캔버스 재생성");
  s.exit(); T.eq(LB_VIEWER.last(), null, "exit 후 뷰어 핸들 없음"); T.ok(!root.querySelector("#s3-view canvas"), "exit 후 캔버스 제거");
});
T.test("s3: sync가 아니면 처음엔 queued이고 버튼이 잠겨 있다", function () {
  restoreScenes(); var s = sceneById(3); LB.sync = false;
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root.querySelector(".stages li.cur"), "queued"); T.ok(root.querySelector("#s3-insert").disabled);
  LB.clearTimers(); LB.sync = true; s.reset();
});
