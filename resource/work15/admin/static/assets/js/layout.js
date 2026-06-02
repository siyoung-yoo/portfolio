// SidebarComponent
function SidebarComponent() {
  const html = document.documentElement;
  const overlay = document.querySelector(".sidebar-overlay");
  const toggleBtn = document.querySelector(".sidebar-toggle-btn");
  const closeBtn = document.querySelector(".sidebar-close");
  const mediaQuery = window.matchMedia("(min-width: 1200px)");

  const STORAGE_KEY = "sidebar-size";

  if (!overlay) return;

  // 저장
  function save(size) {
    localStorage.setItem(STORAGE_KEY, size);
  }

  // 현재 상태 가져오기
  function getSize() {
    return html.getAttribute("data-sidebar-size");
  }

  // 데스크탑 여부
  function isDesktop() {
    return mediaQuery.matches;
  }

  // overlay 처리
  function updateOverlay() {
    const isDesktop = mediaQuery.matches;
    const isSmall = getSize() === "sm";

    // 모바일 + 펼침 상태에서만 overlay 표시
    overlay.style.display = !isDesktop && !isSmall ? "block" : "none";
  }

  // 열기
  function open() {
    html.setAttribute("data-sidebar-size", "default");

    // 데스크탑에서만 저장
    if (isDesktop()) {
      save("default");
    }

    updateOverlay();
    resizeGridAll();
  }

  // 접기
  function close() {
    html.setAttribute("data-sidebar-size", "sm");

    // 데스크탑에서만 저장
    if (isDesktop()) {
      save("sm");
    }

    updateOverlay();
    resizeGridAll();
  }

  // 토글
  function toggle() {
    const isSmall = getSize() === "sm";
    isSmall ? open() : close();
  }

  // 초기 상태 적용
  function initialize() {
    // 모바일은 무조건 접힘
    if (!isDesktop()) {
      html.setAttribute("data-sidebar-size", "sm");

      updateOverlay();
      return;
    }

    // 데스크탑만 저장값 사용
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "sm" || saved === "default") {
      html.setAttribute("data-sidebar-size", saved);
    } else {
      html.setAttribute("data-sidebar-size", "default");
    }

    updateOverlay();
  }

  // breakpoint 변경 시
  mediaQuery.addEventListener("change", (e) => {
    if (!isDesktop()) {
      html.setAttribute("data-sidebar-size",  "sm");
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      html.setAttribute("data-sidebar-size", saved || "default");
    }

    updateOverlay();
    resizeGrid();
  });

  // 이벤트
  toggleBtn?.addEventListener("click", toggle);
  overlay.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);

  initialize();
  return {open, close, toggle};
}
const sidebarComponent = SidebarComponent();


const SidebarMenuState = (() => {
  const baseKey = "rentalPlus.sidebar.openMenuIds";

  function getStorageKey() {
    const wrapper = document.querySelector(".sidebar-wrapper");
    const userId = wrapper?.dataset.sidebarUserId;
    return userId ? `${baseKey}.${userId}` : baseKey;
  }

  function getMenuId(menuItem) {
    return menuItem?.dataset.sidebarMenuId || "";
  }

  function getOpenMenuIds() {
    try {
      const savedValue = localStorage.getItem(getStorageKey());
      const savedIds = JSON.parse(savedValue || "[]");
      return Array.isArray(savedIds) ? savedIds.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  function saveOpenMenuIds() {
    const openIds = Array.from(document.querySelectorAll(".sidebar-menu-item.is-open"))
      .map(getMenuId)
      .filter(Boolean);

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(openIds));
    } catch (e) {
      // Ignore storage errors so sidebar toggling still works in restricted browsers.
    }
  }

  function openMenu(menuItem) {
    const subMenu = menuItem?.querySelector(".sidebar-menuSub");
    if (!subMenu) return;

    menuItem.classList.add("is-open");
    subMenu.style.height = "auto";
  }

  function closeMenu(menuItem) {
    const subMenu = menuItem?.querySelector(".sidebar-menuSub");
    if (!subMenu) return;

    menuItem.classList.remove("is-open");
    subMenu.style.height = "0px";
  }

  function restoreOpenMenus() {
    document.querySelectorAll(".sidebar-menu-item").forEach(closeMenu);

    getOpenMenuIds().forEach((menuId) => {
      openMenu(findMenuItem(menuId));
    });
  }

  function findMenuItem(menuId) {
    return Array.from(document.querySelectorAll(".sidebar-menu-item"))
      .find((menuItem) => getMenuId(menuItem) === menuId);
  }

  return {
    getOpenMenuIds,
    saveOpenMenuIds,
    openMenu,
    closeMenu,
    restoreOpenMenus,
    findMenuItem
  };
})();

