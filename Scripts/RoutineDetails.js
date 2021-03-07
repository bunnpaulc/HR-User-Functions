$(document).on('ready', function () {
    ViewState.Objects = {
        alertModals: {
            smallModal: $('#smallAlertModal'),
            largeModal: $('#largeAddEditModal'),
        },
        routineForm:        $("#routine-form"),
        routineInputContainer: $("#routine-properties"),
        routineInputs: $("#routine-properties input, #routine-properties textarea, #routine-properties select"),
        userAttachments: {
            assignButton:   $("#assign-user"),
            userSelector:   $("#user-attachments .assign-selection select"),
            assignMessage:  $("#user-assign-message"),
            userList: $("#user-attachments ul"),
            changeInProgress: false
        },
        assignmentTemplate: $("#attachment-item-template"),
        routineItems: {
            listContainer:  $("#routine-item-list"),
            activityEntries: function () { return $("#routine-item-list .routine-item") },
            contextActions: function () { return $("#routine-item-list .move-grabber, #routine-item-list .delete-icon, #routine-item-list .duplicate-icon") },
            inputs:          function () { return $("#routine-item-list select, #routine-item-list input") }
        },
        activityTemplate:   $("#routine-item-template"),
        formButtons: {
            addActivity:    $("#add-routine-activity"),
            saveActions:    $("#routine-form-actions .save-actions"),
            saveButton:     $("#save-routine"),
            cancelButton:   $("#cancel-changes"),
            loadingSpinner: $("#routine-form-actions .save-actions .loading"),
            editButton:     $("#routine-form-actions .edit-button")
        }
    };

    bindActions();
    dragula([ViewState.Objects.routineItems.listContainer.get(0)], {
        moves: function (el, container, handle) {
            return handle.classList.contains('move-grabber');
        }
    });

    if (newRoutine) {
        ViewState.Set("NEW");
    } else {
        ViewState.Set("VIEW");
    }
});

var ViewState = {
    CurrentState: "DEFAULT",
    CurrentActivityDOM: null
};

ViewState.RefreshState = function () {
    ViewState.Set(ViewState.CurrentState);
}

ViewState.Set = function (state) {
    ViewState.CurrentState = state;

    if (state === "NEW" || state === "LOAD" || ViewState.Objects.userAttachments.changeInProgress) {
        ViewState.Objects.userAttachments.userSelector.prop('disabled', true);
        ViewState.Objects.userAttachments.assignButton.prop('disabled', true);

        ViewState.Objects.userAttachments.userList.find('.delete-button').prop('disabled', true);

        if (state === "NEW") {
            ViewState.Objects.userAttachments.assignMessage.text("Routine must be created before assigning users");
            ViewState.Objects.userAttachments.assignMessage.show();
        } else {
            ViewState.Objects.userAttachments.assignMessage.hide();
        }
    } else {
        var disabled = ViewState.Objects.userAttachments.userSelector.children('option').length === 0;
        ViewState.Objects.userAttachments.userSelector.prop('disabled', disabled);
        ViewState.Objects.userAttachments.assignButton.prop('disabled', disabled);

        ViewState.Objects.userAttachments.userList.find('.delete-button').prop('disabled', false);

        if (disabled) {
            ViewState.Objects.userAttachments.assignMessage.text("All users have been assigned to routine");
            ViewState.Objects.userAttachments.assignMessage.show();
            ViewState.Objects.userAttachments.userSelector.hide();
            ViewState.Objects.userAttachments.assignButton.hide();
        } else {
            ViewState.Objects.userAttachments.assignMessage.hide();
            ViewState.Objects.userAttachments.userSelector.show();
            ViewState.Objects.userAttachments.assignButton.show();
        }
    }

    if (state === "NEW" || state == "EDIT") {
        ViewState.Objects.routineInputs.prop('disabled', false);
        ViewState.Objects.routineItems.contextActions().show();
        ViewState.Objects.routineItems.inputs().prop('disabled', false);

        ViewState.Objects.formButtons.saveButton.prop('disabled', false);
        ViewState.Objects.formButtons.loadingSpinner.hide();

        ViewState.Objects.formButtons.addActivity.prop('disabled', false);
        ViewState.Objects.formButtons.addActivity.show();
        ViewState.Objects.formButtons.saveActions.show();
        ViewState.Objects.formButtons.editButton.hide();

        if (state === "NEW") {
            ViewState.Objects.formButtons.saveButton.text("Create Routine");
            ViewState.Objects.formButtons.cancelButton.hide();
        } else {
            ViewState.Objects.formButtons.saveButton.text("Save Changes");
            ViewState.Objects.formButtons.cancelButton.prop('disabled', false);
            ViewState.Objects.formButtons.cancelButton.show();
        }

        window.onbeforeunload = function () {
            return 'Warning: you will lose all unsaved changes if you leave this page. Are you sure you wish to leave?';
        }
    } else if (state === "LOAD" || state === "VIEW") {
        ViewState.Objects.routineInputs.prop('disabled', true);
        ViewState.Objects.routineItems.contextActions().hide();
        ViewState.Objects.routineItems.inputs().prop('disabled', true);

        if (state === "LOAD") {
            ViewState.Objects.formButtons.addActivity.prop('disabled', true);
            ViewState.Objects.formButtons.saveButton.prop('disabled', true);
            ViewState.Objects.formButtons.cancelButton.prop('disabled', true);
            ViewState.Objects.formButtons.loadingSpinner.show();

            ViewState.Objects.formButtons.saveActions.show();
            ViewState.Objects.formButtons.editButton.hide();
        } else {            
            ViewState.Objects.formButtons.addActivity.hide();
            ViewState.Objects.formButtons.saveActions.hide();
            ViewState.Objects.formButtons.editButton.show();
        }

        window.onbeforeunload = null;
    }
}

