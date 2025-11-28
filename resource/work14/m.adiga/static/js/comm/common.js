/******************************************************************************
* 2023 대학입학포털 어디가 Adiga.kr 
* UI Functions 
* by suj, kty, yjs, khw
******************************************************************************/
/* Bottom Sheets */
function openBSheets(id){
    /*
    main header height : 50px (?) floating 
    sub header height : 50px floating
    bottom appbar height: 50px floating;
    footer height:171px static
    bottom fixed button area height: 88px 
    tab height: 50px
    bottom fixed button area height on fullPopup : flexiable
    */
    $('.popupWrap .wrapper').addClass('_hidden');
    //$('.popupWrap2 .wrapper').addClass('_hidden');
    // $('#header').css('z-index','1');
    
    const wrapLength = $('.popupWrap').length;
    if(wrapLength > 1) {
    	($(id).hasClass('_fullPopup')) ? '' : $(id).closest('.popupWrap').addClass('_on');
    } else {
    	($(id).hasClass('_fullPopup')) ? '' : $('.popupWrap').addClass('_on');
    }
    
    let tabH = '50', 
    vpH = '36', // sum of container vertical padding 
    headerH = $(id).find('.header').height(), //60 or 50 
    appbarH = 50, //$('#appbar').height()
    ctaH = 88; //$('.btnFtWrap').height()
    if (id) { 
        let btmsheetH = $(id).find('.header').height() + 24*2; //header height of bottom sheet
        $(id).addClass('_on'); 
        if ($(id).hasClass('_alert')) {
            $(id).children().find('.innerCon').css('height', $(id).height() - vpH);
        } else if ($(id).hasClass('_selection')) {
            // max 높이일때 분기
            let winHeight = $(window).height(),
            conHeight = $(id).find('.innerCon').height();
            if ((conHeight + btmsheetH) > (winHeight * 0.8)) { 
                $(id).find('.innerCon').css('height', ($(id).height() - btmsheetH) )
            } else { 
	            //$(id).find('.innerCon').css('height', $(id).find('.selectList').height());
	            $(id).find('.innerCon').css('height', conHeight + ctaH); //20231129 추가
            }
        } else {
            // if ($(id).find('._hasFtBtn').length > 0) {}
            if ($(id).children().find('.btnFtWrap').length > 0) {
                $(id).children().find('.innerCon').css('height', $(id).height() - ctaH - btmsheetH);
            } else {
                $(id).children().find('.innerCon').css('height', $(id).height() - appbarH - vpH);
            }
        }
    } else { 
    };
};

/* go Url */
function goUrl(e) {
    let url = e;
    (e) ? document.location.href=e : alert('이동할 url 필요');
};

/* include-html function */
var allElements = document.getElementsByTagName('*');
Array.prototype.forEach.call(allElements, function(el) {
    var includePath = el.dataset.includePath;
    if (includePath) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                el.outerHTML = this.responseText;
            }
        };
        xhttp.open('GET', includePath, true);
        xhttp.send();
    }
});

