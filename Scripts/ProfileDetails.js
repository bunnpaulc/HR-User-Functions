$(document).ready(function () {
    var form = $('.user-details-form');
    var currentDetails = [];

    form.find(".datepicker").datepicker({
        format: 'dd/mm/yyyy',
        orientation: "left",
        autoclose: true
    });

    form.find('.edit-button').on('click', function () {
        //form.find('[data-property]').hide();
        form.find('.form-control, .datepicker').prop("disabled", false);
        currentDetails = form.serializeArray();

        form.find('.edit-button').hide();
        form.find('.save-actions').show();
    });

    form.find('.save-actions .cancel').on('click', function () {
        for (var i = 0; i < currentDetails.length; i++) {
            var el = form.find('[name="' + currentDetails[i].name + '"]');
            el.val(currentDetails[i].value);

            if (el.hasClass('datepicker')) {
                el.datepicker('update');
            }
        }

        closeEditor();
    });

    form.find('.save-actions .save').on('click', function () {
        ShowModal(largeModal, "Confirm", 'Are you sure you want to save these details?', 'Save', startDetailSave);
    });

    function startDetailSave(modal) {
        var serializedForm = form.serializeArray();

        largeModal.modal('hide');
        form.find('.form-control, .datepicker, .save-actions button').prop('disabled', true);
        form.find('.save-actions .loading').show();

        var coachDetails = { Id: ContextData.UserId };
        for (var i = 0; i < serializedForm.length; i++) {
            coachDetails[serializedForm[i]['name']] = serializedForm[i]['value'];
        }

        $.ajax({
            method: "POST",
            url: "/Coach/UpdateCoachDetails",
            data: { coachDetails }
        }).always(function () {
            form.find('.form-control, .datepicker, .save-actions button').prop('disabled', false);
            form.find('.save-actions .loading').hide();
        }).done(function (data) {
            if (data.success) {
                currentDetails = form.serializeArray();
                ShowModal(smallModal, "Success", 'Your details have been updated.');

                for (var i = 0; i < currentDetails.length; i++) {
                    var el = form.find('[data-property="' + currentDetails[i].name + '"]');
                    el.text(currentDetails[i].value);
                }

                closeEditor();
            } else {
                var errorString = '';

                for (var i = 0; i < data.errors.length; i++) {
                    errorString = errorString + '<br />' + data.errors[i];
                }

                ShowModal(smallModal, "Error", 'The following ' + (data.errors.length > 1 ? 'error' : 'errors') + ' occured:' + errorString);
            }
        }).fail(function () {
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        });
    }

    function closeEditor() {
        //form.find('[data-property]').hide();
        form.find('.form-control, .datepicker').prop("disabled", true);

        form.find('.save-actions').hide();
        form.find('.edit-button').show();
    }

    var imageDiv = $('.user-overview .user-image');
    var showDrag = false;
    var timeout = -1;

    $(window).on('dragenter', function () {
        imageDiv.find('i').css('display', 'inline-block');
        showDrag = true;
    });

    $(window).on('dragover', function () {
        showDrag = true;
    });

    $(window).on('dragleave', function () {
        showDrag = false;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            if (!showDrag) {
                imageDiv.find('i').css('display', 'none');
            }
        }, 200);
    });

    imageDiv.find('img').on('dragstart', function () {
        return false;
    });

    imageDiv.find('i').on('dragenter', function (event) {
        event.preventDefault();
        imageDiv.find('i').addClass('hover');
    });

    imageDiv.find('i').on('dragleave', function () {
        imageDiv.find('i').removeClass('hover');
    });

    imageDiv.find('i').on('dragover', function (event) {
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    });

    imageDiv.find('i').on('drop', function (event) {
        event.preventDefault();
        imageDiv.find('i').removeClass('hover');
        imageDiv.find('i').css('display', 'none');
        startUpload(event.originalEvent.dataTransfer.files);
    });

    var fileUploader = $('#upload-user-image');
    fileUploader.on('change', function () {
        startUpload(fileUploader[0].files);
        fileUploader.val(null);
        return false;
    });

    var fileBase64;
    function startUpload(fileList) {
        var count = fileList.length;
        if (count == 0 || count > 1) {
            ShowModal(smallModal, "Error", "Please ensure you are trying to upload a single image file.", 'Okay');
        } else if (!fileList[0].name.endsWith('.jpg') && !fileList[0].name.endsWith('.png') && !fileList[0].name.endsWith('.gif')) {
            ShowModal(smallModal, "Error", "Please ensure you an image file with the correct file type. <br />(Accepted filetypes: jpg, png, gif)", 'Okay');
        } else {
            getBase64(fileList[0], function (success, value) {
                fileBase64 = value.split(',')[1];

                if (success) {
                    ShowModal(largeModal, "Confirm", 'Are you sure you wish to replace the users current image with the one below?<br /><br />\
                <img style="width: 100%;" src="data:image/png;base64,' + fileBase64 + '" />', 'Yes', uploadUserImage);
                } else {
                    ShowModal(smallModal, "Confirm", 'An error occured when reading the file. Please try again.', 'Okay');
                }
            });
        }
    }

    function uploadUserImage(modal) {
        ShowLoader(modal);

        $.ajax({
            method: "POST",
            url: "/User/UpdateUserImage",
            data: { userId: ContextData.UserId, file64: fileBase64 }
        }).done(function (data) {
            largeModal.modal('hide');
            if (data) {
                ShowModal(smallModal, "Success", 'User image has been updated.');
                imageDiv.find('img').attr('src', 'data:image/png;base64,' + fileBase64);
                imageDiv.find('.image-actions p').remove();
            } else {
                ShowModal(smallModal, "Error", 'An unknown error occurred.');
            }
            $('.dt-helper-table').DataTable().draw(false);
        }).fail(function () {
            largeModal.modal('hide');
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
            $('.dt-helper-table').DataTable().draw(false);
        });
    }
});

var attachmentId;
function removeAttachment(id) {
    attachmentId = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to unassign this user?', 'Yes', DeleteUserRow);
}

function DeleteUserRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Coach/DeleteUserAttachment",
        data: { id: attachmentId }
    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Attachment has been removed');
            $('.coach-list li[attachment-id="' + attachmentId + '"]').remove();
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the attachment no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}