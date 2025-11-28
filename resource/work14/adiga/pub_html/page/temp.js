let allSlcnMap = {};
let allSlcnExtraInfoMap = {};
$(function() {
	ezSign.loadSignModule();
	allSlcnMap = JSON.parse($("input[name='allSlcnMapString']").val());
	allSlcnExtraInfoMap = JSON.parse($("input[name='allSlcnExtraInfoMapString']").val());
	$(".ratingCommet input").focusin(function() {
		$(this).closest(".ratingCommet").addClass("active")
	})
	$(".ratingCommet input").focusout(function() {
		if ($(this).val() === '') {
			$(this).closest(".ratingCommet").removeClass("active")
		}
	})

	// 수험번호 인증 팝업 - 툴팁 텍스트 처리
	$('#popupAuth .descBox').each(function() {
		const txt = $(this).find('.univAdm').text().trim();
		$(this).find('.tooltipTit').text(txt);
	});

	// 수펌번호 인증 팝업 - ON/OFF
	$('.cnAuthArea .btnCon').on('click', function() {
		const popupId = $(this).data('target');
		$('#' + popupId).addClass('on');
	});
	$('#popupAuth .btnCTA').on('click', function() {
		$(this).closest('#popupAuth').removeClass('on');
	});
	$('#popupAuth .popCloseBtn').on('click', function() {
		$(this).closest('#popupAuth').removeClass('on');
	});

	// 수험번호 인증 팝업 리스트 (6개 오픈)
	function scrollState() {
		const listArea = $('ul.modCsatArea');
		const count = listArea.find('li.castList').length;

		listArea.css('overflow-y', count > 6 ? 'auto' : '');
	};
	scrollState();

	// 제출 서류리스트 토글 기능
	$(document).on("click", ".btnToggle", function() {
		const $toggleTarget = $(this).closest(".ssdListWrap").find(".toggleCont");

		if ($(this).hasClass("open")) {
			$toggleTarget.slideUp(150);
			$(this).removeClass("open").attr("aria-expanded", false);
			$(this).find(".hidden").text("리스트 보기")
		} else {
			$toggleTarget.slideDown(150);
			$(this).addClass("open").attr("aria-expanded", true);
			$(this).find(".hidden").text("리스트 닫기")
		}
	});
	// 수험번호 인증 n건 수험번호 미인증 n건
	refreshExnoCertCount();
	// 특별전형 서류 발급/제출 아래의 텍스트 갱신 특별전형에 제출해야 할 86건의 전자 증명서와 37건의 일반 문서가 있습니다.
	refreshDocumentCountText();

	// 만족도 조사 점수에 따른 의견 입력 가능 여부
	$("input[name='rating']").change(function() {
		if($(this).val() * 1 == 10) {
			$("input[name='myOpinionInput']").prop("disabled", true);
		}
		else {
			$("input[name='myOpinionInput']").prop("disabled", false);
		}
	})

	/* 페이지 뒤로가기시 알림 탭 클릭*/
	$("#radioA01").trigger('click');

});

if(history.replaceState) {
	history.replaceState(null, null, '?menuId=PCSSDDCMNT1000');
}

window.onunload = function () {
	var userId = $('input[name=student]:checked').val();
	if(userId && history.replaceState) {
		history.replaceState(null, null, '?menuId=PCSSDDCMNT1000&userId=' + userId);
	}
}

function openPopup2(url) {
	const popupWidth = 1280;  // 팝업창 너비
	const popupHeight = 720; // 팝업창 높이

	// 화면 중앙으로 팝업창 위치 설정
	const popupX = (window.screen.width / 2) - (popupWidth / 2);
	const popupY = (window.screen.height / 2) - (popupHeight / 2);

	// 팝업창 열기
	const popup = window.open(
	  url,
	  "발급 팝업", // 팝업창 이름
	  `width=${popupWidth},height=${popupHeight},left=${popupX},top=${popupY}`
	);

	// 팝업창 유효성 검사
	if (!popup || popup.closed || typeof popup.closed == 'undefined') {
	  alert("팝업 차단이 활성화되어 있습니다. 팝업 차단을 해제해 주세요.");
	}
}

/* input 생성 및 form add 함수 */
function fnMakeHiddInputFrmAdd(formId, inputName, inputValue){
	$('#'+formId).append($('<input>', {
			type: 'hidden',
			name: inputName,
			value: inputValue
		})
	);
}


