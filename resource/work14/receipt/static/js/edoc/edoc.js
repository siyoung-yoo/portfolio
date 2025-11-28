/**
116.67.75.234 test.dpaper.kr
116.67.75.234 testapi.dpaper.kr
*/

const edoc = {
	/**
	1. 개인 전자문서지갑 주소 발급 
	*/
	issueIndiECDW: {
		url: '/ssd/edoc/indi/issueIndiECDW.do',
		getDefaultBodyParameters: function() { 
			return {
				'agrmntAgreAt': '',
				'agrmntAgreDe': '',
				'prvcAgreAt': '',
				'prvcAgreDe': '',
				'birthDe': '',
				'ci': '',
				'email': '',	
				'moblphonNo': '',
				'nm': '',
				'ntvfrnrSeCode': '',
				'sexdstnCode': '',
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				ecdwAdres: 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지			
			*/
		},
	},
	/**
	 * 1-1. 개인 전자문서지갑 주소 전자서명 발급
	 */
	issueIndiSignECDW: {
		url: '/ssd/edoc/indi/issueIndiSignECDW.do',
		getDefaultBodyParameters: function() { 
			return {
				'agrmntAgreAt': '',
				'agrmntAgreDe': '',
				'prvcAgreAt': '',
				'prvcAgreDe': '',
				'birthDe': '',
				'ci': '',
				'eltsgnCi': '',
				'crtfctInsttCode': '',
				'email': '',	
				'moblphonNo': '',
				'nm': '',
				'ntvfrnrSeCode': '',
				'sexdstnCode': '',
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				ecdwAdres: 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지			
			*/
		},
	},
	/**
	2. 개인 전자문서지갑 주소 정보 변경 
	*/
	changeIndiECDWInfo: {
		url: '/ssd/edoc/indi/changeIndiECDWInfo.do',
		getDefaultBodyParameters: function() { 
			return {
				'agrmntAgreAt': '',
				'agrmntAgreDe': '',
				'prvcAgreAt': '',
				'prvcAgreDe': '',
				'ci': '',
				'ecdwAdres': '',
				'deviceId': '',
				'email': '',	
				'moblphonNo': '',
				'useAt': '',
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지			
			*/
		},
	},
	/**
	3. 개인 전자문서지갑 폐기 
	*/
	disuseIndiECDW: {
		url: '/ssd/edoc/indi/disuseIndiECDW.do',
		getDefaultBodyParameters: function() {
			return {
				'ci': '',
				'ecdwAdres': '',	
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지			
			*/
		},
	},
	/**
	5. 개인 전자문서지갑 주소 확인 
	*/
	verifyIndiECDW: {
		url: '/ssd/edoc/indi/verifyIndiECDW.do',
		getDefaultBodyParameters: function() { 
			return {
				'ci': '',
				'ecdwAdres': '',	
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				ecdwAdres: 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				ecdwTyCode: 지갑등록유형 코드
					ㆍEnum - 1: 등록 지갑 - 2: 미등록 지갑 - 3: 미등록 장치 - 4: 이용 중지 - 5: 약관 변경 - 6: 전화번호 변경 - 7: 개인정보 수집이용 재동의필요 - 8: 이용약관 및 개인정보 수집이용 재동의필요
					1: 등록지갑인 경우 정상 사용 처리, 해당 지갑앱 최초 연계시 '전자증명서 유통발급 서비스 지갑 연계'에 대한 동의를 받아 자체 관리
					2: 미등록 지갑인 경우 지갑 이용자 약관 동의 후 지갑 발급 처리(6, 1 API 활용)
					3: 미등록 장치인 경우 지갑 이용자의 APP이용장치 등록(변경) 처리(2 API 활용)
					4: 이용 중지인 경우 이용 중지 상태 표시 후 활성화 처리(2 API 활용)
					5: 약관변경인 경우 다시 지갑 이용자 동의 처리(6, 2 API 활용)
					6: 전화번호 변경인 경우 이용자에게 고지하고 API이용 기관에 이용자 전화번호 갱신 필요
					7: 개인정보 수집이용 재동의필요인 경우 개인정보 수집이용 동의 화면으로 자동 이동하여 개인정보 수집이용 재동의 절차를 진행
					8: 이용약관 및 개인정보 수집이용 재동의필요인 경우 이용약관 및 개인정보 수집이용 동의 화면으로 자동 이동하여 이용약관 및 개인정보 수집이용 재동의 절차를 진행			
			*/
		},
	},
	/**
	6. 약관동의 내용 조회
	*/
	inquireIndiStipAgree: {
		url: '/ssd/edoc/indi/inquireIndiStipAgree.do',
		getDefaultBodyParameters: function() {
			return {
				'agrmntSeCode': '',
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				agrmnts: [{
					agrmntCn: 약관동의 내용(HTML 형식)
					agrmntDe: 약관동의 등록일 (yyyyMMdd)
					agrmntNm: 약관동의 명
					agrmntSeCode: 약관동의 구분코드 ㆍ개인정보 수집, 제공, 고지 등 약관동의 유형을 구분하는 코드
				}]
			*/
		},
	},
	/**
	36. 전자증명서 발급 목록 조회
	*/
	inquireElecDocIssueList: {
		url: '/ssd/edoc/elecdoc/inquireElecDocIssueList.do',
		getDefaultBodyParameters: function() {
			return {
				'ecdwAdres': '',
				'pgngNo': '1',
				'pgngSize': '1000',
				'issuBgnde': '',
				'issuEndde': '',
				'issuTyCode': '',
				'searchSeCode': '0',
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				agrmnts: [{
					docCpcty: 전자문서 용량 ㆍ(단위 Byte)
					docId: 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
					docKndCode: 문서종류코드 ㆍdocKndCode.xlsx 파일 참조
					docKndNm: 문서 종류 명
					presentnPosblDt: 제출가능일시 (yyyyMMddHHmmss)
						ㆍ영구시 '99991231'
						ㆍ남은일 계산방법
						1: presentnPosblDt(제출가능일시)에서 시분초를 제거하여 날짜를 구한 후 -1 을 합니다.
						2: 현재 시각을 'yyyymmdd' 형식으로 구합니다.
						3: (1) - (2)로 남은 날짜 계산합니다. (시간 단위는 차감합니다.)
					disuseDocAt: 문서폐기여부 ㆍBoolean - Y: 폐기 상태 - N: 보관 상태
					validDt: 유효일시 (yyyyMMddHHmmss) ㆍ영구시 '99991231'
					issuDt: 발급일시 (yyyyMMddHHmmss)
					issuInsttCode: 발급기관
					issuInsttNm: 발급기관명
					issuTyCode: 발급유형코드 ㆍEnum - 1: 발급 - 2: 첨부
					applId: 신청 ID
					applsId: 묶음 신청 ID
					applsKndNm: 묶음 종류 명
					presentnNm: 발급자명
					docNick: 증명서 별칭
					payElcrtAt: 유료 증명서 여부 ㆍEnum - N: 무료 - Y: 유료
					presentnPosblCnt: 제출 가능 횟수 ㆍ유료 증명서인 경우에만 값 리턴 ㆍ- 0: 제출 불가 - 1 이상: 제출 가능
				}]
				totRow: 전체 행수
			*/
		},
	},
	/**
	41. 전자증명서 유통 목록 조회
	*/
	inquireElecDocDistList: {
		url: '/ssd/edoc/elecdoc/inquireElecDocDistList.do',
		getDefaultBodyParameters: function() {
			return {
				'ecdwAdres': '', // 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				'insttCode': '', // 기관 코드 ㆍ기관을 식별하는 행정표준코드 7자리
				'dbxStatsCode': '', // 유통 상태 구분 ㆍ전자증명서 유통시 사용하는 문서묶음 상태 ㆍEnum -0: 전체 -1: 제출 -2: 수취확인 -3: 반려 -4: 보내기취소 -5: 삭제 -6: 다운로드완료 -7: 수취중
				'docPackageId': '', // 문서묶음 ID ㆍ이용자가 보낼때 생성하는 문서 묶음 단위 유통 식별 코드
				'pgngNo': '', // 페이지 번호
				'pgngSize': '', // 페이지당 행수 ㆍ기본값 20
				'issuBgnde': '', // 발급 시작일(검색 조건, yyyyMMdd)
				'issuEndde': '', // 발급 종료일(검색 조건, yyyyMMdd)
				'presentnBgnde': '', // 제출 시작일(검색 조건, yyyyMMdd)
				'presentnEndde': '', // 제출 종료일(검색 조건, yyyyMMdd)
				'presentnNm': '', // 제출자명
				'birthDe': '', // 제출자 생년월일 (yyyyMMdd)
				'pinNo': '', // 문서열람번호 ㆍ지갑 이용자가 전자증명서를 보내 수취인에게 알려줄 숫자 6자리
				'presentnDe': '', // 보낸일 (yyyyMMdd) ㆍ지갑 이용자가 전자증명서를 선택하여 수취기관에 보낸 날짜
				'allBelowReceptEcdwAt': '', // 모든 하위 수취처 지갑 포함 여부 ㆍBoolean - Y: 포함 - N: 미포함
				'sortColmn': '', // 정렬 컬럼
				'dsndngAt': '', // 오름차순 여부
				'presentnAt': '', // 보낸 문서 여부
				'utlNo': '', // 이용기관 활용번호
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				distributions: [{
					birthDe: 제출자 생년월일 (yyyyMMdd)
					dbxStatsCode: 유통 상태 구분 ㆍEnum -1: 제출 -2: 수취확인 -3: 반려 -4: 보내기취소 -5: 삭제 -6: 다운로드완료 -7: 수취중
					distbDt: 유통일시 (yyyyMMddHHmmss) ㆍ전자증명서 유통 정보 상태가 마지막으로 변경된 날짜
					docCnt: 문서묶음 문서 총갯수
					docCpcty: 전자문서 용량 ㆍ(단위 Byte)
					docId: 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
					docKndCode: 문서종류코드 ㆍdocKndCode.xlsx 파일 참조
					docKndNm: 문서 종류 명
					docPackageId: 문서묶음 ID ㆍ이용자가 보낼때 생성하는 문서 묶음 단위 유통 식별 코드
					issuDt: 발급일시 (yyyyMMddHHmmss)
					issuNo: 발급기관 발급번호
					issuInsttNm: 발급기관명
					applId: 신청 ID
					applsId: 묶음 신청 ID
					applsKndNm: 묶음 종류 명
					resnMessage: 사유 ㆍ반려시 사유 메세지, 특수문자(&, <, >, ', ", /)는 HTML인코딩(&amp;, &lt;, &gt;, &#x27;, &quot;,&#x2F;)로 표시하므로 디코딩하여 사용('--'는 제거)
					presentnPosblDt: 제출가능일시 (yyyyMMddHHmmss)
					  ㆍ영구시 '99991231'
					  ㆍ남은일 계산방법
					  1: presentnPosblDt(제출가능일시)에서 시분초를 제거하여 날짜를 구한 후 -1 을 합니다.
					  2: 현재 시각을 'yyyymmdd' 형식으로 구합니다.
					  3: (1) - (2)로 남은 날짜 계산합니다. (시간 단위는 차감합니다.)
					disuseDocAt: 문서폐기여부 ㆍBoolean - Y: 폐기 상태 - N: 보관 상태
					validDt: 유효일시 (yyyyMMddHHmmss) ㆍ영구시 '99991231'
					issuTyCode: 발급유형코드 ㆍEnum - 1: 발급 - 2: 첨부
					pinNo: 문서열람번호 ㆍ개인 지갑 이용자가 전자증명서를 보내 수취인에게 알려줄 숫자 6자리
					presentnDt: 보낸일시 (yyyyMMddHHmmss)
					presentnEcdwAdres: 제출자 전자문서지갑 주소
					presentnNm: 제출자명
					receptEcdwAdres: 수취처 전자문서지갑 주소
					receptNm: 수취처명
					docNick: 증명서 별칭 ㆍ보낸 문서(presentnAt:'Y') 조회 시에만 별칭 반환
					payElcrtAt: 유료 증명서 여부 ㆍEnum - N: 무료 - Y: 유료
					presentnPosblCnt: 제출 가능 횟수 ㆍ유료 증명서인 경우에만 값 리턴 ㆍ- 0: 제출 불가 - 1 이상: 제출 가능
					cid: 본인확인 연결정보ㆍ수취API를 이용하는 기관에 제출시, 제3자정보제공동의를 한 경우 제공
					bizrNo: 사업자등록번호ㆍ법인사업자 지갑 이용자가 수취API를 이용하는 기관에 증명서 제출시 제공
				}]
				totRow: 전체 행수
				utlNo: 이용기관 활용번호 ㆍ이용기관에서 제출 시 묶음에 대해 업무활용 용도로 자유롭게 지정하는 번호
			*/
		},
	},
	/**
	42-1. 전자증명서 유통 정보 문서별 변경
	*/
	requestElecDocPresentURL: {
		url: '/ssd/edoc/elecdoc/changeElecDocPackageDistInfo.do',
		getDefaultBodyParameters: function() {
			return {
				'dbxStatsCode' : '', //유통 상태 구분 ㆍ전자증명서 유통시 사용하는 문서묶음 상태 ㆍEnum -2: 수취확인 -3: 반려 -4: 보내기취소 -6: 다운로드완료 -7: 수취중
				'docPackageId' : '', //문서묶음 ID ㆍ이용자가 보낼때 생성하는 문서 묶음 단위 유통 식별 코드
				'docIds': [{'docId': ''}], // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소 ㆍ미 입력시 간이제출, 입력시 간편제출
				'resnMessage': '', // 사유 ㆍ반려시 사유 입력, 특수문자(&, <, >, ', ", /)는 HTML인코딩(&amp;, &lt;, &gt;, &#x27;, &quot;,&#x2F;)하여 저장('--'는 제거)
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				packages: [
					{
						docPackageId: 서묶음 ID(오류시 응답) ㆍ이용자가 보낼때 생성하는 문서 묶음 단위 유통 식별 코드
						docId : 전자문서 ID(오류시 응답) ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
						rspnsCode : 응답 코드(오류시 응답) ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패 ㆍ문서별 유통 변경이 불가한 상태시 오류코드 응답
						rspnsMssage : 응답 메세지(오류시 응답) ㆍAPI 호출 실패 시 오류 메시지
					}
				]
			*/
		},
	},
	/**
	/**
	44. 전자증명서 간편(간이) 제출
	*/
	requestElecDocPresentURL: {
		url: '/ssd/edoc/elecdoc/requestElecDocPresentURL.do',
		getDefaultBodyParameters: function() {
			return {
				'docIds': [{'docId': ''}], // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소 ㆍ미 입력시 간이제출, 입력시 간편제출
				'utlNo': '', // 이용기관 활용번호 ㆍ이용기관에서 제출 시 묶음에 대해 업무활용 용도로 자유롭게 지정하는 번호
				'prvcPvsnAgreAt': '', // 제3자 정보 제공 동의 여부 ㆍBoolean - Y: 동의 - N: 미동의
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				instPresentnUrl: 간이제출 URL
				pinCode: 문서열람번호 ㆍ웹지갑 권한 인경우 제외
				docPackageId: 문서묶음 ID
				validDt: 유효일시 (yyyyMMddHHmmss) ㆍ웹지갑 권한 인경우 필수ㆍ영구시 '99991231'
			*/
		},
	},
	/**
	44-1. 전자증명서 간편/간이 전자서명 제출
	*/
	requestElecDocPresentSignURL: {
		url: '/ssd/edoc/elecdoc/requestElecDocPresentSignURL.do',
		getDefaultBodyParameters: function() {
			return {
				'docIds': [{'docId': ''}], // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소 ㆍ미 입력시 간이제출, 입력시 간편제출
				'eltsgnPresentnEcdwAdres': '', // 서명 제출자 전자문서지갑 주소
				'utlNo': '', // 이용기관 활용번호 ㆍ이용기관에서 제출 시 묶음에 대해 업무활용 용도로 자유롭게 지정하는 번호
				'crtfctInsttCode': '', // 인증기관코드 ㆍ기본값 4000 ㆍ인증기관코드_표.xlsx 파일 참조
				'prvcPvsnAgreAt': '', // 제3자 정보 제공 동의 여부 ㆍBoolean - Y: 동의 - N: 미동의
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				instPresentnUrl: 간이제출 URL
				pinCode: 문서열람번호 ㆍ웹지갑 권한 인경우 제외
				docPackageId: 문서묶음 ID
				validDt: 유효일시 (yyyyMMddHHmmss) ㆍ웹지갑 권한 인경우 필수ㆍ영구시 '99991231'
			*/
		},
	},
	/**
	62. 증명서 신청 목록 조회
	*/
	ECDApplyListInquire: {
		url: '/ssd/edoc/apply/ECDApplyListInquire.do',
		getDefaultBodyParameters: function() {
			return {
				'ecdwAdres': '', // 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				'pgngNo': '', // 페이지 번호
				'pgngSize': '', // 페이지당 행수 ㆍ기본값 20
				'applBgnde': '', // 신청 시작일 (검색 조건, yyyyMMdd)
				'applEndde': '', // 신청 종료일 (검색 조건, yyyyMMdd)
				'applId': '', // 신청 ID
				'applsId': '', // 묶음 신청 ID
				'receptInsttReqstNo': '', // 수취기관 신청번호
				'applsKndNm': '', // 묶음 종류 명(Like 검색)
				'docKndCode': '', // 문서종류코드
				'docKndNm': '', // 문서 종류 명(Like 검색)
				'issuInsttCode': '', // 발급기관코드
				'applStatsCode': '', // 청상태코드 ㆍEnum - 0: 전체 - 1: 신청 - 2: 소요 - 3: 발급 - 4: 반려 - 5: 실패 - 6: 대기
				'deleteListAt': '', // 삭제목록조회여부 Boolean - Y: 삭제된 신청목록 조회 - N: 미삭제 상태의 신청목록 조회
				'searchSeCode': '', // 검색구분코드 ㆍEnum -0: 전체 - 1: 정상 - 2: 실패
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				searchResults: [{
					docKndCode: 문서종류코드 ㆍ발급기관에서 발급하는 전자증명서 종류를 구분하는 11자리 숫자 코드 (docKndCode.xlsx 참조)
					docKndNm: 문서 종류 명
					applsKndNm: 묶음 종류 명
					applStatsCode: 신청상태코드 ㆍEnum - 1: 신청 - 2: 소요 - 3: 발급 - 4: 반려 - 5: 실패 - 6: 대기
					applId: 신청 ID
					applsId: 묶음신청 ID
					issuInsttCode: 발급기관코드
					issuInsttNm: 발급기관명
					docId: 전자문서 ID
					applDt: 신청일시 (yyyyMMddHHmmss)
					issuDt: 발급일시 (yyyyMMddHHmmss)
					issuInsttCffdnNo: 발급기관 민원사무(업무)번호
					receptInsttReqstNo: 수취기관 신청번호
					orderNo: 주문번호
					reqstResultMssage: 신청 결과 메세지
					urlReqstAt: '85. 지갑 화면 URL 요청'으로 신청한 경우 ㆍBoolean - Y: 지갑화면으로 신청 - N: API로 신청
					simpleApplAt: '86. 신청 화면 URL 요청'으로 신청한 경우 ㆍBoolean - Y: 간편 신청 - N: 일반 신청
					docNick: 증명서 별칭
				}]
				totRow: 전체 행수
			*/
		},
	},
	/**
	66. 증명서 신청 문서종류코드 목록 조회
	*/
	ECDApplySupportListInquire: {
		url: '/ssd/edoc/apply/ECDApplySupportListInquire.do',
		getDefaultBodyParameters: function() {
			return {
				'docKndNm': '', // 문서 종류 명 (Like 검색)
				'userSeCode': '', // 이용자구분코드 ㆍEnum - 0: 전체 - 1: 개인 신청 가능 - 2: 법인 신청 가능
				'issuInsttCode': '', // 발급기관코드 ㆍ5자리 이하일 경우 Like 검색, 미 입력 시 전체 목록 조회
				'sortSeCode': '', // 정렬구분코드 ㆍEnum - 1: 문서종류코드 - 2: 문서종류명 - 3: 신청이용순위
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				searchResultsa: [{
					docKndCode: 문서종류코드
					docKndNm: 문서 종류 명
					docKndDc: 문서종류설명
					issuInsttNtcn: 발급기관 알림
					issuInsttCffdnNo: 발급기관 민원사무(업무)번호
					issuInsttCode: 발급기관코드
					issuInsttNm: 발급기관명
					userSeCode: 이용자구분코드ㆍEnum - 1: 개인 신청 가능 - 2: 법인 신청 가능
					reqreKnd: 소요유형ㆍEnum - 1: 즉시발급 - 2: 조건부 즉시발급 - 3: 기간 소요
					eltsgnVrifyAt: 전자서명검증여부 ㆍBoolean - Y: 검증 필요 - N: 검증 불필요
					setleAt: 결제여부 ㆍBoolean - Y: 결제 필요 - N: 결제 불필요
				}]
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				totRow: 전체 행수
 			*/
		},
	},
	/**
	67. 증명서 신청 문서종류코드 정보 조회
	*/
	ECDApplySupportListInfoInquire: {
		url: '/ssd/edoc/apply/ECDApplySupportListInfoInquire.do',
		getDefaultBodyParameters: function() {
			return {
				'docKndCode': '', // 문서종류코드
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				adiInfoList: [{
					adiInfoCode: 부가정보코드
					adiInfoNm: 부가정보명
				}]
				docKndCode: 문서종류코드
				docKndNm: 문서 종류 명
				docKndDc: 문서종류설명
				issuInsttNtcn: 발급기관 알림
				issuInsttCffdnNo: 발급기관 민원사무(업무)번호
				issuInsttCode: 발급기관코드
				issuInsttNm: 발급기관명
				userSeCode: 이용자구분코드ㆍEnum - 1: 개인 신청 가능 - 2: 법인 신청 가능
				reqreKnd: 소요유형ㆍEnum - 1: 즉시발급 - 2: 조건부 즉시발급 - 3: 기간 소요
				eltsgnVrifyAt: 전자서명검증여부 ㆍBoolean - Y: 검증 필요 - N: 검증 불필요
				setleAt: 결제여부 ㆍBoolean - Y: 결제 필요 - N: 결제 불필요
				validTmlmt: 증명서유효기한
				setleDc: 결제설명
				reqreDay: 소요일
				reqreDc: 소요설명
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
 			*/
		},
	},
	/**
	70. 정부24 회원 여부 조회
	*/
	ECDApplyGov24MemberVerify: {
		url: '/ssd/edoc/apply/ECDApplyGov24MemberVerify.do',
		getDefaultBodyParameters: function() {
			return {
				'ecdwAdres': '', // 전자문서지갑 주소 (개인) ci 또는 ecdwAdres Required
				'ci': '', // 본인확인 연결정보 ci 또는 ecdwAdres Required
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				memberVrifyResultCode: 정부24 회원 여부 코드 - 1: 회원 - 2: 비회원(정부24에 가입하지 않았거나, 본인 인증을 하지 않은 회원)
				memberVrifyMssage: 정부24 연계 통해서 가입여부 확인, 실패하면 오류 응답
 			*/
		},
	},
	/**
	32. 전자증명서 정보 조회 (XML 메타 데이터 조회)
	*/
	viewElecDoc: {
		url: '/ssd/edoc/issue/inquireElecDocInfo.do',
		getDefaultBodyParameters: function() {
			return {
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'docId': '', // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소
				'docPackageId': '', // 문서묶음 ID
				'elcrtMetaInfoReqstAt': 'Y' // 전자증명서 메타정보 요청 여부 기본값 'Y' Boolean - Y: 메타정보 조회 - N: 메타정보 미조회
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				docKndCode*: 문서종류코드 ㆍdocKndCode.xlsx 파일 참조
				docKndNm*:	 문서 종류 명
				elcrtMetaInfo: 전자증명서 메타정보 ㆍ발급기관에서 발급하는 전자증명서를 생성하기 위한 메타정보(XML, JSON등)를 Base64로 인코딩한 문자열 ㆍ지갑 API인 경우 조회 불가
				issuDt*: 발급일시 (yyyyMMddHHmmss)
				issuInsttCode*:	 발급기관코드
				issuInsttNm*: 발급기관명
				issuNo:	 발급기관 발급번호
				issuTyCode*: 발급유형코드 ㆍEnum - 1: 발급 - 2: 첨부
				applId:	 신청 ID ㆍAPI Version 2.0에서 추가된 매개변수
				applsId: 묶음 신청 ID ㆍAPI Version 2.0에서 추가된 매개변수
				docNick: 증명서 별칭 ㆍ제출자가 조회할 경우(수취처 전자문서지갑 주소를 설정하지 않음)에만 별칭 반환
				rspnsCode*:	 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage*: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
 			*/
		},
	},
	/**
	/**
	33-1. 전자증명서 열람 URL 요청
	*/
	viewElecDoc: {
		url: '/ssd/edoc/issue/viewElecDoc.do',
		getDefaultBodyParameters: function() {
			return {
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'docId': '', // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소
				'docPackageId': '', // 문서묶음 ID
				'setupBttonAt': 'Y', // 뷰어에서 설정 버튼 보이기 여부 ㆍ기본값 'Y' ㆍBoolean - Y: 보임 - N: 숨김 ㆍ웹뷰로 열람하려면 명시적으로 'N'을 설정하여 요청
				'closeBttonAt': 'Y', // 뷰어에서 닫기 버튼 보이기 여부 ㆍ기본값 'Y' ㆍBoolean - Y: 보임 - N: 숨김 ㆍ웹뷰로 열람하려면 명시적으로 'N'을 설정하여 요청
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				viewUrl: 문서열람 URL(URL 보안 토큰 포함)
 			*/
		},
	},
	/**
	33-2. 전자증명서 다운로드 URL 요청
	*/
	urlDownloadElecDoc: {
		url: '/ssd/edoc/issue/urlDownloadElecDoc.do',
		getDefaultBodyParameters: function() {
			return {
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'docId': '', // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소
				'docPackageId': '', // 문서묶음 ID
				'pinNo': '', // 문서비밀번호 ㆍ문서를 다운로드할 때 PDF 열람시 입력해야 하는 패스워드 숫자 6자리 ㆍ제출자인 경우만 - 제출자 본인이 문서비밀번호 설정 선택 가능
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				downloadUrl: 다운로드 URL (URL 보안 토큰 포함)
 			*/
		},
	},
	/**
	33-3. 전자증명서 다운로드
	*/
	downloadElecDoc: {
		url: '/ssd/edoc/issue/downloadElecDoc.do',
		getDefaultBodyParameters: function() {
			return {
				'presentnEcdwAdres': '', // 제출자 전자문서지갑 주소
				'docId': '', // 전자문서 ID ㆍ발급기관에서 발급하는 전자증명서를 식별하는 18자리 숫자 코드
				'receptEcdwAdres': '', // 수취처 전자문서지갑 주소
				'docPackageId': '', // 문서묶음 ID
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				downloadFileName: 다운로드 파일 명
 			*/
		},
	},
	/**
	86. 신청 화면 URL 요청
	*/
	ApplyScreenURL: {
		url: '/ssd/edoc/apply/ApplyScreenURL.do',
		getDefaultBodyParameters: function() {
			return {
				'reqstInfoList': [{
					'docKndCode': '', // 문서종류코드
					'receptInsttReqstNo': '', // 수취기관신청번호
					'elcrtReqstMetaInfo': '', // 전자증명서 신청 메타정보 ㆍ 전자서명을 하지 않는 평문 XML형식으로 요청해야 함. (비회원 신청시 비회원 간소화 신청 값이 Y일 때 필수값)
				}], 
				'ecdwAdres': '', // 전자문서지갑 주소 ㆍ이용자 식별을 위한 개인/법인/기관/사업자 지갑 주소 - 개인: 1로 시작 - 법인: 2로 시작 - 행정: 3으로 시작 - 공공: 4로 시작 - 금융: 5로 시작 - 사업자: 6으로 시작
				'eltsgnEcdwAdres': '', // 서명 전자문서지갑 주소 ㆍPKCS#7 구조로 전자서명한 데이터 ('회원신청'일 경우만 필수)
				'crtfctInsttCode': '', // 인증기관코드 ㆍ기본값 4000 ㆍ인증기관코드_표.xlsx 파일 참조
				'applsKndNm': '', // 묶음 종류 명
				'govReqstSe': 'N', // 정부24 회원 신청구분 ('Y':회원신청/'N':비회원신청)
				'nmberElcrtReqstMetaInfoAt': 'N', // 비회원 간소화 신청 여부 ('비회원 신청'일 경우 : 'Y': 간소화 신청/'N': 간소화 미신청) 기본값 'N'
				'simplCertRTNUrl': '', // 간편인증용 리턴URL
			};
		},
		exec: async function(bodyParameters, callback) {
			const axiosConfig = fn_axios.config_Defaults('post');
			const response = await axios.post(this.url, bodyParameters, axiosConfig);
			if(typeof callback == 'function') {
				queueMicrotask(() => callback(response.data));
			}
			else {
				return response.data;
			}
			/**
				rspnsCode: 응답 코드 ㆍAPI 호출 성공 여부 및 오류 코드 - 100: 성공 - 그 외 코드: 실패
				rspnsMssage: 응답 메세지 ㆍAPI 호출 실패 시 오류 메시지
				url: 신청 화면 URL
			*/
		},
	},
};
