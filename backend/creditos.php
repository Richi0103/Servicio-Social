<?php
require "config.php";

$miembro_id = $_GET["miembro_id"] ?? ($_GET["alumno_id"] ?? 0);

if (!$miembro_id) {
    echo json_encode(["error" => "Falta miembro_id"]);
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
    FROM miembros_creditos_historial ach
    JOIN actividades a ON a.id = ach.actividad_id
    JOIN capitulos c ON c.id = a.capitulo_id
    WHERE ach.miembro_id = ?
    ORDER BY ach.otorgado_en DESC
");
$stmt->execute([$miembro_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