/* 게시글 상세페이지 이동 함수 */
function fnMoveDetail(type, detailSn, detailSn_2, detailSn_3){
	//폼 초기화
	$("#reportFrm").empty();
	//csrf
	var form = document.getElementById("reportFrm");
	var mapInput = document.createElement("input");
	mapInput.type = 'hidden';

	switch(type) {
		case 'news':	//대입뉴스
				// 조회수 증가 후 페이지이동
				fnBoardInqCnt(detailSn, function(){
					var formData = new FormData();
					formData.append("prtlBbsId", detailSn);
					fn_axios.post(
						"/uct/nmg/enw/newsDetail.do"
						, formData
						, function(fragment) {
							$('#newsDetail .popCont').replaceWith(fragment);
							openPopup2('newsDetail');
						}
					);
				});
			break;
		case 'archive':	//대입전략자료실
				// 조회수 증가 후 페이지이동
				fnBoardInqCnt(detailSn, function(){
					var formData = new FormData();
					formData.append("prtlBbsId", detailSn);
					fn_axios.post(
						"/uct/ces/archiveDetail.do"
						, formData
						, function(fragment){
							$('#archiveDetail .popCont').replaceWith(fragment);
							openPopup2('archiveDetail');

							//대입전략자료실 > 상세 > 키워드 검색 클릭 이벤트 변경
							$('#archiveDetail').find('ul.keyWords li a').each((i, e) => {
								$(e).attr('onclick', '').unbind('click', 'fnSearchKeyword');
								$(e).click(function () {
									//fnMakeHiddInputFrmAdd('reportFrm','searchKey', 'searchkwrdCn');				//키워드 검색
									fnMakeHiddInputFrmAdd('reportFrm','searchWord', $(e).text().substring(1));	//키워드 값
									$('#reportFrm').attr("action","/uct/ces/archiveView.do?menuId=PCUCTCES1000");
									$('#reportFrm').submit();
								});
							});

							//대입전략자료실 > 상세 > 키워드 슬라이드
							new Swiper(".keywordsSlide", {
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
						}
					);
				});
			break;
		case 'univInfo':	//일반 - 대학정보 상세
				fnMakeHiddInputFrmAdd('reportFrm','unvCd', detailSn);			//대학코드
				fnMakeHiddInputFrmAdd('reportFrm','searchSyr',detailSn_2);	//검색년도
				$('#reportFrm').attr("action","/ucp/uvt/uni/univDetail.do?menuId=PCUVTINF2000");
				$('#reportFrm').submit();
			break;
		case 'univClsInfo': //일반 - 학과정보 상세
				fnMakeHiddInputFrmAdd('reportFrm','unvCd', detailSn);		//대학코드
				fnMakeHiddInputFrmAdd('reportFrm','searchSyr', detailSn_2);	//검색년도
				fnMakeHiddInputFrmAdd('reportFrm','ruCd', detailSn_3);		//학과코드
				$('#reportFrm').attr("action","/ucp/cls/uni/classUnivDetail.do?menuId=PCCLSINF2000");
				$('#reportFrm').submit();
			break;
		case 'colInfo':	//전문 - 대학정보 상세
				fnMakeHiddInputFrmAdd('reportFrm','unvCd', detailSn);			//대학코드
				fnMakeHiddInputFrmAdd('reportFrm','searchSyr',detailSn_2);	//검색년도
				$('#reportFrm').attr("action","/ucp/uvt/col/collDetail.do?menuId=PCUVTINF3000");
				$('#reportFrm').submit();
			break;
		case 'colClsInfo': //전문 - 학과정보 상세
			fnMakeHiddInputFrmAdd('reportFrm','unvCd', detailSn);		//대학코드
			fnMakeHiddInputFrmAdd('reportFrm','searchSyr', detailSn_2);	//검색년도
			fnMakeHiddInputFrmAdd('reportFrm','ruCd', detailSn_3);		//학과코드
			$('#reportFrm').attr("action","/ucp/cls/col/classColDetail.do?menuId=PCCLSINF3000");
			$('#reportFrm').submit();
			break;
		case 'jobInfo': //직업정보
			fnMakeHiddInputFrmAdd('reportFrm','searchCrCd', detailSn);
			$('#reportFrm').attr("action","/jbp/jnf/jobInfoDetail.do?menuId=PCJBPJNF2000");
			$('#reportFrm').submit();
			break;
		case 'event': // 대학별 행사안내
			fnMakeHiddInputFrmAdd('reportFrm','evntSn', detailSn);
			$('#reportFrm').attr("action","/uct/gdf/univEventDetail.do?menuId=PCUCTGDF1000");
			$('#reportFrm').submit();
			break;
		case 'qna': // Q&A
			// 조회수 증가 후 페이지이동
	        fnAnsBoardInqCnt(detailSn, function(){
	        	fnMakeHiddInputFrmAdd('reportFrm','ansBbsId', detailSn);
				$('#reportFrm').attr("action","/cct/fqr/qna/qnaDetail.do?menuId=PCCCTFQR2001");
				$('#reportFrm').submit();
	        });
			break;
		case 'propse': // 제안 및 건의하기
			// 조회수 증가 후 페이지이동
	        fnAnsBoardInqCnt(detailSn, function(){
	        	fnMakeHiddInputFrmAdd('reportFrm','ansBbsId', detailSn);
				$('#reportFrm').attr("action","/mpg/apl/receptionHistDetail.do?menuId=PCMPGAPL3001");
				$('#reportFrm').submit();
	        });
			break;
		case 'conse': // 상담내역
			// 조회수 증가 후 페이지이동
	        fnAnsBoardInqCnt(detailSn, function(){
	        	//alert("test");
				fnMakeHiddInputFrmAdd('reportFrm','ansBbsId', detailSn);
				$('#reportFrm').attr("action","/uve/oca/onlineConseDetail.do?menuId=PCUVEOCA1000");
				$('#reportFrm').submit();
	        });
			break;
		case 'magazine': //대입정보 매거진
			var openNewWindow = window.open("about:blank");
			openNewWindow.location.href = detailSn;
			break;
		case 'adigaTV' : //어디가TV
			if (!detailSn) {
				return false;
			}
			var formData = new FormData();
			formData.append("contsId", detailSn);
			fn_axios.post(
					"/uct/nmg/gtv/adigaTvDetail.do"
					, formData
					, function(fragment) {
						$('#adigaTvDetail .popCont').replaceWith(fragment);
						openPopup2('adigaTvDetail');
					}
				);
			break;
	}
}

function fnAnsBoardInqCnt(ansBbsId, callback) {
	const formData = new FormData();
	formData.append("ansBbsId", ansBbsId);
	fn_axios.post(
		"/cmm/com/board/ssdSave.do"
		, formData
		, function(fragment){
			callback();
		}
	);
}

/* 상세페이지 이동 함수 */
function fnDetailPage(dcsbBbsId) {
	$("#dcsbBbsId").val(dcsbBbsId);
	console.log("넘기는 ID:", $("#dcsbBbsId").val());
	// 조회수 증가 후 페이지이동
	fnBoardInqCnt(dcsbBbsId, function(){
		location.href = "/ssd/san/noticeDetail.do?menuId=PCSSDSAN1000&dcsbBbsId=" + encodeURIComponent(dcsbBbsId);
	});
}

function closeModal(id) {
	const popup = document.getElementById(id);
	if (!popup) return;
	popup.style.opacity = '0';
	setTimeout(() => {
		popup.classList.remove('on');
		popup.style.display = 'none';
		document.body.style.overflow = 'auto';
	}, 200);
}

function openModal(modalId) {
	const popup = document.getElementById(modalId);
	popup.classList.add('on');
	popup.style.display = 'flex';
	popup.style.opacity = '0';
	setTimeout(() => { // 자연스러운 fadeIn 효과
		popup.style.transition = 'opacity 0.25s ease-in-out';
		popup.style.opacity = '1';
	}, 10);
	document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

/**
 * 전자증명서 발급신청 모달 열기
 */
async function openRequestEdocPopup(target, targetId) {
	// 개인전자지갑 확인
	const prnEldwInfoVO = await checkEcdw();
	// 전자지갑이 없는 경우 전자지갑 발급 문의
	if(!prnEldwInfoVO.eldwAddr) {
		askCreateEcdw();
		return;
	}
	if(target != "all" && target != "slcn" && target != "edoc") {
		return;
	}
	let edocMap = {};
	for(let allSlcnMapKey in allSlcnMap) {
		let slcnMap = allSlcnMap[allSlcnMapKey];
		for(let slcnMapKey in slcnMap) {
			if(slcnMapKey.indexOf('-COMMON') > -1) {
				let dcsbMap = slcnMap[slcnMapKey];
				for(let dcsbMapKey in dcsbMap) {
					if(dcsbMap[dcsbMapKey]['DOC_SE_CD'] == '10' && !edocMap[dcsbMap[dcsbMapKey]['DCSB_DOC_ID']] && dcsbMap[dcsbMapKey]['PROC_CD'] == '10' && dcsbMap[dcsbMapKey]['EXNO_CERT_YN'] == 'Y') {
						if((target == "all")
							|| (target == "slcn" && targetId == slcnMapKey.replaceAll("-COMMON", ""))
							|| (target == "edoc" && targetId == dcsbMapKey)
							) {
							edocMap[dcsbMap[dcsbMapKey]['DCSB_DOC_ID']] = dcsbMap[dcsbMapKey];
						}
					}
				}
			}
			else if(slcnMapKey.indexOf('-CHOICE') > -1) {
				let allChoiceMap = slcnMap[slcnMapKey];
				for(let allChoiceMapKey in allChoiceMap) {
					let dcsbMap = allChoiceMap[allChoiceMapKey];
					for(let dcsbMapKey in dcsbMap) {
						if(dcsbMap[dcsbMapKey]['DOC_SE_CD'] == '10' && !edocMap[dcsbMap[dcsbMapKey]['DCSB_DOC_ID']] && dcsbMap[dcsbMapKey]['PROC_CD'] == '10' && dcsbMap[dcsbMapKey]['EXNO_CERT_YN'] == 'Y') {
							if((target == "all")
								|| (target == "slcn" && targetId == slcnMapKey.replaceAll("-CHOICE", ""))
								|| (target == "edoc" && targetId == dcsbMapKey)
								) {
								edocMap[dcsbMap[dcsbMapKey]['DCSB_DOC_ID']] = dcsbMap[dcsbMapKey];
							}
						}
					}
				}
			}
		}
	}
	if(Object.keys(edocMap).length == 0) {
		return;
	}
	const requestEdocPopupEdocListUl = $("#requestEdocPopupEdocListUl");
	requestEdocPopupEdocListUl.html("");
	let html = "";
	for(let edocKey in edocMap) {
		let cssClass = edocMap[edocKey]['DOC_SE_CD'] == '10' ? 'badgeGov' : 'badgeCom';
		let badgeText = edocMap[edocKey]['DOC_SE_CD'] == '10' ? '정부24' : '일반';
		let edocName = edocMap[edocKey]['DCSB_DOC_NM'];
		let edocId = edocMap[edocKey]['DCSB_DOC_ID'];
		html += `<li class="requestEdocPopupEdocLi ${edocId}"><span class="${cssClass}">${badgeText}</span><span>${edocName}</span><input type="hidden" name="requestEdocPopupEdocLiEdocId" value="${edocId}"></li>`;
	}
	requestEdocPopupEdocListUl.html(html);
	openModal('requestEdocPopup');
}

/**
 * 성능테스트 대비 전자증명서 발급 신청
 */
async function openEdocApply() {
	setTimeout(function() {
		$("#loadingAction").show();
	}, 10)
	let dcsbDocIdList = [];
	$("input[name='requestEdocPopupEdocLiEdocId']").each(function() {
		dcsbDocIdList.push($(this).val());
	});
	let dcsbMapList = [];
	for(let i in dcsbDocIdList) {
		let mapList = findDcsbMapListByDcsbDocId(dcsbDocIdList[i]);
		for(let j in mapList) {
			dcsbMapList.push(mapList[j]);
		}
	}
	setTimeout(async function() {
		try {
			for(let i in dcsbMapList) {
				const today = new Date();
				let year = today.getFullYear() + "";
				let month = "0" + (today.getMonth() + 1);
				month = month.substring(month.length - 2, month.length);
				let date = "0" + today.getDate();
				date = date.substring(date.length - 2, date.length);
				let hours = "0" + today.getHours();
				hours = hours.substring(hours.length - 2, hours.length);
				let minutes = "0" + today.getMinutes();
				minutes = minutes.substring(minutes.length - 2, minutes.length);
				let seconds = "0" + today.getSeconds();
				seconds = seconds.substring(seconds.length - 2, seconds.length);
				let index = "000" + i;
				index = index.substring(index.length - 4, index.length);
				let applId = year + month + date + hours + minutes + seconds + index;
				const spclSlcnDcsbSbmsnDtlVO = {
					'syr': dcsbMapList[i]['SYR'],
					'unvCd': dcsbMapList[i]['UNV_CD'],
					'dcsbRcmtMmntCd': dcsbMapList[i]['DCSB_RCMT_MMNT_CD'],
					'dcsbSlcnTypeCd': dcsbMapList[i]['DCSB_SLCN_TYPE_CD'],
					'dcsbCycl': dcsbMapList[i]['DCSB_CYCL'],
					'exno': dcsbMapList[i]['EXNO'],
					'dcsbDocId': dcsbMapList[i]['DCSB_DOC_ID'],
					'issuYn': 'Y',
					'prslYn': 'N',
					'dwnldYn': 'N',
					'rlvtYn': dcsbMapList[i]['RLVT_YN'],
					'rcptnYn': 'N',
					'fileId': '',
					'dcsbSttsCd': '20',
					'dmndCn': '',
					'rcptnFilePath': '',
					'rcptnDt': '',
					'prslDt': '',
					'sbmsnYn': 'N',
					'sbmsnDt': '',
					'rsbmDt': '',
					'elcfEdocId': '',
					'elcfDocPrslNo': '',
					'elcfAplyId': applId,
					'elcfAplyYn': 'Y',
					'atchFileLst': null,
				}
				await fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlAfterApplyEdoc.do", spclSlcnDcsbSbmsnDtlVO);
			}
			alert("전자증명서 신청이 완료되었습니다.");

			await getAllSlcnInfo(function() {
				const slcnKeyList = Object.keys(allSlcnMap);
				for(let i in slcnKeyList) {
					// 전형 상자 갱신
					repaintSsdListWrap(slcnKeyList[i]);
					let dcsbMapList = findDcsbMapListBySlcnMapKey(slcnKeyList[i]);
					for(let j in dcsbMapList) {
						let thisDcsbKey = dcsbMapList[j]['TASK_SRVC_CD'] + '-' + dcsbMapList[j]['SYR'] + '-' + dcsbMapList[j]['UNV_CD'] + '-' + dcsbMapList[j]['EXNO'] + '-' + dcsbMapList[j]['DCSB_CYCL'];
						if(dcsbMapList[j]['DCSB_GROUP_CD'] != null && dcsbMapList[j]['DCSB_GROUP_CD'].length > 0) {
							thisDcsbKey += '-CHOICE-GROUP-' + dcsbMapList[j]['DCSB_GROUP_CD'] + '-' + dcsbMapList[j]['DCSB_DOC_ID'];
						}
						else {
							thisDcsbKey += '-COMMON-' + dcsbMapList[j]['DCSB_DOC_ID'];
						}
						// 버튼 갱신
						repaintDocActionButton(thisDcsbKey);
					}
				}
			});
			$("#loadingAction").hide();
			closeModal("requestEdocPopup");
		}
		catch(e) {
			alert("전자증명서 신청 중 오류가 발생하였습니다.");
			console.log(e);
			$("#loadingAction").hide();
		}
	}, 20);
}

/**
 * 전자증명서 86. 신청 화면 URL 요청 실행
 */
async function openEdocApplyReal() {
	// 저장된 개인전자지갑 확인
	const prnEldwInfoVO = await checkEcdw();
	let parameters = edoc.verifyIndiECDW.getDefaultBodyParameters();
	parameters['ci'] = prnEldwInfoVO.userCiNo;
	parameters['ecdwAdres'] = prnEldwInfoVO.eldwAddr;
	// [전자증명서 신청] 1. API 5. 개인 전자문서지갑 주소 확인을 통하여 지갑상태 확인
	const indiEcdwInfo = await edoc.verifyIndiECDW.exec(parameters);
	if(indiEcdwInfo && indiEcdwInfo.ecdwTyCode == "2") { // 2: 미등록 지갑 2: 미등록 지갑인 경우 지갑 이용자 약관 동의 후 지갑 발급 처리(6, 1 API 활용)
		askCreateEcdw()
	}
	else if(indiEcdwInfo && indiEcdwInfo.ecdwTyCode == "3") { // 3: 미등록 장치 3: 해당사항 없음
		// do nothing
	}
	else if(indiEcdwInfo && indiEcdwInfo.ecdwTyCode == "4") { // 4: 이용 중지 4: 이용 중지인 경우 이용 중지 상태 표시 후 활성화 처리(2 API 활용)
		// 필요할 경우 API 2. 개인 전자문서지갑 주소 정보 변경을 활용하여 활성화 로직 추가
	}
	else if(indiEcdwInfo && (indiEcdwInfo.ecdwTyCode == "5" || indiEcdwInfo.ecdwTyCode == "7" || indiEcdwInfo.ecdwTyCode == "8")) { // 5: 약관 변경 5: 약관변경인 경우 다시 지갑 이용자 동의 처리(6, 2 API 활용)
		// 약관동의 및 약관동의 일자 저장
	}
	else if(indiEcdwInfo && indiEcdwInfo.ecdwTyCode == "6") { // 6: 전화번호 변경 6: 해당사항 없음
		// 약관동의 및 약관동의 일자 저장
	}
	else if(indiEcdwInfo && indiEcdwInfo.ecdwTyCode == "1") { // 1: 등록 지갑
		// [전자증명서 신청] 2. 전자문서지갑 전자서명
		var openSignCallback = function(message) {
			if(!message || message.indexOf("|") == -1) {
				alert("전자서명 결과가 비정상입니다.");
				return;
			}
			let resultCode = message.split("|")[0];
			let receiveString = message.split("|")[1];
			if(resultCode != "0") {
				alert("전자서명 결과에 오류가 포함되어 있습니다.\n" + receiveString);
				return;
			}
			const receiveJson = JSON.parse(receiveString);
			let errorMessage = "";
			let errorSubject = "";
			if(receiveJson.errorCode != "2000") {
				for(let i = 0; i < ezSign.errorTable.length; i++) {
					if(ezSign.errorTable[i].errorCode == receiveJson.errorCode) {
						errorMessage = ezSign.errorTable[i].errorMessage;
						errorSubject = ezSign.errorTable[i].errorSubject;
						break;
					}
				}
				if(!errorMessage) {
					errorMessage = message.split("|")[1];
				}
				alert(errorSubject + "\n" + errorMessage);
				return;
			}
			prnEldwInfoVO.receiveJson = receiveJson;
			// [전자증명서 신청] 3. API 86. 신청 화면 URL 요청
			callApplyScreenURL(prnEldwInfoVO);
		}
		ezSign.openSign(prnEldwInfoVO.eldwAddr, openSignCallback); //openSign: function(plainData, openSignCallback)
	}
}

/**
 * 전자증명서 86. 신청 화면 URL 요청 실행 콜백
 */
function openEdocApplyCallback(receiveData) {
	console.log("openEdocApplyCallback receiveData");
	console.log(receiveData);

}

/**
 * requestEdocPopup 팝업에 포함된 문서종류코드(DCSB_DOC_ID) 의 내용으로 API 86. 신청 화면 URL 요청 호출
 */
function callApplyScreenURL(prnEldwInfoVO) {
	// [전자증명서 신청] 3. API 86. 신청 화면 URL 요청
	const reqstInfoList = [];
	$("#requestEdocPopup").find("input").each(function() {
		reqstInfoList.push({'docKndCode': $(this).val()});
	});
	const parameters = edoc.ApplyScreenURL.getgetDefaultBodyParameters();
	parameters.reqstInfoList = reqstInfoList;
	parameters.ecdwAdres = prnEldwInfoVO.ecdwAdres;
	parameters.eltsgnEcdwAdres = prnEldwInfoVO.receiveJson.signedData;
	parameters.crtfctInsttCode = ezSign.getAuthInsttCodeByProviderId(prnEldwInfoVO.receiveJson.providerId);
	parameters.simplCertRTNUrl = location.href;
	const applyScreenUrl = edoc.ApplyScreenURL.exec(parameters);
	// [전자증명서 신청] 4. 신청화면 URL popup 실행
	window.open(applyScreenUrl, "applyScreenUrl");
}

/**
 * (개인 전자지갑이 없는 경우) 발급 신청 여부 확인 팝업 표시
 */
function askCreateEcdw() {
	openModal('askCreateEcdwPopup');
}

/**
 * 개인 전자지갑 확인
 */
async function checkEcdw(callback) {
	let responseData;
	await fn_axios.post("/ssd/cert/selectMyEcdwInfo.do", null, function(data, textStatus, xhr) {
		responseData = data.prnEldwInfoVO;
	});
	return responseData;
}

function moveToCreateEcdw() {
	// [전자지갑 발급]
	// 1. 전자지갑 발급 동의 (동의문 API 호출 및 화면 표시)
	// 2. CI 서명 및 서명 결과 저장(드림시큐리티 본인인증 -> 세션에 서명된 CI 저장)
	// 3. 전자지갑 발급 API 호출
	// 4. 전자지갑 주소 저장
	// 5. 수험번호 인증이 되어있지 않으면 수험번호 인증 프로세스 시작 문의

	// [수험번호 인증]
	// 1. 수험번호 인증 팝업 호출

	// [전자증명서 일괄 발급]
	// 5. 전자증명서 일괄 발급 문의
	// 5.1 전자증명서 발급 필요 목록 조회
	// 5.2 전자지갑 주소 서명(드림시큐리티 본인인증 -> 세션에 서명된 전자지갑 주소 저장)
	// 5.3 전자증명서 신청 화면 요청
	// 5.4 전자증명서 신청 화면 표시
	// 5.5 전자증명서 신청 결과 저장
	location.href = "/ssd/cert/ecdwTrmsAgreView.do?menuId=PCSSDDCMNT2200";
}

/**
 * 전체 데이터 (allSlcnMap) 에서 지정한 문서정보를 찾는 함수
 */
function findDcsbMap(findDcsbKey) { // check 2025.11.07 08:47
	for(let allSlcnMapKey in allSlcnMap) {
		let slcnMap = allSlcnMap[allSlcnMapKey];
		for(let slcnMapKey in slcnMap) {
			if(slcnMapKey.indexOf('-COMMON') > -1) {
				let commonDcsbMap = slcnMap[slcnMapKey];
				for(let dcsbMapKey in commonDcsbMap) {
					if(dcsbMapKey == findDcsbKey) {
						return commonDcsbMap[dcsbMapKey];
					}
				}
			}
			else if(slcnMapKey.indexOf('-CHOICE') > -1) {
				let allChoiceMap = slcnMap[slcnMapKey];
				for(let allChoiceMapKey in allChoiceMap) {
					let choiceDcsbMap = allChoiceMap[allChoiceMapKey];
					for(let dcsbMapKey in choiceDcsbMap) {
						if(dcsbMapKey == findDcsbKey) {
							return choiceDcsbMap[dcsbMapKey];
						}
					}
				}
			}
		}
	}
}

/**
 * 전체 데이터 (allSlcnMap) 에서 지정한 문서종류코드(TASSDS004F.DCSB_DOC_ID)에 해당하는 dcsbMap의 배열 리턴
 */
function findDcsbMapListByDcsbDocId(dcsbDocId) { // check 2025.11.07 08:47
	const mapList = [];
	for(let allSlcnMapKey in allSlcnMap) {
		let slcnMap = allSlcnMap[allSlcnMapKey];
		for(let slcnMapKey in slcnMap) {
			if(slcnMapKey.indexOf('-COMMON') > -1) {
				let commonDcsbMap = slcnMap[slcnMapKey];
				for(let dcsbMapKey in commonDcsbMap) {
					let dcsbMap = commonDcsbMap[dcsbMapKey];
					if(dcsbMap['DCSB_DOC_ID'] == dcsbDocId) {
						mapList.push(dcsbMap);
					}
				}
			}
			else if(slcnMapKey.indexOf('-CHOICE') > -1) {
				let allChoiceMap = slcnMap[slcnMapKey];
				for(let allChoiceMapKey in allChoiceMap) {
					let choiceDcsbMap = allChoiceMap[allChoiceMapKey];
					for(let dcsbMapKey in choiceDcsbMap) {
						let dcsbMap = choiceDcsbMap[dcsbMapKey];
						if(dcsbMap['DCSB_DOC_ID'] == dcsbDocId) {
							mapList.push(dcsbMap);
						}
					}
				}
			}
		}
	}
	return mapList;
}

/**
 * 전체 데이터 (allSlcnMap) 에서 지정한 전형KEY에 해당하는 dcsbMap의 배열 리턴
 */
function findDcsbMapListBySlcnMapKey(findSlcnMapKey) { // check 2025.11.05 20:31
	const mapList = [];
	let slcnMap = allSlcnMap[findSlcnMapKey]; //"SSD-2026-0000063-C000049-1"
	for(let slcnMapKey in slcnMap) {
		if(slcnMapKey.indexOf('-COMMON') > -1) { //"SSD-2026-0000063-C000049-1-COMMON"
			let commonDcsbMap = slcnMap[slcnMapKey]; //"SSD-2026-0000063-C000049-1-COMMON"
			for(let dcsbMapKey in commonDcsbMap) {
				let dcsbMap = commonDcsbMap[dcsbMapKey]; //"SSD-2026-0000063-C000049-1-COMMON-A10"
				mapList.push(dcsbMap);
			}
		}
		else if(slcnMapKey.indexOf('-CHOICE') > -1) {
			let allChoiceMap = slcnMap[slcnMapKey];
			for(let allChoiceMapKey in allChoiceMap) {
				let choiceDcsbMap = allChoiceMap[allChoiceMapKey];
				for(let dcsbMapKey in choiceDcsbMap) {
					let dcsbMap = choiceDcsbMap[dcsbMapKey];
					mapList.push(dcsbMap);
				}
			}
		}
	}
	return mapList;
}

/**
 * 일반파일 업로드 팝업
 */
function openCommonFileUploadPopup(dcsbKey) {
	const dcsbMap = findDcsbMap(dcsbKey);
	let description = `${dcsbMap['UNV_NM']} ${dcsbMap['DCSB_SLCN_TYPE_CD_NM']} ${dcsbMap['DCSB_DOC_NM']}`; // 학교명 - 전형명 - 문서명
	$("#commonFileUploadPopupFileDescription").html(description);
	$("#commonFileUploadPopupDcsbKey").val(dcsbKey);
	openModal("commonFileUploadPopup");
}

/**
 * 일반파일 업로드 실행
 */
function cmmonFileUpload() {
	if(fn_getTotalFileCount('commonFileUploadUi') > 0) {
		fn_transfer('commonFileUploadUi');
	}
}

/**
 * 파일 업로드 완료 이벤트
 */
function RAONKUPLOAD_UploadComplete(uploadId) {
	if(uploadId != "commonFileUploadUi") {
		return;
	}
	const todayString = getTodayYyyyMmDdHhMmSs();
	var dataArray = RAONKUPLOAD.GetListInfo('array', uploadId);
	if(dataArray.mergeFile.length > 0 ) {
		const dcsbKey = $("#commonFileUploadPopupDcsbKey").val();
		const dcsbMap = findDcsbMap(dcsbKey);
		const spclSlcnDcsbSbmsnDtlVO = {
			'syr': dcsbMap['SYR'],
			'unvCd': dcsbMap['UNV_CD'],
			'dcsbRcmtMmntCd': dcsbMap['DCSB_RCMT_MMNT_CD'],
			'dcsbSlcnTypeCd': dcsbMap['DCSB_SLCN_TYPE_CD'],
			'dcsbCycl': dcsbMap['DCSB_CYCL'],
			'exno': dcsbMap['EXNO'],
			'dcsbDocId': dcsbMap['DCSB_DOC_ID'],
			'issuYn': 'Y',
			'prslYn': 'N',
			'dwnldYn': 'N',
			'rlvtYn': dcsbMap['RLVT_YN'],
			'rcptnYn': 'N',
			'fileId': '',
			'dcsbSttsCd': '30',
			'dmndCn': '',
			'rcptnFilePath': '',
			'rcptnDt': '',
			'prslDt': '',
			'sbmsnYn': 'N',
			'sbmsnDt': '',
			'rsbmDt': '',
			'elcfEdocId': '',
			'elcfDocPrslNo': '',
			'elcfAplyId': '',
			'elcfAplyYn': '',
			'atchFileLst': [{
				'atchFileNm': dataArray.mergeFile[0].originalName,
				'orgnlFileNm': dataArray.mergeFile[0].uploadName,
				'fileSz': dataArray.mergeFile[0].size,
			}],
		};
		fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlForCommonFileUploadDone.do", spclSlcnDcsbSbmsnDtlVO, async function(data) {
			await getAllSlcnInfo(function() {
				// 파일 링크 갱신
				const newDcsbMap = findDcsbMap(dcsbKey);
				let textArea = $("#textArea_" + dcsbKey);
				textArea.find('.uploadArea').remove();
				let html = '<div class="uploadArea">';
				html += '	<button type="button" class="uploadFile" th:onclick="fnPreview(\'' + newDcsbMap['FILE_SEQ'] + '\', \'' + newDcsbMap['DOWNLOAD_URL'] + '\', \'' + $("input[name='fileViewAddrString']").val() + '\');">';
				html += '		<span class="fileName">' + newDcsbMap['ATCH_FILE_NM'] + '</span>';
				html += '	</button>';
				if(newDcsbMap['PROC_CD'] != '30') {
					html += '<button type="button" class="btnTrash" onclick="deleteCommonFile(\'' + dcsbKey + '\')"><span class="hidden">파일 삭제</span></button>';
				}
				html += '</div>';
				textArea.append(html);
				// 버튼 갱신
				repaintDocActionButton(dcsbKey);
				$("#commonFileUploadPopupDcsbKey").val("");
				closeModal("commonFileUploadPopup");
				// 전형상자 갱신
				let slcnKey = "";
				if(dcsbKey.indexOf('COMMON') > -1) {
					slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('COMMON') - 1);
				}
				else {
					slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('CHOICE') - 1);
				}
				repaintSsdListWrap(slcnKey);
			});
		});
	}
}

