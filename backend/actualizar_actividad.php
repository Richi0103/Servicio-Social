<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;
$tipo = $_POST["tipo"] ?? "";
$titulo = trim($_POST["titulo"] ?? "");
$descripcion = trim($_POST["descripcion"] ?? "");
$lugar = trim($_POST["lugar"] ?? "");
$cupo = $_POST["cupo"] ?? null;
$otorga_creditos = $_POST["otorga_creditos"] ?? 0;
$creditos = $_POST["creditos"] ?? 0;
$fecha_inicio = $_POST["fecha_inicio"] ?? "";
$fecha_fin = $_POST["fecha_fin"] ?? "";
$actualizado_por = $_POST["actualizado_por"] ?? null;

if (!$actividad_id || !$tipo || !$titulo || !$descripcion || !$lugar || !$fecha_inicio || !$fecha_fin) {
    echo json_encode(["error" => "Faltan datos obligatorios."]);
    exit;
}

$otorga_creditos = (int)$otorga_creditos;
$creditos = (int)$creditos;

if ($otorga_creditos === 0) {
    $creditos = 0;
}

if ($otorga_creditos === 1 && $creditos <= 0) {
    echo json_encode(["error" => "Créditos inválidos."]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE actividades
    SET tipo = ?, titulo = ?, descripcion = ?, lugar = ?, cupo = ?,
        otorga_creditos = ?, creditos = ?, fecha_inicio = ?, fecha_fin = ?,
        actualizado_por = ?
    WHERE id = ? AND eliminado_en IS NULL
");

$ok = $stmt->execute([
    $tipo,
    $titulo,
    $descripcion,
    $lugar,
    $cupo,
    $otorga_creditos,
    $creditos,
    $fecha_inicio,
    $fecha_fin,
    $actualizado_por,
    $actividad_id,
]);

if (!$ok || $stmt->rowCount() === 0) {
    echo json_encode(["error" => "No se pudo actualizar la actividad."]);
    exit;
}

echo json_encode(["ok" => true]);
