/*
 * ----------------------------------------------------------
 * 전역 fetch 401 핸들러
 *   - 세션 만료 / 미인증 응답(401) 을 감지하면 "/" 로 이동
 *   - 로그인 API(/api/auth/*) 의 401 은 로그인 실패 메시지 처리를 위해 제외
 * ----------------------------------------------------------
 */
(function () {
  if (window.__fetch401HandlerInstalled) return;
  window.__fetch401HandlerInstalled = true;

  const origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    return origFetch(input, init).then(function (response) {
      if (response && response.status === 401) {
        const url = typeof input === "string" ? input : (input && input.url) || "";
        const isAuthEndpoint = url.indexOf("/api/auth/") !== -1;
        if (!isAuthEndpoint) {
          window.location.href = "/";
          return new Promise(function () { /* never resolve → 후속 .then 미실행 */ });
        }
      }
      return response;
    });
  };
})();


/*
 * baseNoticePopup
 * 공통 알림/확인(alert, confirm) 레이어 팝업
 *
 * alert / confirm UI를 생성하는 공통 함수
 * ----------------------------------------------------------
 * type           : alert | confirm (default : "alert")
 * title          : 팝업 타이틀
 * text           : 팝업 메시지
 * okBtn          : 확인 버튼 텍스트 (default : "확인")
 * cancelBtn      : 취소 버튼 텍스트 (default : "취소")
 * focusReturnEl  : 포커스 복귀 대상 DOM 요소
 * onConfirm      : 확인 버튼 콜백
 * onCancel       : 취소 버튼 콜백
 * ----------------------------------------------------------
 */
