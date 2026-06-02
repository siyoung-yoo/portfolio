
function getProfitData(){
return profitInfo
}
function getProfitMaxInfo(){
 return profitMaxInfo;
}
function getAddressList(){
  return addressList;
}
function getRboEstComponentInfo(){
  return rboEstComponentInfo;
}

function getRboEstimateInfo(){
  return rboEstimate;
}


var profitMarginColumnLayout1 = [
  {headerText:'렌탈기간',dataField:'period',width:85,style: 'text-right'},
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


var profitMarginGridProps = {
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

function  setHeadOfficeDetailApprovalAddrTbody(){
  const updatedList = addressList.map(address => {
  const totalRTM = address.bundleList.reduce((bundleSum, bundle) =>
     bundleSum + bundle.gsList.reduce((itemSum, item) =>
       itemSum + (Number(item.RBO_RTC_PRICE_TOTAL) || 0), 0
     ), 0
   );

   return {
     ...address,
     totalRTM
   };
 });
 const tbody = document.getElementById("headOfficeDetailApprovalAddrTbody");
 tbody.innerHTML = ""; // Clear existing content
const createCell = (text, className = "", colspan = 0) => {
   const cell = document.createElement("td");
   cell.textContent = text;
   if (className) cell.className = className;
   if (colspan > 0) cell.colSpan = colspan;
   return cell;
 };
 updatedList.forEach((address,index) => {
  const itemRow = document.createElement("tr");
  itemRow.className = "t-group-item";
  itemRow.appendChild(createCell(index+1));
  itemRow.appendChild(createCell(address.ZIP_CD));
  itemRow.appendChild(createCell(address.ROAD_ADDR));
  itemRow.appendChild(createCell(address.totalRTM.toLocaleString()+"원"));
  tbody.appendChild(itemRow);
 })

}


document.addEventListener("DOMContentLoaded", () => {
  if(rboEstimate["EST_M_IDX"]){
    document.getElementById("contractInfo").style.display='block'
  }
  if(!rboEstimate["EPR_IDX"]){
    document.getElementById("approveBtn").style.display='block'
  }else{
    document.getElementById("editDiscountPopBtn").style.display='none'
    document.getElementById("editEstimateComponentBtn").style.display='none'
  }

  setHeadOfficeDetailApprovalAddrTbody();


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
      renderApproveStepItemData(document.getElementById("approvalItemSpot"),"approvalItemSpot")
  });
  var serviceColumnLayout1 = [
    {headerText:'서비스명',dataField:'ESTC_MEMO'},
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


    const fieldMapping = {
          "APRS_MEMO": "APRS_MEMO",
          "APRS_STAGE_NM": "APRS_STAGE_NM",
          "APRS_POSSIBILITY_NM": "APRS_POSSIBILITY_NM",
          "APRS_COMP_DATA":"APRS_COMP_DATA",
          "APRS_FOLLOW_UP_NM":"APRS_FOLLOW_UP_NM",
          "APRS_EXPECT_AMT":"APRS_EXPECT_AMT",
          "APRS_EVID_CSV":"APRS_EVID_CSV",
          "APRS_POINT_CSV":"APRS_POINT_CSV",
          "APRS_POINT_ETC":"APRS_POINT_ETC"
        };

        for (const name in fieldMapping) {
          const key = fieldMapping[name];
          const elements = document.getElementsByName(name);
          elements.forEach(element => {
            if(apprsSpc){
              element.innerHTML = apprsSpc[key] ?? "";
            }

          })
        }

            const fieldMapping2 = {
                  "APR_GRADE": "APR_GRADE",
                  "AD_CRDT": "AD_CRDT",
                  "AD_WATCH_GRADE": "AD_WATCH_GRADE",
                  "AD_BIZ_YR":"AD_BIZ_YR",
                  "AD_ARR_1Y_CNT":"AD_ARR_1Y_CNT",
                  "AD_CAP_IMP_RT":"AD_CAP_IMP_RT",
                  "AD_DEBT_RT":"AD_DEBT_RT",
                  "AD_CUR_RT":"AD_CUR_RT",
                  "TOTAL_AMT":"TOTAL_AMT"
                };
          for (const name in fieldMapping2) {
                  const key = fieldMapping2[name];
                  const elements = document.getElementsByName(name);
                  elements.forEach(element => {
                    if(key=='TOTAL_AMT'){
                      element.innerHTML = Number(apprsApprove[key]).toLocaleString() ?? "";
                    }else{
                      element.innerHTML = apprsApprove[key] ?? "";
                    }


                  })
                  if(name!='APR_GRADE'){
                    if(apprsApprove&&apprsApprove[name+'_GR_CSS']&&apprsApprove[name+'_GR_CSS']=='Y'){
                      document.getElementById(name+'_DIV').classList.add('bg-destructive-foreground','border-fursys-red')
                      document.getElementById(name+'_SPAN').classList.add('text-[var(--fursys-red)]')
                      document.getElementById(name+'_P').classList.add('text-[var(--fursys-red)]')
                    }else{
                      document.getElementById(name+'_DIV').classList.add('bg-[var(--primary-50)]')
                      document.getElementById(name+'_SPAN').classList.add('text-[var(--muted-foreground)]')
                    }
                  }
                }


    const fieldMapping3 = {
          "LEGACY_OPPTY_NM": "LEGACY_OPPTY_NM",
          "COM_MNGEST_NM": "COM_MNGEST_NM",
          "VND_NM": "VND_NM",
          "EST_USR_NM":"EST_USR_NM",
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
          "EST_DC_RT":"EST_DC_RT",
          "EST_REAL_CON_AMT":"EST_REAL_CON_AMT",
          "EST_OFR_AMT":"EST_OFR_AMT",
          "EST_TRUNC_AMT":"EST_TRUNC_AMT",
          "EST_PROMO_AMT":"EST_PROMO_AMT",
          "CTM_LSCNO":"CTM_LSCNO",
          "IDSCD":"IDSCD",
          "IDSCD_NM":"IDSCD_NM",
          "CTM_TYPE_NAME":"CTM_TYPE_NAME",
          "SALES_SUB_TYPE":"SALES_SUB_TYPE",
          "OPPTY_AMT":"OPPTY_AMT",
          "M_DATE_RANGE":"M_DATE_RANGE",
          "EST_CON_TITLE":"CON_TITLE",
        };

        for (const name in fieldMapping3) {
          const key = fieldMapping3[name];
          const elements = document.getElementsByName(name);
          elements.forEach(element => {
            if(['OPPTY_AMT','APR_REMAIN_LIMIT_AMT','APR_LIMIT_AMT','APR_REMAIN_LIMIT_AMT_CON','EST_RNT_GS_AMT','EST_DC_AMT','EST_PRE_PAY','EST_OFR_AMT','EST_TRUNC_AMT','EST_RNT_AMT','EST_PROMO_AMT','EST_PMT','EST_REAL_CON_AMT'].includes(name)){
              element.innerHTML = Number(rboEstimate[key]).toLocaleString() ?? "";
            }else if(['CTM_TYPE_NAME'].includes(name)){
              element.innerHTML = (rboEstimate[key]??"")+" · "+(rboEstimate['CTM_LSCNO'] ?? "");
            }else if(name=='EST_DC_RT'){
              element.innerHTML = ((Number(rboEstimate["EST_EST_AMT"]) && Number(rboEstimate["EST_DC_AMT"])) ? ((Number(rboEstimate["EST_EST_AMT"]) / Number(rboEstimate["EST_RNT_AMT"])) * 100).toFixed(2) : "0.00")+'%'
            }else{
              element.innerHTML = rboEstimate[key] ?? "";
            }
          })
        }

        if(apprsApprove["APR_GRADE"]=="F"){
          document.getElementById("approveImp").style.display="block"
          document.getElementById("approveBtn").style.display="NONE"
        }

        if(spcSpanData){
          setSpcSpanData();
        }

    setFinalProfitData()

    document.getElementById("approveRejectBtn").addEventListener('click', () => {
      fetchJson('/estimate/doApproveEstimate.ajax','POST',{"EST_IDX":rboEstimate["EST_IDX"],"EST_STATE":"REJECT"})
    });
    document.getElementById("approveBtn").addEventListener('click', () => {
      const yKeys = Object.entries(spcSpanData)
        .filter(([key, value]) => value === "Y")
        .map(([key]) => key);

      const isSingleDiscountRequest =
        yKeys.length === 1 &&
        ["추가 할인 요청", "Project Plan 추가 할인 요청"].includes(yKeys[0]);

      if (isSingleDiscountRequest) {
      fetchJson('/estimate/spcAprEApproval.ajax','POST',{"EST_IDX":rboEstimate["EST_IDX"],"EST_STATE":"CONFIRMED"})
              .then((data)=>{
              const width = screen.availWidth;
              const height = screen.availHeight;
              const options = `width=${width}, height=${height}, top=0, left=0, resizable=yes, scrollbars=yes`;

              window.open(data.data.link, '_blank', options);
              })
      }else if(confirm("렌탈 불가 조건이 포함되어 있습니다.\r정말 상신 하시겠습니까?")){
        fetchJson('/estimate/spcAprEApproval.ajax','POST',{"EST_IDX":rboEstimate["EST_IDX"],"EST_STATE":"CONFIRMED"})
        .then((data)=>{
        const width = screen.availWidth;
        const height = screen.availHeight;
        const options = `width=${width}, height=${height}, top=0, left=0, resizable=yes, scrollbars=yes`;

        window.open(data.data.link, '_blank', options);
        })
      }
    });

});

function setFinalProfitData(){
  const profitMarginGridFinal = AUIGrid.create("#profitMarginGridFinal", profitMarginColumnLayout1, profitMarginGridProps)
  AUIGrid.setGridData(profitMarginGridFinal, profitMaxInfo);
}


function sumTotalCostAmtWithOutFee(paramAddressList) {
  let total = 0;

  paramAddressList.forEach(address => {
    address.bundleList?.forEach(space => {
      space.gsList?.forEach(item => {
        // 문자열이면 숫자만 추출
        const clean = v => {
          if (typeof v === "string") {
            v = v.replace(/[^0-9]/g, "");
          }
          return Number(v) || 0;
        };

        const val = clean(item.ESTG_MNT_CST_AMT);
        const val2 = clean(item.ESTG_LIO_CST_AMT);
        const val3 = clean(item.IOP_INPCST_TOTAL);

        total += val + val2 + val3;
      });
    });
  });
    total +=Number(getSelectedDetailData("RNT","RET")?.[0]?.ESTC_COST_AMT || 0);
    let careDetailArray = getSelectedDetailData("PRO","CARE")
    for(let careDetailValue of careDetailArray){
      total+=Number(careDetailValue["ESTC_COST_AMT"]||0)
    }
   let vchDetailArray = getSelectedDetailData("PRO","VCH")
    for(let vchDetailValue of vchDetailArray){
      total+=Number(vchDetailValue["ESTC_COST_AMT"]||0)
    }
  return total;
}
function sumTotalCostAmtWithOutFee2(paramAddressList) {
  let total = 0;

  paramAddressList.forEach(address => {
    address.bundleList?.forEach(space => {
      space.gsList?.forEach(item => {
        // 문자열이면 숫자만 추출
        const clean = v => {
          if (typeof v === "string") {
            v = v.replace(/[^0-9]/g, "");
          }
          return Number(v) || 0;
        };

    /*    const val = clean(item.ESTG_MNT_CST_AMT);
        const val2 = clean(item.ESTG_LIO_CST_AMT);*/
        const val3 = clean(item.IOP_INPCST_TOTAL);

        total += /*val + val2 +*/ val3;
      });
    });
  });
    /*total +=Number(getSelectedDetailData("RNT","RET")?.[0]?.ESTC_COST_AMT || 0);
    let careDetailArray = getSelectedDetailData("PRO","CARE")
    for(let careDetailValue of careDetailArray){
      total+=Number(careDetailValue["ESTC_COST_AMT"]||0)
    }
   let vchDetailArray = getSelectedDetailData("PRO","VCH")
    for(let vchDetailValue of vchDetailArray){
      total+=Number(vchDetailValue["ESTC_COST_AMT"]||0)
    }*/
  return total;
}


function sumTotalEstGsAmt(){
    return rboEstComponentInfo
      .filter(item => item.ESTC_SUB_TYPE === "RNT_P" || item.ESTC_SUB_TYPE === "BND")
      .reduce((total, item) => {
        let val = item.ESTC_COST_AMT;
        if (typeof val === "string") {
          val = val.replace(/[^0-9]/g, "");
        }
        const num = Number(val) || 0;
        return total + num;
      }, 0);
}



function renderApproveStepItemData(target,targetId) {

    const tbody = target;
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

          const spaceHeaderRow = document.createElement("tr");
          spaceHeaderRow.className = "t-group-header";
          spaceHeaderRow.dataset.groupId = groupId;
          const spaceHeaderCell1=createCell("")
          spaceHeaderCell1.innerHTML=`
            <div class="flex justify-center">
              <button type="button" class="t-group-toggle" aria-expanded="true">
                <i class="icon-chevron w-[20px] h-[20px] bg-size-[20px]"></i>
              </button>
            </div>`

          spaceHeaderRow.appendChild(spaceHeaderCell1);
          const spaceHeaderCell2 = createCell("", "", 13);
          spaceHeaderCell2.innerHTML = `
            <div class="flex items-center gap-5">
              <span class="font-normal">${space.ESTB_TITLE}</span>
            </div>`;
          spaceHeaderRow.appendChild(spaceHeaderCell2);
          tbody.appendChild(spaceHeaderRow);


          if (space.gsList && space.gsList.length > 0) {
            space.gsList.forEach((item, estGsIdx) => {
              const ESTG_NET_DC_RT_FINAL = targetId=="approvalPopItemSpot"?item.ESTG_NET_DC_RT:item.ESTG_NET_DC_RT_FINAL;
              const qty = Number(item.ITM_QTY) || 0;
              const rentalTotal = item.RBO_RTC_PRICE * qty;
              const rentalGsTotal = item.RBO_RTC_PRICE * qty;
              item.RBO_RTC_PRICE_TOTAL = item.RBO_RTC_PRICE * qty;

              const inTotal = item.IOP_INPCST * qty;
              const factoryTotal = item.IOP_MNFCST * qty;
              const standardTotal = item.GIJUN_CST * qty;
              const consumerTotal = item.IOP_SALCST * qty;

               if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND);
                }else if(item.GS_AMT_UNIT){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT);
                }else{
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100);
                }

               item.ESTG_NET_AMT=Number(item.ESTG_NET_UP)*qty;
               subtotalEstgNetAmtTotal+= item.ESTG_NET_AMT;
               addressTotalEstgNetAmtTotal+=item.ESTG_NET_AMT;
               grandTotalEstgNetAmtTotal+=item.ESTG_NET_AMT;

              rntPDcAmt+=qty*Number(ESTG_NET_DC_RT_FINAL) || 0
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
                  combineRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND);
                }else if(item.GS_AMT_UNIT){
                  combineRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT);
                }else{
                  combineRntPDcAmt +adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100);
                }
              }else{
                nomalTotalInPriceTotal += inTotal;
                nomalTotalRentalPriceTotal += rentalTotal;

                if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND)*qty;
                }else if(item.GS_AMT_UNIT){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT)*qty;
                }else{
                  nomalRntPDcAmt +adjustByUnit(item.RBO_RTC_PRICE*((100 - (ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100)*qty;
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
              itemRow.appendChild(createCell(ESTG_NET_DC_RT_FINAL, "text-right"));
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

    const detailData = {
      RNT_P: {
        ESTC_COST_AMT: nomalTotalInPriceTotal,
        ESTC_EST_AMT: nomalTotalRentalPriceTotal,
        ESTC_DC_AMT: nomalTotalRentalPriceTotal - nomalRntPDcAmt,
        ESTC_DC_RT: nomalTotalRentalPriceTotal > 0
          ? ((nomalTotalRentalPriceTotal - nomalRntPDcAmt) / nomalTotalRentalPriceTotal)
          : 0,
        ESTC_NET_AMT: nomalTotalRentalPriceTotal - (nomalTotalRentalPriceTotal - nomalRntPDcAmt)
      },
      BND: {
        ESTC_COST_AMT: combineTotalInPriceTotal,
        ESTC_EST_AMT: combineTotalRentalPriceTotal,
        ESTC_DC_AMT: combineTotalRentalPriceTotal - combineRntPDcAmt,
        ESTC_DC_RT: combineTotalRentalPriceTotal > 0
          ? ((combineTotalRentalPriceTotal - combineRntPDcAmt) / combineTotalRentalPriceTotal)
          : 0,
        ESTC_NET_AMT: combineTotalRentalPriceTotal - (combineTotalRentalPriceTotal - combineRntPDcAmt)
      },
      LIO: {
        ESTC_COST_AMT: lioEstcCostAmt,
        ESTC_COST_RT: grandTotalInPriceTotal > 0
          ? ((lioEstcCostAmt / grandTotalInPriceTotal) * 100).toFixed(2)
          : 0
      },
      MNT: {
        ESTC_COST_AMT: mntEstcCostAmt,
        ESTC_COST_RT: grandTotalInPriceTotal > 0
          ? ((mntEstcCostAmt / grandTotalInPriceTotal) * 100).toFixed(2)
          : 0
      },
      RET: {
        ESTC_COST_AMT: rboItemReturnRt,
        ESTC_COST_RT: grandTotalInPriceTotal > 0
          ? ((rboItemReturnRt / grandTotalInPriceTotal) * 100).toFixed(2)
          : 0
      }
    };
    if(rboEstComponentInfo&&targetId!="approvalPopItemSpot"){
      rboEstComponentInfo = rboEstComponentInfo.map(item => {
        const subType = item.ESTC_SUB_TYPE;
        const extraData = detailData[subType];
        if (extraData) {
          return { ...item, ...extraData };
        }
        return item;
      });
      rboEstComponentInfoFn(rboEstComponentInfo)
    }
}


function finalProfitComponentCalculate(params,saveFlag,rboEstimateParam,rboEstComponentInfoPopParam){


  return fetchJson("/estimate/estimateApproveProfitData.ajax"
            , "POST"
            ,params
  ).then(async result => {
         if(saveFlag=="Y"){
         rboEstimate=rboEstimateParam
         rboEstComponentInfo = rboEstComponentInfoPopParam
         let data = result.profitMarginData;
           for(let tempData of data){
             if(tempData.period==rboEstimate.EST_PERIOD){
               rboEstimate.period = tempData.period;
               rboEstimate.EST_PMT = tempData.rentalPerMonth;
               rboEstimate.EST_RNT_AMT = tempData.totalRental;
               rboEstComponentInfo.forEach(obj=>{
                if(['CON','CAR','STB'].includes(obj.ESTC_SUB_TYPE)){
                  obj.ESTC_COST_AMT =Math.ceil(((Number(obj.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) )));
                }
               })

               rboEstimate.EST_BEP = tempData.monthlyRental;
               rboEstimate.EST_COST_AMT = tempData.incost;
               rboEstimate.EST_REAL_CON_AMT = tempData.contributionAmt;
               rboEstimate.EST_REAL_CON_RT = tempData.contributionRate;
               rboEstimate.EST_BIZ_IRR_Y = tempData.aIrrSimple;
               rboEstimate.EST_BIZ_IRR_M = tempData.mIrr;
               rboEstimate.EST_FIN_IRR_Y = tempData.aIrrSimple2;
               rboEstimate.EST_FIN_IRR_M = tempData.mIrr2;
               rboEstimate.EST_RTL_AMT = tempData.iopSalcstSum;
               rboEstimate.EST_BAS_AMT = tempData.gijunCstSum;
               rboEstimate.EST_FELL_AMT = tempData.rentalFee;
               //rboEstimate.payInFullFee = tempData.payInFullFee;
             }
           }
           setRntRateData(result.rntRateData)
           rboEstimate.EST_ACCR_AMT = Number(result.planSettingData.M_RENTAL_TOTAL||0);
           rboEstimate.EST_ACCR_FROM_DT = result.planSettingData.EST_ACCR_FROM_DT;
           rboEstimate.EST_ACCR_TO_DT = result.planSettingData.EST_ACCR_TO_DT;
           rboEstimate["EST_PROMO_AMT"] =rboEstComponentInfo.reduce((sum, item) => {
                                           if (item.ESTC_MAIN_TYPE === "PRO") {
                                             const value = item.ESTC_NET_AMT ? Number(item.ESTC_NET_AMT) : 0;
                                             return sum + value;
                                           }
                                           return sum;
                                         }, 0);
           rboEstimate["EST_DC_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                        if (item.ESTC_MAIN_TYPE !== "PRO"&&item.ESTC_MAIN_TYPE !== "GUD") {
                                          const value = item.ESTC_DC_AMT ? Number(item.ESTC_DC_AMT) : 0;
                                          return sum + value;
                                        }
                                        return sum;
                                      }, 0);
           rboEstimate["EST_EST_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                              if (item.ESTC_MAIN_TYPE !== "PRO"&&item.ESTC_MAIN_TYPE !== "GUD") {
                                                const value = item.ESTC_EST_AMT ? Number(item.ESTC_EST_AMT) : 0;
                                                return sum + value;
                                              }
                                              return sum;
                                            }, 0);


           rboEstimate["EST_OFR_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                                  if (item.ESTC_MAIN_TYPE !== "GUD") {
                                                    const value = item.ESTC_NET_AMT ? Number(item.ESTC_NET_AMT) : 0;
                                                    return sum + value;
                                                  }
                                                  return sum;
                                                }, 0);



            const popup = window.open('', 'editDiscountPop'); // 이미 열린 팝업 핸들 가져오기
           if(popup && !popup.closed){
               popup.close(); // 닫기
           }
           fetchJson("/estimate/updateEstimateApproveProfitData.ajax"
                     , "POST"
                     ,{
                       "rboEstimate": JSON.stringify(rboEstimate),//최종견적가
                       "addressList": JSON.stringify(addressList),//기간
                       "selectedDetail":JSON.stringify(rboEstComponentInfo),//렌탈상품 프로모션 원가 합계
                       "profitMarginData":JSON.stringify(result.profitMarginData)
                      }
           ).then((result)=>{
            if(result.message){
              location.reload();
            }
            })

           return null;
         }else{
            return result.profitMarginData;
         }

   })
}





