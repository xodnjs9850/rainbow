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
