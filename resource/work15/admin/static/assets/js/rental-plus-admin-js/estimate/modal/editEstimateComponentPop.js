// 출력 순서 정의
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

const selecEstRtTypeEl = document.getElementById("EST_RT_TYPE");
const selecEstVchTypeEl = document.getElementById("EST_VCH_TYPE");
const inputEl = document.getElementById("EST_PRE_PAY");



let modalAddressList = [];
let rboEstComponentInfoPop = [];
let rboEstimate = {};


/*function settingEditComponentInitData(modalList,rboEstComponentInfo,rboEstimateInfo){
  modalAddressList = JSON.parse(JSON.stringify(modalList));
  rboEstComponentInfoPop = [...rboEstComponentInfo]
  rboEstimate = {...rboEstimateInfo}
  selecEstRtTypeEl.value = rboEstimate["EST_RT_TYPE"];
    selecEstVchTypeEl.value = rboEstimate["EST_VCH_TYPE"];

    renderComponentModalData(rboEstComponentInfoPop);
    renderGuides(rboEstComponentInfoPop);

}*/

function renderData(){
    renderComponentModalData();
    renderGuides();
}

function settingEditComponentInitData(modalList, rboEstComponentInfo, rboEstimateInfo) {
  modalAddressList = JSON.parse(JSON.stringify(modalList));
  rboEstComponentInfoPop = [...rboEstComponentInfo];
  rboEstimate = {...rboEstimateInfo};
}
function settings(){


      selecEstRtTypeEl.value = rboEstimate["EST_RT_TYPE"] || '';
      selecEstVchTypeEl.value = rboEstimate["EST_VCH_TYPE"] || '';
      document.querySelectorAll('form-select[select-local-code]')[0].setValue(rboEstimate["EST_VCH_TYPE"] || '')
      document.querySelectorAll('form-select[select-local-code]')[1].setValue(rboEstimate["EST_RT_TYPE"] || '')
      inputEl.value= Number(rboEstimate["EST_PRE_PAY"]).toLocaleString() + " 원";
      renderData()
  /* const onLoaded = () => {
      if (selecEstRtTypeEl)  selecEstRtTypeEl.value = rboEstimate["EST_RT_TYPE"] || '';
      if (selecEstVchTypeEl) selecEstVchTypeEl.value = rboEstimate["EST_VCH_TYPE"] || '';
      inputEl.value= Number(rboEstimate["EST_PRE_PAY"]).toLocaleString() + " 원";



      selecEstRtTypeEl && selecEstRtTypeEl.removeEventListener('optionsLoaded', onLoaded);
      selecEstVchTypeEl && selecEstVchTypeEl.removeEventListener('optionsLoaded', onLoaded);
    };

    if ((selecEstRtTypeEl && selecEstRtTypeEl.options.length > 0) && (selecEstVchTypeEl && selecEstVchTypeEl.options.length > 0)) {
      selecEstRtTypeEl.value = rboEstimate["EST_RT_TYPE"] || '';
      selecEstVchTypeEl.value = rboEstimate["EST_VCH_TYPE"] || '';
      onLoaded();
    } else {
      selecEstRtTypeEl && selecEstRtTypeEl.addEventListener('optionsLoaded', onLoaded);
      selecEstVchTypeEl && selecEstVchTypeEl.addEventListener('optionsLoaded', onLoaded);
    }*/

}


/*
document.addEventListener("DOMContentLoaded", () => {
  settingEditComponentInitData(modalAddressList, rboEstComponentInfoPop, rboEstimate)
})
*/



function getProfitMaginGridData(){
  var items = AUIGrid.getGridData("#profitMarginComponentGridFinalPop");
  for(var i=0, len=items.length; i<len; i++) {
    if(items[i]["period"]==rboEstimate.EST_PERIOD){
      return items[i];
    }
  }
  return null;
}

//견적상세 견적 상세 렌탈제품가 mainType 렌탈상세 렌탈 상세
document.addEventListener("DOMContentLoaded", () => {

})




