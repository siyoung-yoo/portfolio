/*
 * 2023-07
 * 대학입학포털 어디가
 * UI 공통 사용자 함수
 * https://adiga.kr
 */
const adigaApps = {
    initial: function () { //퍼블 include html
        var allElements = document.getElementsByTagName("*");
        Array.prototype.forEach.call(allElements, function (el) {
            var includePath = el.dataset.includePath;
            if (includePath) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        el.outerHTML = this.responseText;
                        adigaApps.floatRightMenu();
                        adigaApps.chkBreadcrumb(); //서브 브래드스크럼과 화면 제목영역 : 퍼블 임시 코드 
                    }
                };
                xhttp.open("GET", includePath, true);
                xhttp.send();
            }
        });
    },
    floatRightMenu: function () { //오른쪽 플로팅 메뉴 Event Animation
        $("#fltMenu .qm1").on({
            mouseenter: function () { $(this).addClass("mEnt").delay(500).find("p").fadeIn(); },
            mouseleave: function () { $(this).removeClass("mEnt"); },
        });
        $("#fltMenu .qm2").on({
            click: function () { $("html, body").stop().clearQueue().animate({ scrollTop: "0" }, 400); },
        });
        
        //대학정보 메뉴아이디를 가져오기 위함(플로팅위치 분기처리 하기 위함)
        const urlParams = new URL(location.href).searchParams;
        const menuId = urlParams.get('menuId');

        let chkScrollTop = $(window).scrollTop(),
            chkBrowserTop = $(document).height() - $(window).height() - 220;
            
            //대학정보: 1100-985-220 = -84 초기진입 시 .addClass("flBottom") 추가되어 플로팅 위치 이상하여 추가
            if(menuId == 'PCUVTINF2000'){
            	chkBrowserTop = $(document).height() - $(window).height() - 140;
            }
            
        chkScrollTop > chkBrowserTop ? $("#fltMenu").addClass("flBottom") : $("#fltMenu").removeClass("flBottom");
        chkScrollTop > chkBrowserTop ? $("#aiFloating").addClass("aiFltBtn") : $("#aiFloating").removeClass("aiFltBtn"); //AI플로팅
        $(window).scroll(function () {
            let chkScrollTop = $(window).scrollTop(),
            chkBrowserTop = $(document).height() - $(window).height() - 220;
            
            //대학정보: 1100-985-220 = -84 초기진입 시 .addClass("flBottom") 추가되어 플로팅 위치 이상하여 추가
            if(menuId == 'PCUVTINF2000'){
            	chkBrowserTop = $(document).height() - $(window).height() - 140;
            }
            
            chkScrollTop > chkBrowserTop ? $("#fltMenu").addClass("flBottom") : $("#fltMenu").removeClass("flBottom");
            chkScrollTop > chkBrowserTop ? $("#aiFloating").addClass("aiFltBtn") : $("#aiFloating").removeClass("aiFltBtn"); //AI플로팅
        });
    },
    chkWinScroll: function(){
        $(window).scroll(function(){
            if($(window).scrollTop() > 250){
                $('#lytSubHead .pBreadCrumb').hide();
                $('#cptScrHead').fadeIn("fast");
            }else{
                $('#lytSubHead .pBreadCrumb').show();
                $('#cptScrHead').fadeOut("fast");
            }
        });
    },
    tabMenu: function(){
        $('.btnTab').on('click', function(){
            $(this).parent('li').addClass('on').siblings('li').removeClass('on');
            let _tabConIndex = $(this).parent().index(), 
            _tabConTarget = $(this).parents('.modTabWrap').find('.tabCon').eq(_tabConIndex);
            _tabConTarget.addClass('on').siblings().removeClass('on');
        });
    },
    chkBreadcrumb: function(){// 퍼블 임시 코드 
        let _getPath = document.location.pathname, 
        //메인
        _fn1 = ["mainPageView","headerView","quickMenuView","FooterView","quickMenuPopup","searchView","searchTabView"],
        _fn1pgtitle = ["","","","","","통합검색","통합검색"],
        //진로정보
        _fn2 = ["jobInfo","jobProspects","jobTestView","jobCareerView"],
        _fn2pgtitle = ["직업정보","직업정보","직업정보","직업심리검사"],
        //대학/학과/전형
        _fn3 = ["univListView","univDtlView","collListView","collDtlView","compareUnivPopup","searchSettingForm","classUnivList","classUnivDtl","classCollList","classCollDtl","compareUnivPopup","admssUnivListView","admssUnivDtlView","admssCollListView","admssCollDtlView","compareUnivPopup","searchSettingForm","mapSearchPopup"],
        _fn3pgtitle = ["대학정보","대학정보","대학정보","대학정보","대학정보","대학정보","학과정보","학과정보","학과정보","학과정보","학과정보","전형정보","전형정보","전형정보","전형정보","전형정보","전형정보","지도검색"],
        //성적분석
        _fn4 = ["schScoAnlsForm","satScoAnlsForm","univScoAnls","earlyScoAnls","regularScoAnls"],
        _fn4pgtitle = ["학생부성적분석","수능성적분석","대학별성적분석","대학별성적분석","대학별성적분석"],
        //대입상담
        _fn5 = ["onlineConse","untact","conseFaq","telConseGuideView"],
        _fn5pgtitle = ["온라인대입상담","비대면온라인상담","상담 FAQ","상담안내"],
        //대입정보센터 
        _fn6 = ["infoCenterMainView","uctSystem","uctGlossary","uctSchedule","uctArchive","characteristics","criteriaAndResult","univCast","disabledAdmss","admssExpo","univEvent","relatedSiteInfoView",],
        _fn6pgtitle = ["대입정보센터 서브메인","대입제도안내",,"대입제도안내","대입일정","대입정보자료실","대학별 입시정보","대입박람회/설명회","대학별 행사안내","관련사이트 안내"],
        //고객센터
        _fn7 = ["cctNotice","cctBeginnerGuideView","programDownView","remoteGuideView","faqView","qnaView","suggestionView","sitemapView"],
        _fn7pgtitle = ["공지사항","초보자가이드","프로그램다운로드","원격지원서비스","서비스이용문의","서비스이용문의","서비스이용문의","사이트 맵"],
        //회원서비스
        _fn8 = ["loginForm","memberJoinStep","mbsFindId","findPassword","privacyPolicyView","termsPolicyView","copyrightPolicyView","rejectEmailPolicyView","withdrawal"],
        _fn8pgtitle = ["로그인","회원가입","아이디 찾기","비밀번호 찾기","개인정보처리방침","이용약관","저작권정책","이메일주소 무단수집거부","회원탈퇴"],
        //마이페이지
        _fn9 = ["mypageMainView","myInterestView","alarmSetting","scheduleMnge","schoolScoreMngeForm","cSatScoreMngeForm","scoreAnlsHistForm","receptionHist","applyHist","memberConfirmForm","pwdChangeView","searchSettingForm","searchSettingForm","telConseHistView","admissAsst"],
        _fn9pgtitle = ["마이페이지 서브메인","관심대학/전형/진로","어디가 알림","일정관리","성적관리","성적관리","성적관리","신청/접수","대입원서 지원정보","회원정보","회원정보","회원정보","회원정보","회원정보","입학 도우미"],
        //공통 
        _fn10 = ["printPopup","mapPopup","comparePopup"],
        _fn10pgtitle = ["인쇄화면","검색영역 지도팝업","비교하기 팝업"];
        
        if (_getPath.includes('man')) {
            for (let i = 0; i < _fn1.length; i++) {
                let e = _fn1[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('메인');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn1pgtitle[i]);
                }
            }
        } else if (_getPath.includes('jbp')) {
            for (let i = 0; i < _fn2.length; i++) {
                let e = _fn2[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('진로정보');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn2pgtitle[i]);
                }
            }
        } else if (_getPath.includes('ucp')) {
            for (let i = 0; i < _fn3.length; i++) {
                let e = _fn3[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('대학/학과/전형');
                    $('.pageTitle').text(_fn3pgtitle[i]);
                }
            }
        } else if (_getPath.includes('sco')) {
            for (let i = 0; i < _fn4.length; i++) {
                let e = _fn4[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('성적분석');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn4pgtitle[i]);
                }
            }
        } else if (_getPath.includes('uve')) {
            for (let i = 0; i < _fn5.length; i++) {
                let e = _fn5[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('대입상담');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn5pgtitle[i]);
                }
            }
        } else if (_getPath.includes('uct')) {
            for (let i = 0; i < _fn6.length; i++) {
                let e = _fn6[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('대입정보센터');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn6pgtitle[i]);
                }
            }
        } else if (_getPath.includes('cct')) {
            for (let i = 0; i < _fn7.length; i++) {
                let e = _fn7[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('고객센터');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn7pgtitle[i]);
                }
            }
        } else if (_getPath.includes('mbs')) {
            for (let i = 0; i < _fn8.length; i++) {
                let e = _fn8[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('회원서비스');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn8pgtitle[i]);
                }
            }
        } else if (_getPath.includes('mpg')) {
            for (let i = 0; i < _fn9.length; i++) {
                let e = _fn9[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('마이페이지');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn9pgtitle[i]);
                }
            }
        } else if (_getPath.includes('pop')) {
            for (let i = 0; i < _fn10.length; i++) {
                let e = _fn10[i];
                if (_getPath.includes(e)) {
                    $('.scndDepth a').text('공통');
                    $('.trdDepth a').text($('.rtCont h3').text());
                    $('.pageTitle').text(_fn10pgtitle[i]);
                }
            }
        }
    },
};
$(function () {
    //DATEPICKER
    $( function() {
        $( ".datepicker" ).datepicker({ 
            dateFormat: 'yy-mm-dd',
            yearSuffix: ".",
            showMonthAfterYear: true,
            showOtherMonths: false,
            monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
            dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        });
    } );

    $("[data-include-path]").length > 0 ? adigaApps.initial() : adigaApps.floatRightMenu(); //퍼블 include html
    //   adigaApps.floatRightMenu(); //오른쪽 플로팅 메뉴 Event Animation
    $("#mainWrap").length > 0 ? "" : adigaApps.chkWinScroll(); //서브 상단 sticky
    $('.modTabWrap').length > 0 ? adigaApps.tabMenu(): ""; //텝메뉴

    //아코디언 기능 20230726
	$(document).on('click', '.opnfld', function() {
        $(this).parents("div.vw").toggleClass("open").next(".fld").find(".fldInner").slideToggle("fast");
    });

    //팝업
	$(document).on('click', '.modPopup .popCont', function() {
        if($(this).scrollTop() >= 1){
            $(this).prev().addClass("shadow");
        }else{
            $(this).prev().removeClass("shadow");
        }
    });

    //말풍선
	$(document).on('click', '.glbTooltip .icon', function() {
        // e.preventDefault();
        $(".glbTooltip .tooltipCont").removeClass("on");
        // $(this).next().toggleClass("on");
        $(this).next().addClass("on");
    })

	$(document).on('click', '.glbTooltip .close', function() {
        // e.preventDefault();
        $(".glbTooltip .tooltipCont").removeClass("on");
        // $(this).parent().toggleClass("on");
        $(this).parent().removeClass("on");
    })


    //커스텀 셀렉트 20230816
	$(document).on('click', '.comSelect button', function() {
        var opt = $(this).next(".optArea");
        if($(opt).is(":visible")){
            $(this).next(".optArea").slideUp('fast');
            $(this).parent(".comSelect").removeClass("on");
        }else{
            $(this).next(".optArea").slideDown('fast');
            $(this).parent(".comSelect").addClass("on");
        }    
    })

    //상단 고정형 커스텀 셀렉트 20230816
	$(document).on('click', '.comSelectTpStk button', function() {
        // var opt = $(this).next(".optArea");
        // if($(opt).is(":visible")){
        //     $(this).next(".optArea").hide();
        //     $(this).parent(".comSelectTpStk").removeClass("on");
        // }else{
        //     $(this).next(".optArea").slideDown('fast');
        //     $(this).parent(".comSelectTpStk").addClass("on");
        // }   
        $(this).next(".optArea").slideToggle();
        $(this).parent(".comSelectTpStk").toggleClass("on");
    })

    //드롭다운
	$(document).on('click', '.filDropdownBtn', function() {
        $(this).parents(".cptFilDropdown").children(".filDropdownList").slideToggle();
        $(this).parents(".cptFilDropdown").toggleClass("open");
        $(this).parents(".cptFilDropdown").find(".icon._arrow").toggleClass("open");
    })

    // 대학교 드롭다운
	$(document).on('click', '.filDropdownBtn', function() {
        $(this).parents(".cptFilDropdown2").children(".filDropdownList").slideToggle();
        $(this).parents(".cptFilDropdown2").toggleClass("open");
        $(this).parents(".cptFilDropdown2").find(".icon._arrow").toggleClass("open");
    })

    /*Q&A 아코디언*/
	$(document).on('click', '.accordionBtn', function() {
        $(this).parents(".accordionItem").toggleClass("on");
        $(this).siblings(".accordionCon").slideToggle(200);
    })

    /* 게시판 목록 focus 배경 처리 */
	$(document).on('click', '.tblList a', function() {
        $(this).parents('tr').addClass('hover').siblings().removeClass('hover');
    })

    //진로정보 전용 아코디언
	$(document).on('click', '.jobInfoDpdw > button', function() {
        var dpCon = $(this).parent(".jobInfoDpdw");
        $(dpCon).toggleClass("on");
        $(dpCon).find(".dpdwCont").slideToggle();
    })

	$(document).on('click', '.antrDpdw > button', function() {
        var antrCon = $(this).parents(".antrDpdw").find(".antrCont");
        if($(antrCon).is(":visible")){
            $(".antrCont").slideUp();
            $(".antrDpdw").removeClass("on");
        }else{
            $(".antrCont").slideUp();
            $(".antrDpdw").removeClass("on");
            $(antrCon).slideDown();
            $(this).parent(".antrDpdw").addClass("on");
        }
    })

    //대학검색 팝업 리스트 선택 기능
    $(document).on('click', '.scrollBox ul li a', function() { 
        $(this).toggleClass("choose");
    })

    $(document).on('click', 'input[name=scrInst]', function(){
        var val = $('input[name=scrInst]:checked').val()
        if(val == 2){
            $(".opt2Chk").hide();
        }else{
            $(".opt2Chk").show();
        }
    })

    // 특수케이스 셀렉트용 js
    $(document).on('click', '.tbSelectCov button', function(e) {
        // $(this).parent('.comSelectTpStk').next('.spCase_optArea').toggleClass('ae-hide');
        var bottomSpace = $(this).offset().top + $(this).outerHeight();
        var dropdown = $(this).parent('.comSelectTpStk').next('.spCase_optArea');

        if ($(dropdown).is(":visible")){
            $('.spCase_optArea').hide();
            $('.comSelectTpStk').removeClass("on");
        }else{
            $('.spCase_optArea').hide();
            $('.comSelectTpStk').removeClass("on");
            if ((bottomSpace + $(dropdown).height()) > $(".popupContArea").height()) {
                $(dropdown).css('top', $(dropdown).height() * (-1) - 45);
            }else{
                $(dropdown).css('top', 48);
            }
            $(this).parent('.comSelectTpStk').addClass("on");
            $(this).parent('.comSelectTpStk').next('.spCase_optArea').show();
        }
    })

    //성적분석용 데이터테이블 스크립트
    //접었다 폈다
    $(document).on('click', '.listTitle .btnTxtClr', function() {
        $(this).parents('li').toggleClass("on");
        $(this).parents('div.norList').next('.fld').slideToggle("fast");
    })

    //더보기 버튼
    $(document).on('click', '.seeMore', function() {
        $(this).next('.moreBox').toggleClass("on");
    })
    $(document).on('click', '.moreBox a', function() {
        $(this).parents('.moreBox').toggleClass("on");
    })
    
    $(document).on('click','.tsTabSlide .swiper-slide a', function(){

        var tsIdx = $(this).parent(".swiper-slide").index();
        $(".tsTabSlide .swiper-slide").removeClass("on");
        $(".tsTabContBox > div").hide();

        if(tsIdx == 0) {
            $(".tsTabSlide .swiper-slide").eq(tsIdx).addClass("on");
            $(".tsTabContBox > div").show();
            $('.univLocalArea').removeAttr('style');
            $('.recSearch').removeAttr('style');
        }else if(tsIdx > 0){
            $(".tsTabSlide .swiper-slide").eq(tsIdx).addClass("on");
            $(".tsTabContBox > div").eq(tsIdx - 1).show();
            $('.recSearch').hide();
        }
    })

    //통합검색 슬라이드01
    var tsTabSlide = new Swiper(".tsTabSlide", {
        slidesPerView: "auto",
        centeredSlides:false,
        spaceBetween: 6,
        pagination : false,
        loop:false, 
        observer:true,
		observeParents:true,
        slidesPerGroup : 3,
        allowTouchMove: false,
        navigation: {
            nextEl: ".sortNext",
            prevEl: ".sortPrev",
        }
    });

    // 대학별성적분석 분석결과 더보기 버튼
    $('.btnTblMore').on('click', function(){
        $(this).next('.ellipsisBox').addClass('_show');
    });
    $('.btnX').on('click', function(){
        $(this).parents('.ellipsisBox').removeClass('_show');
    });

    // 메뉴 팝업
    $(document).on("click",".mainMenuBtn", function() {
        $(this).toggleClass("on");
        $(this).next("div").toggleClass("on");
        $(".loginInner").removeClass("underOn");
        $(".memberOptionCov").removeClass("underOn");
        $(".memberOptCont > div").hide();
    })

  //퀵메뉴 설정 팝업
    $(document).on("click",".mainPopBtn", function() {
        $(".quickPop").addClass("on");
        $(".quickPopBg").addClass("on");
        $("body").addClass("scrLock");
    })

    //퀵메뉴 설정 팝업 (닫기)
    $(document).on("click",".quickCls", function() {
        $(".quickPop").removeClass("on");
        $(".quickPopBg").removeClass("on");
        $("body").removeClass("scrLock");
    })

    //대입정보자료실 상세 키워드 슬라이드
    var swiper = new Swiper(".keywordsSlide", {
        slidesPerView: "auto",
        centeredSlides:false,
        spaceBetween: 9,
        pagination : false,
        loop:false, 
        slidesPerGroup : 2,
        allowTouchMove: false,
        navigation: {
            nextEl: ".keySlideNext",
            prevEl: ".keySlidePrev",
        }

    });
    
    // 목록 정렬아이콘 
    $(document).on('click','.btnSort', function(){
        $(this).toggleClass("on");
    })
});

