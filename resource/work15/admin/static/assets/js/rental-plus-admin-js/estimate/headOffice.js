

  let myGridId1, myGridId2;
  const renderer = { type: "TemplateRenderer"};
  const filter = { showIcon: true};

  // 견적 정보 grid setting
  const columnLayout1 = [
    {
      headerText: "견적등록일",
      dataField: "EST_REG_DT",
      filter: filter,
      width: 105,
    },
    {
      headerText: "견적번호",
      dataField: "EST_CODE",
      filter: filter,
      width: 135,
    renderer: {
              type: "TemplateRenderer"
            },
            labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
              if (value) {
                return '<a href="javascript:void(0);" class="btn-link" onclick="location.href=\'/estimate/headOffice/' + item.EST_IDX + '\'">' + value + '</a>';
              }else {
                return '';
              }
            }
    },
    {
      headerText: "견적명",
      dataField: "EST_TITLE",
      filter: filter,
      width: 180,
    },
    {
      headerText: "본사 영업담당자",
      dataField: "VND_USR_NM",
      filter: filter,
      width: 130,
    },
    {
      headerText: "대리점 영업담당자",
      dataField: "EST_USR_NM",
      filter: filter,
      width: 140,
    },
    {
      headerText: "가격구간",
      dataField: "EST_PLAN",
      filter: filter,
      width: 135,
    },
    {
      headerText: "구간할인율",
      dataField: "RRT_RATE",
      filter: filter,
      postfix : "%",
      width: 105,
    },
    {
      headerText: "견적수정여부",
      dataField: "EST_MOD_YN",
      filter: filter,
      dataType:"boolean",
      style: 'text-center',
      width: 115,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value) {
          return '<i class="icon-check"></i>'
        }
      }
    },
    {
      headerText: "최종할인율",
      dataField: "REAL_RATE",
      filter: filter,
      postfix : "%",
      width: 105,
    },
    {
      headerText: "선납여부",
      dataField: "PRE_PAY_YN",
      filter: filter,
      dataType:"boolean",
      style: 'text-center',
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value=='Y') {
          return '<i class="icon-check"></i>'
        }
      }
    },
    {
      headerText: "선납금",
      dataField: "EST_PRE_PAY",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 110,
    },
    {
      headerText: "렌탈료총액",
      dataField: "EST_RNT_AMT",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 120,
    },
    {
      headerText: "계약기간",
      dataField: "EST_PERIOD",
      filter: filter,
      postfix : "개월",
    },
    {
      headerText: "월렌탈료",
      dataField: "EST_PMT",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 110,
    },
    {
      headerText: "최대 수수료",
      dataField: "EST_FELL_AMT",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 110,
    },
    {
      headerText: "공헌이익",
      dataField: "EST_REAL_CON_RT",
      style: 'text-right',
      filter: filter
    },
    {
      headerText: "특별승인여부",
      dataField: "APR_RESULT",
      filter: filter,
      dataType:"boolean",
      style: 'text-center',
      width: 115,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value=="Y") {
          return '<i class="icon-check"></i>'
        }
      }
    },
    {
      headerText: "상태",
      dataField: "EST_STATE_NM",
      filter: filter,
      style: "text-center",
      width: 90,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value == "승인완료") {
          return '<span class="badge badge-rounded badge-default">승인완료</span>'
        } else if (value == "승인요청") {
          return '<span class="badge badge-rounded badge-outline">승인요청</span>'
        } else if (value == "임시저장") {
          return '<span class="badge badge-rounded badge-destructive">임시저장</span>'
        } else if (value == "반려") {
          return '<span class="badge badge-rounded badge-destructive">반려</span>'
        } else if(value=='결재중'){
          return '<span class="badge badge-rounded badge-outline-default">결재중</span>'
        }else{
          return '';
        }
      }
    },
    {
      headerText: "승인일자",
      dataField: "EPR_APPROVAL_DATE",
      filter: filter
    },
    {
      headerText: "유효기간",
      dataField: "EST_VALID_DT",
      filter: filter
    },
    {
      headerText: "견적전송이력",
      dataField: "SEND_YN",
      filter: filter,
      dataType: "boolean",
      style: 'text-center',
      width: 120,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value=='Y') {
          return `<button class="btn btn-sm btn-outline" onclick="openModalTransferHistoryModal(${item.EST_IDX})">전송이력</button>`;
        }else{
          return ''
        }
      }
    },
    {
      headerText: "최종전달일자",
      dataField: "LAST_SEND_DT",
      filter: filter,
      width: 120,
    },
    {
      headerText: "수주여부",
      dataField: "RECIEVE_YN",
      filter: filter,
      dataType:"boolean",
      style: 'text-center',
      width: 110,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value=='Y') {
          return '<i class="icon-check"></i>'
        }
      }
    },
    {
      headerText: "도면",
      dataField: "DOME",
      filter: filter,
      style: 'text-center',
      width: 120,
      renderer: renderer,
      labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
        if (value) {
          return value + ` 건 <button class="btn btn-outline btn-icon ml-1 align-middle" onclick="openModal('drawingInfoModal')"><i class="icon-search w-[12px] h-[12px] bg-size-[12px]"></i></button>`
        }
      }
    },
    {
      headerText: "실적사업소",
      dataField: "COM_MNGEST_NM",
      filter: filter,
      width: 160,
    },
    {
      headerText: "실적대리점",
      dataField: "VND_NM",
      filter: filter,
      width: 130,
    },
    {
      headerText: "고객명",
      dataField: "COM_NAME",
      filter: filter,
      width: 200,
    },
  ];

  const auiGridProps1 = {
    isRowAllCheckCurrentView: true,
    enableSorting: true,
    enableFilter: true,
    useContextMenu: true,
    hoverMode: "singleRow",
    selectionMode: "singleRow",
    showRowNumColumn: true,
    showRowCheckColumn: false,
    defaultColumnWidth: 100,
    softRemoveRowMode: false,
    enableMovingColumn: true,
    usePaging: true,
  };


  myGridId1 = AUIGrid.create("#grid1", columnLayout1, auiGridProps1);
  AUIGrid.bind(myGridId1, "cellDoubleClick", function(event) {
   location.href = '/estimate/headOffice/' + event.item.EST_IDX;
  });
  AUIGrid.bind(myGridId1, "cellClick", function(event) {
    loadGridData(myGridId2,'/estimate/getEstimateHeadItemList.dataTable',{EST_IDX:event.item.EST_IDX});
  });
  /*AUIGrid.setGridData(myGridId1, tempData1);*/


  // 견적 품목 grid setting
  const columnLayout2 = [
    {
      headerText: "그룹(품목)",
      dataField: "ESTG_CAT",
      filter: filter,
      width: 150,
    },
    {
      headerText: "시리즈",
      dataField: "COM_SERIES_NM",
      filter: filter,
      width: 150,
    },
    {
      headerText: "품목코드",
      dataField: "ESTG_ITM_CD",
      filter: filter,
      width: 120,
    },
    {
      headerText: "품목색상",
      dataField: "ESTG_COL_CD",
      filter: filter
    },
    {
      headerText: "품목명",
      dataField: "ITM_NM",
      filter: filter,
      width: 250,
    },
    {
      headerText: "규격",
      dataField: "ESTG_ITM_DESC",
      filter: filter,
      width: 180,
    },
    {
      headerText: "수량",
      dataField: "ESTG_QTY",
      filter: filter,
      width: 85,
    },
    {
      headerText: "렌탈소비자가",
      dataField: "ESTG_RNT_UP",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 120,
    },
    {
      headerText: "렌탈소비자가총액",
      dataField: "ESTG_RNT_AMT",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 140,
    },
    {
      headerText: "할인율",
      dataField: "ESTG_NET_DC_RT_FINAL",
      filter: filter,
      dataType:"numeric",
      postfix : "%",
      width: 85,
    },
    {
      headerText: "견적단가",
      dataField: "ESTG_NET_UP",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 120,
    },
    {
      headerText: "견적총액",
      dataField: "ESTG_NET_AMT",
      filter: filter,
      dataType:"numeric",
      style: 'text-right',
      width: 120,
    },
    {
      headerText: "공급브랜드",
      dataField: "BRAND_NM",
      filter: filter,
      width: 120,
    },
    {
      headerText: "비고",
      dataField: "ESTG_MEMO",
      filter: filter,
      width: 150,
    },
  ];

  const auiGridProps2 = {
    isRowAllCheckCurrentView: true,
    enableSorting: true,
    enableFilter: true,
    useContextMenu: true,
    hoverMode: "singleRow",
    selectionMode: "singleRow",
    showRowNumColumn: true,
    showRowCheckColumn: false,
    defaultColumnWidth: 100,
    softRemoveRowMode: false,
    enableMovingColumn: true,
    showFooter: true,
    footerHeight: 36,
  };

  const footerLayout2 = [
    {
      labelText: "합계",
      positionField: "#base",
    },
    {
      dataField: "ESTG_QTY",
      positionField: "ESTG_QTY",
      operation: "SUM",
      formatString: "#,##0",
    },
    {
      dataField: "ESTG_RNT_UP",
      positionField: "ESTG_RNT_UP",
      operation: "SUM",
      formatString: "#,##0",
      style: "text-right",
    },
    {
      dataField: "ESTG_RNT_AMT",
      positionField: "ESTG_RNT_AMT",
      operation: "SUM",
      formatString: "#,##0",
      style: "text-right",
    },
    {
      dataField: "ESTG_NET_DC_RT_FINAL",
      positionField: "ESTG_NET_DC_RT_FINAL",
      operation: "SUM",
      postfix : "%"
    },
    {
      dataField: "ESTG_NET_UP",
      positionField: "ESTG_NET_UP",
      operation: "SUM",
      formatString: "#,##0",
      style: "text-right",
    },
    {
      dataField: "ESTG_NET_AMT",
      positionField: "ESTG_NET_AMT",
      operation: "SUM",
      formatString: "#,##0",
      style: "text-right",
    }
  ];


  myGridId2 = AUIGrid.create("#grid2", columnLayout2, auiGridProps2);
  AUIGrid.setFooter(myGridId2, footerLayout2);



    function searchEstimateList(){
      const elements = document.querySelectorAll("[data-param]");
      // 객체로 변환
      const rentalListParams = {};
      for(let el of elements){
        const key = el.dataset.param;
        const value = el.value;
        rentalListParams[key] = value;
      }
       AUIGrid.setGridData(myGridId2, []);
      loadGridData(myGridId1,'/estimate/getEstimateHeadList.dataTable',rentalListParams);
    }

    function registEstimate(){
      location.href="/estimate/regist-basic"
    }

      document.addEventListener("DOMContentLoaded", () => {
        AUIGrid.setGridData(myGridId1, []);
      })


    function openModalTransferHistoryModal(estIdx){
    openModal('transferHistoryModal');
         fetchJson('/estimate/transferHistoryModal.ajax','POST',
          {
            EST_IDX: estIdx
          }).then((data)=>{
             const tbody = document.getElementById("transferHistoryTbody");
              tbody.innerHTML = ""; // 기존 내용 초기화

              data.data.forEach((item, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                  <td>${index + 1}</td>
                  <td>${item.type}</td>
                  <td>${item.MSL_TO}</td>
                  <td>${item.CREATED_DATE}</td>
                  <td>${item.CREATED_BY}</td>
                  <td>
                    ${item.MSL_STATE === '성공'
                      ? '<span class="badge badge-default badge-rounded">성공</span>'
                      : '<span class="badge badge-destructive badge-rounded">실패</span>'}
                  </td>
                `;

                tbody.appendChild(tr);
              });
          })
    }
