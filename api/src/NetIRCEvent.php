<?php namespace IRC;

class NetIRCEvent extends NetIRC {

    function event_error($origin, $orighost, $target, $params) {
        $this->log(0, "Error ocurred ($origin, $orighost, $target, $params)");
        // XXX add error handling
    }

    function event_err_nicknameinuse($origin, $orighost, $target, $params) {
        die("Could not connect: Nick already in use");
    }

    function event_ping($origin, $orighost, $target, $params) {
        $this->command("PONG :$params");
    }

    function fallback($origin, $orighost, $target, $params) {
        $this->buffer[] = array($origin, $target, $params);
        // Only store the last 25 lines
        if (count($this->buffer) > 25) {
            array_shift($this->buffer);
        }
    }

    function &getBuffer() {
        $buff = $this->buffer;
        $this->buffer = array();
        return $buff;
    }

    function log($level, $message) {
        if (in_array($level, $this->log_types)) {
            print date('H:i:s') . " " . trim($message) . "\n";
            flush();
        }
    }
}