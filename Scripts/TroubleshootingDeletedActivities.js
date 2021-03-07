var activityTypes = ["Run", "Cycling", "Walk", "Cross Fit", "Gym", "Running Heart Fitness Test", "Heart and Mind (HRV)"];
function tableDrawCallback(json) {

    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["StartTime"]) {
            json.data[i]["StartTime"] = new Date(parseInt(json.data[i]["StartTime"].substr(6))).toShortDateString();
        }

        if (json.data[i]["DateModified"]) {
            json.data[i]["DateModified"] = new Date(parseInt(json.data[i]["DateModified"].substr(6))).toShortDateString();
        }

        json.data[i]["Type"] = activityTypes[json.data[i]["Type"]];
        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);

        json.data[i]["checks"] = '<input type="checkbox" name="activities[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';


        var button = '\
        <a href="/User/Details/' + json.data[i].UserId + '"><button class="table-button view-button">View User</button></a>';

        json.data[i]["Actions"] = button + '\
            <button class="table-button delete-button" onclick="ConfirmRestore([ \'' + json.data[i].Id + '\' ])">Restore Activity</button>';
    }

    return json.data;
}

var largeModal = $('#largeAddEditModal');
var smallModal = $('#smallAlertModal');

var userDelIDs;
function ConfirmRestore(ids) {
    userDelIDs = ids;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to restore ' + (ids.length > 1 ? 'these activities' : 'this activity') + '?', 'Yes', RestoreActivityRow);
}

function RestoreActivityRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/Troubleshooting/RestoreActivity",
        data: { ids: userDelIDs },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data.failCount == 0) {
            ShowModal(smallModal, "Success", data.data.length > 1 ? 'Activities have been restored' : 'Activity has been restored');
        } else {
            var failedActivities = '';

            for (var k in data.data) {
                if (data.data.hasOwnProperty(k) && !data.data[k]) {
                    failedActivities = failedActivities + '\
                    ' + k;
                }
            }

            ShowModal(smallModal, "Error", 'The following ' + (data.failCount > 1 ? 'activities' : 'activity') + ' failed to restore:' + failedActivities);
        }
        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}