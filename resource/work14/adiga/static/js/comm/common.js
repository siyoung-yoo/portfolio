const adigaApps = {
	floatRightMenu: function () {
		$("#fltMenu .qm1").on({
			mouseenter: function () { $(this).addClass("mEnt").delay(500).find("p").fadeIn(); },
			mouseleave: function () { $(this).removeClass("mEnt"); },
		});
		$("#fltMenu .qm2").on({
			click: function () { $("html, body").stop().clearQueue().animate({ scrollTop: "0" }, 400); },
		});

		let chkScrollTop = $(window).scrollTop(),
			chkBrowserTop = $(document).height() - $(window).height() - 220;

		chkScrollTop > chkBrowserTop ? $("#fltMenu").addClass("flBottom") : $("#fltMenu").removeClass("flBottom");

		$(window).scroll(function () {
			let chkScrollTop = $(window).scrollTop(),
			chkBrowserTop = $(document).height() - $(window).height() - 220;

			chkScrollTop > chkBrowserTop ? $("#fltMenu").addClass("flBottom") : $("#fltMenu").removeClass("flBottom");
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
};

$(function () {
	$("[data-include-path]").length > 0 ? adigaApps.initial() : adigaApps.floatRightMenu();
	$("#mainWrap").length > 0 ? "" : adigaApps.chkWinScroll();
	$('.modTabWrap').length > 0 ? adigaApps.tabMenu(): "";
});

$(document).on('click', '.glbTooltip .icon', function() {
	$(".glbTooltip .tooltipCont").removeClass("on");
	$(this).next().addClass("on");
})

$(document).on('click', '.glbTooltip .close', function() {
	$(".glbTooltip .tooltipCont").removeClass("on");
	$(this).parent().removeClass("on");
})

$(document).on('click', '.comSelectTpStk button', function() {
	$(this).next(".optArea").slideToggle();
	$(this).parent(".comSelectTpStk").toggleClass("on");
})

$(document).on('click', '.tbSelectCov button', function(e) {
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