/**
 * 파일 업로드 오류 이벤트
 */
function RAONKUPLOAD_OnError(uploadID, paramObj) {
	$("#commonFileUploadPopupDcsbKey").val("");
    var logBox = 'Error : ' + paramObj.strCode + ', ' + paramObj.strMessage + '<br/>';
    alert(paramObj.strMessage);
}

/*
 * 일반파일 삭제
 */
function deleteCommonFile(dcsbKey) {
	const dcsbMap = findDcsbMap(dcsbKey);
	if(!confirm(dcsbMap['ATCH_FILE_NM'] + " 파일을 삭제하시겠습니까?")) {
		return;
	}
	const spclSlcnDcsbSbmsnDtlVO = {
		'syr': dcsbMap['SYR'],
		'unvCd': dcsbMap['UNV_CD'],
		'dcsbRcmtMmntCd': dcsbMap['DCSB_RCMT_MMNT_CD'],
		'dcsbSlcnTypeCd': dcsbMap['DCSB_SLCN_TYPE_CD'],
		'dcsbCycl': dcsbMap['DCSB_CYCL'],
		'exno': dcsbMap['EXNO'],
		'dcsbDocId': dcsbMap['DCSB_DOC_ID'],
		'dcsbKey': dcsbKey,
	};
	fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlForCommonFileDelete.do", spclSlcnDcsbSbmsnDtlVO, async function(data) {
		await getAllSlcnInfo(function() {
			// 파일 링크 삭제
			const newDcsbMap = findDcsbMap(dcsbKey);
			let textArea = $("#textArea_" + dcsbKey);
			textArea.find('.uploadArea').remove();
			// 버튼 갱신
			repaintDocActionButton(dcsbKey);
			// 전형 상자 갱신
			let slcnKey = "";
			if(dcsbKey.indexOf('COMMON') > -1) {
				slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('COMMON') - 1);
			}
			else {
				slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('CHOICE') - 1);
			}
			repaintSsdListWrap(slcnKey);
		});
	});
}

