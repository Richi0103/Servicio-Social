<?php
require "config.php";

$sesion_id = $_POST["sesion_id"] ?? 0;

if (!$sesion_id) {
    echo json_encode(["error" => "Falta sesion_id"]);
    exit;
}

$stmt = $pdo->prepare("SELECT actividad_id FROM actividades_sesiones WHERE id = ?");
$stmt->execute([$sesion_id]);
$sesion = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$sesion) {
    echo json_encode(["error" => "Sesión no encontrada."]);
    exit;
}

$stmt2 = $pdo->prepare("SELECT COUNT(*) FROM actividades_sesiones WHERE actividad_id = ?");
$stmt2->execute([$sesion["actividad_id"]]);
$total = (int)$stmt2->fetchColumn();

if ($total <= 1) {
    echo json_encode(["error" => "La actividad debe tener al menos una sesión."]);
    exit;
}

$stmt3 = $pdo->prepare("DELETE FROM actividades_sesiones WHERE id = ?");
$stmt3->execute([$sesion_id]);

if ($stmt3->rowCount() === 0) {
    echo json_encode(["error" => "No se pudo eliminar la sesión."]);
    exit;
}

echo json_encode(["ok" => true]);
