//////////////////////////////////////////////////////////
//// 도면 공통 기능
//////////////////////////////////////////////////////////

/* DOM (let으로 선언 — 모달 재오픈 시 reinitDrawCanvas()에서 재할당) */
let drawCont = document.querySelector("#drawCont");
let canvasCont = drawCont ? drawCont.querySelector(".img-box") : null;
let canvas = document.querySelector("#drawImg");
let scaleText = document.querySelector(".scale-box span");

/* 공유 상태 */
let drawAreaData = [];
let areaIdx = 0;
let activeArea = null;
let currentAreaName = "";
let activeForm = null;
let drawMode = false;
let drawScale = 1;


//////////////////////////////////////////////////////////
//// PDF 렌더링
//////////////////////////////////////////////////////////
/* PDF 초기 로드 — data-img 속성에 URL이 있으면 즉시 로드, 없으면 JS에서 나중에 로드 */
if (canvas && canvas.dataset.img) {
  pdfjsLib.getDocument(canvas.dataset.img).promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.render({ canvasContext: ctx, viewport: viewport });
    });
  });
}


//////////////////////////////////////////////////////////
//// Zoom
//////////////////////////////////////////////////////////
const step = 0.1;
function updateScale(){
  canvasCont.style.transform = `scale(${drawScale})`;
  scaleText.textContent = Math.round(drawScale*100)+"%";
}
function scalePlus(){ if (drawScale < 2){ drawScale += step; if (drawScale > 2) drawScale = 2; updateScale(); } }
function scaleMinus(){ if (drawScale > 0.5){ drawScale -= step; if (drawScale < 0.5) drawScale = 0.5; updateScale(); } }


//////////////////////////////////////////////////////////
//// 유틸
//////////////////////////////////////////////////////////

/* cursor 위치 (scale 보정) */
function getCursorPos(e){
  const rect = canvasCont.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / drawScale,
    y: (e.clientY - rect.top) / drawScale
  }
}

/* 숫자를 알파벳 인덱스로 변환 (0 → A, 25 → Z, 26 → AA ...) */
function getAlphaIndex(n) {
  let str = "";
  n++;
  while (n > 0) {
    n--;
    str = String.fromCharCode(65 + (n % 26)) + str;
    n = Math.floor(n / 26);
  }
  return str;
}

/* 현재 drawAreaData 에 사용 중이지 않은 가장 빠른 알파벳 idx 반환
 * (삭제된 슬롯을 재활용: A,B,C 중 B 삭제 → 다음 생성 시 B) */
function getNextAlphaIndex() {
  const used = new Set();
  (typeof drawAreaData !== 'undefined' ? drawAreaData : []).forEach(g => {
    if (g && g.info) {
      // detail 페이지 — 계약 그룹 구조
      (g.info || []).forEach(a => { if (a && a.idx) used.add(a.idx); });
    } else if (g && g.idx) {
      // create 페이지 — 플랫 구조
      used.add(g.idx);
    }
  });
  let i = 0;
  while (used.has(getAlphaIndex(i))) i++;
  return getAlphaIndex(i);
}


//////////////////////////////////////////////////////////
//// Interact (drag / resize)
//////////////////////////////////////////////////////////

function enableInteract(el){
  if (drawCont.classList.contains("draw-fixed")) return;
  interact(el)
    .draggable({
      listeners:{ move(event){
        const x = (parseFloat(el.dataset.x)||0)+event.dx/drawScale;
        const y = (parseFloat(el.dataset.y)||0)+event.dy/drawScale;
        el.style.transform=`translate(${x}px,${y}px)`;
        el.dataset.x = x;
        el.dataset.y = y;
        updateAreaData(el);
      }}
    })
    .resizable({
      edges:{left:true,right:true,top:true,bottom:true},
      listeners:{ move(event){
        let x = parseFloat(el.dataset.x)||0;
        let y = parseFloat(el.dataset.y)||0;
        el.style.width = (event.rect.width/drawScale)+"px";
        el.style.height = (event.rect.height/drawScale)+"px";
        x += event.deltaRect.left/drawScale;
        y += event.deltaRect.top/drawScale;
        el.style.transform = `translate(${x}px,${y}px)`;
        el.dataset.x = x;
        el.dataset.y = y;
        updateAreaData(el);
      }}
    });
}

