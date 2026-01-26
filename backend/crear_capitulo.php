<?php
require "config.php";

$nombre = trim($_POST["nombre"] ?? "");
$clave = trim($_POST["clave"] ?? "");
$area = trim($_POST["area"] ?? "");
$descripcion = trim($_POST["descripcion"] ?? "");
$color = trim($_POST["color"] ?? "");
$creado_por = $_POST["creado_por"] ?? null;

if (!$nombre || !$clave || !$area || !$descripcion) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$color = $color !== "" ? $color : null;
$creado_por = $creado_por ? (int)$creado_por : null;

try {
    $stmt = $pdo->prepare("
        INSERT INTO capitulos (clave, nombre, descripcion, area, color, activo, creado_por, actualizado_por)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    ");
    $stmt->execute([$clave, $nombre, $descripcion, $area, $color, $creado_por, $creado_por]);

    echo json_encode([
        "success" => true,
        "id" => (int)$pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    if ((int)$e->getCode() === 23000) {
        echo json_encode(["error" => "La clave ya existe"]);
        exit;
    }
    echo json_encode(["error" => "No se pudo crear el capitulo"]);
}
