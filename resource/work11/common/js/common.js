var click = { x: 0, y: 0 };
var xyzObjs = [];
var currentAudio;
var mainCurrentAudio;
var teacher = false;
var currentLang = "kr";

let maxRange = {
  overWidth: 0,
  overHeight: 0,
  width: 0,
  height: 0,
};

function includeJs(path) {
  var js = document.createElement("script");
  js.type = "text/javascript";
  js.src = path;
  document.head.append(js);
}

function includeCSS(path) {
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.type = "text/css";
  css.href = path;
  document.head.append(css);
}

/**
 * 영상 2개인 페이지 data.js 동적으로 추가/삭제
 */
let currentScriptTag = $("#externalScript")[0];

function loadJsFile(scriptUrl) {
  if (currentScriptTag) {
    $(currentScriptTag).remove();
  }

  const scriptTag = $("<script></script>");
  scriptTag.attr("id", "externalScript");
  scriptTag.attr("src", scriptUrl);
  scriptTag.attr("type", "text/javascript");
  $("#wrapper").append(scriptTag);
  currentScriptTag = scriptTag[0];
}

// includeJs("../../common_contents/common/js/transfer_v2/axios.min.js");
// includeJs("../../common_contents/common/js/transfer_v2/transfer.js");
// includeJs("../../common_contents/common/js/transfer_v2/core.min.js");
// includeJs("../../common_contents/common/js/transfer_v2/sha256.min.js");

// 고객사 금칙어 스크립트
includeJs("https://cdn.smart-aidt.com/common/aidtBlockWordsV1.js");

includeJs("../../common_contents/common/js/receiver.js");
includeJs("../../common_contents/common/js/commonSender.js");

// 교사용 구분
var url = document.location.href.split("_t.html");
if (url.length > 1) teacher = true;

//리사이징
let scaleRatio = 1;
const resizer = (event) => {
  const width =
    window.innerWidth ||
    document.body.clientWidth ||
    document.documentElement.clientWidth;

  scaleRatio = width / 1715;

  $("main").css({
    transform: `scale(${scaleRatio})`,
    "transform-origin": "0 0",
  });
};

function wrapContents() {
  if ($("body").find("main").length) return;

  var bodyChildren = $("body").children();
  var mainTag = $("<main></main>");

  mainTag.append(bodyChildren);
  $("body").append(mainTag);
}

function audioEvent() {
  $(
    "button:not(.btn_sound, .control-btn.play, .control-btn.pause, .control-btn.stop, .control-bar button.play-pause, .control-bar button.stop, .control-bar button.volume, .media-wrapper .circle.play, .media-wrapper .circle.pause)"
  ).on("click touchstart", function () {
    const reBtn = $(this).hasClass("btn_return");
    let isBtnOff = $(this).hasClass("off");
    if (!reBtn) {
      if (isBtnOff) return;
      playAudio(adoClick);
    }
  });
}

function isIosChk() {
  var ua = navigator.userAgent;
  var isIos = /iP(ad|hone|od)/i.test(ua);
  var isMac = /Macintosh/i.test(ua) && navigator.maxTouchPoints === 0; // 진짜 맥
  var isIPadDesktopMode = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 0; // iPadOS 데스크탑 모드

  if (isIos || isMac) {
    $("input[type='text'], input[type='number'], textarea").addClass("isIos");
    isIosbool = true;
  } else {
    $("input[type='text'], input[type='number'], textarea").removeClass("isIos");
    isIosbool = false;
  }
}

var swiper;
var isDS;
var isIosbool;

$(document).ready(function () {
  // swiepr init
  const dataSwipe = $("#content").attr("data-swipe");
  isDS = dataSwipe ? true : false;
  if (isDS) {
    swiper = new Swiper(".mySwiper", {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      observer: true,
      observeParents: true,
      speed: 0,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      allowTouchMove: false,
    });
  }

  $(".swiper-button-next, .swiper-button-prev").on("click", function () {
    playAudio(adoClick);
  });

  audioEvent();
  wrapContents();
  searchContent();

  // 서술형 예시 버튼 클릭
  $(".btn_ex").on("click", function () {
    textareaExPop($(this));
  });

  characterOnOff(); // 캐릭터 클릭 시 말풍선 on/off
  stickerKeyDown(); // 콘텐츠 말풍선 on/off keydown 이벤트
  setQuizType();
  setImgPopup(); // 팝업 이미지 on/off
  setSlideEvent();
  setActivityPopup(); // 활동 버튼 팝업
  setDropDown();
  videoReset();
  setSTstate();
  defaultTextTransfer();
  isIosChk();

  let isInputComposing = false; // 현재 한글 조합 중인지 여부를 관리하는 플래그

  // 조합이 시작되었을 때
  $("input, textarea").on("compositionstart", function () {
    isInputComposing = true;
  });

  $("input[type='text'], input[type='number'], textarea").on(
    "compositionend",
    function () {
      isInputComposing = false;
      // 조합이 끝난 후에만 텍스트를 검사
    }
  );

  $("input[type='text'], input[type='number'], textarea").on(
    "propertychange change keyup input",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      // 금칙어 있으면 경고 메시지 표시
      if (!isInputComposing) {
        let filteredContent = isBlockWord(this.value);
        if (filteredContent) {
          console.log("금칙어 일반");
          $(this).val("");
          toastBadwordsMsg();
          return;
        }
      }
    }
  );

  $(".contentsBottomHidden").click(function () {
    if (++scriptClick >= 5) {
      scriptClick = 0;
      hiddenButtonEvnet();
    }
  });

  $(".pop_box .close_but").on("click", function () {
    $(".pop_box").hide();
  });


  let isKeyboard = false;

  // 키보드 입력 감지
  $(window).on('keydown', function (e) {
    if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      isKeyboard = true;
    }
  });

  // 마우스 클릭 or 터치 시 키보드 플래그 해제
  $(window).on('mousedown touchstart', function () {
    isKeyboard = false;
  });

  $('input[type="text"][data-fn="입력"], input[type="number"][data-fn="입력"], textarea[data-fn="입력"], button, input[type="checkbox"], input[type="radio"], input[type="checkbox"] + label, input[type="radio"] + label').on('focus', function () {
    if (isKeyboard) {
      $(this).addClass('focus-visible');
    }
  });

  $('input[type="text"][data-fn="입력"], input[type="number"][data-fn="입력"], textarea[data-fn="입력"], button, input[type="checkbox"], input[type="radio"], input[type="checkbox"] + label, input[type="radio"] + label').on('blur', function () {
    $(this).removeClass('focus-visible');
  });
});

window.addEventListener("resize", resizer);
window.addEventListener("DOMContentLoaded", resizer);

document.addEventListener(
  "DOMContentLoaded",
  function () {
    initAudioSystem();
    makeAnswerCheckPopup();

    // if (parent.ZOOMVALUE == undefined) {
    //     parent.ZOOMVALUE = 1;
    // }
    // window.scale = parent.ZOOMVALUE;

    if (typeof pageConfig == "function") {
      pageConfig();
    }

    if (typeof pageInit == "function") {
      pageInit();
    }

    if (typeof pageBindEvents == "function") {
      pageBindEvents();
    }

    if (document.querySelector("audio.etrAudioObject") == undefined) {
      window.etrAudioObject = document.createElement("audio");
      window.etrAudioObject.src =
        "../common/audio/empty.mp3";
      document.body.appendChild(window.etrAudioObject);
    }

    window.adoClick = new Audio("../common/audio/click.mp3");
    window.adoFail = new Audio(
      "../common/audio/tick.mp3?vol=0.1"
    );
    window.adoFail.volume = 0.1;
    // window.adoTrue = new Audio('../common/audio/true.mp3?vol=0.1');
    // window.adoTrue.volume=0.1;
    // window.adoFalse = new Audio('../common/audio/false.mp3?vol=0.1');
    // window.adoFalse.volume=0.1;
    window.adoTick = new Audio(
      "../common/audio/tick.mp3?vol=0.1"
    );
    window.adoTick.volume = 0.1;
    window.adoTone = new Audio(
      "../common/audio/tone.mp3?vol=0.1"
    );
    window.adoTone.volume = 0.1;
    window.adoCaution = new Audio(
      "../common/audio/popcorrect.mp3?vol=0.1"
    );
    window.adoCaution.volume = 0.1;
    window.adoCorrect = new Audio(
      "../common/audio/correct.mp3"
    );
    window.adoFail = new Audio("../common/audio/fail.wav");
    window.adoWrong = new Audio(
      "../common/audio/tone.mp3?vol=0.1"
    );
    window.adoWrong.volume = 0.1;
    window.adoClick = new Audio("../common/audio/click.mp3");
    window.adoTick = new Audio(
      "../common/audio/tick.mp3?vol=0.1"
    );
    window.adoTick.volume = 0.1;
    window.adoTick2 = new Audio(
      "../common/audio/tick2.mp3?vol=0.1"
    );
    window.adoTick2.volume = 0.1;
    window.adoTick3 = new Audio(
      "../common/audio/tick3.mp3?vol=0.1"
    );
    window.adoTick3.volume = 0.1;
    window.adoClap = new Audio(
      "../common/audio/clap.mp3?vol=0.1"
    );
    window.adoClap.volume = 0.1;
    window.adoSuc1 = new Audio(
      "../common/audio/correct.mp3"
    );
    window.adoLadder = new Audio(
      "../common/audio/gr_bgm.mp3?vol=0.5"
    );
    window.adoLadder.volume = 0.5;
    window.adoStar = new Audio("../common/audio/star.mp3");
    window.adoReady = new Audio("../common/audio/say.mp3");
    window.adoCap02 = new Audio(
      "../common/audio/cap_02.mp3"
    );

    initUI();
    fakeInput();
    textAutoFocus();
    // initAssessment();

    // initCheck();

    $("div, img").attr("draggable", "false");

    /**체크**/
    if (document.querySelector(".check_box_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/checkBoxAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".check_box_ox_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/checkBoxOXAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".click_ox_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/clickOxAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".check_ox_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/checkOxAssessment.js",
      ], function () {});
    }

    /**선택형 정답**/
    if (document.querySelector(".check_select_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/checkSelectAssessment.js",
      ], function () {});
    }

    /**클릭형 정답**/
    if (document.querySelector(".click_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/clickAnswerAssessment.js",
      ], function () {});
    }

    /**드래그**/
    if (document.querySelector(".drag_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/dragAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".drag_infinity_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/dragInfiAssessment.js",
      ], function () {});
    }

    /**선긋기**/
    if (document.querySelector(".line_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/lineAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".click_line_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/clickLineAssessment.js",
      ], function () {});
    }

    /**오디오**/
    if (document.querySelector(".etraudio") != undefined) {
      require([
        "../../common_contents/common/js/ejs/etraudio2.js",
      ], function () {
        loadCss("../../common_contents/common/css/audio.css");
      });
    }

    /**비디오**/
    if (
      document.querySelector(".video") != undefined ||
      document.querySelector("button[data-scriptarea]") != undefined
    ) {
      require([
        "../../common_contents/common/js/talkEditer.js",
      ], function () {});
    }

    /**텍스트**/
    if (document.querySelector(".text_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/textAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".text_container2") != undefined) {
      require([
        "../../common_contents/common/js/ejs/textAssessment2.js",
      ], function () {});
    }
    if (document.querySelector(".text_check_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/textCheckAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".text_write_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/textWriteAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".select_object_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/selectObjAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".data-box-container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/choiceDataBoxAssessement.js",
      ], function () {});
    }
    if (document.querySelector(".fill_square_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/fillSquareAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".inner_click_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/innerClickAnswerAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".balloon_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/balloonClickAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".find_hidden_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/findHiddenAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".paper_img_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/paperAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".graph_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/graphAssessment.js",
      ], function () {});
    }
    // if (document.querySelector(".customScroll") != undefined) {
    //     require(["../js/jquery.mCustomScrollbar.concat.min.js"], function () {});
    // }
    // if (document.querySelector(".customScroll") != undefined) {
    //     require(["../css/jquery.mCustomScrollbar.css"], function () {});
    // }
    if (document.querySelector(".ladder_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/ladderAssessment.js",
      ], function () {});
    }

    // 016_01 Let's Learn
    if (document.querySelector(".click_showbox_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/clickShowBoxAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".reveal_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/revealAssessment.js",
      ], function () {});
    }

    // reveal motion
    if (document.querySelector(".reveal_container2") != undefined) {
      require([
        "../../common_contents/common/js/ejs/revealAssessment.js",
      ], function () {});
    }

    // color reveal
    if (document.querySelector(".color_reveal_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/colorRevealAssessment.js",
      ], function () {});
    }
    if (document.querySelector(".color_pick_reveal_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/colorRevealAssessment.js",
      ], function () {});
    }

    if (document.querySelector(".calc_container") != undefined) {
      require([
        "../../common_contents/common/js/ejs/calcAssessment.js",
      ], function () {});
    }

    initSlide();
    initPage();
    initTab();

    initFunctions();

    if (teacher == false) {
      $(".ty_complete").hide();
    }

    $("#btn_close").click(function () {
      // playAudio(adoTick);

      playAudio(adoClick);
    });

    $(".btn_smart").click(function () {
      playAudio(adoClick);
    });

    $(".next, .prev, .nav_slide").click(function (event) {
      event.preventDefault();
      event.stopPropagation();
      $(".smallpop, .conf_small").css({ display: "none" });
      $(".pop_click2").show();

      if ($(this).parents("#content").find(".q_tit.ready").length) {
        $(".btn_return").hide();
      }
    });

    $(".close").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      //$(this).parent().hide();
      $(".back_shadow").remove();
      // playAudio(adoTick);

      playAudio(adoClick);
      $(".pop_click2").show();
      $(this).parent().find(".btn_answer").removeClass("retry");
      $(this).parent().find(".xyz_reveal").removeClass("revealOn");
      $(this).parent().find(".xyz_reveal").show();
      $(this).parent().find(".answer3").css({ visibility: "hidden" });
      $(this).parent().find(".answer2").css({ visibility: "hidden" });
      $(this).parent().find(".gray_box .prev2").hide();
      $(this).parent().find(".gray_box .next2").show();
      $(this).parent().find(".gray_box .nav_slide2").removeClass("on");
      $(this).parent().find(".gray_box .nav_slide2:eq(0)").addClass("on");
      $(this).parent().find(".gray_box .slide_content2").removeClass("on");
      $(this).parent().find(".gray_box .slide_content2:eq(0)").addClass("on");

      var popId = $(this).parent().attr("id");

      if ($(this).parent().hasClass("smallpop")) {
        $(this)
          .parent()
          .siblings("[data-pop=" + popId + "]")
          .show();
        $(this)
          .parent()
          .siblings()
          .find("[data-pop=" + popId + "]")
          .show();
      }
      $(this)
        .parent()
        .find(".video")
        .each(function (idx2, obj) {
          if (obj.video && obj.video.pause) {
            // var vdoPlay = $(obj).find(".playcontroller");

            obj.video.load();
            obj.video.pause();
            obj.video.currentTime = 0;

            $(obj).find(".videoSeekBtn").css("left", "0");
            $(obj).find(".seeker").css("width", "0");
            $(obj).find(".video_header").show();
          }
        });

      $(".btn_help").removeAttr("style");
      $(".btn_com").removeAttr("style");
    });

    $(".mat_wrap")
      .find(".check_box")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if ($(this).hasClass("on")) {
          $(this).removeClass("on");
        } else {
          $(this).addClass("on");
        }
      });
    $(".table_green, .table_red")
      .find(".check_box")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if ($(this).hasClass("on")) {
          $(this).removeClass("on");
        } else {
          $(this).addClass("on");
        }
      });

    $(".check_f").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      // playAudio(adoTick);

      playAudio(adoClick);

      $(this).parent().find(".check_f").removeClass("on");
      $(this).addClass("on");
    });

    // 형성평가

    $(".smile").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      // playAudio(adoTick);

      playAudio(adoClick);

      if (!$(this).hasClass("on")) {
        $(this).addClass("on");
      } else {
        $(this).removeClass("on");
      }
      // var starN = $(this).index();
      // var array = $(this).parent().find('.smile');

      // if(!$(this).hasClass('on')){
      //     for(var i=0; i-1<starN; i++){
      //         $(array).eq(i).addClass('on');
      //     }
      // }else if(array.eq(starN+1).hasClass('on')){
      //     for(var i=starN; i<array.length; i++){
      //         $(array).eq(i+1).removeClass('on');
      //     }
      // }else if($(this).hasClass('on')){
      //     for(var i=0; i-1<starN; i++){
      //         $(array).eq(i).removeClass('on');
      //     }
      // }
    });
    // initDictation();

    $(".top_nav .nav_list").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!$(this).hasClass("on")) {
        if ($(this).index() > $(".top_nav .nav_list.on").index()) {
          var s = $(this).index() - $(".top_nav .nav_list.on").index();
          top
            .$("#frmPOPUP")[0]
            .contentWindow.goPage(
              top.$("#frmPOPUP")[0].contentWindow.currentPage + s
            );
        } else if ($(this).index() < $(".top_nav .nav_list.on").index()) {
          var s = $(".top_nav .nav_list.on").index() - $(this).index();
          top
            .$("#frmPOPUP")[0]
            .contentWindow.goPage(
              top.$("#frmPOPUP")[0].contentWindow.currentPage - s
            );
        }
      }
    });

    // add 2023.09.21

    /* if(window.frameElement && window.frameElement.tabInfo && window.gotoTab) {
        console.log('tabinfo',window.frameElement.tabInfo);
        window.gotoTab(parseInt(window.frameElement.tabInfo[1])-1);
    }

    if(window.frameElement && window.frameElement.bLastTab && window.gotoTab) {
        //$('.tab>.tab_item:last-child').trigger('touchstart');
        window.gotoTab($('.tab>.tab_item').last().index());
    }
    window.frameElement.tabInfo = undefined;
    window.frameElement.bLastTab = undefined;

    if(typeof(parent.poppageLoadHandler) != 'undefined') {
        parent.poppageLoadHandler(window);
    } */

    $(".main_img")
      .find(".clickArea")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var thisNum = $(this).attr("id").slice(-1);
        // slideOn(thisNum - 1);

        if (thisNum == 1) {
          $(".wrapPop").find(".prev").hide();
          $(".wrapPop").find(".next").show();
        } else if (
          thisNum == $(this).parents(".main_img").find(".clickArea").length
        ) {
          $(".wrapPop").find(".prev").show();
          $(".wrapPop").find(".next").hide();
        } else {
          $(".wrapPop").find(".prev").show();
          $(".wrapPop").find(".next").show();
        }

        $(".wrapPop").show().find(".slide_content").removeClass("on");
        $(".wrapPop").find(".nav_slide").removeClass("on");
        $(".wrapPop")
          .find(".nav_slide:eq(" + (thisNum - 1) + ")")
          .addClass("on");
        $($(this).attr("data-slide-pop")).addClass("on");
      });

    $(".wrapPop")
      .find(".btn_lpopClose")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(".wrapPop").hide().find(".slide_content").removeClass("on");
      });

    initAudioObject();
  },
  false
);

function makeScrollbar3() {
  // console.log($('#poppage').length);
  setTimeout(function () {
    $(".pt_slide_box1").mCustomScrollbar({
      // $("#poppage")[0].contentWindow.$(".slide_content .pt_slide_box1.customScroll").mCustomScrollbar({
      axis: "y",
      scrollButtons: { enable: true, scrollAmount: 5 },
      theme: "rounded-dark",
      scrollInertia: 0,
      // setHeight: 800,
      mouseWheel: { scrollAmount: 25 },
      callbacks: {
        whileScrolling: function () {
          let rail = $(".mCS-rounded-dark.mCSB_scrollTools .mCSB_draggerRail");
          let rail_status = rail.find(".rail_status");
          if (rail_status.length < 1) {
            rail_status = $('<div class="rail_status"></div>').appendTo(rail);
            rail_status.css({
              position: "absolute",
              "background-color": "#fff",
              left: 0,
              top: 0,
              height: 0,
              width: "100%",
            });
          }

          // rail_status.width($(".mCSB_dragger").position().left + 16);
        },
      },
    });
    $(".pt_slide_box2").mCustomScrollbar({
      // $("#poppage")[0].contentWindow.$(".slide_content .pt_slide_box1.customScroll").mCustomScrollbar({
      axis: "y",
      scrollButtons: { enable: true, scrollAmount: 5 },
      theme: "rounded-dark",
      scrollInertia: 0,
      // setHeight: 800,
      mouseWheel: { scrollAmount: 25 },
      callbacks: {
        whileScrolling: function () {
          let rail = $(".mCS-rounded-dark.mCSB_scrollTools .mCSB_draggerRail");
          let rail_status = rail.find(".rail_status");
          if (rail_status.length < 1) {
            rail_status = $('<div class="rail_status"></div>').appendTo(rail);
            rail_status.css({
              position: "absolute",
              "background-color": "#fff",
              left: 0,
              top: 0,
              height: 0,
              width: "100%",
            });
          }

          // rail_status.width($(".mCSB_dragger").position().left + 16);
        },
      },
    });
    // $(".scriptContent").mCustomScrollbar({
    // // $("#poppage")[0].contentWindow.$(".slide_content .pt_slide_box1.customScroll").mCustomScrollbar({
    //     axis: "y",
    //     scrollButtons: { enable: true, scrollAmount: 5 },
    //     theme: "rounded-dark",
    //     scrollInertia: 0,
    //     // setHeight: 800,
    //     mouseWheel: { scrollAmount: 25 },
    //     callbacks: {
    //         whileScrolling: function () {
    //             let rail = $(".mCS-rounded-dark.mCSB_scrollTools .mCSB_draggerRail");
    //             let rail_status = rail.find(".rail_status");
    //             if (rail_status.length < 1) {
    //                 rail_status = $('<div class="rail_status"></div>').appendTo(rail);
    //                 rail_status.css({
    //                     position: "absolute",
    //                     "background-color": "#fff",
    //                     left: 0,
    //                     top: 0,
    //                     height: 0,
    //                     width: "100%",
    //                 });
    //             }

    //             // rail_status.width($(".mCSB_dragger").position().left + 16);
    //         },
    //     },
    // });

    // $(".mCS-rounded-dark.mCSB_scrollTools .mCSB_draggerRail").css({
    //     "background-color": "#666",
    // });
  }, 500);
}

// 금칙어 있는지 확인하는 함수
function filterBadWords(checkText) {
  let filteredText = checkText;
  badWords.forEach((badWord) => {
    let escapedBadWord = badWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 정규식 특수 문자를 이스케이프
    const regex = new RegExp(`(?<!\\w)${escapedBadWord}(?!\\w)`, "gi");
    filteredText = filteredText.replace(regex, ""); // 금칙어 문구 제거
  });
  return filteredText;
}

function toastBadwordsMsg(container) {
  // console.log('test');
  if (!container) {
    container = $("#container");
  }
  if (container.find(".toast-msg-container").length == 0) {
    container.append(
      `<div class="toast-msg-container"><div class="toast-msgbox"><div class="toast-msg">${transText["부적절한 단어가 사용되었습니다. 다시 작성하세요."]}</div></div></div>`
    );
  }
  $(".toast-msg-container").show();
  setTimeout(function () {
    $(".toast-msg-container").fadeOut();
  }, 3000);
}

function initUI() {
  // if (parent.ZOOMVALUE == undefined) {
  //     parent.ZOOMVALUE = 1;
  // }
  $("input").attr("spellcheck", false);
  $("img,div").attr("draggable", false);
}

function fakeInput() {
  $("input,textarea").each(function (idx, ui) {
    if ($(ui).attr("readonly") != "readonly") {
      $(ui).attr("readonly", "readonly");
      setTimeout(
        function (ui) {
          ui.removeAttribute("readonly");
        },
        0,
        ui
      );
    }
    if ($(ui).attr("disabled") != "disabled") {
      $(ui).attr("disabled", "disabled");
      setTimeout(
        function (ui) {
          ui.removeAttribute("disabled");
        },
        0,
        ui
      );
    }
  });
}

function textAutoFocus() {
  $("input.autofocus[maxlength]").on("keyup", function (event) {
    var bDir = event.key != "Backspace";
    if (event.key == "Backspace") {
      if (this.value.length == 0) {
        $(this).prev().focus();
      }
    } else {
      if (this.value.length == $(this).attr("maxlength")) {
        $(this).next().select();
        $(this).next().focus();
      }
    }
  });
}

function getTouch(event) {
  var evt;
  if (event.originalEvent) {
    evt = event.originalEvent;
  } else {
    evt = event;
  }
  // console.log(evt);
  if (evt.touches && evt.touches.length > 0) {
    var offsetX = 0,
      offsetY = 0;
    if (parent != undefined) {
      offsetX = evt.touches[0].pageX - $(evt.target).offset().left;
      offsetY = evt.touches[0].pageY - $(evt.target).offset().top;
    }
    return {
      pageX: evt.touches[0].pageX,
      pageY: evt.touches[0].pageY,
      offsetX: offsetX,
      offsetY: offsetY,
      isMobile: true,
      path: evt.path,
      srcElement: evt.srcElement,
      timeStamp: evt.timeStamp,
    };
  } else {
    return {
      pageX: evt.pageX,
      pageY: evt.pageY,
      offsetX: evt.offsetX,
      offsetY: evt.offsetY,
      isMobile: false,
      path: evt.path,
      srcElement: evt.srcElement,
      timeStamp: evt.timeStamp,
    };
  }
}

function playEffect(ado, vol) {
  if (!ado.endsWith(".mp3")) {
    ado += ".mp3";
  }
  window.etrAudioObject.src = "../common/audio/effect/" + ado;
  if (typeof vol == "number") {
    window.etrAudioObject.volume = vol;
  }
  playAudio(window.etrAudioObject);
}

function pauseAudio(ado) {
  if (ado == undefined || ado.pause == undefined) return;

  var promise = ado.pause();
  if (promise !== undefined) {
    promise.then(function () {}).catch(function (err) {});
  }
}

function playAudio(ado, fromZero) {
  if (ado == undefined) {
    return;
  }
  if (fromZero == false || fromZero == "false") {
    fromZero = false;
  } else {
    fromZero = true;
  }

  if (window.adoList == undefined) {
    window.adoList = [];
  }

  if (typeof ado == "string") {
    var ado2 = window.adoList[ado];
    if (ado2 == undefined) {
      ado2 = new Audio(ado);
      ado2.load();
      window.adoList[ado] = ado2;
    }
    ado = ado2;
  }

  var promise = ado.pause();
  if (promise !== undefined) {
    promise.then(function () {}).catch(function (err) {});
  }

  if (fromZero) {
    try {
      ado.currentTime = 0;
    } catch (err) {}
  }

  promise = ado.play();
  if (promise !== undefined) {
    promise
      .then(function () {})
      .catch(function (err) {
        console.log(err);
      });
  }

  return ado;
}

function enableAudio(element, audio, onEnd) {
  var callback = false,
    click = false;

  click = function (e) {
    var forceStop = function () {
        audio.removeEventListener("play", forceStop, false);
        audio.pause();
        element.removeEventListener("touchstart", click, false);
        if (onEnd) onEnd();
      },
      progress = function () {
        audio.removeEventListener("canplaythrough", progress, false);
        if (callback) callback();
      };

    audio.addEventListener("play", forceStop, false);
    audio.addEventListener("canplaythrough", progress, false);
    try {
      audio.play();
    } catch (err) {
      callback = function () {
        callback = false;
        audio.play();
      };
    }
  };
  element.addEventListener("touchstart", click, false);
}

/* window.alert = function (msg) {
    var pop = $('<div class="alterPopup"></div>').appendTo("#container");
    $('<div class="popBox"><div class="title"><button class="btn_close"></button></div><div class="main"></div></div>').appendTo(pop);
    pop.find(".main").text(msg);
    pop.find(".btn_close").on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        playAudio(adoClick);
        $(this).parents(".alterPopup").remove();
    });
}; */

// add 2023.09.21

// function initDictation() {
//     $("#pop_dictGroup").css({
//         width: "100%",
//         height: "100%",
//         "z-index": 2,
//         position: "absolute",
//     });

//     $("#pop_dictation2").show();
//     $("#pop_dictGroup,#pop_dictation,#pop_dictation3").hide();

//     $(".DT2").click(function () {
//         playAudio(adoTick);
//         showPopup2($("#pop_dictation2"));
//         hidePopup2($("#pop_dictation,#pop_dictation3"));
//     });
//     $(".DT1").click(function () {
//         playAudio(adoTick);
//         showPopup2($("#pop_dictation"));
//         hidePopup2($("#pop_dictation2,#pop_dictation3"));
//     });
//     $(".DT3").click(function () {
//         playAudio(adoTick);
//         showPopup2($("#pop_dictation3"));
//         hidePopup2($("#pop_dictation,#pop_dictation2"));
//     });
// }

function initFunctions() {
  initAudio2();
  initBasicPopup();
  // initCheckStar();
  initOpentab();
  initMoChar();
  initDownload();
  initWriteGif();

  //$('.videoScriptArea').hide();
}

/**
 * .audio2, data-audio2, data-playReset
 */
function initAudio2() {
  adoList = {};

  if ($(".audio2").length > 0) {
    $("body").append(
      "<audio id='xyzAudioObject' src='../../common_selvasai_3/common/audio/empty.mp3' />"
    );
    window.audioObj = $("#xyzAudioObject")[0];
  }

  $(".audio2[data-audio2]").each(function (idx, item) {
    item.playing = false;
    item.audioElement = new Audio();
    item.audioElement.src = "audio/" + item.dataset.audio2 + ".mp3";
    item.audioElement.ui = item;

    $(item.audioElement).on("play", function () {
      this.isPlay = true;
      this.ui.playing = true;
      $(this.ui).removeClass("ended off");
      $(this.ui).addClass("playing done");
      $(this.ui).next("p").addClass("playing");

      // 7/6 item 위치에 맞게 스크롤 이동 추가
      // scrollTopEvent(this);
    });
    $(item.audioElement).on("pause", function () {
      this.isPlay = false;
      this.ui.playing = false;
      $(this.ui).removeClass("playing");
      // 주요표현
      if ($(this.ui).parent().hasClass("m_exp")) {
        $(this.ui).addClass("off2");
        var adoNum = $(".m_exp .audio2").length;
        var adoChk = $(".m_exp .audio2.done").length;
        if (adoNum == adoChk) {
          if (teacher == false) {
            $(".ty_complete").show();
            sendOnlyCompleteStamp(true); // 주요표현(ST 1page 완료시 도장)
          }
        }
      }

      //
      var adoNum = $(".audio2[data-audio2]").length;
      var chkNum = $(".audio2[data-audio2].done").length;
      var chkAnswer = $(".reviewBox .answer_box.chk").length;
      if (adoNum == chkNum && adoNum == chkAnswer) {
        pageComplete(); // Ready 준비학습(DW 1page 완료시 도장)
      }
    });
    /* $(item.audioElement).on('ended', function() {
            this.ended = true;
            $(this.ui).addClass('ended');
        }); */
  });

  $(".audio2[data-audio2]").off("touchstart click");
  $(".audio2[data-audio2]").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    let this2 = this;

    // 7/7 수정추가: 개별 버튼은 재생시 항상 초기화
    if ($(this).hasClass("btn_sound")) {
      this.playing = false;
      this.audioElement.load();
    }
    ////////////////////////////////////////////
    if (this.playing) {
      this.playing = false;
      // this.audioElement.pause();
      pauseAudio(this.audioElement);
    } else {
      pauseMedia();
      try {
        $(".audio2[data-audio2]").each(function (idx, obj) {
          if (this2 != obj) {
            if (obj.audioElement) {
              obj.playing = false;
              // obj.audioElement.pause();
              pauseAudio(obj.audioElement);
            }
          }
        });
      } catch (err) {}

      this.playing = true;
      //if(this.audioElement == undefined) {
      //    this.audioElement = new Audio();
      //    this.audioElement.src = 'audio/' + this.dataset.audio2 + '.mp3';
      //    this.audioElement.ui = this2;
      //
      //    $(this.audioElement).on('play', function() {
      //        this.ui.playing = true;
      //        $(this.ui).addClass('playing');
      //    });
      //    $(this.audioElement).on('pause', function() {
      //        this.ui.playing = false;
      //        $(this.ui).removeClass('playing');
      //    });
      //}

      playAudio(this.audioElement, this.dataset.playreset);

      window.playingAudioObj = this.audioElement;

      // 7/6 수정: item 위치에 맞게 스크롤 이동 추가
      scrollTopEvent(this);
    }
  });

  $(".audio2[data-audioList]").each(function (idx, item) {
    let txt = item.dataset.audiolist;
    if (txt == undefined || txt.length < 1) return true;

    txt = txt.split(/\s*,\s*/);
    item.audioList = [];
    item.audioIdx = 0;
    item.currentAudioIndex = 0;
    item.currentTime = 0;
    item.isPaused = false;

    $.each(txt, function (idx2, tt) {
      let src = "audio/" + tt + ".mp3";
      let ado = new Audio();
      ado.src = src;
      ado.refList = [];
      ado.aindex = idx2;
      ado.ui = item;
      item.audioList.push(ado);

      $(".audio2[data-audio2]").each(function (idx2, item2) {
        if (item2.audioElement && $(item2.audioElement).attr("src") == src) {
          ado.refList.push(item2);
        }
      });

      $(ado).on("play", function (event) {
        $.each(this.refList, function (idx3, ff) {
          $(ff).addClass("playing");
          $(ff).removeClass("off");
          $(ff).next("p").addClass("playing");
          // 7/6 수정: item 위치에 맞게 스크롤 이동 추가
          scrollTopEvent(ff);
        });
        this.isPlay = true;
        $(ado.ui).addClass("playing pause");
        $(ado.ui).find("span").text(transText["일시정지"]);
        ado.ui.requestPause = false;
        playingAudioObj = this;
      });

      $(ado).on("pause", function (event) {
        $.each(this.refList, function (idx3, ff) {
          $(ff).removeClass("playing");
        });
        this.isPlay = false;
        $(ado.ui).removeClass("playing pause");
        $(ado.ui).find("span").text(transText["재생"]);
        ado.ui.currentTime = this.currentTime;
      });

      $(ado).on("ended", function (event) {
        $.each(this.refList, function (idx3, ff) {
          $(ff).removeClass("playing");
          if ($(ff).parent().hasClass("m_exp")) {
            $(ff).addClass("off2");
          }
        });
        this.isPlay = false;
        ado.ui.audioIdx++;

        if (ado.ui.requestPause) {
          return;
        }
        if (ado.ui.audioIdx < ado.ui.audioList.length) {
          playAudio(ado.ui.audioList[ado.ui.audioIdx], true);
        } else {
          $(ado.ui).removeClass("playing pause");
          $(ado.ui).find("span").text(transText["재생"]);
          var scriptNum = $(".talkPlay .scriptChar").length;
          var chkAll = $(".talkPlay .scriptChar.open").length;
          if (chkAll == scriptNum) {
            if (teacher == false) {
              $(".ty_complete").show();
              sendOnlyCompleteStamp(true);
            }
          }
          $(".talkPlay .scriptHeader").addClass("read");
          ado.ui.audioIdx = 0;
        }
      });
    });

    $(item).off("touchstart click");
    $(item).on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      let ado = this.audioList[this.audioIdx];
      if (ado.isPlay) {
        pauseMedia();
        this.isPaused = true;
      } else {
        if (this.isPaused) {
          this.audioList[this.audioIdx].currentTime = this.currentTime;
          this.audioList[this.audioIdx].play();
        } else {
          pauseMedia();
          this.requestPause = false;
          this.audioIdx = 0;
          ado = this.audioList[this.audioIdx];
          playAudio(ado, true);
        }
        this.isPaused = false;
      }
    });
  });
}

// function playAudio(audio, isFromList) {
//     if (isFromList && playingAudioObj) {
//         playingAudioObj.pause();
//         playingAudioObj.currentTime = 0;
//     }
//     audio.play();
// }

function pauseMedia() {
  if (playingAudioObj) {
    playingAudioObj.pause();
  }
}

