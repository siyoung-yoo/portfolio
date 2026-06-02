//////////////////////////////////////////////////////////
//// layoutDetail.html 전용 기능
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//// 영역 로드 (도면 + 목록 렌더링)
//////////////////////////////////////////////////////////
function loadAreas() {
  const listWrap = document.querySelector(".drawing-list-wrap");
  let totalCount = 0;

  drawAreaData.forEach(group => {
    const groupEl = document.createElement("div");
    groupEl.className = "drawing-area-group";
    groupEl.dataset.contract = group.contractCode;

    let listHtml = `
      <div class="title-area">
        <p class="flex-1"><strong>${group.contractCode}</strong> ${group.contractName}</p>
        <span>${group.info.length}개</span>
      </div>
      <div class="drawing-area-list">`;

    group.info.forEach(area => {
      // 도면 영역 생성
      const el = document.createElement("div");
      el.className = "drawing-area";
      el.dataset.idx = area.idx;
      el.dataset.contract = group.contractCode;
      el.innerHTML = `<span class="area-label">${area.idx} ${area.name}</span>`;
      el.style.left = area.left + "px";
      el.style.top = area.top + "px";
      el.style.width = area.width + "px";
      el.style.height = area.height + "px";
      canvasCont.appendChild(el);
      enableInteract(el);
      totalCount++;

      // 목록 항목 HTML
      const itemInfo = area.items.length > 0
        ? area.items.map(i => `${i.itemName} ${i.itemCout}`).join(", ")
        : "품목을 매핑해주세요";

      listHtml += `
        <div class="drawing-area-box" data-idx="${area.idx}" data-contract="${group.contractCode}">
          <div class="flex-1">
            <div class="area-name">
              <span class="flag">${area.idx}</span>
              <span class="flex-1">${area.name}</span>
            </div>
            <p class="item-info">${itemInfo}</p>
          </div>
          ${area.items.length === 0 ? '<span class="badge badge-orange-fill">미매핑</span>' : ''}
          <div class="flex gap-2 hidden" data-state="areaEdit">
            <button type="button" class="btn btn-outline" onclick="openModal('editItemMappingInfoModalPub')"><i class="icon-edit"></i></button>
            <button type="button" class="btn btn-delete btn-outline"></button>
          </div>
        </div>`;
    });

    listHtml += `
        <div class="drawing-area-box type-add hidden">
          <div class="input-group add-box gap-2 makeAreaForm">
            <input type="text" class="input flex-1" placeholder="영역 명을 입력해 주세요 (예: 업무존 A, 회의실)">
            <button type="button" draggable="true" disabled class="btn btn-icon btn-outline"><i class="icon-selection"></i></button>
          </div>
          <button type="button" class="btn btn-delete btn-ghost"></button>
        </div>
        <div class="drawing-area-box type-edit hidden" data-state="areaEdit">
          <p class="area-name">영역 추가</p>
          <p class="item-info">영역을 추가하려면 클릭하세요</p>
        </div>
      </div>`;

    groupEl.innerHTML = listHtml;
    if (listWrap) listWrap.appendChild(groupEl);
  });

  areaIdx = totalCount;

  const headerTitle = document.querySelector(".drawing-info-wrap .header .title");
  if (headerTitle) headerTitle.textContent = `영역 목록 (${totalCount}개)`;

  bindAreaListEvents();
}


//////////////////////////////////////////////////////////
//// 목록 이벤트 바인딩
//////////////////////////////////////////////////////////