/**
 * 서류제출 팝업 표시
 */
function openApprovalEdocPopup(target) {
	$("#approvalEdocPopupTypeItem").html("");
	for(let slcnMapKey in allSlcnExtraInfoMap) {
		if(target == "all" || target == slcnMapKey) {
			if(allSlcnExtraInfoMap[slcnMapKey].ssdListWrapProcCd == "10") { // 제출준비 또는 제출완료 상태만 팝업에 포함함
				continue;
			}
			let DCSB_RCMT_MMNT_NM = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContNameAreaNameBadgeCtgry;
			let UNV_NM = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContNameAreaNameUnvNm;
			let DCSB_RU_NM = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContInfoAreaDcsbRuNm;
			let DCSB_CYCL = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapDcsbCycl;
			let periodString = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContInfoAreaDcsbBgngDt + "~" + allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContInfoAreaDcsbEndDt;
			let DCSB_SLCN_TYPE_CD_NM = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm;
			let stateClass = "";
			let stateText = "제출대기";
			if(allSlcnExtraInfoMap[slcnMapKey].ssdListWrapProcCd == "30") {
				stateClass = "_done";
				stateText = "";
			}
			let SLCN_PROC_CD = allSlcnExtraInfoMap[slcnMapKey].ssdListWrapProcCd;
			let html = `
				<div class="listCont">
					<div class="infoArea">
						<div class="name"><span class="badgeCtgry sm">${DCSB_RCMT_MMNT_NM}</span>${UNV_NM}</div>
						<ul>
							<li><strong>${DCSB_RU_NM}</strong></li>
							<li>${periodString}(${DCSB_CYCL}차)</li>
						</ul>
						<p class="pL5">${DCSB_SLCN_TYPE_CD_NM}</p>
					</div>
					<div class="stateArea">
						<span class="state ${stateClass}">${stateText}</span>
					</div>
					<input type="hidden" name="approvalEdocPopupTypeItemSlcnProcCd" value="${SLCN_PROC_CD}">
					<input type="hidden" name="approvalEdocPopupTypeItemSlcnMapKey" value="${slcnMapKey}">
				</div>
			`;
			$("#approvalEdocPopupTypeItem").append(html);
		}
	}
	openModal("approvalEdocPopup");
}