function finalProfitCalculate(ofrAmt,paramAddressList,targetId,saveFlag){
  return fetchJson("/estimate/estimateApproveProfitData.ajax"
            , "POST"
            ,{
              "estEstAmt": ofrAmt,//최종견적가
              "period": rboEstimate.EST_PERIOD,//기간
              "sumTotalCostAmtWithOutFee":sumTotalCostAmtWithOutFee(paramAddressList),//렌탈상품 프로모션 원가 합계
              "sumTotalCostAmtWithOutFee2":sumTotalCostAmtWithOutFee2(paramAddressList),//렌탈상품 프로모션 원가 합계
              "EST_RNT_GS_AMT":Number(sumTotalEstGsAmt()||0),
              "prePayAmt":rboEstimate.EST_PRE_PAY,//선납금
              "gijunCstSum":getGsListSumByKey(paramAddressList,"GIJUN_CST"),//기준단가
              "iopSalcstSum":getGsListSumByKey(paramAddressList,"IOP_SALCST"),//소비자가
              "ctmLscno":rboEstimate.CTM_LSCNO//사업자등록번호(plan 조회)
             }
  ).then(async result => {
         if(targetId=="#profitMarginGridFinal"){
            let data = result.profitMarginData;
           AUIGrid.setGridData(targetId, data);
           for(let tempData of data){
             if(tempData.period==rboEstimate.EST_PERIOD){
               rboEstimate.period = tempData.period;
               rboEstimate.EST_PMT = tempData.rentalPerMonth;
               rboEstimate.EST_RNT_AMT = tempData.totalRental;
               rboEstComponentInfo.forEach(obj=>{
                if(['CON','CAR','STB'].includes(obj.ESTC_SUB_TYPE)){
                  obj.ESTC_COST_AMT =Math.ceil(((Number(obj.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) )));
                }
               })
               rboEstimate.EST_OFR_AMT = ofrAmt;
               rboEstimate.EST_TRUNC_AMT = ofrAmt - tempData.totalRental

               rboEstimate.EST_BEP = tempData.monthlyRental;
               rboEstimate.EST_COST_AMT = tempData.incost;
               rboEstimate.EST_REAL_CON_AMT = tempData.contributionAmt;
               rboEstimate.EST_REAL_CON_RT = tempData.contributionRate;
               rboEstimate.EST_BIZ_IRR_Y = tempData.aIrrSimple;
               rboEstimate.EST_BIZ_IRR_M = tempData.mIrr;
               rboEstimate.EST_FIN_IRR_Y = tempData.aIrrSimple2;
               rboEstimate.EST_FIN_IRR_M = tempData.mIrr2;
               rboEstimate.EST_RTL_AMT = tempData.iopSalcstSum;
               rboEstimate.EST_BAS_AMT = tempData.gijunCstSum;
               rboEstimate.EST_FELL_AMT = tempData.rentalFee;
               //rboEstimate.payInFullFee = tempData.payInFullFee;
             }
           }
           setRntRateData(result.rntRateData)
           rboEstimate.EST_ACCR_AMT = Number(result.planSettingData.M_RENTAL_TOTAL||0);
           rboEstimate.EST_ACCR_FROM_DT = result.planSettingData.EST_ACCR_FROM_DT;
           rboEstimate.EST_ACCR_TO_DT = result.planSettingData.EST_ACCR_TO_DT;
           rboEstimate["EST_PROMO_AMT"] =rboEstComponentInfo.reduce((sum, item) => {
                                           if (item.ESTC_MAIN_TYPE === "PRO") {
                                             const value = item.ESTC_NET_AMT ? Number(item.ESTC_NET_AMT) : 0;
                                             return sum + value;
                                           }
                                           return sum;
                                         }, 0);
           rboEstimate["EST_DC_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                        if (item.ESTC_MAIN_TYPE !== "PRO"&&item.ESTC_MAIN_TYPE !== "GUD") {
                                          const value = item.ESTC_DC_AMT ? Number(item.ESTC_DC_AMT) : 0;
                                          return sum + value;
                                        }
                                        return sum;
                                      }, 0);
           rboEstimate["EST_EST_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                              if (item.ESTC_MAIN_TYPE !== "PRO"&&item.ESTC_MAIN_TYPE !== "GUD") {
                                                const value = item.ESTC_EST_AMT ? Number(item.ESTC_EST_AMT) : 0;
                                                return sum + value;
                                              }
                                              return sum;
                                            }, 0);


           rboEstimate["EST_OFR_AMT"]=rboEstComponentInfo.reduce((sum, item) => {
                                                  if (item.ESTC_MAIN_TYPE !== "GUD") {
                                                    const value = item.ESTC_NET_AMT ? Number(item.ESTC_NET_AMT) : 0;
                                                    return sum + value;
                                                  }
                                                  return sum;
                                                }, 0);


           if(saveFlag){
              const popup = window.open('', 'editDiscountPop'); // 이미 열린 팝업 핸들 가져오기
             if(popup && !popup.closed){
                 popup.close(); // 닫기
             }
             fetchJson("/estimate/updateEstimateApproveProfitData.ajax"
                       , "POST"
                       ,{
                         "rboEstimate": JSON.stringify(rboEstimate),//최종견적가
                         "addressList": JSON.stringify(addressList),//기간
                         "selectedDetail":JSON.stringify(rboEstComponentInfo),//렌탈상품 프로모션 원가 합계
                         "profitMarginData":JSON.stringify(data)
                        }
             ).then((result)=>{
              if(result.message){
                location.reload();
              }
              })
           }
           return null;
         }else{
            return result.profitMarginData;
         }

   })
}