let scrolling;
$(function () {
    $(window).scroll(function(e){
		if(!scrolling){
	        e.preventDefault();
//	        var lastScrollTop = 0;
//	        var tmp = $(this).scrollTop();
	        if (!($('.appbar').hasClass('_fixed'))) {// 지도 예외 처리
//	            if (tmp > lastScrollTop) {
	                $('.appbar').fadeOut();
//	            } else {
//	                $('.appbar').fadeIn();
//	            }
//	            lastScrollTop = tmp;
	        }
		}
		
		window.clearTimeout(scrolling);
		scrolling = setTimeout(() => {
//			var scrollTop = $(window).scrollTop();
//	        var innerHeight = $(window).innerHeight();
//	        var scrollHeight = $('html').prop('scrollHeight');
	
//	        if (scrollTop + innerHeight >= scrollHeight) {
//                $('.appbar').fadeOut();
//            } else {
                $('.appbar').fadeIn();
//            }

			scrolling = undefined;
		}, 200);
    });

    /* Top App Bar on Main */
    $(document).on('click', '.btnHeaderAlarm', function() {//알림
    });
    /* Top App Bar on Sub */
    $(document).on('click', '.btnHeaderBack', function() {//이전화면
    });
    $(document).on('click', '.btnHeaderSetting', function() {//설정
        $('._setting').addClass('_on');
    });
    $(document).on('click', '.btnHeaderSearch', function() {//검색
    });
    $(document).on('click', '.btnFullPopup', function() {//검색
        $('._fullPopup').addClass('_on');
    });
    /* Popup Dim Event Area */
    $(document).on('click', '.popupWrap .dim', function(e) {
        e.preventDefault();
        //종료불가능 팝업 추가
        if($(this).parent().find('._bottomSheets._on').hasClass("closeIpsb")){
        	return;
        }
        $('.wrapper').removeClass('_hidden');
        $('#header').removeAttr('style');
        $('.innerCon').removeAttr('style'); // 20241224 innerCon 초기화추가
        $(this).parents('.popupWrap').removeClass('_on');
        $(this).siblings('._bottomSheets').removeClass('_on');
    })
    //20231129 popupWrap 2 event add
     $(document).on('click', '.popupWrap2 .dim', function(e) {        
        e.preventDefault();
         //종료불가능 팝업 추가
        if($(this).parent().find('._bottomSheets').hasClass("closeIpsb")){
        	return;
        }
        $('.popupWrap2 .wrapper').removeClass('_hidden');
        $('.popupWrap2 .header').removeAttr('style');
        $(this).parents('.popupWrap2').removeClass('_on');
        $(this).siblings('._bottomSheets').removeClass('_on');
    })
	 // 20250624 추천형 바틈시트
     $(document).on('click', '.popupWrap3 .dim', function(e) {  
        e.preventDefault();
        //종료불가능 팝업 추가
        if($(this).parent().find('._bottomSheets').hasClass("closeIpsb")){
        	return;
        }  
		$('.popupWrap3').removeClass('_on');
		$(".wrapper").removeClass('_hidden');
		$(".wrapper._bottomSheets").removeClass('_on');
    })
    /* Top App Bar on Full Popup */
    $(document).on('click', '.btnHeaderClose', function() {
        if($(this).is("#loginClose")) return; // 20231124 로그인페이지 예외추가

        $('#header').removeAttr('style');
        $('.innerCon').removeAttr('style'); // _alert 높이 변경 이슈로 추가 20231010
        if ($(this).parents('.wrapper').hasClass('_totalMenu')) {
            $('._totalMenu').removeClass('_on');
        } else if ($(this).parents('.wrapper').hasClass('_setting')){
            $('._setting').removeClass('_on');
        } else if ($(this).parents('.wrapper').hasClass('_bottomSheets')) {// hasClass('_bottomSheets')
            $('.wrapper').removeClass('_hidden');
            $(this).parents('.popupWrap').removeClass('_on');
            $(this).parents('._bottomSheets').removeClass('_on');
        } else {// hasClass('_fullPopup')
			$(this).parents("._fullPopup").removeClass('_on');
			$(this).parents("._fullPopup").find(".btnWrap").removeClass('_on');
			$("html").css("overflow", "");
        }
    });

    /* Bottom App Bar on Main */
    $(document).on('click', '.btnAppbarHome', function() {//홈
        
    });
    $(document).on('click', '.btnAppbarClass', function() {//대학/학과/전형 정보
        
    });
    $(document).on('click', '.btnAppbarFav', function() {//관심
        
    });
    $(document).on('click', '.btnAppbarMy', function() {//마이페이지
        
    });
    $(document).on('click', '.btnAppbarMenu', function() {//전체메뉴
        $('._totalMenu').addClass('_on');
    });

    /* Footer Link */
    $(document).on('click', '.btnFtPrivacy', function() {//개인정보처리방침
        
    });
    $(document).on('click', '.btnFtContract', function() {//이용약관
        
    });
    $(document).on('click', '.btnFtRefuse', function() {//이메일주소 무단수집 거부
        
    });
    $(document).on('click', '.btnFtLicense', function() {//저작권정책
        
    });
    $(document).on('click', '.btnFtVOC', function() {//제안 및 건의하기
        
    });    

    /* Menu Spinner */
    $(document).on('click', '.btnMenuSpinner', function(e) {
        e.preventDefault();
        if ($(this).hasClass('_on')) {
            $(this).removeClass('_on');
            $('.menuSpinner').removeClass('_on');
            $('.wrapper').removeClass('_hidden');
        } else {
            $(this).addClass('_on');
            $('.menuSpinner').addClass('_on');
            $('.wrapper').addClass('_hidden');
        }
    });
    /* Menu Spinner Dim */
    $(document).on('click', '.menuSpinner .dim', function(e) {
        e.preventDefault();
        $('.btnMenuSpinner').removeClass('_on');
        $('.menuSpinner').removeClass('_on');
        $('.wrapper').removeClass('_hidden');
    });
    /* Toggle Expander */
    $(document).on('click', '.btnToggle', function() {
        if ($(this).parents('.toggleWrap').hasClass('_on')) {
            $(this).parents('.toggleWrap').removeClass('_on');
        } else {
            $(this).parents('.toggleWrap').addClass('_on');
        }
    });
    /* Check _CTA */
    if ($('.btnWrap').hasClass('_CTA')) {
        $('.btnWrap').parent().addClass('_hasCTA');
        if ($('.btnWrap._CTA').hasClass('_dblLines')) {
            $('.btnWrap._CTA').parent().addClass('_hasDblLines');
        }
    } else {
        $('.contInner').removeClass('_hasCTA').removeClass('_hasDblLines');
    }

    /* Custom Select Button Effect */
    $('.btnSelect').on({
        'click' : function(){ $(this).addClass('_active'); },
        'blur'  : function(){ $(this).removeClass('_active'); }
    })

    /*qna accordion control*/
    $(document).on('click', '.cptAccr ul li button', function() {
        $(this).next(".accrAnsBox").slideToggle();
        $(this).find(".accrArrow").toggleClass("on")
    });
    
	/*약관 확인안내 아코디언*/
    $(document).on('click', '.foldArrow', function() {
    	if( $(this).hasClass("on") ){
    		$(this).parent().next(".agmentCont").show();
    		$(this).removeClass("on")	
    	}else{
    		$(this).parent().next(".agmentCont").hide();
    		$(this).addClass("on")
    	}
    });

    /*선택버튼 효과처리*/
    $(document).on('click', '.btnSelBtn', function() {
        $(this).toggleClass("on")
    });

    /*스탠더드 폴딩*/
    $(document).on('click', '.cptFoldingInfo button', function() {
        $(this).next(".infoCont").slideToggle();
        $(this).children(".foldArrow").toggleClass("on");
    });

    $(document).on('click', '.tooltipTarget', function() {
        $(this).next('.tCont').show();
    });

    //드롭다운
    $(document).on('click', '.filDropdownBtn', function() {
        $(this).parents(".cptFilDropdown").children(".filDropdownList").slideToggle();
        $(this).parents(".cptFilDropdown").toggleClass("open");
        $(this).parents(".cptFilDropdown").find(".icon._arrow").toggleClass("open");
    })

    /*grid list folding control*/
    $(document).on('click', '.gtRt.folding', function() {
        $(this).parent(".gridTop").next(".gridBott._folding").slideToggle();
        $(this).toggleClass("on")
    });

    /*button action for highscholl search popup*/
    $(document).on('click', '.hsSchPop .searchList button', function() {
        $(this).parent("li").toggleClass("active")
    });

    //DATEPICKER
    $('.datepicker').datepicker({
        dateFormat: 'yy-mm-dd',
        yearSuffix: ".",
        showMonthAfterYear: true,
        showOtherMonths: false,
        monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    });

    /* 성적분석 : 상세보기 */
    $('.btnTblCombo').on('click', function(){
        if ($(this).hasClass('_up')) {
            $(this).parents('.tableComboDetail').addClass('_off').siblings('.tableCombo').removeClass('_off');
        } else {
            $(this).parents('.tableCombo').addClass('_off').siblings('.tableComboDetail').removeClass('_off');
        }
    });
});

