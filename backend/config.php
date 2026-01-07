<?php
header("Content-Type: application/json");

$host = "localhost";
$dbname = "capitulos_tecnm_morelia";
$user = "root";
$pass = "root";

$pdo = new PDO("mysql:host=$host; dbname=$dbname", $user, $pass);