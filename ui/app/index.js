global.Tether = require('tether');
global.jQuery = require('jquery');
global.io = require('socket.io-client');

function sendToChat(message) {
    message = message.replace(/(?:\r\n|\r|\n)/g, '');
    $('#chat-log').append(message + '<br>');
}

function connectToIRCServer(hostname, port, nickname) {
    let ircServer = io('http://localirc.com:3000', {
        query: {
            param1: 'arg1',
            param2: 'arg2',
            param3: 'arg3'
        }
    });

    ircServer.emit('connection-request', {
     hostname: hostname,
     port: port,
     nickname: nickname
    });

    let authKey = null;
    ircServer.on('connection-granted', function(d) {
        authKey = d.key;
    });

    ircServer.on('connection-denied', function(d) {
        sendToChat("Connection denied: " + d.reason);
    });

    ircServer.on('data-received', function(d) {
        sendToChat(d.string);
    });

    ircServer.on('data-sent', function(d) {
        sendToChat(d.string);
    });

    return ircServer;
}

$(document).ready(function() {
    let ircServer = connectToIRCServer('chat.freenode.net', 6667, 'tow10' + Math.floor((Math.random() * 1000) + 1));

    // send-data
    $('.user-input-field').keypress(function(e) {
        if(e.which == 13) {
            ircServer.emit('send-data', {
                string: $(this).val()
            });
            $(this).val(null);
        }
    });

    let servers = localStorage.getItem("servers");
    //localStorage.setItem("servers", JSON.stringify([]));
    if (!servers) {
        servers = [];
        localStorage.setItem("servers", JSON.stringify(servers));
    } else {
        servers = JSON.parse(servers);
    }

    for (let i = 0; i < servers.length; i++) {
        let hostnameVal = servers[i].hostname;
        $('ul#server-list').prepend('<li value='+i+' class="server nav-item d-flex align-items-center"><i class="fa fa-plus-square"></i><div class="server-name">&nbsp;' + hostnameVal + '</div><ul class="channels"><li class="channel">#love</li><li class="channel">#towchat</li></ul></li>');

    }

    $('ul#server-list > li.server > div.server-name').click(function(e) {
        $('li.server').each(function(){
           $(this).removeClass('selected');
        });

        $(this).parent().addClass('selected');
    });

    $('ul#server-list > li.server > i').click(function() {
        $(this).toggleClass('fa-plus-square fa-minus-square');
        $(this).next('ul').slideToggle('500');
    });

});

$('#add-server-command').click(function(e) {
    let hostname = $('#add-server-hostname');
    let serverPort = $('#add-server-port');
    let nickname = $('#add-server-nickname');

    let hostnameVal = hostname.val().trim();
    let serverPortVal = serverPort.val().trim();
    let nicknameVal = nickname.val().trim();
    if (hostnameVal && serverPortVal && nicknameVal) {
        hostname.val('');
        serverPort.val('');
        nickname.val('');

        let servers = localStorage.getItem("servers");

        if (servers === null) {
            servers = [];
        } else {
            servers = JSON.parse(servers);
        }

        servers.push({
            'hostname' : hostnameVal,
            'serverPort' : serverPortVal,
            'nickname' : nicknameVal,
        });

        localStorage.setItem("servers", JSON.stringify(servers));

        $('ul#server-list').prepend('<li value='+servers.length+' class="nav-item d-flex align-items-center"><i class="fa fa-plus-square"></i>&nbsp;' + hostnameVal + '</li>');
    }

    $('#add-server-modal').modal('toggle');
});