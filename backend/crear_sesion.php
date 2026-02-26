<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;
$titulo = trim($_POST["titulo"] ?? "");
$descripcion = trim($_POST["descripcion"] ?? "");
$fecha_inicio = $_POST["fecha_inicio"] ?? "";
$fecha_fin = $_POST["fecha_fin"] ?? "";

if (!$actividad_id || !$fecha_inicio || !$fecha_fin) {
    echo json_encode(["error" => "Faltan datos de sesión."]);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO actividades_sesiones (actividad_id, titulo, descripcion, fecha_inicio, fecha_fin)
    VALUES (?, ?, ?, ?, ?)
");

$ok = $stmt->execute([$actividad_id, $titulo, $descripcion, $fecha_inicio, $fecha_fin]);

if (!$ok) {
    echo json_encode(["error" => "No se pudo crear la sesión."]);
    exit;
}

echo json_encode(["ok" => true, "sesion_id" => (int)$pdo->lastInsertId()]);
