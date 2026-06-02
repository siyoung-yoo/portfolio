// --------------------
// init
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  initBtnToggle();
  initMenuActions();
  initNotifActions();
  initFormText();
  initDatePicker();
  initTabs();
  initSelectBox();
  initPopupClose();
  initPagination();
});


// --------------------
// toggle 초기화
// --------------------
let isBtnToggleInitialized = false;
function initBtnToggle() {
  if (isBtnToggleInitialized) return;
  isBtnToggleInitialized = true;

  const btnToggles = document.querySelectorAll(".btn-toggle");
  btnToggles.forEach(btn => {
    const targetEl = btn.getAttribute("aria-controls");
    const target = document.querySelector(targetEl);
    if (!target) return;

    // sr-only 없으면 생성
    let srOnly = btn.querySelector(".sr-only");
    if (!srOnly) {
      srOnly = document.createElement("span");
      srOnly.className = "sr-only";
      btn.appendChild(srOnly);
    }

    const isExpanded = btn.classList.contains("is-expanded");

    btn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    target.classList.toggle("is-expanded", isExpanded);
    srOnly.textContent = isExpanded ? "닫기" : "열기";
  });

  // 토글 단독 동작
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-toggle");
    if (!btn) return;

    const isExpanded = btn.classList.contains("is-expanded");
    isExpanded ? closeToggle(btn) : openToggle(btn);
  })
}

// --------------------
// toggle 공통 함수
// --------------------
function openToggle(btn) {
  const targetEl = btn.getAttribute("aria-controls");
  const target = document.querySelector(targetEl);
  if (!target) return;

  btn.classList.add("is-expanded");
  btn.setAttribute("aria-expanded", "true");
  target.classList.add("is-expanded");

  const srOnly = btn.querySelector(".sr-only");
  if (srOnly) srOnly.textContent = "닫기";
}

function closeToggle(btn) {
  const targetEl = btn.getAttribute("aria-controls");
  const target = document.querySelector(targetEl);
  if (!target) return;

  btn.classList.remove("is-expanded");
  btn.setAttribute("aria-expanded", "false");
  target.classList.remove("is-expanded");

  const srOnly = btn.querySelector(".sr-only");
  if (srOnly) srOnly.textContent = "열기";
}


// --------------------
// sideNavi 메뉴 동작
// --------------------
function initMenuActions() {
  const sideNavi = document.querySelector("#sideNavi");
  if (!sideNavi) return;

  const links = document.querySelectorAll("#sideNavi .menu-list-wrap .menu-link");
  const expandedToggles = () => document.querySelectorAll("#sideNavi .btn-toggle.is-expanded");

  links.forEach(link => {
    link.addEventListener("click", function() {

      // 전체 active 제거
      links.forEach(l => l.classList.remove("is-active"));
      const isToggle = this.hasAttribute("aria-controls");
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      // 토글 메뉴
      if (isToggle) {
        if (!isExpanded) {
          this.classList.add("is-active");
          expandedToggles().forEach(closeToggle);
        } else {
          this.classList.remove("is-active");
        }
        return;
      }

      // 일반 메뉴
      this.classList.add("is-active");

      const parentUl = this.closest("ul");
      const isSubMenu = parentUl?.classList.contains("sub-menu");

      if (isSubMenu) {
        const parentLink = parentUl.previousElementSibling;
        parentLink?.classList.add("is-active");
      } else {
        expandedToggles().forEach(closeToggle);
      }
    });
  });
}

// --------------------
// sideNavi 메뉴 > 알림 영역 동작
// --------------------
function initNotifActions() {
  const btnNotif = document.querySelector("#btnNotif");
  const notifWrap = document.querySelector(".notif-wrap");

  if (!btnNotif || !notifWrap) return;

  btnNotif.addEventListener("click", () => {
    const isActive = notifWrap.classList.toggle("is-active");
    btnNotif.classList.toggle("is-active", isActive);

    // 스크롤 초기화
    if (isActive) {
      const list = notifWrap.querySelector(".notif-list");
      if (list) list.scrollTop = 0;
    }
  });

  document.addEventListener("click", (e) => {
    const isInside = btnNotif.contains(e.target) || notifWrap.contains(e.target);

    if (!isInside) {
      notifWrap.classList.remove("is-active");
      btnNotif.classList.remove("is-active");
    }
  });
}

