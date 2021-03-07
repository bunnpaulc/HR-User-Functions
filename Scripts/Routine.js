function tableDrawCallback(json) {
    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["Category"] == 8) {
            json.data[i]["Actions"] = '\
            <span class="tooltip-wrapper" data-title="This action is not available for Exercise Reminders">\
            <button class="table-button view-button disabled" disabled>View Details</button>\
            </span>\
            <a href="/Routine/Activities/' + json.data[i].Id + '"><button class="table-button view-button">View Completed Activities</button></a>\
            <span class="tooltip-wrapper" data-title="This action is not available for Exercise Reminders">\
            <button class="table-button add-button disabled" onclick="DuplicateConfirm(\'' + json.data[i].Id + '\')" disabled>Duplicate Routine</button>\
            </span>\
            <button class="table-button delete-button" onclick="ConfirmDelete(\'' + json.data[i].Id + '\')">Remove Routine</button>';
        } else {
            json.data[i]["Actions"] = '\
            <a href="/Routine/Details/' + json.data[i].Id + '"><button class="table-button view-button">View Details</button></a>\
            <a href="/Routine/Activities/' + json.data[i].Id + '"><button class="table-button view-button">View Completed Activities</button></a>\
            <button class="table-button add-button" onclick="DuplicateConfirm(\'' + json.data[i].Id + '\')">Duplicate Routine</button>\
            <button class="table-button delete-button" onclick="ConfirmDelete(\'' + json.data[i].Id + '\')">Remove Routine</button>';
        }
    }

    return json.data;
}

var largeModal = $('#largeAddEditModal');
var smallModal = $('#smallAlertModal');

var routineDelID;
function ConfirmDelete(id) {
    routineDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to delete that routine?', 'Yes', DeleteRow);
}

function DeleteRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Routine/Delete",
        data: { id: routineDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Routine has been deleted');
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the routine no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}

var routineDuplicateID;
function DuplicateConfirm(id) {
    routineDuplicateID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to duplicate that routine?', 'Yes', DuplicateRoutine);
}

function DuplicateRoutine(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Routine/Duplicate",
        data: { id: routineDuplicateID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Routine has been duplicated');
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the routine no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}