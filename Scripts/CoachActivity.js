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
        if (json.data[i]["LastActivityDate"]) {
            json.data[i]["LastActivityDate"] = new Date(parseInt(json.data[i]["LastActivityDate"].substr(6))).toShortDateString();
        }

        if (json.data[i]["DOB"]) {
            json.data[i]["DOB"] = new Date(parseInt(json.data[i]["DOB"].substr(6))).toShortDateString();
        }

        json.data[i]["Type"] = activityTypes[json.data[i]["Type"]];
        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);
        
        json.data[i]["checks"] = '<input type="checkbox" name="users[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';
        json.data[i]["Actions"] = '\
            <a href="/User/Details/' + json.data[i].Id + '"><button class="table-button view-button">View More</button></a>\
            <button class="table-button delete-button" onclick="ConfirmDelete([ \'' + json.data[i].Id + '\' ],\'' + json.data[i].CoachId + '\')">Unattach User</button>';
    }

    return json.data;
}

function BulkDelete() {
    var IDs = $(".dt-helper-table input:checkbox:checked").map(function () {
        return $(this).val();
    }).get();
    var coachId = $(".coach-id").val();

    if (IDs.length > 0)
        ConfirmDelete(IDs, coachId);
}

var userDelIDs;
var CoachDelId;
function ConfirmDelete(ids, coachId) {
    userDelIDs = ids;
    CoachDelId = coachId;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to remove ' + (ids.length > 1 ? 'these users' : 'this user') + '?', 'Yes', UnassignUsers);
}

function UnassignUsers(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Coach/UnassignUsers",
        data: { ids: userDelIDs, coachId: CoachDelId },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data.failCount == 0) {
            ShowModal(smallModal, "Success", data.data.length > 1 ? 'Users have been unassigned' : 'User has been unassigned');
        } else {
            var failedUsers = '';

            for (var k in data.data) {
                if (data.data.hasOwnProperty(k) && !data.data[k]) {
                    failedUsers = failedUsers + '\
                    ' + k;
                }
            }

            ShowModal(smallModal, "Error", 'The following ' + (data.failCount > 1 ? 'users' : 'user') + ' failed to be unassigned:' + failedUsers);
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}