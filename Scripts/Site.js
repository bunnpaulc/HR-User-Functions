$(document).on('ready', function () {
    moment.locale(browserLocale);
})

if (!Date.prototype.toShortDateString) {
    Date.prototype.toShortDateString = function () {
        return moment(this).locale(browserLocale).format("L");
        //var date = this;
        //var dd = date.getDate();
        //var mm = date.getMonth() + 1;
        //if (dd < 10) {
        //    dd = '0' + dd;
        //}
        //if (mm < 10) {
        //    mm = '0' + mm;
        //}
        //return dd + '/' + mm + '/' + date.getFullYear();
    };
}

function formatSeconds(totalSeconds, withLeadingHours) {
    var hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    var returnString = withLeadingHours || hours > 0 ? hours + ":" : "";

    returnString = returnString + (minutes < 10 ? "0" : "") + minutes + ":";
    return returnString + (seconds < 10 ? "0" : "") + seconds;
}

function ShowModal(modal, title, body, button, confirmCallback) {
    modal.find('.modal-title').html(title);

    if (body != null) {
        modal.find('.modal-body').html(body);
    }

    modal.find(".modal-okay").html(button);
    modal.find(".modal-loader").hide();
    modal.find(".modal-main").show();

    modal.find('.modal-okay').off('click');
    if (confirmCallback != null) {
        modal.find('.modal-okay').on('click', function (e) {
            confirmCallback(modal);
        });
    }

    modal.modal({ backdrop: 'static' });
    modal.modal('show');
}

function ShowLoader(modal) {
    modal.find(".modal-main").hide();
    modal.find(".modal-loader").show();

    modal.modal({ backdrop: 'static' });
    modal.modal('show');
}

function getBase64(file, callback) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        return callback(true, reader.result);
    };
    reader.onerror = function (error) {
        callback(false, error);
    };
}

var browserLocale;
if (window.navigator.languages) {
    browserLocale = window.navigator.languages[0];
} else {
    browserLocale = window.navigator.userLanguage || window.navigator.language;
}