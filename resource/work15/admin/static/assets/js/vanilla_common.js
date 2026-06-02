window.originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];

  const isExcluded = window.excludeUrl && window.excludeUrl.some(ex => typeof url === 'string' && url.includes(ex));

  if (!isExcluded) {
    LoadingManager.inc();
  }

  try {
    return await window.originalFetch(...args);
  } finally {
    if (!isExcluded) {
      LoadingManager.dec();
    }
  }
};


// fetchUtil.js
let activeRequests = 0;

function isPopupAjaxResult(result) {
  return !!(result && (result.popup || result.isPopup));
}

function normalizeAjaxLocation(locationUrl, result) {
  if (!locationUrl) return locationUrl;
  if (isPopupAjaxResult(result) && locationUrl.indexOf("/loginPop") === 0 && locationUrl.indexOf("refresh=true") === -1) {
    return locationUrl + (locationUrl.indexOf("?") === -1 ? "?" : "&") + "refresh=true";
  }
  return locationUrl;
}

function handleAjaxLocation(result) {
  if (!result || !result.location) return false;

  const target = normalizeAjaxLocation(result.location, result);
  if (isPopupAjaxResult(result)) {
    const popup = window.open(target, "loginPop", "width=1330,height=790,scrollbars=yes,resizable=yes");
    if (popup) {
      popup.focus();
    } else {
      location.href = target;
    }
    return true;
  }

  if (location.pathname === "/loginPop") {
    if (location.search.indexOf("refresh=true") !== -1 && window.opener) {
      window.opener.location.reload();
    }
    window.close();
    return true;
  }

  location.href = target;
  return true;
}

function handleAjaxResult(result) {
  if (!result || typeof result !== "object") return false;
  const moved = handleAjaxLocation(result);
  if (result.message) {
    alert(result.message);
  }
  return moved || !!result.message;
}

function showLoading() {
  document.body.style.cursor = "wait";
}

function hideLoading() {
  document.body.style.cursor = "";
}