function initBasicPopup() {
  $(".b_popup").off("touchstart click");
  $(".b_popup").on("touchstart click", function (event) {
    if (this.dataset.pop == undefined || this.dataset.pop.length < 1) return;

    event.preventDefault();
    event.stopPropagation();

    playAudio(adoClick);
    if ($(this).attr("data-pop") != ".showNtell_box") {
      pauseMedia();
    }

    if (this.dataset.closeother == "true") {
      $(this)
        .siblings(".b_popup[data-pop]")
        .each(function (idx, btn) {
          try {
            $(btn).removeClass("on");
            $(btn.dataset.pop).hide();
          } catch (err) {}
        });
    }

    let vpop = $(this.dataset.pop);
    vpop.find(".criContent").find("textarea, input").attr("placeholder", "");

    $(this)
      .parents("#container")
      .on("touchstart click", function (event) {
        if ($(this).find(".b_popup.on").hasClass("mat")) {
          vpop.hide();
          $(this).find(".mat.b_popup").removeClass("on");
        }
      });

    if (document.querySelector(".jumpup") != undefined) {
      if ($(this).attr("class").indexOf("easyLevel") == 0) {
        $(".level_sec").children().addClass("move");
      } else if ($(this).attr("class").indexOf("basicLevel") == 0) {
        $(".level_sec").children().removeClass("move");
        $(".hardLevel").addClass("move");
      } else if ($(this).attr("class").indexOf("hardLevel") == 0) {
        $(".level_sec").children().removeClass("move");
      }

      $("." + $(this.dataset.pop).attr("class")).hide();
      $(this.dataset.pop).show();
    }

    if (vpop.css("display") == "none") {
      vpop.show();
      /* $(this).addClass('on'); */

      // critical Thinking 팝업일 경우 foucs on
      if (vpop.hasClass("criPopup")) {
        var criCont = vpop.find(".criContent");

        // criContent 안 textarea , input placeholder reset
        criCont.find("textarea, input").attr("placeholder", "");
        criCont.find("textarea, input").focus();
      }

      if (vpop.find(".video").length > 0) {
        vpop.find(".video")[0].resizeUI();
        if (vpop.find(".video")[0].video) {
          vpop.find(".video")[0].video.load();
        }
      }

      if (vpop.find(".btn_lpopClose").length > 0) {
        vpop.find(".btn_lpopClose")[0].pop = vpop;
        vpop.find(".btn_lpopClose").off();
        vpop.find(".btn_lpopClose").on("touchstart click", function (event) {
          event.preventDefault();
          event.stopPropagation();

          pauseMedia();
          playAudio(adoClick);
          this.pop.hide();
        });
      }
    } else {
      /* $(this.dataset.pop).hide(); */
      $(this).removeClass("on");
    }

    if (typeof this.callback == "function") {
      this.callback(vpop, $(this).css("display") != "none");
    }
  });

  $(".btn_lpopClose").off("touchstart click");
  $(".btn_lpopClose").on("touchstart click", function (event) {
    if (this.dataset.pop == undefined || this.dataset.pop.length < 1) return;

    event.preventDefault();
    event.stopPropagation();

    playAudio(adoClick);
    $(this.dataset.pop).hide();
  });
}

function pauseMedia() {
  let promise;
  $("audio, video").each(function (idx, obj) {
    promise = obj.pause();
    if (promise !== undefined) {
      promise
        .then(function () {})
        .catch(function (err) {
          console.log(err);
        });
    }
  });
  $(".audio2").each(function (idx2, obj) {
    if (obj.audio && obj.audio.pause) {
      promise = obj.audio.pause();
      if (promise !== undefined) {
        promise
          .then(function () {})
          .catch(function (err) {
            console.log(err);
          });
      }
    }
    obj.requestPause = true;
  });
  $(".video").each(function (idx2, obj) {
    $(obj).find(".rolePlaying").removeClass("hide");
    $(obj).find(".videoSceneArea").removeClass("hide");
    if (obj.showController) {
      obj.showController();
    }

    clearTimeout(obj.timerIntv);
    if (obj.video && obj.video.videomr && obj.video.videomr.pause) {
      clearTimeout(obj.video.mrintv);
      $(obj).find(".timerNum").hide();
      let proimise = obj.video.videomr.pause();
    }
  });

  if (playingAudioObj && playingAudioObj.pause) {
    promise = playingAudioObj.pause();
    if (promise !== undefined) {
      promise
        .then(function () {})
        .catch(function (err) {
          console.log(err);
        });
    }
  }
  if (window.audioObj && window.audioObj.pause) {
    promise = window.audioObj.pause();
    if (promise !== undefined) {
      promise
        .then(function () {})
        .catch(function (err) {
          console.log(err);
        });
    }
  }
}

function initOpentab() {
  $(".opentab").off("touchstart click");
  $(".opentab").on("touchstart click", function (event) {
    if (this.dataset.tabcon == undefined || this.dataset.tabcon.length < 1)
      return;
    if ($(this.dataset.tabcon).length < 1) return;

    event.preventDefault();
    event.stopPropagation();

    let tidx = 0;
    if (this.dataset.tabindex && !isNaN(this.dataset.tabindex)) {
      tidx = parseInt(this.dataset.tabindex);
    }

    // playAudio(adoClick);

    $(this.dataset.tabcon).show();
    $(this.dataset.tabcon).find(".tab>li").eq(tidx).trigger("click");
  });
}

function initMoChar() {
  let mo = $("#mo_cha");
  // 7/12 수정 추가 - 캐릭터에만 클릭 이벤트 적용
  let moimg = $("#mo_cha .mo_cha_img");
  if (mo.length < 1) return;

  mo = mo[0];
  mo.moChar = $(mo).find("#mo");
  mo.balloon = $(mo).find(".balloon_wrap");

  setTimeout(
    function (mo) {
      if (mo.touched == undefined) {
        mo.balloon.hide();
      }
    },
    3000,
    mo
  );

  // 7/12 수정 추가 - 캐릭터에만 클릭 이벤트 적용
  $(moimg).off("touchstart click");
  $(moimg).on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    mo.touched = true;

    playAudio(adoClick);

    if (mo.balloon.css("display") == "none") {
      $(moimg).attr("title", "활성화됨");
      mo.balloon.show();
    } else {
      $(moimg).removeAttr("title");
      mo.balloon.hide();
    }
  });
  ////////////////////////////////////////////
}

function initDownload() {
  $(".pds_down[data-path]").off("touchstart click");
  $(".pds_down[data-path]").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    downloadFile(this.dataset.path);
  });
}

function initButtons() {
  // 용어 팝업 초기화
  initTermsPopup();

  $(".btn_goPage").click(function () {
    var pagenum = $(this).attr("data-pagenum");
    if (pagenum == undefined) return;
    goPage(pagenum);
  });
}

function initTermsPopup() {
  // $(".terms_popup").hide().css("opacity", 0);
  // $(".btn_terms").each(function () {
  //     if ($(this).find("span.supOR").length == 0) $(this).prepend("");
  //     var p = $(this).parents(".xyz_word")[0];
  //     var c = $(this).attr("data-terms") + "";
  //     c = c.replace("\\n", "<br />");
  //     $(p).append("<div class='term_box'><p><img src='images/btn_xclose.png' alt='닫기' title='닫기' /></p><p>" + c + "</p><span></span></div>");
  //     var cc = $(p).find(".term_box:last-child");
  //     if (c.length > 40) {
  //         cc.width("250");
  //         cc.children("span:last-child").css({ left: 117 });
  //     }
  //     //cc.height(cc.find('p:nth-child(1)').outerHeight()+cc.find('p:nth-child(2)').outerHeight());
  //     this.popup = cc[0];
  //     cc.css({
  //         top: $(this).position().top + 40,
  //         left: $(this).position().left - 75,
  //     });
  // });
  // $(".term_box").hide();
  // $(".btn_terms").on("touchstart click", function (event) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     playAudio(adoTick);
  //     //$('#' + $(this).attr('data-popup-id')).css({ transformOrigin: '50% 0%' });
  //     //togglePopup($('#' + $(this).attr('data-popup-id')));
  //     var tch = getTouch(event);
  //     var x = tch.pageX - $(this.popup).width() / 2;
  //     var arr = $(this.popup).find(".arr01");
  //     if (x < 0) {
  //         $(this.popup).find(".arr01").transition({ x: x }, 0);
  //         x = 0;
  //     } else if (x + $(this.popup).width() > 1190) {
  //         $(this.popup)
  //             .find(".arr01")
  //             .css("margin-left", x - (inherit - $(this.popup).width() - 5));
  //         x = 1190 - $(this.popup).width() - 5;
  //     }
  //     var y = tch.pageY - 30;
  //     if (y + $(this.popup).height() > 590) {
  //         y = y - $(this.popup).height() - 60;
  //         arr.transition({ top: $(this.popup).height() + 1, rotate: 180 }, 0);
  //     }
  //     if (typeof parent.ZOOMVALUE == "number") {
  //         x = x / parent.ZOOMVALUE;
  //         y = y / parent.ZOOMVALUE;
  //     }
  //     //$(this.popup).css({'left': x, 'top':tch.pageY+30});
  //     $(this.popup).css({ left: x, top: y });
  //     if ($(this.popup).offset().left + $(this.popup).outerWidth() > 1190) {
  //         $(this.popup).css({
  //             left: $(this.popup).offset().left - ($(this.popup).outerWidth() - $(this.popup).offset().left),
  //         });
  //     }
  //     //$('.terms_popup,.term_box').hide();
  //     togglePopup($(this.popup));
  // });
  // $(".terms_popup,.term_box").on("touchstart click", function (event) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     playAudio(adoTick);
  //     hidePopup($(this));
  // });
}

function initWriteGif() {
  $(".copyWrite")
    .find(".write_gif .gif")
    .each(function (idx2, item2) {
      let dcon;
      if (item2.tagName == "IMG") {
        dcon = $('<div class="gif_div"></div>').insertBefore(item2);
        console.log("$(item2).width() : " + $(item2).width());
        dcon.css({
          position: "absolute",
          // 'top':$(item2).position().top,
          // 'left':0,
          top: $(item2).css("top"),
          left: $(item2).css("left"),
          // 'width': $(item2).width(),
          width: "100%",
          height: $(item2).height(),
          "max-width": "220px",
        });
        $(item2).appendTo(dcon);
        $(item2).css({
          top: 0,
          left: 0,
        });
        $('<div class="blink_arrow"></div>').appendTo(dcon);
      }
      // if($(item2).parents('.assessmentGroup').length>0 && $(item2).parents('.assessmentGroup').eq(0)[0] == item) {
      // 	//item.items.push(item2);
      //     item.items.push($(item2).parent()[0]);
      // 	item2.target = $(item2.dataset.target);
      //     $(item2).parent()[0].target = $(item2.dataset.target);

      // 	let ht = parseInt(item2.target.css('height'));
      // 	item2.target.css({
      // 		'clip': 'rect(0px, 0px, '+ ht +'px,0px)',
      // 		'transition':'clip 0.2s'
      // 	});
      // }
    });
  $(".word").find(".blink_arrow:not(:first)").remove();
  $(".write_gif img.gif").each(function (idx, img) {
    img.oriSrc = img.src;
    img.emptySrc =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    img.src = img.emptySrc;
    $(img).css({ cursor: "pointer" });

    if (img.dataset.time && !isNaN(img.dataset.time)) {
      img.runtime = parseInt(img.dataset.time);
    } else {
      img.runtime = 1500;
    }

    img.start = function () {
      this.src = this.emptySrc;
      clearTimeout(this.intv);
      this.intv = setTimeout(
        function (img) {
          img.src = img.oriSrc;
        },
        100,
        this
      );
    };
    img.reset = function (num) {
      $(".slide_content").eq(num).find(".blink_arrow").show();
      clearTimeout(this.intv);
      this.src = this.emptySrc;
    };
  });

  $(".write_gif .blink_arrow").on("touchstart click", function (event) {
    $(this).hide();
    if ($(this).parents(".word").length > 0) {
      $(this).parents(".word").trigger("click");
    } else {
      $(this).siblings("img.gif").trigger("click");
    }
  });

  $(".write_gif img.gif").off("touchstart click");
  $(".write_gif img.gif").on("touchstart click", function (event) {
    // console.log('click : ' + $(this).parents('.word').length);
    if ($(this).parents(".word").length > 0) {
      // console.log('with word');
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    $(this).siblings(".blink_arrow").hide();
    playAudio(adoClick);
    this.start();
  });

  $(".write_gif.word").off("touchstart click");
  $(".write_gif.word").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    playAudio(adoClick);
    // $(this).find('.gif').each(function(idx,img) {
    //     img.reset();
    // });
    $(this).find(".blink_arrow").hide();
    if (this.intv == undefined) {
      this.intv = [];
    }
    let items = $(this).find("img.gif");
    let rtime = 0;

    for (let i = 0; i < items.length; i++) {
      let img = items[i];
      clearTimeout(this.intv[i]);
      this.intv[i] = setTimeout(
        function (img) {
          img.start();
        },
        rtime,
        img
      );
      rtime += img.runtime;
    }
  });

  $("div.copyWrite+div.btn_box>.btn_rewrite").on(
    "touchstart click",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      playAudio(adoClick);
      let box = $(this).parent().prev().find(".write_gif.word");
      box.each(function (idx5, bb5) {
        $.each(bb5.intv, function (idx6, iv6) {
          clearTimeout(iv6);
        });
      });
      var wrGif = $(this).parent().parent().index();
      $(this)
        .parent()
        .prev()
        .find(".write_gif .gif")
        .each(function (idx, img) {
          img.reset(wrGif);
        });
    }
  );
}

// function initPopup() {
//     $(".xyz_pop_middle").each(function (idx, obj) {
//         var title = $(obj).attr("data-title");
//         var html = $(obj).html();
//         var btnID = $(obj).attr("data-button-id");
//         var dataTranslate = $(obj).attr("data-btn-translate");
//         var id = obj.id;

//         $(obj).html("");
//         $(obj).hide();

//         $(obj).append("<div class='pop_title sansB' title='" + title + "'><span>" + title + "</span></div>");
//         if ($(obj).find(".pop_content").length < 1) {
//             //$(obj).html('');
//             $(obj).append("<div class='pop_content' >" + html + "</div>");
//         }
//         if ($(obj).find(".btn_xclose").length < 1) $(obj).append("<img class='btn_xclose' src='images/btn_xclose.png' alt='닫기' title='닫기' />");

//         var popContent = $(obj).find(".pop_content");
//         var cHeight = 200;

//         setTimeout(function () {
//             cHeight = popContent.height();
//         }, 500);

//         if (dataTranslate == "true") {
//             var kor = $(obj).find(".kor");
//             $(obj).append("<img class='btn_translate' src='images/btn_translate.png' alt='해석' title='해석' />");

//             kor.hide();
//             $(obj)
//                 .find(".btn_translate")
//                 .click(function (event) {
//                     event.preventDefault();
//                     event.stopPropagation();

//                     if (kor.css("display") == "block") {
//                         kor.hide();
//                         //popContent.css({'height':'initail'});
//                     } else {
//                         kor.show();
//                         popContent.css({ overflow: "auto" });
//                         popContent.animate({ scrollTop: kor.offset().top }, 300);
//                         //popContent.height(cHeight + kor.height());
//                     }
//                 });
//         }

//         $("#" + btnID).click(function () {
//             playAudio(adoTick);
//             //$('.xyz_pop_middle,.xyz_pop_middle2').hide();
//             togglePopup($("#" + id));
//         });

//         $("#" + id).click(function () {
//             playAudio(adoTick);
//             hidePopup($("#" + id));
//         });
//     });

//     $(".xyz_pop_middle2").each(function (idx, obj) {
//         var html = $(obj).html();
//         var btnID = $(obj).attr("data-button-id");
//         var id = obj.id;

//         $(obj).html("");
//         $(obj).hide();
//         $(obj).append("<div class='pop_content' >" + html + "</div>");
//         $(obj).append("<img class='btn_xclose' src='images/btn_xclose.png' alt='닫기' title='닫기' />");

//         $("#" + btnID).click(function () {
//             playAudio(adoTick);
//             //$('.xyz_pop_middle,.xyz_pop_middle2').hide();
//             togglePopup($("#" + id));
//         });

//         $("#" + id).click(function () {
//             playAudio(adoTick);
//             hidePopup($("#" + id));
//         });
//     });
// }

// function initPopup2() {
//     $(".pop_box").each(function (idx, obj) {
//         var btn = $("#" + $(obj).attr("data-button-id"));
//         btn.on("touchstart click", function (event) {
//             event.preventDefault();
//             event.stopPropagation();

//             if (obj.ans3 != true) {
//                 $(".pop_box").hide();
//                 $(obj).show();
//                 obj.ans3 = true;
//             } else {
//                 $(obj).hide();
//                 obj.ans3 = false;
//             }
//         });

//         if ($(obj).find(".xclose").length > 0) {
//             $(obj)
//                 .find(".xclose")
//                 .on("touchstart click", function (event) {
//                     event.preventDefault();
//                     event.stopPropagation();

//                     obj.ans3 = false;
//                     $(obj).hide();
//                 });
//         } else {
//             $(obj).on("touchstart click", function (event) {
//                 event.preventDefault();
//                 event.stopPropagation();

//                 this.ans3 = false;
//                 $(this).hide();
//             });
//         }
//     });

//     $(".pop_box").hide();
// }

// function initPopupButton() {
//     $(".xyz_popup_button").each(function (idx, obj) {
//         if (obj.hasAttribute("data-popup-selector")) {
//             var pop001 = $($(obj).attr("data-popup-selector"));
//             pop001.hide();

//             $(obj).on("touchstart click", function (event) {
//                 event.preventDefault();
//                 event.stopPropagation();

//                 togglePopup(pop001);
//             });
//         }
//     });

//     $(".Xclose").on("touchstart click", function (event) {
//         event.preventDefault();
//         event.stopPropagation();

//         if ($(this).parents(".popup_container").length > 0) {
//             hidePopup($(this).parents(".popup_container"));
//         } else {
//             hidePopup($(this).parent());
//         }
//     });
// }

function togglePopup(jobj) {
  if (jobj.css("display") == "none") {
    showPopup(jobj);
  } else {
    hidePopup(jobj);
  }
}

var popDuration = 200;
function showPopup(jobj, callback) {
  $(
    ".terms_popup,.term_box,.xyz_pop_middle,#POP01,#POP02,#P0P03,#POP04,#POP05,#P0P06,.AUTHOR,.popup_container"
  ).hide();
  jobj.transition({ scale: 0.2, opacity: 0 }, 0, function () {
    jobj.show().transition({ scale: 1, opacity: 1 }, popDuration, function () {
      if (callback != undefined) callback();
    });
  });
}

function hidePopup(jobj) {
  jobj.transition({ scale: 0.2, opacity: 0 }, popDuration, function () {
    jobj.hide();
  });
}

function showPopup2(jobj, callback) {
  $(
    ".terms_popup,.term_box,.xyz_pop_middle,#POP01,#POP02,#P0P03,#POP04,#POP05,#P0P06,.AUTHOR,.popup_container"
  ).hide();
  jobj.transition({ opacity: 0 }, 0, function () {
    jobj.show().transition({ opacity: 1 }, popDuration, function () {
      if (callback != undefined) callback();
    });
  });
}

function hidePopup2(jobj) {
  jobj.transition({ opacity: 0 }, popDuration, function () {
    jobj.hide();
  });
}

// 효과
function initEffect() {
  $(".xyz_effect_blink1").each(function (idx, obj) {
    obj.dur1 = 400;
    obj.dur2 = -1;

    if (
      obj.hasAttribute("data-duration") &&
      !isNaN($(obj).attr("data-duration"))
    ) {
      obj.dur1 = parseInt($(obj).attr("data-duration"));
    }
    if (
      obj.hasAttribute("data-duration2") &&
      !isNaN($(obj).attr("data-duration2"))
    ) {
      obj.dur2 = parseInt($(obj).attr("data-duration2"));
    }

    obj.stopAnimation = function () {
      clearTimeout(obj.intVal);
    };

    obj.runAnimation = function () {
      if ($(obj).css("opacity") == 1) {
        $(obj).css("opacity", 0);
      } else {
        $(obj).css("opacity", 1);
      }

      var delay = obj.dur1;
      if (obj.dur2 > 0 && obj.dur2 > obj.dur1) {
        delay = Math.round(Math.random() * (obj.dur2 - obj.dur1)) + obj.dur1;
      }

      obj.intVal = setTimeout(obj.runAnimation, delay);
    };
    obj.intVal = setTimeout(obj.runAnimation, 100);
  });

  $(".xyz_effect_swing").each(function (idx, obj) {
    obj.dur1 = 800;
    if (
      obj.hasAttribute("data-duration") &&
      !isNaN($(obj).attr("data-duration"))
    ) {
      obj.dur1 = parseInt($(obj).attr("data-duration"));
    }
    obj.delay = 300;
    if (obj.hasAttribute("data-delay") && !isNaN($(obj).attr("data-delay"))) {
      obj.delay = parseInt($(obj).attr("data-delay"));
    }
    obj.degreeStart = 0;
    if (
      obj.hasAttribute("data-degree-start") &&
      !isNaN($(obj).attr("data-degree-start"))
    ) {
      obj.degreeStart = parseInt($(obj).attr("data-degree-start")) + "deg";
    }
    obj.degreeEnd = 0;
    if (
      obj.hasAttribute("data-degree-end") &&
      !isNaN($(obj).attr("data-degree-end"))
    ) {
      obj.degreeEnd = parseInt($(obj).attr("data-degree-end")) + "deg";
    }
    obj.swingCenter = 0;
    if (obj.hasAttribute("data-swing-center")) {
      obj.swingCenter = $(obj).attr("data-swing-center");

      $(obj).css({
        "-webkit-transform-origin": obj.swingCenter,
        "-moz-transform-origin": obj.swingCenter,
        "transform-origin": obj.swingCenter,
      });
    }

    obj.stopAnimation = function () {
      clearTimeout(obj.intVal);
    };

    obj.runAnimation = function () {
      $(obj)
        .delay(obj.delay)
        .transition({ rotate: obj.degreeStart }, 0)
        .transition({ rotate: obj.degreeEnd }, obj.dur1 / 2)
        .transition({ rotate: obj.degreeStart }, obj.dur1 / 2, function () {
          obj.intVal = setTimeout(obj.runAnimation, obj.delay);
        });
    };
    obj.intVal = setTimeout(obj.runAnimation, 100);
  });

  $(".xyz_effect_drop").each(function (idx, obj) {
    obj.dur1 = 800;
    if (
      obj.hasAttribute("data-duration") &&
      !isNaN($(obj).attr("data-duration"))
    ) {
      obj.dur1 = parseInt($(obj).attr("data-duration"));
    }
    obj.dropLength = 0;
    if (obj.hasAttribute("data-length") && !isNaN($(obj).attr("data-length"))) {
      obj.dropLength = parseInt($(obj).attr("data-length"));
    }
    obj.delay = 300;
    if (obj.hasAttribute("data-delay") && !isNaN($(obj).attr("data-delay"))) {
      obj.delay = parseInt($(obj).attr("data-delay"));
    }

    obj.stopAnimation = function () {
      clearTimeout(obj.intVal);
    };

    obj.runAnimation = function () {
      $(obj)
        .delay(obj.delay)
        .transition({ y: 0, opacity: 1 }, 0)
        .transition({ y: obj.dropLength, opacity: 0.1 }, obj.dur1);

      obj.intVal = setTimeout(obj.runAnimation, obj.dur1);
    };
    obj.intVal = setTimeout(obj.runAnimation, 100);
  });
}

function initAudio() {
  adoList = {};

  if ($(".audio2").length > 0) {
    $("body").append(
      "<audio id='xyzAudioObject' src='../../common_selvasai_3/common/audio/empty.mp3' />"
    );
    audioObj = $("#xyzAudioObject")[0];
    // var html="<div id='adoObjectBar'><img alt='' id='adoBtnPlay' style='display:none;' src='images/player/btnPlay.png' /><img alt='' id='adoBtnPause' src='images/player/btnPause.png' /><img alt='' id='adoBtnStop' src='images/player/btnStop.png' /></div>";
    // $('body').append(html);
  }

  $(".audio2[data-audio2]").off("touchstart click");
  $(".audio2[data-audio2]").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.playing) {
      this.playing = false;
      this.audioElement.pause();
    } else {
      this.playing = true;
      if (this.audioElement == undefined) {
        this.audioElement = playAudio(this.dataset.audio2);
      } else {
        playAudio(this.audioElement);
      }
    }
  });

  $("#adoBtnPlay").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (audioObj == null) return;

    byControl = false;
    audioObj.play();
    $("#adoBtnPlay").hide();
    $("#adoBtnPause").show();
  });

  $("#adoBtnPause").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (audioObj == null) return;

    byControl = true;
    audioObj.pause();
    $("#adoBtnPlay").show();
    $("#adoBtnPause").hide();
  });

  $("#adoBtnStop").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (audioObj == null) return;

    byControl = false;
    audioObj.pause();
    $("#adoObjectBar").hide();
  });

  //$('[data-audio],[data-audio-start],[data-audio-end]').on('touchend mouseup', function(event) {
  // $('[data-audio] span,[data-audio-start] span,[data-audio-end] span').off('touchstart click');
  // $('[data-audio] span,[data-audio-start] span,[data-audio-end] span').on('touchstart click', function(event) {
  // 	event.preventDefault();
  // 	event.stopPropagation();
  // 	//console.log(this);
  // 	try {
  // 		audioEventHandler(this);
  // 	} catch(err) {
  // 		alert(err);
  // 	}
  // });

  $("[data-audio] input").on("touchstart click", function (event) {
    //event.preventDefault();
    event.stopPropagation();
    // do nothing..
  });

  // audioList, delay, audioSpeak
  $("[data-audioList]").off("touchstart click");
  $("[data-audioList]").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    var list; //eval('[' + $(this).attr('data-audioList') + ']');
    var delays = [];
    var audioSpeak = false;
    var attr = $(this).attr("data-audioList");

    list = attr.split(",");

    if (this.hasAttribute("data-delay")) {
      attr = $(this).attr("data-delay");
      delays = attr.split(",");
    }
    if (
      this.hasAttribute("data-audioSpeak") &&
      $(this).attr("data-audioSpeak") == "true"
    ) {
      audioSpeak = true;
    }

    //console.log(list);
    audioEventHandler2(this, list, delays, audioSpeak);
  });

  $("#pop_script_X,#pop_dictation_X").click(function () {
    audioObj.pause();
    audioObj.adoList = null;
  });

  // audio_Box 제어 추가
  $(".audio_Box").each(function (idx, obj) {
    $(this).append(
      "<img id='btn_audio' class='audio' src='../images/common/btn_audio.png' alt='' /><div class='playtime'>00:00</div><img id='btn_play' class='audio' src='../images/common/btn_play.png' alt='' /><img id='btn_pause' style='display:none' class='audio' src='../images/common/btn_pause.png' alt='' /><img id='btn_stop' style='display:none' class='audio' src='../images/common/btn_stop.png' alt='' /><input type='range' value='0' min='0' /><img id='btn_audioclose' class='audio' src='../images/common/btn_audioclose.png' alt='' />"
    );
    obj.paused = false;

    $("div.playtime").css({
      position: "absolute",
      top: 0,
      left: 80,
      "font-size": "2em",
      "line-height": "75px",
      height: 75,
      "margin-left": 20,
      "font-family": "sans-serif",
    });

    $(".audio_Box #btn_audio").click(function () {
      if ($(obj).width() == 75) {
        showAudioCon();
      } else {
        hideAudioCon();
      }
    });
    $(".audio_Box #btn_play").click(function () {
      if (obj.paused) {
        if ($(".audio_Box input").val() > 0) {
          // alert($('.audio_Box input').val());
          console.log("start from slider position");
          audioObj.currentTime = $(".audio_Box input").val();
        }
        audioObj.play();
      } else {
        audioEventHandler($("#reading")[0]);
      }
    });
    $(".audio_Box #btn_pause").click(function () {
      audioObj.pause();
      obj.paused = true;
    });
    $(".audio_Box #btn_stop").click(function () {
      audioObj.pause();
      audioObj.currentTime = 0;
    });
    $(".audio_Box #btn_audioclose").click(function () {
      hideAudioCon();
    });
  });

  if ($(".audio_Box").length > 0) {
    $(window).on("load", function () {
      // 오디오 자동 플레이 안함
      // audioEventHandler($('#reading')[0]);
      $("#btn_pause,#btn_stop").hide();
      showAudioCon();
    });
    $(".audio_Box input").on("change input", function (event) {
      event.preventDefault();
      event.stopPropagation();

      audioObj.currentTime = $(this).val();
    });
  }
}

function audioPlayed() {
  $(".audio_Box #btn_play").hide();
  $(".audio_Box #btn_pause,.audio_Box #btn_stop").show();
  $(".audio_Box input").attr("max", audioObj.duration);
  $(".audio_Box input").val(0);
  paused = false;
}

function audioPaused() {
  $(".audio_Box #btn_play").show();
  $(".audio_Box #btn_pause,.audio_Box #btn_stop").hide();
}

function audioEnded() {
  $(".audio_Box #btn_play").show();
  $(".audio_Box #btn_pause,.audio_Box #btn_stop").hide();
  $(".audio_Box")[0].paused = true;
  audioObj.pause();
}

function audioTimeUpdated() {
  $(".audio_Box input").val(audioObj.currentTime);
  $("div.playtime").text(getTimeFormat(audioObj.currentTime));
}

function getTimeFormat(ts) {
  ts = Math.round(ts);
  var hh = Math.floor(ts / 60);
  var mm = ts % 60;

  return hh.toString().padStart(2, "0") + ":" + mm.toString().padStart(2, "0");
}

function showAudioCon() {
  $("#audio_con").transition({ width: 560 });
}

function hideAudioCon() {
  $("#audio_con").transition({ width: 75 });
}

var playingAudioObj = null;
var byControl = false;

function audioEventHandler2(this2, adoList, listDelays, isSpeak) {
  var src = $(this2).attr("data-audio");
  var ofParent = false;

  if (adoList == undefined || adoList.length < 1) {
    return;
  }

  audioObj.adoList = adoList;
  audioObj.currentIndex = 0;
  audioObj.isSpeak = isSpeak;

  if (listDelays == undefined || listDelays.length < adoList.length - 1) {
    var arr1 = [];
    for (var i = 0; i < adoList.length; i++) {
      if (listDelays[i] == undefined || listDelays[i] < 0) {
        arr1[i] = 0;
      } else {
        arr1[i] = listDelays[i];
      }
    }
    listDelays = arr1;
  }
  audioObj.listDelays = listDelays;

  // console.log(listDelays);

  if (audioObj != null) {
    if (
      (audioObj.play && !audioObj.paused) ||
      $("#speak").hasClass("speak_ani")
    ) {
      audioObj.pause();
      audioObj.currentTime = 0;
      return;
    }
  }

  // 한번더 터치 시 pause 처리

  // event.preventDefault(); event.stopPropagation();

  $(audioObj).off("loadedmetadata load");
  $(audioObj).on("loadedmetadata load", function (event) {
    event.preventDefault();
    event.stopPropagation();

    audioObj.currentTime = 0;
    audioObj.playbackRate = playbackRate;
    if (audioObj.currentIndex == audioObj.adoList.length) {
      audioObj.pause();
      audioObj.currentIndex = 0;
      setTimeout(function () {
        $(".play_audio").removeClass("play_audio");
      }, 100);

      return;
    } else {
      var delay1 = audioObj.listDelays[audioObj.currentIndex];

      try {
        if (audioObj.isSpeak && audioObj.currentIndex > 0) {
          $("#speak").addClass("speak_ani");
          //console.log('delay:' + delay1 + '\t' + audioObj.durationP);

          delay1 += audioObj.durationP * 1000;
        }
        playingAudioObj = this2;

        setTimeout(function () {
          $('[data-audio="' + audioObj.src2 + '"]').each(function (idx, obj) {
            var scp;
            $(obj)
              .parents()
              .each(function (idx, obj2) {
                if (obj2.id == "content") {
                  return false;
                }
                if (
                  $(obj2).css("overflow-y") == "scroll" &&
                  obj2.scrollHeight != $(obj2).outerHeight()
                ) {
                  scp = obj2;
                  //console.log(scp);
                  return false;
                }
              });
            if (scp != null) {
              var vobj = $(obj);

              if (vobj != null && vobj.length > 0) {
                var vtop =
                  scp.scrollTop +
                  (vobj.offset().top - $(scp).offset().top) -
                  50;

                vtop = vtop < 0 ? 0 : vtop;
                $(scp).animate(
                  {
                    scrollTop: vtop,
                  },
                  100
                );
              }
            }
          });
          $("#speak").removeClass("speak_ani");
          audioObj.play();
        }, delay1);
      } catch (err) {
        setTimeout(function () {
          audioObj.play();
        }, delay1 + 5);
      }
      audioObj.currentIndex++;
    }
  });

  $(audioObj).off("play");
  $(audioObj).on("play", function () {
    $(".play_audio").removeClass("play_audio");
    $("#adoBtnPlay").hide();
    $("#adoObjectBar,#adoBtnPause").show();
    byControl = false;
  });

  $(audioObj).off("pause ended");
  $(audioObj).on("pause ended", function (event) {
    $(".play_audio").removeClass("play_audio");
    playingAudioObj = null;

    if (byControl != true) {
      $("#adoObjectBar").hide();
    } else {
      $("#adoBtnPlay").show();
      $("#adoBtnPause").hide();
    }

    if (event.type == "ended") {
      $("#speak").removeClass("speak_ani");
      audioObj.durationP = audioObj.duration;
      if (audioObj.currentIndex < audioObj.adoList.length) {
        // audioObj.currentIndex ++;
        audioObj.src2 = audioObj.adoList[audioObj.currentIndex];
        audioObj.src =
          "audio/" + audioObj.adoList[audioObj.currentIndex] + "." + adoExt;
      } else {
        //audioObj.currentIndex = 0;
        audioObj.src2 = audioObj.adoList[0];
        audioObj.src = "audio/" + audioObj.adoList[0] + "." + adoExt;
        //audioObj.pause();
        return;
      }

      try {
        enableAudio(document.body, audioObj);
      } catch (err) {}
    }
  });

  $(audioObj).off("timeupdate");
  $(audioObj).on("timeupdate", function () {
    if (audioObj.currentTime > 0)
      $('[data-audio="' + audioObj.src2 + '"]').addClass("play_audio");
  });

  audioObj.src =
    "audio/" + audioObj.adoList[audioObj.currentIndex] + "." + adoExt;
  audioObj.src2 = audioObj.adoList[0];
  try {
    enableAudio(document.body, audioObj);
  } catch (err) {}
}

function audioEventHandler(this2) {
  var src = $(this2).attr("data-audio");
  var ofParent = false;
  var input = $(this2).find("input,textarea");
  var btnChoice = $(this2).find(".btnChoice,.btnChoice2");

  if (input.length > 0 && !input[0].hasAttribute("readonly")) {
    return;
  }

  if (btnChoice.length > 0 && !btnChoice.hasClass("correct_answer")) {
    return;
  }

  if (
    this2.tagName.toLowerCase() == "textarea" ||
    this2.tagName.toLowerCase() == "input"
  ) {
    if (!this2.hasAttribute("readonly")) {
      return;
    }
  }

  if (src == undefined || src.trim().length < 1) {
    var pp = $(this2).parents("[data-audio]");
    if (pp.length == 0) return;

    src = pp.attr("data-audio");
    ofParent = true;
  }

  var src2 = src;
  src = "audio/" + src + "." + adoExt;

  if (audioObj != null) {
    if (audioObj.play && !audioObj.paused) {
      audioObj.pause();
    }

    if (playingAudioObj == this2) {
      playingAudioObj = null;
      audioObj.play();

      return;
    }
  }

  playingAudioObj = this2;

  //audioObj = new Audio(src);
  //audioObj.src = src;

  var start = 0;
  var end = 0; //audioObj.duration;

  $(audioObj).off("loadedmetadata");
  $(audioObj).on("loadedmetadata", function (event) {
    event.preventDefault();
    event.stopPropagation();

    end = audioObj.duration;

    start = getFloatValue($(this2).attr("data-audio-start"), start);
    end = getFloatValue($(this2).attr("data-audio-end"), end);

    audioObj.currentTime = start;

    // if(isIE())
    // audioObj.currentTime=start-0.5<0?0:start-0.5;

    try {
      playingAudioObj = this2;

      setTimeout(function () {
        audioObj.play();
      }, 10);
    } catch (err) {
      setTimeout(function () {
        audioObj.play();
      }, 15);
    }
  });

  audioObj.src = src;
  audioObj.load();
  try {
    enableAudio(document.body, audioObj);
  } catch (err) {}

  start = 0;
  end = audioObj.duration;

  start = getFloatValue(
    $(this2).parents("[data-audio-start]").attr("data-audio-start"),
    start
  );
  end = getFloatValue(
    $(this2).parents("[data-audio-start]").attr("data-audio-end"),
    end
  );

  $(audioObj).off("play");
  $(audioObj).on("play", function () {
    $(".play_audio").removeClass("play_audio");
    $("#adoBtnPlay").hide();
    $("#adoObjectBar,#adoBtnPause").show();
    if (typeof audioPlayed == "function") {
      audioPlayed();
    }
    byControl = false;
  });

  $(audioObj).off("pause ended");
  $(audioObj).on("pause ended", function (event) {
    $(".play_audio").removeClass("play_audio");
    playingAudioObj = null;

    if (byControl != true) {
      $("#adoObjectBar").hide();
    } else {
      $("#adoBtnPlay").show();
      $("#adoBtnPause").hide();
    }

    if (event.type == "pause") {
      if (typeof audioPaused == "function") {
        audioPaused();
      }
    } else if (event.type == "ended") {
      if (typeof audioEnded == "function") {
        audioEnded();
      }
    }
  });

  var hasRange = false;
  $('[data-audio="' + src2 + '"]').each(function (idx, obj) {
    if (
      obj.hasAttribute("data-audio-start") ||
      obj.hasAttribute("data-audio-end")
    ) {
      hasRange = true;
      return false;
    }

    if ($(obj).find("[data-audio-start],[data-audio-end]").length > 0)
      hasRange = true;
  });

  $(audioObj).off("timeupdate");
  $(audioObj).on("timeupdate", function () {
    // if(audioObj.currentTime>=end) {
    // 	audioObj.pause();
    // }

    if (hasRange != true) {
      // $('[data-audio="'+src2+'"]').addClass('play_audio');
      $(this2).addClass("play_audio");
    } else {
      $('[data-audio="' + src2 + '"]').each(function (idx, obj) {
        var s1, e1;
        if (
          obj.hasAttribute("data-audio-start") ||
          obj.hasAttribute("data-audio-end")
        ) {
          s1 = getFloatValue($(obj).attr("data-audio-start"), 0);
          e1 = getFloatValue($(obj).attr("data-audio-end"), audioObj.duration);
          if (audioObj.currentTime >= s1 && audioObj.currentTime <= e1) {
            $(obj).addClass("play_audio");
          } else {
            $(obj).removeClass("play_audio");
          }
        }

        $(obj)
          .find("[data-audio-start],[data-audio-end]")
          .each(function (idx2, obj2) {
            s1 = getFloatValue($(obj2).attr("data-audio-start"), 0);
            e1 = getFloatValue(
              $(obj2).attr("data-audio-end"),
              audioObj.duration
            );

            if (audioObj.currentTime >= s1 && audioObj.currentTime <= e1) {
              $(obj2).addClass("play_audio");

              $(obj2)
                .parents()
                .each(function (idx, pt) {
                  if (
                    $(pt).height() < pt.scrollHeight &&
                    $(pt).css("overflow-y") == "auto"
                  ) {
                    var vtop =
                      pt.scrollTop +
                      ($(obj2).offset().top - $(pt).offset().top) -
                      100;
                    vtop = vtop < 0 ? 0 : vtop;
                    //console.log($(obj2).offset().top + ':' + $(pt).offset().top + ':' + vtop);

                    $(pt).stop(true, true);
                    $(pt).animate(
                      {
                        scrollTop: vtop,
                      },
                      100
                    );

                    return false;
                  }
                });

              // if(typeof($(obj2).scrollTo) == 'function') {
              // 	$(obj2).parents().each(function(idx,pt){
              // 		if($(pt).height() < pt.scrollHeight && $(pt).css('overflow-y') == 'scroll') {
              // 			$(pt).stop(true,true);
              // 			$(pt).scrollTo(obj2,300,{over:{top:-1.5},axis:'y',interrupt:true});

              // 			return false;
              // 		}
              // 	});
              // }
            } else {
              $(obj2).removeClass("play_audio");
            }
          });
      });
    }

    if (typeof audioTimeUpdated == "function") {
      audioTimeUpdated();
    }
  });
}