function getTodayYyyyMmDdHhMmSs() {
	const today = new Date();
	let year = today.getFullYear() + "";
	let month = "0" + (today.getMonth() + 1);
	month = month.substring(month.length - 2, month.length);
	let date = "0" + today.getDate();
	date = date.substring(date.length - 2, date.length);
	let hours = "0" + today.getHours();
	hours = hours.substring(hours.length - 2, hours.length);
	let minutes = "0" + today.getMinutes();
	minutes = minutes.substring(minutes.length - 2, minutes.length);
	let seconds = "0" + today.getSeconds();
	seconds = seconds.substring(seconds.length - 2, seconds.length);
	let yyyyMmDdHhMmSs = year + month + date + hours + minutes + seconds;
	return yyyyMmDdHhMmSs;
}

/**
 * 성능테스트 대비 서류 제출
 */
async function approvalEdoc() {
	const slcnMapKeyList = [];
	$("input[name='approvalEdocPopupTypeItemSlcnProcCd']").each(function() { // 제출준비 상태만 서류제출 전송 대상임
		if($(this).val() == "20") {
			slcnMapKeyList.push($(this).next().val());
		}
	});
	if(slcnMapKeyList.length == 0) {
		return;
	}
	let isProcessed = false;
	for(let i in slcnMapKeyList) {
		const dcsbMapList = findDcsbMapListBySlcnMapKey(slcnMapKeyList[i]);
		try {
			for(let i in dcsbMapList) {
				if(dcsbMapList[i]['EXNO_CERT_YN'] != 'Y') {
					continue;
				}
				let index = "000" + i;
				index = index.substring(index.length - 4, index.length);
				let todayString = getTodayYyyyMmDdHhMmSs();
				let edocId = todayString + index;
				const spclSlcnDcsbSbmsnDtlVO = {
					'syr': dcsbMapList[i]['SYR'],
					'unvCd': dcsbMapList[i]['UNV_CD'],
					'dcsbRcmtMmntCd': dcsbMapList[i]['DCSB_RCMT_MMNT_CD'],
					'dcsbSlcnTypeCd': dcsbMapList[i]['DCSB_SLCN_TYPE_CD'],
					'dcsbCycl': dcsbMapList[i]['DCSB_CYCL'],
					'exno': dcsbMapList[i]['EXNO'],
					'dcsbDocId': dcsbMapList[i]['DCSB_DOC_ID'],
					'issuYn': 'Y',
					'prslYn': 'N',
					'dwnldYn': 'N',
					'rlvtYn': dcsbMapList[i]['RLVT_YN'],
					'rcptnYn': 'N',
					'fileId': '',
					'dcsbSttsCd': '30',
					'dmndCn': '',
					'rcptnFilePath': '',
					'rcptnDt': '',
					'prslDt': '',
					'sbmsnYn': 'Y',
					'sbmsnDt': todayString,
					'rsbmDt': '',
					'elcfEdocId': edocId,
					'elcfDocPrslNo': index,
					'elcfAplyId': '',
					'elcfAplyYn': '',
					'atchFileLst': null,
				}
				await fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlAfterApprovalEdoc.do", spclSlcnDcsbSbmsnDtlVO, function() {
					isProcessed = true;
				});
			}
		}
		catch(e) {
			alert("서류제출 중 오류가 발생하였습니다.");
			console.log(e);
			$("#loadingAction").hide();
		}
	}
	$("#loadingAction").hide();
	if(isProcessed) {
		alert("서류제출이 완료되었습니다.");
		closeModal("approvalEdocPopup");
		await getAllSlcnInfo(function() {
			const slcnKeyList = Object.keys(allSlcnMap);
			for(let i in slcnKeyList) {
				// 전형 상자 갱신
				repaintSsdListWrap(slcnKeyList[i]);
				let dcsbMapList = findDcsbMapListBySlcnMapKey(slcnKeyList[i]);
				for(let j in dcsbMapList) {
					let thisDcsbKey = dcsbMapList[j]['TASK_SRVC_CD'] + '-' + dcsbMapList[j]['SYR'] + '-' + dcsbMapList[j]['UNV_CD'] + '-' + dcsbMapList[j]['EXNO'] + '-' + dcsbMapList[j]['DCSB_CYCL'];
					if(dcsbMapList[j]['DCSB_GROUP_CD'] != null && dcsbMapList[j]['DCSB_GROUP_CD'].length > 0) {
						thisDcsbKey += '-CHOICE-GROUP-' + dcsbMapList[j]['DCSB_GROUP_CD'] + '-' + dcsbMapList[j]['DCSB_DOC_ID'];
					}
					else {
						thisDcsbKey += '-COMMON-' + dcsbMapList[j]['DCSB_DOC_ID'];
					}
					// 버튼 갱신
					repaintDocActionButton(thisDcsbKey);
				}
			}
		});
		const dcsbMap = findDcsbMapListBySlcnMapKey($("input[name='approvalEdocPopupTypeItemSlcnMapKey']:eq(0)").val())[0];
		let parameter = {
			'SYR': dcsbMap.SYR,
			'UNV_CD': dcsbMap.UNV_CD,
			'DCSB_RCMT_MMNT_CD': dcsbMap.DCSB_RCMT_MMNT_CD,
			'DCSB_SLCN_TYPE_CD': dcsbMap.DCSB_SLCN_TYPE_CD,
			'DCSB_CYCL': dcsbMap.DCSB_CYCL,
			'EXNO': dcsbMap.EXNO,
		};
		await fn_axios.post("/ssd/dss/isDoneDgstfn.do", parameter, function(isDoneDgstfn) {
			if(isDoneDgstfn) {
				return;
			}
			else {
				myOpinion.popup();
			}
		});
	}
}