function renderComponentModalData() {
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
  rboEstComponentInfoPop.forEach(d => {
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
        if(detail.ESTC_SUB_TYPE==="VCH"){
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
              renderData();
              //calculatePlanAndDetail()
            };
            tr.appendChild(createCell(vchInput));
          }else{
            tr.appendChild(createCell(""));
          }


        if(['CON','CAR','STB'].includes(subType)){
          setSelectedDetailData(subType, "ESTC_COST_AMT", Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))));
        }

        //원가합계

          if(['CON','CAR','STB','VCH'].includes(subType)){
            tr.appendChild(createCell(adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))) ,100,"TRUNC" ).toLocaleString(), "text-right"));
          }else if('RET'==subType){
            tr.appendChild(createCell(adjustByUnit(Math.ceil(((Number(detail.ESTC_COST_RT?? 0) ) / 100 * (Number(rboEstimate.EST_RNT_AMT?? 0) ))) ,1000 ,"TRUNC").toLocaleString(), "text-right"));
          }else if(['RNT','PRO'].includes(mainType)||["DC_FEE",'MNT','LIO'].includes(subType)){
            tr.appendChild(createCell(Number((detail.ESTC_COST_AMT ?? 0)).toLocaleString(), "text-right"));
          }else{
            tr.appendChild(createCell(""));
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
             renderData();
             //calculatePlanAndDetail()
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
              renderComponentModalData();
            };
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
              renderComponentModalData();
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
              renderComponentModalData();
            };
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
        if (["DC_SPC"].includes(subType)) {
          const createDiv = document.createElement("div");
          createDiv.className = "flex justify-center";

          const deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "btn btn-delete";

          deleteBtn.onclick = () => {
            const index = rboEstComponentInfoPop.indexOf(detail);
            if (index > -1) rboEstComponentInfoPop.splice(index, 1);
            // 다시 렌더링
            renderComponentModalData();

          };
          createDiv.appendChild(deleteBtn);
          tr.appendChild(createCell(createDiv));
        } /*else if(["CARE"].includes(subType)){
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
        }*/else {
          tr.appendChild(createCell(""));
        }

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
    if(mainType=='PRO'){
      rboEstimate["EST_PROMO_AMT"] =totalDcAmt
    }


      footerRow.appendChild(createCell("소계", "font-medium", false, 4));
      footerRow.appendChild(createCell(`${totalCostAmt.toLocaleString()} 원`, "text-right"));

    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalEstAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(""));
    footerRow.appendChild(createCell(`${totalDcAmt.toLocaleString()} 원`, "text-right"));
    footerRow.appendChild(createCell(`${totalNetAmt.toLocaleString()} 원`, "text-right"));

// SPC일 때 추가 버튼
    if (mainType === "SPC") {
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
        rboEstComponentInfoPop.push({
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
        renderComponentModalData(); // 다시 렌더링
      };

      footerRow.appendChild(createCell(createDiv));
    } else {
      footerRow.appendChild(createCell(""));
    }

    fragment.appendChild(footerRow);

    rentalDetailTbody.appendChild(fragment);

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
  rboEstimate["EST_COST_AMT"]=grandCostAmt;
  rboEstimate["EST_EST_AMT"]=grandEstAmt;
  rboEstimate["EST_DC_AMT"]=grandDcAmt;
  rboEstimate["EST_OFR_AMT"]=grandNetAmt;

  let item = getProfitMaginGridData()
  rboEstimate["EST_TRUNC_AMT"] = grandNetAmt - Number(item?.["totalRental"]??0);//절사금액

  rentalDetailTbody.appendChild(grandRow);

}

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////



function renderGuides() {
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
  rboEstComponentInfoPop.forEach(d => {
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
          tr.appendChild(createCell(adjustByUnit(Number(detail.ESTC_COST_AMT??0).toLocaleString(),100,"TRUNC"), "text-right"));



          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(adjustByUnit(Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT),100,"TRUNC").toLocaleString(), "text-right"));

          setSelectedDetailData(subType, "ESTC_EST_AMT",  Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT));
          setSelectedDetailData(subType, "ESTC_NET_AMT",  Math.floor((detail.ESTC_COST_AMT ?? 0)*detail.ESTC_EST_RT));
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
            renderGuides()
          };
          var netUpAmt = getGsListSumByKey(modalAddressList,'ESTG_NET_UP','Y')
          if(selecEstRtTypeEl.value=='ACQ_F'){
            netUpAmt += getGsListSumByKey(modalAddressList,'ESTG_NET_UP','N')
          }
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell(""));
          tr.appendChild(createCell("렌탈소가"));
          tr.appendChild(createCell(   adjustByUnit(Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT),100,"TRUNC")    .toLocaleString(), "text-right"));

          tr.appendChild(createCell(inputTrfRate, "text-right"));

          tr.appendChild(createCell(adjustByUnit(Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100),100,"TRUNC").toLocaleString(), "text-right"));
          tr.appendChild(createCell(adjustByUnit((Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)),100,"TRUNC").toLocaleString(),"text-right"));
          setSelectedDetailData(subType, "ESTC_EST_AMT", Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT));
          setSelectedDetailData(subType,"ESTC_NET_AMT",(Math.floor(Number(netUpAmt??0)*detail.ESTC_EST_RT)-Math.floor((Number(netUpAmt??0)*detail.ESTC_EST_RT)*Number(detail.ESTC_DC_RT||0)/100)));

        }
          tr.appendChild(createCell(""));

          fragment.appendChild(tr);

          // 그룹 합산
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

    rentalDetailTbody.appendChild(fragment);

  });
}



