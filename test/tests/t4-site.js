T.test("site: 9단계 파이프라인, AI 단계 3·4·9, 규칙 엔진 단계 5·6", function () {
  T.ok(window.LB_FLOW, "LB_FLOW 없음"); T.eq(LB_FLOW.length, 9);
  T.eq(LB_FLOW.filter(function (s) { return s.ai; }).map(function (s) { return s.no; }).join(","), "3,4,9");
  T.eq(LB_FLOW.filter(function (s) { return s.rule; }).map(function (s) { return s.no; }).join(","), "5,6");
});