function bindAreaListEvents() {

  // 영역 박스 클릭 → 도면 영역 선택 연동
  document.querySelectorAll(".drawing-area-box:not(.type-add):not(.type-edit):not(.type-delete)").forEach(list => {
    list.addEventListener("click", function() {
      const contract = this.dataset.contract;
      const idx = this.dataset.idx;

      // 목록 selected
      document.querySelectorAll(".drawing-area-group").forEach(g => g.classList.remove("selected"));
      document.querySelectorAll(".drawing-area-box").forEach(b => b.classList.remove("selected"));
      this.classList.add("selected");

      // 도면 영역 selected
      document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));
      const drawArea = document.querySelector(`#drawCont .drawing-area[data-contract="${contract}"][data-idx="${idx}"]`);
      if (drawArea) drawArea.classList.add("selected");

      if (drawCont.classList.contains("draw-fixed")) {
        openModal('itemMappingInfoModalPub');
      }
    });

    // hover 연동: 목록 → 도면
    list.addEventListener("mouseenter", function() {
      highlightDrawArea(this.dataset.contract, this.dataset.idx);
    });
    list.addEventListener("mouseleave", function() {
      clearDrawAreaHighlight();
    });
  });

  // 계약 그룹 title 클릭/hover
  document.querySelectorAll(".drawing-area-group .title-area").forEach(el => {
    el.addEventListener("click", function() {
      const isEditMode = document.querySelector(".draw-panel-layout").classList.contains("edit-mode");
      if (isEditMode) return;

      const group = this.closest(".drawing-area-group");
      if (group.classList.contains("no-mapped")) return;

      const contract = group.dataset.contract;
      const isSelected = group.classList.contains("selected");

      if (isSelected) {
        group.classList.remove("selected");
        document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));
        return;
      }

      document.querySelectorAll(".drawing-area-group").forEach(g => g.classList.remove("selected"));
      document.querySelectorAll(".drawing-area-box").forEach(b => b.classList.remove("selected"));
      group.classList.add("selected");

      document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));
      document.querySelectorAll(`#drawCont .drawing-area[data-contract="${contract}"]`).forEach(a => a.classList.add("selected"));
    });

    el.addEventListener("mouseenter", function() {
      const isEditMode = document.querySelector(".draw-panel-layout").classList.contains("edit-mode");
      if (isEditMode) return;

      const contract = this.closest(".drawing-area-group").dataset.contract;
      document.querySelectorAll(`#drawCont .drawing-area[data-contract="${contract}"]`).forEach(a => a.classList.add("hover"));
    });
    el.addEventListener("mouseleave", function() {
      clearDrawAreaHighlight();
    });
  });

  // 영역 추가 클릭 > input 영역 생성
  document.querySelectorAll(".drawing-area-box.type-edit").forEach(el => {
    el.addEventListener("click", function() {
      document.querySelectorAll(".drawing-area-group").forEach(g => g.classList.remove("selected"));
      document.querySelectorAll(".drawing-area-box").forEach(b => b.classList.remove("selected"));

      this.closest(".drawing-area-list").querySelector(".drawing-area-box.type-add").classList.remove("hidden");
      this.classList.add("hidden");
    });
  });

  // 영역 추가 삭제 버튼
  document.querySelectorAll(".drawing-area-box.type-add .btn-delete").forEach(el => {
    el.addEventListener("click", function() {
      const typeAddBox = this.closest(".drawing-area-box.type-add");
      typeAddBox.querySelector("input").value = "";
      typeAddBox.closest(".drawing-area-list").querySelector(".drawing-area-box.type-edit").classList.remove("hidden");
      typeAddBox.classList.add("hidden");
    });
  });

  // makeAreaForm input → 버튼 활성화
  document.querySelectorAll(".makeAreaForm").forEach(form => {
    const input = form.querySelector("input");
    const btn = form.querySelector("button");

    input.addEventListener("input", () => {
      btn.disabled = !input.value.trim();
    });

    btn.addEventListener("click", () => {
      drawMode = true;
      currentAreaName = input.value.trim();
      activeForm = form;
      drawCont.style.cursor = "crosshair";

      // 모든 makeAreaForm input, btn disabled
      document.querySelectorAll(".makeAreaForm").forEach(f => {
        f.querySelector("input").disabled = true;
        f.querySelector("button").disabled = true;
      });

      document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));
    });
  });
}


//////////////////////////////////////////////////////////
//// 도면 영역 클릭/hover → 목록 연동
//////////////////////////////////////////////////////////

canvasCont.addEventListener("click", (e) => {
  const area = e.target.closest(".drawing-area");
  if (!area) return;

  const contract = area.dataset.contract;
  const idx = area.dataset.idx;

  // 도면 selected
  document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));
  area.classList.add("selected");

  // 목록 selected
  document.querySelectorAll(".drawing-area-group").forEach(g => g.classList.remove("selected"));
  document.querySelectorAll(".drawing-area-box").forEach(b => b.classList.remove("selected"));
  const listBox = document.querySelector(`.drawing-area-box[data-contract="${contract}"][data-idx="${idx}"]`);
  if (listBox) {
    listBox.classList.add("selected");
    listBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (drawCont.classList.contains("draw-fixed")) {
    openModal('itemMappingInfoModalPub');
  }
});

