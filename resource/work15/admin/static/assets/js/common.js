//ajax 로딩 화면 및 alert
function isAjaxPopupResult(result) {
    return !!(result && (result.popup || result.isPopup));
}

function normalizeAjaxPopupLocation(locationUrl, result) {
    if (!locationUrl) return locationUrl;
    if (isAjaxPopupResult(result) && locationUrl.indexOf('/loginPop') === 0 && locationUrl.indexOf('refresh=true') === -1) {
        return locationUrl + (locationUrl.indexOf('?') === -1 ? '?' : '&') + 'refresh=true';
    }
    return locationUrl;
}

function openAjaxPopupLocation(locationUrl, result) {
    var target = normalizeAjaxPopupLocation(locationUrl, result);
    var popup = window.open(target, 'loginPop', 'width=1330,height=790,scrollbars=yes,resizable=yes');
    if (popup) {
        popup.focus();
    } else {
        location.href = target;
    }
}

$(document).ajaxStart(function(event, xhr, settings){
    //로딩창
    $(document.body).css('cursor','wait');
}).ajaxSend(function(event, jqXHR, ajaxOptions ){

    //응답전에 다시 조회하는 경우 기존 요청 취소
    var reqUrl=ajaxOptions.url;
    try{
        if(reqUrl.indexOf('.dataTable')!=-1){
            $('table').each(function(){
                var table_id=$(this).attr('id');
                if(table_id!==undefined && table_id!=null){
                    if ( $.fn.DataTable.isDataTable( '#'+table_id ) ) {
                        var table=$('#'+table_id).DataTable();
                        if(table.settings()[0].jqXHR!=null && table.settings()[0].jqXHR.readyState!=4 && reqUrl==table.settings()[0].ajax.url){
                            table.settings()[0].jqXHR.abort();
                        }
                    }
                }
            });

            //datatable 열 넓이 자동 정렬
            try{
                if($.fn.dataTable != undefined){
                    $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
                }
            }catch(e){



            }
        }
    }catch(e){}
}).ajaxError(function(event, xhr, settings,data){
    try{
        if(xhr.responseJSON != null){
            if(xhr.responseJSON.location!=null){
                if(isAjaxPopupResult(xhr.responseJSON)){
                    openAjaxPopupLocation(xhr.responseJSON.location, xhr.responseJSON);
                }else{
                    location.href = xhr.responseJSON.location;
                }
            }

            if(xhr.responseJSON.message!=null){
                alert(xhr.responseJSON.message);
            }
        }else{
            if(xhr.statusText != 'abort'){
                alert('에러 발생');
            }
        }
    }catch(e){

    }
}).ajaxSuccess(function(event, xhr, settings, thrownError){
    if(xhr.responseJSON != null){
        if(xhr.responseJSON.message!=null){
            alert(xhr.responseJSON.message);
        }

        if(xhr.responseJSON.location!=null){
            if(isAjaxPopupResult(xhr.responseJSON)){
                openAjaxPopupLocation(xhr.responseJSON.location, xhr.responseJSON);
            }else{
                //세션만료로 로그인 팝업 띄우는 경우
                if(location.pathname == '/loginPop'){
                    //부모창 새로고침
                    if(location.search.indexOf('refresh=true') != -1 && window.opener != null){
                        window.opener.location.reload()
                    }
                    window.close();
                }else{
                    location.href = xhr.responseJSON.location;
                }
            }
        }
    }
}).ajaxStop(function(event, xhr, settings, thrownError){
    //로딩 끝
    $(document.body).css('cursor','');
});

