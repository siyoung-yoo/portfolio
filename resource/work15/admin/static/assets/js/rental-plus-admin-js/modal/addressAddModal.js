let zipData = {
  "addressZipProv":""  }
const provSelect = document.getElementById("addressZipProv");
const citySelect = document.getElementById("addressCity");
const selectEl = provSelect.querySelector("select");
var addressAddGrid;
var addressAddGridSelectedRow = '';
var addressAddModalInitialized = false;

var addressAddColumnLayout1 = [
  {headerText:'우편번호',dataField:'ZIP_CD', width:80},
  {headerText:'시/도',dataField:'ZIP_PROV', width:110},
  {headerText:'군/구',dataField:'ZIP_CITY', width:110},
  {headerText:'주소',dataField:'ROAD_ADDR', width:400},
  /* {headerText:'법정동코드',dataField:'BDONG_CD'},*/
]

var addressAddGridProps = {
  isRowAllCheckCurrentView : true,
  autoGridHeight : false,
  selectionMode: 'singleRow',
  showRowNumColumn: true,
}

addressAddGrid = AUIGrid.create("#addressAddGrid", addressAddColumnLayout1, addressAddGridProps);
AUIGrid.bind(addressAddGrid, "cellClick", function(event) {
  addressAddGridSelectedRow=event.rowIndex;
});

AUIGrid.bind(addressAddGrid, "cellDoubleClick", function(event) {
  addressAddGridSelectedRow=event.rowIndex;
  doSelectedDataAddressAdd();
});
resizeGrid(addressAddGrid);

function initAddressAddModal() {
  if (addressAddModalInitialized) return;
  addressAddModalInitialized = true;

  fetchJson("/estimate/getZipProvData", "GET", {})
    .then(async data => {
      data.forEach(item => {
        let value = item.ZIP_PROV;
        let textContent = item.ZIP_PROV;
        provSelect.addOption(value, textContent);
      });
      if (data.length > 0) {
        provSelect.setValue(data[0].ZIP_PROV);
      }
    });
}

window.initAddressAddModal = initAddressAddModal;

document.addEventListener("modalOpened", function(event) {
  if (event.detail && event.detail.modalId === "addressAddModal") {
    initAddressAddModal();
  }
});

selectEl.addEventListener("change",async function () {
  const selectedProv = this.value;
  citySelect.clearOptions()

  fetchJson("/estimate/getZipCityData","GET",{ZIP_PROV:selectedProv})
    .then(async data => {
      data.forEach(item => {
        let value = item.ZIP_CITY;
        let textContent = item.ZIP_CITY;
        citySelect.addOption(value,textContent);
      });
      if (data.length > 0) {
        citySelect.setValue(data[0].ZIP_CITY);
      }
    })
});
const addressAddModal = document.getElementById("addressAddModal");
addressAddModal.querySelectorAll("input[data-param]").forEach(input => {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // form submit 방지
      document.getElementById("searchAddressBtn").click(); // 버튼 클릭 이벤트 강제 실행
    }
  });
});


function doSelectedDataAddressAdd() {
  // 선택 버튼 로직
  if (!addressAddGridSelectedRow && addressAddGridSelectedRow !== 0) {
    alert('주소를 선택해주세요.')
    return false;
  }
  if(setSelectedAddressAdd(AUIGrid.getGridData(addressAddGrid)[addressAddGridSelectedRow])){
    const modal = document.getElementById("addressAddModal");
    closeModal(modal);
  }else{
    alert('중복된 주소입니다.')
  }

}

document.getElementById("searchAddressBtn").addEventListener("click", () => {
  addressAddGridSelectedRow = '';
  // 모든 data-param 속성을 가진 요소 찾기
  const elements = addressAddModal.querySelectorAll("[data-param]");
  AUIGrid.showAjaxLoader(addressAddGrid);
  // 객체로 변환
  const addressAddParams = {};
  for(let el of elements){
    const key = el.dataset.param;   // data-param 값
    const value = el.value;         // input/select 값
    if (key === "ROAD_ADDR" && value.length <= 1) {
      alert("검색어 값은 최소 2글자 이상 입력해야 합니다.");
      AUIGrid.removeAjaxLoader(addressAddGrid);
      return; // 함수 실행 중단
    }
    addressAddParams[key] = value;
  }
  loadGridData(addressAddGrid,'/estimate/addressAdd.dataTable',addressAddParams);
});
