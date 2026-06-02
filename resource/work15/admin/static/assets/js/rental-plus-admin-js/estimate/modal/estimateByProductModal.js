let modalAddressList = [];
function renderProductModalData(paramList) {
    modalAddressList = JSON.parse(JSON.stringify(paramList));
    const tbody = document.getElementById("itemModalSpot");
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
          if(textRightFlag){
            input.style.textAlign = "right";
          }
          input.id = id;
          input.value = value;
          cell.appendChild(input);
          return cell;
      };


    // Totals
    let grandTotalQty = 0, grandTotalRentalPriceTotal = 0,grandTotalRentalOfrPriceTotal = 0,nomalTotalRentalPriceTotal=0,combineTotalRentalPriceTotal=0, grandTotalInPriceTotal = 0,nomalTotalInPriceTotal=0 , combineTotalInPriceTotal=0, grandTotalFactoryPriceTotal = 0, grandTotalStandardPriceTotal = 0, grandTotalConsumerPriceTotal = 0,rntPDcAmt=0,nomalRntPDcAmt=0,combineRntPDcAmt=0,lioEstcCostAmt=0,mntEstcCostAmt=0,rboItemReturnRt=0,grandTotalEstgNetAmtTotal = 0;

    modalAddressList.forEach((address, addrIdx) => {
      let addressTotalQty = 0, addressTotalRentalPriceTotal = 0, addressTotalInPriceTotal = 0, addressTotalFactoryPriceTotal = 0, addressTotalStandardPriceTotal = 0, addressTotalConsumerPriceTotal = 0,addressTotalEstgNetAmtTotal = 0;

      // Address Header Row
      const addressRow = document.createElement("tr");
      addressRow.appendChild(createCell(address.ROAD_ADDR, "font-bold", 18));
      tbody.appendChild(addressRow);

      if (address.bundleList && address.bundleList.length > 0) {
        address.bundleList.forEach((space, bundleIdx) => {
          const groupId = `group-${addrIdx}-${bundleIdx}`;
          let subtotalQty = 0, subtotalRentalPriceTotal = 0, subtotalInPriceTotal = 0, subtotalFactoryPriceTotal = 0, subtotalStandardPriceTotal = 0, subtotalConsumerPriceTotal = 0,subtotalEstgNetDcRtTotal = 0,subtotalEstgNetAmtTotal = 0;

          // Space Header Row
          const spaceHeaderRow = document.createElement("tr");
          spaceHeaderRow.className = "t-group-header";
          spaceHeaderRow.dataset.groupId = groupId;
          const spaceHeaderCell1=createCell("")
          spaceHeaderCell1.innerHTML=`
          <div class="flex items-center justify-between">
              <button type="button" class="t-group-toggle" aria-expanded="true">
                <i class="icon-chevron"></i>
              </button>
            </div>
          `
          spaceHeaderRow.appendChild(spaceHeaderCell1)
          const spaceHeaderCell2 = createCell("", "", 20);
          spaceHeaderCell2.innerHTML = `<span>${space.ESTB_TITLE}</span>`;
          spaceHeaderRow.appendChild(spaceHeaderCell2);
          tbody.appendChild(spaceHeaderRow);

          if (space.gsList && space.gsList.length > 0) {
            space.gsList.forEach((item, estGsIdx) => {
              const qty = Number(item.ITM_QTY) || 0;
              const rentalTotal = item.RBO_RTC_PRICE * qty;
              item.RBO_RTC_PRICE_TOTAL = item.RBO_RTC_PRICE * qty;
              const rentalOfrTotal = item.RBO_RTC_PRICE * qty *  ((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100);
                if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND);
                }else if(item.GS_AMT_UNIT){
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT);
                }else{
                  item.ESTG_NET_UP=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100);
                }
              const inTotal = item.IOP_INPCST * qty;
              const factoryTotal = item.IOP_MNFCST * qty;
              const standardTotal = item.GIJUN_CST * qty;
              const consumerTotal = item.IOP_SALCST * qty;
              const estgNetAmtTotal = item.ESTG_NET_UP * qty;

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
              subtotalEstgNetAmtTotal+= estgNetAmtTotal;


              addressTotalQty += qty;
              addressTotalRentalPriceTotal += rentalTotal;
              addressTotalInPriceTotal += inTotal;
              addressTotalFactoryPriceTotal += factoryTotal;
              addressTotalStandardPriceTotal += standardTotal;
              addressTotalConsumerPriceTotal += consumerTotal;
              addressTotalEstgNetAmtTotal+= estgNetAmtTotal;

              grandTotalQty += qty;
              grandTotalRentalPriceTotal += rentalTotal;
              grandTotalRentalOfrPriceTotal += rentalOfrTotal;
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
                nomalRntPDcAmt = qty*(Number((100-(item.ESTG_NET_DC_RT_FINAL??0))/100) || 0);
                if(item.GS_AMT_UNIT&&item.GS_AMT_ROUND){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT,item.GS_AMT_ROUND)*qty;
                }else if(item.GS_AMT_UNIT){
                  nomalRntPDcAmt +=adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),item.GS_AMT_UNIT)*qty;
                }else{
                  nomalRntPDcAmt +adjustByUnit(item.RBO_RTC_PRICE*((100 - (item.ESTG_NET_DC_RT_FINAL ?? 0)) / 100),100)*qty;
                }
              }

              item.ESTG_NET_AMT=Number(item.ESTG_NET_UP)*qty;




              grandTotalFactoryPriceTotal += factoryTotal;
              grandTotalStandardPriceTotal += standardTotal;
              grandTotalConsumerPriceTotal += consumerTotal;
              grandTotalEstgNetAmtTotal+=estgNetAmtTotal;


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
              /*if(item.SET_YN=='I'){
                itemRow.appendChild(createCellWithInput("text", "text-center", "ESTG_CAT", `${addrIdx}_${bundleIdx}_${estGsIdx}_ESTG_CAT`, item.ESTG_CAT || ''));
              }else{*/
                itemRow.appendChild(createCell(item.ESTG_CAT));
              /*}*/


              itemRow.appendChild(createCell(item.ITM_CD, "text-left"));
              itemRow.appendChild(createCell(item.COL_CD, "text-left"));
              itemRow.appendChild(createCell(item.SET_YN=='I'?"단품":"세트", "text-left"));
              itemRow.appendChild(createCell(item.ITM_NM, "text-left"));
              itemRow.appendChild(createCell(item.ITM_DESC, "text-left"));

              itemRow.appendChild(createCell(qty, "text-right"));
              itemRow.appendChild(createCell(item.RBO_RTC_PRICE.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(rentalTotal.toLocaleString(), "text-right"));

              itemRow.appendChild(createCell(item.ESTG_NET_DC_RT_FINAL.toLocaleString(),"text-right"));
              itemRow.appendChild(createCell(item.ESTG_NET_UP.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.ESTG_NET_AMT.toLocaleString(), "text-right"));



            /*    itemRow.appendChild(createCell(item.IOP_INPCST.toLocaleString(), "text-right"));
                itemRow.appendChild(createCell(inTotal.toLocaleString(), "text-right"));
                itemRow.appendChild(createCell(item.IOP_MNFCST.toLocaleString(), "text-right"));
                itemRow.appendChild(createCell(factoryTotal.toLocaleString(), "text-right"));*/
              itemRow.appendChild(createCell(item.GIJUN_CST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(standardTotal.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(item.IOP_SALCST.toLocaleString(), "text-right"));
              itemRow.appendChild(createCell(consumerTotal.toLocaleString(), "text-right"));
              tbody.appendChild(itemRow);
            });
          }

          // Subtotal Row
          const subtotalRow = document.createElement("tr");
          subtotalRow.className = "t-group-item bg-muted";
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell("소계", "font-medium", 6));
          subtotalRow.appendChild(createCell(subtotalQty.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalRentalPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalEstgNetAmtTotal.toLocaleString(), "text-right"));
     /*     subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalInPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalFactoryPriceTotal.toLocaleString(), "text-right"));*/
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalStandardPriceTotal.toLocaleString(), "text-right"));
          subtotalRow.appendChild(createCell(""));
          subtotalRow.appendChild(createCell(subtotalConsumerPriceTotal.toLocaleString(), "text-right"));
          tbody.appendChild(subtotalRow);
        });
      }

      // Address Total Row
      const addressTotalRow = document.createElement("tr");
      //addressTotalRow.className = "bg-black text-white";
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell("주소지 합계", "font-medium", 6));
        addressTotalRow.appendChild(createCell(addressTotalQty.toLocaleString(), "text-right"));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalRentalPriceTotal.toLocaleString(), "text-right"));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
