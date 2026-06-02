
var supplyChainGridId1;

var supplyChainColumnLayout1 = [
/*  {headerText:'실적사업소',dataField:'COM_MNGEST_NM'},
  {headerText:'실적대리점',dataField:'VND_NM'},*/
  {headerText:'사업자명',dataField:'CTM_NM',width:150},
  {headerText:'사업자등록번호',dataField:'CTM_LSCNO',width:115},
  {headerText:'영업담당자',dataField:'USR_NM'},
  {headerText:'영업건명',dataField:'LEGACY_OPPTY_NM',width:250},
  {headerText:'예상금액',dataField:"OPPTY_AMT",style:'text-right',width:115,dataType:"numeric",autoThousandSeparator:true},
  {headerText:'예상인원',dataField:"OPPTY_QTY",width:85,style:'text-right',dataType:"numeric",autoThousandSeparator:true},
  {headerText:'영업종료일',dataField:'ESTIMATE_CLOSE_DATE',
    labelFunction: function(rowIndex, columnIndex, value) {
      if (!value || value.length !== 8) return null;
        const year  = value.substring(0, 4);
        const month = value.substring(4, 6);
        const day   = value.substring(6, 8);
        return `${year}-${month}-${day}`;
    }
  },
  {headerText:'세부유형',dataField:'SALES_SUB_TYPE',width:120},
  {
    headerText: '등록일',
    dataField: 'FST_SYS_DT',
    width: 150,
    labelFunction: function(rowIndex, columnIndex, value) {
       const d = new Date(value);
       const yyyy = d.getFullYear();
       const mm   = String(d.getMonth() + 1).padStart(2, '0');
       const dd   = String(d.getDate()).padStart(2, '0');
       const HH   = String(d.getHours()).padStart(2, '0');
       const MM   = String(d.getMinutes()).padStart(2, '0');
       const SS   = String(d.getSeconds()).padStart(2, '0');
       return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
    }
  }
]

var supplyChainGridProps = {
  isRowAllCheckCurrentView : true,
  autoGridHeight : false,
  selectionMode: 'singleRow',
  showRowNumColumn: true,
  defaultColumnWidth: 100,
}
var supplyChainGridSelectedRow = '';

supplyChainGridId1 = AUIGrid.create("#supplyChainGrid", supplyChainColumnLayout1, supplyChainGridProps);
AUIGrid.bind(supplyChainGridId1, "cellClick", function(event) {
  supplyChainGridSelectedRow=event.rowIndex;
});

AUIGrid.bind(supplyChainGridId1, "cellDoubleClick", function(event) {
  supplyChainGridSelectedRow=event.rowIndex;
  doSelectedDataSupplyChain();
});
resizeGrid(supplyChainGridId1);
const supplyModal = document.getElementById("supplyChainModal");
document.getElementById("searchSupplyChainBtn").addEventListener("click", () => {

  supplyChainGridSelectedRow = '';
  const elements = supplyModal.querySelectorAll("[data-param]");
  AUIGrid.showAjaxLoader(supplyChainGridId1);
  const supplyChainParams = {};
  for(let el of elements){
    const key = el.dataset.param;
    const value = el.value;
    if (key === "cmpSearchText" && value.length <= 1) {
      alert("검색어 값은 최소 2글자 이상 입력해야 합니다.");
      AUIGrid.removeAjaxLoader(supplyChainGridId1);
      return;
    }
    supplyChainParams[key] = value;
  }
  if(rboEstimateData&&rboEstimateData["EST_M_IDX"]){
    supplyChainParams["CTM_LSCNO"]=rboEstimateData["CTM_LSCNO"]
  }
  loadGridData(supplyChainGridId1,'/estimate/supplyChain.dataTable',supplyChainParams);
});

supplyModal.querySelectorAll("input[data-param]").forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("searchSupplyChainBtn").click();
    }
  });
});

function doSelectedDataSupplyChain() {
  if (!supplyChainGridSelectedRow && supplyChainGridSelectedRow !== 0) {
    alert('영업건을 선택해주세요.')
    return false;
  }

  fetchJson('/custInfoMng/selectCorpDbListApi.dataTable?corpNo='+
  AUIGrid.getGridData(supplyChainGridId1)[supplyChainGridSelectedRow].CTM_LSCNO
  ,'POST',{}).then((data)=>{
    fetchJson('/estimate/calculateApr.ajax','POST',{CTM_LSCNO:AUIGrid.getGridData(supplyChainGridId1)[supplyChainGridSelectedRow].CTM_LSCNO})
    .then((data)=>{
      rboEstimate["APR_LIMIT_AMT"] = data.APR_LIMIT_AMT
      rboEstimate["APR_REMAIN_RENT_AMT"] =data.APR_REMAIN_RENT_AMT
      rboEstimate["M_RENTAL_TOTAL"] =data.M_RENTAL_TOTAL
      rboEstimate["EVALUATION_GRADE"] = data.APR_GRADE=='C'||data.APR_GRADE=='F'?'불가능':'가능'
      if(AUIGrid.getGridData(supplyChainGridId1)[supplyChainGridSelectedRow]["CTM_LSCNO"]!==rboEstimate["CTM_LSCNO"]){
        planData = [];
        rboEstimate["EST_PLAN"] = '';
      }
      setRboEstimate(AUIGrid.getGridData(supplyChainGridId1)[supplyChainGridSelectedRow]);
      const modal = document.getElementById("supplyChainModal");
      closeModal(modal);

    })
  });

}
function openModalSupplyChainModal(){
    const requiredChecks = document.querySelectorAll('[data-param="cmpSearchDate"]');
    requiredChecks[0].value=getRangeString()
    const requiredChecks2 = document.getElementById('cmpSearchfilter');
    requiredChecks2.setValue('CTM_NM');
    const requiredChecks3 = document.querySelectorAll('[data-param="cmpSearchText"]');
    requiredChecks3[0].value=''
    AUIGrid.setGridData(supplyChainGridId1, []);
    openModal('supplyChainModal');
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRangeString() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const start = formatDate(oneMonthAgo);
  const end = formatDate(today);

  return `${start} ~ ${end}`;
}
