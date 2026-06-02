//////////////////////////////////////////////////////////
//// 영역 선택 & 폼 바인딩
//////////////////////////////////////////////////////////

/* 정적 makeAreaForm 이벤트 바인딩 */
const forms = document.querySelectorAll(".makeAreaForm");
forms.forEach((form) => {
  const input = form.querySelector("input");
  const btn = form.querySelector("button");

  input.addEventListener("input", () => {
    btn.disabled = !input.value.trim();
  });

  btn.addEventListener("click", () => {
    drawMode = true;
    currentAreaName = input.value.trim();
    input.value = "";
    btn.disabled = true;
    drawCont.style.cursor = "crosshair";
    drawCont.classList.add('has-dim');
  });
});

/* 도면 영역 클릭 → 선택 */
canvasCont.addEventListener("click", (e) => {
  const area = e.target.closest(".drawing-area");
  if (!area) return;
  activeDrawArea(area.dataset.idx);
});

/* 영역 활성화 */
function activeDrawArea(idx) {
  const target = document.querySelector(`.drawing-area[data-idx="${idx}"]`);
  document.querySelectorAll(".drawing-area").forEach(v => v.classList.remove("selected"));
  if (target) target.classList.add("selected");
  activeArea = drawAreaData.find(v => v.idx == idx);

  onActiveDrawArea(idx);
}


//////////////////////////////////////////////////////////
//// 품목 매핑 기능
//////////////////////////////////////////////////////////

const selectedAreaPanel = document.querySelector(".selected-area-panel");
const mappingWrap = document.querySelector(".mapping-list-wrap");
const contractList = document.querySelector(".mapping-list.type-contract");
const contractItems = contractList?.querySelectorAll("li");
const contractCount = document.querySelector("#contractCount");
const mappingCount = document.querySelector("#mappingCount");

/* draw_create.js > activeDrawArea 콜백 */
function onActiveDrawArea(idx) {
  // 선택 영역에 해당하는 매핑품목 생성
  let targetList = mappingWrap.querySelector(`ul.mapping-list[data-idx="${idx}"]`);
  if (!targetList) {
    targetList = document.createElement("ul");
    targetList.className = "mapping-list type-item";
    targetList.dataset.idx = activeArea.idx;
    mappingWrap.appendChild(targetList);
  }

  // 선택 영역에 해당하는 매핑품목 show
  document.querySelectorAll(".mapping-list.type-item").forEach(ul => ul.classList.add("hidden"));
  targetList.classList.remove("hidden");

  renderSelectedArea();
  syncContractCopyState();
  toggleAlertMakeArea();
  toggleAlertMappingItem();
}

/* draw_create.js > saveAreaData 콜백 */
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

/* 선택된 영역 정보 렌더링 */
function renderSelectedArea() {
  if (!activeArea) return;
  if (!selectedAreaPanel) return;

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

/* 선택된 영역 편집/삭제 */
selectedAreaPanel?.addEventListener("click", function(e){
  if(e.target.closest(".btn-edit")){
    if(!activeArea) return;

    document.querySelector('#editAreaNameInput').value = activeArea.name;
    openModal('editAreaNameModalPub');
  }

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
    document.querySelector('.regist-cont-wrap[data-state="makeArea"]').classList.add("hidden");
  }
});

/* 페이지 저장 버튼 */
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

/* 영역지정 안내문구 토글 */
function toggleAlertMakeArea() {
  const alertEl = document.querySelector('.alert[data-state="makeArea"]');
  const registEl = document.querySelector('.regist-cont-wrap[data-state="makeArea"]');
  if (!alertEl || !registEl) return;

  alertEl.classList.add("hidden");
  registEl.classList.remove("hidden");
}

/* 매핑항목 선택 안내문구 토글 */
function toggleAlertMappingItem(){
  const alertEl = document.querySelector('.alert[data-state="mappingItem"]');
  const listEl = document.querySelector('.mapping-list-wrap[data-state="mappingItem"]');

  if (!activeArea) return;

  const currentList = document.querySelector(`.mapping-list.type-item[data-idx="${activeArea.idx}"]`);
  const selected = currentList ? currentList.querySelectorAll("li").length : 0;

  if(selected === 0){
    alertEl.classList.remove("hidden");
    listEl.classList.add("hidden");
  } else {
    alertEl.classList.add("hidden");
    listEl.classList.remove("hidden");
  }
}

/* 품목매핑영역 > 드롭다운리스트 선택시 도면에 해당 영역 selected */
document.addEventListener("click", e => {
  const list = e.target.closest(".dropdown-item");
  if (!list) return;

  activeDrawArea(list.dataset.idx);
});

/* 계약품목 개수 표시 */
function updateContractCount(){
  contractCount.textContent = contractList.querySelectorAll("li").length;
}

/* 전체 수량 계산 (모든 영역 합) */
function getTotalQty(code){
  let total = 0;

  document.querySelectorAll(`.mapping-list.type-item li[data-itemcode="${code}"]`)
    .forEach(li=>{
      const val = parseInt(li.querySelector(".qty").value) || 0;
      total += val;
    });

  return total;
}

/* max 수량 가져오기 */
function getMaxQty(code){
  const item = document.querySelector(`.type-contract li[data-itemcode="${code}"]`);
  return parseInt(item.querySelector(".qty-total").textContent) || 0;
}

/* plus 버튼 상태 제어 */
function updatePlusState(code){
  const total = getTotalQty(code);
  const max = getMaxQty(code);

  document.querySelectorAll(`.mapping-list.type-item li[data-itemcode="${code}"]`)
    .forEach(li=>{
      const plus = li.querySelector(".plus");

      if(total >= max){
        plus.setAttribute("disabled", true);
      }else{
        plus.removeAttribute("disabled");
      }
    });
}

