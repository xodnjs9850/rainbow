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
      animals: [{ id: "rabbit", name: "토끼" }],
      colors: [{ id: "blue", name: "파랑", hex: "#3B82F6" }],
      faces: [{ id: "smile", name: "웃음" }]
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
      { id: "E1", type: "구역이탈", alias: "노랑이", tag: "LB-0917-11", zone: "야외광장", action: "인솔 복귀", response: "42초(시연값)" },
      { id: "E2", type: "SOS", alias: "파랑이", tag: "LB-0917-03", action: "오입력" }
    ],
    actions: ["직접 확인함", "인솔 복귀", "오탐"],
    summary: { duration: "2시간 10분", checkTime: "38초(시연값)", alerts: 2, exits: 1, sos: 1, falsePos: 1, avgResponse: "42초(시연값)" },
    monthly: { classes: 1, sessions: 3, acceptance: "18/20", falseRate: "4%", falseLimit: "5%", satisfaction: "미측정" },
    report: { id: "RPT-0917-햇살반", version: "v1.0", source: "세션 #S-0917", retention: "원시 로그는 30일 후 자동 파기 · 익명 집계만 보관" }
  };
})();
