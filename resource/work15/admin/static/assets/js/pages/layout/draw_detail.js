//////////////////////////////////////////////////////////
//// layoutDetail.html 전용 기능
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//// 영역 로드 (도면 + 목록 렌더링)
//////////////////////////////////////////////////////////
function loadAreas() {
  const listWrap = document.querySelector(".drawing-list-wrap");
  if (listWrap) {
    // noContractAlert 보존
    const alertEl = listWrap.querySelector('#noContractAlert');
    listWrap.innerHTML = '';
    if (alertEl) listWrap.appendChild(alertEl);
  }

  // 도면 위 기존 영역 제거 (재렌더링 시 중복 방지)
  if (canvasCont) {
    canvasCont.querySelectorAll('.drawing-area').forEach(el => el.remove());
  }

  let totalCount = 0;

  drawAreaData.forEach(group => {
    const groupEl = document.createElement("div");
    groupEl.className = "drawing-area-group";
    groupEl.dataset.contract = group.contractCode;
    groupEl.dataset.conidx = group.conIdx || '';

    let listHtml = `
      <div class="title-area">
        <button type="button" class="btn btn-delete-group hidden" data-state="areaEdit" data-conidx="${group.conIdx || ''}"></button>
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
      el.dataset.conidx = group.conIdx || '';
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
        ? area.items.map(i => `${i.itemCode}-${i.colCd} ${i.itemCout}개`).join(", ")
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
            <button type="button" class="btn btn-outline btn-area-edit" data-edit-contract="${group.contractCode}" data-edit-idx="${area.idx}" data-edit-conidx="${group.conIdx || ''}"><i class="icon-edit"></i></button>
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

  // 계약 없음 알림 표시/숨김
  const noContractAlert = document.getElementById('noContractAlert');
  if (noContractAlert) {
    noContractAlert.classList.toggle('hidden', drawAreaData.length > 0);
  }

  bindAreaListEvents();

  // 수정 모드 중이면 UI 상태 유지
  const isEditMode = document.querySelector(".draw-panel-layout")?.classList.contains("edit-mode");
  if (isEditMode) {
    document.querySelectorAll('[data-state="areaEdit"]').forEach(el => el.classList.remove('hidden'));
    // 수정 모드에서는 수정 버튼/버전 선택 숨김
    const btnEditWrap = document.getElementById('btnEditWrap');
    if (btnEditWrap) btnEditWrap.classList.add('hidden');
    const versionSelectWrap = document.getElementById('versionSelectWrap');
    if (versionSelectWrap) versionSelectWrap.classList.add('hidden');
  }
}


//////////////////////////////////////////////////////////
//// 영역 생성 콜백 (draw_canvas.js saveAreaData → onSaveAreaData)
//////////////////////////////////////////////////////////

/**
 * 도면에서 드래그로 영역 생성 완료 시 콜백
 * 우측 영역 목록에 새 항목 추가 + 영역 수 갱신
 */
function onSaveAreaData(data) {
  // conIdx로 정확한 계약 그룹 찾기 (같은 contractCode가 여러 개일 수 있음)
  const conIdx = data.conIdx || '';
  const contractCode = data.contractCode || '';
  const groupEl = conIdx
    ? document.querySelector(`.drawing-area-group[data-conidx="${conIdx}"]`)
    : document.querySelector(`.drawing-area-group[data-contract="${contractCode}"]`);
  if (!groupEl) return;

  const areaList = groupEl.querySelector('.drawing-area-list');
  if (!areaList) return;

  // type-add 앞에 새 영역 박스 삽입
  const typeAdd = areaList.querySelector('.drawing-area-box.type-add');

  const newBox = document.createElement('div');
  newBox.className = 'drawing-area-box';
  newBox.dataset.idx = data.idx;
  newBox.dataset.contract = contractCode;
  newBox.innerHTML = `
    <div class="flex-1">
      <div class="area-name">
        <span class="flag">${data.idx}</span>
        <span class="flex-1">${data.name}</span>
      </div>
      <p class="item-info">품목을 매핑해주세요</p>
    </div>
    <span class="badge badge-orange-fill">미매핑</span>
    <div class="flex gap-2" data-state="areaEdit">
      <button type="button" class="btn btn-outline btn-area-edit" data-edit-contract="${contractCode}" data-edit-idx="${data.idx}" data-edit-conidx="${data.conIdx || ''}"><i class="icon-edit"></i></button>
      <button type="button" class="btn btn-delete btn-outline"></button>
    </div>
  `;

  if (typeAdd) {
    areaList.insertBefore(newBox, typeAdd);
  } else {
    areaList.appendChild(newBox);
  }

  // 영역 수 갱신
  const group = drawAreaData.find(g => g.contractCode === contractCode);
  const count = group ? group.info.length : 0;
  groupEl.querySelector('.title-area span').textContent = count + '개';

  // 상단 영역 목록 총 개수 갱신
  let totalCount = 0;
  drawAreaData.forEach(g => { totalCount += (g.info ? g.info.length : 0); });
  const headerTitle = document.querySelector('.drawing-info-wrap .header .title');
  if (headerTitle) headerTitle.textContent = `영역 목록 (${totalCount}개)`;

  // 새 영역 박스에 이벤트 바인딩
  bindNewAreaBoxEvents(newBox);

  // 영역 추가 직후 영역 목록에만 추가 (팝업 자동 오픈 안 함)
}

/** 새로 추가된 영역 박스에 클릭/hover 이벤트 바인딩 */
function bindNewAreaBoxEvents(box) {
  box.addEventListener('click', function() {
    const contract = this.dataset.contract;
    const idx = this.dataset.idx;

    document.querySelectorAll('.drawing-area-group').forEach(g => g.classList.remove('selected'));
    document.querySelectorAll('.drawing-area-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');

    document.querySelectorAll('#drawCont .drawing-area').forEach(a => a.classList.remove('selected'));
    const drawArea = document.querySelector(`#drawCont .drawing-area[data-contract="${contract}"][data-idx="${idx}"]`);
    if (drawArea) drawArea.classList.add('selected');

    if (drawCont.classList.contains('draw-fixed')) {
      openItemMappingInfoModal(contract, idx);
    }
  });

  box.addEventListener('mouseenter', function() {
    highlightDrawArea(this.dataset.contract, this.dataset.idx);
  });
  box.addEventListener('mouseleave', function() {
    clearDrawAreaHighlight();
  });

  // 삭제 버튼
  const deleteBtn = box.querySelector('.btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!confirm('해당 영역을 삭제하시겠습니까?')) return;

      const contract = box.dataset.contract;
      const idx = box.dataset.idx;

      // drawAreaData에서 제거
      const group = drawAreaData.find(g => g.contractCode === contract);
      if (group) {
        group.info = group.info.filter(a => a.idx !== idx);
      }

      // 도면 위 영역 삭제
      document.querySelector(`#drawCont .drawing-area[data-contract="${contract}"][data-idx="${idx}"]`)?.remove();

      // 목록에서 삭제
      box.remove();

      // 개수 갱신
      const count = group ? group.info.length : 0;
      const groupEl = document.querySelector(`.drawing-area-group[data-contract="${contract}"]`);
      if (groupEl) groupEl.querySelector('.title-area span').textContent = count + '개';

      let totalCount = 0;
      drawAreaData.forEach(g => { totalCount += (g.info ? g.info.length : 0); });
      const headerTitle = document.querySelector('.drawing-info-wrap .header .title');
      if (headerTitle) headerTitle.textContent = `영역 목록 (${totalCount}개)`;
    });
  }
}


