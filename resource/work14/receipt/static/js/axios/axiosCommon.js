
let fn_axios = {
	
	axios_defaults : {
	  	method : 'get'
	  	, responseType: 'json'
	  	, timeout : 300000
	  	, responseEncoding :'uft8'
	  	, maxRedirects : 0
	  	, data : ''
	  	, headers : {'X-Requested-With': 'XMLHttpRequest'}
	  	, showLoading : false
	  	, loadingElementId : '#loadingAction'
  	},

	config_Defaults : function(method, options){
		
		options = options || {};
		
		defaults = fn_axios.axios_defaults;
		defaults.method = method;

		
	  	for (let prop in defaults)  {
	    	options[prop] = typeof options[prop] !== 'undefined' ? options[prop] : defaults[prop];
	  	}
	  	
	  	if($("meta[name='_csrf']").length > 0){
			const token = $("meta[name='_csrf']").attr("content")
			const headerNm = $("meta[name='_csrf_header']").attr("content");
			options.headers[headerNm] = token;  
		}
	  
	 	return options;
	},
	
	get : async function getApi(url, callBackFunc, options) {
		
		const config = fn_axios.config_Defaults('get', options);
		if(config.showLoading) $("#loadingAction").show();
		
		try {
			
			let response = await axios.get(url, config);
			if(response.data.error){
				fn_axios.fn_error(response.data.error,config);
				return;
			} 
			
			if(callBackFunc) callBackFunc(response.data);
			if(config.showLoading) $("#loadingAction").hide();
			
			return true;
			
		} catch(err) {
			fn_axios.fn_error(err,config);
		}		
	},
	
	// 코난 검색엔진 전용 AXIOS : 에러창 미 출력하기 위해 작성
	get_search : async function getApi(url, callBackFunc, options) {
		
		const config = fn_axios.config_Defaults('get', options);
		if(config.showLoading) $("#loadingAction").show();
		
		try {
			
			let response = await axios.get(url, config);
			if(response.data.error){
				fn_axios.fn_error(response.data.error,config);
				return;
			} 
			
			if(callBackFunc) callBackFunc(response.data);
			if(config.showLoading) $("#loadingAction").hide();
			
			return true;
			
		} catch(err) {
			//검색엔진 프로세스 종료시에도 정상 서비스 유지하기 위해 에러메세지 미출력
		}		
	},

	post : async function postApi(url, data, callBackFunc, options) {
		
		const config = fn_axios.config_Defaults('post', options);
		if(config.showLoading) $(config.loadingElementId).show();
		try {
			
			let response = await axios.post(url, data, config);
			if(response.data.error){
				fn_axios.fn_error(response.data.error,config);
				return;
			} 
			
			if(callBackFunc) callBackFunc(response.data);
			if(config.showLoading) $(config.loadingElementId).hide();
			
			return true;
		} catch(err) {
			fn_axios.fn_error(err,config);
		}			
		
	},
	
	fn_error : function (error,config){
		
		$(config.loadingElementId).hide();

		//사용자 정의 Error
		switch(error.code) {
		  case '030':
			  
			alert('로그인이 필요한 서비스 입니다.\n로그인페이지로 이동합니다.')
			let preUrl = "preUrl="+encodeURIComponent(window.location.href);
			if(error.message.indexOf("/mnu/mnu/quickPopup.do") > -1) preUrl = "";
			
			location.href = "/com/loginView.do";
	    	break;
		
		  case '041':
			  
			alert(error.message);
			$('#' + error.field).focus();
	    	break;
		
		  case '099':
			  
			alert(i18nMessage('errors.code.internal-server-error'))
	    	break;
		
		  default:
			  
			if(error.request && error.request.status){
				fn_axios.fn_http_error(error);
	    		break;
			}
			
			if(error.code) {
				alert(error.message);
				//console.log("[" + error.code + "] ", error.message);
			} else {
				alert("에러가 발생했습니다!");	
				//console.log("error: ", error);
			}
			
		    break;
		}
		
		
	},
	
	fn_http_error : function (error){
		
		if(error.request.status == '403'){
			alert(i18nMessage('errors.code.permission-denied'));
			fnMain();
    		return;
		}
		
		if(error.request.status == '404'){
			alert(i18nMessage('errors.code.bad-request'));
			return;
		}	
	},
	
	file : async function fileApi(url, data, callBackFunc, options) {
		
		const config = fn_axios.config_Defaults('post', options);
		config.headers["Content-Type"] = "multipart/form-data";
		
		try {
			
			let response = await axios.post(url, data, config);
			if(response.data.error){
				fn_axios.fn_error(response.data.error,config);
				return;
			} 
			
			if(callBackFunc) callBackFunc(response.data);
			if(config.showLoading) $("#loadingAction").hide();
			
			return true;
			
		} catch(err) {
			fn_axios.fn_error(err,config);
		}
	}
}
