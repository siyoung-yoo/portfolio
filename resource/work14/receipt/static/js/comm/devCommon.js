/*
 * 2023-07
 * 대학입학포털 어디가
 * 개발 공통 사용자 함수
 * https://adiga.kr
 */

/* 로그인 페이지 이동 */
function fnLogin(){
	location.href="/mbs/log/mbsLogView.do?menuId=PCMBSLOG1000";
}

/* 로그인 페이지 이동 */
function fnLoginCallBack(){
	let preUrl = "preUrl="+encodeURIComponent(window.location.href);
	location.href = "/mbs/log/mbsLogView.do?menuId=PCMBSLOG1000&"+preUrl;
}

/* 메인 페이지 이동 */
function fnMain(){
	location.href="/man/inf/mainView.do?menuId=PCMANINF1000";
}



/**
 * i18n message properties resolver
 * @see MessageUtils.java
 */
function i18nMessage(key, ...args) {
	if(typeof $.i18n.map === 'object' && Object.keys($.i18n.map).length == 0) {
		$.i18n.properties({
			name:'message-common', 
			path:'/static/messages/',
			mode:'map',
			language: 'ko'
		});
	}
	
	if(args.length !== 0) {
		args = args.map(v => v = $.i18n.prop(v));
		const message = $.i18n.prop(key, args);
		return replaceMessageParticle(message, args[0]);
	} else {
		return $.i18n.prop(key);
	}
}

/**
 * 메세지 조사 처리
 * @param message: 전체 메세지. ex)비밀번호을 입력해주세요.
 * @param field: 조사가 붙을 명사. ex)비밀번호
 * @returns ex)비밀번호를 입력해주세요.
 * @example alert(replaceMessageParticle('비밀번호을 입력해주세요.', '비밀번호'));
 * @class MessageUtils.java
 */
function replaceMessageParticle(message, field) {
	if(!message) {
		return '';
	} else if(!field) {
		return message;
	}
	
	const pattern = new RegExp('^[ㄱ-ㅎ가-힣]*$');
	if(!pattern.test(field.substring(field.length -1, field.length))) {
		return message;
	}
	
	var pos = message.indexOf(field);
	var particle = message.substring(pos + field.length, pos + field.length + 1);
	if(particle) {
		return message.replace(field + particle, replaceParticle(field, particle));
	}
	return message;
}

function replaceParticle(field, particle) {
	const lastChar = field.charCodeAt(field.length - 1);
	const isThereLastChar = (lastChar - 0xac00) % 28;
	
	const pa = ['은', '을', '이', '과'];
	const pb = ['는', '를', '가', '와'];

	var index = pa.findIndex((el, i, arr) => el === particle);
	if(index == -1) {
		index = pb.findIndex((el, i, arr) => el === particle);
	}
	
	if(index == -1) {
		return field + particle;
	} else {
		if(isThereLastChar) {
			return field + pa[index];
		} else {
			return field + pb[index];
		}		
	}
}

/* custom select 박스 선택 함수 
 * 파라미터 설명 
   1) element : this element
   2) value : input type=hidden에 넣을 value 값
*/
function fnSelTypeSet(element, value) {
	const hiddenInput = element.parentElement.parentElement.querySelector('input');
	hiddenInput.value = value;
	
	const selCustBtn = element.parentElement.parentElement.parentElement.parentElement.querySelector('.selCustBtn');
	const html = element.querySelector('a').innerHTML;
	selCustBtn.textContent = html;
	
	const optArea = element.parentElement.parentElement.parentElement.parentElement.querySelector('.optArea');
	optArea.style.display = 'none';
	optArea.parentElement.classList.remove('on');
}

/* 숫자만 입력 나머지 replace ""
 * 파라미터 설명 
   1) element : this element
*/
function fnOnlyNum(element){
	element.value = element.value.replace(/[^0-9]/g,'');
}