function baseNoticePopup({
  type = "alert",
  title = "",
  text = "",
  okBtn,
  cancelBtn,
  focusReturnEl = null,
  onConfirm = () => {},
  onCancel = () => {}
}) {

  // 기본값 처리
  okBtn = okBtn || "확인";
  cancelBtn = cancelBtn || "취소";

  // 기존 팝업 제거
  const existingPopup = document.querySelector(".popup-alert");
  if (existingPopup) existingPopup.remove();

  const footerButtons = type === "confirm"
    ? `
      <button type="button" class="btn line alert-cancel">${cancelBtn}</button>
      <button type="button" class="btn dark alert-confirm">${okBtn}</button>
    `
    : `
      <button type="button" class="btn dark alert-confirm">${okBtn}</button>
    `;

  const popupHtml = `
    <div role="${type === "alert" ? "alertdialog" : "dialog"}" class="popup-alert show">
      <div class="popup-dim"></div>
      <div class="alert-cont">
        ${title ? `<p class="alert-title">${title}</p>` : ""}
        <p class="alert-text">${text}</p>
        <div class="alert-footer">
          ${footerButtons}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupHtml);
  document.body.classList.add("scroll-fix");

  const popupAlert = document.querySelector(".popup-alert");

  // 포커스 복귀
  const returnFocus = () => {
    if (focusReturnEl && typeof focusReturnEl.focus === "function") {
      focusReturnEl.focus();
    }
  };

  // 팝업 닫기
  const closePopup = () => {
    popupAlert.remove();
    const remainPopups = document.querySelectorAll(".popup-wrap.show, .popup-alert.show");
    if (remainPopups.length === 0) {
      document.body.classList.remove("scroll-fix");
    }
    returnFocus();
  };

  // 확인 버튼
  popupAlert.querySelector(".alert-confirm").addEventListener("click", () => {
    onConfirm();
    closePopup();
  });

  // 취소 버튼
  const cancelBtnEl = popupAlert.querySelector(".alert-cancel");
  if (cancelBtnEl) {
    cancelBtnEl.addEventListener("click", () => {
      onCancel();
      closePopup();
    });
  }

  // dim 클릭 닫기 (alert일 때만)
  if (type === "alert") {
    popupAlert.querySelector(".popup-dim").addEventListener("click", () => {
      closePopup();
    });
  }

  // 최초 포커스
  popupAlert.querySelector("button")?.focus();
}


/*
 * alertPopup
 * 시스템 alert 대체 레이어 팝업
 * ----------------------------------------------------------
 * [파라미터]
 * message   : 메시지 (default : "")
 * title     : 타이틀
 * okBtn     : 확인 버튼 텍스트 (default : "확인")
 * endFocus  : selector
 * callBack  : 확인 클릭 콜백
 * ----------------------------------------------------------
 * alertPopup(message)
 * alertPopup(message, callBack)
 * alertPopup(message, endFocus, callBack)
 * alertPopup(message, okBtn, endFocus, callBack)
 * alertPopup(title, message, endFocus, callBack)
 * alertPopup(title, message, okBtn, endFocus, callBack)
 * ----------------------------------------------------------
 */

function alertPopup(...args) {
  let title = "";
  let text = "";
  let okBtn;
  let focusReturnEl = null;
  let onConfirm = () => {};

  if (args.length === 1) {
    text = args[0];

  } else if (args.length === 2) {
    text = args[0];
    onConfirm = args[1];

  } else if (args.length === 3) {
    text = args[0];
    focusReturnEl = document.querySelector(args[1]);
    onConfirm = args[2];

  } else if (args.length === 4) {
    if (typeof args[1] === "string" && args[1].startsWith("#")) {
      text = args[0];
      okBtn = args[1];
      focusReturnEl = document.querySelector(args[2]);
      onConfirm = args[3];
    } else {
      title = args[0];
      text = args[1];
      focusReturnEl = document.querySelector(args[2]);
      onConfirm = args[3];
    }

  } else if (args.length === 5) {
    title = args[0];
    text = args[1];
    okBtn = args[2];
    focusReturnEl = document.querySelector(args[3]);
    onConfirm = args[4];

  } else {
    console.error("alertPopup error 잘못된 param 입니다.");
    return;
  }

  baseNoticePopup({
    type: "alert",
    title,
    text,
    okBtn,
    focusReturnEl,
    onConfirm
  });
}


/*
 * confirmPopup
 * 시스템 confirm 대체 레이어 팝업
 * ----------------------------------------------------------
 * [파라미터]
 * message   : 메시지 (default : "")
 * title     : 타이틀
 * okBtn     : 확인 버튼 텍스트 (default : "확인")
 * cancelBtn : 취소 버튼 텍스트 (default : "취소")
 * endFocus  : selector
 * callBack  : 버튼 클릭 콜백
 * ----------------------------------------------------------
 * confirmPopup(message, callBack)
 * confirmPopup(message, endFocus, callBack)
 * confirmPopup(title, message, endFocus, callBack)
 * confirmPopup(title, message, okBtn, cancelBtn, endFocus, callBack)
 * ----------------------------------------------------------
 * 예)
  confirmPopup("title", "message", "확인 텍스트", "취소 텍스트", "#btnConfirm", (rFlag) => {
    if (rFlag) {
      console.log('확인', rFlag)
    } else {
      console.log('취소', rFlag)
    }
  })

 * var testFn = function(rFlag) { console.log("rFalg", rFlag)};
 * var opt = {
 *    title     : "title"
 *   ,message   : "msg"
 *   ,okBtn     : "확인 텍스트"
 *   ,cancelBtn : "취소 테스트"
 *   ,endFocus  : "#btnConfirm"
 *   ,callBack  : testFn
 *  };
 *
 * confirmPopup(opt);
 * ----------------------------------------------------------
 */
function confirmPopup(...args) {

  if (args.length === 1 && typeof args[0] === "object") {
    const opt = args[0];

    baseNoticePopup({
      type: "confirm",
      title: opt.title || "",
      text: opt.message || "",
      okBtn: opt.okBtn,
      cancelBtn: opt.cancelBtn,
      focusReturnEl: opt.endFocus ? document.querySelector(opt.endFocus) : null,
      onConfirm: () => opt.callBack && opt.callBack(true),
      onCancel: () => opt.callBack && opt.callBack(false)
    });

    return;
  }

  let title = "";
  let text = "";
  let okBtn;
  let cancelBtn;
  let focusReturnEl = null;
  let callback;

  if (args.length === 2) {
    text = args[0];
    callback = args[1];

  } else if (args.length === 3) {
    text = args[0];
    focusReturnEl = document.querySelector(args[1]);
    callback = args[2];

  } else if (args.length === 4) {
    title = args[0];
    text = args[1];
    focusReturnEl = document.querySelector(args[2]);
    callback = args[3];

  } else if (args.length === 6) {
    title = args[0];
    text = args[1];
    okBtn = args[2];
    cancelBtn = args[3];
    focusReturnEl = document.querySelector(args[4]);
    callback = args[5];

  } else {
    console.error("confirmPopup error 잘못된 param 입니다.");
    return;
  }

  baseNoticePopup({
    type: "confirm",
    title,
    text,
    okBtn,
    cancelBtn,
    focusReturnEl,
    onConfirm: () => callback && callback(true),
    onCancel: () => callback && callback(false)
  });
}