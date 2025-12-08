let scrolling;
$(window).scroll(function(e){
	if(!scrolling){
		e.preventDefault();
		if (!($('.appbar').hasClass('_fixed'))) {
			$('.appbar').fadeOut();
		}
	}

	window.clearTimeout(scrolling);
	scrolling = setTimeout(() => {
		$('.appbar').fadeIn();
		scrolling = undefined;
	}, 200);
});

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)
window.addEventListener('resize', () => {
	let vh = window.innerHeight * 0.01
	document.documentElement.style.setProperty('--vh', `${vh}px`)
})

$(document).on('click', '.btnHeaderClose', function() {
	$('#header').removeAttr('style');
	$('.innerCon').removeAttr('style');
	if ($(this).parents('.wrapper').hasClass('_totalMenu')) {
		$('._totalMenu').removeClass('_on');
	} else if ($(this).parents('.wrapper').hasClass('_setting')){
		$('._setting').removeClass('_on');
	} else if ($(this).parents('.wrapper').hasClass('_bottomSheets')) {
		$('.wrapper').removeClass('_hidden');
		$(this).parents('.popupWrap').removeClass('_on');
		$(this).parents('._bottomSheets').removeClass('_on');
	} else {
		$(this).parents("._fullPopup").removeClass('_on');
		$(this).parents("._fullPopup").find(".btnWrap").removeClass('_on');
		$("html").css("overflow", "");
	}
});

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

$(document).on('click', '.menuSpinner .dim', function(e) {
	e.preventDefault();
	$('.btnMenuSpinner').removeClass('_on');
	$('.menuSpinner').removeClass('_on');
	$('.wrapper').removeClass('_hidden');
});

$(document).on('click', '.favoriteSearch .btnSelBtn2', function () {
	$('.favoriteSearch .btnSelBtn2').removeClass('on');
	$(this).addClass('on');
})

$(document).on('touchend', '.mainSearchPopup', function () {
	$("#autoComplet").blur();
})

$(document).on('load', function () {
	if ($('.btnWrap').hasClass('_CTA')) {
		$('.btnWrap').parent().addClass('_hasCTA');
		if ($('.btnWrap._CTA').hasClass('_dblLines')) {
			$('.btnWrap._CTA').parent().addClass('_hasDblLines');
		}
	} else {
		$('.contInner').removeClass('_hasCTA').removeClass('_hasDblLines');
	}
})

function closePopup(){
	$('.mainSearchPopup').removeClass('_on');
	$('#autoComplet').val('');
	$('#popupSearchbar').hide();
}

function showSearch() {
	$('#autoComplet').focus();
}

function autoComplete(e){
	$('#popupSearchbar').show();

	let regE = "";
	const $menu = $('#menuPopup');
	if($menu.hasClass('_on')) {
		$menu.removeClass('_on');
		$menu[0].scrollTo(0, 0);
		document.body.style.overflow = 'auto';
	}

	$('.mainSearchPopup').addClass('_on');
	var search = document.getElementById('autoComplet').value.replaceAll(regE, "");

	if (search === null || search === undefined || search.trim() === "") {
		$('.favoriteSearch').show();
		$('.recentSearch').show();
		$('.autoSearch').hide();
	} else {
		$('.autoSearch').show();
		$('.favoriteSearch').hide();
		$('.recentSearch').hide();
	}
}