const myOpinion = {
	popup: async function() {
		openModal("myOpinionPopup");
	},
	close: function() {
		//TODO 설문조사 완료 후 화면 리로드
		location.reload();
	},
	send: async function() {
		if(!$("input[name='approvalEdocPopupTypeItemSlcnMapKey']:eq(0)").val()) {
			alert("만족도 대상 전형을 찾을 수 없습니다.");
			return;
		}
		let myOpinionInput = "";
		if(($("input[name='rating']:checked").val() * 1) < 10) {
			myOpinionInput = $("input[name='myOpinionInput']").val();
			if(myOpinionInput && myOpinionInput.length > 300) {
				alert("내용을 20글자 이상(300글자 이하) 입력해 주세요.");
				$("input[name='myOpinionInput']").focus();
				return;
			}
		}
		const slcnKeyList = Object.keys(allSlcnMap);
		const dcsbMapList = [];
		for(let i in slcnKeyList) {
			const dcsbMap = findDcsbMapListBySlcnMapKey(slcnKeyList[i])[0];
			dcsbMapList.push(dcsbMap);
		}
		const parameters = [];
		for(let i in dcsbMapList) {
			let parameter = {
					'SYR': dcsbMapList[i].SYR,
					'UNV_CD': dcsbMapList[i].UNV_CD,
					'DCSB_RCMT_MMNT_CD': dcsbMapList[i].DCSB_RCMT_MMNT_CD,
					'DCSB_SLCN_TYPE_CD': dcsbMapList[i].DCSB_SLCN_TYPE_CD,
					'DCSB_CYCL': dcsbMapList[i].DCSB_CYCL,
					'EXNO': dcsbMapList[i].EXNO,
					'DGSTFN_EXMN_EVL_SCR': $("input[name='rating']:checked").val(),
					'DGSTFN_EXMN_QITEM_OPNN_CN': myOpinionInput,
					'USER_ID': $("input[name='userId']").val(),
				};
			parameters.push(parameter);
		}
		await fn_axios.post("/ssd/dss/saveDgstfn.do", parameters, function(isDone) {
			if(isDone) {
				alert("완료하였습니다.");
			}
			else {
				alert("만족도 조사가 완료되지 않았습니다.");
			}
			location.reload();
		});
	},
}

let exnoCert = {
	processed: false,
	popup: function() {
		$("#popupAuthModCsatArea").html("");
		for(let slcnMapKey in allSlcnExtraInfoMap) {
			let slcnExtraInfoMap = allSlcnExtraInfoMap[slcnMapKey];
			let html = '<li class="castList" id="popupAuthModCsatArea-castList-li-' + slcnMapKey + '">';
			html 	+= '	<div class="univBox mB15 notNum">';
			html 	+= '		<p class="univName">' + slcnExtraInfoMap.ssdListWrapListContNameAreaNameUnvNm + '</p>';
			html 	+= '		<div class="rtBox">';
			html 	+= '			<div class="frmInput examNumArea ' + (slcnExtraInfoMap.ssdListWrapExnoCertYn == 'Y' ? '' : 'on') + '">';
			html 	+= '				<input type="text" class="authInput" placeholder="수험 번호 입력" name="cnAuth" id="cnAuth-' + slcnMapKey + '">';
			html 	+= '				<button type="button" class="btnCon _black provBtn" onclick="exnoCert.exec(' + '\'cnAuth-' + slcnMapKey + '\')">인증</button>';
			html 	+= '			</div>';
			html 	+= '			<p class="depTmt ' + (slcnExtraInfoMap.ssdListWrapExnoCertYn == 'Y' ? 'on' : '') + '">' + slcnExtraInfoMap.ssdListWrapListContInfoAreaDcsbRuNm + '</p>';
			html 	+= '		</div>';
			html 	+= '	</div>';
			html 	+= '	<div class="descBox glbTooltip topLtArrow">';
			if(slcnExtraInfoMap.ssdListWrapExnoCertYn == "Y") {
				html 	+= '		<p class="univAdm">' + slcnExtraInfoMap.ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm + '</p>';
				html 	+= '		<span class="tooltipCont">';
				html 	+= '			<span class="tooltipTit body3">' + slcnExtraInfoMap.ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm + '</span>';
				html 	+= '		</span>';
			}
			else {
				html 	+= '		<p class="univAdm null"></p>';
			}
			html 	+= '	</div>';
			html 	+= '</li>';
			$("#popupAuthModCsatArea").append(html);
		}
		openModal("popupAuth");
	},
	exec: async function(cnAuthId) {
		let inputExno = $("#" + cnAuthId).val();
		if(!inputExno) {
			return;
		}
		let slcnMapKey = cnAuthId.substring(7, cnAuthId.length);
		let dcsbMap = findDcsbMapListBySlcnMapKey(slcnMapKey)[0];
		const spclSlcnDcsbSbmsnDtlVO = {
			'taskSrvcCd': 'SSD',
			'syr': dcsbMap['SYR'],
			'unvCd': dcsbMap['UNV_CD'],
			'dcsbRcmtMmntCd': '',
			'dcsbSlcnTypeCd': '',
			'dcsbCycl': '',
			'exno': inputExno,
			'dcsbDocId': '',
			'issuYn': '',
			'prslYn': '',
			'dwnldYn': '',
			'rlvtYn': '',
			'rcptnYn': '',
			'fileId': '',
			'dcsbSttsCd': '',
			'dmndCn': '',
			'rcptnFilePath': '',
			'rcptnDt': '',
			'prslDt': '',
			'sbmsnYn': '',
			'sbmsnDt': '',
			'rsbmDt': '',
			'elcfEdocId': '',
			'elcfDocPrslNo': '',
			'elcfAplyId': '',
			'elcfAplyYn': '',
			'atchFileLst': null,
		};
		await fn_axios.post("/ssd/dss/selectAndUpdateExnoCertYn.do", spclSlcnDcsbSbmsnDtlVO, function(receiveVO) {
			if(receiveVO && receiveVO.exnoCertYn == "Y") {
				let slcnExtraInfoMap = allSlcnExtraInfoMap[slcnMapKey];
				if(dcsbMap['SYR'] == receiveVO.syr && dcsbMap['UNV_CD'] == receiveVO.unvCd) {
					let outerId = "#popupAuthModCsatArea-castList-li-" + slcnMapKey;
					$(outerId + " .univBox .rtBox .examNumArea").removeClass("on");
					$(outerId + " .univBox .rtBox .depTmt").addClass("on");
					$(outerId + " .descBox").html("");
					let html = "";
					html 	+= '		<p class="univAdm">' + slcnExtraInfoMap.ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm + '</p>';
					html 	+= '		<span class="tooltipCont">';
					html 	+= '			<span class="tooltipTit body3">' + slcnExtraInfoMap.ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm + '</span>';
					html 	+= '		</span>';
					$(outerId + " .descBox").html(html);
				}
				exnoCert.processed = true;
			}
		});
	},
	close: function() {
		if(exnoCert.processed) {
			location.reload();
		}
		else {
			closeModal('popupAuth');
		}
	},
	confirm: function() {
		if(exnoCert.processed) {
			location.reload();
		}
		else {
			closeModal('popupAuth');
		}
	},
}

