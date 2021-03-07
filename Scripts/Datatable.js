$(document).ready(function () {
    $('.dt-helper-table').each(function (i) {
        var div = this;
        var url = $(this).attr("ajax-url");
        var colArray = SaferMeDTCols;
        var order = dtOrder;
        var DrawLength = 30;
        var drawCallback = (typeof tableDrawCallback != 'undefined') ? tableDrawCallback : EmptyCallback;
        var TableFilterID = (typeof tableFilterID != 'undefined') ? tableFilterID : "";
        var ContextData = null;

        if ($(this).attr("column-array")) {
            colArray = window[$(this).attr("column-array")]
        }

        if ($(this).attr("column-order")) {
            order = window[$(this).attr("column-order")]
        }

        if ($(this).attr("draw-callback")) {
            drawCallback = window[$(this).attr("draw-callback")]
        }

        if ($(this).attr("draw-filter")) {
            TableFilterID = $(this).attr("draw-filter")
        }

        if ($(this).attr("draw-context")) {
            ContextData = window[$(this).attr("draw-context")]
        }

        if ($(this).attr("draw-length")) {
            DrawLength = parseInt($(this).attr("draw-length"));
        }

        var tableObject = {
            responsive: true,
            autoWidth: false,
            order: order,
            processing: true,
            serverSide: true,
            pageLength: DrawLength,
            dom: "rtip",
            ajax: {
                url: url,
                type: 'POST',
                data: function (data, settings) {
                    var filters = $(div).parent().parent().parent().find('select:not(.ignore-filter)');
                    var filterArr = [];
                    for (var i = 0; i < filters.length; i++) {
                        var obj = {};
                        obj.Name = filters[i].name
                        obj.Value = filters.eq(i).val();
                        filterArr.push(obj);
                    }
                    data.Filters = filterArr;

                    if (TableFilterID != "") {
                        data.TableFilterID = TableFilterID;
                    }

                    if (ContextData != null) {
                        data.ContextData = ContextData;
                    }
                    return data;
                },
                dataSrc: drawCallback,
            },
            language: {
                "processing": ""
            },
            "fnInitComplete": function (oSettings, json) {
                $('.tooltip-wrapper').tooltip({ position: "bottom" });
            },
            columns: colArray
        };

        if ($(this).attr("defer-loading")) {
            tableObject.deferLoading = 0;
        }

        var table = $(this).DataTable(tableObject);
        $(table.table().container()).parent().parent().find('.dt-helper-search').keyup(function () {
            var searchText = $(this).val();

            clearTimeout(currentTimeoutFunction);
            currentTimeoutFunction = setTimeout(function () {
                table.search(searchText).draw();
            }, 1000);
        });

        $(table.table().container()).parent().parent().on('change', 'select:not(.ignore-filter)', function () {
            table.draw();
        });

        //If search from menu
        if (typeof SearchText !== 'undefined') {
            if (SearchText != null && SearchText != "") {
                table.search(SearchText).draw();
            }
        }

    });
});

var currentTimeoutFunction;

function EmptyCallback(json) { return json.data }

function CreatePreviewField(url) {
    if (url == null || url == "") {
        return "";
    }

    var type = url.split('.')[url.split('.').length - 1];
    switch (type.toLowerCase()) {
        case 'jpeg':
        case 'png':
        case 'jpg':
            return '<br />\
            <img class="table-preview table-preview-img" src="' + url + '" data-featherlight="' + url + '" />';
        case 'mp3':
            return '\
            <i class="fa fa-play-circle table-preview" data-featherlight="<audio src=\'' + url + '\' controls></audio>"></i>';
        case 'mp4':
            return '\
            <i class="fa fa-play-circle table-preview" data-featherlight="<video src=\'' + url + '\' controls></video>"></i>';
        case 'vtt':
            return '\
            <i class="fa fa-commenting table-preview" data-featherlight="' + url + '" data-featherlight-after-open="processVTT(event)"></i>'
    }
}

function FormatDateField(date) {
    if (date) {
        var date = new Date(parseInt(date.substr(6)));
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        return dd + '/' + mm + '/' + yyyy;
    } else {
        return "";
    }
}