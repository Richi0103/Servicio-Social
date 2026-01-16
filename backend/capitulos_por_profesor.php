<?php
require "config.php";

$profesor_id = $_GET["profesor_id"] ?? 0;

if (!$profesor_id) {
  echo json_encode(["error" => "Falta profesor_id"]);
  exit;
}

$stmt = $pdo->prepare("
  SELECT c.id, c.clave, c.nombre, c.descripcion, c.area, c.logo
  FROM capitulos_profesores cp
  JOIN capitulos c ON c.id = cp.capitulo_id
  WHERE cp.profesor_id = ?
    AND c.activo = 1
    AND c.eliminado_en IS NULL
  ORDER BY c.nombre ASC
");
$stmt->execute([$profesor_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));