function initTabBox() {
  $(".xyz_tab_box").each(function (idx, obj) {
    function initTooltip() {
      $("span.tooltip, span.tooltip_else").each(function (idx, obj) {
        if (obj.hasAttribute("data-tooltip")) {
          var tit = $(obj).text();
          var txt = $(obj).attr("data-tooltip");

          $(obj).append(
            '<div class="tooltip_wrap" id="tooltip' +
              idx +
              '" style="position:absolute";><img class="btn_close02" src="../images/btn/btn_close02.png" alt=""/><div class="tooltip_tit"><p>' +
              tit +
              '</p></div><div class="tool_tip_txt"><p>' +
              txt +
              "</p></div></div>"
          );
        }

        $(obj).on("touchstart click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          // playAudio(adoTick);

          playAudio(adoClick);

          $(obj).children(".tooltip_wrap").show();
        });

        $(obj)
          .children(".tooltip_wrap")
          .on("touchstart click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            // playAudio(adoTick);

            playAudio(adoClick);

            $(this).hide();
          });
      });
    }
    obj.tabTitle = $(obj).find(".tab_title");
    // obj.tabContent = $(obj).find(".tab_content");

    $(this).height(obj.tabTitle.outerHeight());
  });

  $(".tab_content").each(function (idx, obj) {
    if ($(this).attr("data-xclose") == "true")
      $(this).append(
        "<img class='xclose pointer' style='top:0;right:0;width:24px;' src='images/btn_xclose.png' alt='닫기' />"
      );
  });

  $(".tab_title").click(function () {
    // playAudio(adoTick);

    playAudio(adoClick);
    var content = $(this).attr("data-content");
    $(content)[0].tabTitle = this;

    var bt =
      $(this).parent(".xyz_tab_box").attr("data-content-toggle") == "true";
    if ($(content).css("display") != "block") {
      $(this).parent(".xyz_tab_box")[0].tabContent.hide();
      $(this).parent(".xyz_tab_box")[0].tabTitle.removeClass("tab_active");
      $(this).addClass("tab_active");
      //showPopup($(content));
      $(content).show();
    } else if (bt) {
      $(this).removeClass("tab_active");
      //hidePopup($(content));
      $(content).hide();
    }
  });

  $(".tab_content .xclose").click(function () {
    // playAudio(adoTick);

    playAudio(adoClick);
    $($(this).parent(".tab_content")[0].tabTitle).removeClass("tab_active");
    //hidePopup($(this).parent('.tab_content'));
    $(this).parent(".tab_content").hide();
  });
}

function goPage(pageNum) {
  window.open(pageNum + ".html");
}

function getFloatValue(str, defaultVal) {
  if (str != undefined && !isNaN(str)) {
    return parseFloat(str);
  }
  return defaultVal;
}

function isIE() {
  return (
    navigator.userAgent.indexOf("Trident") > -1 ||
    navigator.userAgent.indexOf("Edge") > -1 ||
    navigator.userAgent.indexOf("MSIE") > -1
  );
}

/* 별 */
$(document).ready(function () {
  $(".star01").click(function () {
    // playAudio(adoTick);

    playAudio(adoClick);

    var arr = $(this).parent().find(".star01");
    var this2 = this;

    var b = true;
    arr.each(function (idx, obj) {
      if (b) {
        this.src = "images/o_star2-1.png";
      } else {
        this.src = "images/o_star2.png";
      }
      if (obj == this2) b = false;
    });
  });
});

$(document).ready(function () {
  $(".star02").click(function () {
    // playAudio(adoTick);

    playAudio(adoClick);
    function initPage() {
      // var parentBody = window.parent.document.body;
      // var next = $(parentBody).find('#btn_next');
      $("#btn_start").on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(".temp05_B").find("#content").show();
        $(".temp05_A").hide();
        // playAudio(adoTick);

        playAudio(adoClick);
        // setTimeout(function() {
        // 	$(next).trigger('click');
        // },300);
      });
      $("#imgstart").on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        $(".temp05_A").hide();
        $("#puzl_container").show();
        // playAudio(adoTick);

        playAudio(adoClick);
        // setTimeout(function() {
        // 	$(next).trigger('click');
        // },300);
      });
    }

    var arr = $(this).parent().find(".star02");
    var this2 = this;

    var b = true;
    arr.each(function (idx, obj) {
      if (b) {
        this.src = "images/o_star1.png";
      } else {
        this.src = "images/star.png";
      }
      if (obj == this2) b = false;
    });
  });
});

/*학습목표 dot*/

$(document).ready(function () {
  var pcount = $(".plan_wrap .plan_txt").find("p").length;

  $(".plan_wrap .plan_txt").find("p").addClass("dot_in");
  $(".plan_wrap .plan_txt").find("p").prepend('<span class="check"></span>');
});

// 줌

function zoomIcon() {
  $("div.zoom").each(function (idx, itm) {
    $(
      '<img class="zoom_body" src="../images/btn/zoom_body.png" alt=""><img class="zoom_bar" src="../images/btn/zoom_bar.png" alt=""><div class="slider_wrap"><img class="zoom_bar2" src="../images/btn/zoom_bar2.png" alt=""></div><img class="zoom_full" src="../images/btn/zoom_full.png" alt="">'
    ).appendTo(itm);
  });
}

/* 팝업 */

$(document).ready(function () {
  $(".btn_plus, .btn_eyesconf, .btn_com, .bd_dash, .btn_video, .btn_pop").on(
    "touchstart click",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      // playAudio(adoTick);

      playAudio(adoClick);

      var popId = $(this).attr("data-pop");
      var popSlide = $(this).attr("data-slide");
      var lastSlide = $(this).siblings("[data-slide]").length;

      $("#" + popId)
        .find(".check_box, .check_f")
        .removeClass("on");
      // 버튼 누르기전 페이지에 영상이 있을경우

      if ($(this).parent().find(".video").length > 0) {
        $(this)
          .parent()
          .find(".video")
          .each(function (idx2, obj) {
            obj.video.pause();
          });
      }

      if (this.hasAttribute("data-slide")) {
        $("#" + popId).show();
        // $("#" + popId)
        //     .parent()
        //     .append('<div class="back_shadow"></div>');
        if (
          $("#" + popId)
            .parent()
            .find(".back_shadow").length < 1
        ) {
          $("#" + popId)
            .parent()
            .append('<div class="back_shadow"></div>');
        }
        if ($(this).hasClass("btn_com")) {
          $(this).css("z-index", "601");
        }
        $("#" + popId)
          .find(".slide_content")
          .removeClass("on");
        $("#" + popId)
          .find(".nav_slide")
          .removeClass("on");
        $("#" + popId)
          .find(".slide_content:eq(" + popSlide + ")")
          .addClass("on");
        $("#" + popId)
          .find(".nav_slide:eq(" + popSlide + ")")
          .addClass("on");
        if (popSlide == 0) {
          $("#" + popId)
            .find(".prev")
            .hide();
          $("#" + popId)
            .find(".next")
            .show();
          i = 1;
          // slideOn(i);
        } else if (popSlide == -1) {
          $("#" + popId)
            .find(".prev")
            .show();
          $("#" + popId)
            .find(".next")
            .hide();
          i = parseInt(lastSlide) - 1;
          // slideOn(i);
        } else {
          $("#" + popId)
            .find(".prev")
            .show();
          $("#" + popId)
            .find(".next")
            .show();
          i = parseInt(popSlide);
          // slideOn(i);
        }
      } else {
        $("#" + popId).show();
        if (
          $("#" + popId)
            .parent()
            .find(".back_shadow").length < 1
        ) {
          $("#" + popId)
            .parent()
            .append('<div class="back_shadow"></div>');
        }
        if ($(this).hasClass("btn_com")) {
          $(this).css("z-index", "601");
        }
        // $("#" + popId)
        //     .parent()
        //     .append('<div class="back_shadow"></div>');
        $("#" + popId)
          .find(".btnPlayB")
          .show();
      }
    }
  );

  $(".btn_conf, .btn_mat").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // playAudio(adoTick);

    playAudio(adoClick);
    $(".smallpop, .conf_small").hide();

    var popId = $(this).attr("data-pop");

    $("#" + popId).show();
    $("#" + popId).parent();
  });

  $(".pop_click2").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $(".pop_click2").show();
    $(this).hide();
    // playAudio(adoTick);

    playAudio(adoClick);
    $(".smallpop, .conf_small").hide();

    var popId = $(this).attr("data-pop");

    // $("#" + popId).show();

    var popId = $(this).attr("data-pop");
    var popSlide = $(this).attr("data-slide");
    var lastSlide = $(this).siblings("[data-slide]").length;

    if (this.hasAttribute("data-slide")) {
      $("#" + popId).show();
      // $("#" + popId).parent().append('<div class="back_shadow"></div>');
      $("#" + popId)
        .find(".slide_content")
        .removeClass("on");
      $("#" + popId)
        .find(".nav_slide")
        .removeClass("on");
      $("#" + popId)
        .find(".slide_content:eq(" + popSlide + ")")
        .addClass("on");
      $("#" + popId)
        .find(".nav_slide:eq(" + popSlide + ")")
        .addClass("on");
      if (popSlide == 0) {
        $("#" + popId)
          .find(".prev")
          .hide();
        $("#" + popId)
          .find(".next")
          .show();
        i = 1;
        // slideOn(i);
      } else if (popSlide == -1) {
        $("#" + popId)
          .find(".prev")
          .show();
        $("#" + popId)
          .find(".next")
          .hide();
        i = parseInt(lastSlide) - 1;
        // slideOn(i);
      } else {
        $("#" + popId)
          .find(".prev")
          .show();
        $("#" + popId)
          .find(".next")
          .show();
        i = parseInt(popSlide);
        // slideOn(i);
      }
    } else {
      $("#" + popId).show();
    }
  });

  /* 이야기 팝업 */

  // $(".btn_story").on("touchstart click", function (event) {
  //     event.preventDefault();
  //     event.stopPropagation();

  //     playAudio(adoTick);

  //     var popId = $(this).attr("data-pop");

  //     $("#" + popId).show();
  //     $("#" + popId)
  //         .parent()
  //         .append('<div class="back_shadow"></div>');
  //     // $('#'+popId).find('.btnPlayB').show();
  //     $("#" + popId)
  //         .find(".slide_content")
  //         .removeClass("on");
  //     $("#" + popId)
  //         .find(".slide_content:eq(0)")
  //         .addClass("on");
  //     $("#" + popId)
  //         .find(".nav_slide")
  //         .removeClass("on");
  //     $("#" + popId)
  //         .find(".nav_slide:eq(0)")
  //         .addClass("on");
  //     $("#" + popId)
  //         .find(".prev")
  //         .hide();
  //     $("#" + popId)
  //         .find(".next")
  //         .show();
  // });

  /* 준비물 팝업 */

  $(".pop_click, .mat_btn").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // playAudio(adoTick);
    playAudio(adoClick);

    var popId = $(this).attr("data-pop");
    var popSlide = $(this).attr("data-slide");

    $("#" + popId).show();

    if (
      $("#" + popId)
        .parent()
        .find(".back_shadow").length < 1
    ) {
      $("#" + popId)
        .parent()
        .append('<div class="back_shadow"></div>');
    }
    // $("#" + popId)
    //     .parent()
    //     .append('<div class="back_shadow"></div>');
    $("#" + popId)
      .find(".slide_content")
      .removeClass("on");
    $("#" + popId)
      .find(".nav_slide")
      .removeClass("on");
    $("#" + popId)
      .find(".slide_content:eq(" + popSlide + ")")
      .addClass("on");
    $("#" + popId)
      .find(".nav_slide:eq(" + popSlide + ")")
      .addClass("on");
    if (popSlide == 0) {
      $("#" + popId)
        .find(".prev")
        .hide();
      $("#" + popId)
        .find(".next")
        .show();
    } else if (popSlide == -1) {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .hide();
    } else {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .show();
    }
  });

  /* 돋보기 팝업 */

  $(".btn_mag").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // playAudio(adoTick);

    playAudio(adoClick);

    var popId = $(this).attr("data-pop");
    var popSlide = $(this).attr("data-slide");

    $("#" + popId).show();
    // $("#" + popId)
    //     .parent()
    //     .append('<div class="back_shadow"></div>');
    if (
      $("#" + popId)
        .parent()
        .find(".back_shadow").length < 1
    ) {
      $("#" + popId)
        .parent()
        .append('<div class="back_shadow"></div>');
    }
    $("#" + popId)
      .find(".slide_content")
      .removeClass("on");
    $("#" + popId)
      .find(".nav_slide")
      .removeClass("on");
    $("#" + popId)
      .find(".slide_content:eq(" + popSlide + ")")
      .addClass("on");
    $("#" + popId)
      .find(".nav_slide:eq(" + popSlide + ")")
      .addClass("on");
    if (popSlide == 0) {
      $("#" + popId)
        .find(".prev")
        .hide();
      $("#" + popId)
        .find(".next")
        .show();
    } else if (popSlide == -1) {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .hide();
    } else {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .show();
    }
  });
  /* 대쉬박스 팝업 팝업 */

  $(".show_pop").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // playAudio(adoTick);

    playAudio(adoClick);

    var popId = $(this).attr("data-pop");
    var popSlide = $(this).attr("data-slide");

    $("#" + popId).show();
    // $("#" + popId)
    //     .parent()
    //     .append('<div class="back_shadow"></div>');
    if (
      $("#" + popId)
        .parent()
        .find(".back_shadow").length < 1
    ) {
      $("#" + popId)
        .parent()
        .append('<div class="back_shadow"></div>');
    }
    // if ($(this).hasClass('show_pop')) {

    $(this).css("z-index", "601");
    // }
    $("#" + popId)
      .find(".slide_content")
      .removeClass("on");
    $("#" + popId)
      .find(".nav_slide")
      .removeClass("on");
    $("#" + popId)
      .find(".slide_content:eq(" + popSlide + ")")
      .addClass("on");
    $("#" + popId)
      .find(".nav_slide:eq(" + popSlide + ")")
      .addClass("on");
    if (popSlide == 0) {
      $("#" + popId)
        .find(".prev")
        .hide();
      $("#" + popId)
        .find(".next")
        .show();
    } else if (popSlide == -1) {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .hide();
    } else {
      $("#" + popId)
        .find(".prev")
        .show();
      $("#" + popId)
        .find(".next")
        .show();
    }
  });

  // 주의 확성기 버튼

  /* 대쉬박스 팝업 팝업 */
  $(".btn_speaker").each(function (idx2, obj) {
    var popId = $(obj).attr("data-pop");

    $(obj).on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      // playAudio(adoTick);

      playAudio(adoClick);

      if ($(this).hasClass("on")) {
        $(this).removeClass("on");
        $("#" + popId).hide();
      } else {
        $(this).addClass("on");
        $("#" + popId).show();
      }
    });

    $(".pink_close").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      baID = $(this).parent().attr("id");
      // playAudio(adoTick);
      playAudio(adoClick);

      $(this).parent().hide();

      $('.btn_speaker[data-pop="' + baID + '"]').removeClass("on");
    });

    $("#contents")
      .find(".tab_item")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        clickMotion();
        $(".mat_wrap").find(".mat").find(".check_box").removeClass("on");
        $(".mat_wrap").find(".mat").find("p").css("color", "#000");
      });
  });
});

/********************************************************
 * 학습목표 자동 저장 및 로드 처리 2022.05.23  -- 시작
 ********************************************************/
$(document).ready(function () {
  if (
    window.localStorage == undefined ||
    window.localStorage.getItem == undefined ||
    window.localStorage.setItem == undefined
  ) {
    return;
  }

  // 학습목표 textarea 에 대한 Selector 지정
  var learningObjectivesSelector = "textarea.self_txt";
  // 학습목표 저장 및 불러오기 설정
  function initLearningObjectives() {
    // load stored data
    $(learningObjectivesSelector).each(function (idx, tbox) {
      var val = window.localStorage.getItem(getStoreKey(tbox));
      if (val == undefined) return true;

      $(tbox).val(val);
    });

    // bind events
    $(learningObjectivesSelector).on("change, input", function () {
      window.localStorage.setItem(getStoreKey(this), $(this).val());
    });
  }

  function getStoreKey(obj) {
    console.log("xpath", createXPathFromElement(obj));
    return location.pathname + "#" + createXPathFromElement(obj);
  }

  function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName("*");
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
      if (elm.hasAttribute("id")) {
        var uniqueIdCount = 0;
        for (var n = 0; n < allNodes.length; n++) {
          if (allNodes[n].hasAttribute("id") && allNodes[n].id == elm.id)
            uniqueIdCount++;
          if (uniqueIdCount > 1) break;
        }
        if (uniqueIdCount == 1) {
          segs.unshift('id("' + elm.getAttribute("id") + '")');
          return segs.join("/");
        } else {
          segs.unshift(
            elm.localName.toLowerCase() +
              '[@id="' +
              elm.getAttribute("id") +
              '"]'
          );
        }
      } else if (elm.hasAttribute("class")) {
        segs.unshift(
          elm.localName.toLowerCase() +
            '[@class="' +
            elm.getAttribute("class") +
            '"]'
        );
      } else {
        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
          if (sib.localName == elm.localName) i++;
        }
        segs.unshift(elm.localName.toLowerCase() + "[" + i + "]");
      }
    }
    return segs.length ? "/" + segs.join("/") : null;
  }

  function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(
      path,
      document.documentElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  }

  initLearningObjectives();
});
/********************************************************
 * 학습목표 자동 저장 및 로드 처리 2022.05.23  -- 종료
 ********************************************************/

function initSlide() {
  $(".slide").each(function (idx, obj) {
    $(obj).wrap(
      '<div class="slide_wrap" id="slide_w"' +
        idx +
        ' style="position:relative;width:' +
        $(obj).width() +
        "px;height:" +
        $(obj).height() +
        'px"></div>'
    );
    $(obj).before(
      '<div class="nav_wrap"><div class="prev" id="slide_p' +
        idx +
        '"></div><div class="nav"></div><div class="next" id="slide_n' +
        idx +
        '"></div></div>'
    );

    var sl = $(obj).children(".slide_content");
    var c = $(obj).children(".slide_content").length;
    var vdo = $(obj).find(".video")[0];
    var nav = $(obj).siblings(".nav_wrap");
    var i = 0;

    $(sl).each(function (idx2, obj2) {
      nav
        .children(".nav")
        .append(
          '<button class="nav_slide" id="slide_nav' +
            idx2 +
            '" style="cursor:pointer"></button>'
        );
    });

    $(".plus_popup .close").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      // var eqId = parseInt($(".nav_slide.on").attr("id").slice(-1)) + 1;
      // console.log("close click");
      var thisNum = $(".nav_slide.on:eq(0)").attr("id").slice(-1);
      $(".nav_slide.on:eq(0)").show();
      // console.log(thisNum);
      slideOn(i);
    });

    $(nav)
      .children(".nav")
      .children(".nav_slide")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        $(".check_f").removeClass("on");
        $(".retry").removeClass("retry");
        $(".answer1").css({
          visibility: "hidden",
        });
        $(".answer2").css({
          visibility: "hidden",
        });
        $(".answer3").css({
          visibility: "hidden",
        });
        $(".xyz_reveal").show();

        $(".smallpop, .conf_small").hide();
        i = $(this).attr("id").split("slide_nav")[1] / 1;
        playAudio(adoTick);

        slideOn(i);

        // answer reset
        $(this)
          .parents("#contents")
          .find(".assessmentGroup")
          .each(function (idx1, obj1) {
            obj1.reset();
          });
      });

    nav.children(".prev").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      $(".check_f").removeClass("on");
      $(".retry").removeClass("retry");
      $(".answer1").css({
        visibility: "hidden",
      });
      $(".answer2").css({
        visibility: "hidden",
      });
      $(".answer3").css({
        visibility: "hidden",
      });
      $(".xyz_reveal").show();

      var prv = $(this)
        .next(".nav")
        .children("#slide_nav" + i);
      if (!$(prv).hasClass("on")) {
        var prvId = $(this).next(".nav").children(".on").attr("id");
        var lastPrvId = prvId.charAt(prvId.length - 1);
        i = lastPrvId;
      }
      // console.log(i);
      // playAudio(adoTick);
      playAudio(adoClick);
      i = i - 1;
      // console.log("i : " + i);
      if (i < 0) {
        i = 0;
        return;
      }
      // console.log(i);
      slideOn(i);
      slidePage(i + 1);
      if ($(this).parents("#card_container").length > 0) {
        window.timerBar();
        $("#card_container").find(".suggestion").hide();
        $("#card_container").find(".card").removeClass("cardflip");
      }

      $(this)
        .parents("#contents")
        .find(".assessmentGroup")
        .each(function (idx1, obj1) {
          obj1.reset();
        });
    });

    if (
      $(".btn_mag, .pop_click, .show_pop, .btn_pop, .clickArea").length >= 1
    ) {
      // console.log("mag length true");
      $(".btn_mag, .pop_click, .show_pop, .btn_pop, .clickArea").on(
        "touchstart click",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          var popId = $(this).attr("data-pop");
          var slideNum = parseInt($(this).attr("data-slide"));
          var lastSlide = $(this).length;

          if (slideNum == -1) {
            i = lastSlide - 1;
          } else {
            i = slideNum;
          }

          $("#" + popId)
            .find(".close")
            .on("touchstart click", function (event) {
              event.preventDefault();
              event.stopPropagation();

              var pageNum;

              if ($("#contents").find(".tab_wrap").length > 0) {
                pageNum = parseInt(
                  $("#contents")
                    .find(".tab_content.on .nav_slide.on")
                    .attr("id")
                    .split("slide_nav")[1]
                );

                i = pageNum;
              } else {
                pageNum = parseInt(
                  $("#contents")
                    .find(".nav_slide.on")
                    .attr("id")
                    .split("slide_nav")[1]
                );

                i = pageNum;
              }
            });
        }
      );
    }

    nav.children(".next").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      $(".check_f").removeClass("on");
      $(".retry").removeClass("retry");
      $(".answer1").css({
        visibility: "hidden",
      });
      $(".answer2").css({
        visibility: "hidden",
      });
      $(".answer3").css({
        visibility: "hidden",
      });
      $(".xyz_reveal").show();

      $(this)
        .parents("#contents")
        .find(".assessmentGroup")
        .each(function (idx1, obj1) {
          obj1.reset();
        });

      var nxt = $(this).prev(".nav").children("#slide_nav0");
      if ($(nxt).hasClass("on") && !i == 0) {
        i = 0;
      }
      // playAudio(adoTick);
      playAudio(adoClick);
      i = i + 1;
      // console.log("i : " + i);
      if (i == c) {
        i = c - 1;
        return;
      }
      // console.log(i);
      slideOn(i);
      slidePage(i + 1);
      if ($(this).parents("#card_container").length > 0) {
        window.timerBar();
        $("#card_container").find(".suggestion").hide();
        $("#card_container").find(".card").removeClass("cardflip");
      }
    });

    slideOn(i);
    function slideOn(i) {
      makeScrollbar3();
      if ($(obj).parents(".slide").length > 0) {
      }
      if (i == 0) {
        // 240701 내부검수
        // $(obj).parent(".slide_wrap").find(".prev").hide();
        $(obj).parent(".slide_wrap").find(".prev").removeClass("abled");
        $(obj).parent(".slide_wrap").find(".prev").addClass("disabled");
      } else {
        $(obj).parent(".slide_wrap").find(".prev").removeClass("disabled");
        $(obj).parent(".slide_wrap").find(".prev").addClass("abled");
        $(obj)
          .parent(".slide_wrap")
          .find(".prev")
          .attr("aria-label", "이전페이지로 이동");
        $(obj)
          .parent(".slide_wrap")
          .find(".prev")
          .attr("title", "이전페이지로 이동");
        $(obj).parent(".slide_wrap").find(".prev").show();
      }
      if (i == $(obj).children(".slide_content").length - 1) {
        // $(obj).parent(".slide_wrap").find(".next").hide();
        $(obj).parent(".slide_wrap").find(".next").removeClass("abled");
        $(obj).parent(".slide_wrap").find(".next").addClass("disabled");
      } else {
        $(obj).parent(".slide_wrap").find(".next").removeClass("disabled");
        $(obj).parent(".slide_wrap").find(".next").addClass("abled");
        $(obj)
          .parent(".slide_wrap")
          .find(".next")
          .attr("aria-label", "다음페이지로 이동");
        $(obj)
          .parent(".slide_wrap")
          .find(".next")
          .attr("title", "다음페이지로 이동");
        $(obj).parent(".slide_wrap").find(".next").show();
      }
      if ($(obj).children(".slide_content").length == 1) {
        $(obj).parent(".slide_wrap").find(".next,.prev").hide();
      }

      var nav2 = $(obj)
        .siblings(".nav_wrap")
        .children(".nav")
        .children("div, button");
      if ($(sl[i]).find(".audio").attr("data-audioplay") == "auto") {
        ado = $(sl[i]).find(".audio");
        setTimeout(function () {
          $(ado).trigger("click");
        }, 1000);
      }

      $("audio,video").each(function (idx, ado) {
        try {
          $(ado)[0].pause();
        } catch (err) {}
      });

      $(vdo).find(".btnStop").trigger("click");
      $(nav2).removeClass("on").removeAttr("title");
      $(nav2[i]).addClass("on").attr("title", "선택됨");
      $(sl).removeClass("on");
      $(sl[i]).addClass("on");
      // if ($(".slide_content").parents(".on").length == 0) {
      //     $(".slide_content.on").removeClass("on");
      // } else {
      //     console.log("slide in tab");
      //     $(".on .slide_content:eq(0)").addClass("on");
      // }

      // initLineConnection();
    }

    function slidePage(i) {
      if ($("#card_container").find("#pagecheck").length > 0) {
        $("#pagecheck").find(".nowpage").text(i);
      }
    }
  });

  // graybox 슬라이드

  $(".slide2").each(function (idx, obj) {
    $(obj).wrap(
      '<div class="slide_wrap" id="slide_w"' +
        idx +
        ' style="position:relative;width:' +
        $(obj).width() +
        "px;height:" +
        $(obj).height() +
        'px"></div>'
    );
    $(obj).before(
      '<div class="nav_wrap"><div class="prev2" id="slide_p' +
        idx +
        '"></div><div class="nav2"></div><div class="next2" id="slide_n' +
        idx +
        '"></div></div>'
    );

    var sl = $(obj).children(".slide_content2");
    var c = $(obj).children(".slide_content2").length;
    var vdo = $(obj).find(".video")[0];
    var nav = $(obj).siblings(".nav_wrap");
    var i = 0;

    $(sl).each(function (idx2, obj2) {
      nav
        .children(".nav2")
        .append(
          '<button class="nav_slide2" id="slide_nav' +
            idx2 +
            '" style="cursor:pointer"></button>'
        );
    });

    $(".plus_popup .close").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      // var eqId = parseInt($(".nav_slide2.on").attr("id").slice(-1)) + 1;
      // console.log("close click");
      var thisNum = $(".nav_slide2.on:eq(0)").attr("id").slice(-1);
      $(".nav_slide2.on:eq(0)").show();
      // console.log(thisNum);
      slideOn(i);
    });

    $(nav)
      .children(".nav2")
      .children(".nav_slide2")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        $(".check_f").removeClass("on");
        $(".retry").removeClass("retry");
        $(".answer1").css({
          visibility: "hidden",
        });
        $(".answer2").css({
          visibility: "hidden",
        });
        $(".answer3").css({
          visibility: "hidden",
        });
        $(".xyz_reveal").show();

        $(".smallpop, .conf_small").hide();
        i = $(this).attr("id").split("slide_nav")[1] / 1;
        // playAudio(adoTick);

        playAudio(adoClick);

        slideOn(i);

        if (
          $(this)
            .parents(".answer_box")
            .find(".answer3")
            .css({ visibility: "visible" })
        ) {
          $(this)
            .parents(".answer_box")
            .find(".answer3")
            .css({ visibility: "visible" });
          $(this)
            .parents(".answer_box")
            .find(".xyz_reveal")
            .css({ display: "none" })
            .addClass("revealOn");
          $(this).parents(".answerBtn").find(".btn_answer").addClass("retry");
        } else {
          $(this)
            .parents(".answer_box")
            .find(".answer3")
            .css({ visibility: "hidden" });
          $(this)
            .parents(".answer_box")
            .find(".xyz_reveal")
            .css({ display: "block" })
            .removeClass("revealOn");
          $(this)
            .parents(".answerBtn")
            .find(".btn_answer")
            .removeClass("retry");
        }
      });

    nav.children(".prev2").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      $(".check_f").removeClass("on");
      $(".retry").removeClass("retry");
      $(".answer1").css({
        visibility: "hidden",
      });
      $(".answer2").css({
        visibility: "hidden",
      });
      $(".answer3").css({
        visibility: "hidden",
      });
      $(".xyz_reveal").show();

      var prv = $(this)
        .next(".nav2")
        .children("#slide_nav" + i);
      if (!$(prv).hasClass("on")) {
        var prvId = $(this).next(".nav2").children(".on").attr("id");
        var lastPrvId = prvId.charAt(prvId.length - 1);
        i = lastPrvId;
      }
      // console.log(i);
      // playAudio(adoTick);

      playAudio(adoClick);
      i = i - 1;
      // console.log("i : " + i);
      if (i < 0) {
        i = 0;
        return;
      }
      // console.log(i);
      slideOn(i);
      slidePage(i + 1);
      if ($(this).parents("#card_container").length > 0) {
        window.timerBar();
        $("#card_container").find(".suggestion").hide();
        $("#card_container").find(".card").removeClass("cardflip");
      }

      if (
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "visible" })
      ) {
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "visible" });
        $(this)
          .parents(".answer_box")
          .find(".xyz_reveal")
          .css({ display: "none" })
          .addClass("revealOn");
        $(this).parents(".answerBtn").find(".btn_answer").addClass("retry");
      } else {
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "hidden" });
        $(this)
          .parents(".answer_box")
          .find(".xyz_reveal")
          .css({ display: "block" })
          .removeClass("revealOn");
        $(this).parents(".answerBtn").find(".btn_answer").removeClass("retry");
      }
    });

    if ($(".btn_mag, .pop_click, .show_pop, .btn_pop").length >= 1) {
      // console.log("mag length true");
      $(".btn_mag, .pop_click, .show_pop, .btn_pop").on(
        "touchstart click",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          var popId = $(this).attr("data-pop");
          var slideNum = parseInt($(this).attr("data-slide"));
          var lastSlide = $(this).length;

          if (slideNum == -1) {
            i = lastSlide - 1;
          } else {
            i = slideNum;
          }

          $("#" + popId)
            .find(".close")
            .on("touchstart click", function (event) {
              event.preventDefault();
              event.stopPropagation();

              var pageNum;

              if ($("#contents").find(".tab_wrap").length > 0) {
                pageNum = parseInt(
                  $("#contents")
                    .find(".tab_content.on .nav_slide2.on")
                    .attr("id")
                    .split("slide_nav")[1]
                );

                i = pageNum;
              } else {
                pageNum = parseInt(
                  $("#contents")
                    .find(".nav_slide2.on")
                    .attr("id")
                    .split("slide_nav")[1]
                );

                i = pageNum;
              }
            });
        }
      );
    }

    nav.children(".next2").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      $(".check_f").removeClass("on");
      $(".retry").removeClass("retry");
      $(".answer1").css({
        visibility: "hidden",
      });
      $(".answer2").css({
        visibility: "hidden",
      });
      $(".answer3").css({
        visibility: "hidden",
      });
      $(".xyz_reveal").show();

      var nxt = $(this).prev(".nav2").children("#slide_nav0");
      if ($(nxt).hasClass("on") && !i == 0) {
        i = 0;
      }
      // playAudio(adoTick);

      playAudio(adoClick);
      i = i + 1;
      // console.log("i : " + i);
      if (i == c) {
        i = c - 1;
        return;
      }
      // console.log(i);
      slideOn(i);
      slidePage(i + 1);
      if ($(this).parents("#card_container").length > 0) {
        window.timerBar();
        $("#card_container").find(".suggestion").hide();
        $("#card_container").find(".card").removeClass("cardflip");
      }

      if (
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "visible" })
      ) {
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "visible" });
        $(this)
          .parents(".answer_box")
          .find(".xyz_reveal")
          .css({ display: "none" })
          .addClass("revealOn");
        $(this).parents(".answerBtn").find(".btn_answer").addClass("retry");
      } else {
        $(this)
          .parents(".answer_box")
          .find(".answer3")
          .css({ visibility: "hidden" });
        $(this)
          .parents(".answer_box")
          .find(".xyz_reveal")
          .css({ display: "block" })
          .removeClass("revealOn");
        $(this).parents(".answerBtn").find(".btn_answer").removeClass("retry");
      }
    });

    slideOn(i);
    function slideOn(i) {
      if ($(obj).parents(".slide").length > 0) {
      }
      if (i == 0) {
        $(obj).parent(".slide_wrap").find(".prev2").hide();
      } else {
        $(obj).parent(".slide_wrap").find(".prev2").show();
      }
      if (i == $(obj).children(".slide_content2").length - 1) {
        $(obj).parent(".slide_wrap").find(".next2").hide();
      } else {
        $(obj).parent(".slide_wrap").find(".next2").show();
      }
      if ($(obj).children(".slide_content2").length == 1) {
        $(obj).parent(".slide_wrap").find(".next2,.prev2").hide();
      }

      var nav2 = $(obj)
        .siblings(".nav_wrap")
        .children(".nav2")
        .children("div, button");
      if ($(sl[i]).find(".audio").attr("data-audioplay") == "auto") {
        ado = $(sl[i]).find(".audio");
        setTimeout(function () {
          $(ado).trigger("click");
        }, 1000);
      }

      $("audio,video").each(function (idx, ado) {
        try {
          $(ado)[0].pause();
        } catch (err) {}
      });

      $(vdo).find(".btnStop").trigger("click");
      $(nav2).removeClass("on").removeAttr("title");
      $(nav2[i]).addClass("on").attr("title", "선택됨");
      $(sl).removeClass("on");
      $(sl[i]).addClass("on");
      // if ($(".slide_content2").parents(".on").length == 0) {
      //     $(".slide_content2.on").removeClass("on");
      // } else {
      //     console.log("slide in tab");
      //     $(".on .slide_content2:eq(0)").addClass("on");
      // }

      initLineConnection();
    }

    function slidePage(i) {
      if ($("#card_container").find("#pagecheck").length > 0) {
        $("#pagecheck").find(".nowpage").text(i);
      }
    }
    $(".next, .prev, .nav_slide").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      playAudio(adoClick);

      if ($(this).parents(".slide_wrap").find(obj).length > 0) {
        var grayBox = $(this).parents(".slide_wrap");
        var content = $(grayBox).find(".slide_content");
        var one_content = $(content).find(".slide_content2:eq(0)");
        var nav = $(this).parents(".slide_wrap").find(".nav_wrap");
        var one_nav = $(nav).find(".nav2 .nav_slide2:eq(0)");
        $(grayBox).find(".slide_content2").removeClass("on");
        $(one_content).addClass("on");
        $(nav).find(".nav_slide2").removeClass("on");
        $(one_nav).addClass("on");
        $(nav).find(".next2").show();
        $(nav).find(".prev2").hide();
      }
    });
  });
}

