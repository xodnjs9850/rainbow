(function () {
  var esc = LB.esc, root, data, tab, sel, loading, results, chosen, named, name;
  function init() { tab = "cards"; sel = { animal: null, color: null, face: null }; loading = false; results = null; chosen = null; named = false; name = "토토"; }
  function colorHex(id) { var h = "#3B82F6"; data.cards.colors.forEach(function (c) { if (c.id === id) h = c.hex; }); return h; }
  function ready() { return !!(sel.animal && sel.color && sel.face); }
  function group(title, key, items) {
    return '<div class="opt-group"><h4>' + title + '</h4><div class="opts">' + items.map(function (it) {
      var sw = it.hex ? ' style="--sw:' + it.hex + '"' : '';
      return '<button class="opt' + (sel[key] === it.id ? ' on' : '') + '" data-group="' + key + '" data-id="' + it.id + '"' + sw + '>'
        + (it.hex ? '<i class="swatch"></i>' : '') + esc(it.name) + '</button>';
    }).join("") + '</div></div>';
  }
  function paint() {
    var right;
    if (loading) right = '<div class="gen-wait"><div class="spinner"></div><p>AI가 그림을 그리고 있어요…</p></div>';
    else if (results) right = '<div class="char-grid">' + results.map(function (svg, i) {
        return '<button class="char' + (chosen === i ? ' on' : '') + '" data-i="' + i + '">' + svg + '<span>' + (i + 1) + '안</span></button>';
      }).join("") + '</div>'
      + '<div class="log">' + data.filterLog.map(esc).join(' · ') + '</div>'
      + (chosen !== null ? '<div class="name-row"><label>이름</label><input id="s2-name" type="text" value="' + esc(name) + '"' + (named ? ' disabled' : '') + '>'
          + '<button id="s2-ok" class="btn big"' + (named ? ' disabled' : '') + '>이 친구로 할래요</button>'
          + (named ? '<span id="s2-done" class="badge ok big">' + esc(name) + ' 선택 완료</span>' : '') + '</div>' : '');
    else right = '<div class="gen-empty"><p>카드를 고르고 만들기를 눌러요</p></div>';
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>그림에서 캐릭터로</h2><span class="badge gray">AI 이미지 · 오리지널 캐릭터만</span></div>'
      + '<div class="row"><div class="card"><div class="tabs">'
      + ["cards:카드 고르기", "text:글쓰기", "draw:그림"].map(function (t) { var p = t.split(":"); return '<button class="tab' + (tab === p[0] ? ' on' : '') + '" data-tab="' + p[0] + '">' + p[1] + '</button>'; }).join("")
      + '</div>'
      + (tab === "cards"
          ? group("동물", "animal", data.cards.animals) + group("색", "color", data.cards.colors) + group("표정", "face", data.cards.faces)
          : '<p class="hint" style="padding:24px 0">' + (tab === "text" ? "글로 설명하는 방식은 시연 범위 밖입니다." : "직접 그리는 방식은 시연 범위 밖입니다.") + ' 카드 고르기로 진행해요.</p>')
      + '<button id="s2-gen" class="btn big"' + (ready() && !loading && !results ? '' : ' disabled') + '>AI 그림 만들기</button>'
      + '<p class="hint">학생 사진·이름·연락처는 입력하지 않아요. 저작권 캐릭터 이름은 걸러져요.</p></div>'
      + '<div class="card gen">' + right + '</div></div></div>';
    root.querySelectorAll(".tab").forEach(function (b) { b.onclick = function () { tab = b.getAttribute("data-tab"); paint(); }; });
    root.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { if (results) return; sel[b.getAttribute("data-group")] = b.getAttribute("data-id"); paint(); }; });
    root.querySelector("#s2-gen").onclick = function () {
      if (!ready() || results) return; loading = true; paint();
      LB.later(function () {
        loading = false;
        results = [0, 1, 2].map(function (p) { return LB_ART.character(sel.animal, colorHex(sel.color), sel.face, p); });
        paint();
      }, 1500);
    };
    root.querySelectorAll(".char").forEach(function (b) { b.onclick = function () { if (named) return; chosen = parseInt(b.getAttribute("data-i"), 10); paint(); }; });
    var ok = root.querySelector("#s2-ok");
    if (ok) ok.onclick = function () { name = root.querySelector("#s2-name").value || data.hero.character; named = true; paint(); };
  }
  LB.registerScene({
    id: 2, mode: "student", key: "studio", title: "그림에서 캐릭터로",
    summary: "학생의 표현을 AI가 오리지널 캐릭터로 바꾼다",
    note: "학생의 표현을 오리지널 캐릭터로 만듭니다. 사진은 쓰지 않고 이름·연락처는 밖으로 나가지 않습니다.",
    reset: function () { init(); },
    render: function (r, d) { root = r; data = d; paint(); }
  });
})();