$.fn.setCursorPosition = function( pos ) {
    this.each(function (index, elem) {
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
}

//dataTable destroy
function destroyDatatable(id){
    try{
        if ($.fn.DataTable.isDataTable('#'+id)) {
            $('#'+id).DataTable().destroy();
            $('#'+id).html('');
        }
    }catch(e){}
}
function buttonsSelect(useSelect){
    var buttons=[
        {
            action: function (e, dt, node, config) {
                downloadAllExcel(dt.settings()[0].sTableId);
            },
            text: '엑셀',
            className: 'btn btn-outline',
            footer: true
        },
        {
            extend: 'excelHtml5',
            className: 'hidden',
            text: 'excel' //보이는것만다운로드하는버튼
        },
        {
            text: '새로고침',
            className: 'btn btn-outline',
            action: function (e, dt, node, config) {
                dt.ajax.reload();
            }
        }
      ];

    if(useSelect){
        buttons.unshift({
            extend: 'selectNone',
            text: '선택해제',
            className: 'btn btn-outline',
            exportOptions: {
                columns: ':visible'
            }
        });
        buttons.unshift({
            extend: 'selectAll',
            text: '전체선택',
            className: 'btn btn-outline',
            exportOptions: {
                columns: ':visible'
            }
        });
    }
    return buttons;
}

//datatable 기본 설정
if($.fn.dataTable !== undefined){
    $.extend($.fn.dataTable.defaults, {
        scrollY: '100%',
        scrollCollapse: true, /*값에 상관 없이 테이블 높이 유지*/
        fixedHeader: false,
        fixedColumns: false,
        colReorder: false,
        ordering: true,
        scrollX: true,
        deferRender: true,
        scroller: true,
        autoWidth: false, /*좌우 여백을 창이 아닌 값에 맞춤*/
        lengthMenu: [
          [ 10, 20, 30, 40, -1],
          [ '10', '20', '30', '40', '전체']
        ],
        dom: '<"datatable-header"lpi><"datatable-scroll"t><"datatable-footer">',

        language: {
          search: '_INPUT_',
          searchPlaceholder: '결과내 재검색',
          paginate: {
            first: 'First',
            last: 'Last',
            next: '&rarr;',
            previous: '&larr;'
          },
          emptyTable: '데이터가 없습니다.',
          info: '', //'_TOTAL_개의 검색결과 [ _START_ ~ _END_  ]'
          infoEmpty: '검색결과가 없습니다.',
          infoFiltered: '(총 _MAX_개의 자료에서 재검색)',
          lengthMenu: '_MENU_ 개씩 보기',
          zeroRecords: '검색 결과가 없습니다.'
        },

        infoCallback: function (settings, start, end, max, total, pre) {
          const api = this.api();
          const pageInfo = api.page.info();

          return `${pageInfo.page + 1} / ${pageInfo.pages} ( ${start}~${end} )`;
        },
        /*buttons: buttonsSelect(true),*/
        footerCallback: function(tfoot, data, start, end, display){
            //init하기 전에 tfoot 태그 있어야함
            if(tfoot!=null){
                var api = this.api();

                var recordsTotal=api.table().ajax.json().recordsTotal;
                if(recordsTotal == 0){
                    $(tfoot).parent().hide();
                }else{
                    $(tfoot).parent().show();
                }

                var countMap=api.table().ajax.json().map.countMap;
                var col_length=api.table().columns()[0].length;
                $(tfoot).html('');
                $(tfoot).append('<td><strong>합계</strong></td>');
                for(var i=1;i<col_length;i++){
                    //필드명
                    var col_data=api.context[0].aoColumns[i].data;
                    var col_value=countMap[col_data];
                    if(col_value==null){
                        col_value='';
                    }else{
                        if(typeof col_value == 'number'){
                            col_value=comma(col_value);
                            //col_value=comma(col_value)+'<span class="small">원</span>';
                        }else{
                            col_value=col_value;
                        }
                    }
                    $(tfoot).append('<td class="text-right"><strong>'+col_value+'</strong></td>');
                }
            }
        }
    });
}

function toggleTopOn(sdIdx) {
    $.ajax({
        url:'/member/sangdamTop.ajax',
        data: "sdIdx="+sdIdx+"&state=true",
        type:"POST",
        success:function() {
            searchSangdam();
        }
    });
}

function toggleTopOff(sdIdx) {
    $.ajax({
        url:'/member/sangdamTop.ajax',
        data: "sdIdx="+sdIdx+"&state=false",
        type:"POST",
        success:function() {
            searchSangdam();
        }
    });
}

function optimizeJs(src,str) {
    var staticUri = str;

/*    if (src == null || src == '') return '';
    if (src.indexOf('/prod/') > -1 || src.indexOf('/dev/') > -1) {
        src = staticUri + src;
    } else {
        src = staticUri + '/prod' + src;
    }*/
    return staticUri + src
}



function activeDisplay(state,table,url){
    var param = '';
    if($('input[name=types]').val() == 'middle') {
        if(url != '/product/brandDelete2.ajax') url = '/product/categoryDisplay2.ajax'
        gridDisplay(state,myGridId2,url,'CSC_IDX');
        return;
    }

    if($('input[name=types]').val() == 'md') table = 'msspTable1'

    if($('input[name=types]').val() == 'small') table = 'msspTable2'
    if($('input[name=types]').val() == 'slide') {
        table = 'scbnTable'
        url = '/product/scbDisplay.ajax'
    }


    var leng = $('#'+table+' .selected').find("input").length;

    if(leng == 0) {
        alert("선택한 데이터가 없습니다.");
        return ;
    } else {
        $.each($('#'+table+' .selected').find("input"), function(key, val){
            var idx = $(this).val();
            if(leng == (key+1)){
                param = param + idx;
            }else{
                param = param + idx + ",";
            }
        });
        if(confirm("변경하시겠습니까?")){
            $.ajax({
                url:url,
                data: "idx="+param+"&state="+state,
                type:"POST",
                success:function() {
                    $('#'+table).DataTable().ajax.reload();
                }
            });
        }
    }
}

function gridDisplay(state,grid,url,idxName){
    var param = '';
    var items = AUIGrid.getCheckedRowItemsAll(grid);
    var leng = items.length;

    if(leng == 0) {
        alert("선택한 데이터가 없습니다.");
        return ;
    } else {
        $.each(items, function(key, val){
            var idx = val[idxName];
            if(leng == (key+1)){
                param = param + idx;
            }else{
                param = param + idx + ",";
            }
        });
        if(confirm("변경하시겠습니까?")){
            $.ajax({
                url:url,
                data: "idx="+param+"&state="+state,
                type:"POST",
                success:function() {
                    /*$('#'+table).DataTable().ajax.reload();*/
                    if(si != null && si != 0) {
                        searchBtn2(si);
                    }else{
                        location.reload();
                    }
                }
            });
        }
    }
}


function gridChecked(idxName) {
    var items = AUIGrid.getCheckedRowItemsAll(myGridId1);

    var item;
    var param='';

    //파라미터로 넘겨줌(이후 모든 순서변경 파라미터 idxs로 통일 권장)
    if(items.length >= 1) {
        for(var i=0, len=items.length; i<len; i++) {
            item=items[i];


            if(param == '') {
                param = param + item[idxName];

            }else{
                param = param + ',' + item[idxName];

            }
        }
    }
    return param;
}

function gridCheckedNormal(idxName,grid) {
    var items = AUIGrid.getCheckedRowItemsAll(grid);

    var item;
    var param='';

    //파라미터로 넘겨줌(이후 모든 순서변경 파라미터 idxs로 통일 권장)
    if(items.length >= 1) {
        for(var i=0, len=items.length; i<len; i++) {
            item=items[i];

        if(item[idxName] != null){
            if(param == '') {
                param = param + item[idxName];

            }else{
                param = param + ',' + item[idxName];

            }
        }

        }
    }
    return param;
}

function gridCheckedArray(idxName) {
    var items = AUIGrid.getCheckedRowItemsAll(myGridId1);

    var item;

    var param=new Array();
    for(var i=0, len=items.length; i<len; i++) {
        item=items[i];
        param.push(item[idxName]);
    }

    return param;
}

function gridArrayNormal(idxName,grid) {
    var items = AUIGrid.getGridData(grid);

    var item;

    var param=new Array();
    for(var i=0, len=items.length; i<len; i++) {
        item=items[i];
        param.push(item[idxName]);
    }

    return param;
}


function gridCheckedDefinedArray(idxName) {
    var items = AUIGrid.getCheckedRowItemsAll(myGridId1);

    var item;

    var param=new Array();
    for(var i=0, len=items.length; i<len; i++) {
        item=items[i];
        if(item[idxName] != 'undefined' && item[idxName] != null) param.push(item[idxName]);
    }

    return param;
}

function activeGrid(state,idxName,url){
    var param = '';
    var items = AUIGrid.getCheckedRowItemsAll(myGridId1);



    var item;
    var param='';

    //파라미터로 넘겨줌(이후 모든 순서변경 파라미터 idxs로 통일 권장)
    if(items.length >= 1) {
        for(var i=0, len=items.length; i<len; i++) {
            item=items[i];


            if(param == '') {
                param = param + item[idxName];

            }else{
                param = param + ',' + item[idxName];

            }
        }
    }



        if(confirm("변경하시겠습니까?")){
            $.ajax({
                url:url,
                data: "idx="+param+"&state="+state,
                type:"POST",
                success:function() {
                    window.location.reload();
                }
            });
        }
}
function activeGrid2(state,idxName,url){
    var param = '';
    var items = AUIGrid.getCheckedRowItemsAll(myGridId2);



    var item;
    var param='';

    //파라미터로 넘겨줌(이후 모든 순서변경 파라미터 idxs로 통일 권장)
    if(items.length >= 1) {
        for(var i=0, len=items.length; i<len; i++) {
            item=items[i];


            if(param == '') {
                param = param + item[idxName];

            }else{
                param = param + ',' + item[idxName];

            }
        }
    }



    if(confirm("변경하시겠습니까?")){
        $.ajax({
            url:url,
            data: "idx="+param+"&state="+state,
            type:"POST",
            success:function() {
                window.location.reload();
            }
        });
    }
}


function toggleDisplayOnGrid(obj) {
    $($(obj)).parent('tr').find('input[type=checkbox]').click();
    $('#displayOff').click();
}
function toggleDisplayOffGrid(obj) {
    $($(obj)).parent('tr').find('input[type=checkbox]').click();
    $('#displayOn').click();
}

function toggleDisplayOn(obj) {
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#displayOff').click();
}
function toggleDisplayOff(obj) {
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#displayOn').click();
}
function deleteProcess(obj){
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#delete2').click();
}

function toggleDisplayOn2(obj) {
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#displayOff2').click();
}
function toggleDisplayOff2(obj) {
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#displayOn2').click();
}
function deleteProcess2(obj){
    $($(obj)).parent().parent().find('.select-checkbox').click();
    $('#delete22').click();
}

function selfClose(){
    window.open('','_self').close();
}

function modalDiv(dtId){
    var divStr =  '<html lang="ko" xmlns:th="http://www.thymeleaf.org">\n' +
    '<div class="modal" id="dtExcelReason">\n' +
    '  <div class="modal-dialog modal-sm">\n' +
    '    <div class="modal-content">\n' +
    '      <div class="modal-header">\n' +
    '        <h3 class="modal-title">엑셀 다운로드 사유 입력</h3>\n' +
    '        <button type="button" class="close" data-dismiss="modal"></button>\n' +
    '      </div>\n' +
    '      <div class="modal-body">\n' +
    '        <form id="dtExcelReasonForm" onkeypress="if(event.keyCode==13){searchModalBtn();return false;}">\n' +
    '           <div class="row">\n' +
    '               <div class="col-12">\n' +
    '                   <div class="form-group">\n' +
    '                       <div class="form-label">\n' +
    '                           <span>다운로드 사유 (<b id="byteLimit">300</b> Byte)</span>\n' +
    '                       </div>\n' +
    '                       <input type="text" id="downloadReason" name="reason" class="form-control" onkeyup="byteLimit(this, 300)">\n' +
    '                   </div>\n' +
    '              </div>\n' +
    '          </div>\n' +
    '        </form>\n' +
    '      </div>\n' +
    '      <div class="modal-footer">\n' +
    '         <div></div>\n' +
    '         <div>\n' +
    '           <button type="button" class="btn btn-teal" onclick=downloadAllExcel("'+dtId+'") >다운로드</button>\n' +
    '         </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '\n' +
    '<script>\n' +
    '  //취소사유 입력 byte확인 및 제한 입력시\n' +
    '  function byteLimit(obj, maxByte) {\n' +
    '    var str = obj.value;\n' +
    '    var str_len = str.length;\n' +
    '    var rbyte = 0;\n' +
    '    var rlen = 0;\n' +
    '    var one_char = "";\n' +
    '    var str2 = "";\n' +
    '\n' +
    '\n' +
    '    for(var i=0; i<str_len; i++) {\n' +
    '      one_char = str.charAt(i);\n' +
    '      if(escape(one_char).length > 4) {\n' +
    '        rbyte += 2;                                         //한글2Byte\n' +
    '      }else{\n' +
    '        rbyte++;                                            //영문 등 나머지 1Byte\n' +
    '      }\n' +
    '      if(rbyte <= maxByte){\n' +
    '        rlen = i+1;                                          //return할 문자열 갯수\n' +
    '      }\n' +
    '    }\n' +
    '    if(rbyte > maxByte){\n' +
    '      str2 = str.substr(0,rlen);                                  //문자열 자르기\n' +
    '      obj.value = str2;\n' +
    '      byteLimit(obj, maxByte);\n' +
    '    }else {\n' +
    '      document.getElementById(\'byteLimit\').innerText = maxByte-rbyte;\n' +
    '    }\n' +
    '  }\n' +
    '</script>';
    return divStr;
}

function downloadAllExcel(dtId){
    var dt = $("#"+dtId).DataTable();

    if(!dt.settings()[0].oInit.serverSide){
        //serverSide false
        if( !$("#dtExcelReason").hasClass('show') ){
            $('body').append(modalDiv(dtId));
            $("#dtExcelReason").modal('show');
            return false;
        }
        var downloadReason = $("#downloadReason");
        if(downloadReason.val() == ''){
            alert('엑셀 다운로드 사유를 입력해주세요.');
            downloadReason.focus();
            return false;
        }

        $.ajax({
            url:'/excelLog.ajax'
            ,type:'post'
            ,data:'url='+encodeURIComponent(dt.settings().ajax.url())+'&path='+encodeURIComponent(location.pathname)+'&id='+dtId+'&reason='+downloadReason.val()
        }).done(function(){
            dt.buttons('.buttons-excel').trigger();
            $("#dtExcelReason").modal('hide');
        }).fail(function(){
            alert('잠시후 시도해주세요');
        });
        return false;
    }

    var excelForm=document.createElement('form');
    var excel_cols=document.createElement('input');
    excel_cols.setAttribute('name', 'cols');
    excel_cols.setAttribute('type', 'hidden');
    var t=dt.ajax.params().columns;
    var excel_cols_value='';
    var phoneCheck = true;
    // var phoneCheck = false;
    if(!t){
        //null check
    }else{
        for(var i=0;i<t.length;i++){
            // if(dt.columns(i).visible()[0]){
                excel_cols_value+=t[i].data+';';
                var tiData = t[i].data+'';
                if(tiData.indexOf('_PHONE') != -1){
                    phoneCheck = true;
                }
            // }
        }
    }
    if(phoneCheck){
        if( !$("#dtExcelReason").hasClass('show') ){
            $('body').append(modalDiv(dtId));
            $("#dtExcelReason").modal('show');
            return false;
        }
        var downloadReason = $("#downloadReason");
        if(downloadReason.val() == ''){
            alert('엑셀 다운로드 사유를 입력해주세요.');
            downloadReason.focus();
            return false;
        }

        var reason = document.createElement('input');
        reason.setAttribute('name', 'reason');
        reason.setAttribute('type', 'hidden');
        reason.value=downloadReason.val();
        excelForm.appendChild(reason);
    }

    excel_cols.value=excel_cols_value;
    excelForm.appendChild(excel_cols);

    //order
    try{
        var order_column=document.createElement('input');
        order_column.setAttribute('name', 'order[0][column]');
        order_column.setAttribute('type', 'hidden');
        order_column.value=dt.ajax.params().order[0].column;
        excelForm.appendChild(order_column);

        var order_column2=document.createElement('input');
        order_column2.setAttribute('name', "columns["+dt.ajax.params().order[0].column+"][data]");
        order_column2.setAttribute('type', 'hidden');
        order_column2.value=dt.ajax.params().columns[dt.ajax.params().order[0].column].data;
        excelForm.appendChild(order_column2);

        var order_column3=document.createElement('input');
        order_column3.setAttribute('name', 'order[0][dir]');
        order_column3.setAttribute('type', 'hidden');
        order_column3.value=dt.ajax.params().order[0].dir;
        excelForm.appendChild(order_column3);
    }catch (e) {}

    //thead
    var thead=document.createElement('input');
    thead.setAttribute('name', 'thead');
    thead.setAttribute('type', 'hidden');

    //크롬은 \t 익스는 \r\n\r\n
    var colHead='';
    for(var i=0; i<dt.columns().header().length; i++){
        colHead += dt.columns().header()[i].innerText+';';
    }
    thead.value=colHead;

    excelForm.appendChild(thead);

    excelForm.method='post';

    var pathNameStr = window.location.pathname;
    // if(opener != null){
    //     pathNameStr = opener.location.pathname;
    // }


    //post 파라미터 세팅
    var dt1 = dt.ajax.params();
    var keyList = [];

    for(var val in dt1){
        keyList.push(val);
    }

    for(var i=0; i<keyList.length; i++){
        if(!(keyList[i] == "columns" || keyList[i] == "length" || keyList[i] == "start" || keyList[i] == "draw" || keyList[i] == "search" || dt1[keyList[i]] == "")){
            try{
                if(typeof dt1[keyList[i]] == 'string'){
                    var post_input=document.createElement('input');
                    post_input.setAttribute('name', keyList[i]);
                    post_input.setAttribute('type', 'hidden');
                    post_input.value = dt1[keyList[i]];
                    excelForm.appendChild(post_input);
                }else if(dt1[keyList[i]] instanceof Array){
                    for(var j =0; j<dt1[keyList[i]].length;j++){
                        var post_input=document.createElement('input');
                        post_input.setAttribute('name', keyList[i]);
                        post_input.setAttribute('type', 'hidden');
                        post_input.value = dt1[keyList[i]][j];
                        excelForm.appendChild(post_input);
                    }
                }
            }catch (e) {}
        }
    }

    if(dt.ajax.url().indexOf('?')==-1){
        excelForm.action=dt.ajax.url()+'?download=true&length=-1&pathUrl='+pathNameStr;
    }else{
        excelForm.action=dt.ajax.url()+'&download=true&length=-1&pathUrl='+pathNameStr;
    }
    document.body.appendChild(excelForm);
    excelForm.submit();
    $("#dtExcelReason").modal('hide');
}
function dateFormat(yyyymmdd){
    if(yyyymmdd.length!=8){
        return yyyymmdd;
    }
    return yyyymmdd.substring(0,4)+'-'+yyyymmdd.substring(4,6)+'-'+yyyymmdd.substring(6);
}
//datatable 선택된 값 가져오기
function dataTableGetSelectedData(id,name){
    var getData_table=$('#'+id).DataTable();
    var getData_arr=getData_table.rows({selected:true})[0];
    var param='';
    for(idx in getData_arr){
        param+=getData_table.data()[getData_arr[idx]][name]+',';
    }
    param = param.slice(0, -1);
    return param;
}
//datatable 선택된 값 가져오기
function dataTableGetSelectedDataArray(id,name){
    if ( !$.fn.DataTable.isDataTable( '#'+id ) ) {
        return new Array();
    }
    var getData_table=$('#'+id).DataTable();
    var getData_arr=getData_table.rows({selected:true})[0];
    var param=new Array();
    for(idx in getData_arr){
        param.push(getData_table.data()[getData_arr[idx]][name]);
    }
    return param;
}

//datatable rowIndex로 data 가져오기
function getDatatablemap(id, rowIndex){
    var table=$('#'+id).DataTable();
    return table.data()[rowIndex];
}

//trim 지원안하는 브라우저
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
//datatable refresh
function refreshTable(selector){
    try{
        $(selector).DataTable().ajax.reload();
    }catch (e) {

    }
}
//3자리마다 컴마 찍힌 값으로 return
function comma(strOri){
    if (typeof strOri === 'undefined') {
        return '';
    }
    var str = strOri.toString().replace(/[^\d.-]/g, '');

    if (str.indexOf('-') > 0) {
        str = str.replace(/-/g, '');
    }


    var parts = str.split('.');
    if (parts.length > 2) {
        str = parts[0] + '.' + parts.slice(1).join('');
        parts = str.split('.');
    }

    if (parts[0] !== '' && parts[0] !== '-') {
        parts[0] = Number(parts[0]).toString();
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    str = parts.join('.')

    if (str == '') {
        str = 0;
    }
    return str;
}
/** 소수 3자리 컴마 return */
function decimalComma(strOri) {
    var minus = String(strOri).substring(0,1);
    var str=(strOri+'').replace(/[^0-9.]/gi,'');
    str=(Number(str)+'').replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    if (strOri.substring(strOri.length-1) === '.') {
        str += '.';
    }
    if(minus == '-')str = '-'+str;
    return str;
}

function summernoteContent(content){
    content=content.replaceAll("&lt;","<");
    content=content.replaceAll("&#37;","%");
    content=content.replaceAll("&gt;",">");
    content=content.replaceAll("&quot;","\"");

    return content;
}

// input file 이미지 사이즈 체크(가로 세로 같을 경우 + 이미지 파일일 경우만 가능)
// input file 태그에 onchange로 사용
function imageSizeCheck(obj){
    if(obj.value != ''){
        var fileLength = $($(obj)).val().length;
        var dot = $($(obj)).val().lastIndexOf('.');
        var type = $($(obj)).val().substring(dot+1, fileLength).toLowerCase();
        if(type == 'jpeg' || type == 'png' || type == 'jpg'){
        }else{
            alert('jpeg, png, jpg 확장자의 파일만 가능합니다.');
            obj.value = '';
            return false;
        }

        var img = new Image();
        var file = $($(obj))[0].files[0];
        var _URL = window.URL || window.webkitURL;

        img.src = _URL.createObjectURL(file);

        img.onload = function(){
            if(img.width == img.height){
                return true;
            }else{
                alert('이미지의 가로,세로 크기를 맞춰주세요. \n width: ' + img.width + ' / height: ' + img.height);
                obj.value = '';
                return false;
            }
        }
    }
}
function spanTag(text, className){
    if(className != null){
        return '<span class="'+className+'">'+text+'</span>';
    }else{
        return '<span>'+text+'</span>';
    }
}
//td tag return
function tdTag(html, td_class){
    if(td_class != null){
        return '<td class="'+td_class+'">'+html+'</td>';
    }else{
        return '<td>'+html+'</td>';
    }
}

// 20글자 이상 말줄임표
function ellipsisStr(str){
    str = str+'';
    if(str.length > 20){
        str = str.substr(0, 18) + '...';
    }
    return str;
}

function lineChange(str){
    var cnt = 0;
    str = str+'';
    if(str.length > 35){
        cnt++;
    }
    return cnt;
}

// 40글자 이상 줄바꿈
function lineBreakStr(str){
    str = str+'';
    var strLength = str.length;
    var res = 0;
    var msg = '';
    if(strLength>40){
        res = Math.ceil(strLength/40);
        for(var i=0; i<res; i++){
            msg += str.substring(i*40,(i+1)*40)+'<br>';
        }
    }else{
        msg=str;
    }
    return msg;
}

// 80글자 이상 줄바꿈
function lineBreakStr2(str){
    str = str+'';
    var strLength = str.length;
    var res = 0;
    var msg = '';
    if(strLength>80){
        res = Math.ceil(strLength/80);
        for(var i=0; i<res; i++){
            msg += str.substring(i*80,(i+1)*80)+'<br>';
        }
    }else{
        msg=str;
    }
    return msg;
}

//파일 다운로드
function fileDownload(path, name) {
    if(!path || !name ) {

    }else{
        $.ajax({
            url: '/download/fileCheck.ajax?obj=' + encodeURIComponent(path)+ '&fileName=' + encodeURIComponent(name)
        }).done(function(){

        });
    }
}

function downloadArray(filePathList, fileNameList) {
    for (var i = 0; i < filePathList.length; i++) {
        fileDownload(filePathList[i], fileNameList[i]);
        sleep(500);
    }
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

//onkeyUp에 주면 숫자+콤마. (한글제거)
function numCommaKeyUp(){
    var tar=$(event.target);
    $(tar).val(comma($(tar).val()));
}

//0 처리
function onZero(){
    var tar=$(event.target);
    if($(tar).val() == 0) $(tar).val('');
}
function initForm(id) {
    $('#'+id)[0].reset();
    $('.select2-hidden-accessible').trigger('change');
}
/** 숫자만입력 (콤마 x) */
function onlyNumber() {
    var tar=$(event.target);
    var str=($(tar).val()).replace(/[^0-9.]/gi,'');
    $(tar).val(str);
}

/** 숫자만입력 (콤마, 점 x) */
function onlyNumberNoDot() {
    var tar=$(event.target);
    var str=($(tar).val()).replace(/[^0-9]/gi,'');
    $(tar).val(str);
}

function inputPhone() {
    var tar=$(event.target);
    var str=($(tar).val()).replace(/[^0-9-]/gi,'');
    $(tar).val(str);
}

function telFormat() {
    var tar = $(event.target);
    var str = tar.val().replace(/[^0-9]/g, '')
                       .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
    tar.val(str);
}

function listNullCheck(param, count) {
    var list = [];
    if (param == null) {
        for (var i = 0; i < count; i++) {
            list.push('');
        }
        return list;
    } else {
        for (var i = 0; i < count; i++) {
            if (param[i] == null || param[i] == 'undefined') {
                param[i] = '';
            }
        }
        return param;
    }
}

/**숫자로 입력되어야하는 input들 처리*/
function inputOnlyNumber(el) {
    var value = comma(el.val());
    el.val(value);
}

/**비율 퍼센트형식*/
function percentFormat() {
    var tar = $(event.target);
    var str = tar.val().replace(/[^0-9.]/gi,'')+'%';
    if (str.substring(0, 2) != '0.' && str.charAt(1) == '0') {
        str = '0.' + str.slice(1);
    }

    tar.val(str);
    tar.focus().setCursorPosition(str.length - 1);
}

function textPerRemovePercent() {
    $.each($('.text-per'), function (index, value) {
        var val = $(this).val().replace('%', '');
        $(this).val(val);
    })
}

function textPer() {
    $.each($('.text-per'), function (index, value) {
        var val = $(this).val() + '%';
        if (val != '%') {
            $(this).val(val);
        }
    })
}

function textRightRemoveComma() {
    $.each($('.text-right'), function (index, value) {
        var val = $(this).val().replace(/,/gi, '');
        $(this).val(val);
    })
}

function textRightRemovePercent() {
    $.each($('.text-right'), function (index, value) {
        var val = $(this).val().replace('%', '');
        $(this).val(val);
    })
}

function textRightComma() {
    $.each($('.text-right'), function (index, value) {
        if($(this).val().indexOf('%') >-1) return;
        var val = comma($(this).val());
        $(this).val(val);
    })
}

function goodsBarcode(el) {
    var value = el.val().replace(/[^A-Z0-9]/gi, "")
    el.val(value);
}

function initForm(id) {
    $('#'+id)[0].reset();
    $('#'+id).find($('.select2-hidden-accessible')).trigger('change');
    $('#'+id+' input').trigger('reset');
}

function bookMark(sm){
    var sm_idx=sm;
    var url=window.location.pathname;
    $.ajax({
        url:'/bookMark'
        ,type:'GET'
        ,data:{'sm_idx':sm_idx,'url':url}
    }).done(function(res){
        $('#books').load(url+' #books');
        $('#markers').replaceWith(res);
    });
}

function getToday(){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
       $('#books').load(url+' #books');
}


if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

/** 다음 주소 api사용 */
function daum_address_common(flag) {
    new daum.Postcode({
        oncomplete: function(data) {
            var addrArr = daumAddressArr(data);

            $('input[name=' + flag + 'post]').val(addrArr[0]);
            $('input[name=' + flag + 'addr1]').val(addrArr[1]);
            $('input[name=' + flag + 'addr2]').val(addrArr[2]);
            $('input[name=' + flag + 'addr3]').val(addrArr[3] + '[' + addrArr[4] + ']');
            $('input[name=' + flag + 'address]').val(
                '(' + addrArr[0] + ') ' + addrArr[1] + ' ' + addrArr[2] + ' ' + addrArr[3] + '[' + addrArr[4] + ']'
            )
        }
    }).open();
}


//주소 배열 반환. post, addr1 , addr2, addr3
function daumAddressArr(data){
    var addrArr = new Array(5);

    var sido = data.sido;
    var sigungu = data.sigungu;
    if(sigungu==''){
        sigungu=data.bname1;
    }
    var roadname = data.roadname;
    if(roadname==''){
        roadname=data.bname;
    }

    var roadnameExtract=data.roadAddress.substring(data.roadAddress.indexOf(sigungu)+sigungu.length)
    roadnameExtract=roadnameExtract.substring(0,roadnameExtract.indexOf(roadname)+roadname.length).trim()
    roadname=roadnameExtract

    var roadNum = data.roadAddress;
    roadNum=roadNum.substring(roadNum.indexOf(roadname)+roadname.length).trim();
    roadname = roadname + ' ' + roadNum;

    var jibun = data.jibunAddress;
    if (jibun == '') {
        jibun = data.autoJibunAddress;
    }
    jibun = jibun.replace(sido, '').replace(sigungu, '').replace(data.bname1, '');

    roadname=roadname.trim();
    jibun = jibun.trim();

    addrArr[0] = data.zonecode;
    addrArr[1] = sido;
    addrArr[2] = sigungu;
    addrArr[3] = roadname;
    addrArr[4] = jibun;

    return addrArr;
}

//주소 배열 반환. post, addr1 , addr2, addr3
function daumAddrReturn(data){
    var addrArr = new Array(4);

    var sido = data.sido;
    var sigungu = data.sigungu;
    if(sigungu==''){
        sigungu=data.bname1;
    }
    var roadname;
    // 사용자가 도로명주소, 지번주소 중 어떤 것을 클릭했는지에 따라
    if (data.userSelectedType === 'R') {
        roadname = data.roadname;
        if(roadname==''){
            roadname=data.bname;
        }

        var roadnameExtract=data.roadAddress.substring(data.roadAddress.indexOf(sigungu)+sigungu.length)
        roadnameExtract=roadnameExtract.substring(0,roadnameExtract.indexOf(roadname)+roadname.length).trim()
        roadname=roadnameExtract

        var roadNum = data.roadAddress;
        roadNum=roadNum.substring(roadNum.indexOf(roadname)+roadname.length).trim();

        var extraAddr ='';
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
        }

        if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
        }

        if (extraAddr !== '') {
            extraAddr = '(' + extraAddr + ')';
        }
        roadname = roadname +' '+roadNum+ extraAddr;
    } else {
        roadname = data.jibunAddress;
        roadname = roadname.replace(sido, '');
        roadname = roadname.replace(sigungu, '');
    }
    roadname=roadname.trim();

    addrArr[0] = data.zonecode;
    addrArr[1] = sido+' '+sigungu+' '+roadname ;

    return addrArr;
}

/**사용자 내정보 설정*/
function popUserMyInfo() {
    var userInfo = window.open('/user/my', 'userInfo', 'width=785, height=700, left='+screenX+', top='+screenY+',scrollbars=yes, resizable=yes');
    userInfo.focus();
}

/**선택한 값 다른 input창에 보이도록 하기
 * @param sourceId 변화 기준 태그 Id
 * @param target 값 표시할 input target selector
 * */
function copySelectedValue(sourceId, target) {
    $('#'+sourceId).on('change',function(){
        $(target).val($('#'+sourceId).val());
    });
}
function copySelectedText(sourceId, target) {
    $('#'+sourceId).on('change',function(){
        $(target).val($('#'+sourceId +' option:selected').text());
    });
}
/** input type="file" 에 onChange로 적용*/
function maxFileSizeCheck(obj){
    if(obj.files && obj.files[0]){
        var maxSize = 1024 * 1024 * 10;
        var fileSize = obj.files[0].size;

        if(fileSize > maxSize){
            alert('첨부파일은 10MB 이내로 등록 가능합니다.');
            $(obj).val('');
            return false;
        }
    }
}

/**쇼핑몰 바로가기(새탭)*/
function shopNewTab() {
    alert('쇼핑몰 외부 링크가 제거되었습니다.');
}
/**배치 바로가기(새탭)*/
function batchNewTab() {
    alert('외부 링크가 제거되었습니다.');
}


/**팝업공통*/
function popup(url, id, width, height){
    var focusPopup = window.open(url, id, 'width='+width+', height='+height+', left='+screenX+', top='+screenY+',scrollbars=yes, resizable=yes');
    focusPopup.focus();
}

/**퀵검색*/
var quickMoveState = {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
};

function quickSearch() {
    return quickMoveSearchPage(1);
}

function quickMoveSearchPage(page) {
    var form = document.querySelector('.fast-move #quickSearchForm') || document.querySelector('#quickSearchForm');
    if (!form) return false;

    var quickValue = (form.querySelector('[name="quick_value"]')?.value || '').trim();
    if (!quickValue) {
        alert('검색어를 입력해 주세요.');
        return false;
    }

    quickMoveState.page = Math.max(Number(page) || 1, 1);
    quickMoveState.pageSize = quickMoveState.pageSize || 10;

    var params = new URLSearchParams(new FormData(form));
    params.set('page', quickMoveState.page);
    params.set('pageSize', quickMoveState.pageSize);

    $.ajax({
        url:'/orders/quickMoveSearch.ajax'
        ,type:'post'
        ,data:params.toString()
    }).done(function(res){
        renderQuickMoveResult(res?.data?.list || [], res?.data || {});
        openModal('quickMoveModal');
    });

    return false;
}

function quickMovePagePrev() {
    if (quickMoveState.page <= 1) return false;
    return quickMoveSearchPage(quickMoveState.page - 1);
}

function quickMovePageNext() {
    if (quickMoveState.page >= quickMoveState.totalPages) return false;
    return quickMoveSearchPage(quickMoveState.page + 1);
}

function quickMoveText(value) {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
}

function quickMoveEscape(value) {
    return quickMoveText(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function quickMoveLink(label, type, idx, detailType) {
    if (idx === null || idx === undefined || idx === '') {
        return quickMoveEscape(label);
    }
    var safeDetailType = detailType === null || detailType === undefined ? '' : quickMoveEscape(detailType);
    return '<a href="javascript:void(0);" class="btn-link" onclick="quickMoveOpen(\'' + type + '\', \'' + quickMoveEscape(idx) + '\', \'' + safeDetailType + '\')">' + quickMoveEscape(label) + '</a>';
}

function renderQuickMoveResult(list, meta) {
    var body = document.getElementById('quickMoveResultBody');
    var summary = document.getElementById('quickMoveSummary');
    var pagination = document.getElementById('quickMovePagination');
    var pageInfo = document.getElementById('quickMovePageInfo');
    var prevBtn = document.getElementById('quickMovePrevBtn');
    var nextBtn = document.getElementById('quickMoveNextBtn');
    if (!body) return;

    meta = meta || {};
    quickMoveState.page = Number(meta.page || quickMoveState.page || 1);
    quickMoveState.pageSize = Number(meta.pageSize || quickMoveState.pageSize || 10);
    quickMoveState.totalCount = Number(meta.totalCount || 0);
    quickMoveState.totalPages = Math.max(Math.ceil(quickMoveState.totalCount / quickMoveState.pageSize), 1);

    if (summary) {
        summary.textContent = '검색 결과 ' + quickMoveState.totalCount + '건';
    }

    if (pagination) {
        pagination.style.display = quickMoveState.totalCount > quickMoveState.pageSize ? '' : 'none';
    }
    if (pageInfo) {
        pageInfo.textContent = quickMoveState.page + ' / ' + quickMoveState.totalPages;
    }
    if (prevBtn) {
        prevBtn.disabled = quickMoveState.page <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = quickMoveState.page >= quickMoveState.totalPages;
    }

    if (!list.length) {
        body.innerHTML = '<tr><td colspan="8" class="text-center">검색 결과가 없습니다.</td></tr>';
        return;
    }

    body.innerHTML = list.map(function(item) {
        var mIdx = item.M_IDX;
        var estIdx = item.EST_IDX;
        var conIdx = item.CON_IDX;
        var estimateDetailType = item.EST_DETAIL_TYPE || 'headOffice';
        var contractDetailType = item.CONTRACT_DETAIL_TYPE || 'direct';

        return '<tr>'
            + '<td>' + quickMoveLink(item.M_NUM, 'bonds', mIdx) + '</td>'
            + '<td>' + quickMoveEscape(item.QUICK_MOVE_TYPE) + '</td>'
            + '<td>' + quickMoveEscape(item.M_CT_NAME) + '</td>'
            + '<td>' + quickMoveLink(item.CON_TITLE, 'contract', conIdx, contractDetailType) + '</td>'
            + '<td>' + quickMoveLink(item.EST_CODE, 'estimate', estIdx, estimateDetailType) + '</td>'
            + '<td>' + quickMoveLink(item.EST_TITLE, 'estimate', estIdx, estimateDetailType) + '</td>'
            + '<td>' + quickMoveLink('열기', 'payment', mIdx) + '</td>'
            + '<td>' + quickMoveLink('열기', 'accounting', mIdx) + '</td>'
            + '</tr>';
    }).join('');
}

function quickMoveOpen(type, idx, detailType) {
    var target = String(idx || '');
    if (!target) return false;

    if (type === 'bonds') {
        window.open('/bonds/bondsDetail/' + target, '_blank');
    } else if (type === 'estimate') {
        var estimateType = detailType === 'distribution' ? 'distribution' : 'headOffice';
        window.open('/estimate/' + estimateType + '/' + target, '_blank');
    } else if (type === 'contract') {
        var contractType = detailType === 'channel' ? 'channel' : 'direct';
        popup('/contract/' + contractType + '/' + target, 'contractDetail' + target, screen.width, screen.height);
    } else if (type === 'payment') {
        popup('/bonds/paymentScheduler/' + target, 'paymentScheduler' + target, screen.width, screen.height);
    } else if (type === 'accounting') {
        popup('/bonds/bondsScheduler/' + target, 'bondsScheduler' + target, screen.width, screen.height);
    }

    closeModal('quickMoveModal');
    return false;
}

function quickMoveCell(value) {
    return '<span style="display:block;text-align:center;">' + quickMoveEscape(value) + '</span>';
}

function quickMoveLink(label, type, idx, detailType) {
    if (idx === null || idx === undefined || idx === '') {
        return quickMoveCell(label);
    }
    var safeDetailType = detailType === null || detailType === undefined ? '' : quickMoveEscape(detailType);
    return '<a href="javascript:void(0);" class="btn-link" style="display:block;text-align:center;" onclick="quickMoveOpen(\'' + type + '\', \'' + quickMoveEscape(idx) + '\', \'' + safeDetailType + '\')">' + quickMoveEscape(label) + '</a>';
}

function quickMoveColumnLayout() {
    var renderer = { type: 'TemplateRenderer' };

    return [
        {
            headerText: '\ub80c\ud0c8\ucc44\uad8c\ubc88\ud638',
            dataField: 'M_NUM',
            width: 145,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink(value, 'bonds', item.M_IDX);
            }
        },
        {
            headerText: '\uad6c\ubd84',
            dataField: 'QUICK_MOVE_TYPE',
            width: 90,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value) {
                return quickMoveCell(value);
            }
        },
        {
            headerText: '\uacc4\uc57d\uace0\uac1d',
            dataField: 'M_CT_NAME',
            width: 130,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value) {
                return quickMoveCell(value);
            }
        },
        {
            headerText: '\uacc4\uc57d\uba85',
            dataField: 'CON_TITLE',
            width: 230,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink(value, 'contract', item.CON_IDX, item.CONTRACT_DETAIL_TYPE || 'direct');
            }
        },
        {
            headerText: '\uacac\uc801\ubc88\ud638',
            dataField: 'EST_CODE',
            width: 145,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink(value, 'estimate', item.EST_IDX, item.EST_DETAIL_TYPE || 'headOffice');
            }
        },
        {
            headerText: '\uacac\uc801\uba85',
            dataField: 'EST_TITLE',
            width: 230,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink(value, 'estimate', item.EST_IDX, item.EST_DETAIL_TYPE || 'headOffice');
            }
        },
        {
            headerText: '\uc218\ub0a9\uc2a4\ucf00\uc904\ub7ec',
            dataField: 'PAYMENT_LINK',
            width: 130,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink('\uc5f4\uae30', 'payment', item.M_IDX);
            }
        },
        {
            headerText: '\ud68c\uacc4\uc2a4\ucf00\uc904\ub7ec',
            dataField: 'ACCOUNTING_LINK',
            width: 130,
            renderer: renderer,
            labelFunction: function(rowIndex, columnIndex, value, headerText, item) {
                return quickMoveLink('\uc5f4\uae30', 'accounting', item.M_IDX);
            }
        }
    ];
}

