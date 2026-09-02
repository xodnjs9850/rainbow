(function () {
  var esc = LB.esc, root, data, loading, results, chosen, named, name, failed;
  function init() { loading = false; results = null; chosen = null; named = false; name = null; failed = [false, false, false]; }
  function colorHex(id) { var h = "#3B82F6"; data.cards.colors.forEach(function (c) { if (c.id === id) h = c.hex; }); return h; }
  function paint() {
    var right;
    if (loading) right = '<div class="gen-wait"><div class="spinner"></div><p>AI가 그림을 그리고 있어요…</p></div>';
    else if (results) right = '<div class="char-grid">' + results.map(function (r, i) {
        return '<button class="char' + (chosen === i ? ' on' : '') + '" data-i="' + i + '"' + (named ? ' disabled' : '') + '>'
          + '<span class="char-pic">' + (failed[i] ? r.svg : '<img src="' + esc(r.src) + '" alt="' + (i + 1) + '안">') + '</span><span>' + (i + 1) + '안</span></button>';
      }).join("") + '</div>'
      + '<div class="log">' + data.filterLog.map(esc).join(' · ') + '</div>'
      + (chosen !== null ? '<div class="name-row"><label>이름</label><input id="s2-name" type="text" value="' + esc(name) + '"' + (named ? ' disabled' : '') + '>'
          + '<button id="s2-ok" class="btn big"' + (named ? ' disabled' : '') + '>이 친구로 할래요</button>'
          + (named ? '<span id="s2-done" class="badge ok big">' + esc(name) + ' 선택 완료</span>' : '') + '</div>' : '');
    else right = '<div class="gen-empty"><p>만들기를 누르면 AI가 3가지 그림을 그려요</p></div>';
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>그림에서 캐릭터로</h2><span class="badge gray">AI 이미지 · 오리지널 캐릭터만</span></div>'
      + '<div class="row"><div class="card"><h3>내 캐릭터 그리기</h3>'
      + '<p class="lead-s">' + esc(data.hero.alias) + '가 고른 캐릭터 "' + esc(data.hero.character) + '"를 AI가 3가지 그림으로 그려요.</p>'
      + '<button id="s2-gen" class="btn big"' + (!loading && !results ? '' : ' disabled') + '>AI 그림 만들기</button>'
      + '<p class="hint">학생 사진·이름·연락처는 입력하지 않아요. 저작권 캐릭터 이름은 걸러져요.</p></div>'
      + '<div class="card gen">' + right + '</div></div></div>';
    root.querySelector("#s2-gen").onclick = function () {
      if (loading || results) return; loading = true; paint();
      LB.later(function () {
        loading = false;
        var h = data.hero.card;
        results = [0, 1, 2].map(function (p) {
          return { src: "assets/char-" + (p + 1) + ".png", svg: LB_ART.character(h.animal, colorHex(h.color), h.face, p) };
        });
        paint();
      }, 1500);
    };
    root.querySelectorAll(".char img").forEach(function (im, i) {
      im.onerror = function () { failed[i] = true; var pic = im.parentNode; if (pic) pic.innerHTML = results[i].svg; };
    });
    root.querySelectorAll(".char").forEach(function (b) { b.onclick = function () { if (named) return; chosen = parseInt(b.getAttribute("data-i"), 10); paint(); }; });
    var ok = root.querySelector("#s2-ok");
    if (ok) ok.onclick = function () { name = (root.querySelector("#s2-name").value || "").trim() || data.hero.character; named = true; paint(); };
    var ni = root.querySelector("#s2-name");
    if (ni) ni.oninput = function () { name = ni.value; };
  }
  LB.registerScene({
    id: 2, mode: "student", key: "studio", title: "그림에서 캐릭터로",
    summary: "학생이 고른 캐릭터를 AI가 오리지널 그림 3안으로 만든다",
    note: "학생의 표현을 오리지널 캐릭터로 만듭니다. 사진은 쓰지 않고 이름·연락처는 밖으로 나가지 않습니다.",
    reset: function () { init(); },
    render: function (r, d) { root = r; data = d; if (name == null) name = d.hero.character; paint(); }
  });
})();
