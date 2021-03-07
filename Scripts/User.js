$(document).ready(function () {
    $(".input-daterange input[name=StartDate]").on('changeDate clearDate', function (a, b) {
        var newDate;
        if (a.date != null) {
            var date = a.date;
            date.setHours(0, 0, 0, 0);
            newDate = date.toISOString();
        } else {
            newDate = null;
        }

        if(ContextData.StartDate != newDate) {
            ContextData.StartDate = newDate
            $('.dt-helper-table').DataTable().draw();
        }
    });

    $(".input-daterange input[name=EndDate]").on('changeDate clearDate', function (a, b) {
        var newDate;
        if (a.date != null) {
            var date = a.date;
            date.setHours(23, 59, 59, 999);
            newDate = date.toISOString();
        } else {
            newDate = null;
        }

        if (ContextData.EndDate != newDate) {
            ContextData.EndDate = newDate;
            $('.dt-helper-table').DataTable().draw();
        }
    });

    $(".input-daterange input[name=StartDateUser]").on('changeDate clearDate', function (a, b) {
        var newDate;
        if (a.date != null) {
            var date = a.date;
            date.setHours(0, 0, 0, 0);
            newDate = date.toISOString();
        } else {
            newDate = null;
        }

        if (ContextData.StartDateUser != newDate) {
            ContextData.StartDateUser = newDate;
            $('.dt-helper-table').DataTable().draw();
        }
    });

    $(".input-daterange input[name=EndDateUser]").on('changeDate clearDate', function (a, b) {
        var newDate;
        if (a.date != null) {
            var date = a.date;
            date.setHours(23, 59, 59, 999);
            newDate = date.toISOString();
        } else {
            newDate = null;
        }

        if (ContextData.EndDateUser != newDate) {
            ContextData.EndDateUser = newDate;
            $('.dt-helper-table').DataTable().draw();
        }
    });

    // Handle click on "Select all" control
    $('#users-select-all').on('click', function () {
        // Get all rows with search applied
        // Check/uncheck checkboxes for all rows in the table
        $('.dt-helper-table input[type=checkbox]').prop('checked', this.checked);
    });

    var largeModal = $('#largeAddEditModal');
    var smallModal = $('#smallAlertModal');

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    $('#coach-invite-send').on('click', function () {
        var email = $('#coach-invite-email').val();

        if (email == null || email == "" || !validateEmail(email)) {
            $('#coach-invite-firstname-required').show();
        } else {
            $('#coach-invite-dialog').modal('hide');
            ShowLoader(largeModal);
            $('#coach-invite-firstname-required').hide();
            var firstname = $('#coach-invite-firstname').val();
            var lastname = $('#coach-invite-lastname').val();
            $.ajax({
                method: "POST",
                url: "/User/Invite",
                data: { email: email, firstname: firstname, lastname: lastname }
            }).done(function (data) {
                largeModal.modal('hide');
                $('#coach-invite-email').val("");
                $('#coach-invite-firstname').val("");
                $('#coach-invite-lastname').val("");
                if (data.success) {
                    $('.dt-helper-table').DataTable().draw(false);
                    ShowModal(smallModal, "Success", 'Email has been sent');
                } else {
                    if (data.IsInvalidEmail) {
                        ShowModal(smallModal, "Error", 'Email address is not valid');
                    } else {
                        ShowModal(smallModal, "Error", 'User has already been invited');
                    }
                }
            }).fail(function () {
                largeModal.modal('hide');
                $('#coach-invite-email').val("");
                $('#coach-invite-firstname').val("");
                $('#coach-invite-lastname').val("");
                ShowModal(smallModal, "Error", 'An error occurred, please try again.');
            });
        }
    });

    $('#coach-invite-back').on('click', function () {
        $('#coach-invite-dialog').modal('hide');
        $('#coach-invite-email').trumbowyg('html', "");
        $('#coach-invite-firstname').trumbowyg('html', "");
        $('#coach-invite-lastname').trumbowyg('html', "");
        $('#coach-invite-firstname-required').hide();
    });

    $('.multi-select-search').each(function () {
        var elem = $(this);
        elem.multiSelect({
            selectableHeader: "<input type='text' class='search-input form-control' autocomplete='off' placeholder='Search...'>\
                                <span style='display:block;width:100%;text-align:center;margin-bottom:5px;'>"
                                + (elem.attr("left-header") == null ? "Unassigned" : elem.attr("left-header")) + "</span>",
            selectionHeader: "<span style='display:block;width:100%;text-align:center;margin-bottom:5px;'>"
                                + (elem.attr("right-header") == null ? "Assigned" : elem.attr("right-header")) + "</span>",
            afterInit: function (ms) {
                var that = this,
                    $selectableSearch = that.$selectableUl.siblings("input"),
                    selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                .on('keydown', function (e) {
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }
                });

            },
            afterSelect: function () {
                this.qs1.cache();
            },
            afterDeselect: function () {
                this.qs1.cache();
            }
        });
    });
    $('#ms-UserIds').css('width', '100%');


    $('#user-reminder-send').on('click', function () {
        var userIds = $('#UserIds').val();
        var endDate = $('#user-routine-date').val();
        $.ajax({
            method: "POST",
            url: "/User/SendReminder",
            data: { UserIds: userIds, EndDate: endDate }
        }).done(function (data) {
            $('#user-reminder-dialog').modal('hide');
            if (data.success) {
                ShowModal(smallModal, "Success", 'Email has been sent');
            } else {
                ShowModal(smallModal, "Error", 'An error occurred. (Does the user no longer exist?)');
            }
        }).fail(function () {
            $('#user-reminder-dialog').modal('hide');
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        });
    });

    $('#user-reminder-back').on('click', function () {
        $('#user-reminder-dialog').modal('hide');
    });

    $('#user-report-send').on('click', function () {
        var userIds = $('#UserReportIds').val();

        $.ajax({
            method: "POST",
            url: "/User/SendReport",
            data: { UserIds: userIds }
        }).done(function (data) {
            $('#user-report-dialog').modal('hide');
            if (data.success) {
                ShowModal(smallModal, "Success", 'Email has been sent');
            } else {
                ShowModal(smallModal, "Error", 'An error occurred. (Does the user no longer exist?)');
            }
        }).fail(function () {
            $('#user-report-dialog').modal('hide');
            ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        });
    });

    $('#user-report-back').on('click', function () {
        $('#user-report-dialog').modal('hide');
    });

});