function quickMoveEnsureGrid() {
    if (!window.AUIGrid) return null;
    if (quickMoveState.gridId && (!AUIGrid.isCreated || AUIGrid.isCreated(quickMoveState.gridId))) {
        return quickMoveState.gridId;
    }

    quickMoveState.gridId = AUIGrid.create('#quickMoveResultGrid', quickMoveColumnLayout(), {
        showRowNumColumn: true,
        showRowCheckColumn: false,
        selectionMode: 'singleRow',
        hoverMode: 'singleRow',
        usePaging: true,
        pageRowCount: 10,
        enableFilter: true,
        enableSorting: true,
        enableMovingColumn: true,
        softRemoveRowMode: false,
        headerHeight: 38,
        rowHeight: 40,
        height: '100%'
    });

    return quickMoveState.gridId;
}

function renderQuickMoveResult(list) {
    var rows = Array.isArray(list) ? list : [];
    var summary = document.getElementById('quickMoveSummary');
    var grid = quickMoveEnsureGrid();

    if (summary) {
        summary.textContent = '\uac80\uc0c9 \uacb0\uacfc ' + rows.length + '\uac74';
    }

    if (!grid) {
        alert('AUIGrid\ub97c \ub85c\ub4dc\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.');
        return;
    }

    AUIGrid.setGridData(grid, rows);
    setTimeout(function() {
        AUIGrid.resize(grid);
    }, 50);
}