/*        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalInPriceTotal.toLocaleString(), "text-right"));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalFactoryPriceTotal.toLocaleString(), "text-right"));*/
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalStandardPriceTotal.toLocaleString(), "text-right"));
        addressTotalRow.appendChild(createCell(""));
        addressTotalRow.appendChild(createCell(addressTotalConsumerPriceTotal.toLocaleString(), "text-right"));
      tbody.appendChild(addressTotalRow);
    });

    // Grand Total Row
    const grandTotalRow = document.createElement("tr");
      grandTotalRow.className = "bg-black text-white";
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell("합계", "font-medium", 6));
      grandTotalRow.appendChild(createCell(grandTotalQty.toLocaleString(), "text-right"));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalRentalPriceTotal.toLocaleString(), "text-right"));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalEstgNetAmtTotal.toLocaleString(), "text-right"));
/*      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalInPriceTotal.toLocaleString(), "text-right"));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalFactoryPriceTotal.toLocaleString(), "text-right"));*/
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalStandardPriceTotal.toLocaleString(), "text-right"));
      grandTotalRow.appendChild(createCell(""));
      grandTotalRow.appendChild(createCell(grandTotalConsumerPriceTotal.toLocaleString(), "text-right"));
    tbody.appendChild(grandTotalRow);
    renderModalAddresses()
}