function getSelectedDetailData(mainType,subType){
  if (subType) {
    // mainType + subType 둘 다 있는 경우
    return rboEstComponentInfoPop.filter(
      d => d.ESTC_MAIN_TYPE === mainType && d.ESTC_SUB_TYPE === subType
    );
  } else {
    // mainType만 있는 경우
    return rboEstComponentInfoPop.filter(
      d => d.ESTC_MAIN_TYPE === mainType
    );
  }
}

function setSelectedDetailData(findSubType,settingField,value,id){
  let rntRow;
  if (id) {
    rntRow = rboEstComponentInfoPop.find(d => d.ESTC_IDX === id);
  } else {
    rntRow = rboEstComponentInfoPop.find(d => d.ESTC_SUB_TYPE === findSubType);
  }
  if (rntRow) {
    rntRow[settingField] = value;
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

document.addEventListener('DOMContentLoaded', async () => {

    // 입력 중에는 숫자만 유지
        inputEl.addEventListener("input", function(event) {
               let rawValue = event.target.value.replace(/[^0-9]/g, "");
               rboEstimate["EST_PRE_PAY"] = rawValue;
               event.target.value = rawValue; // 입력 중에는 숫자만 보이게
           });

         // 포커스를 잃었을 때 포맷팅해서 보여주기
        inputEl.addEventListener("blur", function(event) {
            let rawValue = event.target.value.replace(/[^0-9]/g, "");
            if (rawValue) {
                const dcFee = getSelectedDetailData("FEE","DC_FEE")[0];
                const data = getSelectedDetailData("PAY","PAY_STD")[0];
                let prePayAmt = Number(rawValue);
                if (prePayAmt > Number(rboEstimate["EST_RNT_AMT"])) {
                    event.target.value = Number(prevValue).toLocaleString() + " 원";
                    setSelectedDetailData("PAY_STD","ESTC_NET_AMT",(Number(prevValue)*-1));
                    rboEstimate["EST_PRE_PAY"] = Number(prevValue);
                    if(Number(rboEstimate["EST_PRE_PAY"])){

                     if(dcFee){
                        Object.assign(dcFee, {
                          ESTC_COST_AMT: adjustByUnit(Math.floor((Number(rboEstimate["EST_PRE_PAY"]||0))*0.1),100,"TRUNC")
                        });
                     }else{
                           rboEstComponentInfoPop.push({
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




                     if(data.ESTC_COST_STD=="0"){
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
                     }
                    alert('상품 최종 견적가보다 선납금이 큽니다. 다시 입력해주세요');
                    return;
                }


               if(data.ESTC_COST_STD=="0"){
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
               }


               if(dcFee){
                   Object.assign(dcFee, {
                     ESTC_COST_AMT: adjustByUnit(Math.floor(prePayAmt*0.1),100,"TRUNC")
                   });
                }else{
                      rboEstComponentInfoPop.push({
                                 ESTC_MAIN_TYPE: "FEE",
                                 ESTC_SUB_TYPE: "DC_FEE",   // 필요에 맞게 지정
                                 ESTC_MEMO: '',
                                 ESTC_COST_RT: 10,
                                 ESTC_COST_AMT: adjustByUnit(Math.floor(prePayAmt*0.1),100,"TRUNC"),
                                 ESTC_EST_STD: "",
                                 ESTC_EST_AMT: 0,
                                 ESTC_DC_RT: 0,
                                 ESTC_DC_AMT: 0,
                                 ESTC_NET_AMT: 0,
                                 ESTC_IDX: null // 고유 ID
                               });
                }



            setSelectedDetailData("PAY_STD","ESTC_NET_AMT",(Number(rawValue)*-1));
            setSelectedDetailData("PAY_STD","ESTC_DC_AMT",(Number(rawValue)));

            renderComponentModalData();

            //calculatePlanAndDetail();

            // 마지막에만 포맷팅 적용
            const formatted = Number(rawValue).toLocaleString() + " 원";
            event.target.value = formatted;
        }else{
          rboEstComponentInfoPop = rboEstComponentInfoPop.filter(x=>x.ESTC_SUB_TYPE!=="DC_FEE");
           renderComponentModalData();
        }
    });

     // 다시 포커스를 얻으면 숫자만 보이게
     inputEl.addEventListener("focus", function(event) {
         let rawValue = event.target.value.replace(/[^0-9]/g, "");
         event.target.value = rawValue;
         prevValue = rawValue;
     });

  selecEstRtTypeEl.addEventListener("change", function(event) {
      rboEstimate.EST_RT_TYPE = event.target.value;
       const filtered = rboEstComponentInfoPop.filter(item => item.ESTC_SUB_TYPE === "RET");
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

      renderData()
      selecEstVchTypeEl.dispatchEvent(new Event("change"));
      if((modalAddressList&&modalAddressList.length>0&&modalAddressList[0].bundleList&&modalAddressList[0].bundleList.length>0)){
        //calculatePlanAndDetail(true);
      }

  });

  selecEstVchTypeEl.addEventListener("change", function(event) {
      rboEstimate.EST_VCH_TYPE = event.target.value;
      const filtered = rboEstComponentInfoPop.filter(item => item.ESTC_SUB_TYPE === "VCH");
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
      //vchEstcRow[0].ESTC_COST_RT = vchEstcRow[0].ESTC_COST_STD === "DC" ? 1 : (vchEstcRow[0].ESTC_COST_STD === "PAY"?2:0);

      vchEstcRow[0].ESTC_COST_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
      vchEstcRow[0].ESTC_EST_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
      vchEstcRow[0].ESTC_DC_RT="1"
      vchEstcRow[0].ESTC_DC_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100).toFixed(0);
       if(event.target.value=='DC'){
        vchEstcRow[0].ESTC_NET_AMT=((vchEstcRow[0].ESTC_COST_RT*(Number(rboEstimate["EST_RNT_GS_AMT"])+Number(getSelectedDetailData("RNT","RET")[0]?.ESTC_EST_AMT??0)))/100*-1).toFixed(0);
      }else{
        vchEstcRow[0].ESTC_NET_AMT=0;
      }
      renderData()
      if((modalAddressList&&modalAddressList.length>0&&modalAddressList[0].bundleList&&modalAddressList[0].bundleList.length>0)){
        //calculatePlanAndDetail(true);
      }
  });
})
function formatNumberWithCommas(num) {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function checkedFillData(){
  let prePayRows = getSelectedDetailData("PAY","PAY_STD");
    let param = {"estEstAmt": rboEstimate.EST_OFR_AMT,//최종견적가
                               "period": rboEstimate.EST_PERIOD,//기간
                               "sumTotalCostAmtWithOutFee":sumTotalCostAmtWithOutFee(),//렌탈상품 프로모션 원가 합계
                               "sumTotalCostAmtWithOutFee2":sumTotalCostAmtWithOutFee2(),//렌탈상품 프로모션 원가 합계
                               "EST_RNT_GS_AMT":Number(sumTotalEstGsAmt()||0),
                               "prePayAmt":Math.abs(Number(prePayRows[0]["ESTC_NET_AMT"])),//선납금
                               "gijunCstSum":getGsListSumByKey(modalAddressList,"GIJUN_CST"),//기준단가
                               "iopSalcstSum":getGsListSumByKey(modalAddressList,"IOP_SALCST"),//소비자가
                               "ctmLscno":rboEstimate.CTM_LSCNO//사업자등록번호(plan 조회)
                               }
         window.opener.finalProfitComponentCalculate(param,"N",rboEstimate,rboEstComponentInfoPop).then(data=>{
          if(data){
            AUIGrid.setGridData("#profitMarginComponentGridFinalPop",data);
          }
         })
}

function fixedFillData(){
  let prePayRows = getSelectedDetailData("PAY","PAY_STD");
    let param = {"estEstAmt": rboEstimate.EST_OFR_AMT,//최종견적가
                               "period": rboEstimate.EST_PERIOD,//기간
                               "sumTotalCostAmtWithOutFee":sumTotalCostAmtWithOutFee(),//렌탈상품 프로모션 원가 합계
                               "sumTotalCostAmtWithOutFee2":sumTotalCostAmtWithOutFee2(),//렌탈상품 프로모션 원가 합계
                               "EST_RNT_GS_AMT":Number(sumTotalEstGsAmt()||0),
                               "prePayAmt":Math.abs(Number(prePayRows[0]["ESTC_NET_AMT"])),//선납금
                               "gijunCstSum":getGsListSumByKey(modalAddressList,"GIJUN_CST"),//기준단가
                               "iopSalcstSum":getGsListSumByKey(modalAddressList,"IOP_SALCST"),//소비자가
                               "ctmLscno":rboEstimate.CTM_LSCNO//사업자등록번호(plan 조회)
                               }
  window.opener.finalProfitComponentCalculate(param,"Y",rboEstimate,rboEstComponentInfoPop)
}

function sumTotalCostAmtWithOutFee(){
    return rboEstComponentInfoPop
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
    return rboEstComponentInfoPop
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
    return rboEstComponentInfoPop
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