/* 매핑 개수 표시 */
function updateMappingCount(){
  let current = 0;
  let total = 0;

  contractItems.forEach(li=>{
    const n = parseInt(li.querySelector(".qty-count").textContent) || 0;
    const max = parseInt(li.querySelector(".qty-total").textContent) || 0;

    current += n;
    total += max;
  });

  mappingCount.textContent = `${current}/${total}`;
}

/* 좌측 계약 품목 수량 업데이트 */
function updateLeftQty(code){
  const total = getTotalQty(code);

  contractItems.forEach(li=>{
    if(li.dataset.itemcode === code){
      const countEl = li.querySelector(".qty-count");
      const maxEl = li.querySelector(".qty-total");

      const max = parseInt(maxEl.textContent) || 0;
      countEl.textContent = total;

      li.classList.toggle("done", total >= max);
    }
  });

  updatePlusState(code);
  updateMappingCount();
}

/* 계약 품목 클릭 */
contractItems.forEach((li) => {
  li.addEventListener("click", function () {
    const code = li.dataset.itemcode;
    const currentList = document.querySelector(
      `.mapping-list.type-item[data-idx="${activeArea.idx}"]`
    );

    const max = getMaxQty(code);
    const total = getTotalQty(code);
    if(total >= max){
      return;
    }

    let target = currentList.querySelector(`li[data-itemcode="${code}"]`);
    if (target) {
      updateLeftQty(code);
      toggleAlertMappingItem();
      return;
    }

    const itemInfo = li.querySelector(".item-info").outerHTML;
    const newLi = document.createElement("li");
    newLi.dataset.itemcode = code;

    newLi.innerHTML = `
      ${itemInfo}
      <div class="item-actions">
        <div class="item-counter">
          <button type="button" class="btn btn-ghost minus">
            <i class="icon-chevron rotate-90"></i>
          </button>
          <input type="text" class="input text-center qty" value="1">
          <button type="button" class="btn btn-ghost plus">
            <i class="icon-chevron rotate-270"></i>
          </button>
        </div>
        <button type="button" class="btn btn-delete btn-ghost"></button>
      </div>
    `;

    currentList.appendChild(newLi);
    newLi.classList.add("hover");

    updateLeftQty(code);
    toggleAlertMappingItem();
    syncContractCopyState();
  });
});

/* 매핑 리스트 삭제, 수량 카운트 */
mappingWrap.addEventListener("click", function(e){
  const li = e.target.closest("li");
  if(!li) return;

  const code = li.dataset.itemcode;
  const input = li.querySelector(".qty");

  // 삭제
  if(e.target.closest(".btn-delete")){
    li.remove();
    updateLeftQty(code);
    toggleAlertMappingItem();
    syncContractCopyState();
  }

  // 증가
  if(e.target.closest(".plus")){
    const max = getMaxQty(code);
    const total = getTotalQty(code);

    if(total >= max) return;

    input.value = parseInt(input.value) + 1;
    updateLeftQty(code);
  }

  // 감소
  if(e.target.closest(".minus")){
    let val = parseInt(input.value);

    if(val > 1){
      input.value = val - 1;
      e.target.closest(".minus").setAttribute("disabled", true);
      updateLeftQty(code);
    } else {
      e.target.closest(".minus").removeAttribute("disabled");
    }
  }
});

/* 영역에 복제된 품목만 스타일 추가 */
function syncContractCopyState() {
  if (!activeArea) return;

  contractItems.forEach(li => li.classList.remove("copy"));
  const currentList = document.querySelector(
    `.mapping-list.type-item[data-idx="${activeArea.idx}"]`
  );

  if (!currentList) return;

  const mappedCodes = new Set();
  currentList.querySelectorAll("li[data-itemcode]").forEach(li => {
    mappedCodes.add(li.dataset.itemcode);
  });

  contractItems.forEach(li => {
    if (mappedCodes.has(li.dataset.itemcode)) {
      li.classList.add("copy");
    }
  });
}

/* 매핑 리스트 수량 직접 입력 */
mappingWrap.addEventListener("change", function(e){
  if(!e.target.classList.contains("qty")) return;

  const input = e.target;
  const li = input.closest("li");
  const code = li.dataset.itemcode;

  const max = getMaxQty(code);

  let val = parseInt(input.value) || 0;
  if(val < 1) val = 1;

  const otherTotal = Array.from(
    document.querySelectorAll(`.mapping-list.type-item li[data-itemcode="${code}"]`)
  ).reduce((sum, el)=>{
    if(el === li) return sum;
    return sum + (parseInt(el.querySelector(".qty").value) || 0);
  }, 0);

  if(otherTotal + val > max){
    val = max - otherTotal;
  }

  input.value = val;

  updateLeftQty(code);
});

/* 계약품목 hover 시 매핑된 품목에 hover 클래스 연동 */
contractList?.addEventListener("mouseenter", function(e){
  const li = e.target.closest("li");
  if(!li) return;

  const code = li.dataset.itemcode;
  if(!code) return;

  const currentList = document.querySelector(`.mapping-list.type-item:not(.hidden)`);
  if(!currentList) return;

  const target = currentList.querySelector(`li[data-itemcode="${code}"]`);
  if(target) target.classList.add("hover");
}, true);

contractList?.addEventListener("mouseleave", function(e){
  const li = e.target.closest("li");
  if(!li) return;

  const code = li.dataset.itemcode;
  if(!code) return;

  document.querySelectorAll(`.mapping-list.type-item li[data-itemcode="${code}"]`)
    .forEach(el => el.classList.remove("hover"));
}, true);