// 체크박스 하나만 선택
$(document).on('click', "input.onlyOneClick", function(){
    if(this.checked) {
        const checkboxes = $("input.onlyOneClick");
        for(let ind = 0; ind < checkboxes.length; ind++){
            checkboxes[ind].checked = false;
        }
        this.checked = true;
    } else {
        this.checked = false;
    }
});

// 차트 안내문구 펼치기
$(document).on('click', "input.onlyOneClick", function(){
    if(this.checked) {
        const checkboxes = $("input.onlyOneClick");
        for(let ind = 0; ind < checkboxes.length; ind++){
            checkboxes[ind].checked = false;
        }
        this.checked = true;
    } else {
        this.checked = false;
    }
});

// 모달 팝업
function openPopup($popName){
    $("#"+$popName).addClass("on");
    $("body").addClass("scrLock");
}
function closePopup($popName){
    $("#"+$popName).removeClass("on");
    $("body").removeClass("scrLock");
}

function windowPopupOpen(url, name){
	var w = 1600;
	var h = 860;
	var l = window.outerWidth / 2 + window.screenX - (w / 2);
	var t = window.outerHeight / 2 + window.screenY - (h / 2) - 50;
	var options = 'width=' + w + ', height=' + h + ', left=' + l + ', top=' + t + ', status=no, menubar=no, toolbar=no, resizable=no';
    window.open(url, name, options);
}
// 좌측 필터영역 고정 스크립트 추가 2023.12.21
$(document).ready(function(){
    $(window).scroll(function(){
        var strscr = $(window).scrollTop(); //현재 스크롤 위치 파악
        var endscr = $(document).height() - $(window).height() - 200; //해당 페이지 최대 스크롤값
        if(strscr >= 340){
            $(".leftFixedOption .ltCont .fixedBox").addClass("strScr");
            if(strscr >= endscr){
                $(".leftFixedOption .ltCont .fixedBox").addClass("endScr");
            }else{
                $(".leftFixedOption .ltCont .fixedBox").removeClass("endScr");
            }
        }else{
            $(".leftFixedOption .ltCont .fixedBox").removeClass("strScr");
            $(".leftFixedOption .ltCont .fixedBox").removeClass("endScr");
        }
    })
})

