(function () {
  var esc = LB.esc, root, data, stage, inserted, scheduled, viewer = null;
  var PARTS = [["코어 박스", "#1F4E79"], ["버튼", "#F59E0B"], ["LED 창", "#22C55E"], ["부저 구멍", "#374151"], ["배터리 접근부", "#9CA3AF"], ["안테나 keep-out", "#DC2626"]];
  function paintTask() {
    var t = data.tripo, el = root.querySelector("#s3-task"); if (!el) return;
    el.innerHTML = '<h3>Tripo 작업</h3><div class="mono muted">' + esc(t.task) + '</div>'
      + '<ol class="stages">' + t.stages.map(function (s, i) { return '<li class="' + (i < stage ? 'done' : i === stage ? 'cur' : '') + '">' + esc(s) + '</li>'; }).join("") + '</ol>'
      + '<div class="bar"><i style="width:' + [10, 60, 100][stage] + '%"></i></div>'
      + (stage === 2 ? '<p id="s3-time" class="hint">생성 시간 ' + esc(t.genTime) + '</p>' : '<p class="hint">모델을 만들고 있어요…</p>');
  }
  function paintActions() {
    var el = root.querySelector("#s3-actions"); if (!el) return;
    el.innerHTML = '<button id="s3-insert" class="btn big"' + (stage === 2 && !inserted ? '' : ' disabled') + '>BLE 코어 넣기</button>'
      + (inserted ? '<span id="s3-done" class="badge ok big">코어 공간 결합 완료</span>' : '');
    var lg = root.querySelector("#s3-legend"); if (lg) lg.hidden = !inserted;
    var v = root.querySelector("#s3-view"); if (v) v.classList.toggle("dim", stage < 2);
    el.querySelector("#s3-insert").onclick = function () {
      if (stage === 2 && !inserted) { inserted = true; if (viewer) viewer.setInsert(true); paintActions(); }
    };
  }
  function skeleton() {
    var c = data.core, h = data.hero.card;
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>2D에서 3D로</h2><span class="badge gray">Tripo V3 · image-to-model</span></div>'
      + '<div class="row three">'
      + '<div id="s3-task" class="card"></div>'
      + '<div class="card center"><h3>3D 미리보기 <span class="muted small">드래그로 돌려보기</span></h3>'
      + '<div id="s3-view" class="view3d"></div>'
      + '<ul id="s3-legend" class="legend" hidden>' + PARTS.map(function (p) { return '<li><i style="background:' + p[1] + '"></i>' + esc(p[0]) + '</li>'; }).join("") + '</ul>'
      + '<p class="hint">시연용 미리보기 · 실제 서비스에서는 Tripo 출력물</p>'
      + '<div id="s3-actions" class="actions" style="justify-content:center"></div></div>'
      + '<div class="card"><h3>BLE 코어 규격 <span class="badge gray">규칙 엔진</span></h3>'
      + '<dl class="kv"><dt>외형 W×H×D</dt><dd>' + esc(c.size) + '</dd><dt>조립 공차</dt><dd>' + esc(c.tolerance) + '</dd>'
      + '<dt>최소 벽두께</dt><dd>' + esc(c.wall) + '</dd><dt>최대 외형</dt><dd>' + esc(c.maxBox) + '</dd></dl>'
      + '<h4>자동으로 들어가는 것</h4><ul class="parts">' + c.parts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ul>'
      + '<p class="hint">치수·공차·안테나 공간은 AI가 아니라 규칙 기반 엔진이 넣어요.</p></div></div></div>';
    var view = root.querySelector("#s3-view");
    if (window.LB_VIEWER && LB_VIEWER.supported()) {
      viewer = LB_VIEWER.mount(view, { glb: "assets/toto.glb", glbData: (window.LB_ASSETS && LB_ASSETS.glb) || null, animal: h.animal, color: h.color });
    }
    if (!viewer) { // WebGL 불가: SVG 대체
      var hex = "#3B82F6"; data.cards.colors.forEach(function (x) { if (x.id === h.color) hex = x.hex; });
      view.innerHTML = '<div class="spin"><div class="spin-inner">' + LB_ART.character(h.animal, hex, h.face, 0) + '</div></div>';
    }
  }
  LB.registerScene({
    id: 3, mode: "student", key: null, title: "2D에서 3D로",
    summary: "Tripo가 외형을 만들고 규칙 엔진이 BLE 코어 공간을 넣는다",
    note: "Tripo는 외형만 만듭니다. 치수·공차·안테나 공간은 규칙 기반 엔진이 넣습니다. 프롬프트만으로 케이스가 나오지 않습니다.",
    reset: function () { stage = 0; inserted = false; scheduled = false; if (viewer) { viewer.dispose(); viewer = null; } },
    render: function (r, d) {
      root = r; data = d; skeleton(); paintTask(); paintActions();
      if (!scheduled) {
        scheduled = true;
        LB.later(function () { if (stage < 1) { stage = 1; paintTask(); paintActions(); } }, 1000);
        LB.later(function () { if (stage < 2) { stage = 2; paintTask(); paintActions(); } }, 2000);
      }
    }
  });
})();
