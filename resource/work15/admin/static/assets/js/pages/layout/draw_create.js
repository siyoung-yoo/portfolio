//////////////////////////////////////////////////////////
//// 영역 선택 & 폼 바인딩
//////////////////////////////////////////////////////////

/**
 * 품목 고유키 생성 — 품목코드 + 색상코드 조합
 * 동일 품목코드에 다른 색상이 있을 수 있으므로 조합키로 구분
 * @param {HTMLElement} li - data-itemcode, data-colcode 속성을 가진 li 엘리먼트
 * @returns {string} "T03FB4__MG" 형태의 고유키
 */
function getItemKey(li) {
  return (li.dataset.itemcode || '') + '__' + (li.dataset.colcode || '');
}

/* makeAreaForm 이벤트 — reinitDrawCanvas()에서 모달 오픈 시 바인딩 */
/* 초기 로드 시에는 모달이 아직 열리지 않았으므로 바인딩하지 않음 */

/* 도면 영역 클릭 → 해당 영역 선택 (document 위임) */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".img-box")) return;
  const area = e.target.closest(".drawing-area");
  if (!area) return;
  activeDrawArea(area.dataset.idx);
});

/* 영역 활성화 — 도면 위 사각형 selected + 우측 패널 갱신 */
function activeDrawArea(idx) {
  // canvasCont 기준으로 영역 찾기 (모달/페이지 구분)
  const container = canvasCont || document;
  const target = container.querySelector(`.drawing-area[data-idx="${idx}"]`);
  container.querySelectorAll(".drawing-area").forEach(v => v.classList.remove("selected"));
  if (target) target.classList.add("selected");

  // drawAreaData에서 찾기 — 플랫 배열 또는 계약 그룹 구조
  activeArea = null;
  if (drawAreaData.length > 0 && drawAreaData[0].info) {
    // 계약 그룹 구조 (detail 페이지)
    for (const group of drawAreaData) {
      const found = group.info.find(v => v.idx == idx);
      if (found) { activeArea = found; break; }
    }
  } else {
    // 플랫 배열 (create/modal)
    activeArea = drawAreaData.find(v => v.idx == idx);
  }

  if (activeArea) onActiveDrawArea(idx);
}


//////////////////////////////////////////////////////////
//// 품목 매핑 기능
//////////////////////////////////////////////////////////

/* DOM (let으로 선언 — 모달 재오픈 시 reinitDrawCanvas()에서 재할당) */
let selectedAreaPanel = document.querySelector(".selected-area-panel");
let mappingWrap = document.querySelector(".mapping-list-wrap");
let contractList = document.querySelector(".mapping-list.type-contract");
let contractCount = document.querySelector("#contractCount");
let mappingCount = document.querySelector("#mappingCount");

/* 동적 품목 목록 참조 (렌더링 후 갱신됨) */
function getContractItems() { return contractList ? contractList.querySelectorAll("li") : []; }

/* 영역 활성화 콜백 — 매핑품목 리스트 생성/표시 */
function onActiveDrawArea(idx) {
  if (!mappingWrap) return;
  // editItemMappingInfoModal이 열려있으면 실행하지 않음 (해당 모달은 별도 로직)
  if (document.querySelector('#editItemMappingInfoModal.is-open')) return;

  // 선택 영역에 해당하는 매핑품목 UL 생성 (없으면 새로 만듦)
  let targetList = mappingWrap.querySelector(`ul.mapping-list[data-idx="${idx}"]`);
  if (!targetList) {
    targetList = document.createElement("ul");
    targetList.className = "mapping-list type-item";
    targetList.dataset.idx = activeArea.idx;
    mappingWrap.appendChild(targetList);
  }

  // 다른 영역 매핑품목 숨기고, 현재 영역 매핑품목 표시 (editItemMappingInfoModal 내부 제외)
  const container = getActiveContainer();
  container.querySelectorAll(".mapping-list.type-item").forEach(ul => {
    if (!ul.closest('#editItemMappingInfoModal')) ul.classList.add("hidden");
  });
  targetList.classList.remove("hidden");

  // mappingWrap(매핑품목 영역) 표시
  mappingWrap.classList.remove("hidden");

  renderSelectedArea();
  syncContractCopyState();
  // 영역 전환 시 좌측 계약 품목 카운트 전체 + 상단 (n/n) + "n품목 n개" badge 갱신
  refreshAllContractCounts();
  toggleAlertMakeArea();
  toggleAlertMappingItem();
}

