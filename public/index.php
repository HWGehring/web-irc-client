<?php
use FlexLM\DB;
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

$app = new \Slim\App([
    'settings' => [
        'displayErrorDetails' => true
    ]
]);

$container = $app->getContainer();

$container['view'] = function ($container) {
    $view = new \Slim\Views\Twig(__DIR__ . '/../ui/views', [ 'cache' => false ]);
    $view->addExtension(new \Slim\Views\TwigExtension(
        $container->router,
        $container->request->getUri()
    ));
    return $view;

};

$app->get('/', function (Request $request, Response $response, array $args) {
    exit;
});

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

$app->get('/irc', function (Request $request, Response $response, array $args) {
    return $this->view->render($response, 'chat.html.twig');
});

$app->run();