function getSelectedDetailData(rboEstComponentInfoParam,subType,targetId){
  rboEstComponentInfoParam.forEach(obj=>{
    if(obj.ESTC_SUB_TYPE==subType){
      return obj[targetId];
    }
  })
}

function fixDcRateApprove(modalAddressList){
  addressList = modalAddressList;
  renderApproveStepItemData(document.getElementById("approvalItemSpot"),"approvalItemSpot")
  let ofrAmt =rboEstComponentInfo.reduce((sum, item) => {
    if ((item.ESTC_MAIN_TYPE === "RNT" && item.ESTC_SUB_TYPE !== "RET")|| item.ESTC_MAIN_TYPE === "GUD") {
      return sum; // RNT는 제외
    }

    const value = item.ESTC_NET_AMT ? Number(item.ESTC_NET_AMT) : 0;
    return sum + value;
  }, 0);
let total = addressList.reduce((addrSum, address) => {
  return addrSum + (address.bundleList?.reduce((bundleSum, bundle) => {
    return bundleSum + (bundle.gsList?.reduce((itemSum, item) => {
      let sumData = adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND)*item.ITM_QTY;
      return itemSum + sumData;
    }, 0) || 0);
  }, 0) || 0);
}, 0);



  finalProfitCalculate(ofrAmt+total,addressList,"#profitMarginGridFinal",true);
}