function initPage() {
  // var parentBody = window.parent.document.body;
  // var next = $(parentBody).find('#btn_next');
  $("#btn_start").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $(".temp05_B").find("#content").show();
    $(".temp05_A").hide();
    // playAudio(adoTick);

    playAudio(adoClick);
    // setTimeout(function() {
    // 	$(next).trigger('click');
    // },300);
  });
  $("#imgstart").on("touchstart click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    $(".temp05_A").hide();
    $("#puzl_container").show();
    // playAudio(adoTick);

    playAudio(adoClick);
    // setTimeout(function() {
    // 	$(next).trigger('click');
    // },300);
  });
}

function initTab() {
  if ($(".tab").length > 0) {
    //window.curTabIndex=0;
    window.gotoTab = function (idx, tab, callback) {
      if (tab == undefined) {
        // console.log('tab is null');
        // 탭이 한개라고 추정하여 진행
        tab = $(".tab").eq(0)[0];
      }
      //if(idx == tab.curTabIndex) return;

      //var b = $(".tab_wrap>div");
      //var obj = $('.tab')[0];
      //var obj2 = $('.tab>li').eq(idx);
      var b = findTabWrapDiv(tab);
      var obj = tab;
      var obj2 = $(tab).children("li").eq(idx);

      if (obj2.length < 1) {
        console.log("탭을 찾을 수 없습니다. [" + (idx + 1) + "]");
        return;
      }
      tab.curTabIndex = idx;

      obj2 = obj2[0];
      pauseMedia();

      $(".blank").each(function (idx, obj3) {
        $(obj3).find(".answer2").css({ visibility: "hidden" });
      });

      $(".ox_box").each(function (idx, obj3) {
        $(obj3).find(".img_x").attr("src", "../images/btn/btn_x1.png");
        $(obj3).find(".img_o").attr("src", "../images/btn/btn_circle1.png");
        $(obj3).find(".answer_cha").attr("src", "../images/bg/cha1.png");
      });

      $(".tab_wrap>div")
        .find(".video")
        .each(function (idx2, obj3) {
          if (obj3.video && obj3.video.pause) {
            // var vdoPlay = $(obj).find(".playcontroller");

            obj3.video.load();
            obj3.video.pause();
            obj3.video.currentTime = 0;

            if ($(obj3).parents().find(".videotab>li.on").length > 0) {
              $(obj3).parents().find(".videotab>li.on").removeClass("on");
            }
            $(obj3).find(".videoSeekBtn").css("left", "0");
            $(obj3).find(".seeker").css("width", "0");
            $(obj3).find(".video_header").show();
            $(obj3).find(".btnPlay, .btnStop").show();
            $(obj3).find(".btnPause").hide();
            if (obj3.resizeUI) {
              setTimeout(
                function (obj3) {
                  obj3.resizeUI();
                },
                0,
                obj3
              );
            }
          }
        });

      $(".tab_wrap>div")
        .find(".xyz_reveal")
        .each(function (idx2, obj3) {
          if ($(obj3).css("display") == "none") {
            $(obj3).parent(".answer2").css({ visibility: "hidden" });
            $(obj3).parent(".answer3").css({ visibility: "hidden" });
            $(obj3).show();
            if ($(obj3).hasClass("revealOn") === true) {
              $(obj3).removeClass("revealOn");
            }
          }
        });

      $(".tab_wrap>div")
        .find(".choice_wrap ")
        .each(function (idx2, obj3) {
          $(obj3).find(".choice_ox").remove();
          $(obj3).find(".btnChoice").removeClass("choice_on");
        });

      $(".tab_wrap>div")
        .find(".btn_answer")
        .each(function (idx2, obj3) {
          if ($(obj3).hasClass("retry") === true) {
            $(obj3).removeClass("retry");
          }
        });

      $(".b_popup").each(function (idx, ppp) {
        if (ppp.dataset.autoclose != "false" && $(ppp.dataset.pop).length > 0) {
          $(ppp.dataset.pop).hide();
        }
      });

      $(".prev2").hide();
      $(".next2").show();
      $(".nav2").find(".nav_slide2").removeClass("on");
      $(".nav2").find(".nav_slide2:eq(0)").addClass("on");

      $(obj2).addClass("on").siblings().removeClass("on");
      $(b[idx]).addClass("on").siblings().removeClass("on");

      if (window.scaleChanged) {
        scaleChanged();
      }

      // initLineConnection();
      if ($(obj2).parents(".pop_caution").length == 0) {
        $(obj2)
          .parents("#content")
          .find(".assessmentGroup")
          .each(function (idx1, obj3) {
            //console.log(obj3);
            obj3.reset();
          });
      }

      if (typeof callback == "function") {
        callback(b[idx]);
      } else if (typeof obj2.callback == "function") {
        obj2.callback(b[idx]);
        //obj2.callback = undefined;
      }

      // 전체 페이지 탭이고, 마지막 탭이고, 정답버튼이 없으면 5초 후 다음으로 호출
      if (
        $(tab).parent().attr("id") == "container" &&
        idx == $(tab).find(".tab_item").length - 1
      ) {
        if ($(".tab_content").eq(idx).find(".btn_answer").length < 1) {
          if ($(".tab_content").eq(idx)[0].dataset.noend != "true") {
            //parent.showPageEnd(true);
          } else {
            //parent.showPageEnd(false);
          }
        } else {
          $(".tab_content")
            .eq(idx)
            .find(".btn_answer")[0]
            .addEventListener(
              "click",
              function () {
                //parent.showPageEnd(true);
              },
              true
            );
          //parent.showPageEnd(false);
        }
      } else {
        //parent.showPageEnd(false);
      }

      /* if(parent.isFirstPage() && idx==0) {
                $('#btn_back_nor',parent.document).addClass('disable');
            } else {
                $('#btn_back_nor',parent.document).removeClass('disable');
            }

            if(parent.isLastPage() && idx==$(tab).find('.tab_item').length-1) {
                $('#btn_next_nor',parent.document).addClass('disable');
                //parent.showPageEnd(false);
            } else {
                $('#btn_next_nor',parent.document).removeClass('disable');
            } */

      if ($(".tab_content").hasClass("autoDraw on")) {
        top.$("#btn_drawing").trigger("click");
        top.$("#btn_acticlose").trigger("click");
      }
    };
  }

  function findTabWrapDiv(tab) {
    if ($(tab).parent().find(".tab_wrap").length > 0) {
      return $(tab).parent().find(".tab_wrap>div");
    }
    if ($(tab).parent().parent().find(".tab_wrap").length > 0) {
      return $(tab).parent().parent().find(".tab_wrap>div");
    }
  }

  $(".tab").each(function (idx, obj) {
    // var a = $(".tab>li");
    // var b = $(".tab_wrap>div");
    var a = $(obj).children("li");
    var b = findTabWrapDiv(obj);

    // $(b).eq(0).addClass("on");
    obj.curTabIndex = 0;

    $(a).each(function (idx2, obj2) {
      $(obj2).off("touchstart click");
      $(obj2).on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (
          $(this).parents("#container").find(".boardgamePop").length > 0 &&
          $(this).hasClass("tab_fst")
        ) {
          $(".reset_popup").show();
          $(".reset_popup").find(".btn_move").off("touchstart click");
          $(".reset_popup")
            .find(".btn_move")
            .on("touchstart click", function (event) {
              $(".reset_popup").hide();
              playAudio(adoClick);
              window.gotoTab($(obj2).index(), obj);
            });
          $(".reset_popup").find(".btn_continue").off("touchstart click");
          $(".reset_popup")
            .find(".btn_continue")
            .on("touchstart click", function (event) {
              $(".reset_popup").hide();
            });
        } else {
          playAudio(adoClick);
          window.gotoTab($(obj2).index(), obj);
        }

        // window.gotoTab($(obj2).index());
      });
    });
  });
  $(".q_tabs").each(function (idx, obj) {
    var a = $(".q_tabs>li");
    var b = $(".tab_wrap>div");
    $(b).eq(0).addClass("on");

    $(a).each(function (idx2, obj2) {
      $(obj2).on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        $("audio").each(function (idx, ado) {
          try {
            ado.pause();
          } catch (err) {}
        });

        playAudio(adoClick);

        $(".tab_wrap>div")
          .find(".audio")
          .each(function (idx2, obj) {
            if (obj.audio && obj.audio.pause) {
              obj.audio.pause();
            }
          });

        $(a).removeClass("on");
        $(obj2).addClass("on");

        $(b).removeClass("on");
        $(b[idx2]).addClass("on");

        initLineConnection();
      });
    });
  });
}

function videoKeyBinding(vcon, key) {
  // ele.addEventListener('keydown', function(event) {
  console.log("keydown", key);
  let sbar = vcon.find(".statusBar")[0];
  let vbar = vcon.find(".volumeBar")[0];

  switch (key) {
    case 32:
      if (vcon[0].video.isPlay) {
        vcon[0].video.pause();
      } else {
        vcon[0].video.play();
      }
      break;
    case 37:
      // 뒤로
      sbar.setPosition(sbar.vidioPosition - 0.1);
      break;
    case 39:
      // 앞으로
      sbar.setPosition(sbar.vidioPosition + 0.1);
      break;
    case 38:
      // 위로
      vbar.setPosition(vcon[0].video.volume + 0.1);
      break;
    case 40:
      // 아래로
      vbar.setPosition(vcon[0].video.volume - 0.1);
      break;
  }
  // }, true);
}

function initTooltip() {
  $("span.tooltip, span.tooltip_else").each(function (idx, obj) {
    if (obj.hasAttribute("data-tooltip")) {
      var tit = $(obj).text();
      var txt = $(obj).attr("data-tooltip");

      $(obj).append(
        '<div class="tooltip_wrap" id="tooltip' +
          idx +
          '" style="position:absolute";><img class="btn_close02" src="../images/btn/btn_close02.png" alt=""/><div class="tooltip_tit"><p>' +
          tit +
          '</p></div><div class="tool_tip_txt"><p>' +
          txt +
          "</p></div></div>"
      );
    }

    $(obj).on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      // playAudio(adoTick);

      playAudio(adoClick);

      $(obj).children(".tooltip_wrap").show();
    });

    $(obj)
      .children(".tooltip_wrap")
      .on("touchstart click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        // playAudio(adoTick);

        playAudio(adoClick);

        $(this).hide();
      });
  });
}

function getFileName(path) {
  var pos = path.lastIndexOf("/");
  if (pos > -1) {
    return path.substr(pos + 1);
  }

  return path;
}

function getFileExt(path) {
  var pos = path.lastIndexOf(".");
  if (pos > -1) {
    return path.substr(pos + 1);
  }

  return path;
}

function getFolderPath(path) {
  var pos = path.lastIndexOf("/");
  if (pos > -1) {
    return path.substr(0, pos);
  }

  return path;
}

function downloadFile(path) {
  // alert(path);
  if (top.ezviewer == undefined) {
    path = getFolderPath(top.location.href) + "/" + path;
    // location.href = path;
    // window.open(path,'_new');
    download_files([path]);
  } else {
    path = path.replace("/", "\\");
    console.log("#path:\\Documents\\" + path);
  }
}

function download_files(files) {
  function download_next(i) {
    if (i >= files.length) {
      return;
    }
    var a = document.createElement("a");
    //   a.href = files[i].download;
    a.href = files[i];
    a.target = "_parent";
    // Use a.download if available, it prevents plugins from opening.
    if ("download" in a) {
      a.download = getFileName(files[i]);
    }
    // Add a to the doc for click to work.
    (document.body || document.documentElement).appendChild(a);
    if (a.click) {
      a.click(); // The click method is supported by most browsers.
    } else {
      $(a).click(); // Backup using jquery
    }
    // Delete the temporary link.
    a.parentNode.removeChild(a);
    // Download the next file with a small timeout. The timeout is necessary
    // for IE, which will otherwise only download the first file.
    setTimeout(function () {
      download_next(i + 1);
    }, 500);
  }
  // Initiate the first download.
  download_next(0);
}

$(window).on("load", function () {
  // 탭이 없고 정답 버튼이 없으면, 5초 후 다음으로 호출
  if (!$("#container").children().eq(0).hasClass("tab")) {
    if ($(".btn_answer").length < 1 && $(".level_sec").length < 1) {
      //parent.showPageEnd(true);
    } else if ($(".btn_answer").length > 0) {
      $(".btn_answer")[0].addEventListener(
        "click",
        function () {
          //parent.showPageEnd(true);
        },
        true
      );
    }
  }
});

/**
 * Drag and drop quiz intended for an iBooks widget
 */

$(document).ready(function () {
  //initialize the quiz options
  var answersLeft = [];
  $(".quiz-wrapper")
    .find("li.option")
    .each(function (i) {
      var $this = $(this);
      var answerValue = $this.data("target");
      var $target = $('.answers .target[data-accept="' + answerValue + '"]');
      var labelText = $this.html();
      $this.draggable({
        revert: "invalid",
        containment: ".quiz-wrapper",
      });

      if ($target.length > 0) {
        $target.droppable({
          accept: 'li.option[data-target="' + answerValue + '"]',
          drop: function (event, ui) {
            $this.draggable("destroy");
            $target.droppable("destroy");
            $this.html("&nbsp;");
            $target.html(labelText);
            answersLeft.splice(answersLeft.indexOf(answerValue), 1);
          },
        });
        answersLeft.push(answerValue);
      } else {
      }
    });
  $('.quiz-wrapper button[type="submit"]').click(function () {
    if (answersLeft.length > 0) {
      $(".lightbox-bg").show();
      $(".status.deny").show();
      $(".lightbox-bg").click(function () {
        $(".lightbox-bg").hide();
        $(".status.deny").hide();
        $(".lightbox-bg").unbind("click");
      });
    } else {
      $(".lightbox-bg").show();
      $(".status.confirm").show();
    }
  });

  /* 디지털타임 3단계 예시 대본 */
  var dimNum = $(".talkPlay .click_dim").length;
  var playDone = $(".talkPlay .scriptHeader.read");
  $(".talkPlay .click_dim > p").on("click", function () {
    var audio = new Audio("../common/audio/click.mp3");
    audio
      .play()
      .then(() => {
        console.log("Audio is playing successfully.");
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
      });
    var dimChk = $(".talkPlay .click_dim.hide").length + 1;
    var idx = $(this).parent().index();
    $(this).parent().hide();
    $(this).parent().addClass("hide");
    $(".scriptContent").find(".role_wrap").eq(idx).addClass("open");
    $(this).parents(".scriptArea").addClass("open");
    $(".talkPlay .scriptHeader").show();

    if (dimChk == dimNum) {
      $(".toggleScriptAll").trigger("click");
      if ($(".talkPlay .scriptHeader").hasClass("read")) {
        setTimeout(function () {
          pageComplete();
        }, 200);
      }
    }
  });

  $(".talkPlay .toggleScriptAll").on("click", function (e) {
    $(this).toggleClass("on");
    if ($(this).hasClass("on")) {
      $(".role_wrap").removeClass("open");
      $(".role_wrap").addClass("open");
      $(".scriptArea").addClass("open");
      $(".talkPlay .scriptHeader").show();
      $(this).find("span").text(transText["예시 대본 전체 닫기"]);
      $(".talkPlay .scriptHeader").show();
      $(".click_dim").hide();
    } else {
      $(".role_wrap").removeClass("open");
      $(".scriptArea").removeClass("open");
      $(this).find("span").text(transText["예시 대본 전체 열기"]);
      $(".talkPlay .scriptHeader").hide();
      $(".click_dim").show().removeClass("hide");
      //pauseMedia();
      chk_1 = "";
    }
    if (e.button == 0) {
      playAudio(adoClick);
    }
  });

  $(".talkPlay .toggleTranslate").on("click", function () {
    $(".role_wrap .kor").toggleClass("on");
    $(this).toggleClass("on");
    playAudio2(adoClick);
    if ($(this).hasClass("on")) {
      $(this).find("span").text(transText["해석 닫기"]);
    } else {
      $(this).find("span").text(transText["해석 보기"]);
    }
  });

  //스토리타임 주요표현
  // 7/4 콘텐츠 검수 반영 수정
  $(".expression .stopScript").on("click", function () {
    initAudio2();
    pauseMedia();
    $(".m_exp")
      .find(".audio2[data-audio2]")
      .removeClass("off2")
      .addClass("off");
    $(".m_exp").find("p.playing").removeClass("playing");
  });

  //

  $(".tabBtn > li").on("click", function () {
    var idx = $(this).index();
    $(".tabBtn > li").removeClass("on");
    $(this).addClass("on");
    $(".tab_content ").removeClass("on");
    $(".tab_content ").eq(idx).addClass("on");
  });
});

// 7/6 수정: item 위치에 맞게 스크롤 이동 추가
function scrollTopEvent(obj) {
  var scrollTop = $(window).scrollTop();
  var thisTop = $(obj).offset().top;
  var thisHeight = $(obj).height();
  var bodyHeight = document.documentElement.clientHeight;
  var bodyScrollHeight = $("body").prop("scrollHeight");
  if (
    thisTop + thisHeight > bodyHeight ||
    bodyScrollHeight - bodyHeight > thisTop
  ) {
    $("html, body").animate({ scrollTop: thisTop }, 600);
  }
}

// push user data - 불러온 데이터 처리
function pushUserData(params) {
  alert("1");
  // 07.24 선생님 redraw제외
  if (teacher) {
    return;
  }

  // data 가져오는 부분 어떻게 들어오는지 확인 필요
  console.log(params);
  if (params) {
    if (params == "completeStamp") {
      setCompleteStamp("Y");
    } else {
      paramsObj = JSON.parse(params);
      if (paramsObj.record) {
        redrawAudioSources(paramsObj.record, paramsObj.charid);
      } else if (paramsObj.draw) {
        redrawEventCanvas(paramsObj.draw);
      } else {
        $("input[type=text]").each(function (index, item) {
          $(this).val(paramsObj.inputText[index]);
        });
        $("textarea").each(function (index, item) {
          $(this).val(paramsObj.inputArea[index]);
        });
      }
    }
  }
}

function setSendResult(isComplex, completeGbn) {
  let $page_result = [];
  let inputsTxt = {};
  $page_result[0] = []; // input
  $page_result[1] = []; // textarea

  let result = {};
  result.caliper = {
    EVENT_TYPE: "NavigationEvent",
    PROFILE_TYPE: "AssessmentProfile",
    ACTION_TYPE: "NavigatedTo",
    OBJ_NAME: "확인하기",
  };
  completeGbn == "Y" ? (completeGbn = true) : (completeGbn = false);
  result.isSubmit = true;

  if (isComplex) {
    $("input[type=text], .st_textarea textarea, textarea").on(
      "change",
      function () {
        $("input[type=text]").each(function (index, item) {
          $page_result[0][index] = $(item).val();
        });
        $(".st_textarea textarea, textarea").each(function (index, item) {
          let value = "";
          if (this.tagName.toLowerCase() === "textarea") {
            value = $(this).val();
          } else {
            value = $(this).find("textarea").val();
          }
          $page_result[1][index] = value;
        });
        inputsTxt = {
          inputText: $page_result[0],
          inputArea: $page_result[1],
        };
        $.extend(result || {}, {
          inputs: JSON.stringify(inputsTxt),
          completeStamp: completeGbn,
        });
        console.log("##### result >>> ", result);
        console.log(
          "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
          "color:#870070;background:#FF97FF;",
          "color:#1266FF;",
          "color:#AB125E;"
        );
        Receiver.send("button", result);
      }
    );
  } else {
    $("input[type=text]").on("change", function () {
      $("input[type=text]").each(function (index, item) {
        $page_result[0][index] = $(item).val();
      });
      inputsTxt = {
        inputText: $page_result[0],
      };
      $.extend(result || {}, {
        inputs: JSON.stringify(inputsTxt),
        completeStamp: completeGbn,
      });
      console.log("##### result >>> ", result);
      console.log(
        "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
        "color:#870070;background:#FF97FF;",
        "color:#1266FF;",
        "color:#AB125E;"
      );
      Receiver.send("button", result);
    });

    $("textarea").on("change", function () {
      alert("a");
      $("textarea").each(function (index, item) {
        $page_result[1][index] = $(item).val();
      });
      inputsTxt = {
        inputArea: $page_result[1],
      };
      $.extend(result || {}, {
        inputs: JSON.stringify(inputsTxt),
        completeStamp: completeGbn,
      });
      console.log("##### result >>> ", result);
      console.log(
        "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
        "color:#870070;background:#FF97FF;",
        "color:#1266FF;",
        "color:#AB125E;"
      );
      Receiver.send("button", result);
    });
  }
}

function sendOnlyCompleteStamp(completeGbn) {
  let result = {};
  result.caliper = {
    EVENT_TYPE: "NavigationEvent",
    PROFILE_TYPE: "AssessmentProfile",
    ACTION_TYPE: "NavigatedTo",
    OBJ_NAME: "확인하기",
  };

  result.isSubmit = true;
  result.inputs = "completeStamp";
  result.completeStamp = completeGbn;

  console.log("##### result >>> ", result);
  console.log(
    "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
    "color:#870070;background:#FF97FF;",
    "color:#1266FF;",
    "color:#AB125E;"
  );
  Receiver.send("button", result);
}

//도장 세팅
function setCompleteStamp(param) {
  if (teacher == false) {
    if (param == "Y") {
      $(".ty_complete").show();
    }
  }
}

// 대체 텍스트 적용
function setAltTextData(params) {
  //    params = "[\"이집트에 있는&#10;여러 개의\", \"피라미드 옆에\"]";
  if (params) {
    var userdata = JSON.parse(params);
    if (userdata.length) {
      // img 만이 아니라 div에도 적용해야 하는 경우가 있음
      $("img, div").each(function () {
        // 현재 요소의 alt 속성 값을 가져옴
        var altValue = $(this).attr("alt");
        if (altValue === undefined) {
          altValue = $(this).attr("aria-label");
        }

        // alt 속성 값이 존재하고 숫자인지 확인
        if (altValue && !isNaN(altValue)) {
          // alt 값을 정수로 변환
          var index = parseInt(altValue);

          // index에 해당하는 노드를 가져옴
          var targetNode = $(this);
          var data_txt = userdata[index - 1].split("&#10;").join("\n");

          if (targetNode.attr("alt")) {
            targetNode.attr("alt", data_txt);
          } else {
            targetNode.attr("aria-label", data_txt);
          }
        }
      });
    }
  }
}

// system volume 값 이벤트
let systemVolume = 1;
function setVolume(volume) {
  // Recevier 에서 받은 볼륨 으로 설정 (0 ~ 100)
  systemVolume = volume / 100;
  audioObjects.forEach((audio) => {
    setAudioVolume(audio);
    console.log("change vol : ", audio.volume);
  });
  setAudioVolume(mainCurrentAudio);
}

function setAudioVolume(audio) {
  if (!audio) {
    return;
  }

  let defaultVol = 1;
  if (audio.src) {
    const url = new URL(audio.src);
    const params = url.searchParams;
    const vol = params.get("vol");
    if (null != vol) {
      defaultVol = parseFloat(vol);
    }
  }
  audio.volume = defaultVol * systemVolume;
}

// 모든 Audio 객체를 추적할 배열
const audioObjects = [];

function initAudioSystem() {
  // 원래 Audio 생성자를 보존
  const OriginalAudio = window.Audio;

  // Audio 생성자를 대체하는 래퍼 생성자
  function WrappedAudio(...args) {
    const audioInstance = new OriginalAudio(...args);

    // 재생 이벤트 리스너 추가
    audioInstance.addEventListener("play", () => {
      setAudioVolume(audioInstance);
      // console.log(`Audio with src ${audioInstance.src} is playing.`);
      mainCurrentAudio = audioInstance;
    });
    return audioInstance;
  }

  // window.Audio를 래퍼로 대체
  window.Audio = WrappedAudio;
}

function initAudioObject() {
  const audioElements = document.querySelectorAll("audio");
  audioElements.forEach((audio) => {
    // console.log('HTML Audio Element:', audio);
    audioObjects.push(audio);
    audio.addEventListener("play", () => {
      setAudioVolume(audio);
      // console.log(`Audio with src ${audio.src} is playing.`);
      mainCurrentAudio = audio;
    });
  });

  for (let key in window) {
    if (window[key]?.tagName == "AUDIO") {
      // console.log(`Found Audio object: ${key}`, window[key]);
      audioObjects.push(window[key]);
      window[key].addEventListener("play", () => {
        setAudioVolume(window[key]);
        // console.log(`Audio with src ${window[key].src} is playing.`);
        mainCurrentAudio = window[key];
      });
    }
  }
}

function setInputTextareaReadOnly(isReadOnly) {
  let inputs = $("#container").find("input, textarea");

  inputs.each(function () {
    $(this).prop("readonly", isReadOnly);
  });

  if (isReadOnly) {
    $(".btn_write").addClass("on");
  } else {
    $(".btn_write").removeClass("on");
  }
}

(function ($) {
  var originalVal = $.fn.val;
  $.fn.val = function (value) {
    // input 또는 textarea만 해당되도록 필터링
    if (this.is("input, textarea") && arguments.length) {
      var result = originalVal.apply(this, arguments);
      this.trigger("change"); // or "input" event
      return result;
    }
    return originalVal.apply(this);
  };
})(jQuery);

var userValues = {};
function sendHandwriting(id) {
  userValues.handwriting = id;
  $("#" + id).removeAttr("data-userlatex");
  var result = {};
  result.caliper = {
    EVENT_TYPE: "NavigationEvent",
    PROFILE_TYPE: "AssessmentProfile",
    ACTION_TYPE: "NavigatedTo",
    OBJ_NAME: "필기도구",
  };
  result.isHandwriting = true;
  console.log(
    "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
    "color:#870070;background:#FF97FF;",
    "color:#1266FF;",
    "color:#AB125E;"
  );
  Receiver.send("button", result);
}

function setHandwriting(data) {
  $("#ctr").find(".icon-btn-ctr2").parents("button").removeAttr("style");
  userValues.isHandwritingClick = false;
  if (userValues.handwriting) {
    let $handwriting = $("#" + userValues.handwriting);
    let $handwritingTI = $handwriting.find("textarea, input").addBack();
    if ($handwritingTI.length > 1) {
      $handwritingTI = $handwriting.find("textarea, input");
    }
    let getAnswerVal = $handwritingTI.val();

    if (data && data.isLatex) {
      var latex = data.string.replace(/[$]/gim, "");
      $handwritingTI.attr("data-userlatex", data.string);
      $handwritingTI.text(`$$${latex}$$`);
      MathJax.typeset();
    } else {
      var max = $handwriting.attr("maxLength");
      if (max) {
        if (parseInt(max) < data.string.length) {
          $handwritingTI.val(data.string.substring(0, max));
          $handwritingTI.attr("value", data.string.substring(0, max));
        } else {
          $handwritingTI.val(getAnswerVal + data.string);
          $handwritingTI.attr("value", getAnswerVal + data.string);
        }
      } else {
        $handwritingTI.val(getAnswerVal + data.string);
        $handwritingTI.attr("value", getAnswerVal + data.string);
      }
    }

    var assessmentGroup = ".assessmentGroup";
    let assessment = $handwriting.parents(assessmentGroup).eq(0);

    let checkInput = false;
    assessment.find("textarea, input").each(function (idx, ii) {
      if ($(this).val().length > 0) {
        checkInput = true;
        $(this).addClass("lnt_input_text");
      } else {
        $(this).removeClass("lnt_input_text");
      }
    });

    if (checkInput) {
      assessment.find(".btn_box, .btn_answer, .btn_return").show();
    } else {
      assessment.find(".btn_box, .btn_answer, .btn_return").hide();
    }
  }
}

// 플랫폼 마이크 on/off 이벤트 처리
var isMicOn = true;
function setMicState(isOn) {
  if (isOn) {
    isMicOn = true;
  } else {
    isMicOn = false;
  }
}

function closestHiddenElement(node) {
  while (node && node.nodeName !== "BODY") {
    // 현재 노드의 computed style 가져오기
    var computedStyle = window.getComputedStyle(node);

    // display 및 visibility 속성 확인
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden"
    ) {
      return node; // 숨겨진 상위 요소를 발견
    }

    // 상위 요소로 이동
    node = node.parentNode;
  }
  return null; // 숨겨진 상위 요소가 없음
}

// hide 될때 selection 된 부분이 있으면 selection 해제
(function ($) {
  var originalHide = $.fn.hide;
  $.fn.hide = function () {
    let ret = originalHide.apply(this, arguments);

    const selection = document.getSelection();

    // selction이 있으면 해제
    if (!selection.isCollapsed) {
      let hiddenParent = closestHiddenElement(selection.anchorNode.parentNode);
      if (hiddenParent) {
        document.getSelection().removeAllRanges();
        Receiver.send("highlight", {
          type: "hide texttip",
        });
      }
    }
    return ret;
  };
})(jQuery);

// 특정 요소가 display:none, visiblity:hidden, hide 을 처리할때
// 수동으로 selection을 없애고 형광펜/tts 팝업을 닫는 함수 호출
function removeSelectionHideTextTip(e) {
  const hasHLClass = Array.from(e.target.classList).some((className) =>
    className.includes("-hl")
  );

  if (!hasHLClass) {
    const selection = document.getSelection();

    // selction이 있으면 해제하고 형광펜 팝업 닫기 호출
    if (!selection.isCollapsed) {
      document.getSelection().removeAllRanges();
      Receiver.send("highlight", {
        type: "hide texttip",
      });
    }
  }
}

// 특정 요소의 scale 값을 가져오는 함수
function getScaleValue(element) {
  const style = window.getComputedStyle(element);
  const transform = style.transform;

  if (transform === "none") {
    return 1; // transform이 없는 경우 기본 값은 1입니다.
  }

  // scale 값을 추출하기 위해 정규 표현식을 사용합니다.
  const match = transform.match(
    /matrix\(([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+\)/
  );
  if (match) {
    return parseFloat(match[1]);
  }

  // 2D 변환이 아닌 경우 (예: scale3d 등)
  const scaleMatch = transform.match(/scale\(([^,]+)\)/);
  if (scaleMatch) {
    return parseFloat(scaleMatch[1]);
  }

  return 1; // 일치하는 변환 값이 없으면 기본 값은 1입니다.
}

function udtRoleButtonEnterSpaceKeyEvent($node) {
  $node.attr("role", "button").attr("tabindex", "0");
  $node.on("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Prevent default action for space key
      $(this).click(); // Trigger click event
    }
  });
}

function playAudio2(ado, fromZero) {
  if (ado == undefined) {
    return;
  }
  if (fromZero == false || fromZero == "false") {
    fromZero = false;
  } else {
    fromZero = true;
  }

  if (window.adoList == undefined) {
    window.adoList = [];
  }

  if (typeof ado == "string") {
    var ado2 = window.adoList[ado];
    if (ado2 == undefined) {
      ado2 = new Audio(ado);
      ado2.load();
      window.adoList[ado] = ado2;
    }
    ado = ado2;
  }

  var promise = ado.pause();
  if (promise !== undefined) {
    promise.then(function () {}).catch(function (err) {});
  }

  if (fromZero) {
    try {
      ado.currentTime = 0;
    } catch (err) {}
  }

  promise = ado.play();
  if (promise !== undefined) {
    promise
      .then(function () {})
      .catch(function (err) {
        console.log(err);
      });
  }

  return ado;
}

function playSound() {
  var audio = new Audio("../common/audio/click.mp3");
  audio
    .play()
    .then(() => {
      console.log("Sound effect played successfully.");
    })
    .catch((error) => {
      console.error("Error playing sound effect:", error);
    });
}

var transText = {
  일시정지: "일시정지",
  재생: "재생",
  "해석 닫기": "해석 닫기",
  "해석 보기": "해석 보기",
  "예시 대본 전체 닫기": "예시 대본 전체 닫기",
  "예시 대본 전체 열기": "예시 대본 전체 열기",
  선택됨: "선택됨",
  "키보드로 입력하세요.": "키보드로 입력하세요.",
  "손글씨로 쓰세요.": "손글씨로 쓰세요.",
  녹음중: "녹음중",
  녹음하기: "녹음하기",
  "녹음완료(되돌리기)": "녹음완료(되돌리기)",
  "예시 답안 확인": "예시 답안 확인",
  "예시 답안 숨김": "예시 답안 숨김",
  "붓의 크기": "붓의 크기",
  "물감의 색깔": "물감의 색깔",
  "도형 그리기": "도형 그리기",
  지우기: "지우기",
  초기화: "초기화",
  저장: "저장",
  닫기: "닫기",
  "부적절한 단어가 사용되었습니다. 다시 작성하세요.":
    "부적절한 단어가 사용되었습니다. 다시 작성하세요.",
  "선생님께 제출되었습니다.": "선생님께 제출되었습니다.",
  "문제를 풀어 보세요.": "문제를 풀어 보세요.",
  "정답이에요!": "정답이에요!",
  "한 번 더 생각해 보세요.": "한 번 더 생각해 보세요.",
  "정답을 확인해 보세요.": "정답을 확인해 보세요.",
  "이대로 제출할까요?": "이대로 제출할까요?",
  "아직 입력하지 않은 내용이 있어요.": "아직 입력하지 않은 내용이 있어요.",
  취소: "취소",
  제출: "제출",
};

function defaultTextTransfer() {
  if (currentLang != "kr") {
    $("#container").addClass("foreign_lang");

    let keys = Object.keys(transText);
    let transKey = keys.join("||");

    msg_change(transKey, currentLang).then((result) => {
      let splitResult = result.split("||");

      keys.forEach(function (key, index) {
        transText[key] = splitResult[index];
      });

      transExtraText();
    });

    // "," 있는 경우 특수문자로 join 해서 처리시 동일 특수문자로 구분해버려서 split 가 제대로 이루어지지 않아 단독으로 처리함
    msg_change("손글씨로 전환하기, 현재 키보드 활성화됨", currentLang).then(
      (result) => {
        transText["손글씨로 전환하기, 현재 키보드 활성화됨"] = result;
      }
    );
    msg_change("키보드로 전환하기, 현재 손글씨 활성화됨", currentLang).then(
      (result) => {
        transText["키보드로 전환하기, 현재 손글씨 활성화됨"] = result;
      }
    );

    msg_change("이대로 제출할까요?", currentLang).then((result) => {
      transText["이대로 제출할까요?"] = result;
    });

    msg_change("아직 입력하지 않은 내용이 있어요.", currentLang).then(
      (result) => {
        transText["아직 입력하지 않은 내용이 있어요."] = result;
      }
    );

    msg_change("취소", currentLang).then((result) => {
      transText["취소"] = result;
    });

    msg_change("제출", currentLang).then((result) => {
      transText["제출"] = result;
    });
  } else {
    transText["손글씨로 전환하기, 현재 키보드 활성화됨"] =
      "손글씨로 전환하기, 현재 키보드 활성화됨";
    transText["키보드로 전환하기, 현재 손글씨 활성화됨"] =
      "키보드로 전환하기, 현재 손글씨 활성화됨";
  }

  if (typeof transDrawDefaultText === "function") {
    transDrawDefaultText();
  }
}

function transExtraText() {
  if ($(".drawTool").length) {
    $(".pencil .drawing_pencil_button")
      .next()
      .attr("title", transText["붓의 크기"]);
    $(".pencil .thickness").next().attr("title", transText["물감의 색깔"]);
    $(".figure .drawing_button").attr("title", transText["도형 그리기"]);
    $(".delete_mode.btn_erase").attr("title", transText["지우기"]);
    $(".close_popup.btn").attr("title", transText["닫기"]);
    $(".delete_all.btn_return.btn.return1").attr("title", transText["초기화"]);
    $(".delete_all.btn_return.btn").attr("title", transText["초기화"]);
    $(".save.btn_save.btn").attr("title", transText["저장"]);
  }

  if (
    $(".btn_viewAll.toggleScriptAll span").length &&
    $(".btn_viewAll.toggleScriptAll span").text() == "예시 대본 전체 열기"
  ) {
    $(".btn_viewAll.toggleScriptAll span").text(
      transText["예시 대본 전체 열기"]
    );
  }

  if ($(".toggleTranslate").length) {
    if ($(".toggleTranslate").hasClass("on")) {
      $(".toggleTranslate.on span").text(transText["해석 닫기"]);
    } else {
      $(".toggleTranslate span").text(transText["해석 보기"]);
    }
  }
}

// 함수 정의: 모든 input과 textarea가 채워져 있는지 체크
function areAllInputsFilled($inputs) {
  var allFilled = true;

  $inputs.each(function () {
    if ($(this).val().trim() === "") {
      allFilled = false;
      return false; // break loop
    }
  });

  return allFilled;
}

