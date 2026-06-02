const addressUl = document.getElementById("addressUl");
const selecEstRtTypeEl = document.getElementById("step3_EST_RT_TYPE");
const selecEstPeriodEl = document.getElementById("step3_EST_PERIOD");
const selecEstVchTypeEl = document.getElementById("step3_EST_VCH_TYPE");
const inputEl = document.getElementById("step3_EST_PRE_PAY");

var profitMarginGrid;
var profitMarginGrid2;
var serviceGrid;
var planData = [];
var addressList=[];
var estimateAddressList=[];

// 출력 순서 정의
const orderMap = {
  RNT: ["RNT_P","BND","LIO","MNT"],
  PAY: ["PAY_STD"],
  SPC: ["DC_PRE","DC_SPC"],
  PRO: ["VCH","CARE"],
  FEE: ["CON","CAR","STB","ETC"],
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
  DC_FEE:"일시판매수수료",CON:"계약성사수수료", CAR:"케어운영수수료", STB:"안정운영수수료", ETC:"기타수수료",
  RET:"제품회수비", TRF:"유상양도비"
};

const detailTemplate = {
  "ESTC_IDX":"",
  "ESTC_MAIN_TYPE":"",
  "ESTC_SUB_TYPE":"",
  "ESTC_MEMO":"",
  "ESTC_COST_STD":"0",
  "ESTC_COST_RT":0,
  "ESTC_COST_AMT":0,
  "ESTC_EST_STD":"",
  "ESTC_EST_RT":0,
  "ESTC_EST_AMT":0,
  "ESTC_DC_RT":0,
  "ESTC_DC_AMT":0,
  "ESTC_NET_AMT":0,
  "CSM_IDX":""
};


var rboEstimate = {
    "OPPTY_AMT": 0,
    "IR_UB": 0,
    "APR_LIMIT_AMT": 0,
    "OPPTY_QTY": 0,
    "APR_REMAIN_LIMIT_AMT": 0,
    "EVALUATION_GRADE": "",
    "LEGACY_OPPTY_NM": "",/*영업건 명*/
    "CTM_LSCNO": "", /*사업자 등록번호*/
    "RECENT_PLAN": "",
    "COM_MNGEST_NM": "",
    "WATCH_GRADE": "",
    "COM_MNGEST": "",
    "USR_NM": "",
    "OPPTY_CD": "",
    "ESTIMATE_CLOSE_DATE": "",
    "VND_CD": "",
    "CTM_NM": "",
    "FST_SYS_DT": "",
    "VND_NM": "",
    "FST_USR_CD": "",
    "CR_GRADE": "",
    "COM_NAME": comName,
    "USR_CD1": "",
    "EST_U_NM2" : userName,
    "RENTAL_DATE" : new Date().toISOString().slice(0, 10),
    "EST_REG_DT" : new Date().toISOString().slice(0, 10),
    "EST_TITLE":"",
    "EST_VALID_DT":"",
    "EST_PLAN" :"",
    "CTM_CD":"",//영업건 조회시
    "CTM_CD_CUT":"",//영업건 조회시
    "EST_VAL_GRADE":"",
    "EST_PRE_PAY":0,//선납금
    "EST_RT_TYPE":"",
    "EST_PERIOD":60,
    "EST_RNT_GS_AMT":0,//총견적상품가
    "EST_COST_AMT":0,//총원가합계
    "EST_EST_AMT":0,//총 견적합계
    "EST_DC_AMT":0,//할인총액
    "EST_OFR_AMT":0,//최종견적총액
    "EST_TRUNC_AMT":0,//절사금액
    "EST_PROMO_AMT":0,//프로모션총액
    "EST_RNT_AMT":0,//렌탈총렌탈료
    "EST_PMT":0,//렌탈월렌탈료



    "EST_ACCR_AMT":"",//	렌탈총액누계금액
    "EST_ACCR_FROM_DT":"",//	누계시작일
    "EST_ACCR_TO_DT":"",//	누계종료일
};
let selectedDetail =  Object.keys(orderMap)
  .flatMap(mainType =>
    orderMap[mainType]
      .filter(subType => !["ETC","CARE","DC_SPC"].includes(subType))
      .map(subType => ({
        ...detailTemplate,
        ESTC_MAIN_TYPE: mainType,
        ESTC_SUB_TYPE: subType,
        ESTC_IDX: null

      }))
  );
  for(let csmData of csmList){
      selectedDetail.push({
                ESTC_MAIN_TYPE: "PRO",
                ESTC_SUB_TYPE: "CARE",   // 필요에 맞게 지정
                ESTC_MEMO: csmData.CSM_NAME,
                ESTC_COST_RT: 0,
                ESTC_COST_AMT: 0,
                ESTC_EST_STD: "",
                ESTC_EST_AMT: 0,
                ESTC_DC_RT: 1,
                ESTC_DC_AMT: 0,
                ESTC_NET_AMT: 0,
                ESTC_IDX:  null, // 고유 ID
                CSM_IDX: csmData.CSM_IDX,
                CSM_MEMO:csmData.CSM_MEMO,
                CSM_TYPE:csmData.CSM_TYPE,
                CSM_TYPE_NM:csmData.CSM_TYPE_NM,
                CSM_SCH_TYPE:csmData.CSM_SCH_TYPE,
              });
  }


