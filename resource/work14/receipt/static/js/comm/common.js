$(function () {
	initMenuActions();
	initBtnToggle();
	initformText();
	initSelectBox();
	initResetClick();
	initPopupClose();
});

// 공통 lnb 메뉴 동작
function initMenuActions() {
    // 1depth 메뉴 클릭 시
    $(document).on("click", ".menuListWrap .title a", function () {
        const $thisGroup = $(this).closest(".menuList");

        $(".menuListWrap .subList a").removeClass("active");
        $(".menuListWrap .menuList").removeClass("active");

        if (!$thisGroup.hasClass("active")) {
            $thisGroup.addClass("active")
            $thisGroup.find(".subList li:first a").addClass("active");

            if (!$(this).next(".btnToggle").hasClass("open")) {
                $(this).next(".btnToggle").click();
            }
        }
    })

    // 2depth 메뉴 클릭 시
    $(document).on("click", ".menuListWrap .subList a", function () {
        const $thisGroup = $(this).closest(".menuList");

        $(".menuListWrap .subList a").removeClass("active");
        $(this).addClass("active");

        if (!$thisGroup.hasClass("active")) {
            $(".menuListWrap .menuList").removeClass("active")
            $thisGroup.addClass("active")
        }
    })
}

function initBtnToggle() {
	if ($(".btnToggle").length > 0) {
		$(".btnToggle").each(function () {
			const $toggleTarget = $("#" + $(this).attr("aria-controls"));
			if ($(this).hasClass("open")) {
				$(this).attr("aria-expanded", true);
				$(this).append('<span class="srOnly">닫기</span>')
				$toggleTarget.show();
			} else {
				$(this).attr("aria-expanded", false);
				$(this).append('<span class="srOnly">열기</span>')
				$toggleTarget.hide();
			}
		})
	}

	$(document)
		.off("click.initBtnToggle", ".btnToggle")
		.on("click.initBtnToggle", ".btnToggle", function () {
			const $toggleTarget = $("#" + $(this).attr("aria-controls"));

			if ($(this).hasClass("open")) {
				$toggleTarget.slideUp(150);
				$(this).removeClass("open").attr("aria-expanded", false);
				$(this).find(".srOnly").text("열기")
			} else {
				$toggleTarget.slideDown(150);
				$(this).addClass("open").attr("aria-expanded", true);
				$(this).find(".srOnly").text("닫기")
			}
		})
}

function initformText() {
	$(document)
		.off("focusin.initformText", ".formText input, .formText textarea")
		.on("focusin.initformText", ".formText input, .formText textarea", function () {
			const $formText = $(this).closest(".formText");
			if (!$formText.hasClass("readonly") && !$formText.hasClass("disabled")) {
				$formText.addClass("focus");
			}
		});

	$(document)
		.off("focusout.initformText", ".formText input, .formText textarea")
		.on("focusout.initformText", ".formText input, .formText textarea", function () {
			$(this).closest(".formText").removeClass("focus");
		});

	// 숫자만 입력 가능
	$(document)
		.off("input.initformText", ".formText.onlyNum input")
		.on("input.initformText", ".formText.onlyNum input", function () {

			let onlyNumberVal = $(this).val().replace(/[^0-9]/g, "");
			$(this).val(onlyNumberVal);
		});

	// datepicker 기본 설정
	$.datepicker.setDefaults({
		dateFormat: "yy-mm-dd",
		showMonthAfterYear: true,
		showOtherMonths: true,
		changeYear: true,
		changeMonth: true,
		monthNamesShort: [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ],
		dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
	});

	$(".datepicker input").datepicker();

	$(document)
		.off("input.initformText", ".datepicker input")
		.on("input.initformText", ".datepicker input", function () {
			let dateVal = $(this).val().replace(/[^0-9]/g, "");

			// YYYY-MM-DD 포맷 적용
			if (dateVal.length > 4 && dateVal.length <= 6) {
				dateVal = dateVal.slice(0, 4) + "-" + dateVal.slice(4);
			} else if (dateVal.length > 6) {
				dateVal = dateVal.slice(0, 4) + "-" + dateVal.slice(4, 6) + "-" + dateVal.slice(6, 8);
			}

			$(this).val(dateVal);
		});
}

function initSelectBox() {
	$(document)
		.off("click.initSelectBox", ".btnSelect")
		.on("click.initSelectBox", ".btnSelect", function () {
			const $selectBox = $(this).closest(".selectBox");
			const $optionList = $selectBox.find(".optionList");

			if ($selectBox.is(".readonly, .disabled")) return;

			const isOpen = $selectBox.hasClass("focus");
			$(".selectBox").removeClass("focus").find(".optionList").hide();

			if (!isOpen) {
				$selectBox.addClass("focus");
				$optionList.slideDown(150);
			}
		});

	$(document)
		.off("click.initSelectBox", ".optionList button")
		.on("click.initSelectBox", ".optionList button", function () {
			const $selectBox = $(this).closest(".selectBox");

			$selectBox.find(".optionList button").removeClass("active");
			$(this).addClass("active");
			$selectBox.find(".btnSelect").text($(this).text());
		});


	if ($(".selectBox").length > 0) {
		$(".selectBox").each(function () {
			if ($(this).find(".optionList button").hasClass("active")) {
				const selectValText = $(this).find(".optionList button.active").text();
				$(this).find(".btnSelect").text(selectValText);
			}
		})
	}
}