/*
 * 수험번호 인증 n건 수험번호 미인증 n건 텍스트 갱신
 */
function refreshExnoCertCount() {
	let yesCount = 0;
	let noCount = 0;
	for(slcnKey in allSlcnExtraInfoMap) {
		let slcnExtraInfoMap = allSlcnExtraInfoMap[slcnKey];
		if(slcnExtraInfoMap.ssdListWrapExnoCertYn == "Y") {
			yesCount++;
		}
		else {
			noCount++;
		}
	}
	$("#totYCntText").html(yesCount);
	$("#totNCntText").html(noCount);
	if(noCount == 0) {
		$("#cptSchRstArea-uniRstBox")[0].style.display = "none";
	}
	$("#totRecordCntText").html(Object.keys(allSlcnExtraInfoMap).length);
}

/*
 * 특별전형 서류 발급/제출 아래의 텍스트 갱신
 */
function refreshDocumentCountText() {
	let edocCount = 0;
	let commonDocCount = 0;
	for(slcnKey in allSlcnMap) {
		const dcsbMapList = findDcsbMapListBySlcnMapKey(slcnKey);
		for(let i in dcsbMapList) {
			if(dcsbMapList[i]['PROC_CD'] != '30' && dcsbMapList[i]['DOC_SE_CD'] == '10') {
				edocCount++;
			}
			else if(dcsbMapList[i]['PROC_CD'] != '30' && dcsbMapList[i]['DOC_SE_CD'] == '20') {
				commonDocCount++;
			}
		}
	}
	$("#edocTodoCount").html(edocCount);
	$("#commonDocTodoCount").html(commonDocCount);
}

/*
 * 발급안내 팝업
 */
function openDocumentExplainPopup(content) {
	$("#documentExplainPopupContent").html(content);
	openModal("documentExplainPopup");
}

/*
 * 제출 서류 제외하기 화면 토글
 */
function toggleEdocExceptional(slcnKey) {
	if(allSlcnExtraInfoMap[slcnKey]['ssdListWrapProcCd'] == '30') {
		return;
	}
	let ssdListWrapId = "#ssdListWrap-" + slcnKey;
	let currentButtonDisplayValue = $(ssdListWrapId).find(".toggleCont .subListWrap:eq(0) .docList li:eq(0) .btnArea")[0].style.display;
	let newButtonDisplayValue = "";
	let newToggleDisplayValue = "none";
	if(currentButtonDisplayValue == "none") {
		newButtonDisplayValue = "";
		newToggleDisplayValue = "none";
	}
	else {
		newButtonDisplayValue = "none";
		newToggleDisplayValue = "";
	}
	let subListWrapList = $(ssdListWrapId).find(".toggleCont .subListWrap");
	for(let i = 0; i < subListWrapList.length; i++) {
		let liList = subListWrapList.eq(i).find(".docList li");
		for(let j = 0; j < liList.length; j++) {
			liList.eq(j).find(".btnArea")[0].style.display = newButtonDisplayValue;
			liList.eq(j).find(".cptToggle")[0].style.display = newToggleDisplayValue;
		}
	}
	$(ssdListWrapId).find(".toggleCont .subListWrap:eq(0) .titleArea .linkArea")[0].style.display = newButtonDisplayValue;
	$(ssdListWrapId).find(".toggleCont .subListWrap:eq(0) .titleArea .btnArea")[0].style.display = newToggleDisplayValue;
}

/*
 * 제출 서류 제외하기 상태 저장 (전형내 문서 모두)
 */
async function saveToggleEdocExceptionalSlcn(slcnKey) {
	const dcsbMapList = findDcsbMapListBySlcnMapKey(slcnKey);
	let isProcessed = false;
	for(let i in dcsbMapList) {
		let choiceString = dcsbMapList[i]['DCSB_GROUP_CD'] == null ? "COMMON" : "CHOICE-GROUP-" + dcsbMapList[i]['DCSB_GROUP_CD'];
		let checkboxId = '#chk11-' + dcsbMapList[i]['SYR'] + '-' + dcsbMapList[i]['UNV_CD'] + '-' + dcsbMapList[i]['EXNO'] + '-' + dcsbMapList[i]['DCSB_CYCL'] + '-' + choiceString + '-' + dcsbMapList[i]['DCSB_DOC_ID'];
		let rlvtYn = $(checkboxId).prop("checked") ? 'N' : 'Y';
		const spclSlcnDcsbSbmsnDtlVO = {
			'syr': dcsbMapList[i]['SYR'],
			'unvCd': dcsbMapList[i]['UNV_CD'],
			'dcsbRcmtMmntCd': dcsbMapList[i]['DCSB_RCMT_MMNT_CD'],
			'dcsbSlcnTypeCd': dcsbMapList[i]['DCSB_SLCN_TYPE_CD'],
			'dcsbCycl': dcsbMapList[i]['DCSB_CYCL'],
			'exno': dcsbMapList[i]['EXNO'],
			'dcsbDocId': dcsbMapList[i]['DCSB_DOC_ID'],
			'rlvtYn': rlvtYn,
		}
		await fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlForRlvtYn.do", spclSlcnDcsbSbmsnDtlVO, function(data) {
			if(data.rlvtYn) {
				isProcessed = true;
				dcsbMap['RLVT_YN'] = rlvtYn;
			}
		});
	}
	if(isProcessed) {
		repaintSsdListWrap(slcnKey);
		$("input[name='allSlcnMapString']").val(JSON.stringify(allSlcnMap)); // 모든 전형 및 문서 상태 저장
	}
}

/*
 * 제출 서류 제외하기 상태 저장 (문서 하나)
 */
async function saveToggleEdocExceptionalDcsb(dcsbKey) {
	const dcsbMap = findDcsbMap(dcsbKey);
	let checkboxId = '#chk11-' + dcsbKey;
	let rlvtYn = $(checkboxId).prop("checked") ? 'N' : 'Y';
	const spclSlcnDcsbSbmsnDtlVO = {
		'syr': dcsbMap['SYR'],
		'unvCd': dcsbMap['UNV_CD'],
		'dcsbRcmtMmntCd': dcsbMap['DCSB_RCMT_MMNT_CD'],
		'dcsbSlcnTypeCd': dcsbMap['DCSB_SLCN_TYPE_CD'],
		'dcsbCycl': dcsbMap['DCSB_CYCL'],
		'exno': dcsbMap['EXNO'],
		'dcsbDocId': dcsbMap['DCSB_DOC_ID'],
		'rlvtYn': rlvtYn,
	}
	await fn_axios.post("/ssd/dss/saveSpclSlcnDcsbSbmsnDtlForRlvtYn.do", spclSlcnDcsbSbmsnDtlVO, function(data) {
		if(data.rlvtYn) {
			let slcnKey = "";
			if(dcsbKey.indexOf('COMMON') > -1) {
				slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('COMMON') - 1);
			}
			else {
				slcnKey = dcsbKey.substring(0, dcsbKey.indexOf('CHOICE') - 1);
			}
			const ssdListWrapProcCd = allSlcnExtraInfoMap[slcnKey].ssdListWrapProcCd;
			const dcsbMapList = findDcsbMapListBySlcnMapKey(slcnKey);
			let slcnProcCdNumber = 30;
			for(let i in dcsbMapList) {
				if(dcsbMapList[i]['PROC_CD'] && (dcsbMapList[i]['PROC_CD'] * 1 < slcnProcCdNumber)) {
					slcnProcCdNumber = dcsbMapList[i]['PROC_CD'] * 1;
				}
			}
			if(ssdListWrapProcCd != (slcnProcCdNumber + "")) { // 제출 서류 제외하기 결과 해당 전형의 전체 제출상태가 변경된 경우 전형의 DIV 화면 갱신
				repaintSsdListWrap(slcnKey);
			}
			dcsbMap['RLVT_YN'] = rlvtYn;
			$("input[name='allSlcnMapString']").val(JSON.stringify(allSlcnMap)); // 모든 전형 및 문서 상태 저장
			repaintDocActionButton(dcsbKey);
		}
	});
}