function quickSearch() {
    var form = document.querySelector('.fast-move #quickSearchForm') || document.querySelector('#quickSearchForm');
    if (!form) return false;

    var quickValue = (form.querySelector('[name="quick_value"]')?.value || '').trim();
    if (!quickValue) {
        alert('\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.');
        return false;
    }

    $.ajax({
        url: '/orders/quickMoveSearch.ajax',
        type: 'post',
        data: new URLSearchParams(new FormData(form)).toString()
    }).done(function(res) {
        openModal('quickMoveModal');
        renderQuickMoveResult(res?.data?.list || []);
    });

    return false;
}

function quickMovePagePrev() {
    return false;
}

function quickMovePageNext() {
    return false;
}

/**퀵검색*/
function quickSearch2() {
    var type = $('select[name="quick_condition2"]').val();
    var quickVal = $('input[name="quick_value2"]').val();
    if(type == 'shopProduct') {
        popup('/shopProduct/'+quickVal,'_blank',1350, 800);
    }else if(type == 'product'){
    }else{
        $.ajax({
            url:'/orders/quickSearch2.ajax'
            ,type:'post'
            ,data:{'GS_REAL_CODE':quickVal}
        }).done(function(res) {
            popup('/product/goodsStock/' + res.data.gsIdx, '_blank', 1350, 800);
        })
    }

}