/*
window.addEventListener("DOMContentLoaded", (event) => {
});

window.addEventListener('load', function() {
    adigaApps.initial(); 
});

setTimeout(()=> {
    adigaApps.floatRightMenu(); //오른쪽 플로팅 메뉴 Event Animation
},10)
*/

/* JH Code */
$(document).ready(function(){
	/* $('.cptTbBsc table').after('<div class="tbBtLine"></div>'); */
});


var filPopCurrent = 'off';
$(document).on('click', '.btnFilOpen', function(){
	if(filPopCurrent == 'off'){
		$(this).addClass('on');
		$('.filPop').fadeIn(100);
		$('.filDim').fadeIn(100);
		filPopCurrent = 'on';
	}else{
		$(this).removeClass('on');
		$('.filDim').fadeOut(100);
		$('.filPop').fadeOut(100);
		filPopCurrent = 'off';
	}
});

//추천형 툴팁
$(document).on('click', '.aiListTitleLeft .iIcon', function() {
    event.preventDefault();
    $('.aiListTitleLeft .iInfoTooltip .tooltipCont').show();
});

$(document).on('click', '.aiListTitleLeft .tooltipCont .close', function() {
    event.preventDefault();
    $('.aiListTitleLeft .iInfoTooltip .tooltipCont').hide();
});
