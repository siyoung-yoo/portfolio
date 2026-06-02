let addrIdx=-1;
let bundleIdx = -1;
var nomalGridSelectedRow = '';
var custGridSelectedRow = '';
var nomalProductAddGrid;
var custItmAddGrid;
var custItmDtlAddGrid;
let tabId="prodAddTab_1";
const modal = document.getElementById("productAddModal");
let setModalId = "";

function openProductAddModal(modalId,addrIdxParam,bundleIdxParam){
  if (!modal) return;

  if (!modal.classList.contains("is-open")) {
    modal.classList.add("is-open");
    openModalCount++;
  }
  setModalId = modalId;
  if (openModalCount === 1) {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "15px";
  }
  addrIdx = addrIdxParam;
  bundleIdx = bundleIdxParam;
  resizeGridAll();
}
const productAddModal = document.getElementById("productAddModal");
productAddModal.querySelectorAll("input[data-param]").forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // form submit 방지
      document.getElementById("searchProductBtn").click(); // 버튼 클릭 이벤트 강제 실행
    }
  });
});

var productAddColumnLayout = [
  {headerText:'세트여부',dataField:'SET_YN',width:80,editable: false, renderer: {type: "TemplateRenderer"}, labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
      if(item.SET_YN==='S'){
        return '세트'
      }else{
        return '단품'
      }
      return '<button type="button"  class="btn-link" onclick="kakaoDetailPop('+item.TF_IDX+')">'+value+'</button>';
    }},
  {headerText:'시리즈',dataField:'COM_SERIES_NM',width:140,editable: false},
  {headerText:'품목코드',dataField:'ITM_CD',width:120,editable: false},
  {headerText:'색상',dataField:'COL_CD',width:80,editable: false},
  {headerText:'품목명',dataField:'ITM_NM',width:250,editable: false},
  {headerText:'규격',dataField:'ITM_DESC',width:120,editable: false},
  {
    headerText:'수량',
    dataField:'ITM_QTY',
    width:130,
    renderer:{
      type: "TemplateRenderer"
    },
    editable:false,
    labelFunction: function (rowIndex, columnIndex, value, headerText, item, dataField, cItem) { // HTML 템플릿 작성
      const width = cItem.width - 30;
      let formattedValue=formatNumberWithCommas(value||0)
      return (`
        <input type="text"
        enterkeyhint="done"
        class="input"
        style="width: ${width}px;text-align:right"
        value="${formattedValue}"
        onblur="changeProductData(this,${rowIndex})">
      `);
    }
  },
  {headerText:'렌탈소가',dataField:'RBO_RTC_PRICE',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'렌탈소가 총액',dataField:'RBO_RTC_PRICE_TOTAL',width:115,editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {
    headerText:'인수담보부',
    dataField:'INSU_YN',
    editable: false,
    style: "text-center",
    renderer: {
      type: "TemplateRenderer"
    },
    labelFunction: function (rowIndex, columnIndex, value) {
      if (value === "Y") {
        return '<i class="icon-check"></i>';
      }  if (value === "N") {
        return '';
      }
      return value;
    }
  },
/*  {headerText:'입고가',dataField:'IOP_INPCST',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'입고가 총액',dataField:'IOP_INPCST_TOTAL',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'공장도가',dataField:'IOP_MNFCST',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'공장도가 총액',dataField:'IOP_MNFCST_TOTAL',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },*/
  {headerText:'기준단가',dataField:'GIJUN_CST',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'기준단가 총액',dataField:'GIJUN_CST_TOTAL',width:115,editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'소비자가',dataField:'IOP_SALCST',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'소비자가 총액',dataField:'IOP_SALCST_TOTAL',width:115,editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'품목구분',dataField:'COM_STDSEC_NM',editable: false},
  {headerText:'재고구분',dataField:'COM_STKSEC_NM',width:85,editable: false},
  {
    headerText:'벌크여부',
    dataField:'BLK_YN',
    width:85,
    editable: false,
    style: "text-center",
    renderer: {
      type: "TemplateRenderer"
    },
    labelFunction: function (rowIndex, columnIndex, value) {
      if (value === "Y") {
        return '<i class="icon-check"></i>';
      }  if (value === "N") {
        return '';
      }
      return value;
    }
  },
]



