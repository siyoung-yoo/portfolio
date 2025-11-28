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

            /* include 이후 한번 더 동작해야하는 기능 */
            initBtnToggle(); // 메뉴 토글
        });
    });
}