/**퀵검색 엔터press*/
$(document).on('submit', '#quickSearchForm', function(event) {
    event.preventDefault();
    quickSearch();
});

$(document).on('keypress', '#quickSearchForm', function(event){
    if(event.keyCode==13){quickSearch();return false;}
});

/** 코드 대량 검색 */
function searchValue(obj, tag) {
    var objAry = $(obj).val().split(' ');
    if (objAry.length > 1) {
        for (var i = 0; i < objAry.length; i++) {
            $(obj).after(
                '<input type="hidden" name="'+tag+'" value="'+objAry[i]+'">'
            );
        }

        $.each($('input[name='+tag+']'), function (index, value) {
           if ($(value).val() == '') {
               $(value).remove();
           }
        });

        $(obj).val('');
        searchBtn();
    }
}

/**사용쿠폰정보*/
function cgpInfo(cpIdx) {
    var focusPopup = window.open('/coupon/detail/info?idx=' + cpIdx, 'couponInfo', 'width=1000, height=800, left=' + screenX + ', top=' + screenY + ',scrollbars=yes, resizable=yes');
    focusPopup.focus();
}

/**출고송장 조회*/
function openSweetTracker(dnNum){
    var focusPopup = window.open('/delivery/sweetTracker?dnNum='+dnNum,'sweetTracker', 'width=600, height=800, left='+screenX+', top='+screenY+',scrollbars=yes, resizable=yes');
    focusPopup.focus();
}

