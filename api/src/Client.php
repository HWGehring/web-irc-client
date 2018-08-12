<?php

class Client {

    private $output = null;

    public function __construct($server, $port) {
        $fp = fsockopen($server, $port, $errno, $errstr, 30);
        if (!$fp) {
            echo "$errstr ($errno)" . PHP_EOL;
        } else {
            $cmd = "USER tow0987 . . :real name\r\n";
            fwrite($fp, $cmd);
            echo $cmd;

            $cmd = "NICK tow0987\r\n";
            fwrite($fp, $cmd);
            echo $cmd;

            $cmd = "JOIN #towchat\r\n";
            fwrite($fp, $cmd);
            echo $cmd;

            while (!feof($fp)) {
                $response = fgets($fp, 128);
                echo $response;
                if (preg_match('/^PING :(.*)/', $response, $matches)) {
                    $cmd = "PONG :{$matches[1]}\r\n";
                    fwrite($fp, $cmd);
                    echo $cmd;
                }

                if(!is_null($this->output)) {
                    fwrite($fp, $cmd);
                    echo $cmd;
                }
            }
            fclose($fp);
        }
    }
}

//$c = new Client("irc.lycaeum.fun", 6667);
$c = new Client("chat.freenode.net", 6667);