/* 숫자 및 소수점만 입력 나머지 replace ""
 * 파라미터 설명 
   1) element : this element
*/
function fnOnlyNumAndDot(element){
	element.value = element.value.replace(/[^-\.0-9]/g,'');
}

/* 숫자 영어 입력 나머지 replace ""
 * 파라미터 설명 
   1) element : this element
*/
function fnOnlyEngNum(element){
	element.value = element.value.replace(/[^-a-zA-Z0-9-_-]*$/,'');
}

/* 숫자만 입력 나머지 replace "" + 천단위 콤마
 * 파라미터 설명 
   1) element : this element
*/
function fnOnlyNumComma(element) {
	element.value = element.value.replace(/[^0-9]/g,'');
	if(element.maxLength != -1 && element.value.length >= element.maxLength) {
		element.value = element.value.slice(0, element.maxLength - 1);
	}
	element.value = element.value.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

/* 한글만 replace ""
 * 파라미터 설명 
   1) element : this element
*/
function fnReplaceKorean(element) {
	element.value = element.value.replace(/[ㄱ-힣·ᆢ]/gi,'');
}

/* 한글만 입력
 * 파라미터 설명 
   1) element : this element
*/
function fnOnlyKorean(element) {
	element.value = element.value.replace(/[^ㄱ-힣·ᆢ]/gi,'');
}

/*
	허용문자외 입력 금지
	허용문자 : 한글, 영어, 숫자, 공백, 특수문자 : \{\}\[\]\(\)<>/\-\+_\.,:\*&#;ⅰ-ⅹⅠ-Ⅹㆍᆞ•․
*/
function fnReplaceTypo(element){
	element.value = element.value.replace(/[^가-힣a-zA-Z0-9\s\{\}\[\]\(\)<>/\-\+_\.,:\*&#;ⅰ-ⅹⅠ-Ⅹㆍᆞ•\․]/g, '');
} 


/* escape 처리된 text를 unescape 처리
 * 파라미터 설명 
   1) text : unescape 처리 할 내용
*/
function fnUnescapeHtml(text) {
	var doc = new DOMParser().parseFromString(text, "text/html");
	return doc.documentElement.textContent;
}

/*
	숫자여부 판단
*/
function fnIsOnlyNum(selector){
	let regex = /[^0-9]/g;
	return regex.test($(selector).val());
}

function fnPageMove(uri){
	location.href = uri;
}

/* 공통 파일 다운로드 (단건)
 * 파라미터 설명 
   1) fileId : 첨부파일 ID (필수)
   2) fileSn : 첨부파일 SN (필수)
 */
function fnFileDownOne(fileId, fileSn) {
	const urlParams = new URL(location.href).searchParams;
	const menuId = urlParams.get('menuId');

	const url = '/cmm/com/file/fileDown.do?fileId=' + fileId + '&fileSn=' + fileSn+'&menuId='+menuId;
	fnDownload(url);
}

/* 대학정보 파일 다운로드 (단건)
 */
function fnUnvFileDownOne(fileId, fileSn, downLogYn, unvCd, syr) {
	const urlParams = new URL(location.href).searchParams;
	const menuId = urlParams.get('menuId');

	const url = '/cmm/com/file/fileDown.do?fileId=' + fileId + '&fileSn=' + fileSn+'&menuId='+menuId + '&downLogYn=' + downLogYn + '&unvCd=' + unvCd + '&searchSyr=' + syr;
	fnDownload(url);
}

/* 파일 다운로드
 * 파라미터 설명 
   1) url : 파일소스 URL
 */

let isProcessingFileDownOne = false;
function fnDownload(url) {
	
	if (isProcessingFileDownOne) return;
	if(!url) return;

    isProcessingFileDownOne = true;
	$.ajax({
		url: url,
		cache: false,
		beforeSend: function (xhr) {
			$("#loadingAction").show();
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        },
		xhrFields: {
			responseType: 'blob'
		},
        success: function(blob, status, xhr){
        
       
			const disposition = xhr.getResponseHeader("Content-Disposition");
			if(disposition && disposition.indexOf("attachment") !== -1) {
				var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
	            var matches = filenameRegex.exec(disposition);
	            if(matches != null && matches[1]) {
					fileName = decodeURI(matches[1].replace(/['"]/g, ""));
	            }
				if(!fileName) {
					fileName = disposition.split('filename=')[1];	
					fileName = fileName.replace(/"/g, '');
				}
	        }
			if(window.navigator && window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(blob, fileName);
	        } else {
	            var URL = window.URL || window.webkitURL;
	            var downloadUrl = URL.createObjectURL(blob);

	            if(fileName) {
					var a = document.createElement("a");
					a.href = downloadUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
	            } else {
	                window.location.href = downloadUrl;
	            }
	            
	            URL.revokeObjectURL(downloadUrl);
	        }
	        isProcessingFileDownOne = false;
	        
	        $("#loadingAction").hide();
        },
        error: function(error){
        	//console.error('file download error: ', error);
	        isProcessingFileDownOne = false;
        	alert('파일을 찾을 수 없습니다.');
        	$("#loadingAction").hide();
        }
	});	
	
}
 


/* 공통게시판 조화수 증가 함수
 * 파라미터 설명 
   1) prtlBbsId : 게시글 ID 값
   2) callback : 콜백함수
 */
function fnBoardInqCnt(prtlBbsId, callback) {

	const formData = new FormData();
	formData.append("prtlBbsId", prtlBbsId);

	fn_axios.post(
		"/cmm/com/board/boardSave.do"
		, formData
		, function(fragment){
			callback();
		}
	);
}

/* 공통 답변 게시판 조화수 증가 함수
 * 파라미터 설명 
   1) ansBbsId : 게시글 ID 값
   2) callback : 콜백함수
 */
function fnAnsBoardInqCnt(ansBbsId, callback) {

	const formData = new FormData();
	formData.append("ansBbsId", ansBbsId);
	
	fn_axios.post(
		"/cmm/com/board/ansBoardSave.do"
		, formData
		, function(fragment){
			callback();
		}
	);
}
/* 
 * 링크에 http가 없다면 http를 붙여서 새창에서 링크 열기 
 * 파라미터 설명 
 * 1) url : 링크
*/
function fnOpenNewUrl(url){
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
    window.open(url, '_blank');
}

/**
 * 글자 수 check
 * @param obj
 * @param maxByte 
 * @returns pass 여부
 */
function fnChkByte(obj, maxByte) {

    let isPassed = true;        // pass flag
    let totalByte = 0;          // 총 byte
    let content = $(obj).val(); // 내용

    for(let i = 0; i < content.length; i++) {
        let currentByte = content.charCodeAt(i);
        if(currentByte > 128) totalByte += 3;     // 한글 3byte
        else if(currentByte == 10) totalByte += 2;    // 줄바꿈 2byte 
		else totalByte++;
    }
 
    if(totalByte > maxByte) {
        alert(`내용은 ${maxByte}byte를 넘을 수 없습니다.`);
        $(obj).focus();
        isPassed = false;
        return false;
    }

    return isPassed;
}

/* 
 * 임시 form생성하여 submit
 * 파라미터 설명 
 * 1) url : action url
 * 2) formData: formData
*/
function fnFormDataSubmit(url, formData) {
    var form = document.createElement("form");
    form.method = "post";
	for(let [name, value] of formData) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
	}
	document.body.appendChild(form);
	form.action = url;
	form.submit();
	document.body.removeChild(form);
}


//common.js 커스텀 셀렉트 수정
//커스텀 셀렉트 외부영역 클릭 시 열린 셀렉트 닫기
$(document).mouseup(e => {
	const $selector = $(".optArea, .spCase_optArea").parent().filter((i, el) => $(el).find($(e.target)).length == 0);	//target selector는 제외
	$selector.removeClass('on');
	$selector.children('.optArea').slideUp('fast');
	$selector.children('.spCase_optArea').fadeOut('fast');
});

/* ubi Report 호출 */
function fnUbiReport(frmId){
	const frm = document.getElementById(frmId);
	
	//csrf
	var mapInput = document.createElement("input");
	mapInput.type = 'hidden';
    mapInput.name = '_csrf';
    mapInput.value = $("meta[name='_csrf']").attr("content");
    frm.appendChild(mapInput);
    
	frm.action = '/cmm/com/report/callUbiReport.do';
	frm.target = '_blank';
	frm.submit();
}

/** file 미리보기 */
// fid: File ID, filePath: File Download URL
function fnPreview(fileId, filePath, serverAddress) {

	// 로컬테스트용 도메인 변경
	//filePath = filePath.replace('http://localhost:8080/', "https://beta.adiga.kr/");	
	
	const urlParams = new URL(location.href).searchParams;
	const menuId = urlParams.get('menuId');
	
	var srvTp = "OPR";			
	if(filePath.indexOf("beta.adiga.kr") > 0) srvTp = "DEV";
	var contextPath = "/SynapDocViewServer/";
	var requestUrl;
	
	var params = {
		filePath: filePath, // File Download URL
		fileType: "URL",
		fid: srvTp +"_"+ menuId + "_" +fileId,
		convertType: "0",
		urlEncoding: "UTF-8"
	}
	
	$.ajax({
		type: "POST",
		url: serverAddress+"/SynapDocViewServer/jobJson", // Server Address Setting
		data: params,
		contentType: "application/x-www-form-urlencoded",
		dataType: "json",
		cache: false,
		async: false,
		error: function(request, status, error) {
			if(request.responseJSON){
				alert(request.responseJSON.msg.replace(/<BR>/g, '\n'));
			}else{
				alert('문서변환중 오류가 발생 하였습니다. 관리자에게 문의 바랍니다.');
			}			
		},
		success: function (data) {
			/* 문서뷰어 중복 호출 되지 않도록 수정  */
			// Server Address Setting
			requestUrl = serverAddress+"/SynapDocViewServer/viewer/doc.html"
				+ "?key=" + data.key 
				+ "&contextPath=" + contextPath;
		}
	});
	
	if(requestUrl) window.open(requestUrl, "preview");
	
	
}

//욕설방지 전송
function fnNetiSend(formId, callback, globalsType){
	
	if("local" == globalsType){
		callback();
		return;
	}
	
	var netiformData = new FormData($(formId)[0]);
	
	$.ajax({
        url: "/neti/afsajax",
        type: "POST",
        data: netiformData,
		dataType: "json",
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        success: function(res){
			
            if(res.resultCode != "200"){
				createWinMsg(res.resultMsg);
				return false;
			}
			
			callback();
        },
        error: function(error){
			return false;
        }
    });

}

  
function createWinMsg(resultMsg) {
    var dhxWins;
    dhxWins = new dhtmlXWindows();
    dhxWins.attachViewportTo("frm"); // Wehre
    var winMsg = dhxWins.createWindow("winMsg", 150, 150, 500, 420);
    winMsg.attachHTMLString(resultMsg); //Message
    winMsg.denyResize(); // Resize
    winMsg.denyPark(); // Park
    winMsg.setModal(true); //Modal
}

/* 
 * 이메일 RFC 5322 형식 정규식 검사
 * 파라미터 설명 
 * 1) jquery selector 
 * ex) #email / .email / input[name=emlAddr]
 * 조건부
 * 1) 이메일 전문 문자열 검사
 * 2) 이메일 앞, 뒤 배열로 2개 일시 중간에 @넣어서 concat후 검사
*/
function emailRegexTest(selector){
	let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
	if($(selector).length == 1){
		return regex.test($(selector).val());
	} else if ($(selector).length == 2){
		let concatEmail = $(selector).eq(0).val() + "@" +$(selector).eq(1).val();
		return regex.test(concatEmail);
	}
}



//드롭다운 닫기
function fnSelDropdown(_this) {
	var $selector = $(_this).closest('.optArea, .spCase_optArea');
	$selector.hide();
	
	var $btn = $selector.parent().find('button');
	$btn.text($(_this).children().text());
	$btn.parent().removeClass("on");
}

   // OCR 에러메세지 얻기 
function fnGetOcrErrorMessage(errorCode){ 
	var errMsg = ""; 
  	switch(errorCode){ 
   		case '01' :  
	    	errMsg = "현재 제출하신 양식은 지원되지 않습니다. \r\n발급처(입력 가이드 참고)를 확인 하시고 문제가 계속 발생한다면, \r\n관리자에게 문의해 주시기 바랍니다."; 
	    	break; 
	   case '02' : 
	    	errMsg = "처리 과정에서 문제가 발생했습니다. \r\n잠시 후에 다시 시도해 주세요. \r\n문제가 계속 발생한다면, 관리자에게 문의해 주시기 바랍니다."; 
	    	break; 
	   case '03' : 
	    	errMsg = "파일을 읽는중 문제가 발생 하였습니다. \r\n(문서 암호화 또는 문서 비밀번호 여부 확인 하시기 바랍니다.)"; 
	    	break; 
	} 
 	return errMsg; 
 }
/*
    업로드 파일사이즈 최소, 최대 크기 체크
   param 
   	- compKn : 비교 구분(min : 최소 크기, max : 최대 크기)
   return
    - false : 최소 크기보다 클때, 최대 크기보다 작을때
	- true  : 최소 크기보다 작을때, 최대 크기보다 클때
*/
function fnIsUploadFileSize(compKn, fileSz, compSz){
	var isRtn = true;	
	
	if(compKn == "min") return (fileSz < compSz) ? true : false;
	else if(compKn == "max") return (fileSz > compSz) ? true : false;	
	
	return isRtn;
}
 
 //XSS패턴 포함여부 확인
function fnContainXSS(input){
	const patterns = [ /<script\b[^>]*>(.*?)<\/script>/gi,  // <script> 태그 전체
		    /<\/?script\b[^>]*>/gi,             // <script> 태그 시작/종료
		    /<embed\b[^>]*>/gi,                 // <embed> 태그
		    /eval\((.*?)\)/gi,                  // eval() 함수
		    /expression\((.*?)\)/gi,            // CSS expression()
		    /javascript:/gi,                    // javascript:
		    /vbscript:/gi,                      // vbscript:
		    /onload\s*=\s*(["']?)(.*?)\1/gi,    // onload 이벤트
		    /onerror\s*=\s*(["']?)(.*?)\1/gi,   // onerror 이벤트
		    /href\s*=\s*(["'])(.*?)\1/gi,       // href 속성
		    /src\s*=\s*(["'])(.*?)\1/gi,         // src 속성
		    /<\s*(div|a|iframe|p|span|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|form|input|button|textarea|select|option|label|img|br|hr|strong|em|b|i|u|pre|code)\b[^>]*>/gi //많이 사용되는 html태그
					 ];
	for (let pattern of patterns) {
        if (pattern.test(input)) {
            return true;
        }
    }
    return false;
}
 
//XSS패턴 포함여부 확인(AI대화형)
function fnContainXSS2(input){
	const patterns = [ /<script\b[^>]*>(.*?)<\/script>/gi,	// <script> 태그 전체
		    /<\/?script\b[^>]*>/gi,							// <script> 태그 시작/종료
		    /<embed\b[^>]*>/gi,								// <embed> 태그
		    /eval\((.*?)\)/gi,								// eval() 함수
		    /expression\((.*?)\)/gi,						// CSS expression()
		    /javascript:/gi,								// javascript:
		    /vbscript:/gi,									// vbscript:
		    /onload\s*=\s*(["']?)(.*?)\1/gi,				// onload 이벤트
		    /onerror\s*=\s*(["']?)(.*?)\1/gi,				// onerror 이벤트
		    /href\s*=\s*(["'])(.*?)\1/gi,					// href 속성
		    /src\s*=\s*(["'])(.*?)\1/gi,					// src 속성
		    /<\s*(div|a|iframe|p|span|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|form|input|button|textarea|select|option|label|img|br|hr|strong|em|b|i|u|pre|code)\b[^>]*>/gi,	//많이 사용되는 html 태그
		    /<\/\s*(div|a|iframe|p|span|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|form|input|button|textarea|select|option|label|img|br|hr|strong|em|b|i|u|pre|code)\s*>/gi,	//많이 사용되는 html 종료 태그
		    /<\s*\/\s*>/gi,									// </> 패턴
			/<\/\s*[^>]+>/gi,								// 모든 닫는 태그 막기
			/<\s*(div|a|iframe|p|span|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|textarea|select|option|label|img|br|hr|strong|em|b|i|u|pre|code)\b[^>]*$/gi,				// 미완성 시작 태그
			/<\/\s*(div|a|iframe|p|span|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|textarea|select|option|label|img|br|hr|strong|em|b|i|u|pre|code)\s*$/gi				// 미완성 종료 태그
					 ];
	for (let pattern of patterns) {
        if (pattern.test(input)) {
            return true;
        }
    }
    return false;
}

function xssSafeInputHandler(e){ 
	if (e.type == 'blur' || e.keyCode == 13){  
    	if( fnContainXSS($(this).val()) ){  
   			$(this).val("");  
  		}else{
  			$(this).val(jQuery.trim($(this).val().replaceAll("\"","").replaceAll("'","")));
  			if($(this).val().length > 30){
  				$(this).val($(this).val().substr(0,30));
  			}
  		}
    }  
} 

//XSS 검증  
$(window).on('load', function(){  

	$('.XSSSafeInput').each(function(){
		 const element = $(this)[0]; 
		 const elementFunction = $(element).prop('onkeypress'); 
		 const $form = $(element).parents('form')[0]; 
		  
		 // 기존 이벤트 삭제 
		 $(element).prop('onkeypress', ''); 
		  
		 element.addEventListener('blur', xssSafeInputHandler); 
		 element.addEventListener('keydown', xssSafeInputHandler); 
		 element.addEventListener('keydown', elementFunction); 
		  
		 // form submit() 방지 
		 if($form != null) $form.addEventListener("submit", (event) => { event.preventDefault();}); 
	});
});  




/* html escape 처리 */  
function fnEscapeHtml(input) {  
    return input  
        .replace(/&/g, "&amp;")  
        .replace(/</g, "&lt;")  
        .replace(/>/g, "&gt;")  
        .replace(/"/g, "&quot;")  
        .replace(/'/g, "&#x27;")  
        .replace(/\//g, "&#x2F;");  
}









/*

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

//숫자만 입력 확인: 정수 + 범위 
function isNum(_this, min, max){
	if(!_this.value) {
		return true;	
	}
	
	const regex = /^[0-9]*$/;
	const repRegex = /[^0-9]/g;	

	if(!regex.test(_this.value)) {
		alert("숫자만 입력가능합니다.");
		_this.value = _this.value.replace(repRegex, "");
		_this.focus();
		return false;
	} else {
		if(typeof min === 'number' && typeof max === 'number'){
			var v = Number(_this.value);
			if(v < min || v > max) {
				_this.value = _this.value.substring(0, (max-1).toString().length);
                alert(min + ' ~ ' + max + ' 사이의 값만 입력 가능합니다.');
                _this.focus();
				return false;
			}
		}
	}
	return true;
}
	
//숫자만 입력 확인: 실수 + 범위 
function isNum2(_this, min, max){
	if(!_this.value) {
		return true;	
	}
		
	const regex = /^[0-9.]*$/;
	const repRegex = /[^0-9.]/g;	

	if(!regex.test(_this.value)) {
		alert("숫자만 입력가능합니다.");
		_this.value = _this.value.replace(repRegex, "");
		_this.focus();
		return false;
	} else {
		if(typeof min === 'number' && typeof max === 'number'){
			var v = Number(_this.value);
			if(v < min || v > max) {
				_this.value = _this.value.substring(0, (max-1).toString().length);
                alert(min + ' ~ ' + max + ' 사이의 값만 입력 가능합니다.');
                _this.focus();
				return false;
			}
		}
	}
	return true;
} 

//숫자 여부	
function isNotNum(number1, number2) {
     if(!($.isNumeric(number1)) || !($.isNumeric(number2))) {
         return false;
     }
     else {
         if(number1 == 0 && number2 == 0) {
             return false;
         }
         return true;
     }
} 	
*/


//중복방지 함수
function fnThrottle(throttleFunc, throttleDelay){
	let throttleTimer;
	return (...throttleArgs) => {
		if(!throttleTimer){
			throttleFunc.apply(this,throttleArgs);
		}
		clearTimeout(throttleTimer);
		throttleTimer = setTimeout(() => {
			throttleTimer = null;
		} ,throttleDelay);
	}
}

//중복방지 페이지이동 함수
function fnThrottleNavigate(throttleFunc){
	let throttleCnt = 0;
	return (...throttleArgs) => {
		if(throttleCnt < 1){
			let throttleResult = throttleFunc.apply(this,throttleArgs);
			if(throttleResult !== false) throttleCnt++;
		}
	}
}

/*
대학/전형/직업 관심버튼 중복방지
*/
function fnThrottledFavorite(...args) {
    const throttledFn = fnThrottle(fnFavorite, 300);
    throttledFn(...args);
};


//개인정보 포함 엘리먼트 처리
$(document).ready(function () {
	$('.privateField')
        .on('contextmenu', function (e) {
            e.preventDefault(); // 우클릭 방지
        })
        .on('copy cut', function (e) {
            e.preventDefault(); // 복사, 잘라내기 방지
        })
        .on('selectstart', function (e) {
            e.preventDefault(); // 선택 방지
        })
        .on("dragstart", function(e) {
            e.preventDefault(); // 드래그 방지
        });
});


//즐겨찾기 별표이미지 변경
function fnFavoriteStarChg(el){
	const id = $(el).attr("id");
	const isChecked = $(el).is(':checked');
	
 	if(isChecked){
    	$('label[for="' + id + '"]').addClass("on");
    }else{
    	$('label[for="' + id + '"]').removeClass("on");
    } 
}




/* 공통게시판 조화수 증가 함수
 * 파라미터 설명 
   1) prtlBbsId : 게시글 ID 값
   2) callback : 콜백함수
 */
function fnSsdInqCnt(prtlBbsId, callback) {

	const formData = new FormData();
	formData.append("prtlBbsId", prtlBbsId);

	fn_axios.post(
		"/cmm/com/board/ssdSave.do"
		, formData
		, function(fragment){
			callback();
		}
	);
}

/* 공통 답변 게시판 조화수 증가 함수
 * 파라미터 설명 
   1) ansBbsId : 게시글 ID 값
   2) callback : 콜백함수
 */
function fnSsdAnsBoardInqCnt(ansBbsId, callback) {

	const formData = new FormData();
	formData.append("ansBbsId", ansBbsId);
	
	fn_axios.post(
		"/cmm/com/board/ssdAnsBoardSave.do"
		, formData
		, function(fragment){
			callback();
		}
	);
}