// Sidebar Menu Toggle
document.addEventListener("click", (e) => {
  const button = e.target.closest(".sidebar-menu-button");
  if (!button) return;

  const menuItem = button.closest(".sidebar-menu-item");
  if (!menuItem) return;

  const subMenu = menuItem.querySelector(".sidebar-menuSub");
  if (!subMenu) return;

  const isOpen = menuItem.classList.contains("is-open");

  if (isOpen) {
    // 서브메뉴 닫기
    subMenu.style.height = subMenu.scrollHeight + "px";
    requestAnimationFrame(() => {
      subMenu.style.height = "0px";
      menuItem.classList.remove("is-open");
      SidebarMenuState.saveOpenMenuIds();
    });
  } else {
    // 서브메뉴 열기
    menuItem.classList.add("is-open");
    SidebarMenuState.saveOpenMenuIds();
    subMenu.style.height = subMenu.scrollHeight + "px";
    subMenu.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "height") return;

        if (menuItem.classList.contains("is-open")) {
          subMenu.style.height = "auto";
        }
      },
      { once: true }
    );
  }
});

// Sidebar Menu 고정 열림
document.addEventListener("DOMContentLoaded", () => {
  SidebarMenuState.restoreOpenMenus();

  const activeSubItem = document.querySelector(
    ".sidebar-menuSub-item.active"
  );

  if (!activeSubItem) return;

  const menuItem = activeSubItem.closest(".sidebar-menu-item");
  if (!menuItem) return;

  const subMenu = menuItem.querySelector(".sidebar-menuSub");
  if (!subMenu) return;

  SidebarMenuState.openMenu(menuItem);
  SidebarMenuState.saveOpenMenuIds();
});

// Sidebar Menu Search
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".sidebar-header-bot .search");
  const menuItems = Array.from(document.querySelectorAll(".sidebar-menu-item"));

  if (!searchInput || menuItems.length === 0) return;

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
      menuItems.forEach((menuItem) => {
        menuItem.style.display = "";
        menuItem.querySelectorAll(".sidebar-menuSub-item").forEach((subItem) => {
          subItem.style.display = "";
        });
      });
      SidebarMenuState.restoreOpenMenus();
      return;
    }

    menuItems.forEach((menuItem) => {
      let hasMatchedSubMenu = false;

      menuItem.querySelectorAll(".sidebar-menuSub-item").forEach((subItem) => {
        const subMenuName = subItem.textContent.trim().toLowerCase();
        const isMatched = subMenuName.includes(keyword);

        subItem.style.display = isMatched ? "" : "none";
        hasMatchedSubMenu = hasMatchedSubMenu || isMatched;
      });

      menuItem.style.display = hasMatchedSubMenu ? "" : "none";

      if (hasMatchedSubMenu) {
        SidebarMenuState.openMenu(menuItem);
      }
    });
  });
});

// Sidebar Quick Move
var quickMoveState = {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1
};

function quickMovePopup(url, id, width, height) {
  const screenX = window.screenX || window.screenLeft || 0;
  const screenY = window.screenY || window.screenTop || 0;
  const popup = window.open(
    url,
    id,
    "width=" + width + ", height=" + height + ", left=" + screenX + ", top=" + screenY + ",scrollbars=yes, resizable=yes"
  );
  popup?.focus();
}

