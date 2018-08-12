let express = require('express');
let app = express();

app.get('/', function (req, res) {
    res.send('Hello World');
});

/*
 $app->post('/api/echo', function (Request $request, Response $response, array $args) {
 $body = $request->getParsedBody();
 if (!isset($body['data'])) {
 echo 400;
 exit;
 }

 try {
 $db = IRC\DB::instance();
 $stmt = $db->prepare("INSERT INTO relay_queue (payload) VALUES (:payload);");
 $stmt->bindParam('payload', $body['data']);
 $stmt->execute();
 } catch (\Exception $e) {
 echo 500;
 exit;
 }

 echo 200;
 exit;
 });

 $app->get('/api/stream', function (Request $request, Response $response, array $args) {
 $params = $request->getQueryParams();
 if (!isset($params['hostname'])) exit;
 if (!isset($params['port'])) exit;
 if (!isset($params['nickname'])) exit;

 $client = new IRC\Client($params['hostname'], $params['port'], $params['nickname']);
 $client->stream();
 exit;
 });
 */

let server = app.listen(8081, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});