$(document).on('ready', function () {
    if (userLastActivity) {
        $('#last-activity-date').text(moment(userLastActivity).format("L"));
    }

    $('input[name="DOB"]').val(moment(userDOB).format("L"));

    AttachFunctions.UpdateSelect();

    $(".user-email-area").trumbowyg({
        btns: []
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

var AttachFunctions = {
    assignmentTemplate: $("#attachment-item-template"),
    assignButton: $("#assign-user"),
    routineSelector: $("#user-attachments .assign-selection select"),
    assignMessage: $("#user-assign-message"),
    routineList: $("#user-attachments ul"),
    changeInProgress: false
};

AttachFunctions.UpdateSelect = function () {
    if (AttachFunctions.changeInProgress) {
        AttachFunctions.routineSelector.prop('disabled', true);
        AttachFunctions.assignButton.prop('disabled', true);

        AttachFunctions.routineList.find('.delete-button').prop('disabled', true);
        AttachFunctions.assignMessage.hide();
    } else {
        AttachFunctions.routineSelector.prop('disabled', false);
        AttachFunctions.assignButton.prop('disabled', false);
        AttachFunctions.routineList.find('.delete-button').prop('disabled', false);

        var disabled = AttachFunctions.routineSelector.children('option').length === 0;
        if (disabled) {
            AttachFunctions.routineSelector.hide();
            AttachFunctions.assignButton.hide();

            AttachFunctions.assignMessage.show();
        } else {
            AttachFunctions.routineSelector.show();
            AttachFunctions.assignButton.show();

            AttachFunctions.assignMessage.hide();
        }
    }
}

AttachFunctions.AssignUser = function () {
    var selectedRoutine = AttachFunctions.routineSelector.find('option:selected');
    AttachFunctions.changeInProgress = true;
    AttachFunctions.UpdateSelect();

    $.ajax({
        method: "POST",
        url: "/Routine/CreateRoutineAttachment",
        data: { userId: ContextData.UserId, routineId: selectedRoutine.attr('value') }
    }).done(function (data) {
        if (data.success) {
            var newAttachment = AttachFunctions.assignmentTemplate.clone(true);

            newAttachment.show();
            newAttachment.attr('id', '');
            newAttachment.attr('attachment-id', '');

            var html = newAttachment.html();
            html = html.replace(/{id}/g, selectedRoutine.attr('value'));
            html = html.replace(/{name}/g, selectedRoutine.text());

            newAttachment.html(html);
            newAttachment.attr('attachment-id', data.id);

            selectedRoutine.remove();
            AttachFunctions.routineList.append(newAttachment);
        } else {
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        }
    }).fail(function () {
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
    }).always(function () {
        AttachFunctions.changeInProgress = false;
        AttachFunctions.UpdateSelect();
    });
}

var deleteLi;
AttachFunctions.UnassignUserConfirm = function (button) {
    deleteLi = $(button).closest('li');
    ShowModal(largeModal, "Confirm", 'Are you sure you want to remove this routine from the user?', 'Yes', AttachFunctions.UnassignUser);
}


AttachFunctions.UnassignUser = function (modal) {
    ShowLoader(modal);
    deleteLi.find('.delete-button').prop('disabled', true);

    $.ajax({
        method: "POST",
        url: "/Routine/DeleteRoutineAttachment",
        data: { id: deleteLi.attr('attachment-id') }
    }).done(function (data) {
        if (data.success) {
            var userDetail = deleteLi.find('.routine-detail');

            $('<option>', { value: userDetail.attr('routine-id'), text: userDetail.text() })
                .appendTo(AttachFunctions.routineSelector);

            deleteLi.remove();
        } else {
            deleteLi.find('.delete-button').prop('disabled', false);
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        }
    }).fail(function () {
        deleteLi.find('.delete-button').prop('disabled', false);
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
    }).always(function () {
        largeModal.modal('hide');
        AttachFunctions.UpdateSelect();
    });
}