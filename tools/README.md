# vendor/three.bundle.js 만들기

실행 시에는 필요 없다. Three.js 버전을 올릴 때만 한 번 돈다. 레포 밖 임시 폴더에서:

```
npm init -y
npm install three@0.170.0 esbuild
cp <rainbow>/tools/three-entry.js entry.js
npx esbuild entry.js --bundle --minify --format=iife --outfile=<rainbow>/vendor/three.bundle.js
```

결과는 classic `<script>`로 로드되는 단일 IIFE이며 `window.THREE`에 Three.js 전체와 `GLTFLoader`, `OrbitControls`를 붙인다. 외부 요청 없음.