function rboEstComponentInfoFn(rboEstComponentInfoParam){
  let rntPNetAmt = Number(getSelectedDetailData(rboEstComponentInfoParam,"RNT_P","ESTC_NET_AMT")||0);
  let bndNetAmt = Number(getSelectedDetailData(rboEstComponentInfoParam,"BND","ESTC_NET_AMT")||0);
  rboEstComponentInfoParam.forEach(obj=>{
    if(obj.ESTC_SUB_TYPE=="VCH"){
      obj.ESTC_COST_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
      obj.ESTC_EST_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
      obj.ESTC_DC_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
    }
    if(obj.ESTC_SUB_TYPE=="VCH"){
      obj.ESTC_COST_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
      obj.ESTC_EST_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
      obj.ESTC_DC_AMT=((Number(obj.ESTC_COST_RT)*rboEstimate.EST_OFR_AMT)/100).toFixed(0);
    }
    if(obj.ESTC_SUB_TYPE=="DC_SPC"){
        obj.ESTC_DC_AMT = Math.abs((((rntPNetAmt+bndNetAmt) * (Number(obj.ESTC_DC_RT) || 0)) / 100).toFixed(0))
        obj.ESTC_NET_AMT = Number((((rntPNetAmt+bndNetAmt) * (Number(obj.ESTC_DC_RT) || 0) * -1) / 100).toFixed(0))
    }

  })
}




