const orderMap = {
  RNT: ["RNT_P","BND","LIO","MNT"],
  PAY: ["PAY_STD"],
  SPC: ["DC_PRE","DC_SPC"],
  PRO: ["VCH","CARE"],
  FEE: ["DC_FEE","CON","CAR","STB","ETC"],
  GUD: ["RET","TRF"]
};

const mainTypeNames = {
  RNT: "렌탈상품",
  PAY: "선납금",
  SPC: "특별할인",
  PRO: "프로모션",
  FEE: "유통수수료",
  GUD: "가이드비용"
};

const subTypeNames = {
  RNT_P:"렌탈제품가", BND:"결합상품", LIO:"물류/설치/운영비", MNT:"유지관리비",
  PAY_STD:"선납금",
  DC_PRE:"선납할인", DC_SPC:"특별할인",
  VCH:"혜택바우처", CARE:"AS케어",
  DC_FEE:"렌탈수수료",CON:"계약성사수수료", CAR:"케어운영수수료", STB:"안정운영수수료", ETC:"기타수수료",
  RET:"제품회수비", TRF:"유상양도비"
};

document.getElementById("itemInfoLink").addEventListener("click", function(e) {
  e.preventDefault();
  document.querySelectorAll(".tab-item").forEach(tab => {
    tab.classList.remove("is-active");
  });
  document.getElementById("itemInfoTab").classList.add("is-active");

  document.querySelectorAll(".tab-content").forEach(pane => pane.classList.remove("is-active"));
  const itemPane = document.getElementById("itemInfo");
  itemPane.classList.add("is-active");

});