/**상품 shop링크*/
function shopProductNewTab(spIdx) {
    popup('/shopProduct/'+spIdx, '_blank', 1350, 800);
}

/** 파일 업로드 이미지 미리보기 */
function setThumbnail(event) {
    document.querySelector('#files-thumb').innerHTML = '';
    for (var image of event.target.files) {

        var maxSize = 1024 * 1024 * 30;
        var fileSize = image.size;

        if(fileSize > maxSize){
            alert('첨부이미지는 30MB 이내로 등록 가능합니다');
            event.target.value = '';
            document.querySelector('#files-thumb').innerHTML = '';
            return false;
        }

        // 확장자 체크
        var file_name = image.name;
        var last_idx = file_name.lastIndexOf('.');
        var alert_file = false;
        if (last_idx === -1) {
            alert_file = true;
        } else {
            var file_exe = file_name.substring(last_idx).toUpperCase();
            if(file_exe == '.JPG' || file_exe == '.JPEG' || file_exe == '.PNG' || file_exe == '.GIF'){

            } else {
                alert_file = true;
            }
        }
        if (alert_file) {
            alert('파일 확장자를 확인해주세요.');
            event.target.value = '';
            document.querySelector('#files-thumb').innerHTML = '';
            return false;
        }
        // 확장자 체크 end

        var reader = new FileReader();

        reader.onload = function(event) {
            //img div
            var imgDiv = document.createElement("div");
            imgDiv.setAttribute("class", "col-sm-12 col-md-3");
            // img
            var img = document.createElement("img");
            img.setAttribute("src", event.target.result);
            img.setAttribute("class","card-img img-fluid");
            imgDiv.appendChild(img);
            document.querySelector("#files-thumb").appendChild(imgDiv);
        };
        reader.readAsDataURL(image);
    }
}

/** 파일 업로드 이미지 미리보기 */
function setThumbnail3(event) {

    document.querySelector('#bigImg').innerHTML = '';
    for (var image of event.target.files) {

        var maxSize = 1024 * 1024 * 30;
        var fileSize = image.size;

        if(fileSize > maxSize){
            alert('첨부이미지는 30MB 이내로 등록 가능합니다');
            event.target.value = '';
            document.querySelector('#bigImg').innerHTML = '';
            return false;
        }

        // 확장자 체크
        var file_name = image.name;
        var last_idx = file_name.lastIndexOf('.');
        var alert_file = false;
        var isPdf = false;
        var isAvi = false;
        var isAnother = false;

        if (last_idx === -1) {
            alert_file = true;
        } else {
            var file_exe = file_name.substring(last_idx).toUpperCase();
            if(file_exe == '.JPG' || file_exe == '.JPEG' || file_exe == '.PNG' || file_exe == '.GIF'
                || file_exe == '.MP4' || file_exe == '.PDF'|| file_exe == '.TIF' || file_exe == '.ZIP'|| file_exe == '.WAV'|| file_exe == '.AVI'){

                if(file_exe == '.PDF') isPdf = true;
                if(file_exe == '.MP4' || file_exe == '.WAV' || file_exe == '.AVI') isAvi = true;
                if(file_exe == '.TIF' || file_exe == '.ZIP') isAnother = true;

            } else {
                alert_file = true;
            }
        }
        if (alert_file) {
            alert('파일 확장자를 확인해주세요.');
            event.target.value = '';
            document.querySelector('#bigImg').innerHTML = '';
            return false;
        }
        // 확장자 체크 end

        var reader = new FileReader();

        reader.onload = function(event) {

            var img = '<img style="width: 100%;height: 100%;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
            if(isPdf) img = '<iframe style="width: 575px;height: 800px;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
            if(isAvi) img = '<video style="width: 100%;height: 100%;object-fit: cover;object-position: center;" src="'+event.target.result+'">';
            if(isAnother) img = '';

            $('#bigImg').html(img);
        };
        reader.readAsDataURL(image);
    }

    $('#changeType').val('1');
}

/** input[type=file] onchange 이벤트*/
function fileExeCheck(obj) {
    var files = obj.files
    if (files.length > 0) {
        for (var file of files) {
            var file_name = file.name;
            var last_idx = file_name.lastIndexOf('.');
            if (last_idx === -1) {
                alert('파일 확장자를 확인해주세요.');
                fileRemove(obj.files[0].name);
                obj.value = '';
                return false;
            } else {
                var file_exe = file_name.substring(last_idx+1).toUpperCase();
                $.ajax({
                    url:'/checkExe.ajax'
                    ,type:'post'
                    ,data:{extension:file_exe}
                    ,async: false
                }).done(function(res) {
                    if (!res) {
                        alert('파일 확장자를 확인해주세요.');
                        fileRemove(obj.files[0].name);
                        obj.value = '';
                        return false;
                    }
                });
            }
        }
    }
}

