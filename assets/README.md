# assets/ — 시연용 캐릭터 자산

여기에 파일을 넣으면 데모가 자동으로 사용한다. 없으면 절차적 3D 캐릭터와 SVG로 대체된다.

| 파일 | 내용 | 조건 |
|---|---|---|
| `char-1.png` `char-2.png` `char-3.png` | 같은 오리지널 캐릭터의 AI 이미지 3안(정면 전신, 자세·표정만 다르게) | PNG 1024×1024 권장, 흰색 또는 투명 배경. 실제 학생 사진·저작권 캐릭터 금지 |
| `toto.glb` | `char-1.png`를 Tripo image-to-model에 넣어 받은 3D 모델 | GLB, 텍스처 포함, 10MB 이하 |

`toto.glb`를 넣은 뒤 저장소 루트에서 `node tools/pack-assets.js` 를 한 번 실행해야 한다(`assets/toto.glb.js` 생성). 더블클릭(file://) 실행에서는 브라우저가 로컬 파일 fetch를 막기 때문에 이 단계가 필요하다. 임베드 파일(`assets/toto.glb.js`)이 있으면 file://·http 어디서나 그것을 우선 사용하고, 없을 때만 http 환경에서 `assets/toto.glb`를 직접 읽는다.

전부 시연용 가상 캐릭터여야 한다.

## GLB 경량화 (Meshy·Tripo 원본이 수십 MB일 때)

미리보기용 원본은 삼각형 수백만 개·50MB를 넘기도 한다. 임베드하면 로드가 느려지므로 먼저 줄인다. 레포 밖 임시 폴더에서:

```
npx @gltf-transform/cli weld toto-원본.glb w.glb
npx @gltf-transform/cli simplify w.glb toto.glb --ratio 0.02 --error 0.002
```

결과(약 0.5~1MB, 삼각형 5~6만)를 `assets/toto.glb`로 두고 `node tools/pack-assets.js`를 실행한다. 재질·텍스처가 없는 GLB는 뷰어가 캐릭터 색 토우 재질을 자동으로 입힌다. 원본(`toto-*.glb`)은 `.gitignore`로 제외된다.