function disableAllInteract(){
  document.querySelectorAll(".drawing-area").forEach(el => interact(el).unset());
}

function enableAllInteract(){
  document.querySelectorAll(".drawing-area").forEach(el => enableInteract(el));
}


//////////////////////////////////////////////////////////
//// 영역 데이터 업데이트
//////////////////////////////////////////////////////////

function updateAreaData(el){
  let item;
  if (el.dataset.contract) {
    const group = drawAreaData.find(g => g.contractCode === el.dataset.contract);
    if (group) item = group.info.find(v => v.idx === el.dataset.idx);
  } else {
    item = drawAreaData.find(v => v.idx === el.dataset.idx);
  }
  if(!item) return;

  const x = parseFloat(el.dataset.x)||0;
  const y = parseFloat(el.dataset.y)||0;
  item.left = parseFloat(el.style.left)+x;
  item.top = parseFloat(el.style.top)+y;
  item.width = el.offsetWidth;
  item.height = el.offsetHeight;
}


//////////////////////////////////////////////////////////
//// 도면 위 영역 그리기 (마우스)
//////////////////////////////////////////////////////////
let startX, startY, newArea;

/* 캔버스 경계 내로 좌표 클램핑 */
function clampToCanvas(pos){
  const cw = canvas.width || canvas.offsetWidth;
  const ch = canvas.height || canvas.offsetHeight;
  return {
    x: Math.max(0, Math.min(pos.x, cw)),
    y: Math.max(0, Math.min(pos.y, ch))
  };
}

/* 캔버스 mousedown — 영역 드로잉 시작 */
/* capture: true로 스크롤 드래그보다 먼저 실행 */
document.addEventListener("mousedown",(e)=>{
  if(!drawMode) return;
  /* canvas 또는 img-box 내부 클릭만 허용 */
  if(!e.target.closest("#drawImg") && !e.target.closest(".img-box")) return;

  e.preventDefault();
  e.stopImmediatePropagation(); /* 스크롤 드래그 이벤트 차단 */

  // 영역 그리기 시작 — 바탕 불투명 처리 (이미 has-dim이면 유지, 없으면 추가하고 플래그 저장)
  if(drawCont) {
    if (!drawCont.classList.contains("has-dim")) {
      drawCont.classList.add("has-dim");
      drawCont.dataset.hasDimAddedByDraw = "true";
    }
  }

  const pos = getCursorPos(e);
  startX = pos.x; startY = pos.y;

  newArea = document.createElement("div");
  newArea.className = "drawing-area";

  const letter = getNextAlphaIndex();
  newArea.innerHTML = `<span class="area-label">${letter} ${currentAreaName}</span>`;
  newArea.style.left = pos.x+"px";
  newArea.style.top = pos.y+"px";

  canvasCont.appendChild(newArea);
}, true); /* capture phase — 다른 mousedown 이벤트보다 먼저 실행 */

document.addEventListener("mousemove",(e)=>{
  if(!newArea) return;
  const pos = clampToCanvas(getCursorPos(e));
  let w = pos.x - startX;
  let h = pos.y - startY;
  newArea.style.width = Math.abs(w)+"px";
  newArea.style.height = Math.abs(h)+"px";
  if(w<0) newArea.style.left = pos.x+"px";
  if(h<0) newArea.style.top = pos.y+"px";
});

