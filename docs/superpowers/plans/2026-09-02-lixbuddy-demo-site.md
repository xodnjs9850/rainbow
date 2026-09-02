# LIX Buddy 데모 사이트 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 레인보우피크닉 STEP2 발표평가용 LIX Buddy 소개 페이지 1장과 학생 4장면 + 교사 3장면 시나리오 데모를 무빌드 정적 파일로 만든다.

**Architecture:** `qtrace-demo`(형제 폴더 `C:\Users\xodnj\Desktop\project\qtrace-demo`)의 장면 엔진·테스트 하네스를 이식하고, 장면 규약에 `mode`("student"|"teacher")를 더해 한 `demo.html` 안에서 학생/교사 껍데기를 바꾼다. 엔진이 `LB.later()`로 타이머를 관리해 장면 전환 시 전부 해제하고, 테스트에서는 `LB.sync = true`로 즉시 실행한다. 데이터는 `window.LB_DATA` 한 세트, SVG 그림은 `window.LB_ART` 헬퍼.

**Tech Stack:** HTML·CSS·classic `<script>` JS(모듈 없음, 외부 자원 없음). 테스트는 `test/test.html` 브라우저 러너, 헤드리스는 Edge `--dump-dom`.

**Spec:** `docs/superpowers/specs/2026-09-02-lixbuddy-demo-site-design.md`

**작업 폴더:** 모든 경로는 `C:\Users\xodnj\Desktop\project\rainbow\` 기준. 셸 명령은 Git Bash 기준이며 이 폴더에서 실행한다.

**테스트 실행 명령(모든 태스크 공통):**

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --dump-dom "file:///C:/Users/xodnj/Desktop/project/rainbow/test/test.html" 2>/dev/null | grep -E "PASS|FAIL|passed"
```

마지막 줄이 `N passed, 0 failed`여야 한다. FAIL 줄이 있으면 그 이름과 메시지가 함께 나온다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `index.html` | 소개 페이지 6섹션. `js/flow.js`만 로드 |
| `demo.html` | 데모 껍데기: 고지 띠, 학생 상단 바, 교사 상단 바, 사이드바, 본문, 메모, 하단 데모 바, 그만하기 카드 |
| `css/base.css` | 토큰·버튼·배지·카드·표 공통(qtrace 이식 + 학생 토큰) |
| `css/app.css` | 데모 레이아웃(그리드·모드 전환·캡처) + 교사 모드 구성요소(상태판·알림·타임라인·보고서) |
| `css/studio.css` | 학생 모드 구성요소(진행 표시·그림카드·옵션·캐릭터·3D 회전·검수 목록) |
| `css/site.css` | 소개 페이지 레이아웃 |
| `js/data.js` | `window.LB_DATA` 가상 데이터 한 세트 |
| `js/art.js` | `window.LB_ART` 인라인 SVG 헬퍼(캐릭터·소지방식 아이콘·BLE 단면 오버레이) |
| `js/demo.js` | 장면 엔진 `window.LB` |
| `js/scenes/s1-consent.js` … `s7-report.js` | 장면 7개 |
| `js/flow.js` | `window.LB_FLOW` 9단계(소개 페이지 섹션 3) |
| `test/assert.js`, `test/test.html`, `test/tests/*.js` | 테스트 |
| `README.md` | 사용법·키·오프라인·고지 |

---

### Task 1: 레포 골격과 테스트 하네스

**Files:**
- Create: `test/assert.js`
- Create: `test/test.html`
- Create: `test/tests/t0-harness.js`

- [ ] **Step 1: 테스트 러너 작성**

`test/assert.js`:

```js
// 초소형 브라우저 테스트 러너. 의존성 없음. test.html에서 로드한다.
window.T = (function () {
  var out = document.getElementById("out");
  var pass = 0, fail = 0;
  function log(s) { out.textContent += s + "\n"; }
  function test(name, fn) {
    try { fn(); pass++; log("PASS " + name); }
    catch (e) { fail++; log("FAIL " + name + " — " + e.message); console.error(name, e); }
  }
  function eq(a, b, msg) {
    if (a !== b) throw new Error((msg || "") + " expected " + JSON.stringify(b) + " got " + JSON.stringify(a));
  }
  function ok(v, msg) { if (!v) throw new Error(msg || "expected truthy"); }
  function has(el, text, msg) {
    if (!el || (el.textContent || "").indexOf(text) < 0) throw new Error((msg || "") + " expected text '" + text + "'");
  }
  function done() {
    log("\n" + pass + " passed, " + fail + " failed");
    document.title = fail ? "FAIL" : "PASS";
    window.LB_TEST_RESULT = { pass: pass, fail: fail };
  }
  // 테스트용 DOM 조각을 만들고 돌려준다(격리).
  function stage(html) {
    var d = document.createElement("div"); d.innerHTML = html || "";
    document.getElementById("stage").appendChild(d); return d;
  }
  return { test: test, eq: eq, ok: ok, has: has, done: done, stage: stage };
})();
```

- [ ] **Step 2: 하네스 자기 테스트**

`test/tests/t0-harness.js`:

```js
T.test("harness: eq/ok/has 동작", function () {
  T.eq(1 + 1, 2); T.ok(true);
  var s = T.stage("<p>안녕</p>"); T.has(s, "안녕");
});
```

- [ ] **Step 3: 러너 페이지(스크립트 블록은 이후 태스크에서 채움)**

`test/test.html`:

```html
<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>lixbuddy-demo tests</title>
<style>body{font:14px/1.5 Consolas,monospace;padding:16px}#stage{position:absolute;left:-9999px;top:0;width:1280px}</style>
</head><body>
<pre id="out"></pre>
<div id="stage"></div>
<!-- scripts -->
<!-- /scripts -->
<script src="assert.js"></script>
<!-- tests -->
<script src="tests/t0-harness.js"></script>
<!-- /tests -->
<script>T.done();</script>
</body></html>
```

- [ ] **Step 4: 실행**

공통 테스트 명령 실행. Expected: `PASS harness: eq/ok/has 동작` 와 `1 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add test && git commit -m "test: 브라우저 테스트 하네스 이식"
```

---

### Task 2: 가상 데이터 `js/data.js`