/**
 * 제출하기 클릭
 */
function submitChkEvent(state) {
  let input_txt;
  if (state) {
    input_txt = `<p lang="y">${transText["이대로 제출할까요?"]}</p>`;
  } else {
    input_txt = `
      <div>
        <p lang="y">${transText["아직 입력하지 않은 내용이 있어요."]}</p>
        <p lang="y">${transText["이대로 제출할까요?"]}</p>
      </div>
    `;
  }
  // <img src="../../common_contents/common/images/character_type4.png" alt="제출하기 캐릭터" />
  const submitChkPopup = `
    <div class="submitChkPopup">
      <div class="scp_inner">
        <div>
          <img src="../common/images/character_type4.png" alt="제출하기 캐릭터" />
          ${input_txt}
        </div>

        <div>
          <button type="button" class="chkFalse" lang="y">
            ${transText["취소"]}
          </button>
          <button type="submit" class="chkTrue" lang="y">${transText["제출"]}</button>
        </div>
      </div>
    </div>
  `;
  $("#contents").append(submitChkPopup);

  $("form").submit(function (e) {
    e.preventDefault();
    var result = {};
    result.isGroupActivity = true;

    // result.data = {

    // };

    // console.log(
    //   "%c 컨텐츠 %c params: %c" + JSON.stringify(result, null, 2),
    //   "color:#870070;background:#FF97FF;",
    //   "color:#1266FF;",
    //   "color:#AB125E;"
    // );

    // Receiver.send("button", result);
    $(".submitChkPopup").remove();
    msgAlert();

    const _content = $("#content");
    const quizType = _content.attr("data-quiz-type");
    if (quizType === "drawing-only") {
      sendGeneraInputButton(true);
    } else if (quizType === 'evaluation') {
      const buttons = document.querySelectorAll(".starArea.que1 button");
      let checkOnIndex = -1;
      buttons.forEach((button, index)=> {
        if(button.classList.contains("on")) {
          checkOnIndex = index + 1;
        }
      });

      sendScoreButton(checkOnIndex / buttons.length * 100);
    }
    else {
      sendGeneraInputButton();
    }

  });

  $(".chkFalse").on("click", function () {
    $(".submitChkPopup").remove();
  });
}

/**
 * 메시지 알림창
 */
function msgAlert(msg, option) {
  // opion: YN - 확인취소 선택 가능할 경우

  if (!msg) {
    msg = transText["선생님께 제출되었습니다."];
  }

  let _toasthtml = $(
    `<div class="toast-msg-container data-submit-complate">
      <div class="toast-msgbox">
        <div class="toast-msg">${msg}</div>
        <div class="toast-select ${option}">
        <button type="button" class="alert-n">취소</button>
        <button type="button" class="alert-y">확인</button>
        </div>
      </div>
    </div>`
  );

  $("#container").append(_toasthtml);
  _toasthtml.show();

  if (!option) {
    setTimeout(function () {
      _toasthtml.fadeOut((res) => {
        _toasthtml.remove();
      });
    }, 3000);
  } else {
    msgAlertYN();
  }
}

let wrongCount = 0;
function checkAnswerData() {
  let answerValue = $("input[data-value], textarea[data-value]");
  let textContainer = $(".text_container");
  let isExceptionType =
    $("#content").attr("data-quiz-type") === "text-exception-check";

  if (isDS) {
    answerValue = $(".swiper-slide-active input[data-value]");
    textContainer = $(".swiper-slide-active .text_container");
  }
  let totalCount = answerValue.length;
  const summary = {
    correct: 0,
    incorrect: 0,
    blank: 0,
  };

  answerValue.each((index, input) => {
    let content = input.value;
    let dataset = input.dataset.value;

    textContainer.removeClass("checked");
    input.classList.remove("--incorrect");
    if (content === "") {
      summary.blank++;
      input.classList.add("--incorrect");
    } else if (
      checkCorrect(input.value, input.dataset.value, input.dataset.separator)
    ) {
      summary.correct++;
    } else {
      summary.incorrect++;
      input.classList.add("--incorrect");
    }
  });

  let answerBtn = isDS
    ? $(".swiper-slide-active .btn_answer")
    : $(".btn_answer");
  let isBtnClass = answerBtn.hasClass("btn_answer_x");

  if (isExceptionType) {
    if (summary.correct && summary.incorrect === 0) {
      setAnswerPopupContent(0);
      textContainer.addClass("checked");
      answerBtn.removeClass("active");
    } else {
      wrongCount++;

      if (isBtnClass) {
        wrongCount = 0;
        answerBtn.removeClass("btn_answer_x");
      } else {
        setAnswerPopupContent(wrongCount);
      }

      if (wrongCount !== 2) {
        answerBtn.removeClass("btn_answer_x");
        return true;
      } else {
        answerBtn.removeClass("active");
        textContainer.addClass("checked");
      }
      refreshInputBorder();
    }
  } else {
    if (totalCount === summary.blank || summary.blank !== 0) {
      setAnswerPopupContent(3);
      refreshInputBorder();
      return true;
    } else if (totalCount !== summary.correct) {
      wrongCount++;

      if (isBtnClass) {
        wrongCount = 0;
        answerBtn.removeClass("btn_answer_x");
      } else {
        setAnswerPopupContent(wrongCount);
      }

      if (wrongCount !== 2) {
        answerBtn.removeClass("btn_answer_x");
        return true;
      } else {
        // answerBtn.addClass("btn_answer_x");
        answerBtn.removeClass("active");
        textContainer.addClass("checked");
      }
      refreshInputBorder();
    } else {
      if (isBtnClass) {
        answerBtn.removeClass("btn_answer_x");
        answerValue.attr("readonly", false);
      } else {
        setAnswerPopupContent(0);
        textContainer.addClass("checked");
        // answerBtn.addClass("btn_answer_x");
        answerBtn.removeClass("active");
      }
    }
  }

  return false;
}

/**
 * 선택형 정오답 체크
 */
function selectCorrectData() {
  let selectWrap = $(".selected-wrap");
  let answerEl = $(".selected-wrap [data-answer]");
  let answerSelect = $(".selected-wrap [data-answer].select");

  let dqt = $("#content").attr("data-quiz-type") === "selected-multi-check";
  let dqt2 = $("#content").attr("data-quiz-type") === "selected-only-check";
  let selectEl = $(".selected-wrap > div");

  if (isDS) {
    answerValue = $(".swiper-slide-active .selected-wrap [data-answer]");
  }

  let totalCount = answerEl.length;
  let selectTotalCount = answerSelect.length;
  let answerBtn = isDS
    ? $(".swiper-slide-active .btn_answer")
    : $(".btn_answer");
  let isBtnClass = answerBtn.hasClass("btn_answer_x");

  if (dqt || dqt2) {
    if (selectTotalCount !== totalCount) {
      wrongCount++;

      if (wrongCount !== 2) {
        // 한번 더 생각해 보세요.
        setAnswerPopupContent(wrongCount);
        return true;
      } else {
        // 정답을 확인해 보세요.
        answerEl.not(answerSelect).addClass('--incorrect')

        selectEl.css("pointer-events", "none");
        answerEl.addClass("select");
        answerBtn.removeClass("active");
        selectWrap.addClass("checked");
        setAnswerPopupContent(wrongCount);
        playAudio(adoFail);
      }
    } else {
      setAnswerPopupContent(0);
      selectWrap.addClass("checked");
      answerBtn.removeClass("active");
      selectEl.css("pointer-events", "none");
      playAudio(adoCorrect);
    }
  } else {
    if (selectTotalCount < totalCount && selectTotalCount !== 0) {
      if (isBtnClass) {
        // X 클릭 시
        wrongCount = 0;
        answerEl.css("pointer-events", "inherit");
        answerBtn.removeClass("btn_answer_x");
        selectWrap.removeClass("checked");
      } else {
        wrongCount++;

        if (wrongCount !== 2) {
          // 한번 더 생각해 보세요.
          setAnswerPopupContent(wrongCount);
          return true;
        } else {
          // 정답을 확인해 보세요.
          answerEl.css("pointer-events", "none");
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
          selectWrap.addClass("checked");
          setAnswerPopupContent(wrongCount);
          playAudio(adoFail);
        }
      }
    } else {
      // 정답이에요.
      if (isBtnClass) {
        answerBtn.removeClass("btn_answer_x");
        selectWrap.removeClass("checked");
      } else {
        setAnswerPopupContent(0);
        selectWrap.addClass("checked");
        // answerBtn.addClass("btn_answer_x");
        answerBtn.removeClass("active");
        playAudio(adoCorrect);
      }
    }
  }

  return false;
}

/**
 * 체크 박스 정오답 체크
 * @returns
 */
function checkCorrectData() {
  let answerChk = $(".checkbox_wrap input[data-answer]");
  let inputBox = $(".checkbox_wrap input");
  let answerCnt = answerChk.length;
  let correct = {
    correct: 0,
    incorrect: 0,
    blank: 0,
  };
  if (!$(".checkbox_wrap").hasClass("answer_mode")) {
    correct = {
      correct: 0,
      incorrect: 0,
      blank: 0,
    };
  }
  inputBox.each(function (index, input) {
    $(".checkbox_wrap").removeClass("answer_mode");
    $(this).removeClass("--incorrect");

    if ($(this).hasClass("checked")) {
      if ($(this).is("[data-answer]")) {
        correct.correct++;
      } else {
        correct.incorrect++;
      }
    } else {
      correct.blank++;
    }
  });

  let dqtCheckbox =
    $("#content").attr("data-quiz-type") === "checkbox" ? true : false;

  let dqtCheckboxMulti =
    $("#content").attr("data-quiz-type") === "check-multi-answer"
      ? true
      : false;

  let isChkEx =
    $("#content").attr("data-quiz-type") === "checkbox-exception"
      ? true
      : false;
  if (isChkEx) dqtCheckboxMulti = isChkEx;

  let answerBtn = isDS
    ? $(".swiper-slide-active .btn_answer")
    : $(".btn_answer");
  let isBtnClass = answerBtn.hasClass("btn_answer_x");

  let isInputChk = true;
  let chkWrpaLen = $(".checkbox_wrap").length;

  $(".checkbox_wrap").each(function () {
    var checked = $(this).find("input.checked").length;

    if (checked === 0) {
      isInputChk = false;
      return false;
    }
  });

  if (isChkEx) {
    let dataAnswerChkLen = $(
      ".checkbox_wrap input[data-answer].checked"
    ).length;

    if (answerCnt === dataAnswerChkLen) {
      setAnswerPopupContent(0);
      $(".checkbox_wrap").addClass("answer_mode");
      answerBtn.removeClass("active");
      playAudio(`../common/audio/correct.mp3`);
      if ($("#content").attr("data-quiz-type") === "checkbox") {
        answerChk.parent().removeClass("checkedbox");
        answerChk.parent().addClass("answerbox");
      }
    } else {
      wrongCount++;

      if (isBtnClass) {
        wrongCount = 0;
      } else {
        setAnswerPopupContent(wrongCount);
        if (dqtCheckboxMulti) {
          inputBox.attr("disabled", true);
        }
      }

      if (wrongCount !== 2) {
        if (dqtCheckbox) {
          answerChk.parent().removeClass("checkedbox answerbox");
        }

        inputBox.attr("disabled", false);
        return true;
      } else {
        wrongCount = 0;
        $(".checkbox_wrap").addClass("answer_mode");
        answerBtn.removeClass("active");
      }
      playAudio(`../common/audio/fail.wav`);
      if (dqtCheckbox) {
        if (answerChk.parent().hasClass("checkedbox")) {
          answerChk.parent().removeClass("checkedbox");
          answerChk.parent().addClass("answerbox");
        } else {
          answerChk.parent().addClass("answerbox");
        }
      }
    }
  } else {
    if (correct.blank === inputBox.length || !isInputChk) {
      setAnswerPopupContent(3);
      return true;
    } else if (correct.incorrect == 0 && correct.correct == answerCnt) {
      if (isBtnClass) {
        inputBox.attr("disabled", false);
      } else {
        setAnswerPopupContent(0);
        $(".checkbox_wrap").addClass("answer_mode");
        answerBtn.removeClass("active");
        playAudio(`../common/audio/correct.mp3`);
        if ($("#content").attr("data-quiz-type") === "checkbox") {
          answerChk.parent().removeClass("checkedbox");
          answerChk.parent().addClass("answerbox");
        }
      }
    } else {
      wrongCount++;

      if (isBtnClass) {
        wrongCount = 0;
      } else {
        setAnswerPopupContent(wrongCount);
        if (dqtCheckboxMulti) {
          inputBox.attr("disabled", true);
        }
      }

      if (wrongCount !== 2) {
        if (dqtCheckbox) {
          answerChk.parent().removeClass("checkedbox answerbox");
        }

        inputBox.attr("disabled", false);
        return true;
      } else {
        wrongCount = 0;
        $(".checkbox_wrap").addClass("answer_mode");
        answerBtn.removeClass("active");
      }
      playAudio(`../common/audio/fail.wav`);
      if (dqtCheckbox) {
        if (answerChk.parent().hasClass("checkedbox")) {
          answerChk.parent().removeClass("checkedbox");
          answerChk.parent().addClass("answerbox");
        } else {
          answerChk.parent().addClass("answerbox");
        }
      }
    }
  }

  if (dqtCheckbox) {
    // inputBox.attr("disabled", true);
  }
}

/**
 * ox 정오답 체크
 */
function oxCorrectMultiData() {}

function oxCorrectData() {
  let ox_answer_current_class;
  let ox_answer_not_class;
  let ox_answer_data;
  let isBtnClass;
  let answerBtn;

  // 슬라이드
  if (isDS) {
    ox_answer_current_class = $(".swiper-slide-active .ox_answer")
      .attr("class")
      .split(/\s+/)[1];
    ox_answer_not_class = $(".swiper-slide-active .ox_select")
      .find("[data-answer]")
      .siblings()
      .attr("class")
      .split(/\s+/)[1];
    ox_answer_data = $(".swiper-slide-active .ox_answer").attr("data-answer");
    isBtnClass = $(".swiper-slide-active .btn_answer").hasClass("btn_answer_x");
    answerBtn = $(".swiper-slide-active .btn_answer");

    if (ox_answer_current_class === ox_answer_data) {
      // 정답이에요!
      if (isBtnClass) {
        answerBtn.removeClass("btn_answer_x");

        if ($(".swiper-slide-active .oxmodal_wrap").hasClass("checked")) {
          $(".swiper-slide-active .oxmodal_wrap").removeClass("checked");
          $(".swiper-slide-active .ox_answer")
            .removeClass(ox_answer_data)
            .addClass(ox_answer_not_class);
          $(".swiper-slide-active .ox_answer").css({
            "background-color": "#fff",
            "border-color": "#3B71FE",
          });
        } else {
          $(".swiper-slide-active .ox_answer").css({
            "background-color": "#fff",
            "border-color": "#3B71FE",
          });
        }
      } else {
        setAnswerPopupContent(0);
        playAudio(adoCorrect);
        // answerBtn.addClass("btn_answer_x");
        $(".swiper-slide-active .oxmodal_wrap").addClass("checked");
        answerBtn.removeClass("active");
        $(".swiper-slide-active .ox_answer")
          .removeClass(ox_answer_current_class)
          .addClass(ox_answer_data)
          .addClass("correct");
        $(".swiper-slide-active .ox_answer").css({
          "background-color": "#dbedff",
          "border-color": "#3b71fe",
        });
      }
    } else {
      wrongCount++;

      if (isBtnClass) {
        wrongCount = 0;
        answerBtn.removeClass("btn_answer_x");
      } else {
        setAnswerPopupContent(wrongCount);
      }

      if (wrongCount !== 2) {
        answerBtn.removeClass("btn_answer_x");
        return true;
      } else {
        wrongCount = 0;
        // answerBtn.addClass("btn_answer_x");
        answerBtn.removeClass("active");

        $(".swiper-slide-active .ox_answer")
          .removeClass(ox_answer_current_class)
          .addClass(ox_answer_data)
          .addClass("incorrect");
        $(".swiper-slide-active .ox_answer").css({
          "background-color": "#ffdfdf",
          // "border-color": "#ff0000",
        });
        $(".swiper-slide-active .oxmodal_wrap").addClass("checked");
        playAudio(`../common/audio/fail.wav`);
      }
    }
  } else {
    // 멀티
    const oxWrap = $(".ox_cont_wrap .ox_answer");
    let inCorrectCnt = 0;
    let CorrectCnt = 0;

    oxWrap.each(function (index) {
      const answer = $(this).attr("data-answer");
      if (!$(this).hasClass(answer)) {
        inCorrectCnt++;
      }
    });

    // 부등호 오엑스 빈칸 있으면 return
    // if($('#content').attr('data-quiz-type') == 'ox-check-than'){
    //   let fillChk = $('button.ox_answer.answer_o').length + $('button.ox_answer.answer_x').length;
    //   if ($('button.ox_answer').length > fillChk){
    //     setAnswerPopupContent(3);
    //     return false;
    //   }
    // }
    //
    let fillChk = $('button.ox_answer.answer_o').length + $('button.ox_answer.answer_x').length;
    if ($('button.ox_answer').length > fillChk){
      setAnswerPopupContent(3);
      return false;
    }

    if (inCorrectCnt > 0) {
      wrongCount++;
      setAnswerPopupContent(wrongCount);
      if ($(".btn_answer").hasClass("btn_answer_x")) {
        wrongCount = 0;
        $(".btn_answer").removeClass("btn_answer_x");
      } else {
        setAnswerPopupContent(wrongCount);
      }

      if (wrongCount !== 2) {
        $(".btn_answer").removeClass("btn_answer_x");
        return true;
      } else {
        // 완전 땡;
        wrongCount = 0;
        $(".btn_answer").removeClass("active");
        $(".ox_cont_wrap .oxmodal_wrap").addClass("checked");

        oxWrap.each(function (index) {
          const answer = $(this).attr("data-answer");
          if ($(this).hasClass(answer)) {
            $(this).addClass("correct");
          } else {
            $(this).addClass("incorrect");
          }
        });
        playAudio(`../common/audio/fail.wav`);
      }
    } else {
      // 정답
      if ($(".btn_answer").hasClass("btn_answer_x")) {
        $(".btn_answer").removeClass("btn_answer_x");

        if ($(".oxmodal_wrap").hasClass("checked")) {
          $(".oxmodal_wrap").removeClass("checked");
          $(".ox_answer").removeClass("answer_x answer_o correct incorrect");
          $(".ox_answer").css({
            "border-color": "#3B71FE",
          });
        } else {
          $(".ox_answer").css({
            "border-color": "#3B71FE",
          });
        }
      } else {
        setAnswerPopupContent(0);
        playAudio(adoCorrect);
        $(".oxmodal_wrap").addClass("checked");
        $(".btn_answer").removeClass("active");
        $(".ox_answer").css({
          "border-color": "#3b71fe",
        });
        $(".ox_answer").addClass("correct");
      }
    }
  }
}

function checkCorrectOnlyData() {
  if (isDS) {
    // 슬라이드 페이지일 경우
    let idx = swiper.realIndex;
    let inputs = $(".swiper-slide-active input");
    let inputSelected = $(".swiper-slide-active input").hasClass("checked");
    let inputChk = $(".swiper-slide-active input.checked").is("[data-answer]");
    let answerBtn = $(".swiper-slide-active .btn_answer");
    let isBtnClass = $(".swiper-slide-active .btn_answer").hasClass(
      "btn_answer_x"
    );

    if ($(".swiper-slide-active input[data-answer]").is(":checked")) {
    }

    $(".swiper-slide-active .checkbox_wrap").removeClass("answer_mode");
    if (isBtnClass) {
      if (
        $(".swiper-slide-active input:not([data-answer])").hasClass("checked")
      ) {
        $(".swiper-slide-active input[data-answer]").removeClass("checked");
      }
    }

    inputs.attr("disabled", false);

    if (inputSelected) {
      if (inputChk) {
        // 선택한 것이 정답
        if (isBtnClass) {
          answerBtn.removeClass("btn_answer_x");
        } else {
          inputs.attr("disabled", true);
          setAnswerPopupContent(0);
          playAudio(adoCorrect);
          $(".swiper-slide-active .checkbox_wrap").addClass("answer_mode");
          $(".swiper-slide-active input[data-answer]").addClass("checked");
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
        }
      } else {
        // 선택한 것이 오답
        wrongCount++;

        if (isBtnClass) {
          wrongCount = 0;
          answerBtn.removeClass("btn_answer_x");
        } else {
          setAnswerPopupContent(wrongCount);
        }

        if (wrongCount !== 2) {
          answerBtn.removeClass("btn_answer_x");
          return true;
        } else {
          wrongCount = 0;
          $(".swiper-slide-active .checkbox_wrap").addClass("answer_mode");
          $(".swiper-slide-active input").addClass("--incorrect");
          $(".swiper-slide-active input[data-answer]").addClass("checked");
          inputs.attr("disabled", true);
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
        }

        playAudio(`../common/audio/fail.wav`);
      }
    } else {
      // 선택된 것이 없을 경우
      setAnswerPopupContent(3);
    }
  } else {
    let inputs = $(".checkbox_wrap input");
    let inputSelected = $(".checkbox_wrap input").is(":checked");
    let inputChk = $(".checkbox_wrap input.checked").is("[data-answer]");
    let answerBtn = $(".btn_answer");
    let isBtnClass = answerBtn.hasClass("btn_answer_x");

    $(".checkbox_wrap").removeClass("answer_mode");
    if (isBtnClass) {
      if ($(".checkbox_wrap input:not([data-answer])").hasClass("checked")) {
        $(".checkbox_wrap input[data-answer]").removeClass("checked");
      }
    }

    inputs.attr("disabled", false);
    if (inputSelected) {
      if (inputChk) {
        // 선택한 것이 정답
        if (isBtnClass) {
          answerBtn.removeClass("btn_answer_x");
        } else {
          inputs.attr("disabled", true);
          setAnswerPopupContent(0);
          playAudio(adoCorrect);
          $(".checkbox_wrap").addClass("answer_mode");
          $(".checkbox_wrap input[data-answer]").addClass("checked");
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
        }
      } else {
        // 선택한 것이 오답
        wrongCount++;

        if (isBtnClass) {
          wrongCount = 0;
          answerBtn.removeClass("btn_answer_x");
        } else {
          setAnswerPopupContent(wrongCount);
        }

        if (wrongCount !== 2) {
          answerBtn.removeClass("btn_answer_x");
          return true;
        } else {
          wrongCount = 0;
          $(".checkbox_wrap").addClass("answer_mode");
          $(".checkbox_wrap input").addClass("--incorrect");
          $(".checkbox_wrap input[data-answer]").addClass("checked");
          inputs.attr("disabled", true);
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
        }
        playAudio(`../common/audio/fail.wav`);
      }
    } else {
      // 선택된 것이 없을 경우
      setAnswerPopupContent(3);
    }
  }
}

function refreshInputBorder() {
  wrongCount = 0;

  let answerValue = $("input[data-value]");
  answerValue.each((index, input) => {
    // input.classList.remove("--incorrect");
  });
}

function makeAnswerCheckPopup() {
  const popupOverlay = `
    <div class="answer-check-popup-overlay">
      <div class="answer-check-popup-content">
        <img src="../common/images/character_type1.png" alt="정답 확인 캐릭터" />
        <p lang="y">${transText["문제를 풀어 보세요."]}</p>
      </div>
    </div>
  `;

  $("main").append(popupOverlay);
}

function setAnswerPopupContent(count) {
  let textContent = "";
  $(".answer-check-popup-content p").css("color", "#222");
  switch (count) {
    case 0:
      textContent = `${transText["정답이에요!"]}`;
      $(".answer-check-popup-content p").css("color", "#3B71FE");
      break;
    case 1:
      textContent = `${transText["한 번 더 생각해 보세요."]}`;
      $(".answer-check-popup-content p").css("color", "#EE4F24");
      break;
    case 2:
      textContent = `${transText["정답을 확인해 보세요."]}`;
      break;
    case 3:
      textContent = `${transText["문제를 풀어 보세요."]}`;
      break;
    default:
      textContent = "";
      break;
  }

  $(".answer-check-popup-overlay").addClass("show");
  $(".answer-check-popup-content").addClass("show");
  $(".answer-check-popup-overlay").css("display", "block");
  $(".answer-check-popup-content p")[0].textContent = textContent;
  $(".answer-check-popup-content img").attr(
    "src",
    "../common/images/character_type" + count + ".png"
  );

  $(".answer-check-popup-overlay").on("click", function () {
    $(".answer-check-popup-overlay").removeClass("show");
    $(".answer-check-popup-content").removeClass("show");
    $(".answer-check-popup-overlay").css("display", "none");
    clearTimeout(timerVar);
  });

  const timerVar = setTimeout(answerPopuptimer, 2000);
}

function answerPopuptimer() {
  $(".answer-check-popup-overlay").removeClass("show");
  $(".answer-check-popup-content").removeClass("show");
  $(".answer-check-popup-overlay").css("display", "none");
}

/**
 * 복수 정답 체크
 * @param {string} input
 * @param {string} answers
 * @param {*} separator
 * @returns
 */
function checkCorrect(input, answers, separator) {
  separator = separator || "|";
  const m = replaceSpecialCode(input);
  const target = answers.split(separator).map((v) => replaceSpecialCode(v));
  return target.includes(m);
}

function replaceSpecialCode(str) {
  // str = str.replace(/\s/g, "");
  str = str.replace("＝", "=");
  str = str.replace("×", "x");
  str = str.replace("÷", "/");
  return str;
}

/**
 * 정답 체크
 * selected => 단일 선택형
 *
 * @returns
 */
function currentCheck(props) {
  if (props === "selected") {
    $(".selected-wrap > *").removeClass("select");
    $(".selected-wrap").find("[data-answer]").addClass("select");
  }

  if (props === "selected-multi" || props === "selected-multi-check" || props ==="selected-only-check") {
    let result = selectCorrectData();
    if (result) return false;
  }

  if (props === "selected-input-multi") {
    $(".selected-wrap > *").removeClass("select");
    $(".selected-wrap").find("[data-answer]").addClass("select");
  }

  if (
    props === "check-multi-answer" ||
    props === "checkbox" ||
    props === "checkbox-exception"
  ) {
    let result = checkCorrectData();
    if (result) return false;
  }

  if (props === "checkbox-input-multi") {
    let result = checkAndInputCorrectData();
    if (result) return false;
  }

  if (props === "check-answer") {
    let result = checkCorrectOnlyData();
    if (isDS) {
      swiper.on("slideChangeTransitionStart", result);
    }
    if (result) return false;
  }

  if (props === "ox-check" || props === "ox-check-than") {
    let result = oxCorrectData();
    if (isDS) {
      swiper.on("slideChangeTransitionStart", result);
    }
    if (result) return false;
  }

  if (props === undefined || props === "text-exception-check") {
    if (
      !document.querySelector(".btn_answer").classList.contains("btn_cancel")
    ) {
      let result = checkAnswerData();
      if (isDS) {
        swiper.on("slideChangeTransitionStart", result);
      }
      if (result) return false;
    }

    const userInputList = []; // 리드로우
    const userAnswerList = []; // 리드로우
    if ($(this).hasClass("btn_cancel")) {
      document.querySelector(".btn_write").style.display = "block";
      $(this).removeClass("btn_cancel");
      document.querySelectorAll("input").forEach((element, i) => {
        element.style.color = "black";
        element.removeAttribute("readonly");
      });
      $(".text_container").removeClass("checked");
      $(".btn_answer").attr("alt", "예시 답안 확인");
      $(".ex-txt").hide();
    } else {
      $(".btn_answer").attr("alt", "예시 답안 숨김");
      // document.querySelector(".btn_write").style.display = "none";
      $(this).addClass("btn_cancel");
      let isSuccess = true;

      let isInput;
      if (isDS) {
        isInput = $(
          ".swiper-slide-active input, .swiper-slide-active textarea.input"
        );
      } else {
        isInput = $("input[data-value], textarea.input");
      }

      isInput.each((i, element) => {
        $(this).attr("readonly", true);
        userInputList.push($(this).value);

        let elVal = $(element).val();
        let elDataVal = $(element).attr("data-value").split("|");

        if (!elDataVal.includes(elVal)) {
          isSuccess = false;
          userAnswerList.push(0); //리드로우
        } else {
          userAnswerList.push(1); //리드로우
        }
      });

      // document.querySelectorAll("input").forEach((element, i) => {
      //   element.setAttribute("readonly", true);
      //   userInputList.push(element.value); // 리드로우

      //   let elVal = element.value;
      //   let elDataVal = element.dataset.value.split("|");

      //   // if (element.value!== element.dataset.value) {
      //   if (!elDataVal.includes(elVal)) {
      //     isSuccess = false;
      //     // element.value = element.dataset.value;
      //     // element.style.color = "#2D73E3";
      //     userAnswerList.push(0); //리드로우
      //   } else {
      //     // element.style.color = "#2D73E3";
      //     userAnswerList.push(1); //리드로우
      //   }
      // });

      let isBtnClass = $(".btn_answer").hasClass("btn_answer_x");
      // console.log(isBtnClass);

      // if (isBtnClass) {
      if (isSuccess) {
        playAudio(`../common/audio/correct.mp3`);
      } else {
        playAudio(`../common/audio/fail.wav`);
      }
      // }

      const sendData = {
        inputs: userInputList.join("|"),
      };

      contentComplete(JSON.stringify(sendData), userAnswerList.join("|"));
    }
  }
}

/**
 * input || textarea 초기화
 */
function currentReset(props) {
  wrongCount = 0;

  if (props === "selected") {
    $(".btnArea button").hide();
    $(".selected-wrap > *").removeClass("select");
    $(".btn_return").removeClass("active");
  }

  if (props === "selected-multi" || props === "selected-multi-check" || props === "selected-only-check") {
    $(".selected-wrap > *")
      .removeClass("select")
      .removeClass("--incorrect")
      .css("pointer-events", "inherit");
    $(".btn_return, .btn_answer").removeClass("active btn_answer_x");
    $(".selected-wrap").removeClass("checked");
  }

  if (props === "checkbox-text-multi") {
    $('input[type="checkbox"').removeClass("checked");
    $("input, textarea").val("");
    $(".btn_return, .btn_tsubmit").removeClass("active");
  }

  if (props === "check-multi-answer" || props === "checkbox-exception") {
    $('input[type="checkbox"]').removeClass("checked");
    $("input:not(input[type='range']), textarea").val("");
    $(".btn_return, .btn_answer").removeClass("active btn_answer_x");
    $(".checkbox_wrap").removeClass("answer_mode");
    $('input[type="checkbox"]').removeAttr("disabled");
  }

  if (
    props === "check-text" ||
    props === "check-text-submit" ||
    props === "textarea-submit"
  ) {
    $("input[data-fn], textarea").val("");
    $(".btn_return, .btn_tsubmit").removeClass("active");
  }

  if (props === "check-answer") {
    if (isDS) {
      $('.swiper-slide-active input[type="checkbox"]').removeClass("checked");
      $(
        ".swiper-slide-active .btn_return, .swiper-slide-active .btn_tsubmit, .swiper-slide-active .btn_answer"
      ).removeClass("active btn_answer_x");
      $(".swiper-slide-active .checkbox_wrap").removeClass("answer_mode");
      $(".swiper-slide-active input").attr("disabled", false);
      $(".swiper-slide-active input").prop("checked", false);
      $(".swiper-slide-active input").removeClass("--incorrect");
    } else {
      $('input[type="checkbox"]').removeClass("checked");
      $(".btn_return, .btn_tsubmit, .btn_answer").removeClass(
        "active btn_answer_x"
      );
      $(".checkbox_wrap").removeClass("answer_mode");
      $("input").attr("disabled", false);
      $("input").prop("checked", false);
      $("input").removeClass("--incorrect");
    }
  }

  if (props === "checkbox") {
    $('input[type="checkbox"]').removeClass("checked");
    $('input[type="checkbox"]').attr("disabled", false);
    $('input[type="checkbox"]').prop("checked", false);
    $(".btn_return, .btn_answer").removeClass("active btn_answer_x");
    $(".checkbox_wrap").removeClass("answer_mode");
    $(".checkbox_wrap").children().removeClass("checkedbox answerbox");
  }

  if (props === "checkbox-input-multi") {
    $('input[type="checkbox"]').removeClass("checked");
    $('input[type="checkbox"]').attr("disabled", false);
    $('input[type="checkbox"]').prop("checked", false);
    $(".btn_return, .btn_answer").removeClass("active btn_answer_x");
    $(".checkbox_wrap").removeClass("answer_mode");
    $(".checkbox_wrap").children().removeClass("checkedbox answerbox");

    input = $("#container").find("input, textarea").not(":input[type=range]");

    $(".btn_answer").removeClass("btn_cancel active btn_answer_x");
    $(".text_container").removeClass("checked");
    $(".btn_return").removeClass("active");
    $(".btn_ex").removeClass("active ex_active");
    $(".btnClear").removeClass("active");
    $(".hint-txt").css("display", "none");

    input.each(function () {
      $(this).val("");
      $(".textareaDap").hide();
      setInputTextareaReadOnly(false);
    });
  }

  if (props === "select-text-submit") {
    $("input, textarea").val("");
  }

  if (props === "evaluation" || props === "evaluation_notSound") {
    $(".btn_return, .btn_tsubmit").removeClass("active");
    $(".checkStar").removeClass("on");
  }

  if (props === "ox-check" || props === "ox-check-than") {
    if (isDS) {
      let ox_answer_current_class = $(".swiper-slide-active .ox_answer")
        .attr("class")
        .split(/\s+/)[1];
      $(".swiper-slide-active .ox_answer").removeClass(ox_answer_current_class);
      $(".swiper-slide-active .oxmodal_wrap").removeClass("checked");
      $(
        ".swiper-slide-active .btn_answer, .swiper-slide-active .btn_return"
      ).removeClass("active btn_answer_x");
      $(".swiper-slide-active .ox_answer").css({
        "background-color": "#fff",
        "border-color": "#3B71FE",
      });
    } else {
      // let ox_answer_current_class = $(".ox_answer")
      //   .attr("class")
      //   .split(/\s+/)[1];
      $(".ox_answer").removeClass("answer_x answer_o correct");
      $(".oxmodal_wrap").removeClass("checked");
      $(".btn_answer, .btn_return").removeClass("active btn_answer_x");
      $(".ox_answer").css({
        "background-color": "#fff",
        "border-color": "#3B71FE",
      });
    }
  }

  if (props === "input-ex") {
    if (isDS) {
      $(
        ".swiper-slide-active input[data-fn='입력'], .swiper-slide-active textarea"
      ).val("");
      $(".swiper-slide-active .btn_return").removeClass("active");
    } else {
      $("input[data-fn='입력'], textarea").val("");
      $(".btn_return").removeClass("active");
    }
  }

  if (props === undefined || props === "text-exception-check") {
    let input;

    if (isDS) {
      input = $(".swiper-slide-active")
        .find("input, textarea")
        .not(":input[type=range]");

      $(".swiper-slide-active .btn_answer").removeClass(
        "btn_cancel active btn_answer_x"
      );
      $(".swiper-slide-active .text_container").removeClass("checked");
      $(".swiper-slide-active .btn_return").removeClass("active");
      $(".swiper-slide-active .btn_ex").removeClass("active ex_active");
      $(".swiper-slide-active .btnClear").removeClass("active");
      $(".swiper-slide-active .hint-txt").css("display", "none");
    } else {
      input = $("#container").find("input, textarea").not(":input[type=range]");

      $(".btn_answer").removeClass("btn_cancel active btn_answer_x");
      $(".text_container").removeClass("checked");
      $(".btn_return").removeClass("active");
      $(".btn_ex").removeClass("active ex_active");
      $(".btnClear").removeClass("active");
      $(".hint-txt").css("display", "none");
    }

    input.each(function () {
      $(this).val("");
      $(".textareaDap").hide();
      setInputTextareaReadOnly(false);
    });

    // document.querySelectorAll("input").forEach((element) => {
    //   element.value = "";
    //   element.style.color = "black";
    //   element.removeAttribute("readonly");
    // });
  }

  playAudio(adoClick);
}

/**
 * 캐릭터 클릭 시 말풍선 on/off
 */
function characterOnOff() {
  const tg = $(".character-wrap");

  tg.on("click", () => {
    tg.toggleClass("on");
    playAudio(adoClick);
  });
}

/**
 * 콘텐츠 말풍선 on/off keydown 이벤트
 */
function stickerKeyDown() {
  $(".ll_box_sec").on("click keydown", function (e) {
    if (e.type === "click" || e.keyCode == 32 || e.keyCode == 13) {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).removeClass("on open");
        $(this).find(".clickItem").removeClass("on");
        $(this).find(".ll_box").css("clip", "rect(0px, 0px, 140px, 0px)");
      } else {
        $(this).addClass("active");
        $(this).addClass("on open");
        $(this).find(".clickItem").addClass("on");
        $(this).find(".ll_box").css("clip", "rect(0px, 1395px, 140px, 0px)");
        playAudio(adoCap02);
        let currentTitle = $(this).attr("title");
        let newTitle = currentTitle === "닫힘" ? "열림" : "닫힘";
        $(this).attr("title", newTitle);
      }
    }
  });
  // $(".btn_wrap").show();

  // $(".btnArea .btn_return").click(function () {
  //   $(".ll_box_sec").removeClass("open");
  //   $(".ll_box_sec").removeClass("active on");
  //   $(".ll_box_sec .ir").removeClass("on");
  //   $(".ll_box").removeAttr("style");
  //   $(".btn_wrap").hide();
  // });
}

