(function () {
  var esc = LB.esc, root, data, results, running, fixed, approved;
  function allOk() { return results.length > 0 && results.every(function (r) { return r === "ok"; }); }
  function hasWarn() { return results.indexOf("warn") >= 0; }
  function paint() {
    var doneCount = results.filter(Boolean).length;
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>검수와 출력 승인</h2>'
      + '<span class="badge info">' + esc(data.users.maker) + ' 화면</span><span class="badge gray">' + esc(data.hero.character) + ' · ' + esc(data.hero.tag) + '</span></div>'
      + '<div class="row"><div class="card"><h3>STL 자동 검수 <span class="muted small">' + doneCount + ' / ' + data.checks.length + '</span></h3>'
      + '<ul class="checklist">' + data.checks.map(function (c, i) {
          var st = results[i];
          var label = st === "warn" ? '<span class="badge warn">경고 · ' + esc(c.warn) + '</span>'
            : st === "ok" ? '<span class="badge ok">통과' + (c.warn && fixed ? ' · ' + esc(c.fixed) : '') + '</span>'
            : '<span class="badge gray">대기</span>';
          return '<li class="chk ' + (st || '') + '" data-id="' + esc(c.id) + '"><span>' + esc(c.name) + '</span>' + label + '</li>';
        }).join("") + '</ul>'
      + '<div class="actions"><button id="s4-run" class="btn big"' + (running || doneCount ? ' disabled' : '') + '>자동 검수</button>'
      + (!running && hasWarn() ? '<button id="s4-fix" class="btn big ghost">자동 보정</button>' : '') + '</div>'
      + '<p class="hint">검증 없이 출력되지 않아요. 자동 보정도 사람이 승인해요.</p></div>'
      + '<div class="card">' + (allOk()
          ? '<div id="s4-approve-card" class="approve"><h3>출력 승인</h3><p>모든 항목 통과 · <b>' + esc(data.users.maker) + ' 승인 필요</b></p>'
            + '<button id="s4-approve" class="btn big"' + (approved ? ' disabled' : '') + '>승인</button>'
            + (approved ? '<div id="s4-queue" class="line-item ok" style="margin-top:14px"><span>출력 큐 등록 · ' + esc(data.hero.tag) + ' · ' + esc(data.hero.character) + '</span><span class="badge ok">예상 ' + esc(data.printEta) + '</span></div>' : '') + '</div>'
          : '<h3>출력 승인</h3><p class="hint">검수를 모두 통과하면 승인 카드가 열려요.</p>') + '</div></div></div>';
    root.querySelector("#s4-run").onclick = run;
    var fix = root.querySelector("#s4-fix");
    if (fix) fix.onclick = function () { results = results.map(function (r) { return r === "warn" ? "ok" : r; }); fixed = true; paint(); };
    var ap = root.querySelector("#s4-approve");
    if (ap) ap.onclick = function () { approved = true; paint(); };
  }
  function run() {
    if (running || results.filter(Boolean).length) return; running = true;
    (function step(i) {
      if (i >= data.checks.length) { running = false; paint(); return; }
      results[i] = data.checks[i].warn && !fixed ? "warn" : "ok"; paint();
      LB.later(function () { step(i + 1); }, 300);
    })(0);
  }
  LB.registerScene({
    id: 4, mode: "student", key: null, title: "검수와 출력 승인",
    summary: "8개 자동 검수를 통과하고 제작담당이 승인해야 출력된다",
    note: "검증 없이 출력되지 않습니다. 자동 보정도 사람이 승인합니다.",
    reset: function () { results = []; running = false; fixed = false; approved = false; },
    render: function (r, d) { root = r; data = d; if (results.length !== d.checks.length) results = d.checks.map(function () { return null; }); paint(); }
  });
})();