function quickMoveText(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function quickMoveEscape(value) {
  return quickMoveText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function quickMoveLink(label, type, idx, detailType) {
  if (idx === null || idx === undefined || idx === "") {
    return quickMoveEscape(label);
  }

  const safeDetailType = detailType === null || detailType === undefined ? "" : quickMoveEscape(detailType);
  return '<a href="javascript:void(0);" class="btn-link" onclick="quickMoveOpen(\'' + type + '\', \'' + quickMoveEscape(idx) + '\', \'' + safeDetailType + '\')">' + quickMoveEscape(label) + '</a>';
}

function renderQuickMoveResult(list, meta = {}) {
  const body = document.getElementById("quickMoveResultBody");
  const summary = document.getElementById("quickMoveSummary");
  const pagination = document.getElementById("quickMovePagination");
  const pageInfo = document.getElementById("quickMovePageInfo");
  const prevBtn = document.getElementById("quickMovePrevBtn");
  const nextBtn = document.getElementById("quickMoveNextBtn");
  if (!body) return;

  quickMoveState.page = Number(meta.page || quickMoveState.page || 1);
  quickMoveState.pageSize = Number(meta.pageSize || quickMoveState.pageSize || 10);
  quickMoveState.totalCount = Number(meta.totalCount || 0);
  quickMoveState.totalPages = Math.max(Math.ceil(quickMoveState.totalCount / quickMoveState.pageSize), 1);

  if (summary) {
    summary.textContent = "검색 결과 " + quickMoveState.totalCount + "건";
  }

  if (pagination) {
    pagination.style.display = quickMoveState.totalCount > quickMoveState.pageSize ? "" : "none";
  }
  if (pageInfo) {
    pageInfo.textContent = quickMoveState.page + " / " + quickMoveState.totalPages;
  }
  if (prevBtn) {
    prevBtn.disabled = quickMoveState.page <= 1;
  }
  if (nextBtn) {
    nextBtn.disabled = quickMoveState.page >= quickMoveState.totalPages;
  }

  if (!list.length) {
    body.innerHTML = '<tr><td colspan="8" class="text-center">검색 결과가 없습니다.</td></tr>';
    return;
  }

  body.innerHTML = list.map((item) => {
    const mIdx = item.M_IDX;
    const estIdx = item.EST_IDX;
    const conIdx = item.CON_IDX;
    const estimateDetailType = item.EST_DETAIL_TYPE || "headOffice";
    const contractDetailType = item.CONTRACT_DETAIL_TYPE || "direct";

    return '<tr>'
      + '<td>' + quickMoveLink(item.M_NUM, "bonds", mIdx) + '</td>'
      + '<td>' + quickMoveEscape(item.QUICK_MOVE_TYPE) + '</td>'
      + '<td>' + quickMoveEscape(item.M_CT_NAME) + '</td>'
      + '<td>' + quickMoveLink(item.CON_TITLE, "contract", conIdx, contractDetailType) + '</td>'
      + '<td>' + quickMoveLink(item.EST_CODE, "estimate", estIdx, estimateDetailType) + '</td>'
      + '<td>' + quickMoveLink(item.EST_TITLE, "estimate", estIdx, estimateDetailType) + '</td>'
      + '<td>' + quickMoveLink("열기", "payment", mIdx) + '</td>'
      + '<td>' + quickMoveLink("열기", "accounting", mIdx) + '</td>'
      + '</tr>';
  }).join("");
}

async function quickSearch() {
  return quickMoveSearchPage(1);
}

async function quickMoveSearchPage(page) {
  const form = document.querySelector(".fast-move #quickSearchForm");
  if (!form) return false;

  const quickValue = (form.querySelector('[name="quick_value"]')?.value || "").trim();
  if (!quickValue) {
    alert("검색어를 입력해 주세요.");
    return false;
  }

  quickMoveState.page = Math.max(Number(page) || 1, 1);
  quickMoveState.pageSize = quickMoveState.pageSize || 10;
  const params = new URLSearchParams(new FormData(form));
  params.set("page", quickMoveState.page);
  params.set("pageSize", quickMoveState.pageSize);

  const response = await fetch("/orders/quickMoveSearch.ajax", {
    method: "POST",
    body: params
  });
  const json = await response.json();

  renderQuickMoveResult(json?.data?.list || [], json?.data || {});
  openModal("quickMoveModal");
  return false;
}

function quickMovePagePrev() {
  if (quickMoveState.page <= 1) return false;
  return quickMoveSearchPage(quickMoveState.page - 1);
}

function quickMovePageNext() {
  if (quickMoveState.page >= quickMoveState.totalPages) return false;
  return quickMoveSearchPage(quickMoveState.page + 1);
}

function quickMoveOpen(type, idx, detailType) {
  const target = String(idx || "");
  if (!target) return false;

  if (type === "bonds") {
    window.open("/bonds/bondsDetail/" + target, "_blank");
  } else if (type === "estimate") {
    const estimateType = detailType === "distribution" ? "distribution" : "headOffice";
    window.open("/estimate/" + estimateType + "/" + target, "_blank");
  } else if (type === "contract") {
    const contractType = detailType === "channel" ? "channel" : "direct";
    quickMovePopup("/contract/" + contractType + "/" + target, "contractDetail" + target, screen.width, screen.height);
  } else if (type === "payment") {
    quickMovePopup("/bonds/paymentScheduler/" + target, "paymentScheduler" + target, screen.width, screen.height);
  } else if (type === "accounting") {
    quickMovePopup("/bonds/bondsScheduler/" + target, "bondsScheduler" + target, screen.width, screen.height);
  }

  closeModal("quickMoveModal");
  return false;
}

window.quickSearch = quickSearch;
window.quickMoveOpen = quickMoveOpen;
window.quickMovePagePrev = quickMovePagePrev;
window.quickMovePageNext = quickMovePageNext;

function quickMoveCell(value) {
  return '<span style="display:block;text-align:center;">' + quickMoveEscape(value) + '</span>';
}

function quickMoveLink(label, type, idx, detailType) {
  if (idx === null || idx === undefined || idx === "") {
    return quickMoveCell(label);
  }

  const safeDetailType = detailType === null || detailType === undefined ? "" : quickMoveEscape(detailType);
  return '<a href="javascript:void(0);" class="btn-link" style="display:block;text-align:center;" onclick="quickMoveOpen(\'' + type + '\', \'' + quickMoveEscape(idx) + '\', \'' + safeDetailType + '\')">' + quickMoveEscape(label) + '</a>';
}

function quickMoveColumnLayout() {
  const renderer = { type: "TemplateRenderer" };

  return [
    {
      headerText: "\ub80c\ud0c8\ucc44\uad8c\ubc88\ud638",
      dataField: "M_NUM",
      width: 145,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink(value, "bonds", item.M_IDX);
      }
    },
    {
      headerText: "\uad6c\ubd84",
      dataField: "QUICK_MOVE_TYPE",
      width: 90,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value) {
        return quickMoveCell(value);
      }
    },
    {
      headerText: "\uacc4\uc57d\uace0\uac1d",
      dataField: "M_CT_NAME",
      width: 130,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value) {
        return quickMoveCell(value);
      }
    },
    {
      headerText: "\uacc4\uc57d\uba85",
      dataField: "CON_TITLE",
      width: 230,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink(value, "contract", item.CON_IDX, item.CONTRACT_DETAIL_TYPE || "direct");
      }
    },
    {
      headerText: "\uacac\uc801\ubc88\ud638",
      dataField: "EST_CODE",
      width: 145,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink(value, "estimate", item.EST_IDX, item.EST_DETAIL_TYPE || "headOffice");
      }
    },
    {
      headerText: "\uacac\uc801\uba85",
      dataField: "EST_TITLE",
      width: 230,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink(value, "estimate", item.EST_IDX, item.EST_DETAIL_TYPE || "headOffice");
      }
    },
    {
      headerText: "\uc218\ub0a9\uc2a4\ucf00\uc904\ub7ec",
      dataField: "PAYMENT_LINK",
      width: 130,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink("\uc5f4\uae30", "payment", item.M_IDX);
      }
    },
    {
      headerText: "\ud68c\uacc4\uc2a4\ucf00\uc904\ub7ec",
      dataField: "ACCOUNTING_LINK",
      width: 130,
      renderer,
      labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
        return quickMoveLink("\uc5f4\uae30", "accounting", item.M_IDX);
      }
    }
  ];
}