const LoadingManager = (function () {
  let count = 0;
  const overlay = document.getElementById('loader-wrap');
  let showTimer = null;
  let hideTimer = null;
  const SHOW_DELAY = 100; // ms
  const MIN_VISIBLE = 200; // ms

  function doShow() {
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function doHide() {
    if (!overlay) return;
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  return {
    inc() {
      count++;
      if (count === 1) {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        showTimer = setTimeout(() => { doShow(); showTimer = null; }, SHOW_DELAY);
      }
    },
    dec() {
      count = Math.max(0, count - 1);
      if (count === 0) {
        if (showTimer) { clearTimeout(showTimer); showTimer = null; }
        hideTimer = setTimeout(() => { doHide(); hideTimer = null; }, MIN_VISIBLE);
      }
    },
    reset() {
      count = 0;
      if (showTimer) { clearTimeout(showTimer); showTimer = null; }
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      doHide();
    },
    getCount() { return count; }
  };
})();

window.excludeUrl = window.excludeUrl || [];
// fetchUtil.js
async function fetchJson(url, method = "GET", data = null) {
  try {
    let options = { method, credentials: "include" };

    if (method !== "GET") {
      if (url.endsWith(".dataTable") || url.endsWith(".ajax")) {
        options.headers = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" };
        options.body = new URLSearchParams(data || {}).toString();
      } else {
        options.headers = { "Content-Type": "application/json; charset=UTF-8" };
        options.body = JSON.stringify(data || {});
      }
    } else if (data) {
      const query = new URLSearchParams(data).toString();
      url = `${url}?${query}`;
    }

    let response = await fetch(url, options);

    if (response.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
      return null; // 반드시 반환해서 이후 로직 실행 방지
    }

    let json = null;
    try {
      json = await response.json();
    } catch (e) {
      // JSON 파싱 실패 시 처리 (필요하면 text로 읽기)
      console.warn("응답 JSON 파싱 실패", e);
    }

    if (json) {
      try { handleAjaxResult(json); } catch (e) { console.warn(e); }

      if (json.location) {
        if (json.popup) window.open(json.location, "", "width=500,height=500");
        else {
          if (location.pathname === "/loginPop") {
            if (location.search.indexOf("refresh=true") !== -1 && window.opener) window.opener.location.reload();
            window.close();
          } else {
            location.href = json.location;
          }
        }
      }
    }

/*    if (!response.ok && response.statusText !== "abort") {
      if (json.message){
       alert(json.message)
      }else{
        alert("에러 발생 관리자에게 문의하세요");
      }
    }*/
    return json;
  } catch (error) {
    if (error && error.name === "AbortError") {
      console.info("요청이 취소되었습니다.");
      return null;
    }
    console.error(error);
    alert("요청 실패 관리자에게 문의하세요");
    return null;
  }
}

function setCursorPosition(elem, pos) {
  if (elem.setSelectionRange) {
    elem.setSelectionRange(pos, pos);
  } else if (elem.createTextRange) {
    var range = elem.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}

function destroyDatatable(id) {
  try {
    var tableElem = document.getElementById(id);
    if (tableElem && tableElem.dataset.initialized === "true") {
      // DataTable 라이브러리 자체는 jQuery 기반이라 완전한 대체는 어려움
      // 대신 Vanilla JS에서는 innerHTML 초기화로 테이블 리셋
      tableElem.innerHTML = '';
      tableElem.dataset.initialized = "false";
    }
  } catch (e) {}
}

// 버튼 설정 (DataTable용)
function buttonsSelect(useSelect) {
  var buttons = [
    {
      action: function (dt) {
        downloadAllExcel(dt.tableId);
      },
      text: '엑셀',
      className: 'btn btn-outline',
      footer: true
    },
    {
      extend: 'excelHtml5',
      className: 'hidden',
      text: 'excel'
    },
    {
      extend: 'pageLength',
      className: 'btn btn-outline',
    },
    {
      text: '새로고침',
      className: 'btn btn-outline',
      action: function (dt) {
        dt.reload();
      }
    }
  ];

  if (useSelect) {
    buttons.unshift({
      extend: 'selectNone',
      text: '선택해제',
      className: 'btn btn-outline',
      exportOptions: { columns: ':visible' }
    });
    buttons.unshift({
      extend: 'selectAll',
      text: '전체선택',
      className: 'btn btn-outline',
      exportOptions: { columns: ':visible' }
    });
  }
  return buttons;
}




// 모달 HTML 생성
function modalDiv(dtId) {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="modal" id="dtExcelReason">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">엑셀 다운로드 사유 입력</h3>
            <button type="button" class="close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="dtExcelReasonForm">
              <div class="row">
                <div class="col-12">
                  <div class="form-group">
                    <div class="form-label">
                      <span>다운로드 사유 (<b id="byteLimit">300</b> Byte)</span>
                    </div>
                    <input type="text" id="downloadReason" name="reason" class="form-control">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <div></div>
            <div>
              <button type="button" class="btn btn-teal" id="downloadBtn">다운로드</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return div;
}

// 바이트 제한 함수
function byteLimit(obj, maxByte) {
  let str = obj.value;
  let rbyte = 0;
  let rlen = 0;
  let str2 = "";

  for (let i = 0; i < str.length; i++) {
    const one_char = str.charAt(i);
    rbyte += escape(one_char).length > 4 ? 2 : 1;
    if (rbyte <= maxByte) {
      rlen = i + 1;
    }
  }
  if (rbyte > maxByte) {
    str2 = str.substr(0, rlen);
    obj.value = str2;
    byteLimit(obj, maxByte);
  } else {
    document.getElementById('byteLimit').innerText = maxByte - rbyte;
  }
}

// 엑셀 다운로드
async function downloadAllExcel(dtId) {
  const dt = document.getElementById(dtId); // DataTable 엘리먼트
  // DataTables API는 jQuery 기반이라 완전 대체는 어려움 → 여기서는 fetch만 교체

  // 모달 띄우기
  if (!document.getElementById('dtExcelReason')) {
    document.body.appendChild(modalDiv(dtId));
    const modal = new bootstrap.Modal(document.getElementById('dtExcelReason'));
    modal.show();

    // 다운로드 버튼 이벤트
    document.getElementById('downloadBtn').addEventListener('click', async () => {
      const reasonInput = document.getElementById('downloadReason');
      if (!reasonInput.value) {
        alert('엑셀 다운로드 사유를 입력해주세요.');
        reasonInput.focus();
        return;
      }

      try {
        // fetch로 로그 기록
        const response = await fetch('/excelLog.ajax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `url=${encodeURIComponent(window.location.href)}&path=${encodeURIComponent(location.pathname)}&id=${dtId}&reason=${reasonInput.value}`
        });

        if (!response.ok) throw new Error('서버 오류');

        // 실제 Excel 다운로드 트리거 (DataTables API 대신 직접 form submit)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/downloadExcel?tableId=${dtId}&reason=${encodeURIComponent(reasonInput.value)}`;
        document.body.appendChild(form);
        form.submit();

        bootstrap.Modal.getInstance(document.getElementById('dtExcelReason')).hide();
      } catch (e) {
        alert('잠시후 시도해주세요');
      }
    });
  }
}

function dateFormat(yyyymmdd){
  if(yyyymmdd.length!=8){
    return yyyymmdd;
  }
  return yyyymmdd.substring(0,4)+'-'+yyyymmdd.substring(4,6)+'-'+yyyymmdd.substring(6);
}

// trim 지원 안하는 브라우저 polyfill
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

//3자리마다 컴마 찍힌 값으로 return
function comma(strOri){
  if (typeof strOri === 'undefined') {
    return '';
  }
  var str = strOri.toString().replace(/[^\d.-]/g, '');

  if (str.indexOf('-') > 0) {
    str = str.replace(/-/g, '');
  }

  var parts = str.split('.');
  if (parts.length > 2) {
    str = parts[0] + '.' + parts.slice(1).join('');
    parts = str.split('.');
  }

  if (parts[0] !== '' && parts[0] !== '-') {
    parts[0] = Number(parts[0]).toString();
  }

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  str = parts.join('.')

  if (str == '') {
    str = 0;
  }
  return str;
}
function spanTag(text, className){
  if(className != null){
    return '<span class="'+className+'">'+text+'</span>';
  }else{
    return '<span>'+text+'</span>';
  }
}


// 20글자 이상 말줄임표
function ellipsisStr(str){
  str = str+'';
  if(str.length > 20){
    str = str.substr(0, 18) + '...';
  }
  return str;
}

function lineChange(str){
  var cnt = 0;
  str = str+'';
  if(str.length > 35){
    cnt++;
  }
  return cnt;
}

// 40글자 이상 줄바꿈
function lineBreakStr(str){
  str = str+'';
  var strLength = str.length;
  var res = 0;
  var msg = '';
  if(strLength>40){
    res = Math.ceil(strLength/40);
    for(var i=0; i<res; i++){
      msg += str.substring(i*40,(i+1)*40)+'<br>';
    }
  }else{
    msg=str;
  }
  return msg;
}

// 80글자 이상 줄바꿈
function lineBreakStr2(str){
  str = str+'';
  var strLength = str.length;
  var res = 0;
  var msg = '';
  if(strLength>80){
    res = Math.ceil(strLength/80);
    for(var i=0; i<res; i++){
      msg += str.substring(i*80,(i+1)*80)+'<br>';
    }
  }else{
    msg=str;
  }
  return msg;
}
// 파일 다운로드 (fetch 버전)
function fileDownload(path, name) {
  if (!path || !name) {
    return;
  }

  const url = '/download/fileCheck.ajax?obj=' + encodeURIComponent(path) + '&fileName=' + encodeURIComponent(name);

  fetch(url, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }
      return response.text(); // 서버 응답이 JSON이면 response.json() 사용
    })
    .then(data => {
      // 성공 시 처리 로직 (현재는 비어 있음)
      console.log('파일 체크 완료:', data);
    })
    .catch(error => {
      console.error('파일 다운로드 오류:', error);
    });
}

