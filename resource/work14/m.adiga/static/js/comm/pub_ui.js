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

            // include 완료 후 실행
            fnTitleChange();
        });
    });
}

//메뉴 팝업
function fnMenuPopup() {
    const $menu = $('#menuPopup');
    if($menu.hasClass('_on')) {
        $menu.removeClass('_on');
        $menu[0].scrollTo(0, 0);
        document.body.style.overflow = '';
    } else {
        $menu.addClass('_on');
        $('.btnMenuSpinner._on').removeClass('_on');
        $('.menuSpinner').removeClass('_on');
        $('.wrapper').removeClass('_hidden');
        $menu[0].scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
    }
}


/*
* devCommon.js 기능과 동일
* FullPopup 열고 닫는 이벤트 필요시 Toggle 함수
*/
function fnOnEventToggle(selector){
	if(!$(selector).children('._fullPopup').hasClass("_on")){
		$("html").css("overflow", "hidden");
		$(selector).children('._fullPopup').addClass("_on");
	} else {
		$("html").css("overflow", "");
		$(selector).children('._fullPopup').removeClass("_on");
	}
}

/*
* 2뎁스 페이지 타이틀 변경 (제출서류 확인 서비스 페이지)
*/
function fnTitleChange() {
    const path = location.pathname;
    const fileName = path.split('/').pop();
    const includeFiles = [
        'MOBSSDDCMNT1000.html', // 메인
        'MOBSSDDCMNT1100.html', 'MOBSSDDCMNT1101.html', 'MOBSSDDCMNT1102.html', // 제출서류보기
        'MOBSSDDCMNT8000.html', // 서류제출
        'MOBSSDDCMNT8100.html', // 만족도평가
        'MOBSSDALM1000.html', // 알림
        'MOBSSDBBS1000.html', // 공지사항
        'MOBSSDBBS4000.html','MOBSSDBBS2000.html', // 문의사항
    ];

    if (includeFiles.includes(fileName)) {
        $(".headerTitle h1 span").text("특별전형 지원 현황");
    }
}