function setSpcSpanData(){
    document.getElementById("spcBucketAppr").style.display = "none";
    const container = document.getElementById("spcSpanDetailAppr");
    const container2 = document.getElementById("spcSpanDetailAppr2");
    const container3 = document.getElementById("spcSpanDetailAppr3");
    const container4 = document.getElementById("spcSpanDetailAppr4");
    const container5 = document.getElementById("spcSpanDetailAppr5");

    container.innerHTML = ""; // 초기화
    container2.innerHTML = ""; // 초기화
    container3.innerHTML = ""; // 초기화
    container4.innerHTML = ""; // 초기화
    container5.innerHTML = ""; // 초기화

    Object.entries(spcSpanData).forEach(([key, value]) => {
        if (value === "Y") {
          const span = document.createElement("span");
          span.className = "badge badge-destructive-outline badge-rounded";
          span.innerHTML = key
          if(['다중 주소','추가 할인 요청','Project Plan 추가 할인 요청'].includes(key)){
            container2.appendChild(span);
          }else if(key=='최소 금액 미달'){
            container3.appendChild(span);
          }else if(key=='심사 조건 미충족'){
            container4.appendChild(span);

          }else if(key=='심사 필요 업종'){
            container5.appendChild(span);
          }else{
            container.appendChild(span);
          }
          document.getElementById("spcBucketAppr").style.display = "block";
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


function setRntRateData(responseRntRateData){
  if(responseRntRateData.length==0){
    setSelectedDetailData("STB","ESTC_COST_RT",0)
    setSelectedDetailData("CON","ESTC_COST_RT",0)
    setSelectedDetailData("CAR","ESTC_COST_RT",0)
    setSelectedDetailData("RET","ESTC_COST_RT",0)
    setSelectedDetailData("TRF","ESTC_COST_RT",0)
    return;
  }
  responseRntRateData.forEach(item => {
    switch(item.RRT_SUB_TYPE) {
      case "STB":
        setSelectedDetailData("STB","ESTC_COST_RT",item.RRT_RATE*100)
        setSelectedDetailData("STB","ESTC_COST_AMT",Math.ceil(((Number(item.RRT_RATE?? 0)*100 ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))))
        break;
      case "CON":
        setSelectedDetailData("CON","ESTC_COST_RT",item.RRT_RATE*100)
        setSelectedDetailData("CON","ESTC_COST_AMT",Math.ceil(((Number(item.RRT_RATE?? 0)*100 ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))))
        break;
      case "CAR":
        setSelectedDetailData("CAR","ESTC_COST_RT",item.RRT_RATE*100)
        setSelectedDetailData("CAR","ESTC_COST_AMT",Math.ceil(((Number(item.RRT_RATE?? 0) )*100 / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))))
        break;
      case "RET":
        /*setSelectedDetailData("RET","ESTC_EST_RT",item.RRT_RATE)
        setSelectedDetailData("RET", "ESTC_EST_AMT",  (getSelectedDetailData("GUD","RET")[0]["ESTC_COST_AMT"]||0)*item.RRT_RATE);
        setSelectedDetailData("RET", "ESTC_NET_AMT",  (getSelectedDetailData("GUD","RET")[0]["ESTC_COST_AMT"]||0)*item.RRT_RATE);*/
        //setSelectedDetailData("STB","ESTC_COST_AMT",Math.ceil(((Number(item.RRT_RATE?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))))
        break;
      case "TRF":

        var netUpAmt = getGsListSumByKey(addressList,'ESTG_NET_UP','Y')
        if(rboEstimate.EST_RT_TYPE=='ACQ_F'){
          netUpAmt += getGsListSumByKey(addressList,'ESTG_NET_UP','N')
        }
        setSelectedDetailData("TRF","ESTC_EST_RT",item.RRT_RATE)
        setSelectedDetailData("TRF", "ESTC_EST_AMT", Math.floor(Number(netUpAmt??0)*item.RRT_RATE));
        setSelectedDetailData("TRF","ESTC_NET_AMT",(Math.floor(Number(netUpAmt??0)*item.RRT_RATE)-Math.floor((Number(netUpAmt??0)*item.RRT_RATE)*Number((getSelectedDetailData("GUD","TRF")[0]["ESTC_DC_RT"]||0))/100)));
        //setSelectedDetailData("STB","ESTC_COST_AMT",Math.ceil(((Number(item.RRT_RATE?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))))
        break;
    }
  });

// { stbFee: 0.02, conFee: 0.02, carFee: 0.03 }

}

function setSelectedDetailData(findSubType,settingField,value,id){
  let rntRow;
  if (id) {
    rntRow = rboEstComponentInfo.find(d => d.ESTC_IDX === id);
  } else {
    rntRow = rboEstComponentInfo.find(d => d.ESTC_SUB_TYPE === findSubType);
  }
  if (rntRow) {
    rntRow[settingField] = value;
  }
}

function getSelectedDetailData(mainType,subType){
  if (subType) {
    // mainType + subType 둘 다 있는 경우
    return rboEstComponentInfo.filter(
      d => d.ESTC_MAIN_TYPE === mainType && d.ESTC_SUB_TYPE === subType
    );
  } else {
    // mainType만 있는 경우
    return rboEstComponentInfo.filter(
      d => d.ESTC_MAIN_TYPE === mainType
    );
  }
}

function openModalSpcAprDetailModal(){
  openSpecialApprovalDetailModal(apprsSpc);
}

function callMemberPage(){
  window.open('/bonds/bondsDetail/'+rboEstimate["EST_M_IDX"], '_blank')
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