function tableDrawCallback(json) {
    for (var i = 0; i < json.data.length; i++) {
        var StartDateString = ContextData.StartDate ? ContextData.StartDate : "";
        var EndDateString = ContextData.EndDate ? ContextData.EndDate : "";
        var IsCoach = ContextData.IsCoach ? ContextData.IsCoach : false;

        json.data[i]["Email"] = '<a href="mailto:' + json.data[i]["Email"] + '">' + json.data[i]["Email"] + '</a>';

        if (json.data[i]["DOB"]) {
            json.data[i]["DOB"] = new Date(parseInt(json.data[i]["DOB"].substr(6))).toShortDateString();
        }

        json.data[i]["checks"] = '<input type="checkbox" name="users[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';

        if (json.data[i]["LastActivityDate"]) {
            json.data[i]["LastActivityDate"] = new Date(parseInt(json.data[i]["LastActivityDate"].substr(6))).toShortDateString();
        } else {
            json.data[i]["LastActivityDate"] = "No Activity Completed";
        }

        if (json.data[i]["DateCreated"]) {
            json.data[i]["DateCreated"] = new Date(parseInt(json.data[i]["DateCreated"].substr(6))).toShortDateString();
        }

        if(json.data[i]["Status"] == 0) {
            json.data[i]["Status"] = "Pending";
        } else if (json.data[i]["Status"] == 1) {
            json.data[i]["Status"] = "Accepted";
        } else if (json.data[i]["Status"] == 2) {
            json.data[i]["Status"] = "Declined/Cancelled";
        }
        
        if (json.data[i]["Status"] == "Pending" || json.data[i]["Status"] == "Accepted" || json.data[i]["Status"] == "Declined/Cancelled") {
            if (json.data[i]["Status"] == "Pending") {
                if (json.data[i]["HasBeenInvited"]) {
                    json.data[i]["Actions"] = '\
                    <button class="table-button btn delete-button" onClick="ConfirmDecline(\''+json.data[i].Id+'\')">Decline</button>\
                    <button class="table-button btn add-button" onClick="ConfirmAccept(\'' + json.data[i].Id + '\')">Accept</button>';
                } else {
                    json.data[i]["Actions"] = '\
                    <button class="table-button btn delete-button" onClick="ConfirmCancel(\'' +json.data[i].Id+'\')">Cancel</button>';
                }
                
            } else {
                json.data[i]["Actions"] = '\
                    <button class="table-button btn add-button" onClick="ConfirmReinvite(\'' + json.data[i].Id + '\')">Reinvite</button>';

            }
            
        } else {
            json.data[i]["Actions"] = '\
            <a href="/User/Details/' + json.data[i].Id +
            '?StartDate=' + StartDateString +
            '&EndDate=' + EndDateString +
            '&isCoach=' + IsCoach +
            '"><button class="table-button view-button">View Details</button></a>';
    }

        //json.data[i]["checks"] = '<input type="checkbox" name="users[]" class="table-checkbox" value="' + json.data[i]["Id"] + '">';
        
            //<button class="table-button delete-button" onclick="ConfirmDelete(\'' + json.data[i].Id + '\')">Delete User</button>';
    }

    return json.data;
}