var profitMarginColumnLayout1 = [
  {headerText:'렌탈기간',dataField:'period',width:85, postfix: "개월"},
  {headerText:'월렌탈료',dataField:'rentalPerMonth',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'총렌탈료',dataField:'totalRental',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
 /* {headerText:'BEP',dataField:'monthlyRental',width:70},
  {headerText:'렌탈원가',dataField:'incost',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'공헌이익',dataField:'contributionAmt',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'공헌이익률',dataField:'contributionRate',style: 'text-fursys-red text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
  {headerText:'사업IRR(년)',dataField:'aIrrSimple',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(2) + "%" : "";}},
  {headerText:'사업IRR(월)',dataField:'mIrr',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(2) + "%" : "";}},*/
  {headerText:'소비자가',dataField:'iopSalcstSum',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'대비 비율',dataField:'iopSalcstRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
  {headerText:'기준 단가',dataField:'gijunCstSum',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'대비 비율',dataField:'gijunCstRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
  {headerText:'렌탈수수료',dataField:'rentalFee',dataType:"numeric",autoThousandSeparator:true,style: 'text-right'},
  {headerText:'일시판매 수수료',dataField:'payInFullFee',dataType:"numeric",autoThousandSeparator:true,style: 'text-right',width:115},
  {headerText:'대비 비율',dataField:'payInFullRate',style: 'text-right',labelFunction: function(rowIndex, columnIndex, value) {return value ? parseFloat(value).toFixed(1) + "%" : "";}},
]
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
                                   <button class="btn btn-icon btn-outline" onclick='openServiceModal(${JSON.stringify(item)}, false)'>
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


var profitMarginGridProps = {
  isRowAllCheckCurrentView : true,
  autoGridHeight : true,
  selectionMode: 'none',
  hoverMode: "none" ,
  showRowNumColumn: true,
  rowStyleFunction: function (rowIndex, item) {
    if (item.period == rboEstimate.EST_PERIOD||item.period == rboEstimate.period) {
      return "cell-bg-active";
      }
  }, defaultColumnWidth: 100,
}

profitMarginGrid = AUIGrid.create("#profitMarginGrid", profitMarginColumnLayout1, profitMarginGridProps);
profitMarginGrid2 = AUIGrid.create("#profitMarginGrid2", profitMarginColumnLayout1, profitMarginGridProps);
serviceGrid = AUIGrid.create("#serviceGrid", serviceColumnLayout1, profitMarginGridProps);


function openCustomerDistribution(){
  window.open('/customer/distribution/'+rboEstimate.CTM_CD_CUT,'_blank')
}
function openBusinessHeadOffice(){
  window.open('/business/headOffice/'+rboEstimate.OPPTY_CD, '_blank')
}

function renderStep1Data() {
    addressUl.innerHTML = "";   // 모든 li 제거
    rboEstimate["APR_REMAIN_LIMIT_AMT"]
          = Number(rboEstimate["APR_LIMIT_AMT"]||0)
          - Number(rboEstimate["APR_REMAIN_RENT_AMT"]||0)
          - Number(rboEstimate["EST_RNT_GS_AMT"]||0)
    const fieldMapping = {
      "step1_LEGACY_OPPTY_NM": "LEGACY_OPPTY_NM",
      "step1_COM_NAME": "COM_NAME",
      "step1_USR_NM": "USR_NM",
      "step1_COM_MNGEST_NM": "COM_MNGEST_NM",
      "step1_VND_NM": "VND_NM",
      "step1_CTM_NM": "CTM_NM",
      "modal_CTM_NM": "CTM_NM",
      "modal_REC_EST_PLAN": "REC_EST_PLAN",
      "step1_EVALUATION_GRADE": "EVALUATION_GRADE",
      "step1_RECENT_PLAN": "RECENT_PLAN",
      "step1_TOTAL_CREDIT_LIMIT": "APR_LIMIT_AMT",
      "step1_REMAIN_CREDI": "APR_REMAIN_LIMIT_AMT",
      "step1_IR_UB": "IR_UB",
      "step1_CR_GRADE": "CR_GRADE",
      "step1_WATCH_GRADE": "WATCH_GRADE",
      "modal_CR_GRADE": "AD_CRDT",
      "modal_WATCH_GRADE": "AD_WATCH_GRADE",
      "modal_APR_REMAIN_LIMIT_AMT": "APR_REMAIN_LIMIT_AMT",
      "modal_APR_LIMIT_AMT": "APR_LIMIT_AMT",
      "step1_RENTAL_U_NAME": "EST_U_NM2",
      "step1_EST_REG_DT": "EST_REG_DT",
      "step1_EST_VALID_DT": "EST_VALID_DT",
      "step1_EST_TITLE" : "EST_TITLE",
      "modal_EVALUATION_GRADE":"EVALUATION_GRADE",
      "SALES_SUB_TYPE":"SALES_SUB_TYPE",
      "OPPTY_AMT":"OPPTY_AMT",

    };

    for (const id in fieldMapping) {
      const key = fieldMapping[id];
      const element = document.getElementById(id);
      if (element) {

        if(['step1_EST_REG_DT'].includes(id)&&rboEstimate[key]&&String(rboEstimate[key]).length==8){
          const yyyy = rboEstimate[key].substring(0, 4);
          const mm   = rboEstimate[key].substring(4, 6);
          const dd   = rboEstimate[key].substring(6, 8);
          element.value = `${yyyy}-${mm}-${dd}`;
        }else if(['OPPTY_AMT','modal_APR_REMAIN_LIMIT_AMT','modal_APR_LIMIT_AMT','step1_TOTAL_CREDIT_LIMIT'].includes(id)&&rboEstimate[key]){
           element.value = Number(rboEstimate[key]).toLocaleString() ?? "";
        }else if(['step1_REMAIN_CREDI'].includes(id)&&rboEstimate[key]) {
          element.value = (Number(rboEstimate[key]||0)+Number(rboEstimate["EST_RNT_GS_AMT"]||0)).toLocaleString() ?? "";
        }else{
          element.value = rboEstimate[key] ?? "";
        }
      }
    }
    for(let addressDataIdx in addressList){
      addAddress("["+(Number(addressDataIdx)+1)+"] ("+addressList[addressDataIdx].ZIP_CD+") " +addressList[addressDataIdx].ROAD_ADDR);
    }
}
async function renderStep2Data() {
    renderStepItemData("itemSpot")
    renderDetails(selectedDetail)
    renderGuides(selectedDetail)
    rboEstimate["APR_REMAIN_LIMIT_AMT"]
      = Number(rboEstimate["APR_LIMIT_AMT"]||0)
      - Number(rboEstimate["APR_REMAIN_RENT_AMT"]||0)
      - Number(rboEstimate["EST_RNT_GS_AMT"]||0)
    document.getElementById("step2_EST_RNT_GS_AMT").textContent = Number(rboEstimate["EST_RNT_GS_AMT"]).toLocaleString();
    document.getElementById("step2_EST_PLAN").textContent = rboEstimate["EST_PLAN"];
    document.getElementById("step2_REMAIN_CREDI").textContent = rboEstimate["APR_REMAIN_LIMIT_AMT"].toLocaleString();
    document.getElementById("modal_EST_RNT_GS_AMT").textContent = Number(rboEstimate["EST_RNT_GS_AMT"]).toLocaleString();
    document.getElementById("modal_EST_PLAN").textContent = rboEstimate["EST_PLAN"];
    document.getElementById("modal_REMAIN_CREDI").textContent = rboEstimate["APR_REMAIN_LIMIT_AMT"].toLocaleString();
}


function renderStepItemData(targetDepth) {

    const tbody = document.getElementById(targetDepth);
    tbody.innerHTML = ""; // Clear existing content

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
          input.style.minWidth = "75px";
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

          // Space Header Row
          if(targetDepth=='itemSpot'){
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
                <button type="button" class="btn btn-regist border-border" onclick="openProductAddModal('productAddModal',${addrIdx},${bundleIdx})">품목 추가
                </button>
              </div>`;
            spaceHeaderRow.appendChild(spaceHeaderCell2);
            tbody.appendChild(spaceHeaderRow);
          }else{
            tbody.appendChild(createCell(""));
          }

          if (space.gsList && space.gsList.length > 0) {
            space.gsList.forEach((item, estGsIdx) => {
              const qty = Number(item.ITM_QTY) || 0;
              const rentalTotal = item.RBO_RTC_PRICE * qty;
              const rentalGsTotal = item.RBO_RTC_PRICE * qty;
              item.RBO_RTC_PRICE_TOTAL = item.RBO_RTC_PRICE * qty;
              item.IOP_INPCST_TOTAL = item.IOP_INPCST*qty;
              item.IOP_MNFCST_TOTAL = item.IOP_MNFCST*qty;
              item.GIJUN_CST_TOTAL = item.GIJUN_CST*qty;
              item.IOP_SALCST_TOTAL = item.IOP_SALCST*qty;

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
              if(item.INSU_YN=='N'){
                rboItemReturnRt+=qty*Number(item.RBO_ITEM_RETURN_RT) || 0//((Number(item.RBO_MNT_RT) || 0)*(Number(inTotal) || 0))/100;
              }


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
              if(targetDepth=='itemSpot'){
                itemRow.appendChild(checkboxCell);
              }else{
                itemRow.appendChild(createCell(""));
              }


              if(item.SET_YN=='I'&&targetDepth=='itemSpot'){
                itemRow.appendChild(createCellWithInput("text", "text-left", "ESTG_CAT", `${addrIdx}_${bundleIdx}_${estGsIdx}_ESTG_CAT`, item.ESTG_CAT || ''));
              }else{
                itemRow.appendChild(createCell(""));
              }


              itemRow.appendChild(createCell(item.ITM_CD, "text-left"));
              itemRow.appendChild(createCell(item.COL_CD, "text-left"));
              itemRow.appendChild(createCell(item.SET_YN=='I'?"단품":"세트", "text-left"));
              itemRow.appendChild(createCell(item.ITM_NM, "text-left"));
              itemRow.appendChild(createCell(item.ITM_DESC, "text-left"));
              if(targetDepth=='itemSpot'){
                itemRow.appendChild(createCellWithInput("text", "text-right", "ESTG_QTY", `${addrIdx}_${bundleIdx}_${estGsIdx}_ESTG_QTY`, formatNumberWithCommas(qty) || '',true));
              }else{
                itemRow.appendChild(createCell(qty.toLocaleString(), "text-right"));
              }

              itemRow.appendChild(createCell(item.RBO_RTC_PRICE.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(rentalTotal.toLocaleString(), "text-right"));
              if(targetDepth!='itemSpot'){
                itemRow.appendChild(createCell(item.ESTG_NET_DC_RT_FINAL, "text-right"));
                itemRow.appendChild(createCell(item.ESTG_NET_UP.toLocaleString(), "text-right"));
                itemRow.appendChild(createCell(item.ESTG_NET_AMT.toLocaleString(), "text-right"));
              }

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
          if(targetDepth!='itemSpot'){
            subtotalRow.appendChild(createCell(""));
            subtotalRow.appendChild(createCell(""));
            subtotalRow.appendChild(createCell(subtotalEstgNetAmtTotal.toLocaleString(), "text-right"));
          }
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
      if(targetDepth!='itemSpot'){
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
      }
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
    if(targetDepth!='itemSpot'){
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
    }
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalStandardPriceTotal.toLocaleString(), "text-right"));
    grandTotalRow.appendChild(createCell(""));
    grandTotalRow.appendChild(createCell(grandTotalConsumerPriceTotal.toLocaleString(), "text-right"));
    tbody.appendChild(grandTotalRow);


    rboEstimate["EST_EST_AMT"]=grandTotalRentalPriceTotal;
    if(!rboEstimate["EST_OFR_AMT"]){
      rboEstimate["EST_OFR_AMT"]=grandTotalRentalGsPriceTotal;
    }
    rboEstimate["EST_RNT_GS_AMT"]=grandTotalRentalGsPriceTotal;




    // RNT_P 제품가
    setSelectedDetailData("RNT_P","ESTC_COST_AMT",nomalTotalInPriceTotal)
    setSelectedDetailData("RNT_P","ESTC_EST_AMT",nomalTotalRentalPriceTotal)
    setSelectedDetailData("RNT_P","ESTC_DC_AMT",nomalTotalRentalPriceTotal-nomalRntPDcAmt)
    setSelectedDetailData("RNT_P","ESTC_DC_RT", nomalTotalRentalPriceTotal > 0? ((nomalTotalRentalPriceTotal-nomalRntPDcAmt) / nomalTotalRentalPriceTotal): 0)
    setSelectedDetailData("RNT_P","ESTC_NET_AMT",nomalTotalRentalPriceTotal-(nomalTotalRentalPriceTotal-nomalRntPDcAmt));
    //BND 결합상품
    setSelectedDetailData("BND","ESTC_COST_AMT",combineTotalInPriceTotal)
    setSelectedDetailData("BND","ESTC_EST_AMT",combineTotalRentalPriceTotal)
    setSelectedDetailData("BND","ESTC_DC_AMT",combineTotalRentalPriceTotal-combineRntPDcAmt)
    setSelectedDetailData("BND","ESTC_DC_RT", combineTotalRentalPriceTotal > 0? ((combineTotalRentalPriceTotal-combineRntPDcAmt) / combineTotalRentalPriceTotal): 0)
    setSelectedDetailData("BND","ESTC_NET_AMT",combineTotalRentalPriceTotal-(combineTotalRentalPriceTotal-combineRntPDcAmt));


    //LIO "물류/설치/운영비"
    setSelectedDetailData("LIO","ESTC_COST_AMT",lioEstcCostAmt)
    setSelectedDetailData("LIO","ESTC_COST_RT",grandTotalInPriceTotal>0?((lioEstcCostAmt/grandTotalInPriceTotal)*100).toFixed(2):0)
    //MNT "유지관리비"
    setSelectedDetailData("MNT","ESTC_COST_AMT",mntEstcCostAmt)
    setSelectedDetailData("MNT","ESTC_COST_RT",grandTotalInPriceTotal>0?((mntEstcCostAmt/grandTotalInPriceTotal)*100).toFixed(2):0)
    //RET 제품회수비
    setSelectedDetailData("RET","ESTC_COST_AMT",rboItemReturnRt)
    setSelectedDetailData("RET","ESTC_COST_RT",grandTotalInPriceTotal>0?((rboItemReturnRt/grandTotalInPriceTotal)*100).toFixed(2):0)


}



async function calculateServiceData(){
const csmIdxArray = selectedDetail
  .filter(item => item.CSM_IDX !== undefined && item.CSM_IDX !== null&&  item.CSM_IDX != "")
  .map(item => item.CSM_IDX);

  const gsList = addressList
    .flatMap(addr => addr.bundleList || [])
    .flatMap(space => space.gsList || [])
    .map(item => ({
      GS_CODE: item.ITM_CD+'-'+item.COL_CD,
      ITM_QTY : item.ITM_QTY
    }));
  if(csmIdxArray.length>0&&gsList.length>0&&rboEstimate.EST_PERIOD){
    await fetchJson('/estimate/searchServiceData.ajax','POST',{"csmIdxArray":JSON.stringify(csmIdxArray),"gsList":JSON.stringify(gsList), "period": rboEstimate.EST_PERIOD})
    .then(returnData=>{
      if(returnData){
        for(let csmIdx of csmIdxArray){
          const target = selectedDetail.find(d => d.CSM_IDX === csmIdx);
          if (target) {
            Object.assign(target, {
              ESTC_COST_AMT: returnData.data.searchServiceData.returnCostMap[csmIdx],
              ESTC_EST_AMT: returnData.data.searchServiceData.returnPriceMap[csmIdx],
              ESTC_DC_AMT: returnData.data.searchServiceData.returnPriceMap[csmIdx],
              CSM_CYCLE:returnData.data.searchServiceData.returnCycleMap[csmIdx],
              CSM_CYCLE_COUNT:returnData.data.searchServiceData.returnCycleMap[csmIdx],
              CSM_GS_PRICE:returnData.data.searchServiceData.returnPriceMap["price"],
              CSM_GS_QTY:returnData.data.searchServiceData.returnPriceMap["qty"],
              CSM_GS_COST:returnData.data.searchServiceData.returnPriceMap["cost"],
            });
          }
        }
      }
    })
  }
}

async function renderStep3Data() {
    await calculateServiceData();
    document.getElementById("step3_TOTAL_CREDIT_LIMIT").value = rboEstimate["APR_LIMIT_AMT"].toLocaleString() + "원"; //총여신한도
    document.getElementById("step3_REMAIN_CREDI").value = rboEstimate["APR_REMAIN_LIMIT_AMT"].toLocaleString() + "원"; //잔여여신한도



    if(!Number(inputEl.value)){
      estPrePaySetting(Number(rboEstimate["EST_PRE_PAY"]||0)?"- "+Number(rboEstimate["EST_PRE_PAY"]||0).toLocaleString() + "원":"0원");//선납금 데이터 세팅
      inputEl.value=   Number(rboEstimate["EST_PRE_PAY"]||0).toLocaleString() + "원";
    }

    document.getElementById("step3_EST_PRE_PAY_total").innerHTML = Number(rboEstimate["EST_PRE_PAY"]).toLocaleString() + "원";
    document.getElementById("step4_EST_PRE_PAY_total").innerHTML = Number(rboEstimate["EST_PRE_PAY"]).toLocaleString() + "원";
    selecEstRtTypeEl.value = rboEstimate["EST_RT_TYPE"];
    selecEstVchTypeEl.value = rboEstimate["EST_VCH_TYPE"];

    selecEstPeriodEl.value = String(rboEstimate["EST_PERIOD"]);

    renderDetails(selectedDetail)
    renderGuides(selectedDetail)
    renderServiceHouse();
    document.getElementById("step2_EST_RNT_GS_AMT").textContent = Number(rboEstimate["EST_RNT_GS_AMT"]).toLocaleString();
    document.getElementById("step3_EST_EST_AMT_TOTAL").innerHTML  = Number(rboEstimate["EST_EST_AMT"]||0).toLocaleString()+"원";
    document.getElementById("step3_EST_DC_AMT_TOTAL").innerHTML  = Number(rboEstimate["EST_DC_AMT"]||0).toLocaleString()+"원";
    document.getElementById("step3_EST_OFR_AMT_TOTAL").innerHTML  = Number(rboEstimate["EST_OFR_AMT"]||0).toLocaleString()+"원";
    document.getElementById("step3_EST_TRUNC_AMT_TOTAL").innerHTML  = Number(rboEstimate["EST_TRUNC_AMT"]||0).toLocaleString()+"원";
    document.getElementById("step3_EST_PROMO_AMT_TOTAL").innerHTML  = Number(rboEstimate["EST_PROMO_AMT"]||0).toLocaleString()+"원";
    document.getElementById("step3_EST_PERIOD_TOTAL").innerHTML  = rboEstimate["EST_PERIOD"]+" 개월";
    let item = getProfitMaginGridData();
    document.getElementById("step3_RENTAL_PER_MONTH_TOTAL").innerHTML  = Number(item?.["rentalPerMonth"]??0).toLocaleString()+"원";
    document.getElementById("step3_TOTAL_RENTAL_TOTAL").innerHTML  = Number(item?.["totalRental"]??0).toLocaleString()+"원";


}

function renderServiceHouse(){
  const serviceHouseContainer = document.getElementById("serviceHouse") || { innerHTML: "" };
  serviceHouseContainer.innerHTML = ""; // Clear existing content
  let serviceHouseData = '';
  selectedDetail.forEach((item)=>{
    if(item.ESTC_SUB_TYPE =='CARE'){
    let serviceTime = Number(item.CSM_CYCLE||0)
     if(!item.ESTC_EST_AMT&&!item.ESTC_COST_AMT&&item.CSM_TYPE=='CHC'){
        serviceTime=0;
      }
    if(serviceTime!=0){
      serviceHouseData+=`
            <div class="border border-border rounded-md flex flex-col gap-2 text-sm p-3">
                <div class="flex gap-2 justify-between">
                  <p class="font-medium">${item.ESTC_MEMO}</p>
                  <i class="icon-close" onclick="deleteServiceData(${item.CSM_IDX})" style="flex-shrink:0"></i>
                </div>
                <div>
                  <p class="text-primary-300 font-medium">서비스 회차</p>
                  <p>${serviceTime}</p>
                </div>
                <div>
                  <p class="text-primary-300 font-medium">설명</p>
                  <p>${item.CSM_MEMO}</p>
                  </div>
              </div>
          `
      }
    }
  })
  serviceHouseContainer.innerHTML = serviceHouseData;
}
function deleteServiceData(csmIdx){
  fetchJson("/estimate/checkDeleteServiceData.ajax"
              , "POST"
              ,{csmIdx}
              ).then(async data => {
                if(data.data.checkDeleteService){
                  selectedDetail = selectedDetail.filter(x=>x.CSM_IDX!==csmIdx);
                  renderStep2Data();
                  renderStep3Data();
                }else{
                  alert('기본 서비스는 제거 할 수 없습니다.')
                }

              })


}


function setSelectedDetailData(findSubType,settingField,value,id){
  let rntRow;
  if (id) {
    rntRow = selectedDetail.find(d => d.ESTC_IDX === id);
  } else {
    rntRow = selectedDetail.find(d => d.ESTC_SUB_TYPE === findSubType);
  }
  if (rntRow) {
    rntRow[settingField] = value;
  }
}




function deleteSelectedItems() {
  const checkedBoxes = document.querySelectorAll('#itemSpot .checkbox:checked');
  if (checkedBoxes.length < 1) {
    alert("품목이 선택되지않았습니다.");
    return false;
  }

  planData = [];

  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("confirmBtn").style.display = "block";
  rboEstimate["EST_PLAN"] = '';

  const rows = Array.from(checkedBoxes).map(box => box.closest('tr'));
  rows.sort((a, b) => parseInt(b.dataset.itemIdx, 10) - parseInt(a.dataset.itemIdx, 10));

  rows.forEach(row => {
    const addrIdx = parseInt(row.dataset.addrIdx, 10);
    const bundleIdx = parseInt(row.dataset.bundleIdx, 10);
    const itemIdx = parseInt(row.dataset.itemIdx, 10);

    if (
      addressList[addrIdx] &&
      addressList[addrIdx].bundleList &&
      addressList[addrIdx].bundleList[bundleIdx] &&
      addressList[addrIdx].bundleList[bundleIdx].gsList
    ) {
      addressList[addrIdx].bundleList[bundleIdx].gsList.splice(itemIdx, 1);
    }
  });

  // 삭제 후 다시 렌더링
  renderStep2Data();
  renderStep3Data();
}



document.getElementById("step1_EST_TITLE").addEventListener("input", function(e) {
    rboEstimate["EST_TITLE"] = e.target.value;
});

document.getElementById("step1_EST_VALID_DT").addEventListener("change", function(e) {
    if(rboEstimate&&rboEstimate["EST_IDX"]&&!rboEstimate["EST_VALID_SET"]){
      rboEstimate["EST_VALID_SET"] = "Y";
      document.getElementById("step1_EST_VALID_DT").value=rboEstimate["EST_VALID_DT"]
    }
});


function setRboEstimate(selectedData){
    if(!rboEstimate.EST_VALID_DT&&document.getElementById("step1_EST_VALID_DT").value){
      rboEstimate.EST_VALID_DT = document.getElementById("step1_EST_VALID_DT").value
    }

    Object.assign(rboEstimate, selectedData);
    if(!rboEstimate["EST_TITLE"]){
      rboEstimate["EST_TITLE"] = rboEstimate["LEGACY_OPPTY_NM"]
    }
    renderStep1Data()
    renderStep2Data();
}

function setSelectedAddressAdd(selectedAddressData){
    for(address of addressList){
      if(address.ROAD_ADDR == selectedAddressData.ROAD_ADDR){
        return false;
      }
    }
    addressList.push(selectedAddressData);
    addAddress("["+addressList.length+"] ("+selectedAddressData.ZIP_CD+") " +selectedAddressData.ROAD_ADDR);

    planData = []
    return true;
}

function setSelectedProductAdd(selectedProductData, addrIdx, bundleIdx) {
    const space = addressList[addrIdx].bundleList[bundleIdx];
    if (!space.gsList) {
      space.gsList = [];
    }else{
      for(selectedProduct of selectedProductData){
        for(itemData of space.gsList){
          if(itemData.ITM_CD==selectedProduct.ITM_CD && itemData.COL_CD==selectedProduct.COL_CD){
            return false;
          }
        }
      }
    }
    if (Array.isArray(selectedProductData)) {
      space.gsList.push(...selectedProductData);
    } else {
      space.gsList.push(selectedProductData);
    }

    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("confirmBtn").style.display = "block";
    rboEstimate["EST_PLAN"] = '';
    renderStep2Data();
    return true;
}


function addAddress(addressText) {
    const addressLi = document.createElement("li");
    addressLi.className = "flex items-center justify-between border-t border-border gap-5 py-2";
    const span = document.createElement("span");
    span.textContent = addressText;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-delete"
    button.addEventListener("click", (data) => {
      planData=[]
      rboEstimate["EST_PLAN"]='';
      const index = Array.from(addressUl.children).indexOf(addressLi);
      if (index > -1) {
        addressList.splice(index, 1);
      }
      addressUl.innerHTML = "";
      for(let addressDataIdx in addressList){
        addAddress("["+(Number(addressDataIdx)+1)+"] ("+addressList[addressDataIdx].ZIP_CD+") " +addressList[addressDataIdx].ROAD_ADDR);
      }
      renderAddresses();
    });
    addressLi.appendChild(span);
    if(!rboEstimateData){
      addressLi.appendChild(button);
    }else if(rboEstimateData&&!rboEstimateData["EST_M_IDX"]){
      addressLi.appendChild(button);
    }
    addressUl.appendChild(addressLi);
    renderAddresses();
}

// 렌더링 함수
function renderAddresses() {
    const container = document.getElementById("addressContainer") || { innerHTML: "" };
    container.innerHTML = ""; // Clear existing content

    addressList.forEach((address, addrIndex) => {
      if (!address.bundleList) {
        address.bundleList = [];
      }

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.addrIndex = addrIndex;

      const cardHeader = document.createElement("div");
      cardHeader.className = "card-header p-4 min-h-auto";
      cardHeader.innerHTML = `
        <p class="text-sm font-medium">(${address.ZIP_CD}) ${address.ROAD_ADDR}</p>
      `;
      /*<button class="btn remove-address-btn" data-addr-index="${addrIndex}">주소삭제</button>*/

      const cardContent = document.createElement("div");
      cardContent.className = "card-content p-4 pt-0 min-h-auto collapse-content is-open";

      const tableScroll = document.createElement("div");
      tableScroll.className = "table-scroll";
      tableScroll.style.height = "400px";
      tableScroll.style.overflowY = "auto";

      const table = document.createElement("table");
      table.className = "table";
      table.innerHTML = `
        <thead>
          <tr>
            <th class="table-head" style="width:80px">번호</th>
            <th class="table-head">분류(공간) 명</th>
            <th class="table-head" style="width:75px">
              <button type="button" class="btn btn-regist border-border add-addr-row-btn" data-addr-index="${addrIndex}">추가</button>
            </th>
          </tr>
        </thead>
      `;

      const tbody = document.createElement("tbody");
      address.bundleList.forEach((space, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx + 1}</td>
          <td>
            <input type="text" class="input"
              value="${space.ESTB_TITLE}"
              data-addr-index="${addrIndex}"
              data-space-index="${idx}">
          </td>
          <td class="text-center">
            <button type="button" class="btn btn-delete btn-icon remove-addr-row-btn"
              data-addr-index="${addrIndex}"
              data-space-index="${idx}"></button>
          </td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableScroll.appendChild(table);
      cardContent.appendChild(tableScroll);
      card.appendChild(cardHeader);
      card.appendChild(cardContent);
      container.appendChild(card);
    });

    bindEvents();
    renderStep2Data();
}
function bindEvents() {
    document.querySelectorAll(".remove-address-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        addressList.splice(addrIdx, 1);
        renderStep1Data();
        renderAddresses();
        renderStep2Data();

      });
    });
    document.querySelectorAll(".add-addr-row-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        addressList[addrIdx].bundleList.push({ ESTB_TITLE: "" });
        planData=[];
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("confirmBtn").style.display = "block";
        rboEstimate["EST_PLAN"] = '';
        renderAddresses();
        renderStep2Data();
      });
    });
    document.querySelectorAll(".remove-addr-row-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        const bundleIdx = parseInt(btn.dataset.spaceIndex, 10);
        addressList[addrIdx].bundleList.splice(bundleIdx, 1);
        planData=[]
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("confirmBtn").style.display = "block";
        rboEstimate["EST_PLAN"]='';
        renderAddresses();
        renderStep2Data();
      });
    });
    document.querySelectorAll("input[data-addr-index]").forEach(input => {
      input.addEventListener("input", e => {
        const addrIdx = parseInt(input.dataset.addrIndex, 10);
        const bundleIdx = parseInt(input.dataset.spaceIndex, 10);
        addressList[addrIdx].bundleList[bundleIdx].ESTB_TITLE = e.target.value;
        renderStep2Data();
      });
    });
}

document.getElementById("itemSpot").addEventListener("focusout", function(event) {
    if (event.target.matches('[data-input="ESTG_QTY"]')) {
      const value = event.target.value.replace(/[^0-9]/g, "");
      const key = event.target.dataset.input;
      const [addrIdx, bundleIdx, estGsIdx, ...rest] = event.target.id.split("_");

      if (!addressList[addrIdx]) addressList[addrIdx] = {};
      if (!addressList[addrIdx].bundleList) addressList[addrIdx].bundleList = [];
      if (!addressList[addrIdx].bundleList[bundleIdx]) addressList[addrIdx].bundleList[bundleIdx] = {};
      if (!addressList[addrIdx].bundleList[bundleIdx].gsList) addressList[addrIdx].bundleList[bundleIdx].gsList = [];
      if (!addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]) {
        addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx] = {};
      }

      addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx][key] = value;
      addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]["ITM_QTY"] = value;
      planData=[];
      document.getElementById("nextBtn").style.display = "none";
      document.getElementById("confirmBtn").style.display = "block";
      rboEstimate["EST_PLAN"]='';
      calculatePlanData()
      renderStep2Data();
    }else if(event.target.matches('[data-input="ESTG_CAT"]')){
      const value = event.target.value;
      const key = event.target.dataset.input;
      const [addrIdx, bundleIdx, estGsIdx] = event.target.id.split("_");

      if (!addressList[addrIdx]) addressList[addrIdx] = {};
      if (!addressList[addrIdx].bundleList) addressList[addrIdx].bundleList = [];
      if (!addressList[addrIdx].bundleList[bundleIdx]) addressList[addrIdx].bundleList[bundleIdx] = {};
      if (!addressList[addrIdx].bundleList[bundleIdx].gsList) addressList[addrIdx].bundleList[bundleIdx].gsList = [];

      if (!addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]) {
        addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx] = {};
      }

      addressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx][key] = value;

    }
});
function sumTotalCostAmtWithOutFee(){
    return selectedDetail
      .filter(item => item.ESTC_MAIN_TYPE === "RNT" || item.ESTC_MAIN_TYPE === "PRO")
      .reduce((total, item) => {
        let val = item.ESTC_COST_AMT;
        if (typeof val === "string") {
          val = val.replace(/[^0-9]/g, "");
        }
        const num = Number(val) || 0;
        return total + num;
      }, 0);
}

function sumTotalCostAmtWithOutFee2(){
    return selectedDetail
      .filter(item => item.ESTC_MAIN_TYPE === "RNT")
      .reduce((total, item) => {
        let val = item.ESTC_COST_AMT;
        if (typeof val === "string") {
          val = val.replace(/[^0-9]/g, "");
        }
        const num = Number(val) || 0;
        return total + num;
      }, 0);
}


function sumTotalEstGsAmt(){
    return selectedDetail
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



function getSelectedDetailData(mainType,subType){
  if (subType) {
    // mainType + subType 둘 다 있는 경우
    return selectedDetail.filter(
      d => d.ESTC_MAIN_TYPE === mainType && d.ESTC_SUB_TYPE === subType
    );
  } else {
    // mainType만 있는 경우
    return selectedDetail.filter(
      d => d.ESTC_MAIN_TYPE === mainType
    );
  }
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
        break;
      case "CON":
        setSelectedDetailData("CON","ESTC_COST_RT",item.RRT_RATE*100)
        break;
      case "CAR":
        setSelectedDetailData("CAR","ESTC_COST_RT",item.RRT_RATE*100)
        break;
      case "RET":
        setSelectedDetailData("RET","ESTC_EST_RT",item.RRT_RATE)
        break;
      case "TRF":
        setSelectedDetailData("TRF","ESTC_EST_RT",item.RRT_RATE)
        break;
    }
  });

// { stbFee: 0.02, conFee: 0.02, carFee: 0.03 }

}

function setProfitMarginGrid(gridData){
  AUIGrid.showAjaxLoader(profitMarginGrid);
  try {
    AUIGrid.setGridData(profitMarginGrid, gridData);
    AUIGrid.setGridData(profitMarginGrid2, gridData);
  } catch (error) {
    console.error("그리드 데이터 세팅 중 오류 발생:", error);
  } finally {
    AUIGrid.removeAjaxLoader(profitMarginGrid);
  }
}
//플랜데이터 세팅
function calculatePlanData(planSettingData,flag){
  if(planData.length==0){
      rboEstimate.EST_ACCR_AMT = 0;
      rboEstimate.EST_ACCR_FROM_DT = "";
      rboEstimate.EST_ACCR_TO_DT = "";
      document.getElementById("sectionDetailsSection").innerHTML = '';
  }else{
      rboEstimate.EST_ACCR_AMT = Number(planSettingData.M_RENTAL_TOTAL||0);
      rboEstimate.EST_ACCR_FROM_DT = planSettingData.EST_ACCR_FROM_DT;
      rboEstimate.EST_ACCR_TO_DT = planSettingData.EST_ACCR_TO_DT;

      let nextRow={};
      let currentRow={};
      const currentIndex = planData.findIndex(row =>(Number(planSettingData.M_RENTAL_TOTAL||0)+Number(rboEstimate.EST_RNT_GS_AMT)) >= row.RRT_FROM_AMT
                                                && (Number(planSettingData.M_RENTAL_TOTAL||0)+Number(rboEstimate.EST_RNT_GS_AMT)) <= row.RRT_TO_AMT);


      if (currentIndex !== -1 && currentIndex + 1 < planData.length) {
        nextRow = planData[currentIndex + 1];
      } else {
        nextRow = planData[currentIndex];
      }
      currentRow = planData[currentIndex]
      if(planSettingData.RENTAL_PROJECTPLAN_FLAG==='Y'){
         const maxRow = planData.reduce((prev, curr) => {
                return (prev.RRT_TO_AMT > curr.RRT_TO_AMT) ? prev : curr;
              });
        currentRow = maxRow;
        nextRow = maxRow;
      }
      renderPlan(currentRow
                ,nextRow
                ,Number(rboEstimate.EST_RNT_GS_AMT)
                ,planSettingData
                ,flag)
  }
}

function setRrtAmt(value){
  const num = Number(value);
  if(num>1000000000000000){
    return "";
  }
  if (num >= 100000000) {
    return (num / 100000000) + "억";
  }
  if (num >= 10000000) {
    return (num / 10000000) + "천만원";
  }
    return "0원"
}

function renderPlan(currentRow,nextRow,estGsAmt,planSettingData,flag){
    if(currentRow){
        addressList.forEach(addr => {
          if (addr.bundleList && Array.isArray(addr.bundleList)) {
            addr.bundleList.forEach(space => {
              if (space.gsList && Array.isArray(space.gsList)&&flag) {
                space.gsList.forEach(item => {
                  item.ESTG_NET_DC_RT_FINAL = Number(currentRow.RRT_RATE)*100
                });
              }
            });
          }
        });
    }



    rboEstimate["EST_RNT_GS_AMT"] = estGsAmt;
    rboEstimate["EST_PLAN"] = currentRow.RRT_TITLE;
    document.getElementById("step3_planData").value = currentRow.RRT_TITLE;
    rboEstimate["EST_ACCR_AMT"] = Number(planSettingData.M_RENTAL_TOTAL||0);
    rboEstimate["EST_ACCR_FROM_DT"] = planSettingData.EST_ACCR_FROM_DT;
    rboEstimate["EST_ACCR_TO_DT"] = planSettingData.EST_ACCR_TO_DT;
   // 원하는 값들을 변수로 정의
    const currentPlan = currentRow.RRT_TITLE;
    const currentRange = setRrtAmt(currentRow.RRT_FROM_AMT)+" 이상 ~ "+setRrtAmt(currentRow.RRT_TO_AMT) + (setRrtAmt(nextRow.RRT_TO_AMT)?" 미만":"");
    let currentDiscount = '';
    let extraDiscount = "";

    if(currentRow.RRT_FROM_AMT==500000000){
      currentDiscount = '별도 할인율'
      extraDiscount = planSettingData.RENTAL_PROJECTPLAN_ENDDAY ?`<div>유효기간</div>
                       <div class="font-medium">${'~' + planSettingData.RENTAL_PROJECTPLAN_ENDDAY}</div>`:''
    }else{
      currentDiscount = Number(currentRow.RRT_RATE)*100+'%'
      extraDiscount = `<div>필요 추가 금액</div>
                       <div class="font-medium">${(Number(nextRow.RRT_FROM_AMT)-(Number(rboEstimate.EST_RNT_GS_AMT)+Number(rboEstimate.EST_ACCR_AMT))).toLocaleString()}원</div>`
    }

    let recommendDiscount = '';
    if(nextRow.RRT_FROM_AMT==500000000){
      recommendDiscount = '별도 할인율'
    }else {
      recommendDiscount = Number(nextRow.RRT_RATE)*100+'%'
    }

    const totalAmount = Number(planSettingData.M_RENTAL_TOTAL||0).toLocaleString()+'원';
    const estimateAmount = Number(estGsAmt).toLocaleString()+'원';
    const calcAmount = (Number(planSettingData.M_RENTAL_TOTAL||0)+Number(estGsAmt)).toLocaleString()+'원'

    const recommendPlan = nextRow.RRT_TITLE;
    const recommendRange = setRrtAmt(nextRow.RRT_FROM_AMT)+" 이상 ~ "+setRrtAmt(nextRow.RRT_TO_AMT) + (setRrtAmt(nextRow.RRT_TO_AMT)?" 미만":"");

  // 템플릿 문자열로 HTML 생성
  const html = `
    <div class="card bg-primary-50 border-none">
      <div class="card-header">
        <h5 class="card-title">현재 플랜</h5>
      </div>
      <div class="card-content">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">현재 플랜</p>
            <b class="font-medium">${currentPlan}</b>
          </div>
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">기준</p>
            <b class="font-medium">${currentRange}</b>
          </div>
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">적용 할인율</p>
            <b class="font-medium">${currentDiscount}</b>
          </div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between text-sm">
            <div>총 렌탈 금액(1년)</div>
            <div>${totalAmount}</div>
          </div>
          <div class="flex justify-between text-sm mt-2">
            <div>이번 견적 금액</div>
            <div>${estimateAmount}</div>
          </div>
          <div class="flex justify-between border-t border-t-[var(--primary-200)] mt-3 pt-2">
            <div>산출 금액</div>
            <div class="font-semibold">${calcAmount}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-primary-50 border-none mt-5">
      <div class="card-header">
        <h5 class="card-title">다음 플랜</h5>
      </div>
      <div class="card-content">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">현재 플랜</p>
            <b class="font-medium">${recommendPlan}</b>
          </div>
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">기준</p>
            <b class="font-medium">${recommendRange}</b>
          </div>
          <div class="border border-border rounded-md p-4 bg-white">
            <p class="text-primary-300" style="font-size:11px;margin-bottom:0.5rem">적용 할인율</p>
            <b class="font-medium">${recommendDiscount}</b>
          </div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between mt-3 pt-2 text-sm">
             ${extraDiscount}
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("sectionDetailsSection").innerHTML = html;
}

async function calculatePlanAndDetail(flag=false){
 if(rboEstimateData&&rboEstimateData["EST_M_IDX"]&&Number(rboEstimate["EST_RNT_GS_AMT"])>80000000){
  alert("렌탈소비자가 8,000만원 이상의 건은 일반견적으로 진행해주십시오");
  return false;
 }



  if (addressList.some(addr => !addr.bundleList || addr.bundleList.length === 0)) {
    alert("분류가 미입력되어 있습니다. 입력해주세요");
    return false;
  }
  // bundleList는 있는데 gsList가 없는 경우
  else if (addressList.some(addr =>addr.bundleList.some(space => !space.gsList || space.gsList.length === 0))) {
    alert("품목이 미입력된 주소,분류가 있습니다. 품목을 등록해주세요");
    return false;
  }else if (addressList.some(addr =>addr.bundleList.some(space =>space.gsList && space.gsList.some(item => !item.ITM_QTY || Number(item.ITM_QTY) === 0)))) {
     alert("품목 수량이 입력되지 않은 항목이 있습니다. 수량을 입력해주세요");
     return false;
   }



  if((Number(rboEstimate.EST_RNT_GS_AMT)||0)<=0){
    planData=[];
    rboEstimate["EST_PLAN"]='';
    setProfitMarginGrid([]);

    setRntRateData([])
    return false;
  }

  if(flag=="trueBtn"){
    const data = getSelectedDetailData("SPC","DC_PRE")[0];
     data.ESTC_DC_AMT = 0;
    data.ESTC_NET_AMT = 0
    data.ESTC_DC_RT =0
    setSelectedDetailData("PAY_STD","ESTC_NET_AMT",0);
    setSelectedDetailData("PAY_STD","ESTC_DC_AMT",0);
    document.getElementById("step3_EST_PRE_PAY_total").innerHTML = "0원";
    document.getElementById("step4_EST_PRE_PAY_total").innerHTML = "0원";
    rboEstimate["EST_PRE_PAY"]=0;
    inputEl.value=0;
    await renderStep2Data();
    await renderStep3Data();
    flag=true
  }


  let prePayRows = getSelectedDetailData("PAY","PAY_STD");
  await fetchJson("/estimate/calculatePlanAndDetail.ajax"
            , "POST"
            ,{
              "estEstAmt": rboEstimate.EST_OFR_AMT,//최종견적가
              "period": rboEstimate.EST_PERIOD,//기간
              "sumTotalCostAmtWithOutFee":sumTotalCostAmtWithOutFee(),//렌탈상품 프로모션 원가 합계
              "sumTotalCostAmtWithOutFee2":sumTotalCostAmtWithOutFee2(),//렌탈상품 프로모션 원가 합계

              "EST_RNT_GS_AMT":Number(sumTotalEstGsAmt()||0),
              "prePayAmt":Math.abs(Number(prePayRows[0]["ESTC_NET_AMT"])),//선납금
              "gijunCstSum":getGsListSumByKey(addressList,"GIJUN_CST"),//기준단가
              "iopSalcstSum":getGsListSumByKey(addressList,"IOP_SALCST"),//소비자가
              "ctmLscno":rboEstimate.CTM_LSCNO//사업자등록번호(plan 조회)
             }
  ).then(async data => {
      planData = data.planData;
      calculatePlanData(data.planSettingData,flag);
      setRntRateData(data.rntRateData)
      setProfitMarginGrid(data.profitMarginData);
      for(let tempData of data.profitMarginData){
        if(tempData.period==rboEstimate.EST_PERIOD){
          rboEstimate.period = tempData.period;
          rboEstimate.EST_PMT = tempData.rentalPerMonth;
          rboEstimate.EST_RNT_AMT = tempData.totalRental;
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

      document.getElementById("nextBtn").style.display = "block";
      document.getElementById("confirmBtn").style.display = "none";
      renderStep2Data(); //그리는용
      renderStep3Data(); //그리는용
      if(flag){ //할인율 구하면 한번더 호출할라고
        calculatePlanAndDetail();
      }


    })

}




let prevValue = ""; // 이전 값 저장용

// 입력 중에는 숫자만 유지
inputEl.addEventListener("input", function(event) {
         let rawValue = event.target.value.replace(/[^0-9]/g, "");
         let numValue = Number(rawValue);
         rboEstimate["EST_PRE_PAY"] = rawValue;
         event.target.value = rawValue ? numValue.toLocaleString() : "";
   });

   // 포커스를 잃었을 때 포맷팅해서 보여주기
  inputEl.addEventListener("blur", function(event) {
      let rawValue = event.target.value.replace(/[^0-9]/g, "");
      const data = getSelectedDetailData("SPC","DC_PRE")[0];
      const dcFee = getSelectedDetailData("FEE","DC_FEE")[0];
      if (rawValue) {
          let prePayAmt = Number(rawValue);
          if (prePayAmt > (Number(rboEstimate.EST_RNT_GS_AMT||0) - Number(rboEstimate["EST_DC_AMT"]||0) + Number(prevValue||0)*1.02)*0.9) {
              event.target.value = Number(prevValue).toLocaleString() + "원";
              setSelectedDetailData("PAY_STD","ESTC_NET_AMT",(Number(prevValue)*-1));
              rboEstimate["EST_PRE_PAY"]=prevValue;
              data.ESTC_DC_RT = 2;
              data.ESTC_DC_AMT = Number((((prevValue||0) * Number(data.ESTC_DC_RT)) / 100).toFixed(0));
              data.ESTC_NET_AMT = Number((((prevValue||0) * Number(data.ESTC_DC_RT)*-1) / 100).toFixed(0))
              if(Number(rboEstimate["EST_PRE_PAY"])){

                 if(dcFee){
                    Object.assign(dcFee, {
                      ESTC_COST_AMT: adjustByUnit(Math.floor((Number(rboEstimate["EST_PRE_PAY"]||0))*0.1),100,"TRUNC")
                    });
                 }else{
                       selectedDetail.push({
                                  ESTC_MAIN_TYPE: "FEE",
                                  ESTC_SUB_TYPE: "DC_FEE",   // 필요에 맞게 지정
                                  ESTC_MEMO: '',
                                  ESTC_COST_RT: 10,
                                  ESTC_COST_AMT: adjustByUnit(Math.floor((Number(rboEstimate["EST_PRE_PAY"]||0))*0.1),100,"TRUNC"),
                                  ESTC_EST_STD: "",
                                  ESTC_EST_AMT: 0,
                                  ESTC_DC_RT: 0,
                                  ESTC_DC_AMT: 0,
                                  ESTC_NET_AMT: 0,
                                  ESTC_IDX: null // 고유 ID
                                });
                 }
               }
               /*if(data.ESTC_COST_STD=="0"){
                  data.ESTC_DC_RT = 2;
                  data.ESTC_DC_AMT = Number((((prePayAmt||0) * Number(data.ESTC_DC_RT)) / 100).toFixed(0));
                  data.ESTC_NET_AMT = Number((((prePayAmt||0) * Number(data.ESTC_DC_RT)*-1) / 100).toFixed(0))
               }else{
                if(prePayAmt>=data.ESTC_DC_AMT){
                  data.ESTC_DC_AMT = data.ESTC_DC_AMT;
                  data.ESTC_NET_AMT = data.ESTC_DC_AMT*-1
                  data.ESTC_DC_RT = (prePayAmt?((data.ESTC_DC_AMT / prePayAmt) * 100).toFixed(2): "0.00")
                }else{
                  data.ESTC_DC_AMT = Number(prePayAmt);
                  data.ESTC_NET_AMT = Number(prePayAmt)*-1
                  data.ESTC_DC_RT = 100;
                }
               }*/
              alert('상품 최종 견적가의 최대 90프로까지만 선납금 입력이 가능합니다.');
              return;
          }

              data.ESTC_DC_RT = 2;
              data.ESTC_DC_AMT = Number((((Number(rawValue)||0) * Number(data.ESTC_DC_RT)) / 100).toFixed(0));
              data.ESTC_NET_AMT = Number((((Number(rawValue)||0) * Number(data.ESTC_DC_RT)*-1) / 100).toFixed(0))
              rboEstimate["EST_PRE_PAY"]=rawValue;

               if(dcFee){
                  Object.assign(dcFee, {
                    ESTC_COST_AMT: adjustByUnit(Math.floor((Number(rboEstimate["EST_PRE_PAY"]||0))*0.1),100,"TRUNC")
                  });
               }else{
                     selectedDetail.push({
                                ESTC_MAIN_TYPE: "FEE",
                                ESTC_SUB_TYPE: "DC_FEE",   // 필요에 맞게 지정
                                ESTC_MEMO: '',
                                ESTC_COST_RT: 10,
                                ESTC_COST_AMT: adjustByUnit(Math.floor((Number(rboEstimate["EST_PRE_PAY"]||0))*0.1),100,"TRUNC"),
                                ESTC_EST_STD: "",
                                ESTC_EST_AMT: 0,
                                ESTC_DC_RT: 0,
                                ESTC_DC_AMT: 0,
                                ESTC_NET_AMT: 0,
                                ESTC_IDX: null // 고유 ID
                              });
               }



          /* if(data.ESTC_COST_STD=="0"){
              data.ESTC_DC_RT = 2;
              data.ESTC_DC_AMT = Number((((Number(rawValue)||0) * Number(data.ESTC_DC_RT)) / 100).toFixed(0));
              data.ESTC_NET_AMT = Number((((Number(rawValue)||0) * Number(data.ESTC_DC_RT)*-1) / 100).toFixed(0))
           }else{
              if(Number(rawValue)>=data.ESTC_DC_AMT){
                data.ESTC_DC_AMT = data.ESTC_DC_AMT;
                data.ESTC_NET_AMT = data.ESTC_DC_AMT*-1
                data.ESTC_DC_RT = (Number(rawValue)?((data.ESTC_DC_AMT / Number(rawValue)) * 100).toFixed(2): "0.00")
              }else{
                data.ESTC_DC_AMT = Number(Number(rawValue));
                data.ESTC_NET_AMT = Number(Number(rawValue))*-1
                data.ESTC_DC_RT = 100;
              }
           }*/


          setSelectedDetailData("PAY_STD","ESTC_NET_AMT",(Number(rawValue)*-1));
          setSelectedDetailData("PAY_STD","ESTC_DC_AMT",(Number(rawValue)));
          renderStep2Data();
          renderStep3Data();
          document.getElementById("step3_EST_PRE_PAY_total").innerHTML = Number(rawValue).toLocaleString() + "원";
          document.getElementById("step4_EST_PRE_PAY_total").innerHTML = Number(rawValue).toLocaleString() + "원";
          calculatePlanAndDetail();

          // 마지막에만 포맷팅 적용
          const formatted = Number(rawValue).toLocaleString() + "원";
          event.target.value = formatted;
          estPrePaySetting(Number(rawValue).toLocaleString()?"- " + formatted:"0원");
      }else{
       data.ESTC_DC_AMT = 0;
       data.ESTC_NET_AMT = 0
       data.ESTC_DC_RT =0

       selectedDetail = selectedDetail.filter(x=>x.ESTC_SUB_TYPE!=="DC_FEE");


        setSelectedDetailData("PAY_STD","ESTC_NET_AMT",0);
        setSelectedDetailData("PAY_STD","ESTC_DC_AMT",0);
        renderStep2Data();
        renderStep3Data();
        document.getElementById("step3_EST_PRE_PAY_total").innerHTML = "0원";
        document.getElementById("step4_EST_PRE_PAY_total").innerHTML = "0원";
        rboEstimate["EST_PRE_PAY"]=0;
        calculatePlanAndDetail();
      }
  });

   // 다시 포커스를 얻으면 숫자만 보이게
   inputEl.addEventListener("focus", function(event) {
       let rawValue = event.target.value.replace(/[^0-9]/g, "");
       event.target.value = rawValue;
       prevValue = rawValue;
   });

function formatNumberWithCommas(num) {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function estPrePaySetting(settingData){
    const els = document.querySelectorAll('[name="EST_PRE_PAY"]');
    els.forEach(el => {
      el.textContent = settingData;   // 원하는 값
    });

}
selecEstRtTypeEl.addEventListener("change", function(event) {
    rboEstimate.EST_RT_TYPE = event.target.value;
     const filtered = selectedDetail.filter(item => item.ESTC_SUB_TYPE === "RET");
    //RET(반납) ACQ_F(인수형)
    if(event.target.value=='ACQ_F'){

     filtered.forEach(item => {
            item.ESTC_MAIN_TYPE = "GUD";
      });
      orderMap.RNT = ["RNT_P","BND","LIO","MNT"];
      orderMap.GUD = ["RET","TRF"];
    }else{
      filtered.forEach(item => {
            item.ESTC_MAIN_TYPE = "RNT";
      });
     orderMap.RNT = ["RNT_P","BND","LIO","MNT","RET"];
     orderMap.GUD = ["TRF"];
    }

    renderStep2Data();//계산용
    renderStep3Data();//계산용
    selecEstVchTypeEl.dispatchEvent(new Event("change"));
    if((addressList&&addressList.length>0&&addressList[0].bundleList&&addressList[0].bundleList.length>0)){
      calculatePlanAndDetail(true);
    }

});

selecEstVchTypeEl.addEventListener("change", function(event) {
    rboEstimate.EST_VCH_TYPE = event.target.value;
    const filtered = selectedDetail.filter(item => item.ESTC_SUB_TYPE === "VCH");
    let vchEstcRow = [];
    if(event.target.value=='PAY'||event.target.value==''){
      filtered.forEach(item => {
        item.ESTC_MAIN_TYPE = "PRO";
        item.ESTC_NET_AMT = 0;
      });
      orderMap.SPC = ["DC_PRE","DC_SPC"];
      orderMap.PRO = ["VCH","CARE"];
      vchEstcRow = getSelectedDetailData('PRO','VCH')
    }else{
      filtered.forEach(item => {
        item.ESTC_MAIN_TYPE = "SPC";
      });
      orderMap.SPC = ["DC_PRE","DC_SPC","VCH"];
      orderMap.PRO = ["CARE"];
      vchEstcRow = getSelectedDetailData('SPC','VCH')
    }


    vchEstcRow[0].ESTC_COST_STD=event.target.value;
    vchEstcRow[0].ESTC_COST_RT = vchEstcRow[0].ESTC_COST_STD === "DC" ? 1 : (vchEstcRow[0].ESTC_COST_STD === "PAY"?2:0);

    vchEstcRow[0].ESTC_COST_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
    vchEstcRow[0].ESTC_EST_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
    vchEstcRow[0].ESTC_DC_RT="1"
    vchEstcRow[0].ESTC_DC_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
     if(event.target.value=='DC'){
      vchEstcRow[0].ESTC_NET_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100*-1).toFixed(0);
    }else{
      vchEstcRow[0].ESTC_NET_AMT=0;
    }
    renderStep2Data();//계산용
    renderStep3Data();//계산용
    if((addressList&&addressList.length>0&&addressList[0].bundleList&&addressList[0].bundleList.length>0)){
      calculatePlanAndDetail(true);
    }
});



selecEstPeriodEl.addEventListener("change", function(event) {
    rboEstimate.EST_PERIOD = event.target.value;
    renderStep2Data();//계산용
    renderStep3Data();//계산용
    if((addressList&&addressList.length>0&&addressList[0].bundleList&&addressList[0].bundleList.length>0)){
      calculatePlanAndDetail(true);
    }
});


//견적상세 견적 상세 렌탈제품가 mainType 렌탈상세 렌탈 상세
function renderDetails(details) {
  const rentalDetailTbody = document.querySelector("#rentalDatailTbody");
  rentalDetailTbody.innerHTML = ""; // 기존 내용 제거

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
     if(subType=='DC_PRE'&&!Number(rboEstimate["EST_PRE_PAY"])){
            return;
      }
      const rows = groupDetails.filter(d => d.ESTC_SUB_TYPE === subType);
      rows.forEach((detail, idx) => {
        const tr = document.createElement("tr");
        tr.className = "t-group-item";
        tr.dataset.groupId = mainType;

        detail._uid = detail.ESTC_IDX || `${mainType}_${subType}_${idx}`;
        if(detail.ESTC_SUB_TYPE==="VCH"){
            detail.ESTC_COST_RT = selecEstVchTypeEl.value === "DC" ? 1 : (selecEstVchTypeEl.value === "PAY"?2:0);
            detail.ESTC_COST_AMT=((detail.ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
            detail.ESTC_EST_AMT=((detail.ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
            detail.ESTC_DC_RT="1"
            detail.ESTC_DC_AMT=((detail.ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
             if(selecEstVchTypeEl.value=='DC'){
              detail.ESTC_NET_AMT=((detail.ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100*-1).toFixed(0);
            }else{
              detail.ESTC_NET_AMT=0;
            }
        }

        if(detail.ESTC_SUB_TYPE==="RET"){
          setSelectedDetailData(subType, "ESTC_EST_AMT",  Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT));
          setSelectedDetailData(subType, "ESTC_NET_AMT",  Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT));
        }



        tr.appendChild(createCell(subTypeNames[subType] || `항목${idx + 1}`));
 /*       if(['DC_SPC','CARE'].includes(subType)){
          tr.appendChild(createCell(input));
        }else{*/
        if(['CARE'].includes(subType)){
          let serviceTime = Number(detail.CSM_CYCLE||0);
          if(!detail.ESTC_EST_AMT&&!detail.ESTC_COST_AMT&&detail.CSM_TYPE=='CHC'){
           serviceTime=0;
          }
          const container = document.createElement("div");
          container.className = "flex items-center justify-between gap-2";

          const text = document.createTextNode(
            detail.ESTC_MEMO + (serviceTime > 0 ? (" - " + serviceTime + "회") : "")
          );
            container.appendChild(text);
          if(detail.CSM_TYPE=='CHC'){
           const button = document.createElement("button");
           button.type = "button";
           button.className = "btn btn-icon btn-outline";

           // 아이콘 생성
           const icon = document.createElement("i");
           icon.className = "icon-search";

           // 버튼에 아이콘 추가
           button.appendChild(icon);

           // 클릭 이벤트 추가
           button.addEventListener("click", async () => {
              await calculateServiceData();
              openServiceModal(detail,false)

           });

          // 버튼을 컨테이너에 추가
          container.appendChild(button);
          }




          // 셀에 컨테이너 넣기
          tr.appendChild(createCell(container));

        }else{
          tr.appendChild(createCell(""));
        }
        /*}*/

        if(uType&&uType=='INSIDE2'){
          if (mainType === 'RNT') {
            tr.appendChild(createCell("입고가"));
          } else if(mainType==='FEE'){
            tr.appendChild(createCell("렌탈료 총액"));
          } else if(['STB','CON','CAR'].includes(subType)) {
            tr.appendChild(createCell("렌탈료총액"));
          } else{
            tr.appendChild(createCell(""));
          }
        }

        //평균요율
        if(uType&&uType=='INSIDE2'){
          if(["LIO","MNT","CON","CAR","STB","ETC","RET"].includes(subType)){
            tr.appendChild(createCell(`${Math.floor(Number(detail.ESTC_COST_RT||0)*10)/10}%`, "text-right"));
          }else if(subType==='VCH'&&detail.ESTC_COST_STD){
            const vchInput = document.createElement("input");
            vchInput.type = "text";
            vchInput.className = "input";
            vchInput.value = detail.ESTC_COST_RT || "";
            vchInput.onchange = (event) => {
              detail.ESTC_COST_RT=event.target.value.replace(/[^0-9]/g, "");
              detail.ESTC_COST_AMT=((Number(event.target.value.replace(/[^0-9]/g, ""))*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
              detail.ESTC_EST_AMT=((Number(event.target.value.replace(/[^0-9]/g, ""))*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
              detail.ESTC_DC_RT="1"
              detail.ESTC_DC_AMT=((Number(event.target.value.replace(/[^0-9]/g, ""))*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
              detail.ESTC_NET_AMT=((Number(event.target.value.replace(/[^0-9]/g, ""))*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100*-1).toFixed(0);

              calculatePlanAndDetail()
            };
            tr.appendChild(createCell(vchInput));
          }else{
            tr.appendChild(createCell(""));
          }
        }

        if(['CON','CAR','STB'].includes(subType)){
          setSelectedDetailData(subType, "ESTC_COST_AMT", Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))));
        }

        //원가합계
        if(uType&&uType=='INSIDE2'){
          if(['CON','CAR','STB'].includes(subType)){
            tr.appendChild(createCell(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))).toLocaleString(), "text-right"));
          }else if(['RNT','PRO'].includes(mainType)){
            tr.appendChild(createCell(Number((detail.ESTC_COST_AMT ?? 0)).toLocaleString(), "text-right"));
          }else{
            tr.appendChild(createCell(""));
          }
        }

        //적용기준
        if(['RNT_P','BND','DC_SPC'].includes(subType)){
          tr.appendChild(createCell("렌탈소가"));
        }else if(subType==='DC_PRE'){
           const formSelect = document.createElement("form-select");
           const select = document.createElement("select");
           select.name = "custom-single";
           ["0","1"].forEach(opt => {
             const option = document.createElement("option");
             option.value = opt;
             option.textContent = opt==="0"?"선납할인 비율":"선납할인 금액"
             select.appendChild(option);
           });
           select.value = detail.ESTC_COST_STD || "0";
           select.disabled = true;
           if(!detail.ESTC_COST_STD){
             detail.ESTC_COST_STD="0";
           }
           select.onchange = (event) => {
             detail.ESTC_COST_STD=event.target.value;
              const data = getSelectedDetailData("PAY","PAY_STD");
              let prePayAmt = Math.abs(Number((data[0]?.ESTC_NET_AMT) || 0));
             if(detail.ESTC_COST_STD=="0"){
              detail.ESTC_DC_RT=2;
              detail.ESTC_DC_AMT = Number((((prePayAmt||0) * Number(detail.ESTC_DC_RT)) / 100).toFixed(0));
              detail.ESTC_NET_AMT = Number((((prePayAmt||0) * Number(detail.ESTC_DC_RT)*-1) / 100).toFixed(0))
              detail.ESTC_COST_STD="0";
             }else{
              if(prePayAmt>=detail.ESTC_DC_AMT){
                detail.ESTC_DC_AMT = detail.ESTC_DC_AMT;
                detail.ESTC_NET_AMT = detail.ESTC_DC_AMT*-1
              }else{
                detail.ESTC_DC_AMT = Number(prePayAmt);
                detail.ESTC_NET_AMT = Number(prePayAmt)*-1
              }
             }
             calculatePlanAndDetail()
           };
           formSelect.appendChild(select);
           tr.appendChild(createCell(formSelect));
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
          const data = getSelectedDetailData("PAY","PAY_STD");
          let prePayAmt = Math.abs(Number((data[0]?.ESTC_NET_AMT) || 0));
          if(detail.ESTC_COST_STD=="0"){
            setSelectedDetailData("DC_PRE", "ESTC_DC_AMT", Number((((prePayAmt||0) * Number(detail.ESTC_DC_RT)) / 100).toFixed(0)));
            setSelectedDetailData("DC_PRE", "ESTC_NET_AMT", Number((((prePayAmt||0) * Number(detail.ESTC_DC_RT)*-1) / 100).toFixed(0)));
            detail.ESTC_DC_RT=detail.ESTC_DC_RT?detail.ESTC_DC_RT:2;
            const inputDcPreRt = document.createElement("input");
            inputDcPreRt.type = "text";
            inputDcPreRt.className = "input";
            inputDcPreRt.style.textAlign = "right";
            inputDcPreRt.value = detail.ESTC_DC_RT+"%";
            inputDcPreRt.onchange = (event) => {
              let dcPreRt = event.target.value.replace(/[^0-9]/g, "");
              if(Number(dcPreRt)>100){
                  dcPreRt = 100;
              }
              setSelectedDetailData("DC_PRE", "ESTC_DC_RT", dcPreRt);
              setSelectedDetailData("DC_PRE", "ESTC_DC_AMT", Number(((((prePayAmt||0) * dcPreRt)) / 100).toFixed(0)));
              setSelectedDetailData("DC_PRE", "ESTC_NET_AMT", Number(((((prePayAmt||0) * dcPreRt)*-1) / 100).toFixed(0)));
              renderStep3Data();
            };
            inputDcPreRt.disabled =true;
            tr.appendChild(createCell(inputDcPreRt));
          }else{
            tr.appendChild(createCell(Math.floor(Number(detail.ESTC_DC_RT || 0))+"%"));
          }
        } else if (subType==='DC_SPC'){
            let rntPNetAmt = Number(getSelectedDetailData("RNT","RNT_P")[0]["ESTC_NET_AMT"]||0);
            let bndNetAmt = Number(getSelectedDetailData("RNT","BND")[0]["ESTC_NET_AMT"]||0);
            let estEstAmt = rntPNetAmt+bndNetAmt;
            detail.ESTC_DC_AMT = Math.abs(((estEstAmt * (Number(detail.ESTC_DC_RT) || 0)) / 100).toFixed(0))
            detail.ESTC_NET_AMT = Number(((estEstAmt * detail.ESTC_DC_RT * -1) / 100).toFixed(0))
            const inputDcSpc = document.createElement("input");
            inputDcSpc.type = "text";
            inputDcSpc.className = "input";
            inputDcSpc.value = detail.ESTC_DC_RT+"%" || "";
            inputDcSpc.onchange = (event) => {
              let dcSpcRt = event.target.value.replace(/[^0-9]/g, "");
              detail.ESTC_DC_RT = dcSpcRt;
              detail.ESTC_DC_AMT =  Math.abs(((estEstAmt * (Number(detail.ESTC_DC_RT) || 0)) / 100).toFixed(0));
              detail.ESTC_NET_AMT = Number(((estEstAmt * dcSpcRt * -1) / 100).toFixed(0));
              renderStep3Data();
          };
          tr.appendChild(createCell(inputDcSpc));
        }else if(mainType=='PRO'||["BND","RNT_P"].includes(subType)||(subType=='VCH'&&('PAY'==detail.ESTC_COST_STD||'DC'==detail.ESTC_COST_STD))){
           tr.appendChild(createCell(`${Math.floor(Number(detail.ESTC_DC_RT || 0)* 100*10)/10 }%`, "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }
        //할인금액
        if (subType === "DC_PRE") {
          const data = getSelectedDetailData("PAY","PAY_STD");
          let prePayAmt = Math.abs(Number((data[0]?.ESTC_NET_AMT) || 0));
          if(detail.ESTC_COST_STD!="0"){
            if(prePayAmt>=detail.ESTC_DC_AMT){
              detail.ESTC_DC_AMT = detail.ESTC_DC_AMT;
              detail.ESTC_NET_AMT = detail.ESTC_DC_AMT*-1
            }else{
              detail.ESTC_DC_AMT = Number(prePayAmt);
              detail.ESTC_NET_AMT = Number(prePayAmt)*-1
            }
            const inputDcPreAmt = document.createElement("input");
            inputDcPreAmt.type = "text";
            inputDcPreAmt.className = "input";
            inputDcPreAmt.style.textAlign = "right";
            inputDcPreAmt.value = formatNumberWithCommas(detail.ESTC_DC_AMT)|| "";
            inputDcPreAmt.onchange = (event) => {
              let dcAmt = event.target.value.replace(/[^0-9]/g, "");
              event.target.value=formatNumberWithCommas(dcAmt)
              setSelectedDetailData("DC_PRE", "ESTC_DC_AMT", dcAmt);
              if(Number(dcAmt)>rboEstimate["EST_PRE_PAY"]){
                setSelectedDetailData("DC_PRE", "ESTC_DC_RT", rboEstimate["EST_PRE_PAY"]?100:0)
              }else{
                setSelectedDetailData("DC_PRE", "ESTC_DC_RT", rboEstimate["EST_PRE_PAY"]
                                                                            ? ((dcAmt / rboEstimate["EST_PRE_PAY"]) * 100).toFixed(2)
                                                                            : "0.00")
              }


              setSelectedDetailData("DC_PRE", "ESTC_NET_AMT", Number(dcAmt||0)*-1);
              renderStep3Data();
            };
            inputDcPreAmt.disabled = true;
            tr.appendChild(createCell(inputDcPreAmt));
          }else{
            tr.appendChild(createCell((detail.ESTC_DC_AMT ?? 0).toLocaleString(), "text-right"));
          }
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



        // 삭제 버튼 (특별할인만)
        /*if (["DC_SPC"].includes(subType)) {
          const createDiv = document.createElement("div");
          createDiv.className = "flex justify-center";

          const deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "btn btn-delete";

          deleteBtn.onclick = () => {
            const index = details.indexOf(detail);
            if (index > -1) details.splice(index, 1);
            // 다시 렌더링
            renderDetails(details);
            renderServiceHouse();
          };
          createDiv.appendChild(deleteBtn);
          tr.appendChild(createCell(createDiv));
        } else if(["CARE"].includes(subType)){
            const formSelect = document.createElement("form-select");
            formSelect.setAttribute("select-code", "estcShowYn");
             const select = document.createElement("select");
             select.name = "custom-single";
             ["Y","N"].forEach(opt => {
              const option = document.createElement("option");
              option.value = opt;
              option.textContent = opt==="Y"?"표기":"미표기"
              select.appendChild(option);
            });
            select.value = detail.ESTC_SHOW_YN || "Y";
             select.onchange = (event) => {
              detail.ESTC_SHOW_YN = event.target.value;
             };
             formSelect.appendChild(select);
             tr.appendChild(createCell(formSelect));
        }else {
          tr.appendChild(createCell(""));
        }*/
        tr.appendChild(createCell(""));
        if (mainType !== "FEE"&&subType!=="VCH"){
          fragment.appendChild(tr);
        }


          // 그룹 합산
          totalCostAmt += Number(detail.ESTC_COST_AMT) || 0;
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
    if(mainType=='PRO'){
      rboEstimate["EST_PROMO_AMT"] =totalDcAmt
    }

    if(uType&&uType=='INSIDE2'){
      footerRow.appendChild(createCell("소계", "font-medium", false, 4));
      footerRow.appendChild(createCell(`${totalCostAmt.toLocaleString()}원`, "text-right"));
    }else{
      footerRow.appendChild(createCell("소계", "font-medium", false, 2));
    }
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalDcAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()}원`, "text-right"));

// SPC일 때 추가 버튼
   /* if (mainType === "SPC") {
      const createDiv = document.createElement("div");
      createDiv.className = "flex justify-center";

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "t-group-toggle";
      addBtn.setAttribute("aria-expanded", "true");
      createDiv.appendChild(addBtn);

      const icon = document.createElement("i");
      icon.className = "icon-plus";
      addBtn.appendChild(icon);

      // 클릭 이벤트: 새로운 SPC 행 추가
      addBtn.onclick = () => {
        details.push({
          ESTC_MAIN_TYPE: "SPC",
          ESTC_SUB_TYPE: "DC_SPC",   // 필요에 맞게 지정
          ESTC_MEMO: "",
          ESTC_COST_RT: 0,
          ESTC_COST_AMT: 0,
          ESTC_EST_STD: "",
          ESTC_EST_AMT: 0,
          ESTC_DC_RT: 0,
          ESTC_DC_AMT: 0,
          ESTC_NET_AMT: 0,
          ESTC_IDX:  null // 고유 ID
        });
        renderDetails(details); // 다시 렌더링
      };

      footerRow.appendChild(createCell(createDiv));
    } else {
      footerRow.appendChild(createCell(""));
    }*/
    footerRow.appendChild(createCell(""));

    fragment.appendChild(footerRow);
    if (mainType !== "FEE"){
    rentalDetailTbody.appendChild(fragment);
    }
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

  if(uType&&uType=='INSIDE2'){
    grandRow.appendChild(createCell("합계", "font-medium", false, 4));
    grandRow.appendChild(createCell(`${grandCostAmt.toLocaleString()}원`, "text-right"));
  }else{
    grandRow.appendChild(createCell("합계", "font-medium", false, 2));
  }

  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandEstAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandDcAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(`${grandNetAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(""));
  rboEstimate["EST_COST_AMT"]=grandCostAmt;
  rboEstimate["EST_EST_AMT"]=grandEstAmt;
  rboEstimate["EST_DC_AMT"]=grandDcAmt;
  rboEstimate["EST_OFR_AMT"]=grandNetAmt;

  let item = getProfitMaginGridData()
  rboEstimate["EST_TRUNC_AMT"] = grandNetAmt - Number(item?.["totalRental"]??0);//절사금액

  rentalDetailTbody.appendChild(grandRow);

}


function renderGuides(details) {
  const rentalDetailTbody = document.querySelector("#rentalGuideTbody");
  rentalDetailTbody.innerHTML = "";

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
          if(uType&&uType=='INSIDE2'){
            tr.appendChild(createCell("입고가"));
            tr.appendChild(createCell(Number(detail.ESTC_COST_RT??0)+"%", "text-right"));
            tr.appendChild(createCell(Number(detail.ESTC_COST_AMT??0).toLocaleString(), "text-right"));
          }
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));

          setSelectedDetailData(subType, "ESTC_EST_AMT",  adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC"));
          setSelectedDetailData(subType, "ESTC_NET_AMT",  adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC"));
        }else if(subType=='TRF'){
          if(!detail.ESTC_DC_RT){
            detail.ESTC_DC_RT = 50;
          }
          const inputTrfRate = document.createElement("input");
          inputTrfRate.type = "text";
          inputTrfRate.className = "input";
          inputTrfRate.value = detail.ESTC_DC_RT || "";
          inputTrfRate.style.textAlign = "right";
          inputTrfRate.style.minWidth = "60px";
          inputTrfRate.onchange = (event) => {
            detail.ESTC_DC_RT = event.target.value;
            renderGuides(selectedDetail)
          };
          var netUpAmt = getGsListSumByKey(addressList,'ESTG_NET_UP','Y')
          if(selecEstRtTypeEl.value=='ACQ_F'){
            netUpAmt += getGsListSumByKey(addressList,'ESTG_NET_UP','N')
          }

          if(uType&&uType=='INSIDE2'){
            tr.appendChild(createCell(""));
            tr.appendChild(createCell(""));
            tr.appendChild(createCell(""));
          }
          tr.appendChild(createCell("렌탈소가"));
          tr.appendChild(createCell(   adjustByUnit(Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT),100,"TRUNC")    .toLocaleString(), "text-right"));
          if(uType&&uType=='INSIDE2'){
            tr.appendChild(createCell(inputTrfRate, "text-right"));
          }else{
            tr.appendChild(createCell(Number(detail.ESTC_DC_RT??0)+"%", "text-right"));
          }
          tr.appendChild(createCell(adjustByUnit(Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(adjustByUnit((Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)),100,"TRUNC").toLocaleString(),"text-right"));
          setSelectedDetailData(subType, "ESTC_EST_AMT", adjustByUnit(Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT),100,"TRUNC"));
          setSelectedDetailData(subType,"ESTC_NET_AMT",adjustByUnit((Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)),100,"TRUNC"));

        }
          tr.appendChild(createCell(""));

          fragment.appendChild(tr);

          // 그룹 합산
          totalEstAmt += Number(detail.ESTC_EST_AMT) || 0;
          totalNetAmt += Number(detail.ESTC_NET_AMT) || 0;
      });
    });

    // Footer Row (소계)
    const footerRow = document.createElement("tr");
    footerRow.className = "t-group-item bg-muted";
    footerRow.dataset.groupId = mainType;
    if(uType&&uType=='INSIDE2'){
      footerRow.appendChild(createCell("소계", "font-medium", false, 4));
      footerRow.appendChild(createCell(""));
    }else{
      footerRow.appendChild(createCell("소계", "font-medium", false, 2));
    }
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));


    fragment.appendChild(footerRow);

    rentalDetailTbody.appendChild(fragment);

    // 전체 합계 누적
    grandEstAmt += totalEstAmt;
    grandNetAmt += totalNetAmt;

  });
}

function getProfitMaginGridData(){
  var items = AUIGrid.getGridData(profitMarginGrid);
  for(var i=0, len=items.length; i<len; i++) {
    if(items[i]["period"]==rboEstimate.EST_PERIOD){
      return items[i];
    }
  }
  return null;
}

function openAddressAddModal(modalId){
  if(!rboEstimate["LEGACY_OPPTY_NM"]){
    alert("영업건을 먼저 선택해주세요")
    return false;
  }
  openModal(modalId);
}

function openEstimateByProductModal(modalId){
  renderProductModalData(addressList)
  openModal(modalId);
}


function openSectionDetailsModal(modalId){
  if(planData.length==0){
    alert('품목확정 처리가 안되어 있습니다. 확정처리후 조회 가능합니다.')
    return false;
  }
  openModal(modalId);
}



function setByProductModalData(paramList){
    addressList = JSON.parse(JSON.stringify(paramList));
    estimateAddressList = JSON.parse(JSON.stringify(paramList));
    rboEstimate["EST_PLAN"]='';
    renderStep1Data();
    renderStep2Data();
    renderStep3Data();
    calculatePlanAndDetail();
}

function bindServiceData(csmData,csmSpData){
    if(selectedDetail.find(d => d.CSM_IDX === csmData.CSM_IDX)){
      alert('같은 서비스는 추가할 수 없습니다.')
      return false;
    }
    if(csmSpData.length<1){
      alert('상품이 없습니다.')
      return false;
    }
    if(csmData.CSM_TYPE=='OFC'){
      selectedDetail = selectedDetail.filter(x=>x.CSM_TYPE!=='OFC');
    }


    selectedDetail.push({
              ESTC_MAIN_TYPE: "PRO",
              ESTC_SUB_TYPE: "CARE",   // 필요에 맞게 지정
              ESTC_MEMO: csmData.CSM_NAME,
              ESTC_COST_RT: 0,
              ESTC_COST_AMT: 0,
              ESTC_EST_STD: "",
              ESTC_EST_AMT: 0,
              ESTC_DC_RT: 1,
              ESTC_DC_AMT: 0,
              ESTC_NET_AMT: 0,
              ESTC_IDX: null, // 고유 ID
              CSM_IDX: csmData.CSM_IDX,
              CSM_MEMO:csmData.CSM_MEMO,
              CSM_TYPE:csmData.CSM_TYPE,
              CSM_TYPE_NM:csmData.CSM_TYPE_NM,
              CSM_SCH_TYPE:csmData.CSM_SCH_TYPE,
            });
        renderStep2Data();
        renderStep3Data();
    //add 같이 진행
    return true;
}


function moveToBack(){
  if(document.querySelector('.tab-content.is-active').id.endsWith(1)){
     const result = confirm("이전 페이지로 이동합니다. 이동하시겠습니까?");
      if (result) {
        history.back(); // 이전 페이지로 이동
      }
  }else{
    document.getElementById('prevBtn').click();
  }

}


function saveRentalDetailBasic(){
  rboEstimate["EST_VALID_DT"] = String(document.getElementById("step1_EST_VALID_DT").value).replace(/-/g,"");
  if(rboEstimate["EST_IDX"]){
      fetchJson("/estimate/updateEstimateData.ajax"
                    , "POST"
                    ,{
                      "rboEstimate":JSON.stringify(rboEstimate)
                      ,"selectedDetail":JSON.stringify(selectedDetail)
                      ,"addressList":JSON.stringify(addressList)
                      ,"profitMarginData":JSON.stringify(AUIGrid.getGridData(profitMarginGrid))

                     }
          )
  }else{
    fetchJson("/estimate/saveEstimateData.ajax"
                , "POST"
                ,{
                  "rboEstimate":JSON.stringify(rboEstimate)
                  ,"selectedDetail":JSON.stringify(selectedDetail)
                  ,"addressList":JSON.stringify(addressList)
                  ,"profitMarginData":JSON.stringify(AUIGrid.getGridData(profitMarginGrid))

                 }
        )
  }
}
document.getElementById('prevBtn').addEventListener('click', () => {
  const activeDiv = document.querySelector('.tab-content.is-active');
  const activeBreadcrumb = document.querySelector('.estimate-breadcrumbs .is-active');

  if (activeDiv && activeBreadcrumb) {
    const prevDiv = activeDiv.previousElementSibling;
    const prevBreadcrumb = activeBreadcrumb.previousElementSibling;

    if (prevDiv && prevDiv.classList.contains('tab-content')) {
      activeDiv.classList.remove('is-active');
      prevDiv.classList.add('is-active');
    }
    if (prevBreadcrumb) {
      activeBreadcrumb.classList.remove('is-active');
      prevBreadcrumb.classList.add('is-active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if(document.querySelector('.tab-content.is-active').id.endsWith(1)){
      document.getElementById("nextBtn").style.display = "block";
      document.getElementById("confirmBtn").style.display = "none";
    }

   if(document.querySelector('.tab-content.is-active').id.endsWith(3)){
      document.getElementById("nextBtn").style.display = "block";
      document.getElementById("saveBtn").style.display = "none";
    }
  resizeGridAll();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  // 기존 유효성 검사 로직 유지
  if(!rboEstimate["LEGACY_OPPTY_NM"]){
    alert('영업건을 선택해주세요');
    return false;
  }
  if(addressList.length<1){
    alert('주소지를 확인해주세요');
    return false;
  }
  if(document.querySelector('.tab-content.is-active').id.endsWith(1)){
    if(planData.length==0){
      document.getElementById("nextBtn").style.display = "none";
      document.getElementById("confirmBtn").style.display = "block";
      rboEstimate["EST_PLAN"] = '';
    }else{
      document.getElementById("nextBtn").style.display = "block";
      document.getElementById("confirmBtn").style.display = "none";
    }
  }

  if(document.querySelector('.tab-content.is-active').id.endsWith(3)){
    const count = selectedDetail.filter(item => item.CSM_TYPE === "OFC").length;
    if(count<1){
      alert('오피스 케어 서비스를 추가해주세요')
      return false;
    }
    renderDetailsForm(selectedDetail)
    renderGuidesForm(selectedDetail)
    renderStep4Data();
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "block";
  }

  const activeDiv = document.querySelector('.tab-content.is-active');
  const activeBreadcrumb = document.querySelector('.estimate-breadcrumbs .is-active');

  if (activeDiv && activeBreadcrumb) {
    const nextDiv = activeDiv.nextElementSibling;
    const nextBreadcrumb = activeBreadcrumb.nextElementSibling;

    if (nextDiv && nextDiv.classList.contains('tab-content')) {
      activeDiv.classList.remove('is-active');
      nextDiv.classList.add('is-active');
    }
    if (nextBreadcrumb) {
      activeBreadcrumb.classList.remove('is-active');
      nextBreadcrumb.classList.add('is-active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  resizeGridAll();
});
function renderStep4Data(){
const fieldMapping = {
      "step4_LEGACY_OPPTY_NM": "LEGACY_OPPTY_NM",
      "step4_COM_MNGEST_NM": "COM_MNGEST_NM",
      "step4_VND_NM": "VND_NM",
      "step4_USR_NM": "VND_USR_NM",
      "step4_USR_CD1": "USR_CD1",
      "step4_COM_NAME": "CTM_NM",
      "step4_CTM_LSCNO": "CTM_LSCNO",
      "step4_EST_VAL_GRADE" : "EST_VAL_GRADE",
      "step4_TOTAL_CREDIT_LIMIT": "APR_LIMIT_AMT",
      "step4_REMAIN_CREDI": "APR_REMAIN_LIMIT_AMT",//잔여여신한도
      "step4_EST_TITLE":"EST_TITLE",
      "step4_EST_REG_DT": "EST_REG_DT",
      "step4_RENTAL_U_NAME":"EST_U_NM2",
      "step4_EST_PLAN":"EST_PLAN",
      "step4_EST_PERIOD":"EST_PERIOD",
      "step4_EST_RNT_GS_AMT1":"EST_RNT_GS_AMT",
      "step4_EST_RNT_GS_AMT2":"EST_RNT_GS_AMT",
      "step4_EST_DC_AMT_TOTAL":"EST_DC_AMT",
      "step4_EST_OFR_AMT_TOTAL":"EST_OFR_AMT",
      "step4_EST_TRUNC_AMT_TOTAL":"EST_TRUNC_AMT",
      "step4_EST_PROMO_AMT_TOTAL":"EST_PROMO_AMT",
      "step4_EST_PERIOD2":"EST_PERIOD",
      "step4_CTM_TYPE_NAME":"CTM_TYPE_NAME"
    };

    for (const id in fieldMapping) {
      const key = fieldMapping[id];
      const element = document.getElementById(id);
      if (element) {
        if(['step4_EST_RNT_GS_AMT2','step4_EST_DC_AMT_TOTAL','step4_EST_OFR_AMT_TOTAL','step4_EST_TRUNC_AMT_TOTAL','step4_EST_PROMO_AMT_TOTAL'].includes(id)){
          element.innerHTML = Number(rboEstimate[key]).toLocaleString() ?? "";
        }else if(['step4_TOTAL_CREDIT_LIMIT'].includes(id)){
          element.innerHTML = (Number(rboEstimate[key]).toLocaleString() ?? "")+"원";
        }else if(['step4_REMAIN_CREDI'].includes(id)&&rboEstimate[key]) {
           element.innerHTML = ((Number(rboEstimate[key]||0)+Number(rboEstimate["EST_RNT_GS_AMT"]||0)).toLocaleString() ?? "")+"원";
         }else if(['step4_EST_REG_DT'].includes(id)&&rboEstimate[key]&&String(rboEstimate[key]).length==8){
          const yyyy = rboEstimate[key].substring(0, 4);
          const mm   = rboEstimate[key].substring(4, 6);
          const dd   = rboEstimate[key].substring(6, 8);
          element.innerHTML = `${yyyy}-${mm}-${dd}`;
        }else if(['step4_CTM_TYPE_NAME'].includes(id)){
          element.innerHTML = (rboEstimate[key]??"")+" · "+(rboEstimate['CTM_LSCNO'] ?? "");
        }else{
          element.innerHTML = rboEstimate[key] ?? "";
        }
      }
    }

    let item = getProfitMaginGridData();

    document.getElementById("step4_EST_RT_TYPE_NAME").innerHTML  = selecEstRtTypeEl.options[selecEstRtTypeEl.options.selectedIndex].text;
    document.getElementById("step4_RENTAL_PER_MONTH_TOTAL").innerHTML  = Number(item?.["rentalPerMonth"]??0).toLocaleString()+"원";
    document.getElementById("step4_RENTAL_PER_MONTH_TOTAL2").innerHTML  = Number(item?.["rentalPerMonth"]??0).toLocaleString()+"원";
    document.getElementById("step4_TOTAL_RENTAL_TOTAL").innerHTML  = Number(item?.["totalRental"]??0).toLocaleString()+"원";
    document.getElementById("step4_TOTAL_RENTAL_TOTAL2").innerHTML  = Number(item?.["totalRental"]??0).toLocaleString()+"원";
    const csmIdxArray = selectedDetail
      .filter(item => item.CSM_IDX !== undefined && item.CSM_IDX !== null&&  item.CSM_IDX != "");

    //계약시 잔여 여신 한도
    document.getElementById("step4_CONTRACT_REMAIN_CREDI").innerHTML = (Number(rboEstimate["APR_REMAIN_LIMIT_AMT"]??0)).toLocaleString()+"원"
    AUIGrid.setGridData(serviceGrid, csmIdxArray);
    renderEstimateCards()
    renderStepItemData("itemSpot2");
    resizeGrid(serviceGrid);

}
function renderEstimateCards() {
  const container = document.getElementById("step4_itemComponent");
  container.innerHTML = ""; // 초기화

  addressList.forEach(address => {
    let totalCate = new Set();
    let totalQty = 0;
    let totalPrice = 0;

    // bundleList 안의 모든 gsList 합산
    address.bundleList.forEach(space => {
      space.gsList.forEach(item => {
        const key = `${item.ITM_CD}_${item.COL_CD}`;
        totalCate.add(key);
        totalQty += Number(item.ITM_QTY) || 0;
        totalPrice += Number(item.RBO_RTC_PRICE_TOTAL) || 0;
      });
    });

    const card = document.createElement("div");
    card.className = "card p-3 mt-3 w-full lg:w-1/2 2xl:w-1/3";
    card.innerHTML = `
      <p class="text-sm font-medium">${address.ROAD_ADDR}</p>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <div>
          <span class="text-sm text-[#64748B]">품목 종류</span>
          <p>${totalCate.size}</p>
        </div>
        <div>
          <span class="text-sm text-[#64748B]">총 품목 수</span>
          <p>${totalQty.toLocaleString()}</p>
        </div>
        <div>
          <span class="text-sm text-[#64748B]">총 견적 금액</span>
          <p>${totalPrice.toLocaleString() +'원'}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function settingBindSelectOption(targetId,bindId){
  const targetSelect = document.getElementById(targetId);
  targetSelect.addEventListener("optionsLoaded", (e) => {
    if (rboEstimateData&&rboEstimateData[bindId]) {
      targetSelect.value = rboEstimateData[bindId];
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  if(uType&&uType=='OUTSIDE'){
    document.getElementById("serviceAddSpecListDiv").style.display="NONE"
  }

  if(addressListData){
    addressList = addressListData;
  }
  if(rboEstimateData){
     rboEstimate = Object.assign(rboEstimate, rboEstimateData);
     document.getElementById("step1_EST_VALID_DT").value = rboEstimate["EST_VALID_DT"]

     if(rboEstimateData["EST_M_IDX"]){
      document.getElementById("addAddressBtn").style.display="NONE"
     }
  }
  if(estimateComponentData){
    selectedDetail = estimateComponentData;
  }

  document.querySelectorAll(".tabs .tab-item").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.tab;
      if (targetId === "quotationInfo" || targetId === "itemInfo") {
        resizeGridAll();
      }
    });
  });
  settingBindSelectOption("step3_EST_PERIOD","EST_PERIOD");
  settingBindSelectOption("step3_EST_RT_TYPE","EST_RT_TYPE");
  settingBindSelectOption("step3_EST_VCH_TYPE","EST_VCH_TYPE");


  renderStep1Data();
  renderStep2Data();
  renderStep3Data();
  if((addressList&&addressList.length>0&&addressList[0].bundleList&&addressList[0].bundleList.length>0)){
    calculatePlanAndDetail();
  }


});

document.getElementById("itemInfoLink").addEventListener("click", function(e) {
  e.preventDefault();
   document.getElementById('tabItemInfo').click();
});
document.getElementById("detailInfoLink").addEventListener("click", function(e) {
  e.preventDefault();
   document.getElementById('tabDetailInfo').click();
});
//견적상세 견적 상세 렌탈제품가 mainType 렌탈상세 렌탈 상세
function renderDetailsForm(details) {
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
          const data = getSelectedDetailData("PAY","PAY_STD");
          if(detail.ESTC_COST_STD=="0"){
            tr.appendChild(createCell(detail.ESTC_DC_RT+"%"));
          }else{
            tr.appendChild(createCell(Math.floor(Number(detail.ESTC_DC_RT || 0))+"%"));
          }
        } else if (subType==='DC_SPC'){
          tr.appendChild(createCell(detail.ESTC_DC_RT+"%" ));
        }else if(mainType=='PRO'||["BND","RNT_P"].includes(subType)||(subType=='VCH'&&('PAY'==detail.ESTC_COST_STD||'DC'==detail.ESTC_COST_STD))){
           tr.appendChild(createCell(`${Math.floor(Number(detail.ESTC_DC_RT || 0)* 100*10)/10 }%`, "text-right"));
        }else{
          tr.appendChild(createCell(""));
        }
        //할인금액
        if (subType === "DC_PRE") {
          if(detail.ESTC_COST_STD!="0"){
            tr.appendChild(createCell(formatNumberWithCommas(detail.ESTC_DC_AMT)|| ""));
          }else{
            tr.appendChild(createCell((detail.ESTC_DC_AMT ?? 0).toLocaleString(), "text-right"));
          }
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

        if (mainType !== "FEE"&&subType!=="VCH"){
          fragment.appendChild(tr);
        }
          // 그룹 합산
          totalCostAmt += Number(detail.ESTC_COST_AMT) || 0;
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

    footerRow.appendChild(createCell("소계", "font-medium", false, 2));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalDcAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()}원`, "text-right"));

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

  grandRow.appendChild(createCell("합계", "font-medium", false, 2));

  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandEstAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(""));
  grandRow.appendChild(createCell(`${grandDcAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(`${grandNetAmt.toLocaleString()}원`, "text-right"));
  grandRow.appendChild(createCell(""));
  rentalDatailFormTbody.appendChild(grandRow);

}




function renderGuidesForm(details) {
  const rentalGuideDetailTbody = document.querySelector("#rentalGuideDetailTbody");
  rentalGuideDetailTbody.innerHTML = "";

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
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT).toLocaleString(), "text-right"));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT).toLocaleString(), "text-right"));
        }else if(subType=='TRF'){
          var netUpAmt = getGsListSumByKey(addressList,'ESTG_NET_UP','Y')
          if(selecEstRtTypeEl.value=='ACQ_F'){
            netUpAmt += getGsListSumByKey(addressList,'ESTG_NET_UP','N')
          }
          tr.appendChild(createCell("렌탈소가"));
          tr.appendChild(createCell(   Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)    .toLocaleString(), "text-right"));
          tr.appendChild(createCell(Number(detail.ESTC_DC_RT??0)+"%", "text-right"));
          tr.appendChild(createCell(Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100).toLocaleString(), "text-right"));
          tr.appendChild(createCell((Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)).toLocaleString(),"text-right"));

        }
          tr.appendChild(createCell(""));
          fragment.appendChild(tr);
          totalEstAmt += Number(detail.ESTC_EST_AMT) || 0;
          totalNetAmt += Number(detail.ESTC_NET_AMT) || 0;
      });
    });

    // Footer Row (소계)
    const footerRow = document.createElement("tr");
    footerRow.className = "t-group-item bg-muted";
    footerRow.dataset.groupId = mainType;
    footerRow.appendChild(createCell("소계", "font-medium", false, 2));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()}원`, "text-right"));
    footerRow.appendChild(createCell(""));
    fragment.appendChild(footerRow);

    rentalGuideDetailTbody.appendChild(fragment);

  });
}