// 파일 다운로드 배열 처리
function downloadArray(filePathList, fileNameList) {
  for (let i = 0; i < filePathList.length; i++) {
    fileDownload(filePathList[i], fileNameList[i]);
    // sleep 대신 setTimeout을 쓰는 게 권장됨 (동기 sleep은 브라우저 멈춤)
  }
}

// 동기 sleep은 브라우저를 멈추므로 비추천
// 대신 async/await + setTimeout 사용 권장
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 숫자 + 콤마 입력 (한글 제거)
function numCommaKeyUp(event) {
  const tar = event.target;
  tar.value = comma(tar.value);
}

// 0 처리
function onZero(event) {
  const tar = event.target;
  if (tar.value === '0') tar.value = '';
}


/** 숫자만 입력 (콤마 허용) */
function onlyNumber(event) {
  const tar = event.target;
  tar.value = tar.value.replace(/[^0-9.]/gi, '');
}

/** 숫자만 입력 (콤마, 점 제거) */
function onlyNumberNoDot(event) {
  const tar = event.target;
  tar.value = tar.value.replace(/[^0-9]/gi, '');
}

/** 전화번호 입력 (숫자와 -만 허용) */
function inputPhone(event) {
  const tar = event.target;
  tar.value = tar.value.replace(/[^0-9-]/gi, '');
}

