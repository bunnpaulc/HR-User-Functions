try {
    Dropzone.autoDiscover = false;
    var doneCalls = [];
    var dropzoneOptions = {
        accept: function (file, done) {
            $.ajax({
                url: "/File/Check",
                method: 'POST',
                data: { fileName: file.name },
                success: function (data) {
                    if (data == true) {
                        done();
                    } else {
                        if (data == "File Exists") {
                            doneCalls.push(done);
                            var call = doneCalls.length - 1;

                            var node = document.createElement('div');
                            node.className = 'dz-overwrite-confirm';
                            node.innerHTML =
                            '<span class="alert-info">Overwrite Existing File?</span>\
                                <div class="btn-group">\
                                    <button type="button" class="btn green glyphicon glyphicon-ok" onclick="doneCalls[' + call + '](); this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);"></button>\
                                    <button type="button" class="btn delete-button glyphicon glyphicon-remove" onclick="doneCalls[' + call + '](&quot;File already exists&quot;); this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);"></button>\
                                </div>';
                            file.previewElement.appendChild(node);
                        } else {
                            done(data);
                        }
                    }
                },
                dataType: 'json'
            });
        },
        dictDefaultMessage: "Click or drop files here to upload"
    }
} catch (ex) {

}

try {
    jQuery.validator.addMethod("accepted-files", function (value, element) {
        if ($(element).attr("accepted-files") != null) {
            var acceptedList = $(element).attr("accepted-files").split(',');
            for (var i = 0; i < acceptedList.length; i++) {
                if (value == null || value == "" || value.toLowerCase().endsWith(acceptedList[i].trim().toLowerCase())) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }, "Must match the accepted filetype(s).");
    
    jQuery.validator.addMethod("no-only-whitespace", function (value, element) {
        if (!value.trim()) {
            if (value.trim() != value) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }, "Cannot contain only spaces.");
} catch (ex) {

}

function CleanFileTypeList(list) {
    var arr = list.split(',');
    var typeString = "";
    for (var i = 0; i < arr.length; i++) {
        if(i != 0) {
            typeString = typeString + ", ";
        }
        typeString = typeString + arr[i].trim();
    }

    return typeString;
}

function filenameParser(name) {
    /*name.startsWith("aom-") ?
    elevatedPrivileges ?
        name.slice(4) : name.slice(41)
            : */
    return name;
}

function FormatFilePreview(file) { 
    if (!file.id)
        return file.text;
    else {
        var filename = filenameParser(file.text);
        var containerElem = $('<span>' + filename + '</span>');
        var previewElem;
        if (file.id.endsWith(".jpg") || file.id.endsWith(".jpeg") || file.id.endsWith(".png")) {
            previewElem = $('<img class="select2-preview" src="' + file.id + '" data-featherlight="' + file.id + '" />');
        } else if (file.id.endsWith(".mp3")) {
            previewElem = $('<i class="fa fa-play-circle select2-preview" data-featherlight="<audio src=\'' + file.id + '\' controls></audio>"></i>');
        } else if (file.id.endsWith(".mp4")) {
            previewElem = $('<i class="fa fa-play-circle select2-preview" data-featherlight="<video src=\'' + file.id + '\' controls></video>"></i>');
        } else if (file.id.endsWith(".vtt")) {
            previewElem = $('<i class="fa fa-commenting select2-preview" data-featherlight="' + file.id + '" data-featherlight-after-open="processVTT(event)"></i>');
        }
        previewElem.on('mouseup', function (evt) { evt.stopPropagation(); });

        containerElem.prepend(previewElem);

        return containerElem;
    }
    /*else if (file.id.endsWith(".mp4")) {
        var newDom = $('<span><video class="select2-preview select2-preview-video" src="' + file.id + '" preload="metadata">\
                Your browser cannot preview video.</video>' + file.text + '</span>');
        newDom.find("select2-preview-video").on('click', function () {
            if (this.paused)
                this.play();
            else
                this.pause();
        });
        return newDom;
    }*/
}

function PrepEditPanel(parent) {
    parent.find(".edit-helper-form").validate({
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent().find('label'));
        }
    });

    if (parent.find(".edit-helper-form .trim-whitespace").length > 0) {
        parent.find(".edit-helper-form .trim-whitespace").each(function () {
            $(this).rules("add", "no-only-whitespace");
        });
    }

    if(parent.find(".edit-helper-form input[accepted-files]").length > 0){
        parent.find(".edit-helper-form input[accepted-files]").each(function () {
            $(this).rules("add", "accepted-files");
        });
    }

    parent.find('input[type=url]').each(function() {
        var input = $(this);

        if(!input.hasClass('remote-select')){
            var helpblock = $('<p class="help-block">Must start with http(s):// or ftp://</p>');
            input.before(helpblock);
        } 

        if (input.attr('accepted-files') != null) {
            var acceptedTypes = $('<p class="help-block">Accepted Filetype(s): ' + CleanFileTypeList(input.attr('accepted-files')) + '</p>');
            input.before(acceptedTypes);
        }

        var dropzone = $('\
            <div class="form-dropzone">\
                <form action="/File/Upload" method="post" enctype="multipart/form-data" class="dropzone">\
                    <div class="fallback">\
                        Please enable Javascript.\
                    </div>\
                </form>\
            </div>');
        input.after(dropzone);
        
        if (input.attr('accepted-files') != null) {
            dropzoneOptions['acceptedFiles'] = input.attr('accepted-files');
        } else {
            dropzoneOptions['acceptedFiles'] = null;
        }

        var myDropzone = new Dropzone(dropzone.find("form")[0], dropzoneOptions);
        myDropzone.on('success', function (file, response) {
            if (input.hasClass('file-select')) {
                var urlSplit = response['url'].split('/');
                var filename = urlSplit[urlSplit.length - 1];
                filename = filenameParser(filename);
                input.append($('<option value="' + response['url'] + '">' + filename + '</option>'));
                input.val(response['url']).trigger('change');
            } else {
                input.val(response['url']);
            }
        });

        if (input.hasClass('remote-select')) {
            var filename = "";
            if (input.attr('value') != null) {
                var urlSplit = input.attr('value').split('/');
                filename = urlSplit[urlSplit.length - 1];
                filename = filenameParser(filename);
            }
            var replacement = '\
                <select class="form-control select2 file-select" style="width: 100%;" accepted-files="' + input.attr('accepted-files') +
                    '" name="' + input.attr('name') + '" ' + input.attr('required') + '>';
            if(input.attr('value') != null) replacement = replacement + '<option value="def-' + input.attr('value') + '" selected>' + filename + '</option>';
            replacement = replacement + '</select>';
            replacement = $(replacement);

            input.before(replacement);
            input.remove();
            input = replacement;

            input.select2({
                allowClear: true,
                placeholder: "Select a file",
                ajax: {
                    url: "/File/Search",
                    method: 'POST',
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            q: params.term,
                            fileTypes: input.attr('accepted-files')
                        }
                    },
                    processResults: function (data) {
                        data.unshift({ id: "", text: "None" });
                        return {
                            results: data
                        };
                    },
                    cache: true
                },
                minimumInputLength: 3,
                templateResult: FormatFilePreview,
                templateSelection: function(file) { return filenameParser(file.text) },
            });

            input.on('select2:closing', function (e) {
                if ($.featherlight.current() != null) {
                    e.preventDefault();
                }
            });
        }
    });

    try {
        parent.find(".datepicker").datepicker({
            format: 'dd/mm/yyyy',
            orientation: "left",
            autoclose: true
        });


        if (parent.find("input.datepicker, .datepicker input").val() == "" || parent.find("input.datepicker, .datepicker input").val() == "ClearDefault") {
            parent.find("input.datepicker, .datepicker input").val("");
            parent.find(".datepicker").datepicker('update');
        }
    } catch (err) { }

    try {
        $.fn.select2.defaults.set("theme", "bootstrap");

        parent.find(".search-select-ajax").each(function (div) {
            var url = $(this).attr("ajax-url")
            $(this).select2({
                width: "off",
                ajax: {
                    url: url,
                    method: "POST",
                    dataType: "json",
                    delay: 250,
                    processResults: function (data) {
                        return {
                            results: data
                        };
                    },
                    cache: false
                },
                minimumInputLength: 3,
                placeholder: "Search...",
            });
        });
    } catch (err) { }

    try {
        parent.find(".multi-select").multiSelect();

        parent.find(".multi-select-search").each(function() {
            var elem = $(this);
            elem.multiSelect({
                selectableHeader: "<input type='text' class='search-input form-control' autocomplete='off' placeholder='Search...'>\
                                <span style='display:block;width:100%;text-align:center;margin-bottom:5px;'>"
                                    + (elem.attr("left-header") == null ? "Unassigned" : elem.attr("left-header")) + "</span>",
                selectionHeader: "<span style='display:block;width:100%;text-align:center;margin-bottom:5px;'>"
                                    + (elem.attr("right-header") == null ? "Assigned" : elem.attr("right-header")) + "</span>",
                afterInit: function (ms) {
                    var that = this,
                        $selectableSearch = that.$selectableUl.siblings("input"),
                        selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)';

                    that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function (e) {
                        if (e.which === 40) {
                            that.$selectableUl.focus();
                            return false;
                        }
                    });

                },
                afterSelect: function () {
                    this.qs1.cache();
                },
                afterDeselect: function () {
                    this.qs1.cache();
                }
            });
        });
    } catch (err) { }

    parent.find('textarea').trumbowyg({
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
}