/* 현재 선택 영역에 속한 매핑 수량 — 현재 도면 × 선택 영역 기준 */
function getCurrentAreaQty(key) {
  if (typeof activeArea === 'undefined' || !activeArea) return 0;
  let total = 0;
  document.querySelectorAll(`.mapping-list.type-item[data-idx="${activeArea.idx}"] li`).forEach(li => {
    if (getItemKey(li) === key) {
      total += parseInt(li.querySelector(".qty")?.value) || 0;
    }
  });
  return total;
}

/* 모든 계약 품목의 qty-count / done 상태 재계산 + 상단 헤더 갱신
 * qty-count 표기 = 타 영역 매핑 + 타 도면 매핑 (현재 영역은 제외 — 오른쪽 매핑품목 패널에 표시됨) */
function refreshAllContractCounts() {
  getContractItems().forEach(li => {
    const key = getItemKey(li);
    const curDraw  = getTotalQty(key);           // 현재 도면 전체 영역 합계
    const curArea  = getCurrentAreaQty(key);     // 현재 선택 영역 합계
    const otherQty = parseInt(li.dataset.otherqty) || 0;  // 타 도면 매핑 (DB)
    const totalQty = parseInt(li.dataset.totalqty) || parseInt(li.querySelector(".qty-total").textContent) || 0;
    // 외부(타 영역 + 타 도면) 매핑 수량
    const externalMapped = (curDraw - curArea) + otherQty;
    const countEl = li.querySelector(".qty-count");
    if (countEl) countEl.textContent = externalMapped;
    // done: 현재 도면 + 타 도면 합계가 계약 전체 수량 도달
    const isDone = totalQty > 0 && (curDraw + otherQty) >= totalQty;
    li.classList.toggle("done", isDone);
  });
  updateMappingCount();
}

/* 영역 생성 완료 콜백 — 드롭다운에 영역 추가 */
function onSaveAreaData(data) {
  const dropdown = document.querySelector("#dropdownList");
  if (!dropdown) return;

  const li = document.createElement("li");
  li.className = "dropdown-item";
  li.dataset.idx = data.idx;

  li.innerHTML = `
    <div class="area-name">
      <span class="flag">${data.idx}</span>${data.name}
    </div>
  `;

  dropdown.querySelector(".dropdown-menu")?.appendChild(li);
  dropdown.querySelector(".btn").disabled = false;
}

/**
 * 선택된 영역 정보 렌더링 (우측 상단)
 * 매핑 상태 판단: 전체 계약 품목 수량 == 전체 매핑 품목 수량이면 매핑완료
 */
function renderSelectedArea() {
  if (!activeArea) return;
  if (!selectedAreaPanel) return;

  // 전체 계약 품목 수량 합계
  let totalContractQty = 0;
  let totalMappedQty = 0;
  getContractItems().forEach(li => {
    totalContractQty += parseInt(li.querySelector(".qty-total").textContent) || 0;
    totalMappedQty += parseInt(li.querySelector(".qty-count").textContent) || 0;
  });

  const isComplete = totalContractQty > 0 && totalMappedQty >= totalContractQty;

  selectedAreaPanel.innerHTML = `
    <div class="selected-box">
      <div class="area-name">
        <span class="flag">${activeArea.idx}</span>${activeArea.name}
      </div>
    </div>
    <div class="flex gap-1">
      <button type="button" class="btn btn-edit btn-outline">
        <i class="icon-edit"></i>
      </button>
      <button type="button" class="btn btn-delete btn-outline"></button>
    </div>
  `;
}

