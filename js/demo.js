// 장면 엔진(qtrace-demo에서 이식). 장면 내부를 모른다. 장면은 registerScene 규약만 지킨다.
// 장면 규약: { id, mode:"student"|"teacher", key(교사 사이드바 메뉴 키 또는 null), keys?, title, summary, note?, reset(), render(root, data) }
// - data는 장면 진입마다 원본에서 다시 복제되므로 바꿔도 남지 않는다.
// - 리스너는 render가 받은 root 안에서만 건다.
// - 지연 실행은 LB.later(fn, ms)로만 한다. 장면 전환 시 엔진이 전부 해제한다. 테스트는 LB.sync=true로 즉시 실행.
//   sync 모드에서는 ms를 무시하고 호출 순서대로 즉시 실행하므로, 장면은 타이머를 겹치지 않고 순서대로만 건다.
window.LB = (function () {
  var scenes = [], current = 0, els = null, BASE = null, timers = [];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var ICON = {
    dashboard: '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>',
    session: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none"/><path d="M10 6v4l3 2" fill="none"/></svg>',
    students: '<svg viewBox="0 0 20 20"><circle cx="7" cy="7" r="3"/><circle cx="14" cy="8" r="2.5"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M11 17c0-2.5 1.5-4 3-4s3 1.5 3 4" fill="none"/></svg>',
    alerts: '<svg viewBox="0 0 20 20"><path d="M10 2a5 5 0 0 0-5 5v3l-2 3h14l-2-3V7a5 5 0 0 0-5-5zM8 16a2 2 0 0 0 4 0" fill="none"/></svg>',
    report: '<svg viewBox="0 0 20 20"><path d="M5 2h7l4 4v12H5z"/><path d="M12 2v4h4M7 10h6M7 13h6" stroke="#fff" fill="none"/></svg>',
    studio: '<svg viewBox="0 0 20 20"><path d="M3 15l9-9 2 2-9 9H3z"/><path d="M12 6l2-2 2 2-2 2" fill="none"/></svg>'
  };
  var MENU = [
    { key: "dashboard", label: "대시보드", scene: 7 }, { key: "session", label: "세션", scene: 5 },
    { key: "students", label: "학생·태그", scene: 5 }, { key: "alerts", label: "알림", scene: 6 },
    { key: "report", label: "보고", scene: 7 }, { key: "studio", label: "만들기 수업", scene: 2 }
  ];
  var STEPS = ["약속", "캐릭터", "3D", "출력"]; // 학생 모드 상단 진행 표시. 장면 1~4에 대응
  function $(id) { return document.getElementById(id); }
  function grab() {
    els = { crumb: $("lb-crumb"), badge: $("lb-badge"), sidebar: $("lb-sidebar"), stage: $("lb-stage"),
      pos: $("lb-pos"), title: $("lb-title"), summary: $("lb-summary"), prev: $("lb-prev"), next: $("lb-next"),
      dots: $("lb-dots"), note: $("lb-note"), steps: $("lb-steps"), quit: $("lb-quit"),
      quitCard: $("lb-quit-card"), quitBack: $("lb-quit-back") };
  }
  function registerScene(s) { scenes.push(s); scenes.sort(function (a, b) { return a.id - b.id; }); }
  function keysOf(s) { return (s && s.keys && s.keys.length) ? s.keys : [s.key]; }
  function find(id) { for (var i = 0; i < scenes.length; i++) if (scenes[i].id === id) return scenes[i]; return null; }
  function buildSidebar() {
    els.sidebar.innerHTML = MENU.map(function (m) {
      return '<a class="menu-item" data-key="' + m.key + '" data-scene="' + m.scene + '" href="#' + m.scene + '">'
        + ICON[m.key] + '<span>' + esc(m.label) + '</span></a>';
    }).join("");
    els.sidebar.onclick = function (e) {
      var a = e.target.closest(".menu-item"); if (!a) return;
      e.preventDefault(); goTo(parseInt(a.getAttribute("data-scene"), 10));
    };
  }
  function buildDots() {
    els.dots.innerHTML = scenes.map(function (s) {
      return '<span class="dot" data-scene="' + s.id + '" title="' + esc(s.title) + '"></span>';
    }).join("");
    els.dots.onclick = function (e) {
      var d = e.target.closest(".dot"); if (d) goTo(parseInt(d.getAttribute("data-scene"), 10));
    };
  }
  function buildSteps() {
    els.steps.innerHTML = STEPS.map(function (t, i) {
      return '<span class="st" data-step="' + (i + 1) + '"><b>' + (i + 1) + '</b>' + esc(t) + '</span>';
    }).join("");
  }
  function paintChrome(s) {
    var ks = keysOf(s), student = s.mode !== "teacher";
    document.body.classList.toggle("mode-student", student);
    document.body.classList.toggle("mode-teacher", !student);
    els.pos.textContent = "장면 " + (idx() + 1) + " / " + scenes.length;
    els.title.textContent = s.title; els.summary.textContent = s.summary; els.note.textContent = s.note || "";
    Array.prototype.forEach.call(els.sidebar.querySelectorAll(".menu-item"), function (a) {
      a.classList.toggle("active", !student && ks.indexOf(a.getAttribute("data-key")) >= 0);
    });
    Array.prototype.forEach.call(els.steps.querySelectorAll(".st"), function (st) {
      var n = parseInt(st.getAttribute("data-step"), 10);
      st.classList.toggle("active", student && n === s.id);
      st.classList.toggle("done", student && n < s.id);
    });
    Array.prototype.forEach.call(els.dots.querySelectorAll(".dot"), function (d) {
      d.classList.toggle("active", parseInt(d.getAttribute("data-scene"), 10) === s.id);
    });
    els.prev.disabled = s.id === scenes[0].id; els.next.disabled = s.id === scenes[scenes.length - 1].id;
  }
  function later(fn, ms) {
    if (api.sync) { fn(); return 0; }
    var t = setTimeout(function () { var i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1); fn(); }, ms);
    timers.push(t); return t;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers.length = 0; }
  function showQuit() { if (els && els.quitCard) els.quitCard.hidden = false; }
  function hideQuit() { if (els && els.quitCard) els.quitCard.hidden = true; }
  function goTo(n) {
    var s = find(n); if (!els) return;
    if (!s) { if (find(current) && location.hash !== "#" + current) history.replaceState(null, "", "#" + current); return; }
    current = n; clearTimers(); badge(0); crumb(""); hideQuit();
    // 장면마다 데이터를 원본에서 다시 복제한다. 리허설을 몇 번 돌려도 결과가 같아야 한다.
    if (BASE) window.LB_DATA = clone(BASE);
    try {
      s.reset(); els.stage.innerHTML = ""; s.render(els.stage, window.LB_DATA);
    } catch (e) {
      console.error(e);
      els.stage.innerHTML = '<div class="card"><h3>장면 ' + n + ' 렌더 실패</h3><p class="muted">' + esc(e && e.message) + '</p></div>';
    }
    paintChrome(s);
    if (location.hash !== "#" + n) history.replaceState(null, "", "#" + n);
    els.stage.scrollTop = 0;
  }
  function next() { var i = idx(); if (i < scenes.length - 1) goTo(scenes[i + 1].id); }
  function prev() { var i = idx(); if (i > 0) goTo(scenes[i - 1].id); }
  function idx() { for (var i = 0; i < scenes.length; i++) if (scenes[i].id === current) return i; return 0; }
  function toggleNotes() { document.body.classList.toggle("notes-on"); }
  function toggleCapture() { document.body.classList.toggle("capture"); }
  function resetCurrent() { goTo(current); }
  function badge(n) { if (!els) return; els.badge.textContent = n ? String(n) : ""; els.badge.hidden = !n; }
  function crumb(t) { if (els) els.crumb.textContent = t || ""; }
  function onKey(e) {
    var tag = (e.target && e.target.tagName) || ""; if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.target && e.target.isContentEditable) return;
    if (e.isComposing || e.keyCode === 229) {          // 한글 IME 상태: 물리 키(e.code)로 N/C/R만 처리
      var c = e.code;
      if (c === "KeyN") toggleNotes(); else if (c === "KeyC") toggleCapture(); else if (c === "KeyR") resetCurrent(); else return;
      e.preventDefault(); return;
    }
    if (e.repeat) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === "ArrowRight") next(); else if (k === "ArrowLeft") prev();
    else if (/^[1-9]$/.test(k)) goTo(parseInt(k, 10));
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "c" || k === "C") toggleCapture();
    else if (k === "r" || k === "R") resetCurrent();
    else return;
    e.preventDefault();
  }
  var bound = false;
  function init() {
    grab(); buildSidebar(); buildDots(); buildSteps();
    els.prev.onclick = prev; els.next.onclick = next;
    els.quit.onclick = showQuit; els.quitBack.onclick = hideQuit;
    if (!BASE && window.LB_DATA) BASE = clone(window.LB_DATA);
    if (!bound) {
      document.addEventListener("keydown", onKey);
      window.addEventListener("hashchange", function () {
        var n = parseInt(location.hash.slice(1), 10); if (n && n !== current) goTo(n);
      });
      bound = true;
    }
    var start = parseInt(location.hash.slice(1), 10);
    if (scenes.length) goTo(find(start) ? start : scenes[0].id);
  }
  var api = { registerScene: registerScene, scenes: scenes, MENU: MENU, STEPS: STEPS, init: init, goTo: goTo, next: next, prev: prev,
    toggleNotes: toggleNotes, toggleCapture: toggleCapture, resetCurrent: resetCurrent, badge: badge, crumb: crumb,
    esc: esc, later: later, clearTimers: clearTimers, pending: function () { return timers.length; },
    showQuit: showQuit, hideQuit: hideQuit, sync: false };
  Object.defineProperty(api, "current", { get: function () { return current; } });
  document.addEventListener("DOMContentLoaded", function () { if ($("lb-app") && !els) init(); });
  return api;
})();