function setSelectedProductModalAdd(selectedProductData, addrIdx, bundleIdx) {
    const space = modalAddressList[addrIdx].bundleList[bundleIdx];
    if (!space.gsList) {
      space.gsList = [];
    }else{
       for(selectedProduct of selectedProductData){
         for(itemData of space.gsList){
           if(itemData.ITM_CD==selectedProduct.ITM_CD && itemData.COL_CD==selectedProduct.COL_CD){
             //return true;
           }
         }
       }
     }
    if (Array.isArray(selectedProductData)) {
      space.gsList.push(...selectedProductData);  // spread로 여러 개 추가
    } else {
      space.gsList.push(selectedProductData);
    }
    renderProductModalData(modalAddressList);
}



document.getElementById("itemModalSpot").addEventListener("focusout", function(event) {
    if (event.target.matches('[data-input="ESTG_QTY"]')) {
      const value = event.target.value.replace(/[^0-9]/g, "");
      const key = event.target.dataset.input;
      const [addrIdx, bundleIdx, estGsIdx, ...rest] = event.target.id.split("_");

      if (!modalAddressList[addrIdx]) modalAddressList[addrIdx] = {};
      if (!modalAddressList[addrIdx].bundleList) modalAddressList[addrIdx].bundleList = [];
      if (!modalAddressList[addrIdx].bundleList[bundleIdx]) modalAddressList[addrIdx].bundleList[bundleIdx] = {};
      if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList) modalAddressList[addrIdx].bundleList[bundleIdx].gsList = [];
      if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]) {
        modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx] = {};
      }

      modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx][key] = value;
      modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]["ITM_QTY"] = value;
      renderProductModalData(modalAddressList)
    }else if(event.target.matches('[data-input="ESTG_CAT"]')){
      const value = event.target.value;
      const key = event.target.dataset.input;
      const [addrIdx, bundleIdx, estGsIdx] = event.target.id.split("_");

      if (!modalAddressList[addrIdx]) modalAddressList[addrIdx] = {};
      if (!modalAddressList[addrIdx].bundleList) modalAddressList[addrIdx].bundleList = [];
      if (!modalAddressList[addrIdx].bundleList[bundleIdx]) modalAddressList[addrIdx].bundleList[bundleIdx] = {};
      if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList) modalAddressList[addrIdx].bundleList[bundleIdx].gsList = [];

      if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]) {
        modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx] = {};
      }

      modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx][key] = value;
    }else if(event.target.matches('[data-input="ESTG_NET_DC_RT_FINAL"]')){
       const value = event.target.value;
       const key = event.target.dataset.input;
       const [addrIdx, bundleIdx, estGsIdx] = event.target.id.split("_");

       if (!modalAddressList[addrIdx]) modalAddressList[addrIdx] = {};
       if (!modalAddressList[addrIdx].bundleList) modalAddressList[addrIdx].bundleList = [];
       if (!modalAddressList[addrIdx].bundleList[bundleIdx]) modalAddressList[addrIdx].bundleList[bundleIdx] = {};
       if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList) modalAddressList[addrIdx].bundleList[bundleIdx].gsList = [];

       if (!modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx]) {
         modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx] = {};
       }

       modalAddressList[addrIdx].bundleList[bundleIdx].gsList[estGsIdx][key] = value;
       renderProductModalData(modalAddressList)
     }
});