function clearInput(obj) {
    $(obj).parent().parent().find('input').val('');
}

function clearInputBigImg(obj) {
    $(obj).parent().parent().find('input').val('');
    $('#bigImg').html('');
    $('#changeType').val('');
}

function fileRemove(fileName) {
    $.each($('p.name'), function (index, value) {
        if ($(value).text() == fileName) {
            $(value).parent().remove();
            return false;
        }
    })
}



/*브라우저 변경 시 thaed 맞춤*/
function fitDatatableHead() {
    try {
        $('.dataTable:visible:not(.DTFC_Cloned)').DataTable().columns.adjust();
    } catch(e) {}
}
$(window).resize(fitDatatableHead);

/* 모달 열고 닫을때 스크롤 유무에 따른 데이터테이블 맞춤 */
$('.modal').on('shown.bs.modal', function () {
    fitDatatableHead()
});
$('.modal').on('hidden.bs.modal', function () {
    fitDatatableHead()
});

function areaSearch(form_id){
    //검색
    try{
        $('#'+form_id).on('keypress',function(event){
            if(event.keyCode==13 || event.keyCode==10){
                if(event.target.tagName == 'TEXTAREA'){
                    if(event.keyCode == 13){
                        return;
                    }
                }
                searchBtn();
            }
        });
    }catch (e){}
}
//popover init
function popoverInit(selector,str){
    var popover_yOff = 20;
    var popover_xOff = 20;

    var id = 'popover'+Math.round(Math.random()*1000000);
    $(selector).hover(function (e) {
            $("body").append("<p id='"+id+"' class='p-2 popover'>"+str+"</p>");
            $("#"+id)
                .css("position", "absolute")
                .css("top", (e.pageY - popover_yOff) + "px")
                .css("left", (e.pageX + popover_xOff) + "px");
        },

        function () {
            $("#"+id).remove();
        });

    $(selector).mousemove(function (e) {
        $("#"+id)
            .css("top", (e.pageY - popover_yOff) + "px")
            .css("left", (e.pageX + popover_xOff) + "px");
    });
}
//dt 간격맞추기
function adjustAllDatatable(){
    try{
        var table_arr = $('table');
        for(var i = 0;i<table_arr.length;i++){
            var table_id = table_arr[i].id;
            if(!!table_id){
                if($.fn.DataTable.isDataTable( '#'+table_id )){
                    $('#'+table_id).DataTable().columns.adjust();
                }
            }
        }
    }catch (e){}
}
addEventListener("load", (event) => {
    adjustAllDatatable();
});
//전화번호 포맷
function phoneFormat(phone){
    if(!phone) {
        return "";
    }
    if(phone.indexOf("*")!=-1) {
        return phone;
    }

    phone=phone.replace(/[^0-9]/gi,'');
    if(phone.indexOf("02")==0){
        if(phone.length>6){
            return phone.replace(/(02)(\d{1,4})(\d{4,})/, "$1-$2-$3");
        }else{
            return phone.replace(/(02)(\d{0,})/, "$1-$2");
        }
    }else{
        if(phone.indexOf("1")==0){
            return phone.replace(/(\d{4})(\d{1,})/, "$1-$2");
        }else{
            return phone.replace(/(\d{3})(\d{1,4})(\d{4,})/, "$1-$2-$3");
        }
    }
}
//한글만 말줄임처리(태그무시)
function ellipsisStrKor(str){
    if(!str.includes("<")) {
        if(str.length > 15) {
            str = str.substr(0, 18)+'...';
        }

        return str;
    }
    var str1 = str.replace(/[^가-힣]/g,'')
    if(str1.length > 20){
        str1 = str1.substr(0, 18) + '...';
    }
    return str1;
}

// 엑셀 내보내기(GRID Export);
function gridExcel(grid) {
    if (!AUIGrid.isAvailableLocalDownload(grid)) {
        alert("로컬 다운로드 불가능한 브라우저 입니다.");
        return false;
    }

    let today = new Date();

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();

    var exportProps = [
        {
            fileName: $('title').text() + '_' + year + '_' + month + '_' + date
        }
    ];

    AUIGrid.exportToXlsx(grid, exportProps);
}

// 엑셀 내보내기(GRID Export);
function gridExcelMulti(num) {
    if (!AUIGrid.isAvailableLocalDownload(myGridId1)) {
        alert("로컬 다운로드 불가능한 브라우저 입니다.");
        return false;
    }

    let today = new Date();

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();

    var exportProps = [
        {
            fileName: $('title').text() + '_' + year + '_' + month + '_' + date
        }
    ];

    var grids = [];
    for (var i = 2; i <= num; i++) {
        grids.push(eval('myGridId'+i))
    }

    AUIGrid.exportToXlsxMulti(myGridId1, grids, exportProps);
}

/** date1이 date2보다 작은지 비교 */
function isBeforeDate(date1, date2) {
    var con1 = date1.getFullYear() < date2.getFullYear();
    var con2 = date1.getMonth() < date2.getMonth();
    var con3 = date1.getDate() < date2.getDate();
    return con1 || !con1 && con2 || !con1 && !con2 && con3;
}

// Infinity 0으로 변환
function infinityToZero(res){
    if(!isNaN(res) && isFinite(res)){
        return res;
    }else{
        return 0;
    }
}



/********* 첨부파일 멀티 업로드 *********/
var fileNo = 0;
var filesArr = new Array();

// fileList는 첨부파일이 담길 상위 선택자 '.fileList'는 css 공통으로 쓰일거임.
function multiAddFile(obj, fileList){
    var maxFileCnt = 4; //첨부파일 최대 개수
    var attFileCnt = document.querySelectorAll(fileList + '>.filebox').length; //기존 추가된 첨부파일 개수
    var remainFileCnt = maxFileCnt - attFileCnt; //추가로 첨부가능한 개수
    var curFileCnt = obj.files.length; //현재 선택된 첨부파일 개수

    // 첨부파일 개수 확인
    if (curFileCnt > remainFileCnt) {
        alert("첨부파일은 최대 " + maxFileCnt + "개 까지 첨부 가능합니다.");
    } else {
        for (const file of obj.files) {
            // 파일 배열에 담기
            var reader = new FileReader();
            reader.onload = function () {
                filesArr.push(file);
            };
            reader.readAsDataURL(file);

            // 목록 추가
            let htmlData = '';
            htmlData += '<div id="file' + fileNo + '" class="filebox">';
            htmlData += '   <p class="name">' + file.name + '</p>';
            htmlData += '   <button type="button" class="delete" onclick="deleteFile(' + fileNo + ');"><i class="icon-file-minus" style="color:#e97968"></i></button>';
            htmlData += '</div>';
            $(fileList).append(htmlData);
            fileNo++;
        }
    }
}
/* 첨부파일 삭제 */
function deleteFile(num) {
    document.querySelector("#file"+ num).remove();
    filesArr[num].is_delete = true;
}

/********* 단일 첨부파일 *********/
function AddFile(event, fileList) {
    let fileItem = event.files;
    if (fileItem.length > 0) {
        const fileName = fileItem[0].name;
        $(fileList).text(fileName)
    } else {
        $(fileList).text('첨부된 파일 없음');
    }
}


/* 드래그 앤 드롭 또는 클릭으로 이미지 업로드 */
const dropArea = document.querySelectorAll('.drop-area');
const inputFile = document.querySelectorAll('.input-file');
const thumbView = document.querySelectorAll('.thumb-view');
const thumbDelete = document.querySelectorAll('.thumb-delete');

// 이미지 업로드 함수
function uploadImage(index) {
    return function() {
        let imgLink = URL.createObjectURL(inputFile[index].files[0]);
        let imgElement = document.createElement('img');
        imgElement.src = imgLink;
        imgElement.classList.add('input-thumb');
        imgElement.style.maxHeight = '100%';

        thumbView[index].innerHTML = '';

        thumbView[index].appendChild(imgElement);

        let button = document.createElement('button');
        button.classList.add('thumb-delete');

        thumbView[index].appendChild(button);

        button.addEventListener('click', function (event) {
            event.preventDefault();
            clearImageSelection(index)();
        });
    };
}

// 파일 입력 변경
inputFile.forEach((inputFile, index) => {
    inputFile.addEventListener('change', uploadImage(index));
});

// 드래그 오버 및 드롭 이벤트 추가
dropArea.forEach((dropArea, index) => {
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        inputFile[index].files = e.dataTransfer.files;
        uploadImage(index)();
    });
});

// 이미지 선택 해제
function clearImageSelection(index) {
    return function () {
        inputFile[index].value = '';
        thumbView[index].innerHTML =
            'Drag and drop or click here';
    };
}

