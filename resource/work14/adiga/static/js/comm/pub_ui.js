/*
    - 퍼블리싱 페이지에만 사용되는 임시 스크립트 입니다.
    - 개발에는 적용되지 않습니다.
*/

$(document).ready(function () {
    initLayoutInclude();
});

// 공통 레이아웃 include
function initLayoutInclude() {
    $("[data-include]").each(function () {
        const target = $(this);
        const includeInfo = target.data("include").split(" ");
        const filePath = includeInfo[0];
        const selector = includeInfo[1];

        target.load(filePath + " " + selector, function () {
            target.replaceWith(target.html());
        });
    });
}

function fnOnEventToggle(selector){
	if(!$(selector).children('.modPopup').hasClass("on")){
        $("html").addClass('scrollFix')
		$(selector).children('.modPopup').addClass("on");
	} else {
        $("html").removeClass('scrollFix')
		$(selector).children('.modPopup').removeClass("on");
	}
}

$(document).on("click", "#btn0201", function() {
    $("#popup02 .state").addClass("hide");
    $("#popup02 .state._ing").removeClass("hide");
    $("#btn0201").addClass("hide")
    $("#btn0202").removeClass("hide")

    setTimeout(function () {
        $("#popup02 .state").addClass("hide");
        $("#popup02 .state._done").removeClass("hide");
        $("#btn0202").addClass("hide")
        $("#btn0203").removeClass("hide")
    }, 1000)
})

$(document).on("click", ".btn0301", function () {
    if ($(this).prev('input').val() === '1234') {
        const list = $(this).closest("li");
        list.find(".examNumArea").removeClass("on");
        list.find(".depTmt").addClass("on");
        list.find(".univAdm.null").addClass("hide");
        list.find(".univAdm.value").removeClass("hide");
        list.find(".tooltipCont").removeClass("hide");
    } else {
        alert("수험 번호가 일치하지 않습니다.\n수험번호는 '1234' 입니다.")
    }
})

function printPopup() {
    document.body.classList.add('printOnlyPopup')
    window.print();
}

window.addEventListener("afterprint", () =>
    document.body.classList.remove('printOnlyPopup')
);