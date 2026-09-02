(function () {
  var esc = LB.esc, root, data, approved;
  function kpi(items, cls) {
    return '<div class="kpi' + (cls ? ' ' + cls : '') + '">' + items.map(function (k) {
      return '<div class="card ' + (k[2] || '') + '"><div class="num">' + k[1] + '</div><div class="small muted">' + esc(k[0]) + '</div></div>';
    }).join("") + '</div>';
  }
  function paint() {
    var su = data.summary, m = data.monthly, r = data.report, s = data.session, t = data.users.teacher;
    LB.crumb("보고 › " + r.id); LB.badge(2);
    root.innerHTML = '<div class="head"><h2>세션 종료와 보고</h2><span class="badge gray">' + esc(r.id) + '</span>'
      + (approved ? '<span id="s7-stamp" class="stamp">보고서 ' + esc(r.version) + ' · ' + esc(t) + ' 승인</span>' : '') + '</div>'
      + '<div class="row"><div class="card" style="flex:1.3"><h3>세션 요약 <span class="muted small">' + esc(s.activity) + ' · ' + esc(s.date) + '</span></h3>'
      + kpi([["세션 시간", esc(su.duration)], ["인원 확인", esc(su.checkTime), "info"], ["경보", su.alerts + "건", "warn"],
             ["구역이탈 · SOS", su.exits + " · " + su.sos], ["오탐", su.falsePos + "건"], ["평균 대응", esc(su.avgResponse), "info"]], "three")
      + '<div class="paper" style="margin-top:16px"><h3>' + esc(data.school.cls) + ' 안전 세션 보고서</h3>'
      + '<div class="fact"><span class="tag">세션 로그 · 사실값</span><table class="tbl"><tr><th>항목</th><th>값</th></tr>'
      + '<tr><td>활동</td><td>' + esc(s.activity) + ' · ' + esc(s.date) + '</td></tr><tr><td>인원 확인 시간</td><td>' + esc(su.checkTime) + '</td></tr>'
      + '<tr><td>경보</td><td>구역이탈 ' + su.exits + ' · SOS ' + su.sos + '</td></tr><tr><td>오탐</td><td>' + su.falsePos + '</td></tr>'
      + '<tr><td>평균 대응 시간</td><td>' + esc(su.avgResponse) + '</td></tr></table></div>'
      + '<div class="ai"><span id="s7-aibadge" class="badge ' + (approved ? 'ok' : 'info') + '">' + (approved ? '승인됨' : 'AI 초안 · ' + esc(t) + ' 승인 전') + ' · 출처 ' + esc(r.source) + '</span>'
      + '<p style="margin-top:8px">이번 세션에서는 비허용 구역 우세로 확인 필요 알림이 1건 발생했고 담당교사가 인솔 복귀로 처리했다. SOS 1건은 버튼 오입력으로 기록되었다. 야외광장 인접 구간에서 이탈 알림이 반복될 수 있어 다음 세션에서는 인솔자 배치를 검토할 것을 제안한다.</p></div>'
      + '<button id="s7-approve" class="btn"' + (approved ? ' disabled' : '') + '>승인</button></div></div>'
      + '<div class="card"><h3>월간 대시보드 <span class="muted small">' + esc(data.school.cls) + '</span></h3>'
      + kpi([["활성 학급", m.classes], ["세션", m.sessions], ["30분 수용성", esc(m.acceptance), "info"],
             ["오탐률", esc(m.falseRate) + ' <span class="small muted">경보선 ' + esc(m.falseLimit) + '</span>'], ["교사 만족", esc(m.satisfaction)]])
      + '<div class="line-item" style="margin-top:14px"><span>' + esc(r.retention) + '</span><span class="badge gray">개인정보</span></div>'
      + '<p class="hint">숫자는 세션 로그에서 와요. AI는 서술 문단 초안만 쓰고 교사가 승인해요.</p></div></div>';
    root.querySelector("#s7-approve").onclick = function () { approved = true; paint(); };
  }
  LB.registerScene({
    id: 7, mode: "teacher", key: "report", keys: ["dashboard", "report"], title: "세션 종료와 보고",
    summary: "사실값은 로그에서, 서술은 AI 초안, 승인은 교사",
    note: "숫자는 세션 로그에서 옵니다. AI는 서술 문단 초안만 쓰고 교사가 승인합니다. 개인 로그는 남기지 않습니다.",
    reset: function () { approved = false; },
    render: function (r, d) { root = r; data = d; paint(); }
  });
})();