/* 선택된 영역 편집/삭제 이벤트 (document 위임) */
document.addEventListener("click", function(e){
  if (!e.target.closest(".selected-area-panel")) return;
  /* 영역명 수정 */
  if(e.target.closest(".btn-edit")){
    if(!activeArea) return;
    document.querySelector('#editAreaNameInput').value = activeArea.name;
    openModal('editAreaNameModal');
  }

  /* 영역 삭제 — 도면 위 사각형 + 드롭다운 + 매핑품목 함께 삭제 */
  if(e.target.closest(".btn-delete")){
    if(!activeArea) return;

    const confirmDelete = confirm("해당 영역을 삭제하시겠습니까?");
    if(!confirmDelete) return;

    drawAreaData = drawAreaData.filter(v => v.idx !== activeArea.idx);
    document.querySelector(`.drawing-area[data-idx="${activeArea.idx}"]`)?.remove();
    document.querySelector(`.mapping-list.type-item[data-idx="${activeArea.idx}"]`)?.remove();

    document.querySelector(`.dropdown-item[data-idx="${activeArea.idx}"]`)?.remove();
    const dropdown = document.querySelector("#dropdownList");
    if(dropdown.querySelectorAll(".dropdown-item").length === 0){
      dropdown.querySelector(".btn").setAttribute("disabled", true);
    }

    activeArea = null;

    // UI 초기화
    selectedAreaPanel.innerHTML = "";
    document.querySelector('.alert[data-state="makeArea"]').classList.remove("hidden");
    const registEl = document.querySelector('.regist-cont-wrap[data-state="makeArea"]');
    if (registEl) {
      registEl.classList.add("hidden");
      registEl.style.display = "";
    }
  }
});

/* 저장 버튼 (기본 — create.html에서 override) */
function drawInfoSave() {
  drawAreaData.forEach(area => {
    const list = document.querySelector(
      `.mapping-list.type-item[data-idx="${area.idx}"]`
    );

    if (!list) {
      area.items = [];
      return;
    }

    const items = [];

    list.querySelectorAll("li").forEach(li => {
      items.push({
        itemName: li.querySelector(".text-basic")?.childNodes[0].textContent.trim() || "",
        itemCode: li.dataset.itemcode || "",
        itemCount: parseInt(li.querySelector(".qty")?.value, 10) || 0
      });
    });

    area.items = items;
  });

  console.log("최종 저장", drawAreaData);
}

/* 현재 활성 컨테이너 (모달 열려있으면 모달, 아니면 document) */
function getActiveContainer() {
  const modal = document.querySelector('#drawAreaModal.is-open');
  return modal || document;
}

/* 영역지정 안내문구 토글 */
function toggleAlertMakeArea() {
  const container = getActiveContainer();
  const alertEl = container.querySelector('.alert[data-state="makeArea"]');
  const registEl = container.querySelector('.regist-cont-wrap[data-state="makeArea"]');
  if (!alertEl || !registEl) return;

  alertEl.classList.add("hidden");
  registEl.classList.remove("hidden");
  // hidden 클래스 제거 후 flex 레이아웃 적용 (CSS !important 대응)
  setTimeout(() => { registEl.style.display = "flex"; }, 0);
}

/* 매핑항목 선택 안내문구 토글 */
function toggleAlertMappingItem(){
  if (!activeArea || !mappingWrap) return;

  // mappingWrap의 부모에서 alert 찾기
  const parentList = mappingWrap.closest('.regist-list');
  const alertEl = parentList ? parentList.querySelector('.alert[data-state="mappingItem"]') : null;

  const currentList = mappingWrap.querySelector(`.mapping-list.type-item[data-idx="${activeArea.idx}"]`);
  const selected = currentList ? currentList.querySelectorAll("li").length : 0;

  if(selected === 0){
    if (alertEl) alertEl.classList.remove("hidden");
    mappingWrap.classList.add("hidden");
  } else {
    if (alertEl) alertEl.classList.add("hidden");
    mappingWrap.classList.remove("hidden");
  }
}

/* 드롭다운 리스트 선택 시 도면에 해당 영역 selected */
document.addEventListener("click", e => {
  const list = e.target.closest(".dropdown-item");
  if (!list) return;

  activeDrawArea(list.dataset.idx);
});

/* 계약품목 개수 표시 */
function updateContractCount(){
  if (contractList) contractCount.textContent = contractList.querySelectorAll("li").length;
}

/**
 * 전체 수량 계산 (모든 영역 합)
 * 품목코드+색상코드 조합키로 식별
 * @param {string} key - getItemKey()로 생성한 고유키
 */
