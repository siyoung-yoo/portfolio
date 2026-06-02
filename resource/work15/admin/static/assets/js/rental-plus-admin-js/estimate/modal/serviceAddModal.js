var serviceAddGrid;
var serviceAddBodyGrid;
var serviceAddGridSelectedRow = '';


var serviceAddColumnLayout1 = [
  {headerText:'서비스명',dataField:'CSM_NAME'},
  {headerText:'타입',dataField:'CSM_TYPE_NM',width:100},
  {headerText:'상세설명',dataField:'CSM_MEMO'}
]


var serviceAddColumnLayout2 = [
  {headerText:'상세 상품명',dataField:'GS_NAME'},
  {headerText:'구분',dataField:'P_TYPE2_NAME',width:100},
  {headerText:'입고가',dataField:'GS_COST',width:110,style: 'text-right', dataType:"numeric",autoThousandSeparator:true},
  {headerText:'판매가',dataField:'GS_PRICE',width:110,style: 'text-right', dataType:"numeric",autoThousandSeparator:true},
  {headerText:'주기',dataField:'CSGS_CYCLE',width:80},
  {headerText:'단위',dataField:'CSGS_NUM',width:80},
  {headerText:'최소',dataField:'CSGS_EA_MIN',width:80,style: 'text-right'},
  {headerText:'최대',dataField:'CSGS_EA_MAX',width:80,style: 'text-right'}
]



var serviceAddGridProps = {
  isRowAllCheckCurrentView : true,
  autoGridHeight : false,
  selectionMode: 'singleRow',
  showRowNumColumn: true,
  defaultColumnWidth: 100,
}

serviceAddGrid = AUIGrid.create("#serviceAddHeadGrid", serviceAddColumnLayout1, serviceAddGridProps);
serviceAddBodyGrid = AUIGrid.create("#serviceAddBodyGrid", serviceAddColumnLayout2, serviceAddGridProps);

AUIGrid.bind(serviceAddGrid, "cellClick", function(event) {
  serviceAddGridSelectedRow=event.rowIndex;
  serchServiceBodyData(event.item.CSM_IDX)

});

AUIGrid.bind(serviceAddGrid, "cellDoubleClick", function(event) {
  serviceAddGridSelectedRow=event.rowIndex;
  addServiceToEstimate();
});
resizeGrid(serviceAddGrid);


const serviceAddModal = document.getElementById("serviceAddModal");
serviceAddModal.querySelectorAll("input[data-param]").forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // form submit 방지
      document.getElementById("searchServiceBtn").click(); // 버튼 클릭 이벤트 강제 실행
    }
  });
});

function serchServiceHeadData(){
  AUIGrid.setGridData(serviceAddBodyGrid, []);
  const elements = serviceAddModal.querySelectorAll("[data-param]");
  const serviceAddParams = {};
  for (const el of elements) {
    const key = el.dataset.param;
    const value = el.value;
    serviceAddParams[key] = value;
  }

    loadGridData(serviceAddGrid,'/estimate/selectServiceData.dataTable',serviceAddParams);
}

function serchServiceBodyData(csmIdx){

    loadGridData(serviceAddBodyGrid,'/estimate/serchServiceBodyData.dataTable',{csmIdx});
}

function addServiceToEstimate(){

    if(bindServiceData(AUIGrid.getGridData(serviceAddGrid)[serviceAddGridSelectedRow],AUIGrid.getGridData(serviceAddBodyGrid))){
      //닫기
      closeModal(serviceAddModal);
    }
}
