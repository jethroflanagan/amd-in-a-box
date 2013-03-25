<?php
// Server in the this format: <computer>\<instance name> or 
// <server>,<port> when using a non default port number
$server = '192.168.0.228';

// Connect to MSSQL
$link = mssql_connect($server, 'sa', 'influenza');

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}
print('hello');
?>