function getTotalQty(key){
  let total = 0;
  document.querySelectorAll(`.mapping-list.type-item li`).forEach(li => {
    if (getItemKey(li) === key) {
      const val = parseInt(li.querySelector(".qty").value) || 0;
      total += val;
    }
  });
  return total;
}

/**
 * max 수량 가져오기
 * @param {string} key - getItemKey()로 생성한 고유키
 */
function getMaxQty(key){
  // 이 도면에서 매핑 가능한 최대 수량 = 계약 전체 수량 - 다른 도면 매핑 수량
  let max = 0;
  getContractItems().forEach(li => {
    if (getItemKey(li) === key) {
      const totalQty = parseInt(li.dataset.totalqty) || parseInt(li.querySelector(".qty-total").textContent) || 0;
      const otherQty = parseInt(li.dataset.otherqty) || 0;
      max = Math.max(totalQty - otherQty, 0);
    }
  });
  return max;
}

/**
 * plus 버튼 상태 제어
 * @param {string} key - 품목 고유키
 */
function updatePlusState(key){
  const total = getTotalQty(key);
  const max = getMaxQty(key);

  document.querySelectorAll(`.mapping-list.type-item li`).forEach(li => {
    if (getItemKey(li) !== key) return;
    const plus = li.querySelector(".plus");
    if (total >= max) {
      plus.setAttribute("disabled", true);
    } else {
      plus.removeAttribute("disabled");
    }
  });
}

/* 매핑 개수 표시 (전체 계약 품목 기준) */
function updateMappingCount(){
  // 헤더 표시 기준:
  //   left  = 타 도면 매핑 + 현재 도면 전체 영역 매핑 (이미 매핑된 총 수량)
  //   right = 계약 전체 품목 수량 (TOTAL_QTY 합)
  let current = 0;
  let total = 0;

  getContractItems().forEach(li => {
    const key = getItemKey(li);
    const curDraw  = getTotalQty(key);   // 현재 도면 전체 영역 합계 (실제 qty input 값 기준)
    const otherQty = parseInt(li.dataset.otherqty) || 0;
    const totalQty = parseInt(li.dataset.totalqty) || parseInt(li.querySelector(".qty-total").textContent) || 0;
    current += otherQty + curDraw;
    total   += totalQty;
  });

  if (mappingCount) mappingCount.textContent = `${current}/${total}`;

  // 현재 영역의 매핑 상태 badge (매핑 품목 우측)
  const statusEl = document.getElementById('createMappingStatus');
  if (statusEl && activeArea) {
    const targetList = mappingWrap ? mappingWrap.querySelector(`ul.mapping-list[data-idx="${activeArea.idx}"]`) : null;
    let mappedKinds = 0, mappedCount = 0;
    if (targetList) {
      targetList.querySelectorAll('li').forEach(li => {
        mappedKinds++;
        mappedCount += parseInt(li.querySelector('.qty')?.value) || 0;
      });
    }
    if (mappedKinds > 0) {
      statusEl.innerHTML = `<span class="badge badge-blue">${mappedKinds}품목 ${mappedCount}개</span>`;
    } else {
      statusEl.innerHTML = '<span class="badge badge-orange-fill">미매핑</span>';
    }
  }
}

/**
 * 좌측 계약 품목 수량 업데이트
 * qty-count = 타 영역 + 타 도면 매핑 수량 (현재 영역 제외, refreshAllContractCounts 와 동일 기준)
 * @param {string} key - 품목 고유키
 */
function updateLeftQty(key){
  // 단일 key 업데이트도 전체 refresh 와 동일 기준을 보장하기 위해 통합 호출
  refreshAllContractCounts();
  updatePlusState(key);
  renderSelectedArea();
}

/**
 * 모든 계약 품목의 done 상태 재계산 (영역 전환 시 사용)
 * 각 계약 품목이 모든 영역에 걸쳐 max 까지 매핑되었으면 done 클래스 추가
 * 불투명 처리는 CSS `.mapping-list.type-contract li.done` 에 정의
 */
