// 정오답 체크 없는 드래그앤드랍 : 여러 드롭존 각각 1개만, 새로 드롭하면 교체
function fnDndSticyAllowMulti(dndItems) {
  const initialPositions = {};
  const originalParents = {};
  const originalIndexes = {};
  let dragging = null;
  let mode = null;
  let offsetX = 0;
  let offsetY = 0;
  let clickTimer = null;

  const $items = $(".dnd-item");
  const $container = $("#contents");

  $items.each(function () {
    const id = this.id;
    // 이미 저장된 값이 없을 때만 저장
    if (initialPositions[id] === undefined) {
      initialPositions[id] = {
        top: parseFloat($(this).css("top")),
        left: parseFloat($(this).css("left")),
      };
    }
    // 원래 부모와 index 저장
    if (originalParents[id] === undefined) {
      originalParents[id] = $(this).parent();
      originalIndexes[id] = $(this).index();
    }
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

  function returnToOriginalPlace($item) {
    const id = $item.attr("id");
    const $parent = originalParents[id];
    const idx = originalIndexes[id];
    if ($parent && idx !== undefined) {
      if ($parent.children().length > idx) {
        $item.insertBefore($parent.children().eq(idx));
      } else {
        $parent.append($item);
      }
    }
    $item.removeAttr("style");
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

    let targetZone = null;

    const itemType = $el.data("type");

    $(".dnd-drop").each(function () {
      const $zone = $(this);

      const acceptType = $zone.data("accept"); // 드롭존 허용 타입 읽기
      // 타입이 다르면 이 드롭존은 무시
      if (acceptType && itemType && acceptType !== itemType) {
        return;
      }

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
        targetZone = $zone;
      }
    });

    if (targetZone) {
      // 1. 이미 이 드롭존에 들어간 dnd-item이 있는지 확인
      $(".dnd-item").each(function () {
        if (
          $(this).data("dropped") === targetZone.attr("id") &&
          this !== $el[0]
        ) {
          // 기존 아이템 원래 자리로 복귀
          returnToOriginalPlace($(this));
          $(this).data("dropped", null);
        }
      });

      // 2. 현재 드롭한 아이템만 드롭존에 위치 (offset 기준으로 정확히 맞춤)
      const zoneOffset = targetZone.offset();
      const parentOffset = $el.offsetParent().offset();
      $el.data("dropped", targetZone.attr("id"));
      // dndItems에서 scale, top, left 값 적용 (top, left는 더하기)
      let scale = 1;
      let addTop = 0;
      let addLeft = 0;
      if (dndItems) {
        const found = dndItems.find((item) => item.id === $el.attr("id"));
        if (found) {
          if (found.scale) scale = found.scale;
          if (typeof found.top === "number") addTop = found.top;
          if (typeof found.left === "number") addLeft = found.left;
        }
      }
      // 마우스 위치 기준으로 드롭 위치 계산
      const event = window.lastDropEvent; // 전역에 저장된 마지막 드롭 이벤트
      let dropTop = (zoneOffset.top - parentOffset.top) / scaleRatio + addTop;
      let dropLeft =
        (zoneOffset.left - parentOffset.left) / scaleRatio + addLeft;
      if (event) {
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        dropTop = (mouseY - parentOffset.top) / scaleRatio + addTop;
        dropLeft = (mouseX - parentOffset.left) / scaleRatio + addLeft;
      }
      $el.css({
        top: dropTop,
        left: dropLeft,
        position: "absolute",
        transform: "scale(" + scale + ")",
        zIndex: 410,
      });
      dropped = true;

      // 드롭된 원 드래그 불가 처리 제거 (여러 개, 자유 이동 가능)
      // $el.data("locked", true);
      // $el.addClass("dropped_round_img");
      $(".btn-check").addClass("active");

      // 드롭 성공 시 다시하기 버튼 활성화
      $(".btn_return_custom").addClass("active").prop("disabled", false).show();
      // 드롭 성공 시 완료 버튼 활성화
      $(".btn_complete").addClass("active").prop("disabled", false).show();
    }

    if (!dropped) {
      // 원래 자리로 복귀
      returnToOriginalPlace($el);
      $el.data("dropped", null);
    }
    $el.css("z-index", 10);
  }

  $items
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

  // 1. 다시하기 버튼 클릭 시 팝업만 띄움
  $(".btn_return_custom").click(function () {
    $(".cardPopup").show();
  });

  // 2. 예 버튼 클릭 시에만 초기화 코드 실행
  $(".cardPopup .btn_yes").on("click", function () {
    $(".cardPopup").hide();

    $(".dnd-item").each(function () {
      returnToOriginalPlace($(this));
      $(this).data("dropped", null).css("z-index", 10);
      $(this).data("locked", false);
    });

    $(".btn_return_custom").removeClass("active");
    $(".btn_complete").removeClass("active").prop("disabled", true);
    $(".round_img").removeClass("active");
    $(".btn_draw").prop("disabled", false).removeClass("disabled");
    $(".btn-check").hide();
    $(".round_img").removeClass("dropped_round_img");
    $(".round_img").addClass("no-display");
    $(".round_img").data("locked", false);
    $(".round_img").data("dropped", null);
    $(".round_img").removeAttr("style");
    $("#circle_01").removeClass("no-display");

  });

  // 3. 아니오 버튼 클릭 시 팝업 닫기
  $(".cardPopup .btn_no").on("click", function () {
    $(".cardPopup").hide();
  });

  // 드래그 비활성화 함수
  fnDndSticyAllowMulti.disableDnd = function () {
    $(".dnd-item").each(function () {
      $(this).data("locked", true); // 드래그 완전 차단
      // 필요시 커서 스타일도 변경
      $(this).css("cursor", "not-allowed");
    });
    // 그리기 버튼도 비활성화
    // $(".btn_draw").prop("disabled", true).addClass("disabled");
  };

  // 완료 버튼 클릭 시 round_img 드래그 활성화
  $(".btn_complete")
    .off("click.roundimg")
    .on("click.roundimg", function () {
      $(".round_img").addClass("active");
      // $(".dnd-drop-circle-wrap").css("display", "block");

      if (typeof fnDndSticyAllowMulti.disableDnd === "function") {
        fnDndSticyAllowMulti.disableDnd();
      }

      // [추가] 완료 버튼 클릭 시 버튼 토글
      // $(".btn_return_custom").hide();
      // $(".btn-clear-circles").show();

      // 체크 버튼 활성화
      $(".btn-check").show();
      $(".btn-check").prop("disabled", false);

      // 완료버튼 숨김
      $(".btn_complete").removeClass('active');
      $(".btn_return_custom").addClass('active');

      fnDndcheckImage();
    });

  $(".btn-check").on("click", function () {
    $(".round_img").data("locked", true);
    $(".btn-check").hide();
    $(".btn_complete").show();
    $(".btn_complete").prop("disabled", true);
    $(".btn_complete").removeClass("active");
    $(".btn_return_custom").show();
    $(".btn_return_custom").prop("disabled", false);
    $(".btn-clear-circles").hide();
    $(".btn-clear-circles").prop("disabled", true);
    $(".btn-clear-circles").removeClass("active");
    $(".btn-clear-circles").addClass("disabled");
    $(".dnd-drop-circle-wrap").css("display", "none");
  });
}

function fnDndcheckImage() {
  const initialPositions = {};
  const originalParents = {};
  const originalIndexes = {};
  let dragging = null;
  let mode = null;
  let offsetX = 0;
  let offsetY = 0;
  let clickTimer = null;

  const $items = $(".round_img");
  const $container = $("#contents");

  $items.each(function () {
    const id = this.id;
    // 이미 저장된 값이 없을 때만 저장
    if (initialPositions[id] === undefined) {
      initialPositions[id] = {
        top: parseFloat($(this).css("top")),
        left: parseFloat($(this).css("left")),
      };
    }
    // 원래 부모와 index 저장
    if (originalParents[id] === undefined) {
      originalParents[id] = $(this).parent();
      originalIndexes[id] = $(this).index();
    }
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

    $(".dnd-drop-circle").each(function () {
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
        $(".dnd-drop-circle").removeClass("on");
        $zone.addClass("on");
      } else {
        $zone.removeClass("on");
      }
    });
  }

  function returnToOriginalPlace($item) {
    const id = $item.attr("id");
    const $parent = originalParents[id];
    const idx = originalIndexes[id];
    if ($parent && idx !== undefined) {
      if ($parent.children().length > idx) {
        $item.insertBefore($parent.children().eq(idx));
      } else {
        $parent.append($item);
      }
    }
    $item.removeAttr("style");
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

    let targetZone = null;

    $(".dnd-drop-circle").each(function () {
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

      if (overlapRatio >= 0.8) {
        targetZone = $zone;
      }
    });

    if (targetZone) {
      $(".round_img").each(function () {
        if (
          $(this).data("dropped") === targetZone.attr("id") &&
          this !== $el[0]
        ) {
          // 기존 아이템 원래 자리로 복귀
          returnToOriginalPlace($(this));
          $(this).data("dropped", null);
        }
      });

      // 2. 현재 드롭한 아이템만 드롭존에 위치 (offset 기준으로 정확히 맞춤)
      const zoneOffset = targetZone.offset();
      const parentOffset = $el.offsetParent().offset();
      $el.data("dropped", targetZone.attr("id"));
      // dndItems에서 scale, top, left 값 적용 (top, left는 더하기)
      let scale = 1;
      let addTop = -10;
      let addLeft = 0;
      if (dndItems) {
        const found = dndItems.find((item) => item.id === $el.attr("id"));
        if (found) {
          if (found.scale) scale = found.scale;
          if (typeof found.top === "number") addTop = found.top;
          if (typeof found.left === "number") addLeft = found.left;
        }
      }
      // 마우스 위치 기준으로 드롭 위치 계산
      const event = window.lastDropEvent; // 전역에 저장된 마지막 드롭 이벤트
      let dropTop = (zoneOffset.top - parentOffset.top) / scaleRatio + addTop;
      let dropLeft =
        (zoneOffset.left - parentOffset.left) / scaleRatio + addLeft;
      if (event) {
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        dropTop = (mouseY - parentOffset.top) / scaleRatio + addTop;
        dropLeft = (mouseX - parentOffset.left) / scaleRatio + addLeft;
      }
      $el.css({
        top: dropTop,
        left: dropLeft,
        position: "absolute",
        transform: "scale(" + scale + ")",
        zIndex: 410,
      });
      dropped = true;

      // 드롭된 원 드래그 불가 처리 제거 (여러 개, 자유 이동 가능)
      // $el.data("locked", true);
      $el.addClass("dropped_round_img");
      $(".btn-check").addClass("active");

      // [추가] 다음 round_img 보이게 하기
      var currentId = $el.attr("id");
      var match = currentId.match(/circle_(\d+)/);
      if (match) {
        var nextIdx = parseInt(match[1], 10) + 1;
        var $next = $("#circle_0" + nextIdx);
        if ($next.length) {
          $next.removeClass("no-display");
        }
      }
    }

    if (!dropped) {
      // 원래 자리로 복귀
      returnToOriginalPlace($el);
      $el.data("dropped", null);
    }
    $el.css("z-index", 400);
  }

  $items
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
        $el.css("z-index", 400);
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
          dragging.css("z-index", 400);
        }
      } else if (mode === "drag") {
        snapOrReset(dragging, top, left);
        dragging = null;
        mode = null;
      } else {
        mode = "click";
        dragging = $el;
        dragging.css("z-index", 400);
      }
      $(".dnd-drop-circle").removeClass("on");

      $(".btn-clear-circles").addClass("active");

      $(".btn-clear-circles").on("click", function () {
        // 모든 round_img의 스타일 제거 및 숨김 처리
        $(".round_img").each(function () {
          $(this).removeAttr("style");
          $(this).addClass("no-display");
          $(this).data("locked", false);
          $(this).data("dropped", null);
        });

        // 첫 번째 원만 보이게
        $("#circle_01").removeClass("no-display");
      });
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
}