/** 전화번호 포맷팅 */
function telFormat(event) {
  const tar = event.target;
  let str = tar.value.replace(/[^0-9]/g, '')
    .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
  tar.value = str;
}

/** 리스트 null 체크 */
function listNullCheck(param, count) {
  const list = [];
  if (param == null) {
    for (let i = 0; i < count; i++) list.push('');
    return list;
  } else {
    for (let i = 0; i < count; i++) {
      if (param[i] == null || param[i] === 'undefined') {
        param[i] = '';
      }
    }
    return param;
  }
}

/** 숫자 입력 처리 */
function inputOnlyNumber(el) {
  el.value = comma(el.value);
}

/** 퍼센트 형식 */
function percentFormat(event) {
  const tar = event.target;
  let str = tar.value.replace(/[^0-9.]/gi, '') + '%';
  if (str.substring(0, 2) !== '0.' && str.charAt(1) === '0') {
    str = '0.' + str.slice(1);
  }

  tar.value = str;

  // 커서 위치 조정
  const pos = str.length - 1;
  if (tar.setSelectionRange) {
    tar.setSelectionRange(pos, pos);
  }
}

/** 다음 주소 api사용 */
function daum_address_common(flag) {
  new daum.Postcode({
    oncomplete: function (data) {
      const addrArr = daumAddressArr(data);

      const postInput = document.querySelector(`input[name=${flag}post]`);
      const addr1Input = document.querySelector(`input[name=${flag}addr1]`);
      const addr2Input = document.querySelector(`input[name=${flag}addr2]`);
      const addr3Input = document.querySelector(`input[name=${flag}addr3]`);
      const addressInput = document.querySelector(`input[name=${flag}address]`);

      if (postInput) postInput.value = addrArr[0];
      if (addr1Input) addr1Input.value = addrArr[1];
      if (addr2Input) addr2Input.value = addrArr[2];
      if (addr3Input) addr3Input.value = addrArr[3] + '[' + addrArr[4] + ']';
      if (addressInput)
        addressInput.value =
          '(' +
          addrArr[0] +
          ') ' +
          addrArr[1] +
          ' ' +
          addrArr[2] +
          ' ' +
          addrArr[3] +
          '[' +
          addrArr[4] +
          ']';
    },
  }).open();
}

