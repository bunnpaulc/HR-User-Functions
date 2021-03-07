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

     //Handle click on checkbox to set state of "Select all" control
    $('.dt-helper-table').on('change', 'input[type=checkbox]', function () {
        var checks = $('.dt-helper-table tbody input[type=checkbox]');
        if (checks.filter(':checked').length == checks.length) {
            $('#users-select-all').prop('checked', true);
            $('#users-select-all')[0].indeterminate = false;
            $('.bulk-edit').css('cursor', 'pointer');
            $('.bulk-edit').css('pointer-events', '');
            $('.bulk-edit').prop('disabled', false);
        } else if (checks.filter(':checked').length == 0) {
            $('#users-select-all').prop('checked', false);
            $('.bulk-edit').css('cursor', '');
            $('.bulk-edit').css('pointer-events', 'none');
            $('.bulk-edit').prop('disabled', true);
            $('#users-select-all')[0].indeterminate = false;
        } else {
            $('#users-select-all')[0].indeterminate = true;
            $('.bulk-edit').css('cursor', 'pointer');
            $('.bulk-edit').css('pointer-events', '');
            $('.bulk-edit').prop('disabled', false);
        }
    });
});

var activityTypes = ["Run", "Cycling", "Walk", "Cross Fit", "Gym", "Running Heart Fitness Test", "Heart and Mind (HRV)"];
var largeModal = $('#largeAddEditModal');
var smallModal = $('#smallAlertModal');

function tableDrawCallback(json) {
    $('#users-select-all')[0].indeterminate = false;
    $('.bulk-edit').css('cursor', '');
    $('.bulk-edit').css('pointer-events', 'none');
    $('.bulk-edit').prop('disabled', true);

    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["StartTime"]) {
            json.data[i]["StartTime"] = new Date(parseInt(json.data[i]["StartTime"].substr(6))).toShortDateString();
        }

        if (json.data[i]["TimeSynced"]) {
            json.data[i]["TimeSynced"] = new Date(parseInt(json.data[i]["TimeSynced"].substr(6))).toShortDateString();
        }

        json.data[i]["Type"] = activityTypes[json.data[i]["Type"]];
        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);
        
        json.data[i]["checks"] = '<input type="checkbox" name="users[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';

        var button = '\
        ' + (json.data[i]["HasBleData"] ?
        '<a href="/User/Activity/' + json.data[i].Id + '"><button class="table-button view-button">View Activity</button></a>' :
        '<span class="tooltip-wrapper" data-title="There is data missing for the completed activity. Please contact Support for further assistance.">\
        <button class="table-button view-button disabled" disabled>No BLE Data</button>\
        </span>');


        json.data[i]["Actions"] = button + '\
            <button class="table-button delete-button" onclick="ConfirmDelete([ \'' + json.data[i].Id + '\' ])">Delete Activity</button> \
            <button class="table-button delete-button" onclick="ConfirmPermDelete([ \'' + json.data[i].Id + '\' ])">Remove for Resync</button>';
    }

    return json.data;
}

function BulkDelete() {
    var IDs = $(".dt-helper-table input:checkbox:checked").map(function () {
        return $(this).val();
    }).get();
    if (IDs.length > 0)
        ConfirmDelete(IDs);
}

var userDelIDs;
function ConfirmDelete(ids) {
    userDelIDs = ids;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to remove ' + (ids.length > 1 ? 'these activities' : 'this activity') + '?', 'Yes', DeleteActivityRow);
}

function ConfirmPermDelete(ids) {
    userDelIDs = ids;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to Remove ' + (ids.length > 1 ? 'these activities' : 'this activity') + 'for resync? <br/> This feature is uesed for the purpose of allowing the user to resync their activity, once this activity has been removed the user will need to manually trigger a resync in the app' , 'Yes', PermDeleteActivityRow);
}

function DeleteActivityRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/DeleteActivity",
        data: { ids: userDelIDs },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data.failCount == 0) {
            ShowModal(smallModal, "Success", data.data.length > 1 ? 'Activities have been removed' : 'Activity has been removed');
        } else {
            var failedActivities = '';

            for (var k in data.data) {
                if (data.data.hasOwnProperty(k) && !data.data[k]) {
                    failedActivities = failedActivities + '\
                    ' + k;
                }
            }

            ShowModal(smallModal, "Error", 'The following ' + (data.failCount > 1 ? 'activities' : 'activity') + ' failed to removed:' + failedActivities);
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}

function PermDeleteActivityRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/PermDeleteActivity",
        data: { ids: userDelIDs },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data.failCount == 0) {
            ShowModal(smallModal, "Success", data.data.length > 1 ? 'Activities have been removed' : 'Activity has been removed');
        } else {
            var failedActivities = '';

            for (var k in data.data) {
                if (data.data.hasOwnProperty(k) && !data.data[k]) {
                    failedActivities = failedActivities + '\
                    ' + k;
                }
            }

            ShowModal(smallModal, "Error", 'The following ' + (data.failCount > 1 ? 'activities' : 'activity') + ' failed to removed:' + failedActivities);
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}