var profitMarginDefaultGridColumnLayout1 = [
  {headerText:'렌탈기간',dataField:'period',width:85, postfix:"개월"},
  {headerText:'월렌탈료',dataField:'rentalPerMonth',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'총렌탈료',dataField:'totalRental',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'BEP',dataField:'monthlyRental',width:70,style: 'text-right'},
  {headerText:'렌탈원가',dataField:'incost',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'공헌이익',dataField:'contributionAmt',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'공헌이익률',dataField:'contributionRate',style: 'text-fursys-red',labelFunction: function(rowIndex, columnIndex, value) {return value ? value + "%" : "";},style: 'text-right'},
  {headerText:'사업IRR(년)',dataField:'aIrrSimple',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(2) + "%" : "";}},
  {headerText:'사업IRR(월)',dataField:'mIrr',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(2) + "%" : "";}},
  {headerText:'소비자가',dataField:'iopSalcstSum',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'대비 비율',dataField:'iopSalcstRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
  {headerText:'기준 단가',dataField:'gijunCstSum',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'대비 비율',dataField:'gijunCstRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
  {headerText:'렌탈수수료',dataField:'rentalFee',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'일시판매 수수료',dataField:'payInFullFee',dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:115},
  {headerText:'대비 비율',dataField:'payInFullRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
]


var profitMarginDefaultGridProps = {
  isRowAllCheckCurrentView : true,
  autoGridHeight : false,
  //selectionMode: 'singleRow',
  selectionMode: 'none',
  hoverMode: "none" ,
  showRowNumColumn: true,
  rowStyleFunction: function (rowIndex, item) {
    if (item.period == rboEstimate.EST_PERIOD) {
      return "cell-bg-active";
    }
  },
  defaultColumnWidth: 100,
}

function setFinalProfitDefaultData(){
  const profitMarginDefaultGrid = AUIGrid.create("#profitMarginDefaultGrid", profitMarginDefaultGridColumnLayout1, profitMarginDefaultGridProps)
  AUIGrid.setGridData(profitMarginDefaultGrid, profitMaxInfo);
}


document.addEventListener("DOMContentLoaded", () => {
  setFinalProfitDefaultData()
  history.pushState(null, '', location.href);

    window.addEventListener("popstate", () => {
      location.href = '/estimate/headOffice';
    });
  const container = document.getElementById("itemComponent");
    container.innerHTML = "";

    addressList.forEach(address => {
      let totalCate = new Set();
      let totalQty = 0;
      let totalPrice = 0;

      address.bundleList.forEach(space => {
        space.gsList.forEach(item => {
          const key = `${item.ITM_CD}_${item.COL_CD}`;
          totalCate.add(key);
          totalQty += Number(item.ITM_QTY) || 0;
          totalPrice += Number(item.RBO_RTC_PRICE_TOTAL) || 0;
        });
      });

      const card = document.createElement("div");
      card.className = "card p-3";
      card.innerHTML = `
        <p class="text-sm font-medium mb-2">${address.ROAD_ADDR}</p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-sm text-[#64748B]">품목 종류</span>
            <p>${totalCate.size}</p>
          </div>
          <div>
            <span class="text-sm text-[#64748B]">총 품목 수</span>
            <p>${totalQty}</p>
          </div>
          <div>
            <span class="text-sm text-[#64748B]">총 견적 금액</span>
            <p>${totalPrice.toLocaleString()}</p>
          </div>
        </div>
      `;

      container.appendChild(card);
      renderStepItemData()
  });
  var serviceColumnLayout1 = [
    {headerText:'서비스명',dataField:'ESTC_MEMO',
    renderer: { type: 'TemplateRenderer' },
     labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
            if (item.CSM_CYCLE_COUNT) {
              if(!item.ESTC_EST_AMT&&!item.ESTC_COST_AMT&&item.CSM_TYPE=='CHC'){
                return value;
              }
              if(item.CSM_TYPE=='CHC'){
                              return `${value}-${item.CSM_CYCLE_COUNT}회
                                       <button class="btn btn-icon btn-outline" onclick='openServiceModal(${JSON.stringify(item)}, true)'>
                                         <i class="icon-search"></i>
                                       </button>`;
                            }else{
                              return `${value}-${item.CSM_CYCLE_COUNT}회`
                            }
            } else {
              return value;
            }
          }
    },
    {headerText:'타입',dataField:'CSM_TYPE_NM'},
    {headerText:'상세설명',dataField:'CSM_MEMO'},
  ]
  var serviceGridProps = {
    isRowAllCheckCurrentView : true,
    autoGridHeight : false,
    showRowNumColumn: true,
    defaultColumnWidth: 100,
  }

  var serviceGrid = AUIGrid.create("#serviceGrid", serviceColumnLayout1, serviceGridProps);
  AUIGrid.setGridData(serviceGrid, serviceComponent);


  if(rboEstimate.EST_RT_TYPE=='ACQ_F'){
    orderMap.RNT = ["RNT_P","BND","LIO","MNT"];
    orderMap.GUD = ["RET","TRF"];
  }else{
    orderMap.RNT = ["RNT_P","BND","LIO","MNT","RET"];
    orderMap.GUD = ["TRF"];
  }
  if(rboEstimate.EST_VCH_TYPE==''||rboEstimate.EST_VCH_TYPE=='PAY'){
     orderMap.SPC = ["DC_PRE","DC_SPC"];
      orderMap.PRO = ["VCH","CARE"];
  }else{
    orderMap.SPC = ["DC_PRE","DC_SPC","VCH"];
          orderMap.PRO = ["CARE"];
  }


  renderDetails(rboEstComponentInfo)
  renderGuides(rboEstComponentInfo)
});



function renderStepItemData() {

    const tbody = document.getElementById("itemSpot");
    tbody.innerHTML = ""; // Clear existing content

    // Helper function to create a table cell
    const createCell = (text, className = "", colspan = 0) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      if (className) cell.className = className;
      if (colspan > 0) cell.colSpan = colspan;
      return cell;
    };
      const createCellWithInput = (type, className, dataInput, id, value,textRightFlag) => {
          const cell = document.createElement("td");
          cell.className = className;
          const input = document.createElement("input");
          input.type = type;
          input.className = "input";
          input.dataset.input = dataInput;
          input.id = id;
          input.value = value;
          if(textRightFlag){
            input.style.textAlign = "right";
          }
          cell.appendChild(input);
          return cell;
      };


    // Totals
    let grandTotalQty = 0, grandTotalRentalPriceTotal = 0,grandTotalRentalGsPriceTotal = 0,nomalTotalRentalPriceTotal=0,combineTotalRentalPriceTotal=0, grandTotalInPriceTotal = 0,nomalTotalInPriceTotal=0 , combineTotalInPriceTotal=0, grandTotalFactoryPriceTotal = 0, grandTotalStandardPriceTotal = 0, grandTotalConsumerPriceTotal = 0,rntPDcAmt=0,nomalRntPDcAmt=0,combineRntPDcAmt=0,lioEstcCostAmt=0,mntEstcCostAmt=0,rboItemReturnRt=0,grandTotalEstgNetAmtTotal=0;

    addressList.forEach((address, addrIdx) => {
      let addressTotalQty = 0, addressTotalRentalPriceTotal = 0, addressTotalInPriceTotal = 0, addressTotalFactoryPriceTotal = 0, addressTotalStandardPriceTotal = 0, addressTotalConsumerPriceTotal = 0,addressTotalEstgNetAmtTotal=0;

      // Address Header Row
      const addressRow = document.createElement("tr");
      addressRow.appendChild(createCell(address.ROAD_ADDR, "", 14));
      tbody.appendChild(addressRow);

      if (address.bundleList && address.bundleList.length > 0) {
        address.bundleList.forEach((space, bundleIdx) => {
          const groupId = `group-${addrIdx}-${bundleIdx}`;
          let subtotalQty = 0, subtotalRentalPriceTotal = 0, subtotalInPriceTotal = 0, subtotalFactoryPriceTotal = 0, subtotalStandardPriceTotal = 0, subtotalConsumerPriceTotal = 0,subtotalEstgNetAmtTotal=0;

          tbody.appendChild(createCell(""));


          if (space.gsList && space.gsList.length > 0) {
            space.gsList.forEach((item, estGsIdx) => {
              const qty = Number(item.ITM_QTY) || 0;
              const rentalTotal = item.RBO_RTC_PRICE * qty;
              const rentalGsTotal = item.RBO_RTC_PRICE * qty;
              item.RBO_RTC_PRICE_TOTAL = item.RBO_RTC_PRICE * qty;

              const inTotal = item.IOP_INPCST * qty;
              const factoryTotal = item.IOP_MNFCST * qty;
              const standardTotal = item.GIJUN_CST * qty;
              const consumerTotal = item.IOP_SALCST * qty;

               if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND);
                }else if(item.GS_AMT_UNIT){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT);
                }else{
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100);
                }

               item.ESTG_NET_AMT=Number(item.ESTG_NET_UP)*qty;
               subtotalEstgNetAmtTotal+= item.ESTG_NET_AMT;
               addressTotalEstgNetAmtTotal+=item.ESTG_NET_AMT;
               grandTotalEstgNetAmtTotal+=item.ESTG_NET_AMT;

              rntPDcAmt+=qty*Number(item.ESTG_NET_DC_RT_FINAL) || 0
              lioEstcCostAmt+=qty*Number(item.RBO_LOGI_RT) || 0//((Number(item.RBO_LOGI_RT) || 0)*(Number(inTotal) || 0))/100;
              mntEstcCostAmt+=qty*Number(item.RBO_MNT_RT) || 0//((Number(item.RBO_MNT_RT) || 0)*(Number(inTotal) || 0))/100;
              rboItemReturnRt+=qty*Number(item.RBO_ITEM_RETURN_RT) || 0//((Number(item.RBO_MNT_RT) || 0)*(Number(inTotal) || 0))/100;

              subtotalQty += qty;
              subtotalRentalPriceTotal += rentalTotal;
              subtotalInPriceTotal += inTotal;
              subtotalFactoryPriceTotal += factoryTotal;
              subtotalStandardPriceTotal += standardTotal;
              subtotalConsumerPriceTotal += consumerTotal;

              addressTotalQty += qty;
              addressTotalRentalPriceTotal += rentalTotal;
              addressTotalInPriceTotal += inTotal;
              addressTotalFactoryPriceTotal += factoryTotal;
              addressTotalStandardPriceTotal += standardTotal;
              addressTotalConsumerPriceTotal += consumerTotal;

              grandTotalQty += qty;
              grandTotalRentalPriceTotal += rentalTotal;
              grandTotalRentalGsPriceTotal += rentalGsTotal;
              grandTotalInPriceTotal += inTotal;
              if(item.combineFlag){
                combineTotalInPriceTotal += inTotal;
                combineTotalRentalPriceTotal += rentalTotal;
                if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  combineRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND);
                }else if(item.GS_AMT_UNIT){
                  combineRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT);
                }else{
                  combineRntPDcAmt +adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100);
                }
              }else{
                nomalTotalInPriceTotal += inTotal;
                nomalTotalRentalPriceTotal += rentalTotal;

                if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND)*qty;
                }else if(item.GS_AMT_UNIT){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT)*qty;
                }else{
                  nomalRntPDcAmt +adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100)*qty;
                }
              }



              grandTotalFactoryPriceTotal += factoryTotal;
              grandTotalStandardPriceTotal += standardTotal;
              grandTotalConsumerPriceTotal += consumerTotal;


              const itemRow = document.createElement("tr");
              itemRow.className = "t-group-item";
              itemRow.dataset.groupId = groupId;
              itemRow.dataset.addrIdx = addrIdx;
              itemRow.dataset.bundleIdx = bundleIdx;
              itemRow.dataset.itemIdx = estGsIdx;

              const checkboxCell = createCell("", "text-center");
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.className = "checkbox";
              checkboxCell.appendChild(checkbox);
              itemRow.appendChild(createCell(""));



              itemRow.appendChild(createCell(""));


              itemRow.appendChild(createCell(item.ITM_CD, "text-left"));
              itemRow.appendChild(createCell(item.COL_CD, "text-left"));
              itemRow.appendChild(createCell(item.SET_YN=='I'?"단품":"세트", "text-left"));
              itemRow.appendChild(createCell(item.ITM_NM, "text-left"));
              itemRow.appendChild(createCell(item.ITM_DESC, "text-left"));

              itemRow.appendChild(createCell(qty.toLocaleString(), "text-right"));

              itemRow.appendChild(createCell(item.RBO_RTC_PRICE.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(rentalTotal.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.ESTG_NET_DC_RT_FINAL, "text-right"));
              itemRow.appendChild(createCell(item.ESTG_NET_UP.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.ESTG_NET_AMT.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.IOP_INPCST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(inTotal.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.IOP_MNFCST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(factoryTotal.toLocaleString(), "text-right"));

              itemRow.appendChild(createCell(item.GIJUN_CST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(standardTotal.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.IOP_SALCST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(consumerTotal.toLocaleString(), "text-right"));
              tbody.appendChild(itemRow);
            });
          }

          // Subtotal Row
          const subtotalRow = document.createElement("tr");
          subtotalRow.className = "t-group-item sub-total-bg";
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell("소계", "font-medium", 6));
          subtotalRow.appendChild(createCell(subtotalQty.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalRentalPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalEstgNetAmtTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalInPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalFactoryPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalStandardPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalConsumerPriceTotal.toLocaleString(), "text-right"));
          tbody.appendChild(subtotalRow);
        });
      }

      // Address Total Row
      const addressTotalRow = document.createElement("tr");
      addressTotalRow.className = "total-bg";
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell("주소지 합계", "font-medium", 6));
      addressTotalRow.appendChild(createCell(addressTotalQty.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalRentalPriceTotal.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalInPriceTotal.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalFactoryPriceTotal.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalStandardPriceTotal.toLocaleString(), "text-right"));
      addressTotalRow.appendChild(createCell(""));
      addressTotalRow.appendChild(createCell(addressTotalConsumerPriceTotal.toLocaleString(), "text-right"));
      tbody.appendChild(addressTotalRow);
    });

    // Grand Total Row
    const grandTotalRow = document.createElement("tr");
    grandTotalRow.className = "grand-total-bg";
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell("합계", "font-medium", 6));
    grandTotalRow.appendChild(createCell(grandTotalQty.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalRentalPriceTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalInPriceTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalFactoryPriceTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalStandardPriceTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalConsumerPriceTotal.toLocaleString(), "text-right"));
    tbody.appendChild(grandTotalRow);


    const fieldMapping = {
          "LEGACY_OPPTY_NM": "LEGACY_OPPTY_NM",
          "COM_MNGEST_NM": "COM_MNGEST_NM",
          "VND_NM": "VND_NM",
          "EST_USR_NM":"EST_USR_NM",
          "VND_USR_NM":"VND_USR_NM",
          "COM_NAME":"COM_NAME",
          "CTM_NM":"CTM_NM",
          "APR_RESULT_NM":"APR_RESULT_NM",
          "APR_LIMIT_AMT":"APR_LIMIT_AMT",
          "APR_REMAIN_LIMIT_AMT":"APR_REMAIN_LIMIT_AMT",
          "EST_TITLE":"EST_TITLE",
          "EST_REG_DT":"EST_REG_DT",
          "EST_U_NM2":"EST_U_NM2",
          "EST_IDX":"EST_IDX",
          "EST_VALID_DT":"EST_VALID_DT",
          "EST_PLAN":"EST_PLAN",
          "EST_PERIOD":"EST_PERIOD",
          "EST_RT_TYPE_NAME":"EST_RT_TYPE_NAME",
          "EST_RNT_AMT":"EST_RNT_AMT",
          "EST_PMT":"EST_PMT",
          "EST_PRE_PAY":"EST_PRE_PAY",
          "APR_REMAIN_LIMIT_AMT_CON":"APR_REMAIN_LIMIT_AMT_CON",
          "EST_RNT_GS_AMT":"EST_RNT_GS_AMT",
          "EST_DC_AMT":"EST_DC_AMT",
          "EST_OFR_AMT":"EST_OFR_AMT",
          "EST_TRUNC_AMT":"EST_TRUNC_AMT",
          "EST_PROMO_AMT":"EST_PROMO_AMT",
          "EST_CTM_LSCNO":"EST_CTM_LSCNO",
          "CTM_TYPE_NAME":"CTM_TYPE_NAME",
          "SALES_SUB_TYPE":"SALES_SUB_TYPE",
          "OPPTY_AMT":"OPPTY_AMT",
        };

        for (const name in fieldMapping) {
          const key = fieldMapping[name];
          const elements = document.getElementsByName(name);
          elements.forEach(element => {
            if(['OPPTY_AMT','APR_REMAIN_LIMIT_AMT','APR_LIMIT_AMT','APR_REMAIN_LIMIT_AMT_CON','EST_RNT_GS_AMT','EST_DC_AMT','EST_PRE_PAY','EST_OFR_AMT','EST_TRUNC_AMT','EST_RNT_AMT','EST_PROMO_AMT','EST_PMT'].includes(name)){
              element.innerHTML = Number(rboEstimate[key]).toLocaleString() ?? "";
            }else if(['CTM_TYPE_NAME'].includes(name)){
              element.innerHTML = (rboEstimate[key]??"")+" · "+(rboEstimate['CTM_LSCNO'] ?? "");
            }else{
              element.innerHTML = rboEstimate[key] ?? "";
            }
          })
        }
        document.getElementById("spcBucket").style.display = "none";
        if(spcSpanData){
          setSpcSpanData2();
        }

}
function openCustomerDistribution(){
  window.open('/customer/distribution/'+rboEstimate.CTM_CD_CUT,'_blank')
}
function openBusinessHeadOffice(){
  window.open('/business/headOffice/'+rboEstimate.OPPTY_CD, '_blank')
}
function setSpcSpanData2(){
    const container = document.getElementById("spcSpanDetail");
    const container2 = document.getElementById("specialApprobalSpot");
    container.innerHTML = ""; // 초기화
    container2.innerHTML = ""; // 초기화
    Object.entries(spcSpanData).forEach(([key, value]) => {
        if (value === "Y") {
          const span = document.createElement("span");
          span.className = "badge badge-destructive-outline badge-rounded";
          span.innerHTML = key
          container.appendChild(span);
          const spanClone = span.cloneNode(true);
          container2.appendChild(spanClone);
          document.getElementById("spcBucket").style.display = "block";
        }
    });
}
function sendSpcReq(){
  fetchJson('/estimate/sendSpcReq.ajax','POST',
  {
    EST_IDX: rboEstimate["EST_IDX"],
    ...getFormParamsObject(),
    ...spcSpanData
  }
  ).then(()=>{
    location.reload();
  })
}