/**
 * 서술형 예시 버튼 클릭 시시
 */
function textareaExPop(_this) {
  let isClass = _this.hasClass("ex_active");

  if ($("#content").attr("data-quiz-type") === "check-multi-answer") {
    if ($(".checkbox_wrap").hasClass("checked")) {
      $(".checkbox_wrap").removeClass("checked");
      $(".checkbox_wrap input[data-answer]").removeClass("checked");
      $(".checkbox_wrap input").prop("disabled", false);
    } else {
      $(".checkbox_wrap").addClass("checked");
      $(".checkbox_wrap input[data-answer]").addClass("checked");
      $(".checkbox_wrap input").prop("disabled", true);
    }
  }

  if (isDS) {
    // 스와이프 페이지의 경우 슬라이드별로 구분
    // console.log($(this).parents(".swiper-slide").find(".textareaDap"));

    if (isClass) {
      _this.removeClass("ex_active");
      _this.parents(".swiper-slide").find(".textareaDap").hide();
      // $(".swiper-slide-active textarea").attr("disabled", false).removeClass("inputInactive");
      // $(".swiper-slide-active input[type='text'], .swiper-slide-active input[type='number']").attr("disabled", false);
    } else {
      _this.addClass("ex_active");
      _this.parents(".swiper-slide").find(".textareaDap").show();
      // $(".swiper-slide-active textarea").attr("disabled", true).addClass("inputInactive");
      // $(".swiper-slide-active input[type='text'], .swiper-slide-active input[type='number']").attr("disabled", true);
    }
  } else {
    if (isClass) {
      _this.removeClass("ex_active");
      $(".textareaDap").attr("tabindex", "").hide();
      if ($(".textInputGroup .has-ex[data-input-type='dit2']")) {
        $(".hint-txt").css("display", "none");
      }
      // $("textarea").attr("disabled", false).removeClass("inputInactive");
      // $("input[type='text'],input[type='number']").attr("disabled", false);
    } else {
      if ($(".textInputGroup .has-ex[data-input-type='dit2']")) {
        $(".hint-txt").css("display", "flex");
      }
      _this.addClass("ex_active");
      $(".textareaDap").attr("tabindex", 0).show();
      // $("textarea").attr("disabled", true).addClass("inputInactive");
      // $("input[type='text'],input[type='number']").attr("disabled", true);
    }
  }
}

//이미지 감추기
$(".imgClose").on("click", function (e) {
  audio_click.currentTime = 0;
  audio_click.play();
  //$(this).parent().hide();
  $(".imgPopup").removeClass("show");
  $(".btn-img").focus();

  //popupButton.setAttribute('aria-expanded', 'false');
  //disableTabindex();

  var result = {};
  result.caliper = {
    EVENT_TYPE: "NavigationEvent",
    PROFILE_TYPE: "AssessmentProfile",
    ACTION_TYPE: "NavigatedTo",
    OBJ_NAME: "이미지 닫기",
  };

  console.log(
    "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
    "color:#870070;background:#FF97FF;",
    "color:#1266FF;",
    "color:#AB125E;"
  );
  Receiver.send("button", result);
});

/**
 * 팝업 이미지 on/off
 */
function setImgPopup() {
  const popWrap = $(".imgPopup");
  const popOpenBtn = $(".btn-img, .btn-video, .btn-record");
  const popCloseBtn = $(".ip_close");

  var result = {};

  popOpenBtn.on("click", function () {
    let OBJ_NAME = $(this).attr("aria-label");

    popWrap.addClass("show");
    popCloseBtn.focus();

    result.caliper = {
      EVENT_TYPE: "NavigationEvent",
      PROFILE_TYPE: "AssessmentProfile",
      ACTION_TYPE: "NavigatedTo",
      OBJ_NAME,
    };

    // console.log(
    //   "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
    //   "color:#870070;background:#FF97FF;",
    //   "color:#1266FF;",
    //   "color:#AB125E;"
    // );
    Receiver.send("button", result);

    let isClass = $(this).hasClass("btn-img-zoom");
    if (isClass) {
      imgPopupZoom();
    }
  });

  popCloseBtn.on("click", function () {
    popWrap.removeClass("show");

    if (isDS) {
      $(
        ".swiper-slide-active .btn-img, .swiper-slide-active .btn-video, .swiper-slide-active .btn-record"
      ).focus();
    } else {
      popOpenBtn.focus();
    }

    result.caliper = {
      EVENT_TYPE: "NavigationEvent",
      PROFILE_TYPE: "AssessmentProfile",
      ACTION_TYPE: "NavigatedTo",
      OBJ_NAME: "이미지 닫기",
    };

    console.log(
      "%c 컨텐츠 %c data: %c" + JSON.stringify(result, null, 2),
      "color:#870070;background:#FF97FF;",
      "color:#1266FF;",
      "color:#AB125E;"
    );
    Receiver.send("button", result);
  });
}

/**
 * 활동 버튼 팝업
 */
function setActivityPopup() {
  const popWrap = $(".activityPopup");
  const popOpenBtn = $(".btn-abw");
  const popCloseBtn = $(".ap_close");
  const popApCont = $(".ap_cont");
  const audioMini = $(".audioPopup.mini");

  popOpenBtn.on("click", function () {
    if ($(this).hasClass("st-state")) {
      return;
    }

    if ($(this).hasClass("mini-pop") && mediaObject) {
      mediaObject.stop();
    }
    audioMini.removeClass("show");
    popWrap.addClass("show");
    popCloseBtn.focus();
  });
  popCloseBtn.on("click", function () {
    popWrap.removeClass("show");
    popOpenBtn.focus();

    if ($(this).hasClass("unDelete")) {
      popApCont.find("#root").remove();
      return;
    }

    // if (popWrap.attr("data-type", "video")) {
    //   // popApCont.html("");
    // }

    if (popWrap.find("#root")) {
      mediaObjectVideo.getMedia().load();
      stop();
    }
  });

  if ($("canvas") && $(".activity-button-wrap")) {
    $(".activity-button-wrap > button").on("click", function () {
      $(".draw-tool-wrap").removeClass("show");
    });
  }
}

/**
 * 슬라이드 버튼 이벤트
 */
function setSlideEvent() {
  const slide_btn = $(".slide-button-wrap > button");
  const slide_paging = $(".slide-pagination-bullet");

  slide_btn.on("click", function () {
    const getDataLink = $(this).attr("data-link");
    if (getDataLink) window.open(getDataLink, "_self");
  });

  slide_paging.on("click", function () {
    const getDataLink = $(this).attr("data-link");
    if (getDataLink) window.open(getDataLink, "_self");
  });
}

/**
 * 콘텐츠 완료
 * @param {string} inputs
 */
function contentComplete(inputs = "", answer = "") {
  if (teacher) return;
  const btnWrite = document.querySelector(".btn_write");
  if (btnWrite && btnWrite.classList.contains("on")) {
    btnWrite.dispatchEvent(new Event("click"));
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.setAttribute("readonly", true);
    });
  }

  if (inputs === "") {
    inputs = "complete";
  }
  // console.log("contentComplete111", inputs, answer);
  $(".ty_complete").show();
  var result = {};
  result.caliper = {
    EVENT_TYPE: "NavigationEvent",
    PROFILE_TYPE: "AssessmentProfile",
    ACTION_TYPE: "NavigatedTo",
    OBJ_NAME: "채점하기",
  };
  result.isSubmit = true;
  result.inputs = inputs;
  result.answer = answer;
  result.completeStamp = true;

  // if (REDRAW_CHECK_BOOL) {
  //   redrawCheckInputs = inputs;
  //   const redrawCheck = document.querySelector(".redraw_check");
  //   redrawCheck.style.display = "block";
  // }

  // console.log("result", result);
  Receiver.send("button", result);
}

/**
 *
 */
function searchContent() {
  // const btnHandwrite = document.querySelectorAll(".btn_write");
  const btnHandwrite = $(".btn_write");
  if (btnHandwrite) {
    searchHandlWrite(btnHandwrite);
  }

  const btnTalk = document.querySelector(".btn_talk");
  if (btnTalk) {
    searchMovieTalk(btnTalk);
  }

  const btnViewScript = document.querySelector(".btn_script");
  if (btnViewScript) {
    btnViewScript.addEventListener("click", function () {
      playAudio(adoClick);
      createViewScriptWindow();
    });
  }

  let resetBtn = document.querySelector(".btn_return");
  const resetAllBtn = document.querySelector(".btn_box #reset_all");
  if (resetAllBtn) {
    resetBtn = resetAllBtn;
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      $(".ty_complete").hide();
      const btnWrite = document.querySelector(".btn_write");
      if (btnWrite && btnWrite.classList.contains("on")) {
        btnWrite.dispatchEvent(new Event("click"));
      }
    });
  }

  const inputEl = document.querySelector("input");
  if (inputEl) {
    // setInputAttribute();
  }

  // 사운드 완료 도장찍기
  let soundBtns = document.querySelectorAll(".btn_sound.audio2");
  const correctBtn = document.querySelector(".btn_correct");
  const spanAnswer = document.querySelector(".span_answer");
  const leftBtn = document.querySelector("button.left");
  // 4학년의 경우 사운드 버튼 클래스 이름이 달라서 추가
  if (soundBtns.length === 0) {
    soundBtns = document.querySelectorAll(".btn_white.audio2");
  }

  if (
    inputEl === null &&
    correctBtn === null &&
    spanAnswer === null &&
    leftBtn === null &&
    soundBtns.length > 0
  ) {
    soundBtns.forEach((btn) => {
      console.log(btn);
      btn.addEventListener("click", function () {
        btn.setAttribute("playcomplete", "true");
        soundCompleteCheck.clickLst = [];
        soundBtns.forEach((soundBtn) => {
          if (soundBtn.getAttribute("playcomplete") === "true") {
            soundCompleteCheck.clickLst.push(soundBtn);
          }
        });
      });
    });

    document.addEventListener("AudioPlayEvent", (event) => {
      const audioEl = event.detail.audioEl;
      audioEl.addEventListener("ended", () => {
        console.log(soundCompleteCheck);
        if (soundCompleteCheck.clickLst.length === soundBtns.length) {
          soundCompleteCheck.isComplete = true;
          searchContentMediaAllCheck();
          // if (
          //     videoCheckObj.isComplete === true &&
          //     viewScriptObj.isComplete === true
          // ) {
          //     console.log('complete');
          //     yoilContentComplete('complete');
          // }
        }
      });
    });

    const speakVideoEl = document.querySelector(".btn-container");
    if (speakVideoEl) {
      const openVideoBtn = speakVideoEl.querySelectorAll(".btn_p");
      openVideoBtn.forEach((btn) => {
        btn.addEventListener(eventType.up, () => {
          const clkNum = parseInt(btn.dataset.num);
          const indexFind = videoCheckObj.clickLst.indexOf(clkNum);
          console.log("indexFind", indexFind);
          if (indexFind === -1) {
            videoCheckObj.clickLst = [...videoCheckObj.clickLst, clkNum];
          }
          if (videoCheckObj.clickLst.length === openVideoBtn.length) {
            videoCheckObj.isComplete = true;
            searchContentMediaAllCheck();
            // if (soundCompleteCheck.isComplete) {
            //     console.log('complete2');
            //     yoilContentComplete('complete');
            // }
          }
        });
      });
    } else {
      videoCheckObj.isComplete = true;
    }

    const viewScriptBtn = document.querySelector(".btn_script");
    if (viewScriptBtn) {
      // viewScriptBtn.addEventListener('click', () => {
      //     viewScriptObj.isComplete = true;
      //     if (soundComplete.isComplete && videoCheckObj.isComplete) {
      //         console.log('complete3');
      //         yoilContentComplete('complete');
      //     }
      // });
    } else {
      viewScriptObj.isComplete = true;
    }
  }
}

//=========================================================
// 모바일 체크
//=========================================================
let mobileCheck = "";
const TYPE = {
  mobile: "mobile",
  pc: "pc",
};
/**
 * 모바일 체크
 * @returns {string} mobile | pc
 */
function isMobile() {
  const mobileArr = new Array(
    "iphone",
    "ipod",
    "ipad",
    "blackberry",
    "android",
    "windows ce",
    "lg",
    "mot",
    "samsung",
    "sonyericsson"
  );

  for (var txt in mobileArr) {
    if (navigator.userAgent.toLowerCase().match(mobileArr[txt]) != null) {
      return TYPE.mobile;
    }
  }

  return TYPE.pc;
}

const eventType = {
  down: isMobile() === TYPE.mobile ? "touchstart" : "mousedown",
  move: isMobile() === TYPE.mobile ? "touchmove" : "mousemove",
  up: isMobile() === TYPE.mobile ? "touchend" : "mouseup",
  out: isMobile() === TYPE.mobile ? "touchcancel" : "mouseout",
};

//=========================================================
// 필기 인식
//=========================================================
// 필기 인식 전역변수
let handWriteInputEl = "";

function searchHandlWrite(btn) {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener(eventType.up, function (e) {
      if (btn.hasClass("on")) {
        handWriteInputEl = e.target;
        let result = {};
        result.caliper = {
          EVENT_TYPE: "NavigationEvent",
          PROFILE_TYPE: "AssessmentProfile",
          ACTION_TYPE: "NavigatedTo",
          OBJ_NAME: "필기도구",
        };
        result.isHandwriting = true;
        Receiver.send("button", result);
      }
    });
  });

  btn.removeAttr("alt");
  btn.on("click", function () {
    $(this).toggleClass("on");
    playAudio(adoClick);
    const btnBool = $(this).hasClass("on");
    if (btnBool) {
      btn.attr("aria-label", "키보드로 전환하기, 현재 손글씨 활성화됨");
      setInputTextareaReadOnly(true);
    } else {
      btn.attr("aria-label", "손글씨로 전환하기, 현재 키보드 활성화됨");
      setInputTextareaReadOnly(false);
    }
  });

  // btn.removeAttribute("alt");
  // btn.addEventListener("click", function () {
  //   btn.classList.toggle("on");
  //   playAudio(adoClick);
  //   const btnBool = btn.classList.contains("on");
  //   if (btnBool) {
  //     btn.setAttribute("aria-label", "키보드로 전환하기, 현재 손글씨 활성화됨");
  //     setInputTextareaReadOnly(true);
  //   } else {
  //     btn.setAttribute("aria-label", "손글씨로 전환하기, 현재 키보드 활성화됨");
  //     setInputTextareaReadOnly(false);
  //   }
  // });
}

/**
 *
 * @param {*} btnTalk
 */
function searchMovieTalk(btnTalk) {
  btnTalk.addEventListener("click", function () {
    let result = {};
    result.caliper = {
      EVENT_TYPE: "NavigationEvent",
      PROFILE_TYPE: "MediaProfile",
      ACTION_TYPE: "NavigatedTo",
      OBJ_NAME: "영상보기",
    };
    result.isVideo = true;
    result.videoNum = "1";
    Receiver.send("button", result);
  });
}

/**
 * 대본 보기
 */
function createViewScriptWindow() {
  const scriptWindow = document.createElement("div");
  scriptWindow.className = "script_window";
  scriptWindow.innerHTML = `
      <div class="script_header">
          <div class="script_header_title">
              <p>대본</p>
          </div>
          <div class="script_header_buttons">
              <button type="button" class="buttons_playPause" style="width:54px;height:58px;background-image:url(${eggCommonImage}/viewscript/play.png);"></button>
              <button type="button" class="buttons_stop" style="width:54px;height:58px;background-image:url(${eggCommonImage}/viewscript/stop.png);"></button>
              <button type="button" class="buttons_toggle" style="width:165px;height:60px;background-image:url(${eggCommonImage}/viewscript/ToggleButton.png);"></button>
              <button type="button" class="buttons_close" style="width:54px;height:58px;background-image:url(${eggCommonImage}/viewscript/close.png);"></button>
          </div>
      </div>
      <div class="script_body">
          <div class="script_content">
          </div>
      </div>
  `;

  scriptWindow.style.cssText = `
  background-color: white;
  width: 1000px;
  height: 640px;
  border-radius: 20px;
  overflow: hidden;
  opacity: 1;`;

  const scriptWindowHeader = scriptWindow.querySelector(".script_header");
  scriptWindowHeader.style.cssText = `
  width:1000px;
  height:90px;
  background-color:#316E35;
  display:flex;
  flex-direction:row;
  color:white;
  font-size:32px;
  justify-content:space-between;
  align-items:center;
  padding:0 20px;
  `;

  const scriptHeaderButtons = scriptWindow.querySelector(
    ".script_header_buttons"
  );

  scriptHeaderButtons.style.cssText = `
  width: 375px;
  height: 58px;
  display: flex;
  justify-content: space-between;
  `;

  const scriptBody = scriptWindow.querySelector(".script_body");
  scriptBody.style.cssText = `
  display: flex;
  justify-content: flex-start;
  `;
  const scriptContent = scriptWindow.querySelector(".script_content");
  scriptContent.style.cssText = `
  width: 100%;
  height: 565px;
  overflow: scroll;
  padding: 20px 0 0 20px;
  scrollbar-width: thin;
  `;

  const playPauseBtn = scriptWindow.querySelector(".buttons_playPause");
  playPauseBtn.addEventListener("click", function () {
    document.querySelectorAll(".audio2[data-audio2]").forEach((item) => {
      item.audioElement.pause();
      item.audioElement.currentTime = 0;
    });

    document.querySelectorAll("audio").forEach((item) => {
      item.pause();
      item.currentTime = 0;
    });

    if (viewScriptSnd) {
    } else {
      const textLines = scriptContent.querySelectorAll(".en_text");
      const audioSrc = document.querySelector("#conversation").src;
      viewScriptSnd = new Audio(audioSrc);
      viewScriptSnd.volume = ContentService.setting.volume;
      viewScriptSnd.addEventListener("ended", function () {
        textLines.forEach((textLine) => {
          textLine.style.color = "black";
        });
        playPauseBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/play.png)`;
        console.log("viewScriptData.length", viewScriptData.length);
        if (viewScriptLineNum === viewScriptData.length) {
          // 대본보기 완료
          viewScriptObj.isComplete = true;
          searchContentMediaAllCheck();
        }
      });

      viewScriptSnd.addEventListener("timeupdate", function () {
        for (
          let lineNum = viewScriptLineNum;
          lineNum < viewScriptData.length;
          lineNum++
        ) {
          const data = viewScriptData[lineNum];

          if (viewScriptSnd) {
            if (viewScriptSnd.currentTime >= data.time) {
              textLines.forEach((textLine) => {
                textLine.style.color = "black";
              });
              textLines[viewScriptLineNum].style.color = "red";
              viewScriptLineNum++;
              break;
            }
          }
        }

        if (viewScriptSnd && viewScriptSnd.currentTime === 0) {
          viewScriptLineNum = 0;
        }
      });
    }

    if (viewScriptSnd.paused) {
      viewScriptSnd.play();
      playPauseBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/pause.png)`;
    } else {
      viewScriptSnd.pause();
      playPauseBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/play.png)`;
    }
  });

  const stopBtn = scriptWindow.querySelector(".buttons_stop");
  stopBtn.addEventListener("click", function () {
    document.querySelectorAll(".audio2[data-audio2]").forEach((item) => {
      item.audioElement.pause();
      item.audioElement.currentTime = 0;
    });

    document.querySelectorAll("audio").forEach((item) => {
      item.pause();
      item.currentTime = 0;
    });

    if (viewScriptSnd) {
      viewScriptSnd.pause();
      viewScriptSnd.currentTime = 0;
      viewScriptLineNum = 0;
      const textLines = scriptContent.querySelectorAll(".en_text");
      textLines.forEach((textLine) => {
        textLine.style.color = "black";
      });
      viewScriptSnd = null;
      playPauseBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/play.png)`;
    }
  });

  const toggleBtn = scriptWindow.querySelector(".buttons_toggle");
  toggleBtn.addEventListener("click", function () {
    toggleBtn.classList.toggle("toggle");
    const koTexts = scriptContent.querySelectorAll(".ko_text");
    let opacity = 0;
    if (toggleBtn.classList.contains("toggle")) {
      opacity = 1;
      toggleBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/ToggleButton-1.png)`;
    } else {
      toggleBtn.style.backgroundImage = `url(${eggCommonImage}/viewscript/ToggleButton.png)`;
    }
    koTexts.forEach((koText) => {
      koText.style.opacity = opacity;
    });
  });

  const closeBtn = scriptWindow.querySelector(".buttons_close");
  closeBtn.addEventListener("click", function () {
    stopBtn.click();
    scriptBackground.remove();
  });

  const scriptBackground = document.createElement("div");
  scriptBackground.className = "script_background";
  scriptBackground.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  `;

  viewScriptData = getScriptViewData();
  createScriptContent(scriptContent);
  scriptBackground.appendChild(scriptWindow);

  const contentEl = document.querySelector("#content");
  contentEl.appendChild(scriptBackground);
}

/**
 *
 */
function searchContentMediaAllCheck() {
  if (
    soundCompleteCheck.isComplete &&
    videoCheckObj.isComplete &&
    viewScriptObj.isComplete
  ) {
    contentComplete("complete");
  }
}

/**
 * 퀴즈 유형별 처리
 */
function setQuizType() {
  const _content = $("#content");
  const quizType = _content.attr("data-quiz-type");
  let inputs = $("#wrapper").find('[data-fn="입력"]');
  const notDisplayState = $(".notDisplayState");

  let isInputChk,
    isSelectChk,
    isMultiChk,
    isStarChk = false;
  let isInputChkLen;

  // 양방향 선잇기 추가
  if (quizType === "drawing-line-two-way") {
    console.log("양방향 선잇기 실행");
    fnDrwingTwoWayLine();
  }

  if (
    quizType === "selected-input-multi" ||
    quizType === "checkbox-text-multi"
  ) {
    isMultiChk = true;
  }

  if (
    quizType === "selected" ||
    quizType === "selected-multi" ||
    quizType === "selected-multi-check" ||
    quizType === "selected-input-multi"
  ) {
    // 선택형 문제 (클릭 시 동그라미 표시 후 정답 버튼 호출 - 단일 선택 / 다중 선택)
    const swWrap = $("#contents .selected-wrap");

    swWrap.children().on("touchstart click", function (e) {
      e.preventDefault();
      let isClass = $(this).hasClass("select");

      if (quizType === "selected") {
        if (isClass) {
          $(this).removeClass("select");
        } else {
          swWrap.children().removeClass("select");
          $(this).addClass("select");
        }
      } else {
        if (isClass) $(this).removeClass("select");
        else $(this).addClass("select");
      }

      let state = swWrap.find(".select").length > 0 ? "block" : "none";
      isSelectChk = swWrap.find(".select").length > 0 ? true : false;

      if (isSelectChk) {
        $(".btn_answer, .btn_return").addClass("active");
      } else {
        $(".btn_answer, .btn_return").removeClass("active");
      }

      playAudio(adoClick);
    });
  }

  if (quizType === "selected-only-check") {
    const swWrap = $("#contents .selected-wrap");
    
    swWrap.children().on("touchstart click", function (e) {
      e.preventDefault();

      if ($(this).hasClass("select")) {
        $(this).removeClass("select");
      } else {
        swWrap.children().removeClass("select");
        $(this).addClass("select");
      }

      isSelectChk = swWrap.find(".select").length > 0 ? true : false;

      if (isSelectChk) {
        $(".btn_answer, .btn_return").addClass("active");
      } else {
        $(".btn_answer, .btn_return").removeClass("active");
      }

      playAudio(adoClick);
    });
  }

  // checkbox
  // checkbox + texarea
  if (
    quizType === "checkbox" ||
    quizType === "checkbox-text-multi" ||
    quizType === "checkbox-input-multi"
  ) {
    const isQuizTypeCheckbox =
      quizType === "checkbox" || quizType === "checkbox-input-multi";

    const chkWrap = $(".checkbox_wrap");
    let getDataValue = [];

    chkWrap.each(function (index, item) {
      const chkBox = $(this).find('input[type="checkbox"]');

      chkBox.on("click", function () {
        let isClass = $(this).hasClass("checked");

        chkBox.removeClass("checked");
        if (isQuizTypeCheckbox) chkBox.parent().removeClass("checkedbox");
        if (isClass) {
          $(this).removeClass("checked");
          getDataValue[index] = "";
          if (isQuizTypeCheckbox) $(this).parent().removeClass("checkedbox");
        } else {
          $(this).addClass("checked");
          getDataValue[index] = $(this).attr("data-value");
          if (isQuizTypeCheckbox) $(this).parent().addClass("checkedbox");
        }
        playAudio(adoClick);

        let state = chkWrap.find(".checked").length > 0 ? "block" : "none";
        isSelectChk = chkWrap.find(".checked").length > 0 ? true : false;

        if (isMultiChk) {
          isSelectChk =
            chkWrap.find(".checked").length >= chkWrap.length ? true : false;
          allChk();
        } else {
          if (isSelectChk) {
            $(".btn_answer, .btn_return").addClass("active");
          } else {
            $(".btn_answer, .btn_return").removeClass("active");
          }

          if (!notDisplayState) {
            _content
              .find(".btnArea button:not(.btn_tsubmit, .btn_write)")
              .css("display", state);
          }
        }
      });
    });
  }

  if (quizType === "check-multi-answer" || quizType === "checkbox-exception") {
    const chkWrap = $(".checkbox_wrap");
    const quizTypeSub = _content.attr("data-dqt-sub") === "click-checkbox";

    chkWrap.each(function (index) {
      let chkBox = $(this).find('input[type="checkbox"]');
      if (quizTypeSub) chkBox = $(this).find('.chk-item');

      chkBox.on("click", function () {
        let isClass = $(this).hasClass("checked");
        let chkTrueLen = $("input[type='checkbox']:checked").length;
        if (quizTypeSub) isClass = $(this).find("input[type='checkbox']").hasClass("checked");

        if (isClass) {
          if (quizTypeSub) {
            $(this).find("input[type='checkbox']").removeClass("checked");
          } else {
            $(this).removeClass("checked");
          }

          if (chkTrueLen < 1) {
            $(".btn_return, .btn_answer").removeClass("active");
          }
        } else {
          if (quizTypeSub) {
            $(this).find("input[type='checkbox']").addClass("checked");
          } else {
            $(this).addClass("checked");
          }
          $(".btn_return, .btn_answer").addClass("active");
        }
        playAudio(adoClick);
      });
    });
  }

  if (quizType === "check-answer") {
    if (isDS) {
      fnCheckAnswer();
      swiper.on("slideChangeTransitionStart", fnCheckAnswer);
    } else {
      const chkBox = $('.checkbox_wrap input[type="checkbox"]');

      chkBox.off("click").on("click", function () {
        let isClass = $(this).hasClass("checked");
        chkBox.removeClass("checked");

        if (isClass) {
          $(this).removeClass("checked");
        } else {
          $(this).addClass("checked");
          $(".btn_return, .btn_answer").addClass("active");
        }
      });
    }

    function fnCheckAnswer() {
      const chkBox = $(
        '.swiper-slide-active .checkbox_wrap input[type="checkbox"]'
      );

      chkBox.off("click").on("click", function () {
        let isClass = $(this).hasClass("checked");
        chkBox.removeClass("checked");

        if (isClass) {
          $(this).removeClass("checked");
          $(
            ".swiper-slide-active .btn_return, .swiper-slide-active .btn_answer"
          ).removeClass("active");
        } else {
          $(this).addClass("checked");
          $(
            ".swiper-slide-active .btn_return, .swiper-slide-active .btn_answer"
          ).addClass("active");
        }
      });
    }
  }

  if (quizType === "evaluation" || quizType === "evaluation_notSound") {
    $(".checkStar, .checkevalStar").off("touchstart click");
    $(".checkStar, .checkevalStar").on("touchstart click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (quizType !== "evaluation_notSound") {
        playAudio(adoStar);
      }

      let pos = $(this).index();
      let teal_list_type = $(this)
        .parents(".star_wrap")
        .hasClass("star_wrap_type2");
      let teal_list_type3 = $(this)
        .parents(".star_wrap")
        .hasClass("star_wrap_type3");

      if (teal_list_type) {
        // 자기 평가 (어려웠어요. / 보통이에요 / 잘 이해했어요.) 페이지
        $(".checkStar, .checkevalStar").removeClass("on");
        $(this).addClass("on");
        let thisVal = $(this).attr("data-value");
        console.log(thisVal);
      } else if (teal_list_type3) {
        $(this).addClass("on");
        $(this)
          .siblings()
          .each(function (idx, st) {
            $(st).removeClass("on");
          });
      } else {
        // $(this).addClass('on');
        if (
          $(this).hasClass("on") &&
          pos == 0 &&
          !$(this).siblings().hasClass("on")
        ) {
          $(this).removeClass("on");
        } else if (
          $(this).hasClass("on") &&
          pos == 1 &&
          !$(this).next().hasClass("on")
        ) {
          $(this).removeClass("on");
        } else if (
          $(this).hasClass("on") &&
          pos == 2 &&
          $(this).prev().hasClass("on")
        ) {
          $(this).removeClass("on");
        } else {
          $(this).addClass("on");
        }

        $(this)
          .siblings()
          .each(function (idx, st) {
            if ($(st).index() < pos) {
              $(st).addClass("on");
            } else {
              $(st).removeClass("on");
            }
          });
      }

      let isObj;
      for (let i = 1; i <= $(".starArea").length; i++) {
        let a = $(".que" + i).children(".on").length;
        // console.log(a);
        if (a === 0) {
          isInputChk = false;
          $(".btn_return").addClass("active");
          $(".btn_tsubmit").removeClass("active");
          return false;
        }
        isObj = a;
      }
      isStarChk = isObj;

      if (isStarChk) {
        $(".btn_tsubmit, .btn_return").addClass("active");
      } else {
        $(".btn_tsubmit, .btn_return").removeClass("active");
      }
    });
  }

  if (quizType === "drawing-line" || quizType === "drawing-line-multi") {
    fnDrawingLine();
  }

  if (quizType === "drawing-line-multiple") {
    fnDrawingLineMultiple();
  }

  // input, textarea의 입력 상태 체크
  if (isDS) {
    swiper.on("slideChangeTransitionStart", function () {
      inputs = $("#wrapper .swiper-slide-active").find('[data-fn="입력"]');
    });
  } else {
    inputs = $("#wrapper").find('[data-fn="입력"]');
  }

  inputs.on("input", function () {
    let value = 0;

    inputs.each(function (i, el) {
      value += el.value ? 1 : 0;
    });

    let state = value > 0 ? true : false;
    isInputChk = value > 0 ? true : false;

    if (isIosbool) {
      if (isInputChk) {
        $(this).removeClass("isIos");
      } else {
        $(this).addClass("isIos");
      }
    }

    // 예시 버튼 on/off
    // if (state) {
    //   if (isDS) $(".swiper-slide-active .btn_ex").addClass("active");
    //   else $(".btn_ex").addClass("active");
    // } else {
    //   if (isDS) $(".swiper-slide-active .btn_ex").removeClass("active ex_active");
    //   else $(".btn_ex").removeClass("active ex_active");
    // }

    if (isMultiChk) {
      allChk();
    } else {
      if (isDS) {
        console.log(state);
        if (state) {
          $(".swiper-slide-active .btn_return").addClass("active");
          $(".swiper-slide-active .btn_save").addClass("active");
        } else {
          $(".swiper-slide-active .btn_return").removeClass("active");
          $(".swiper-slide-active .btn_save").removeClass("active");
          $(".swiper-slide-active .btn_answer").removeClass("active");
        }
      } else {
        if (state) {
          $(".btn_return").addClass("active");
          $(".btn_save").addClass("active");
        } else {
          $(".btn_return").removeClass("active");
          $(".btn_save").removeClass("active");
          $(".btn_answer").removeClass("active");
        }
      }
    }

    let inputType = $(this).parent().attr("data-input-type");

    if (inputType === "dit2" || inputType === "dit3") {
      if (value > 0) $(this).next(".btnClear").addClass("active");
      else $(this).next(".btnClear").removeClass("active");

      $(".btnClear").on("click", function () {
        $(this).prev().val("");
        $(this).removeClass("active");
      });
    }

    if (
      quizType === "check-text" ||
      quizType === "check-text-submit" ||
      quizType === "select-text-submit"
    ) {
      if (isInputChk) {
        $(".btn_tsubmit").addClass("active");
        $(".btn_return").addClass("active");
      } else {
        $(".btn_tsubmit").removeClass("active");
        $(".btn_return").removeClass("active");
      }
    } else {
      if (isInputChk) {
        if (isInputChk) {
          if (isDS) $(".swiper-slide-active .btn_answer").addClass("active");
          else $(".btn_answer").addClass("active");
        } else {
          if (isDS) $(".swiper-slide-active .btn_answer").removeClass("active");
          else $(".btn_answer").removeClass("active");
        }
      }
    }

    if (quizType === "check-text-submit" || quizType === "select-text-submit" || quizType === "textarea-submit") {
      isInputChkLen = value;
    }

    if (quizType === "textarea-submit") {
      if (isInputChk) {
        $(".btn_tsubmit").addClass("active");
      } else {
        $(".btn_tsubmit").removeClass("active");
      }
    }
  });

  if (quizType === "ox-check" || quizType === "ox-check-than") {
    $(".ox_answer").click(function () {
      $(this).next().css("display", "flex");
    });

    $(".ox_select_btn").click(function () {
      if ($(this).hasClass("answer_o")) {
        $(this)
          .parent()
          .parent()
          .find(".ox_answer")
          .attr("class", "ox_answer answer_o");
      } else if ($(this).hasClass("answer_x")) {
        $(this)
          .parent()
          .parent()
          .find(".ox_answer")
          .attr("class", "ox_answer answer_x");
      }
      $(this).parent().css("display", "none");

      if (isDS) {
        $(
          ".swiper-slide-active .btn_return, .swiper-slide-active .btn_answer"
        ).addClass("active");
      } else {
        $(".btn_return, .btn_answer").addClass("active");
      }
    });
  }

  if (quizType === "drag-and-drop") {
    fnDnd();
  }

  if (quizType === "drag-and-drop-sticky") {
    fnDndSticky();
  }

  if (quizType === "input-ex") {
    if (isDS) {
      inputExSwiper();
      swiper.on("slideChangeTransitionStart", inputExSwiper);
    } else {
      $(".btn_ex").on("click", function () {
        let isExActive = $(this).hasClass("ex_active");

        if (isExActive) {
          $(".hint-txt").show();
        } else {
          $(".hint-txt").hide();
        }
      });
    }

    function inputExSwiper() {
      $(".swiper-slide-active .btn_ex").on("click", function () {
        let isExActive = $(this).hasClass("ex_active");

        if (isExActive) {
          $(".swiper-slide-active .hint-txt").show();
        } else {
          $(".swiper-slide-active .hint-txt").hide();
        }
      });
    }
  }

  // 두가지 이상의 퀴즈 유형별 체크
  function allChk() {
    if (isInputChk || isSelectChk) {
      $(".btn_return, .btn_tsubmit").addClass("active");
    } else {
      $(".btn_return, .btn_tsubmit").removeClass("active");
    }

    let state = isInputChk && isSelectChk ? true : false;

    if (!isInputChk && !isSelectChk) {
      if (state) {
        $.find(".btn_return").addClass("active");
      } else {
        $.find(".btn_return").removeClass("active");
      }
    }
  }

  // 다시하기
  $(".btn_return").on("touchstart click", function (e) {
    e.preventDefault();

    let isClass = $(this).hasClass("active");
    $(".btn_save").removeClass("active");
    if (isClass) currentReset(quizType);

    sendResetButton();
  });

  // 정답 확인
  $(".btn_answer").on("touchstart click", function (e) {
    e.preventDefault();

    if (!$(this).hasClass("active")) {
      return;
    }
    currentCheck(quizType);
  });

  // 제출하기
  $(".btn_tsubmit").on("touchstart click", function (e) {
    e.preventDefault();

    if (!$(this).hasClass("active")) {
      return;
    }

    let state;

    if (quizType === "evaluation" || quizType === "evaluation_notSound") {
      state = isStarChk;
    } else {
      if (quizType === "check-text") {
        state = isInputChk;
      } else {
        state = isInputChk && isSelectChk;
      }
    }

    let inputLen = $("input").length;
    if (isDS) inputLen = $(".swiper-slide-active input").length;

    if (quizType === "check-text-submit") {
      inputLen = $(".text_container input[data-fn='입력']").length;
      isInputChkLen < inputLen ? (state = false) : (state = true);
    }

    if (quizType === "select-text-submit") {
      let selectCard = $(".select_list").hasClass("disabled");
      isInputChkLen === inputLen && selectCard
        ? (state = true)
        : (state = false);
    }

    let inTextArea = $("textarea");
    if (isDS) inTextArea = $(".swiper-slide-active textarea");

    if (quizType === "textarea-submit") {
      let filledChk = true;

      inTextArea.each(function() {
        if ($(this).val().trim() === '') {
          filledChk = false;
          return false;
        }
      });

      filledChk ? state = true : state = false;
    }

    if (quizType === "drawing-only") {
      state = true;
    }

    if (quizType === "checkbox-text-multi") {
      if (
        $('input[type="checkbox"].checked').length > 0 &&
        !$("textarea").val() == ""
      ) {
        state = true;
      } else {
        state = false;
      }
    }

    submitChkEvent(state);
  });
}