/* 2023.12.20 touchmove -> click 변경*/
//$(document).on('touchmove', '.scrollUp', function(e) {
//	const winHeight = window.innerHeight / 2
//    let mouseLoc, maxHeight;
//    if ($(this).parent().hasClass('myChoice')) {
//        /* 성적분석 */
//        mouseLoc = e.changedTouches[0].clientY;
//        maxHeight = window.innerHeight * 0.05 ;
//    } else {
//        /* 지도검색 */
//        // 펼쳤을 때 위에서부터 약 9% 밑에 위치, 닫혔을 때 위에서 부터 약 47% 밑에 위치함
//        mouseLoc = e.changedTouches[0].clientY - 50;
//        maxHeight = (window.innerHeight - 50) * 0.09 ;
//    }
//
//    // 9%이하로 가지 못하게 막음
//    if (mouseLoc <= maxHeight){
//        mouseLoc = maxHeight
//    }
//    $('.cptScrlBox').css('top', mouseLoc);
//})
//    
//$(document).on('touchend', '.scrollUp', function(e) {
//	const winHeight = window.innerHeight / 2
//    let bsOpenVal, bsDefaultVal; 
//    if ($(this).parent().hasClass('myChoice')) {
//        /* 성적분석 */
//        bsOpenVal = '5rem';
//        bsDefaultVal = 'calc(100vh - 8rem)';
//    } else {
//        /* 지도검색 */
//        bsOpenVal = '9%';
//        bsDefaultVal = '47%';
//    }
//
//    // 화면 사이즈의 반을 기준으로 높이를 변경함
//    if(winHeight >= e.changedTouches[0].clientY) {
//        $('.cptScrlBox').css('top', bsOpenVal);
//        
//        if ($(this).parent().hasClass('myChoice')) {//성적분석
//            $('.cptScrlBox.myChoice').addClass('_expander');
//            $('.wrapper').addClass('_hidden');
//        }
//    }else {
//        $('.cptScrlBox').css('top', bsDefaultVal);
//        
//        if ($(this).parent().hasClass('myChoice')) {//성적분석
//            $('.cptScrlBox.myChoice').removeClass('_expander').removeAttr('style');
//            $('.wrapper').removeClass('_hidden');
//        }
//    }
//})

