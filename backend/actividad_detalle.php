<?php
require "config.php";

$actividad_id = $_GET["actividad_id"] ?? 0;

if (!$actividad_id) {
    echo json_encode(["error" => "Falta actividad_id"]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM actividades WHERE id = ? AND eliminado_en IS NULL");
$stmt->execute([$actividad_id]);
$actividad = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$actividad) {
    echo json_encode(["error" => "Actividad no encontrada"]);
    exit;
}

$stmt2 = $pdo->prepare("
    SELECT id, titulo, descripcion, fecha_inicio, fecha_fin
    FROM actividades_sesiones
    WHERE actividad_id = ?
    ORDER BY fecha_inicio ASC
");
$stmt2->execute([$actividad_id]);
$sesiones = $stmt2->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "actividad" => $actividad,
    "sesiones" => $sesiones
], JSON_PRETTY_PRINT);