/* 이미지 hover 미리보기 */
$(document).ready(function () {
    var xOffset = 150;
    var yOffset = -10;

    // 이미지 미리보기 생성 함수
    function showPreview(element, event) {
        var imageSrc = element.attr("src");
        var imageData = element.data("image");
        var addCaption = imageData ? "<br/>" + imageData : "";

        if (!imageSrc) {
            return;
        }
        $("body").append("<p id='preview' class='input-thumb-preview'><img src='" + imageSrc + "' width='100%' />" + addCaption + "</p>");
        $("#preview")
            .css({
                "left": (event.clientX - xOffset) + "px",
                "top": (event.clientY - yOffset) + "px"
            })
            .fadeIn("fast");
    }

    // 마우스 이동 시 미리보기 위치 조정 함수
    function movePreview(event) {
        $("#preview").css({
            "left": (event.clientX - xOffset) + "px",
            "top": (event.clientY - yOffset) + "px"
        });
    }

    // 미리보기 제거 함수
    function removePreview() {
        $("#preview").remove();
    }

    // 이벤트 바인딩
    $(document).on({
        mouseover: function (e) {
            showPreview($(this), e);
        },
        mousemove: function (e) {
            movePreview(e);
        },
        mouseout: function () {
            removePreview();
        }
    }, ".input-thumb");
});
/**팝업 post 전송*/
function openPopupPost(id, title, url, width, height){
    window.open('', title,'width='+width+',height='+height+',resizable=yes, scrollbars=yes');
    var frm = document.getElementById(id);
    frm.action = url
    frm.method ='post';
    frm.target = title;
    frm.submit();
}


/* 드래그 이미지 파일 */
const dragUploades = document.querySelectorAll('.dragUpload');
let dropAreaIndex = 0;

// drop-area 생성 함수
function createDropArea(targetdragUpload) {
    const dropArea = document.createElement('label');
    dropArea.classList.add('drop-area');
    dropArea.setAttribute('for', `input-file-${dropAreaIndex}`);
    dropArea.id = `drop-area-${dropAreaIndex}`;

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.classList.add('input-file');
    inputFile.id = `input-file-${dropAreaIndex}`;
    inputFile.name = 'imgJson'
    inputFile.hidden = true;

    const imgView = document.createElement('div');
    imgView.classList.add('uploadImg');
    imgView.innerHTML = `
        <img src="/assets/img/icons/upload.png" alt="Upload Icon" />
        <p>드래그 앤 드롭하거나 여기를 클릭하여 이미지를 업로드하세요.</p>
    `;

    dropArea.appendChild(inputFile);
    dropArea.appendChild(imgView);

    // 파일 업로드 처리
    inputFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) handleFileUpload(dropArea, file, targetdragUpload);
    });

    // 드래그 가능 여부 설정
    const uploadImg = dropArea.querySelector('.uploadImg');
    if (uploadImg.querySelector('img') && !uploadImg.querySelector('button')) {
        dropArea.setAttribute('draggable', 'false');
    } else {
        dropArea.setAttribute('draggable', 'true');
    }

    // 드래그 이벤트 처리
    dropArea.addEventListener('dragstart', (e) => {
        // 드래그할 대상 요소 지정
        e.dataTransfer.setData('text/plain', dropArea.id);
        dropArea.classList.add('dragging');
    });

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (dragging && dragging !== dropArea) {
            targetdragUpload.insertBefore(dragging, dropArea);
        }
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragging');

        // 드래그된 파일 가져오기
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                inputFile.files = files;
                handleFileUpload(dropArea, file, targetdragUpload);
            } else {
                alert('이미지 파일만 업로드할 수 있습니다.');
            }
        }
    });

    dropArea.addEventListener('dragend', () => {
        dropArea.classList.remove('dragging');
    });

    targetdragUpload.appendChild(dropArea);
    dropAreaIndex++; // dropArea 인덱스 증가
}

/*** 파일 업로드 처리 함수
 ***/
function handleFileUpload(dropArea, file, targetdragUpload) {
    const imgView = dropArea.querySelector('.uploadImg');
    const imgLink = URL.createObjectURL(file);

    // 배경 이미지 설정
    imgView.style.backgroundImage = `url(${imgLink})`;
    imgView.style.backgroundSize = 'contain';
    imgView.style.backgroundPosition = 'center';
    imgView.style.backgroundRepeat = 'no-repeat';
    imgView.textContent = '';
    imgView.style.border = '0';

    // 삭제 버튼 생성
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('uploadImg-delete');
    deleteButton.type = 'button';

    // 삭제 버튼 클릭 시 drop-area 삭제
    deleteButton.addEventListener('click', () => {
        dropArea.remove();
    });

    $('.uploadImg-delete').on('click',function(e) {
       $(this).parent().parent().remove();
    });

    imgView.appendChild(deleteButton);

    // 새 drop-area 추가: 이미지가 있는 drop-area만 추가
    if (!targetdragUpload.querySelector('.drop-area img')) {
        createDropArea(targetdragUpload);
    }

    // 이미지가 업로드된 후, 해당 dropArea의 draggable을 true로 설정
    dropArea.setAttribute('draggable', 'true');
}

// 초기화
dragUploades.forEach((dragUpload) => {
    createDropArea(dragUpload);
});


/*** 드래그 앤 드롭 추가제거 이벤트
 ***/
document.addEventListener('DOMContentLoaded', () => {
    const dragMoveAreas = document.querySelectorAll('.dragMove-area');

    dragMoveAreas.forEach((area) => {
        const beforeArea = area.querySelectorAll('.before-area');
        const afterArea = area.querySelectorAll('.after-area');
        const addBtn = area.querySelector('.drag-addBtn');
        const removeBtn = area.querySelector('.drag-removeBtn');
        const addBtn2 = area.querySelector('.drag-add2');
        const removeBtn2 = area.querySelector('.drag-remove2');
        const shopProductAdd = area.querySelector('.shopProductAdd');
        const goodsStock = area.querySelector('.goodsStock');

        let lastSelectedIndex = null;

        function toggleSelection(event, area) {
            const spans = Array.from(area.children);
            const current = event.target;

            // if (!current || current.tagName !== 'SPAN') return;

            if (event.shiftKey && lastSelectedIndex !== null) {
                const currentIndex = spans.indexOf(current);
                const start = Math.min(lastSelectedIndex, currentIndex);
                const end = Math.max(lastSelectedIndex, currentIndex);

                spans.slice(start, end + 1).forEach(span => span.classList.add('selected'));
            } else {
                current.classList.toggle('selected');
                lastSelectedIndex = spans.indexOf(current);
            }
        }

        function moveSelectedSpans(fromArea, toArea) {
            const selectedSpans = Array.from(fromArea.querySelectorAll('.selected'));
            selectedSpans.forEach(span => {
                span.classList.remove('selected');
                toArea.appendChild(span);
            });
        }

        function erase(fromArea) {
            const selectedSpans = Array.from(fromArea.querySelectorAll('.selected'));
            selectedSpans.forEach(span => {
                span.classList.remove('selected');
                if(span.classList.contains('group')) {
                    shopProductAdd.appendChild(span);
                }else{
                    goodsStock.appendChild(span);
                }
            });
        }

        function enableDragAndDrop(fromArea, toArea) {
            let draggedElements = [];

            fromArea.addEventListener('dragstart', (e) => {
                const selectedSpans = Array.from(fromArea.querySelectorAll('.selected'));
                if (selectedSpans.includes(e.target)) {
                    draggedElements = selectedSpans;
                } else {
                    draggedElements = [e.target];
                }

                // 임시 데이터 저장
                e.dataTransfer.setData('text/plain', 'dragging');
                e.target.classList.add('dragging');
            });

            fromArea.addEventListener('dragend', () => {
                fromArea.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            });

            toArea.addEventListener('dragover', (e) => e.preventDefault());

            toArea.addEventListener('drop', (e) => {
                e.preventDefault();
                draggedElements.forEach((span) => {
                    if(span.classList.contains('dragging')) {
                        span.classList.remove('dragging');
                        span.classList.remove('selected');
                        toArea.appendChild(span);
                    }
                });
                draggedElements = [];
            });
        }

        for( const aB of beforeArea) {
            aB.addEventListener('click', (e) => toggleSelection(e, aB));
            var cnt = 0;
            for (const aA of afterArea) {
                //aA.addEventListener('click', (e) => toggleSelection(e, aA));
                if (cnt == 0) {
                    addBtn.addEventListener('click', () => moveSelectedSpans(aB, aA));
                    removeBtn.addEventListener('click', () => erase(aA));
                    cnt++;
                } else {
                    addBtn2.addEventListener('click', () => moveSelectedSpans(aB, aA));
                    removeBtn2.addEventListener('click', () => erase(aA));
                    cnt++;
                }

                enableDragAndDrop(aB, aA);
                enableDragAndDrop(aA, aB);
            }
        }
        for (const aA of afterArea) {
            aA.addEventListener('click', (e) => toggleSelection(e, aA));
        }

    });
});



// 필수값 체크
function requestCheck(checkList) {
    var tagName = '';
    var check = true;
    $.each(checkList, function (index, obj) {
        if($(obj).next().val() == '') {
            tagName += $(obj).children().text() + ", ";
            check = false;
        }
    });

    if (!check) {
        tagName = tagName.slice(0, -2);
        alert(tagName + '은(는) 필수값입니다.');
        return false;
    }

    return true;
}

function dateDiff(_date1, _date2) {
    var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
    var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);

    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());

    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
    diff = Math.ceil(diff / (1000 * 3600 * 24));

    return diff;
}