canvasCont.addEventListener("mouseover", (e) => {
  const area = e.target.closest(".drawing-area");
  if (!area) return;
  const listBox = document.querySelector(`.drawing-area-box[data-contract="${area.dataset.contract}"][data-idx="${area.dataset.idx}"]`);
  if (listBox) listBox.classList.add("hover");
});

canvasCont.addEventListener("mouseout", (e) => {
  const area = e.target.closest(".drawing-area");
  if (!area) return;
  document.querySelectorAll(".drawing-area-box").forEach(b => b.classList.remove("hover"));
});


//////////////////////////////////////////////////////////
//// 하이라이트 헬퍼
//////////////////////////////////////////////////////////

function highlightDrawArea(contract, idx) {
  document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("hover"));
  const target = document.querySelector(`#drawCont .drawing-area[data-contract="${contract}"][data-idx="${idx}"]`);
  if (target) target.classList.add("hover");
}

function clearDrawAreaHighlight() {
  document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("hover"));
}


//////////////////////////////////////////////////////////
//// 수정 모드
//////////////////////////////////////////////////////////
function editModeToggle() {
  const toggleEl = document.querySelectorAll('[data-state="areaEdit"]')
  toggleEl.forEach(el => el.classList.toggle('hidden'))
  document.querySelector(".draw-panel-layout").classList.toggle("edit-mode");

  document.querySelectorAll(".drawing-area-group").forEach(group => group.classList.remove('selected'));
  document.querySelectorAll(".drawing-area-box").forEach(box => box.classList.remove('selected'));
  document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));

  const btnFloorEdit = document.querySelector(".draw-info .btn-link");
  btnFloorEdit.disabled = !btnFloorEdit.disabled;

  drawCont.classList.toggle("draw-fixed");

  if (drawCont.classList.contains("draw-fixed")) {
    disableAllInteract();
  } else {
    enableAllInteract();
  }
}


//////////////////////////////////////////////////////////
//// 버전 선택
//////////////////////////////////////////////////////////
const versionSelect = document.querySelector("#versionSelect");
const versionInfo = document.querySelector(".version-info");
const btnEdit = document.querySelector("#btnEdit");

/* 버전 선택 처리 */
function selectVersion(item, menu) {
  const versionItems = menu.querySelectorAll(".dropdown-item[data-version]");
  const maxVersion = Math.max(...Array.from(versionItems).map(el => Number(el.dataset.version)));
  const ver = Number(item.dataset.version);
  const isCurrent = ver === maxVersion;

  // trigger 버튼 텍스트
  const toggle = versionSelect?.querySelector("[data-dropdown-toggle]");
  if (toggle) {
    toggle.innerHTML = isCurrent
      ? `ver ${ver} (현재) <i class="icon-chevron"></i>`
      : `ver ${ver} <i class="icon-chevron"></i>`;
  }

  // version-info 표시/숨김
  if (versionInfo) {
    versionInfo.classList.toggle("hidden", isCurrent);
    btnEdit.classList.toggle("hidden", !isCurrent);
  }

  // selected 상태
  versionItems.forEach(v => v.classList.remove("selected"));
  item.classList.add("selected");
}

// menu는 body로 portal 이동하므로 document에 이벤트 위임
document.addEventListener("click", function(e) {
  const item = e.target.closest(".dropdown-item[data-version]");
  if (!item) return;

  const menu = item.closest(".dropdown-menu");
  if (!menu || !versionSelect?.querySelector(".dropdown")?.contains(menu) && menu.parentElement !== document.body) return;

  selectVersion(item, menu);
});

// 현재 버전으로 버튼
document.querySelector("#goCurrentVer")?.addEventListener("click", function() {
  const menu = versionSelect?.querySelector(".dropdown-menu");
  if (!menu) return;

  const versionItems = menu.querySelectorAll(".dropdown-item[data-version]");
  const maxVersion = Math.max(...Array.from(versionItems).map(el => Number(el.dataset.version)));
  const latestItem = menu.querySelector(`.dropdown-item[data-version="${maxVersion}"]`);
  if (latestItem) selectVersion(latestItem, menu);
});