// 렌더링 함수
function renderModalAddresses() {
    const container = document.getElementById("addressContainer") || { innerHTML: "" };
    container.innerHTML = ""; // Clear existing content

    modalAddressList.forEach((address, addrIndex) => {
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
              <button type="button" class="btn btn-regist border-border add-addr-row-btn" data-addr-index="${addrIndex}">
              추가</button>
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

    bindModalEvents();
}



function bindModalEvents() {
    document.getElementById("addressContainer").querySelectorAll(".remove-address-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        planData=[]
        rboEstimate["EST_PLAN"]='';
        modalAddressList.splice(addrIdx, 1);
        renderProductModalData(modalAddressList)
      });
    });
    document.getElementById("addressContainer").querySelectorAll(".add-addr-row-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        modalAddressList[addrIdx].bundleList.push({ name: "" });
        renderProductModalData(modalAddressList)
      });
    });
    document.getElementById("addressContainer").querySelectorAll(".remove-addr-row-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const addrIdx = parseInt(btn.dataset.addrIndex, 10);
        const bundleIdx = parseInt(btn.dataset.spaceIndex, 10);
        modalAddressList[addrIdx].bundleList.splice(bundleIdx, 1);
        renderProductModalData(modalAddressList)
      });
    });
    document.getElementById("addressContainer").querySelectorAll("input[data-addr-index]").forEach(input => {
      input.addEventListener("input", e => {
        const addrIdx = parseInt(input.dataset.addrIndex, 10);
        const bundleIdx = parseInt(input.dataset.spaceIndex, 10);
        modalAddressList[addrIdx].bundleList[bundleIdx].name = e.target.value;
        renderProductModalData(modalAddressList)
      });
    });
}



function deleteModalSelectedItems() {
    const checkedBoxes = document.querySelectorAll('#itemModalSpot .checkbox:checked');

    checkedBoxes.forEach(box => {
      const row = box.closest('tr');
      const addrIdx = parseInt(row.dataset.addrIdx, 10);
      const bundleIdx = parseInt(row.dataset.bundleIdx, 10);
      const itemIdx = parseInt(row.dataset.itemIdx, 10);

      // 해당 item 삭제
      if (modalAddressList[addrIdx] &&
        modalAddressList[addrIdx].bundleList &&
        modalAddressList[addrIdx].bundleList[bundleIdx] &&
        modalAddressList[addrIdx].bundleList[bundleIdx].gsList) {

        modalAddressList[addrIdx].bundleList[bundleIdx].gsList.splice(itemIdx, 1);
      }
    });

    // 다시 렌더링
    renderProductModalData(modalAddressList)
}


function adModalSelectedItems() {
     document.getElementById("checkAllEstimate").checked=false;
      modalAddressList[addrIdx].bundleList[bundleIdx].gsList
          .filter(item => item.SET_YN === "I")
          .forEach(item => {
            item.ESTG_CAT = document.getElementById("estimateByProductGroupCode").value
          });
        renderProductModalData(modalAddressList)

/*
    const checkedBoxes = document.querySelectorAll('#itemModalSpot .checkbox:checked');

    checkedBoxes.forEach(box => {
      const row = box.closest('tr');
      const addrIdx = parseInt(row.dataset.addrIdx, 10);
      const bundleIdx = parseInt(row.dataset.bundleIdx, 10);
      const itemIdx = parseInt(row.dataset.itemIdx, 10);

      // 해당 item 삭제
      if (modalAddressList[addrIdx] &&
        modalAddressList[addrIdx].bundleList &&
        modalAddressList[addrIdx].bundleList[bundleIdx] &&
        modalAddressList[addrIdx].bundleList[bundleIdx].gsList) {
        modalAddressList[addrIdx].bundleList[bundleIdx].gsList[itemIdx].ESTG_NET_DC_RT_FINAL = document.getElementById("estimateByProductRate").value
      }
    });
    renderProductModalData(modalAddressList)*/
}

function setAddressListByProductList(){
    setByProductModalData(modalAddressList);
    closeModal('estimateByProductModal')
}
function checkAllEstimateProduct(allCheckBox) {
  const boxes = document.querySelectorAll('#itemModalSpot .checkbox');
  boxes.forEach(box => {
    box.checked = allCheckBox.checked;
  });
}



