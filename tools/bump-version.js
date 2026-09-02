// index.html·demo.html의 로컬 <script src>·<link href>에 ?v=<타임스탬프>를 붙여 배포 시 CDN·브라우저 캐시를 무효화한다.
// 사용: node tools/bump-version.js  (커밋·푸시 직전에 실행)
var fs = require("fs"), path = require("path");
var root = path.join(__dirname, ".."), v = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
["index.html", "demo.html"].forEach(function (name) {
  var p = path.join(root, name), s = fs.readFileSync(p, "utf8");
  var out = s.replace(/(<(?:script|link)\b[^>]*?(?:src|href)=")([^"?#:]+\.(?:js|css))(?:\?v=[^"]*)?(")/g, function (m, a, file, z) { return a + file + "?v=" + v + z; });
  fs.writeFileSync(p, out); console.log(name, "→ ?v=" + v);
});
