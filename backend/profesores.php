<?php
require "config.php";

$stmt = $pdo->prepare("
  SELECT u.id, u.nombre, u.apellidos, u.email, u.verificado, u.tecnologico
  FROM usuarios u
  JOIN usuarios_roles ur ON ur.usuario_id = u.id
  JOIN roles r ON r.id = ur.rol_id
  WHERE r.nombre = 'Profesor'
    AND u.activo = 1
    AND u.eliminado_en IS NULL
  ORDER BY u.nombre ASC, u.apellidos ASC
");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
