<?php
require "config.php";

$actividad_id = $_GET["actividad_id"] ?? 0;
$miembro_id = $_GET["miembro_id"] ?? ($_GET["alumno_id"] ?? 0);

if (!$actividad_id || !$miembro_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
      COUNT(s.id) AS total_sesiones,
      SUM(CASE WHEN aas.asistio = 1 THEN 1 ELSE 0 END) AS asistidas
    FROM actividades_sesiones s
    LEFT JOIN actividades_asistencia_sesiones aas
      ON aas.sesion_id = s.id AND aas.miembro_id = ?
    WHERE s.actividad_id = ?
");
$stmt->execute([$miembro_id, $actividad_id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$total = (int)($row["total_sesiones"] ?? 0);
$asistidas = (int)($row["asistidas"] ?? 0);
$porcentaje = $total > 0 ? round(($asistidas / $total) * 100, 2) : 0;

echo json_encode([
    "actividad_id" => (int)$actividad_id,
    "miembro_id" => (int)$miembro_id,
    "alumno_id" => (int)$miembro_id,
    "total_sesiones" => $total,
    "asistidas" => $asistidas,
    "porcentaje" => $porcentaje,
    "asistencia_completa" => ($porcentaje == 100)
]);