$(document).on("click", ".scrollUp", function(e){
	let maxHeight;
	let bsDefaultVal;
	
	if($(this).hasClass("_on")){
		$(this).removeClass("_on");
		if ($(this).parent().hasClass('myChoice')) {//성적분석
            $('.cptScrlBox.myChoice').removeClass('_expander').removeAttr('style');
            $('.wrapper').removeClass('_hidden');
        	bsDefaultVal = 'calc(100vh - 11rem)';
        } else {
        	bsDefaultVal = '47%'
		}
		$('.cptScrlBox').css('top', bsDefaultVal);
		
		$('.wrapper').css('overflow','auto');
	} else {
		$(this).addClass("_on");
		 if ($(this).parent().hasClass('myChoice')) {//성적분석
            $('.cptScrlBox.myChoice').addClass('_expander');
            $('.wrapper').addClass('_hidden');
			maxHeight = window.innerHeight * 0.05 ;
        } else {
			maxHeight = (window.innerHeight - 50) * 0.09 ;
		}
		$('.cptScrlBox').css('top', maxHeight);
		$('.wrapper').css('overflow','auto');
		
	}
});

/* Tab Menu y-axis scroll */
if ($('.tabMenu').length > 0) {
    $('.tabMenu').each(function(){
        var _tabLen = $(this).find('.tab').length;
        if ( (_tabLen > 3) || ($(this).hasClass('_dep3')) )  {
            $(this).addClass('swiper');
            $(this).find('div').eq(0).addClass('swiper-wrapper');
            $(this).children('.swiper-wrapper').find('div').each(function(i){
                i = i + 1;
                $(this).addClass('swiper-slide odr' + i);
            });
                                //check active then focus
            let _left = $(this).find('.tab._on').offset().left;
            let _curLeft = $(this).scrollLeft();
            $(this).animate({scrollLeft: _curLeft + _left - 20}, 400);

            $(this).find('.tab').on('click',function(){
                _left = $(this).offset().left;
                _curLeft = $(this).parents('.tabWrap').scrollLeft();
                $(this).parents('.tabMenu').find('.tab').removeClass('_on');
                $(this).addClass('_on');
                $(this).parents('.tabMenu').animate({scrollLeft:  _curLeft + _left - 20}, 400);
            })
        } else {
            $('.tabMenu .tab').on('click',function(){
                $(this).parents('.tabMenu').find('.tab').removeClass('_on');
                $(this).addClass('_on');
            })
        };
    });
}