// --------------------
// textfield 입력 상태 제어
// --------------------
let isFormTextInitialized = false;
function initFormText() {
  if (isFormTextInitialized) return;
  isFormTextInitialized = true;

  const getFormBox = (el) => el.closest(".form-box");

  document.addEventListener("focusin", (e) => {
    const input = e.target.closest(".form-box input") || e.target.closest(".form-box textarea");
    if (!input) return;

    const formBox = getFormBox(input);
    if (!input.readOnly) formBox.classList.add("focus");
  });

  document.addEventListener("focusout", (e) => {
    const input = e.target.closest(".form-box input") || e.target.closest(".form-box textarea");
    if (!input) return;

    const formBox = getFormBox(input);
    formBox.classList.remove("focus");
  });

  document.addEventListener("input", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;

    const formBox = input.closest(".form-box");
    if (!formBox) return;

    // 숫자만 입력 처리
    const onlyNumberVal = input.value.replace(/\D/g, "");
    if (formBox.classList.contains("num-only")) {
      if (input.value !== onlyNumberVal) input.value = onlyNumberVal;
    };

    // error 제거
    if (formBox.classList.contains("error")) formBox.classList.remove("error");
  });

};


// --------------------
// datepicker setting
// --------------------
function initDatePicker() {
  // --- 포맷 헬퍼 ---
  function formatDate(value, isDeleting) {
    if (isDeleting) return value;
    const n = value.replace(/\D/g, "").slice(0, 8);
    if (n.length <= 4) return n;
    if (n.length <= 6) return `${n.slice(0, 4)}.${n.slice(4)}`;
    return `${n.slice(0, 4)}.${n.slice(4, 6)}.${n.slice(6)}`;
  }

  function getNumericCursorPos(value, cursorPos) {
    return value.slice(0, cursorPos).replace(/\D/g, "").length;
  }

  function restoreCursor(formatted, numericPos) {
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) count++;
      if (count === numericPos) {
        const pos = i + 1;
        return formatted[pos] === "." ? pos + 1 : pos;
      }
    }
    return formatted.length;
  }

  // --- 키보드 이벤트 핸들러 ---
  function handleKeydown(e, setDeleting) {
    const input = e.currentTarget;
    const { selectionStart: cursor, value } = input;

    if (e.key === "Backspace") {
      if (value[cursor - 1] === ".") {
        e.preventDefault();
        const newValue = value.slice(0, cursor - 2) + value.slice(cursor);
        input.value = newValue;
        input.setSelectionRange(cursor - 2, cursor - 2);
        return;
      }
      setDeleting(true);
    }

    if (e.key === "Delete") {
      if (value[cursor] === ".") {
        e.preventDefault();
        const newValue = value.slice(0, cursor) + value.slice(cursor + 2);
        input.value = newValue;
        input.setSelectionRange(cursor, cursor);
        return;
      }
      setDeleting(true);
    }

    if (e.key === "ArrowLeft" && value[cursor - 1] === ".") {
      e.preventDefault();
      input.setSelectionRange(cursor - 1, cursor - 1);
    }

    if (e.key === "ArrowRight" && value[cursor] === ".") {
      e.preventDefault();
      input.setSelectionRange(cursor + 1, cursor + 1);
    }
  }

  // --- 인풋 이벤트 핸들러 ---
  function handleInput(e, getDeleting, setDeleting) {
    const input = e.currentTarget;
    const numericPos = getNumericCursorPos(input.value, input.selectionStart);
    const formatted = formatDate(input.value, getDeleting());
    input.value = formatted;
    input.setSelectionRange(restoreCursor(formatted, numericPos), restoreCursor(formatted, numericPos));
    setDeleting(false);
  }

  // --- flatpickr 생성 ---
  function createDatePicker(el, options = {}) {
    return flatpickr(el, {
      dateFormat: "Y.m.d",
      allowInput: true,
      monthSelectorType: "static",
      ...options,

      onReady(_, __, instance) {
        instance.currentYearElement?.setAttribute("readonly", "readonly");

        const input = instance.input;
        let deleting = false;
        const getDeleting = () => deleting;
        const setDeleting = (v) => { deleting = v; };

        input.addEventListener("keydown", (e) => handleKeydown(e, setDeleting));
        input.addEventListener("input", (e) => handleInput(e, getDeleting, setDeleting));
      },

      onOpen(_, __, instance) {
        instance.input.closest(".form-box")?.classList.add("focus");
      },

      onClose(_, __, instance) {
        instance.input.closest(".form-box")?.classList.remove("focus");
      }
    });
  }

  // --- 단일 선택 ---
  document.querySelectorAll(".single-date").forEach(el => createDatePicker(el));

  // --- 범위 선택 ---
  document.querySelectorAll(".range-picker").forEach(range => {
    const startEl = range.querySelector(".start-date");
    const endEl = range.querySelector(".end-date");
    if (!startEl || !endEl) return;

    const endPicker = createDatePicker(endEl);

    createDatePicker(startEl, {
      onChange(selectedDates) {
        if (selectedDates.length > 0) {
          endPicker.set("minDate", selectedDates[0]);
          endPicker.open();
        }
      }
    });
  });
}


