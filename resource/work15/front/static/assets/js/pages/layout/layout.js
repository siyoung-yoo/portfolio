//////////////////////////////////////////////////////////
// 도면 현황 조회 페이지
//////////////////////////////////////////////////////////

// --------------------
// 전역 상태
// --------------------
let _currentDrawingId   = null;
let _currentDrawingName = "";
let _currentAddressAdr4 = "";
let _currentVersionId   = null;
let _drawingGroups      = [];   // [{adr4, drawings: [{drawingId, drawingName}]}]
let _currentAreas       = [];   // 선택된 계약의 영역 목록

// 도면 렌더링 상태
let baseWidth       = 0;
let baseHeight      = 0;
let drawScale       = 1;
const step          = 0.5;
let isWidthLimited  = false;
let currentRenderTask = null;

// --------------------
// 진입점
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/js/plugins/pdf.worker.min.js";
  }
  loadDrawingList();
  initZoomHandlers();
  initSpaceListHandlers();
  initContractListHandlers();
  initVersionSelectHandler();
});

// --------------------
// 1. 좌측 공간 선택 목록
// --------------------
function loadDrawingList() {
  fetch("/api/layout/getDrawingList", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(list => {
      _drawingGroups = groupByAdr4(list || []);
      renderSpaceList(_drawingGroups);

      const firstGroup   = _drawingGroups[0];
      const firstDrawing = firstGroup ? firstGroup.drawings[0] : null;
      if (firstDrawing) {
        selectDrawing(firstDrawing.drawingId, firstDrawing.drawingName, firstGroup.adr4);
      } else {
        showEmptyState();
      }
    })
    .catch(err => {
      console.error("도면 목록 조회 실패", err);
      showEmptyState();
    });
}

function groupByAdr4(list) {
  const map = new Map();
  list.forEach(item => {
    const key = item.adr4 || "(주소 없음)";
    if (!map.has(key)) {
      map.set(key, { adr4: key, drawings: [] });
    }
    map.get(key).drawings.push({
      drawingId:   item.drawingId,
      drawingName: item.drawingName || ""
    });
  });
  return Array.from(map.values());
}

function renderSpaceList(groups) {
  const spaceList = document.getElementById("spaceList");
  if (!spaceList) return;

  spaceList.innerHTML = groups.map((g, gIdx) => {
    const subId         = "drawSub" + gIdx;
    const isFirst       = gIdx === 0;
    const expandedClass = isFirst ? " is-expanded" : "";
    const ariaExpanded  = isFirst ? "true" : "false";
    const drawingsHtml  = g.drawings.map(d => `
        <li>
          <button type="button" data-drawing-id="${d.drawingId}" data-drawing-name="${escapeAttr(d.drawingName)}" data-adr4="${escapeAttr(g.adr4)}">
            <span class="ellipsis-line2">${escapeHtml(d.drawingName)}</span>
          </button>
        </li>`).join("");
    return `
      <li>
        <button type="button" class="btn-toggle${expandedClass}" aria-controls="#${subId}" aria-expanded="${ariaExpanded}">
          <span class="text">${escapeHtml(g.adr4)}</span>
        </button>
        <ul class="sub-list${expandedClass}" id="${subId}">
          ${drawingsHtml}
        </ul>
      </li>`;
  }).join("");
}

function initSpaceListHandlers() {
  const list = document.getElementById("spaceList");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".sub-list button[data-drawing-id]");
    if (!btn) return;
    selectDrawing(btn.dataset.drawingId, btn.dataset.drawingName, btn.dataset.adr4);
  });
}

function selectDrawing(drawingId, drawingName, adr4) {
  document.querySelectorAll(".space-list .sub-list button").forEach(b => b.classList.remove("selected"));
  const btn = document.querySelector(`.space-list .sub-list button[data-drawing-id="${drawingId}"]`);
  if (btn) btn.classList.add("selected");

  _currentDrawingId   = Number(drawingId);
  _currentDrawingName = drawingName || "";
  _currentAddressAdr4 = adr4 || "";
  _currentVersionId   = null;
  _currentAreas       = [];
  loadDrawingDetail(_currentDrawingId, null);
}

// --------------------
// 2. 도면 상세 (버전/계약/현재 버전 파일)
// --------------------
function loadDrawingDetail(drawingId, versionId) {
  const body = { drawingId: Number(drawingId) };
  if (versionId != null) body.versionId = Number(versionId);

  fetch("/api/layout/getDrawingDetail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(detail => {
      if (!detail) {
        showEmptyState();
        return;
      }
      renderDrawingDetail(detail);
    })
    .catch(err => {
      console.error("도면 상세 조회 실패", err);
      showEmptyState();
    });
}