/*
 * 제출 서류 제외하기 물음표 팝업
 */
function openRlvtYnExplainPopup() {
	openModal('rlvtYnExplainPopup');
}

/*
 * 전체 전형 정보 수신 {'allSlcnMap': allSlcnMap, 'allSlcnExtraInfoMap': allSlcnExtraInfoMap}
 */
async function getAllSlcnInfo(callback) {
	await fn_axios.post("/ssd/dss/getAllSlcnInfo.do", null, function(allSlcnInfo) {
		allSlcnMap = allSlcnInfo.allSlcnMap;
		allSlcnExtraInfoMap = allSlcnInfo.allSlcnExtraInfoMap;
		$("input[name='allSlcnMapString']").val(JSON.stringify(allSlcnMap));
		$("input[name='allSlcnExtraInfoMapString']").val(JSON.stringify(allSlcnExtraInfoMap));
		if(callback) {
			callback();
		}
	});
}

/*
 * 전형 상자 화면 갱신
 */
function repaintSsdListWrap(slcnKey) {
	let ssdListWrapId = "#ssdListWrap-" + slcnKey;
	let ssdListWrapDivClass = "ssdListWrap ";
	if(allSlcnExtraInfoMap[slcnKey]['ssdListWrapExnoCertYn'] == 'N') { // 수험번호 인증
		ssdListWrapDivClass += 'cnAuth';
	}
	else {
		if(allSlcnExtraInfoMap[slcnKey]['ssdListWrapProcCd'] == '30') { // 제출완료
			ssdListWrapDivClass += 'complete';
		}
		else if(allSlcnExtraInfoMap[slcnKey]['ssdListWrapProcCd'] == '20') { // 제출준비
			ssdListWrapDivClass += 'ready';
		}
		else { // 제출대기
			ssdListWrapDivClass += '';
		}
	}
	$(ssdListWrapId)[0].className = ssdListWrapDivClass;
	const ssdListWrapListHeaderStateText = allSlcnExtraInfoMap[slcnKey].ssdListWrapListHeaderStateText;
	$(ssdListWrapId).find(".listHeader .state").html(ssdListWrapListHeaderStateText);
}

/*
 * 문서 버튼 화면 갱신 (개별 증명서 신청 / 발급완료 / 업로드 / 업로드완료 / 해당없음)
 */
function repaintDocActionButton(dcsbKey) {
	let btnArea = $("#btn_" + dcsbKey).parent();
	let currentButton = $("#btn_" + dcsbKey);
	let dcsbMap = findDcsbMap(dcsbKey);
	let html = "";
	if(dcsbMap['RLVT_YN'] == 'Y') { // 해당없음
		html = '<button type="button" class="btnCon _disabled" id="btn_' + dcsbKey + '" disabled>해당없음</button>';
	}
	else {
		if(dcsbMap['PROC_CD'] == '10') { // 제출준비
			if(dcsbMap['RSBM_DT'] != null && dcsbMap['RSBM_DT'].length > 0) { // 제제출
				if(dcsbMap['DOC_SE_CD'] == '10') { // 전자증명서
					html = '<div class="glbTooltip topRtArrow">';
					html += '	<button type="button" class="btnCon _strokePoint" id="btn_' + dcsbKey + '" onclick="openRequestEdocPopup(\'edoc\', \'' + dcsbKey + '\')"><i class="ico _infoPointSvg"></i> 재제출</button>';
					html += '	<span class="tooltipCont">';
					html += '		<span class="tooltipTit body3">재제출 사유입니다. 재제출 사유입니다. 재제출 사유입니다. 재제출 사유입니다. 재제출 사유</span>';
					html += '	</span>';
					html += '</div>';
				}
				else { // 일반문서
					html = '<div class="glbTooltip topRtArrow">';
					html += '	<button type="button" class="btnCon _strokePoint" id="btn_' + dcsbKey + '" onclick="openCommonFileUploadPopup(\'' + dcsbKey + '\')"><i class="ico _infoPointSvg"></i> 재제출</button>';
					html += '	<span class="tooltipCont">';
					html += '		<span class="tooltipTit body3">재제출 사유입니다. 재제출 사유입니다. 재제출 사유입니다. 재제출 사유입니다. 재제출 사유</span>';
					html += '	</span>';
					html += '</div>';
				}
			}
			else { // 제출준비 재제출 아님
				if(dcsbMap['DOC_SE_CD'] == '10') { // 전자증명서
					html = '<button type="button" class="btnCon _strokeGreen" id="btn_' + dcsbKey + '" onclick="openRequestEdocPopup(\'edoc\', \'' + dcsbKey + '\')">개별 증명서 신청</button>';
				}
				else { // 일반문서
					html = '<button type="button" class="btnCon _strokeGreen" d="btn_' + dcsbKey + '" onclick="openCommonFileUploadPopup(\'' + dcsbKey + '\')">업로드</button>';
				}
			}
		}
		else { // 발급완료 또는 업로드완료
			if(dcsbMap['DOC_SE_CD'] == '10') { // 전자증명서
				html = '<button type="button" class="btnCTA _confirm" id="btn_' + dcsbKey + '" >발급완료</button>';
			}
			else { // 일반문서
				html = '<button type="button" class="btnCTA _confirm" id="btn_' + dcsbKey + '" >업로드완료</button>';
			}
		}
	}
	currentButton.remove();
	btnArea.append(html);
}




/* 스크립트 추가 부분 시작*/


/* 알림/공지사항 상세페이지 이동*/
function fnMoveDetailPage(type, cd){
	switch(type){
		case "alarm":
			$("#alarmFrm").attr("action","/ssd/alm/ssdAlarmView.do?menuId=PCSSDALM1000");
			$("#alarmFrm").submit();
			break;
		case "notice":
			if(!cd) return;
			$("#noticeDcsbBbsId").val(cd);
			$("#noticeFrm").attr("action","/ssd/san/ssdNoticeDetail.do?menuId=PCSSDBBS1100");
			$("#noticeFrm").submit();
			break;
	};
};


/* 구분코드(002), 대학코드, 대학명, 전형명  */
/* 서류제출 문의하기 팝업*/
function fnPopUpDcmnEqryView(map) {
    let formData = new URLSearchParams();
    formData.append('dcsbBbsSeCd', '002'); //고정값 002
    formData.append('unvCd', '0000063');   //대학코드 map에 없음
    formData.append('unvNm', map.ssdListWrapListContNameAreaNameUnvNm); //대학명
    formData.append('apctInfoCn', map.ssdListWrapListContInfoAreaDcsbSlcnTypeCdNm); //전형
    fn_axios.post(
        '/ssd/mqh/eqryForm.do', // 팝업 HTML 교체
        formData,
        function (data) {
            // fragment 교체
            $('#dcmntEqryForm').replaceWith(data);
            // 모달 오픈
            openPopup('dcmntEqryForm');
        }
    );
}


/* 서류제출 확인증 표시*/
function fnSbmsnIdnty(map){
	$("#idntyUnvCd").val("0000046"); //학교코드
	$("#idntyDiNo").val("SECUJ000001"); //DI $("#diNo").val()
	$("#idntyDcsbRcmtMmntCd").val("A"); //모집시기코드
	$("#idntyDcsbSlcnTypeCd").val("J0000046A01");//전형코드
	$("#idntyDcsbCycld").val("1");//차수 map.ssdListWrapDcsbCycl

	openPopup('sbmsnIdntyForm');

	// fn_axios.post(
    //     '/ssd/dss/dcmntSbmsnIdnty.do',
    //     $("#idntyFrm").serialize(),
    //     function (data) {
    //         $('#sbmsnIdntyForm').replaceWith(data);
    //         openPopup('sbmsnIdntyForm');
    //     }
    // );
}