// 주소 배열 반환. post, addr1 , addr2, addr3
function daumAddressArr(data) {
  const addrArr = new Array(5);

  let sido = data.sido;
  let sigungu = data.sigungu;
  if (sigungu === '') {
    sigungu = data.bname1;
  }
  let roadname = data.roadname;
  if (roadname === '') {
    roadname = data.bname;
  }

  let roadnameExtract = data.roadAddress.substring(
    data.roadAddress.indexOf(sigungu) + sigungu.length
  );
  roadnameExtract = roadnameExtract
    .substring(0, roadnameExtract.indexOf(roadname) + roadname.length)
    .trim();
  roadname = roadnameExtract;

  let roadNum = data.roadAddress;
  roadNum = roadNum
    .substring(roadNum.indexOf(roadname) + roadname.length)
    .trim();
  roadname = roadname + ' ' + roadNum;

  let jibun = data.jibunAddress;
  if (jibun === '') {
    jibun = data.autoJibunAddress;
  }
  jibun = jibun.replace(sido, '').replace(sigungu, '').replace(data.bname1, '');

  roadname = roadname.trim();
  jibun = jibun.trim();

  addrArr[0] = data.zonecode;
  addrArr[1] = sido;
  addrArr[2] = sigungu;
  addrArr[3] = roadname;
  addrArr[4] = jibun;

  return addrArr;
}

// 주소 배열 반환. post, addr1 , addr2, addr3
function daumAddrReturn(data) {
  const addrArr = new Array(4);

  const sido = data.sido;
  let sigungu = data.sigungu;
  if (sigungu === '') {
    sigungu = data.bname1;
  }
  let roadname;

  if (data.userSelectedType === 'R') {
    roadname = data.roadname;
    if (roadname === '') {
      roadname = data.bname;
    }

    let roadnameExtract = data.roadAddress.substring(
      data.roadAddress.indexOf(sigungu) + sigungu.length
    );
    roadnameExtract = roadnameExtract
      .substring(0, roadnameExtract.indexOf(roadname) + roadname.length)
      .trim();
    roadname = roadnameExtract;

    let roadNum = data.roadAddress;
    roadNum = roadNum
      .substring(roadNum.indexOf(roadname) + roadname.length)
      .trim();

    let extraAddr = '';
    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
      extraAddr += data.bname;
    }

    if (data.buildingName !== '' && data.apartment === 'Y') {
      extraAddr +=
        extraAddr !== '' ? ', ' + data.buildingName : data.buildingName;
    }

    if (extraAddr !== '') {
      extraAddr = '(' + extraAddr + ')';
    }
    roadname = roadname + ' ' + roadNum + extraAddr;
  } else {
    roadname = data.jibunAddress;
    roadname = roadname.replace(sido, '');
    roadname = roadname.replace(sigungu, '');
  }
  roadname = roadname.trim();

  addrArr[0] = data.zonecode;
  addrArr[1] = sido + ' ' + sigungu + ' ' + roadname;

  return addrArr;
}
/**사용자 내정보 설정*/
function popUserMyInfo() {
  var userInfo = window.open('/user/my', 'userInfo', 'width=785, height=700, left='+screenX+', top='+screenY+',scrollbars=yes, resizable=yes');
  userInfo.focus();
}

/** input type="file" 에 onChange로 적용*/
function maxFileSizeCheck(obj){
  if(obj.files && obj.files[0]){
    var maxSize = 1024 * 1024 * 10;
    var fileSize = obj.files[0].size;

    if(fileSize > maxSize){
      alert('첨부파일은 10MB 이내로 등록 가능합니다.');
      obj.value = ''; // jQuery 대신 바닐라 JS
      return false;
    }
  }
}

/**팝업공통*/
function popup(url, id, width, height){
  var focusPopup = window.open(url, id, 'width='+width+', height='+height+', left='+screenX+', top='+screenY+',scrollbars=yes, resizable=yes');
  focusPopup.focus();
}


