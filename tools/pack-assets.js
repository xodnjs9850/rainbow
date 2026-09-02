// assets/toto.glb → assets/toto.glb.js (base64 임베드). file://에서는 fetch가 막혀 GLB를 직접 읽을 수 없기 때문.
// 사용: node tools/pack-assets.js
var fs = require("fs"), path = require("path");
var root = path.join(__dirname, ".."), src = path.join(root, "assets", "toto.glb"), dst = path.join(root, "assets", "toto.glb.js");
if (!fs.existsSync(src)) { console.error("assets/toto.glb 가 없습니다."); process.exit(1); }
var b64 = fs.readFileSync(src).toString("base64");
fs.writeFileSync(dst, "// 자동 생성: tools/pack-assets.js. 원본 assets/toto.glb (" + Math.round(b64.length * 3 / 4 / 1024) + " KB)\nwindow.LB_ASSETS = window.LB_ASSETS || {};\nwindow.LB_ASSETS.glb = \"" + b64 + "\";\n");
console.log("assets/toto.glb.js 생성, base64 " + Math.round(b64.length / 1024) + " KB");
