$(document).ready(function () {
    if (Cookies.get("DisplayUnit") != null) {
        localStorage.setItem("DisplayUnit", Cookies.get('DisplayUnit'));
    } else {
        localStorage.setItem("DisplayUnit", 'METRIC');
        Cookies.set('DisplayUnit', 'METRIC');
    }

    var text = UnitToggle.Get() === "METRIC" ? "Metric" : "Imperial";
    $('#unit-type-display').text(text);
});

var UnitToggle = {};

UnitToggle.Set = function (unit) {
    if (Cookies.get("DisplayUnit") !== unit) {
        Cookies.set('DisplayUnit', unit);
        window.location.reload(true);
    }
}

UnitToggle.Get = function () {
    return localStorage.getItem("DisplayUnit");
}