// --------------------
// tab
// --------------------
let isTabInitialized = false;
function initTabs() {
  if (isTabInitialized) return;
  isTabInitialized = true;

  // type-sliding > indicator 위치 업데이트
  const moveIndicator = (tab, animate = true) => {
    const tabList = tab.closest(".type-sliding");
    if (!tabList) return;

    const indicator = tabList.querySelector(".tab-indicator");
    if (!indicator) return;

    indicator.style.transition = animate
      ? "var(--transition-base)"
      : "none";

    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.left = `${tab.offsetLeft}px`;
  };

  // indicator 초기 위치 세팅 (transition 없음)
  document.querySelectorAll(".type-sliding .tab.is-active")
    .forEach(tab => {
      requestAnimationFrame(() => moveIndicator(tab, false));
    });

  document.addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;

    const tabList = tab.closest(".tab-list");
    if (!tabList) return;

    const tabTarget = tab.dataset.target;
    if (!tabTarget) return;

    // active 처리
    tabList.querySelectorAll(".tab.is-active").forEach(el => el.classList.remove("is-active"));
    tab.classList.add("is-active");
    moveIndicator(tab);

    // content 처리
    const targetEl = document.querySelector(tabTarget);
    if (!targetEl) return;

    const tabContents = targetEl.closest(".tab-contents");
    if (!tabContents) return;

    tabContents.querySelectorAll(":scope > .tab-cont.is-active")
      .forEach(el => el.classList.remove("is-active"));
    targetEl.classList.add("is-active");
  });
}


// --------------------
// selectbox (portal + scroll + flip)
// --------------------
let isSelectboxInitialized = false;
let activeDropdown = null;
let scrollParents = [];
function initSelectBox() {
  if (isSelectboxInitialized) return;
  isSelectboxInitialized = true;

  // default setting
  document.querySelectorAll(".select-box").forEach(selectBox => {
    const selectedBtn = selectBox.querySelector(".option-list button.selected");
    const currentBtnSelect = selectBox.querySelector(".btn-select");

    if (selectedBtn) {
      currentBtnSelect.innerHTML = selectedBtn.innerHTML;
      if (selectedBtn.dataset.value !== undefined) {
        currentBtnSelect.dataset.value = selectedBtn.dataset.value;
      }
    }
  });

  document.addEventListener("click", (e) => {
    const selectBox = e.target.closest(".select-box");
    const btnSelect = e.target.closest(".btn-select");
    const optionBtn = e.target.closest(".option-list button");

    // 외부 클릭 닫기
    if (!selectBox && !optionBtn) {
      closeSelectBox();
      return;
    }

    // 옵션 선택
    if (optionBtn && activeDropdown) {
      const { selectBox: currentSelect, dropdown } = activeDropdown;
      const currentBtnSelect = currentSelect.querySelector(".btn-select");

      currentBtnSelect.innerHTML = optionBtn.innerHTML;

      if (optionBtn.dataset.value !== undefined) {
        currentBtnSelect.dataset.value = optionBtn.dataset.value;
      }

      dropdown.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
      });

      optionBtn.classList.add("selected");
      currentSelect.classList.remove("error");

      closeSelectBox(currentSelect);
      currentBtnSelect.focus();
      return;
    }

    // 버튼 클릭
    if (btnSelect) {
      const currentSelect = btnSelect.closest(".select-box");

      if (!currentSelect.classList.contains("is-expanded")) {
        openSelectBox(currentSelect);
      } else {
        closeSelectBox(currentSelect);
      }
    }
  });
}

function openSelectBox(selectBox) {
  if (activeDropdown && activeDropdown.selectBox !== selectBox) {
    closeSelectBox(activeDropdown.selectBox);
  }

  const dropdown = selectBox.querySelector(".option-list");
  const button = selectBox.querySelector(".btn-select");

  document.body.appendChild(dropdown);
  dropdown.classList.add("is-expanded");
  dropdown.style.position = "fixed";

  updateDropdownPosition(button, dropdown);

  selectBox.classList.add("is-expanded");

  // scroll 부모 등록
  scrollParents = getScrollParents(button);
  scrollParents.forEach(parent => {
    parent.addEventListener("scroll", handleScroll, { passive: true });
  });

  window.addEventListener("resize", handleScroll);

  activeDropdown = { dropdown, selectBox, button };
}

function closeSelectBox(selectBox) {
  if (!selectBox) {
    if (activeDropdown) closeSelectBox(activeDropdown.selectBox);
    return;
  }

  if (!activeDropdown || activeDropdown.selectBox !== selectBox) return;

  const { dropdown } = activeDropdown;

  // 이벤트 제거
  scrollParents.forEach(parent => {
    parent.removeEventListener("scroll", handleScroll);
  });
  window.removeEventListener("resize", handleScroll);
  scrollParents = [];

  selectBox.appendChild(dropdown);

  dropdown.classList.remove("is-expanded");
  dropdown.style.position = "";
  dropdown.style.top = "";
  dropdown.style.left = "";
  dropdown.style.width = "";

  selectBox.classList.remove("is-expanded");

  activeDropdown = null;
}