function bindActions() {
    ViewState.Objects.userAttachments.assignButton.on('click', RoutineFunctions.AssignUser);
    ViewState.Objects.userAttachments.userList.on('click', '.delete-button', RoutineFunctions.UnassignUserConfirm);

    ViewState.Objects.formButtons.addActivity.on('click', RoutineFunctions.AddActivity);
    ViewState.Objects.routineItems.listContainer.on('click', '.delete-icon', RoutineFunctions.RemoveActivity);
    ViewState.Objects.routineItems.listContainer.on('click', '.duplicate-icon', RoutineFunctions.DuplicateActivity);

    ViewState.Objects.formButtons.editButton.on('click', RoutineFunctions.EditRoutine);
    ViewState.Objects.formButtons.cancelButton.on('click', RoutineFunctions.CancelChanges);
    ViewState.Objects.routineForm.on('submit', RoutineFunctions.SaveRoutine);
}

var RoutineFunctions = {};

RoutineFunctions.AssignUser = function() {
    if (ViewState.CurrentState === "VIEW" || ViewState.CurrentState === "EDIT") {
        var selectedUser = ViewState.Objects.userAttachments.userSelector.find('option:selected');
        ViewState.Objects.userAttachments.changeInProgress = true;
        ViewState.RefreshState();

        $.ajax({
            method: "POST",
            url: "/Routine/CreateRoutineAttachment",
            data: { userId: selectedUser.attr('value'), routineId: ViewState.Objects.routineForm.find('[name="Id"]').val() }
        }).done(function (data) {
            if (data.success) {
                var newAttachment = ViewState.Objects.assignmentTemplate.clone(true);

                newAttachment.show();
                newAttachment.attr('id', '');
                newAttachment.attr('attachment-id', '');

                var html = newAttachment.html();
                html = html.replace(/{id}/g, selectedUser.attr('value'));
                html = html.replace(/{name}/g, selectedUser.text());

                newAttachment.html(html);
                newAttachment.attr('attachment-id', data.id);

                ViewState.Objects.userAttachments.userList.append(newAttachment);
                selectedUser.remove();
            } else {
                ShowModal(ViewState.Objects.alertModals.smallModal, "Error", 'An error occurred, please try again.');
            }
        }).fail(function () {
            ShowModal(ViewState.Objects.alertModals.smallModal, "Error", 'An error occurred, please try again.');
        }).always(function () {
            ViewState.Objects.userAttachments.changeInProgress = false;
            ViewState.RefreshState();
        });
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

var deleteLi;
RoutineFunctions.UnassignUserConfirm = function (e) {
    deleteLi = $(this).closest('li');
    ShowModal(ViewState.Objects.alertModals.largeModal, "Confirm", 'Are you sure you want to remove this user from the routine?', 'Yes', RoutineFunctions.UnassignUser);
}


RoutineFunctions.UnassignUser = function (modal) {
    if (ViewState.CurrentState === "VIEW" || ViewState.CurrentState === "EDIT") {
        ShowLoader(modal);
        deleteLi.find('.delete-button').prop('disabled', true);

        $.ajax({
            method: "POST",
            url: "/Routine/DeleteRoutineAttachment",
            data: { id: deleteLi.attr('attachment-id') }
        }).done(function (data) {
            if (data.success) {
                var userDetail = deleteLi.find('.user-detail');

                $('<option>', { value: userDetail.attr('user-id'), text: userDetail.text() })
                    .appendTo(ViewState.Objects.userAttachments.userSelector);

                deleteLi.remove();
            } else {
                deleteLi.find('.delete-button').prop('disabled', false);
                ShowModal(ViewState.Objects.alertModals.smallModal, "Error", 'An error occurred, please try again.');
            }
        }).fail(function () {
            deleteLi.find('.delete-button').prop('disabled', false);
            ShowModal(ViewState.Objects.alertModals.smallModal, "Error", 'An error occurred, please try again.');
        }).always(function () {
            ViewState.Objects.alertModals.largeModal.modal('hide');
            ViewState.RefreshState();
        });
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

RoutineFunctions.AddActivity = function () {
    if (ViewState.CurrentState === "NEW" || ViewState.CurrentState === "EDIT") {
        var newActivity = ViewState.Objects.activityTemplate.clone(false);
        newActivity.attr('id', '');
        ViewState.Objects.routineItems.listContainer.append(newActivity);
        newActivity.show();

        


    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

$(document).on('focus', ".datepicker_recurring_start", function () {
    $(this).datepicker({
        startDate: "+0d",
        format: "dd M yyyy",
    });
});

RoutineFunctions.RemoveActivity = function () {
    if (ViewState.CurrentState === "NEW" || ViewState.CurrentState === "EDIT") {
        $(this).parent().remove();
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

RoutineFunctions.DuplicateActivity = function () {
    if (ViewState.CurrentState === "NEW" || ViewState.CurrentState === "EDIT") {
        var newNode = $(this).parent().clone(false);
        newNode.find('input[name$="Id]"]').val('');
        $(this).parent().after(newNode);
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

RoutineFunctions.EditRoutine = function () {
    if (ViewState.CurrentState === "VIEW") {
        ViewState.Objects.routineInputs.filter(':not([type="radio"])').each(function (i, el) {
            $(el).attr('reset-value', $(el).val());
        });
        ViewState.DifficultyValue = ViewState.Objects.routineInputs.filter('[type="radio"]:checked').val();

        ViewState.CurrentActivityDOM = ViewState.Objects.routineItems.listContainer.clone(true);
        ViewState.Set("EDIT");
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}

RoutineFunctions.SaveRoutine = function(e) {
    e.preventDefault();

    var order = 0;
    ViewState.Objects.routineItems.activityEntries().each(function () {
        var newOrder = order++;
        $(this).find('select, input').each(function() {
            $(this).attr('name', $(this).attr('name').replace('{index}', newOrder));
        });
    });

    ViewState.Set("NEW");
    var routineDetails = ViewState.Objects.routineForm.serializeObject();
    ViewState.Set("LOAD");

    $.ajax({
        method: "POST",
        url: "/Routine/CreateUpdate",
        data: { routine: routineDetails }
    }).done(function (data) {
        var errorString = 'The following ' + (data.errors.length > 1 ? 'error' : 'errors') + ' occured:';
        for (var i = 0; i < data.errors.length; i++) {
            errorString = errorString + '<br />' + data.errors[i];
        }

        if (data.success) {
            ViewState.Objects.routineForm.find('[name="Id"]').val(data.routineId);
            for (var i = 0; i < data.itemIds.length; i++) {
                ViewState.Objects.routineForm.find('[name="RoutineItems[' + i + '][Id]"]').val(data.itemIds[i]);
            }

            newRoutine = false;
            history.replaceState(null, "BioConnected | " + ViewState.Objects.routineForm.find('[name="Name"]').val(), '/Routine/Details/' + data.routineId);

            ShowModal(ViewState.Objects.alertModals.smallModal, "Success", 'Routine details have been saved.' + (data.errors.length > 0 ? "<br />" + errorString + "<br />It is recommended to refresh the page." : ""));
            ViewState.Set("VIEW");
        } else {
            ShowModal(ViewState.Objects.alertModals.smallModal, "Error", errorString);
            ViewState.Set(newRoutine ? "NEW" : "EDIT");
        }
    }).fail(function () {
        ShowModal(ViewState.Objects.alertModals.smallModal, "Error", 'An error occurred, please try again.');
        ViewState.Set(newRoutine ? "NEW" : "EDIT");
    }).always(function () {
        ViewState.Objects.routineItems.activityEntries().find('select, input').each(function () {
            $(this).attr('name', $(this).attr('name').replace(/RoutineItems\[\d\]/g, "RoutineItems[{index}]"));
        });
    });
}

RoutineFunctions.CancelChanges = function () {
    if (ViewState.CurrentState === "EDIT") {
        ViewState.Objects.routineInputs.filter(':not([type="radio"])').each(function (i, el) {
            $(el).val($(el).attr('reset-value'));
        });
        ViewState.Objects.routineInputs.filter('[type="radio"]').prop('checked', false);
        ViewState.Objects.routineInputs.filter('[type="radio"][value="' + ViewState.DifficultyValue + '"]').prop('checked', true);

        ViewState.Objects.routineItems.listContainer.empty().append(ViewState.CurrentActivityDOM.children());
        ViewState.CurrentActivityDOM = null;
        ViewState.Set("VIEW");
    } else {
        console.error("ViewState desync! Current known state: " + ViewState.CurrentState);
    }
}


flattenObject = function (data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}