$(document).ready(function () {
    moment.locale(browserLocale);

    $('.page-title.pull-left span').text($('.page-title.pull-left span').text() + " - " + moment(activityStartDate).format("L"));
    $('[js-date]').each(function (i, el) {
        $(el).text(moment(new Date(+$(el).attr('js-date'))).format("hh:mm A"));
    });

    $('.user-activity .amcharts-autofetch').each(function (i, el) {
        var title = $(el).attr('title') ? $(el).attr('title') : "";

        $.ajax({
            method: "POST",
            url: "/User/ActivityChartData",
            data: { Id: activityId, Property: $(el).attr('attr') }
        }).done(function (data) {
            if (data.Success) {
                var extendedObj = $.extend(true, {
                    "type": "serial",
                    "theme": "light",
                    "dataProvider": data.Data,
                    "titles": [{ "text": title, "size": 15 }],
                    "marginTop": 40,
                    "marginBottom": 40,
                    "marginLeft": 20,
                    "marginRight": 0,
                    "autoMargins": false,
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0,
                        "labelsEnabled": true,
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "fillAlphas": 1,
                        "lineAlpha": 0,
                        "type": "column",
                        "valueField": "Value",
                        "fillColors": "url(#BioFadeGrad)",
                        "balloonFunction": function (dataItem) {
                            var value;
                            if (displayFormatter[$(el).attr('value-format')]) {
                                value = displayFormatter[$(el).attr('value-format')](dataItem.values.value);
                            } else {
                                value = dataItem.values.value;
                            }
                            return moment(new Date(+dataItem.category * 1000)).format("L[<br />]hh:mm a") + "<br><b><span style='font-size:14px;'>" + value + "</span></b>"
                        },
                        "labelText": " ",
                        "labelPosition": "inside",
                        "color": "#000",
                        "labelFunction": function (item) {
                            if (displayFormatter[$(el).attr('value-format')]) {
                                return displayFormatter[$(el).attr('value-format')](item.dataContext.Value);
                            } else {
                                return item.dataContext.Value;
                            }
                        }
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "Key",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 20,
                        "fontSize": 9,
                        "labelFunction": function (value) {
                            return moment(new Date(+value * 1000)).format("L[\n]hh:mm a")
                        }
                    },
                    "defs": {
                        "linearGradient": [
                            {
                                "id": "BioFadeGrad",
                                "x1": "0%",
                                "y1": "0%",
                                "x2": "0%",
                                "y2": "100%",
                                "stop": [
                                    {
                                        "offset": "0%",
                                        "style": "stop-color:rgb(173,173,173);stop-opacity:1"
                                    },
                                    {
                                        "offset": "100%",
                                        "style": "stop-color:rgb(255,255,255);stop-opacity:0"
                                    }
                                ]
                            }
                        ]
                    }

                }, window[$(el).attr('extend-obj')]);
                var chart = AmCharts.makeChart($(el).attr('id'), extendedObj);
            } else {
                $('#activity-map').text("Error loading chart data.");
            }
        }).fail(function () {
            $('#activity-map').text("Error loading chart data.");
        });
    });

    displayFormatter = {
        bpm: function (value) {
            return Math.round(value) + " bpm";
        },
        variance: function (value) {
            return value + "%";
        },
    };

    function secondsToTimeString(secondString) {
        var seconds = +secondString % 60;
        var minutes = Math.floor(+secondString / 60.0);

        if (minutes > 59) {
            minutes = minutes % 60;
            var hours = minutes / 60.0;
            return hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        } else {
            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        }
    }
});