//////////////////////////////////////////////////////////
//// 목록 이벤트 바인딩
//////////////////////////////////////////////////////////

function bindAreaListEvents() {

  // 영역 박스 클릭 → 도면 영역 선택 연동
  document.querySelectorAll(".drawing-area-box:not(.type-add):not(.type-edit):not(.type-delete)").forEach(list => {
    list.addEventListener("click", function(e) {
      // 수정/삭제 버튼 클릭은 무시 (별도 이벤트 위임에서 처리)
      if (e.target.closest('.btn-area-edit') || e.target.closest('.btn-delete')) return;
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
        openItemMappingInfoModal(contract, idx);
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

      const conidx = group.dataset.conidx;
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
      document.querySelectorAll(`#drawCont .drawing-area[data-conidx="${conidx}"]`).forEach(a => a.classList.add("selected"));
    });

    el.addEventListener("mouseenter", function() {
      const isEditMode = document.querySelector(".draw-panel-layout").classList.contains("edit-mode");
      if (isEditMode) return;

      const conidx = this.closest(".drawing-area-group").dataset.conidx;
      document.querySelectorAll(`#drawCont .drawing-area[data-conidx="${conidx}"]`).forEach(a => a.classList.add("hover"));
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

      const typeAdd = this.closest(".drawing-area-list").querySelector(".drawing-area-box.type-add");
      typeAdd.classList.remove("hidden");
      this.classList.add("hidden");
      // 영역명 입력에 포커스
      const input = typeAdd.querySelector("input");
      if (input) setTimeout(() => input.focus(), 0);
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

    // 엔터키 → 영역지정 버튼 클릭과 동일
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!btn.disabled) btn.click();
      }
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
//// 영역 수정 버튼 (document 위임 — 기존/신규 모두 동작)
//////////////////////////////////////////////////////////
document.addEventListener('click', function(e) {
  const editBtn = e.target.closest('.btn-area-edit');
  if (!editBtn) return;
  e.stopPropagation();

  const contract = editBtn.dataset.editContract;
  const idx = editBtn.dataset.editIdx;
  const conIdx = editBtn.dataset.editConidx;
  if (typeof openEditItemMappingModal === 'function') {
    openEditItemMappingModal(contract, idx, false, conIdx);
  }
});

//////////////////////////////////////////////////////////
//// 계약 삭제 (document 위임 — 계약 그룹 전체 삭제)
//////////////////////////////////////////////////////////
document.addEventListener('click', function(e) {
  const deleteBtn = e.target.closest('.btn-delete-group');
  if (!deleteBtn) return;
  e.stopPropagation();

  const groupEl = deleteBtn.closest('.drawing-area-group');
  if (!groupEl) return;

  const conIdx = deleteBtn.dataset.conidx || groupEl.dataset.conidx;
  const contractCode = groupEl.dataset.contract;

  if (!confirm('해당 계약과 연결된 모든 영역을 삭제하시겠습니까?')) return;

  // 메모리에서만 삭제 (DB 반영은 저장 버튼 클릭 시)
  const groupIdx = conIdx
    ? drawAreaData.findIndex(g => String(g.conIdx) === String(conIdx))
    : drawAreaData.findIndex(g => g.contractCode === contractCode);

  if (groupIdx > -1) {
    const group = drawAreaData[groupIdx];
    // 도면 위 해당 계약의 영역 삭제
    group.info.forEach(area => {
      document.querySelector(`#drawCont .drawing-area[data-conidx="${group.conIdx}"][data-idx="${area.idx}"]`)?.remove();
    });
    drawAreaData.splice(groupIdx, 1);
  }

  // 영역 목록 재렌더링
  loadAreas();

  // 메모리 삭제된 계약이 생겼을 수 있으므로 '계약 추가' 버튼 표시 재평가
  if (typeof updateAddContractBtnVisibility === 'function') updateAddContractBtnVisibility();
});

//////////////////////////////////////////////////////////
//// 영역 삭제 (document 위임 — 기존/신규 모두 동작)
//////////////////////////////////////////////////////////
document.addEventListener('click', function(e) {
  // drawing-area-box 내부의 btn-delete만 처리 (type-add 제외)
  const deleteBtn = e.target.closest('.drawing-area-box:not(.type-add) .btn-delete');
  if (!deleteBtn) return;

  const box = deleteBtn.closest('.drawing-area-box');
  if (!box || box.classList.contains('type-add') || box.classList.contains('type-edit') || box.classList.contains('type-delete')) return;

  e.stopPropagation();
  if (!confirm('해당 영역을 삭제하시겠습니까?')) return;

  const contract = box.dataset.contract;
  const idx = box.dataset.idx;

  // drawAreaData에서 제거
  const group = drawAreaData.find(g => g.contractCode === contract);
  if (group) {
    group.info = group.info.filter(a => a.idx !== idx);
  }

  // 도면 위 영역 삭제
  document.querySelector(`#drawCont .drawing-area[data-contract="${contract}"][data-idx="${idx}"]`)?.remove();

  // 목록에서 삭제
  box.remove();

  // 개수 갱신
  const count = group ? group.info.length : 0;
  const groupEl = document.querySelector(`.drawing-area-group[data-contract="${contract}"]`);
  if (groupEl) groupEl.querySelector('.title-area span').textContent = count + '개';

  let totalCount = 0;
  drawAreaData.forEach(g => { totalCount += (g.info ? g.info.length : 0); });
  const headerTitle = document.querySelector('.drawing-info-wrap .header .title');
  if (headerTitle) headerTitle.textContent = `영역 목록 (${totalCount}개)`;
});


//////////////////////////////////////////////////////////
//// 도면 영역 클릭/hover → 목록 연동
//////////////////////////////////////////////////////////

/* 도면 영역 클릭 → 목록 연동 (document 위임) */
document.addEventListener("click", (e) => {
  if (!e.target.closest("#drawCont .img-box")) return;
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

  if (drawCont && drawCont.classList.contains("draw-fixed")) {
    openItemMappingInfoModal(contract, idx);
  }
});

document.addEventListener("mouseover", (e) => {
  if (!e.target.closest("#drawCont .img-box")) return;
  const area = e.target.closest(".drawing-area");
  if (!area) return;
  const listBox = document.querySelector(`.drawing-area-box[data-contract="${area.dataset.contract}"][data-idx="${area.dataset.idx}"]`);
  if (listBox) listBox.classList.add("hover");
});

document.addEventListener("mouseout", (e) => {
  if (!e.target.closest("#drawCont .img-box")) return;
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

/* 수정 모드 진입 시 백업 (취소 시 복원용) */
let _backupDrawAreaData = null;
let _isEditMode = false;

function editModeToggle() {
  _isEditMode = !_isEditMode;

  if (_isEditMode) {
    // 수정 모드 진입 → 현재 상태 백업 (deep copy)
    _backupDrawAreaData = JSON.parse(JSON.stringify(drawAreaData));
  } else if (_backupDrawAreaData) {
    // 수정 모드 해제 (취소) → 백업에서 복원
    drawAreaData = JSON.parse(JSON.stringify(_backupDrawAreaData));
    _backupDrawAreaData = null;

    // 도면명 원본 복원
    if (typeof _detailData !== 'undefined' && _detailData && _detailData._originalDrawingName) {
      _detailData.drawingName = _detailData._originalDrawingName;
      const el = document.getElementById('detailDrawingName');
      if (el) el.textContent = _detailData._originalDrawingName;
    }

    // 도면 위 영역 + 우측 목록 전체 재렌더링
    loadAreas();

    // 메모리 상태가 원복되었으므로 계약 추가 버튼 표시 재평가
    if (typeof updateAddContractBtnVisibility === 'function') updateAddContractBtnVisibility();
  }

  // 수정 모드 상태를 명시적으로 설정
  document.querySelectorAll('[data-state="areaEdit"]').forEach(el => {
    if (_isEditMode) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // 수정 버튼은 수정 모드가 아닐 때 표시
  const btnEditWrap = document.getElementById('btnEditWrap');
  if (btnEditWrap) {
    btnEditWrap.classList.toggle('hidden', _isEditMode);
  }

  // 버전 선택은 수정 모드일 때 숨김
  const versionSelectWrap = document.getElementById('versionSelectWrap');
  if (versionSelectWrap) {
    versionSelectWrap.classList.toggle('hidden', _isEditMode);
  }

  const layout = document.querySelector(".draw-panel-layout");
  if (_isEditMode) {
    layout.classList.add("edit-mode");
  } else {
    layout.classList.remove("edit-mode");
  }

  document.querySelectorAll(".drawing-area-group").forEach(group => group.classList.remove('selected'));
  document.querySelectorAll(".drawing-area-box").forEach(box => box.classList.remove('selected'));
  document.querySelectorAll("#drawCont .drawing-area").forEach(a => a.classList.remove("selected"));

  // 도면 공간(층수) 수정 버튼
  const btnEditSpaceName = document.getElementById('btnEditSpaceName');
  if (btnEditSpaceName) btnEditSpaceName.disabled = !_isEditMode;

  if (_isEditMode) {
    drawCont.classList.remove("draw-fixed");
    enableAllInteract();
  } else {
    drawCont.classList.add("draw-fixed");
    disableAllInteract();
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
