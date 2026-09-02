// 초소형 브라우저 테스트 러너. 의존성 없음. test.html에서 로드한다.
window.T = (function () {
  var out = document.getElementById("out");
  var pass = 0, fail = 0, pending = 0, wantDone = false, doneShown = false;
  function log(s) { out.textContent += s + "\n"; }
  function test(name, fn) {
    try { fn(); pass++; log("PASS " + name); }
    catch (e) { fail++; log("FAIL " + name + " — " + e.message); console.error(name, e); }
  }
  function testAsync(name, fn) {
    pending++;
    var finished = false;
    function finish(err) {
      if (finished) return; finished = true; pending--;
      if (err) { fail++; log("FAIL " + name + " — " + err.message); console.error(name, err); }
      else { pass++; log("PASS " + name); }
      flush();
    }
    try { fn(finish); } catch (e) { finish(e); }
    setTimeout(function () { finish(new Error("timeout 4s")); }, 4000);
  }
  function eq(a, b, msg) {
    if (a !== b) throw new Error((msg || "") + " expected " + JSON.stringify(b) + " got " + JSON.stringify(a));
  }
  function ok(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }
  function has(el, text, msg) {
    if (!el || (el.textContent || "").indexOf(text) < 0) throw new Error((msg || "") + " expected text '" + text + "'");
  }
  function flush() {
    if (!wantDone || pending > 0 || doneShown) return;
    doneShown = true;
    log("\n" + pass + " passed, " + fail + " failed");
    document.title = fail ? "FAIL" : "PASS";
    window.LB_TEST_RESULT = { pass: pass, fail: fail };
  }
  function done() { wantDone = true; flush(); }
  // 테스트용 DOM 조각을 만들고 돌려준다(격리).
  function stage(html) {
    var d = document.createElement("div"); d.innerHTML = html || "";
    document.getElementById("stage").appendChild(d); return d;
  }
  return { test: test, testAsync: testAsync, eq: eq, ok: ok, has: has, done: done, stage: stage };
})();