function closePopup(){
		$('.mainSearchPopup').removeClass('_on');
		$('#autoComplet').val('');
		
		$('#popupSearchbar').css({
			"display": "none"
		});
	}
	
	var g_offset = 0; // 더보기 할시 변동
	var g_limit = 5; // 더보기 할시 변동
	var sort = "$relevance";
	var sortType = "desc";

	var entries = performance.getEntriesByType("navigation")[0];
	if(entries.type === "reload") {
		
	}
	
	function showSearch() {
		$('#autoComplet').focus();
	}
		
	
	//자동완성 호출
	function autoComplete(e){
		let today = new Date();
		let monthDate = today.getMonth()+1;
		let dayDate = today.getDate();
		let yearDate = today.getFullYear();
		
		let formatDate = yearDate+"."+(("00" + monthDate.toString()).slice(-2))+"."+(("00" + dayDate.toString()).slice(-2)); 
		$('.normTxt').text(formatDate + " 기준")
		
		$('#popupSearchbar').css({
			"display": "block"
		});
		
		$('.btnSelBtn2').on('click', function() {
		      // 모든 버튼에서 on 클래스 제거
		      $('.btnSelBtn2').removeClass('on');
		      // 클릭한 버튼에 on 클래스 추가
		      $(this).addClass('on');
		      popValue = $(this).val();
		      
		      if(popValue=="01"){
		      
		    	  fn_axios
					.get(
							"/mob/man/sch/populerSearch2.do",
							function(res) {
								$(".popList li").remove();
								var tag = "";
								let objList = res.obj[0].list
								$(".popList li").remove();
								for (var i = 1; i <= objList.length; i++) {
									tag += '<li>';
									tag += '<span class="lyt"><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+objList[i-1][0]+' class=btnFavData><span class=no>'
											+ '<span class="cnt">'+i+'</span>'
											+ '</span>'
											+ objList[i-1][0] + '</span></a>';
									if (objList[i - 1][1] > 0) {
										tag += '<i class=ico_goup><span class=hidden>상승</span></i>';
									} else if (objList[i - 1][1] < 0) {
										tag += '<i class=ico_godn><span class=hidden>하락</span></i>';
									} else if (objList[i - 1][1] == 0) {
										tag += '<i class=ico_goeq><span class=hidden>보합</span></i>';
									} else {
										tag += '<i class=ico_gonew><span class=hidden>new</span></i>';
									}
									tag += '</li>';
								}
								$(".popList").html(tag)
							},{
								params : {
								}
							});
							
		    	  
		      }else {
		    	  fn_axios
					.get(
							"/mob/man/sch/populerSearch.do",
							function(res) {
								$(".popList li").remove();
								var tag = "";
								$(".popList li").remove();
								for (var i = 1; i <= res.popSubject[0].result.rows.length; i++) {
									tag += '<li>';
									tag += '<span class="lyt"><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+res.popSubject[0].result.rows[i-1].fields.RUNM+' class=btnFavData><span class=no>'
											+ '<span class="cnt">'+i+'</span>'
											+ '</span>'
											+ res.popSubject[0].result.rows[i-1].fields.RUNM + '</span></a>';
									tag += '</li>';
								}
								$(".popList").html(tag)
							},{
								params : {
								}
							});
		      }
		      
		      
		      
		      
		      /*fn_axios
				.get(
						"/mob/man/sch/populerSearch.do",
						function(res) {
							var tag = "";
							let objList = res.obj[0].list
							$(".popList li").remove();
							if(popValue=="01"){
								for (var i = 1; i <= objList.length; i++) {
									tag += '<li>';
									tag += '<span class="lyt"><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+objList[i-1][0]+' class=btnFavData><span class=no>'
											+ '<span class="cnt">'+i+'</span>'
											+ '</span>'
											+ objList[i-1][0] + '</span></a>';
									if (objList[i - 1][1] > 0) {
										tag += '<i class=ico_goup><san class=hidden>상승</span></i>';
									} else if (objList[i - 1][1] < 0) {
										tag += '<i class=ico_godn><span class=hidden>하락</span></i>';
									} else if (objList[i - 1][1] == 0) {
										tag += '<i class=ico_goeq><span class=hidden>보합</span></i>';
									} else {
										tag += '<i class=ico_gonew><span class=hidden>new</span></i>';
									}
									tag += '</li>';
								}
							} else {
								for (var i = 1; i <= res.popSubject[0].length; i++) {
									tag += '<li>';
									tag += '<span class="lyt"><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+res.popSubject[0][i - 1].runm+' class=btnFavData><span class=no>'
											+ '<span class="cnt">'+i+'</span>'
											+ '</span>'
											+ res.popSubject[0][i - 1].runm + '</span></a>';
									tag += '</li>';
								}
							}

							$(".popList").html(tag)
						}, {
							params : {
							}
						});*/
		    });
		
		let regE = "";
		const $menu = $('#menuPopup');
		if($menu.hasClass('_on')) {
			$menu.removeClass('_on');
			//scroll
			$menu[0].scrollTo(0, 0);
			document.body.style.overflow = 'auto';
		}
		
		$('.mainSearchPopup').addClass('_on');
		const recentSearches = getRecentSearches();
		if(window.event.keyCode==13){
			addRecentTotalSearch()
		}
		
		var search = document.getElementById('autoComplet').value;
		search = search.replaceAll(regE,"");
		var autoList = $("#layerAtcmpAutoComp");
		if(search === null || search === undefined || search.trim() === ""){
			
			$('.favoriteSearch').css({
				"display": "block"
			});
			$('.recentSearch').css({
				"display": "block"
			});
			$('.autoSearch').css({
				"display": "none"
			});
			
			fn_axios
			.get(
					"/mob/man/sch/populerSearch2.do",
					function(res) {
						var tag = "";
						let objList = res.obj[0].list
						$(".popList li").remove();
						for (var i = 1; i <= objList.length; i++) {
							tag += '<li>';
							tag += '<span class="lyt"><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+objList[i-1][0]+' class=btnFavData><span class=no>'
									+ '<span class="cnt">'+i+'</span>'
									+ '</span>'
									+ objList[i-1][0] + '</span></a>';
							if (objList[i - 1][1] > 0) {
								tag += '<i class=ico_goup><span class=hidden>상승</span></i>';
							} else if (objList[i - 1][1] < 0) {
								tag += '<i class=ico_godn><span class=hidden>하락</span></i>';
							} else if (objList[i - 1][1] == 0) {
								tag += '<i class=ico_goeq><span class=hidden>보합</span></i>';
							} else {
								tag += '<i class=ico_gonew><span class=hidden>new</span></i>';
							} 
							tag += '</li>';
						}

						$(".popList").html(tag)
					}, {
						params : {
						}
					});
					
			
			if(recentSearches == null | recentSearches == undefined | recentSearches == "" | recentSearches == " "){
				var tag = "";
				$(".recentList li").remove();
				tag = '<div class="noData">최근 검색 내역이 없어요.</div>'
				$(".recentList").html(tag)
				
			}else{
				$('.autoSearch').css({
					"display": "none"
				});
				
				$('.recentSearch').css({
				"display": "block"
				});
				var tag = "";
				$(".recentList li").remove();
				
				$.each(recentSearches, function(i, recent_data) {
					tag += '<li>';
					tag += '<span class="lyt">';
					tag += '<span class="icon"><span class="hidden">목록아이콘</span></span>';
					tag += '<span class="sData"><a href="/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+recent_data+'" class="btnRecData">'+recent_data+'</a></span>';
					tag += '</span>';
					tag += '<button type="button" class="listDelBtn" onclick="removeRecentSearch('+i+')"><span class="hidden">목록삭제</span></button>';
					tag += '</li>';
					
				});
				$(".recentList").html(tag)
				
				
			}
			
			
		}else{
			$('.autoSearch').css({
				"display": "block"
			});
			$('.favoriteSearch').css({
				"display": "none"
			});
			$('.recentSearch').css({
				"display": "none"
			});
			
			
			$.ajax({
				// 호출할 URL
				url : "/mob/man/sch/autoComplete.do",
				type : 'GET',
				datatype : 'json; charset:UTF-8',
				data : {
					search : search
				},
				success : function(res) {
					
					if(res.suggestions[0].length == 0){
						$('.autoComp').css({
							"display": "none"
						});
					}else{
						$('.autoComp').css({
							"display": "block"
						});
						var tag = "";
						$(".autoList li").remove();
						$.each(res.suggestions[0], function(i, json_data) {
								tag += autoCompleteBody(i, json_data);
						});
						$(".autoList").html(tag)
						
					}
					
				},// success
				complete : function(data) {
					// alert("에러발생");
				},
				error : function(xhr, status, error) {
					// alert("에러발생");
				}
			}); // ajax end
		}
	}

