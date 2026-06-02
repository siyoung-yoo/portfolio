/* ------------------------------------------------------------------------------
 *
 *  # Echarts - Line chart with zoom example 라인 줌
 *
 *  Demo JS code for line chart with zoom option [light theme]
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

var EchartsLinesZoomLight = function() {

    //
    // Setup module componentsㅔ
    //

    // Line chart with zoom
    var _linesZoomLightExample = function() {
        if (typeof echarts == 'undefined') {
            console.warn('Warning - echarts.min.js is not loaded.');
            return;
        }

        // Define element
        var line_zoom_element = document.getElementById('line_zoom');
        var line_zoom_element2 = document.getElementById('line_zoom2');

        //
        // Charts configuration
        //

        if (line_zoom_element) {

            // Initialize chart
            var line_zoom = echarts.init(line_zoom_element);

//            // data
//            var json_data;
//            $.ajax({
//                url:[[@{/product/main.chart}]],
//                type: 'post',
//                async:false,
//                success: function(data){
//                    json_data=data;
//                },
//                error: function(){}
//            });
//
//            var col_title = "";
//            var col_data = [];
//            var col_data_name = [];
//
//            var chart_title = new Array();
//            var chart_data = new Array();
//
//            var col = 0;
//            for(var key in json_data[0]){
//                if(col==0){
//                    col_title = key;
//                }else{
//                    col_data.push(key);
//                    col_data_name.push(key);
//                }
//                col ++ ;
//            }

//            for(var i = 0; i<col_data.length; i++){
//                chart_data[i] = {
//                    'name': col_data_name[i],
//                    'type': 'line',
//                    'smooth': true,
//                    'symbolSize': 3,
//                    'itemStyle': {
//                         normal: {
//                             borderWidth: 2
//                         }
//                     },
//                     'data': paymentCounts[i]
//                };
//                console.log('chart_data : ' + chart_data[i].data);
//            }

//            for (var i = 0; i<json_data.length; i++){
//                chart_title.push(json_data[i]["P_TYPE"]);
//                for(var j =0; j<col_data.length; j++){
//                    var col_name = col_data[j];
//                    chart_data[j] = {
//                        'name': chart_title[i],
//                        'type': 'line',
//                        'smooth': true,
//                        'symbolSize': 3,
//                        'itemStyle': {
//                             normal: {
//                                 borderWidth: 2
//                             }
//                         },
//                         'data': json_data[j][col_name]
//                    }
////                    chart_data[j].data.push(json_data[i][col_name]);
//                }
//            }


            //
            // Chart config
            //

            // Options
            line_zoom.setOption({

                // Define colors
                color: ["#009EFF", "#D64758", '#27D64D', '#D6AA1C'],

                // Global text styles
                textStyle: {
                    fontFamily: 'Noto Sans KR, sans-serif',
                    fontSize: 13
                },

                // Chart animation duration
                animationDuration: 500,

                // Setup grid
                grid: {
                    left: 35,
                    right: 75,
                    top: 35,
                    bottom: 35,
                    containLabel: true
                },

                // Add legend
                legend: {
                    data: ['컴퓨터', '스마트폰', '생활잡화'],
//                    data: col_data_name,
                    itemHeight: 5,
                    itemGap: 10
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    padding: [10, 15],
                    textStyle: {
                        fontSize: 13,
                        fontFamily: 'Noto Sans KR, sans-serif'
                    }
                },

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    name: '기간',
                    boundaryGap: false,
                    axisLabel: {
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    data: ['2022/1/17','2022/1/18','2022/1/19','2022/1/20','2022/1/23','2022/1/24','2022/1/25','2022/1/26','2022/2/3','2022/2/6','2022/2/7','2022/2/8','2022/2/9','2022/2/10','2022/2/13','2022/2/14','2022/2/15','2022/2/16','2022/2/17','2022/2/20','2022/2/21','2022/2/22','2022/2/23','2022/2/24','2022/2/27','2022/2/28','2022/3/1','2022/3/2','2022/3/3','2022/3/6','2022/3/7']
//                    data: chart_title
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    name: '건수',
                    axisLabel: {
                        formatter: '{value} ',
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['#eee']
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.01)']
                        }
                    }
                }],

                // Zoom control
                dataZoom: [
                    {
                        type: 'inside',
                        start: 80,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
                        start: 80,
                        end: 100,
                        height: 20,
                        bottom: 0,
                        borderColor: '#fff',
                        fillerColor: 'rgba(0,0,0,0.05)',
                        handleStyle: {
                            color: '#585f63'
                        }
                    }
                ],

                // Add series
                series: //chart_data
                [
                    {
                        name: '컴퓨터',
                        type: 'line',
                        smooth: true,
                        symbolSize: 5,
                        itemStyle: {
                            normal: {
                                borderWidth: 1
                            }
                        },
                        data: [152,156,479,442,654,835,465,704,643,136,791,254,688,119,948,316,612,378,707,404,485,226,754,142,965,364,887,395,838,113,662]
                    },
                    {
                        name: '스마트폰',
                        type: 'line',
                        smooth: true,
                        symbolSize: 5,
                        itemStyle: {
                            normal: {
                                borderWidth: 1
                            }
                        },
                        data: [677,907,663,137,952,408,976,772,514,102,165,343,374,744,237,662,875,462,409,259,396,744,359,618,127,596,161,574,107,914,708]
                    },
                    {
                        name: '생활잡화',
                        type: 'line',
                        smooth: true,
                        symbolSize: 5,
                        itemStyle: {
                            normal: {
                                borderWidth: 1
                            }
                        },
                        data: [606,919,108,691,424,196,328,136,754,427,544,983,547,834,452,576,343,168,462,756,344,226,511,304,648,339,655,336,605,157,864]
                    }
                ]
            });
        }

        if (line_zoom_element2) {

            // Initialize chart
            var line_zoom2 = echarts.init(line_zoom_element2);

//            // data
//            var json_data;
//            $.ajax({
//                url:[[@{/product/main.chart}]],
//                type: 'post',
//                async:false,
//                success: function(data){
//                    json_data=data;
//                },
//                error: function(){}
//            });
//
//            var col_title = "";
//            var col_data = [];
//            var col_data_name = [];
//
//            var chart_title = new Array();
//            var chart_data = new Array();
//
//            var col = 0;
//            for(var key in json_data[0]){
//                if(col==0){
//                    col_title = key;
//                }else{
//                    col_data.push(key);
//                    col_data_name.push(key);
//                }
//                col ++ ;
//            }

//            for(var i = 0; i<col_data.length; i++){
//                chart_data[i] = {
//                    'name': col_data_name[i],
//                    'type': 'line',
//                    'smooth': true,
//                    'symbolSize': 3,
//                    'itemStyle': {
//                         normal: {
//                             borderWidth: 2
//                         }
//                     },
//                     'data': paymentCounts[i]
//                };
//                console.log('chart_data : ' + chart_data[i].data);
//            }

//            for (var i = 0; i<json_data.length; i++){
//                chart_title.push(json_data[i]["P_TYPE"]);
//                for(var j =0; j<col_data.length; j++){
//                    var col_name = col_data[j];
//                    chart_data[j] = {
//                        'name': chart_title[i],
//                        'type': 'line',
//                        'smooth': true,
//                        'symbolSize': 3,
//                        'itemStyle': {
//                             normal: {
//                                 borderWidth: 2
//                             }
//                         },
//                         'data': json_data[j][col_name]
//                    }
////                    chart_data[j].data.push(json_data[i][col_name]);
//                }
//            }


            //
            // Chart config
            //

            // Options
            line_zoom2.setOption({

                // Define colors
                color: ["#D6AA1C", "#279BD6", '#27D64D', '#009EFF'],

                // Global text styles
                textStyle: {
                    fontFamily: 'Noto Sans KR, sans-serif',
                    fontSize: 13
                },

                // Chart animation duration
                animationDuration: 500,

                // Setup grid
                grid: {
                    left: 35,
                    right: 75,
                    top: 35,
                    bottom: 35,
                    containLabel: true
                },

                // Add legend
                legend: {
                    data: ['매출', '매입'],
//                    data: col_data_name,
                    itemHeight: 5,
                    itemGap: 10
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    padding: [10, 15],
                    textStyle: {
                        fontSize: 13,
                        fontFamily: 'Noto Sans KR, sans-serif'
                    }
                },

                // Horizontal axis
                xAxis: [{
                    type: 'category',
                    name: '기간',
                    boundaryGap: false,
                    axisLabel: {
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    data: ['2022/1/17','2022/1/18','2022/1/19','2022/1/20','2022/1/23','2022/1/24','2022/1/25','2022/1/26','2022/2/3','2022/2/6','2022/2/7','2022/2/8','2022/2/9','2022/2/10','2022/2/13','2022/2/14','2022/2/15','2022/2/16','2022/2/17','2022/2/20','2022/2/21','2022/2/22','2022/2/23','2022/2/24','2022/2/27','2022/2/28','2022/3/1','2022/3/2','2022/3/3','2022/3/6','2022/3/7']
//                    data: chart_title
                }],

                // Vertical axis
                yAxis: [{
                    type: 'value',
                    name: '금액(만원)',
                    axisLabel: {
                        formatter: '{value} ',
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['#eee']
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.01)']
                        }
                    }
                }],

                // Zoom control
                dataZoom: [
                    {
                        type: 'inside',
                        start: 80,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
                        start: 80,
                        end: 100,
                        height: 20,
                        bottom: 0,
                        borderColor: '#fff',
                        fillerColor: 'rgba(0,0,0,0.05)',
                        handleStyle: {
                            color: '#585f63'
                        }
                    }
                ],

                // Add series
                series: //chart_data
                [
                    {
                        name: '매출',
                        type: 'line',
                        smooth: false,
                        symbolSize: 5,
                        itemStyle: {
                            normal: {
                                borderWidth: 1
                            }
                        },
                        data: [152,156,479,442,654,835,465,704,643,136,791,254,688,119,948,316,612,378,707,404,485,226,754,142,965,364,887,395,838,113,662]
                    },
                    {
                        name: '매입',
                        type: 'line',
                        smooth: false,
                        symbolSize: 5,
                        itemStyle: {
                            normal: {
                                borderWidth: 1
                            }
                        },
                        data: [677,907,663,137,952,408,976,772,514,102,165,343,374,744,237,662,875,462,409,259,396,744,359,618,127,596,161,574,107,914,708]
                    }
                ]
            });
        }

        //
        // Resize charts
        //

        // Resize function
        var triggerChartResize = function() {
            line_zoom_element && line_zoom.resize();
            line_zoom_element2 && line_zoom2.resize();
        };

        // On window resize
        var resizeCharts;
        window.addEventListener('resize', function() {
            clearTimeout(resizeCharts);
            resizeCharts = setTimeout(function () {
                triggerChartResize();
            }, 200);
        });
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _linesZoomLightExample();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    EchartsLinesZoomLight.init();
});