function refreshContractItemStates() {
  getContractItems().forEach(li => {
    const totalQty = parseInt(li.dataset.totalqty) || parseInt(li.querySelector(".qty-total").textContent) || 0;
    const otherQty = parseInt(li.dataset.otherqty) || 0;
    const total = getTotalQty(getItemKey(li));
    li.classList.toggle("done", totalQty > 0 && (total + otherQty) >= totalQty);
  });
}

/* 계약 품목 클릭 — create.html의 bindContractItemEvents()에서 동적 바인딩 */

/* 매핑 리스트 삭제, 수량 증가/감소 (document 위임) */
document.addEventListener("click", function(e){
  if (!e.target.closest(".mapping-list-wrap")) return;
  const li = e.target.closest("li");
  if(!li) return;

  const key = getItemKey(li);
  const input = li.querySelector(".qty");

  // 삭제
  if(e.target.closest(".btn-delete")){
    li.remove();
    updateLeftQty(key);
    toggleAlertMappingItem();
    syncContractCopyState();
  }

  // 증가
  if(e.target.closest(".plus")){
    const max = getMaxQty(key);
    const total = getTotalQty(key);
    if(total >= max) return;

    input.value = parseInt(input.value) + 1;
    updateLeftQty(key);
  }

  // 감소
  if(e.target.closest(".minus")){
    let val = parseInt(input.value);
    if(val > 1){
      input.value = val - 1;
      updateLeftQty(key);
    }
  }
});

/**
 * 영역에 복제된 품목만 스타일 추가
 * 현재 선택된 영역의 매핑품목과 동일한 계약품목에 .copy 클래스 부여
 */
function syncContractCopyState() {
  if (!activeArea) return;

  getContractItems().forEach(li => li.classList.remove("copy"));
  const currentList = document.querySelector(
    `.mapping-list.type-item[data-idx="${activeArea.idx}"]`
  );

  if (!currentList) return;

  const mappedKeys = new Set();
  currentList.querySelectorAll("li").forEach(li => {
    mappedKeys.add(getItemKey(li));
  });

  getContractItems().forEach(li => {
    if (mappedKeys.has(getItemKey(li))) {
      li.classList.add("copy");
    }
  });
}

/* 매핑 리스트 수량 직접 입력 (document 위임)
 *  - 최대 수량 초과 입력 시 자동 보정하지 않고 alert + 입력값 1로 초기화 */
document.addEventListener("change", function(e){
  if(!e.target.classList.contains("qty")) return;
  if(!e.target.closest(".mapping-list-wrap")) return;

  const input = e.target;
  const li = input.closest("li");
  const key = getItemKey(li);
  const max = getMaxQty(key);

  let val = parseInt(input.value) || 0;
  if(val < 1) val = 1;

  const otherTotal = Array.from(
    document.querySelectorAll(`.mapping-list.type-item li`)
  ).reduce((sum, el) => {
    if(el === li || getItemKey(el) !== key) return sum;
    return sum + (parseInt(el.querySelector(".qty").value) || 0);
  }, 0);

  // 입력 가능 한도 = max - 나머지 영역 매핑 합계
  const allowedMax = Math.max(max - otherTotal, 0);
  if (val > allowedMax) {
    alert('입력 가능한 최대수량은 ' + allowedMax + '개 입니다.');
    input.value = 1;
    updateLeftQty(key);
    return;
  }

  input.value = val;
  updateLeftQty(key);
});

/* 계약품목 hover (document 위임) */
document.addEventListener("mouseenter", function(e){
  if (!e.target || !e.target.closest) return;
  const li = e.target.closest(".mapping-list.type-contract li");
  if(!li) return;

  const key = getItemKey(li);
  const currentList = document.querySelector(`.mapping-list.type-item:not(.hidden)`);
  if(!currentList) return;

  currentList.querySelectorAll("li").forEach(el => {
    if (getItemKey(el) === key) el.classList.add("hover");
  });
}, true);

document.addEventListener("mouseleave", function(e){
  if (!e.target || !e.target.closest) return;
  const li = e.target.closest(".mapping-list.type-contract li");
  if(!li) return;

  const key = getItemKey(li);
  document.querySelectorAll(`.mapping-list.type-item li`).forEach(el => {
    if (getItemKey(el) === key) el.classList.remove("hover");
  });
}, true);
