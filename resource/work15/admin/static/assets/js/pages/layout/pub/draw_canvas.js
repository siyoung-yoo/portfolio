//////////////////////////////////////////////////////////
//// 도면 공통 기능
//////////////////////////////////////////////////////////

/* DOM */
const drawCont = document.querySelector("#drawCont");
const canvasCont = drawCont.querySelector("#drawCont .img-box");
const canvas = document.querySelector("#drawImg");
const scaleText = document.querySelector(".scale-box span");

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
pdfjsLib.getDocument(canvas.dataset.img).promise.then(pdf => {
  pdf.getPage(1).then(page => {
    const viewport = page.getViewport({ scale: 1 });
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    page.render({ canvasContext: ctx, viewport: viewport });
  });
});


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

/* cursor 위치 (scale + scroll 보정) */
function getCursorPos(e){
  const rect = canvasCont.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left + drawCont.scrollLeft) / drawScale,
    y: (e.clientY - rect.top + drawCont.scrollTop) / drawScale
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

canvas.addEventListener("mousedown",(e)=>{
  if(!drawMode) return;
  e.stopPropagation();
  const pos = getCursorPos(e);
  startX = pos.x; startY = pos.y;

  newArea = document.createElement("div");
  newArea.className = "drawing-area";

  const letter = getAlphaIndex(areaIdx);
  newArea.innerHTML = `<span class="area-label">${letter} ${currentAreaName}</span>`;
  newArea.style.left = e.offsetX+"px";
  newArea.style.top = e.offsetY+"px";

  canvasCont.appendChild(newArea);
});

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
    newArea.remove();
    newArea = null;
    drawMode = false;
    drawCont.style.cursor = "grab";
    return;
  }

  saveAreaData(newArea);
  enableInteract(newArea);
  newArea = null;
  drawMode = false;
  drawCont.style.cursor="grab";

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
  const letter = getAlphaIndex(areaIdx);

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
  drawAreaData.push(data);
  areaIdx++;

  // 페이지별 콜백 (draw_mapping.js 또는 draw_detail.js에서 등록)
  if (typeof onSaveAreaData === "function") onSaveAreaData(data);
}


//////////////////////////////////////////////////////////
//// 도면 스크롤 drag
//////////////////////////////////////////////////////////
let isDown = false, startMouseX, startMouseY, startScrollX, startScrollY;
drawCont.addEventListener("mousedown",(e)=>{
  if(drawMode) return;
  if(e.target.closest(".drawing-area")) return;
  isDown=true;
  startMouseX = e.pageX;
  startMouseY = e.pageY;
  startScrollX = drawCont.scrollLeft;
  startScrollY = drawCont.scrollTop;
  drawCont.classList.add("dragging");
});
drawCont.addEventListener("mousemove",(e)=>{
  if(!isDown) return;
  drawCont.scrollLeft = startScrollX-(e.pageX-startMouseX);
  drawCont.scrollTop = startScrollY-(e.pageY-startMouseY);
});
drawCont.addEventListener("mouseup",()=>{ isDown=false; drawCont.classList.remove("dragging"); });
drawCont.addEventListener("mouseleave",()=>{ isDown=false; drawCont.classList.remove("dragging"); });