var custProductDtlAddColumnLayout = [
  {headerText:'구분',dataField:'SET_YN',editable: false},
  {headerText:'품목코드',dataField:'ITM_CD',editable: false},
  {headerText:'색상',dataField:'COL_CD',editable: false},
  {headerText:'품목명',dataField:'ITM_NM',width:250,editable: false},
  {headerText:'규격',dataField:'ITM_DESC',editable: false},
  {headerText:'수량',dataField:'ITM_QTY'
      ,editable: true
      ,editRenderer: {
        type: "InputEditRenderer",
        autoThousandSeparator: true,
        inputMode: 'numeric',dataType:"numeric",autoThousandSeparator:true,
        onlyNumeric: true, // Input 에서 숫자만 가능케 설정
        // 에디팅 유효성 검사
        validator: function (oldValue, newValue, item) {
          var isValid = false;
          var numVal = Number(newValue.toString().replaceAll(',',''));
          if (!isNaN(numVal)) {
            isValid = true;
          }
          // 리턴값은 Object 이며 validate 의 값이 true 라면 패스, false 라면 message 를 띄움
          return { "validate": isValid, "message": "숫자를 입력해주세요." };
        }
      }
    },
  {headerText:'렌탈소가',dataField:'RBO_RTC_PRICE',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'렌탈소가 총액',dataField:'RBO_RTC_PRICE_TOTAL',editable: false,dataType:"numeric",autoThousandSeparator:true, width: 120,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'인수담보부',dataField:'INSU_YN',editable: false},
/*  {headerText:'입고가',dataField:'IOP_INPCST',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'입고가 총액',dataField:'IOP_INPCST_TOTAL',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'공장도가',dataField:'IOP_MNFCST',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'공장도가 총액',dataField:'IOP_MNFCST_TOTAL',editable: false,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },*/
  {headerText:'기준단가',dataField:'GIJUN_CST',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'기준단가 총액',dataField:'GIJUN_CST_TOTAL',editable: false,dataType:"numeric",autoThousandSeparator:true, width: 120,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'소비자가',dataField:'IOP_SALCST',editable: false,dataType:"numeric",autoThousandSeparator:true,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  },
  {headerText:'소비자가 총액',dataField:'IOP_SALCST_TOTAL',editable: false,dataType:"numeric",autoThousandSeparator:true, width: 120,
    styleFunction: function (rowIndex, item) {
      return "text-right";
    }
  }
]


var custProductAddColumnLayout = [
  {headerText:'의뢰일자',dataField:'reqSysDt',editable: false},
  {headerText:'의뢰번호',dataField:'reqCd',editable: false},
  {headerText:'의뢰별칭',dataField:'reqNm',editable: false},
  {headerText:'의뢰구분',dataField:'reqTypeNm',editable: false},
  {headerText:'유효기간',dataField:'dueDt',editable: false}
]

/*
"sysCd" -> "U01003"
"brandCd" -> "T60F01"
"vndCd" -> "FC0003"
"userId" -> "hyewon_f7"
"reqCd" -> "F20260100033"
"reqSysDt" -> "2026-01-16T16:30:20.663"
"seq" -> "1"
"itmKnd" -> "단품"
"itmCd" -> "COIFDD260003"
"colCd" -> "WW"
"itmNm" -> "[셀프커스텀]테스트0108(CTSDDT01) W1200*D700*H720/WIDTH/DEP"
"priceRate" -> "U13GNR"
"priceRateNm" -> "일반"
"customCd" -> null
"customNm" -> null
"reqQuantity" -> "3"
"mnfcst" -> "11000.00"
"gijunCst" -> "12000.00"
"salcst" -> "17000.00"
"comCurrency" -> null
"vndPrice2" -> null
"listPrice" -> null
"dueDt" -> ""
"size" -> "1200.000*700.000*720.000"
"deliveryDueDays" -> "22"
"CHK" -> "0"
"CNT" -> "0"*/




