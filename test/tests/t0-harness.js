T.test("harness: eq/ok/has 동작", function () {
  T.eq(1 + 1, 2); T.ok(true);
  var s = T.stage("<p>안녕</p>"); T.has(s, "안녕");
});
