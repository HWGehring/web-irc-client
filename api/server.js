let express = require('express');
let app = express();
let path = require("path");
let https = require('https');
let http = require('http').Server(app);
let io = require('socket.io')(http);
const fs = require('fs');

app.use('/build', express.static(__dirname + '/../public/build'));
app.use(express.static(__dirname+'/../public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/../public/index.html'));
});

app.get('/hello', function(req, res) {
    return 'world';
});

app.get('/api/connect', function(req, res) {

});

// Whenever someone connects this gets executed
io.on('connection', function(ircClient) {
    let parameters = ircClient.handshake.query;
    /* {
        param1: 'arg1',
        param2: 'arg2',
        param3: 'arg3'
     } */

    ircClient.on('connection-request', function(d) {
        let hostname = d.hostname;
        let port = d.port;
        let nickname = d.nickname;

        // TODO: AUTHENTICATE W/USER
        let authenticated = true;

        if (authenticated) {
            ircClient.emit('connection-granted', {
                key: '1234'
            })
        } else {
            ircClient.emit('connection-denied', {
                reason: 'could not authenticate'
            })
        }

        let ircServer = require('net').Socket();
        ircServer.connect(port, hostname);

        let request = "USER " + nickname + " . . :real name\r\n";
        ircServer.write(request);
        ircClient.emit('data-sent', {
            string: request
        });

        request = "NICK " + nickname + "\r\n";
        ircServer.write(request);
        ircClient.emit('data-sent', {
            string: request
        });

        let dataBuffer = '';
        ircServer.on('data', function(d) {
            let data = null;
            if (dataBuffer !== '') {
                data = dataBuffer + d.toString();
                dataBuffer = '';
            } else {
                data = d.toString();
            }

            if (/\r\n/.test(data)) {
                let messages = [];

                let parts = data.split("\r\n");
                for (let i = 0;i < parts.length; i++) {
                    if (i+1 in parts) {
                        messages.push(parts[i]);
                    } else if (parts[i] !== "") {
                        dataBuffer += parts[i];
                    }
                }

                for (let i = 0;i < messages.length; i++) {
                    if (/^PING :.*$/.test(messages[i])) {
                        let handshake = /^PING :(.*)$/.exec(messages[i])[1].replace(/(?:\r\n|\r|\n)/g, '');
                        request = "PONG :"+handshake+"\r\n";
                        ircServer.write(request);
                        ircClient.emit('data-sent', {
                            string: request
                        })
                    }

                    ircClient.emit('data-received', {
                        data: messages[i],
                        string: messages[i]
                    });
                }
            } else {
                dataBuffer += data;
            }
        });

        ircClient.on('send-data', function(d) {

            // TODO: AUTHENTICATE W/USER

            let request = d.string.replace(/(?:\r\n|\r|\n)/g, '') + "\r\n";
            console.log(request);
            ircServer.write(request);
        });

        ircClient.on('disconnect', function() {
            ircServer.end();
        })
    });

    ircClient.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

let privateKey = fs.readFileSync( __dirname + '/../env/key.pem' );
let certificate = fs.readFileSync( __dirname + '/../env/cert.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(8443, function() {
    console.log('listening on *:8443');
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});