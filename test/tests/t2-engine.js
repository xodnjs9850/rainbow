(function () {
  // 엔진이 기대하는 DOM 최소 골격(demo.html과 같은 id)
  var SHELL = '<div id="lb-app">'
    + '<div id="lb-crumb"></div><span id="lb-badge"></span><div id="lb-steps"></div>'
    + '<button id="lb-quit"></button><div id="lb-quit-card" hidden><button id="lb-quit-back"></button></div>'
    + '<nav id="lb-sidebar"></nav><main id="lb-stage"></main>'
    + '<div id="lb-bar"><span id="lb-pos"></span><b id="lb-title"></b><span id="lb-summary"></span>'
    + '<button id="lb-prev"></button><button id="lb-next"></button><div id="lb-dots"></div></div>'
    + '<div id="lb-note"></div></div>';
  function stub(id, mode, key, calls) {
    return { id: id, mode: mode, key: key, title: "장면" + id, summary: "요약" + id, note: "메모" + id,
      render: function (root) { calls.push("render" + id); root.innerHTML = "<p>본문" + id + "</p>"; },
      reset: function () { calls.push("reset" + id); } };
  }
  function key(k) { document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true })); }
  function mount(list) {
    document.getElementById("stage").innerHTML = ""; T.stage(SHELL);
    LB.scenes.length = 0; list.forEach(function (s) { LB.registerScene(s); });
    history.replaceState(null, "", "#1"); LB.init();
  }
  T.test("engine: registerScene는 id 순으로 정렬", function () {
    var calls = []; LB.scenes.length = 0;
    LB.registerScene(stub(2, "student", null, calls)); LB.registerScene(stub(1, "student", null, calls));
    T.eq(LB.scenes.map(function (s) { return s.id; }).join(","), "1,2");
  });
  T.test("engine: goTo는 reset→render 순서로 부르고 바·해시·점을 갱신", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "teacher", "alerts", calls)]);
    T.eq(calls.join(","), "reset1,render1"); T.eq(LB.current, 1);
    LB.goTo(2);
    T.eq(calls.slice(2).join(","), "reset2,render2");
    T.has(document.getElementById("lb-stage"), "본문2");
    T.has(document.getElementById("lb-pos"), "2 / 2");
    T.has(document.getElementById("lb-title"), "장면2");
    T.eq(location.hash, "#2");
    T.eq(document.querySelectorAll("#lb-dots .dot.active").length, 1);
    history.replaceState(null, "", "#9");   // 사용자가 주소창에서 해시를 바꾼 상황
    LB.goTo(9); T.eq(LB.current, 2, "범위 밖 무시");
    T.eq(location.hash, "#2", "잘못된 해시는 현재 장면으로 복원");
  });
  T.test("engine: mode에 따라 body 클래스가 바뀐다", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "teacher", "alerts", calls)]);
    LB.goTo(2);
    T.ok(document.body.classList.contains("mode-teacher")); T.ok(!document.body.classList.contains("mode-student"));
    LB.goTo(1);
    T.ok(document.body.classList.contains("mode-student")); T.ok(!document.body.classList.contains("mode-teacher"));
  });
  T.test("engine: 사이드바는 MENU 6개, 교사 장면 key와 같은 항목만 active", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "teacher", "alerts", calls)]);
    LB.goTo(2);
    var items = document.querySelectorAll("#lb-sidebar .menu-item");
    T.eq(items.length, 6);
    var active = document.querySelectorAll("#lb-sidebar .menu-item.active");
    T.eq(active.length, 1); T.has(active[0], "알림");
    LB.goTo(1); T.eq(document.querySelectorAll("#lb-sidebar .menu-item.active").length, 0, "학생 장면은 활성 없음");
  });
  T.test("engine: 학생 진행 표시 4단계, 현재 active·이전 done", function () {
    var calls = [];
    var list = [1, 2, 3, 4].map(function (i) { return stub(i, "student", null, calls); });
    list.push(stub(5, "teacher", "session", calls));
    mount(list);
    var st = document.querySelectorAll("#lb-steps .st"); T.eq(st.length, 4);
    LB.goTo(3);
    st = document.querySelectorAll("#lb-steps .st");
    T.ok(st[0].classList.contains("done") && st[1].classList.contains("done"));
    T.ok(st[2].classList.contains("active")); T.ok(!st[3].classList.contains("done") && !st[3].classList.contains("active"));
    LB.goTo(5); T.eq(document.querySelectorAll("#lb-steps .st.active").length, 0, "교사 장면에서는 진행 표시 비활성");
  });
  T.test("engine: 그만하기 카드 열기·닫기, 장면 이동 시 닫힘, 장면 상태는 유지", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "student", null, calls)]);
    var card = document.getElementById("lb-quit-card");
    calls.length = 0;
    document.getElementById("lb-quit").click(); T.ok(!card.hidden, "열림"); T.eq(calls.length, 0, "장면 재렌더 없음");
    document.getElementById("lb-quit-back").click(); T.ok(card.hidden, "닫힘");
    LB.showQuit(); LB.goTo(2); T.ok(card.hidden, "이동 시 닫힘");
  });
  T.test("engine: later는 sync면 즉시, 아니면 지연, goTo가 대기 타이머를 모두 해제", function () {
    var calls = [];
    mount([stub(1, "student", null, calls)]);
    var hit = 0; LB.sync = true; LB.later(function () { hit++; }, 1000); T.eq(hit, 1);
    LB.sync = false; LB.later(function () { hit++; }, 5000); T.eq(hit, 1, "지연 중"); T.eq(LB.pending(), 1);
    var cleared = []; var orig = window.clearTimeout;
    window.clearTimeout = function (t) { cleared.push(t); return orig.call(window, t); };
    try { LB.goTo(1); } finally { window.clearTimeout = orig; }
    T.eq(LB.pending(), 0, "goTo가 대기 타이머를 비운다"); T.eq(cleared.length, 1, "clearTimeout 호출");
    LB.sync = true;
  });
  T.test("engine: 키보드 →/←/숫자/N/C/R, 입력 필드에서는 무시", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "student", null, calls)]);
    key("ArrowRight"); T.eq(LB.current, 2);
    key("ArrowLeft"); T.eq(LB.current, 1);
    key("2"); T.eq(LB.current, 2);
    key("n"); T.ok(document.body.classList.contains("notes-on")); key("n"); T.ok(!document.body.classList.contains("notes-on"));
    key("c"); T.ok(document.body.classList.contains("capture")); key("c"); T.ok(!document.body.classList.contains("capture"));
    calls.length = 0; key("r"); T.eq(calls.join(","), "reset2,render2");
    var inp = T.stage('<input id="in1" type="text">').querySelector("#in1"); inp.focus();
    inp.dispatchEvent(new KeyboardEvent("keydown", { key: "1", bubbles: true }));
    T.eq(LB.current, 2, "입력 필드에서는 숫자 키를 먹지 않는다");
  });
  T.test("engine: 한글 IME 조합 중에도 N/C/R은 물리 키로 동작", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "student", null, calls)]);
    function imeKey(code) {
      var ev = new KeyboardEvent("keydown", { key: "Process", code: code, bubbles: true });
      Object.defineProperty(ev, "keyCode", { get: function () { return 229; } });
      document.dispatchEvent(ev);
    }
    imeKey("KeyN"); T.ok(document.body.classList.contains("notes-on"), "IME 중 N으로 메모 켜짐");
    imeKey("KeyN"); T.ok(!document.body.classList.contains("notes-on"), "IME 중 N으로 메모 꺼짐");
  });
  T.test("engine: badge/crumb/esc", function () {
    var calls = [];
    mount([stub(1, "student", null, calls)]);
    LB.badge(2); T.eq(document.getElementById("lb-badge").textContent, "2");
    T.ok(!document.getElementById("lb-badge").hidden);
    LB.badge(0); T.ok(document.getElementById("lb-badge").hidden);
    LB.crumb("세션 › 과학관 체험학습"); T.has(document.getElementById("lb-crumb"), "과학관");
    T.eq(LB.esc('<a href="x">&\''), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  });
  T.test("engine: prev/next는 양 끝에서 disabled, 데이터는 진입마다 원본으로 복원", function () {
    var calls = [];
    mount([stub(1, "student", null, calls), stub(2, "student", null, calls)]);
    T.ok(document.getElementById("lb-prev").disabled); T.ok(!document.getElementById("lb-next").disabled);
    LB.goTo(2); T.ok(!document.getElementById("lb-prev").disabled); T.ok(document.getElementById("lb-next").disabled);
    window.LB_DATA.hero.character = "변조"; LB.goTo(1); T.eq(window.LB_DATA.hero.character, "토토");
  });
  T.test("engine: render가 던져도 다음 장면으로 넘어갈 수 있다", function () {
    var calls = [];
    var bad = stub(1, "student", null, calls); bad.render = function () { throw new Error("boom"); };
    mount([bad, stub(2, "student", null, calls)]);
    T.has(document.getElementById("lb-stage"), "렌더 실패"); LB.next(); T.eq(LB.current, 2);
  });
  T.test("engine: 재init이 원본 스냅샷을 덮어쓰지 않는다", function () {
    var calls = [];
    window.LB_DATA.hero.character = "변조";
    mount([stub(1, "student", null, calls)]);
    T.eq(window.LB_DATA.hero.character, "토토");
  });
})();