// round_img 복제 및 드래그 기능 추가 (원본만 복제)
$(document).off("mousedown.roundimg touchstart.roundimg");
$(document).on(
  "mousedown.roundimg touchstart.roundimg",
  ".round_img.origin",
  function (e) {
    const isTouch = e.type === "touchstart";
    const $origin = $(this);
    const touch = isTouch ? e.originalEvent.touches[0] : e;
    // 복제본 생성
    const $clone = $origin.clone().removeClass("origin");
    $clone.attr("id", "circle_clone_" + Date.now());
    $clone.css({
      position: "absolute",
      left: $origin.css("left"),
      top: $origin.css("top"),
      zIndex: 400,
    });
    $origin.parent().append($clone);
    // 복제본에만 드래그/드롭 이벤트 부여
    fnDndcheckImageForClone($clone, touch);
    if (isTouch) e.preventDefault();
  }
);

// 복제본 round_img에만 드래그/드롭 기능 적용
function fnDndcheckImageForClone($item, startEvent) {
  let dragging = $item;
  let mode = "drag";
  let offsetX = 0;
  let offsetY = 0;
  const $container = $("#contents");
  const scaleRatio = window.scaleRatio || 1;

  // 드래그 시작 위치 계산
  const containerOffset = $container.offset();
  const left = parseFloat($item.css("left"));
  const top = parseFloat($item.css("top"));
  const pageX = startEvent.pageX;
  const pageY = startEvent.pageY;
  offsetX = (pageX - containerOffset.left) / scaleRatio - left;
  offsetY = (pageY - containerOffset.top) / scaleRatio - top;

  $item.css("z-index", 400);
  $item.on("click", function () {
    console.log("click");
  });

  function moveItem(pageX, pageY) {
    if (!dragging) return;
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
    $(".dnd-drop-circle").each(function () {
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
        $(".dnd-drop-circle").removeClass("on");
        $zone.addClass("on");
      } else {
        $zone.removeClass("on");
      }
    });
  }

  function snapOrReset($el) {
    let dropped = false;
    const itemOffset = $el.offset();
    const itemWidth = $el.outerWidth();
    const itemHeight = $el.outerHeight();
    const itemLeft = itemOffset.left;
    const itemTop = itemOffset.top;
    const itemRight = itemLeft + itemWidth;
    const itemBottom = itemTop + itemHeight;
    let targetZone = null;
    $(".dnd-drop-circle").each(function () {
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
        targetZone = $zone;
      }
    });
    if (targetZone) {
      // 이미 해당 드롭존에 round_img가 있으면 삭제
      targetZone.find(".round_img").remove();
      // 드롭존에 복제본 추가 및 위치 고정
      $el.appendTo(targetZone);
      $el.css({
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 410,
      });

      dropped = true;
    }
    if (!dropped) {
      // 드롭존 밖이면 복제본 삭제
      $el.remove();
    }

    $(".dnd-drop-circle").removeClass("on");
  }

  // 드래그 이동 이벤트
  $(document).on("mousemove.clone touchmove.clone", function (e) {
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

  // 드래그 종료 이벤트
  $(document).on("mouseup.clone touchend.clone", function (e) {
    if (!dragging) return;
    snapOrReset(dragging);
    dragging = null;

    // 이벤트 해제
    $(document).off(
      "mousemove.clone touchmove.clone mouseup.clone touchend.clone"
    );
  });
}
