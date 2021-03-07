var activityTypes = ["Run", "Cycling", "Walk", "Cross Fit", "Gym", "Running Heart Fitness Test", "Heart and Mind (HRV)"];
var largeModal = $('#largeAddEditModal');
var smallModal = $('#smallAlertModal');

function tableDrawCallback(json) {
    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["StartTime"]) {
            json.data[i]["StartTime"] = new Date(parseInt(json.data[i]["StartTime"].substr(6))).toShortDateString();
        }

        json.data[i]["Type"] = activityTypes[json.data[i]["Type"]];
        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);
        
        json.data[i]["Actions"] = '\
        ' + (json.data[i]["HasBleData"] ?
        '<a href="/User/Activity/' + json.data[i].Id + '"><button class="table-button view-button">View Activity</button></a>' :
        '<span class="tooltip-wrapper" data-title="There is data missing for the completed activity. Please contact Support for further assistance.">\
        <button class="table-button view-button disabled" disabled>Missing Data</button>\
        </span>');
    }

    return json.data;
}
