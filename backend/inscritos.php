<?php
require "config.php";

$actividad_id = $_GET["actividad_id"] ?? 0;

if (!$actividad_id) {
    echo json_encode(["error" => "Falta actividad_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
      ai.miembro_id,
      ai.miembro_id AS alumno_id,
      m.numero_control,
      CONCAT(m.nombre, ' ', m.apellidos) AS alumno,
      m.email,
      m.verificado,
      m.tecnologico,
      ai.estado,
      ai.fecha_inscripcion
    FROM actividades_inscripciones ai
    JOIN miembros m ON m.id = ai.miembro_id
    WHERE ai.actividad_id = ?
    ORDER BY alumno ASC
");
$stmt->execute([$actividad_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