/** 파일 업로드 이미지 미리보기 */
function setThumbnail(event) {
  document.querySelector('#files-thumb').innerHTML = '';
  for (var image of event.target.files) {

    var maxSize = 1024 * 1024 * 30;
    var fileSize = image.size;

    if(fileSize > maxSize){
      alert('첨부이미지는 30MB 이내로 등록 가능합니다');
      event.target.value = '';
      document.querySelector('#files-thumb').innerHTML = '';
      return false;
    }

    // 확장자 체크
    var file_name = image.name;
    var last_idx = file_name.lastIndexOf('.');
    var alert_file = false;
    if (last_idx === -1) {
      alert_file = true;
    } else {
      var file_exe = file_name.substring(last_idx).toUpperCase();
      if(file_exe == '.JPG' || file_exe == '.JPEG' || file_exe == '.PNG' || file_exe == '.GIF'){

      } else {
        alert_file = true;
      }
    }
    if (alert_file) {
      alert('파일 확장자를 확인해주세요.');
      event.target.value = '';
      document.querySelector('#files-thumb').innerHTML = '';
      return false;
    }
    // 확장자 체크 end

    var reader = new FileReader();

    reader.onload = function(event) {
      //img div
      var imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "col-sm-12 col-md-3");
      // img
      var img = document.createElement("img");
      img.setAttribute("src", event.target.result);
      img.setAttribute("class","card-img img-fluid");
      imgDiv.appendChild(img);
      document.querySelector("#files-thumb").appendChild(imgDiv);
    };
    reader.readAsDataURL(image);
  }
}

/** 파일 업로드 이미지 미리보기 */
function setThumbnail3(event) {

  document.querySelector('#bigImg').innerHTML = '';
  for (var image of event.target.files) {

    var maxSize = 1024 * 1024 * 30;
    var fileSize = image.size;

    if(fileSize > maxSize){
      alert('첨부이미지는 30MB 이내로 등록 가능합니다');
      event.target.value = '';
      document.querySelector('#bigImg').innerHTML = '';
      return false;
    }

    // 확장자 체크
    var file_name = image.name;
    var last_idx = file_name.lastIndexOf('.');
    var alert_file = false;
    var isPdf = false;
    var isAvi = false;
    var isAnother = false;

    if (last_idx === -1) {
      alert_file = true;
    } else {
      var file_exe = file_name.substring(last_idx).toUpperCase();
      if(file_exe == '.JPG' || file_exe == '.JPEG' || file_exe == '.PNG' || file_exe == '.GIF'
        || file_exe == '.MP4' || file_exe == '.PDF'|| file_exe == '.TIF' || file_exe == '.ZIP'|| file_exe == '.WAV'|| file_exe == '.AVI'){

        if(file_exe == '.PDF') isPdf = true;
        if(file_exe == '.MP4' || file_exe == '.WAV' || file_exe == '.AVI') isAvi = true;
        if(file_exe == '.TIF' || file_exe == '.ZIP') isAnother = true;

      } else {
        alert_file = true;
      }
    }
    if (alert_file) {
      alert('파일 확장자를 확인해주세요.');
      event.target.value = '';
      document.querySelector('#bigImg').innerHTML = '';
      return false;
    }
    // 확장자 체크 end

    var reader = new FileReader();

    reader.onload = function(event) {

      var img = '<img style="width: 100%;height: 100%;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
      if(isPdf) img = '<iframe style="width: 575px;height: 800px;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
      if(isAvi) img = '<video style="width: 100%;height: 100%;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
      if(isAnother) img = '';

      document.getElementById("bigImg").innerHTML=img;
    };
    reader.readAsDataURL(image);
  }

  document.querySelector("#changeType").value = "1";
}