function renderDrawingDetail(detail) {
  const container = document.getElementById("drawingContents");
  const empty     = document.getElementById("drawingEmpty");
  if (container) container.style.display = "";
  if (empty) empty.style.display = "none";

  _currentVersionId = detail.currentVersionId;

  // 헤더
  document.getElementById("drawAddress").textContent = _currentAddressAdr4 || "";
  document.getElementById("drawName").textContent    = _currentDrawingName || "";

  // 버전 드롭다운
  renderVersionList(detail.versions || [], detail.currentVersionId);
  document.getElementById("uploadDate").textContent = detail.currentUploadDt || "-";

  // 다운로드 버튼
  renderDownloadArea(detail);

  // 연결된 계약
  renderLinkedContracts(detail.contracts || []);

  // 영역은 도면 로드 시점부터 전체 노출 (계약 선택 전 기본 상태)
  _currentAreas = detail.areas || [];

  // 이전에 적용된 has-dim / selected 상태 초기화
  const drawCont = document.querySelector(".draw-cont");
  if (drawCont) drawCont.classList.remove("has-dim");

  // PDF 렌더링 (렌더 완료 후 영역도 함께 그려짐)
  renderPdf(detail.pdfUrl);
}

function renderVersionList(versions, currentVersionId) {
  const list = document.getElementById("versionList");
  const box  = document.getElementById("versionSelectBox");
  if (!list || !box) return;

  // 최신 버전 판별: VERSION_ID 가 가장 큰 것
  let maxVersionId = -Infinity;
  versions.forEach(v => { if (v.versionId > maxVersionId) maxVersionId = v.versionId; });

  // 최신이 먼저 오도록 역순 렌더링 (쿼리는 VERSION_NO ASC 로 나오므로 뒤집어서 표시)
  const reversed = versions.slice().reverse();

  list.innerHTML = reversed.map(v => {
    const isSelected = v.versionId === currentVersionId;
    const isLatest   = v.versionId === maxVersionId;
    const badge      = isLatest ? `<span class="badge sm square bg-blue">최신</span>` : "";
    return `
      <button type="button" data-version-id="${v.versionId}"${isSelected ? ' class="selected"' : ''}>
        <span class="text">${escapeHtml(formatVersionLabel(v.versionNo))}</span>${badge}
      </button>`;
  }).join("");

  const selectedBtn = list.querySelector("button.selected");
  const btnSelect   = box.querySelector(".btn-select");
  if (btnSelect) {
    btnSelect.innerHTML = selectedBtn ? selectedBtn.innerHTML : "선택";
  }
}

function initVersionSelectHandler() {
  const list = document.getElementById("versionList");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-version-id]");
    if (!btn) return;
    const versionId = Number(btn.dataset.versionId);
    if (versionId === _currentVersionId) return;
    loadDrawingDetail(_currentDrawingId, versionId);
  });
}

function renderDownloadArea(detail) {
  const area = document.getElementById("downloadArea");
  if (!area) return;
  const buttons = [];
  if (detail.pdfUrl) buttons.push(`<a href="${detail.pdfUrl}" class="btn line rounded" target="_blank" download><i class="icon-download"></i>PDF</a>`);
  if (detail.dwgUrl) buttons.push(`<a href="${detail.dwgUrl}" class="btn line rounded" target="_blank" download><i class="icon-download"></i>DWG</a>`);
  if (detail.dxfUrl) buttons.push(`<a href="${detail.dxfUrl}" class="btn line rounded" target="_blank" download><i class="icon-download"></i>DXF</a>`);
  area.innerHTML = buttons.join("");
}

// --------------------
// 3. 연결된 계약
// --------------------
function renderLinkedContracts(contracts) {
  const list  = document.getElementById("linkedContractList");
  const count = document.getElementById("contractCount");
  if (count) count.textContent = contracts.length;
  if (!list) return;

  list.innerHTML = contracts.map(c => `
    <div class="box-style" data-con-idx="${c.conIdx}">
      <a href="/contract/${c.conIdx}" class="btn link lg text-medium-gray">${escapeHtml(c.conCd || "")}</a>
      <div class="flex-1">${escapeHtml(c.conTitle || "")}</div>
      <span class="spacing-lg">${escapeHtml(c.conContractDate || "")}</span>
    </div>`).join("");
}

function initContractListHandlers() {
  const list     = document.getElementById("linkedContractList");
  const drawCont = document.querySelector(".draw-cont");
  if (!list || !drawCont) return;

  list.addEventListener("click", (e) => {
    // 계약 코드 링크는 계약 상세 페이지(/contract/{idx})로 이동
    if (e.target.closest("a")) return;

    const item = e.target.closest(".box-style");
    if (!item) return;

    if (item.classList.contains("selected")) {
      item.classList.remove("selected");
      drawCont.classList.remove("has-dim");
      clearAreaHighlight();
      return;
    }

    document.querySelectorAll("#linkedContractList .box-style").forEach(el => el.classList.remove("selected"));
    item.classList.add("selected");
    drawCont.classList.add("has-dim");

    highlightContractAreas(Number(item.dataset.conIdx));
  });
}