//자동완성 그리기
var autoCompleteBody = function(count, json_data) {
	const keyword = $("#autoComplet").val()
	let splitJsonData = json_data[0].split(";")
	let regex = new RegExp(keyword, "g");
	let change_word = splitJsonData[0];
	let replace_word = change_word.replace(regex, "<span style='color:cadetblue;'>" + keyword + "</span>");
	var tag="";
	
	tag += '<li>';
	tag += '<span class="sData" style="display: flex; margin-top: 1.3rem;"><span class="icon" style="border-radius: 50%; background: #ccc url(/mob/static/img/common/search_wht.svg)50% 50% no-repeat; display:inline-block; width:2.2rem; height: 2.2rem; margin-right:0.5rem;"><span class="hidden">목록아이콘</span></span><span><a href=/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search='+encodeURIComponent(splitJsonData[0])+' class="btnRecData">'+replace_word+'</span></a>';
	if(splitJsonData[1] == '1'){
		tag += '<span class="typeSrchOnly" style="margin:auto 1% 0 auto;font-size: 1.3rem;color: #666;">'+splitJsonData[1].replace("1","대입정보")+'</span>';
	} else if (splitJsonData[1] == '2'){
		tag += '<span class="typeSrchOnly" style="margin:auto 1% 0 auto;font-size: 1.3rem;color: #666;">'+splitJsonData[1].replace("2","대학정보")+'</span>';
	} else if (splitJsonData[1] == '3'){
		tag += '<span class="typeSrchOnly" style="margin:auto 1% 0 auto;font-size: 1.3rem;color: #666;">'+splitJsonData[1].replace("3","전형정보")+'</span>';
	} else if (splitJsonData[1] == '4'){
		tag += '<span class="typeSrchOnly" style="margin:auto 1% 0 auto;font-size: 1.3rem;color: #666;">'+splitJsonData[1].replace("4","학과정보")+'</span>';
	}
	/* 
	else if (splitJsonData[1] == '5'){
		tag += '<span class="typeSrchOnly" style="margin:auto 1% 0 auto;font-size: 1.3rem;color: #666;">'+splitJsonData[1].replace("5","원숭이")+'</span>';
	} 
	*/	
	else {
		tag += '<span class="typeSrchOnly"></span>';
	}
	//tag += '<button type="button" class="btnDelData"><span class="hidden">삭제</span></button>';
	tag += '</span>';
	tag += '</li>';
	$(".typeSrchOnly").css({
		"margin":"auto 1% 0 auto"
	})
	return tag;
}

