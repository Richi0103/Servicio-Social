<?php
require "config.php";

$capitulo_id = $_GET["capitulo_id"] ?? 0;

if (!$capitulo_id) {
    echo json_encode(["error" => "Falta capitulo_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, tipo, titulo, estado, fecha_inicio, fecha_fin
    FROM actividades
    WHERE capitulo_id = ?
      AND eliminado_en IS NULL
    ORDER BY fecha_inicio DESC
");

$stmt->execute([$capitulo_id]);
$actividades = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($actividades);
