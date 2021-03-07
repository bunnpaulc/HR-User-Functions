function tableDrawCallback(json) {
    for (var i = 0; i < json.data.length; i++) {
        if (json.data[i]["ActivityDate"]) {
            json.data[i]["ActivityDate"] = new Date(parseInt(json.data[i]["ActivityDate"].substr(6))).toShortDateString();
        }

        json.data[i]["Seconds"] = formatSeconds(json.data[i]["Seconds"], true);
        
        if (json.data[i]["ActivityDate"]) {
            json.data[i]["Actions"] = '\
            ' + (json.data[i]["HasBleData"] ?
            '<a href="/User/Activity/' + json.data[i].Id + '"><button class="table-button view-button">View Activity</button></a>' :
            '<span class="tooltip-wrapper" data-title="There is data missing for the completed activity. Please contact Support for further assistance.">\
            <button class="table-button view-button disabled" disabled>Missing Data</button>\
            </span>') + '\
            ' + (json.data[i]["UserId"] ?
            '<a href="/User/Activity/' + json.data[i].UserId + '"><button class="table-button view-button">View User</button></a>' :
            '<button class="table-button view-button disabled" disabled>User Not Assigned</button>');
        } else {
            json.data[i]["Actions"] = '\
            <a href="/User/Activity/' + json.data[i].UserId + '"><button class="table-button view-button">View User</button></a>';
        }
        
    }

    return json.data;
}