/**
 * 팝업 이미지 확대/축소
 */
function imgPopupZoom() {
  let currentScale = 1;
  const imgWrapInner = $(".imgPopup .ip_image > div");
  const popZoomImgWt = $(".ip_image img").width();
  let isDragging = false;
  let startX, startY, startScrollLeft, startScrollTop;
  $(".ip_zoomOut").addClass("off");

  if (popZoomImgWt < 500) {
    $(".ip_image > div").css({
      width: "500px",
      height: "100%",
    });

    $(".ip_image img").css("width", "100%");
  }

  // 이미지 확대
  $(".ip_zoomIn").click(function () {
    if (currentScale < 2) currentScale += 0.5;
    updateZoom();
  });

  // 이미지 축소
  $(".ip_zoomOut").click(function () {
    if (currentScale > 1) currentScale -= 0.5;
    updateZoom();
  });

  // 이미지 확대/축소 업데이트
  function updateZoom() {
    imgWrapInner.css({
      transform: "scale(" + currentScale + ")",
    });

    if (currentScale === 2) {
      $(".ip_zoomIn").addClass("off");
    } else {
      $(".ip_zoomIn").removeClass("off");
    }

    if (currentScale === 1) {
      $(".ip_zoomOut").addClass("off");
    } else {
      $(".ip_zoomOut").removeClass("off");
    }
  }

  imgWrapInner.on("mousedown", fnMousedown);
  imgWrapInner.on("mousemove", fnMousemove);
  imgWrapInner.on("mouseup", fnMouseup);

  function fnMousedown(e) {
    isDragging = true;

    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = $(".ip_image").scrollLeft();
    startScrollTop = $(".ip_image").scrollTop();

    $(".ip_image").css("cursor", "grabbing");
  }

  function fnMousemove(e) {
    if (isDragging) {
      const moveFactor = 1.5;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newScrollLeft = startScrollLeft - dx * moveFactor;
      const newScrollTop = startScrollTop - dy * moveFactor;

      $(".ip_image").scrollLeft(newScrollLeft);
      $(".ip_image").scrollTop(newScrollTop);
    }
  }

  function fnMouseup() {
    isDragging = false;
    $(".ip_image").css("cursor", "grab");
  }

  // 터치 이벤트 추가 (모바일 대응)
  imgWrapInner.on("touchstart", function (e) {
    isDragging = true;

    startX = e.originalEvent.touches[0].clientX;
    startY = e.originalEvent.touches[0].clientY;
    startScrollLeft = $(".ip_image").scrollLeft();
    startScrollTop = $(".ip_image").scrollTop();

    $(".ip_image").css("cursor", "grabbing");
  });

  imgWrapInner.on("touchmove", function (e) {
    if (isDragging) {
      const dx = e.originalEvent.touches[0].clientX - startX;
      const dy = e.originalEvent.touches[0].clientY - startY;

      const moveFactor = 1.5;

      const newScrollLeft = startScrollLeft - dx * moveFactor;
      const newScrollTop = startScrollTop - dy * moveFactor;

      $(".ip_image").scrollLeft(newScrollLeft);
      $(".ip_image").scrollTop(newScrollTop);
    }
  });

  imgWrapInner.on("touchend", function () {
    isDragging = false;
    $(".ip_image").css("cursor", "grab");
  });

  updateZoom();
}

// 카드 선택 시 이미지 확대
$(document).ready(function () {
  $(".select_list div").click(function () {
    playAudio(adoClick);
    let imgSrc = $(this).find("img").attr("src");
    let imgAlt = $(this).find("img").attr("alt");

    $(".select_list > div").find(".selected_bg").remove();
    $(".select_list > div").removeClass("box_on");
    $(".img_select_view .selected_area img").remove();

    $(".selected_area").addClass("on");
    $(this).addClass("box_on");
    $(this).append(
      '<div class="selected_bg"><div class="bg"></div><div class="chk_icon"></div></div>'
    );
    $(".img_select_view .selected_area span").remove();
    $(".img_select_view .selected_area").append(
      '<img src="' + imgSrc + '" alt="' + imgAlt + '">'
    );
    $(".img_select_btn").show();
  });
  $(".img_select_btn").click(function () {
    msgAlert("카드를 더 이상 바꿀 수 없습니다.<br/>선택하시겠습니까?", "YN");
    cardConfirm();
  });
});

function msgAlertYN() {
  $(".toast-select.YN button").click(function () {
    playAudio(adoClick);
    $(".toast-msg-container").remove();
  });
}
function cardConfirm() {
  $(".toast-select .alert-y").click(function () {
    $(".select_list").addClass("disabled");
    $(".img_select_btn").hide();
    $(".select_list > div").css("pointer-events", "none");
    $(".card_select_section .input_area input")
      .attr("placeholder", "")
      .removeAttr("disabled");
  });
}

/**
 * 드롭다운
 */
function setDropDown() {
  const dropdown = $(".dropdown");
  const input = $(".dropdown input");
  const listOfOptions = $(".dropdown .option");
  const body = $("body");

  const toggleDropdown = (event) => {
    event.stopPropagation();
    dropdown.toggleClass("opened");
  };

  const selectOption = (event) => {
    input.val(event.currentTarget.textContent);
    listOfOptions.removeClass("active");
    $(event.currentTarget).addClass("active");
  };

  const closeDropdownFromOutside = () => {
    if (dropdown.hasClass("opened")) {
      dropdown.removeClass("opened");
    }
  };

  body.on("click", closeDropdownFromOutside);
  listOfOptions.on("click", selectOption);
  dropdown.on("click", toggleDropdown);
}

// 오디오 팝업
function showDimmedOverlay() {
  if (mediaObject) {
    // mediaObject.stop();
  }
  $(".audioPopup").addClass("show");
}
function hideDimmedOverlay() {
  if (mediaObject) {
    mediaObject.stop();
  }
  $(".audioPopup").removeClass("show");
}

/**
 * 영상 2개 이상 페이지 리셋
 */
function videoReset() {
  $(".ip_close").on("click", function () {
    $(".imgPopup .ip_inner #root").remove();
  });
}

/**
 * ppt 다운로드
 */
function onClickPpt(dClass) {
  let url;

  switch (dClass) {
    case "5-L1_PT1_기본":
      url = "../../common_contents/common/ppt/EEN5/5-L1_PT1_기본.pptx";
      break;
    case "5-L10_FT_기본":
      url = "../../common_contents/common/ppt/EEN5/5-L10_FT_기본.pptx";
      break;
    case "5-L10_PT1_기본":
      url = "../../common_contents/common/ppt/EEN5/5-L10_PT1_기본.pptx";
      break;
    case "6-L2_FT_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L2_FT_기본.pptx";
      break;
    case "6-L2_PT2_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L2_PT2_기본.pptx";
      break;
    case "6-L3_FT_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L3_FT_기본.pptx";
      break;
    case "6-L4_FT_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L4_FT_기본.pptx";
      break;
    case "6-L5_FT_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L5_FT_기본.pptx";
      break;
    case "6-L5_PT1_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L5_PT1_기본.pptx";
      break;
    case "6-L6_FT_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L6_FT_기본.pptx";
      break;
    case "6-L8_PT2_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L8_PT2_기본.pptx";
      break;
    case "6-L10_PT1_기본":
      url = "../../common_contents/common/ppt/EEN6/6-L10_PT1_기본.pptx";
      break;
  }

  location.href = url;
}

/**
 * 선잇기
 */
function fnDrawingLine() {
  const canvas = $("#drawingCanvas")[0];
  const ctx = canvas.getContext("2d");
  // canvas.style.cursor = "pointer";

  let isDrawing = false;
  let startX, startY;
  let currentStartPoint = null;
  let lines = [];
  let storedLines = [];
  let isAnswerChecked = false;
  // let mode = null;
  let dragClick = 0;

  function drawLines() {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // lines.forEach((line) => {
    //   ctx.beginPath();
    //   ctx.moveTo(line.start.x, line.start.y);
    //   ctx.lineTo(line.end.x, line.end.y);
    //   ctx.strokeStyle = line.color;
    //   ctx.lineWidth = 6;
    //   ctx.stroke();
    // });

    // 250420 정오답 체크 시 선 수정
    lines.forEach((line) => {
      if (line.color === "#3B71FE") {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = "rgba(59, 113, 254, 0.5)";
        ctx.lineWidth = 12;
        ctx.stroke();
        line.color = "#222";
      } else if (line.color === "#FF0000") {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 12;
        ctx.stroke();
        line.color = "rgba(255, 255, 255, 0)";
      }

      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width || 4;
      ctx.stroke();
    });
  }

  function drawPoints() {
    ctx.fillStyle = "#6A6A6A";
    [...leftPoints, ...rightPoints].forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    $(canvas).on("mousemove", function (e) {
      const { x, y } = getAdjustedCoords(e);
      let isHovering = false;

      [...leftPoints, ...rightPoints].forEach((point) => {
        if (Math.abs(x - point.x) < 20 && Math.abs(y - point.y) < 20) {
          isHovering = true;
        }
      });

      if (isHovering) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    });
  }

  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawPoints();
  }

  function getAdjustedCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scaleRatio,
      y: (e.clientY - rect.top) / scaleRatio,
    };
  }

  function removeLineByLeftPoint(point) {
    const index = lines.findIndex(
      (line) => line.start.x === point.x && line.start.y === point.y
    );
    if (index !== -1) {
      const removedLine = lines.splice(index, 1)[0];
      rightPoints.forEach((rp) => {
        if (rp.x === removedLine.end.x && rp.y === removedLine.end.y) {
          rp.connected = false;
        }
      });
      point.connected = false;
    }
  }

  let clickStartPoint = null;

  function onClick(e) {
    dragClick++;

    if (dragClick > 1) {
      dragClick = 0;
    } else {
      const { x, y } = getAdjustedCoords(e);

      leftPoints.forEach((point) => {
        if (Math.abs(x - point.x) < 40 && Math.abs(y - point.y) < 40) {
          removeLineByLeftPoint(point);
          isDrawing = true;
          startX = point.x;
          startY = point.y;
          currentStartPoint = point;
        }
      });
    }

    if (isAnswerChecked) return;

    const { x, y } = getAdjustedCoords(e);
    const clickedLeft = leftPoints.find(
      (p) => Math.abs(x - p.x) < 20 && Math.abs(y - p.y) < 20
    );

    if (clickedLeft) {
      if (clickedLeft.connected) return;

      if (clickStartPoint === clickedLeft) {
        clickStartPoint = null;
        redrawCanvas();
        return;
      }

      clickStartPoint = clickedLeft;
      redrawCanvas();
      return;
    }

    const clickedRight = rightPoints.find(
      (p) =>
        Math.abs(x - p.x) < 20 && Math.abs(y - p.y) < 20 && !p.connected
    );

    if (clickedRight && clickStartPoint) {
      lines.push({
        start: { x: clickStartPoint.x, y: clickStartPoint.y },
        end: { x: clickedRight.x, y: clickedRight.y },
        color: "#222",
        width: 4,
        leftValue: clickStartPoint.value,
        rightValue: clickedRight.value,
      });

      clickedRight.connected = true;
      clickStartPoint.connected = true;
      clickStartPoint = null;
      $(".btn_return, .btn_answer").addClass("active");
      redrawCanvas();
    }
  }

  function onDown(e) {
    if (isAnswerChecked) return;
    const { x, y } = getAdjustedCoords(e);

    leftPoints.forEach((point) => {
      if (Math.abs(x - point.x) < 40 && Math.abs(y - point.y) < 40) {
        removeLineByLeftPoint(point);
        isDrawing = true;
        startX = point.x;
        startY = point.y;
        currentStartPoint = point;
      }
    });
  }

  function onMove(e) {
    if (isAnswerChecked || !isDrawing) return;
    const { x, y } = getAdjustedCoords(e);

    redrawCanvas();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function onUp(e) {
    dragClick = 0;

    if (isAnswerChecked || !isDrawing) return;
    const { x, y } = getAdjustedCoords(e);

    let connected = false;
    let isQuizType =
      $("#content").attr("data-quiz-type") === "drawing-line-multi";

    rightPoints.forEach((point) => {
      if (isQuizType) {
        if (Math.abs(x - point.x) < 40 && Math.abs(y - point.y) < 40) {
          lines.push({
            start: { x: startX, y: startY },
            end: { x: point.x, y: point.y },
            color: "#222",
            leftValue: currentStartPoint.value,
            rightValue: point.value,
          });
          point.connected = true;
          currentStartPoint.connected = true;
          connected = true;
          clickStartPoint = null;
          redrawCanvas();
          playAudio(adoClick);
          $(".btn_return, .btn_answer").addClass("active");
        }
      } else {
        if (
          Math.abs(x - point.x) < 40 &&
          Math.abs(y - point.y) < 40 &&
          !point.connected
        ) {
          lines.push({
            start: { x: startX, y: startY },
            end: { x: point.x, y: point.y },
            color: "#222",
            leftValue: currentStartPoint.value,
            rightValue: point.value,
          });
          point.connected = true;
          currentStartPoint.connected = true;
          connected = true;
          clickStartPoint = null;
          redrawCanvas();
          playAudio(adoClick);
          $(".btn_return, .btn_answer").addClass("active");
        }
      }
    });

    if (!connected) {
      redrawCanvas();
    }

    isDrawing = false;
    currentStartPoint = null;
  }

  // let lastTouch = null;

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseup", onUp);
  canvas.addEventListener("click", onClick);

  canvas.addEventListener("touchstart", function (e) {
    if (e.touches.length > 0) {
      onDown(e.touches[0]);
      // lastTouch = e.touches[0];
    }
  });

  canvas.addEventListener("touchmove", function (e) {
    if (e.touches.length > 0) {
      onMove(e.touches[0]);
    }
  });

  let lastTouch = { clientX: 0, clientY: 0 };

  canvas.addEventListener("touchmove", function (e) {
    if (e.touches.length > 0) {
      lastTouch = e.touches[0];
    }
  });

  canvas.addEventListener("touchend", function () {
    onUp(lastTouch);
    if (lastTouch) {
      onClick(lastTouch);
      lastTouch = null;
    }
  });

  let wrongCount = 0;
  function drawCurrectChk() {
    isAnswerChecked = true;
    storedLines = [...lines];

    const correctLines = [];
    const redAnswerLines = [];
    const studentLines = [];

    correctCount = 0;
    incorrectCount = 0;

    answerConnections.forEach((answer) => {
      const matched = lines.find(
        (line) =>
          line.leftValue === answer.left && line.rightValue === answer.right
      );

      const l = leftPoints.find((p) => p.value === answer.left);
      const r = rightPoints.find((p) => p.value === answer.right);

      if (wrongCount > 0) {
        studentLines.push({
          // start:{x: lines[answer.right-1].start.x, y:lines[answer.right-1].start.y},
          // end:{x: lines[answer.right-1].end.x, y:lines[answer.right-1].end.y},
          start: {
            x: lines[answer.left - 1].start.x,
            y: lines[answer.left - 1].start.y,
          },
          end: {
            x: lines[answer.left - 1].end.x,
            y: lines[answer.left - 1].end.y,
          },
          color: "#222",
        });
      }
      if (matched) {
        correctLines.push({
          start: { x: l.x, y: l.y },
          end: { x: r.x, y: r.y },
          color: "#3B71FE",
        });
        correctCount++;
      } else {
        redAnswerLines.push({
          start: { x: l.x, y: l.y },
          end: { x: r.x, y: r.y },
          color: "#FF0000",
        });
        incorrectCount++;
      }
    });

    // === 여기서부터 input 정답 체크 추가 ===
    let isInputCorrect = true;
    let isInputAllFilled = true;
    const contentDiv = document.getElementById("content");
    if (
      contentDiv &&
      contentDiv.getAttribute("data-quiz-add-type") === "text"
    ) {
      const inputs = document.querySelectorAll(".textInputGroup .input");
      inputs.forEach((input) => {
        const answer = input.parentElement
          .querySelector(".ex-txt")
          ?.textContent?.trim();

        // 기존에 표시된 정답 안내 제거
        const oldShow = input.parentElement.querySelector(".show-answer");
        if (oldShow) oldShow.remove();

        if (!input.value || input.value.trim() === "") {
          isInputAllFilled = false;
        }

        // 정답 체크 로직 추가!
        if (!input.value || input.value.trim() !== answer) {
          isInputCorrect = false;
        }
      });
    }

    if (!isInputAllFilled) {
      setAnswerPopupContent(3);
      isAnswerChecked = false;
      return true;
    }
    // === 여기까지 추가 ===

    if ($("#content").attr("data-drawing-ex") === "") {
      lines = [...correctLines, ...redAnswerLines];
      redrawCanvas();
      return false;
    }

    if (correctCount === leftPoints.length) {
      setAnswerPopupContent(0);
      $("#drawingCanvas").addClass("checked");
      playAudio(`../common/audio/correct.mp3`);
      // $(".btn_answer").addClass("btn_answer_x");
      $(".btn_answer").removeClass("active");

      lines = [...correctLines, ...redAnswerLines];
    } else if (lines.length < leftPoints.length) {
      setAnswerPopupContent(3);
      isAnswerChecked = false;
    } else {
      wrongCount++;
      setAnswerPopupContent(wrongCount);

      if (wrongCount !== 2) {
        // 한번 더 생각해 보세요.
        isAnswerChecked = false;
        return true;
      } else {
        // 정답을 확인해 보세요. (이때만 정답 노출)
        // input 정답 노출
        if (
          contentDiv &&
          contentDiv.getAttribute("data-quiz-add-type") === "text"
        ) {
          const inputs = document.querySelectorAll(".textInputGroup .input");
          inputs.forEach((input) => {
            const answer = input.parentElement
              .querySelector(".ex-txt")
              ?.textContent?.trim();

            // 기존에 표시된 정답 안내 제거
            const oldShow = input.parentElement.querySelector(".show-answer");
            if (oldShow) oldShow.remove();

            if (!input.value || input.value.trim() !== answer) {
              // 정답 안내 추가
              const answerDiv = document.createElement("div");
              answerDiv.className = "show-answer";
              answerDiv.style.color = "#FF0000";
              answerDiv.style.fontSize = "24px";
              answerDiv.style.marginTop = "2px";
              answerDiv.textContent = `${answer}`;
              input.parentElement.appendChild(answerDiv);
            }
          });
        }

        lines = [...studentLines, ...correctLines, ...redAnswerLines];
        wrongCount = 0;
        $("#drawingCanvas").addClass("checked");
        playAudio(`../common/audio/fail.wav`);
        $(".btn_answer").removeClass("active");
      }
    }

    redrawCanvas();
  }

  function drawInputCurrectChk() {
    isAnswerChecked = true;
    storedLines = [...lines];

    const correctLines = [];
    const redAnswerLines = [];
    const studentLines = [];

    correctCount = 0;
    incorrectCount = 0;

    answerConnections.forEach((answer) => {
      const matched = lines.find(
        (line) =>
          line.leftValue === answer.left && line.rightValue === answer.right
      );

      const l = leftPoints.find((p) => p.value === answer.left);
      const r = rightPoints.find((p) => p.value === answer.right);

      if (wrongCount > 0) {
        studentLines.push({
          // start:{x: lines[answer.right-1].start.x, y:lines[answer.right-1].start.y},
          // end:{x: lines[answer.right-1].end.x, y:lines[answer.right-1].end.y},
          start: {
            x: lines[answer.left - 1].start.x,
            y: lines[answer.left - 1].start.y,
          },
          end: {
            x: lines[answer.left - 1].end.x,
            y: lines[answer.left - 1].end.y,
          },
          color: "#222",
        });
      }

      if (matched) {
        correctLines.push({
          start: { x: l.x, y: l.y },
          end: { x: r.x, y: r.y },
          color: "#3B71FE",
        });
        correctCount++;
      } else {
        redAnswerLines.push({
          start: { x: l.x, y: l.y },
          end: { x: r.x, y: r.y },
          color: "#FF0000",
        });
        incorrectCount++;
      }
    });

    let answerValue = $("input[data-value]");
    let textContainer = $(".text_container");
    let totalCount = answerValue.length;
    const summary = {
      correct: 0,
      incorrect: 0,
      blank: 0,
    };

    answerValue.each((index, input) => {
      let content = input.value;
      let dataset = input.dataset.value;

      textContainer.removeClass("checked");
      input.classList.remove("--incorrect");
      if (content === "") {
        summary.blank++;
        input.classList.add("--incorrect");
      } else if (
        checkCorrect(input.value, input.dataset.value, input.dataset.separator)
      ) {
        summary.correct++;
      } else {
        summary.incorrect++;
        input.classList.add("--incorrect");
      }
    });

    let answerBtn = $(".btn_answer");

    if (
      totalCount === summary.blank ||
      summary.blank !== 0 ||
      lines.length < leftPoints.length
    ) {
      setAnswerPopupContent(3);
      isAnswerChecked = false;
      refreshInputBorder();
      return true;
    } else if (
      totalCount == summary.correct &&
      correctCount === leftPoints.length
    ) {
      setAnswerPopupContent(0);
      playAudio(adoCorrect);
      lines = [...correctLines, ...redAnswerLines];
      $("#drawingCanvas").addClass("checked");
      $(".btn_answer").removeClass("active");
      redrawCanvas();
      textContainer.addClass("checked");
    } else {
      wrongCount++;
      setAnswerPopupContent(wrongCount);

      if (wrongCount !== 2) {
        answerBtn.removeClass("btn_answer_x");
        isAnswerChecked = false;
        return true;
      } else {
        lines = [...studentLines, ...correctLines, ...redAnswerLines];
        wrongCount = 0;
        $("#drawingCanvas").addClass("checked");
        playAudio(`../common/audio/fail.wav`);
        $(".btn_answer").removeClass("active");
        answerBtn.removeClass("active");
        textContainer.addClass("checked");
      }
      refreshInputBorder();
      redrawCanvas();
    }
  }
  $(".btn_answer:not(.w_drag_input)").on("click touchend", function () {
    let isAnswerBtn = $(this).hasClass("btn_answer_x");

    if ($(this).hasClass("active")) {
      if (isAnswerBtn) {
        lines = [...storedLines];
        redrawCanvas();
        $(this).removeClass("btn_answer_x");
        isAnswerChecked = false;
      } else {
        drawCurrectChk();
      }
    }
  });
  $(".btn_answer.w_drag_input").on("click touchend", function () {
    let isAnswerBtn = $(this).hasClass("btn_answer_x");

    if ($(this).hasClass("active")) {
      if (isAnswerBtn) {
        lines = [...storedLines];
        redrawCanvas();
        $(this).removeClass("btn_answer_x");
        isAnswerChecked = false;
      } else {
        drawInputCurrectChk();
      }
    }
  });

  // $("#undoButton").on("click", function () {
  //   lines = [...storedLines];
  //   redrawCanvas();
  // });

  $(".btn_return").on("click touchend", function () {
    lines = [];
    storedLines = [];
    leftPoints.forEach((p) => (p.connected = false));
    rightPoints.forEach((p) => (p.connected = false));
    isAnswerChecked = false;
    $(".btn_return, .btn_answer").removeClass("active btn_answer_x");
    wrongCount = 0;
    $('input[type="text"]').val("");
    $(".text_container").removeClass("checked");
    refreshInputBorder();
    redrawCanvas();
  });

  $(".btn_ex").on("click", function () {
    if ($(this).hasClass("ex_active")) {
      drawCurrectChk();
    } else {
      lines = [...storedLines];
      redrawCanvas();
      isAnswerChecked = false;
    }
  });

  redrawCanvas();
}

/**
 * 양방향 선잇기
 */
function fnDrwingTwoWayLine() {
  const canvas = document.getElementById("drawingCanvas");
  const ctx = canvas.getContext("2d");

  // 점들의 배열과 선들의 배열 초기화
  let selectedLeftPoint = null;
  let selectedRightPoint = null;
  let dragging = false;
  let currentLine = null;
  let userLines = [];

  // 캔버스 초기화 및 이벤트 리스너 설정
  initCanvas();

  // 캔버스 초기화 함수
  function initCanvas() {
    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.style.cursor = "pointer";

    // 이벤트 리스너 등록
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);

    // 초기 그리기
    redrawCanvas();

    // 다시하기 버튼 이벤트
    document
      .querySelector(".btn_return")
      .addEventListener("click", resetCanvas);

    // 예시 버튼 이벤트
    if (document.querySelector(".btn_ex")) {
      document.querySelector(".btn_ex").addEventListener("click", showExample);
    }
  }

  // 캔버스 다시 그리기
  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPoints();
    drawLines();
  }

  // 포인트 그리기
  function drawPoints() {
    ctx.fillStyle = "#6A6A6A";

    // 왼쪽 포인트 그리기
    leftPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 오른쪽 포인트 그리기
    rightPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 선 그리기
  function drawLines() {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 저장된 선 그리기
    userLines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    // 현재 그리는 선 표시
    if (dragging) {
      ctx.beginPath();
      if (selectedLeftPoint) {
        ctx.moveTo(selectedLeftPoint.x, selectedLeftPoint.y);
      } else if (selectedRightPoint) {
        ctx.moveTo(selectedRightPoint.x, selectedRightPoint.y);
      }
      ctx.lineTo(currentLine.endX, currentLine.endY);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }

  // 좌표 조정 (캔버스 비율에 맞게)
  function getAdjustedCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.type.includes("touch")) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }

  // 좌표에 해당하는 포인트 찾기
  function findPoint(x, y) {
    // 왼쪽 포인트 검사
    for (let i = 0; i < leftPoints.length; i++) {
      const point = leftPoints[i];
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      if (distance <= 15) {
        return { point, isLeft: true, index: i };
      }
    }

    // 오른쪽 포인트 검사
    for (let i = 0; i < rightPoints.length; i++) {
      const point = rightPoints[i];
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      if (distance <= 15) {
        return { point, isLeft: false, index: i };
      }
    }

    return null;
  }

  // 마우스 이벤트 핸들러
  function onMouseDown(e) {
    const coords = getAdjustedCoords(e);
    const pointInfo = findPoint(coords.x, coords.y);

    if (pointInfo) {
      if (pointInfo.isLeft) {
        selectedLeftPoint = pointInfo.point;
        currentLine = {
          startX: selectedLeftPoint.x,
          startY: selectedLeftPoint.y,
          endX: coords.x,
          endY: coords.y,
          leftIndex: pointInfo.index,
          leftValue: pointInfo.point.value,
        };
        dragging = true;
      } else if (!selectedLeftPoint) {
        selectedRightPoint = pointInfo.point;
        currentLine = {
          startX: selectedRightPoint.x,
          startY: selectedRightPoint.y,
          endX: coords.x,
          endY: coords.y,
          rightIndex: pointInfo.index,
          rightValue: pointInfo.point.value,
        };
        dragging = true;
      }
    }

    redrawCanvas();
  }

  function onMouseMove(e) {
    if (dragging) {
      const coords = getAdjustedCoords(e);
      currentLine.endX = coords.x;
      currentLine.endY = coords.y;
      redrawCanvas();
    }
  }

  function onMouseUp(e) {
    if (dragging) {
      const coords = getAdjustedCoords(e);
      const pointInfo = findPoint(coords.x, coords.y);

      if (pointInfo) {
        // 왼쪽에서 시작해서 오른쪽으로 연결
        if (selectedLeftPoint && !pointInfo.isLeft) {
          const rightPoint = pointInfo.point;

          // 이미 연결된 선이 있는지 확인
          const existingLineIndex = userLines.findIndex(
            (line) =>
              (line.leftIndex === currentLine.leftIndex &&
                line.rightIndex === pointInfo.index) ||
              (line.rightIndex === currentLine.leftIndex &&
                line.leftIndex === pointInfo.index)
          );

          if (existingLineIndex === -1) {
            userLines.push({
              startX: selectedLeftPoint.x,
              startY: selectedLeftPoint.y,
              endX: rightPoint.x,
              endY: rightPoint.y,
              leftIndex: currentLine.leftIndex,
              rightIndex: pointInfo.index,
              leftValue: selectedLeftPoint.value,
              rightValue: rightPoint.value,
            });

            leftPoints[currentLine.leftIndex].connected = true;
            rightPoints[pointInfo.index].connected = true;
          }
        }
        // 오른쪽에서 시작해서 왼쪽으로 연결
        else if (selectedRightPoint && pointInfo.isLeft) {
          const leftPoint = pointInfo.point;

          // 이미 연결된 선이 있는지 확인
          const existingLineIndex = userLines.findIndex(
            (line) =>
              (line.leftIndex === pointInfo.index &&
                line.rightIndex === currentLine.rightIndex) ||
              (line.rightIndex === pointInfo.index &&
                line.leftIndex === currentLine.rightIndex)
          );

          if (existingLineIndex === -1) {
            userLines.push({
              startX: leftPoint.x,
              startY: leftPoint.y,
              endX: selectedRightPoint.x,
              endY: selectedRightPoint.y,
              leftIndex: pointInfo.index,
              rightIndex: currentLine.rightIndex,
              leftValue: leftPoint.value,
              rightValue: selectedRightPoint.value,
            });

            leftPoints[pointInfo.index].connected = true;
            rightPoints[currentLine.rightIndex].connected = true;
          }
        }
      }

      // 선 그리기 상태 초기화
      selectedLeftPoint = null;
      selectedRightPoint = null;
      dragging = false;
      currentLine = null;

      redrawCanvas();

      // 모든 포인트가 연결되었는지 체크
      checkAllConnected();
    }
  }

  // 터치 이벤트 핸들러
  function onTouchStart(e) {
    e.preventDefault();
    onMouseDown(e);
  }

  function onTouchMove(e) {
    e.preventDefault();
    onMouseMove(e);
  }

  function onTouchEnd(e) {
    e.preventDefault();
    onMouseUp(e);
  }

  // 모든 포인트가 연결되었는지 체크
  function checkAllConnected() {
    if (userLines.length > 0) {
      document.querySelector(".btn_return").classList.add("active");
    } else {
      document.querySelector(".btn_return").classList.remove("active");
    }
  }

  // 캔버스 초기화
  function resetCanvas() {
    userLines = [];
    leftPoints.forEach((point) => (point.connected = false));
    rightPoints.forEach((point) => (point.connected = false));

    document.querySelector(".btn_return").classList.remove("active");
    redrawCanvas();
  }

  // 예시 보기
  function showExample() {
    // 예시가 이미 표시된 상태인지 확인 (모든 정답 연결이 표시된 상태)
    const allAnswersShown = answerConnections.every((conn) =>
      userLines.some(
        (line) => line.leftValue === conn.left && line.rightValue === conn.right
      )
    );

    // 예시가 이미 표시된 상태면 초기화
    if (allAnswersShown) {
      resetCanvas();
      return;
    }

    // 사용자가 그린 선이 있든 없든 초기화하고 예시 표시
    resetCanvas();

    // 정답 연결선 표시
    answerConnections.forEach((conn) => {
      const leftPoint = leftPoints.find((p) => p.value === conn.left);
      const rightPoint = rightPoints.find((p) => p.value === conn.right);

      if (leftPoint && rightPoint) {
        userLines.push({
          startX: leftPoint.x,
          startY: leftPoint.y,
          endX: rightPoint.x,
          endY: rightPoint.y,
          leftIndex: leftPoints.findIndex((p) => p.value === conn.left),
          rightIndex: rightPoints.findIndex((p) => p.value === conn.right),
          leftValue: leftPoint.value,
          rightValue: rightPoint.value,
        });

        leftPoint.connected = true;
        rightPoint.connected = true;
      }
    });

    document.querySelector(".btn_return").classList.add("active");
    redrawCanvas();
  }
}

/**
 * 학생용/교사용 구분
 */
function setSTstate() {
  let makeClass = teacher ? "t_state" : "s_state";
  let tg = $(".st-state");
  teacher ? tg.addClass(makeClass) : tg.addClass(makeClass);
}

/**
 * 히든 버튼 클릭 이벤트
 */
function hiddenButtonEvnet() {
  let scriptHiddenWrpa = `
    <div id='scriptWin'>
      <div class='scriptGroup'>
        <div class='scriptBtnX' alt='닫기'></div>
        <div class='scriptBoard' id='scBoard'></div>
      </div>
    </div>
  `;
  $("#wrapper").append(scriptHiddenWrpa);

  $(this).css("display", "none");
  $("#scriptWin").css("visibility", "visible");
  let str = scriptArray[cidx];
  $("#scBoard").html(str.split("^").join("<br>"));

  $(".scriptBtnX").click(function () {
    scriptClick = 0;
    $("#scriptWin").css("visibility", "hidden");
    $("#scriptWin").remove();
    $(".contentsBottomHidden").css("display", "block");
  });
}

/**
 * 드래그 & 드랍
 */
// function fnDnd() {
//   const initialPositions = {};

//   $(".dnd-item").each(function () {
//     const id = $(this).attr("id");
//     initialPositions[id] = {
//       top: parseInt($(this).css("top")),
//       left: parseInt($(this).css("left")),
//     };
//   });

//   let offsetX = 0,
//     offsetY = 0;

//   $(".dnd-item").draggable({
//     revert: false,
//     zIndex: 10,
//     helper: "original",
//     start: function (event, ui) {
//       const e = event.originalEvent.touches?.[0] || event.originalEvent;
//       const containerOffset = $("#contents").offset();
//       const left = parseFloat($(this).css("left"));
//       const top = parseFloat($(this).css("top"));

//       offsetX = ((e.pageX - containerOffset.left) / scaleRatio) - left;
//       offsetY = ((e.pageY - containerOffset.top) / scaleRatio) - top;

//       $(this).data("dropped", null); // 드래그 시작할 때 초기화
//     },
//     drag: function (event, ui) {
//       const e = event.originalEvent.touches?.[0] || event.originalEvent;
//       const containerOffset = $("#contents").offset();

//       ui.position.left =
//         (e.pageX - containerOffset.left) / scaleRatio - offsetX;
//       ui.position.top =
//         (e.pageY - containerOffset.top) / scaleRatio - offsetY;
//     },
//     stop: function (event, ui) {
//       const item = $(this);
//       const droppedId = item.data("dropped");

//       if (!droppedId) {
//         // 드롭되지 않았으면 원래 위치로 이동
//         const id = item.attr("id");
//         const pos = initialPositions[id];
//         item.animate(
//           {
//             top: pos.top,
//             left: pos.left,
//           },
//           200
//         );
//       }
//     },
//   });

//   $(".dnd-drop").droppable({
//     accept: ".dnd-item",
//     drop: function (event, ui) {
//       const dropZone = $(this);
//       const dropId = dropZone.attr("id");
//       const item = ui.draggable;
//       const itemId = item.attr("id");

//       let isOccupied = false;
//       $(".dnd-item").each(function () {
//         if (
//           $(this).attr("id") !== itemId &&
//           $(this).data("dropped") === dropId
//         ) {
//           isOccupied = true;
//         }
//       });

//       if (isOccupied) {
//         const pos = initialPositions[itemId];
//         item.animate(
//           {
//             top: pos.top,
//             left: pos.left,
//           },
//           200
//         );
//         item.data("dropped", null);
//       } else {
//         item.css({
//           zIndex: 10,
//         });
//         item.data("dropped", dropId); // 드롭 성공 시만 기록
//         $(".btn_return, .btn_answer").addClass("active");
//       }
//     },
//   });

//   $(".btn_answer").click(function () {
//     let correct = 0;
//     let incorrect = 0;
//     let totalCount = 0;
//     let dndItemLen = $(".dnd-item").length;

//     $(".dnd-item").each(function () {
//       const id = $(this).attr("id");
//       const droppedId = $(this).data("dropped");

//       if (droppedId) {
//         totalCount++;
//         if (correctMap[id] === droppedId) {
//           correct++;
//         } else {
//           incorrect++;
//         }
//       }
//     });

//     let answerBtn = $(".btn_answer");
//     let isBtnClass = answerBtn.hasClass("btn_answer_x");

//     $(".dnd-item").draggable("disable");

//     if (totalCount < dndItemLen) {
//       // 문제를 풀어 보세요.
//       $(".dnd-item").draggable("enable");
//       setAnswerPopupContent(3);
//     } else {
//       if (correct !== dndItemLen) {
//         wrongCount++;

//         if (isBtnClass) {
//           wrongCount = 0;
//           answerBtn.removeClass("btn_answer_x");
//           $(".dnd-item").draggable("enable");
//         } else {
//           setAnswerPopupContent(wrongCount);
//         }

