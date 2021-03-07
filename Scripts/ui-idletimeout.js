var UIIdleTimeout = function () {

    return {

        //main function to initiate the module
        init: function () {

            // cache a reference to the countdown element so we don't have to query the DOM for it on each ping.
            var $countdown;

            $('body').append('');
                    
            // start the idle timer plugin
            $.idleTimeout('#idle-timeout-dialog', '.modal-content button:last', {
                idleAfter: 600, //300, // 5 minutes
                warningLength: 15,
                pollingInterval: 10, // 5 seconds
                AJAXTimeout: 1000,
                keepAliveURL: '/Account/KeepAlive',
                serverResponseEquals: 'OK',
                onTimeout: function () {
                    window.onbeforeunload = null;
                    window.location = "/Account/TimeoutLogout?returnUrl=" + encodeURIComponent(window.location.pathname + window.location.search);
                },
                onIdle: function(){
                    $('#idle-timeout-dialog').modal('show');
                    $countdown = $('#idle-timeout-counter');

                    $('#idle-timeout-dialog-keepalive').on('click', function () { 
                        $('#idle-timeout-dialog').modal('hide');
                    });

                    $('#idle-timeout-dialog-logout').on('click', function () { 
                        $('#idle-timeout-dialog').modal('hide');
                        $.idleTimeout.options.onTimeout.call(this);
                    });
                },
                onCountdown: function(counter){
                    $countdown.html(counter); // update the counter
                }
            });
            
        }

    };

}();

$(document).ready(function() {    
   UIIdleTimeout.init();
});