function quickMoveEnsureGrid() {
  if (!window.AUIGrid) return null;
  if (quickMoveState.gridId && (!AUIGrid.isCreated || AUIGrid.isCreated(quickMoveState.gridId))) {
    return quickMoveState.gridId;
  }

  quickMoveState.gridId = AUIGrid.create("#quickMoveResultGrid", quickMoveColumnLayout(), {
    showRowNumColumn: true,
    showRowCheckColumn: false,
    selectionMode: "singleRow",
    hoverMode: "singleRow",
    usePaging: true,
    pageRowCount: 10,
    enableFilter: true,
    enableSorting: true,
    enableMovingColumn: true,
    softRemoveRowMode: false,
    headerHeight: 38,
    rowHeight: 40,
    height: "100%"
  });

  return quickMoveState.gridId;
}

function renderQuickMoveResult(list) {
  const rows = Array.isArray(list) ? list : [];
  const summary = document.getElementById("quickMoveSummary");
  const grid = quickMoveEnsureGrid();

  if (summary) {
    summary.textContent = "\uac80\uc0c9 \uacb0\uacfc " + rows.length + "\uac74";
  }

  if (!grid) {
    alert("AUIGrid\ub97c \ub85c\ub4dc\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
    return;
  }

  AUIGrid.setGridData(grid, rows);
  setTimeout(function() {
    AUIGrid.resize(grid);
  }, 50);
}

async function quickSearch() {
  const form = document.querySelector(".fast-move #quickSearchForm");
  if (!form) return false;

  const quickValue = (form.querySelector('[name="quick_value"]')?.value || "").trim();
  if (!quickValue) {
    alert("\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.");
    return false;
  }

  const response = await fetch("/orders/quickMoveSearch.ajax", {
    method: "POST",
    body: new URLSearchParams(new FormData(form))
  });
  const json = await response.json();

  openModal("quickMoveModal");
  renderQuickMoveResult(json?.data?.list || []);
  return false;
}

function quickMovePagePrev() {
  return false;
}

function quickMovePageNext() {
  return false;
}

window.quickSearch = quickSearch;
window.quickMoveOpen = quickMoveOpen;
window.quickMovePagePrev = quickMovePagePrev;
window.quickMovePageNext = quickMovePageNext;

document.addEventListener("submit", (event) => {
  if (!event.target.matches(".fast-move #quickSearchForm")) return;

  event.preventDefault();
  quickSearch();
});

document.addEventListener("keypress", (event) => {
  if (!event.target.closest(".fast-move #quickSearchForm")) return;
  if (event.key !== "Enter") return;

  event.preventDefault();
  quickSearch();
});

// Sidebar footer 빠른이동 toggle
document.addEventListener("DOMContentLoaded", () => {
  const fastMoveBtn = document.querySelector(".fast-move_button");
  const fastMoveContent = document.querySelector(".fast-move_content");
  const icon = document.querySelector(".fast-move_button .icon-chevron");

  if (!fastMoveBtn || !fastMoveContent) return;

  fastMoveBtn.addEventListener("click", () => {
    const isOpen = fastMoveContent.classList.toggle("is-open");
    if (icon) {
      icon.classList.toggle("is-rotated", isOpen);
    }
  });
});

/**  ari-datepicker */
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 768;
  const today = new Date();
  const commonOptions = {
    isMobile,
    autoClose: true,

    position({ $datepicker, $target, $pointer, isViewChange, done }) {
      const popper = window.Popper.createPopper($target, $datepicker, {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: [
                'top-start',
                'bottom-end',
                'top-end'
              ]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 8
            }
          },
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'arrow',
            options: {
              element: $pointer
            }
          },
          {
            name: 'computeStyles',
            options: {
              gpuAcceleration: false
            }
          }
        ]
      });

      return () => {
        popper.destroy();
        done();
      };
    }
  };
        /*data-date="-30"
         data-min-date="-365"
         data-max-date="30"*/
    /* 기본 날짜 선택 */
    document.querySelectorAll(".datepicker-basic-dash").forEach((el) => {
        const nowDay = getNowDay();
        const initDate  = el.dataset.date ? Number(el.dataset.date) : null;
        const minDay   = el.dataset.minDate ? Number(el.dataset.minDate) : null;
        const maxDay   = el.dataset.maxDate ? Number(el.dataset.maxDate) : null;

        const options = {
          ...commonOptions,
          dateFormat: "yyyy-MM-dd",
        };

        if (calcDate(nowDay, initDate)) options.selectedDates = calcDate(nowDay, initDate);
        if (calcDate(nowDay, minDay)) options.minDate = calcDate(nowDay, minDay);
        if (calcDate(nowDay, maxDay)) options.maxDate = calcDate(nowDay, maxDay);


      new AirDatepicker(el, options);
    });

  /* 기본 날짜 선택 */
  document.querySelectorAll(".datepicker-basic").forEach((el) => {
    el.datepicker = new AirDatepicker(el, {
      ...commonOptions,
      dateFormat: "yyyy.MM.dd",
      firstDay: 0,
    });
  });

  document.querySelectorAll(".datepicker-today").forEach((el) => {
    new AirDatepicker(el, {
      ...commonOptions,
      minDate: today,
      dateFormat: "yyyy.MM.dd",
      firstDay: 0,
    });
  });

  /* 월 선택 전용 */
  document.querySelectorAll(".datepicker-month").forEach((el) => {
    new AirDatepicker(el, {
      ...commonOptions,
      view: "months",
      minView: "months",
      dateFormat: "MM",
    });
  });

  /* 년/월 선택 전용 */
  document.querySelectorAll(".datepicker-yearMonth").forEach((el) => {
    new AirDatepicker(el, {
      ...commonOptions,
      view: "months",
      minView: "months",
      dateFormat: "yyyy.MM",
    });
  });


  // 기간 계산 함수 (기본 범위 적용시 사용)
  function getRangeDates(range) {
    const end = new Date();
    const start = new Date();

    const value = parseInt(range);
    const unit = range.replace(value, '');

    if (unit === 'd') {
      start.setDate(end.getDate() - value);
    }
    if (unit === 'm') {
      start.setMonth(end.getMonth() - value);
    }
    if (unit === 'y') {
      start.setFullYear(end.getFullYear() - value);
    }

    return [start, end];
  }

  /* 기간 선택 (단일 input) */
  /**
   * 기본값으로 범위 지정이 필요할때 data-range로 표기
   * 예 : data-range="1m" 최근 1개월,
   * data-range="7d" 최근 7일,
   * data-range="1y" 최근 1년 **/
  document.querySelectorAll(".datepicker-range").forEach((el) => {
    const range = el.dataset.range;
    let selectedDates = [];

    if (range) {
      selectedDates = getRangeDates(range);
    }

    new AirDatepicker(el, {
      ...commonOptions,
      toggleSelected: false,
      range: true,
      dateFormat: "yyyy.MM.dd",
      multipleDatesSeparator: " ~ ",
      firstDay: 0,
      selectedDates
    });
  });

  /* 시작, 종료 기간 선택 */
  document.querySelectorAll(".datepicker-range-wrapper").forEach((wrapper) => {
    const [startInput, endInput] =
      wrapper.querySelectorAll(".datepicker-range2");
    if (!startInput || !endInput) return;

    let dpStart, dpEnd;

    dpStart = new AirDatepicker(startInput, {
      ...commonOptions,
      minDate: today,
      dateFormat: "yy.MM.dd",
      onSelect({ date }) {
        dpEnd.update({ minDate: date || today });
      },
    });

    dpEnd = new AirDatepicker(endInput, {
      ...commonOptions,
      minDate: today,
      dateFormat: "yy.MM.dd",
      onSelect({ date }) {
        dpStart.update({ maxDate: date || null });
      },
    });
  });

        /*data-from-date="-30"
         data-to-date="0"
         data-min-date="-365"
         data-max-date="30"*/
  document.querySelectorAll(".datepicker-range-custom").forEach((input) => {
    const nowDay = getNowDay();
    const fromDay  = input.dataset.fromDate ? Number(input.dataset.fromDate) : null;
    const toDay    = input.dataset.toDate   ? Number(input.dataset.toDate)   : null;
    const minDay   = input.dataset.minDate ? Number(input.dataset.minDate) : null;
    const maxDay   = input.dataset.maxDate ? Number(input.dataset.maxDate) : null;

    const options = {
      ...commonOptions,
      toggleSelected: false,
      range: true,
      dateFormat: "yyyy-MM-dd",
      multipleDatesSeparator: " ~ ",
    };

    if (calcDate(nowDay, minDay)) options.minDate = calcDate(nowDay, minDay);
    if (calcDate(nowDay, maxDay)) options.maxDate = calcDate(nowDay, maxDay);
    if (calcDate(nowDay, fromDay) && calcDate(nowDay, toDay)) options.selectedDates = [calcDate(nowDay, fromDay), calcDate(nowDay, toDay)];
    new AirDatepicker(input, options);
  });