// 로컬 스토리지에서 최근 검색어 목록을 불러오는 함수
function getRecentSearches() {
    const recentSearches = localStorage.getItem('recentSearches');
    return recentSearches ? JSON.parse(recentSearches).reverse() : [];
}

// 로컬 스토리지에 최근 검색어 목록을 저장하는 함수
function saveRecentSearches(recentSearches) {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
}



 // 최근 검색어 항목 삭제 함수
function removeRecentSearch(index) {
    let recentSearches = getRecentSearches();
    recentSearches.splice(index, 1);
    saveRecentSearches(recentSearches.reverse());
    autoComplete();
}

//최근 검색어 전체 삭제
function clearRecentSearches() {
    const recentSearches = [];
    saveRecentSearches(recentSearches);
    autoComplete();
}

/*function addRecentSearches(recentSearches) {
	let recentSch = [];
	recentSch = localStorage.getItem('recentSearches');
	//recentSch.push(recentSearches)
	localStorage.setItem("recentSearches",JSON.stringify(recentSch))
}*/

function addRecentSearches(recentSearches) {
	const searchInput = document.getElementById('autoComplet');
    const searchValue = searchInput.value.trim();

    if (searchValue !== '') {
      // 최근 검색어 배열을 로컬 스토리지에서 불러옵니다.
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      
      // 중복된 검색어를 방지합니다.
      if (!recentSearches.includes(searchValue)) {
    	  
        // 최근 검색어 배열에 추가합니다.
        recentSearches.push(searchValue);
        const uniqueRecentSearches = Array.from(new Set(recentSearches));
        
        if (uniqueRecentSearches.length > 10) {
            uniqueRecentSearches.shift();
        }

        // 최근 검색어를 로컬 스토리지에 저장합니다.
        localStorage.setItem('recentSearches', JSON.stringify(uniqueRecentSearches));
      	}
      }
}



// 검색어를 추가하고 목록을 업데이트하는 함수
function addRecentTotalSearch() {
	var search = document.getElementById('autoComplet').value;
	search = search.replaceAll("\\", "\\\\").replaceAll("#","＃").replaceAll("&","＆").replaceAll("+", "＋");
	addRecentSearches(search);
 if(search.trim() == "" || search == null ){
	 alert("검색어를 입력해주세요")
 }else{
	
	location.href="/mob/man/sch/searchView.do?menuId=MOMANSCH1001&checkMiss=1&search="+search;
 }
}
function hideSearchView(){
 $('.searchView').hide()
}

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)
window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
})

$(document).ready(function(){
	$(".mainSearchPopup").on("touchend",function(){
		$("#autoComplet").blur();
	})
	$(document).on("click", "#rfUnivPopup button.clsPop", function(){
		$("#rfUnivPopup").hide();
	})
})

$(document).ready(function(){
 
    // 추천형 이용안내 - 바텀시트
    $(document).on('click', '.iInfoTooltip .iIcon', function() {
        $(this).closest('.aiContainer').find('.popupWrap3').addClass('_on');
        $(this).closest('.aiContainer').find('._bottomSheets').addClass('_on');
    });
    
})