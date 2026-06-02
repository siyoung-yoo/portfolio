   let myGridId;

    let renderer = {
        type: "TemplateRenderer"
    };

    let filter = {
        showIcon: true
    };

    const columnLayout1 = [
      {
        headerText: "채권원장번호",
        dataField: "M_NUM",
        width: 130
      },
      {
        headerText: "개시일자",
        dataField: "M_COMPLETE_DATE"
      },
      {
        headerText: "계약건명",
        dataField: "CON_TITLE",
        width: 250
      },
      {
        headerText: "고객명",
        dataField: "M_CT_NAME",
        width: 150
      },
      {
        headerText: "영업건명",
        dataField: "OPPTY_NM",
        width: 250
      },
      {
        headerText: "우편번호",
        dataField: "ESTA_POST",
        width: 80
      },
      {
        headerText: "주소",
        dataField: "ESTA_ADR4",
        width: 250,
      },
    ];

    const auiGridProps1 = {
        enableSorting: true,
        enableFilter: true,
        showRowNumColumn: true,
        softRemoveRowMode: false,
        defaultColumnWidth: 100,
        usePaging: true,
        pageRowCount: 10,
        rowHeight: 34,
        height: 450
    };

    document.addEventListener("DOMContentLoaded", function() {
      myGridId = AUIGrid.create("#relatedContractGrid", columnLayout1, auiGridProps1);

      AUIGrid.bind(myGridId, "cellDoubleClick", function(event) {
      if(event.item.M_COMPLETE_DATE){
        const targetDate = new Date(event.item.M_COMPLETE_DATE);
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1); // 내일 자정
        if(targetDate < tomorrow){
           location.href = '/estimate/relatedContractRegist/' + event.item.M_EST_IDX+ '/' + event.item.M_IDX + '/' + event.item.ESTA_IDX;
           return
        }else{
          alert(`렌탈 계약이 개시되지 않았습니다. ${event.item.M_COMPLETE_DATE} 이후로 가능합니다.`);
        }

      }
      });
    })
function setRelatedContract() {
  const selectedRows = AUIGrid.getSelectedRows(myGridId);

  if (selectedRows.length === 0) {
    alert("선택된 행이 없습니다.");
    return;
  }
  const item = selectedRows[0]; // singleRow 모드라 첫 번째만 사용
  if(item.M_COMPLETE_DATE){
    const targetDate = new Date(item.M_COMPLETE_DATE);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1); // 내일 자정
     if(targetDate < tomorrow){
      location.href = '/estimate/relatedContractRegist/'
         + item.M_EST_IDX + '/'
         + item.M_IDX + '/'
         + item.ESTA_IDX;
     }else{
       alert(`렌탈 계약이 개시되지 않았습니다. ${item.M_COMPLETE_DATE} 이후로 가능합니다.`);
     }
  }



}


function searchRelatedContract(){
    const elements = document.querySelectorAll("[data-param]");

      // 객체로 변환
      const relatedContractParams = {};
      for(let el of elements){
        const key = el.dataset.param;
        const value = el.value;
        relatedContractParams[key] = value;
      }
      if((!relatedContractParams['M_NUM']||relatedContractParams['M_NUM'].length<2)&&(!relatedContractParams['OPPTY_NM']||relatedContractParams['OPPTY_NM'].length<2)
      &&(!relatedContractParams['CTM_NM']||relatedContractParams['CTM_NM'].length<2)
      ){
        alert('조회 조건 2글자 이상 입력 후 조회 가능합니다.');
        return false;
      }
      loadGridData(myGridId,'/estimate/getContractForEstimateList.dataTable',relatedContractParams);
}
