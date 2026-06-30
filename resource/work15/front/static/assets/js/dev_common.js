/*
 * ----------------------------------------------------------
 * 전역 fetch 401 핸들러 — 세션 만료 시 "튕김 없이" 팝업 재로그인
 *   - 세션 만료/미인증(401) 감지 시 현재 화면을 두고 로그인 팝업('/?relogin=1')을 띄움
 *   - 팝업에서 로그인 성공 → opener(현재 화면) 새로고침 + 팝업 자동 종료
 *   - 로그인 API(/api/auth/*) 401 은 로그인 실패 메시지 처리를 위해 제외
 *   - 팝업 차단 시에는 기존 방식("/" 이동)으로 폴백
 * ----------------------------------------------------------
 */
(function () {
  if (window.__fetch401HandlerInstalled) return;
  window.__fetch401HandlerInstalled = true;

  var AUTH_PAGES = ["/", "/auth/verify", "/account/locked", "/account/password"];
  var reloginHandling = false;

  function isAuthPage() { return AUTH_PAGES.indexOf(location.pathname) !== -1; }
  function isSameOrigin(url) {
    try { return new URL(url, location.origin).origin === location.origin; }
    catch (e) { return true; } // 상대경로 → 동일 출처
  }

  function openReloginPopup() {
    if (reloginHandling) return;
    // 로그인/인증 화면이거나, 이미 팝업(자기 자신)이면 무시
    if (isAuthPage() || window.opener) return;
    reloginHandling = true;

    // 로그인 2단 레이아웃이 시원하게 보이도록 (화면의 80% x 92%, 상한 1280x960)
    var w = Math.min(1280, Math.round(window.screen.availWidth  * 0.8));
    var h = Math.min(960,  Math.round(window.screen.availHeight * 0.92));
    var left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    var top  = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    var pop = window.open("/?relogin=1", "oshReloginPopup",
      "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top + ",resizable=yes,scrollbars=yes");

    if (!pop) {           // 팝업 차단 → 기존 방식으로 폴백
      window.location.href = "/";
      return;
    }
    try { pop.focus(); } catch (e) {}
    // 사용자가 로그인 없이 팝업을 닫으면 다음 401 때 다시 띄울 수 있도록 플래그 해제
    var t = setInterval(function () {
      if (pop.closed) { clearInterval(t); reloginHandling = false; }
    }, 700);
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    return origFetch(input, init).then(function (response) {
      if (response && response.status === 401) {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        if (url.indexOf("/api/auth/") === -1 && isSameOrigin(url) && !isAuthPage() && !window.opener) {
          openReloginPopup();
          // 재로그인 성공 시 opener(현재 화면)가 reload 되므로 후속 .then 은 실행하지 않음
          return new Promise(function () {});
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
    focusReturnEl = typeof args[1] === "string" ? document.querySelector(args[1]) : null;
    onConfirm = args[2];

  } else if (args.length === 4) {
    text = args[0];
    okBtn = args[1];
    focusReturnEl = typeof args[2] === "string" ? document.querySelector(args[2]) : null;
    onConfirm = args[3];

  } else if (args.length === 5) {
    title = args[0];
    text = args[1];
    okBtn = args[2];
    focusReturnEl = typeof args[3] === "string" ? document.querySelector(args[3]) : null;
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
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
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
    focusReturnEl = typeof args[1] === "string" ? document.querySelector(args[1]) : null;
    callback = args[2];

  } else if (args.length === 4) {
    title = args[0];
    text = args[1];
    focusReturnEl = typeof args[2] === "string" ? document.querySelector(args[2]) : null;
    callback = args[3];

  } else if (args.length === 6) {
    title = args[0];
    text = args[1];
    okBtn = args[2];
    cancelBtn = args[3];
    focusReturnEl = typeof args[4] === "string" ? document.querySelector(args[4]) : null;
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