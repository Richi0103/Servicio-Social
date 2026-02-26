<?php
require "config.php";

$sesion_id = $_POST["sesion_id"] ?? 0;
$titulo = trim($_POST["titulo"] ?? "");
$descripcion = trim($_POST["descripcion"] ?? "");
$fecha_inicio = $_POST["fecha_inicio"] ?? "";
$fecha_fin = $_POST["fecha_fin"] ?? "";

if (!$sesion_id || !$fecha_inicio || !$fecha_fin) {
    echo json_encode(["error" => "Faltan datos de sesión."]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE actividades_sesiones
    SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?
    WHERE id = ?
");

$ok = $stmt->execute([$titulo, $descripcion, $fecha_inicio, $fecha_fin, $sesion_id]);

if (!$ok || $stmt->rowCount() === 0) {
    echo json_encode(["error" => "No se pudo actualizar la sesión."]);
    exit;
}

echo json_encode(["ok" => true]);