//         if (wrongCount !== 2) {
//           answerBtn.removeClass("btn_answer_x");
//           $(".dnd-item").draggable("enable");
//           return true;
//         } else {
//           // answerBtn.addClass("btn_answer_x");
//           answerBtn.removeClass("active");
//           playAudio(adoFail);
//         }
//       } else {
//         // 정답이에요!
//         if (isBtnClass) {
//           answerBtn.removeClass("btn_answer_x");
//           $(".dnd-item").draggable("enable");
//         } else {
//           setAnswerPopupContent(0);
//           // answerBtn.addClass("btn_answer_x");
//           answerBtn.removeClass("active");
//           playAudio(adoCorrect);
//         }
//       }
//     }
//   });

//   $(".btn_return").click(function () {
//     $(".dnd-item").each(function () {
//       const id = $(this).attr("id");
//       const pos = initialPositions[id];
//       $(this).css({
//         top: pos.top,
//         left: pos.left,
//       });
//       $(this).data("dropped", null);
//     });

//     $(".dnd-item").draggable("enable");
//     $(".btn_return, .btn_answer").removeClass("active, btn_answer_x");
//   });
// }

/**
 * EEN53_01_SU_0016_s 드래그 게임
 */
function fnDndGame() {
  const initialPositionss = {};

  $(".dnd-item").each(function () {
    const id = $(this).attr("id");
    initialPositionss[id] = {
      top: parseInt($(this).css("top")),
      left: parseInt($(this).css("left")),
    };
  });

  let offsetX = 0,
    offsetY = 0;

  $(".dnd-item").draggable({
    revert: false,
    zIndex: 10,
    helper: "original",
    start: function (event, ui) {
      const e = event.originalEvent.touches?.[0] || event.originalEvent;
      const containerOffset = $("#contents").offset();
      const left = parseFloat($(this).css("left"));
      const top = parseFloat($(this).css("top"));

      offsetX = (e.pageX - containerOffset.left) / scaleRatio - left;
      offsetY = (e.pageY - containerOffset.top) / scaleRatio - top;

      $(this).data("dropped", null); // 드래그 시작할 때 초기화
    },
    drag: function (event, ui) {
      const e = event.originalEvent.touches?.[0] || event.originalEvent;
      const containerOffset = $("#contents").offset();

      ui.position.left =
        (e.pageX - containerOffset.left) / scaleRatio - offsetX;
      ui.position.top = (e.pageY - containerOffset.top) / scaleRatio - offsetY;
    },
    stop: function (event, ui) {
      const item = $(this);
      const droppedId = item.data("dropped");

      if (!droppedId) {
        // 드롭되지 않았으면 원래 위치로 이동
        const id = item.attr("id");
        const pos = initialPositionss[id];
        item.animate(
          {
            top: pos.top,
            left: pos.left,
          },
          200
        );
      }
    },
  });

  $(".dnd-drop").droppable({
    accept: ".dnd-item",
    drop: function (event, ui) {
      const dropZone = $(this);
      const dropId = dropZone.attr("id");
      const item = ui.draggable;
      const itemId = item.attr("id");

      item.addClass("drops");

      let isOccupied = false;
      $(".dnd-item").each(function () {
        if (
          $(this).attr("id") !== itemId &&
          $(this).data("dropped") === dropId
        ) {
          isOccupied = true;
        }
      });

      if (isOccupied) {
        const pos = initialPositionss[itemId];
        item.animate(
          {
            top: pos.top,
            left: pos.left,
          },
          200
        );
        item.data("dropped", null);
      } else {
        item.css({
          zIndex: 10,
        });
        item.data("dropped", dropId); // 드롭 성공 시만 기록
        item.draggable("disable");

        if ($(".drops").length === 5) {
          let visible = true;

          const intervalId = setInterval(function () {
            $(".game-bg").css("opacity", visible ? 0.2 : 1);
            visible = !visible;
          }, 500);

          setTimeout(function () {
            clearInterval(intervalId);
            $(".game-bg").css("opacity", 1);
            $(".game-prompt").css("display", "flex");
          }, 3000);
        }
      }
    },
  });

  $(".gameReset").click(function () {
    $(".dnd-drop").show();
    $(".dnd-item").draggable("enable");
    $(".game-item-wrap").html(defaultItem).css("overflow-y", "auto");
    $(".game-item-wrap > div").removeClass("dnd-item").removeAttr("id");
    $(".game_item, .gbw_return, .gbw_complete").removeClass("active");
    $(".cover").remove();
    $(".game-prompt").css("display", "none");
    $(".game-bg > img").attr(
      "src",
      "../../common_contents/images/EEN53_01/53_01_0016_img_off.png"
    );

    selectLens = 0;
    selectList = [];
    correctMaps = {};

    const coverEls = `<div class="cover"></div>`;

    $(".game-item-wrap > div").on("click", function () {
      playAudio(adoClick);

      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).find(".cover").remove();
        selectLens--;
      } else {
        $(this).addClass("active");
        $(this).prepend(coverEls);
        selectLens++;
      }

      if (selectLens > 0) {
        $(".gbw_return").addClass("active");
      } else {
        $(".gbw_return").removeClass("active");
      }

      let isSelectedAll = selectLens === 5 ? true : false;

      if (isSelectedAll) {
        $(".gbw_complete").addClass("active");
      } else {
        $(".gbw_complete").removeClass("active");
      }
    });
  });
}

$(document).ready(function () {
  $(".q_tit p.qt_label_A").prepend('<span class="alph">A</span>');
  $(".q_tit p.qt_label_B").prepend('<span class="alph">B</span>');
  $(".q_tit p.qt_label_C").prepend('<span class="alph">C</span>');
  $(".q_tit p.qt_label_D").prepend('<span class="alph">D</span>');
});

/**
 * 드래그 & 드랍 / 클릭 to 클릭
 */
function fnDnd() {
  const initialPositions = {};
  let dragging = null;
  let mode = null;
  let offsetX = 0;
  let offsetY = 0;
  let clickTimer = null;

  const $items = $(".dnd-item");
  const $container = $("#contents");

  $items.each(function () {
    const id = this.id;
    initialPositions[id] = {
      top: parseFloat($(this).css("top")),
      left: parseFloat($(this).css("left")),
    };
  });

  function moveItem(pageX, pageY) {
    if (!dragging) return;
    const containerOffset = $container.offset();
    const left = (pageX - containerOffset.left) / scaleRatio - offsetX;
    const top = (pageY - containerOffset.top) / scaleRatio - offsetY;
    dragging.css({ left, top });
    dragZoneOn(dragging);
  }

  function dragZoneOn(dragging) {
    const itemOffset = dragging.offset();
    const itemWidth = dragging.outerWidth();
    const itemHeight = dragging.outerHeight();

    const itemLeft = itemOffset.left;
    const itemTop = itemOffset.top;
    const itemRight = itemLeft + itemWidth;
    const itemBottom = itemTop + itemHeight;

    $(".dnd-drop").each(function () {
      const $zone = $(this);
      const zoneOffset = $zone.offset();
      const zoneLeft = zoneOffset.left;
      const zoneTop = zoneOffset.top;
      const zoneRight = zoneLeft + $zone.outerWidth();
      const zoneBottom = zoneTop + $zone.outerHeight();

      const overlapLeft = Math.max(itemLeft, zoneLeft);
      const overlapTop = Math.max(itemTop, zoneTop);
      const overlapRight = Math.min(itemRight, zoneRight);
      const overlapBottom = Math.min(itemBottom, zoneBottom);

      const overlapWidth = overlapRight - overlapLeft;
      const overlapHeight = overlapBottom - overlapTop;

      const overlapArea =
        Math.max(0, overlapWidth) * Math.max(0, overlapHeight);
      const itemArea = itemWidth * itemHeight;

      const overlapRatio = overlapArea / itemArea;

      if (overlapRatio >= 0.3) {
        $(".dnd-drop").removeClass("on");
        $zone.addClass("on");
      } else {
        $zone.removeClass("on");
      }
    });
  }

  function snapOrReset($el, top, left) {
    let dropped = false;
    const itemOffset = $el.offset();
    const itemWidth = $el.outerWidth();
    const itemHeight = $el.outerHeight();

    const itemLeft = itemOffset.left;
    const itemTop = itemOffset.top;
    const itemRight = itemLeft + itemWidth;
    const itemBottom = itemTop + itemHeight;

    $(".dnd-drop").each(function () {
      const $zone = $(this);
      const zoneOffset = $zone.offset();
      const zoneLeft = zoneOffset.left;
      const zoneTop = zoneOffset.top;
      const zoneRight = zoneLeft + $zone.outerWidth();
      const zoneBottom = zoneTop + $zone.outerHeight();

      const overlapLeft = Math.max(itemLeft, zoneLeft);
      const overlapTop = Math.max(itemTop, zoneTop);
      const overlapRight = Math.min(itemRight, zoneRight);
      const overlapBottom = Math.min(itemBottom, zoneBottom);

      const overlapWidth = overlapRight - overlapLeft;
      const overlapHeight = overlapBottom - overlapTop;

      const overlapArea =
        Math.max(0, overlapWidth) * Math.max(0, overlapHeight);
      const itemArea = itemWidth * itemHeight;

      const overlapRatio = overlapArea / itemArea;

      if (overlapRatio >= 0.3) {
        let isOccupied = false;

        // 250428: dnd-item에 swapSticky 클래스 있을 경우
        // drop했을때 영역에 아이템이 있을 경우, 기존 아이템 원래 위치로 복귀 시킴
        // 정답 없을 때 사용 - 참고:EEN69_01_SU_0016_s
        const existingItem = $(".dnd-item.swapSticky").filter(function () {
          return $(this).data("dropped") === $zone.attr("id");
        });
        if (existingItem.length > 0) {
          existingItem.each(function () {
            const pos = initialPositions[$(this).attr("id")];
            $(this).animate({ left: pos.left, top: pos.top }, 150);
            $(this).data("dropped", null);
            $(this).removeClass("item-dropped");
          });
        }

        $(".dnd-item").each(function () {
          if (
            $(this).attr("id") !== dragging.attr("id") &&
            $(this).data("dropped") === $zone.attr("id")
          ) {
            isOccupied = true;
          }
        });

        if (!isOccupied) {
          dragging.css({
            top: top,
            left: left,
          });
          dragging.data("dropped", $zone.attr("id"));
          dropped = true;
          playAudio(adoClick);

          // dnd-item에 sticky, swapSticky 클래스 있을 경우 드롭 영역으로 붙이기
          if (dragging.hasClass("sticky") || dragging.hasClass("swapSticky")) {
            dragging.css({
              top: $(this).context.offsetTop,
              left: $(this).context.offsetLeft
            });
            dragging.addClass("item-dropped")
          }
        } else {
          if ($(this).hasClass("dnd-drop-multi")) {
            dragging.css({
              top: top,
              left: left,
            });
            dragging.data("dropped", $zone.attr("id"));
            dropped = true;
          }
        }
      }
    });

    if (!dropped) {
      const id = $el.attr("id");
      const pos = initialPositions[id];
      $el.animate({ left: pos.left, top: pos.top }, 200);
      $el.data("dropped", null);

      // 250428 : 원래 위치로 돌아갈 경우 클래스 삭제
      if (dragging.hasClass("sticky") || dragging.hasClass("swapSticky")) {
        dragging.removeClass("item-dropped")
      }
    }

    $el.css("z-index", 10);
    $(".btn_return, .btn_answer").addClass("active");
  }

  $(".dnd-item")
    .on("mousedown touchstart", function (e) {
      const isTouch = e.type === "touchstart";
      const $el = $(this);

      if ($el.data("locked")) return;

      const touch = isTouch ? e.originalEvent.touches[0] : e;
      const pageX = touch.pageX;
      const pageY = touch.pageY;

      const containerOffset = $container.offset();
      const left = parseFloat($(this).css("left"));
      const top = parseFloat($(this).css("top"));

      offsetX = (pageX - containerOffset.left) / scaleRatio - left;
      offsetY = (pageY - containerOffset.top) / scaleRatio - top;

      clickTimer = setTimeout(() => {
        mode = "drag";
        dragging = $el;
        $el.css("z-index", 100);
      }, 150);

      if (isTouch) e.preventDefault();

      // 250418 dnd-item에 moveStyleReset 클래스 있을 경우
      // 다시 움직일때 정오답 스타일 리셋
      if ($el.hasClass("moveStyleReset")) {
        $el.removeClass("incorrect_item").removeClass("correct_item");
      }
    })
    .on("mouseup touchend", function (e) {
      clearTimeout(clickTimer);
      const $el = $(this);

      if ($el.data("locked")) return;

      const top = parseFloat($(this).css("top"));
      const left = parseFloat($(this).css("left"));

      if (mode === "click") {
        if (dragging && dragging[0] === $el[0]) {
          snapOrReset($el, top, left);
          dragging = null;
          mode = null;
        } else {
          dragging = $el;
          dragging.css("z-index", 100);
        }
      } else if (mode === "drag") {
        snapOrReset(dragging, top, left);
        dragging = null;
        mode = null;
      } else {
        mode = "click";
        dragging = $el;
        dragging.css("z-index", 100);
      }
      $(".dnd-drop").removeClass("on");

      if ($("#content").attr("data-dqt") === "dndgame") {
        $el.addClass("drops");

        if ($(".drops").length === 5 && $el.data().dropped) {
          let visible = true;

          const intervalId = setInterval(function () {
            $(".game-bg").css("opacity", visible ? 0.2 : 1);
            visible = !visible;
          }, 500);

          setTimeout(function () {
            clearInterval(intervalId);
            $(".game-bg").css("opacity", 1);
            $(".game-prompt").css({
              display: "flex",
              "z-index": 10,
            });
          }, 3000);

          $(".dnd-item").css("pointer-events", "none");
        }
      }
    });

  $(document).on("mousemove touchmove", function (e) {
    if (!dragging) return;

    const isTouch = e.type === "touchmove";
    const moveEvent = isTouch ? e.originalEvent.touches[0] : e;
    const pageX = moveEvent.pageX;
    const pageY = moveEvent.pageY;

    if (pageX && pageY) {
      moveItem(pageX, pageY);
      if (isTouch) e.preventDefault();
    }
  });

  $(".btn_answer").click(function () {
    let correct = 0;
    let incorrect = 0;
    let totalCount = 0;
    let dndItemLen = $(".dnd-item").length;

    $(".dnd-item").each(function () {
      const id = $(this).attr("id");
      const droppedId = $(this).data("dropped");

      if (droppedId) {
        totalCount++;
        if (correctMap[id] === droppedId) {
          correct++;
          $(this).removeClass("correct_item, incorrect_item");
          $(this).addClass("correct_item");
        } else {
          incorrect++;
          $(this).removeClass("correct_item, incorrect_item");
          $(this).addClass("incorrect_item");
        }
      }
    });

    let answerBtn = $(".btn_answer");
    let isBtnClass = answerBtn.hasClass("btn_answer_x");

    $(".dnd-item").data("locked", true);

    let correctLen = Object.keys(correctMap).length;

    if (totalCount < correctLen) {
      // 문제를 풀어 보세요.
      $(".dnd-item").data("locked", false);
      setAnswerPopupContent(3);
    } else {
      if (correct !== correctLen) {
        wrongCount++;

        if (isBtnClass) {
          wrongCount = 0;
          answerBtn.removeClass("btn_answer_x");
          $(".dnd-item").data("locked", false);
        } else {
          setAnswerPopupContent(wrongCount);
        }

        if (wrongCount !== 2) {
          answerBtn.removeClass("btn_answer_x");
          $(".dnd-item").data("locked", false);
          return true;
        } else {
          wrongCount = 0;
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
          $(".text_container").addClass("incorrect_mode");
          playAudio(adoFail);
          // 250422 답 확인용 클래스 추가
          $("#contents").addClass("answer_mode");
        }
      } else {
        // 정답이에요!
        if (isBtnClass) {
          answerBtn.removeClass("btn_answer_x");
          $(".text_container").removeClass("correct_mode");
          $(".dnd-item").data("locked", false);
        } else {
          setAnswerPopupContent(0);
          // answerBtn.addClass("btn_answer_x");
          answerBtn.removeClass("active");
          $(".text_container").addClass("correct_mode");
          // 250422 답 확인용 클래스 추가
          $("#contents").addClass("answer_mode");
          playAudio(adoCorrect);
        }
      }
    }
  });

  $(".btn_return").click(function () {
    $(".dnd-item").each(function () {
      const id = this.id;
      const pos = initialPositions[id];
      $(this).css({ left: pos.left, top: pos.top });
      $(this).data("dropped", null).css("z-index", 10);
      $(this).data("locked", false);
      $(".text_container").removeClass("correct_mode, incorrect_mode");
      $(this).removeClass("correct_item").removeClass("incorrect_item");
    });

    $(".btn_answer, .btn_return").removeClass("active");
  });
}

// 정오답 체크 없는 드래그앤드랍 (드랍할 때 튕기거나/달라붙거나 - 바로 정오답 적용)
function fnDndSticky() {
  const initialPositions = {};
  let dragging = null;
  let mode = null;
  let offsetX = 0;
  let offsetY = 0;
  let clickTimer = null;

  const $items = $(".dnd-item");
  const $container = $("#contents");

  $items.each(function () {
    const id = this.id;
    initialPositions[id] = {
      top: parseFloat($(this).css("top")),
      left: parseFloat($(this).css("left")),
    };
  });

  function moveItem(pageX, pageY) {
    if (!dragging) return;
    const containerOffset = $container.offset();
    const left = (pageX - containerOffset.left) / scaleRatio - offsetX;
    const top = (pageY - containerOffset.top) / scaleRatio - offsetY;
    dragging.css({ left, top });
    dragZoneOn(dragging);
  }

  function dragZoneOn(dragging) {
    const itemOffset = dragging.offset();
    const itemWidth = dragging.outerWidth();
    const itemHeight = dragging.outerHeight();

    const itemLeft = itemOffset.left;
    const itemTop = itemOffset.top;
    const itemRight = itemLeft + itemWidth;
    const itemBottom = itemTop + itemHeight;

    $(".dnd-drop").each(function () {
      const $zone = $(this);
      const zoneOffset = $zone.offset();
      const zoneLeft = zoneOffset.left;
      const zoneTop = zoneOffset.top;
      const zoneRight = zoneLeft + $zone.outerWidth();
      const zoneBottom = zoneTop + $zone.outerHeight();

      const overlapLeft = Math.max(itemLeft, zoneLeft);
      const overlapTop = Math.max(itemTop, zoneTop);
      const overlapRight = Math.min(itemRight, zoneRight);
      const overlapBottom = Math.min(itemBottom, zoneBottom);

      const overlapWidth = overlapRight - overlapLeft;
      const overlapHeight = overlapBottom - overlapTop;

      const overlapArea =
        Math.max(0, overlapWidth) * Math.max(0, overlapHeight);
      const itemArea = itemWidth * itemHeight;

      const overlapRatio = overlapArea / itemArea;

      if (overlapRatio >= 0.3) {
        $(".dnd-drop").removeClass("on");
        $zone.addClass("on");
      } else {
        $zone.removeClass("on");
      }
    });
  }

  function snapOrReset($el, top, left) {
    let dropped = false;
    const itemOffset = $el.offset();
    const itemWidth = $el.outerWidth();
    const itemHeight = $el.outerHeight();

    const itemLeft = itemOffset.left;
    const itemTop = itemOffset.top;
    const itemRight = itemLeft + itemWidth;
    const itemBottom = itemTop + itemHeight;

    $(".dnd-drop").each(function () {
      const $zone = $(this);
      const zoneOffset = $zone.offset();
      const zoneLeft = zoneOffset.left;
      const zoneTop = zoneOffset.top;
      const zoneRight = zoneLeft + $zone.outerWidth();
      const zoneBottom = zoneTop + $zone.outerHeight();

      const overlapLeft = Math.max(itemLeft, zoneLeft);
      const overlapTop = Math.max(itemTop, zoneTop);
      const overlapRight = Math.min(itemRight, zoneRight);
      const overlapBottom = Math.min(itemBottom, zoneBottom);

      const overlapWidth = overlapRight - overlapLeft;
      const overlapHeight = overlapBottom - overlapTop;

      const overlapArea =
        Math.max(0, overlapWidth) * Math.max(0, overlapHeight);
      const itemArea = itemWidth * itemHeight;

      const overlapRatio = overlapArea / itemArea;
      const nowDragging = dragging.attr("id");

      if (overlapRatio >= 0.3) {
        let isOccupied = false;
        $(".dnd-item").each(function () {
          if (correctMap[nowDragging] == $zone.attr("id")) {
            answerPosition.forEach((dragItem) => {
              if (dragItem.item == nowDragging) {
                dragging.css({
                  top: dragItem.top,
                  left: dragItem.left,
                  rotate: dragItem.rotate,
                });
              }
            });

            if ($("#content").attr("data-dqt") === "dndgame") {
              $el.css("pointer-events", "none");
              $el.css("position", "absolute");
              $el.addClass("drops");
              if ($zone.hasClass("on")) {
                $zone.hide();
              }
            } else {
              playAudio(adoCorrect);
              $el.addClass('_correct');
            }
            $(".btn_return").addClass("active");
          } else {
            if ($("#content").attr("data-dqt") === "dndgame") {
              $el.css("pointer-events", "all");
              $el.css("position", "relative");
              $el.removeClass("drops");
            } else {
              playAudio(adoFail);
            }

            const id = $el.attr("id");
            const pos = initialPositions[id];
            $el.animate({ left: pos.left, top: pos.top }, 200);
            $el.data("dropped", null);
          }

          if (
            $(this).attr("id") !== dragging.attr("id") &&
            $(this).data("dropped") === $zone.attr("id")
          ) {
            isOccupied = true;
          }
        });

        if (!isOccupied) {
          dragging.data("dropped", $zone.attr("id"));
          dropped = true;
        } else {
          if ($(this).hasClass("dnd-drop-multi")) {
            dragging.data("dropped", $zone.attr("id"));
          }
          dropped = true;
        }
      }
    });

    if (!dropped) {
      const id = $el.attr("id");
      const pos = initialPositions[id];
      $el.animate({ left: pos.left, top: pos.top }, 200);
      $el.data("dropped", null);
    }
    $el.css("z-index", 10);
  }

  $(".dnd-item")
    .on("mousedown touchstart", function (e) {
      const isTouch = e.type === "touchstart";
      const $el = $(this);

      if ($el.data("locked")) return;

      const touch = isTouch ? e.originalEvent.touches[0] : e;
      const pageX = touch.pageX;
      const pageY = touch.pageY;

      const containerOffset = $container.offset();
      const left = parseFloat($(this).css("left"));
      const top = parseFloat($(this).css("top"));

      offsetX = (pageX - containerOffset.left) / scaleRatio - left;
      offsetY = (pageY - containerOffset.top) / scaleRatio - top;

      clickTimer = setTimeout(() => {
        mode = "drag";
        dragging = $el;
        $el.css("z-index", 100);
      }, 150);

      if (isTouch) e.preventDefault();
    })
    .on("mouseup touchend", function (e) {
      clearTimeout(clickTimer);
      const $el = $(this);

      if ($el.data("locked")) return;

      const top = parseFloat($(this).css("top"));
      const left = parseFloat($(this).css("left"));

      if (mode === "click") {
        if (dragging && dragging[0] === $el[0]) {
          snapOrReset($el, top, left);
          dragging = null;
          mode = null;
        } else {
          dragging = $el;
          dragging.css("z-index", 100);
        }
      } else if (mode === "drag") {
        snapOrReset(dragging, top, left);
        dragging = null;
        mode = null;
      } else {
        mode = "click";
        dragging = $el;
        dragging.css("z-index", 100);
      }
      $(".dnd-drop").removeClass("on");

      if ($("#content").attr("data-dqt") === "dndgame") {
        console.log("aaa");
        $el.addClass("drops");

        if ($(".drops").length === 5 && $el.data().dropped) {
          let visible = true;

          const intervalId = setInterval(function () {
            $(".game-bg > img").attr(
              "src",
              visible
                ? "../../common_contents/images/EEN53_01/53_01_0016_img_on_hl.png"
                : "../../common_contents/images/EEN53_01/53_01_0016_img_on_a.png"
            );
            visible = !visible;
          }, 500);

          setTimeout(function () {
            clearInterval(intervalId);
            $(".game-bg > img").attr(
              "src",
              "../../common_contents/images/EEN53_01/53_01_0016_img_on_a.png"
            );
            $(".game-prompt").css({
              display: "flex",
              "z-index": 10,
            });
          }, 3000);

          $(".dnd-item").css("pointer-events", "none");
        }
      }
    });

  $(document).on("mousemove touchmove", function (e) {
    if (!dragging) return;

    const isTouch = e.type === "touchmove";
    const moveEvent = isTouch ? e.originalEvent.touches[0] : e;
    const pageX = moveEvent.pageX;
    const pageY = moveEvent.pageY;

    if (pageX && pageY) {
      moveItem(pageX, pageY);
      if (isTouch) e.preventDefault();
    }
  });

  $(".btn_return").click(function () {
    $(".dnd-item").each(function () {
      const id = this.id;
      const pos = initialPositions[id];
      $(this).css({ left: pos.left, top: pos.top, transform: "rotate(0)" });
      $(this).data("dropped", null).css("z-index", 10);
      $(this).data("locked", false);
    });
    $('.dnd-item').removeClass('_correct');
    $(".btn_return").removeClass("active");
  });
}

// 프린트
$(document).ready(function () {
  $("button.print").click(function () {
    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
    window.print();
  });
  function beforePrint() {
    const prtContent = $("#printArea").clone().addClass("copy");
    $("body").append(prtContent);
    $("body main").hide();
  }

  function afterPrint() {
    $("#printArea.copy").remove();
    $("body main").show();
  }
});

//저장버튼
$(document).ready(function () {
  $("button[type='save']").click(function () {
    msgAlert("저장되었습니다.");
  });
});

// input number 처리
$(document).ready(function () {
  $("input[type='number']").on("input", function (e) {
    $(this).val(
      $(this)
        .val()
        .replace(/[^0-9]/gi, "")
    );

    if (e.target.value.length > e.target.maxLength) {
      e.target.value = e.target.value.slice(0, e.target.maxLength);
    }
  });
});

/**
 * 플펀타임 초기화 팝업
 */
function allResetBtnEvent(resetFn) {
  playAudio(adoClick);
  $(".toast-msg-container").show();

  $(".toast-select .alert-y").click(function () {
    $(".toast-msg-container").hide();
    if (resetFn) {
      resetFn();
    }
  });

  $(".toast-select .alert-n").click(function () {
    $(".toast-msg-container").hide();
  });
}

// Node 단위 번역
async function translateText(textNode) {
  if (currentLang === "kr") {
    return;
  } else {
    if (typeof msg_change === "function") {
      msg_change("ENG", textNode, currentLang, false)
        .then((result) => (textNode.innerText = result))
        .catch((ex) => console.error(`번역 API: ${ex}`));
    } else {
      console.info("변역 라이브러리 로드 안됨");
    }
  }
}

function transTest() {
  const channel = new MessageChannel();
  const receiverWindow = window;

  receiverWindow.postMessage("init", "*", [channel.port2]);

  function sendMessage(message) {
    channel.port1.postMessage(message);
    console.log("Sent:", message);
  }

  channel.port1.onmessage = (event) => {
    console.log("Received from receiver:", event.data);
  };

  const data = {
    command: "init",
  };
  data.params = data.params || {};
  data.params.lang = currentLang;

  sendMessage(data);
}

/**
 * 선잇기 다중 처리 / 좌우 점 개수 다른 경우
 */
function fnDrawingLineMultiple() {
  const canvasDataMap = {};

  $(".drawingCanvas").each(function () {
    const canvas = this;
    const id = $(canvas).data("id");
    const ctx = canvas.getContext("2d");

    const data = {
      canvas,
      ctx,
      isDrawing: false,
      isClickMode: false,
      clickStartPoint: null,
      lines: [],
      storedLines: [],
      isAnswerChecked: false,
      leftPoints: structuredClone(canvasConfigs[id].leftPoints),
      rightPoints: structuredClone(canvasConfigs[id].rightPoints),
      answerConnections: structuredClone(canvasConfigs[id].answerConnections),
    };

    canvasDataMap[id] = data;

    function drawLines() {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      data.lines.forEach((line) => {
        if (line.color === "#3B71FE") {
          ctx.beginPath();
          ctx.moveTo(line.start.x, line.start.y);
          ctx.lineTo(line.end.x, line.end.y);
          ctx.strokeStyle = "rgba(59,113,254,0.5)";
          ctx.lineWidth = 12;
          ctx.stroke();
          line.color = "#222";
        } else if (line.color === "#FF0000") {
          ctx.beginPath();
          ctx.moveTo(line.start.x, line.start.y);
          ctx.lineTo(line.end.x, line.end.y);
          ctx.strokeStyle = "rgba(255,0,0,0.5)";
          ctx.lineWidth = 12;
          ctx.stroke();
          line.color = "rgba(255, 255, 255, 0)";
        }
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width || 3;
        ctx.stroke();
      });
    }

    function drawPoints() {
      ctx.fillStyle = "#6A6A6A";
      [...data.leftPoints, ...data.rightPoints].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function redrawCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLines();
      drawPoints();
    }

    function getAdjustedCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / scaleRatio,
        y: (e.clientY - rect.top) / scaleRatio,
      };
    }

    function removeLineByLeftPoint(point) {
      const index = data.lines.findIndex(
        (line) => line.start.x === point.x && line.start.y === point.y
      );
      if (index !== -1) {
        const removed = data.lines.splice(index, 1)[0];
        data.rightPoints.forEach((rp) => {
          if (rp.x === removed.end.x && rp.y === removed.end.y)
            rp.connected = false;
        });
        point.connected = false;
      }
    }

    let dragStart = null;

    function onDown(e) {
      if (data.isAnswerChecked) return;
      const pos = getAdjustedCoords(e);
      dragStart = pos;

      for (const point of data.leftPoints) {
        if (Math.abs(pos.x - point.x) < 20 && Math.abs(pos.y - point.y) < 20) {
          removeLineByLeftPoint(point);
          data.clickStartPoint = point;
          break;
        }
      }
    }

    function onMove(e) {
      const pos = getAdjustedCoords(e);

      let isHoveringPoint = false;
      [...data.leftPoints, ...data.rightPoints].forEach((point) => {
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 10) {
          isHoveringPoint = true;
        }
      });
      canvas.style.cursor = isHoveringPoint ? "pointer" : "default";

      if (!data.clickStartPoint || data.isAnswerChecked) return;

      const distance = Math.hypot(dragStart.x - pos.x, dragStart.y - pos.y);

      if (distance > 10) {
        data.isClickMode = false;
        redrawCanvas();
        ctx.beginPath();
        ctx.moveTo(data.clickStartPoint.x, data.clickStartPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        data.isClickMode = true;
      }
    }

    function onUp(e) {
      if (!data.clickStartPoint || data.isAnswerChecked) return;
      const pos = getAdjustedCoords(e);

      for (const point of data.rightPoints) {
        if (
          Math.abs(pos.x - point.x) < 20 &&
          Math.abs(pos.y - point.y) < 20 &&
          !point.connected
        ) {
          data.lines.push({
            start: {
              x: data.clickStartPoint.x,
              y: data.clickStartPoint.y,
            },
            end: { x: point.x, y: point.y },
            color: "#222",
            width: 3,
            leftValue: data.clickStartPoint.value,
            rightValue: point.value,
          });
          point.connected = true;
          data.clickStartPoint.connected = true;
          $(".btn_return, .btn_answer").addClass("active");
          break;
        }
      }

      data.clickStartPoint = null;
      redrawCanvas();
    }

    function onClickCanvas(e) {
      if (data.isAnswerChecked) return;
      const pos = getAdjustedCoords(e);

      if (!data.clickStartPoint) {
        for (const point of data.leftPoints) {
          if (
            Math.abs(pos.x - point.x) < 20 &&
            Math.abs(pos.y - point.y) < 20
          ) {
            removeLineByLeftPoint(point);
            data.clickStartPoint = point;
            data.isClickMode = true;
            return;
          }
        }
      } else {
        for (const point of data.rightPoints) {
          if (
            Math.abs(pos.x - point.x) < 20 &&
            Math.abs(pos.y - point.y) < 20 &&
            !point.connected
          ) {
            data.lines.push({
              start: {
                x: data.clickStartPoint.x,
                y: data.clickStartPoint.y,
              },
              end: { x: point.x, y: point.y },
              color: "#222",
              width: 3,
              leftValue: data.clickStartPoint.value,
              rightValue: point.value,
            });
            point.connected = true;
            data.clickStartPoint.connected = true;
            data.clickStartPoint = null;
            data.isClickMode = false;
            redrawCanvas();
            $(".btn_return, .btn_answer").addClass("active");
            return;
          }
        }

        data.clickStartPoint = null;
        data.isClickMode = false;
        redrawCanvas();
      }
    }

    function followPointer() {
      if (!data.isClickMode || !data.clickStartPoint) return;

      redrawCanvas();
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = (window.event.clientX - canvasRect.left) / scaleRatio;
      const mouseY = (window.event.clientY - canvasRect.top) / scaleRatio;

      ctx.beginPath();
      ctx.moveTo(data.clickStartPoint.x, data.clickStartPoint.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.stroke();

      requestAnimationFrame(followPointer);
    }

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("click", onClickCanvas);

    let lastTouch = null;

    canvas.addEventListener("touchstart", (e) => {
      // if (e.touches.length > 0) onDown(e.touches[0]);
      if (e.touches.length > 0) lastTouch = e.touches[0];
    });
    canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) onMove(e.touches[0]);
    });
    // let lastTouch = {};
    canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) lastTouch = e.touches[0];
    });
    canvas.addEventListener("touchend", () => {
      // onUp(lastTouch);
      if (lastTouch) {
        onClickCanvas(lastTouch);
        lastTouch = null;
      }
    });

    data.redrawCanvas = redrawCanvas;
    redrawCanvas();
  });

  let wrongCount = 0;
  $(".btn_answer").on("click touchend", function () {
    let allValid = true;

    Object.values(canvasDataMap).forEach((data) => {
      const isSecond = data.canvas.dataset.id == "2";
      const checkPoints = isSecond ? data.rightPoints : data.leftPoints;
      const allConnected = checkPoints.every((p) => p.connected);
      if (!allConnected) allValid = false;
    });

    if (!allValid) {
      setAnswerPopupContent(3);
      return;
    }

    let allCorrect = true;

    Object.values(canvasDataMap).forEach((data) => {
      data.answerConnections.forEach((answer) => {
        const matched = data.lines.find(
          (line) =>
            line.leftValue === answer.left && line.rightValue === answer.right
        );
        if (!matched) allCorrect = false;
      });
    });

    if (allCorrect) {
      Object.values(canvasDataMap).forEach((data) => {
        data.isAnswerChecked = true;
        data.storedLines = [...data.lines];
        const correctLines = data.answerConnections.map((answer) => {
          const l = data.leftPoints.find((p) => p.value === answer.left);
          const r = data.rightPoints.find((p) => p.value === answer.right);
          return {
            start: { x: l.x, y: l.y },
            end: { x: r.x, y: r.y },
            color: "#3B71FE",
          };
        });
        data.lines = correctLines;
        data.redrawCanvas();
      });

      setAnswerPopupContent(0);
      playAudio(adoCorrect);
      wrongCount = 0;
      $(".btn_answer").removeClass("active");
    } else {
      wrongCount++;
      setAnswerPopupContent(wrongCount);

      if (wrongCount === 1) {
      } else {
        Object.values(canvasDataMap).forEach((data) => {
          data.isAnswerChecked = true;
          data.storedLines = [...data.lines];

          const correctLines = [];
          const wrongLines = [];
          let studentLines;

          data.answerConnections.forEach((answer) => {
            const matched = data.lines.find(
              (line) =>
                line.leftValue === answer.left &&
                line.rightValue === answer.right
            );

            const l = data.leftPoints.find((p) => p.value === answer.left);
            const r = data.rightPoints.find((p) => p.value === answer.right);

            if (wrongCount > 0) {
              studentLines = data.storedLines.map((line) => ({
                start: { x: line.start.x, y: line.start.y },
                end: { x: line.end.x, y: line.end.y },
                color: "#222",
              }));
            }

            if (matched) {
              correctLines.push({
                start: { x: l.x, y: l.y },
                end: { x: r.x, y: r.y },
                color: "#3B71FE",
              });
            } else {
              wrongLines.push({
                start: { x: l.x, y: l.y },
                end: { x: r.x, y: r.y },
                color: "#FF0000",
              });
            }
          });

          data.lines = [...studentLines, ...correctLines, ...wrongLines];
          data.redrawCanvas();
        });

        playAudio(adoFail);
        wrongCount = 0;
        $(".btn_answer").removeClass("active");
      }
    }
  });

  $(".btn_return").on("click touchend", function () {
    Object.values(canvasDataMap).forEach((data) => {
      data.lines = [];
      data.storedLines = [];
      data.isAnswerChecked = false;
      data.leftPoints.forEach((p) => (p.connected = false));
      data.rightPoints.forEach((p) => (p.connected = false));
      data.redrawCanvas();
    });

    $(".btn_return, .btn_answer").removeClass("active");
  });
}

$(document).on('click','.text_container input[type="checkbox"]',function(){
  playAudio(adoClick);
});

