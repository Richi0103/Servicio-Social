<?php
require "config.php";

$alumno_id = $_GET["alumno_id"] ?? 0;

if (!$alumno_id) {
    echo json_encode(["error" => "Falta alumno_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
      ach.id,
      ach.creditos_otorgados,
      ach.motivo,
      ach.otorgado_en,
      a.titulo AS actividad,
      a.tipo,
      c.nombre AS capitulo,
      c.color AS capitulo_color
    FROM alumnos_creditos_historial ach
    JOIN actividades a ON a.id = ach.actividad_id
    JOIN capitulos c ON c.id = a.capitulo_id
    WHERE ach.alumno_id = ?
    ORDER BY ach.otorgado_en DESC
");
$stmt->execute([$alumno_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));