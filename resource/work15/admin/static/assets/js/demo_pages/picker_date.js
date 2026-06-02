/* ------------------------------------------------------------------------------
 *
 *  # Date and time pickers
 *
 *  Demo JS code for picker_date.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------
var commonDateRangeOptions = {
    opens: 'center',
    locale: {
        direction: 'ltr',
        format: 'YYYY-MM-DD',
        separator: ' ~ ',
        applyLabel: '적용',
        startLabel: '시작일:',
        endLabel: '종료일:',
        cancelLabel: '취소',
        weekLabel: '주',
        customRangeLabel: '◀ 기간 설정',
        daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        firstDay: moment.localeData().firstDayOfWeek()
    },
    alwaysShowCalendars: true,
    ranges: {
        '오늘': [moment(), moment()],
        '이번 달': [moment().startOf('month'), moment().endOf('month')],
        '6개월 전': [moment().subtract(6, 'months'), moment()],
        '1년 전': [moment().subtract(1, 'year'), moment()]
    },
    showDropdowns: true,
    autoApply: false
};

var DateTimePickers = function() {
    //
    // Setup module components
    //

    // Daterange picker
        var _componentDaterange = function() {
        if (!$().daterangepicker) {
            console.warn('Warning - daterangepicker.js is not loaded.');
            return;
        }

        // Basic initialization
        $('.daterange-basic').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(7, 'days'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        }).val('');

        $('.daterange-year').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(1, 'year'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        $('.daterange-month').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(1, 'month'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

            $('.daterange-monthAdd').daterangepicker({
                ...commonDateRangeOptions,
                startDate: moment().subtract(1, 'month'),
                endDate: moment().add(1, 'month'),
            }).on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
            });

        $('.daterange-month-notnull').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(1, 'month'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
        });

        $('.daterange-2weeks').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(14, 'days'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        $('.daterange-2Month').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(2, 'month'),
            endDate: moment(),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        $('.daterange-default-yesterday').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(1, 'days'),
            endDate: moment().subtract(1, 'days'),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        $('.daterange-default-today').daterangepicker({
            ...commonDateRangeOptions,
            startDate: moment().subtract(0, 'days'),
            endDate: moment().subtract(0, 'days'),
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        $('.daterange-basic-form').daterangepicker({
            ...commonDateRangeOptions,
            autoUpdateInput: false
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        }).on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' ~ ' + picker.endDate.format('YYYY-MM-DD'));
        });

        // Single picker
        $('.daterange-single').daterangepicker({
            ...commonDateRangeOptions,
            ranges: false,
            autoApply: true,
            singleDatePicker: true,
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        })

        $('.daterange-single-form').daterangepicker({
            ...commonDateRangeOptions,
            ranges: false,
            autoApply: true,
            singleDatePicker: true,
            autoUpdateInput: false,
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        }).on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD'));
        });

        //daterange-single 초기값 널값
        $('.daterange-singlenull').daterangepicker({
            ...commonDateRangeOptions,
            ranges: false,
            autoApply: true,
            singleDatePicker: true,
            autoUpdateInput: false,
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        }).on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD'));
        }).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
        });

        // time picker
        $('.daterange-time').daterangepicker({
            timePicker: true,
            singleDatePicker:true,
            timePicker24Hour: true,
            timePickerIncrement: 5,
            applyClass: 'btn-indigo',
            cancelClass: 'btn-outline-dark',
            locale: {
                applyLabel: '적용',
                cancelLabel: '취소',
                format: 'HH:mm'
            }
        }).on('show.daterangepicker', function (ev, picker) {
            picker.container.find(".calendar-table").hide();
        });

        // time picker
        $('.daterange-timenull').daterangepicker({
            timePicker: true,
            singleDatePicker:true,
            timePicker24Hour: true,
            autoApply : false,
            autoUpdateInput: true,
            timePickerIncrement: 5,
            applyClass: 'btn-indigo',
            cancelClass: 'btn-outline-dark',
            locale: {
                applyLabel: '적용',
                cancelLabel: '취소',
                format: 'HH:mm'
            }
        }).on('show.daterangepicker', function (ev, picker) {
            picker.container.find(".calendar-table").hide();
        });


        // Pre-defined ranges and callback
        //

        // Display date format
        $('.daterange-predefined span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + moment().format('MMMM D, YYYY'));


        //
        // Inside button
        //

        // Initialize with options
        $('.daterange-ranges').daterangepicker(
            {
                startDate: moment().subtract(29, 'days'),
                endDate: moment(),
                minDate: '01/01/2012',
                maxDate: '12/31/2019',
                dateLimit: { days: 60 },
                parentEl: '.content-inner',
                autoApply: true,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            },
            function(start, end) {
                $('.daterange-ranges span').html(start.format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + end.format('MMMM D, YYYY'));
            }
        );

        // Display date format
        $('.daterange-ranges span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + moment().format('MMMM D, YYYY'));
    };

    // Pickadate picker
    var _componentPickadate = function() {
        if (!$().pickadate) {
            console.warn('Warning - picker.js and/or picker.date.js is not loaded.');
            return;
        }

        // Basic options
        $('.pickadate').pickadate();

        // Change day names
        $('.pickadate-strings').pickadate({
            weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            showMonthsShort: true
        });

        // Button options
        $('.pickadate-buttons').pickadate({
            today: '',
            close: '',
            clear: 'Clear selection'
        });

        // Accessibility labels
        $('.pickadate-accessibility').pickadate({
            labelMonthNext: 'Go to the next month',
            labelMonthPrev: 'Go to the previous month',
            labelMonthSelect: 'Pick a month from the dropdown',
            labelYearSelect: 'Pick a year from the dropdown',
            selectMonths: true,
            selectYears: true
        });

        // Localization
        $('.pickadate-translated').pickadate({
            monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            today: 'aujourd\'hui',
            clear: 'effacer',
            formatSubmit: 'yyyy/mm/dd'
        });

        // Format options
        $('.pickadate-format').pickadate({

            // Escape any “rule” characters with an exclamation mark (!).
            format: 'You selecte!d: dddd, dd mmm, yyyy',
            formatSubmit: 'yyyy/mm/dd',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });

        // Editable input
        $('.pickadate-editable').pickadate({
            editable: true
        });

        // Dropdown selectors
        $('.pickadate-selectors').pickadate({
            selectYears: true,
            selectMonths: true
        });

        // Year selector
        $('.pickadate-year').pickadate({
            selectYears: 4
        });

        // Set first weekday
        $('.pickadate-weekday').pickadate({
            firstDay: 1
        });

        // Date limits
        $('.pickadate-limits').pickadate({
            min: [2014,3,20],
            max: [2014,7,14]
        });

        // Disable certain dates
        $('.pickadate-disable').pickadate({
            disable: [
                [2015,8,3],
                [2015,8,12],
                [2015,8,20]
            ]
        });

        // Disable date range
        $('.pickadate-disable-range').pickadate({
            disable: [
                5,
                [2013, 10, 21, 'inverted'],
                { from: [2014, 3, 15], to: [2014, 3, 25] },
                [2014, 3, 20, 'inverted'],
                { from: [2014, 3, 17], to: [2014, 3, 18], inverted: true }
            ]
        });

        // Events
        $('.pickadate-events').pickadate({
            onStart: function() {
                console.log('Hello there :)')
            },
            onRender: function() {
                console.log('Whoa.. rendered anew')
            },
            onOpen: function() {
                console.log('Opened up')
            },
            onClose: function() {
                console.log('Closed now')
            },
            onStop: function() {
                console.log('See ya.')
            },
            onSet: function(context) {
                console.log('Just set stuff:', context)
            }
        });
    };

    // Pickatime picker
    var _componentPickatime = function() {
        if (!$().pickatime) {
            console.warn('Warning - picker.js and/or picker.time.js is not loaded.');
            return;
        }

        // Default functionality
        $('.pickatime').pickatime();

        // Clear button
        $('.pickatime-clear').pickatime({
            clear: ''
        });

        // Time formats
        $('.pickatime-format').pickatime({

            // Escape any “rule” characters with an exclamation mark (!).
            format: 'T!ime selected: h:i a',
            formatLabel: '<b>h</b>:i <!i>a</!i>',
            formatSubmit: 'HH:i',
            hiddenPrefix: 'prefix__',
            hiddenSuffix: '__suffix'
        });

        // Send hidden value
        $('.pickatime-hidden').pickatime({
            formatSubmit: 'HH:i',
            hiddenName: true
        });

        // Editable input
        $('.pickatime-editable').pickatime({
            editable: true
        });

        // Time intervals
        $('.pickatime-intervals').pickatime({
            interval: 150
        });


        // Time limits
        $('.pickatime-limits').pickatime({
            min: [7,30],
            max: [14,0]
        });

        // Using integers as hours
        $('.pickatime-limits-integers').pickatime({
            disable: [
                3, 5, 7
            ]
        });

        // Disable times
        $('.pickatime-disabled').pickatime({
            disable: [
                [0,30],
                [2,0],
                [8,30],
                [9,0]
            ]
        });

        // Disabling ranges
        $('.pickatime-range').pickatime({
            disable: [
                1,
                [1, 30, 'inverted'],
                { from: [4, 30], to: [10, 30] },
                [6, 30, 'inverted'],
                { from: [8, 0], to: [9, 0], inverted: true }
            ]
        });

        // Disable all with exeption
        $('.pickatime-disableall').pickatime({
            disable: [
                true,
                3, 5, 7,
                [0,30],
                [2,0],
                [8,30],
                [9,0]
            ]
        });

        // Events
        $('.pickatime-events').pickatime({
            onStart: function() {
                console.log('Hello there :)')
            },
            onRender: function() {
                console.log('Whoa.. rendered anew')
            },
            onOpen: function() {
                console.log('Opened up')
            },
            onClose: function() {
                console.log('Closed now')
            },
            onStop: function() {
                console.log('See ya.')
            },
            onSet: function(context) {
                console.log('Just set stuff:', context)
            }
        });
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _componentDaterange();
            _componentPickadate();
            _componentPickatime();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    DateTimePickers.init();
});
