$(document).ready(function () {
    $(".input-daterange input[name=StartDate]").on('changeDate', function (a, b) {
        var date = a.date;
        date.setHours(0, 0, 0, 0);
        ContextData.StartDate = date.toISOString();
        $('.dt-helper-table').DataTable().draw();
    });

    $(".input-daterange input[name=EndDate]").on('changeDate', function (a, b) {
        var date = a.date;
        date.setHours(23, 59, 59, 999);
        ContextData.EndDate = date.toISOString();
        $('.dt-helper-table').DataTable().draw();
    });

    // Handle click on "Select all" control
    $('#users-select-all').on('click', function () {
        // Get all rows with search applied
        // Check/uncheck checkboxes for all rows in the table
        $('.dt-helper-table input[type=checkbox]').prop('checked', this.checked);
    });

    // Handle click on checkbox to set state of "Select all" control
    //$('.dt-helper-table').on('change', 'input[type=checkbox]', function () {
    //    var checks = $('.dt-helper-table tbody input[type=checkbox]');
    //    if (checks.filter(':checked').length == checks.length) {
    //        $('#users-select-all').prop('checked', true);
    //        $('#users-select-all')[0].indeterminate = false;
    //        $('.bulk-edit').css('background-color', '');
    //        $('.bulk-edit').css('cursor', 'pointer');
    //        $('.bulk-edit').prop('disabled', false);
    //    } else if (checks.filter(':checked').length == 0) {
    //        $('#users-select-all').prop('checked', false);
    //        $('.bulk-edit').css('background-color', '#ddd');
    //        $('.bulk-edit').css('cursor', 'default');
    //        $('.bulk-edit').prop('disabled', true);
    //        $('#users-select-all')[0].indeterminate = false;
    //    } else {
    //        $('#users-select-all')[0].indeterminate = true;
    //        $('.bulk-edit').css('background-color', '');
    //        $('.bulk-edit').css('cursor', 'pointer');
    //        $('.bulk-edit').prop('disabled', false);
    //    }
    //});
});

function tableDrawCallback(json) {
    $('.bulk-edit').css('background-color', '#ddd');
    $('.bulk-edit').css('cursor', 'default');
    $('.bulk-edit').prop('disabled', true);
    for (var i = 0; i < json.data.length; i++) {
        var StartDateString = ContextData.StartDate ? ContextData.StartDate : "";
        var EndDateString = ContextData.EndDate ? ContextData.EndDate : "";

        json.data[i]["Email"] = '<a href="mailto:' + json.data[i]["Email"] + '">' + json.data[i]["Email"] + '</a>';

        //json.data[i]["checks"] = '<input type="checkbox" name="users[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';
        if (json.data[i]["IsEnabled"]) {
            json.data[i]["Actions"] = '\
            <a href="/Coach/Details/' + json.data[i].Id +
            '?StartDate=' + StartDateString +
            '&EndDate=' + EndDateString +
            '"><button class="table-button view-button">View More</button></a>\
            <button class="table-button delete-button" onclick="ConfirmDisable(\'' + json.data[i].Id + '\')">Disable</button>';
        } else {
            json.data[i]["Actions"] = '\
            <a href="/Coach/Details/' + json.data[i].Id +
            '?StartDate=' + StartDateString +
            '&EndDate=' + EndDateString +
            '"><button class="table-button view-button">View More</button></a>\
            <button class="table-button add-button" onclick="ConfirmEnable(\'' + json.data[i].Id + '\')">Enable</button>';
            
        }
        
    }

    return json.data;
}

var largeModal = $('#largeAddEditModal');
var smallModal = $('#smallAlertModal');

var userDelID;
function ConfirmDelete(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to delete that user?', 'Yes', DeleteRow);
}

function ConfirmEnable(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to enable that coach?', 'Yes', EnableRow);
}

function ConfirmDisable(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to disable that coach?', 'Yes', DisableRow);
}

function DeleteRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/Delete",
        data: { id: userDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'User has been deleted');
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the user no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}


function EnableRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Coach/Enable",
        data: { id: userDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Coach has been enabled');
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the coach no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}


function DisableRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Coach/Disable",
        data: { id: userDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Coach has been disabled');
        } else {
            ShowModal(smallModal, "Error", 'An error occurred. (Does the coach no longer exist?)');
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}