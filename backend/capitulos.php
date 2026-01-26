<?php
require "config.php";

$query = $pdo->query("SELECT id, clave, nombre, descripcion, area, logo, color FROM capitulos WHERE activo = 1");
$capitulos = $query->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($capitulos);