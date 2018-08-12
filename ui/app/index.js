global.Tether = require('tether');
global.jQuery = require('jquery');

$('#add-server-command').click(function(e) {
    let hostname = $('#add-server-hostname').val();
    let serverPort = $('#add-server-port').val();
    let nickname = $('#add-server-nickname').val();

    $('ul#server-list').prepend('<li class="nav-item d-flex align-items-center"><span data-feather="circle"></span>&nbsp;' + hostname + '</li>');
    feather.replace();

    $('#add-server-modal').modal('toggle');
});