document.addEventListener("mouseup",(e)=>{
  if(!newArea) return;

  const MIN_SIZE = 10;
  if(newArea.offsetWidth < MIN_SIZE || newArea.offsetHeight < MIN_SIZE){
    /* 크기가 너무 작으면 영역 생성 취소하되, drawMode는 유지 (재시도 가능) */
    newArea.remove();
    newArea = null;
    return;
  }

  saveAreaData(newArea);
  enableInteract(newArea);
  const createdIdx = newArea.dataset.idx;
  newArea = null;
  drawMode = false;
  if(drawCont) {
    drawCont.style.cursor="";
    // draw_canvas가 추가한 has-dim만 제거 (HTML에 박힌 has-dim은 유지)
    // 단, 영역이 하나라도 생성되어 있으면 유지 (도면 상세처럼 어둡게 유지)
    if (drawCont.dataset.hasDimAddedByDraw === "true" && drawAreaData.length === 0) {
      drawCont.classList.remove("has-dim");
      delete drawCont.dataset.hasDimAddedByDraw;
    }
  }

  // 생성된 영역 자동 선택
  if (typeof activeDrawArea === "function" && createdIdx) {
    activeDrawArea(createdIdx);
  }

  // 영역 생성 완료 → detail: type-add 닫기 + input 초기화 + 전체 disabled 해제
  if (activeForm) {
    // btn-delete 클릭과 동일: type-add 숨기고 type-edit 표시
    const typeAddBox = activeForm.closest(".drawing-area-box.type-add");
    if (typeAddBox) {
      typeAddBox.querySelector("input").value = "";
      typeAddBox.closest(".drawing-area-list").querySelector(".drawing-area-box.type-edit").classList.remove("hidden");
      typeAddBox.classList.add("hidden");
    }

    activeForm = null;
    document.querySelectorAll(".makeAreaForm").forEach(f => {
      const input = f.querySelector("input");
      const btn = f.querySelector("button");
      input.disabled = false;
      btn.disabled = !input.value.trim();
    });
  }
});


//////////////////////////////////////////////////////////
//// 영역 저장
//////////////////////////////////////////////////////////

function saveAreaData(el) {
  // 미사용 알파벳 중 가장 빠른 값 사용 (삭제된 슬롯 재활용)
  const letter = getNextAlphaIndex();

  const data = {
    idx: letter,
    name: currentAreaName,
    left: parseFloat(el.style.left),
    top: parseFloat(el.style.top),
    width: el.offsetWidth,
    height: el.offsetHeight,
    items: []
  };

  el.dataset.idx = data.idx;

  // drawAreaData 구조 판단: 계약 그룹(detail) vs 플랫(create)
  if (drawAreaData.length > 0 && drawAreaData[0].info) {
    // detail 페이지 — 계약 그룹 구조
    // activeForm이 속한 계약 그룹의 contractCode를 찾음
    let contractCode = '';
    let conIdx = '';
    if (activeForm) {
      const groupEl = activeForm.closest('.drawing-area-group');
      contractCode = groupEl ? (groupEl.dataset.contract || '') : '';
      conIdx = groupEl ? (groupEl.dataset.conidx || '') : '';
    }
    if (!contractCode) {
      contractCode = drawAreaData[0].contractCode || '';
      conIdx = drawAreaData[0].conIdx || '';
    }
    el.dataset.contract = contractCode;
    el.dataset.conidx = conIdx;
    data.contractCode = contractCode;
    data.conIdx = conIdx;
    // conIdx로 정확한 그룹 찾기 (같은 contractCode가 여러 개일 수 있으므로)
    const group = conIdx
      ? drawAreaData.find(g => String(g.conIdx) === String(conIdx))
      : drawAreaData.find(g => g.contractCode === contractCode);
    if (group) {
      group.info.push(data);
    }
  } else {
    // create 페이지 — 플랫 배열
    drawAreaData.push(data);
  }
  areaIdx++;

  // 페이지별 콜백
  if (typeof onSaveAreaData === "function") onSaveAreaData(data);
}


//////////////////////////////////////////////////////////
//// 도면 스크롤 drag
//////////////////////////////////////////////////////////
/* 도면 스크롤 드래그 — document 위임 (#drawCont 대상) */
let isDown = false, startMouseX, startMouseY, startScrollX, startScrollY;
document.addEventListener("mousedown",(e)=>{
  const dc = e.target.closest("#drawCont");
  if(!dc || drawMode) return;
  if(e.target.closest(".drawing-area")) return;
  isDown=true;
  startMouseX = e.pageX;
  startMouseY = e.pageY;
  startScrollX = drawCont.scrollLeft;
  startScrollY = drawCont.scrollTop;
  drawCont.classList.add("dragging");
});
document.addEventListener("mousemove",(e)=>{
  if(!isDown || !drawCont) return;
  drawCont.scrollLeft = startScrollX-(e.pageX-startMouseX);
  drawCont.scrollTop = startScrollY-(e.pageY-startMouseY);
});
document.addEventListener("mouseup",()=>{ if(isDown && drawCont) drawCont.classList.remove("dragging"); isDown=false; });
