$(document).ready(function () {
    $('.page-title.pull-left span').text($('.page-title.pull-left span').text() + " - " + moment(activityStartDate).format("L"));
    $('[js-date]').each(function (i, el) {
        $(el).text(moment(new Date(+$(el).attr('js-date'))).format("hh:mm A"));
    });

    $(".user-email-area").trumbowyg({
        btns: [
        ['formatting'],
        'btnGrp-semantic',
        ['superscript', 'subscript'],
        ['link'],
        'btnGrp-justify',
        'btnGrp-lists',
        ['horizontalRule'],
        ['removeformat']
        ]
    });

    var ChartList = [];
    var attrList = []

    $('.user-activity .amcharts-autofetch').each(function (i, el) {
        ChartList.push(el);
        attrList.push($(el).attr('attr'));
    });
    if (ChartList.length > 0 && attrList.length > 0) {
        $.ajax({
            method: "POST",
            url: "/User/ActivityChartDataBulk",
            data: { Id: activityId, Properties: attrList }
        }).done(function (data) {
            if (data.Success) {
                for (var i = 0; i < data.Data.length; i++) {
                    DisplayChartData(data.Data[i].Data, ChartList[i]);
                }
            } else {
                for (var i = 0; i < ChartList.length; i++) {
                    $(ChartList[i]).text("Error loading chart data.");
                }
            }
        }).fail(function () {
            for (var i = 0; i < ChartList.length; i++) {
                $(ChartList[i]).text("Error loading chart data.");
            }
        });
    }
    

    function DisplayChartData(data, el) {
        if (data.Success) {
            var title = $(el).attr('title') ? $(el).attr('title') : "";

            var objextExtension = window[$(el).attr('extend-obj')];
            if (objextExtension && objextExtension.DataModify) {
                objextExtension.DataModify(data.Data);
            }

            var extendedObj = $.extend(true, {
                "type": "serial",
                "theme": "light",
                "marginTop": 0,
                "marginBottom": 0,
                "marginLeft": -10,
                "marginRight": 15,
                "autoMargins": true,
                "dataProvider": data.Data,
                "titles": [{ "text": title, "size": 15 }],
                "valueAxes": [{
                    "integersOnly": true,
                    "labelFunction": function (value) {
                        if (value < 0) {
                            return "No Data";
                        }

                        if (displayFormatter[$(el).attr('value-format')]) {
                            value = displayFormatter[$(el).attr('value-format')](value);
                        }

                        return value;
                    },
                    "gridAlpha": 0,
                }],
                "graphs": [{
                    "id": "g1",
                    "balloonFunction": function (dataItem) {
                        var value = dataItem.values.value;
                        if (value < 0) {
                            return "No Data";
                        }

                        if (displayFormatter[$(el).attr('value-format')]) {
                            value = displayFormatter[$(el).attr('value-format')](dataItem.values.value);
                        }

                        return dataItem.category + "<br><b><span style='font-size:14px;'>" + value + "</span></b>"
                    },
                    "bullet": "none",
                    "lineColor": "#9B9B9B",
                    "fillColors": "url(#BioFadeGrad)",
                    "lineThickness": 2,
                    "type": "smoothedLine",
                    "valueField": "Value",
                    "fillAlphas": 1,
                    "gridAlpha": 0,
                }],
                "chartScrollbar": {
                    "graph": "g1",
                    "gridAlpha": 0,
                    "color": "#888888",
                    "scrollbarHeight": 55,
                    "backgroundAlpha": 0,
                    "selectedBackgroundAlpha": 0.1,
                    "selectedBackgroundColor": "#888888",
                    "graphFillAlpha": 0,
                    "autoGridCount": true,
                    "selectedGraphFillAlpha": 0,
                    "graphLineAlpha": 0.2,
                    "graphLineColor": "#c2c2c2",
                    "selectedGraphLineColor": "#888888",
                    "selectedGraphLineAlpha": 1
                },
                "chartCursor": {
                    "categoryBalloonDateFormat": "HH:MM:SS",
                    "cursorAlpha": 0,
                    "valueLineEnabled": true,
                    "valueLineBalloonEnabled": true,
                    "valueLineAlpha": 0.5,
                    "fullWidth": true,
                    //"selectionAlpha": 0,
                    //"selectWithoutZooming": true
                },
                "categoryField": "Key",
                "categoryAxis": {
                    "minorGridAlpha": 0,
                    "minorGridEnabled": true,
                    "gridAlpha": 0,
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
            }, objextExtension);
            AmCharts.makeChart($(el).attr('id'), extendedObj);
        } else {
            $(el).text("Error loading chart data.");
        }
    }


    var ChartSplitList = [];
    var attrSplitList = []

    $('.user-activity .amcharts-autofetch-split').each(function (i, el) {
        ChartSplitList.push(el);
        attrSplitList.push($(el).attr('attr'));
    });

    if (ChartSplitList.length > 0 && attrSplitList.length > 0) {
        $.ajax({
            method: "POST",
            url: "/User/ActivitySplitDataBulk",
            data: { Id: activityId, Properties: attrSplitList }
        }).done(function (data) {
            if (data.Success) {
                for (var i = 0; i < data.Data.length; i++) {
                    DisplaySplitData(data.Data[i].Data, ChartSplitList[i]);
                }
            } else {
                for (var i = 0; i < ChartList.length; i++) {
                    $(ChartList[i]).text("Error loading chart data.");
                }
            }
        }).fail(function () {
            for (var i = 0; i < ChartList.length; i++) {
                $(ChartList[i]).text("Error loading chart data.");
            }
        });
    }

    function DisplaySplitData(data, el)
    {
        if (data.Success) {
            var title = $(el).attr('title') ? $(el).attr('title') : "";

            var extendedObj = $.extend(true, {
                "type": "serial",
                "theme": "light",
                "marginTop": 0,
                "marginBottom": 25,
                "marginLeft": 30,
                "marginRight": 15,
                "autoMargins": true,
                "dataProvider": data.Data,
                "titles": [{ "text": title, "size": 15 }],
                "valueAxes": [{
                    "minimum": 0,
                    "labelFunction": function (value) {
                        if (displayFormatter[$(el).attr('value-format')]) {
                            value = displayFormatter[$(el).attr('value-format')](value);
                        } else {
                            value = value;
                        }
                        return value;
                    },
                    "gridAlpha": 0,
                }],
                "graphs": [{
                    "id": "g1",
                    "balloonFunction": function (dataItem) {
                        var value = dataItem.values.value;
                        if (value < 0) {
                            return "No Data";
                        }

                        if (displayFormatter[$(el).attr('value-format')]) {
                            value = displayFormatter[$(el).attr('value-format')](dataItem.values.value);
                        }

                        return dataItem.category + "<br><b><span style='font-size:14px;'>" + value + "</span></b>"
                    },
                    "labelFunction": function (dataItem) {
                        var value = dataItem.values.value;
                        if (value < 0) {
                            return "No Data";
                        }

                        if (displayFormatter[$(el).attr('value-format')]) {
                            value = displayFormatter[$(el).attr('value-format')](dataItem.values.value);
                        }

                        return value.split(" ")[0];
                    },
                    "labelPosition": "bottom",
                    "labelText": " ",
                    "bullet": "none",
                    "fillColors": "url(#BioFadeGrad)",
                    "lineThickness": 0,
                    "type": "column",
                    "valueField": "Value",
                    "fillAlphas": 1,
                }],
                "chartScrollbar": {
                    "graph": "g1",
                    "gridAlpha": 0,
                    "color": "#888888",
                    "scrollbarHeight": 55,
                    "backgroundAlpha": 0,
                    "selectedBackgroundAlpha": 0.1,
                    "selectedBackgroundColor": "#888888",
                    "graphFillAlpha": 0,
                    "autoGridCount": true,
                    "selectedGraphFillAlpha": 0,
                    "graphLineAlpha": 0.2,
                    "graphLineColor": "#c2c2c2",
                    "selectedGraphLineColor": "#888888",
                    "selectedGraphLineAlpha": 1
                },
                "chartCursor": {
                    "categoryBalloonDateFormat": "HH:MM:SS",
                    "cursorAlpha": 0,
                    "valueLineEnabled": true,
                    "valueLineBalloonEnabled": true,
                    "valueLineAlpha": 0.5,
                    "fullWidth": true,
                    //"selectionAlpha": 0,
                    //"selectWithoutZooming": true
                },
                "categoryField": "Key",
                "categoryAxis": {
                    "minorGridAlpha": 0,
                    "minorGridEnabled": true,
                    "gridAlpha": 0,
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
            ChartObjects[$(el).attr('id')] = AmCharts.makeChart($(el).attr('id'), extendedObj);
        } else {
            $(el).text("Error loading chart data.");
        }
    }

    function secondsToTimeString(secondString) {
        var seconds = +secondString % 60;
        var minutes = Math.floor(+secondString / 60.0);

        if (minutes > 59) {
            var hours = Math.floor(minutes / 60.0);
            minutes = minutes % 60;

            return hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        } else {
            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        }
    }

    displayFormatter = {
        kmh: function(value) {
            return Math.round(value * 10) / 10 + " km/h";
        },
        mih: function (value) {
            return Math.round((value * 0.621371) * 10) / 10 + " mi/h";
        },
        pacekm: function (value) {
            return secondsToTimeString(Math.floor(value * 60)) + " min/km";
        },
        pacemi: function (value) {
            return secondsToTimeString(Math.floor((value * 1.60934) * 60)) + " min/mi";
        },
        bpm: function (value) {
            return Math.round(value) + " bpm";
        },
        spm: function (value) {
            return Math.round(value) + " spm";
        },
        m: function (value) {
            return (Math.round(value * 10) / 10) + " m";
        },
        ft: function (value) {
            return (Math.round((value * 3.28084) * 10) / 10) + " ft";
        }
    };

    $.ajax({
        method: "POST",
        url: "/User/ActivityMapData",
        data: { Id: activityId}
    }).done(function (data) {
        if (data.Success) {
            var map = L.map('activity-map');

            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            var polyline = L.polyline(data.Path, { weight: 5, color: '#D83238' }).addTo(map);
            map.fitBounds(polyline.getBounds().pad(0.2));

            L.circleMarker(data.Start, { radius: 10, color: '#21E800', fillOpacity: 1 }).addTo(map);
            L.circleMarker(data.End, { radius: 10, color: '#D83238', fillOpacity: 1 }).addTo(map);
        } else {
            $('#activity-map').text("Error loading map data.");
        }
    }).fail(function () {
        $('#activity-map').text("Error loading map data.");
    });

    $.ajax({
        method: "POST",
        url: "/User/ActivityChartData",
        data: { Id: activityId, Property: 'BPMZones' }
    }).done(function (data) {
        if (data.Success) {
            var chart = AmCharts.makeChart("activity-bpm-zones", {
                "type": "serial",
                "theme": "light",
                "dataProvider": data.Data,
                "titles": [{ "text": "Heart Rate Zones", "size": 15 }],
                "marginTop": 40,
                "marginBottom": 40,
                "marginLeft": 0,
                "marginRight": 0,
                "autoMargins": false,
                "valueAxes": [{
                    "gridColor": "#FFFFFF",
                    "gridAlpha": 0.2,
                    "dashLength": 0,
                    "labelsEnabled": false,
                    "gridThickness": 0,
                    "axisThickness": 0
                }],
                "gridAboveGraphs": true,
                "startDuration": 1,
                "graphs": [{
                    "fillAlphas": 1,
                    "lineAlpha": 0,
                    "type": "column",
                    "valueField": "Value",
                    "fillColors": "url(#BioFadeGrad)",
                    "showBalloon": false,
                    "labelText": " ",
                    "labelPosition": "top",
                    "color": "#000",
                    "labelFunction": function(item) {
                        /**
                            * Calculate total of values across all
                            * columns in the graph
                            */
                        var total = 0;
                        for (var i = 0; i < data.Data.length; i++) {
                            total += data.Data[i][item.graph.valueField];
                        }
      
                        /**
                            * Calculate percet value of this label
                            */
                        var percent = Math.round( ( item.values.value / total ) * 1000 ) / 10;
                        return percent + "%";
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
                    "labelFunction": function (value) {
                        switch (value) {
                            case "Light":
                                return "Light\n67-121";
                            case "Fat Burn":
                                return "Fat Burn\n122-140";
                            case "Aerobic":
                                return "Aerobic\n141-158";
                            case "Threshold":
                                return "Threshold\n159-172";
                            case "Maximal":
                                return "Maximal\n173-187";
                            default:
                                return value;
                        }
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
            });
        } else {
            $('#activity-map').text("Error loading chart data.");
        }
    }).fail(function () {
        $('#activity-map').text("Error loading chart data.");
    });

    $("#speed-splits-time-measure").on('change', function () {
        var el = $(this)
        var val = el.val();
        el.prop('disabled', true);

        $.ajax({
            method: "POST",
            url: "/User/ActivitySplitData",
            data: { Id: activityId, Property: 'SpeedTime', SplitModifier: val }
        }).done(function (data) {
            ChartObjects["activity-speed-split-time"].dataProvider = data.Data;
            ChartObjects["activity-speed-split-time"].validateData();
        }).fail(function () {
            $('#activity-speed-split-time').text("Error loading chart data.");
        }).always(function () {
            el.prop('disabled', false);
        });
    });

    $("#speed-splits-distance-measure").on('change', function () {
        var el = $(this)
        var val = el.val();
        el.prop('disabled', true);

        $.ajax({
            method: "POST",
            url: "/User/ActivitySplitData",
            data: { Id: activityId, Property: 'SpeedDistance', SplitModifier: val }
        }).done(function (data) {
            ChartObjects["activity-speed-split-distance"].dataProvider = data.Data;
            ChartObjects["activity-speed-split-distance"].validateData();
        }).fail(function () {
            $('#activity-speed-split-distance').text("Error loading chart data.");
        }).always(function () {
            el.prop('disabled', false);
        });
    });

    $("#pace-splits-time-measure").on('change', function () {
        var el = $(this)
        var val = el.val();
        el.prop('disabled', true);

        $.ajax({
            method: "POST",
            url: "/User/ActivitySplitData",
            data: { Id: activityId, Property: 'PaceTime', SplitModifier: val }
        }).done(function (data) {
            ChartObjects["activity-pace-split-time"].dataProvider = data.Data;
            ChartObjects["activity-pace-split-time"].validateData();
        }).fail(function () {
            $('#activity-pace-split-time').text("Error loading chart data.");
        }).always(function () {
            el.prop('disabled', false);
        });
    });

    $("#pace-splits-distance-measure").on('change', function () {
        var el = $(this)
        var val = el.val();
        el.prop('disabled', true);

        $.ajax({
            method: "POST",
            url: "/User/ActivitySplitData",
            data: { Id: activityId, Property: 'PaceDistance', SplitModifier: val }
        }).done(function (data) {
            ChartObjects["activity-pace-split-distance"].dataProvider = data.Data;
            ChartObjects["activity-pace-split-distance"].validateData();
        }).fail(function () {
            $('#activity-pace-split-distance').text("Error loading chart data.");
        }).always(function() {
            el.prop('disabled', false);
        });
    });

    $('#user-email-send').on('click', function () {
        var userId = ContextData.UserId;
        var message = $('.user-email-area').val();
        var subject = $('#user-email-subject').val();
        $.ajax({
            method: "POST",
            url: "/User/SendEmail",
            data: { userId: userId, message: message, subject: subject }
        }).done(function (data) {
            $('#user-email-dialog').modal('hide');
            $('.user-email-area').trumbowyg('html', "");
            if (data.success) {
                ShowModal(smallModal, "Success", 'Email has been sent');
            } else {
                ShowModal(smallModal, "Error", 'An error occurred. (Does the user no longer exist?)');
            }
        }).fail(function () {
            $('#user-email-dialog').modal('hide');
            $('.user-email-area').trumbowyg('html', "");
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        });
    });

    $('#user-email-back').on('click', function () {
        $('#user-email-dialog').modal('hide');
        $('.user-email-area').trumbowyg('html', "");
    });
});

function EmailPopup() {
    $('#user-email-dialog').modal('show');
}

var ChartObjects = {};

var speedSplitDisplayState = "hide";
function ToggleSpeedSplitsDisplay() {
    switch (speedSplitDisplayState) {
        case "hide":
            $("#speed-splits-toggle").text("Hide Splits");

            $("#activity-speed-graph").hide();
            $("#speed-split-graph-holder").show();
            $("#speed-splits-option-holder").show();
            speedSplitDisplayState = "show";
            break;
        case "show":
            $("#speed-splits-toggle").text("Show Splits");

            $("#activity-speed-graph").show();
            $("#speed-split-graph-holder").hide();
            $("#speed-splits-option-holder").hide();
            speedSplitDisplayState = "hide";
            break;
    }
}

var speedSplitTypeState = "distance";
function ToggleSpeedSplitsType() {
    switch (speedSplitTypeState) {
        case "time":
            $("#speed-splits-type").text("Switch to Time");

            $("#activity-speed-split-time").hide();
            $("#activity-speed-split-distance").show();
            $("#speed-splits-time-measure").hide();
            $("#speed-splits-distance-measure").show();
            speedSplitTypeState = "distance";
            break;
        case "distance":
            $("#speed-splits-type").text("Switch to Distance");

            $("#activity-speed-split-time").show();
            $("#activity-speed-split-distance").hide();
            $("#speed-splits-time-measure").show();
            $("#speed-splits-distance-measure").hide();
            speedSplitTypeState = "time";
            break;
    }
}

var paceSplitDisplayState = "show";
function TogglePaceSplitsDisplay() {
    switch (paceSplitDisplayState) {
        case "hide":
            $("#pace-splits-toggle").text("Hide Splits");

            $("#activity-pace-graph").hide();
            $("#pace-split-graph-holder").show();
            $("#pace-splits-option-holder").show();
            paceSplitDisplayState = "show";
            break;
        case "show":
            $("#pace-splits-toggle").text("Show Splits");

            $("#activity-pace-graph").show();
            $("#pace-split-graph-holder").hide();
            $("#pace-splits-option-holder").hide();
            paceSplitDisplayState = "hide";
            break;
    }
}

var paceSplitTypeState = "distance";
function TogglePaceSplitsType() {
    switch (paceSplitTypeState) {
        case "time":
            $("#pace-splits-type").text("Switch to Time");

            $("#activity-pace-split-time").hide();
            $("#activity-pace-split-distance").show();
            $("#pace-splits-time-measure").hide();
            $("#pace-splits-distance-measure").show();
            paceSplitTypeState = "distance";
            break;
        case "distance":
            $("#pace-splits-type").text("Switch to Distance");

            $("#activity-pace-split-time").show();
            $("#activity-pace-split-distance").hide();
            $("#pace-splits-time-measure").show();
            $("#pace-splits-distance-measure").hide();
            paceSplitTypeState = "time";
            break;
    }
}