function updateDropdownPosition(button, dropdown) {
  const rect = button.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // dropdown 높이 (렌더 후 계산)
  dropdown.style.visibility = "hidden";
  dropdown.style.display = "block";
  const dropdownHeight = dropdown.offsetHeight;
  dropdown.style.visibility = "";
  dropdown.style.display = "";

  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  let top;

  // 🔥 자동 반전
  if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
    // 위로 띄우기
    top = rect.top - dropdownHeight - 8;
    dropdown.dataset.direction = "up";
  } else {
    // 아래로
    top = rect.bottom + 8;
    dropdown.dataset.direction = "down";
  }

  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.width = `${rect.width}px`;
}

// scroll 대응
function handleScroll() {
  if (!activeDropdown) return;
  updateDropdownPosition(activeDropdown.button, activeDropdown.dropdown);
}

// scroll parent 찾기
function getScrollParents(el) {
  const parents = [];
  let parent = el.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY)) {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }

  parents.push(window);
  return parents;
}


// --------------------
// modal (id only / ESC / focus restore / scrollFix 조건)
// --------------------

let lastInteractionElement = null;
let lastTrigger = null;

document.addEventListener("click", (e) => {
  lastInteractionElement = e.target.closest("button, a, [role='button']");
});

document.addEventListener("focusin", (e) => {
  lastInteractionElement = e.target;
});

// --------------------
// modal close init
// --------------------
function initPopupClose() {
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".close-btn");
    const dim = e.target.classList.contains("popup-dim");

    if (!closeBtn && !dim) return;

    const popup = e.target.closest(".popup-wrap, .popup-alert");
    if (!popup || !popup.id) return;

    fnPopupClose(popup.id);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const openPopups = document.querySelectorAll(".popup-wrap.show, .popup-alert.show");
    if (openPopups.length === 0) return;

    const lastPopup = openPopups[openPopups.length - 1];
    if (!lastPopup.id) return;

    fnPopupClose(lastPopup.id);
  });
}

// --------------------
// modal open
// --------------------
function fnPopupOpen(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  const focusEle = popup.querySelectorAll(
    'a, button, [tabindex="0"], input, textarea, select'
  );

  lastTrigger = lastInteractionElement || document.activeElement;

  popup.classList.add("show");
  document.body.classList.add("scroll-fix");

  const body = popup.querySelector(".popup-body");
  if (body) setTimeout(function() { body.scrollTo(0, 0)}, 10)

  if (focusEle.length > 0) {
    focusEle[0].focus();
  } else {
    popup.setAttribute("tabindex", "-1");
    popup.focus();
  }
}

// modal close
// --------------------
function fnPopupClose(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  popup.classList.remove("show");

  const remainPopups = document.querySelectorAll(".popup-wrap.show, .popup-alert.show");
  if (remainPopups.length === 0) {
    document.body.classList.remove("scroll-fix");
  }

  if (lastTrigger && document.contains(lastTrigger)) {
    lastTrigger.focus();
  } else {
    document.body.focus();
  }

  lastTrigger = null;
}


// --------------------
// pagination
// --------------------
function initPagination() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.pagination button');
    if (!btn || btn.disabled) return;

    const pagination = btn.closest('.pagination');
    const currentPage = parseInt(pagination.dataset.currentPage) || 1;
    const totalPages  = parseInt(pagination.dataset.totalPages)  || 0;

    let newPage;
    if (btn.classList.contains('prev')) {
      newPage = currentPage - 1;
    } else if (btn.classList.contains('next')) {
      newPage = currentPage + 1;
    } else {
      newPage = parseInt(btn.textContent.trim());
    }

    if (!newPage || newPage === currentPage) return;
    if (totalPages > 0 && (newPage < 1 || newPage > totalPages)) return;

    pagination.dispatchEvent(new CustomEvent('pagination:change', {
      bubbles: true,
      detail: { page: newPage, prevPage: currentPage }
    }));
  });
}

// --------------------
// SearchState - 검색 조건 세션 저장소
// 사용: SearchState.save(key, params) / SearchState.load(key) / SearchState.clear(key)
// --------------------
const SearchState = (() => {
  const PREFIX = 'sch_';
  return {
    save(key, params) {
      try { sessionStorage.setItem(PREFIX + key, JSON.stringify(params)); } catch {}
    },
    load(key) {
      try { return JSON.parse(sessionStorage.getItem(PREFIX + key)) || {}; } catch { return {}; }
    },
    clear(key) {
      try { sessionStorage.removeItem(PREFIX + key); } catch {}
    }
  };
})();