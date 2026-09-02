(function () {
  var esc = LB.esc, root, data, carry, checked, done;
  function allChecked() { return checked.every(Boolean); }
  function paint() {
    var c = data.consent, name = "";
    c.carry.forEach(function (x) { if (x.id === carry) name = x.name; });
    root.innerHTML = '<div class="studio">'
      + '<div class="head"><h2>나의 안전, 나의 선택</h2><span class="badge ok">보호자 동의 완료 · ' + esc(c.guardianDate) + '</span></div>'
      + '<p class="lead-s">' + esc(data.hero.alias) + ', 태그를 어디에 달고 싶어요?</p>'
      + '<div class="picks">' + c.carry.map(function (x) {
          return '<button class="pick' + (x.id === carry ? ' on' : '') + '" data-id="' + esc(x.id) + '"' + (done ? ' disabled' : '') + '>' + LB_ART.carry(x.id) + '<span>' + esc(x.name) + '</span></button>';
        }).join("") + '</div>'
      + '<div class="card"><h3>안전 약속</h3>' + c.promises.map(function (p, i) {
          return '<label class="promise"><input type="checkbox" data-i="' + i + '"' + (checked[i] ? ' checked' : '') + (done ? ' disabled' : '') + '><span>' + esc(p) + '</span></label>';
        }).join("") + '</div>'
      + '<div class="actions"><button id="s1-go" class="btn big"' + (carry && allChecked() && !done ? '' : ' disabled') + '>약속했어요</button>'
      + (done ? '<span id="s1-done" class="badge ok big">약속 완료</span>' : '') + '</div>'
      + (done ? '<div id="s1-summary" class="card summary"><h3>오늘의 선택</h3><dl class="kv"><dt>소지 방식</dt><dd>' + esc(name) + '</dd>'
          + '<dt>약속</dt><dd>' + c.promises.length + '개 모두</dd><dt>내 태그</dt><dd class="mono">' + esc(data.hero.tag) + '</dd></dl>'
          + '<p class="hint">거부해도 불이익은 없어요. 언제든 그만하기를 누를 수 있어요.</p></div>' : '')
      + '</div>';
    root.querySelectorAll(".pick").forEach(function (b) { b.onclick = function () { if (done) return; carry = b.getAttribute("data-id"); paint(); }; });
    root.querySelectorAll(".promise input").forEach(function (i) {
      i.onchange = function () { if (done) return; checked[parseInt(i.getAttribute("data-i"), 10)] = i.checked; paint(); };
    });
    root.querySelector("#s1-go").onclick = function () { if (carry && allChecked()) { done = true; paint(); } };
  }
  LB.registerScene({
    id: 1, mode: "student", key: null, title: "나의 안전, 나의 선택",
    summary: "보호자 동의 위에 학생의 선택과 약속을 먼저 확인한다",
    note: "동의와 선택이 먼저입니다. 그만하기 버튼은 모든 화면에 있습니다.",
    reset: function () { carry = null; checked = []; done = false; },
    render: function (r, d) {
      root = r; data = d;
      if (checked.length !== d.consent.promises.length) checked = d.consent.promises.map(function () { return false; });
      paint();
    }
  });
})();