document.querySelectorAll(".datepicker-basic-dash-tax").forEach((el) => {
  const nowDay = getNowDay();
  const initDate  = el.dataset.date ? Number(el.dataset.date) : null;
  const dsMinDay  = el.dataset.minDate ? Number(el.dataset.minDate) : null;
  const dsMaxDay  = el.dataset.maxDate ? Number(el.dataset.maxDate) : null;

  // 오늘 기준 계산값
  const computed = computeMinMaxOffsetByToday(nowDay);
  const minDay = (dsMinDay !== null) ? dsMinDay : computed.minOffset;
  const maxDay = (dsMaxDay !== null) ? dsMaxDay : computed.maxOffset;

  const options = {
    ...commonOptions,
    dateFormat: "yyyy-MM-dd",
  };

  if (calcDate(nowDay, initDate)) options.selectedDates = calcDate(nowDay, initDate);
  if (calcDate(nowDay, minDay)) options.minDate = calcDate(nowDay, minDay);
  if (calcDate(nowDay, maxDay)) options.maxDate = calcDate(nowDay, maxDay);

  new AirDatepicker(el, options);
});


  document.querySelectorAll(".datepicker-basic-dash-install").forEach((el) => {
    const nowDay = getNowDay();
    const initDate  = el.dataset.date ? Number(el.dataset.date) : null;
    const dsMinDay  = el.dataset.minDate ? Number(el.dataset.minDate) : null;

    // 오늘 기준 계산값
    const computed = computeMinOffsetByToday(nowDay);
    const minDay = (dsMinDay !== null) ? dsMinDay : computed.minOffset;

    const options = {
      ...commonOptions,
      dateFormat: "yyyy-MM-dd",
    };

    if (calcDate(nowDay, initDate)) options.selectedDates = calcDate(nowDay, initDate);
    if (calcDate(nowDay, minDay)) options.minDate = calcDate(nowDay, minDay);

    new AirDatepicker(el, options);
  });

  document.querySelectorAll(".datepicker-basic-dash-install-inside").forEach((el) => {
    const nowDay = getNowDay();
    const initDate  = el.dataset.date ? Number(el.dataset.date) : null;
    const dsMinDay  = el.dataset.minDate ? Number(el.dataset.minDate) : null;

    // 오늘 기준 계산값
    const computed = computeMinOffsetInsideByToday(nowDay);
    const minDay = (dsMinDay !== null) ? dsMinDay : computed.minOffset;

    const options = {
      ...commonOptions,
      dateFormat: "yyyy-MM-dd",
    };

    if (calcDate(nowDay, initDate)) options.selectedDates = calcDate(nowDay, initDate);
    if (calcDate(nowDay, minDay)) options.minDate = calcDate(nowDay, minDay);

    new AirDatepicker(el, options);
  });

});
// 오늘 기준으로 min/max offset 계산 (요구: 1~5일이면 전달1일~이번달말, 6일 이상이면 이번달1일~이번달말)
function computeMinMaxOffsetByToday(baseDate = new Date()) {
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  function monthStart(year, month) { return new Date(year, month, 1); }
  function monthEnd(year, month) { return new Date(year, month + 1, 0); }

  let minDateObj, maxDateObj;
  if (d <= 5) {
    minDateObj = monthStart(y, m - 1); // 전달 1일
    maxDateObj = monthEnd(y, m);       // 이번달 말일
  } else {
    minDateObj = monthStart(y, m);     // 이번달 1일
    maxDateObj = monthEnd(y, m);       // 이번달 말일
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const minOffset = Math.round((minDateObj.getTime() - today.getTime()) / msPerDay);
  const maxOffset = Math.round((maxDateObj.getTime() - today.getTime()) / msPerDay);

  return { minOffset, maxOffset, minDateObj, maxDateObj };
}



// 오늘 기준으로 min offset 계산 (요구: 1~5일이면 전달1일~, 6일 이상이면 이번달1일~)
function computeMinOffsetByToday(baseDate = new Date()) {
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  function monthStart(year, month) { return new Date(year, month, 1); }

  let minDateObj;
  if (d <= 5) {
    minDateObj = monthStart(y, m - 1); // 전달 1일
  } else {
    minDateObj = monthStart(y, m);     // 이번달 1일
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const minOffset = Math.round((minDateObj.getTime() - today.getTime()) / msPerDay);

  return { minOffset, minDateObj };
}

// 오늘 기준으로 min offset 계산 (요구: 1~10일이면 전달1일~, 11일 이상이면 이번달1일~)
function computeMinOffsetInsideByToday(baseDate = new Date()) {
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  function monthStart(year, month) { return new Date(year, month, 1); }

  let minDateObj;
  if (d <= 10) {
    minDateObj = monthStart(y, m - 1); // 전달 1일
  } else {
    minDateObj = monthStart(y, m);     // 이번달 1일
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const minOffset = Math.round((minDateObj.getTime() - today.getTime()) / msPerDay);

  return { minOffset, minDateObj };
}




function getNowDay() {
  return new Date();
}
const calcDate = (base, offset) => {
      if(offset==null){
        return null;
      }
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      return d;
    };

/** Modal */
let openModalCount = 0;

// 그리드 있는 Modal 열기 함수
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (!modal.classList.contains("is-open")) {
    modal.classList.add("is-open");
    openModalCount++;
  }

  if (openModalCount === 1) {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    var ci = document.querySelector('.content-inner');
    if (ci) ci.style.overflow = "hidden";
  }
  // 렌더 이후 실행
  requestAnimationFrame(() => {
    resizeGridAll();
  });

  document.dispatchEvent(new CustomEvent('modalOpened', { detail: { modalId: modalId } }));
}

//그리드 없는 모달 열기
function openModalNoResize(modalId, el) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (!modal.classList.contains("is-open")) {
    modal.classList.add("is-open");
    openModalCount++;
  }

  // MF_IDX 전달된 경우 모달에 저장
  if (el && el.dataset && el.dataset.idx) {
    const Idx = Number(el.dataset.idx);
    if (Number.isInteger(idx)) {
      modal.dataset.idx = idx;   // 모달에 보관
    }
  }

  if (openModalCount === 1) {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    var ci = document.querySelector('.content-inner');
    if (ci) ci.style.overflow = "hidden";
  }

  document.dispatchEvent(new CustomEvent('modalOpened', { detail: { modalId: modalId } }));
}

// Modal 닫기 함수
function closeModal(target) {
  const modal =
    typeof target === "string"
      ? document.getElementById(target)
      : target;

  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  openModalCount--;

  if (openModalCount <= 0) {
    openModalCount = 0;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    var ci = document.querySelector('.content-inner');
    if (ci) ci.style.overflow = "";
  }
}


// modal overlay 클릭 닫기 (mousedown이 overlay에서 시작된 경우에만)
document.querySelectorAll(".modal").forEach((modal) => {
  let mouseDownOnOverlay = false;
  modal.addEventListener("mousedown", function (e) {
    mouseDownOnOverlay = (e.target === this);
  });
  modal.addEventListener("click", function (e) {
    if (e.target === this && mouseDownOnOverlay) {
      closeModal(this);
    }
    mouseDownOnOverlay = false;
  });
});

// modal 닫기 버튼 modal 종료
document.addEventListener("click", function (e) {
  const closeBtn = e.target.closest(".modal-close");
  if (!closeBtn) return;

  const modal = closeBtn.closest(".modal");
  if (!modal) return;
  closeModal(modal);
});

/** tom-select */
document.querySelectorAll(".tom-select").forEach((el) => {
  new TomSelect(el, {
    create: true,
    plugins: el.multiple ? ["remove_button"] : [],
    sortField: {
      field: "text",
      direction: "asc", //오름차순
    },
    dropdownParent: 'body',
  });
});

/** Tab */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      if (!tabId) return;

      const tabsWrap = tab.closest(".tabs");
      const contentsWrap = document.querySelector(
        tabsWrap.dataset.target
      );

      if (!contentsWrap?.classList.contains("tab-contents")) return;

      const tabs = tabsWrap.querySelectorAll(".tab-item");
      const contents = contentsWrap.querySelectorAll(".tab-content");
      const targetContent = contentsWrap.querySelector(`#${tabId}`);

      // 초기화
      tabs.forEach((t) => t.classList.remove("is-active"));
      contents.forEach((c) => c.classList.remove("is-active"));

      // 활성화
      tab.classList.add("is-active");
      if (targetContent) {
        targetContent.classList.add("is-active");
      }
    });
  });
});

/** Card Collapse */
document.addEventListener("click", (e) => {
  const collapseBtn = e.target.closest('[data-action="collapse"]');
  if (!collapseBtn) return;

  let parent = collapseBtn.parentElement;

  while (parent) {
    const content = parent.querySelector(".collapse-content");
    if (content) {
      const isOpen = content.classList.toggle("is-open");
      collapseBtn.classList.toggle("is-rotated", !isOpen);
      break;
    }
    parent = parent.parentElement;
  }
});

/** table group toggle */
document.addEventListener("click", function (e) {
  const toggleBtn = e.target.closest(".t-group-toggle");
  if (!toggleBtn) return;

  const headerRow = toggleBtn.closest(".t-group-header");
  const groupId = headerRow.dataset.groupId;
  const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

  // 상태 토글
  toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
  headerRow.classList.toggle("is-collapsed", isExpanded);

  // 아이템 행 토글
  document.querySelectorAll(
    `.t-group-item[data-group-id="${groupId}"]`
  ).forEach(row => {
    row.classList.toggle("is-hidden", isExpanded);
  });
});