function initResetClick() {
	$(document)
		.off("click.initResetClick")
		.on("click.initResetClick", function (e) {

			// 셀렉트 박스 외부 클릭 시 닫기
			if (!$(e.target).closest(".btnSelect").length) {
				$(".selectBox").removeClass("focus").find(".optionList").hide();
			}

			// 외부 클릭 시 텍스트 말줄임으로 리셋
			// if (!$(e.target).closest(".ellipsisToggle.active").length) {
			// 	$(".ellipsisToggle.active").removeClass("show");
			// }
		});
}

function initPopupClose() {
	$(document)
		.off("click.initPopupClose", ".closeBtn")
		.on("click.initPopupClose", ".closeBtn", function () {
			const popupName = $(this).closest(".popupWrap").attr("id");

			$(this).closest(".popupWrap").removeClass("show");
			$("button[data-popupTarget='#" + popupName + "']").focus();

			if ($(document).find(".popupWrap.show").length < 1) {
				$("body").removeClass("scrollFix");
			}
		})
}

/*
	!! 해당 기능이 필요한 페이지에만 불러서 사용 !!
	- initGuideMenu()
	- fnEllipsisToggle()
	- fnPopupOpen()
	- fnPopupClose()
	- fnTooltipToggle()
*/

// 서비스 가이드 탭
function initGuideMenu() {
    const tabTitle = $(".guideArea .listBox .title a");
    const subTitleList = $(".guideArea .guideSubList")
    const tabSubTitle = $(".guideArea .guideSubList li");
    const tabConBox = $("#contentsArea .guideConBox");

    // 초기화
    tabTitle.removeClass("active").first().addClass("active");
    subTitleList.hide().first().css('display', 'flex');
    tabSubTitle.removeClass("active");
    subTitleList.first().find("li").first().addClass("active");
    tabConBox.hide().removeClass("active").first().show().addClass("active");
    tabConBox.find(".stepArea").removeClass("active");
    tabConBox.first().find(".stepArea").first().addClass("active");

    // 1depth 메뉴 클릭 시
    tabTitle.click(function () {
        tabTitle.removeClass("active");
        $(this).addClass("active");

        tabSubTitle.removeClass("active");

        const index = tabTitle.index(this);
        const $listBox = $(this).closest(".listBox");
        const $currentSubList = $listBox.find(".guideSubList");
        const $firstSubItem = $currentSubList.find("li").first();
        $firstSubItem.addClass("active");

        subTitleList.hide().eq(index).css('display', 'flex');
        tabConBox.hide().removeClass("active").eq(index).show().addClass("active");

        const stepAreas = tabConBox.eq(index).find(".stepArea");
        stepAreas.removeClass("active").eq(0).addClass("active");
    });

    // 2depth 메뉴 클릭 시
    tabSubTitle.click(function () {
        $(this).siblings().removeClass("active");
        $(this).addClass("active");

        const subIndex = $(this).index();
        const $parentConBox = $(this).closest(".listBox").index();

        const $targetConBox = tabConBox.eq($parentConBox);
        const $targetSubBoxes = $targetConBox.find(".stepArea");

        $targetSubBoxes.removeClass("active").eq(subIndex).addClass("active");
    });
}

function fnEllipsisToggle() {
	// 텍스트 길이에 따라 토글 버튼 활성화 여부 결정
	function updateEllipsisState() {
		$(".ellipsisToggle").each(function () {
			const textWidth = $(this).width();
			const textWrapWidth = $(this).parent().width();

			$(this).removeClass("show");
			$(this).toggleClass("active", textWidth >= textWrapWidth);
		})
	}

	let resizeTimer;
	$(window).on("resize", function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(updateEllipsisState, 150);
	});

	// active 상태일 때만 show 토글
	$(document).on("click", ".ellipsisToggle.active", function () {
		$(this).toggleClass("show");
	})

	updateEllipsisState();
}

function fnPopupOpen(btnName, popupName) {
	const $focusEle = $(popupName).find('a, button, [tabindex="0"], input, textarea, select');

	const setPopupShow = function () {
		$(popupName).addClass("show");
		$("body").addClass("scrollFix");
		$focusEle.eq(0).focus();
	}

	if (btnName) {
		$(document).on("click", btnName, function () {
			setPopupShow();
		});
	} else {
		setPopupShow();
	}
}

function fnPopupClose(popupName, focusEle) {
	$(popupName).removeClass("show");

	if ($(document).find(".popupWrap.show").length < 1) {
		$("body").removeClass("scrollFix");
	}

	if (focusEle) {
		$(focusEle).focus();
	}
}

function fnTooltipToggle() {
	$(document).on("click", ".btnTooltip", function () {
		const $ttipWrap = $(this).closest(".tooltipWrap");

		if ($ttipWrap.hasClass("active")) {
			$ttipWrap.removeClass("active");
		} else {
			$ttipWrap.addClass("active");

			if (!$ttipWrap.is(".right, .left, .top, .bottom")) {
				$ttipWrap.addClass("right");
			}
		}
	});


	// 툴팁 말풍선 외부 클릭 시 닫힘
	$(document).click(function(e){
		if (!$(e.target).closest(".tooltipCont, .tooltipWrap").length) {
			$(".tooltipWrap").removeClass("active");
		}
	});
}