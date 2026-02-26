<?php
require "config.php";

$miembro_id = $_GET["miembro_id"] ?? ($_GET["profesor_id"] ?? 0);

if (!$miembro_id) {
  echo json_encode(["error" => "Falta miembro_id"]);
  exit;
}

$stmt = $pdo->prepare("
  SELECT DISTINCT c.id, c.clave, c.nombre, c.descripcion, c.area, c.logo, c.color
  FROM capitulos c
  JOIN capitulos_asesores cp ON c.id = cp.capitulo_id
  WHERE cp.asesor_id = ?
    AND c.activo = 1
    AND c.eliminado_en IS NULL
  ORDER BY c.nombre ASC
");
$stmt->execute([$miembro_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