/** 해당 계약과 연결된 영역에만 is-active 부여 (퍼블 CSS 의 has-dim 과 조합) */
function highlightContractAreas(conIdx) {
  document.querySelectorAll(".draw-cont .drawing-area").forEach(el => {
    if (Number(el.dataset.conIdx) === conIdx) {
      el.classList.add("is-active");
    } else {
      el.classList.remove("is-active");
    }
  });
}

function clearAreaHighlight() {
  document.querySelectorAll(".draw-cont .drawing-area").forEach(el => el.classList.remove("is-active"));
}

/** PDF 위에 모든 영역을 기본(비강조) 상태로 렌더. */
function renderAreas() {
  const convertBox = document.querySelector(".draw-cont .convert-box");
  if (!convertBox) return;

  convertBox.querySelectorAll(".drawing-area").forEach(el => el.remove());

  _currentAreas.forEach(area => {
    if (area.x == null || area.y == null || area.width == null || area.height == null) return;
    const div = document.createElement("div");
    div.className = "drawing-area";
    div.style.display = "block";
    div.style.left   = area.x + "px";
    div.style.top    = area.y + "px";
    div.style.width  = area.width + "px";
    div.style.height = area.height + "px";
    if (area.conIdx != null) div.dataset.conIdx = area.conIdx;
    div.dataset.areaId = area.areaId;

    const label = document.createElement("span");
    label.className = "area-label";
    label.textContent = area.areaName || "";
    div.appendChild(label);
    convertBox.appendChild(div);
  });
}

// --------------------
// 4. PDF 렌더링 (다중 페이지 지원)
// --------------------
const PAGE_GAP = 8; // 페이지 사이 간격(px)

function renderPdf(pdfUrl) {
  const drawCont   = document.querySelector(".draw-cont");
  const convertBox = drawCont.querySelector(".convert-box");

  // 기존 캔버스/영역 모두 제거 (다중 페이지는 canvas 여러 개라 innerHTML 초기화가 깔끔)
  convertBox.innerHTML = "";

  // PDF 로드 전에도 중앙정렬 유지 (깜빡임 방지)
  drawCont.style.justifyContent = "center";
  drawCont.style.alignItems     = "center";

  drawScale = 1;
  updateScaleText();

  if (!pdfUrl) {
    console.warn("[layout] PDF URL 이 비어있습니다 (RBO_DRAWING_VERSION.PDF_PATH 확인 필요)");
    return;
  }

  if (currentRenderTask) {
    try { currentRenderTask.cancel(); } catch (e) { /* ignore */ }
    currentRenderTask = null;
  }

  console.log("[layout] PDF 로드 시도:", pdfUrl);
  pdfjsLib.getDocument(pdfUrl).promise
    .then(pdf => renderAllPages(pdf, convertBox))
    .then(() => {
      renderAreas(); // 영역은 convertBox 원점 기준 (페이지1 좌표계)
    })
    .catch(err => {
      if (err && err.name !== "RenderingCancelledException") {
        console.error("[layout] PDF 렌더링 실패 - URL:", pdfUrl, err);
      }
    });
}

/**
 * 모든 페이지를 세로로 쌓아 렌더.
 *   1) 먼저 모든 페이지의 viewport dim 만 모은 뒤 fit 트랜스폼을 convertBox 에 선 적용.
 *      → 빈 canvas 들이 "이미 스케일된 공간" 위에 올라가서, 자연 크기로 잠시 보였다 확대되는 깜빡임 제거.
 *   2) 그 다음 pass 에서 실제 render 수행.
 */
async function renderAllPages(pdf, convertBox) {
  const numPages = pdf.numPages;
  const pages = [];
  let maxWidth = 0;
  let totalHeight = 0;

  // Pass 1: 각 페이지 dimension 만 수집 (getPage 결과는 pdf.js 내부 캐시로 유지됨)
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ page, viewport });
    if (viewport.width > maxWidth) maxWidth = viewport.width;
    totalHeight += viewport.height + (i > 1 ? PAGE_GAP : 0);
  }

  // 캔버스 append 전에 레이아웃(스케일 트랜스폼 포함)을 미리 적용
  fitMultiPageSize(maxWidth, totalHeight);

  // Pass 2: 캔버스 생성 + 렌더
  for (let i = 0; i < pages.length; i++) {
    const { page, viewport } = pages[i];

    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page-canvas";
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    canvas.style.display = "block";
    canvas.style.margin  = (i > 0) ? (PAGE_GAP + "px auto 0 auto") : "0 auto";
    if (i === 0) canvas.id = "drawImg"; // 기존 셀렉터 호환
    convertBox.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    currentRenderTask = page.render({ canvasContext: ctx, viewport });
    await currentRenderTask.promise;
    currentRenderTask = null;
  }
}

