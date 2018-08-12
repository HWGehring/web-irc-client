global.Tether = require('tether');
global.jQuery = require('jquery');

function userEnteredText(input) {
    $.post("http://localirc.com/api/echo", { data: input }, function(r) {
        console.log(r);
    });
}

function connectToIRCServer(hostname, port, nickname) {
    let xhr = new XMLHttpRequest();
    let url = "http://localirc.com/api/stream?hostname=" + hostname + "&port=" + port + "&nickname=" + nickname;
    console.log("CONNECTING: " + url);
    xhr.open("GET", url, true);
    xhr.onprogress = function () {
        if (typeof xhr.previous_text === 'undefined') {
            xhr.previous_text = '';
        }
        let result = xhr.responseText.substring(xhr.previous_text.length);
        result = result.replace(/(?:\r\n|\r|\n)/g, '<br>');
        $('#chat-log').append(result);
        xhr.previous_text = xhr.responseText;
    };

    xhr.send();
}

$('.user-input-field').keypress(function(e) {
    if(e.which == 13) {
        userEnteredText($(this).val());
    }
});

$(document).ready(function() {
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
        $('ul#server-list').prepend('<li class="nav-item d-flex align-items-center"><span data-feather="chevron-right"></span>&nbsp;' + hostnameVal + '</li>');
        feather.replace();
    }
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

        connectToIRCServer(hostnameVal, serverPortVal, nicknameVal);

        $('ul#server-list').prepend('<li class="nav-item d-flex align-items-center"><span data-feather="chevron-right"></span>&nbsp;' + hostnameVal + '</li>');
        feather.replace();
    }

    $('#add-server-modal').modal('toggle');
});