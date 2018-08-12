<?php namespace IRC;

class Client {

    /** @var DB $db */
    private $db = null;

    public function __construct($hostname, $port, $nickname) {
        $this->db = DB::instance();

        for ($i = 0; $i < ob_get_level(); $i++) {
            ob_end_flush();
        }

        ob_implicit_flush(1);
        flush();

        $username = $nickname;

        $fp = fsockopen($hostname, $port, $errno, $errstr, 30);
        if (!$fp) {
            echo "$errstr ($errno)" . PHP_EOL;
        } else {
            $cmd = "USER {$username} . . :real name\r\n";
            fwrite($fp, $cmd);
            $this->dump($cmd);
            $cmd = "NICK {$nickname}\r\n";
            fwrite($fp, $cmd);
            $this->dump($cmd);
            $cmd = "JOIN #towchat\r\n";
            fwrite($fp, $cmd);
            $this->dump($cmd);
        }

        $this->fp = $fp;
    }

    private function dump($chunk) {
        printf("%s\r\n", $chunk);
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

            $query = $this->db->query("SELECT id, payload FROM relay_queue ORDER BY created_on LIMIT 1");
            $result = $query->fetchAll(\PDO::FETCH_ASSOC);
            if (!empty($result)) {
                $result = current($result);
                $stmt = $this->db->prepare("DELETE FROM relay_queue WHERE id = :id");
                $stmt->bindParam('id', $result['id']);
                $stmt->execute();
                $cmd = preg_replace("\r\n", "", $result['payload']) . "\r\n";
                fwrite($fp, $cmd);
                $this->dump($cmd);
            }
        }

        fclose($fp);
    }
}
