<?php namespace IRC;

use \PDO;

class DB {

    private static $instance = null;

    private static function instantiate_tables($instance) {
        $instance->exec("CREATE TABLE IF NOT EXISTS relay_queue (
          id INT AUTO_INCREMENT PRIMARY KEY,
          owner VARCHAR(255),
          payload TEXT,
          created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );");
    }

    public static function instance() {
        if (is_null(self::$instance)) {
            $host = ''; // TODO: From .env
            $db   = ''; // TODO: From .env
            $user = ''; // TODO: From .env
            $pass = ''; // TODO: From .env

            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            self::$instance = new PDO($dsn, $user, $pass, $opt);
        }

        self::instantiate_tables(self::$instance);
        return self::$instance;
    }
}