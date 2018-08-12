<?php namespace IRC;

class Client {

    public function __construct($hostname, $port, $nickname) {
        $this->flush();
        try {
            $this->fp = $this->connect($hostname, $port);
            $this->login($nickname, $nickname);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    private function connect($hostname, $port) {
        $fp = fsockopen($hostname, $port, $errno, $errstr, 30);
        if (!$fp) {
            throw new \Exception("$errstr ($errno)");
        } else {
            return $fp;
        }
    }

    private function login($username, $nickname) {
        $this->dump("USER {$username} . . :real name");
        $this->dump("NICK {$nickname}");
        $this->dump("JOIN #towchat");
    }

    private function dump($data) {
        $this->send($data);
        $this->echo($data);
    }

    private function send($data) {
        $data = trim(preg_replace('/\s+/', ' ', $data));
        return fwrite($this->fp, $data . "\r\n");
    }

    private function echo($data) {
        $data = trim(preg_replace('/\s+/', ' ', $data));
        printf("%s\r\n", $data);
        flush();
    }

    public function flush() {
        for ($i = 0; $i < ob_get_level(); $i++) {
            ob_end_flush();
        }

        ob_implicit_flush(1);
        flush();
    }

    public function stream() {
        $fp = $this->fp;

        while (!feof($fp)) {
            $response = fgets($fp, 128);
            $this->dump($response);
            if (preg_match('/^PING :(.*)/', $response, $matches)) {
                $cmd = "PONG :{$matches[1]}\r\n";
                fwrite($fp, $cmd);
                $this->dump($cmd);
            }
        }

        fclose($fp);
    }
}
