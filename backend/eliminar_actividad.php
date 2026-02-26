<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;

if (!$actividad_id) {
    echo json_encode(["error" => "Falta actividad_id"]);
    exit;
}

$stmt = $pdo->prepare("UPDATE actividades SET eliminado_en = NOW() WHERE id = ? AND eliminado_en IS NULL");
$stmt->execute([$actividad_id]);

if ($stmt->rowCount() === 0) {
    echo json_encode(["error" => "Actividad no encontrada o ya eliminada."]);
    exit;
}

echo json_encode(["ok" => true]);