function getFormParamsObject() {
  const elements = document.querySelectorAll('[data-param]');
  const result = {};

  elements.forEach(el => {
    let value;

    // 요소 타입에 따라 값 가져오기
    if (el.type === "checkbox" || el.type === "radio") {
      if (!el.checked) return;
      if (el.dataset.param.endsWith("CSV")) {
        value = el.parentElement.textContent.trim();
      }else{
        value = "Y";
      }

    } else {
      value = el.value;
    }

    const key = el.getAttribute("data-param");
    if (result[key]) {
      result[key] = result[key] + "," + value;
    } else {
      result[key] = value;
    }
  });

  if(!result["APRS_BUY_REVIEW_YN"]){
    result["APRS_BUY_REVIEW_YN"] = 'N'
  }
  if(!result["APRS_ADD_DC_REQ_YN"]){
    result["APRS_ADD_DC_REQ_YN"] = 'N'
  }

  if(!result["APRS_SELF_USE_YN"]){
    result["APRS_SELF_USE_YN"] = 'N'
  }

  return result;
}

function openModalSpcAprDetailModal(){
  openSpecialApprovalDetailModal(apprsSpc);
}



function modifyEstimate(){
  location.href = "/estimate/detail-basic/"+rboEstimate["EST_IDX"]
}

