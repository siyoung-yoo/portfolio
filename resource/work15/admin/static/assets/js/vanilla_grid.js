function setFitColumnSizeToGrid(id) {
  // 현재 출력된 칼럼들의 값을 모두 조사하여 최적의 칼럼 사이즈를 찾아 배열로 반환.
  // 만약 칼럼 사이즈들의 총합이 그리드 크기보다 작다면, 나머지 값들을 나눠 가져 그리드 크기에 맞추기
  var colSizeList = AUIGrid.getFitColumnSizeList(id, true);

  // 구해진 칼럼 사이즈를 적용 시킴.
  AUIGrid.setColumnSizeList(id, colSizeList);
}

function resizeGridAll() {
  var grids = AUIGrid.getCreatedGridAll();
  for (var grid of grids) {
    AUIGrid.resize(grid);
  }
}

function resizeGrid(grid) {
  AUIGrid.resize(grid);
}


function toFormUrlEncoded(obj) {
  return new URLSearchParams(obj).toString();
}

function handleGridAjaxResult(data) {
  if (!data || typeof data !== "object") return false;
  if (window.VanillaCommon && window.VanillaCommon.Ajax) {
    try {
      window.VanillaCommon.Ajax.handleAjaxResult(data);
    } catch (error) {
      if (window.VanillaCommon.Ajax.isHandledNavigationError(error)) {
        return true;
      }
      throw error;
    }
    return !!data.location;
  }

  if (data.location) {
    const isPopup = !!(data.popup || data.isPopup);
    const target = isPopup && data.location.indexOf("/loginPop") === 0 && data.location.indexOf("refresh=true") === -1
      ? data.location + (data.location.indexOf("?") === -1 ? "?" : "&") + "refresh=true"
      : data.location;

    if (isPopup) {
      const popup = window.open(target, "loginPop", "width=1330,height=790,scrollbars=yes,resizable=yes");
      if (popup) popup.focus();
      else location.href = target;
    } else {
      location.href = target;
    }
    if (data.message) alert(data.message);
    return true;
  }

  if (data.message) {
    alert(data.message);
    return true;
  }

  return false;
}

/**
 * 중복 생성 방지
 * */
function ensureGrid(selector, layout, props, currentGridId) {
  if (currentGridId) {
    return { gridId: currentGridId, created: false };
  }
  const gridId = AUIGrid.create(selector, layout, props);
  return { gridId, created: true };
}
/**
 * 중복 반인딩 방지
 * */
function bindOnce(gridId, eventName, handler) {
  AUIGrid.bind(gridId, eventName, handler);
}



/**
 * 그리드 데이터 세팅 (데이터 반환)추가
 * 조회하면 그리드용
 * */
async function loadGridDataSearchForm(grid, ajaxUrl, afterSuccess) {
  AUIGrid.showAjaxLoader(grid);
  try {
    const param = serializeForm('searchForm');
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: param
    });

    const data = await response.json();
    if (handleGridAjaxResult(data)) return [];
    if (!data || !data.data) return [];
    AUIGrid.setGridData(grid, data.data);

    if (typeof afterSuccess === 'function') {
      await afterSuccess(data.data, data);
    }
    return data.data;
  } catch (e) {
    console.error('loadGridDataSearchForm error:', e);
    return [];
  } finally {
    AUIGrid.removeAjaxLoader(grid);
    resizeGrid(grid);
  }
}
function updateRowCount(gridId) {
  const count = AUIGrid.getRowCount(gridId);
  document.getElementById(gridId+'Count').textContent = count;
}


window.excludeUrl = Array.from(new Set([
  ...(window.excludeUrl || []),
  '/estimate/getEstimateHeadItemList.dataTable',
  '/bonds/selectSangdam.dataTable'
]));

/** 그리드 데이터 세팅 */
 async function loadGridData(grid, ajaxUrl, param) {
   // console.log('vanailla ',grid, ajaxUrl, param)
    AUIGrid.showAjaxLoader(grid);

    try{
      const requestBody = new URLSearchParams(param);
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: requestBody
      });

      const data = await response.json();
      if (handleGridAjaxResult(data)) return [];
      if(data && data.data){
        let gridData = data.data;
        AUIGrid.setGridData(grid, gridData);
        return data.data;
      }else{
        return [];
      }
    }catch (error){
      console.log(error);
      return [];
    }finally {
      AUIGrid.removeAjaxLoader(grid);
    }
 }

// 리사이즈 이벤트
var gridResizeTimer = null;
window.onresize = function() {
  if (typeof AUIGrid == 'object') {
    if (gridResizeTimer !== null) {
      clearTimeout(gridResizeTimer);
    }

    gridResizeTimer = setTimeout(function () {
      // 그리드 리사이징
      resizeGridAll();
    }, 0);
  }
};

//그리드를 생성할 때 공통적인 사항 작성
if (window.AUIGrid) {
  AUIGrid.defaultProps = {
    rowNumHeaderText: '번호',
    height: 500,
    headerHeight: 36,
    rowHeight: 36,
    hoverMode: "singleRow",
    selectionMode: "singleRow",
    noDataMessage: '조회된 데이터가 없습니다.',
    usePaging: false,
    pagingPanelHeight: 38,
    showPageRowSelect: true,
    pagingInfoLabelFunction: function (currentPage, totalPageCount, currentTopNumber, currentBottomNumber, dataLen) {
      return `${currentPage} / ${totalPageCount} ( ${currentTopNumber}~${currentBottomNumber} )`;
    },
  }
}

var cmi = [
  {
    label: "엑셀다운로드",
    callback: contextItemHandler
  }
];

function contextItemHandler(event) {
  var index = event.contextIndex;
  if (index == 0) {
    gridExcel(event.pid);
  }
}



function gridCheckedDefinedArray(idxName) {
  var items = AUIGrid.getCheckedRowItemsAll(myGridId1);

  var item;

  var param=new Array();
  for(var i=0, len=items.length; i<len; i++) {
    item=items[i];
    if(item[idxName] != 'undefined' && item[idxName] != null) param.push(item[idxName]);
  }

  return param;
}


function gridArrayNormal(idxName,grid) {
  var items = AUIGrid.getGridData(grid);

  var item;

  var param=new Array();
  for(var i=0, len=items.length; i<len; i++) {
    item=items[i];
    param.push(item[idxName]);
  }

  return param;
}


// 엑셀 내보내기 (단일 GRID Export)
function gridExcel(grid) {
  if (!AUIGrid.isAvailableLocalDownload(grid)) {
    alert("로컬 다운로드 불가능한 브라우저 입니다.");
    return false;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const exportProps = [
    {
      fileName: document.title + '_' + year + '_' + month + '_' + date
    }
  ];

  AUIGrid.exportToXlsx(grid, exportProps);
}


// 엑셀 내보내기 (멀티 GRID Export)
function gridExcelMulti(num) {
  if (!AUIGrid.isAvailableLocalDownload(myGridId1)) {
    alert("로컬 다운로드 불가능한 브라우저 입니다.");
    return false;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const exportProps = [
    {
      fileName: document.title + '_' + year + '_' + month + '_' + date
    }
  ];

  const grids = [];
  for (let i = 2; i <= num; i++) {
    grids.push(window['myGridId' + i]); // eval 대신 안전하게 window 객체 참조
  }

  AUIGrid.exportToXlsxMulti(myGridId1, grids, exportProps);
}
