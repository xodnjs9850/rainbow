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
