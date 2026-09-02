(function () {
  var esc = LB.esc, root, data, step, action;
  // step: 0 대기 · 1 주의 · 2 확인 필요(알림1) · 3 교사 확인(조치 선택) · 4 조치 기록·복구 · 5 SOS 알림2 · 6 SOS 확인·기록
  function tileClass(tag) {
    var e1 = data.events[0], e2 = data.events[1];
    if (tag === e1.tag) return step === 1 ? "warn" : (step === 2 || step === 3) ? "danger" : "ok";
    if (tag === e2.tag) return step === 5 ? "danger" : "ok";
    return "ok";
  }
  function paint() {
    var s = data.session, e1 = data.events[0], e2 = data.events[1], t = data.users.teacher;
    LB.crumb("알림 › " + s.activity);
    var alerts = [];
    if (step >= 2) alerts.push('<div class="alert-item ' + (step >= 4 ? 'ok' : 'danger') + '" id="s6-a1"><div><b>' + esc(e1.type) + '</b> · ' + esc(e1.alias) + ' <span class="mono muted">' + esc(e1.tag) + '</span>'
      + '<br><span class="small">' + esc(e1.zone) + ' 우세 ' + s.thresholds.exitSec + '초 이상</span></div>'
      + (step === 2 ? '<button id="s6-confirm" class="btn">확인</button>'
        : step === 3 ? '<div class="acts">' + data.actions.map(function (a) { return '<button class="btn ghost s6-act" data-act="' + esc(a) + '">' + esc(a) + '</button>'; }).join("") + '</div>'
        : '<span class="badge ok">' + esc(action) + ' · 대응 ' + esc(e1.response) + '</span>') + '</div>');
    if (step >= 5) alerts.push('<div class="alert-item ' + (step >= 6 ? 'ok' : 'danger') + '" id="s6-a2"><div><b>' + esc(e2.type) + '</b> · ' + esc(e2.alias) + ' <span class="mono muted">' + esc(e2.tag) + '</span><br><span class="small">태그 버튼 입력</span></div>'
      + (step === 5 ? '<button id="s6-confirm2" class="btn">확인</button>' : '<span class="badge ok">' + esc(e2.action) + ' 기록</span>') + '</div>');
    var tl = [];
    if (step >= 1) tl.push('00:00 ' + esc(e1.alias) + ' · ' + esc(e1.zone) + ' 우세 → <b>주의</b>');
    if (step >= 2) tl.push('01:00 ' + s.thresholds.exitSec + '초 경과 → <b class="danger-t">확인 필요</b> · 알림 1');
    if (step >= 3) tl.push('01:12 ' + esc(t) + ' 확인');
    if (step >= 4) tl.push('01:42 조치 "' + esc(action) + '" 기록 · 상태 복구 · 대응 ' + esc(e1.response));
    if (step >= 5) tl.push('03:05 ' + esc(e2.alias) + ' SOS 버튼 → <b class="danger-t">확인 필요</b> · 알림 2');
    if (step >= 6) tl.push('03:20 ' + esc(t) + ' 확인 · "' + esc(e2.action) + '" 기록');
    var hot = step === 2 || step === 3 || step === 5;
    root.innerHTML = '<div class="head"><h2>' + esc(s.activity) + ' <span class="muted" style="font-size:16px;font-weight:400">진행 중</span></h2>'
      + '<span class="badge ' + (hot ? 'danger' : step === 1 ? 'warn' : 'ok') + '">' + (hot ? '확인 필요 1' : step === 1 ? '주의 1' : '전원 정상') + '</span>'
      + '<span class="spacer"></span><button id="s6-play" class="btn"' + (step > 0 ? ' disabled' : '') + '>상황 재생</button></div>'
      + '<div class="row"><div class="card" style="flex:1.4"><h3>상태판 <span class="muted small">' + data.students.length + '명 · 구역 기반</span></h3><div class="board">'
      + data.students.map(function (x) {
          var c = tileClass(x.tag);
          return '<div class="tile ' + c + '" data-tag="' + esc(x.tag) + '"><b>' + esc(x.alias) + '</b><span>' + (c === 'ok' ? '정상' : c === 'warn' ? '주의' : '확인 필요') + '</span></div>';
        }).join("") + '</div></div>'
      + '<div class="card"><h3>알림</h3><div id="s6-alerts">' + (alerts.length ? alerts.join("") : '<p class="hint">알림이 없어요.</p>') + '</div>'
      + '<h3 style="margin-top:16px">타임라인</h3><ol id="s6-timeline" class="timeline">' + tl.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ol>'
      + '<p class="hint">시스템은 표시만 해요. 확인과 조치는 ' + esc(t) + '가 하고 기록이 남아요. GPS 좌표가 아니라 게이트웨이 구역이에요.</p></div></div>';
    root.querySelector("#s6-play").onclick = function () {
      if (step > 0) return; step = 1; paint();
      LB.later(function () { if (step === 1) { step = 2; LB.badge(1); paint(); } }, 1200);
    };
    var c1 = root.querySelector("#s6-confirm"); if (c1) c1.onclick = function () { step = 3; paint(); };
    root.querySelectorAll(".s6-act").forEach(function (b) {
      b.onclick = function () {
        action = b.getAttribute("data-act"); step = 4; paint();
        LB.later(function () { if (step === 4) { step = 5; LB.badge(2); paint(); } }, 1200);
      };
    });
    var c2 = root.querySelector("#s6-confirm2"); if (c2) c2.onclick = function () { step = 6; paint(); };
  }
  LB.registerScene({
    id: 6, mode: "teacher", key: "alerts", title: "이벤트와 대응",
    summary: "구역이탈과 SOS를 시스템이 표시하고 교사가 확인·조치·기록한다",
    note: "시스템은 표시만 합니다. 확인과 조치는 교사가 하고 기록이 남습니다. GPS 좌표가 아니라 게이트웨이 구역입니다.",
    reset: function () { step = 0; action = null; },
    render: function (r, d) { root = r; data = d; paint(); }
  });
})();