// Infinity 0으로 변환
function infinityToZero(res){
  if(!isNaN(res) && isFinite(res)){
    return res;
  }else{
    return 0;
  }
}
(async function() {
  const selects = document.querySelectorAll('form-select[select-code]');
  for (const select of selects) {
    const codeGroup = select.getAttribute('select-code');
    const allOption = select.getAttribute('select-all-option');
    const response = await fetchJson('/common/getCommonCodesByCodeGroup', "GET", { codeGroup });

    if (allOption && allOption === "true") {
      select.addOption('', '전체');
      select.setValue('');
    }

    response.forEach(item => {
      let value = item.codeValue;
      let textContent = item.codeName;
      select.addOption(value, textContent);
    });
    const innerSelect = select.querySelector("select");
    innerSelect.dispatchEvent(new CustomEvent("optionsLoaded", {
      detail: { codeGroup }
    }));

    if (!(allOption && allOption === "true") && response.length > 0) {
      if (!innerSelect.value) {
        select.setValue(response[0].codeValue);
      }else{
        select.setValue(innerSelect.value);
      }
    }

  }
})();


(async function() {
  const selects = document.querySelectorAll('form-select[select-code-backbone]');
  for (const select of selects) {
    const codeGroup = select.getAttribute('select-code-backbone');
    const allOption = select.getAttribute('select-all-option');

    const response = await fetchJson('/common/getCommonCodesByCodeGroupBackbone',"GET",{codeGroup:codeGroup});
    if(allOption&&allOption=="true"){
       select.addOption('','전체');
       select.setValue('');
    }


    response.forEach(item => {
      let value = item.codeValue;
      let textContent = item.codeName;
      select.addOption(value,textContent);
    });

    if (!(allOption&&allOption=="true")&&response.length > 0) {
      select.setValue(response[0].codeValue);
    }
  }
})();



function serializeForm(formSelectorOrEl) {
  const form = typeof formSelectorOrEl === 'string'
    ? document.querySelector(formSelectorOrEl) || document.getElementById(formSelectorOrEl)
    : formSelectorOrEl;

  if (!form) return '';
  return new URLSearchParams(new FormData(form)).toString();
}


// checkbox All 체크 기능 추가 : 강미영 - 2026.02.06
document.addEventListener('DOMContentLoaded', function () {
    // 1. 전체선택 체크박스 클릭 시
    document.querySelectorAll('.check-all').forEach(function (checkAll) {
        checkAll.addEventListener('click', function () {
            const table = this.closest('table');
            if (!table) return;

            table.querySelectorAll('.check-item').forEach(function (item) {
                item.checked = checkAll.checked;
            });
        });
    });

    // 2. 항목 체크박스 클릭 시 (전체선택 체크박스 연동)
    document.querySelectorAll('.check-item').forEach(function (checkItem) {
        checkItem.addEventListener('click', function () {
            const table = this.closest('table');
            if (!table) return;

            const items = table.querySelectorAll('.check-item');
            const checkedItems = table.querySelectorAll('.check-item:checked');

            const checkAll = table.querySelector('.check-all');
            if (checkAll) {
                checkAll.checked = items.length === checkedItems.length;
            }
        });
    });
});
function getToday(){
  var date = new Date();
  var year = date.getFullYear();
  var month = ("0" + (1 + date.getMonth())).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  return year + "-" + month + "-" + day;
  $('#books').load(url+' #books');
}
function getTime() {
  let today = new Date();
  let hours = today.getHours(); // 시
  let minutes = today.getMinutes();  // 분
  let seconds = today.getSeconds();  // 초
  return hours +':'+minutes+':'+seconds;
}

function divide(a, b){
  const numA = Number(a);
  const numB = Number(b);

  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    return 0;
  }

  if (numB === 0) {
    return 0;
  }

  const result = numA / numB;

  return result.toFixed(2);
}

function dueNum(e){
  let tar = e.target;
  tar.value = tar.value.replace(/[^0-9]/g, '');
  if(Number(tar.value) > 31){
    tar.value = 31;
  }
  if(Number(tar.value) < 1){
    tar.value = '';
  }
}