// --------------------
// 5. 컨테이너 사이즈/줌/드래그 (퍼블 원본 로직 유지)
// --------------------
function fitMultiPageSize(originalW, originalH) {
  const drawCont   = document.querySelector(".draw-cont");
  const imgBox     = drawCont.querySelector(".img-box");
  const convertBox = drawCont.querySelector(".convert-box");

  const targetW = 862;
  const targetH = 600;

  if (!originalW || !originalH) return;

  // 가로 기준 fit — 다중 페이지/긴 세로 문서도 가독성을 위해 폭을 꽉 채우고
  // 넘치는 세로는 스크롤로 처리한다.
  const scaleX = targetW / originalW;
  const scaleY = targetH / originalH;
  const scale  = scaleX;

  // isWidthLimited 는 원래 비율 기준으로 계산 (updateScale 정렬 분기용)
  isWidthLimited = scaleX < scaleY;

  baseWidth  = originalW * scale;
  baseHeight = originalH * scale;

  convertBox.style.width  = originalW + "px";
  convertBox.style.height = originalH + "px";
  convertBox.style.transform = "scale(" + scale + ")";
  imgBox.style.width  = baseWidth + "px";
  imgBox.style.height = baseHeight + "px";
  drawCont.style.height = (baseHeight * drawScale + 2) + "px";

  updateScale();
}

function updateScale() {
  const drawCont   = document.querySelector(".draw-cont");
  const imgBox     = drawCont.querySelector(".img-box");
  const centerBox  = drawCont.querySelector(".center-box");
  const zoomInBtn  = document.querySelector(".zoom-in");
  const zoomOutBtn = document.querySelector(".zoom-out");

  imgBox.style.transform = "scale(" + drawScale + ")";
  updateScaleText();
  centerBox.style.width  = (baseWidth  * drawScale) + "px";
  centerBox.style.height = (baseHeight * drawScale) + "px";

  if (zoomInBtn)  zoomInBtn.disabled  = (drawScale >= 3);
  if (zoomOutBtn) zoomOutBtn.disabled = (drawScale <= 0.5);

  if (drawScale < 1) {
    drawCont.style.justifyContent = "center";
    drawCont.style.alignItems     = "center";
  } else {
    if (isWidthLimited) {
      drawCont.style.justifyContent = "flex-start";
      drawCont.style.alignItems     = "center";
    } else {
      drawCont.style.justifyContent = "center";
      drawCont.style.alignItems     = "flex-start";
    }
  }
}

function updateScaleText() {
  const el = document.querySelector(".scale-text");
  if (el) el.textContent = Math.round(drawScale * 100) + "%";
}

function initZoomHandlers() {
  const zoomInBtn  = document.querySelector(".zoom-in");
  const zoomOutBtn = document.querySelector(".zoom-out");
  const drawCont   = document.querySelector(".draw-cont");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      drawScale = Math.min(drawScale + step, 3);
      updateScale();
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      drawScale = Math.max(drawScale - step, 0.5);
      updateScale();
    });
  }

  if (!drawCont) return;
  let isDown = false, startMouseX, startMouseY, startScrollX, startScrollY;
  drawCont.addEventListener("mousedown", (e) => {
    if (e.target.closest(".drawing-area")) return;
    isDown = true;
    startMouseX  = e.pageX;
    startMouseY  = e.pageY;
    startScrollX = drawCont.scrollLeft;
    startScrollY = drawCont.scrollTop;
    drawCont.classList.add("dragging");
  });
  drawCont.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    drawCont.scrollLeft = startScrollX - (e.pageX - startMouseX);
    drawCont.scrollTop  = startScrollY - (e.pageY - startMouseY);
  });
  drawCont.addEventListener("mouseup",    () => { isDown = false; drawCont.classList.remove("dragging"); });
  drawCont.addEventListener("mouseleave", () => { isDown = false; drawCont.classList.remove("dragging"); });
}

// --------------------
// 6. 빈 상태 / 유틸
// --------------------
function showEmptyState() {
  const container = document.getElementById("drawingContents");
  const empty     = document.getElementById("drawingEmpty");
  if (container) container.style.display = "none";
  if (empty) empty.style.display = "";
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

/** "v1" → "Ver1.", "v12" → "Ver12." — DB의 VERSION_NO 를 화면 라벨로 변환. */
function formatVersionLabel(versionNo) {
  if (!versionNo) return "";
  const m = String(versionNo).match(/^v(\d+)$/i);
  return m ? ("Ver" + m[1] + ".") : versionNo;
}
