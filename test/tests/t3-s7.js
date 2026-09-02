T.test("s7: 요약 KPI·사실값 표·AI 초안 → 승인 → 도장·승인됨, 보관 배너", function () {
  restoreScenes(); var s = sceneById(7); T.eq(s.mode, "teacher"); T.eq(s.key, "report"); T.eq((s.keys || []).join(","), "dashboard,report");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(document.getElementById("lb-badge").textContent, "2", "알림 배지 2");
  T.has(root, "RPT-0917-햇살반"); T.eq(root.querySelectorAll(".kpi.three .card").length, 6);
  T.has(root.querySelector(".paper .fact"), "세션 로그"); T.has(root.querySelector(".paper .fact"), "38초");
  T.has(root.querySelector("#s7-aibadge"), "AI 초안"); T.has(root.querySelector("#s7-aibadge"), "승인 전"); T.has(root.querySelector("#s7-aibadge"), "세션 #S-0917");
  T.ok(!root.querySelector("#s7-stamp"));
  T.has(root, "30일 후 자동 파기"); T.has(root, "18/20"); T.has(root, "경보선 5%");
  root.querySelector("#s7-approve").click();
  T.has(root.querySelector("#s7-stamp"), "v1.0"); T.has(root.querySelector("#s7-stamp"), "담당교사 승인");
  T.has(root.querySelector("#s7-aibadge"), "승인됨"); T.ok(root.querySelector("#s7-approve").disabled);
});
