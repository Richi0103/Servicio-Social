<?php
require "config.php";

$actividad_id = $_GET["actividad_id"] ?? 0;

if (!$actividad_id) {
    echo json_encode(["error" => "Falta actividad_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
      ai.alumno_id,
      u.numero_control,
      CONCAT(u.nombre, ' ', u.apellidos) AS alumno,
      u.email,
      u.verificado,
      u.tecnologico,
      ai.estado,
      ai.fecha_inscripcion
    FROM actividades_inscripciones ai
    JOIN usuarios u ON u.id = ai.alumno_id
    WHERE ai.actividad_id = ?
    ORDER BY alumno ASC
");
$stmt->execute([$actividad_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));