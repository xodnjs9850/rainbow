(function () {
  var esc = LB.esc, root, data, started, lit;
  function paint() {
    var s = data.session, st = data.students, all = lit >= st.length;
    LB.crumb("세션 › " + s.activity);
    root.innerHTML = '<div class="head"><h2>' + esc(s.activity) + ' <span class="muted" style="font-size:16px;font-weight:400">' + esc(s.date) + ' · ' + esc(data.school.cls) + ' ' + st.length + '명</span></h2>'
      + (all ? '<span id="s5-check" class="badge ok">전원 확인 ' + esc(s.checkTime) + '</span>' : started ? '<span class="badge info">확인 중 ' + lit + '/' + st.length + '</span>' : '<span class="badge gray">세션 준비</span>') + '</div>'
      + '<div class="row"><div class="card" style="flex:.8"><h3>세션 설정</h3><dl class="kv">'
      + '<dt>허용 구역</dt><dd>' + s.zones.filter(function (z) { return z.allowed; }).map(function (z) { return '<span class="zone ok">' + esc(z.name) + '</span>'; }).join(" ") + '</dd>'
      + '<dt>비허용 구역</dt><dd>' + s.zones.filter(function (z) { return !z.allowed; }).map(function (z) { return '<span class="zone danger">' + esc(z.name) + '</span>'; }).join(" ") + '</dd>'
      + '<dt>미확인 기준</dt><dd>연속 ' + s.thresholds.missScans + '개 스캔창 미감지</dd>'
      + '<dt>이탈 기준</dt><dd>비허용 구역 우세 ' + s.thresholds.exitSec + '초 이상</dd>'
      + '<dt>인솔자</dt><dd>' + s.escorts + '명</dd>'
      + '<dt>게이트웨이</dt><dd id="s5-gw">' + s.gateways.map(function (g) { return started ? '<span class="badge ok">' + esc(g) + ' 연결</span>' : '<span class="badge gray">' + esc(g) + '</span>'; }).join(" ") + '</dd></dl>'
      + '<button id="s5-start" class="btn" style="margin-top:12px"' + (started ? ' disabled' : '') + '>세션 시작</button>'
      + '<p class="hint">호명 대신 한 화면. GPS 좌표가 아니라 게이트웨이 구역 기준이에요.</p></div>'
      + '<div class="card"><h3>학생·태그 <span class="muted small">이름 대신 별칭</span></h3>'
      + '<table class="tbl"><thead><tr><th>별칭</th><th>태그</th><th>소지</th><th>배터리</th><th>상태</th></tr></thead><tbody>'
      + st.map(function (x, i) {
          var on = i < lit;
          return '<tr class="stu' + (on ? ' ok' : '') + '" data-tag="' + esc(x.tag) + '"><td>' + esc(x.alias) + '</td><td class="mono">' + esc(x.tag) + '</td><td>' + esc(x.carry) + '</td><td>' + x.battery + '%</td>'
            + '<td>' + (on ? '<span class="badge ok">정상</span>' : '<span class="badge gray">대기</span>') + '</td></tr>';
        }).join("") + '</tbody></table></div></div>';
    root.querySelector("#s5-start").onclick = function () {
      if (started) return; started = true; paint();
      (function light() { if (lit >= st.length) return; lit++; paint(); LB.later(light, 100); })();
    };
  }
  LB.registerScene({
    id: 5, mode: "teacher", key: "session", keys: ["session", "students"], title: "세션 시작",
    summary: "허용 구역과 임계치를 정하고 20명을 한 화면에서 확인한다",
    note: "호명 대신 한 화면입니다. 이름 대신 별칭만 씁니다. 계획서 목표는 60초 이내입니다.",
    reset: function () { started = false; lit = 0; },
    render: function (r, d) { root = r; data = d; paint(); }
  });
})();
