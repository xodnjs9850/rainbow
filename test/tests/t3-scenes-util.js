window.sceneById = function (id) {
  for (var i = 0; i < LB.scenes.length; i++) if (LB.scenes[i].id === id) return LB.scenes[i];
  throw new Error("scene " + id + " not registered");
};
// 장면 파일들은 로드 시 registerScene을 부른다. 엔진 테스트가 scenes를 비우므로 여기서 스냅샷을 보관한다.
window.SCENE_SNAPSHOT = LB.scenes.slice();
window.restoreScenes = function () { LB.scenes.length = 0; SCENE_SNAPSHOT.forEach(function (s) { LB.scenes.push(s); }); };
LB.sync = true; // 테스트에서는 LB.later가 즉시 실행