var largeModal = $('#largeAddEditModal');
var largeModalAccept = $('#largeAddEditModalAccept');
var smallModal = $('#smallAlertModal');

function InvitePopup() {
    $('#coach-invite-dialog').modal('show');
}

var userDelID;
function ConfirmDelete(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to delete that user?', 'Yes', DeleteRow);
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

function ConfirmAccept(id) {
    userDelID = id;
    ShowModal(largeModalAccept, "Confirm", 'Are you sure you want to accept that user invite?', 'Yes', AcceptRow);
}

function AcceptRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/Accept",
        data: { id: userDelID },

    }).done(function (data) {
        largeModalAccept.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'User invite has been accepted');
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

function ConfirmReinvite(id) {
    userDelID = id;
    ShowModal(largeModalAccept, "Confirm", 'Are you sure you want to reinvite this user?', 'Yes', ReinviteRow);
}

function ReinviteRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/Reinvite",
        data: { id: userDelID },

    }).done(function (data) {
        largeModalAccept.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'User has been reinvited');
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

function ConfirmDecline(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to decline that user invite?', 'Yes', DeclineRow);
}

function DeclineRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/Decline",
        data: { id: userDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'User invite has been declined');
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

function ConfirmCancel(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to cancel that user invite?', 'Yes', CancelRow);
}

function CancelRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/Cancel",
        data: { id: userDelID },

    }).done(function (data) {
        largeModal.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'User invite has been canceled');
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

function ConfirmEnableEmailing(id) {
    userDelID = id;
    ShowModal(largeModalAccept, "Confirm", 'Are you sure you want to recieve automatic emails when this user completes an activity?', 'Yes', EnableEmailingRow);
}

function EnableEmailingRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/EnableEmailing",
        data: { id: userDelID },

    }).done(function (data) {
        largeModalAccept.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Automatic emailing has been enabled');
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

function ConfirmDisableEmailing(id) {
    userDelID = id;
    ShowModal(largeModal, "Confirm", 'Are you sure you want to stop automatic emails when this user completes an activity?', 'Yes', DisableEmailingRow);
}

function DisableEmailingRow(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/DisableEmailing",
        data: { id: userDelID },

    }).done(function (data) {
        largeModalAccept.modal('hide');
        if (data) {
            ShowModal(smallModal, "Success", 'Automatic emailing has been disabled');
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

function BulkReport() {
    $('#user-report-dialog').modal('show');
}

var userRepIDs;
function ConfirmReport() {
    var coachId = $(".coach-id").val();
    userRepIDs = ids;
    ShowModal(largeModal, "Confirm", 'You are about to email youself a report detailing the activities ' + (ids.length > 1 ? 'these users' : 'this user') + 'has completed. Do you want to proceed?', 'Yes', ReportUsers);
}

function ReportUsers(modal) {
    ShowLoader(modal);

    $.ajax({
        method: "POST",
        url: "/User/ReportUsers",
        data: { ids: userRepIDs },

    }).done(function (data) {
        largeModal.modal('hide');
        ShowModal(smallModal, "Success", 'Report has been Emailed');

        $('.dt-helper-table').DataTable().draw(false);
    }).fail(function () {
        largeModal.modal('hide');
        ShowModal(smallModal, "Error", 'An error occurred, please try again.');
        $('.dt-helper-table').DataTable().draw(false);
    });
}

function ReminderPopup() {
    $('#user-reminder-dialog').modal('show');
}