**Files:**
- Create: `js/data.js`
- Create: `test/tests/t1-data.js`
- Modify: `test/test.html` (scripts·tests 블록)

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t1-data.js`:

```js
T.test("data: 학생 20명·주인공 태그·구역·검수·이벤트가 한 세트", function () {
  var d = window.LB_DATA; T.ok(d, "LB_DATA 없음");
  T.eq(d.students.length, 20);
  T.eq(d.students[2].alias, "파랑이"); T.eq(d.students[2].tag, "LB-0917-03");
  T.eq(d.students[10].alias, "노랑이"); T.eq(d.students[10].tag, "LB-0917-11");
  T.eq(d.hero.tag, "LB-0917-03"); T.eq(d.hero.character, "토토");
  T.eq(d.consent.carry.length, 3); T.eq(d.consent.promises.length, 3);
  T.eq(d.cards.animals.length, 3); T.eq(d.cards.colors.length, 3); T.eq(d.cards.faces.length, 2);
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
```

`test/test.html`의 `<!-- scripts -->` 블록에 `<script src="../js/data.js"></script>`, `<!-- tests -->` 블록의 t0 다음에 `<script src="tests/t1-data.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL data: ... — LB_DATA 없음`.

- [ ] **Step 3: 데이터 작성**

`js/data.js`:

```js
// 시연용 가상 데이터 한 세트. 실제 레인보우피크닉·학교·학생 정보가 아니다.
// 이름·사진·연락처·장애정보 필드는 두지 않는다. 학생은 별칭과 태그 ID만.
window.LB_DATA = (function () {
  var aliases = ["초록이", "하늘이", "파랑이", "별이", "달이", "구름이", "바람이", "나무", "꽃님", "솔이",
    "노랑이", "강이", "산이", "돌이", "보리", "콩이", "감자", "토리", "두리", "누리"];
  var carries = ["가방 클립", "가방 클립", "가방 클립", "손목 밴드", "가방 클립", "주머니형", "가방 클립", "손목 밴드", "가방 클립", "가방 클립",
    "가방 클립", "손목 밴드", "주머니형", "가방 클립", "가방 클립", "손목 밴드", "가방 클립", "주머니형", "손목 밴드", "가방 클립"];
  var batteries = [91, 88, 96, 77, 84, 62, 93, 79, 98, 85, 70, 90, 66, 87, 94, 81, 73, 89, 95, 83];
  var students = aliases.map(function (a, i) {
    var n = i + 1;
    return { alias: a, tag: "LB-0917-" + (n < 10 ? "0" + n : n), battery: batteries[i], carry: carries[i] };
  });
  return {
    school: { name: "햇살특수학교(가상)", cls: "햇살반" },
    users: { teacher: "담당교사", maker: "제작담당", guardian: "보호자" },
    hero: { alias: "파랑이", tag: "LB-0917-03", character: "토토", card: { animal: "rabbit", color: "blue", face: "smile" } },
    consent: {
      guardianDate: "2026-09-10",
      carry: [{ id: "clip", name: "가방 클립" }, { id: "band", name: "손목 밴드" }, { id: "pocket", name: "주머니형" }],
      promises: ["선생님이 부르면 대답해요", "정해진 곳에서 놀아요", "불편하면 말해요"]
    },
    cards: {
      animals: [{ id: "rabbit", name: "토끼" }, { id: "cat", name: "고양이" }, { id: "dino", name: "공룡" }],
      colors: [{ id: "blue", name: "파랑", hex: "#3B82F6" }, { id: "yellow", name: "노랑", hex: "#F59E0B" }, { id: "green", name: "초록", hex: "#22C55E" }],
      faces: [{ id: "smile", name: "웃음" }, { id: "brave", name: "씩씩" }]
    },
    filterLog: ["저작권 캐릭터 이름 검사 통과", "학생 사진 없음", "메타데이터 제거"],
    tripo: { task: "task_demo_7f3a", stages: ["queued", "running", "success"], genTime: "48초(시연값)" },
    core: {
      size: "42×28×9mm (시연값)", tolerance: "0.25mm/side", wall: "2.0mm", maxBox: "70×60×25mm",
      parts: ["코어 박스", "버튼", "LED 창", "부저 구멍", "배터리 접근부", "안테나 keep-out"]
    },
    checks: [
      { id: "watertight", name: "watertight" }, { id: "manifold", name: "비다양체" },
      { id: "wall", name: "최소 벽두께 2.0mm", warn: "귀 끝 1.6mm", fixed: "2.1mm" },
      { id: "sharp", name: "날카로운 모서리" }, { id: "loose", name: "작은 분리부품" },
      { id: "size", name: "최대 크기 70×60×25mm" }, { id: "keepout", name: "안테나 keep-out" }, { id: "orient", name: "출력 방향" }
    ],
    printEta: "1시간 40분(시연값)",
    session: {
      id: "S-0917", activity: "과학관 체험학습", date: "2026-09-17",
      zones: [
        { id: "hall", name: "입구홀", allowed: true, gw: "GW-01" }, { id: "a", name: "전시실A", allowed: true, gw: "GW-01" },
        { id: "b", name: "전시실B", allowed: true, gw: "GW-02" }, { id: "out", name: "야외광장", allowed: false, gw: "GW-02" }
      ],
      gateways: ["GW-01", "GW-02"], thresholds: { missScans: 2, exitSec: 60 }, escorts: 3, checkTime: "38초(시연값)"
    },
    students: students,
    events: [
      { id: "E1", type: "구역이탈", alias: "노랑이", tag: "LB-0917-11", zone: "야외광장", action: "인솔 복귀", response: "42초" },
      { id: "E2", type: "SOS", alias: "파랑이", tag: "LB-0917-03", action: "오입력" }
    ],
    actions: ["직접 확인함", "인솔 복귀", "오탐"],
    summary: { duration: "2시간 10분", checkTime: "38초", alerts: 2, exits: 1, sos: 1, falsePos: 1, avgResponse: "42초" },
    monthly: { classes: 1, sessions: 3, acceptance: "18/20", falseRate: "4%", falseLimit: "5%", satisfaction: "미측정" },
    report: { id: "RPT-0917-햇살반", version: "v1.0", source: "세션 #S-0917", retention: "원시 로그는 30일 후 자동 파기 · 익명 집계만 보관" }
  };
})();
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `3 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/data.js test && git commit -m "feat: 시연용 가상 데이터 한 세트"
```

---

### Task 3: SVG 헬퍼 `js/art.js`

**Files:**
- Create: `js/art.js`
- Create: `test/tests/t1-art.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t1-art.js`:

```js
T.test("art: 캐릭터 SVG는 동물별로 다르고 색이 들어가며 자세 3종", function () {
  var A = window.LB_ART; T.ok(A, "LB_ART 없음");
  var r = A.character("rabbit", "#3B82F6", "smile", 0);
  T.ok(r.indexOf("<svg") === 0, "svg로 시작"); T.ok(r.indexOf("#3B82F6") > 0, "색 반영");
  T.ok(r.indexOf("<ellipse") > 0, "토끼 귀");
  T.ok(A.character("cat", "#F59E0B", "brave", 1).indexOf("<polygon") > 0, "고양이 귀");
  T.ok(A.character("dino", "#22C55E", "smile", 2).indexOf("<polygon") > 0, "공룡 등");
  var p0 = A.character("rabbit", "#000", "smile", 0), p2 = A.character("rabbit", "#000", "smile", 2);
  T.ok(p0 !== p2, "자세가 다르면 SVG가 다르다");
  T.ok(r.indexOf("__C__") < 0 && r.indexOf("__S__") < 0, "치환 토큰이 남지 않는다");
});
T.test("art: 소지방식 아이콘 3종과 BLE 단면 오버레이", function () {
  var A = window.LB_ART;
  ["clip", "band", "pocket"].forEach(function (id) { T.ok(A.carry(id).indexOf("<svg") === 0, id); });
  T.eq(A.carry("nope"), "");
  var o = A.insertOverlay();
  T.ok(o.indexOf("<svg") === 0); T.ok(o.indexOf("keep-out") > 0, "keep-out 라벨"); T.ok(o.indexOf("버튼") > 0, "버튼 라벨");
});
```

`test/test.html` scripts 블록에 `<script src="../js/art.js"></script>`(data 다음), tests 블록에 `<script src="tests/t1-art.js"></script>`(t1-data 다음) 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL art: ... — LB_ART 없음`.

- [ ] **Step 3: 헬퍼 작성**

`js/art.js`:

```js
// 인라인 SVG 헬퍼. 외부 이미지 없이 캐릭터·아이콘·BLE 단면을 그린다. 전부 시연용 그림이다.
window.LB_ART = (function () {
  var EARS = {
    rabbit: '<ellipse cx="38" cy="26" rx="9" ry="24" fill="__C__"/><ellipse cx="62" cy="26" rx="9" ry="24" fill="__C__"/>',
    cat: '<polygon points="26,44 34,14 50,38" fill="__C__"/><polygon points="74,44 66,14 50,38" fill="__C__"/>',
    dino: '<polygon points="34,34 40,14 46,34" fill="__C__"/><polygon points="46,30 52,10 58,30" fill="__C__"/><polygon points="58,34 64,14 70,34" fill="__C__"/>'
  };
  var FACE = {
    smile: '<path d="M40 66q10 10 20 0" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>',
    brave: '<path d="M40 68h20" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/><path d="M34 46l10 4M66 46l-10 4" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>'
  };
  var ARMS = [
    '<line x1="22" y1="80" x2="10" y2="96" __S__/><line x1="78" y1="80" x2="90" y2="96" __S__/>',
    '<line x1="22" y1="80" x2="6" y2="80" __S__/><line x1="78" y1="80" x2="94" y2="80" __S__/>',
    '<line x1="22" y1="80" x2="10" y2="96" __S__/><line x1="78" y1="78" x2="92" y2="58" __S__/>'
  ];
  function character(animal, colorHex, face, pose) {
    var c = colorHex || "#3B82F6";
    var stroke = 'stroke="' + c + '" stroke-width="8" stroke-linecap="round"';
    return '<svg class="char-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">'
      + (EARS[animal] || EARS.rabbit).split("__C__").join(c)
      + '<circle cx="50" cy="58" r="30" fill="' + c + '"/>'
      + '<circle cx="40" cy="52" r="4" fill="#1F2937"/><circle cx="60" cy="52" r="4" fill="#1F2937"/>'
      + (FACE[face] || FACE.smile)
      + '<rect x="30" y="86" width="40" height="28" rx="10" fill="' + c + '"/>'
      + (ARMS[pose] || ARMS[0]).split("__S__").join(stroke)
      + '</svg>';
  }
  var CARRY = {
    clip: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="12" width="36" height="44" rx="6" fill="#BFDBFE"/><rect x="26" y="4" width="12" height="20" rx="4" fill="#1F4E79"/><circle cx="32" cy="40" r="6" fill="#1F4E79"/></svg>',
    band: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="34" rx="24" ry="14" fill="none" stroke="#FBCFE8" stroke-width="9"/><rect x="23" y="24" width="18" height="12" rx="3" fill="#1F4E79"/></svg>',
    pocket: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 16h40v28a20 20 0 0 1-40 0z" fill="#BBF7D0"/><rect x="24" y="8" width="16" height="14" rx="3" fill="#1F4E79"/></svg>'
  };
  function carry(id) { return CARRY[id] || ""; }
  // BLE Core Insert 단면. 규칙 엔진이 넣는 요소를 라벨과 함께 표시한다.
  function insertOverlay() {
    return '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" font-family="Malgun Gothic,sans-serif" font-size="4.2">'
      + '<defs><pattern id="lb-hatch" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="#DC2626" stroke-width=".6"/></pattern></defs>'
      + '<rect x="30" y="44" width="40" height="66" rx="4" fill="rgba(255,255,255,.82)" stroke="#1F4E79" stroke-width="1.2" stroke-dasharray="2.5 1.5"/>'
      + '<text x="50" y="49" text-anchor="middle" fill="#1F4E79" font-weight="700">코어 박스</text>'
      + '<rect x="34" y="52" width="32" height="10" fill="url(#lb-hatch)" stroke="#DC2626" stroke-width=".6"/>'
      + '<text x="50" y="59" text-anchor="middle" fill="#DC2626">안테나 keep-out</text>'
      + '<circle cx="42" cy="72" r="4.5" fill="#F59E0B" stroke="#92400E" stroke-width=".8"/><text x="42" y="82" text-anchor="middle" fill="#92400E">버튼</text>'
      + '<rect x="55" y="68" width="8" height="6" rx="1" fill="#22C55E"/><text x="59" y="82" text-anchor="middle" fill="#166534">LED 창</text>'
      + '<circle cx="38" cy="90" r="1.2" fill="#374151"/><circle cx="42" cy="90" r="1.2" fill="#374151"/><circle cx="46" cy="90" r="1.2" fill="#374151"/>'
      + '<text x="42" y="97" text-anchor="middle" fill="#374151">부저 구멍</text>'
      + '<rect x="54" y="87" width="12" height="8" rx="1" fill="#E5E7EB" stroke="#6B7280" stroke-width=".6"/><text x="60" y="101" text-anchor="middle" fill="#374151">배터리</text>'
      + '<text x="50" y="108" text-anchor="middle" fill="#6B7280">벽 2.0mm · 공차 0.25mm</text>'
      + '</svg>';
  }
  return { character: character, carry: carry, insertOverlay: insertOverlay };
})();
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `5 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/art.js test && git commit -m "feat: 인라인 SVG 헬퍼(캐릭터·소지 아이콘·BLE 단면)"
```

---

### Task 4: CSS 3종과 데모 껍데기 `demo.html`

**Files:**
- Create: `css/base.css`, `css/app.css`, `css/studio.css`, `demo.html`

시각 파일이라 자동 테스트는 없다. 다음 태스크의 엔진 테스트가 이 껍데기의 id를 쓴다.

- [ ] **Step 1: `css/base.css`**

```css
:root{
  --accent:#1F4E79; --accent-2:#2E6DA4; --bg:#F4F6F8; --card:#FFFFFF; --line:#E5E7EB;
  --text:#1F2937; --muted:#6B7280; --ok:#16A34A; --ok-bg:#ECFDF5;
  --warn:#B45309; --warn-bg:#FFFBEB; --danger:#DC2626; --danger-bg:#FEF2F2; --info-bg:#EFF6FF;
  --student:#2563EB; --student-2:#F59E0B; --student-bg:#FFFDF7; --ai-bg:#EFF6FF; --rule-bg:#F3F4F6;
  --font:"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  --radius:8px; --shadow:0 1px 3px rgba(0,0,0,.08);
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html,body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 var(--font)}
h1,h2,h3,h4{margin:0 0 .4em;line-height:1.3}
h1{font-size:34px}h2{font-size:26px}h3{font-size:20px}h4{font-size:17px}
p{margin:0 0 .8em}
a{color:var(--accent)}
.muted{color:var(--muted)}
.small{font-size:14px}
.spacer{flex:1}
/* 버튼 */
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border:1px solid var(--accent);
  border-radius:6px;background:var(--accent);color:#fff;font:inherit;font-size:15px;cursor:pointer}
.btn:hover{background:var(--accent-2)}
.btn.ghost{background:#fff;color:var(--accent)}
.btn.ghost:hover{background:var(--info-bg)}
.btn:disabled,.btn[aria-disabled="true"]{opacity:.45;cursor:not-allowed}
.btn.danger{background:var(--danger);border-color:var(--danger)}
/* 배지 */
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:700;line-height:1.4}
.badge.ok{background:var(--ok-bg);color:var(--ok)}
.badge.warn{background:var(--warn-bg);color:var(--warn)}
.badge.danger{background:var(--danger-bg);color:var(--danger)}
.badge.info{background:var(--info-bg);color:var(--accent)}
.badge.gray{background:#F3F4F6;color:var(--muted)}
/* 카드·표·폼 */
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}
.card + .card{margin-top:14px}
.row{display:flex;gap:14px;align-items:flex-start}
.row > *{flex:1;min-width:0}
.row > .card + .card{margin-top:0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
table.tbl{width:100%;border-collapse:collapse;font-size:15px}
.tbl th,.tbl td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.tbl th{background:#EEF2F7;font-weight:700;color:#374151}
.tbl tr.warn td{background:var(--warn-bg)}
.tbl tr.ok td{background:var(--ok-bg)}
.field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.field label{font-size:14px;color:var(--muted)}
.field input,.field select{font:inherit;font-size:15px;padding:8px 10px;border:1px solid #CBD5E1;border-radius:6px;background:#fff}
.kv{display:grid;grid-template-columns:140px 1fr;gap:6px 12px;font-size:15px}
.kv dt{color:var(--muted)}.kv dd{margin:0}
.line-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:6px;background:#fff;margin-bottom:8px;font-size:15px}
.line-item.warn{border-color:#F59E0B;background:var(--warn-bg)}
.line-item.ok{border-color:#86EFAC;background:var(--ok-bg)}
.line-item.danger{border-color:#FCA5A5;background:var(--danger-bg)}
.hint{font-size:14px;color:var(--muted);margin-top:8px}
.mono{font-family:Consolas,"Malgun Gothic",monospace;font-size:14px}
.log{background:#111827;color:#D1D5DB;padding:10px 12px;border-radius:6px;font-family:Consolas,monospace;font-size:13px;white-space:pre-wrap;margin-top:10px}
.tag{font-size:13px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--muted)}
.stamp{display:inline-block;border:2px solid var(--ok);color:var(--ok);padding:4px 10px;border-radius:4px;font-weight:800;transform:rotate(-6deg)}
```

- [ ] **Step 2: `css/app.css`(레이아웃·모드 전환·교사 구성요소)**

```css
/* 데모 레이아웃: 고지 30px · 상단 바 56px · 사이드바 200px · 하단 데모 바 64px. 1920×1080 프로젝터 기준 글자 크기. */
#lb-app{display:grid;height:100vh;grid-template-columns:200px 1fr;grid-template-rows:30px 56px 1fr auto 64px;
  grid-template-areas:"notice notice" "top top" "side stage" "side note" "bar bar"}
.notice{grid-area:notice;display:flex;align-items:center;justify-content:center;background:#FFF8E1;color:#5B4A00;font-size:13px;border-bottom:1px solid #F5D67A}
.topbar{grid-area:top;display:flex;align-items:center;gap:14px;padding:0 20px;background:#fff;border-bottom:1px solid var(--line)}
.logo{font-size:20px;font-weight:800;color:var(--accent);text-decoration:none;letter-spacing:.2px}
.logo b{color:var(--accent-2)}
.crumb{color:var(--muted);font-size:15px}
.bell{position:relative;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center}
.bell svg{width:22px;height:22px;stroke:#4B5563;stroke-width:1.6;fill:none}
.bell-badge{position:absolute;top:0;right:0;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--danger);
  color:#fff;font-size:12px;font-weight:700;line-height:18px;text-align:center}
.user{display:inline-flex;align-items:center;gap:8px;font-size:15px}
.avatar{width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700}
.sidebar{grid-area:side;background:#fff;border-right:1px solid var(--line);padding:12px 10px;display:flex;flex-direction:column;gap:2px}
.menu-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;color:#374151;text-decoration:none;font-size:15px}
.menu-item svg{width:20px;height:20px;fill:#9CA3AF;stroke:#9CA3AF;stroke-width:1.5}
.menu-item:hover{background:var(--bg)}
.menu-item.active{background:var(--info-bg);color:var(--accent);font-weight:700}
.menu-item.active svg{fill:var(--accent);stroke:var(--accent)}
.stage{grid-area:stage;overflow:auto;padding:24px 28px}
.stage h2{font-size:24px;margin-bottom:14px}
.stage .head{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.stage .head h2{margin:0}
.note{grid-area:note;display:none;background:#FFF8E1;border-top:1px solid #F5D67A;padding:12px 28px;font-size:16px;color:#5B4A00;max-height:18vh;overflow:auto}
.note::before{content:"발표 메모 · ";font-weight:700}
body.notes-on .note{display:block}
.demobar{grid-area:bar;display:flex;align-items:center;gap:14px;padding:0 20px;background:#1F2937;color:#fff}
.demobar .pos{font-weight:700;color:#93C5FD}
.demobar .titlewrap{display:flex;flex-direction:column;line-height:1.25}
.demobar .titlewrap b{font-size:16px}
.demobar .titlewrap .muted{color:#CBD5E1;font-size:13px}
.demobar .btn.ghost{background:transparent;color:#fff;border-color:#6B7280}
.demobar .btn.ghost:hover{background:rgba(255,255,255,.12)}
.demobar .keys{color:#9CA3AF}
.dots{display:flex;gap:6px;margin-right:10px}
.dot{width:10px;height:10px;border-radius:50%;background:#4B5563;cursor:pointer}
.dot.active{background:#60A5FA}
/* 모드 전환: body.mode-student / body.mode-teacher */
body.mode-student .topbar-teacher{display:none}
body.mode-teacher .topbar-student{display:none}
body.mode-student #lb-app{grid-template-columns:0 1fr}
body.mode-student .sidebar{display:none}
/* 캡처 모드: 고지·하단 데모 바·메모 숨김, 본문이 아래까지 */
body.capture #lb-app{grid-template-rows:0 56px 1fr 0 0}
body.capture .notice,body.capture .demobar,body.capture .note{display:none}
/* 그만하기 안내 카드(학생 모드) */
.quit-card{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(31,41,55,.45)}
.quit-card .card{max-width:520px;text-align:center;font-size:20px;border-radius:16px;padding:32px}
.quit-card h3{font-size:28px}
/* 교사 모드 구성요소 */
.zone{display:inline-block;padding:2px 10px;border-radius:999px;font-size:14px;margin:2px 0}
.zone.ok{background:var(--ok-bg);color:var(--ok)}
.zone.danger{background:var(--danger-bg);color:var(--danger)}
.board{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.tile{display:flex;flex-direction:column;gap:2px;padding:10px;border-radius:8px;text-align:center;border:1px solid var(--line);font-size:14px;background:#fff}
.tile.ok{background:var(--ok-bg);border-color:#86EFAC}
.tile.warn{background:var(--warn-bg);border-color:#F59E0B}
.tile.danger{background:var(--danger-bg);border-color:#FCA5A5;font-weight:700}
.alert-item{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;border-radius:6px;border:1px solid var(--line);margin-bottom:8px;font-size:15px}
.alert-item.danger{border-color:#FCA5A5;background:var(--danger-bg)}
.alert-item.ok{border-color:#86EFAC;background:var(--ok-bg)}
.acts{display:flex;gap:6px;flex-wrap:wrap}
.timeline{padding-left:18px;font-size:14px;line-height:1.8;margin:0}
.danger-t{color:var(--danger)}
.paper{background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);padding:30px 36px;max-width:720px;font-size:15px}
.paper h3{text-align:center;font-size:20px;margin-bottom:18px}
.paper .fact{background:var(--rule-bg);padding:10px;border-radius:4px;margin:10px 0}
.paper .ai{background:var(--ai-bg);padding:10px;border-radius:4px;margin:10px 0;border-left:3px solid var(--accent-2)}
.kpi{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.kpi.three{grid-template-columns:repeat(3,1fr)}
.kpi .card{text-align:center;margin:0}
.kpi .num{font-size:30px;font-weight:800;line-height:1.1}
.kpi .danger .num{color:var(--danger)}.kpi .warn .num{color:var(--warn)}.kpi .info .num{color:var(--accent)}
@media (max-width:1199px){body.mode-teacher #lb-app{grid-template-columns:64px 1fr}.menu-item span{display:none}.demobar .keys{display:none}.board{grid-template-columns:repeat(4,1fr)}}
```

- [ ] **Step 3: `css/studio.css`(학생 모드)**

```css
/* 학생 모드: 태블릿 수업 앱 톤. 둥근 모서리·밝은 색·큰 글자. */
.topbar-student{background:var(--student-bg)}
.topbar-student .logo{color:var(--student)}
.topbar-student .logo b{color:var(--student-2)}
.steps4{display:flex;gap:8px}
.steps4 .st{padding:6px 14px;border-radius:999px;background:#E5E7EB;font-size:15px;color:#374151}
.steps4 .st b{margin-right:6px}
.steps4 .st.active{background:var(--student);color:#fff}
.steps4 .st.done{background:#DBEAFE;color:var(--student)}
.btn.quit{background:#fff;color:var(--danger);border-color:#FCA5A5;font-size:16px;padding:10px 18px;border-radius:10px}
.btn.quit:hover{background:var(--danger-bg)}
body.mode-student .stage{background:var(--student-bg);font-size:18px}
.studio{max-width:1100px;margin:0 auto}
.studio.wide{max-width:1400px}
.studio .head h2{font-size:30px}
.studio .card{border-radius:16px;padding:22px}
.lead-s{font-size:22px;margin:6px 0 18px}
.picks{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}
.pick{display:flex;flex-direction:column;align-items:center;gap:10px;padding:22px;border:3px solid var(--line);border-radius:16px;background:#fff;font:inherit;font-size:20px;cursor:pointer;color:var(--text)}
.pick svg{width:96px;height:96px}
.pick.on{border-color:var(--student);background:#EFF6FF}
.promise{display:flex;align-items:center;gap:12px;font-size:20px;padding:10px 0}
.promise input{width:26px;height:26px}
.actions{display:flex;align-items:center;gap:14px;margin-top:14px;flex-wrap:wrap}
.btn.big{font-size:20px;padding:14px 26px;border-radius:12px;background:var(--student);border-color:var(--student)}
.btn.big:hover{background:#1D4ED8}
.btn.big.ghost{background:#fff;color:var(--student)}
.badge.big{font-size:17px;padding:8px 16px}
.summary{margin-top:16px}
.tabs{display:flex;gap:8px;margin-bottom:14px}
.tab{padding:8px 16px;border-radius:999px;border:2px solid var(--line);background:#fff;font:inherit;font-size:17px;cursor:pointer;color:var(--text)}
.tab.on{border-color:var(--student);color:var(--student);font-weight:700}
.opt-group h4{margin:10px 0 6px}
.opts{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.opt{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:2px solid var(--line);border-radius:12px;background:#fff;font:inherit;font-size:18px;cursor:pointer;color:var(--text)}
.opt.on{border-color:var(--student);background:#EFF6FF}
.swatch{width:18px;height:18px;border-radius:50%;background:var(--sw);display:inline-block}
.gen{min-height:420px;display:flex;flex-direction:column;justify-content:center}
.gen-empty,.gen-wait{text-align:center;color:var(--muted);font-size:20px}
.spinner{width:48px;height:48px;border:5px solid #DBEAFE;border-top-color:var(--student);border-radius:50%;margin:0 auto 12px;animation:lb-spin 1s linear infinite}
@keyframes lb-spin{to{transform:rotate(360deg)}}
.char-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.char{padding:12px;border:3px solid var(--line);border-radius:16px;background:#fff;cursor:pointer;font:inherit;font-size:16px;color:var(--text)}
.char.on{border-color:var(--student);background:#EFF6FF}
.char-svg{width:100%;height:auto;display:block}
.name-row{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}
.name-row input{font:inherit;font-size:20px;padding:10px 14px;border:2px solid #CBD5E1;border-radius:10px;width:200px}
.row.three > .card{flex:1}
.row.three > .card.center{flex:1.2;text-align:center}
.stages{list-style:none;padding:0;margin:10px 0}
.stages li{padding:6px 10px;border-radius:8px;margin-bottom:4px;background:#F3F4F6;font-family:Consolas,monospace}
.stages li.done{background:var(--ok-bg);color:var(--ok)}
.stages li.cur{background:#DBEAFE;color:var(--student);font-weight:700}
.bar{height:10px;background:#E5E7EB;border-radius:999px;overflow:hidden;margin:8px 0}
.bar i{display:block;height:100%;background:var(--student);transition:width .4s}
.spin{perspective:800px;width:260px;height:300px;margin:8px auto}
.spin.dim{opacity:.35}
.spin-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:lb-turn 6s linear infinite}
.spin:hover .spin-inner{animation-play-state:paused}
@keyframes lb-turn{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}
.spin-inner .char-svg{filter:drop-shadow(6px 10px 8px rgba(0,0,0,.25))}
.overlay{position:absolute;inset:0}
.overlay svg{width:100%;height:100%}
.parts{padding-left:20px;line-height:1.9;margin:6px 0}
.checklist{list-style:none;padding:0;margin:0 0 10px}
.chk{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:2px solid var(--line);border-radius:12px;margin-bottom:8px;font-size:18px;background:#fff}
.chk.ok{border-color:#86EFAC;background:var(--ok-bg)}
.chk.warn{border-color:#F59E0B;background:var(--warn-bg)}
.approve{text-align:center}
@media (max-width:1199px){.picks,.char-grid{grid-template-columns:1fr}.row.three{flex-direction:column}.steps4 .st{font-size:13px;padding:4px 10px}}
```

- [ ] **Step 4: `demo.html`**

```html
<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIX Buddy · 시나리오 데모</title>
<link rel="stylesheet" href="css/base.css"><link rel="stylesheet" href="css/app.css"><link rel="stylesheet" href="css/studio.css">
</head><body class="mode-student">
<div id="lb-app">
  <div id="lb-notice" class="notice">시연용 가상 데이터 · 실제 학생·학교·AI 출력이 아닙니다</div>
  <header class="topbar topbar-student">
    <a class="logo" href="index.html" title="소개 페이지로">LIX <b>Buddy</b> 만들기</a>
    <span class="badge info" title="학생은 이름 대신 별칭만 씁니다">파랑이</span>
    <span class="spacer"></span>
    <div id="lb-steps" class="steps4"></div>
    <span class="spacer"></span>
    <button id="lb-quit" class="btn quit" title="언제든 그만할 수 있어요">그만하기</button>
  </header>
  <header class="topbar topbar-teacher">
    <a class="logo" href="index.html" title="소개 페이지로">King <b>Check</b></a>
    <span id="lb-crumb" class="crumb"></span>
    <span class="spacer"></span>
    <span class="badge info">햇살특수학교(가상)</span>
    <span class="bell" title="알림">
      <svg viewBox="0 0 20 20"><path d="M10 2a5 5 0 0 0-5 5v3l-2 3h14l-2-3V7a5 5 0 0 0-5-5zM8 16a2 2 0 0 0 4 0"/></svg>
      <span id="lb-badge" class="bell-badge" hidden></span>
    </span>
    <span class="user"><span class="avatar">교</span>담당교사</span>
  </header>
  <nav id="lb-sidebar" class="sidebar"></nav>
  <main id="lb-stage" class="stage"></main>
  <aside id="lb-note" class="note"></aside>
  <footer id="lb-bar" class="demobar">
    <span id="lb-pos" class="pos"></span>
    <span class="titlewrap"><b id="lb-title"></b><span id="lb-summary" class="muted"></span></span>
    <span class="spacer"></span>
    <div id="lb-dots" class="dots"></div>
    <button id="lb-prev" class="btn ghost">◀ 이전</button>
    <button id="lb-next" class="btn">다음 ▶</button>
    <span class="keys muted small">←/→ 이동 · 1~7 장면 · N 메모 · C 캡처 · R 초기화</span>
  </footer>
  <div id="lb-quit-card" class="quit-card" hidden>
    <div class="card"><h3>괜찮아요</h3><p>오늘은 기본 쉘로 함께해요.<br>언제든 다시 만들 수 있어요.</p><button id="lb-quit-back" class="btn big">돌아가기</button></div>
  </div>
</div>
<script src="js/data.js"></script>
<script src="js/art.js"></script>
<script src="js/demo.js"></script>
<script src="js/scenes/s1-consent.js"></script>
<script src="js/scenes/s2-character.js"></script>
<script src="js/scenes/s3-model.js"></script>
<script src="js/scenes/s4-inspect.js"></script>
<script src="js/scenes/s5-session.js"></script>
<script src="js/scenes/s6-events.js"></script>
<script src="js/scenes/s7-report.js"></script>
</body></html>
```

- [ ] **Step 5: 커밋**

```bash
git add css demo.html && git commit -m "feat: 데모 껍데기와 CSS 3종(공통·앱·학생)"
```

---

### Task 5: 장면 엔진 `js/demo.js`

**Files:**
- Create: `js/demo.js`
- Create: `test/tests/t2-engine.js`, `test/tests/t3-scenes-util.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-scenes-util.js`(장면 파일이 로드 시 등록한 것을 보관하고, 타이머를 동기로 돈다):

```js
window.sceneById = function (id) {
  for (var i = 0; i < LB.scenes.length; i++) if (LB.scenes[i].id === id) return LB.scenes[i];
  throw new Error("scene " + id + " not registered");
};
// 장면 파일들은 로드 시 registerScene을 부른다. 엔진 테스트가 scenes를 비우므로 여기서 스냅샷을 보관한다.
window.SCENE_SNAPSHOT = LB.scenes.slice();
window.restoreScenes = function () { LB.scenes.length = 0; SCENE_SNAPSHOT.forEach(function (s) { LB.scenes.push(s); }); };
LB.sync = true; // 테스트에서는 LB.later가 즉시 실행
```

`test/tests/t2-engine.js`:

```js
(function () {
  // 엔진이 기대하는 DOM 최소 골격(demo.html과 같은 id)
  var SHELL = '<div id="lb-app">'
    + '<div id="lb-crumb"></div><span id="lb-badge"></span><div id="lb-steps"></div>'
    + '<button id="lb-quit"></button><div id="lb-quit-card" hidden><button id="lb-quit-back"></button></div>'
    + '<nav id="lb-sidebar"></nav><main id="lb-stage"></main>'
    + '<div id="lb-bar"><span id="lb-pos"></span><b id="lb-title"></b><span id="lb-summary"></span>'
    + '<button id="lb-prev"></button><button id="lb-next"></button><div id="lb-dots"></div></div>'
    + '<div id="lb-note"></div></div>';
  function stub(id, mode, key, calls) {
    return { id: id, mode: mode, key: key, title: "장면" + id, summary: "요약" + id, note: "메모" + id,
      render: function (root) { calls.push("render" + id); root.innerHTML = "<p>본문" + id + "</p>"; },
      reset: function () { calls.push("reset" + id); } };
  }
  function key(k) { document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true })); }
  T.test("engine: registerScene는 id 순으로 정렬", function () {
    var calls = []; LB.scenes.length = 0;
    LB.registerScene(stub(2, "student", null, calls)); LB.registerScene(stub(1, "student", null, calls));
    T.eq(LB.scenes.map(function (s) { return s.id; }).join(","), "1,2");
  });
  T.test("engine: goTo는 reset→render 순서로 부르고 바·해시·점을 갱신", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    LB.registerScene(stub(1, "student", null, calls)); LB.registerScene(stub(2, "teacher", "alerts", calls));
    LB.init();
    T.eq(calls.join(","), "reset1,render1"); T.eq(LB.current, 1);
    LB.goTo(2);
    T.eq(calls.slice(2).join(","), "reset2,render2");
    T.has(document.getElementById("lb-stage"), "본문2");
    T.has(document.getElementById("lb-pos"), "2 / 2");
    T.has(document.getElementById("lb-title"), "장면2");
    T.eq(location.hash, "#2");
    T.eq(document.querySelectorAll("#lb-dots .dot.active").length, 1);
    LB.goTo(9); T.eq(LB.current, 2, "범위 밖 무시");
  });
  T.test("engine: mode에 따라 body 클래스가 바뀐다", function () {
    T.ok(document.body.classList.contains("mode-teacher")); T.ok(!document.body.classList.contains("mode-student"));
    LB.goTo(1);
    T.ok(document.body.classList.contains("mode-student")); T.ok(!document.body.classList.contains("mode-teacher"));
  });
  T.test("engine: 사이드바는 MENU 6개, 교사 장면 key와 같은 항목만 active", function () {
    LB.goTo(2);
    var items = document.querySelectorAll("#lb-sidebar .menu-item");
    T.eq(items.length, 6);
    var active = document.querySelectorAll("#lb-sidebar .menu-item.active");
    T.eq(active.length, 1); T.has(active[0], "알림");
    LB.goTo(1); T.eq(document.querySelectorAll("#lb-sidebar .menu-item.active").length, 0, "학생 장면은 활성 없음");
  });
  T.test("engine: 학생 진행 표시 4단계, 현재 active·이전 done", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    [1, 2, 3, 4].forEach(function (i) { LB.registerScene(stub(i, "student", null, calls)); });
    LB.registerScene(stub(5, "teacher", "session", calls)); LB.init();
    var st = document.querySelectorAll("#lb-steps .st"); T.eq(st.length, 4);
    LB.goTo(3);
    st = document.querySelectorAll("#lb-steps .st");
    T.ok(st[0].classList.contains("done") && st[1].classList.contains("done"));
    T.ok(st[2].classList.contains("active")); T.ok(!st[3].classList.contains("done") && !st[3].classList.contains("active"));
    LB.goTo(5); T.eq(document.querySelectorAll("#lb-steps .st.active").length, 0, "교사 장면에서는 진행 표시 비활성");
  });
  T.test("engine: 그만하기 카드 열기·닫기, 장면 이동 시 닫힘, 장면 상태는 유지", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    LB.registerScene(stub(1, "student", null, calls)); LB.registerScene(stub(2, "student", null, calls)); LB.init();
    var card = document.getElementById("lb-quit-card");
    calls.length = 0;
    document.getElementById("lb-quit").click(); T.ok(!card.hidden, "열림"); T.eq(calls.length, 0, "장면 재렌더 없음");
    document.getElementById("lb-quit-back").click(); T.ok(card.hidden, "닫힘");
    LB.showQuit(); LB.goTo(2); T.ok(card.hidden, "이동 시 닫힘");
  });
  T.test("engine: later는 sync면 즉시, 아니면 지연, goTo가 대기 타이머를 모두 해제", function () {
    var hit = 0; LB.sync = true; LB.later(function () { hit++; }, 1000); T.eq(hit, 1);
    LB.sync = false; LB.later(function () { hit++; }, 5000); T.eq(hit, 1, "지연 중");
    LB.goTo(1); LB.clearTimers(); LB.sync = true;
    T.eq(hit, 1, "해제된 타이머는 실행되지 않는다(5초 뒤에도)");
  });
  T.test("engine: 키보드 →/←/숫자/N/C/R, 입력 필드에서는 무시", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    LB.registerScene(stub(1, "student", null, calls)); LB.registerScene(stub(2, "student", null, calls)); LB.init();
    key("ArrowRight"); T.eq(LB.current, 2);
    key("ArrowLeft"); T.eq(LB.current, 1);
    key("2"); T.eq(LB.current, 2);
    key("n"); T.ok(document.body.classList.contains("notes-on")); key("n"); T.ok(!document.body.classList.contains("notes-on"));
    key("c"); T.ok(document.body.classList.contains("capture")); key("c"); T.ok(!document.body.classList.contains("capture"));
    calls.length = 0; key("r"); T.eq(calls.join(","), "reset2,render2");
    var inp = T.stage('<input id="in1" type="text">').querySelector("#in1"); inp.focus();
    inp.dispatchEvent(new KeyboardEvent("keydown", { key: "1", bubbles: true }));
    T.eq(LB.current, 2, "입력 필드에서는 숫자 키를 먹지 않는다");
  });
  T.test("engine: badge/crumb/esc", function () {
    LB.badge(2); T.eq(document.getElementById("lb-badge").textContent, "2");
    T.ok(!document.getElementById("lb-badge").hidden);
    LB.badge(0); T.ok(document.getElementById("lb-badge").hidden);
    LB.crumb("세션 › 과학관 체험학습"); T.has(document.getElementById("lb-crumb"), "과학관");
    T.eq(LB.esc('<a href="x">&\''), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  });
  T.test("engine: prev/next는 양 끝에서 disabled, 데이터는 진입마다 원본으로 복원", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    LB.registerScene(stub(1, "student", null, calls)); LB.registerScene(stub(2, "student", null, calls)); LB.init();
    T.ok(document.getElementById("lb-prev").disabled); T.ok(!document.getElementById("lb-next").disabled);
    LB.goTo(2); T.ok(!document.getElementById("lb-prev").disabled); T.ok(document.getElementById("lb-next").disabled);
    window.LB_DATA.hero.character = "변조"; LB.goTo(1); T.eq(window.LB_DATA.hero.character, "토토");
  });
  T.test("engine: render가 던져도 다음 장면으로 넘어갈 수 있다", function () {
    var calls = []; LB.scenes.length = 0; T.stage(SHELL); history.replaceState(null, "", "#1");
    var bad = stub(1, "student", null, calls); bad.render = function () { throw new Error("boom"); };
    LB.registerScene(bad); LB.registerScene(stub(2, "student", null, calls)); LB.init();
    T.has(document.getElementById("lb-stage"), "렌더 실패"); LB.next(); T.eq(LB.current, 2);
  });
})();
```

`test/test.html` scripts 블록에 `<script src="../js/demo.js"></script>`(art 다음). tests 블록에 t1-art 다음 순서로 `<script src="tests/t3-scenes-util.js"></script>`, `<script src="tests/t2-engine.js"></script>` 추가. 주석도 추가: `<!-- 순서 규칙: 장면 파일은 scripts 블록에서 demo.js 뒤에 로드. t3-scenes-util.js는 t2-engine.js(scenes를 비움)보다 앞에. 장면 테스트(t3-sN.js)는 t2-engine.js 뒤에 두고 첫 줄에서 restoreScenes()를 부른다. -->`

- [ ] **Step 2: 실행해 실패 확인**

Expected: t3-scenes-util에서 `LB is not defined` 콘솔 오류로 이후 테스트가 실행되지 않거나 FAIL. (스크립트 오류로 `passed` 줄이 안 나올 수 있다. 그것도 실패다.)

- [ ] **Step 3: 엔진 작성**

`js/demo.js`:

```js
// 장면 엔진(qtrace-demo에서 이식). 장면 내부를 모른다. 장면은 registerScene 규약만 지킨다.
// 장면 규약: { id, mode:"student"|"teacher", key(교사 사이드바 메뉴 키 또는 null), keys?, title, summary, note?, reset(), render(root, data) }
// - data는 장면 진입마다 원본에서 다시 복제되므로 바꿔도 남지 않는다.
// - 리스너는 render가 받은 root 안에서만 건다.
// - 지연 실행은 LB.later(fn, ms)로만 한다. 장면 전환 시 엔진이 전부 해제한다. 테스트는 LB.sync=true로 즉시 실행.
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
    var s = find(n); if (!s || !els) return;
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
    if (e.isComposing || e.keyCode === 229) return;   // 한글 조합 중
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
    if (window.LB_DATA) BASE = clone(window.LB_DATA);
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
    esc: esc, later: later, clearTimers: clearTimers, showQuit: showQuit, hideQuit: hideQuit, sync: false };
  Object.defineProperty(api, "current", { get: function () { return current; } });
  document.addEventListener("DOMContentLoaded", function () { if ($("lb-app") && !els) init(); });
  return api;
})();
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `16 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/demo.js test && git commit -m "feat: 장면 엔진 이식 — mode 전환·진행 표시·그만하기·타이머 관리"
```

---

### Task 6: 장면 1 나의 안전, 나의 선택

**Files:**
- Create: `js/scenes/s1-consent.js`
- Create: `test/tests/t3-s1.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s1.js`:

```js
T.test("s1: 소지방식 3장 선택 + 약속 3개 체크 → 약속했어요 → 완료 배지·요약", function () {
  restoreScenes(); var s = sceneById(1); T.eq(s.mode, "student"); T.eq(s.key, null);
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "보호자 동의 완료 · 2026-09-10");
  T.eq(root.querySelectorAll(".pick").length, 3); T.eq(root.querySelectorAll(".promise input").length, 3);
  T.ok(root.querySelector("#s1-go").disabled, "처음엔 비활성");
  root.querySelector('.pick[data-id="band"]').click();
  T.ok(root.querySelector('.pick[data-id="band"]').classList.contains("on"));
  T.ok(root.querySelector("#s1-go").disabled, "약속 전엔 비활성");
  root.querySelectorAll(".promise input").forEach(function (i) { i.checked = true; i.dispatchEvent(new Event("change")); });
  T.ok(!root.querySelector("#s1-go").disabled);
  root.querySelector("#s1-go").click();
  T.ok(root.querySelector("#s1-done")); T.has(root.querySelector("#s1-summary"), "손목 밴드"); T.has(root.querySelector("#s1-summary"), "LB-0917-03");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.ok(!root.querySelector("#s1-done"), "reset 후 초기 상태");
});
```

`test/test.html` scripts 블록에 `<script src="../js/scenes/s1-consent.js"></script>`(demo.js 다음), tests 블록 t2-engine 다음에 `<script src="tests/t3-s1.js"></script>`.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s1: ... — scene 1 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s1-consent.js`:

```js
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
          return '<button class="pick' + (x.id === carry ? ' on' : '') + '" data-id="' + x.id + '">' + LB_ART.carry(x.id) + '<span>' + esc(x.name) + '</span></button>';
        }).join("") + '</div>'
      + '<div class="card promise-card"><h3>안전 약속</h3>' + c.promises.map(function (p, i) {
          return '<label class="promise"><input type="checkbox" data-i="' + i + '"' + (checked[i] ? ' checked' : '') + '><span>' + esc(p) + '</span></label>';
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
    reset: function () { carry = null; checked = [false, false, false]; done = false; },
    render: function (r, d) { root = r; data = d; paint(); }
  });
})();
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `17 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s1-consent.js test && git commit -m "feat: 장면 1 나의 안전, 나의 선택"
```

---

### Task 7: 장면 2 그림에서 캐릭터로

**Files:**
- Create: `js/scenes/s2-character.js`
- Create: `test/tests/t3-s2.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s2.js`:

```js
T.test("s2: 카드 3종 선택 → AI 그림 만들기 → 3안 + 필터 로그 → 선택·이름 → 완료", function () {
  restoreScenes(); var s = sceneById(2); T.eq(s.mode, "student"); T.eq(s.key, "studio");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".tab").length, 3); T.ok(root.querySelector('.tab[data-tab="cards"]').classList.contains("on"));
  T.eq(root.querySelectorAll(".opt").length, 8);
  T.ok(root.querySelector("#s2-gen").disabled, "카드 전엔 비활성"); T.has(root, "카드를 고르고");
  root.querySelector('.opt[data-group="animal"][data-id="rabbit"]').click();
  root.querySelector('.opt[data-group="color"][data-id="blue"]').click();
  T.ok(root.querySelector("#s2-gen").disabled, "표정 전엔 비활성");
  root.querySelector('.opt[data-group="face"][data-id="smile"]').click();
  T.ok(!root.querySelector("#s2-gen").disabled);
  root.querySelector("#s2-gen").click(); // LB.sync=true → 즉시 생성
  T.eq(root.querySelectorAll(".char").length, 3); T.has(root.querySelector(".log"), "학생 사진 없음");
  T.ok(root.querySelector(".char .char-svg").outerHTML.indexOf("#3B82F6") > 0, "선택한 색");
  T.ok(!root.querySelector("#s2-name"), "선택 전엔 이름 없음");
  root.querySelector('.char[data-i="0"]').click();
  T.eq(root.querySelector("#s2-name").value, "토토");
  root.querySelector("#s2-ok").click();
  T.has(root.querySelector("#s2-done"), "토토 선택 완료");
  root.querySelector('.tab[data-tab="text"]').click(); T.has(root, "시연 범위 밖");
});
```

`test/test.html`에 `<script src="../js/scenes/s2-character.js"></script>`, `<script src="tests/t3-s2.js"></script>` 추가(각 블록 끝).

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s2: ... — scene 2 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s2-character.js`:

```js
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
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `18 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s2-character.js test && git commit -m "feat: 장면 2 그림에서 캐릭터로"
```

---

### Task 8: 장면 3 2D에서 3D로

**Files:**
- Create: `js/scenes/s3-model.js`
- Create: `test/tests/t3-s3.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s3.js`:

```js
T.test("s3: Tripo 작업이 success에 도달하면 BLE 코어 넣기가 열리고 단면 오버레이가 나타난다", function () {
  restoreScenes(); var s = sceneById(3); T.eq(s.mode, "student");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA); // LB.sync=true → 타이머 즉시 → stage=2
  T.has(root, "task_demo_7f3a"); T.eq(root.querySelectorAll(".stages li").length, 3);
  T.eq(root.querySelectorAll(".stages li.done").length, 2); T.has(root.querySelector(".stages li.cur"), "success");
  T.has(root.querySelector("#s3-time"), "48초");
  T.ok(root.querySelector(".spin .char-svg"), "미리보기 캐릭터"); T.has(root, "실제 Tripo 출력이 아닌");
  T.ok(root.querySelector("#s3-overlay").hidden, "처음엔 오버레이 숨김");
  T.ok(!root.querySelector("#s3-insert").disabled);
  root.querySelector("#s3-insert").click();
  T.ok(!root.querySelector("#s3-overlay").hidden); T.has(root.querySelector("#s3-overlay"), "keep-out");
  T.ok(root.querySelector("#s3-done")); T.ok(root.querySelector("#s3-insert").disabled);
  T.has(root, "42×28×9mm"); T.has(root, "0.25mm/side");
});
T.test("s3: sync가 아니면 처음엔 queued이고 버튼이 잠겨 있다", function () {
  restoreScenes(); var s = sceneById(3); LB.sync = false;
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root.querySelector(".stages li.cur"), "queued"); T.ok(root.querySelector("#s3-insert").disabled);
  LB.clearTimers(); LB.sync = true;
});
```

`test/test.html`에 `<script src="../js/scenes/s3-model.js"></script>`, `<script src="tests/t3-s3.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s3: ... — scene 3 not registered`(2건).

- [ ] **Step 3: 장면 작성**

`js/scenes/s3-model.js`:

```js
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
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `20 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s3-model.js test && git commit -m "feat: 장면 3 2D에서 3D로 — Tripo 작업·BLE 코어 단면"
```

---

### Task 9: 장면 4 검수와 출력 승인

**Files:**
- Create: `js/scenes/s4-inspect.js`
- Create: `test/tests/t3-s4.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s4.js`:

```js
T.test("s4: 자동 검수 8항목 → 벽두께 경고 → 자동 보정 → 전체 통과 → 승인 → 출력 큐", function () {
  restoreScenes(); var s = sceneById(4); T.eq(s.mode, "student");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "제작담당 화면"); T.eq(root.querySelectorAll(".chk").length, 8);
  T.eq(root.querySelectorAll(".chk.ok, .chk.warn").length, 0); T.ok(!root.querySelector("#s4-fix"));
  T.ok(!root.querySelector("#s4-approve-card"), "검수 전엔 승인 카드 없음");
  root.querySelector("#s4-run").click(); // sync → 8항목 즉시
  T.eq(root.querySelectorAll(".chk.ok").length, 7); T.eq(root.querySelectorAll(".chk.warn").length, 1);
  T.has(root.querySelector(".chk.warn"), "귀 끝 1.6mm"); T.ok(root.querySelector("#s4-fix"));
  T.ok(!root.querySelector("#s4-approve-card"), "경고가 있으면 승인 카드 없음");
  root.querySelector("#s4-fix").click();
  T.eq(root.querySelectorAll(".chk.ok").length, 8); T.has(root.querySelector('.chk[data-id="wall"]'), "2.1mm");
  T.ok(root.querySelector("#s4-approve-card")); T.has(root.querySelector("#s4-approve-card"), "제작담당 승인 필요");
  T.ok(!root.querySelector("#s4-queue"));
  root.querySelector("#s4-approve").click();
  T.has(root.querySelector("#s4-queue"), "LB-0917-03"); T.has(root.querySelector("#s4-queue"), "1시간 40분");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".chk.ok").length, 0, "reset 후 초기 상태");
});
```

`test/test.html`에 `<script src="../js/scenes/s4-inspect.js"></script>`, `<script src="tests/t3-s4.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s4: ... — scene 4 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s4-inspect.js`:

```js
(function () {
  var esc = LB.esc, root, data, results, running, fixed, approved;
  function allOk() { return results.length > 0 && results.every(function (r) { return r === "ok"; }); }
  function hasWarn() { return results.indexOf("warn") >= 0; }
  function paint() {
    var doneCount = results.filter(Boolean).length;
    root.innerHTML = '<div class="studio wide"><div class="head"><h2>검수와 출력 승인</h2>'
      + '<span class="badge info">' + esc(data.users.maker) + ' 화면</span><span class="badge gray">' + esc(data.hero.character) + ' · ' + esc(data.hero.tag) + '</span></div>'
      + '<div class="row"><div class="card"><h3>STL 자동 검수 <span class="muted small">' + doneCount + ' / ' + data.checks.length + '</span></h3>'
      + '<ul class="checklist">' + data.checks.map(function (c, i) {
          var st = results[i];
          var label = st === "warn" ? '<span class="badge warn">경고 · ' + esc(c.warn) + '</span>'
            : st === "ok" ? '<span class="badge ok">통과' + (c.warn && fixed ? ' · ' + esc(c.fixed) : '') + '</span>'
            : '<span class="badge gray">대기</span>';
          return '<li class="chk ' + (st || '') + '" data-id="' + c.id + '"><span>' + esc(c.name) + '</span>' + label + '</li>';
        }).join("") + '</ul>'
      + '<div class="actions"><button id="s4-run" class="btn big"' + (running || doneCount ? ' disabled' : '') + '>자동 검수</button>'
      + (!running && hasWarn() ? '<button id="s4-fix" class="btn big ghost">자동 보정</button>' : '') + '</div>'
      + '<p class="hint">검증 없이 출력되지 않아요. 자동 보정도 사람이 승인해요.</p></div>'
      + '<div class="card">' + (allOk()
          ? '<div id="s4-approve-card" class="approve"><h3>출력 승인</h3><p>모든 항목 통과 · <b>' + esc(data.users.maker) + ' 승인 필요</b></p>'
            + '<button id="s4-approve" class="btn big"' + (approved ? ' disabled' : '') + '>승인</button>'
            + (approved ? '<div id="s4-queue" class="line-item ok" style="margin-top:14px"><span>출력 큐 등록 · ' + esc(data.hero.tag) + ' · ' + esc(data.hero.character) + '</span><span class="badge ok">예상 ' + esc(data.printEta) + '</span></div>' : '') + '</div>'
          : '<h3>출력 승인</h3><p class="hint">검수를 모두 통과하면 승인 카드가 열려요.</p>') + '</div></div></div>';
    root.querySelector("#s4-run").onclick = run;
    var fix = root.querySelector("#s4-fix");
    if (fix) fix.onclick = function () { results = results.map(function (r) { return r === "warn" ? "ok" : r; }); fixed = true; paint(); };
    var ap = root.querySelector("#s4-approve");
    if (ap) ap.onclick = function () { approved = true; paint(); };
  }
  function run() {
    if (running || results.filter(Boolean).length) return; running = true;
    (function step(i) {
      if (i >= data.checks.length) { running = false; paint(); return; }
      results[i] = data.checks[i].warn && !fixed ? "warn" : "ok"; paint();
      LB.later(function () { step(i + 1); }, 300);
    })(0);
  }
  LB.registerScene({
    id: 4, mode: "student", key: null, title: "검수와 출력 승인",
    summary: "8개 자동 검수를 통과하고 제작담당이 승인해야 출력된다",
    note: "검증 없이 출력되지 않습니다. 자동 보정도 사람이 승인합니다.",
    reset: function () { results = []; running = false; fixed = false; approved = false; },
    render: function (r, d) { root = r; data = d; if (results.length !== d.checks.length) results = d.checks.map(function () { return null; }); paint(); }
  });
})();
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `21 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s4-inspect.js test && git commit -m "feat: 장면 4 검수와 출력 승인"
```

---

### Task 10: 장면 5 세션 시작

**Files:**
- Create: `js/scenes/s5-session.js`
- Create: `test/tests/t3-s5.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s5.js`:

```js
T.test("s5: 세션 설정·20행 대기 → 세션 시작 → 게이트웨이 연결·20칸 정상·전원 확인", function () {
  restoreScenes(); var s = sceneById(5); T.eq(s.mode, "teacher"); T.eq(s.key, "session"); T.eq((s.keys || []).join(","), "session,students");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "과학관 체험학습"); T.eq(root.querySelectorAll(".zone.ok").length, 3); T.eq(root.querySelectorAll(".zone.danger").length, 1);
  T.has(root, "60초 이상"); T.eq(root.querySelectorAll("tr.stu").length, 20); T.eq(root.querySelectorAll("tr.stu.ok").length, 0);
  T.has(root.querySelector('tr.stu[data-tag="LB-0917-03"]'), "파랑이");
  T.ok(!root.querySelector("#s5-check")); T.ok(!root.querySelector("#s5-gw .badge.ok"));
  root.querySelector("#s5-start").click(); // sync → 20칸 즉시
  T.eq(root.querySelectorAll("#s5-gw .badge.ok").length, 2);
  T.eq(root.querySelectorAll("tr.stu.ok").length, 20); T.has(root.querySelector("#s5-check"), "38초");
  T.ok(root.querySelector("#s5-start").disabled);
  T.ok(root.textContent.indexOf("이름") >= 0 && root.textContent.indexOf("별칭") >= 0, "별칭 사용 표기");
});
```

`test/test.html`에 `<script src="../js/scenes/s5-session.js"></script>`, `<script src="tests/t3-s5.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s5: ... — scene 5 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s5-session.js`:

```js
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
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `22 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s5-session.js test && git commit -m "feat: 장면 5 세션 시작"
```

---

### Task 11: 장면 6 이벤트와 대응

**Files:**
- Create: `js/scenes/s6-events.js`
- Create: `test/tests/t3-s6.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s6.js`:

```js
T.test("s6: 상황 재생 → 노랑이 확인 필요 → 확인 → 인솔 복귀 → 복구 → SOS → 확인 → 오입력 기록", function () {
  restoreScenes(); var s = sceneById(6); T.eq(s.mode, "teacher"); T.eq(s.key, "alerts");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.eq(root.querySelectorAll(".tile").length, 20); T.eq(root.querySelectorAll(".tile.ok").length, 20);
  T.has(root.querySelector("#s6-alerts"), "알림이 없어요"); T.eq(root.querySelectorAll("#s6-timeline li").length, 0);
  root.querySelector("#s6-play").click(); // sync → 주의를 지나 확인 필요까지
  var y = root.querySelector('.tile[data-tag="LB-0917-11"]');
  T.ok(y.classList.contains("danger")); T.has(y, "확인 필요");
  T.ok(root.querySelector("#s6-a1")); T.has(root.querySelector("#s6-a1"), "야외광장"); T.ok(root.querySelector("#s6-confirm"));
  T.ok(root.querySelector("#s6-play").disabled);
  root.querySelector("#s6-confirm").click();
  T.eq(root.querySelectorAll(".s6-act").length, 3);
  root.querySelector('.s6-act[data-act="인솔 복귀"]').click(); // sync → 복구 후 SOS 즉시
  y = root.querySelector('.tile[data-tag="LB-0917-11"]'); T.ok(y.classList.contains("ok"));
  T.has(root.querySelector("#s6-a1"), "인솔 복귀"); T.has(root.querySelector("#s6-a1"), "42초");
  var b = root.querySelector('.tile[data-tag="LB-0917-03"]'); T.ok(b.classList.contains("danger"), "SOS");
  T.ok(root.querySelector("#s6-confirm2")); T.has(root.querySelector("#s6-a2"), "SOS");
  root.querySelector("#s6-confirm2").click();
  T.has(root.querySelector("#s6-a2"), "오입력 기록"); T.eq(root.querySelectorAll(".tile.ok").length, 20);
  T.eq(root.querySelectorAll("#s6-timeline li").length, 6);
  T.ok(root.textContent.indexOf("GPS") >= 0, "구역 기반 표기");
  s.reset(); root.innerHTML = ""; s.render(root, LB_DATA);
  T.has(root.querySelector("#s6-alerts"), "알림이 없어요");
});
```

`test/test.html`에 `<script src="../js/scenes/s6-events.js"></script>`, `<script src="tests/t3-s6.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s6: ... — scene 6 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s6-events.js`:

```js
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
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `23 passed, 0 failed`.

- [ ] **Step 5: 커밋**

```bash
git add js/scenes/s6-events.js test && git commit -m "feat: 장면 6 이벤트와 대응"
```

---

### Task 12: 장면 7 세션 종료와 보고

**Files:**
- Create: `js/scenes/s7-report.js`
- Create: `test/tests/t3-s7.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t3-s7.js`:

```js
T.test("s7: 요약 KPI·사실값 표·AI 초안 → 승인 → 도장·승인됨, 보관 배너", function () {
  restoreScenes(); var s = sceneById(7); T.eq(s.mode, "teacher"); T.eq(s.key, "report"); T.eq((s.keys || []).join(","), "dashboard,report");
  var root = T.stage(""); s.reset(); s.render(root, LB_DATA);
  T.has(root, "RPT-0917-햇살반"); T.eq(root.querySelectorAll(".kpi.three .card").length, 6);
  T.has(root.querySelector(".paper .fact"), "세션 로그"); T.has(root.querySelector(".paper .fact"), "38초");
  T.has(root.querySelector("#s7-aibadge"), "AI 초안"); T.has(root.querySelector("#s7-aibadge"), "승인 전"); T.has(root.querySelector("#s7-aibadge"), "세션 #S-0917");
  T.ok(!root.querySelector("#s7-stamp"));
  T.has(root, "30일 후 자동 파기"); T.has(root, "18/20"); T.has(root, "경보선 5%");
  root.querySelector("#s7-approve").click();
  T.has(root.querySelector("#s7-stamp"), "v1.0"); T.has(root.querySelector("#s7-stamp"), "담당교사 승인");
  T.has(root.querySelector("#s7-aibadge"), "승인됨"); T.ok(root.querySelector("#s7-approve").disabled);
});
```

`test/test.html`에 `<script src="../js/scenes/s7-report.js"></script>`, `<script src="tests/t3-s7.js"></script>` 추가.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL s7: ... — scene 7 not registered`.

- [ ] **Step 3: 장면 작성**

`js/scenes/s7-report.js`:

```js
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
```

- [ ] **Step 4: 실행해 통과 확인**

Expected: `24 passed, 0 failed`.

- [ ] **Step 5: 브라우저에서 데모 전체 열어 눈으로 확인**

`demo.html`을 Edge로 열어(`file:///C:/Users/xodnj/Desktop/project/rainbow/demo.html`) 1→7을 [다음]으로 넘기며 각 장면의 클릭을 스펙 §3.3대로 수행한다. 콘솔 오류 0. 문제가 있으면 이 태스크에서 고친다.

- [ ] **Step 6: 커밋**

```bash
git add js/scenes/s7-report.js test && git commit -m "feat: 장면 7 세션 종료와 보고"
```

---

### Task 13: 소개 페이지 `index.html`

**Files:**
- Create: `js/flow.js`, `css/site.css`, `index.html`
- Create: `test/tests/t4-site.js`
- Modify: `test/test.html`

- [ ] **Step 1: 실패하는 테스트**

`test/tests/t4-site.js`:

```js
T.test("site: 9단계 파이프라인, AI 단계 3·4·9, 규칙 엔진 단계 5·6", function () {
  T.ok(window.LB_FLOW, "LB_FLOW 없음"); T.eq(LB_FLOW.length, 9);
  T.eq(LB_FLOW.filter(function (s) { return s.ai; }).map(function (s) { return s.no; }).join(","), "3,4,9");
  T.eq(LB_FLOW.filter(function (s) { return s.rule; }).map(function (s) { return s.no; }).join(","), "5,6");
});
```

`test/test.html` scripts 블록 끝에 `<script src="../js/flow.js"></script>`, tests 블록 끝에 `<script src="tests/t4-site.js"></script>`.

- [ ] **Step 2: 실행해 실패 확인**

Expected: `FAIL site: ... — LB_FLOW 없음`.

- [ ] **Step 3: `js/flow.js`**

```js
// 계획서 9단계 파이프라인. ai:true = AI가 개입하는 단계, rule:true = 결정론(규칙 엔진) 단계. 소개 페이지 §3에서 사용.
window.LB_FLOW = [
  { no: 1, name: "동의·선택", desc: "보호자 동의와 학생의 자발적 동의, 소지방식 선택" },
  { no: 2, name: "창작 입력", desc: "텍스트·직접 그린 그림·선택형 카드 중 하나. 사진·연락처는 입력하지 않음" },
  { no: 3, name: "AI 이미지", desc: "오리지널 캐릭터의 정면·측면 실루엣 생성, 저작권·부적절 필터", ai: true },
  { no: 4, name: "Tripo 3D", desc: "V3 image-to-model 비동기 작업, 메시를 STL 워크플로로", ai: true },
  { no: 5, name: "공학 결합", desc: "BLE Core Insert·버튼·LED·부저·배터리·체결부를 결정론적으로 결합", rule: true },
  { no: 6, name: "자동 검수", desc: "watertight·벽두께·모서리·분리부품·크기·keep-out·출력방향", rule: true },
  { no: 7, name: "출력·조립", desc: "FDM 출력, 후가공, 코어 조립, 태그 ID 등록, 기능시험" },
  { no: 8, name: "안전 세션", desc: "교사가 허용구역·시간·임계치를 설정하고 게이트웨이 시작" },
  { no: 9, name: "대응·집계", desc: "미확인·구역이탈·SOS를 교사가 확인·조치, AI는 익명 로그 요약 초안", ai: true }
];
```

- [ ] **Step 4: `css/site.css`**

```css
body.site{background:#fff}
.site-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:26px;padding:14px 48px;background:#fff;border-bottom:1px solid var(--line)}
.site-top .logo{font-size:20px;font-weight:800;color:var(--student)}
.site-top .logo b{color:var(--student-2)}
.site-top nav{display:flex;gap:18px;flex:1}
.site-top nav a{color:#374151;text-decoration:none;font-size:15px}
.site-top nav a:hover{color:var(--accent)}
.hero{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;padding:64px 48px;background:linear-gradient(180deg,#FFFDF7,#fff)}
.eyebrow{color:var(--student);font-weight:700;font-size:15px;margin-bottom:10px}
.hero h1{font-size:40px;line-height:1.25;margin-bottom:16px}
.lead{font-size:18px;color:#374151;max-width:640px}
.hero-cards{display:flex;flex-direction:column;gap:12px;justify-content:center}
.hero-cards .card{padding:16px 18px;border-radius:14px}.hero-cards .card+.card{margin:0}
.hero-cards .ic{font-size:24px;margin-bottom:4px}
.hero-cards h3{font-size:18px}.hero-cards p{margin:0;color:#374151;font-size:15px}
.block{padding:56px 48px;border-top:1px solid var(--line);scroll-margin-top:80px}
.block h2{font-size:28px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.grid6{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}
.grid4 .card,.grid6 .card{margin:0}
.grid4 h4{color:var(--accent)}.grid4 p{margin:0;font-size:15px}
.grid4 .src{display:block;margin-top:8px;font-size:12px;color:var(--muted)}
.flow9{display:grid;grid-template-columns:repeat(9,1fr);gap:10px;margin-top:18px}
.flow9 .f{position:relative;padding:14px 10px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;min-height:110px}
.flow9 .f .n{position:absolute;top:-10px;left:10px;background:#6B7280;color:#fff;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px}
.flow9 .f .t{font-weight:700;margin-top:4px;font-size:15px}
.flow9 .f .d{font-size:12px;color:var(--muted);margin-top:4px;opacity:0;transition:opacity .15s}
.flow9 .f:hover .d{opacity:1}
.flow9 .f .r{display:inline-block;margin-top:6px;font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--rule-bg);color:#374151}
.flow9 .f.ai{border-color:var(--accent);background:var(--ai-bg)}
.flow9 .f.ai .n{background:var(--accent)}
.flow9 .f.rule{border-color:#9CA3AF;background:var(--rule-bg)}
.ok-side ul,.no-side ul{padding-left:20px;margin:8px 0 0;font-size:15px;line-height:1.8}
.ok-side{border-top:4px solid var(--ok)}.no-side{border-top:4px solid var(--danger)}
.card.num{text-align:center}.card.num .big{font-size:40px;font-weight:800;color:var(--accent);line-height:1.1;margin-bottom:6px}
.card.num div:last-child{font-size:14px;color:#374151}
.arch{display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1080px;margin-top:18px}
.arch-col{display:flex;flex-direction:column;gap:8px;align-items:stretch}
.arch-col h4{text-align:center;color:var(--muted)}
.arch .node{padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:#fff;text-align:center;font-size:15px}
.arch .node.strong{border-color:var(--accent);background:var(--info-bg);font-weight:700}
.arch .node.ai{border-color:var(--accent-2);background:var(--ai-bg)}
.arch .node.rule{border-color:#9CA3AF;background:var(--rule-bg)}
.arch .node.lock{border-color:var(--ok);background:var(--ok-bg)}
.arch .arrow{text-align:center;color:var(--muted)}
.rules{margin:22px 0 0;padding-left:20px;font-size:15px;line-height:1.9;max-width:1080px}
.site-foot{display:flex;justify-content:space-between;padding:22px 48px;border-top:1px solid var(--line);font-size:14px}
@media (max-width:1199px){.hero{grid-template-columns:1fr}.grid4,.grid6{grid-template-columns:repeat(2,1fr)}.flow9{grid-template-columns:repeat(3,1fr)}.arch{grid-template-columns:1fr}}
```

- [ ] **Step 5: `index.html`**

```html
<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIX Buddy · 학생이 만들고 교사가 안전을 운영하는 특수교육 에듀테크</title>
<link rel="stylesheet" href="css/base.css"><link rel="stylesheet" href="css/site.css">
</head><body class="site">
<header class="site-top">
  <span class="logo">LIX <b>Buddy</b></span>
  <nav><a href="#problem">문제</a><a href="#flow">파이프라인</a><a href="#ai">AI 경계</a><a href="#kpi">성과 목표</a><a href="#arch">구성</a></nav>
  <a class="btn" href="demo.html#1">시나리오 데모 보기 ▶</a>
</header>

<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">레인보우피크닉 · LIXLABS · STEP2 AI 비즈니스 모델</p>
    <h1>학생이 만들고<br>교사가 안전을 운영하는 특수교육 에듀테크</h1>
    <p class="lead">특수교육대상 학생이 자신이 좋아하는 오리지널 캐릭터를 AI 이미지와 Tripo API V3로 3D화하고, 규격화된 BLE Core Insert가 정확히 결합되는 자기만의 안전태그 쉘을 만들어 자발적 소지·착용을 높이며, 교사는 King Check에서 미확인·구역이탈·SOS·충격 의심 이벤트와 대응시간을 관리·집계하는 참여형 안전 에듀테크 플랫폼입니다.</p>
    <p><a class="btn" href="demo.html#1">시나리오 데모 보기 ▶</a> <a class="btn ghost" href="#flow">파이프라인 먼저 보기</a></p>
  </div>
  <div class="hero-cards">
    <div class="card"><div class="ic">🎨</div><h3>학생이 만들고 교사가 운영</h3><p>한 번의 수업이 개인 결과물, 반복 사용되는 안전도구, 기관용 운영 데이터로 이어집니다.</p></div>
    <div class="card"><div class="ic">📐</div><h3>AI는 외형만, 치수는 규칙 엔진</h3><p>Tripo가 캐릭터 외형을 만들고, 공차·안테나 공간·버튼·LED 구멍은 결정론적 엔진이 넣습니다.</p></div>
    <div class="card"><div class="ic">🧭</div><h3>추적이 아니라 구역 확인, 확정은 교사</h3><p>게이트웨이 구역 이벤트를 표시만 하고, 확인·조치·기록은 교사가 합니다. 좌표 추적이 아닙니다.</p></div>
  </div>
</section>

<section id="problem" class="block">
  <h2>지금의 문제</h2>
  <p class="muted">안전 필요는 크지만, 기기를 주는 것과 실제로 소지하는 것은 다릅니다.</p>
  <div class="grid4">
    <div class="card"><h4>실종·이탈 위험은 반복된다</h4><p>특수교육대상 학생 124,195명, 특수학급 15,426학급. 체험활동에서 교사가 짧은 시간에 여러 학생을 확인할 보조도구가 필요 → <b>세션 기반 구역 확인·기록</b></p><span class="src">출처: e-나라지표 특수교육 규모(2026). 도입효과를 입증하는 수치가 아닌 배경자료입니다.</span></div>
    <div class="card"><h4>지급과 소지는 다르다</h4><p>감각 불편·낙인·기기 노출로 실제 소지 유지가 낮아질 수 있음 → <b>학생이 선택하고 직접 만드는 개인화 쉘</b></p><span class="src">국내 직접 통계는 없어 STEP2 실증에서 일반 케이스와 비교 측정합니다.</span></div>
    <div class="card"><h4>생성형 3D는 공차를 보장하지 않는다</h4><p>외형은 빠르게 나오지만 삽입공간·버튼·안테나 간섭·벽두께는 보장 못함 → <b>파라메트릭 BLE Core Insert + 자동 검수</b></p></div>
    <div class="card"><h4>AI가 개발 보조에 머문다</h4><p>코드 작성 보조는 누구나 복제 가능, 고객이 체감하는 AI 가치가 불명확 → <b>학생 창작·제조 데이터·교사 요약에 AI를 직접 연결</b></p></div>
  </div>
</section>

<section id="flow" class="block">
  <h2>학생 제작에서 교사 운영까지 9단계</h2>
  <p class="muted">파란 단계에서 AI가 개입하고, 회색 단계는 규칙 엔진이 결정론적으로 처리합니다. 마우스를 올리면 설명이 보입니다.</p>
  <div id="flow-steps" class="flow9"></div>
</section>

<section id="ai" class="block">
  <h2>AI가 하는 일 / 하면 안 되는 일</h2>
  <div class="grid2">
    <div class="card ok-side"><h3>하는 일 <span class="badge ok">보조</span></h3>
      <ul>
        <li><b>이미지 생성</b> — 학생의 표현을 단순·친근한 오리지널 캐릭터로 시각화 <span class="muted">— 최종 검수: 학생·교사 선택, 필터 로그</span></li>
        <li><b>Tripo 3D</b> — 2D 이미지에서 장식용 3D 메시 생성 <span class="muted">— 메시 자동검수 + 제작담당 승인</span></li>
        <li><b>쉘 엔진</b> — AI가 아니라 규칙 기반으로 삽입공간·벽·구멍·체결부 생성 <span class="muted">— 공차쿠폰·조립시험·출력 체크리스트</span></li>
        <li><b>안전 분석</b> — 세션 로그를 요약하고 반복 패턴을 제안 <span class="muted">— 교사 확인·수정·승인</span></li>
      </ul></div>
    <div class="card no-side"><h3>하면 안 되는 일 <span class="badge danger">사람·규칙 엔진</span></h3>
      <ul>
        <li>학생 사진을 변형하거나 저작권 캐릭터를 그대로 복제</li>
        <li>BLE 치수·공차·체결구조를 프롬프트만으로 확정</li>
        <li>검증 없이 STL을 자동 출력</li>
        <li>사고를 확정진단하거나 교사 승인 없이 경보를 해제</li>
        <li>질병·낙상 확정진단, 자동 구조 결정, 112/119 자동신고</li>
      </ul></div>
  </div>
</section>

<section id="kpi" class="block">
  <h2>성과 목표 <span class="muted small">사업 종료 목표 (12주) · 기준선은 1~2주차 측정</span></h2>
  <div class="grid6">
    <div class="card num"><div class="big">20분</div><div>1개 쉘 제작시간 중앙값 이내</div></div>
    <div class="card num"><div class="big">80%</div><div>AI→STL 자동검수 1차 통과율 이상</div></div>
    <div class="card num"><div class="big">90%</div><div>최종 출력 성공률 이상</div></div>
    <div class="card num"><div class="big">60초</div><div>20명 인원확인 시간 이내</div></div>
    <div class="card num"><div class="big">5%</div><div>경보 오탐률 이하</div></div>
    <div class="card num"><div class="big">4.0</div><div>교사 만족도 (5점 만점) 이상</div></div>
  </div>
  <p class="hint">현재 수치가 없는 항목은 임의값을 넣지 않고 기준선을 먼저 측정합니다. 최종 보고서는 기준선·목표·실적·차이·원인을 함께 제시합니다.</p>
</section>

<section id="arch" class="block">
  <h2>구성과 안전 원칙</h2>
  <div class="arch">
    <div class="arch-col"><h4>안전운영</h4>
      <div class="node">태그<br><span class="small muted">rolling ID · 버튼 · 배터리 (개인정보 없음)</span></div><div class="arrow">↓</div>
      <div class="node">게이트웨이<br><span class="small muted">구역 · RSSI · 오프라인 버퍼</span></div><div class="arrow">↓</div>
      <div class="node rule">이벤트 엔진<br><span class="small muted">미확인 · 구역이탈 · SOS · hysteresis</span></div><div class="arrow">↓</div>
      <div class="node strong">King Check<br><span class="small muted">교사 확인 · 조치 · 기록 · 집계</span></div>
    </div>
    <div class="arch-col"><h4>제작 파이프라인</h4>
      <div class="node">그림 · 카드<br><span class="small muted">사진·이름·연락처 없음</span></div><div class="arrow">↓</div>
      <div class="node ai">AI 이미지 → Tripo V3<br><span class="small muted">오리지널 캐릭터 외형</span></div><div class="arrow">↓</div>
      <div class="node rule">BLE Insert 결합 → 자동 검수<br><span class="small muted">규칙 엔진 · 공차 · keep-out</span></div><div class="arrow">↓</div>
      <div class="node lock">출력 · 조립 · 태그 등록<br><span class="small muted">제작담당 승인 후</span></div>
    </div>
  </div>
  <ul class="rules">
    <li>교사를 대체하지 않는 보조도구다. 기존 인솔·출석·위기대응 절차와 함께 쓴다.</li>
    <li>거부해도 불이익이 없고 수기 명단·중립형 기본쉘 같은 비추적 대안을 제공한다.</li>
    <li>이름 대신 별칭, 사진·연락처·장애정보는 수집하지 않으며 외부 AI로 보내지 않는다.</li>
    <li>원시 이벤트 로그는 기본 30일 후 자동 파기하고 집계는 비식별화한다.</li>
  </ul>
</section>

<footer class="site-foot">
  <span>이 페이지의 데이터는 전부 시연용 가상 데이터입니다.</span>
  <span class="muted">세종AI연구센터</span>
</footer>

<script src="js/flow.js"></script>
<script>
(function () {
  var el = document.getElementById("flow-steps");
  function esc(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  el.innerHTML = LB_FLOW.map(function (s) {
    return '<div class="f' + (s.ai ? ' ai' : '') + (s.rule ? ' rule' : '') + '" title="' + esc(s.desc) + '"><div class="n">' + s.no + '</div><div class="t">' + esc(s.name) + '</div>'
      + (s.rule ? '<span class="r">규칙 엔진</span>' : '') + '<div class="d">' + esc(s.desc) + '</div></div>';
  }).join("");
})();
</script>
</body></html>
```

- [ ] **Step 6: 실행해 통과 확인**

Expected: `25 passed, 0 failed`. 그리고 `index.html`을 브라우저로 열어 6섹션이 보이고 [시나리오 데모 보기]가 `demo.html#1`로 이동하는지 확인.

- [ ] **Step 7: 커밋**

```bash
git add js/flow.js css/site.css index.html test && git commit -m "feat: 소개 페이지 6섹션"
```

---

### Task 14: README·`.gitignore`·수동 검증

**Files:**
- Create: `README.md`
- Verify: `.gitignore`(이미 `.superpowers/`, `Thumbs.db`)

- [ ] **Step 1: README 작성**

`README.md`:

```markdown
# LIX Buddy 데모

레인보우피크닉(LIXLABS) STEP2 "LIX Buddy"(AI 참여형 맞춤 BLE 안전태그 제작·운영 플랫폼) 소개용 데모 사이트입니다.
**모든 데이터는 시연용 가상 데이터**이며 실제 학생·학교·AI 출력·BLE 실측치가 아닙니다.

- 소개 페이지: `index.html`
- 시나리오 데모(7장면): `demo.html` — `demo.html#4`처럼 장면 번호로 바로 열 수 있습니다.

## 장면

| # | 모드 | 장면 | 보여주는 것 |
|---|---|---|---|
| 1 | 학생 | 나의 안전, 나의 선택 | 보호자 동의 위에 소지방식 선택·안전 약속, 그만하기 |
| 2 | 학생 | 그림에서 캐릭터로 | 카드 조합 → AI 이미지 3안, 저작권·사진 필터 로그 |
| 3 | 학생 | 2D에서 3D로 | Tripo V3 작업, 3D 미리보기, 규칙 엔진이 넣는 BLE 코어 단면 |
| 4 | 학생(제작담당) | 검수와 출력 승인 | 8개 자동 검수, 벽두께 경고·보정, 승인 후 출력 큐 |
| 5 | 교사 | 세션 시작 | 허용·비허용 구역, 임계치, 20명 별칭 상태판 |
| 6 | 교사 | 이벤트와 대응 | 구역이탈·SOS를 시스템이 표시, 교사가 확인·조치·기록 |
| 7 | 교사 | 세션 종료와 보고 | 사실값 표 + AI 서술 초안, 교사 승인, 30일 파기 |

장면 1~4는 태블릿 수업 앱 톤(사이드바 없음, 상단 진행 표시, 그만하기 버튼), 장면 5~7은 King Check 업무 화면 톤(사이드바 있음)으로 자동 전환됩니다.

## 발표 때 쓰는 키

| 키 | 동작 |
|---|---|
| → / ← | 다음 / 이전 장면 |
| 1~7 | 해당 장면으로 |
| N | 발표 메모 켜기/끄기 |
| C | 캡처 모드(고지 띠·하단 데모 바 숨김, 스크린샷용) |
| R | 현재 장면 초기화 |

장면에 다시 들어가면 상태가 처음으로 돌아갑니다(리허설 반복용). 입력 필드에 포커스가 있을 때는 단축키가 동작하지 않습니다.

## 오프라인으로 열기

이 폴더를 통째로 복사해 `index.html`을 더블클릭하면 인터넷 없이 동작합니다. 외부 자원(CDN·웹폰트·스크립트)을 쓰지 않습니다.

## 테스트

`test/test.html`을 브라우저로 열면 결과가 표시됩니다. 헤드리스로는:

```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --dump-dom "file:///<이 폴더>/test/test.html" | findstr /R "PASS FAIL passed"
```

## 하지 않는 것

실제 AI·Tripo 호출, 실제 BLE 통신, GPS 지도, 충격·낙상 판정, 보호자 앱, 로그인, 저장. 화면의 시간·건수·치수는 시연값입니다.

---
시연용 가상 데이터 · 세종AI연구센터
```

- [ ] **Step 2: 스펙 §6 수동 검증 수행**

`demo.html`을 Edge로 열고 다음을 확인한다. 실패 항목은 해당 파일에서 고치고 자동 테스트를 다시 돈다.

| 항목 | 방법 | 기준 |
|---|---|---|
| 장면 동작 | 1~7 순서로 §3.3의 클릭 전부 수행 | 표에 적힌 결과가 그대로 나타남 |
| 모드 전환 | 4 → 5, 5 → 4, 사이드바 "만들기 수업" → 2 | body 클래스와 상단 바가 즉시 바뀌고 잔상 없음 |
| 그만하기 | 장면 1~4 각각에서 [그만하기] → 안내 카드 → [돌아가기] | 4장면 모두 보이고 장면 상태는 유지 |
| 키보드·해시 | ←/→, 1~7, N, C, R, `demo.html#4` 직접 열기, 장면 2 이름 필드에서 `3` 입력 | §3.2대로. 이름 필드에서는 "3"이 글자로 입력됨 |
| 초기화·타이머 | 장면 4 검수 도중, 장면 6 재생 도중 다른 장면으로 이동 후 복귀 | 초기 상태, 콘솔 오류·잔여 동작 없음 |
| 오프라인 | 폴더를 다른 위치로 복사해 file://로 열기 | 동작 동일, 콘솔 오류 0 |
| 해상도 | 창 1280·1920 너비, 두 모드 모두 | 잘림·겹침·가로 스크롤 없음 |
| 외부 요청 | 개발자도구 네트워크 탭 | 외부 호스트 요청 0건 |

- [ ] **Step 3: 캡처 모드 스크린샷 7장 저장(발표자료용, 레포 밖)**

`C` 키로 캡처 모드를 켜고 장면 1~7 각각을 스크린샷해 `C:\Users\xodnj\Desktop\project\rainbow\.superpowers\shots\`에 저장한다(`.gitignore`로 제외됨).

- [ ] **Step 4: 최종 테스트와 커밋**

공통 테스트 명령 실행. Expected: `25 passed, 0 failed`.

```bash
git add README.md && git commit -m "docs: README — 장면·키·오프라인·가상 데이터 고지"
```

- [ ] **Step 5: (선택) GitHub Pages 배포**

사용자가 지시한 경우에만: `gh repo create xodnjs9850/rainbow --public --source=. --push` 후 저장소 Settings → Pages → Branch master / root. 주소 `https://xodnjs9850.github.io/rainbow/`. 배포 전 레포에 계획서 docx·사업자번호·사업비가 없는지 `git ls-files`로 확인한다.

---

## 자기 검토 결과

**스펙 커버리지**

| 스펙 | 태스크 |
|---|---|
| §2 소개 페이지 6섹션 | 13 |
| §3.1 학생/교사 껍데기, 고지 띠, 그만하기 카드 | 4, 5 |
| §3.2 키보드·해시·입력 필드 무시 | 5 |
| §3.3 장면 1~7 | 6~12 |
| §3.4 장면 규약·mode·타이머(엔진 `later`로 통일) | 5 |
| §4 가상 데이터·금지 필드 없음 | 2 |
| §5 파일 구조(+`js/art.js`) | 1~13 |
| §6 검증 | 각 태스크 테스트 + 14 |
| §7 하지 않는 것 | 장면에 없는 버튼은 구현하지 않음 |

**스펙과의 차이(스펙을 이렇게 갱신한다)**: ① `js/art.js` 추가 ② 타이머는 장면의 `reset()`이 아니라 엔진 `LB.later`/`clearTimers`가 관리 ③ 장면 6의 주의→확인 필요 지연은 1.2초 한 번(스펙의 0.6초+1.8초 대신) ④ 장면 2 카드는 데이터 정의상 8개 옵션(동물 3·색 3·표정 2).
