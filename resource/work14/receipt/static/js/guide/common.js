/* ----------
Common
---------- */


/* *** common *** */
var pageNum;
var subNum;
var vsubNum;


jQuery(function($){

	/* Mouse Inactive */
	/*
	$("body").on("contextmenu", function(e){
		return false;
	});

	$("body").on("dragstart", function(e){
		return false;
	});

	$("body").on("selectstart", function(e){
		return false;
	});
	*/


	/* F12 Inactive (F12 - 123) */
	/*
	$(document).bind("keydown", function(e){
		if(e.keyCode == 123){
			e.preventDefault();
			e.returnValue = false;
		}
	});
	*/


	/* GNB */
	$(".gnb .gnb-ul .gnb-li").bind("mouseenter", function(){
		// console.log("depth1 on");
		$(".gnb .gnb-ul .gnb-li").each(function(){
			$(this).removeClass("current");
		});
		$(this).addClass("current");
		$(this).children(".gnb-sub-box").slideDown(80);
	}).bind("mouseleave", function(){
		// console.log("depth1 off");
		$(this).removeClass("current");
		$(this).children(".gnb-sub-box").slideUp(80);
	});
	$(".gnb .gnb-ul .gnb-li .gnb-sub-ul .gnb-sub-li").bind("mouseenter", function(){
		// console.log("depth2 on");
		$(".gnb .gnb-ul .gnb-li").each(function(){
			$(this).find(".gnb-sub-ul .gnb-sub-li").each(function(){
				$(this).removeClass("sub-current");
			});
		});
		$(this).addClass("sub-current");
	}).bind("mouseleave", function(){
		// console.log("depth2 off");
		$(".gnb .gnb-ul .gnb-li").each(function(){
			$(this).find(".gnb-sub-ul .gnb-sub-li").each(function(){
				$(this).removeClass("sub-current");
			});
		});
	});


	/* Tab */
	$(".main-tab-menu .tab-ul li").each(function(id){
		$(this).children("a").bind("click", function(){
			$(".main-tab-menu .tab-ul li").removeClass("current");
			$(this).parent().addClass("current");
			$(".main-content").hide();
			$(".main-content" + (id + 1)).show();
			return false;
		});
	});

	$(".header-menu2 .menu-ul li").each(function(id){
		$(this).children("a").bind("click", function(){
			$(".header-menu2 .menu-ul li").removeClass("current");
			$(this).parent().addClass("current");
			$(".pop-con").hide();
			$(".pop-con" + (id + 1)).show();
			return false;
		});
	});


	/* Floating */
	var menuFloatPosition = 0;
	var lnbFloatPosition = parseInt($("#popupLnb").css('top'));
	var tabFloatPosition = 10;

	$(window).scroll(function(){
		var scrollTop = $(window).scrollTop();

		var menuNewPosition = scrollTop + menuFloatPosition + "px";
		if(scrollTop > 70){
			$(".header-tit").addClass("scroll-on");
			$(".header-menu5").addClass("scroll-on");
			$(".header-menu5").css('top', menuNewPosition);
			/*
			$(".header-menu5").stop().animate({
				"top":menuNewPosition
			}, 500);
			*/
		}else{
			$(".header-tit").removeClass("scroll-on");
			$(".header-menu5").removeClass("scroll-on");
			$(".header-menu5").css('top', "0px");
			/*
			$(".header-menu5").stop().animate({
				"top":"0px"
			}, 500);
			*/
		}

		var lnbNewPosition = (scrollTop - 80) + lnbFloatPosition + "px";
		if(scrollTop > 80){
			/*
			$("#popupLnb").css('top', lnbNewPosition);
			*/
			$("#popupLnb").stop().animate({
				"top":lnbNewPosition
			}, 500);
		}else{
			/*
			$("#popupLnb").css('top', lnbFloatPosition + "px");
			*/
			$("#popupLnb").stop().animate({
				"top":lnbFloatPosition + "px"
			}, 500);
		}

		var tabNewPosition = (scrollTop - 140) + tabFloatPosition + "px";
		if(scrollTop > (140 - tabFloatPosition)){
			/*
			$(".tab-box").css('top', tabNewPosition);
			*/
			$(".tab-box").stop().animate({
				"top":tabNewPosition
			}, 500);
		}else{
			/*
			$(".tab-box").css('top', "0px");
			*/
			$(".tab-box").stop().animate({
				"top":"0px"
			}, 500);
		}

	}).scroll();

	var gapHeight = $(".tab-box").outerHeight() + 80;
	// alert(gapHeight);
	$(".tab-box .tab-ul li a").on("click", function(event){
		event.preventDefault();
		$("html, body").animate({scrollTop:$(this.hash).offset().top - gapHeight}, 500);
	});


	/* Include, Current */
	$(".header-load").load("./header.do", function(){
		$(".menu-ul li").eq(pageNum - 1).addClass("current");
	});
	$(".lnb-load1").load("./lnb01.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});
	$(".lnb-load2").load("./lnb02.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});
	$(".lnb-load3").load("./lnb03.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});
	$(".lnb-load4").load("./lnb04.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});
	$(".lnb-load5").load("./lnb05.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});
	$(".lnb-load6").load("./lnb06.do", function(){
		$(".lnb-ul .lnb-li").eq(subNum - 1).addClass("current");
		$(".lnb-ul .lnb-li").eq(subNum - 1).find(".lnb-sub .lnb-sub-ul .lnb-sub-li").eq(vsubNum - 1).addClass("current");
	});

});


/* Include */
window.addEventListener('load', function(){
	var allElements = document.getElementsByTagName('*');
	Array.prototype.forEach.call(allElements, function(el){
		var includePath = el.dataset.includePath;
		if(includePath){
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(){
				if(this.readyState == 4 && this.status == 200){
					el.outerHTML = this.responseText;
				}
			};
			xhttp.open('GET', includePath, true);
			xhttp.send();
		}
	});
});
// HTML ex : <div data-include-path="./header.html"></div>


/* Popup */
function popupOpen(url, name, width, height, left, top){
	var url = '/cct/stp/guide/novicePopupMain.do';
	var name = 'novicePopupMain';
	var option = "width=" + 817 + ", height=" + 800 + ", left=" + 50 + ", top=" + 50 + ", scrollbars=no, location=no, menubar=no, toolbar=no, status=no, resizable=no";
	window.open(url, name, option);
}

function popupClose(){
	window.close();
}

//학생부 성적 분석 입력 가이드
function fnAnlsFormGuide(guideType) {
	let _name = "schScoAnlsPopup" ;
	let popup = window.open("", _name, 'height=' + 900 + ',width=' + 900 + 'fullscreen=yes ,resizable=yes,toolbar=yes,menubar=yes,location=yes');
	var formData = new FormData();    	
	formData.append("guideType", guideType);

	var form = document.frm;
	form.target = _name;
	form.action = "/sco/sca/schScoAnlsPopup.do?guideType=" + guideType;
	
	form.submit();
}
	
//학생부 성적 분석 입력 가이드2
function fnAnlsFormGuide2() {
	var url = '/sco/sca/schScoAnlsPopup.do?guideType=student';
	var name = 'schScoAnlsPopup';
	var option = "width=" + 900 + ", height=" + 900 + ", fullscreen=yes ,resizable=yes,toolbar=yes,menubar=yes,location=yes";
	window.open(url, name, option);
}
