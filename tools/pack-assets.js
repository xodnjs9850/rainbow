// assets/toto.glb → assets/toto.glb.js (base64 임베드). file://에서는 fetch가 막혀 GLB를 직접 읽을 수 없기 때문.
// 사용: node tools/pack-assets.js
var fs = require("fs"), path = require("path");
var root = path.join(__dirname, ".."), src = path.join(root, "assets", "toto.glb"), dst = path.join(root, "assets", "toto.glb.js");
if (!fs.existsSync(src)) { console.error("assets/toto.glb 가 없습니다."); process.exit(1); }
var buf = fs.readFileSync(src);
if (buf.length < 4 || buf.readUInt32LE(0) !== 0x46546C67) {
  console.error("assets/toto.glb 가 올바른 GLB 파일이 아닙니다(매직 넘버 불일치, glTF 바이너리가 아님).");
  process.exit(1);
}
if (buf.length > 10 * 1024 * 1024) {
  console.warn("경고: assets/toto.glb 가 10MB를 넘습니다(원본 " + Math.round(buf.length / 1024 / 1024) + "MB). 데모 첫 로딩이 느려질 수 있습니다.");
}
var b64 = buf.toString("base64");
fs.writeFileSync(dst, "// 자동 생성: tools/pack-assets.js. 원본 assets/toto.glb (" + Math.round(buf.length / 1024) + " KB)\nwindow.LB_ASSETS = window.LB_ASSETS || {};\nwindow.LB_ASSETS.glb = \"" + b64 + "\";\n");
console.log("assets/toto.glb.js 생성 — 원본 " + Math.round(buf.length / 1024) + " KB, base64 " + Math.round(b64.length / 1024) + " KB");
