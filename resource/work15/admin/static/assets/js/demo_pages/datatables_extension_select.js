/* ------------------------------------------------------------------------------
 *
 *  # Select extension for Datatables
 *
 *  Demo JS code for datatable_extension_select.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

var DatatableSelect = function() {


    //
    // Setup module components
    //

    // Basic Datatable examples
    var _componentDatatableSelect = function() {
        if (!$().DataTable) {
            console.warn('Warning - datatables.min.js is not loaded.');
            return;
        }

        // Setting datatable defaults
        $.extend( $.fn.dataTable.defaults, {
            autoWidth: false,
            dom: '<"datatable-header"filp><"datatable-scroll"t><"datatable-footer"ip>',
            language: {
                search: '_INPUT_',
                searchPlaceholder: '결과내 재검색',
                paginate: { 'first': 'First', 'last': 'Last', 'next': '&rarr;', 'previous': '&larr;' },
                emptyTable: '데이터가 없습니다.',
                info: '_TOTAL_개의 검색결과 [ _START_ ~ _END_  ]',
                infoEmpty: '검색결과가 없습니다. ',
                infoFiltered: '(총 _MAX_개의 자료에서 재검색)',
                lengthMenu: '_MENU_',
                zeroRecords: '검색 결과가 없습니다.',
            },
        });

        // Apply custom style to select
        $.extend( $.fn.dataTableExt.oStdClasses, {
            "sLengthSelect": "custom-select"
        });


        $('.datatable-select-checkbox').DataTable({
            scrollY:        400,
            scrollCollapse: true,
            fixedHeader:    true,
            scrollX:        true,
            lengthMenu: [
                [ 10, 25, 50, -1 ],
                [ '10행', '25행', '50행', '전체' ]
            ],
            dom: '<"datatable-header"Bfip><"datatable-scroll"t><"datatable-footer">',
            buttons: {            
                buttons: [
                    {
                        extend: 'selectAll',
                        text: '전체선택',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    {
                        extend: 'selectNone',
                        text: '선택해제',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    {
                        extend: 'excelHtml5',
                        text: '엑셀',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    {
                        extend: 'pageLength',
                    }
                ]
            },
            columnDefs: [ {
                orderable: false,
                className: 'select-checkbox',
                targets:   [0]
            } ],
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [[ 3, 'asc' ]]
        });
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _componentDatatableSelect();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    DatatableSelect.init();
});
