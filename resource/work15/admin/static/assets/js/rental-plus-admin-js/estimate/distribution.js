const salesAgntSelect = document.getElementById("salesAgntSelect");
const selectEl = salesAgntSelect.querySelector("select");


      var estimateListColumnLayout1 = [
        {headerText:'견적등록일',dataField:'EST_REG_DT', filter: {showIcon: true}, width: 105},
        {headerText:'견적번호',dataField:'EST_CODE',filter: {showIcon: true},width:135
          ,renderer: {
            type: "TemplateRenderer"
          },
          labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
            if (value) {
              return '<a href="javascript:void(0);" class="btn-link" onclick="location.href=\'/estimate/distribution/' + item.EST_IDX + '\'">' + value + '</a>';
            }else {
              return '';
            }
          }
        },
        {headerText:'견적명',dataField:'EST_TITLE',filter: {showIcon: true},width:180},
        {headerText:'영업담당자',dataField:'EST_USR_NM',filter: {showIcon: true},width: 105},
        {headerText:'가격구간',dataField:'EST_PLAN',filter: {showIcon: true},width:150},
        {
          headerText: '선납여부',
          dataField: 'PRE_PAY_YN',
          filter: {
            showIcon: true
          },
          width: 95,
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
        {headerText:'선납금',dataField:'EST_PRE_PAY',filter: {showIcon: true},dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:125},
        {headerText:'렌탈료 총액',dataField:'EST_RNT_AMT',filter: {showIcon: true},dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:125},
        {headerText:'계약기간',dataField:'EST_PERIOD',filter: {showIcon: true},width:95,postfix:"개월"},
        {headerText:'월렌탈료',dataField:'EST_PMT',filter: {showIcon: true},dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:125},
        {headerText:'최대수수료',dataField:'EST_FELL_AMT',filter: {showIcon: true},dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:125},
        {
          headerText: '특별승인여부',
          dataField: 'APR_RESULT',
          filter: {
            showIcon: true
          },
          style: "text-center",
          width: 115,
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
        {
          headerText: '상태',
          dataField: 'EST_STATE_NM',
          filter: {
            showIcon: true
          },
          width: 90,
          style: "text-center",
          renderer: {
            type: "TemplateRenderer"
          },
          labelFunction: function (rowIndex, columnIndex, value) {
            if (value === "임시저장") {
              return '<span class="badge badge-rounded badge-outline">임시저장</span>';
            }
            if (value === "승인요청") {
              return '<span class="badge badge-rounded badge-outline">승인요청</span>';
            }
            if (value === "결재중") {
              return '<span class="badge badge-rounded badge-outline-default">결재중</span>';
            }
            if (value === "반려") {
              return '<span class="badge badge-rounded badge-destructive">반려</span>';
            }
            if (value === "승인완료") {
              return '<span class="badge badge-rounded badge-default">승인완료</span>';
            }
            if (value === "삭제예정") {
              return '<span class="badge badge-rounded badge-destructive-outline">삭제예정</span>';
            }
            return value;
          }
        },
        {headerText:'승인일자',dataField:'EPR_APPROVAL_DATE',filter: {showIcon: true}},
        {headerText:'유효기간',dataField:'EST_VALID_DT',filter: {showIcon: true}},
         {headerText:'견적서',
                  dataField: "EST_STATE_SEND",
                  dataType:"boolean",
                  filter: {
                    showIcon: true
                  },
                  width: 85,
                  renderer: renderer,
                  labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
                     if (value=='Y') {
                       return `<div class="flex justify-center"><button class="btn btn-sm btn-outline" onclick="openEstimateFormPop(${item.EST_IDX})">
                         보기
                      </button></div>`;
                     }else{
                       return ''
                     }
                  }
              },
        {headerText:'최종전송일자',dataField:'LAST_SEND_DT',filter: {showIcon: true},width:115},
    /*    {
          headerText: '전송여부',
          dataField: 'SEND_YN',
          filter: {
            showIcon: true
          },
          width:95,
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
        },*/
        {headerText:'전송이력',
            dataField: "SEND_YN",
            dataType:"boolean",
            filter: {
              showIcon: true
            },
            width: 95,
            renderer: renderer,
            labelFunction: function (rowIndex, columnIndex, value, headerText, item) {
               if (value=='Y') {
                 return `<div class="flex justify-center"><button class="btn btn-icon" onclick="openModalTransferHistoryModal(${item.EST_IDX})">
                  <i class="icon-search w-[16px] h-[16px] bg-size-[16px]"></i>
                </button></div>`;
               }else{
                 return ''
               }
            }
        },
        {
          headerText: '수주여부',
          dataField: 'RECIEVE_YN',
          filter: {
            showIcon: true
          },
          width: 95,
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
        {
          headerText:'도면',
          dataField:'DOME',
          filter: {
            showIcon: true
          },
          width: 90,
          renderer: {
            type: "TemplateRenderer"
          },
          labelFunction: function (rowIndex, columnIndex, value) {
            if (value) {
              return value + ` 건 <button class="btn btn-outline btn-icon ml-1 align-middle" onclick=""><i class="icon-search w-[12px] h-[12px] bg-size-[12px]"></i></button>`
            }
          }
        },
        {headerText:'고객명',dataField:'CTM_NM', filter: {showIcon: true}, width: 150},
      ]

      const estimateListGridProps = {
        isRowAllCheckCurrentView : true,
        autoGridHeight : false,
        showRowNumColumn: true,
        defaultColumnWidth: 100,
        usePaging: true,
        pageRowCount: 10,
        height: 460,
        enableSorting: true,
        enableFilter: true,
        enableMovingColumn: true,
      }
      var estimateListGrid = AUIGrid.create("#estimateListGrid", estimateListColumnLayout1, estimateListGridProps);
      AUIGrid.bind(estimateListGrid, "cellDoubleClick", function(event) {
       location.href = '/estimate/distribution/' + event.item.EST_IDX;
      });
       AUIGrid.setGridData(estimateListGrid, []);



      document.addEventListener("DOMContentLoaded", () => {
        salesAgntList.forEach(agent => {
          salesAgntSelect.addOption(agent.CEP_NM,agent.CEP_NM);
        });
      });



    // 카드 체크 상태 함수
    function cardState(checkbox) {
      const card = checkbox.closest(".card-check");
      if (!card) return;

      card.classList.toggle("border-primary-500", checkbox.checked);
      card.classList.toggle("bg-primary-50", checkbox.checked);
    }

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll('.card-check input[type="checkbox"]')
        .forEach(cardState);
    });

    document.addEventListener("change", (e) => {
      const checkbox = e.target.closest('.card-check input[type="checkbox"]');
      if (!checkbox) return;
      cardState(checkbox);
    });

    function searchRentalList(){
      const beforeSendListContainer = document.getElementById("beforeSendList");
      beforeSendListContainer.innerHTML = "";
      const elements = document.querySelectorAll("[data-param]");
      // 객체로 변환
      const rentalListParams = {};
      for(let el of elements){
        const key = el.dataset.param;
        const value = el.value;
        rentalListParams[key] = value;
      }
      loadGridData(estimateListGrid,'/estimate/getEstimateList.dataTable',rentalListParams)
      .then(data => {
        const stateCount = data.reduce((acc, row) => {
          const state = row.EST_STATE || 'UNKNOWN';
          acc[state] = (acc[state] || 0) + 1;
          return acc;
        }, {});
        Object.entries(stateCount).forEach(([state, value]) => {
          const el = document.getElementById(state + "_COUNT");
          if (el) {
            el.textContent = value;
          }
        });
        const filtered = data.filter(item => item.SEND_YN === "N"&& item.EST_STATE === "CONFIRMED");
        filtered.forEach(item => {
          const label = document.createElement("label");
          label.className = "card card-check cursor-pointer";

          label.innerHTML = `
            <div class="card-content p-4 flex flex-col gap-2">
              <p class="text-sm">${item.CTM_NM}</p>
              <p class="font-medium">${item.EST_TITLE}</p>
              <span class="text-sm text-muted-foreground">
                등록 ${item.EST_REG_DT_TEXT} 승인 ${item.MODIFIED_DATE}
              </span>
            </div>
          `;
           label.addEventListener("dblclick", () => {
              openEstimateFormPop(item.EST_IDX); // 카드 데이터 전달
            });


          beforeSendListContainer.appendChild(label);
        });



      })
    }


    function openEstimateFormPop(estIdx){
      const estimateFormPop = window.open('/estimate/estimateFormPop/'+estIdx, 'estimateFormPop', 'width=1200, height=' + screen.height + ', left=' + screenX + ', top=' + screenY + ',scrollbars=yes, resizable=yes');
      estimateFormPop.focus();
    }

    function registEstimate(){
      location.href="/estimate/regist-basic"
    }


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
