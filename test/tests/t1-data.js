T.test("data: 학생 20명·주인공 태그·구역·검수·이벤트가 한 세트", function () {
  var d = window.LB_DATA; T.ok(d, "LB_DATA 없음");
  T.eq(d.students.length, 20);
  T.eq(d.students[2].alias, "파랑이"); T.eq(d.students[2].tag, "LB-0917-03");
  T.eq(d.students[10].alias, "노랑이"); T.eq(d.students[10].tag, "LB-0917-11");
  T.eq(d.hero.tag, "LB-0917-03"); T.eq(d.hero.character, "토토");
  T.eq(d.consent.carry.length, 3); T.eq(d.consent.promises.length, 3);
  T.eq(d.cards.animals.length, 1); T.eq(d.cards.colors.length, 1); T.eq(d.cards.faces.length, 1);
  T.eq(d.tripo.stages.join(","), "queued,running,success");
  T.eq(d.checks.length, 8); T.eq(d.checks.filter(function (c) { return c.warn; }).length, 1);
  T.eq(d.session.zones.length, 4); T.eq(d.session.zones.filter(function (z) { return !z.allowed; }).length, 1);
  T.eq(d.session.gateways.length, 2); T.eq(d.session.thresholds.exitSec, 60);
  T.eq(d.events.length, 2); T.eq(d.events[0].type, "구역이탈"); T.eq(d.events[1].type, "SOS");
  T.eq(d.actions.length, 3);
  T.eq(d.summary.alerts, 2); T.eq(d.report.id, "RPT-0917-햇살반");
});
T.test("data: 이름·사진·연락처·장애정보 필드가 없다", function () {
  var s = JSON.stringify(window.LB_DATA);
  T.ok(!/"name"\s*:/.test(JSON.stringify(window.LB_DATA.students)), "students에 name 필드");
  T.ok(!/photo|phone|010-|diagnos|장애/.test(s), "금지 필드/문구 포함");
});