function copyEstimate(){
  location.href = "/estimate/copy-estimate/"+rboEstimate["EST_IDX"]
}

function deleteEstimate(){
  fetchJson("/estimate/deleteEstimate.ajax", "DELETE",{"EST_IDX":rboEstimate["EST_IDX"]});
}


function renderDetails(details) {
  const rentalDatailFormTbody = document.querySelector("#rentalDatailFormTbody");
  rentalDatailFormTbody.innerHTML = ""; // 기존 내용 제거

  const createCell = (content, className = "", isHeader = false, colspan = 0) => {
    const cell = document.createElement(isHeader ? "td" : "td");
    if (typeof content === "object" && content !== null && content.nodeType === 1) {
      cell.style.overflow = "visible";
      cell.style.position = "relative";
      cell.appendChild(content);
    } else {
      cell.textContent = content;
    }
    if (className) cell.className = className;
    if (colspan) cell.colSpan = colspan;
    return cell;
  };

  // 전체 합계 변수
  let grandCostAmt = 0, grandEstAmt = 0, grandDcAmt = 0, grandNetAmt = 0;

  // 그룹핑
  const grouped = {};
  details.forEach(d => {
    if (!grouped[d.ESTC_MAIN_TYPE]) grouped[d.ESTC_MAIN_TYPE] = [];
    grouped[d.ESTC_MAIN_TYPE].push(d);
  });

  // 메인 타입 순서대로 출력
  Object.keys(orderMap).forEach(mainType => {
    if (mainType === "GUD") return;
    const groupDetails = grouped[mainType];
    if (!groupDetails) return;

    const fragment = document.createDocumentFragment();

    // Header Row
    const headerRow = document.createElement("tr");
    headerRow.className = "t-group-header";
    headerRow.dataset.groupId = mainType;
    const headerCell = createCell("", "text-left", true, 11);
    headerCell.innerHTML = `
      <button type="button" class="t-group-toggle" aria-expanded="true">
        <i class="icon-chevron mr-2 w-[20px] h-[20px] bg-size-[20px]"></i>
        <span class="font-normal">${mainTypeNames[mainType]}</span>
      </button>`;
    headerRow.appendChild(headerCell);
    fragment.appendChild(headerRow);

    // 그룹 합산 변수
    let totalCostAmt = 0, totalEstAmt = 0, totalDcAmt = 0, totalNetAmt = 0;

    // 서브타입 순서대로 출력
    orderMap[mainType].forEach(subType => {
      const rows = groupDetails.filter(d => d.ESTC_SUB_TYPE === subType);
      rows.forEach((detail, idx) => {
        const tr = document.createElement("tr");
        tr.className = "t-group-item";
        tr.dataset.groupId = mainType;

        detail._uid = detail.ESTC_IDX || `${mainType}_${subType}_${idx}`;



        tr.appendChild(createCell(subTypeNames[subType] || `항목${idx + 1}`));

        if(['CARE'].includes(subType)){
          let serviceTime = Number(detail.CSM_CYCLE||0);
          if(!detail.ESTC_EST_AMT&&!detail.ESTC_COST_AMT&&detail.CSM_TYPE=='CHC'){
           serviceTime=0;
          }
            tr.appendChild(createCell(detail.ESTC_MEMO+(serviceTime>0? (" - "+serviceTime +"회"):"")));

        }else{
          tr.appendChild(createCell(""));
        }
        /*}*/


        if (mainType === 'RNT') {
          tr.appendChild(createCell("입고가"));
        } else if(mainType==='FEE'){
          tr.appendChild(createCell("렌탈료 총액"));
        } else if(['STB','CON','CAR'].includes(subType)) {
          tr.appendChild(createCell("렌탈료총액"));
        } else{
          tr.appendChild(createCell(""));
        }


        //평균요율

        if(["LIO","MNT","CON","CAR","STB","ETC","RET","DC_FEE"].includes(subType)){
          tr.appendChild(createCell(`${Math.floor(Number(detail.ESTC_COST_RT||0)*10)/10}%`, "text-right"));
        }else if(subType==='VCH'&&detail.ESTC_COST_STD){
          tr.appendChild(createCell(detail.ESTC_COST_RT || ""));
        }else{
          tr.appendChild(createCell(""));
        }

        //원가합계

        if(['CON','CAR','STB','VCH'].includes(subType)){
          tr.appendChild(createCell(adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))),100,'TRUNC').toLocaleString(), "text-right"));
        }else if('RET'==subType){
          tr.appendChild(createCell(adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))),1000,'TRUNC').toLocaleString(), "text-right"));
        }else if(['RNT','PRO'].includes(mainType)||['DC_FEE','LIO','MNT'].includes(subType)){
          tr.appendChild(createCell(Number((detail.ESTC_COST_AMT ?? 0)).toLocaleString(), "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }


        //적용기준
        if(['RNT_P','BND','DC_SPC'].includes(subType)){
          tr.appendChild(createCell("렌탈소가"));
        }else if(subType==='DC_PRE'){
           tr.appendChild(createCell(detail.ESTC_COST_STD==="0"?"선납할인 비율":"선납할인 금액"));
        } else if(subType==='VCH'){
         tr.appendChild(createCell(detail.ESTC_COST_STD==="PAY"?"지급":(detail.ESTC_COST_STD==="DC"?"할인":"없음")));
       }else{
          tr.appendChild(createCell(""));
       }

        //견적합계
        if(mainType=='PRO'||["BND","RNT_P","RET"].includes(subType)||(subType=='VCH'&&('PAY'==detail.ESTC_COST_STD||'DC'==detail.ESTC_COST_STD))){
          tr.appendChild(createCell(Number((detail.ESTC_EST_AMT ?? 0)).toLocaleString(), "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }

        //평균할인율
        if (subType === "DC_PRE") {
            tr.appendChild(createCell(Math.floor(Number(detail.ESTC_DC_RT || 0))+"%"));
        } else if (subType==='DC_SPC'){
          tr.appendChild(createCell(detail.ESTC_DC_RT+"%" || ""));
        }else if(mainType=='PRO'||["BND","RNT_P"].includes(subType)||(subType=='VCH'&&('PAY'==detail.ESTC_COST_STD||'DC'==detail.ESTC_COST_STD))){
           tr.appendChild(createCell(`${Math.floor(Number(detail.ESTC_DC_RT || 0)* 100*10)/10 }%`, "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }
        //할인금액
        if (subType === "DC_PRE") {
            tr.appendChild(createCell((detail.ESTC_DC_AMT ?? 0).toLocaleString(), "text-right"));
        }else if(mainType=='PRO'||["BND","RNT_P","DC_SPC","PAY_STD"].includes(subType)||(subType=='VCH'&&('PAY'==detail.ESTC_COST_STD||'DC'==detail.ESTC_COST_STD))){
            tr.appendChild(createCell(Number((detail.ESTC_DC_AMT ?? 0)).toLocaleString(), "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }


        //최종견적가
        if(["PAY","SPC"].includes(mainType)||["BND","RNT_P","RET"].includes(subType)||(subType=='VCH'&&'DC'==detail.ESTC_COST_STD)){
          tr.appendChild(createCell(Number(detail.ESTC_NET_AMT ?? 0).toLocaleString(), "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }
        tr.appendChild(createCell(""));

        fragment.appendChild(tr);

          // 그룹 합산

          if(['CON','CAR','STB','VCH'].includes(subType)){
            totalCostAmt += adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))),100,'TRUNC')
          }else if('RET'==subType){
              totalCostAmt += adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))),1000,'TRUNC')
          }else{
            totalCostAmt += adjustByUnit(Number(detail.ESTC_COST_AMT),100,'TRUNC');
          }




          //if(!(subType=='VCH'&&detail.ESTC_COST_STD=="2")){
          totalEstAmt += Number(detail.ESTC_EST_AMT) || 0;
          totalDcAmt += Number(detail.ESTC_DC_AMT) || 0;
        //}
        totalNetAmt += Number(detail.ESTC_NET_AMT) || 0;
      });
    });

    // Footer Row (소계)
    const footerRow = document.createElement("tr");
    footerRow.className = "t-group-item bg-muted";
    footerRow.dataset.groupId = mainType;


    footerRow.appendChild(createCell("소계", "font-medium", false, 4));
    footerRow.appendChild(createCell(`${totalCostAmt.toLocaleString()} 원`, "text-right"));

    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalDcAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()} 원`, "text-right"));

    footerRow.appendChild(createCell(""));
    fragment.appendChild(footerRow);

    rentalDatailFormTbody.appendChild(fragment);

    // 전체 합계 누적
    grandCostAmt += totalCostAmt;

    if(mainType!=='PRO'){
      grandEstAmt += totalEstAmt;
      grandDcAmt += totalDcAmt;
    }

    grandNetAmt += totalNetAmt;

  });

  // 전체 합계 행
  const grandRow = document.createElement("tr");
  grandRow.className = "bg-black text-white";


  grandRow.appendChild(createCell("합계", "font-medium", false, 4));
  grandRow.appendChild(createCell(`${grandCostAmt.toLocaleString()} 원`, "text-right"));


  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandEstAmt.toLocaleString()} 원`, "text-right"));
  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandDcAmt.toLocaleString()} 원`, "text-right"));
  grandRow.appendChild(createCell(`${grandNetAmt.toLocaleString()} 원`, "text-right"));
  grandRow.appendChild(createCell(""));

  rentalDatailFormTbody.appendChild(grandRow);

}


function renderGuides(details) {
  const rentalGuideFormTbody = document.querySelector("#rentalGuideFormTbody");
  rentalGuideFormTbody.innerHTML = "";

  const createCell = (content, className = "", isHeader = false, colspan = 0) => {
    const cell = document.createElement(isHeader ? "th" : "td");
    if (typeof content === "object" && content !== null && content.nodeType === 1) {
      cell.style.overflow = "visible";
      cell.style.position = "relative";
      cell.appendChild(content);
    } else {
      cell.textContent = content;
    }
    if (className) cell.className = className;
    if (colspan) cell.colSpan = colspan;
    return cell;
  };

  // 전체 합계 변수
  let grandCostAmt = 0, grandEstAmt = 0, grandDcAmt = 0, grandNetAmt = 0;

  // 그룹핑
  const grouped = {};
  details.forEach(d => {
    if (!grouped[d.ESTC_MAIN_TYPE]) grouped[d.ESTC_MAIN_TYPE] = [];
    grouped[d.ESTC_MAIN_TYPE].push(d);
  });

  // 메인 타입 순서대로 출력
  Object.keys(orderMap).forEach(mainType => {
    if (mainType !== "GUD") return;
    const groupDetails = grouped[mainType];
    if (!groupDetails) return;

    const fragment = document.createDocumentFragment();

    // 그룹 합산 변수
    let totalCostAmt = 0, totalEstAmt = 0, totalDcAmt = 0, totalNetAmt = 0;

    // 서브타입 순서대로 출력
    orderMap[mainType].forEach(subType => {
      const rows = groupDetails.filter(d => d.ESTC_SUB_TYPE === subType);
      rows.forEach((detail, idx) => {
        const tr = document.createElement("tr");
        tr.className = "t-group-item";
        tr.dataset.groupId = mainType;
        tr.dataset.detailId = detail.ESTC_IDX || `${mainType}_${subType}_${idx}`;

        tr.appendChild(createCell(subTypeNames[subType] || `항목${idx + 1}`));
        tr.appendChild(createCell(""));
        if(subType=='RET'){
          tr.appendChild(createCell("입고가"));
          tr.appendChild(createCell(Number(detail.ESTC_COST_RT??0)+"%", "text-right"));
          tr.appendChild(createCell(adjustByUnit(Number(detail.ESTC_COST_AMT??0),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));
        }else if(subType=='TRF'){
          var netUpAmt = getGsListSumByKey(addressList,'ESTG_NET_UP','Y')
          if(rboEstimate.EST_RT_TYPE=='ACQ_F'){
            netUpAmt += getGsListSumByKey(addressList,'ESTG_NET_UP','N')
          }
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell("렌탈소가"));
          tr.appendChild(createCell(   Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)    .toLocaleString(), "text-right"));
          tr.appendChild(createCell(Number(detail.ESTC_DC_RT??0)+"%", "text-right"));

          tr.appendChild(createCell(adjustByUnit(Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(adjustByUnit((Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)),100,"TRUNC").toLocaleString(),"text-right"));

        }
          tr.appendChild(createCell(""));

          fragment.appendChild(tr);
          totalEstAmt += adjustByUnit(Number(detail.ESTC_EST_AMT) || 0,100,"TRUNC");
          totalNetAmt += adjustByUnit(Number(detail.ESTC_NET_AMT) || 0,100,"TRUNC");
      });
    });

    // Footer Row (소계)
    const footerRow = document.createElement("tr");
    footerRow.className = "t-group-item bg-muted";
    footerRow.dataset.groupId = mainType;
    footerRow.appendChild(createCell("소계", "font-medium", false, 4));
    footerRow.appendChild(createCell(""));

    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(""));


    fragment.appendChild(footerRow);

    rentalGuideFormTbody.appendChild(fragment);

  });
}




function getGsListSumByKey(addressList, key,insu) {
  let sum = 0;

  if (!Array.isArray(addressList)) return 0;

  addressList.forEach(addr => {
    if (addr.bundleList && Array.isArray(addr.bundleList)) {
      addr.bundleList.forEach(space => {
        if (space.gsList && Array.isArray(space.gsList)) {
          space.gsList.forEach(item => {
            if(insu&&insu==item.INSU_YN){
              sum += Number(item["ITM_QTY"]||0)*Number(item[key]) || 0;
            }else if(!insu){
              sum += Number(item["ITM_QTY"]||0)*Number(item[key]) || 0;
            }
          });
        }
      });
    }
  });

  return sum;
}







document.getElementById("detailInfoLink").addEventListener("click", function(e) {
  e.preventDefault();
   document.getElementById('tabDetailInfo').click();
});