var productAddGridProps = {
  editable: true,
  selectionMode: "singleCell",
  showRowCheckColumn: true,
  softRemoveRowMode: false,
  showRowAllCheckBox: false,
  independentAllCheckBox: true,
  enableSorting: true,
  enableFilter: true,
  showRowNumColumn: false,
  editingOnKeyDown: true,
  showEditedCellMarker: false,
  showEditedCellStyle: false,
  defaultColumnWidth: 100,
}

var custProductAddGridProps = {
  editable: false,
  selectionMode: "singleCell",
  showRowCheckColumn: false,
  softRemoveRowMode: false,
  showRowAllCheckBox: false,
  independentAllCheckBox: true,
  enableSorting: true,
  enableFilter: true,
  showRowNumColumn: true,
  editingOnKeyDown: false,
  showEditedCellMarker: false,
  showEditedCellStyle: false,
}



nomalProductAddGrid = AUIGrid.create("#nomalProductAddGrid", productAddColumnLayout, productAddGridProps);
custItmAddGrid = AUIGrid.create("#custItmAddGrid", custProductAddColumnLayout, custProductAddGridProps);
custItmDtlAddGrid = AUIGrid.create("#custItmDtlAddGrid", custProductDtlAddColumnLayout, productAddGridProps);

AUIGrid.bind(nomalProductAddGrid, "cellEditEnd", function(event) {
  const { rowIndex, dataField, value } = event;
  if (dataField === "ITM_QTY") {
    const rowItem = AUIGrid.getGridData(nomalProductAddGrid)[rowIndex];
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "RBO_RTC_PRICE_TOTAL", (Number(rowItem.RBO_RTC_PRICE) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_INPCST_TOTAL", (Number(rowItem.IOP_INPCST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_MNFCST_TOTAL", (Number(rowItem.IOP_MNFCST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "GIJUN_CST_TOTAL", (Number(rowItem.GIJUN_CST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_SALCST_TOTAL", (Number(rowItem.IOP_SALCST) || 0) * value);

  }

});



function changeProductData(obj,rowIndex){

    let value = (obj.value+"").replace(/[^0-9]/g, "");
    const rowItem = AUIGrid.getGridData(nomalProductAddGrid)[rowIndex];
    if(value){
      AUIGrid.addCheckedRowsByIds(nomalProductAddGrid, rowItem[AUIGrid.getProp(nomalProductAddGrid, "rowIdField")])
    }else{
      AUIGrid.addUncheckedRowsByIds(nomalProductAddGrid, rowItem[AUIGrid.getProp(nomalProductAddGrid, "rowIdField")])
    }

    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "ITM_QTY", value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "RBO_RTC_PRICE_TOTAL", (Number(rowItem.RBO_RTC_PRICE) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_INPCST_TOTAL", (Number(rowItem.IOP_INPCST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_MNFCST_TOTAL", (Number(rowItem.IOP_MNFCST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "GIJUN_CST_TOTAL", (Number(rowItem.GIJUN_CST) || 0) * value);
    AUIGrid.setCellValue(nomalProductAddGrid, rowIndex, "IOP_SALCST_TOTAL", (Number(rowItem.IOP_SALCST) || 0) * value);

}

/*AUIGrid.bind(nomalProductAddGrid, "cellClick", function(event) {
  nomalGridSelectedRow=event.rowIndex;
});

AUIGrid.bind(nomalProductAddGrid, "cellDoubleClick", function(event) {
  nomalGridSelectedRow=event.rowIndex;
  doSelectedDataNomalProduct();
});*/
resizeGrid(nomalProductAddGrid);
resizeGrid(custItmAddGrid);
resizeGrid(custItmDtlAddGrid);


function doSelectedDataNomalProduct() {
  // 선택 버튼 로직
  var rowData = AUIGrid.getCheckedRowItemsAll(nomalProductAddGrid);

  const el = document.getElementById('prodAddTab2');
  if(el && el.classList.contains('is-active')){
    rowData = AUIGrid.getCheckedRowItemsAll(custItmDtlAddGrid);
  }


  if (!rowData || rowData.length == 0) {
    alert('상품을 선택해주세요.')
    return false;
  }
  let checkRboRtcPrice = false;
  rowData.forEach(item => {
    if(!item.RBO_RTC_PRICE){
      checkRboRtcPrice = true;
    }
    item.GS_AMT_UNIT = 1000;
    item.GS_AMT_ROUND = "ROUND";
  });
  if(checkRboRtcPrice){
    alert('렌탈소가가 없는 품목은 견적 추가가 불가합니다.')
    return false;
  }


  planData=[]
  rboEstimate["EST_PLAN"]='';
  let addProductFlag = true;
  if(setModalId=='productAddModal'){
    addProductFlag = setSelectedProductAdd(rowData,addrIdx,bundleIdx);
  }else if(setModalId=='estimateByProductModal'){
    addProductFlag = setSelectedProductModalAdd(rowData,addrIdx,bundleIdx);
  }

  if(!addProductFlag){
    alert('같은 주소,분류에 동일한 상품은 추가 할 수 없습니다.')
    return false;
  }

  closeModal(modal);
}

document.getElementById("searchProductBtn").addEventListener("click", () => {
  nomalGridSelectedRow = '';
  // 모든 data-param 속성을 가진 요소 찾기
  const elements = productAddModal.querySelectorAll("[data-param]");

  // 객체로 변환
  const productAddParams = {};
/*  const rules = {
    itmCd: "품목코드 값은 최소 2글자 이상 입력해야 합니다.",
    itmNm: "품목명 값은 최소 2글자 이상 입력해야 합니다."
  };
  for (const el of elements) {
    const key = el.dataset.param;
    const value = el.value;

    if (rules[key] && value.length <= 1) {
      alert(rules[key]);
      return; // 여기서는 전체 함수 종료
    }*/
  for (const el of elements) {
    const key = el.dataset.param;
    const value = el.value;
    productAddParams[key] = value;
  }
  if(!productAddParams["comSeries"]&&productAddParams["itmCd"].length <= 1&&productAddParams["itmNm"].length <= 1){
    alert('시리즈가 전체인 경우 품목코드 혹은 품목명은 최소 2글자 이상 입력해야 합니다.')
    return false;
  }
  loadGridData(nomalProductAddGrid,'/estimate/productAdd.dataTable',productAddParams);
});

document.getElementById("searchCustBtn").addEventListener("click", () => {
  custGridSelectedRow = '';

  const elements = productAddModal.querySelectorAll("[data-cust-param]");

  const productAddParams = {};
  const rules = {
    /*searchText: "의뢰명은 최소 2글자 이상 입력해야 합니다."
    ,*/productSearchDate:"조회 일자는 필수값입니다."
    // itmNm: "품목명 값은 최소 2글자 이상 입력해야 합니다."
  };

  for (const el of elements) {
    const key = el.dataset.custParam;
    const value = el.value;

    if (rules[key] && value.length <= 1) {
      alert(rules[key]);
      return; // 전체 함수 종료
    }
  }
  for (const el of elements) {
    const key = el.dataset.custParam;
    const value = el.value;
    productAddParams[key] = value;
  }
  productAddParams["CTM_CD"] = rboEstimate["CTM_CD"]
  loadGridData(custItmAddGrid, '/estimate/selectCustItm.dataTable', productAddParams);
});
productAddModal.querySelectorAll("input[data-cust-param]").forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // form submit 방지
      document.getElementById("searchCustBtn").click(); // 버튼 클릭 이벤트 강제 실행
    }
  });
});

AUIGrid.bind(custItmAddGrid, "cellClick", function(event) {
  loadGridData(custItmDtlAddGrid, '/estimate/selectCustItmDtl.dataTable', AUIGrid.getGridData(custItmAddGrid)[event.rowIndex]);
});

function productAddGridResize(param){
  if(param !==tabId){
    tabId=param;
    if(param=='prodAddTab_1'){
      resizeGrid(nomalProductAddGrid);
    }else{
      resizeGrid(custItmAddGrid);
      resizeGrid(custItmDtlAddGrid);
    }
  }


}
