var activityTypes = ["Run", "Cycling", "Walk", "Cross Fit", "Gym", "Running Heart Fitness Test", "Heart and Mind (HRV)"];
function tableDrawCallback(json) {

    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["StartTime"]) {
            json.data[i]["StartTime"] = new Date(parseInt(json.data[i]["StartTime"].substr(6))).toShortDateString();
        }

        json.data[i]["Type"] = activityTypes[json.data[i]["Type"]];
        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);

        json.data[i]["checks"] = '<input type="checkbox" name="activities[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';


        var button = '\
        <span class="tooltip-wrapper" data-title="There is data missing for the completed activity. Please contact Support for further assistance.">\
        <button class="table-button view-button disabled" disabled>No BLE Data</button>\
        </span>';

        json.data[i]["Actions"] = button + '\
            <a href="/User/Details/' + json.data[i].UserId + '"><button class="table-button view-button">View User</button></a>';
    }

    return json.data;
}