(function () {
  var esc = LB.esc, root, data, stage, inserted, scheduled;
  function paint() {
    var t = data.tripo, c = data.core, h = data.hero.card, hex = "#3B82F6";
    data.cards.colors.forEach(function (x) { if (x.id === h.color) hex = x.hex; });
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>2D에서 3D로</h2><span class="badge gray">Tripo V3 · image-to-model</span></div>'
      + '<div class="row three">'
      + '<div class="card"><h3>Tripo 작업</h3><div class="mono muted">' + esc(t.task) + '</div>'
      + '<ol class="stages">' + t.stages.map(function (s, i) { return '<li class="' + (i < stage ? 'done' : i === stage ? 'cur' : '') + '">' + esc(s) + '</li>'; }).join("") + '</ol>'
      + '<div class="bar"><i style="width:' + [10, 60, 100][stage] + '%"></i></div>'
      + (stage === 2 ? '<p id="s3-time" class="hint">생성 시간 ' + esc(t.genTime) + '</p>' : '<p class="hint">모델을 만들고 있어요…</p>') + '</div>'
      + '<div class="card center"><h3>3D 미리보기</h3>'
      + '<div class="spin' + (stage < 2 ? ' dim' : '') + '"><div class="spin-inner">' + LB_ART.character(h.animal, hex, h.face, 0)
      + '<div id="s3-overlay" class="overlay"' + (inserted ? '' : ' hidden') + '>' + LB_ART.insertOverlay() + '</div></div></div>'
      + '<p class="hint">실제 Tripo 출력이 아닌 시연용 미리보기</p>'
      + '<div class="actions" style="justify-content:center"><button id="s3-insert" class="btn big"' + (stage === 2 && !inserted ? '' : ' disabled') + '>BLE 코어 넣기</button>'
      + (inserted ? '<span id="s3-done" class="badge ok big">코어 공간 결합 완료</span>' : '') + '</div></div>'
      + '<div class="card"><h3>BLE 코어 규격 <span class="badge gray">규칙 엔진</span></h3>'
      + '<dl class="kv"><dt>외형 W×H×D</dt><dd>' + esc(c.size) + '</dd><dt>조립 공차</dt><dd>' + esc(c.tolerance) + '</dd>'
      + '<dt>최소 벽두께</dt><dd>' + esc(c.wall) + '</dd><dt>최대 외형</dt><dd>' + esc(c.maxBox) + '</dd></dl>'
      + '<h4>자동으로 들어가는 것</h4><ul class="parts">' + c.parts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ul>'
      + '<p class="hint">치수·공차·안테나 공간은 AI가 아니라 규칙 기반 엔진이 넣어요.</p></div></div></div>';
    root.querySelector("#s3-insert").onclick = function () { if (stage === 2 && !inserted) { inserted = true; paint(); } };
  }
  LB.registerScene({
    id: 3, mode: "student", key: null, title: "2D에서 3D로",
    summary: "Tripo가 외형을 만들고 규칙 엔진이 BLE 코어 공간을 넣는다",
    note: "Tripo는 외형만 만듭니다. 치수·공차·안테나 공간은 규칙 기반 엔진이 넣습니다. 프롬프트만으로 케이스가 나오지 않습니다.",
    reset: function () { stage = 0; inserted = false; scheduled = false; },
    render: function (r, d) {
      root = r; data = d; paint();
      if (!scheduled) {
        scheduled = true;
        LB.later(function () { if (stage < 1) { stage = 1; paint(); } }, 1000);
        LB.later(function () { if (stage < 2) { stage = 2; paint(); } }, 2000);
      }
    }
  });
})();
